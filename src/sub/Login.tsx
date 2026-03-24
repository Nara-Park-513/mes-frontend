import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as S from "../styled/Login.styles";
import "@fortawesome/fontawesome-free/css/all.min.css";
import SimpleModal from "../commons/SimpleModal";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const navigateTimerRef = useRef<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (navigateTimerRef.current) {
        window.clearTimeout(navigateTimerRef.current);
      }
    };
  }, []);

  const showModal = (message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (navigateTimerRef.current) {
      window.clearTimeout(navigateTimerRef.current);
      navigateTimerRef.current = null;
    }

    if (!email || !password) {
      showModal("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:9500/members/login", {
        email,
        password,
      });

      const token = res.data?.token;

      if (!token) {
        console.log("login response:", res.data);
        showModal("로그인 응답에 token이 없습니다.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("lastName", res.data.lastName);
      localStorage.setItem("firstName", res.data.firstName);

      window.dispatchEvent(new Event("storage"));

      showModal(`${res.data.lastName}${res.data.firstName}님, 환영합니다!`);

      navigateTimerRef.current = window.setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 1800);
    } catch (err) {
      console.error(err);
      showModal("로그인 실패! 이메일 또는 비밀번호를 확인해 주세요.");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:9500/oauth2/authorization/google";
  };

  return (
    <>
      <S.Wrapper>
        <S.Card>
          <S.Right>
            <S.Title>Welcome Back!</S.Title>

            <S.Form onSubmit={handleSubmit}>
              <S.Input
                type="email"
                placeholder="Enter Email Address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <S.Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <S.CheckboxWrapper>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Save ID</label>
              </S.CheckboxWrapper>

              <S.Button type="submit">Login</S.Button>

              <S.Divider />

              <S.SocialButton
                variant="google"
                type="button"
                onClick={handleGoogleLogin}
              >
                Company Account Login
              </S.SocialButton>

              <S.SocialButton variant="facebook" type="button">
                Enterprise SSO
              </S.SocialButton>

              <S.SocialButton variant="instagram" type="button">
                Internal System Login
              </S.SocialButton>
            </S.Form>

            <S.BottomLinks>
              <S.LinkText href="/forgot">Forgot Password?</S.LinkText>
              <S.LinkText href="/member">Create an Account!</S.LinkText>
            </S.BottomLinks>
          </S.Right>
        </S.Card>
      </S.Wrapper>

      <SimpleModal
        open={isModalOpen}
        message={modalMessage}
        onClose={handleModalClose}
      />
    </>
  );
};

export default Login;