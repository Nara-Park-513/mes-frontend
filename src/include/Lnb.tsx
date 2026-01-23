const Lnb = () => {
    return(
<>
 {/*  Sidebar */}
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

            {/*  Sidebar - Brand */}
            <a className="sidebar-brand d-flex align-items-center justify-content-center" href="index.html">
                    <div className="sidebar-brand-icon rotate-n-15">
                        <i className="fas fa-laugh-wink"></i>
                    </div>
                    <div className="sidebar-brand-text mx-3 mt-5">
                        &nbsp;MES<sup>sea2</sup>
                    </div>
                </a>

                {/* 위에서 섞여있던 '기준정보 관리'를 별도의 li로 분리 */}
                <li className="nav-item">
                    <a className="nav-link" href="tables.html">
                        <i className="fas fa-fw fa-table"></i>
                        <span>기준정보 관리</span>
                    </a>
                </li>


            {/*  Divider */}
            <hr className="sidebar-divider my-0"/>

            {/*  Nav Item - Dashboard */}
            <li className="nav-item active">
                <a className="nav-link" href="index.html">
                    <i className="fas fa-fw fa-tachometer-alt"></i>
                    <span>MES Dashboard</span></a>
            </li>

            {/*  Divider */}
            <hr className="sidebar-divider"/>

            {/*  Heading */}
            {/*<div className="sidebar-heading">
                Interface
            </div>*/}

            {/*  Nav Item - Pages Collapse Menu */}
            <li className="nav-item">
                <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseTwo"
                    aria-expanded="true" aria-controls="collapseTwo">
                    <i className="fas fa-fw fa-cog"></i>
                    <span>영업관리</span>
                </a>
                <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionSidebar">
                    <div className="bg-white py-2 collapse-inner rounded">
                        <h6 className="collapse-header">영업관리</h6>
                        <a className="collapse-item" href="/sales">영업관리로 이동</a>
                        {/*<a className="collapse-item" href="/">Cards</a>*/}
                    </div>
                </div>
            </li>

            {/*  Nav Item - Utilities Collapse Menu */}
            <li className="nav-item">
                <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseUtilities"
                    aria-expanded="true" aria-controls="collapseUtilities">
                    <i className="fas fa-fw fa-wrench"></i>
                    <span>생산관리</span>
                </a>
                <div id="collapseUtilities" className="collapse" aria-labelledby="headingUtilities"
                    data-parent="#accordionSidebar">
                    <div className="bg-white py-2 collapse-inner rounded">
                        <h6 className="collapse-header">생산관리</h6>
                        <a className="collapse-item" href="/pmanagement">생산관리 이동</a>
                 </div>       
                </div>
            </li>

            {/*  Divider */}
            <hr className="sidebar-divider"/>

            {/*  Heading */}
            {/*<div className="sidebar-heading">
                Addons
            </div>*/}

            {/*  Nav Item - Pages Collapse Menu */}
            <li className="nav-item">
                <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapsePages"
                    aria-expanded="true" aria-controls="collapsePages">
                    <i className="fas fa-fw fa-folder"></i>
                    <span>구매자제관리</span>
                </a>
                <div id="collapsePages" className="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">
                    <div className="bg-white py-2 collapse-inner rounded">
                        <h6 className="collapse-header">구매자제관리</h6>
                        <a className="collapse-item" href="/pm">구매자제관리 이동</a>
                        {/*<a className="collapse-item" href="register.html">Register</a>
                        <a className="collapse-item" href="forgot-password.html">Forgot Password</a>*/}
                        <div className="collapse-divider"></div>
                        {/*<h6 className="collapse-header">Other Pages:</h6>
                        <a className="collapse-item" href="404.html">404 Page</a>
                        <a className="collapse-item" href="blank.html">Blank Page</a>*/}
                    </div>
                </div>
            </li>

            {/*  Nav Item - Charts */}
            <li className="nav-item">
                <a className="nav-link" href="charts.html">
                    <i className="fas fa-fw fa-chart-area"></i>
                    <span>재고관리</span></a>
            </li>

            {/*  Nav Item - Tables */}
            <li className="nav-item">
                <a className="nav-link" href="tables.html">
                    <i className="fas fa-fw fa-table"></i>
                    <span>KPI 관리</span></a>
            </li>

            <li className="nav-item">
                <a className="nav-link" href="tables.html">
                    <i className="fas fa-fw fa-table"></i>
                    <span>기준정보 관리</span></a>
            </li>

            <li className="nav-item">
                <a className="nav-link" href="tables.html">
                    <i className="fas fa-fw fa-table"></i>
                    <span>시스템 관리</span></a>
            </li>

            {/*  Divider */}
            <hr className="sidebar-divider d-none d-md-block"/>

            {/*  Sidebar Toggler (Sidebar) */}
            <div className="text-center d-none d-md-inline">
                <button className="rounded-circle border-0" id="sidebarToggle"></button>
            </div>

            {/*  Sidebar Message */}
            <div className="sidebar-card d-none d-lg-flex">
                <img className="sidebar-card-illustration mb-2" src="img/undraw_rocket.svg" alt="..."/>
                <p className="text-center mb-2"><strong></strong>
                Is Next
                </p>
                <a className="btn btn-success btn-sm" href="#">MES</a>
            </div>

        </ul>
        {/*  End of Sidebar */}
</>
    );
}
export default Lnb;