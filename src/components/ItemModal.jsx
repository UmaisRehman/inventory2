import React, { useState, useEffect } from 'react';

const ItemModal = ({ isOpen, onClose, onItemSaved, categoryName, item = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    ratePerItem: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        itemName: item.itemName || '',
        quantity: item.quantity?.toString() || '',
        ratePerItem: item.ratePerItem?.toString() || ''
      });
    } else {
      setFormData({
        itemName: '',
        quantity: '',
        ratePerItem: ''
      });
    }
  }, [item, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName.trim()) {
      alert('Please enter item name');
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      alert('Please enter valid quantity');
      return;
    }

    if (!formData.ratePerItem || parseFloat(formData.ratePerItem) <= 0) {
      alert('Please enter valid rate per item');
      return;
    }

    setLoading(true);
    try {
      const { itemService } = await import('../Config/firebase/firebaseService');

      if (mode === 'add') {
        await itemService.addItem(categoryName, formData);
      } else {
        await itemService.updateItem(categoryName, item.id, formData);
      }

      onItemSaved();
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      alert(`Failed to ${mode === 'add' ? 'add' : 'update'} item. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      itemName: '',
      quantity: '',
      ratePerItem: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {mode === 'add' ? 'Add New Item' : 'Edit Item'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Enter item name"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Enter quantity"
                min="1"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="ratePerItem" className="block text-sm font-medium text-gray-700 mb-2">
                Rate per Item
              </label>
              <input
                type="number"
                id="ratePerItem"
                value={formData.ratePerItem}
                onChange={(e) => setFormData({ ...formData, ratePerItem: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Enter rate per item"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            {formData.quantity && formData.ratePerItem && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total Price: <span className="font-semibold text-gray-900">
                    ${(parseInt(formData.quantity) * parseFloat(formData.ratePerItem)).toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-ghost"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  mode === 'add' ? 'Add Item' : 'Update Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
