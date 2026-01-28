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

/* ===== 스타일 수정 (작은 정사각형 버전) ===== */
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.3)", // 배경을 좀 더 투명하게 해서 가볍게 만듦
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start", // 최상단 배치
  zIndex: 1100,
};

const modal: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "12px",
  
  /* ✅ 조그만 정사각형 크기 (200x200) */
  width: "200px", 
  height: "200px", 
  
  /* ✅ 내부 정렬 */
  display: "flex",
  flexDirection: "column",
  justifyContent: "center", // 세로 중앙
  alignItems: "center",     // 가로 중앙
  padding: "20px",

  /* ✅ 위치: 상단에서 40px 내려오기 */
  marginTop: "40px", 
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  border: "1px solid #eee", // 작은 크기에 맞게 깔끔한 테두리 추가
};

const text: React.CSSProperties = {
  marginBottom: "20px",
  fontSize: "14px", // 박스가 작으니 글자도 적당히 줄임
  fontWeight: "500",
  textAlign: "center",
  lineHeight: "1.4",
  wordBreak: "keep-all",
};

const button: React.CSSProperties = {
  padding: "6px 16px",
  borderRadius: "5px",
  border: "none",
  background: "#2563EB",
  color: "#fff",
  fontSize: "13px",
  fontWeight: "bold",
  cursor: "pointer",
};