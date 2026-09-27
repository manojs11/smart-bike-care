import "./LogoutConfirm.css";

function LogoutConfirm({
  isOpen,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="logout-modal-overlay"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="logout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="logout-modal-icon">
          ↪
        </div>

        <h2 id="logout-modal-title">
          Logout?
        </h2>

        <p>
          Are you sure you want to logout from
          Smart Bike Care?
        </p>

        <div className="logout-modal-actions">
          <button
            type="button"
            className="logout-cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="logout-confirm-button"
            onClick={onConfirm}
          >
            Confirm Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirm;