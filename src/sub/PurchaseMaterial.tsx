import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, Content, Ctap, DflexColumn2 } from "../styled/Sales.styles";
import { Center, PageTotal } from "../styled/Component.styles";
import { Container, Row, Col, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SimpleModal from "../commons/SimpleModal";

const API_BASE = "http://localhost:9500";

// 구매자재
type PurchaseMaterialRow = {
  id: number;
  purchaseDate: string;
  purchaseNo: string;
  supplierCode: string;
  supplierName: string;
  itemCode: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  amount: number;
  expectedDate: string;
  status: string;
  remark: string;
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
  { key: "purchaseDate", label: "구매일자" },
  { key: "purchaseNo", label: "구매번호" },
  { key: "supplierCode", label: "공급처코드" },
  { key: "supplierName", label: "공급처명" },
  { key: "itemCode", label: "품목코드" },
  { key: "itemName", label: "품목명" },
  { key: "qty", label: "수량" },
  { key: "unitPrice", label: "단가" },
  { key: "amount", label: "금액" },
  { key: "expectedDate", label: "입고예정일" },
  { key: "status", label: "상태" },
  { key: "remark", label: "비고" },
];

const PurchaseMaterial = () => {
  const [rows, setRows] = useState<PurchaseMaterialRow[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 등록모달
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    purchaseDate: "",
    purchaseNo: "",
    supplierCode: "",
    supplierName: "",
    itemCode: "",
    itemName: "",
    qty: "",
    unitPrice: "",
    expectedDate: "",
    status: "대기",
    remark: "",
  });

  // 상세(수정/삭제)모달
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<PurchaseMaterialRow | null>(null);
  const [editForm, setEditForm] = useState({
    purchaseDate: "",
    purchaseNo: "",
    supplierCode: "",
    supplierName: "",
    itemCode: "",
    itemName: "",
    qty: "",
    unitPrice: "",
    expectedDate: "",
    status: "",
    remark: "",
  });

  // 공통 상단 알림
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    mode: "alert",
    onConfirm: null,
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

  const onCreateChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 목록조회 (페이징)
  const fetchList = async (p: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/purchase/materials?page=${p}&size=${size}`);
      if (!res.ok) throw new Error();

      const data: PageResponse<PurchaseMaterialRow> = await res.json();
      setRows(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error("구매자재 목록 조회 실패", err);
      showAlert("구매자재 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page]);

  const goPage = (p: number) => {
    const next = Math.max(0, Math.min(p, totalPages - 1));
    setPage(next);
  };

  // 엑셀 다운로드
  const handleExcelDownload = () => {
    const excelData: (string | number)[][] = [
      ["#", ...TABLE_HEADERS.map((h) => h.label)],
      ...rows.map((r, idx) => [
        idx + 1 + page * size,
        r.purchaseDate,
        r.purchaseNo,
        r.supplierCode,
        r.supplierName,
        r.itemCode,
        r.itemName,
        r.qty,
        r.unitPrice,
        r.amount,
        r.expectedDate,
        r.status,
        r.remark,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "구매자재관리");

    const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelFile], { type: "application/octet-stream" });
    saveAs(blob, "구매자재관리_리스트.xlsx");
  };

  // 등록저장
  const handleSave = async () => {
    const newPurchaseNo = createForm.purchaseNo?.trim()
      ? createForm.purchaseNo.trim()
      : `PO-${Date.now()}`;

    const qty: number = Number(createForm.qty || 0);
    const unitPrice: number = Number(createForm.unitPrice) || 0;
    const amount = qty * unitPrice;

    try {
      const res = await fetch(`${API_BASE}/api/purchase/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseDate: createForm.purchaseDate,
          purchaseNo: newPurchaseNo,
          supplierCode: createForm.supplierCode,
          supplierName: createForm.supplierName,
          itemCode: createForm.itemCode,
          itemName: createForm.itemName,
          qty,
          unitPrice,
          amount,
          expectedDate: createForm.expectedDate,
          status: createForm.status || "대기",
          remark: createForm.remark || "",
        }),
      });

      if (!res.ok) throw new Error();

      setShowCreate(false);
      await fetchList(page);
      setCreateForm({
        purchaseDate: "",
        purchaseNo: "",
        supplierCode: "",
        supplierName: "",
        itemCode: "",
        itemName: "",
        qty: "",
        unitPrice: "",
        expectedDate: "",
        status: "대기",
        remark: "",
      });
      showAlert("구매자재가 등록되었습니다.");
    } catch (err) {
      console.error("구매자재 등록 실패", err);
      showAlert("구매자재를 등록하지 못했습니다.");
    }
  };

  // 상세열기
  const openDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/purchase/materials/${id}`);
      if (!res.ok) throw new Error();

      const data: PurchaseMaterialRow = await res.json();
      setSelected(data);

      setEditForm({
        purchaseDate: data.purchaseDate || "",
        purchaseNo: data.purchaseNo || "",
        supplierCode: data.supplierCode || "",
        supplierName: data.supplierName || "",
        itemCode: data.itemCode || "",
        itemName: data.itemName || "",
        qty: String(data.qty ?? ""),
        unitPrice: String(data.unitPrice ?? ""),
        expectedDate: data.expectedDate || "",
        status: data.status || "",
        remark: data.remark || "",
      });

      setShowDetail(true);
    } catch (err) {
      console.error("구매자재 상세 조회 실패", err);
      showAlert("구매자재 상세 정보를 불러오지 못했습니다.");
    }
  };

  // 수정저장
  const handleUpdate = async () => {
    if (!selected) return;

    const qty = Number(editForm.qty || 0);
    const unitPrice = Number(editForm.unitPrice || 0);
    const amount = qty * unitPrice;

    try {
      const res = await fetch(`${API_BASE}/api/purchase/materials/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          qty,
          unitPrice,
          amount,
        }),
      });

      if (!res.ok) throw new Error();

      setShowDetail(false);
      await fetchList(page);
      showAlert("구매자재가 수정되었습니다.");
    } catch (err) {
      console.error("구매자재 수정 실패", err);
      showAlert("구매자재를 수정하지 못했습니다.");
    }
  };

  // 삭제 확인 후 삭제
  const handleDeleteConfirmed = async () => {
    if (!selected) return;

    closeAlert();

    try {
      const res = await fetch(`${API_BASE}/api/purchase/materials/${selected.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setShowDetail(false);
      await fetchList(page);
      showAlert("구매자재가 삭제되었습니다.");
    } catch (err) {
      console.error("구매자재 삭제 실패", err);
      showAlert("구매자재를 삭제하지 못했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    showConfirm("구매자재를 삭제하시겠습니까?", handleDeleteConfirmed);
  };

  const thStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    padding: "13px 10px",
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
                      구매자재관리
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
                            minWidth: "110px",
                            borderRadius: "6px",
                            fontWeight: 600,
                            margin: 0,
                            padding: "0 14px",
                            fontSize: "13px",
                          }}
                        >
                          구매 등록
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
                    <div
                      style={{
                        padding: "10px 10px 0 10px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          overflowX: "auto",
                          overflowY: "hidden",
                        }}
                      >
                        <Table
                          className="mt-3 mb-0 align-middle"
                          style={{
                            minWidth: "1450px",
                            marginBottom: 0,
                          }}
                        >
                          <thead>
                            <tr className="text-center">
                              <th
                                className="bg-secondary text-white"
                                style={{
                                  ...thStyle,
                                  minWidth: "60px",
                                }}
                              >
                                #
                              </th>
                              {TABLE_HEADERS.map((h) => {
                                const widthMap: Record<string, string> = {
                                  purchaseDate: "110px",
                                  purchaseNo: "130px",
                                  supplierCode: "120px",
                                  supplierName: "140px",
                                  itemCode: "120px",
                                  itemName: "160px",
                                  qty: "90px",
                                  unitPrice: "100px",
                                  amount: "110px",
                                  expectedDate: "120px",
                                  status: "90px",
                                  remark: "160px",
                                };

                                return (
                                  <th
                                    key={h.key as string}
                                    className="bg-secondary text-white"
                                    style={{
                                      ...thStyle,
                                      minWidth: widthMap[h.key as string] || "100px",
                                    }}
                                  >
                                    {h.label}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>

                          <tbody>
                            {(rows || []).map((r, i) => (
                              <tr key={r.id ?? i} className="text-center">
                                <td
                                  style={{
                                    ...tdStyle,
                                    color: "#475569",
                                    fontWeight: 600,
                                  }}
                                  title={String(i + 1 + page * size)}
                                >
                                  {i + 1 + page * size}
                                </td>

                                <td style={tdStyle} title={r.purchaseDate}>
                                  {r.purchaseDate}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "130px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.purchaseNo}
                                >
                                  <span
                                    onClick={() => openDetail(r.id)}
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
                                  >
                                    {r.purchaseNo}
                                  </span>
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "120px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.supplierCode}
                                >
                                  {r.supplierCode}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "140px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.supplierName}
                                >
                                  {r.supplierName}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "120px",
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
                                    maxWidth: "160px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.itemName}
                                >
                                  {r.itemName}
                                </td>

                                <td style={tdStyle} title={String(r.qty)}>
                                  {r.qty}
                                </td>

                                <td style={tdStyle} title={String(r.unitPrice)}>
                                  {r.unitPrice}
                                </td>

                                <td style={tdStyle} title={String(r.amount)}>
                                  {r.amount}
                                </td>

                                <td style={tdStyle} title={r.expectedDate}>
                                  {r.expectedDate}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "90px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.status}
                                >
                                  {r.status}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "160px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.remark}
                                >
                                  {r.remark}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

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
                          총{totalElements}건 {page + 1} / {totalPages || 1} 페이지
                        </PageTotal>
                      </Center>
                    </div>
                  </div>
                </Ctap>
              </Col>
            </Row>
          </Container>
        </DflexColumn>
      </Wrapper>

      {/* 등록 모달 */}
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
            구매 등록
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
                구매일자
              </Form.Label>
              <Form.Control
                type="date"
                name="purchaseDate"
                value={createForm.purchaseDate}
                onChange={onCreateChange}
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
                구매번호
              </Form.Label>
              <Form.Control
                name="purchaseNo"
                placeholder="구매번호(비우면 자동생성)"
                value={createForm.purchaseNo}
                onChange={onCreateChange}
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
                공급처코드
              </Form.Label>
              <Form.Control
                name="supplierCode"
                placeholder="공급처코드"
                value={createForm.supplierCode}
                onChange={onCreateChange}
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
                공급처명
              </Form.Label>
              <Form.Control
                name="supplierName"
                placeholder="공급처명"
                value={createForm.supplierName}
                onChange={onCreateChange}
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
                value={createForm.itemCode}
                onChange={onCreateChange}
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
                value={createForm.itemName}
                onChange={onCreateChange}
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
                수량
              </Form.Label>
              <Form.Control
                type="number"
                name="qty"
                placeholder="수량"
                value={createForm.qty}
                onChange={onCreateChange}
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
                단가
              </Form.Label>
              <Form.Control
                type="number"
                name="unitPrice"
                placeholder="단가"
                value={createForm.unitPrice}
                onChange={onCreateChange}
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
                입고예정일
              </Form.Label>
              <Form.Control
                type="date"
                name="expectedDate"
                value={createForm.expectedDate}
                onChange={onCreateChange}
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
                상태
              </Form.Label>
              <Form.Select
                name="status"
                value={createForm.status}
                onChange={onCreateChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="대기">대기</option>
                <option value="진행">진행</option>
                <option value="완료">완료</option>
              </Form.Select>
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
                비고
              </Form.Label>
              <Form.Control
                name="remark"
                placeholder="비고"
                value={createForm.remark}
                onChange={onCreateChange}
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

      {/* 상세(수정/삭제) 모달 */}
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
            구매 상세
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
                구매일자
              </Form.Label>
              <Form.Control
                type="date"
                name="purchaseDate"
                value={editForm.purchaseDate}
                onChange={onEditChange}
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
                구매번호
              </Form.Label>
              <Form.Control
                name="purchaseNo"
                value={editForm.purchaseNo}
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
                공급처코드
              </Form.Label>
              <Form.Control
                name="supplierCode"
                placeholder="공급처코드"
                value={editForm.supplierCode}
                onChange={onEditChange}
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
                공급처명
              </Form.Label>
              <Form.Control
                name="supplierName"
                placeholder="공급처명"
                value={editForm.supplierName}
                onChange={onEditChange}
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
                value={editForm.itemCode}
                onChange={onEditChange}
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
                onChange={onEditChange}
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
                수량
              </Form.Label>
              <Form.Control
                type="number"
                name="qty"
                placeholder="수량"
                value={editForm.qty}
                onChange={onEditChange}
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
                단가
              </Form.Label>
              <Form.Control
                type="number"
                name="unitPrice"
                placeholder="단가"
                value={editForm.unitPrice}
                onChange={onEditChange}
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
                입고예정일
              </Form.Label>
              <Form.Control
                type="date"
                name="expectedDate"
                value={editForm.expectedDate}
                onChange={onEditChange}
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
                상태
              </Form.Label>
              <Form.Select
                name="status"
                value={editForm.status}
                onChange={onEditChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="대기">대기</option>
                <option value="진행">진행</option>
                <option value="완료">완료</option>
              </Form.Select>
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
                비고
              </Form.Label>
              <Form.Control
                name="remark"
                placeholder="비고"
                value={editForm.remark}
                onChange={onEditChange}
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

export default PurchaseMaterial;