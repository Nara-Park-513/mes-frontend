import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import Lnb from "../include/Lnb";
import Top from "../include/Top";

import { Wrapper, DflexColumn, Content, Ctap } from "../styled/Sales.styles";
import { Center, PageTotal } from "../styled/Component.styles";
import { Container, Row, Col, Table, Pagination, Badge } from "react-bootstrap";

const API_BASE = "http://localhost:9500";

type SearchHit = {
  type: string; // inventory/kpi/member/production/purchase/sales/standard/system
  id: number;
  title: string;
  sub?: string;
  extra?: string;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type GlobalSearchResponse = {
  results: Record<string, Page<SearchHit>>;
};

function buildUrl(hit: SearchHit) {
  switch (hit.type) {
    case "inventory":
      return `/im`;
    case "kpi":
      return `/kpi`;
    case "member":
      return `/members`;
    case "production":
      return `/pmanagement`;
    case "purchase":
      return `/pm`;
    case "sales":
      return `/sales`;
    case "standard":
      return `/standard`;
    case "system":
      return `/system`;
    default:
      return `/`;
  }
}

const SearchPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const q = (params.get("q") || "").trim();
  const type = (params.get("type") || "all").trim();

  const [rows, setRows] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(0);
  const size = 10;

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchSearch = async (p = 0) => {
    if (!q) {
      setRows([]);
      setTotalPages(0);
      setTotalElements(0);
      setPage(0);
      return;
    }

    try {
      setLoading(true);
      setErr("");

      const url =
        `${API_BASE}/api/search?keyword=${encodeURIComponent(q)}` +
        `&type=${encodeURIComponent(type)}` +
        `&page=${p}&size=${size}&sort=id,desc`;

      const res = await fetch(url, { credentials: "include" });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw || `검색 실패 (HTTP ${res.status})`);

      const data: GlobalSearchResponse = raw ? JSON.parse(raw) : { results: {} };

      // ✅ all이면 여러 page가 들어오고, 특정 type이면 results[type] 하나만 옴
      if (type === "all") {
        // all은 "페이지"라는 개념이 백엔드에서 type별로 나뉘어 들어오므로
        // UI에서는 합쳐서 보여주되, 페이징은 all에서 의미가 애매해짐.
        // => 여기서는 all일 때는 "첫 페이지 합본"만 보여주고, total은 합산
        const merged: SearchHit[] = [];
        let total = 0;

        Object.keys(data.results || {}).forEach((k) => {
          const pg = data.results[k];
          if (pg?.content?.length) merged.push(...pg.content);
          total += pg?.totalElements || 0;
        });

        setRows(merged);
        setTotalElements(total);
        setTotalPages(1);
        setPage(0);
      } else {
        const pg = data.results?.[type];
        setRows(pg?.content || []);
        setTotalElements(pg?.totalElements || 0);
        setTotalPages(pg?.totalPages || 0);
        setPage(pg?.number || 0);
      }
    } catch (e: any) {
      setErr(e?.message || "검색 중 오류");
      setRows([]);
      setTotalPages(0);
      setTotalElements(0);
      setPage(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearch(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  const goPage = (p: number) => {
    const next = Math.max(0, Math.min(p, totalPages - 1));
    fetchSearch(next);
  };

  const onClickRow = (hit: SearchHit) => {
    navigate(buildUrl(hit));
  };

  return (
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
                <h5>검색 완료</h5>
                <div className="mb-2">
                  키워드: <b>{q || "(없음)"}</b> / 타입: <b>{type}</b>
                </div>

                {loading && <p>검색 중...</p>}
                {err && <p style={{ color: "crimson" }}>{err}</p>}

                {!loading && !err && rows.length === 0 && <p>검색 결과가 없습니다.</p>}

                {rows.length > 0 && (
                  <>
                    <Table bordered hover responsive>
                      <thead>
                        <tr className="text-center">
                          <th style={{ width: 80 }}>#</th>
                          <th style={{ width: 140 }}>구분</th>
                          <th>제목</th>
                          <th style={{ width: 320 }}>설명</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((h, i) => (
                          <tr
                            key={`${h.type}-${h.id}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => onClickRow(h)}
                          >
                            <td className="text-center">{i + 1 + page * size}</td>
                            <td className="text-center">
                              <Badge bg="light" text="dark">
                                {h.type}
                              </Badge>
                            </td>
                            <td>{h.title}</td>
                            <td className="text-muted">{h.sub || h.extra || ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <Center>
                      <PageTotal>
                        총 {totalElements}건 {page + 1} / {totalPages || 1} 페이지
                      </PageTotal>

                      {type !== "all" && totalPages > 1 && (
                        <Pagination>
                          <Pagination.First disabled={page === 0} onClick={() => goPage(0)} />
                          <Pagination.Prev disabled={page === 0} onClick={() => goPage(page - 1)} />

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
                    </Center>

                    {type === "all" && (
                      <div className="small text-muted mt-2">
                        * 전체(all) 검색은 백엔드가 타입별로 나눠서 페이징하기 때문에,
                        현재 화면은 “각 타입의 첫 페이지”를 합쳐서 보여줍니다.
                        (전체 페이징이 필요하면 백엔드에 all 통합 페이징 API가 필요)
                      </div>
                    )}
                  </>
                )}
              </Ctap>
            </Col>
          </Row>
        </Container>
      </DflexColumn>
    </Wrapper>
  );
};

export default SearchPage;