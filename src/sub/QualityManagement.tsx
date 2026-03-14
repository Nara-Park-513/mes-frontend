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
  inspectionDate: string;
  itemCode: string;
  itemName: string;
  inspectionQty: number;
  defectQty: number;
  judgementResult: string;
  actionType: string;
  actionStatus: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const TABLE_HEADERS: {
  key: keyof Omit<QualityManagementItem, "id">;
  label: string;
}[] = [
  { key: "inspectionDate", label: "검사일자" },
  { key: "itemCode", label: "품목코드" },
  { key: "itemName", label: "품목명" },
  { key: "inspectionQty", label: "검사수량" },
  { key: "defectQty", label: "불량수량" },
  { key: "judgementResult", label: "판정결과" },
  { key: "actionType", label: "조치구분" },
  { key: "actionStatus", label: "조치상태" },
];

const emptyForm = {
  inspectionDate: "",
  itemCode: "",
  itemName: "",
  inspectionQty: "",
  defectQty: "",
  judgementResult: "",
  actionType: "",
  actionStatus: "",
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

  const onCreateChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

      const data: PageResponse<any> | any[] = await res.json();
      console.log("quality list raw =", data);

      const list = Array.isArray(data) ? data : data.content ?? [];

      const normalized = list.map((item: any) => ({
        id: item.id,
        inspectionDate: item.inspectionDate ?? "",
        itemCode: item.itemCode ?? "",
        itemName: item.itemName ?? "",
        inspectionQty: Number(item.inspectionQty ?? 0),
        defectQty: Number(item.defectQty ?? 0),
        judgementResult: item.judgementResult ?? "",
        actionType: item.actionType ?? "",
        actionStatus: item.actionStatus ?? "",
      }));

      setRows(normalized);
      setTotalPages(Array.isArray(data) ? 1 : data.totalPages ?? 0);
      setTotalElements(
        Array.isArray(data) ? normalized.length : data.totalElements ?? 0
      );
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
    if (!String(createForm.inspectionDate ?? "").trim()) {
      return alert("검사일자를 입력하세요");
    }
    if (!String(createForm.itemCode ?? "").trim()) {
      return alert("품목코드를 입력하세요");
    }
    if (!String(createForm.itemName ?? "").trim()) {
      return alert("품목명을 입력하세요");
    }
    if (!String(createForm.inspectionQty ?? "").trim()) {
      return alert("검사수량을 입력하세요");
    }
    if (!String(createForm.defectQty ?? "").trim()) {
      return alert("불량수량을 입력하세요");
    }
    if (!String(createForm.judgementResult ?? "").trim()) {
      return alert("판정결과를 입력하세요");
    }
    if (!String(createForm.actionType ?? "").trim()) {
      return alert("조치구분을 입력하세요");
    }
    if (!String(createForm.actionStatus ?? "").trim()) {
      return alert("조치상태를 입력하세요");
    }

    const payload = {
      inspectionDate: String(createForm.inspectionDate ?? "").trim(),
      itemCode: String(createForm.itemCode ?? "").trim(),
      itemName: String(createForm.itemName ?? "").trim(),
      inspectionQty: Number(createForm.inspectionQty ?? 0),
      defectQty: Number(createForm.defectQty ?? 0),
      judgementResult: String(createForm.judgementResult ?? "").trim(),
      actionType: String(createForm.actionType ?? "").trim(),
      actionStatus: String(createForm.actionStatus ?? "").trim(),
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

      const data: any = await res.json();

      const normalized: QualityManagementItem = {
        id: data.id,
        inspectionDate: data.inspectionDate ?? "",
        itemCode: data.itemCode ?? "",
        itemName: data.itemName ?? "",
        inspectionQty: Number(data.inspectionQty ?? 0),
        defectQty: Number(data.defectQty ?? 0),
        judgementResult: data.judgementResult ?? "",
        actionType: data.actionType ?? "",
        actionStatus: data.actionStatus ?? "",
      };

      setSelected(normalized);
      setEditForm({
        inspectionDate: normalized.inspectionDate,
        itemCode: normalized.itemCode,
        itemName: normalized.itemName,
        inspectionQty: String(normalized.inspectionQty),
        defectQty: String(normalized.defectQty),
        judgementResult: normalized.judgementResult,
        actionType: normalized.actionType,
        actionStatus: normalized.actionStatus,
      });
      setShowDetail(true);
    } catch (err) {
      console.error("품질관리 상세 조회 실패", err);
      alert("상세 조회 실패");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;

    if (!String(editForm.inspectionDate ?? "").trim()) {
      return alert("검사일자를 입력하세요");
    }
    if (!String(editForm.itemCode ?? "").trim()) {
      return alert("품목코드를 입력하세요");
    }
    if (!String(editForm.itemName ?? "").trim()) {
      return alert("품목명을 입력하세요");
    }
    if (!String(editForm.inspectionQty ?? "").trim()) {
      return alert("검사수량을 입력하세요");
    }
    if (!String(editForm.defectQty ?? "").trim()) {
      return alert("불량수량을 입력하세요");
    }
    if (!String(editForm.judgementResult ?? "").trim()) {
      return alert("판정결과를 입력하세요");
    }
    if (!String(editForm.actionType ?? "").trim()) {
      return alert("조치구분을 입력하세요");
    }
    if (!String(editForm.actionStatus ?? "").trim()) {
      return alert("조치상태를 입력하세요");
    }

    const payload = {
      inspectionDate: String(editForm.inspectionDate ?? "").trim(),
      itemCode: String(editForm.itemCode ?? "").trim(),
      itemName: String(editForm.itemName ?? "").trim(),
      inspectionQty: Number(editForm.inspectionQty ?? 0),
      defectQty: Number(editForm.defectQty ?? 0),
      judgementResult: String(editForm.judgementResult ?? "").trim(),
      actionType: String(editForm.actionType ?? "").trim(),
      actionStatus: String(editForm.actionStatus ?? "").trim(),
    };

    try {
      const res = await fetch(
        `${API_BASE}/api/quality-management/${selected.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

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
      const res = await fetch(
        `${API_BASE}/api/quality-management/${selected.id}`,
        {
          method: "DELETE",
        }
      );

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
    !!String(createForm.inspectionDate ?? "").trim() &&
    !!String(createForm.itemCode ?? "").trim() &&
    !!String(createForm.itemName ?? "").trim() &&
    !!String(createForm.inspectionQty ?? "").trim() &&
    !!String(createForm.defectQty ?? "").trim() &&
    !!String(createForm.judgementResult ?? "").trim() &&
    !!String(createForm.actionType ?? "").trim() &&
    !!String(createForm.actionStatus ?? "").trim();

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
    overflow: "hidden",
    textOverflow: "ellipsis",
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
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          onClick={handleOpenCreate}
                          variant="primary"
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
                          품질 관리 등록
                        </Button>
                      </div>
                    </div>
                  </DflexColumn2>

                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      overflowX: "auto",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 10px 0 10px",
                        minWidth: 0,
                      }}
                    >
                      <Table
                        className="mt-3 mb-0 align-middle"
                        style={{
                          width: "100%",
                          minWidth: "1200px",
                          marginBottom: 0,
                          tableLayout: "fixed",
                        }}
                      >
                        <colgroup>
                          <col style={{ width: "13%" }} />
                          <col style={{ width: "13%" }} />
                          <col style={{ width: "18%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "12%" }} />
                          <col style={{ width: "12%" }} />
                          <col style={{ width: "12%" }} />
                        </colgroup>

                        <thead>
                          <tr className="text-center">
                            {TABLE_HEADERS.map((h) => (
                              <th
                                key={h.key}
                                style={{
                                  ...thStyle,
                                  backgroundColor: "#6b7280",
                                  color: "#ffffff",
                                }}
                              >
                                {h.label}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {rows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={8}
                                style={{
                                  padding: "24px",
                                  textAlign: "center",
                                  color: "#64748b",
                                  fontSize: "14px",
                                }}
                              >
                                조회된 품질관리 데이터가 없습니다.
                              </td>
                            </tr>
                          ) : (
                            rows.map((row) => (
                              <tr
                                key={row.id}
                                className="text-center"
                                style={{ cursor: "pointer" }}
                                onClick={() => openDetail(row.id)}
                              >
                                <td
                                  style={{
                                    ...tdStyle,
                                    fontWeight: 600,
                                    textDecoration: "underline",
                                    color: "#0d6efd",
                                  }}
                                  title={row.inspectionDate}
                                >
                                  {row.inspectionDate}
                                </td>
                                <td style={tdStyle} title={row.itemCode}>
                                  {row.itemCode}
                                </td>
                                <td style={tdStyle} title={row.itemName}>
                                  {row.itemName}
                                </td>
                                <td style={tdStyle} title={String(row.inspectionQty)}>
                                  {row.inspectionQty}
                                </td>
                                <td style={tdStyle} title={String(row.defectQty)}>
                                  {row.defectQty}
                                </td>
                                <td style={tdStyle} title={row.judgementResult}>
                                  {row.judgementResult}
                                </td>
                                <td style={tdStyle} title={row.actionType}>
                                  {row.actionType}
                                </td>
                                <td style={tdStyle} title={row.actionStatus}>
                                  {row.actionStatus}
                                </td>
                              </tr>
                            ))
                          )}
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
                            fontSize: "13px",
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

      <Modal show={showCreate} onHide={handleCloseCreate} centered size="lg">
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
            품질 관리 등록
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
                검사일자
              </Form.Label>
              <Form.Control
                type="date"
                name="inspectionDate"
                value={createForm.inspectionDate}
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
                검사수량
              </Form.Label>
              <Form.Control
                type="number"
                name="inspectionQty"
                placeholder="검사수량"
                value={createForm.inspectionQty}
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
                불량수량
              </Form.Label>
              <Form.Control
                type="number"
                name="defectQty"
                placeholder="불량수량"
                value={createForm.defectQty}
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
                판정결과
              </Form.Label>
              <Form.Select
                name="judgementResult"
                value={createForm.judgementResult}
                onChange={onCreateChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="">선택하세요</option>
                <option value="합격">합격</option>
                <option value="불합격">불합격</option>
              </Form.Select>
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
                조치구분
              </Form.Label>
              <Form.Select
                name="actionType"
                value={createForm.actionType}
                onChange={onCreateChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="">선택하세요</option>
                <option value="해당없음">해당없음</option>
                <option value="재작업">재작업</option>
                <option value="폐기">폐기</option>
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
                조치상태
              </Form.Label>
              <Form.Select
                name="actionStatus"
                value={createForm.actionStatus}
                onChange={onCreateChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="">선택하세요</option>
                <option value="대기">대기</option>
                <option value="진행중">진행중</option>
                <option value="완료">완료</option>
              </Form.Select>
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
            onClick={handleCloseCreate}
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

      <Modal show={showDetail} onHide={handleCloseDetail} centered size="lg">
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
            품질 관리 상세
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
                검사일자
              </Form.Label>
              <Form.Control
                type="date"
                name="inspectionDate"
                value={editForm.inspectionDate}
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
                검사수량
              </Form.Label>
              <Form.Control
                type="number"
                name="inspectionQty"
                placeholder="검사수량"
                value={editForm.inspectionQty}
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
                불량수량
              </Form.Label>
              <Form.Control
                type="number"
                name="defectQty"
                placeholder="불량수량"
                value={editForm.defectQty}
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
                판정결과
              </Form.Label>
              <Form.Select
                name="judgementResult"
                value={editForm.judgementResult}
                onChange={onEditChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="">선택하세요</option>
                <option value="합격">합격</option>
                <option value="불합격">불합격</option>
              </Form.Select>
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
                조치구분
              </Form.Label>
              <Form.Select
                name="actionType"
                value={editForm.actionType}
                onChange={onEditChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="">선택하세요</option>
                <option value="해당없음">해당없음</option>
                <option value="재작업">재작업</option>
                <option value="폐기">폐기</option>
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
                조치상태
              </Form.Label>
              <Form.Select
                name="actionStatus"
                value={editForm.actionStatus}
                onChange={onEditChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="">선택하세요</option>
                <option value="대기">대기</option>
                <option value="진행중">진행중</option>
                <option value="완료">완료</option>
              </Form.Select>
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
            저장
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QualityManagement;