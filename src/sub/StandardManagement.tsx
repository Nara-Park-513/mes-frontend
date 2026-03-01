import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";

import { Wrapper, DflexColumn, Content, Ctap } from "../styled/Sales.styles";
import { SpaceBetween, Center, Dflex, PageTotal } from "../styled/Component.styles";

import { Container, Row, Col, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:9500";

type StandardItem = {
  id: number;
  stdCode: string;
  stdName: string;
  stdGroup: string;
  unit?: string;
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

const TABLE_HEADERS: { key: keyof StandardItem; label: string }[] = [
  { key: "stdCode", label: "기준코드" },
  { key: "stdName", label: "기준명" },
  { key: "stdGroup", label: "그룹" },
  { key: "unit", label: "단위" },
  { key: "useYn", label: "사용여부" },
  { key: "remark", label: "비고" },
];

const StandardManagement = () => {
  const [rows, setRows] = useState<StandardItem[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 등록 모달
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    stdCode: "",
    stdName: "",
    stdGroup: "",
    unit: "",
    useYn: "Y" as "Y" | "N",
    remark: "",
  });

  // 상세/수정 모달
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<StandardItem | null>(null);
  const [editForm, setEditForm] = useState({
    stdCode: "",
    stdName: "",
    stdGroup: "",
    unit: "",
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

  // 목록 조회
  const fetchList = async (p: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/standards?page=${p}&size=${size}`);
      if (!res.ok) throw new Error("서버 오류");

      const data: PageResponse<StandardItem> = await res.json();
      setRows(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error("기준정보 목록 조회 실패", err);
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
    const excelData = [
      ["#", ...TABLE_HEADERS.map((h) => h.label)],
      ...rows.map((r, idx) => [
        idx + 1 + page * size,
        r.stdCode,
        r.stdName,
        r.stdGroup ?? "",
        r.unit ?? "",
        r.useYn,
        r.remark ?? "",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "기준정보관리");

    const file = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([file]), "기준정보관리_리스트.xlsx");
  };

  // 등록
  const handleSave = async () => {
    const res = await fetch(`${API_BASE}/api/standards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      alert(raw || "등록 실패");
      return;
    }

    setShowCreate(false);
    fetchList(page);

    setCreateForm({
      stdCode: "",
      stdName: "",
      stdGroup: "",
      unit: "",
      useYn: "Y",
      remark: "",
    });
  };

  // 상세 열기
  const openDetail = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/standards/${id}`);
    if (!res.ok) throw new Error("상세 조회 실패");

    const data: StandardItem = await res.json();
    setSelected(data);
    setEditForm({
      stdCode: data.stdCode,
      stdName: data.stdName,
      stdGroup: data.stdGroup,
      unit: data.unit ?? "",
      useYn: data.useYn,
      remark: data.remark ?? "",
    });
    setShowDetail(true);
  };

  // ✅ FIX: 수정
  const handleUpdate = async () => {
    if (!selected) return;

    const res = await fetch(`${API_BASE}/api/standards/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      alert(raw || "수정 실패");
      return;
    }

    setShowDetail(false);
    fetchList(page);
  };

  // 삭제
  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm("정말 삭제 할까요?")) return;

    const res = await fetch(`${API_BASE}/api/standards/${selected.id}`, {
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
                    <h4>기준정보관리</h4>
                    <Dflex>
                      <Button className="mx-2 my-3" onClick={handleExcelDownload} variant="success">
                        엑셀다운로드
                      </Button>
                      <Button className="my-3" onClick={() => setShowCreate(true)} variant="success">
                        기준정보등록
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
                      {rows.map((r, i) => (
                        <tr key={r.id} className="text-center">
                          <td>{i + 1 + page * size}</td>
                          <td onClick={() => openDetail(r.id)} style={{ cursor: "pointer" }}>
                            {r.stdCode}
                          </td>
                          <td>{r.stdName}</td>
                          <td>{r.stdGroup}</td>
                          <td>{r.unit ?? ""}</td>
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
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <Pagination.Item key={i} active={i === page} onClick={() => goPage(i)}>
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next disabled={page >= totalPages - 1} onClick={() => goPage(page + 1)} />
                        <Pagination.Last disabled={page >= totalPages - 1} onClick={() => goPage(totalPages - 1)} />
                      </Pagination>
                    )}
                    <PageTotal>
                      총 {totalElements}건 {page + 1} / {totalPages || 1} 페이지
                    </PageTotal>
                  </Center>
                </Ctap>
              </Col>
            </Row>
          </Container>
        </DflexColumn>
      </Wrapper>

      {/* 등록 모달 */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>기준정보 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control className="mb-2" name="stdCode" placeholder="기준코드 (품목 기준)" value={createForm.stdCode} onChange={onCreateChange} />
            <Form.Control className="mb-2" name="stdName" placeholder="기준명 (품목 기준)" value={createForm.stdName} onChange={onCreateChange} />
            <Form.Control className="mb-2" name="stdGroup" placeholder="그룹" value={createForm.stdGroup} onChange={onCreateChange} />
            {/* ✅ FIX */}
            <Form.Control className="mb-2" name="unit" placeholder="단위" value={createForm.unit} onChange={onCreateChange} />
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

      {/* 상세/수정 모달 */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>기준정보 상세</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control className="mb-2" name="stdCode" value={editForm.stdCode} onChange={onEditChange} />
            <Form.Control className="mb-2" name="stdName" value={editForm.stdName} onChange={onEditChange} />
            <Form.Control className="mb-2" name="stdGroup" value={editForm.stdGroup} onChange={onEditChange} />
            <Form.Control className="mb-2" name="unit" value={editForm.unit} onChange={onEditChange} />
            <Form.Select className="mb-2" name="useYn" value={editForm.useYn} onChange={onEditChange}>
              <option value="Y">사용</option>
              <option value="N">미사용</option>
            </Form.Select>
            <Form.Control className="mb-2" name="remark" value={editForm.remark} onChange={onEditChange} />
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

export default StandardManagement;