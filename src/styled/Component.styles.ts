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

/* ======= 사이드바 색상 ======= */
export const Sidebar = styled.ul`
  min-height: 100vh;
  background: #1f3a5f;   /* MES Admin 메인 컬러 */
  padding: 0;
  margin: 0;

/* ======= Bootstrap nav-link 기본 ======= */
  .nav-link {
    color: #cfd8e3;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
  }

  /* ======= Bootstrap active 메뉴 ======= */
  .nav-item.active > .nav-link {
    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;
  }
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

export const SidebarItem = styled.li<{ active?: boolean }>`
  list-style: none;

  ${({ active }) =>
    active &&
    `
      background: rgba(255, 255, 255, 0.14);
    `}
`;

export const SidebarLink = styled.a`
  display: flex;
  align-items: center;
  padding: 12px 20px;

  color: #cfd8e3;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }
`;
