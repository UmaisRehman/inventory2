import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const InventoryTable = ({
  items,
  categoryName,
  onItemUpdated,
  onItemDeleted,
  isSuperAdmin,
  onEdit,
  onDelete,
}) => {

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first item.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.itemName}</h3>
                <p className="text-sm text-gray-500 font-mono">
                  {item.serialNumber}
                </p>
              </div>
              {isSuperAdmin && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(item)}
                    className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"
                    title="Edit item"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id, item.itemName)}
                    className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50"
                    title="Delete item"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-800">Quantity:</span>
                <div className="font-medium text-black">{item.quantity}</div>
              </div>
              <div>
                <span className="text-gray-800">Rate:</span>
                <div className="font-medium text-black">
                  {formatCurrency(item.ratePerItem)}
                </div>
              </div>
              <div>
                <span className="text-gray-800">Total:</span>
                <div className="font-semibold text-primary">
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>
              <div>
                <span className="text-gray-800">Modified:</span>
                <div className="font-medium text-black">
                  {formatDate(item.dateModified)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-auto max-h-96 rounded-lg">
          <table className="table table-zebra w-full">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="bg-gray-50">Serial Number</th>
                <th className="bg-gray-50">Item Name</th>
                <th className="bg-gray-50">Quantity</th>
                <th className="bg-gray-50">Rate per Item</th>
                <th className="bg-gray-50">Total Price</th>
                <th className="bg-gray-50">Last Modified</th>
                {isSuperAdmin && <th className="bg-gray-50">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="font-mono text-sm">{item.serialNumber}</td>
                  <td className="font-medium">{item.itemName}</td>
                  <td>
                    <span className="badge badge-outline">{item.quantity}</span>
                  </td>
                  <td>{formatCurrency(item.ratePerItem)}</td>
                  <td className="font-semibold text-primary">
                    {formatCurrency(item.totalPrice)}
                  </td>
                  <td className="text-sm text-gray-500">
                    {formatDate(item.dateModified)}
                  </td>
                  {isSuperAdmin && (
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"
                          title="Edit item"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id, item.itemName)}
                          className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50"
                          title="Delete item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default InventoryTable;
