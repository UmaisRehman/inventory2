import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiPackage,
  FiMenu,
  FiX,
  FiTrendingUp,
  FiBarChart,
  FiSettings,
  FiLayers,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import CategoryModal from "./CategoryModal";
import ScrollableCategoryList from "./ScrollableCategoryList";

const ModernInventorySidebar = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onCategoryAdded,
  isSuperAdmin,
  onAddItem,
  stats,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [sheetPosition, setSheetPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [dragVelocity, setDragVelocity] = useState(0);
  const [lastY, setLastY] = useState(0);

  const handleCategoryAdded = () => {
    onCategoryAdded();
    setIsCategoryModalOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
    setSheetPosition(0);
  };

  const handleTouchStart = (e) => {
    if (isMobileOpen) {
      setIsDragging(true);
      setStartY(e.touches[0].clientY);
      setLastY(e.touches[0].clientY);
      setDragVelocity(0);
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const velocity = currentY - lastY;
      setLastY(currentY);
      setDragVelocity(velocity);
      if (deltaY > 0) {
        // Dragging down
        setSheetPosition(Math.min(deltaY, 200)); // Limit max drag
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      const shouldClose = sheetPosition > 80 || (sheetPosition > 40 && dragVelocity > 5);
      if (shouldClose) {
        // Close with animation
        setIsMobileOpen(false);
        setSheetPosition(0);
      } else {
        // Snap back
        setSheetPosition(0);
      }
    }
  };

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Menu Button - Modern Design */}
      <div
        className={`lg:hidden fixed top-20 left-4 z-50 transition-opacity duration-300 ${
          isMobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <button
          onClick={toggleMobileMenu}
          className="btn btn-circle shadow-lg hover:shadow-xl transition-all duration-200 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 hover:border-blue-300"
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* Desktop Sidebar - Improved Design */}
      <div className="hidden lg:block w-72 bg-white shadow-xl border-r border-gray-100 h-full">
        <div className="flex flex-col h-full">
          {/* Header - Modern Design */}
          <div className="flex-shrink-0 p-3 mb-0 pb-0.5 pt-4  bg-gradient-to-br from-gray-700 via-cyan-600 to-cyan-700 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <FiLayers className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Inventory</h2>
                    <p className="text-blue-100 text-xs">Management System</p>
                  </div>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="btn bg-white/20 text-white hover:bg-white/30 btn-sm transition-all duration-200 border-0 backdrop-blur-sm rounded-lg"
                    title="Add Category"
                  >
                    <FiPlus size={16} />
                  </button>
                )}
              </div>

              {/* Quick Stats in Header */}
            </div>
          </div>

          {/* Selected Category Display - Modern Card Design
          {selectedCategory && (
            <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100/50">
              <div className="bg-white rounded-xl p-3 shadow-sm border border-blue-100/50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                      <FiPackage className="text-white" size={16} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 capitalize text-sm">
                      {selectedCategory}
                    </h3>
                    <p className="text-blue-600 text-xs font-medium">
                      {categories.find((cat) => cat.id === selectedCategory)
                        ?.itemCount || 0}{" "}
                      items
                    </p>
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={onAddItem}
                      className="btn bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white btn-xs transition-all duration-200 shadow-sm hover:shadow-md border-0"
                    >
                      <FiPlus size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )} */}

          {/* Categories List with System Overview - Improved Design */}
<div className="h-screen flex flex-col"> {/* Main container */}
  {/* Your header content */}
  
  {/* Main content area */}
  <div className="flex-1 min-h-0 bg-gray-50/30">
    <div className="h-full p-2">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100/50 h-full overflow-hidden flex flex-col">
        <div className="flex-shrink-0 p-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-700 text-sm">
            All Categories
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {categories.length} total categories
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <ScrollableCategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
            isSuperAdmin={isSuperAdmin}
            showStats={false}
            className="h-full"
          />
        </div>
      </div>
    </div>
  </div>
</div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Sidebar - NEW APPROACH */}
      <div className="lg:hidden">
        {/* Mobile Bottom Sheet */}
        <div
          className={`
            fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl transform transition-all duration-300 ease-out
            ${isMobileOpen ? "translate-y-0" : "translate-y-full"}
          `}
          style={{
            maxHeight: "85vh",
            transform: `translateY(${isMobileOpen ? sheetPosition : "100%"})`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl -mt-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <FiLayers className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Categories</h2>
                    <p className="text-blue-100 text-xs">Choose a category</p>
                  </div>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setIsCategoryModalOpen(true);
                      setIsMobileOpen(false);
                    }}
                    className="btn bg-white/20 text-white hover:bg-white/30 btn-sm transition-all duration-200 border-0 backdrop-blur-sm rounded-lg"
                    title="Add Category"
                  >
                    <FiPlus size={16} />
                  </button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <FiPackage className="text-white mx-auto mb-1" size={14} />
                  <p className="text-white font-bold text-sm">
                    {categories.length}
                  </p>
                  <p className="text-blue-100 text-xs">Categories</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <FiTrendingUp className="text-white mx-auto mb-1" size={14} />
                  <p className="text-white font-bold text-sm">
                    {stats.totalItems}
                  </p>
                  <p className="text-blue-100 text-xs">Items</p>
                </div>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-hidden" style={{ maxHeight: "50vh" }}>
            <ScrollableCategoryList
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={(categoryId) => {
                onCategorySelect(categoryId);
                setIsMobileOpen(false);
              }}
              isSuperAdmin={isSuperAdmin}
              showStats={false}
              maxHeight="50vh"
              className="p-2"
            />
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex space-x-2">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="btn btn-outline flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              {selectedCategory && isSuperAdmin && (
                <button
                  onClick={() => {
                    onAddItem();
                    setIsMobileOpen(false);
                  }}
                  className="btn bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white flex-1 border-0"
                >
                  <FiPlus size={14} className="mr-2" />
                  Add Item
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />
    </>
  );
};

export default ModernInventorySidebar;
