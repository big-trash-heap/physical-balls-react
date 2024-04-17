import React from "react";
import "./Modal.css";

type ModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const handleClickOutside = (
    _event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    onClose?.();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleClickOutside}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div>{children}</div>
      </div>
    </div>
  );
};
