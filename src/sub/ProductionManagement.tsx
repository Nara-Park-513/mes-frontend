import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, DflexColumn2, Content, Ctap } from "../styled/Sales.styles";
import { SpaceBetween, Center, Dflex, PageTotal } from "../styled/Component.styles";
import { Container, Row, Col, Tab, Tabs, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchOrders = async (p: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/production/orders?page=${p}&size=${size}`);
      if (!res.ok) throw new Error("서버 오류");

      const data: PageResponse<ProductionOrder> = await res.json();
      setRows(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("생산지시 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const openDetail = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/production/orders/${id}`);
    if (!res.ok) throw new Error("상세 조회 실패");

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
  };

  const handleUpdate = async () => {
    if (!selected) return;

    const res = await fetch(`${API_BASE}/api/production/orders/${selected.id}`, {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        planQty: Number(editForm.planQty),
      }),
    });

    if (!res.ok) throw new Error("수정 실패");

    setShowDetail(false);
    fetchOrders(page);
  };

  const handleDelete = async () => {
    if (!selected) return;

    const ok = window.confirm("정말 삭제 할까요?");
    if (!ok) return;

    const res = await fetch(`${API_BASE}/api/production/orders/${selected.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("삭제 실패");

    setShowDetail(false);
    fetchOrders(page);
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

    await fetch(`${API_BASE}/api/production/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        workOrderNo: newWorkOrderNo,
        planQty: Number(form.planQty),
      }),
    });

    setShowCreate(false);
    fetchOrders(page);
  };

  return (
    <>
      <Wrapper>
        <Lnb />
        <DflexColumn>
          <Content>
            <Top />
          </Content>

          <Container fluid className="p-0">
            <Row className="g-0 m-0">
              <Col className="p-0">
                <Ctap
                  style={{
                    background: "#fff",
                    padding: "24px 28px",
                    border: "1px solid #e5e7eb",
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
        gap: "12px",
        flexWrap: "nowrap",
      }}
    >
      <Button
        onClick={handleExcelDownload}
        variant="success"
        style={{
          height: "44px",
          minWidth: "120px",
          borderRadius: "6px",
          fontWeight: 600,
          margin: 0,
        }}
      >
        엑셀 다운
      </Button>

      <Button
        onClick={() => setShowCreate(true)}
        style={{
          height: "44px",
          minWidth: "120px",
          borderRadius: "6px",
          fontWeight: 600,
          margin: 0,
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
                        <div style={{ padding: "12px 12px 0 12px" }}>
                          <Table responsive className="mt-3 mb-0 align-middle">
                            <thead>
                              <tr className="text-center">
                                <th
                                  className="bg-secondary text-white"
                                  style={{
                                    whiteSpace: "nowrap",
                                    padding: "14px 12px",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    borderBottom: "none",
                                  }}
                                >
                                  #
                                </th>
                                {TABLE_HEADERS.map((h) => (
                                  <th
                                    key={h.key}
                                    className="bg-secondary text-white"
                                    style={{
                                      whiteSpace: "nowrap",
                                      padding: "14px 12px",
                                      fontSize: "14px",
                                      fontWeight: 700,
                                      borderBottom: "none",
                                    }}
                                  >
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
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      color: "#475569",
                                      fontWeight: 600,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {i + 1 + page * size}
                                  </td>

                                  <td
                                    style={{
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      color: "#334155",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {r.orderDate}
                                  </td>

                                  <td
                                    style={{
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <span
                                      style={{
                                        cursor: "pointer",
                                        color: "#0d6efd",
                                        textDecoration: "underline",
                                        fontWeight: 600,
                                      }}
                                      onClick={() => openDetail(r.id)}
                                    >
                                      {r.workOrderNo}
                                    </span>
                                  </td>

                                  <td
                                    style={{
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      color: "#334155",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {r.itemCode}
                                  </td>

                                  <td
                                    style={{
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      color: "#334155",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {r.itemName}
                                  </td>

                                  <td
                                    style={{
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      color: "#334155",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {r.planQty}
                                  </td>

                                  <td
                                    style={{
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      color: "#334155",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {r.startDate}
                                  </td>

                                  <td
                                    style={{
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      color: "#334155",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {r.endDate}
                                  </td>

                                  <td
                                    style={{
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      color: "#334155",
                                      whiteSpace: "nowrap",
                                    }}
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
                              <Pagination className="mb-0">
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
                              }}
                            >
                              총 {rows.length}건 {page + 1} / {totalPages} 페이지
                            </PageTotal>
                          </Center>
                        </div>
                      </Tab>
                    </Tabs>
                  </div>

                  {/* 생산지시 등록 모달 */}
                  <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>생산지시 등록</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Control className="mb-2" type="date" name="orderDate" onChange={handleChange} />
                        <Form.Control className="mb-2" name="itemCode" placeholder="품목코드" onChange={handleChange} />
                        <Form.Control className="mb-2" name="itemName" placeholder="품목명" onChange={handleChange} />
                        <Form.Control
                          className="mb-2"
                          type="number"
                          name="planQty"
                          placeholder="계획수량"
                          onChange={handleChange}
                        />
                        <Form.Control className="mb-2" type="date" name="startDate" onChange={handleChange} />
                        <Form.Control className="mb-2" type="date" name="endDate" onChange={handleChange} />
                        <Form.Control
                          className="mb-2"
                          name="workOrderNo"
                          placeholder="지시번호 (자동 생성 또는 입력)"
                          onChange={handleChange}
                        />
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button onClick={handleSave}>저장</Button>
                    </Modal.Footer>
                  </Modal>
                </Ctap>
              </Col>
            </Row>
          </Container>
        </DflexColumn>
      </Wrapper>

      {/* 생산지시 상세 수정 모달 */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>생산지시 상세</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-2"
              type="date"
              name="orderDate"
              value={editForm.orderDate}
              onChange={(e) => setEditForm((prev) => ({ ...prev, orderDate: e.target.value }))}
            />

            <Form.Control className="mb-2" name="workOrderNo" value={editForm.workOrderNo} disabled />

            <Form.Control
              className="mb-2"
              name="itemCode"
              placeholder="품목코드"
              value={editForm.itemCode}
              onChange={(e) => setEditForm((prev) => ({ ...prev, itemCode: e.target.value }))}
            />

            <Form.Control
              className="mb-2"
              name="itemName"
              placeholder="품목명"
              value={editForm.itemName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, itemName: e.target.value }))}
            />

            <Form.Control
              className="mb-2"
              name="planQty"
              placeholder="계획수량"
              value={editForm.planQty}
              onChange={(e) => setEditForm((prev) => ({ ...prev, planQty: e.target.value }))}
            />

            <Form.Control
              className="mb-2"
              name="startDate"
              value={editForm.startDate}
              type="date"
              onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))}
            />

            <Form.Control
              className="mb-2"
              name="endDate"
              value={editForm.endDate}
              type="date"
              onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
            />

            <Form.Control
              className="mb-2"
              name="status"
              placeholder="상태(대기/진행/완료)"
              value={editForm.status}
              onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            수정
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductionManagement;