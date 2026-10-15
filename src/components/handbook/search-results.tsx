"use client";

import Link from "next/link";
import { setQuery, useHandbook } from "@/lib/handbook-store";

const MAX_RESULTS = 40;

export function SearchResults() {
  const query = useHandbook((s) => s.query);
  const results = useHandbook((s) => s.results);
  const ready = useHandbook((s) => s.searchReady);

  if (!ready) return <p className="search-note">Đang tải chỉ mục tìm kiếm…</p>;
  if (results.length === 0) {
    return <p className="search-note">Không tìm thấy câu hỏi nào khớp với “{query.trim()}”.</p>;
  }

  return (
    <nav className="toc" aria-label="Kết quả tìm kiếm">
      <p className="search-note" role="status">
        {results.length} kết quả
        {results.length > MAX_RESULTS && ` (hiện ${MAX_RESULTS} đầu tiên)`}
      </p>
      <ol className="toc-results">
        {results.slice(0, MAX_RESULTS).map((hit) => (
          <li key={hit.id}>
            <Link href={`/${hit.slug}#${hit.id}`} onClick={() => setQuery("")}>
              <span className="n">{hit.number}</span>
              <span className="t">{hit.title}</span>
              <span className="where">{hit.partTitle}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
