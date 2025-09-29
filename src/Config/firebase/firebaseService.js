import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  startAfter,
} from "firebase/firestore";
import { getAuth, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import app from "./firebaseconfig";

const db = getFirestore(app);
const auth = getAuth(app);

// Optimized Category Service - Uses flattened structure
export const categoryService = {
  // Get all categories with stats from inventory collection and category-metadata
  getCategories: async () => {
    try {
      // Get all unique categories from inventory items
      const inventoryQuery = query(collection(db, 'inventory'));
      const inventorySnapshot = await getDocs(inventoryQuery);

      const categoryStats = new Map();

      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.category || 'uncategorized';

        if (!categoryStats.has(category)) {
          categoryStats.set(category, {
            name: category,
            itemCount: 0,
            totalValue: 0,
            lastModified: data.dateModified || data.createdAt
          });
        }

        const stats = categoryStats.get(category);
        stats.itemCount += 1;
        stats.totalValue += data.totalPrice || 0;

        // Update last modified if this item is newer
        const itemDate = data.dateModified || data.createdAt;
        if (itemDate && (!stats.lastModified || itemDate > stats.lastModified)) {
          stats.lastModified = itemDate;
        }
      });

      // Also get categories from category-metadata collection
      try {
        const metadataQuery = query(collection(db, 'category-metadata'), orderBy('createdAt', 'desc'));
        const metadataSnapshot = await getDocs(metadataQuery);

        metadataSnapshot.forEach((doc) => {
          const data = doc.data();
          const categoryName = data.name;

          if (!categoryStats.has(categoryName)) {
            categoryStats.set(categoryName, {
              name: categoryName,
              itemCount: 0,
              totalValue: 0,
              lastModified: data.createdAt
            });
          }
        });
      } catch (error) {
        // category-metadata collection might not exist yet, that's ok
        console.log('Category metadata not available, using inventory data only');
      }

      // Convert to array and sort
      const categories = Array.from(categoryStats.values())
        .map(stats => ({
          id: stats.name.toLowerCase().replace(/\s+/g, '-'),
          name: stats.name,
          itemCount: stats.itemCount,
          totalValue: stats.totalValue,
          createdAt: stats.lastModified?.toDate?.() || new Date(stats.lastModified || Date.now())
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Add new category (just ensure it exists in inventory data)
  addCategory: async (categoryName) => {
    try {
      const normalizedName = categoryName.trim();

      // In flattened structure, categories are created implicitly
      // We can add a marker item or just return the normalized name
      const categoryId = normalizedName.toLowerCase().replace(/\s+/g, '-');

      // Optional: Add to a categories collection for metadata
      try {
        await addDoc(collection(db, 'category-metadata'), {
          name: normalizedName,
          normalizedName: categoryId,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser?.uid
        });
      } catch (error) {
        // Categories collection might not exist, that's ok
        console.log('Category metadata not saved, continuing...');
      }

      return categoryId;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Delete category and all its items
  deleteCategory: async (categoryName) => {
    try {
      // Find all items in this category
      const q = query(
        collection(db, 'inventory'),
        where('category', '==', categoryName)
      );
      const querySnapshot = await getDocs(q);

      // Delete all items in the category
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Also try to remove from category metadata
      try {
        const metadataQuery = query(
          collection(db, 'category-metadata'),
          where('name', '==', categoryName)
        );
        const metadataSnapshot = await getDocs(metadataQuery);
        const metadataDeletePromises = metadataSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(metadataDeletePromises);
      } catch (error) {
        console.log('Category metadata not found or already deleted');
      }

      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

// Optimized Item Service - Uses flattened structure
export const itemService = {
  // Add item to category (now uses single inventory collection)
  addItem: async (categoryName, itemData) => {
    try {
      const inventoryRef = collection(db, 'inventory');

      // Generate serial number
      const serialNumber = await generateSerialNumber(categoryName.trim());

      const newItem = {
        ...itemData,
        category: categoryName.trim(), // Store category as field
        serialNumber,
        dateModified: serverTimestamp(),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid,
        quantity: parseInt(itemData.quantity) || 0,
        ratePerItem: parseFloat(itemData.ratePerItem) || 0,
        totalPrice: (parseInt(itemData.quantity) || 0) * (parseFloat(itemData.ratePerItem) || 0)
      };

      const docRef = await addDoc(inventoryRef, newItem);
      return { id: docRef.id, ...newItem };
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  // Get all items from category (filtered from inventory collection)
  getItems: async (categoryName, options = {}) => {
    try {
      const trimmedCategory = categoryName.trim();
      let q = query(
        collection(db, 'inventory'),
        where('category', '==', trimmedCategory)
      );

      // Add pagination if specified
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const items = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          dateModified: data.dateModified?.toDate?.() || new Date(data.dateModified),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        });
      });

      // Sort by dateModified desc
      items.sort((a, b) => b.dateModified - a.dateModified);

      return items;
    } catch (error) {
      console.error('Error getting items:', error);
      throw error;
    }
  },

  // Get items with real-time updates
  getItemsRealtime: (categoryName, callback) => {
    try {
      const q = query(
        collection(db, 'inventory'),
        where('category', '==', categoryName),
        orderBy("dateModified", "desc")
      );

      return onSnapshot(q, (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            ...data,
            dateModified: data.dateModified?.toDate?.() || new Date(data.dateModified),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
          });
        });
        callback(items);
      });
    } catch (error) {
      console.error('Error getting realtime items:', error);
      throw error;
    }
  },

  // Get all items across all categories (for search/admin purposes)
  getAllItems: async (options = {}) => {
    try {
      let q = query(
        collection(db, 'inventory'),
        orderBy("dateModified", "desc")
      );

      // Add pagination if specified
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const items = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          dateModified: data.dateModified?.toDate?.() || new Date(data.dateModified),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        });
      });

      return items;
    } catch (error) {
      console.error('Error getting all items:', error);
      throw error;
    }
  },

  // Search items by name across all categories
  searchItems: async (searchTerm, options = {}) => {
    try {
      // Note: Firestore doesn't support partial text search natively
      // This is a basic implementation - you might want to use Algolia or ElasticSearch for better search
      const allItems = await itemService.getAllItems({ limit: 1000 }); // Get more items for search

      const filteredItems = allItems.filter(item =>
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply pagination if specified
      let result = filteredItems;
      if (options.limit) {
        const startIndex = options.offset || 0;
        result = filteredItems.slice(startIndex, startIndex + options.limit);
      }

      return result;
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  },

  // Update item
  updateItem: async (categoryName, itemId, updateData) => {
    try {
      const itemRef = doc(db, 'inventory', itemId);

      const updatedData = {
        ...updateData,
        dateModified: updateData.dateModified || serverTimestamp(),
        quantity: parseInt(updateData.quantity) || 0,
        ratePerItem: parseFloat(updateData.ratePerItem) || 0,
        totalPrice: (parseInt(updateData.quantity) || 0) * (parseFloat(updateData.ratePerItem) || 0)
      };

      await updateDoc(itemRef, updatedData);
      return updatedData;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  // Delete item
  deleteItem: async (categoryName, itemId) => {
    try {
      await deleteDoc(doc(db, 'inventory', itemId));
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }
};

// Helper function to generate unique serial numbers
const generateSerialNumber = async (categoryName) => {
  try {
    const prefix = categoryName.substring(0, 3).toUpperCase();

    // Get all existing serial numbers for this category from inventory collection
    const q = query(
      collection(db, 'inventory'),
      where('category', '==', categoryName)
    );

    const querySnapshot = await getDocs(q);
    const existingSerials = new Set();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.serialNumber) {
        existingSerials.add(data.serialNumber);
      }
    });

    // Find the next available serial number
    let count = 1;
    let serialNumber;
    do {
      serialNumber = `${prefix}${count.toString().padStart(3, '0')}`;
      count++;
    } while (existingSerials.has(serialNumber) && count < 1000); // Prevent infinite loop

    if (count >= 1000) {
      throw new Error('Unable to generate unique serial number');
    }

    return serialNumber;
  } catch (error) {
    console.error('Error generating serial number:', error);
    // Fallback: use timestamp-based unique ID
    const timestamp = Date.now().toString().slice(-6);
    return `${categoryName.substring(0, 3).toUpperCase()}${timestamp}`;
  }
};

// User Service (for role checking and profile management)
export const userService = {
  getCurrentUserRole: async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const { getDoc, doc } = await import("firebase/firestore");
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));

      if (userDoc.exists()) {
        return userDoc.data().role || 'admin';
      }

      return 'admin';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'admin';
    }
  },

  // Get full user data
  getCurrentUser: async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const { getDoc, doc } = await import("firebase/firestore");
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));

      if (userDoc.exists()) {
        return {
          uid: currentUser.uid,
          email: currentUser.email,
          ...userDoc.data()
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },

  // Update user profile (Firestore only - image, name, etc.)
  updateUserProfile: async (updates) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const { updateDoc, doc } = await import("firebase/firestore");

      // Update Firestore document
      await updateDoc(doc(db, "users", currentUser.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Update email (requires reauthentication)
  updateEmail: async (newEmail, currentPassword) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error('No authenticated user');

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update email in Auth
      await updateEmail(currentUser, newEmail);

      // Update email in Firestore
      const { updateDoc, doc } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", currentUser.uid), {
        email: newEmail,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating email:', error);

      // Handle specific Firebase Auth errors
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      }
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email changes are disabled in Firebase Console. Please contact administrator or enable email changes in Authentication > Settings > User actions.');
      }
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please log out and log back in before changing your email');
      }
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use by another account');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format');
      }

      throw error;
    }
  },

  // Change password (requires reauthentication)
  changePassword: async (currentPassword, newPassword) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error('No authenticated user');

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      }
      throw error;
    }
  }
};

export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const orderRef = collection(db, 'orders');

      const newOrder = {
        ...orderData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'pending', // pending, processing, completed, cancelled
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        orderNumber: await generateOrderNumber()
      };

      const docRef = await addDoc(orderRef, newOrder);
      return { id: docRef.id, ...newOrder };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user's orders
  getUserOrders: async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const q = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const orders = [];

      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt)
        });
      });

      return orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  },

  // Get all orders (for admin)
  getAllOrders: async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const orders = [];

      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt)
        });
      });

      return orders;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const orderRef = doc(db, 'orders', orderId);

      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Update full order
  updateOrder: async (orderId, updatedData) => {
    try {
      const orderRef = doc(db, 'orders', orderId);

      // Ensure numeric fields are properly parsed
      const safeData = {
        ...updatedData,
        items: updatedData.items?.map(item => ({
          ...item,
          quantity: parseInt(item.quantity) || 0,
          ratePerItem: parseFloat(item.ratePerItem) || 0,
          totalPrice: (parseInt(item.quantity) || 0) * (parseFloat(item.ratePerItem) || 0)
        })) || [],
        total: parseFloat(updatedData.total) || 0,
        status: updatedData.status || 'pending',
        notes: updatedData.notes || '',
        updatedAt: serverTimestamp()
      };

      // Recalculate total if items provided
      if (safeData.items && safeData.items.length > 0) {
        safeData.total = safeData.items.reduce((sum, item) => sum + item.totalPrice, 0);
      }

      await updateDoc(orderRef, safeData);
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Complete order and update inventory (procurement receipt)
  completeOrder: async (orderId) => {
    try {
      console.log('Starting completeOrder for orderId:', orderId);
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      console.log('Order found:', order);
      console.log('Order items:', order.items);

      let updatedItems = 0;
      let createdItems = 0;

      for (const orderItem of order.items || []) {
        console.log('Processing order item:', orderItem);
        let found = false;

        // Search for existing item across all categories using the new flattened structure
        try {
          const allItems = await itemService.getAllItems({ limit: 10000 }); // Get all items for search
          console.log('All items in inventory:', allItems.length);

          const matchingItem = allItems.find(item => item.itemName?.toLowerCase() === orderItem.itemName?.toLowerCase());
          console.log('Matching item found:', matchingItem);

          if (matchingItem) {
            // Change here: Add quantity instead of subtracting
            const newQuantity = (parseInt(matchingItem.quantity) || 0) + (parseInt(orderItem.quantity) || 0);
            const newTotalPrice = newQuantity * (parseFloat(matchingItem.ratePerItem) || 0);

            console.log('Updating item:', matchingItem.id, 'with quantity:', newQuantity);

            await itemService.updateItem(matchingItem.category, matchingItem.id, {
              quantity: newQuantity,
              ratePerItem: matchingItem.ratePerItem,
              totalPrice: newTotalPrice,
              dateModified: serverTimestamp()
            });

            updatedItems++;
            found = true;
            console.log(`Updated existing inventory for ${orderItem.itemName} in ${matchingItem.category}: +${orderItem.quantity} qty`);
          }
        } catch (searchError) {
          console.error(`Error searching for item ${orderItem.itemName}:`, searchError);
        }

        // If item not found, create it in procurement category
        if (!found) {
          try {
            const procurementCategory = 'Procurement';

            // Create new item in procurement category
            const newItemData = {
              itemName: orderItem.itemName,
              quantity: parseInt(orderItem.quantity) || 0,
              ratePerItem: parseFloat(orderItem.ratePerItem) || 0,
              totalPrice: (parseInt(orderItem.quantity) || 0) * (parseFloat(orderItem.ratePerItem) || 0),
              description: `Procured via order ${order.orderNumber}`,
              supplier: order.userEmail || 'Unknown',
              dateReceived: new Date()
            };

            console.log('Creating new item:', newItemData);
            await itemService.addItem(procurementCategory, newItemData);
            createdItems++;
            console.log(`Created new inventory item: ${orderItem.itemName} in procurement category with ${orderItem.quantity} qty`);
          } catch (createError) {
            console.error(`Failed to create new item ${orderItem.itemName}:`, createError);
            // Continue with other items instead of failing completely
          }
        }
      }

      const totalProcessed = updatedItems + createdItems;
      console.log('Total processed items:', totalProcessed);

      if (totalProcessed === 0) {
        throw new Error('No inventory items were processed - check item data');
      }

      // Preserve items and total fields when updating order to completed
      const orderRef = doc(db, 'orders', orderId);

      // Read the current order document again to ensure latest data
      const currentOrderDoc = await getDoc(orderRef);
      const currentOrderData = currentOrderDoc.exists() ? currentOrderDoc.data() : {};

      await updateDoc(orderRef, {
        status: 'completed',
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
        items: currentOrderData.items || order.items || [],
        total: currentOrderData.total || order.total || 0
      });

      return {
        updatedItems,
        createdItems,
        totalProcessed,
        message: `${updatedItems} items updated, ${createdItems} new items created in inventory`
      };
    } catch (error) {
      console.error('Error completing order (inventory update):', error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));

      if (orderDoc.exists()) {
        const data = orderDoc.data();

        // Enrich order items with ratePerItem and totalPrice if missing
        const items = (data.items || []).map(item => {
          const quantity = parseInt(item.quantity) || 0;
          let ratePerItem = parseFloat(item.ratePerItem) || 0;
          const totalPrice = item.totalPrice !== undefined && item.totalPrice !== null
            ? parseFloat(item.totalPrice)
            : quantity * ratePerItem;

          // Calculate ratePerItem from totalPrice / quantity if ratePerItem is zero and quantity > 0
          if ((!ratePerItem || ratePerItem === 0) && quantity > 0) {
            ratePerItem = totalPrice / quantity;
          }

          return {
            ...item,
            quantity,
            ratePerItem,
            totalPrice
          };
        });

        // Calculate total amount from items if missing or zero
        let total = parseFloat(data.total);
        if (!total || total === 0) {
          total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        }

        return {
          id: orderDoc.id,
          ...data,
          items,
          total,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt)
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }
};

// Helper function to generate unique order numbers
const generateOrderNumber = async () => {
  try {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback
    return `ORD-${Date.now()}`;
  }
};

export { db };
