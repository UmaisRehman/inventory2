import { useState, useEffect } from 'react';
import CategoryModal from '../components/CategoryModal';
import { categoryService } from '../Config/firebase/firebaseService';


function Inventory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCategoryAdded = () => {
    loadCategories(); // Refresh the categories list
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Inventory Categories</h1>
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            Add Category
          </button>
        </div>

        {/* Categories List */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found. Add your first category!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="card bg-base-100 shadow-sm border">
                  <div className="card-body">
                    <h3 className="card-title capitalize">{category.id}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {category.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Modal */}
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCategoryAdded={handleCategoryAdded}
        />
      </div>
    </div>
  );
}

export default Inventory;