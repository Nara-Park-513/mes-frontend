import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, DflexColumn2, Content, Ctap } from "../styled/Sales.styles";

import { Container, Row, Col, Tab, Tabs, Table, Button, Modal, Form, Pagination } from "react-bootstrap";
import { Group, Left, Right, Text6, Dflex, DflexEnd, Center, PageTotal } from "../styled/Component.styles";
import { Time, Select, Search } from "../styled/Input.styles";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type TableRow = string[];

type SalesOrderPayload = {
  orderDate: string;
  customerCode: string;
  customerName: string;
  itemCode: string;
  itemName: string;
  orderQty: number;
  price: number;
  deliveryDate: string | null;
  remark: string;
};

// ✅ 응답에 id가 있어야 수정/삭제 가능
type SalesOrderResponse = {
  id: number;
  orderDate: string;
  customerCode: string;
  customerName: string;
  itemCode: string;
  itemName: string;
  orderQty: number;
  price: number;
  amount?: number;
  deliveryDate?: string | null;
  remark?: string | null;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const API_BASE = "http://localhost:9500";

const TABLE_HEADERS = [
  "수주일자",
  "거래처코드",
  "거래처명",
  "품목코드",
  "품목명",
  "규격",
  "수주 잔량",
  "단가",
  "금액",
  "납품 예정일",
  "납품 여부",
  "비고",
  "상세보기",
];

const SalesManagement = () => {
  // ✅ 페이징
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ✅ 모달/상태
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ✅ 화면용 rows + 원본 orders(수정/삭제용)
  const [rows, setRows] = useState<TableRow[]>([]);
  const [orders, setOrders] = useState<SalesOrderResponse[]>([]);

  // ✅ 등록 폼
  const [form, setForm] = useState({
    orderDate: "",
    customerCode: "",
    customerName: "",
    itemCode: "",
    itemName: "",
    orderQty: "",
    price: "",
    deliveryDate: "",
    remark: "",
    spec: "",
    remainQty: "",
    deliveryStatus: "미납",
    // 검색 조건
    from: "",
    to: "",
    customer: "",
    item: "",
    deliveryYn: "ALL",
  });

  // ✅ 상세(수정/삭제) 모달
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderResponse | null>(null);
  const [editForm, setEditForm] = useState({
    orderDate: "",
    customerCode: "",
    customerName: "",
    itemCode: "",
    itemName: "",
    orderQty: "",
    price: "",
    deliveryDate: "",
    remark: "",
  });

  // ✅ 공용 change
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 목록 조회
  const fetchOrders = async (pageArg = page, sizeArg = size) => {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();
    if (form.from) params.append("from", form.from);
    if (form.to) params.append("to", form.to);
    if (form.customer) params.append("customer", form.customer);
    if (form.item) params.append("item", form.item);
    if (form.deliveryYn && form.deliveryYn !== "ALL") params.append("deliveryYn", form.deliveryYn);

    params.append("page", String(pageArg));
    params.append("size", String(sizeArg));

    const res = await fetch(`${API_BASE}/api/sales/orders?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const raw = await res.text().catch(() => "");
    if (!res.ok) throw new Error(raw || `목록조회 실패 (HTTP ${res.status})`);

    const data: PageResponse<SalesOrderResponse> =
      raw && raw.trim()
        ? JSON.parse(raw)
        : { content: [], totalElements: 0, totalPages: 0, number: pageArg, size: sizeArg };

    setOrders(data.content);

    const mapped: TableRow[] = data.content.map((o) => {
      const qty = Number(o.orderQty ?? 0);
      const price = Number(o.price ?? 0);
      const amount = Number(o.amount ?? qty * price);

      return [
        o.orderDate ?? "",
        o.customerCode ?? "",
        o.customerName ?? "",
        o.itemCode ?? "",
        o.itemName ?? "",
        "-",
        String(qty),
        String(price),
        String(amount),
        o.deliveryDate ?? "-",
        "미납",
        o.remark ?? "-",
        "보기",
      ];
    });

    setRows(mapped);

    setPage(data.number);
    setSize(data.size);
    setTotalPages(data.totalPages);
    setTotalElements(data.totalElements);
  };

  useEffect(() => {
    fetchOrders(0, size).catch((e) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchOrders(0, size).catch((e) => console.error(e));
  };

  const openCreate = () => {
    setErrorMsg("");
    setShowCreate(true);
  };

  const handleExcelDownload = () => {
    const excelData: (string | number)[][] = [
      ["#", ...TABLE_HEADERS],
      ...rows.map((row, idx) => [idx + 1 + page * size, ...row]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "수주관리");

    const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelFile], { type: "application/octet-stream" });

    saveAs(blob, "수주관리_리스트.xlsx");
  };

  const handleCreateSave = async () => {
    setErrorMsg("");

    if (!form.orderDate || !form.customerCode || !form.customerName || !form.itemCode || !form.itemName) {
      setErrorMsg("필수 항목(수주일자/거래처/품목)을 입력하세요.");
      return;
    }

    const qty = Number(form.orderQty || 0);
    const price = Number(form.price || 0);

    if (!qty || qty <= 0) {
      setErrorMsg("수주 수량(orderQty)은 1 이상이어야 합니다.");
      return;
    }
    if (!price || price <= 0) {
      setErrorMsg("단가(price)은 1 이상이어야 합니다.");
      return;
    }

    const payload: SalesOrderPayload = {
      orderDate: form.orderDate,
      customerCode: form.customerCode,
      customerName: form.customerName,
      itemCode: form.itemCode,
      itemName: form.itemName,
      orderQty: qty,
      price,
      deliveryDate: form.deliveryDate ? form.deliveryDate : null,
      remark: form.remark || "",
    };

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/sales/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `저장 실패 (HTTP ${res.status})`);
      }

      await fetchOrders(page, size);

      setForm((prev) => ({
        ...prev,
        orderDate: "",
        customerCode: "",
        customerName: "",
        itemCode: "",
        itemName: "",
        orderQty: "",
        price: "",
        deliveryDate: "",
        remark: "",
        spec: "",
        remainQty: "",
        deliveryStatus: "미납",
      }));

      setShowCreate(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const openDetailByIndex = (rowIndex: number) => {
    const order = orders[rowIndex];
    if (!order) return;

    setSelectedOrder(order);
    setEditForm({
      orderDate: order.orderDate ?? "",
      customerCode: order.customerCode ?? "",
      customerName: order.customerName ?? "",
      itemCode: order.itemCode ?? "",
      itemName: order.itemName ?? "",
      orderQty: String(order.orderQty ?? ""),
      price: String(order.price ?? ""),
      deliveryDate: order.deliveryDate ? String(order.deliveryDate) : "",
      remark: order.remark ? String(order.remark) : "",
    });

    setShowDetail(true);
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/sales/orders/${selectedOrder.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        orderDate: editForm.orderDate,
        customerCode: editForm.customerCode,
        customerName: editForm.customerName,
        itemCode: editForm.itemCode,
        itemName: editForm.itemName,
        orderQty: Number(editForm.orderQty || 0),
        price: Number(editForm.price || 0),
        deliveryDate: editForm.deliveryDate ? editForm.deliveryDate : null,
        remark: editForm.remark || "",
      }),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      alert(raw || "수정 실패");
      return;
    }

    setShowDetail(false);
    await fetchOrders(page, size);
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    if (!window.confirm("정말 삭제할까요?")) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/sales/orders/${selectedOrder.id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      alert(raw || "삭제 실패");
      return;
    }

    setShowDetail(false);

    const nextPage = page > 0 && rows.length === 1 ? page - 1 : page;
    await fetchOrders(nextPage, size);
  };

  const goPage = (p: number) => {
    const next = Math.max(0, Math.min(p, totalPages - 1));
    fetchOrders(next, size).catch((e) => console.error(e));
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
                    <h5
                      className="mb-0"
                      style={{
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      영업관리
                    </h5>
                  </div>

                  <DflexColumn2
                    className="mb-4"
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "20px 24px",
                      background: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: "20px",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <Left
                        style={{
                          flex: 1,
                          minWidth: 0,
                          overflowX: "auto",
                          overflowY: "hidden",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "16px",
                            flexWrap: "nowrap",
                            minWidth: "max-content",
                            paddingBottom: "2px",
                          }}
                        >
                          <Group style={{ margin: 0, flexShrink: 0 }}>
                            <Text6
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: 600,
                                color: "#374151",
                                fontSize: "14px",
                              }}
                            >
                              수주일자조회기간
                            </Text6>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                height: "44px",
                              }}
                            >
                              <Time
                                type="date"
                                name="from"
                                value={form.from}
                                onChange={handleChange}
                                style={{
                                  height: "44px",
                                  width: "150px",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "6px",
                                  background: "#fff",
                                  padding: "0 12px",
                                }}
                              />
                              <span style={{ color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>-</span>
                              <Time
                                type="date"
                                name="to"
                                value={form.to}
                                onChange={handleChange}
                                style={{
                                  height: "44px",
                                  width: "150px",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "6px",
                                  background: "#fff",
                                  padding: "0 12px",
                                }}
                              />
                            </div>
                          </Group>

                          <Group style={{ margin: 0, flexShrink: 0 }}>
                            <Text6
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: 600,
                                color: "#374151",
                                fontSize: "14px",
                              }}
                            >
                              거래처
                            </Text6>
                            <Search
                              type="search"
                              name="customer"
                              value={form.customer}
                              onChange={handleChange}
                              style={{
                                height: "44px",
                                width: "180px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                background: "#fff",
                                padding: "0 12px",
                              }}
                            />
                          </Group>

                          <Group style={{ margin: 0, flexShrink: 0 }}>
                            <Text6
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: 600,
                                color: "#374151",
                                fontSize: "14px",
                              }}
                            >
                              품목
                            </Text6>
                            <Search
                              type="search"
                              name="item"
                              value={form.item}
                              onChange={handleChange}
                              style={{
                                height: "44px",
                                width: "180px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                background: "#fff",
                                padding: "0 12px",
                              }}
                            />
                          </Group>

                          <Group style={{ margin: 0, flexShrink: 0 }}>
                            <Text6
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: 600,
                                color: "#374151",
                                fontSize: "14px",
                              }}
                            >
                              납품여부
                            </Text6>
                            <Select
                              name="deliveryYn"
                              value={form.deliveryYn}
                              onChange={handleChange}
                              style={{
                                height: "44px",
                                width: "140px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                background: "#fff",
                                padding: "0 12px",
                              }}
                            >
                              <option value="ALL">전체</option>
                              <option value="N">미납</option>
                              <option value="Y">납품완료</option>
                            </Select>
                          </Group>

                          <Group style={{ margin: 0, flexShrink: 0 }}>
                            <Button
                              variant="dark"
                              onClick={handleSearch}
                              style={{
                                height: "44px",
                                minWidth: "92px",
                                borderRadius: "6px",
                                fontWeight: 600,
                                padding: "0 20px",
                              }}
                            >
                              검색
                            </Button>
                          </Group>
                        </div>
                      </Left>

                      <Right
                        style={{
                          flexShrink: 0,
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                        }}
                      >
                        <Group style={{ margin: 0 }}>
                          <DflexEnd
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: "12px",
                              flexWrap: "nowrap",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Button
                              variant="success"
                              onClick={handleExcelDownload}
                              style={{
                                height: "44px",
                                minWidth: "110px",
                                borderRadius: "6px",
                                fontWeight: 600,
                                margin: 0,
                              }}
                            >
                              엑셀 다운
                            </Button>

                            <Button
                              variant="primary"
                              className="mx-0"
                              style={{
                                height: "44px",
                                minWidth: "110px",
                                borderRadius: "6px",
                                fontWeight: 600,
                                margin: 0,
                              }}
                            >
                              일괄 납품
                            </Button>

                            <Button
                              variant="secondary"
                              onClick={openCreate}
                              style={{
                                height: "44px",
                                minWidth: "110px",
                                borderRadius: "6px",
                                fontWeight: 600,
                                margin: 0,
                              }}
                            >
                              수주 등록
                            </Button>
                          </DflexEnd>
                        </Group>
                      </Right>
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
                      <Tab eventKey="orders" title="수주관리">
                        <div style={{ padding: "8px 8px 0 8px" }}>
                          <Table responsive className="mt-3 mb-0 align-middle">
                            <thead>
                              <tr>
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
                                {TABLE_HEADERS.map((title, index) => (
                                  <th
                                    key={index}
                                    className="bg-secondary text-white"
                                    style={{
                                      whiteSpace: "nowrap",
                                      padding: "14px 12px",
                                      fontSize: "14px",
                                      fontWeight: 700,
                                      borderBottom: "none",
                                    }}
                                  >
                                    {title}
                                  </th>
                                ))}
                              </tr>
                            </thead>

                            <tbody>
                              {rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  <td
                                    style={{
                                      padding: "13px 12px",
                                      verticalAlign: "middle",
                                      color: "#475569",
                                      fontWeight: 600,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {rIdx + 1 + page * size}
                                  </td>

                                  {row.map((cell, cIdx) => {
                                    if (cIdx === 4) {
                                      return (
                                        <td
                                          key={cIdx}
                                          style={{
                                            cursor: "pointer",
                                            textDecoration: "underline",
                                            padding: "13px 12px",
                                            verticalAlign: "middle",
                                            color: "#0d6efd",
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                          }}
                                          onClick={() => openDetailByIndex(rIdx)}
                                        >
                                          {cell}
                                        </td>
                                      );
                                    }

                                    return (
                                      <td
                                        key={cIdx}
                                        style={{
                                          padding: "13px 12px",
                                          verticalAlign: "middle",
                                          color: "#334155",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {cell}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>

                            <tfoot>
                              <tr>
                                <th
                                  className="bg-secondary text-white text-center"
                                  colSpan={6}
                                  style={{
                                    padding: "14px 12px",
                                    borderTop: "none",
                                  }}
                                >
                                  합계
                                </th>
                                <th
                                  className="bg-secondary text-warning fw-bold"
                                  style={{
                                    padding: "14px 12px",
                                    borderTop: "none",
                                  }}
                                >
                                  -
                                </th>
                                <th
                                  className="bg-secondary text-warning fw-bold"
                                  style={{
                                    padding: "14px 12px",
                                    borderTop: "none",
                                  }}
                                >
                                  -
                                </th>
                                <th
                                  className="bg-secondary text-warning fw-bold"
                                  style={{
                                    padding: "14px 12px",
                                    borderTop: "none",
                                  }}
                                >
                                  -
                                </th>
                                <th className="bg-secondary text-white" style={{ borderTop: "none" }}></th>
                                <th className="bg-secondary text-white" style={{ borderTop: "none" }}></th>
                                <th
                                  className="bg-secondary text-white"
                                  colSpan={5}
                                  style={{ borderTop: "none" }}
                                ></th>
                              </tr>
                            </tfoot>
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
                            {totalPages > 1 && (
                              <>
                                <PageTotal
                                  style={{
                                    color: "#64748b",
                                    fontWeight: 600,
                                    marginBottom: "4px",
                                  }}
                                >
                                  총 {totalElements}건 {page + 1} / {totalPages} 페이지
                                </PageTotal>

                                <Pagination className="mb-3">
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
                              </>
                            )}
                          </Center>
                        </div>
                      </Tab>

                      <Tab eventKey="delivery" title="납품관리"></Tab>
                      <Tab eventKey="search" title="수주내역조회"></Tab>
                      <Tab eventKey="dsearch" title="납품내역조회"></Tab>
                    </Tabs>
                  </div>
                </Ctap>
              </Col>
            </Row>
          </Container>
        </DflexColumn>
      </Wrapper>

      {/* ✅ 등록 모달 */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>수주 등록</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

          <Form>
            <Form.Group className="mb-2">
              <Form.Label>수주일자</Form.Label>
              <Form.Control type="date" name="orderDate" value={form.orderDate} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>거래처코드</Form.Label>
              <Form.Control name="customerCode" value={form.customerCode} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>거래처명</Form.Label>
              <Form.Control name="customerName" value={form.customerName} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>품목코드</Form.Label>
              <Form.Control name="itemCode" value={form.itemCode} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>품목명</Form.Label>
              <Form.Control name="itemName" value={form.itemName} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>수주 수량</Form.Label>
              <Form.Control type="number" name="orderQty" value={form.orderQty} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>단가</Form.Label>
              <Form.Control type="number" name="price" value={form.price} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>납품예정일</Form.Label>
              <Form.Control type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>비고</Form.Label>
              <Form.Control name="remark" value={form.remark} onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={saving}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleCreateSave} disabled={saving}>
            {saving ? "저장중..." : "저장"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ 상세(수정/삭제) 모달 */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>수주 상세</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>수주일자</Form.Label>
              <Form.Control type="date" name="orderDate" value={editForm.orderDate} onChange={handleEditChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>거래처코드</Form.Label>
              <Form.Control name="customerCode" value={editForm.customerCode} onChange={handleEditChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>거래처명</Form.Label>
              <Form.Control name="customerName" value={editForm.customerName} onChange={handleEditChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>품목코드</Form.Label>
              <Form.Control name="itemCode" value={editForm.itemCode} onChange={handleEditChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>품목명</Form.Label>
              <Form.Control name="itemName" value={editForm.itemName} onChange={handleEditChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>수주 수량</Form.Label>
              <Form.Control type="number" name="orderQty" value={editForm.orderQty} onChange={handleEditChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>단가</Form.Label>
              <Form.Control type="number" name="price" value={editForm.price} onChange={handleEditChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>납품예정일</Form.Label>
              <Form.Control type="date" name="deliveryDate" value={editForm.deliveryDate} onChange={handleEditChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>비고</Form.Label>
              <Form.Control name="remark" value={editForm.remark} onChange={handleEditChange} />
            </Form.Group>
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

export default SalesManagement;