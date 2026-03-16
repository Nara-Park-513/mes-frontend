import React, { useEffect } from "react";

type SimpleModalProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  mode?: "alert" | "confirm";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
};

const SimpleModal = ({
  open,
  message,
  onClose,
  mode = "alert",
  onConfirm,
  confirmText = "확인",
  cancelText = "취소",
}: SimpleModalProps) => {
  useEffect(() => {
    if (!open || mode !== "alert") return;

    const timer = setTimeout(() => {
      onClose();
    }, 1800);

    return () => clearTimeout(timer);
  }, [open, mode, onClose]);

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={toast}>
        <p style={text}>{message}</p>

        {mode === "confirm" && (
          <div style={buttonRow}>
            <button style={cancelButton} onClick={onClose}>
              {cancelText}
            </button>
            <button
              style={confirmButton}
              onClick={() => {
                onConfirm?.();
              }}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleModal;

const overlay: React.CSSProperties = {
  position: "fixed",
  top: 20,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  zIndex: 2000,
  pointerEvents: "none",
};

const toast: React.CSSProperties = {
  minWidth: "280px",
  maxWidth: "440px",
  background: "rgba(255, 255, 255, 0.96)",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  padding: "12px 16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  backdropFilter: "blur(8px)",
  textAlign: "center",
  pointerEvents: "auto",
};

const text: React.CSSProperties = {
  margin: 0,
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: 1.4,
  color: "#374151",
  whiteSpace: "pre-line",
};

const buttonRow: React.CSSProperties = {
  marginTop: "12px",
  display: "flex",
  justifyContent: "center",
  gap: "8px",
};

const cancelButton: React.CSSProperties = {
  height: "34px",
  minWidth: "72px",
  borderRadius: "8px",
  border: "1px solid #D1D5DB",
  background: "#FFFFFF",
  color: "#374151",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  padding: "0 14px",
};

const confirmButton: React.CSSProperties = {
  height: "34px",
  minWidth: "72px",
  borderRadius: "8px",
  border: "none",
  background: "#4F6EDB",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  padding: "0 14px",
};