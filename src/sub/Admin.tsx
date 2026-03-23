import React, { useEffect, useMemo, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { useLocation, useNavigate } from "react-router-dom";

interface ProgressBarProps {
  value: number;
  min?: number;
  max?: number;
  color?: "primary" | "success" | "danger" | "warning" | "info";
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  min = 0,
  max = 100,
  color = "primary",
}) => {
  const safeValue = Math.min(Math.max(value, min), max);

  return (
    <div className="progress" style={{ height: "8px" }}>
      <div
        className={`progress-bar bg-${color}`}
        style={{ width: `${safeValue}%` }}
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={min}
        aria-valuemax={max}
      />
    </div>
  );
};

interface SummaryCard {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "success" | "info" | "warning" | "danger";
  subText?: string;
}

interface OrderItem {
  orderNo: string;
  customerName: string;
  status: "대기" | "진행중" | "조립중" | "완료" | "지연";
  amount: number;
  dueDate: string;
}

interface StockItem {
  itemName: string;
  currentQty: number;
  safeQty: number;
  status: "정상" | "부족" | "위험";
}

interface ApprovalItem {
  title: string;
  requester: string;
  type: string;
  createdAt: string;
  status: "대기" | "승인" | "반려";
}

interface DashboardData {
  summary: {
    todayProduction: number;
    activeWorkOrders: number;
    lowMaterialCount: number;
    maintenanceCount: number;
    urgentShipmentCount: number;
    workProgressRate: number;
  };
  recentOrders: OrderItem[];
  lowStockItems: StockItem[];
  pendingApprovalList: ApprovalItem[];
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(value);

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "완료":
    case "승인":
    case "정상":
      return "success";
    case "진행중":
    case "대기":
      return "primary";
    case "조립중":
      return "info";
    case "부족":
      return "warning";
    case "위험":
    case "지연":
    case "반려":
      return "danger";
    default:
      return "secondary";
  }
};

const getPercent = (value: number, maxValue: number) => {
  if (maxValue <= 0) return 0;
  return Math.round((value / maxValue) * 100);
};

const mockDashboardData: DashboardData = {
  summary: {
    todayProduction: 128,
    activeWorkOrders: 24,
    lowMaterialCount: 7,
    maintenanceCount: 3,
    urgentShipmentCount: 4,
    workProgressRate: 68,
  },
  recentOrders: [
    {
      orderNo: "WO-2026-031",
      customerName: "AIRA Robotics",
      status: "진행중",
      amount: 12,
      dueDate: "2026-03-25",
    },
    {
      orderNo: "WO-2026-032",
      customerName: "Neo Factory",
      status: "대기",
      amount: 8,
      dueDate: "2026-03-27",
    },
    {
      orderNo: "WO-2026-033",
      customerName: "Vision Dynamics",
      status: "조립중",
      amount: 15,
      dueDate: "2026-03-24",
    },
    {
      orderNo: "WO-2026-034",
      customerName: "Smart Motion",
      status: "지연",
      amount: 6,
      dueDate: "2026-03-21",
    },
    {
      orderNo: "WO-2026-035",
      customerName: "Future Botics",
      status: "완료",
      amount: 11,
      dueDate: "2026-03-20",
    },
  ],
  lowStockItems: [
    { itemName: "서보 모터", currentQty: 18, safeQty: 50, status: "위험" },
    { itemName: "메인 제어보드", currentQty: 42, safeQty: 60, status: "부족" },
    { itemName: "LiDAR 센서", currentQty: 12, safeQty: 25, status: "위험" },
    { itemName: "배선 하네스", currentQty: 75, safeQty: 80, status: "부족" },
  ],
  pendingApprovalList: [
    {
      title: "로봇 암 조립 작업 승인",
      requester: "생산팀 김민수",
      type: "생산",
      createdAt: "2026-03-22",
      status: "대기",
    },
    {
      title: "센서 모듈 자재 요청",
      requester: "자재팀 박지훈",
      type: "자재",
      createdAt: "2026-03-22",
      status: "대기",
    },
    {
      title: "설비 정기 점검 요청",
      requester: "설비팀 이수진",
      type: "설비",
      createdAt: "2026-03-23",
      status: "대기",
    },
  ],
};

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dashboardData] = useState<DashboardData>(mockDashboardData);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/admin", { replace: true });
    }
  }, [location, navigate]);

  const summaryCards: SummaryCard[] = useMemo(
    () => [
      {
        title: "오늘 생산 실적",
        value: `${formatNumber(dashboardData.summary.todayProduction)}대`,
        icon: "fas fa-robot",
        color: "primary",
        subText: "금일 생산 완료 기준",
      },
      {
        title: "진행 중 작업지시",
        value: `${dashboardData.summary.activeWorkOrders}건`,
        icon: "fas fa-cogs",
        color: "success",
        subText: "현재 생산 라인 작업",
      },
      {
        title: "안전재고 이하 자재",
        value: `${dashboardData.summary.lowMaterialCount}건`,
        icon: "fas fa-microchip",
        color: "danger",
        subText: "즉시 확인 필요",
      },
      {
        title: "점검 필요 설비",
        value: `${dashboardData.summary.maintenanceCount}건`,
        icon: "fas fa-tools",
        color: "warning",
        subText: "정기 점검 및 이상 감지",
      },
    ],
    [dashboardData]
  );

  const checkPointData = useMemo(
    () => [
      {
        label: "안전재고 이하 자재",
        count: dashboardData.summary.lowMaterialCount,
        color: "danger" as const,
      },
      {
        label: "점검 필요 설비",
        count: dashboardData.summary.maintenanceCount,
        color: "warning" as const,
      },
      {
        label: "진행 중 작업지시",
        count: dashboardData.summary.activeWorkOrders,
        color: "primary" as const,
      },
      {
        label: "긴급 출고 예정",
        count: dashboardData.summary.urgentShipmentCount,
        color: "info" as const,
      },
    ],
    [dashboardData]
  );

  const maxCheckPointCount = Math.max(
    ...checkPointData.map((item) => item.count),
    1
  );

  return (
    <>
      <div id="wrapper">
        <Lnb />

        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <Top />

            <div className="container-fluid">
              <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <div>
                  <h1 className="h3 mb-1 text-gray-800">MES 운영 대시보드</h1>
                  <p className="mb-0 text-muted">
                    생산, 자재, 재고, 주문 데이터를 통합 모니터링합니다.
                  </p>
                </div>

                <button
                  type="button"
                  className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"
                  onClick={() => navigate("/18_order/orderProgress")}
                >
                  <i className="fas fa-arrow-right fa-sm text-white-50 mr-2"></i>
                  작업 현황 바로가기
                </button>
              </div>

              <div className="row">
                {summaryCards.map((card) => (
                  <div className="col-xl-3 col-md-6 mb-4" key={card.title}>
                    <div
                      className={`card border-left-${card.color} shadow h-100 py-2`}
                    >
                      <div className="card-body">
                        <div className="row no-gutters align-items-center">
                          <div className="col mr-2">
                            <div
                              className={`text-xs font-weight-bold text-${card.color} text-uppercase mb-1`}
                            >
                              {card.title}
                            </div>
                            <div className="h5 mb-1 font-weight-bold text-gray-800">
                              {card.value}
                            </div>
                            {card.subText && (
                              <div className="small text-muted">
                                {card.subText}
                              </div>
                            )}
                          </div>
                          <div className="col-auto">
                            <i
                              className={`${card.icon} fa-2x text-gray-300`}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row">
                <div className="col-xl-8 col-lg-7">
                  <div className="card shadow mb-4">
                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                      <h6 className="m-0 font-weight-bold text-primary">
                        생산 라인 진행률
                      </h6>
                      <span className="badge badge-info px-3 py-2">
                        {dashboardData.summary.workProgressRate}%
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between small mb-2">
                          <span>전체 작업지시 처리 현황</span>
                          <span>{dashboardData.summary.workProgressRate}%</span>
                        </div>
                        <ProgressBar
                          value={dashboardData.summary.workProgressRate}
                          color="info"
                        />
                      </div>

                      <div className="row text-center">
                        <div className="col-md-3 mb-3">
                          <div className="border rounded py-3">
                            <div className="text-xs text-muted mb-1">대기</div>
                            <div className="h5 mb-0 font-weight-bold">6건</div>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="border rounded py-3">
                            <div className="text-xs text-muted mb-1">진행중</div>
                            <div className="h5 mb-0 font-weight-bold">
                              10건
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="border rounded py-3">
                            <div className="text-xs text-muted mb-1">조립중</div>
                            <div className="h5 mb-0 font-weight-bold">5건</div>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="border rounded py-3">
                            <div className="text-xs text-muted mb-1">지연</div>
                            <div className="h5 mb-0 font-weight-bold text-danger">
                              3건
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-4 col-lg-5">
                  <div className="card shadow mb-4">
                    <div className="card-header py-3">
                      <h6 className="m-0 font-weight-bold text-primary">
                        오늘의 체크 포인트
                      </h6>
                    </div>

                    <div className="card-body">
                      {checkPointData.map((item, index) => (
                        <div
                          key={item.label}
                          className={
                            index !== checkPointData.length - 1 ? "mb-3" : "mb-0"
                          }
                        >
                          <div className="small font-weight-bold">
                            {item.label}
                            <span className={`float-right text-${item.color}`}>
                              {item.count}건
                            </span>
                          </div>
                          <ProgressBar
                            value={getPercent(item.count, maxCheckPointCount)}
                            color={item.color}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-6 mb-4">
                  <div className="card shadow mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h6 className="m-0 font-weight-bold text-primary">
                        생산 연계 주문 현황
                      </h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate("/18_order/orderProgress")}
                      >
                        전체보기
                      </button>
                    </div>

                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="thead-light">
                            <tr>
                              <th>작업번호</th>
                              <th>거래처</th>
                              <th>상태</th>
                              <th>수량</th>
                              <th>납기일</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.recentOrders.map((order) => (
                              <tr key={order.orderNo}>
                                <td>{order.orderNo}</td>
                                <td>{order.customerName}</td>
                                <td>
                                  <span
                                    className={`badge badge-${getStatusBadgeClass(
                                      order.status
                                    )}`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td>{order.amount}대</td>
                                <td>{order.dueDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="card shadow mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h6 className="m-0 font-weight-bold text-primary">
                        처리 대기 요청
                      </h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => navigate("/approval")}
                      >
                        요청함 이동
                      </button>
                    </div>

                    <div className="card-body">
                      {dashboardData.pendingApprovalList.length === 0 ? (
                        <div className="text-muted">
                          현재 처리 대기 요청이 없습니다.
                        </div>
                      ) : (
                        dashboardData.pendingApprovalList.map((item, index) => (
                          <div
                            key={`${item.title}-${index}`}
                            className={
                              index !== dashboardData.pendingApprovalList.length - 1
                                ? "border-bottom pb-3 mb-3"
                                : ""
                            }
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <div className="font-weight-bold">
                                  {item.title}
                                </div>
                                <div className="small text-muted">
                                  요청자: {item.requester} · 유형: {item.type}
                                </div>
                              </div>
                              <span
                                className={`badge badge-${getStatusBadgeClass(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <div className="small text-muted mt-1">
                              요청일: {item.createdAt}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 mb-4">
                  <div className="card shadow mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h6 className="m-0 font-weight-bold text-primary">
                        안전재고 이하 자재
                      </h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => navigate("/12_stock/stockStatus")}
                      >
                        자재현황 이동
                      </button>
                    </div>

                    <div className="card-body">
                      {dashboardData.lowStockItems.map((item, index) => {
                        const rate = Math.round(
                          (item.currentQty / item.safeQty) * 100
                        );

                        return (
                          <div
                            key={`${item.itemName}-${index}`}
                            className={
                              index !== dashboardData.lowStockItems.length - 1
                                ? "mb-4"
                                : ""
                            }
                          >
                            <div className="d-flex justify-content-between mb-1">
                              <div>
                                <span className="font-weight-bold">
                                  {item.itemName}
                                </span>
                                <span
                                  className={`badge badge-${getStatusBadgeClass(
                                    item.status
                                  )} ml-2`}
                                >
                                  {item.status}
                                </span>
                              </div>
                              <div className="small text-muted">
                                현재 {item.currentQty} / 안전 {item.safeQty}
                              </div>
                            </div>
                            <ProgressBar
                              value={rate}
                              color={
                                item.status === "위험" ? "danger" : "warning"
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card shadow mb-4">
                    <div className="card-header py-3">
                      <h6 className="m-0 font-weight-bold text-primary">
                        빠른 이동
                      </h6>
                    </div>

                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <button
                            className="btn btn-primary btn-block"
                            onClick={() => navigate("/18_order/orderProgress")}
                          >
                            작업지시 관리
                          </button>
                        </div>
                        <div className="col-md-6 mb-3">
                          <button
                            className="btn btn-success btn-block"
                            onClick={() => navigate("/material")}
                          >
                            자재 관리
                          </button>
                        </div>
                        <div className="col-md-6 mb-3">
                          <button
                            className="btn btn-info btn-block"
                            onClick={() => navigate("/12_stock/stockStatus")}
                          >
                            창고 / 재고 현황
                          </button>
                        </div>
                        <div className="col-md-6 mb-3">
                          <button
                            className="btn btn-warning btn-block text-white"
                            onClick={() => navigate("/approval")}
                          >
                            요청 승인 확인
                          </button>
                        </div>
                      </div>

                      <div className="alert alert-light border mt-2 mb-0">
                        <div className="font-weight-bold mb-1">운영 메모</div>
                        <div className="small text-muted">
                          서보 모터, 제어보드, 센서류 자재는 생산 지연과 직접
                          연결되므로 우선 점검이 필요합니다.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="sticky-footer bg-white">
            <div className="container my-auto">
              <div className="copyright text-center my-auto">
                <span>Copyright &copy; MES Dashboard 2026</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <a className="scroll-to-top rounded" href="#page-top">
        <i className="fas fa-angle-up"></i>
      </a>
    </>
  );
};

export default Admin;