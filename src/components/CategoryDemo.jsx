import React, { useState, useEffect } from 'react';
import ScrollableCategoryList from './ScrollableCategoryList';

const CategoryDemo = () => {
  // Demo categories for testing
  const [categories] = useState([
    { id: 'hardware', name: 'Hardware', itemCount: 15 },
    { id: 'electronics', name: 'Electronics', itemCount: 23 },
    { id: 'books', name: 'Books', itemCount: 8 },
    { id: 'furniture', name: 'Furniture', itemCount: 12 },
    { id: 'clothing', name: 'Clothing', itemCount: 45 },
    { id: 'tools', name: 'Tools', itemCount: 18 },
    { id: 'supplies', name: 'Supplies', itemCount: 32 },
    { id: 'equipment', name: 'Equipment', itemCount: 7 },
    { id: 'materials', name: 'Materials', itemCount: 28 },
    { id: 'accessories', name: 'Accessories', itemCount: 19 },
    { id: 'components', name: 'Components', itemCount: 41 },
    { id: 'parts', name: 'Parts', itemCount: 16 },
    { id: 'products', name: 'Products', itemCount: 33 },
    { id: 'inventory', name: 'Inventory', itemCount: 25 },
    { id: 'test-category', name: 'Test Category', itemCount: 5 },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('hardware');

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
            <h1 className="text-2xl font-bold text-white text-center">
              Scrollable Categories Demo
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Test the scrollable category list component
            </p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar with Scrollable Categories */}
            <div className="w-full lg:w-80 bg-gray-50 border-r border-gray-200">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Categories ({categories.length})
                </h2>

                <ScrollableCategoryList
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  isSuperAdmin={true}
                  showStats={true}
                  maxHeight="500px"
                  className="bg-white rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Selected Category: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {categories.find(cat => cat.id === selectedCategory)?.itemCount || 0}
                    </div>
                    <div className="text-sm text-blue-600">Items</div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${(categories.find(cat => cat.id === selectedCategory)?.itemCount || 0) * 25.50}
                    </div>
                    <div className="text-sm text-green-600">Est. Value</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.floor(Math.random() * 100)}%
                    </div>
                    <div className="text-sm text-purple-600">Stock Level</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Category Information</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Category ID: <code className="bg-gray-200 px-1 rounded">{selectedCategory}</code></li>
                    <li>• Display Name: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</li>
                    <li>• Item Count: {categories.find(cat => cat.id === selectedCategory)?.itemCount || 0}</li>
                    <li>• Status: Active</li>
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Features Demonstrated</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>✅ Smooth scrolling with custom scrollbar</li>
                    <li>✅ Hover effects and tooltips</li>
                    <li>✅ Selected state highlighting</li>
                    <li>✅ Responsive design (mobile & desktop)</li>
                    <li>✅ Category statistics display</li>
                    <li>✅ Professional styling with gradients</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-2">How to Test</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click on different categories to see selection changes</li>
            <li>• Scroll through the category list to test scrollability</li>
            <li>• Hover over categories to see tooltips</li>
            <li>• Resize the window to test responsive behavior</li>
            <li>• Check the selected category information updates in real-time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryDemo;
