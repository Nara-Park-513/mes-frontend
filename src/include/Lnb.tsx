import { useState } from "react";
import { Sidebar, Brand, BrandText, Divider, SidebarCard } from "../styled/Component.styles";

const Lnb = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${collapsed ? "toggled" : ""}`}
        id="accordionSidebar"
      >
        {/* Sidebar - Brand */}
        <Brand
          className="sidebar-brand d-flex align-items-center justify-content-center"
          href="/"
        >
          <div className="sidebar-brand-icon">
            <i className="fas fa-cog" />
          </div>

          <BrandText className="sidebar-brand-text mx-3">
            SMART MES
          </BrandText>
        </Brand>

        {/* Divider */}
        <Divider className="sidebar-divider my-0" />

        {/* Nav Item - Dashboard */}
        <li className="nav-item">
          <a className="nav-link" href="/admin">
            <i className="fas fa-fw fa-tachometer-alt" />
            <span>MES Dashboard</span>
          </a>
        </li>

        <Divider className="sidebar-divider" />

        {/* Nav Item - 영업관리 Collapse */}
        <li className="nav-item">
          <a
            className="nav-link collapsed"
            href="#"
            data-toggle="collapse"
            data-target="#collapseTwo"
            aria-expanded="true"
            aria-controls="collapseTwo"
          >
            <i className="fas fa-fw fa-cog" />
            <span>영업관리</span>
          </a>

          <div
            id="collapseTwo"
            className="collapse"
            aria-labelledby="headingTwo"
            data-parent="#accordionSidebar"
          >
            <div className="bg-white py-2 collapse-inner rounded">
              <h6 className="collapse-header">영업관리</h6>
              <a className="collapse-item" href="/sales">
                영업관리 이동
              </a>
            </div>
          </div>
        </li>

        {/* Nav Item - 생산관리 Collapse */}
        <li className="nav-item">
          <a
            className="nav-link collapsed"
            href="#"
            data-toggle="collapse"
            data-target="#collapseUtilities"
            aria-expanded="true"
            aria-controls="collapseUtilities"
          >
            <i className="fas fa-fw fa-wrench" />
            <span>생산관리</span>
          </a>

          <div
            id="collapseUtilities"
            className="collapse"
            aria-labelledby="headingUtilities"
            data-parent="#accordionSidebar"
          >
            <div className="bg-white py-2 collapse-inner rounded">
              <h6 className="collapse-header">생산관리</h6>
              <a className="collapse-item" href="/pmanagement">
                생산관리로 이동
              </a>
            </div>
          </div>
        </li>

        <Divider className="sidebar-divider" />

        {/* Nav Item - 구매자제관리 Collapse */}
        <li className="nav-item">
          <a
            className="nav-link collapsed"
            href="#"
            data-toggle="collapse"
            data-target="#collapsePages"
            aria-expanded="true"
            aria-controls="collapsePages"
          >
            <i className="fas fa-fw fa-folder" />
            <span>구매자제관리</span>
          </a>

          <div
            id="collapsePages"
            className="collapse"
            aria-labelledby="headingPages"
            data-parent="#accordionSidebar"
          >
            <div className="bg-white py-2 collapse-inner rounded">
              <h6 className="collapse-header">구매자제관리</h6>
              <a className="collapse-item" href="/pm">
                구매자제관리 이동
              </a>
              <div className="collapse-divider" />
            </div>
          </div>
        </li>

        {/* Nav Item - 재고관리 */}
        <li className="nav-item">
          <a className="nav-link" href="/im">
            <i className="fas fa-fw fa-chart-area" />
            <span>재고관리</span>
          </a>
        </li>

        {/* Nav Item - KPI */}
        <li className="nav-item">
          <a className="nav-link" href="/kpi">
            <i className="fas fa-fw fa-table" />
            <span>KPI 관리</span>
          </a>
        </li>

        {/* Nav Item - 기준정보 */}
        <li className="nav-item">
          <a className="nav-link" href="/standard">
            <i className="fas fa-fw fa-table" />
            <span>기준정보 관리</span>
          </a>
        </li>

        {/* Nav Item - 시스템 */}
        <li className="nav-item">
          <a className="nav-link" href="/system">
            <i className="fas fa-fw fa-table" />
            <span>시스템 관리</span>
          </a>
        </li>

        {/* Nav Item - 품질 */}
        <li className="nav-item">
          <a className="nav-link" href="/quality">
            <i className="fas fa-fw fa-table" />
            <span>품질 관리</span>
          </a>
        </li>

        <Divider className="sidebar-divider d-none d-md-block" />

        {/* Sidebar Toggler */}
        <div className="text-center d-none d-md-inline">
          <button
            type="button"
            className="rounded-circle border-0"
            id="sidebarToggle"
            onClick={() => setCollapsed((prev) => !prev)}
          />
        </div>

        {/* 하단 영역 */}
        {!collapsed ? (
          <SidebarCard className="sidebar-card d-none d-lg-flex">
            <img
              className="sidebar-card-illustration mb-2"
              src="img/undraw_rocket.svg"
              alt="MES"
            />
            <p className="text-center mb-2">MES</p>
            <a className="btng btn-success btn-sm" href="/pmanagement">
              바로가기
            </a>
          </SidebarCard>
        ) : (
          <div
            className="d-none d-lg-flex"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0 24px",
            }}
          >
            <a
              href="/pmanagement"
              title="MES 바로가기"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1cc88a",
                color: "#fff",
                textDecoration: "none",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                fontSize: "18px",
                transition: "all 0.2s ease",
              }}
            >
              <i className="fas fa-play" />
            </a>
          </div>
        )}
      </Sidebar>
      {/* End of Sidebar */}
    </>
  );
};

export default Lnb;