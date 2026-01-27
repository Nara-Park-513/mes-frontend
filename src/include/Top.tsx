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
      localStorage.clear();
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

          {/* Nav Item - Alerts */}
          <li className="nav-item dropdown no-arrow mx-1">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="alertsDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="fas fa-bell fa-fw"></i>
              <span className="badge badge-danger badge-counter">3+</span>
            </a>

            <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="alertsDropdown">
              <h6 className="dropdown-header">Alerts Center</h6>

              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="mr-3">
                  <div className="icon-circle bg-primary">
                    <i className="fas fa-file-alt text-white"></i>
                  </div>
                </div>
                <div>
                  <div className="small text-gray-500">December 12, 2019</div>
                  <span className="font-weight-bold">A new monthly report is ready to download!</span>
                </div>
              </a>

              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="mr-3">
                  <div className="icon-circle bg-success">
                    <i className="fas fa-donate text-white"></i>
                  </div>
                </div>
                <div>
                  <div className="small text-gray-500">December 7, 2019</div>
                  $290.29 has been deposited into your account!
                </div>
              </a>

              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="mr-3">
                  <div className="icon-circle bg-warning">
                    <i className="fas fa-exclamation-triangle text-white"></i>
                  </div>
                </div>
                <div>
                  <div className="small text-gray-500">December 2, 2019</div>
                  Spending Alert: We've noticed unusually high spending for your account.
                </div>
              </a>

              <a className="dropdown-item text-center small text-gray-500" href="#">
                Show All Alerts
              </a>
            </div>
          </li>

          {/* Nav Item - Messages */}
          <li className="nav-item dropdown no-arrow mx-1">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="messagesDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="fas fa-envelope fa-fw"></i>
              <span className="badge badge-danger badge-counter">7</span>
            </a>

            <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="messagesDropdown">
              <h6 className="dropdown-header">Message Center</h6>

              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="dropdown-list-image mr-3">
                  <img className="rounded-circle" src="img/undraw_profile_1.svg" alt="..." />
                  <div className="status-indicator bg-success"></div>
                </div>
                <div className="font-weight-bold">
                  <div className="text-truncate">
                    Hi there! I am wondering if you can help me with a problem I've been having.
                  </div>
                  <div className="small text-gray-500">Emily Fowler · 58m</div>
                </div>
              </a>

              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="dropdown-list-image mr-3">
                  <img className="rounded-circle" src="img/undraw_profile_2.svg" alt="..." />
                  <div className="status-indicator"></div>
                </div>
                <div>
                  <div className="text-truncate">
                    I have the photos that you ordered last month, how would you like them sent to you?
                  </div>
                  <div className="small text-gray-500">Jae Chun · 1d</div>
                </div>
              </a>

              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="dropdown-list-image mr-3">
                  <img className="rounded-circle" src="img/undraw_profile_3.svg" alt="..." />
                  <div className="status-indicator bg-warning"></div>
                </div>
                <div>
                  <div className="text-truncate">
                    Last month's report looks great, I am very happy with the progress so far, keep up the good work!
                  </div>
                  <div className="small text-gray-500">Morgan Alvarez · 2d</div>
                </div>
              </a>

              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="dropdown-list-image mr-3">
                  <img
                    className="rounded-circle"
                    src="https://source.unsplash.com/Mv9hjnEUHR4/60x60"
                    alt="..."
                  />
                  <div className="status-indicator bg-success"></div>
                </div>
                <div>
                  <div className="text-truncate">
                    Am I a good boy? The reason I ask is because someone told me that people say this to all dogs, even if they
                    aren't good...
                  </div>
                  <div className="small text-gray-500">Chicken the Dog · 2w</div>
                </div>
              </a>

              <a className="dropdown-item text-center small text-gray-500" href="#">
                Read More Messages
              </a>
            </div>
          </li>

          <div className="topbar-divider d-none d-sm-block"></div>

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