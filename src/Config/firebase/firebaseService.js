  import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "./firebaseconfig";

const db = getFirestore(app);
const auth = getAuth(app);

// Category Service
export const categoryService = {
  // Get all categories (collection names) dynamically
  getCategories: async () => {
    try {
      const categories = [];

      // First, try to get categories from the categories collection
      try {
        const categoriesQuery = query(
          collection(db, 'categories'),
          orderBy('createdAt', 'desc')
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);

        for (const doc of categoriesSnapshot.docs) {
          const data = doc.data();
          const normalizedName = data.normalizedName;
          const displayName = data.name;

          // Check if the collection exists and count items
          try {
            const q = query(collection(db, normalizedName));
            const querySnapshot = await getDocs(q);

            let actualItems = 0;
            querySnapshot.forEach((doc) => {
              const itemData = doc.data();
              if (!itemData._isCategoryMarker) {
                actualItems++;
              }
            });

            categories.push({
              id: normalizedName,
              name: displayName,
              itemCount: actualItems,
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
            });
          } catch (error) {
            // Collection doesn't exist, skip
            console.log(`Collection ${normalizedName} not found, skipping`);
          }
        }
      } catch (error) {
        console.log('Categories collection not found, falling back to common categories');
      }

      // Fallback: Get all collections by trying common category names
      // This is a workaround since Firestore doesn't provide a direct way to list collections
      const commonCategories = [
        'hardware', 'electronics', 'glass', 'books', 'furniture',
        'clothing', 'tools', 'supplies', 'equipment', 'materials',
        'accessories', 'components', 'parts', 'products', 'inventory'
      ];

      for (const categoryName of commonCategories) {
        try {
          const q = query(collection(db, categoryName));
          const querySnapshot = await getDocs(q);

          // Only add if collection has documents (excluding category markers)
          let actualItems = 0;
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data._isCategoryMarker) {
              actualItems++;
            }
          });

          if (actualItems > 0 || querySnapshot.size > 0) {
            // Check if this category is already in the list
            const existingCategory = categories.find(cat => cat.id === categoryName);
            if (!existingCategory) {
              categories.push({
                id: categoryName,
                name: categoryName,
                itemCount: actualItems,
                createdAt: new Date()
              });
            }
          }
        } catch (error) {
          // Collection doesn't exist, skip silently
          continue;
        }
      }

      // Sort categories by name
      categories.sort((a, b) => a.name.localeCompare(b.name));

      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Add new category
  addCategory: async (categoryName) => {
    try {
      const normalizedName = categoryName.toLowerCase().trim();

      // Create the collection by adding a dummy document
      // In Firestore, collections are created when first document is added
      await addDoc(collection(db, normalizedName), {
        _isCategoryMarker: true,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid
      });

      // Also add to categories collection for tracking
      await addDoc(collection(db, 'categories'), {
        name: categoryName.trim(),
        normalizedName: normalizedName,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid
      });

      return normalizedName;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Delete category (and all its items)
  deleteCategory: async (categoryName) => {
    try {
      // Delete all items from the category collection
      const q = query(collection(db, categoryName));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);

      // Also remove from categories collection
      try {
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('normalizedName', '==', categoryName.toLowerCase())
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);

        const categoryDeletePromises = categoriesSnapshot.docs.map(doc =>
          deleteDoc(doc.ref)
        );

        await Promise.all(categoryDeletePromises);
      } catch (error) {
        console.log('Categories collection not found or category not tracked');
      }

      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

// Item Service
export const itemService = {
  // Add item to category
  addItem: async (categoryName, itemData) => {
    try {
      const categoryRef = collection(db, categoryName);

      // Generate serial number
      const serialNumber = await generateSerialNumber(categoryName);

      const newItem = {
        ...itemData,
        serialNumber,
        dateModified: serverTimestamp(),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid,
        quantity: parseInt(itemData.quantity) || 0,
        ratePerItem: parseFloat(itemData.ratePerItem) || 0,
        totalPrice: (parseInt(itemData.quantity) || 0) * (parseFloat(itemData.ratePerItem) || 0)
      };

      const docRef = await addDoc(categoryRef, newItem);
      return { id: docRef.id, ...newItem };
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  // Get all items from category
  getItems: async (categoryName) => {
    try {
      const q = query(
        collection(db, categoryName),
        orderBy("dateModified", "desc")
      );

      const querySnapshot = await getDocs(q);
      const items = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter out category marker documents
        if (data._isCategoryMarker) return;

        items.push({
          id: doc.id,
          ...data,
          dateModified: data.dateModified?.toDate?.() || new Date(data.dateModified),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        });
      });

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
        collection(db, categoryName),
        orderBy("dateModified", "desc")
      );

      return onSnapshot(q, (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Filter out category marker documents
          if (data._isCategoryMarker) return;

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

  // Update item
  updateItem: async (categoryName, itemId, updateData) => {
    try {
      const itemRef = doc(db, categoryName, itemId);

      const updatedData = {
        ...updateData,
        dateModified: serverTimestamp(),
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
      await deleteDoc(doc(db, categoryName, itemId));
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }
};

// Helper function to generate serial numbers
const generateSerialNumber = async (categoryName) => {
  try {
    const q = query(
      collection(db, categoryName),
      where("_isCategoryMarker", "!=", true)
    );

    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size + 1;

    // Generate serial number like "HW001", "EL002", etc.
    const prefix = categoryName.substring(0, 2).toUpperCase();
    return `${prefix}${count.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating serial number:', error);
    return `${categoryName.substring(0, 2).toUpperCase()}001`;
  }
};

// User Service (for role checking)
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
  }
};
