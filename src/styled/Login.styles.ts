import styled from "styled-components";

export const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eef2f7;
  padding: 24px;
  box-sizing: border-box;
`;

export const Card = styled.div`
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

export const LeftImage = styled.div`
  flex: 1;
  background: url("/img/newmes.jpg") center / cover no-repeat;

  @media (max-width: 992px) {
    display: none;
  }
`;

export const Right = styled.div`
  width: 100%;
  padding: 3rem 2.5rem;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 2rem 1.25rem;
  }
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #111827;
  letter-spacing: -0.2px;
  text-align: center;
`;

export const Form = styled.form`
  width: 100%;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
  border-radius: 10rem;
  border: 1px solid #d1d3e2;
  font-size: 0.9rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4e73df;
    box-shadow: 0 0 0 2px rgba(78, 115, 223, 0.15);
  }
`;

export const CheckboxWrapper = styled.div`
  font-size: 0.85rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 10rem;
  border: none;
  background: #4e73df;
  color: #fff;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #2e59d9;
  }
`;

export const Divider = styled.hr`
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid #e5e7eb;
`;

export const SocialButton = styled.button<{ variant?: string }>`
  margin-top: 0.8rem;
  width: 100%;
  padding: 0.7rem 1.2rem;
  border-radius: 10rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-sizing: border-box;

  background: ${({ variant }) => {
    switch (variant) {
      case "google":
        return "#FFFFFF";
      case "facebook":
        return "#1F7AE0";
      case "instagram":
        return "#2F3A4A";
      default:
        return "#4F6EDB";
    }
  }};

  color: ${({ variant }) => (variant === "google" ? "#2F3A4A" : "#ffffff")};
  border: ${({ variant }) =>
    variant === "google" ? "1px solid #D0D5DD" : "none"};

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  i {
    font-size: 1rem;
  }

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }
`;

export const LinkText = styled.a`
  display: block;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
  text-decoration: none;

  &:hover {
    background: #f3f4f6;
  }
`;

export const BottomLinks = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;