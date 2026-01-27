import {Sidebar,Brand,BrandText,Divider,SidebarCard } from "../styled/Component.styles";

const Lnb = () => {
  return (
    <>
      {/* Sidebar */}
      <Sidebar
        className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
        id="accordionSidebar"
      >
        {/* Sidebar - Brand */}
        <Brand
          className="sidebar-brand d-flex align-items-center justify-content-center"
          href="/"
        >
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink" />
          </div>

          <BrandText className="sidebar-brand-text mx-3 mt-5">
            &nbsp;MES<sup>sea2</sup>
          </BrandText>
        </Brand>

        {/* Divider */}
        <Divider className="sidebar-divider my-0" />

        {/* Nav Item - Dashboard */}
        <li className="nav-item active">
          <a className="nav-link" href="/">
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

        <Divider className="sidebar-divider d-none d-md-block" />

        {/* Sidebar Toggler */}
        <div className="text-center d-none d-md-inline">
          <button className="rounded-circle border-0" id="sidebarToggle" />
        </div>

        {/* Sidebar Message */}
        <SidebarCard className="sidebar-card d-none d-lg-flex">
          <img
            className="sidebar-card-illustration mb-2"
            src="img/undraw_rocket.svg"
            alt="..."
          />
          <p className="text-center mb-2">
            <strong></strong>
            Is Next
          </p>
          <a className="btn btn-success btn-sm" href="#">
            MES
          </a>
        </SidebarCard>
      </Sidebar>
      {/* End of Sidebar */}
    </>
  );
};

export default Lnb;