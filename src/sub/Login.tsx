import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as S from "../styled/Login.styles";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Login = () => {
  // 초기화
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

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

      // ✅ 1) 토큰 저장 (ProtectedRoute가 읽는 키 = "token" 맞춰야 함)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("lastName", res.data.lastName);
      localStorage.setItem("firstName", res.data.firstName);

      window.dispatchEvent(new Event("storage"));


      alert("로그인 성공");

      // ✅ 2) window.location.href 말고 SPA 라우팅으로 이동
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(err);
      alert("로그인 실패! 이메일 또는 비밀번호를 확인해 주세요");
    }
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
                            />{" "}
                            <label htmlFor="remember">
                              Remember Me
                            </label>
                          </S.CheckboxWrapper>

                        <S.Button type="submit">
                          Login
                        </S.Button>

                        <S.Divider/>
                          <S.SocialButton variant="google">
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
    </>
  );
};

export default Login;
