import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, Content, Ctap } from "../styled/Sales.styles";
import { SpaceBetween, Center, Dflex, PageTotal } from "../styled/Component.styles";
import { Container, Row, Col, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:9500";

// ✅ 재고(품목 마스터 + 현재고) 예시 타입
type InventoryItem = {
  id: number;
  itemCode: string;
  itemName: string;
  itemGroup?: string;      // 품목그룹
  spec?: string;           // 규격
  warehouse?: string;      // 창고
  location?: string;       // 위치
  stockQty: number;        // 현재고
  safetyStock?: number;    // 안전재고
  inPrice?: number;        // 입고단가(평균/기준)
  outPrice?: number;       // 출고단가(판매가)
  useYn: "Y" | "N";        // 사용여부
  remark?: string;         // 비고
  updatedAt?: string;      // 최종수정일(있으면 표시)
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

  // ✅ (중요) 네 코드에 버그 있었던 부분: setCreateForm ❌ → setEditForm ✅
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
    const stockQty = Number(createForm.stockQty || 0);
    const safetyStock = Number(createForm.safetyStock || 0);
    const inPrice = Number(createForm.inPrice || 0);
    const outPrice = Number(createForm.outPrice || 0);

    const res = await fetch(`${API_BASE}/api/inventory/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemCode: createForm.itemCode,
        itemName: createForm.itemName,
        itemGroup: createForm.itemGroup || null,
        spec: createForm.spec || null,
        warehouse: createForm.warehouse || null,
        location: createForm.location || null,
        stockQty,
        safetyStock,
        inPrice,
        outPrice,
        useYn: createForm.useYn || "Y",
        remark: createForm.remark || "",
      }),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      alert(raw || "등록 실패");
      return;
    }

    setShowCreate(false);
    fetchList(page);

    // 폼 초기화
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

    const stockQty = Number(editForm.stockQty || 0);
    const safetyStock = Number(editForm.safetyStock || 0);
    const inPrice = Number(editForm.inPrice || 0);
    const outPrice = Number(editForm.outPrice || 0);

    const res = await fetch(`${API_BASE}/api/inventory/items/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        stockQty,
        safetyStock,
        inPrice,
        outPrice,
      }),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
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

  return (
    <>
      <Wrapper>
        <Lnb />
        <DflexColumn>
          <Content>
            <Top />
          </Content>

          <Container fluid className="p-0">
            <Row>
              <Col>
                <Ctap>
                  <SpaceBetween>
                    <h4>재고관리</h4>
                    <Dflex>
                      <Button className="mx-2 my-3" onClick={handleExcelDownload} variant="success">
                        엑셀다운로드
                      </Button>
                      <Button className="my-3" onClick={() => setShowCreate(true)}>
                        재고등록
                      </Button>
                    </Dflex>
                  </SpaceBetween>

                  <Table bordered hover>
                    <thead>
                      <tr className="text-center">
                        <th>#</th>
                        {TABLE_HEADERS.map((h) => (
                          <th key={h.key as string}>{h.label}</th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {(rows || []).map((r, i) => (
                        <tr key={r.id ?? i} className="text-center">
                          <td>{i + 1 + page * size}</td>

                          <td>{r.itemCode}</td>

                          <td style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => openDetail(r.id)}>
                            {r.itemName}
                          </td>

                          <td>{r.itemGroup ?? ""}</td>
                          <td>{r.spec ?? ""}</td>
                          <td>{r.warehouse ?? ""}</td>
                          <td>{r.location ?? ""}</td>
                          <td>{r.stockQty}</td>
                          <td>{r.safetyStock ?? 0}</td>
                          <td>{r.inPrice ?? 0}</td>
                          <td>{r.outPrice ?? 0}</td>
                          <td>{r.useYn}</td>
                          <td>{r.remark ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <Center>
                    {totalPages > 0 && (
                      <Pagination>
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

                        <Pagination.Next disabled={page >= totalPages - 1} onClick={() => goPage(page + 1)} />
                        <Pagination.Last disabled={page >= totalPages - 1} onClick={() => goPage(totalPages - 1)} />
                      </Pagination>
                    )}

                    <PageTotal>
                      총{totalElements}건 {page + 1} / {totalPages || 1} 페이지
                    </PageTotal>
                  </Center>
                </Ctap>
              </Col>
            </Row>
          </Container>
        </DflexColumn>
      </Wrapper>

      {/* ✅ 등록 모달 */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>재고 등록</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control className="mb-2" name="itemCode" placeholder="품목코드" value={createForm.itemCode} onChange={onCreateChange} />
            <Form.Control className="mb-2" name="itemName" placeholder="품목명" value={createForm.itemName} onChange={onCreateChange} />

            <Form.Control className="mb-2" name="itemGroup" placeholder="품목그룹" value={createForm.itemGroup} onChange={onCreateChange} />
            <Form.Control className="mb-2" name="spec" placeholder="규격" value={createForm.spec} onChange={onCreateChange} />

            <Form.Control className="mb-2" name="warehouse" placeholder="창고" value={createForm.warehouse} onChange={onCreateChange} />
            <Form.Control className="mb-2" name="location" placeholder="위치" value={createForm.location} onChange={onCreateChange} />

            <Form.Control className="mb-2" type="number" name="stockQty" placeholder="현재고" value={createForm.stockQty} onChange={onCreateChange} />
            <Form.Control className="mb-2" type="number" name="safetyStock" placeholder="안전재고" value={createForm.safetyStock} onChange={onCreateChange} />

            <Form.Control className="mb-2" type="number" name="inPrice" placeholder="입고단가" value={createForm.inPrice} onChange={onCreateChange} />
            <Form.Control className="mb-2" type="number" name="outPrice" placeholder="출고단가" value={createForm.outPrice} onChange={onCreateChange} />

            <Form.Select className="mb-2" name="useYn" value={createForm.useYn} onChange={onCreateChange}>
              <option value="Y">사용</option>
              <option value="N">미사용</option>
            </Form.Select>

            <Form.Control className="mb-2" name="remark" placeholder="비고" value={createForm.remark} onChange={onCreateChange} />
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
          <Modal.Title>재고 상세</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* 품목코드/품목명 수정 막고 싶으면 disabled 처리하면 됨 */}
            <Form.Control className="mb-2" name="itemCode" placeholder="품목코드" value={editForm.itemCode} onChange={onEditChange} />
            <Form.Control className="mb-2" name="itemName" placeholder="품목명" value={editForm.itemName} onChange={onEditChange} />

            <Form.Control className="mb-2" name="itemGroup" placeholder="품목그룹" value={editForm.itemGroup} onChange={onEditChange} />
            <Form.Control className="mb-2" name="spec" placeholder="규격" value={editForm.spec} onChange={onEditChange} />

            <Form.Control className="mb-2" name="warehouse" placeholder="창고" value={editForm.warehouse} onChange={onEditChange} />
            <Form.Control className="mb-2" name="location" placeholder="위치" value={editForm.location} onChange={onEditChange} />

            <Form.Control className="mb-2" type="number" name="stockQty" placeholder="현재고" value={editForm.stockQty} onChange={onEditChange} />
            <Form.Control className="mb-2" type="number" name="safetyStock" placeholder="안전재고" value={editForm.safetyStock} onChange={onEditChange} />

            <Form.Control className="mb-2" type="number" name="inPrice" placeholder="입고단가" value={editForm.inPrice} onChange={onEditChange} />
            <Form.Control className="mb-2" type="number" name="outPrice" placeholder="출고단가" value={editForm.outPrice} onChange={onEditChange} />

            <Form.Select className="mb-2" name="useYn" value={editForm.useYn} onChange={onEditChange}>
              <option value="Y">사용</option>
              <option value="N">미사용</option>
            </Form.Select>

            <Form.Control className="mb-2" name="remark" placeholder="비고" value={editForm.remark} onChange={onEditChange} />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            수정 저장
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InventoryManagement;
