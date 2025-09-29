import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  FiX,
  FiTruck,
  FiClock,
  FiCheck,
  FiEdit2,
  FiPrinter,
  FiSave,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import { userService, orderService, itemService } from '../Config/firebase/firebaseService';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import app from '../Config/firebase/firebaseconfig';

const OrderModal = ({ isOpen, onClose, orderId, isEditMode = false, onStatusUpdated }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [pendingStatus, setPendingStatus] = useState('');
  const [pendingNotes, setPendingNotes] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [editableOrder, setEditableOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const modalRef = useRef(null);

  const db = getFirestore(app);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleBackdropClick = (e) => {
      if (e.target === modalRef.current && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      modalRef.current?.addEventListener('click', handleBackdropClick);
      fetchOrder();
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      modalRef.current?.removeEventListener('click', handleBackdropClick);
    };
  }, [isOpen, orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      if (orderData) {
        setOrder(orderData);
        setStatus(orderData.status || 'pending');
        setNotes(orderData.notes || '');
      } else {
        toast.error('Order not found');
        onClose();
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getRole = async () => {
      const role = await userService.getCurrentUserRole();
      setUserRole(role);
    };
    if (isOpen) getRole();
  }, [isOpen]);

  useEffect(() => {
    if (order && userRole === 'superadmin') {
      setEditableOrder({ ...order });
      setIsEditing(false);
    }
  }, [order, userRole]);

  // Determine if editing should be disabled based on order status
  const isOrderEditable = order && order.status !== 'completed' && order.status !== 'cancelled';

  const handleStatusChange = async (newStatus) => {
    if (!orderId) return;

    // Prevent status change if order is completed or cancelled
    if (order.isCompleted || order.status === 'cancelled') {
      toast.error('Order status cannot be changed after completion or cancellation.');
      return;
    }

    const oldStatus = order.status || status;

    try {
      // If changing to completed, call completeOrder and update order with completion info
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        await orderService.completeOrder(orderId);
        await orderService.updateOrder(orderId, {
          status: 'completed',
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date(),
          items: order.items || [],
          total: order.total || 0
        });
        setStatus('completed');
        setOrder(prev => ({ ...prev, status: 'completed', isCompleted: true, completedAt: new Date(), items: order.items || [], total: order.total || 0 }));
        setEditableOrder(prev => prev ? ({ ...prev, status: 'completed', isCompleted: true, completedAt: new Date(), items: order.items || [], total: order.total || 0 }) : null);
        toast.success('Order completed and inventory updated');
      } else if (newStatus === 'cancelled') {
        // Update status to cancelled and prevent further changes
        await orderService.updateOrderStatus(orderId, 'cancelled');
        setStatus('cancelled');
        setOrder(prev => ({ ...prev, status: 'cancelled' }));
        setEditableOrder(prev => prev ? ({ ...prev, status: 'cancelled' }) : null);
        toast.success('Order cancelled');
      } else {
        // For other status changes, allow only if not completed or cancelled
        await orderService.updateOrderStatus(orderId, newStatus);
        setStatus(newStatus);
        setOrder(prev => ({ ...prev, status: newStatus }));
        setEditableOrder(prev => prev ? ({ ...prev, status: newStatus }) : null);
        toast.success('Order status updated');
      }

      // Notify parent or refresh orders list after status update
      if (typeof onStatusUpdated === 'function') {
        onStatusUpdated();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleNotesUpdate = async () => {
    if (!orderId || notes === order.notes) return;

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        notes,
        updatedAt: new Date()
      });
      toast.success('Notes updated');
      setOrder(prev => ({ ...prev, notes }));
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiTruck className="text-yellow-600" size={16} />;
      case 'processing': return <FiClock className="text-blue-600" size={16} />;
      case 'completed': return <FiCheck className="text-green-600" size={16} />;
      case 'cancelled': return <FiX className="text-red-600" size={16} />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full';
    const icon = getStatusIcon(status);
    switch (status) {
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{icon} {status}</span>;
      case 'processing':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{icon} {status}</span>;
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>{icon} {status}</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{icon} {status}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatCurrency = (amount) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(validAmount);
  };

  const updateItem = (index, field, value) => {
    setEditableOrder(prev => {
      if (!prev) return prev;
      const newItems = [...prev.items];
      const numericField = field === 'quantity' || field === 'ratePerItem';
      newItems[index] = { ...newItems[index], [field]: numericField ? parseFloat(value) || 0 : value };
      if (numericField) {
        newItems[index].totalPrice = newItems[index].quantity * newItems[index].ratePerItem;
      }
      const newTotal = newItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      return { ...prev, items: newItems, total: newTotal };
    });
  };

  const removeItem = (index) => {
    setEditableOrder(prev => {
      if (!prev) return prev;
      const newItems = prev.items.filter((_, i) => i !== index);
      const newTotal = newItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      return { ...prev, items: newItems, total: newTotal };
    });
  };

  const addItem = () => {
    setEditableOrder(prev => {
      if (!prev) return prev;
      const newItems = [...prev.items, {
        itemName: '',
        quantity: 0,
        ratePerItem: 0,
        totalPrice: 0,
        dateModified: new Date().toISOString().slice(0, 16) // Current date/time in YYYY-MM-DDTHH:mm format
      }];
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async () => {
    if (!editableOrder || !orderId) return;

    // Prevent updating completed or cancelled orders
    if (editableOrder.status === 'completed' || editableOrder.status === 'cancelled') {
      toast.error('Cannot update a completed or cancelled order.');
      return;
    }

    const hasInvalid = editableOrder.items.some(item => !item.itemName.trim() || item.quantity <= 0 || item.ratePerItem <= 0);
    if (hasInvalid) {
      toast.error('Please fill all item details correctly (name required, qty and rate > 0)');
      return;
    }

    try {
      // Ensure updatedAt is set to current time
      const updatedOrderData = {
        ...editableOrder,
        updatedAt: new Date()
      };

      await orderService.updateOrder(orderId, updatedOrderData);

      // Update the rate per item in the items database for each item
      const allItems = await itemService.getAllItems();
      for (const orderItem of editableOrder.items) {
        const matchingItem = allItems.find(item =>
          item.itemName?.toLowerCase() === orderItem.itemName?.toLowerCase()
        );
        if (matchingItem) {
          await itemService.updateItem(matchingItem.category, matchingItem.id, {
            ratePerItem: orderItem.ratePerItem,
            quantity: matchingItem.quantity  // Keep existing quantity
          });
        }
      }

      toast.success('Order updated successfully');

      // Small delay to ensure Firestore has processed the update
      await new Promise(resolve => setTimeout(resolve, 500));

      await fetchOrder();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.error('Error printing:', error);
      toast.error('Failed to print order');
    }
  };

  if (!isOpen || !orderId) return null;

  return (
    <div ref={modalRef} className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-500">Order #{order?.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full mb-3 inline-block">
                  <FiPackage className="text-white animate-pulse" size={24} />
                </div>
                <p className="text-gray-600 font-medium">Loading order details...</p>
              </div>
            </div>
          ) : order ? (
            <>
              {/* Order Header */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Number</p>
                    <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-lg text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">User</p>
                    <p className="text-lg text-gray-900">{order.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {!(userRole === 'superadmin' && isEditing) && (
              <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiPackage className="mr-2" size={20} />
                Order Items ({order.items?.length || 0})
              </h3>
                {order.items && order.items.length > 0 ? (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rate</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatCurrency(item.ratePerItem || 0)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(item.totalPrice || (item.ratePerItem * item.quantity))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="block lg:hidden space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                          <h4 className="font-medium text-gray-900">{item.itemName}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-2">
                            <div>Qty: {item.quantity}</div>
                            <div>Rate: {formatCurrency(item.ratePerItem)}</div>
                            <div>Total: {formatCurrency(item.totalPrice)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No items in this order.</p>
                )}
              </div>
              )}

              {/* Total */}
              {!(userRole === 'superadmin' && isEditing) && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(order.total || order.items.reduce((sum, item) => sum + (item.ratePerItem * item.quantity), 0))}</span>
                </div>
              </div>
              )}

                {userRole === 'superadmin' && isEditing && isOrderEditable && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiEdit2 className="mr-2 text-yellow-600" size={20} />
                  Edit Order Items
                </h3>

                {/* Desktop Editable Table */}
                <div className="hidden lg:block overflow-x-auto mb-4">
                  <table className="w-full">
                    <thead className="bg-yellow-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rate per Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date Modified</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {editableOrder.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.itemName || ''}
                          onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                          className="input input-bordered w-full max-w-xs text-sm"
                          placeholder="Item name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity || 0}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="input input-bordered w-20 text-sm"
                          min="0"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.ratePerItem || 0}
                          onChange={(e) => updateItem(index, 'ratePerItem', e.target.value)}
                          className="input input-bordered w-24 text-sm"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="datetime-local"
                          value={item.dateModified || new Date().toISOString().slice(0, 16)}
                          onChange={(e) => updateItem(index, 'dateModified', e.target.value)}
                          className="input input-bordered w-40 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.totalPrice)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="btn btn-error btn-sm text-white"
                          title="Remove item"
                        >
                          <FiMinus size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                      <tr>
                        <td colSpan="6" className="px-4 py-3 bg-gray-50">
                          <button
                            onClick={addItem}
                            className="btn btn-primary btn-sm flex items-center space-x-2"
                          >
                            <FiPlus size={14} />
                            <span>Add New Item</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Editable Cards */}
                <div className="lg:hidden space-y-4 mb-4">
                  {editableOrder.items.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                          type="text"
                          value={item.itemName || ''}
                          onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                          className="input input-bordered w-full"
                          placeholder="Item name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity || 0}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="input input-bordered w-full"
                            min="0"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                          <input
                            type="number"
                            value={item.ratePerItem || 0}
                            onChange={(e) => updateItem(index, 'ratePerItem', e.target.value)}
                            className="input input-bordered w-full"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Modified</label>
                        <input
                          type="datetime-local"
                          value={item.dateModified || new Date().toISOString().slice(0, 16)}
                          onChange={(e) => updateItem(index, 'dateModified', e.target.value)}
                          className="input input-bordered w-full"
                        />
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-900">Total: {formatCurrency(item.totalPrice)}</span>
                        <button
                          onClick={() => removeItem(index)}
                          className="btn btn-error btn-sm"
                        >
                          <FiMinus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addItem}
                    className="btn btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <FiPlus size={16} />
                    <span>Add New Item</span>
                  </button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Updated Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(editableOrder.total)}</span>
                  </div>
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t border-yellow-200">
                  <button
                    onClick={handleSubmit}
                    className="btn btn-success flex items-center space-x-2"
                    disabled={editableOrder.items.length === 0 || editableOrder.items.some(item => !item.itemName.trim() || item.quantity <= 0 || item.ratePerItem <= 0)}
                  >
                    <FiSave size={16} />
                    <span>Submit Changes</span>
                  </button>
                </div>
              </div>
              )}

              {/* Update Status & Notes - For admin and superadmin */}
              {(userRole === 'admin' || userRole === 'superadmin') && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status & Notes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="select select-bordered w-full"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={handleNotesUpdate}
                        className="textarea textarea-bordered w-full"
                        placeholder="Add notes..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handlePrint}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <FiPrinter size={16} />
                  <span>Print</span>
                </button>
                {userRole === 'superadmin' && isOrderEditable && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-ghost flex items-center space-x-2"
                  >
                    <FiEdit2 size={16} />
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                )}
                <button onClick={onClose} className="btn btn-ghost">Close</button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Order not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
