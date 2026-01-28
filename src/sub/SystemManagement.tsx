import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";

import { Wrapper, DflexColumn, Content, Ctap } from "../styled/Sales.styles";
import { SpaceBetween, Center, Dflex, PageTotal } from "../styled/Component.styles";

import { Container, Row, Col, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:9500";

// ✅ 상태값 오타 정리: INACTIVE
type SystemStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

type SystemItem = {
  id: number;
  systemCode: string;
  systemName: string;
  systemGroup: string;
  owner?: string;
  version?: string;
  status?: SystemStatus;
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

const TABLE_HEADERS: { key: keyof SystemItem; label: string }[] = [
  { key: "systemCode", label: "시스템코드" },
  { key: "systemName", label: "시스템명" },
  { key: "systemGroup", label: "그룹" },
  { key: "owner", label: "담당자" },
  { key: "version", label: "버전" },
  { key: "status", label: "상태" },
  { key: "useYn", label: "사용여부" },
  { key: "remark", label: "비고" },
];

const SystemManagement = () => {
  const [rows, setRows] = useState<SystemItem[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10); // 페이지 사이즈 고정 (원하면 setSize로 바꿔도 됨)
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 등록 모달
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    systemCode: "",
    systemName: "",
    systemGroup: "",
    owner: "",
    version: "",
    status: "ACTIVE" as SystemStatus,
    useYn: "Y" as "Y" | "N",
    remark: "",
  });

  // 상세/수정 모달
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<SystemItem | null>(null);
  const [editForm, setEditForm] = useState({
    systemCode: "",
    systemName: "",
    systemGroup: "",
    owner: "",
    version: "",
    status: "ACTIVE" as SystemStatus,
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

  // ✅ 목록 조회
  const fetchList = async (p: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/systems?page=${p}&size=${size}`);
      if (!res.ok) throw new Error("서버 오류");

      const data: PageResponse<SystemItem> = await res.json();
      setRows(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error("시스템 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page]);

  // ✅ 페이징 이동
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
        r.systemCode,
        r.systemName,
        r.systemGroup ?? "",
        r.owner ?? "",
        r.version ?? "",
        r.status ?? "",
        r.useYn ?? "Y",
        r.remark ?? "",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "시스템관리");

    const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelFile], { type: "application/octet-stream" });
    saveAs(blob, "시스템관리_리스트.xlsx");
  };

  // ✅ 등록 저장
  const handleSave = async () => {
    const res = await fetch(`${API_BASE}/api/systems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemCode: createForm.systemCode,
        systemName: createForm.systemName,
        systemGroup: createForm.systemGroup || null,
        owner: createForm.owner || null,
        version: createForm.version || null,
        status: createForm.status || null,
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

    setCreateForm({
      systemCode: "",
      systemName: "",
      systemGroup: "",
      owner: "",
      version: "",
      status: "ACTIVE",
      useYn: "Y",
      remark: "",
    });
  };

  // ✅ 상세 열기
  const openDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/systems/${id}`);
      if (!res.ok) throw new Error("상세 조회 실패");

      const data: SystemItem = await res.json();
      setSelected(data);

      setEditForm({
        systemCode: data.systemCode || "",
        systemName: data.systemName || "",
        systemGroup: data.systemGroup || "",
        owner: data.owner || "",
        version: data.version || "",
        status: (data.status || "ACTIVE") as SystemStatus,
        useYn: (data.useYn || "Y") as "Y" | "N",
        remark: data.remark || "",
      });

      setShowDetail(true);
    } catch (e) {
      console.error(e);
      alert("상세 조회 실패");
    }
  };

  // ✅ 수정 저장 (여기가 핵심: 성공 처리 if 밖)
  const handleUpdate = async () => {
    if (!selected) return;

    const res = await fetch(`${API_BASE}/api/systems/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
      }),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      alert(raw || "수정 실패");
      return;
    }

    // ✅ 성공 처리
    setShowDetail(false);
    fetchList(page);
  };

  // ✅ 삭제
  const handleDelete = async () => {
    if (!selected) return;

    const ok = window.confirm("정말 삭제 할까요?");
    if (!ok) return;

    const res = await fetch(`${API_BASE}/api/systems/${selected.id}`, {
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
                    <h4>시스템관리</h4>
                    <Dflex>
                      <Button className="mx-2 my-3" onClick={handleExcelDownload} variant="primary">
                        엑셀다운로드
                      </Button>
                      <Button className="my-3" onClick={() => setShowCreate(true)} variant="success">
                        시스템등록
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
                          <td
                            style={{ cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => openDetail(r.id)}
                          >
                            {r.systemCode}
                          </td>
                          <td>{r.systemName}</td>
                          <td>{r.systemGroup ?? ""}</td>
                          <td>{r.owner ?? ""}</td>
                          <td>{r.version ?? ""}</td>
                          <td>{r.status ?? ""}</td>
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

      {/* ✅ 등록 모달 */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>시스템 등록</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-2"
              name="systemCode"
              placeholder="시스템코드"
              value={createForm.systemCode}
              onChange={onCreateChange}
            />
            <Form.Control
              className="mb-2"
              name="systemName"
              placeholder="시스템명"
              value={createForm.systemName}
              onChange={onCreateChange}
            />
            <Form.Control
              className="mb-2"
              name="systemGroup"
              placeholder="그룹"
              value={createForm.systemGroup}
              onChange={onCreateChange}
            />
            <Form.Control
              className="mb-2"
              name="owner"
              placeholder="담당자"
              value={createForm.owner}
              onChange={onCreateChange}
            />
            <Form.Control
              className="mb-2"
              name="version"
              placeholder="버전"
              value={createForm.version}
              onChange={onCreateChange}
            />

            <Form.Select className="mb-2" name="status" value={createForm.status} onChange={onCreateChange}>
              <option value="ACTIVE">운영</option>
              <option value="INACTIVE">중지</option>
              <option value="MAINTENANCE">점검</option>
            </Form.Select>

            <Form.Select className="mb-2" name="useYn" value={createForm.useYn} onChange={onCreateChange}>
              <option value="Y">사용</option>
              <option value="N">미사용</option>
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
          <Modal.Title>시스템 상세</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-2"
              name="systemCode"
              placeholder="시스템코드"
              value={editForm.systemCode}
              onChange={onEditChange}
            />
            <Form.Control
              className="mb-2"
              name="systemName"
              placeholder="시스템명"
              value={editForm.systemName}
              onChange={onEditChange}
            />
            <Form.Control
              className="mb-2"
              name="systemGroup"
              placeholder="그룹"
              value={editForm.systemGroup}
              onChange={onEditChange}
            />
            <Form.Control
              className="mb-2"
              name="owner"
              placeholder="담당자"
              value={editForm.owner}
              onChange={onEditChange}
            />
            <Form.Control
              className="mb-2"
              name="version"
              placeholder="버전"
              value={editForm.version}
              onChange={onEditChange}
            />

            <Form.Select className="mb-2" name="status" value={editForm.status} onChange={onEditChange}>
              <option value="ACTIVE">운영</option>
              <option value="INACTIVE">중지</option>
              <option value="MAINTENANCE">점검</option>
            </Form.Select>

            <Form.Select className="mb-2" name="useYn" value={editForm.useYn} onChange={onEditChange}>
              <option value="Y">사용</option>
              <option value="N">미사용</option>
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

export default SystemManagement;