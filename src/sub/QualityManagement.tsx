import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import {
  Wrapper,
  DflexColumn,
  Content,
  Ctap,
  DflexColumn2,
} from "../styled/Sales.styles";
import { Center, PageTotal } from "../styled/Component.styles";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Pagination,
} from "react-bootstrap";

const API_BASE = "http://localhost:9500";

type QualityManagementItem = {
  id: number;
  inspectionStandard: string; // 검사기준관리
  processInspection: string; // 공정검사
  defectManagement: string; // 불량관리
  qualityHistory: string; // 품질이력
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const TABLE_HEADERS: { key: keyof Omit<QualityManagementItem, "id">; label: string }[] = [
  { key: "inspectionStandard", label: "검사기준관리" },
  { key: "processInspection", label: "공정검사" },
  { key: "defectManagement", label: "불량관리" },
  { key: "qualityHistory", label: "품질이력" },
];

const emptyForm = {
  inspectionStandard: "",
  processInspection: "",
  defectManagement: "",
  qualityHistory: "",
};

const QualityManagement = () => {
  const [rows, setRows] = useState<QualityManagementItem[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [selected, setSelected] = useState<QualityManagementItem | null>(null);

  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const stockMenu = [{ key: "quality", label: "품질관리", path: "/quality" }];

  const onCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchList = async (p: number) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/quality-management?page=${p}&size=${size}`
      );

      if (!res.ok) {
        setRows([]);
        setTotalPages(0);
        setTotalElements(0);
        return;
      }

      const data = await res.json();
      console.log("quality list raw =", data);

      const list = Array.isArray(data) ? data : data.content ?? [];

      const normalized = list.map((item: any) => ({
        id: item.id,
        inspectionStandard: item.inspectionStandard ?? "",
        processInspection: item.processInspection ?? "",
        defectManagement: item.defectManagement ?? "",
        qualityHistory: item.qualityHistory ?? "",
      }));

      setRows(normalized);
      setTotalPages(Array.isArray(data) ? 1 : data.totalPages ?? 0);
      setTotalElements(Array.isArray(data) ? normalized.length : data.totalElements ?? 0);
    } catch (err) {
      console.error("품질관리 목록 조회 실패", err);
      setRows([]);
      setTotalPages(0);
      setTotalElements(0);
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page]);

  const goPage = (p: number) => {
    const next = Math.max(0, Math.min(p, Math.max(totalPages - 1, 0)));
    setPage(next);
  };

  const resetCreateForm = () => {
    setCreateForm(emptyForm);
  };

  const resetEditForm = () => {
    setEditForm(emptyForm);
    setSelected(null);
  };

  const handleOpenCreate = () => {
    resetCreateForm();
    setShowCreate(true);
  };

  const handleCloseCreate = () => {
    setShowCreate(false);
    resetCreateForm();
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    resetEditForm();
  };

  const handleSave = async () => {
    if (!createForm.inspectionStandard.trim()) {
      return alert("검사기준관리를 입력하세요");
    }
    if (!createForm.processInspection.trim()) {
      return alert("공정검사를 입력하세요");
    }
    if (!createForm.defectManagement.trim()) {
      return alert("불량관리를 입력하세요");
    }
    if (!createForm.qualityHistory.trim()) {
      return alert("품질이력을 입력하세요");
    }

    const payload = {
      inspectionStandard: createForm.inspectionStandard.trim(),
      processInspection: createForm.processInspection.trim(),
      defectManagement: createForm.defectManagement.trim(),
      qualityHistory: createForm.qualityHistory.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/quality-management`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        alert(raw || "저장 실패");
        return;
      }

      handleCloseCreate();
      fetchList(page);
    } catch (err) {
      console.error("품질관리 저장 실패", err);
      alert("저장 실패");
    }
  };

  const openDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/quality-management/${id}`);
      if (!res.ok) throw new Error("상세 조회 실패");

      const data: QualityManagementItem = await res.json();
      setSelected(data);
      setEditForm({
        inspectionStandard: data.inspectionStandard ?? "",
        processInspection: data.processInspection ?? "",
        defectManagement: data.defectManagement ?? "",
        qualityHistory: data.qualityHistory ?? "",
      });
      setShowDetail(true);
    } catch (err) {
      console.error("품질관리 상세 조회 실패", err);
      alert("상세 조회 실패");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;

    if (!editForm.inspectionStandard.trim()) {
      return alert("검사기준관리를 입력하세요");
    }
    if (!editForm.processInspection.trim()) {
      return alert("공정검사를 입력하세요");
    }
    if (!editForm.defectManagement.trim()) {
      return alert("불량관리를 입력하세요");
    }
    if (!editForm.qualityHistory.trim()) {
      return alert("품질이력을 입력하세요");
    }

    const payload = {
      inspectionStandard: editForm.inspectionStandard.trim(),
      processInspection: editForm.processInspection.trim(),
      defectManagement: editForm.defectManagement.trim(),
      qualityHistory: editForm.qualityHistory.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/quality-management/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        alert(raw || "수정 실패");
        return;
      }

      handleCloseDetail();
      fetchList(page);
    } catch (err) {
      console.error("품질관리 수정 실패", err);
      alert("수정 실패");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/quality-management/${selected.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        alert(raw || "삭제 실패");
        return;
      }

      handleCloseDetail();
      fetchList(page);
    } catch (err) {
      console.error("품질관리 삭제 실패", err);
      alert("삭제 실패");
    }
  };

  const canSave =
    !!createForm.inspectionStandard.trim() &&
    !!createForm.processInspection.trim() &&
    !!createForm.defectManagement.trim() &&
    !!createForm.qualityHistory.trim();

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
                      품질관리
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
                          onClick={handleOpenCreate}
                          variant="primary"
                          style={{
                            height: "44px",
                            minWidth: "132px",
                            borderRadius: "6px",
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          품질 관리 등록
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
                          {rows.map((row) => (
                            <tr
                              key={row.id}
                              className="text-center"
                              style={{ cursor: "pointer" }}
                              onClick={() => openDetail(row.id)}
                            >
                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                  fontWeight: 600,
                                  textDecoration: "underline",
                                }}
                              >
                                {row.inspectionStandard}
                              </td>
                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row.processInspection}
                              </td>
                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row.defectManagement}
                              </td>
                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row.qualityHistory}
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
                            <Pagination.First
                              disabled={page === 0}
                              onClick={() => goPage(0)}
                            />
                            <Pagination.Prev
                              disabled={page === 0}
                              onClick={() => goPage(page - 1)}
                            />

                            {Array.from({ length: totalPages })
                              .map((_, i) => i)
                              .filter((i) => i >= page - 2 && i <= page + 2)
                              .map((i) => (
                                <Pagination.Item
                                  key={i}
                                  active={i === page}
                                  onClick={() => goPage(i)}
                                >
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
                          총 {totalElements}건 {page + 1} / {totalPages || 1} 페이지
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
      <Modal show={showCreate} onHide={handleCloseCreate} centered>
        <Modal.Header closeButton>
          <Modal.Title>품질 관리 등록</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-3"
              name="inspectionStandard"
              placeholder="검사기준관리"
              value={createForm.inspectionStandard}
              onChange={onCreateChange}
            />

            <Form.Control
              className="mb-3"
              name="processInspection"
              placeholder="공정검사"
              value={createForm.processInspection}
              onChange={onCreateChange}
            />

            <Form.Control
              className="mb-3"
              name="defectManagement"
              placeholder="불량관리"
              value={createForm.defectManagement}
              onChange={onCreateChange}
            />

            <Form.Control
              className="mb-3"
              name="qualityHistory"
              placeholder="품질이력"
              value={createForm.qualityHistory}
              onChange={onCreateChange}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreate}>
            닫기
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            저장
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 상세/수정 모달 */}
      <Modal show={showDetail} onHide={handleCloseDetail} centered>
        <Modal.Header closeButton>
          <Modal.Title>품질 관리 등록</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-3"
              name="inspectionStandard"
              placeholder="검사기준관리"
              value={editForm.inspectionStandard}
              onChange={onEditChange}
            />

            <Form.Control
              className="mb-3"
              name="processInspection"
              placeholder="공정검사"
              value={editForm.processInspection}
              onChange={onEditChange}
            />

            <Form.Control
              className="mb-3"
              name="defectManagement"
              placeholder="불량관리"
              value={editForm.defectManagement}
              onChange={onEditChange}
            />

            <Form.Control
              className="mb-3"
              name="qualityHistory"
              placeholder="품질이력"
              value={editForm.qualityHistory}
              onChange={onEditChange}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetail}>
            닫기
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            저장
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QualityManagement;