import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";

import { Wrapper, DflexColumn, Content, Ctap, DflexColumn2 } from "../styled/Sales.styles";
import { Center, PageTotal } from "../styled/Component.styles";

import { Container, Row, Col, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:9500";

type KpiItem = {
  id: number;
  kpiName: string;
  kpiGroup?: string;
  owner?: string;
  periodType: "MONTH" | "QUARTER" | "YEAR";
  periodValue: string;
  targetValue: number;
  actualValue: number;
  unit?: string;
  status?: "ON_TRACK" | "RISK" | "OFF_TRACK";
  useYn: "Y" | "N";
  remark?: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const TABLE_HEADERS: { key: keyof KpiItem; label: string }[] = [
  { key: "kpiName", label: "KPI명" },
  { key: "kpiGroup", label: "그룹" },
  { key: "owner", label: "담당자" },
  { key: "periodType", label: "기간유형" },
  { key: "periodValue", label: "기간" },
  { key: "targetValue", label: "목표" },
  { key: "actualValue", label: "실적" },
  { key: "unit", label: "단위" },
  { key: "status", label: "상태" },
  { key: "useYn", label: "사용여부" },
  { key: "remark", label: "비고" },
];

const KpiManagement = () => {
  const [rows, setRows] = useState<KpiItem[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<KpiItem | null>(null);

  const [createForm, setCreateForm] = useState({
    kpiName: "",
    kpiGroup: "",
    owner: "",
    periodType: "MONTH" as "MONTH" | "QUARTER" | "YEAR",
    periodValue: "",
    targetValue: "",
    actualValue: "",
    unit: "",
    status: "ON_TRACK" as "ON_TRACK" | "RISK" | "OFF_TRACK",
    useYn: "Y" as "Y" | "N",
    remark: "",
  });

  const [editForm, setEditForm] = useState({ ...createForm });

  const onCreateChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchList = async (p: number) => {
    const res = await fetch(`${API_BASE}/api/kpis?page=${p}&size=${size}`);
    if (!res.ok) return;

    const data: PageResponse<KpiItem> = await res.json();
    setRows(data.content);
    setTotalPages(data.totalPages);
    setTotalElements(data.totalElements);
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
      ...rows.map((r, i) => [
        i + 1 + page * size,
        r.kpiName,
        r.kpiGroup ?? "",
        r.owner ?? "",
        r.periodType,
        r.periodValue,
        r.targetValue,
        r.actualValue,
        r.unit ?? "",
        r.status ?? "",
        r.useYn,
        r.remark ?? "",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KPI관리");

    const file = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([file]), "KPI관리.xlsx");
  };

  const handleSave = async () => {
    const res = await fetch(`${API_BASE}/api/kpis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...createForm,
        targetValue: Number(createForm.targetValue || 0),
        actualValue: Number(createForm.actualValue || 0),
      }),
    });

    if (!res.ok) {
      alert("등록 실패");
      return;
    }

    setShowCreate(false);
    fetchList(page);
    setCreateForm({
      kpiName: "",
      kpiGroup: "",
      owner: "",
      periodType: "MONTH",
      periodValue: "",
      targetValue: "",
      actualValue: "",
      unit: "",
      status: "ON_TRACK",
      useYn: "Y",
      remark: "",
    });
  };

  const openDetail = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/kpis/${id}`);
    if (!res.ok) return;

    const data: KpiItem = await res.json();
    setSelected(data);
    setEditForm({
      kpiName: data.kpiName,
      kpiGroup: data.kpiGroup ?? "",
      owner: data.owner ?? "",
      periodType: data.periodType,
      periodValue: data.periodValue,
      targetValue: String(data.targetValue),
      actualValue: String(data.actualValue),
      unit: data.unit ?? "",
      status: data.status ?? "ON_TRACK",
      useYn: data.useYn,
      remark: data.remark ?? "",
    });
    setShowDetail(true);
  };

  const handleUpdate = async () => {
    if (!selected) return;

    const res = await fetch(`${API_BASE}/api/kpis/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        targetValue: Number(editForm.targetValue || 0),
        actualValue: Number(editForm.actualValue || 0),
      }),
    });

    if (!res.ok) {
      alert("수정 실패");
      return;
    }

    setShowDetail(false);
    fetchList(page);
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm("정말 삭제 할까요?")) return;

    const res = await fetch(`${API_BASE}/api/kpis/${selected.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("삭제 실패");
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
                      KPI관리
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
                          KPI 등록
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
                            minWidth: "1320px",
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
                                  kpiName: "180px",
                                  kpiGroup: "120px",
                                  owner: "110px",
                                  periodType: "110px",
                                  periodValue: "120px",
                                  targetValue: "100px",
                                  actualValue: "100px",
                                  unit: "90px",
                                  status: "110px",
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
                                  style={{
                                    ...tdStyle,
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    color: "#0d6efd",
                                    fontWeight: 600,
                                    maxWidth: "180px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  onClick={() => openDetail(r.id)}
                                  title={r.kpiName}
                                >
                                  {r.kpiName}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "120px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.kpiGroup ?? ""}
                                >
                                  {r.kpiGroup}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "110px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.owner ?? ""}
                                >
                                  {r.owner}
                                </td>

                                <td style={tdStyle} title={r.periodType}>
                                  {r.periodType}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "120px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.periodValue}
                                >
                                  {r.periodValue}
                                </td>

                                <td style={tdStyle} title={String(r.targetValue)}>
                                  {r.targetValue}
                                </td>

                                <td style={tdStyle} title={String(r.actualValue)}>
                                  {r.actualValue}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "90px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.unit ?? ""}
                                >
                                  {r.unit}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    maxWidth: "110px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={r.status ?? ""}
                                >
                                  {r.status}
                                </td>

                                <td style={tdStyle} title={r.useYn}>
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

                            <Pagination.Next disabled={page >= totalPages - 1} onClick={() => goPage(page + 1)} />
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
                          총 {totalElements}건 / {page + 1}페이지
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
            KPI 등록
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
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                KPI명
              </Form.Label>
              <Form.Control
                name="kpiName"
                value={createForm.kpiName}
                onChange={onCreateChange}
                placeholder="KPI명"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                그룹
              </Form.Label>
              <Form.Control
                name="kpiGroup"
                value={createForm.kpiGroup}
                onChange={onCreateChange}
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
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                담당자
              </Form.Label>
              <Form.Control
                name="owner"
                value={createForm.owner}
                onChange={onCreateChange}
                placeholder="담당자"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                기간유형
              </Form.Label>
              <Form.Select
                name="periodType"
                value={createForm.periodType}
                onChange={onCreateChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="MONTH">MONTH</option>
                <option value="QUARTER">QUARTER</option>
                <option value="YEAR">YEAR</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                기간
              </Form.Label>
              <Form.Control
                name="periodValue"
                value={createForm.periodValue}
                onChange={onCreateChange}
                placeholder="기간"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                목표
              </Form.Label>
              <Form.Control
                type="number"
                name="targetValue"
                value={createForm.targetValue}
                onChange={onCreateChange}
                placeholder="목표"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                실적
              </Form.Label>
              <Form.Control
                type="number"
                name="actualValue"
                value={createForm.actualValue}
                onChange={onCreateChange}
                placeholder="실적"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                단위
              </Form.Label>
              <Form.Control
                name="unit"
                value={createForm.unit}
                onChange={onCreateChange}
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
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
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
                <option value="ON_TRACK">ON_TRACK</option>
                <option value="RISK">RISK</option>
                <option value="OFF_TRACK">OFF_TRACK</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
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
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                비고
              </Form.Label>
              <Form.Control
                name="remark"
                value={createForm.remark}
                onChange={onCreateChange}
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

      {/* 상세 모달 */}
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
            KPI 상세
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
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                KPI명
              </Form.Label>
              <Form.Control
                name="kpiName"
                value={editForm.kpiName}
                onChange={onEditChange}
                placeholder="KPI명"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                그룹
              </Form.Label>
              <Form.Control
                name="kpiGroup"
                value={editForm.kpiGroup}
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
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                담당자
              </Form.Label>
              <Form.Control
                name="owner"
                value={editForm.owner}
                onChange={onEditChange}
                placeholder="담당자"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                기간유형
              </Form.Label>
              <Form.Select
                name="periodType"
                value={editForm.periodType}
                onChange={onEditChange}
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              >
                <option value="MONTH">MONTH</option>
                <option value="QUARTER">QUARTER</option>
                <option value="YEAR">YEAR</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                기간
              </Form.Label>
              <Form.Control
                name="periodValue"
                value={editForm.periodValue}
                onChange={onEditChange}
                placeholder="기간"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                목표
              </Form.Label>
              <Form.Control
                type="number"
                name="targetValue"
                value={editForm.targetValue}
                onChange={onEditChange}
                placeholder="목표"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                실적
              </Form.Label>
              <Form.Control
                type="number"
                name="actualValue"
                value={editForm.actualValue}
                onChange={onEditChange}
                placeholder="실적"
                style={{
                  height: "46px",
                  borderRadius: "4px",
                  border: "1px solid #cfd8e3",
                  boxShadow: "none",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
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
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
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
                <option value="ON_TRACK">ON_TRACK</option>
                <option value="RISK">RISK</option>
                <option value="OFF_TRACK">OFF_TRACK</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
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
              <Form.Label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
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

export default KpiManagement;