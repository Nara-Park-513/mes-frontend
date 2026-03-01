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
  padding: "20px 24px",
  borderRadius: "12px",
  minWidth: "320px",
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
};

const text: React.CSSProperties = {
  marginBottom: "16px",
  fontSize: "15px",
  fontWeight: 500,
  color: "#374151", // 다크 그레이
};

const button: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: "6px",
  border: "none",
  background: "#4F6EDB",
  color: "#fff",
  cursor: "pointer",
};
