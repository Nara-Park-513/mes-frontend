import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  // ✅ type별 상세/목록 이동 규칙 (너 프로젝트 라우터에 맞게 바꿔)
  switch (hit.type) {
    case "inventory":
      return `/im`; // 목록 화면으로 이동
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

export default function TopSearch() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<"all" | "inventory" | "kpi" | "member" | "production" | "purchase" | "sales" | "standard" | "system">("all");

  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const doSearch = async (kw: string) => {
    const q = kw.trim();
    if (!q) {
      setHits([]);
      setOpen(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const url =
        `${API_BASE}/api/search?keyword=${encodeURIComponent(q)}` +
        `&type=${encodeURIComponent(type)}` +
        `&page=0&size=5&sort=id,desc`;

      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        throw new Error(raw || "검색 실패");
      }

      const data: GlobalSearchResponse = await res.json();

      // ✅ type=all이면 results에 여러 페이지가 들어옴 → 합쳐서 보여주기
      const merged: SearchHit[] = [];
      Object.keys(data.results || {}).forEach((k) => {
        const page = data.results[k];
        if (page?.content?.length) merged.push(...page.content);
      });

      setHits(merged);
      setOpen(true);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error(e);
      setHits([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 디바운스: 타이핑 멈추면 300ms 뒤 검색
  useEffect(() => {
    const t = setTimeout(() => doSearch(keyword), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, type]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(keyword);
  };

  const onPick = (hit: SearchHit) => {
    setOpen(false);
    // 필요하면 keyword 유지/초기화 선택
    // setKeyword("");
    navigate(buildUrl(hit));
  };

  return (
    <div className="position-relative">
      <form
        onSubmit={onSubmit}
        className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search"
      >
        <div className="input-group">
          {/* (선택) type 필터 */}
          <div className="input-group-prepend">
            <select
              className="custom-select bg-light border-0 small"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              style={{ maxWidth: 140 }}
            >
              <option value="all">전체</option>
              <option value="inventory">재고</option>
              <option value="kpi">KPI</option>
              <option value="sales">영업</option>
              <option value="production">생산</option>
              <option value="purchase">구매</option>
              <option value="standard">기준</option>
              <option value="system">시스템</option>
              <option value="member">회원</option>
            </select>
          </div>

          <input
            type="text"
            className="form-control bg-light border-0 small"
            placeholder="Search for..."
            aria-label="Search"
            aria-describedby="basic-addon2"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => keyword.trim() && setOpen(true)}
          />

          <div className="input-group-append">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              <i className="fas fa-search fa-sm"></i>
            </button>
          </div>
        </div>
      </form>

      {/* ✅ 결과 드롭다운 */}
      {open && keyword.trim() && (
        <div
          className="dropdown-menu show p-2"
          style={{
            width: "100%",
            minWidth: 420,
            maxHeight: 360,
            overflowY: "auto",
            left: 0,
          }}
        >
          {loading && (
            <div className="dropdown-item text-muted">검색 중...</div>
          )}

          {!loading && hits.length === 0 && (
            <div className="dropdown-item text-muted">검색 결과가 없습니다.</div>
          )}

          {!loading &&
            hits.map((h) => (
              <button
                key={`${h.type}-${h.id}`}
                type="button"
                className="dropdown-item"
                onClick={() => onPick(h)}
              >
                <div className="d-flex justify-content-between">
                  <strong>{h.title || "(제목없음)"}</strong>
                  <span className="badge badge-light text-uppercase">{h.type}</span>
                </div>
                <div className="small text-muted">{h.sub}</div>
                {h.extra ? <div className="small text-muted">{h.extra}</div> : null}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}