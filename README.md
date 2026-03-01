# MES Frontend

MES(Manufacturing Execution System) 프론트엔드 애플리케이션입니다.  
React + TypeScript + Vite 기반으로 구성된, 생산 현장 및 작업 흐름 UI 개발용 프로젝트입니다.

---

## 📌 프로젝트 소개

- MES 시스템 UI 기본 구조 구성
- 생산/작업 관련 화면 구현 준비
- Frontend 템플릿 및 페이지 구성 기반

---

## 🛠️ 기술 스택

### Frontend
- React
- TypeScript
- Vite
- SCSS / CSS

### Dev Tools
- Git
- GitHub
- VS Code / IntelliJ
- ESLint 설정

---

## 📁 파일/폴더 구조 예시


mes-frontend
┣ public
┣ src
┃ ┣ assets
┃ ┣ components
┃ ┃ ┗ (UI 컴포넌트)
┃ ┣ pages
┃ ┃ ┗ (페이지 컴포넌트)
┃ ┣ App.tsx
┃ ┣ main.tsx
┃ ┗ ...
┣ .gitignore
┣ package.json
┣ tsconfig.json
┗ vite.config.ts


---

## 🚀 로컬 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/Nara-Park-513/mes-frontend.git
cd mes-frontend
2. 의존성 설치
npm install
3. 개발 서버 실행
npm run dev

브라우저에서 다음 주소로 확인하세요:

http://localhost:5173
📌 기능 로드맵 (향후 예정)

생산/작업 흐름 화면(Orders, Work, Report 등) 구현

사용자 인증 및 보호 라우팅 연동

API 연동을 위한 서비스 모듈 작성

공통 레이아웃 및 UI 컴포넌트 개선

📜 License

본 프로젝트는 포트폴리오 및 학습 목적의 프로젝트입니다.