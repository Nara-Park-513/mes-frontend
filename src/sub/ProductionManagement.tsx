import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, DflexColumn2, Content, Ctap } from "../styled/Sales.styles";
import { Center, PageTotal } from "../styled/Component.styles";
import { Container, Row, Col, Tab, Tabs, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SimpleModal from "../commons/SimpleModal";

const API_BASE = "http://localhost:9500";

type ProductionOrder = {
  id: number;
  orderDate: string;
  workOrderNo: string;
  itemCode: string;
  itemName: string;
  planQty: number;
  startDate: string;
  endDate: string;
  status: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type AlertState = {
  open: boolean;
  message: string;
  mode: "alert" | "confirm";
  onConfirm?: (() => void) | null;
};

const TABLE_HEADERS = [
  { key: "orderDate", label: "지시일" },
  { key: "workOrderNo", label: "지시번호" },
  { key: "itemCode", label: "품목코드" },
  { key: "itemName", label: "품목명" },
  { key: "planQty", label: "계획수량" },
  { key: "startDate", label: "시작일" },
  { key: "endDate", label: "종료일" },
  { key: "status", label: "상태" },
];

const ProductionManagement = () => {
  const [rows, setRows] = useState<ProductionOrder[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    mode: "alert",
    onConfirm: null,
  });

  const [form, setForm] = useState({
    orderDate: "",
    itemCode: "",
    itemName: "",
    planQty: "",
    startDate: "",
    endDate: "",
    workOrderNo: "",
  });

  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<ProductionOrder | null>(null);

  const [editForm, setEditForm] = useState({
    orderDate: "",
    workOrderNo: "",
    itemCode: "",
    itemName: "",
    planQty: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  const showAlert = (message: string) => {
    setAlertState({
      open: true,
      message,
      mode: "alert",
      onConfirm: null,
    });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setAlertState({
      open: true,
      message,
      mode: "confirm",
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({
      ...prev,
      open: false,
      onConfirm: null,
    }));
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchOrders = async (p: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/production/orders?page=${p}&size=${size}`);
      if (!res.ok) throw new Error();

      const data: PageResponse<ProductionOrder> = await res.json();
      setRows(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("생산지시 목록 조회 실패", err);
      showAlert("생산지시 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const openDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/production/orders/${id}`);
      if (!res.ok) throw new Error();

      const data: ProductionOrder = await res.json();

      setSelected(data);

      setEditForm({
        orderDate: data.orderDate || "",
        workOrderNo: data.workOrderNo || "",
        itemCode: data.itemCode || "",
        itemName: data.itemName || "",
        planQty: String(data.planQty ?? ""),
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        status: data.status || "",
      });

      setShowDetail(true);
    } catch (err) {
      console.error("생산지시 상세 조회 실패", err);
      showAlert("생산지시 상세 정보를 불러오지 못했습니다.");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;

    try {
      const res = await fetch(`${API_BASE}/api/production/orders/${selected.id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          planQty: Number(editForm.planQty),
        }),
      });

      if (!res.ok) throw new Error();

      setShowDetail(false);
      await fetchOrders(page);
      showAlert("생산지시가 수정되었습니다.");
    } catch (err) {
      console.error("생산지시 수정 실패", err);
      showAlert("생산지시를 수정하지 못했습니다.");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!selected) return;

    closeAlert();

    try {
      const res = await fetch(`${API_BASE}/api/production/orders/${selected.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setShowDetail(false);
      await fetchOrders(page);
      showAlert("생산지시가 삭제되었습니다.");
    } catch (err) {
      console.error("생산지시 삭제 실패", err);
      showAlert("생산지시를 삭제하지 못했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    showConfirm("생산지시를 삭제하시겠습니까?", handleDeleteConfirmed);
  };

  const handleExcelDownload = () => {
    const excelData: (string | number)[][] = [
      ["#", ...TABLE_HEADERS.map((h) => h.label)],
      ...rows.map((row, idx) => [
        idx + 1,
        row.orderDate,
        row.workOrderNo,
        row.itemCode,
        row.itemName,
        row.planQty,
        row.startDate,
        row.endDate,
        row.status,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "생산관리");

    const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelFile], { type: "application/octet-stream" });
    saveAs(blob, "생산관리_리스트.xlsx");
  };

  const goPage = (p: number) => {
    const next = Math.max(0, Math.min(p, totalPages - 1));
    setPage(next);
  };

  const handleSave = async () => {
    const newWorkOrderNo = `WO-${Date.now()}`;

    try {
      const res = await fetch(`${API_BASE}/api/production/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          workOrderNo: newWorkOrderNo,
          planQty: Number(form.planQty),
        }),
      });

      if (!res.ok) throw new Error();

      setShowCreate(false);
      await fetchOrders(page);
      showAlert("생산지시가 등록되었습니다.");
    } catch (err) {
      console.error("생산지시 등록 실패", err);
      showAlert("생산지시를 등록하지 못했습니다.");
    }
  };

  const thStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    padding: "12px 10px",
    fontSize: "13px",
    fontWeight: 700,
    borderBottom: "none",
    textAlign: "center",
    verticalAlign: "middle",
  };

  const tdStyle: React.CSSProperties = {
    padding: "12px 10px",
    verticalAlign: "middle",
    color: "#334155",
    whiteSpace: "nowrap",
    textAlign: "center",
    fontSize: "13px",
  };

  return (
    <>
      <Wrapper>
        <Lnb />
        <DflexColumn style={{ minWidth: 0 }}>
          <Content style={{ minWidth: 0 }}>
            <Top />
          </Content>

          <Container fluid className="p-0" style={{ minWidth: 0 }}>
            <Row className="g-0 m-0">
              <Col className="p-0" style={{ minWidth: 0 }}>
                <Ctap
                  style={{
                    background: "#fff",
                    padding: "24px 24px 20px",
                    border: "1px solid #e5e7eb",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      paddingBottom: "16px",
                      marginBottom: "20px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <h4
                      className="mb-0"
                      style={{
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      생산관리
                    </h4>
                  </div>

                  <DflexColumn2
                    className="mb-4"
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "16px 20px",
                      background: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          onClick={handleExcelDownload}
                          variant="success"
                          style={{
                            height: "42px",
                            minWidth: "110px",
                            borderRadius: "6px",
                            fontWeight: 600,
                            margin: 0,
                            padding: "0 14px",
                            fontSize: "13px",
                          }}
                        >
                          엑셀 다운
                        </Button>

                        <Button
                          onClick={() => setShowCreate(true)}
                          style={{
                            height: "42px",
                            minWidth: "120px",
                            borderRadius: "6px",
                            fontWeight: 600,
                            margin: 0,
                            padding: "0 14px",
                            fontSize: "13px",
                          }}
                        >
                          생산지시 등록
                        </Button>
                      </div>
                    </div>
                  </DflexColumn2>

                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      overflow: "hidden",
                    }}
                  >
                    <Tabs
                      defaultActiveKey="orders"
                      className="mb-0"
                      fill
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        background: "#fff",
                      }}
                    >
                      <Tab eventKey="orders" title="">
                        <div style={{ padding: "10px 10px 0 10px", minWidth: 0 }}>
                          <Table
                            className="mt-3 mb-0 align-middle"
                            style={{
                              width: "100%",
                              marginBottom: 0,
                              tableLayout: "fixed",
                            }}
                          >
                            <colgroup>
                              <col style={{ width: "5%" }} />
                              <col style={{ width: "11%" }} />
                              <col style={{ width: "15%" }} />
                              <col style={{ width: "12%" }} />
                              <col style={{ width: "18%" }} />
                              <col style={{ width: "10%" }} />
                              <col style={{ width: "11%" }} />
                              <col style={{ width: "11%" }} />
                              <col style={{ width: "7%" }} />
                            </colgroup>

                            <thead>
                              <tr className="text-center">
                                <th className="bg-secondary text-white" style={thStyle}>
                                  #
                                </th>
                                {TABLE_HEADERS.map((h) => (
                                  <th key={h.key} className="bg-secondary text-white" style={thStyle}>
                                    {h.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>

                            <tbody>
                              {(rows || []).map((r, i) => (
                                <tr key={i} className="text-center">
                                  <td
                                    style={{
                                      ...tdStyle,
                                      color: "#475569",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {i + 1 + page * size}
                                  </td>

                                  <td style={tdStyle} title={r.orderDate}>
                                    {r.orderDate}
                                  </td>

                                  <td
                                    style={{
                                      ...tdStyle,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={r.workOrderNo}
                                  >
                                    <span
                                      style={{
                                        cursor: "pointer",
                                        color: "#0d6efd",
                                        textDecoration: "underline",
                                        fontWeight: 600,
                                        display: "inline-block",
                                        maxWidth: "100%",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        verticalAlign: "middle",
                                      }}
                                      onClick={() => openDetail(r.id)}
                                    >
                                      {r.workOrderNo}
                                    </span>
                                  </td>

                                  <td
                                    style={{
                                      ...tdStyle,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={r.itemCode}
                                  >
                                    {r.itemCode}
                                  </td>

                                  <td
                                    style={{
                                      ...tdStyle,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={r.itemName}
                                  >
                                    {r.itemName}
                                  </td>

                                  <td style={tdStyle} title={String(r.planQty)}>
                                    {r.planQty}
                                  </td>

                                  <td style={tdStyle} title={r.startDate}>
                                    {r.startDate}
                                  </td>

                                  <td style={tdStyle} title={r.endDate}>
                                    {r.endDate}
                                  </td>

                                  <td
                                    style={{
                                      ...tdStyle,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={r.status}
                                  >
                                    {r.status}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>

                          <Center
                            style={{
                              marginTop: "16px",
                              paddingTop: "16px",
                              borderTop: "1px solid #e5e7eb",
                              flexDirection: "column",
                              gap: "10px",
                            }}
                          >
                            {totalPages > 0 && (
                              <Pagination className="mb-0" size="sm">
                                <Pagination.First disabled={page === 0} onClick={() => goPage(0)} />
                                <Pagination.Prev disabled={page === 0} onClick={() => goPage(page - 1)} />

                                {Array.from({ length: totalPages })
                                  .map((_, i) => i)
                                  .filter((i) => i >= page - 2 && i <= page + 2)
                                  .map((i) => (
                                    <Pagination.Item key={i} active={i === page} onClick={() => goPage(i)}>
                                      {i + 1}
                                    </Pagination.Item>
                                  ))}

                                <Pagination.Next
                                  disabled={page >= totalPages - 1}
                                  onClick={() => goPage(page + 1)}
                                />
                                <Pagination.Last
                                  disabled={page >= totalPages - 1}
                                  onClick={() => goPage(totalPages - 1)}
                                />
                              </Pagination>
                            )}

                            <PageTotal
                              style={{
                                color: "#64748b",
                                fontWeight: 600,
                                marginBottom: "4px",
                                fontSize: "13px",
                              }}
                            >
                              총 {rows.length}건 {page + 1} / {totalPages} 페이지
                            </PageTotal>
                          </Center>
                        </div>
                      </Tab>
                    </Tabs>
                  </div>

                  <Modal show={showCreate} onHide={() => setShowCreate(false)} centered size="lg">
                    <Modal.Header
                      closeButton
                      style={{
                        borderBottom: "1px solid #dbe2ea",
                        padding: "20px 24px",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <Modal.Title
                        style={{
                          fontSize: "20px",
                          fontWeight: 700,
                          color: "#111827",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        생산지시 등록
                      </Modal.Title>
                    </Modal.Header>

                    <Modal.Body
                      style={{
                        padding: "24px",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#374151",
                              marginBottom: "8px",
                            }}
                          >
                            지시일자
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="orderDate"
                            onChange={handleChange}
                            style={{
                              height: "46px",
                              borderRadius: "4px",
                              border: "1px solid #cfd8e3",
                              boxShadow: "none",
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#374151",
                              marginBottom: "8px",
                            }}
                          >
                            품목코드
                          </Form.Label>
                          <Form.Control
                            name="itemCode"
                            placeholder="품목코드"
                            onChange={handleChange}
                            style={{
                              height: "46px",
                              borderRadius: "4px",
                              border: "1px solid #cfd8e3",
                              boxShadow: "none",
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#374151",
                              marginBottom: "8px",
                            }}
                          >
                            품목명
                          </Form.Label>
                          <Form.Control
                            name="itemName"
                            placeholder="품목명"
                            onChange={handleChange}
                            style={{
                              height: "46px",
                              borderRadius: "4px",
                              border: "1px solid #cfd8e3",
                              boxShadow: "none",
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#374151",
                              marginBottom: "8px",
                            }}
                          >
                            계획수량
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="planQty"
                            placeholder="계획수량"
                            onChange={handleChange}
                            style={{
                              height: "46px",
                              borderRadius: "4px",
                              border: "1px solid #cfd8e3",
                              boxShadow: "none",
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#374151",
                              marginBottom: "8px",
                            }}
                          >
                            시작일
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="startDate"
                            onChange={handleChange}
                            style={{
                              height: "46px",
                              borderRadius: "4px",
                              border: "1px solid #cfd8e3",
                              boxShadow: "none",
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#374151",
                              marginBottom: "8px",
                            }}
                          >
                            종료일
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="endDate"
                            onChange={handleChange}
                            style={{
                              height: "46px",
                              borderRadius: "4px",
                              border: "1px solid #cfd8e3",
                              boxShadow: "none",
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-0">
                          <Form.Label
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#374151",
                              marginBottom: "8px",
                            }}
                          >
                            지시번호
                          </Form.Label>
                          <Form.Control
                            name="workOrderNo"
                            placeholder="지시번호 (자동 생성 또는 입력)"
                            onChange={handleChange}
                            style={{
                              height: "46px",
                              borderRadius: "4px",
                              border: "1px solid #cfd8e3",
                              boxShadow: "none",
                            }}
                          />
                        </Form.Group>
                      </Form>
                    </Modal.Body>

                    <Modal.Footer
                      style={{
                        borderTop: "1px solid #dbe2ea",
                        padding: "16px 24px",
                        backgroundColor: "#f8fafc",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                      }}
                    >
                      <Button
                        variant="secondary"
                        onClick={() => setShowCreate(false)}
                        style={{
                          minWidth: "96px",
                          height: "42px",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        닫기
                      </Button>
                      <Button
                        onClick={handleSave}
                        style={{
                          minWidth: "96px",
                          height: "42px",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        저장
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </Ctap>
              </Col>
            </Row>
          </Container>
        </DflexColumn>
      </Wrapper>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header
          closeButton
          style={{
            borderBottom: "1px solid #dbe2ea",
            padding: "20px 24px",
            backgroundColor: "#f8fafc",
          }}
        >
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            생산지시 상세
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
          }}
        >
          <Form>
            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                지시일자
              </Form.Label>
              <Form.Control
                type="date"
                name="orderDate"
                value={editForm.orderDate}
                onChange={(e) => setEditForm((prev) => ({ ...prev, orderDate: e.target.value }))}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                지시번호
              </Form.Label>
              <Form.Control
                name="workOrderNo"
                value={editForm.workOrderNo}
                disabled
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  backgroundColor: "#f3f4f6",
                  color: "#6b7280",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                품목코드
              </Form.Label>
              <Form.Control
                name="itemCode"
                placeholder="품목코드"
                value={editForm.itemCode}
                onChange={(e) => setEditForm((prev) => ({ ...prev, itemCode: e.target.value }))}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                품목명
              </Form.Label>
              <Form.Control
                name="itemName"
                placeholder="품목명"
                value={editForm.itemName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, itemName: e.target.value }))}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                계획수량
              </Form.Label>
              <Form.Control
                name="planQty"
                placeholder="계획수량"
                value={editForm.planQty}
                onChange={(e) => setEditForm((prev) => ({ ...prev, planQty: e.target.value }))}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                시작일
              </Form.Label>
              <Form.Control
                name="startDate"
                value={editForm.startDate}
                type="date"
                onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                종료일
              </Form.Label>
              <Form.Control
                name="endDate"
                value={editForm.endDate}
                type="date"
                onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                상태
              </Form.Label>
              <Form.Control
                name="status"
                placeholder="상태(대기/진행/완료)"
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer
          style={{
            borderTop: "1px solid #dbe2ea",
            padding: "16px 24px",
            backgroundColor: "#f8fafc",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <Button
            variant="danger"
            onClick={handleDelete}
            style={{
              minWidth: "96px",
              height: "42px",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            삭제
          </Button>
          <Button
            variant="success"
            onClick={handleUpdate}
            style={{
              minWidth: "96px",
              height: "42px",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            수정
          </Button>
        </Modal.Footer>
      </Modal>

      <SimpleModal
        open={alertState.open}
        message={alertState.message}
        mode={alertState.mode}
        onClose={closeAlert}
        onConfirm={alertState.onConfirm ?? undefined}
      />
    </>
  );
};

export default ProductionManagement;