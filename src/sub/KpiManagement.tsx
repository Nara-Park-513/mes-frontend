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
                          {rows.map((r, i) => (
                            <tr key={r.id} className="text-center">
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
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#0d6efd",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                                onClick={() => openDetail(r.id)}
                              >
                                {r.kpiName}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.kpiGroup}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.owner}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.periodType}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.periodValue}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.targetValue}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.actualValue}
                              </td>

                              <td
                                style={{
                                  padding: "13px 12px",
                                  verticalAlign: "middle",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.unit}
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
                                {r.useYn}
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
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>KPI 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {Object.entries(createForm).map(([k, v]) => (
              <Form.Control
                key={k}
                className="mb-2"
                name={k}
                value={v as any}
                onChange={onCreateChange}
                placeholder={k}
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>
            닫기
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </Modal.Footer>
      </Modal>

      {/* 상세 모달 */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>KPI 상세</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {Object.entries(editForm).map(([k, v]) => (
              <Form.Control
                key={k}
                className="mb-2"
                name={k}
                value={v as any}
                onChange={onEditChange}
                placeholder={k}
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
          <Button onClick={handleUpdate}>수정</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default KpiManagement;