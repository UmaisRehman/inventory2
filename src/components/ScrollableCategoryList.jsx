import React from "react";
import { FiPackage, FiTrendingUp, FiBarChart } from "react-icons/fi";

const ScrollableCategoryList = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isSuperAdmin = false,
  showStats = true,
  maxHeight = "400px",
  className = "",
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PAK",
    }).format(amount);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Categories List - Scrollable */}
      <div className="flex-1 min-h-0">
        <div
          className="overflow-y-auto scrollbar-hide"
          style={{
            height: "fit-content",
            maxHeight: maxHeight,
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
          }}
        >
          <div className="p-2 space-y-1">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiPackage size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium">No categories yet</p>
                {isSuperAdmin && (
                  <p className="text-xs mt-2 opacity-75">
                    Add your first category to get started
                  </p>
                )}
              </div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategorySelect(category.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all duration-200
                    ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-lg transform scale-[1.02]"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold capitalize truncate text-sm">
                        {category.name}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          selectedCategory === category.id
                            ? "text-gray-600"
                            : "text-gray-500"
                        }`}
                      >
                        {category.itemCount} item
                        {category.itemCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {selectedCategory === category.id && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stats Display - Optional */}
      {showStats && categories.length > 0 && (
        <div className="flex-shrink-0 p-3 bg-gradient-to-r from-slate-50 to-blue-50/50 border-t border-blue-100/50">
          <div className="space-y-2">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg text-white mb-2 inline-block">
                <FiPackage size={18} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                {categories.length}
              </h3>
              <p className="text-xs text-gray-600">Categories</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-center bg-white/60 rounded-lg p-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-lg text-white mb-1 inline-block">
                  <FiTrendingUp size={14} />
                </div>
                <p className="font-bold text-gray-900 text-sm">
                  {categories.reduce(
                    (sum, cat) => sum + (cat.itemCount || 0),
                    0
                  )}
                </p>
                <p className="text-xs text-gray-600">Items</p>
              </div>

              <div className="text-center bg-white/60 rounded-lg p-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg text-white mb-1 inline-block">
                  <FiBarChart size={14} />
                </div>
                <p className="font-bold text-gray-900 text-sm">
                  {formatCurrency(
                    categories.reduce((sum, cat) => {
                      // This would need to be calculated from actual item data
                      return sum + (cat.totalValue || 0);
                    }, 0)
                  )}
                </p>
                <p className="text-xs text-gray-600">Value</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollableCategoryList;
