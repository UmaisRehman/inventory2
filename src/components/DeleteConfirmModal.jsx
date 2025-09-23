import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, clickedElement = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-end justify-center z-[10000] p-4 lg:items-center lg:justify-center">
      <div className="bg-white rounded-t-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto lg:max-h-[80vh] lg:rounded-xl lg:max-w-lg lg:rounded-t-none">
        {/* Header */}
        <div className="flex items-center p-6 pb-4">
          <div className="flex-shrink-0">
            <FiAlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Delete Item</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900">"{itemName}"</span>?
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-error btn-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
