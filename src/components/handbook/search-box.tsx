"use client";

import { setQuery, useHandbook } from "@/lib/handbook-store";

export function SearchBox() {
  const query = useHandbook((s) => s.query);
  return (
    <input
      className="input search"
      type="search"
      autoComplete="off"
      placeholder="VD: cookie, idempotent…"
      aria-label="Tìm câu hỏi"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
