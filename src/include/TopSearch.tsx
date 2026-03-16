import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:9500";

type SearchType =
  | "all"
  | "sales"
  | "production"
  | "purchase"
  | "inventory"
  | "kpi"
  | "standard"
  | "system"
  | "quality"
  | "member";

type SearchHit = {
  type: string;
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

const CATEGORY_ORDER: SearchType[] = [
  "sales",
  "production",
  "purchase",
  "inventory",
  "kpi",
  "standard",
  "system",
  "quality",
  "member",
  "all",
];

function buildUrl(hit: SearchHit) {
  switch (hit.type) {
    case "sales":
      return `/sales`;
    case "production":
      return `/pmanagement`;
    case "purchase":
      return `/pm`;
    case "inventory":
      return `/im`;
    case "kpi":
      return `/kpi`;
    case "standard":
      return `/standard`;
    case "system":
      return `/system`;
    case "quality":
      return `/quality`;
    case "member":
      return `/members`;
    default:
      return `/`;
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "sales":
      return "영업";
    case "production":
      return "생산";
    case "purchase":
      return "구매";
    case "inventory":
      return "재고";
    case "kpi":
      return "KPI";
    case "standard":
      return "기준";
    case "system":
      return "시스템";
    case "quality":
      return "품질";
    case "member":
      return "회원";
    default:
      return type;
  }
}

export default function TopSearch() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<SearchType>("all");

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

      const res = await fetch(url, {
        signal: controller.signal,
        credentials: "include",
      });

      const raw = await res.text().catch(() => "");
      if (!res.ok) {
        throw new Error(raw || "검색 실패");
      }

      const data: GlobalSearchResponse = raw ? JSON.parse(raw) : { results: {} };

      if (type === "all") {
        const merged: SearchHit[] = [];

        CATEGORY_ORDER.forEach((category) => {
          if (category === "all") return;
          const pageData = data.results?.[category];
          if (pageData?.content?.length) {
            merged.push(...pageData.content);
          }
        });

        setHits(merged);
      } else {
        const pageData = data.results?.[type];
        setHits(pageData?.content || []);
      }

      setOpen(true);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("검색 실패", e);
      setHits([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      doSearch(keyword);
    }, 300);

    return () => clearTimeout(t);
  }, [keyword, type]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(keyword);
  };

  const onPick = (hit: SearchHit) => {
    setOpen(false);
    navigate(buildUrl(hit));
  };

  return (
    <div className="position-relative">
      <form
        onSubmit={onSubmit}
        className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search"
      >
        <div className="d-flex align-items-center" style={{ width: "100%" }}>
          <select
            className="custom-select bg-light border-0 small"
            value={type}
            onChange={(e) => setType(e.target.value as SearchType)}
            style={{
              maxWidth: 140,
              marginRight: "10px",
              borderRadius: "0.35rem",
            }}
          >
            <option value="all">전체</option>
            <option value="sales">영업</option>
            <option value="production">생산</option>
            <option value="purchase">구매</option>
            <option value="inventory">재고</option>
            <option value="kpi">KPI</option>
            <option value="standard">기준</option>
            <option value="system">시스템</option>
            <option value="quality">품질</option>
            <option value="member">회원</option>
          </select>

          <div className="input-group">
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
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                <i className="fas fa-search fa-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </form>

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
            <div className="dropdown-item text-muted">
              검색 결과가 없습니다.
            </div>
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
                  <span className="badge badge-secondary">
                    {getTypeLabel(h.type)}
                  </span>
                </div>
                <div className="small text-muted">{h.sub}</div>
                {h.extra ? (
                  <div className="small text-muted">{h.extra}</div>
                ) : null}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}