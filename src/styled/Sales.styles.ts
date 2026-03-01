import styled from "styled-components";

export const Wrapper = styled.div`
width:100%;
display:flex; 
align-items:flex-start;
`;
export const DflexColumn = styled.div`
display:flex;
flex-direction:column;
`;
export const DflexColumn2 = styled.div`
display:flex;
justify-content:space-between;
/* 1. 상단 정렬 강제 */
  align-items: flex-start !important; 
  
  /* 2. 부모(Ctap)의 패딩과 h5의 마진을 무시하고 위로 밀어올림 */
  margin-top: -20px !important; 
  
  /* 3. 내부 요소들이 아래로 처지지 않게 높이 최소화 */
  height: auto;
  padding-top: 0;
`;
export const Content = styled.div`
width:100%;
`;
export const Ctap = styled.div`
  border-top: 1px solid #ccc;
  width: 1660px;
  max-width: 100%;
  height: 90vh; /* 고정 높이는 유지 */
  background-color: white;
  padding: 20px; /* 상단 패딩 제거 */
  margin-top: -24px;
  display: flex;
  flex-direction: column;
`;