import styled from "styled-components";

export const Group = styled.div``;
export const Left = styled.div``;
export const Right = styled.div``;
export const Text1 = styled.h1``;
export const Text2 = styled.h2``;
export const Text3 = styled.h3``;
export const Text4 = styled.h4``;
export const Text5 = styled.h5``;
export const Text6 = styled.h6`
font-size:12px; font-weight:400;
letter-spacing:-3%;
`;

export const Span = styled.span`
display:flex;
justify-content:flex-start;
align-items:center;
flex-direction:column;
`;

export const Dflex = styled.div`
display:flex;
justify-content:flex-start;
align-items:center;
`;

export const DflexEnd = styled.div`
display:flex;
justify-content:flex-end;
align-items:center;
`;

export const Center = styled.div`
display:flex;
justify-content:center;
align-items:center;
flex-direction:column;

margin-top: auto; 
  padding: 20px 0;
`;

export const PageTotal = styled.div`
font-size:12px; font-weight:400; color:gray;
`;

export const SpaceBetween = styled.div`
display:flex; justify-content:space-between;
align-items:center;
`;

export const Sidebar = styled.ul`
  /* bootstrap sb-admin 스타일을 쓰고 있으면 대부분 필요 없음 */
  /* 그래도 레이아웃 깨질 때를 대비한 최소 보정만 */
  min-height: 100vh;
`;

export const Brand = styled.a`
  /* 기존 bootstrap 클래스가 대부분 처리하지만, 라인 깨짐 방지 */
  text-decoration: none;
`;

export const BrandText = styled.div`
  /* “MES sea2” 텍스트 영역 정렬 보정 */
  line-height: 1.2;
  white-space: nowrap;
`;

export const Divider = styled.hr``;

export const SidebarCard = styled.div`
  /* 카드 영역이 레이아웃 밀면 여기를 조절 */
`;