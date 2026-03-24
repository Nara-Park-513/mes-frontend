import styled from "styled-components";
import { Card, Button } from "react-bootstrap";

/* 전체 컨테이너 */
export const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
  background: #eef2f7;
`;

export const StyledCard = styled(Card)`
  width: 100%;
  max-width: 620px;
  border: none;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%);
  background: #fff;
`;

export const LeftImage = styled.div`
  width: 100%;
  height: 100%;
  background: url("/img/login.jpg") center / cover no-repeat;
`;

export const FormWrapper = styled.div`
  padding: 2.5rem;

  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

export const GenderLabel = styled.label`
  margin-right: 1rem;
  font-weight: 500;
`;

export const AddressGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  input {
    flex: 1;
  }

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

export const AddressButton = styled.button`
  min-width: 110px;
  background-color: #6c757d;
  border: none;
  color: #fff;
  border-radius: 0.35rem;
  padding: 0.75rem 1rem;
  white-space: nowrap;

  &:hover {
    background-color: #5a6268;
  }

  @media (max-width: 576px) {
    width: 100%;
  }
`;

export const SubmitButton = styled(Button)`
  width: 100%;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  font-weight: 600;
`;

export const SocialButton = styled.a<{ bg: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  background-color: ${({ bg }) => bg};
  border-radius: 0.35rem;
  text-decoration: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    opacity: 0.9;
    color: #fff;
    text-decoration: none;
  }
`;

export const FooterLinks = styled.div`
  margin-top: 0.75rem;
  text-align: center;
`;

export const FooterLink = styled.a`
  display: inline-block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #6c757d;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: #495057;
  }
`;