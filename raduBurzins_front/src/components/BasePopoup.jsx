import React from "react";

function BasePopup({ title, onClose, children, width = "500px" }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        style={{ maxWidth: width }}
        className="card surface-strong mx-auto w-full max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h3 className="text-lg font-black break-words text-dark-purple sm:text-xl">{title}</h3>}
          </div>
          <button
            onClick={onClose}
            aria-label="Aizvērt"
            className="btn-ghost h-10 w-10 shrink-0 !p-0 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="text-sm text-dark-purple sm:text-base">{children}</div>
      </div>
    </div>
  );
}

export default BasePopup;
