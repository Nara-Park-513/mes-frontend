import {useEffect} from "react";
import type {ReactNode} from "react";
//리액트에서 화면에 그릴수 있는 모든것 div,문자열 컴포넌트
import {Navigate, useLocation} from "react-router-dom";
//{이동, 현재주소정보}

//Props 인터페이스 (타입 정의)
interface Props{//이컴포넌트는 children을 받는다
    children: ReactNode;
}

const ProtectedRoute = ({children}:Props) =>{//칠드런을 props로 받음 
//현재 위치정보 가져오기 지금주소가 예시로 admin일때 로그인후 다시 여기로 돌아오게 하려고 사용
const location = useLocation();
const token = localStorage.getItem("token");
/*
로컬스토리지에서 토큰 꺼내기
what? localStorage [브라우저에 저장되는 간단한 저장소 => 로컬스토리지]
로그인 성공시에 보통 localStorage.setItem("token","abc123");
*/
const isValidToken =
!!token && token !== "null" && token !== "undefined" && token.trim() !== "";
//값이 있으면 true 공백만 있는 경우도 로그인 x처리 

    useEffect(() => {//화면이 바뀌거나 값이 변할때 실행되는 코드 여기서 사용이유는
    //토큰이 없을때 한번만 알림을 띄우고 싶어서 useEffect사용
        if(!isValidToken){
            alert("로그인이 필요합니다.");
        }
    },[isValidToken]);//만약 이처리를 안하면 행복한 무한루프에 창을 열때 마다 alert()이 뜬다

    //토큰이 없으면 강제 이동
    if(!isValidToken){
        return<Navigate to="/login" replace state={{from: location}}/>
        /*
        replace 뒤로가기를 눌러도 못돌아옴
        state={{from: location}} 원래 가려던 주소 저장
        */
    }

    return <>{children}</>//토큰이 있으면 정상출력


}
export default ProtectedRoute;