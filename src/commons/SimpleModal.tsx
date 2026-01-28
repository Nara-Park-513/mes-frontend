import React from "react";

type SimpleModalProps = {
  open: boolean;
  message: string;
  onClose: () => void;
};

const SimpleModal = ({ open, message, onClose }: SimpleModalProps) => {
  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <p style={text}>{message}</p>
        <button style={button} onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default SimpleModal;

/* ===== 스타일 (최소) ===== */
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: "#FFFFFF",
  padding: "24px",
  borderRadius: "10px",
  minWidth: "280px",
  textAlign: "center",
};

const text: React.CSSProperties = {
  marginBottom: "16px",
  fontSize: "15px",
};

const button: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: "6px",
  border: "none",
  background: "#2563EB",
  color: "#fff",
  cursor: "pointer",
};