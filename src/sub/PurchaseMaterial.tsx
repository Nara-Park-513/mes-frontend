import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, Content, Ctap, DflexColumn2 } from "../styled/Sales.styles";
import { Center, PageTotal } from "../styled/Component.styles";
import { Container, Row, Col, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:9500";

//구매자재
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

  //등록모달
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

  //상세(수정/삭제)모달
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

  const onCreateChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  //목록조회 (페이징)
  const fetchList = async (p: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/purchase/materials?page=${p}&size=${size}`);
      if (!res.ok) throw new Error("서버오류");
      const data: PageResponse<PurchaseMaterialRow> = await res.json();
      setRows(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error("구매자재 목록 조회실패", err);
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page]);

  const goPage = (p: number) => {
    const next = Math.max(0, Math.min(p, totalPages - 1));
    setPage(next);
  };

  //엑셀 다운로드
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

  //등록저장
  const handleSave = async () => {
    const newPurchaseNo = createForm.purchaseNo?.trim()
      ? createForm.purchaseNo.trim()
      : `PO-${Date.now()}`;

    const qty: number = Number(createForm.qty || 0);
    const unitPrice: number = Number(createForm.unitPrice) || 0;
    const amount = qty * unitPrice;

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

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      alert(raw || "등록실패");
      return;
    }

    setShowCreate(false);
    fetchList(page);
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
  };

  //상세열기
  const openDetail = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/purchase/materials/${id}`);
    if (!res.ok) throw new Error("상세 조회 실패");

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
  };

  //수정저장
  const handleUpdate = async () => {
    if (!selected) return;

    const qty = Number(editForm.qty || 0);
    const unitPrice = Number(editForm.unitPrice || 0);
    const amount = qty * unitPrice;

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

    if (!res.ok) throw new Error("수정 실패");

    setShowDetail(false);
    fetchList(page);
  };

  //삭제
  const handleDelete = async () => {
    if (!selected) return;

    const ok = window.confirm("정말 삭제 할까요?");
    if (!ok) return;

    const res = await fetch(`${API_BASE}/api/purchase/materials/${selected.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("삭제 실패");

    setShowDetail(false);
    fetchList(page);
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
                                key={h.key as string}
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
                            <tr key={r.id ?? i} className="text-center">
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
                                {r.purchaseDate}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <span
                                  onClick={() => openDetail(r.id)}
                                  style={{
                                    cursor: "pointer",
                                    color: "#0d6efd",
                                    textDecoration: "underline",
                                    fontWeight: 600,
                                  }}
                                >
                                  {r.purchaseNo}
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
                                {r.supplierCode}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.supplierName}
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
                                {r.qty}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.unitPrice}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.amount}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.expectedDate}
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

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.remark}
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

      {/* ✅ 등록 모달 */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>구매 등록</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-2"
              type="date"
              name="purchaseDate"
              value={createForm.purchaseDate}
              onChange={onCreateChange}
            />

            <Form.Control
              className="mb-2"
              name="purchaseNo"
              placeholder="구매번호(비우면 자동생성)"
              value={createForm.purchaseNo}
              onChange={onCreateChange}
            />

            <Form.Control
              className="mb-2"
              name="supplierCode"
              placeholder="공급처코드"
              value={createForm.supplierCode}
              onChange={onCreateChange}
            />
            <Form.Control
              className="mb-2"
              name="supplierName"
              placeholder="공급처명"
              value={createForm.supplierName}
              onChange={onCreateChange}
            />

            <Form.Control
              className="mb-2"
              name="itemCode"
              placeholder="품목코드"
              value={createForm.itemCode}
              onChange={onCreateChange}
            />
            <Form.Control
              className="mb-2"
              name="itemName"
              placeholder="품목명"
              value={createForm.itemName}
              onChange={onCreateChange}
            />

            <Form.Control
              className="mb-2"
              type="number"
              name="qty"
              placeholder="수량"
              value={createForm.qty}
              onChange={onCreateChange}
            />
            <Form.Control
              className="mb-2"
              type="number"
              name="unitPrice"
              placeholder="단가"
              value={createForm.unitPrice}
              onChange={onCreateChange}
            />

            <Form.Control
              className="mb-2"
              type="date"
              name="expectedDate"
              value={createForm.expectedDate}
              onChange={onCreateChange}
            />

            <Form.Select className="mb-2" name="status" value={createForm.status} onChange={onCreateChange}>
              <option value="대기">대기</option>
              <option value="진행">진행</option>
              <option value="완료">완료</option>
            </Form.Select>

            <Form.Control
              className="mb-2"
              name="remark"
              placeholder="비고"
              value={createForm.remark}
              onChange={onCreateChange}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>
            닫기
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ 상세(수정/삭제) 모달 */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>구매 상세</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-2"
              type="date"
              name="purchaseDate"
              value={editForm.purchaseDate}
              onChange={onEditChange}
            />

            <Form.Control className="mb-2" name="purchaseNo" value={editForm.purchaseNo} disabled />

            <Form.Control
              className="mb-2"
              name="supplierCode"
              placeholder="공급처코드"
              value={editForm.supplierCode}
              onChange={onEditChange}
            />
            <Form.Control
              className="mb-2"
              name="supplierName"
              placeholder="공급처명"
              value={editForm.supplierName}
              onChange={onEditChange}
            />

            <Form.Control
              className="mb-2"
              name="itemCode"
              placeholder="품목코드"
              value={editForm.itemCode}
              onChange={onEditChange}
            />
            <Form.Control
              className="mb-2"
              name="itemName"
              placeholder="품목명"
              value={editForm.itemName}
              onChange={onEditChange}
            />

            <Form.Control
              className="mb-2"
              type="number"
              name="qty"
              placeholder="수량"
              value={editForm.qty}
              onChange={onEditChange}
            />
            <Form.Control
              className="mb-2"
              type="number"
              name="unitPrice"
              placeholder="단가"
              value={editForm.unitPrice}
              onChange={onEditChange}
            />

            <Form.Control
              className="mb-2"
              type="date"
              name="expectedDate"
              value={editForm.expectedDate}
              onChange={onEditChange}
            />

            <Form.Select className="mb-2" name="status" value={editForm.status} onChange={onEditChange}>
              <option value="대기">대기</option>
              <option value="진행">진행</option>
              <option value="완료">완료</option>
            </Form.Select>

            <Form.Control
              className="mb-2"
              name="remark"
              placeholder="비고"
              value={editForm.remark}
              onChange={onEditChange}
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

export default PurchaseMaterial;