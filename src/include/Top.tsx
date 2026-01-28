import { useEffect, useState, useRef } from "react";
import { useNavigate} from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import TopSearch from "./TopSearch";

axios.defaults.withCredentials = true; // 세션 쿠키 포함

// ✅ styled-components로 "기존 클래스 스타일을 덮어쓰기/보강" (구조는 그대로)
const TopbarWrap = styled.div`
  /* topbar 기본 */
  .topbar {
    height: 4.375rem;
    display: flex;
    align-items: center;
  }

  /* navbar 기본 여백/정렬 */
  .navbar-nav {
    align-items: center;
  }

  /* 검색박스 */
  .navbar-search .form-control {
    height: 2.4rem;
  }

  /* 작은 화면에서 아이콘 버튼 */
  #sidebarToggleTop {
    outline: none;
  }

  /* 드롭다운 리스트 넓이 */
  .dropdown-list {
    width: 20rem;
  }

  /* 프로필 이미지 */
  .img-profile {
    width: 2rem;
    height: 2rem;
    object-fit: cover;
  }

  /* 뱃지(알림/메시지) 위치 살짝 보정 */
  .badge-counter {
    transform: translate(35%, -35%);
    font-size: 0.65rem;
  }

  /* 드롭다운 버튼(Logout) - button인데 a처럼 보이게 */
  .dropdown-item {
    width: 100%;
    text-align: left;
  }

  button.dropdown-item {
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  button.dropdown-item:active {
    transform: translateY(0.5px);
  }
`;

const Top = () => {
// Top 컴포넌트 안쪽에 추가

const topSearchWrapRef = useRef<HTMLDivElement | null>(null);

const onSearchSubmitCapture = (e: React.FormEvent) => {
  // TopSearch의 form submit을 부모에서 가로채서 결과 페이지로 이동
  const form = e.target as HTMLFormElement;

  // TopSearch form인지 확인(안전)
  if (!form?.classList?.contains("navbar-search")) return;

  e.preventDefault(); // TopSearch의 doSearch(ajax) 대신 페이지 이동

  const input = form.querySelector("input[type='text']") as HTMLInputElement | null;
  const select = form.querySelector("select") as HTMLSelectElement | null;

  const keyword = input?.value?.trim() || "";
  const type = (select?.value || "all").trim();

  if (!keyword) return;

  navigate(`/search?q=${encodeURIComponent(keyword)}&type=${encodeURIComponent(type)}`);
};



  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");

  const loadName = () => {
    const lastName = localStorage.getItem("lastName") || "";
    const firstName = localStorage.getItem("firstName") || "";
    setFullName(lastName || firstName ? `${lastName}${firstName}` : "");
  };

  useEffect(() => {
    loadName();
    window.addEventListener("storage", loadName);
    return () => window.removeEventListener("storage", loadName);
  }, []);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:9500/members/logout");
    } catch (error) {
      console.error("로그아웃 실패", error);
    } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("lastName");
    localStorage.removeItem("firstName");
      navigate("/", { replace: true });
    }
  };

  return (
    <TopbarWrap>
      {/* Topbar */}
      <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
        {/* Sidebar Toggle (Topbar) */}
        <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
          <i className="fa fa-bars"></i>
        </button>

<div ref={topSearchWrapRef} onSubmitCapture={onSearchSubmitCapture}>
  <TopSearch />
</div>

        {/* Topbar Navbar */}
        <ul className="navbar-nav ml-auto">
          {/* Nav Item - Search Dropdown (Visible Only XS) */}
          <li className="nav-item dropdown no-arrow d-sm-none">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="searchDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="fas fa-search fa-fw"></i>
            </a>

            {/* Dropdown - Messages */}
            <div className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in" aria-labelledby="searchDropdown">
              <form className="form-inline mr-auto w-100 navbar-search">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control bg-light border-0 small"
                    placeholder="Search for..."
                    aria-label="Search"
                    aria-describedby="basic-addon2"
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary" type="button">
                      <i className="fas fa-search fa-sm"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </li>

          {/* Nav Item - User Information */}
          <li className="nav-item dropdown no-arrow">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="userDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span className="mr-2 d-none d-lg-inline text-gray-600 small">{fullName ? fullName : "Guest"}</span>
              <img className="img-profile rounded-circle" src="img/undraw_profile.svg" alt="profile" />
            </a>

            {/* Dropdown - User Information */}
            <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
              <a className="dropdown-item" href="#">
                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                Profile
              </a>
              <a className="dropdown-item" href="#">
                <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                Settings
              </a>
              <a className="dropdown-item" href="#">
                <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                Activity Log
              </a>
              <div className="dropdown-divider"></div>

              <button className="dropdown-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                Logout
              </button>
            </div>
          </li>
        </ul>
      </nav>
      {/* End of Topbar */}
    </TopbarWrap>
  );
};

export default Top;