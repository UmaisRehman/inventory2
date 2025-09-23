import React, { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiPackage,
  FiRefreshCw,
  FiBarChart,
  FiTrendingUp,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import ModernInventorySidebar from "../components/ModernInventorySidebar";
import InventoryTable from "../components/InventoryTable";
import ItemModal from "../components/ItemModal";
import {
  categoryService,
  itemService,
  userService,
} from "../Config/firebase/firebaseService";
import "../components/ToastStyles.css";

const Inventory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    categoriesCount: 0,
  });

  // Function to calculate total value from all categories
  const calculateTotalValue = async (categoriesData) => {
    try {
      if (!categoriesData || categoriesData.length === 0) {
        return 0;
      }

      let totalValue = 0;
      for (const category of categoriesData) {
        const itemsData = await itemService.getItems(category.id);
        const categoryValue = itemsData.reduce(
          (sum, item) => sum + (item.totalPrice || 0),
          0
        );
        totalValue += categoryValue;
      }
      return totalValue;
    } catch (error) {
      console.error("Error calculating total value:", error);
      return 0;
    }
  };

  // Optimized data loading with caching - no dependencies to prevent re-creation
  const loadData = useMemo(() => {
    return async (forceRefresh = false) => {
      try {
        setLoading(true);

        // Parallel loading for better performance
        const [role, categoriesData] = await Promise.all([
          userService.getCurrentUserRole(),
          categoryService.getCategories(),
        ]);

        setIsSuperAdmin(role === "superadmin");
        setCategories(categoriesData);

        // Auto-select first category if none selected
        if (categoriesData.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesData[0].id);
        }

        // Calculate stats including total value from all categories
        const totalItems = categoriesData.reduce(
          (sum, cat) => sum + (cat.itemCount || 0),
          0
        );
        const totalValue = await calculateTotalValue(categoriesData);

        setStats({
          totalItems,
          categoriesCount: categoriesData.length,
          totalValue,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    };
  }, []); // Empty dependency array to prevent re-creation

  // Load items when category changes (no real-time updates)
  useEffect(() => {
    if (selectedCategory) {
      const loadItemsOnce = async () => {
        try {
          const itemsData = await itemService.getItems(selectedCategory);
          setItems(itemsData);
        } catch (error) {
          console.error("Error loading items:", error);
        }
      };

      loadItemsOnce();
    }
  }, [selectedCategory]);

  // Initial load only
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const handleItemSaved = async () => {
    try {
      setLoading(true);
      setIsAddItemModalOpen(false);

      // Only refresh the current category items (much faster)
      if (selectedCategory) {
        const itemsData = await itemService.getItems(selectedCategory);
        setItems(itemsData);

        // Update category item count in the categories list
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === selectedCategory
              ? { ...cat, itemCount: itemsData.length }
              : cat
          )
        );

        // Recalculate total items count
        const totalItems = categories.reduce(
          (sum, cat) => sum + (cat.itemCount || 0),
          0
        );

        // Calculate new category value
        const categoryValue = itemsData.reduce(
          (sum, item) => sum + (item.totalPrice || 0),
          0
        );

        // Update total value by adding the new category value
        const oldCategoryValue =
          categories.find((cat) => cat.id === selectedCategory)?.totalValue ||
          0;
        const newTotalValue =
          stats.totalValue - oldCategoryValue + categoryValue;

        setStats((prevStats) => ({
          ...prevStats,
          totalItems,
          totalValue: newTotalValue,
        }));
      }

      // Show success message
      toast.success("Item added successfully", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleItemDeleted = async () => {
    try {
      setLoading(true);

      // Only refresh the current category items (much faster)
      if (selectedCategory) {
        const itemsData = await itemService.getItems(selectedCategory);
        setItems(itemsData);

        // Update category item count in the categories list
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === selectedCategory
              ? { ...cat, itemCount: itemsData.length }
              : cat
          )
        );

        // Recalculate total items count (only for current category change)
        const totalItems = categories.reduce(
          (sum, cat) => sum + (cat.itemCount || 0),
          0
        );

        // Only recalculate total value for the affected category (much faster)
        const updatedCategories = categories.map((cat) =>
          cat.id === selectedCategory
            ? { ...cat, itemCount: itemsData.length }
            : cat
        );

        const categoryValue = itemsData.reduce(
          (sum, item) => sum + (item.totalPrice || 0),
          0
        );

        // Update total value by subtracting the old category value and adding new
        const oldCategoryValue =
          categories.find((cat) => cat.id === selectedCategory)?.totalValue ||
          0;
        const newTotalValue =
          stats.totalValue - oldCategoryValue + categoryValue;

        setStats((prevStats) => ({
          ...prevStats,
          totalItems,
          totalValue: newTotalValue,
        }));
      }

      // Show success message
      toast.success("Item deleted successfully", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Clean Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg">
        <div className="flex items-center justify-center relative">
          <h1 className="text-xl font-bold text-white">Inventory</h1>
          <button
            onClick={handleRefresh}
            className="btn bg-white/20 text-white hover:bg-white/30 btn-sm border-0 backdrop-blur-sm absolute right-0"
            title="Refresh data"
          >
            <FiRefreshCw size={18} />
          </button>
        </div>

        {/* Mobile Stats Card - Peaceful Design */}
        {selectedCategory && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3 mb-2">
                  <FiPackage className="text-white mx-auto" size={20} />
                </div>
                <p className="text-white/80 text-xs font-medium">Items</p>
                <p className="text-white text-lg font-bold">{items.length}</p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3 mb-2">
                  <FiBarChart className="text-white mx-auto" size={20} />
                </div>
                <p className="text-white/80 text-xs font-medium">Total Value</p>
                <p className="text-white text-lg font-bold">
                  $
                  {items
                    .reduce((sum, item) => sum + (item.totalPrice || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Professional Desktop Sidebar */}
        <div className="hidden lg:block  flex-shrink-0">
          <ModernInventorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            onCategoryAdded={() => loadData(true)}
            isSuperAdmin={isSuperAdmin}
            onAddItem={() => setIsAddItemModalOpen(true)}
            stats={stats}
          />
        </div>

        {/* Professional Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Clean Desktop Header */}
          <div className="hidden lg:block bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/50 backdrop-blur-sm border-b border-blue-100/50 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg">
                    <FiPackage className="text-white" size={20} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Inventory Management
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                      Professional inventory control system
                    </p>
                  </div>
                </div>

                {selectedCategory && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 px-3 py-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FiBarChart size={16} className="text-blue-600" />
                        <span className="text-blue-800 font-medium text-sm">
                          Viewing:{" "}
                          {selectedCategory.charAt(0).toUpperCase() +
                            selectedCategory.slice(1)}{" "}
                          Category
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <div className="text-center">
                          <p className="text-blue-600 font-medium">
                            {items.length}
                          </p>
                          <p className="text-blue-500">Items</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-600 font-medium">
                            $
                            {items
                              .reduce(
                                (sum, item) => sum + (item.totalPrice || 0),
                                0
                              )
                              .toLocaleString()}
                          </p>
                          <p className="text-blue-500">Total Value</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-3">
                <button
                  onClick={handleRefresh}
                  className="btn bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 btn-sm shadow-sm transition-all duration-200"
                  title="Refresh data"
                >
                  <FiRefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Professional Content Area */}
          <div className="flex-1 overflow-auto p-3 lg:p-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full mb-3 inline-block">
                    <FiPackage className="text-white animate-pulse" size={24} />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Loading inventory data...
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Please wait</p>
                </div>
              </div>
            ) : !selectedCategory ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center max-w-lg">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FiPackage size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Welcome to Inventory
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    {categories.length === 0
                      ? "Start by creating your first category to organize your inventory"
                      : "Select a category from the sidebar to begin managing your items"}
                  </p>
                  {categories.length === 0 && isSuperAdmin && (
                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white btn-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <FiPackage size={16} className="mr-2" />
                      Create First Category
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100/50 overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-3 border-b border-gray-100/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">
                        {selectedCategory.charAt(0).toUpperCase() +
                          selectedCategory.slice(1)}{" "}
                        Items
                      </h2>
                      <p className="text-gray-600 text-xs">
                        Manage and organize your inventory items
                      </p>
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => setIsAddItemModalOpen(true)}
                        className="btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white btn-xs border-0 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <FiPackage size={14} className="mr-1" />
                        Add Item
                      </button>
                    )}
                  </div>
                </div>

                <InventoryTable
                  items={items}
                  categoryName={selectedCategory}
                  onItemUpdated={() =>
                    toast.success("Item updated successfully", {
                      position: "top-right",
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    })
                  }
                  onItemDeleted={handleItemDeleted}
                  isSuperAdmin={isSuperAdmin}
                />
              </div>
            )}
          </div>
        </div>

        {/* Professional Mobile Sidebar */}
        <div className="lg:hidden">
          <ModernInventorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            onCategoryAdded={() => loadData(true)}
            isSuperAdmin={isSuperAdmin}
            onAddItem={() => setIsAddItemModalOpen(true)}
            stats={stats}
          />
        </div>
      </div>

      {/* Professional Add Item Modal */}
      <ItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onItemSaved={handleItemSaved}
        categoryName={selectedCategory}
        mode="add"
      />

      {/* Professional Toast Container - Fixed positioning */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          "--toastify-toast-width": "320px",
          "--toastify-toast-min-height": "48px",
          "--toastify-font-family": "inherit",
          "--toastify-z-index": 9999,
          top: "20px",
          right: "20px",
        }}
      />
    </div>
  );
};

export default Inventory;
