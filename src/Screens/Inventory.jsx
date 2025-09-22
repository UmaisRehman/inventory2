import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ItemTable from "../components/ItemTable";
import AddItemModal from "../components/AddItemModal";
import UpdateQuantityModal from "../components/UpdateQuantityModal";
import Toast from "../components/Toast";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../Config/firebase/firebaseconfig";

const categories = [
  { id: "electronics", name: "Electronics" },
  { id: "furniture", name: "Furniture" },
  { id: "office-supplies", name: "Office Supplies" },
  { id: "tools", name: "Tools" },
  { id: "vehicles", name: "Vehicles" },
  { id: "materials", name: "Materials" },
  { id: "miscellaneous", name: "Miscellaneous" },
];

export default function Inventory() {
  const [selectedCategory, setSelectedCategory] = useState("electronics");
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Load Items
  useEffect(() => {
    loadItems();
    // eslint-disable-next-line
  }, [selectedCategory]);

  const loadItems = async () => {
    try {
      const q = query(
        collection(db, "inventory"),
        where("category", "==", selectedCategory),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (err) {
      showToast("Error loading items", "error");
    }
  };

  const addNewItem = async (item) => {
    try {
      await addDoc(collection(db, "inventory"), {
        ...item,
        category: selectedCategory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowAddModal(false);
      loadItems();
      showToast("Item added successfully", "success");
    } catch {
      showToast("Error adding item", "error");
    }
  };

  const updateItemQuantity = async (itemId, newQuantity) => {
    try {
      const itemRef = doc(db, "inventory", itemId);
      await updateDoc(itemRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      });
      setShowUpdateModal(false);
      loadItems();
      showToast("Quantity updated successfully", "success");
    } catch {
      showToast("Error updating quantity", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {categories.find((c) => c.id === selectedCategory)?.name}
          </h2>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add New Item
          </button>
        </div>

        <ItemTable
          items={items}
          onUpdateQuantity={(item) => {
            setSelectedItem(item);
            setShowUpdateModal(true);
          }}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddItemModal onClose={() => setShowAddModal(false)} onSave={addNewItem} />
      )}
      {showUpdateModal && selectedItem && (
        <UpdateQuantityModal
          item={selectedItem}
          onClose={() => setShowUpdateModal(false)}
          onSave={updateItemQuantity}
        />
      )}

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
