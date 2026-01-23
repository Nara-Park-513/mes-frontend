import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./assets/scss/style.scss";//리액트에 1:1 경로는 ./
import "./assets/css/mes.scss";
//부트스트랩에 기본 베이스 cdn
import 'bootstrap/dist/css/bootstrap.min.css';
/*
타입스크립트는 변수 함수 코드의 타입을 컴파일시점에서 미리 지정하고 검사하여 오류를 잡는다

자바스크립트는 타입이 실행시점에서 결정되는 동적타입

타입스크립트는 자바스크립트의 상위언어 (Superset)
정적타입(static type) 추가해 코드의 안정성과 유지보수성을 높여줌

function add(a, b) {
return a + b
}

but

function add(a: number, b: number):number { 잘못된값 "1", 2
return a + b
}

자바스크립트, 파이선 인터프리터 

컴파일 => 기계어로 번역
const greet = (name: string): string => {
  return `Hello, ${name}!`;
};

var greet = function (name) {
  return "Hello, " + name + "!";
};
*/


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
