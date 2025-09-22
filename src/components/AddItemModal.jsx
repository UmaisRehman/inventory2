import { useState } from "react";

export default function AddItemModal({ onClose, onSave }) {
  const [item, setItem] = useState({ name: "", quantity: 0, rate: 0 });

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...item, quantity: parseInt(item.quantity), rate: parseFloat(item.rate) });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add New Item</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            className="input input-bordered w-full mb-3"
            value={item.name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            className="input input-bordered w-full mb-3"
            value={item.quantity}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="rate"
            placeholder="Rate per item"
            className="input input-bordered w-full mb-3"
            value={item.rate}
            onChange={handleChange}
            required
          />
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
