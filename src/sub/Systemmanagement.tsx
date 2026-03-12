import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";

import { Wrapper, DflexColumn, Content, Ctap, DflexColumn2 } from "../styled/Sales.styles";
import { Center, PageTotal } from "../styled/Component.styles";

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
  const [size] = useState(10);
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
      const res = await fetch(`${API_BASE}/api/systems?page=${p}&size=${size}&sort=id,desc`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("서버 오류");

      const data: PageResponse<SystemItem> = await res.json();
      console.log("systems list response", data);
      console.log("systems content", data.content);

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

    const raw = await res.text().catch(() => "");
    console.log("system create status", res.status);
    console.log("system create response", raw);

    if (!res.ok) {
      alert(raw || "등록 실패");
      return;
    }

    setShowCreate(false);
    setPage(0);
    fetchList(0);

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

  // ✅ 수정 저장
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
                      시스템관리
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
                          시스템 등록
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
                          <col style={{ width: "13%" }} />
                          <col style={{ width: "12%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "14%" }} />
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
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  color: "#0d6efd",
                                  fontWeight: 600,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                onClick={() => openDetail(r.id)}
                                title={r.systemCode}
                              >
                                {r.systemCode}
                              </td>

                              <td
                                style={{
                                  ...tdStyle,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={r.systemName}
                              >
                                {r.systemName}
                              </td>

                              <td
                                style={{
                                  ...tdStyle,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={r.systemGroup ?? ""}
                              >
                                {r.systemGroup ?? ""}
                              </td>

                              <td
                                style={{
                                  ...tdStyle,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={r.owner ?? ""}
                              >
                                {r.owner ?? ""}
                              </td>

                              <td
                                style={{
                                  ...tdStyle,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={r.version ?? ""}
                              >
                                {r.version ?? ""}
                              </td>

                              <td
                                style={{
                                  ...tdStyle,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={r.status ?? ""}
                              >
                                {r.status ?? ""}
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
            시스템 등록
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
                시스템코드
              </Form.Label>
              <Form.Control
                name="systemCode"
                placeholder="시스템코드"
                value={createForm.systemCode}
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
                시스템명
              </Form.Label>
              <Form.Control
                name="systemName"
                placeholder="시스템명"
                value={createForm.systemName}
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
                name="systemGroup"
                placeholder="그룹"
                value={createForm.systemGroup}
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
                담당자
              </Form.Label>
              <Form.Control
                name="owner"
                placeholder="담당자"
                value={createForm.owner}
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
                버전
              </Form.Label>
              <Form.Control
                name="version"
                placeholder="버전"
                value={createForm.version}
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
                <option value="ACTIVE">운영</option>
                <option value="INACTIVE">중지</option>
                <option value="MAINTENANCE">점검</option>
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
            시스템 상세
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
                시스템코드
              </Form.Label>
              <Form.Control
                name="systemCode"
                placeholder="시스템코드"
                value={editForm.systemCode}
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
                시스템명
              </Form.Label>
              <Form.Control
                name="systemName"
                placeholder="시스템명"
                value={editForm.systemName}
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
                그룹
              </Form.Label>
              <Form.Control
                name="systemGroup"
                placeholder="그룹"
                value={editForm.systemGroup}
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
                담당자
              </Form.Label>
              <Form.Control
                name="owner"
                placeholder="담당자"
                value={editForm.owner}
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
                버전
              </Form.Label>
              <Form.Control
                name="version"
                placeholder="버전"
                value={editForm.version}
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
                <option value="ACTIVE">운영</option>
                <option value="INACTIVE">중지</option>
                <option value="MAINTENANCE">점검</option>
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

export default SystemManagement;