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

type AlertState = {
  open: boolean;
  message: string;
  mode: "alert" | "confirm";
  onConfirm?: (() => void) | null;
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

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    stdCode: "",
    stdName: "",
    stdGroup: "",
    unit: "",
    useYn: "Y" as "Y" | "N",
    remark: "",
  });

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

  const fetchList = async (p: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/standards?page=${p}&size=${size}`);
      if (!res.ok) throw new Error();

      const data: PageResponse<StandardItem> = await res.json();
      setRows(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error("기준정보 목록 조회 실패", err);
      showAlert("기준정보 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page]);

  const goPage = (p: number) => {
    const next = Math.max(0, Math.min(p, totalPages - 1));
    setPage(next);
  };

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

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/standards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        throw new Error(raw || "등록 실패");
      }

      setShowCreate(false);
      await fetchList(page);

      setCreateForm({
        stdCode: "",
        stdName: "",
        stdGroup: "",
        unit: "",
        useYn: "Y",
        remark: "",
      });

      showAlert("기준정보가 등록되었습니다.");
    } catch (err) {
      console.error("기준정보 등록 실패", err);
      showAlert("기준정보를 등록하지 못했습니다.");
    }
  };

  const openDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/standards/${id}`);
      if (!res.ok) throw new Error();

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
    } catch (err) {
      console.error("기준정보 상세 조회 실패", err);
      showAlert("기준정보 상세 정보를 불러오지 못했습니다.");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;

    try {
      const res = await fetch(`${API_BASE}/api/standards/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        throw new Error(raw || "수정 실패");
      }

      setShowDetail(false);
      await fetchList(page);
      showAlert("기준정보가 수정되었습니다.");
    } catch (err) {
      console.error("기준정보 수정 실패", err);
      showAlert("기준정보를 수정하지 못했습니다.");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!selected) return;

    closeAlert();

    try {
      const res = await fetch(`${API_BASE}/api/standards/${selected.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        throw new Error(raw || "삭제 실패");
      }

      setShowDetail(false);
      await fetchList(page);
      showAlert("기준정보가 삭제되었습니다.");
    } catch (err) {
      console.error("기준정보 삭제 실패", err);
      showAlert("기준정보를 삭제하지 못했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    showConfirm("기준정보를 삭제하시겠습니까?", handleDeleteConfirmed);
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
                      기준정보관리
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
                          variant="primary"
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
                          기준정보 등록
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
                      <Table
                        className="mt-3 mb-0 align-middle"
                        style={{
                          width: "100%",
                          marginBottom: 0,
                          tableLayout: "fixed",
                        }}
                      >
                        <colgroup>
                          <col style={{ width: "7%" }} />
                          <col style={{ width: "16%" }} />
                          <col style={{ width: "18%" }} />
                          <col style={{ width: "16%" }} />
                          <col style={{ width: "12%" }} />
                          <col style={{ width: "11%" }} />
                          <col style={{ width: "20%" }} />
                        </colgroup>

                        <thead>
                          <tr className="text-center">
                            <th className="bg-secondary text-white" style={thStyle}>
                              #
                            </th>
                            {TABLE_HEADERS.map((h) => (
                              <th key={h.key as string} className="bg-secondary text-white" style={thStyle}>
                                {h.label}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {rows.map((r, i) => (
                            <tr key={r.id} className="text-center">
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
                                onClick={() => openDetail(r.id)}
                                style={{
                                  ...tdStyle,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  color: "#0d6efd",
                                  fontWeight: 600,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={r.stdCode}
                              >
                                {r.stdCode}
                              </td>

                              <td
                                style={{
                                  ...tdStyle,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={r.stdName}
                              >
                                {r.stdName}
                              </td>

                              <td
                                style={{
                                  ...tdStyle,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={r.stdGroup}
                              >
                                {r.stdGroup}
                              </td>

                              <td
                                style={{
                                  ...tdStyle,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={r.unit ?? ""}
                              >
                                {r.unit ?? ""}
                              </td>

                              <td style={tdStyle} title={r.useYn}>
                                {r.useYn}
                              </td>

                              <td
                                style={{
                                  ...tdStyle,
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

                            {Array.from({ length: totalPages }).map((_, i) => (
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
            기준정보 등록
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
                기준코드
              </Form.Label>
              <Form.Control
                name="stdCode"
                placeholder="기준코드 (품목 기준)"
                value={createForm.stdCode}
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
                기준명
              </Form.Label>
              <Form.Control
                name="stdName"
                placeholder="기준명 (품목 기준)"
                value={createForm.stdName}
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
                그룹
              </Form.Label>
              <Form.Control
                name="stdGroup"
                placeholder="그룹"
                value={createForm.stdGroup}
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
                단위
              </Form.Label>
              <Form.Control
                name="unit"
                placeholder="단위"
                value={createForm.unit}
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
            기준정보 상세
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
                기준코드
              </Form.Label>
              <Form.Control
                name="stdCode"
                value={editForm.stdCode}
                onChange={onEditChange}
                placeholder="기준코드"
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
                기준명
              </Form.Label>
              <Form.Control
                name="stdName"
                value={editForm.stdName}
                onChange={onEditChange}
                placeholder="기준명"
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
                그룹
              </Form.Label>
              <Form.Control
                name="stdGroup"
                value={editForm.stdGroup}
                onChange={onEditChange}
                placeholder="그룹"
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
                단위
              </Form.Label>
              <Form.Control
                name="unit"
                value={editForm.unit}
                onChange={onEditChange}
                placeholder="단위"
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
                value={editForm.remark}
                onChange={onEditChange}
                placeholder="비고"
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

export default StandardManagement;