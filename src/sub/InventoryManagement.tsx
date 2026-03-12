import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, Content, Ctap, DflexColumn2 } from "../styled/Sales.styles";
import { Center, PageTotal } from "../styled/Component.styles";
import { Container, Row, Col, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:9500";

// ✅ 재고(품목 마스터 + 현재고) 예시 타입
type InventoryItem = {
  id: number;
  itemCode: string;
  itemName: string;
  itemGroup?: string;
  spec?: string;
  warehouse?: string;
  location?: string;
  stockQty: number;
  safetyStock?: number;
  inPrice?: number;
  outPrice?: number;
  useYn: "Y" | "N";
  remark?: string;
  updatedAt?: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const TABLE_HEADERS: { key: keyof InventoryItem; label: string }[] = [
  { key: "itemCode", label: "품목코드" },
  { key: "itemName", label: "품목명" },
  { key: "itemGroup", label: "품목그룹" },
  { key: "spec", label: "규격" },
  { key: "warehouse", label: "창고" },
  { key: "location", label: "위치" },
  { key: "stockQty", label: "현재고" },
  { key: "safetyStock", label: "안전재고" },
  { key: "inPrice", label: "입고단가" },
  { key: "outPrice", label: "출고단가" },
  { key: "useYn", label: "사용여부" },
  { key: "remark", label: "비고" },
];

const InventoryManagement = () => {
  const [rows, setRows] = useState<InventoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ✅ 등록 모달
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    itemCode: "",
    itemName: "",
    itemGroup: "",
    spec: "",
    warehouse: "",
    location: "",
    stockQty: "",
    safetyStock: "",
    inPrice: "",
    outPrice: "",
    useYn: "Y" as "Y" | "N",
    remark: "",
  });

  // ✅ 상세(수정/삭제) 모달
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({
    itemCode: "",
    itemName: "",
    itemGroup: "",
    spec: "",
    warehouse: "",
    location: "",
    stockQty: "",
    safetyStock: "",
    inPrice: "",
    outPrice: "",
    useYn: "Y" as "Y" | "N",
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

  // ✅ 목록 조회(페이징)
  const fetchList = async (p: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/inventory/items?page=${p}&size=${size}`);
      if (!res.ok) throw new Error("서버오류");
      const data: PageResponse<InventoryItem> = await res.json();
      setRows(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error("재고 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page]);

  const goPage = (p: number) => {
    const next = Math.max(0, Math.min(p, totalPages - 1));
    setPage(next);
  };

  // ✅ 엑셀 다운로드
  const handleExcelDownload = () => {
    const excelData: (string | number)[][] = [
      ["#", ...TABLE_HEADERS.map((h) => h.label)],
      ...rows.map((r, idx) => [
        idx + 1 + page * size,
        r.itemCode,
        r.itemName,
        r.itemGroup ?? "",
        r.spec ?? "",
        r.warehouse ?? "",
        r.location ?? "",
        r.stockQty ?? 0,
        r.safetyStock ?? 0,
        r.inPrice ?? 0,
        r.outPrice ?? 0,
        r.useYn ?? "Y",
        r.remark ?? "",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "재고관리");

    const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelFile], { type: "application/octet-stream" });
    saveAs(blob, "재고관리_리스트.xlsx");
  };

  // ✅ 등록 저장
  const handleSave = async () => {
    if (!createForm.itemCode.trim()) return alert("품목코드는 필수 입니다");
    if (!createForm.itemName.trim()) return alert("품목명은 필수 입니다");
    if (!createForm.itemGroup.trim()) return alert("품목그룹은 필수 입니다");
    if (!createForm.warehouse.trim()) return alert("창고는 필수 입니다");
    if (!createForm.location.trim()) return alert("위치는 필수 입니다");
    if (!createForm.spec.trim()) return alert("규격은  필수 입니다");

    const stockQty = Number(createForm.stockQty || 0);
    const safetyStock = Number(createForm.safetyStock || 0);
    const inPrice = Number(createForm.inPrice || 0);
    const outPrice = Number(createForm.outPrice || 0);

    const payload = {
      itemCode: createForm.itemCode.trim(),
      itemName: createForm.itemName.trim(),
      itemGroup: createForm.itemGroup.trim(),
      spec: createForm.spec.trim(),
      warehouse: createForm.warehouse.trim(),
      location: createForm.location.trim(),
      stockQty,
      safetyStock,
      inPrice,
      outPrice,
      useYn: createForm.useYn || "Y",
      remark: createForm.remark.trim() ? createForm.remark.trim() : null,
    };

    const res = await fetch(`${API_BASE}/api/inventory/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      console.log("등록 실패 응답: ", raw);
      alert(raw || "등록 실패");
      return;
    }

    setShowCreate(false);
    fetchList(page);

    setCreateForm({
      itemCode: "",
      itemName: "",
      itemGroup: "",
      spec: "",
      warehouse: "",
      location: "",
      stockQty: "",
      safetyStock: "",
      inPrice: "",
      outPrice: "",
      useYn: "Y",
      remark: "",
    });
  };

  // ✅ 상세 열기
  const openDetail = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/inventory/items/${id}`);
    if (!res.ok) throw new Error("상세 조회 실패");

    const data: InventoryItem = await res.json();
    setSelected(data);

    setEditForm({
      itemCode: data.itemCode || "",
      itemName: data.itemName || "",
      itemGroup: data.itemGroup || "",
      spec: data.spec || "",
      warehouse: data.warehouse || "",
      location: data.location || "",
      stockQty: String(data.stockQty ?? ""),
      safetyStock: String(data.safetyStock ?? ""),
      inPrice: String(data.inPrice ?? ""),
      outPrice: String(data.outPrice ?? ""),
      useYn: (data.useYn || "Y") as "Y" | "N",
      remark: data.remark || "",
    });

    setShowDetail(true);
  };

  // ✅ 수정 저장
  const handleUpdate = async () => {
    if (!selected) return;

    if (!editForm.itemCode.trim()) return alert("품목코드는 필수입니다");
    if (!editForm.itemName.trim()) return alert("품목명은 필수입니다");
    if (!editForm.itemGroup.trim()) return alert("품목그룹은 필수입니다");
    if (!editForm.warehouse.trim()) return alert("창고는 필수입니다");
    if (!editForm.location.trim()) return alert("위치는 필수입니다");
    if (!editForm.spec.trim()) return alert("규격은 필수입니다");

    const stockQty = Number(editForm.stockQty || 0);
    const safetyStock = Number(editForm.safetyStock || 0);
    const inPrice = Number(editForm.inPrice || 0);
    const outPrice = Number(editForm.outPrice || 0);

    const payload = {
      itemCode: editForm.itemCode.trim(),
      itemName: editForm.itemName.trim(),
      itemGroup: editForm.itemGroup.trim(),
      warehouse: editForm.warehouse.trim(),
      location: editForm.location.trim(),
      spec: editForm.spec.trim(),
      stockQty,
      safetyStock,
      inPrice,
      outPrice,
      useYn: editForm.useYn || "Y",
      remark: editForm.remark.trim() ? editForm.remark.trim() : null,
    };

    const res = await fetch(`${API_BASE}/api/inventory/items/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      console.log("수정 실패 응답: ", raw);
      alert(raw || "수정 실패");
      return;
    }

    setShowDetail(false);
    fetchList(page);
  };

  // ✅ 삭제
  const handleDelete = async () => {
    if (!selected) return;

    const ok = window.confirm("정말 삭제 할까요?");
    if (!ok) return;

    const res = await fetch(`${API_BASE}/api/inventory/items/${selected.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      alert(raw || "삭제 실패");
      return;
    }

    setShowDetail(false);
    fetchList(page);
  };

  const canSave =
    !!createForm.itemCode.trim() &&
    !!createForm.itemName.trim() &&
    !!createForm.itemGroup.trim() &&
    !!createForm.warehouse.trim() &&
    !!createForm.location.trim();

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
                      재고관리
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
                          재고 등록
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
                                  itemCode: "120px",
                                  itemName: "160px",
                                  itemGroup: "120px",
                                  spec: "110px",
                                  warehouse: "100px",
                                  location: "110px",
                                  stockQty: "90px",
                                  safetyStock: "100px",
                                  inPrice: "100px",
                                  outPrice: "100px",
                                  useYn: "90px",
                                  remark: "180px",
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
                                    cursor: "pointer",
                                    color: "#0d6efd",
                                    fontWeight: 600,
                                    textDecoration: "underline",
                                    maxWidth: "160px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.itemName}
                                  onClick={() => openDetail(r.id)}
                                >
                                  {r.itemName}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "120px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.itemGroup ?? ""}
                                >
                                  {r.itemGroup ?? ""}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "110px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.spec ?? ""}
                                >
                                  {r.spec ?? ""}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "100px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.warehouse ?? ""}
                                >
                                  {r.warehouse ?? ""}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "110px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.location ?? ""}
                                >
                                  {r.location ?? ""}
                                </td>

                                <td style={tdStyle} title={String(r.stockQty)}>
                                  {r.stockQty}
                                </td>

                                <td style={tdStyle} title={String(r.safetyStock ?? 0)}>
                                  {r.safetyStock ?? 0}
                                </td>

                                <td style={tdStyle} title={String(r.inPrice ?? 0)}>
                                  {r.inPrice ?? 0}
                                </td>

                                <td style={tdStyle} title={String(r.outPrice ?? 0)}>
                                  {r.outPrice ?? 0}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "90px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.useYn}
                                >
                                  {r.useYn}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "180px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.remark ?? ""}
                                >
                                  {r.remark ?? ""}
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

      {/* ✅ 등록 모달 */}
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
            재고 등록
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
                품목그룹 *
              </Form.Label>
              <Form.Control
                name="itemGroup"
                placeholder="품목그룹"
                value={createForm.itemGroup}
                onChange={onCreateChange}
                required
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
                규격
              </Form.Label>
              <Form.Control
                name="spec"
                placeholder="규격"
                value={createForm.spec}
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
                창고 *
              </Form.Label>
              <Form.Control
                name="warehouse"
                placeholder="창고"
                value={createForm.warehouse}
                onChange={onCreateChange}
                required
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
                위치 *
              </Form.Label>
              <Form.Control
                name="location"
                placeholder="위치"
                value={createForm.location}
                onChange={onCreateChange}
                required
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
                현재고
              </Form.Label>
              <Form.Control
                type="number"
                name="stockQty"
                placeholder="현재고"
                value={createForm.stockQty}
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
                안전재고
              </Form.Label>
              <Form.Control
                type="number"
                name="safetyStock"
                placeholder="안전재고"
                value={createForm.safetyStock}
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
                입고단가
              </Form.Label>
              <Form.Control
                type="number"
                name="inPrice"
                placeholder="입고단가"
                value={createForm.inPrice}
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
                출고단가
              </Form.Label>
              <Form.Control
                type="number"
                name="outPrice"
                placeholder="출고단가"
                value={createForm.outPrice}
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
                사용여부
              </Form.Label>
              <Form.Select
                name="useYn"
                value={createForm.useYn}
                onChange={onCreateChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="Y">사용</option>
                <option value="N">미사용</option>
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
            disabled={!canSave}
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

      {/* ✅ 상세(수정/삭제) 모달 */}
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
            재고 상세
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
                품목그룹
              </Form.Label>
              <Form.Control
                name="itemGroup"
                placeholder="품목그룹"
                value={editForm.itemGroup}
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
                규격
              </Form.Label>
              <Form.Control
                name="spec"
                placeholder="규격"
                value={editForm.spec}
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
                창고
              </Form.Label>
              <Form.Control
                name="warehouse"
                placeholder="창고"
                value={editForm.warehouse}
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
                위치
              </Form.Label>
              <Form.Control
                name="location"
                placeholder="위치"
                value={editForm.location}
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
                현재고
              </Form.Label>
              <Form.Control
                type="number"
                name="stockQty"
                placeholder="현재고"
                value={editForm.stockQty}
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
                안전재고
              </Form.Label>
              <Form.Control
                type="number"
                name="safetyStock"
                placeholder="안전재고"
                value={editForm.safetyStock}
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
                입고단가
              </Form.Label>
              <Form.Control
                type="number"
                name="inPrice"
                placeholder="입고단가"
                value={editForm.inPrice}
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
                출고단가
              </Form.Label>
              <Form.Control
                type="number"
                name="outPrice"
                placeholder="출고단가"
                value={editForm.outPrice}
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
                사용여부
              </Form.Label>
              <Form.Select
                name="useYn"
                value={editForm.useYn}
                onChange={onEditChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="Y">사용</option>
                <option value="N">미사용</option>
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
    </>
  );
};

export default InventoryManagement;