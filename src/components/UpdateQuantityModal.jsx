import { useState } from "react";

export default function UpdateQuantityModal({ item, onClose, onSave }) {
  const [action, setAction] = useState("add");
  const [amount, setAmount] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();

    let newQty = item.quantity;

    if (action === "add") {
      newQty = item.quantity + amount;
    } else {
      if (item.quantity - amount < 0) {
        alert("Quantity cannot go below 0");
        return;
      }
      newQty = item.quantity - amount;
    }

    onSave(item.id, newQty);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Update Quantity for {item.name}</h3>
        <form onSubmit={handleSubmit}>
          <p className="mb-2">Current Quantity: {item.quantity}</p>

          <div className="flex gap-4 mb-3">
            <label>
              <input
                type="radio"
                value="add"
                checked={action === "add"}
                onChange={() => setAction("add")}
              />{" "}
              Add
            </label>
            <label>
              <input
                type="radio"
                value="subtract"
                checked={action === "subtract"}
                onChange={() => setAction("subtract")}
              />{" "}
              Subtract
            </label>
          </div>

          <input
            type="number"
            min="1"
            className="input input-bordered w-full mb-3"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 1)}
            required
          />

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
