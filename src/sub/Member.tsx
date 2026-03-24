import { useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import { Row, Col, Form } from "react-bootstrap";
import {
  PageContainer,
  StyledCard,
  FormWrapper,
  GenderLabel,
  AddressGroup,
  AddressButton,
  SubmitButton,
  SocialButton,
  FooterLinks,
  FooterLink,
} from "../styled/Member.styles";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGoogle,
  faInstagram,
  faFacebookF,
} from "@fortawesome/free-brands-svg-icons";

// 다음 api 관련
declare global {
  interface Window {
    daum: any;
  }
}

type Gender = "male" | "female" | "other" | "";

interface MemberForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
  gender: Gender;
  companyName: string;
  position: string;
  tel: string;
  address: string;
  detailAddress: string;
}

const BACKEND_BASE_URL = "http://localhost:9500";

const Member = () => {
  const [form, setForm] = useState<MemberForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
    gender: "",
    companyName: "",
    position: "",
    tel: "",
    address: "",
    detailAddress: "",
  });

  const handleGoogleSignup = () => {
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/google`;
  };

  const handleInstaSignup = () => {
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/instagram`;
  };

  const handleFacebookSignup = () => {
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/facebook`;
  };

  const handleKakaoSignup = () => {
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/kakao`;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement & HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, gender: e.target.value as Gender }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (form.password !== form.repeatPassword) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:9500/members/register",
        form
      );
      console.log(response.data);
      alert("회원가입성공");
    } catch (error: any) {
      console.error(error);
      alert("회원가입중 오류가 발생했습니다");
    }
  };

  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.postcode) {
      alert("주소 검색 스크립트 로딩 중 입니다. 잠시후 다시 시도해 주세요");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        const fulladdr = data.address;
        setForm((prev) => ({ ...prev, address: fulladdr }));
      },
    }).open();
  };

  return (
    <PageContainer>
      <script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        async
      ></script>

      <StyledCard>
        <StyledCard.Body className="p-0">
          <FormWrapper>
            <h1 className="h4 text-gray-900 mb-4 text-center">
              Create an Account!
            </h1>

            <Form onSubmit={handleSubmit}>
              <Row className="mb-2">
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="이름"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                  />
                </Col>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="성"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <Form.Control
                type="email"
                className="mb-2"
                placeholder="이메일"
                name="email"
                value={form.email}
                onChange={handleChange}
              />

              <Row className="mb-2">
                <Col sm={6} className="mb-3 mb-sm-0">
                  <Form.Control
                    type="password"
                    placeholder="비밀번호"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </Col>
                <Col sm={6}>
                  <Form.Control
                    type="password"
                    placeholder="비밀번호 확인"
                    name="repeatPassword"
                    value={form.repeatPassword}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <div className="mb-3">
                <GenderLabel>성별 :</GenderLabel>
                <Form.Check
                  inline
                  type="radio"
                  label="남성"
                  name="gender"
                  value="male"
                  checked={form.gender === "male"}
                  onChange={handleGenderChange}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="여성"
                  name="gender"
                  value="female"
                  checked={form.gender === "female"}
                  onChange={handleGenderChange}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="기타"
                  name="gender"
                  value="other"
                  checked={form.gender === "other"}
                  onChange={handleGenderChange}
                />
              </div>

              <Row className="mb-3">
                <Col md={4} className="mb-2 mb-md-0">
                  <Form.Control
                    type="text"
                    placeholder="회사명"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={4} className="mb-2 mb-md-0">
                  <Form.Control
                    type="text"
                    placeholder="직급"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="전화번호"
                    name="tel"
                    value={form.tel}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <AddressGroup>
                <Form.Control
                  type="text"
                  name="address"
                  readOnly
                  value={form.address}
                  placeholder="주소"
                />
                <AddressButton type="button" onClick={handleAddressSearch}>
                  주소검색
                </AddressButton>
              </AddressGroup>

              <Form.Control
                type="text"
                placeholder="상세주소"
                name="detailAddress"
                className="mb-3"
                value={form.detailAddress}
                onChange={handleChange}
              />

              <SubmitButton type="submit">회원가입</SubmitButton>
            </Form>

            <hr />

            <SocialButton
              href="/"
              bg="#db4437"
              onClick={handleGoogleSignup}
            >
              <FontAwesomeIcon icon={faGoogle} />
              Register with Google
            </SocialButton>

            <SocialButton
              href="/"
              bg="#E1306c"
              onClick={handleInstaSignup}
            >
              <FontAwesomeIcon icon={faInstagram} />
              Register with Insta
            </SocialButton>

            <SocialButton
              href="/"
              bg="#1877f2"
              onClick={handleFacebookSignup}
            >
              <FontAwesomeIcon icon={faFacebookF} />
              Register with Facebook
            </SocialButton>

            <SocialButton
              href="/"
              bg="#fee500"
              onClick={handleKakaoSignup}
              style={{ color: "#000" }}
            >
              Register with Kakao
            </SocialButton>

            <FooterLinks>
              <FooterLink href="/forgot">Forgot password?</FooterLink>
            </FooterLinks>
            <FooterLinks>
              <FooterLink href="/login">
                Already have an account? Login!
              </FooterLink>
            </FooterLinks>
          </FormWrapper>
        </StyledCard.Body>
      </StyledCard>
    </PageContainer>
  );
};

export default Member;