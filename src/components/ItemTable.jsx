export default function ItemTable({ items, onUpdateQuantity }) {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Total</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No items found
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.rate)}</td>
                <td>{formatCurrency(item.quantity * item.rate)}</td>
                <td>{formatDate(item.updatedAt)}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => onUpdateQuantity(item)}>
                    Update Qty
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
