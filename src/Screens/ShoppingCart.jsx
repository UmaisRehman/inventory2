import React, { useState } from "react";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { orderService } from "../Config/firebase/firebaseService";

const ShoppingCart = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      toast.info("Item removed from procurement request");
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId, itemName) => {
    removeItem(itemId);
    toast.info(`${itemName} removed from procurement request`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.info("Procurement request cleared");
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("No items selected for procurement");
      return;
    }

    setIsProcessing(true);
    try {
      // Prepare procurement request data
      const procurementData = {
        items: items.map((item) => ({
          itemName: item.itemName,
          serialNumber: item.serialNumber,
          categoryName: item.categoryName,
          quantity: item.quantity,
          ratePerItem: item.ratePerItem,
          totalPrice: item.ratePerItem * item.quantity,
          dateModified: new Date().toISOString().slice(0, 16), // Current date/time in YYYY-MM-DDTHH:mm format
        })),
        totals: {
          estimatedCost: total,
          itemCount: items.length,
        },
        status: "pending",
        notes: "Procurement request submitted via inventory system",
        requestType: "procurement",
      };
      const procurementRequest = await orderService.createOrder(
        procurementData
      );

      clearCart();
      toast.success(
        `Procurement request ${procurementRequest.orderNumber} submitted successfully!`
      );
      navigate("/inventory");
    } catch (error) {
      console.error("Procurement request error:", error);
      toast.error("Failed to submit procurement request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <FiShoppingBag className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No items selected
          </h2>
          <p className="text-gray-600 mb-6">
            Select items from the inventory to create a procurement request.
          </p>
          <button
            onClick={() => navigate("/inventory")}
            className="btn btn-primary"
          >
            Browse Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Procurement Request
              </h1>
              <p className="text-gray-600 mt-1">
                {items.length} {items.length === 1 ? "item" : "items"} selected
                for procurement
              </p>
            </div>
            <button
              onClick={handleClearCart}
              className="btn btn-outline btn-error"
            >
              <FiTrash2 size={16} />
              Clear Request
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Mobile View */}
          <div className="block lg:hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.itemName}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      {item.serialNumber}
                    </p>
                    <p className="text-sm text-gray-500">{item.categoryName}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id, item.itemName)}
                    className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50"
                    title="Remove item"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="btn btn-sm btn-outline"
                      disabled={item.quantity <= 1}
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="btn btn-sm btn-outline"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">
                      {formatCurrency(item.ratePerItem * item.quantity)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(item.ratePerItem)} each
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="bg-gray-50">Item</th>
                  <th className="bg-gray-50">Serial Number</th>
                  <th className="bg-gray-50">Category</th>
                  <th className="bg-gray-50">Quantity</th>
                  <th className="bg-gray-50">Unit Price</th>
                  <th className="bg-gray-50">Total</th>
                  <th className="bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="font-medium">{item.itemName}</td>
                    <td className="font-mono text-sm">{item.serialNumber}</td>
                    <td>{item.categoryName}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="btn btn-xs btn-outline"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="btn btn-xs btn-outline"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </td>
                    <td>{formatCurrency(item.ratePerItem)}</td>
                    <td className="font-semibold text-primary">
                      {formatCurrency(item.ratePerItem * item.quantity)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.itemName)}
                 total  className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50"
                        title="Remove item"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Procurement Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Procurement Summary
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span>Estimated Cost ({items.length} items)</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Estimated Cost</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/inventory")}
              className="btn btn-outline flex-1"
            >
              Continue Browsing
            </button>
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                "Submit Procurement Request"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
