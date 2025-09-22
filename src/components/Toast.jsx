export default function Toast({ message, type }) {
  return (
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${type === "success" ? "alert-success" : "alert-error"}`}>
        <span>{message}</span>
      </div>
    </div>
  );
}
