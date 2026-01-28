import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as S from "../styled/Login.styles";
import "@fortawesome/fontawesome-free/css/all.min.css";
import SimpleModal from "../commons/SimpleModal";

const Login = () => {
  // 초기화
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:9500/members/login", {
        email,
        password,
      });

      // ✅ 여기서 백엔드가 토큰을 내려준다고 가정: res.data.token
      const token = res.data?.token;

      if (!token) {
        alert("로그인 응답에 token이 없습니다. 백엔드 응답을 확인하세요!");
        console.log("login response:", res.data);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // ✅ 1) 토큰 저장 (ProtectedRoute가 읽는 키 = "token" 맞춰야 함)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("lastName", res.data.lastName);
      localStorage.setItem("firstName", res.data.firstName);

      window.dispatchEvent(new Event("storage"));


      setIsModalOpen(true);

    } catch (err) {
      console.error(err);
      alert("로그인 실패! 이메일 또는 비밀번호를 확인해 주세요");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // 모달 닫기
    navigate("/admin", { replace: true }); // 메인 페이지로 이동
  };

  const handleGoogleLogin = () => {
  // 백엔드(Spring Boot)의 OAuth2 인증 시작 경로로 이동
  window.location.href = "http://localhost:9500/oauth2/authorization/google";
};

  return (
    <>
    <S.Wrapper>
      <S.Card>
          <S.LeftImage/>
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
                            />{" "}
                            <label htmlFor="remember">
                              Remember Me
                            </label>
                          </S.CheckboxWrapper>

                        <S.Button type="submit">
                          Login
                        </S.Button>

                        <S.Divider/>
                          <S.SocialButton 
                            variant="google" 
                            type="button"  // ⬅️ 중요: submit이 아닌 일반 버튼으로 지정
                            onClick={handleGoogleLogin} // ⬅️ 클릭 이벤트 연결
                          >
                            <i className="fab fa-google"/>
                            Login with Google
                          </S.SocialButton>
                          
                          <S.SocialButton variant="facebook">
                            <i className="fab fa-facebook-f"/>
                            Login with Facebook
                          </S.SocialButton>

                          <S.SocialButton variant="instagram">
                            <i className="fab fa-instagram"/>
                            Login with Instagram
                          </S.SocialButton>

                          
                      </S.Form>

                      <S.Divider/>
                      <S.LinkText href="/forgot">Forgot Password?</S.LinkText>
                      <S.LinkText href="/member">Create an Account!</S.LinkText>
          </S.Right>
      </S.Card>
    </S.Wrapper>
    <SimpleModal 
        open={isModalOpen} 
        message={`${localStorage.getItem("lastName")}${localStorage.getItem("firstName")}님, 환영합니다!`} 
        onClose={handleModalClose} 
      />
    </>
  );
};

export default Login;
