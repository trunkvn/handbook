"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { toggleDone, useHandbook } from "@/lib/handbook-store";
import { preloadContent, ReviewPreview } from "./review-preview";

export interface ReviewGroup {
  id: string;
  title: string;
  parts: {
    slug: string;
    title: string;
    questions: { id: string; number: string; title: string; tag: string }[];
  }[];
}

const noopSubscribe = () => () => {};

/** Every question marked as learned, grouped by topic, with quick preview, link and undo. */
export function ReviewList({ groups }: { groups: ReviewGroup[] }) {
  // Saved progress only exists in the browser: say nothing until it is read, so there is no flash of "empty".
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const done = useHandbook((s) => s.done);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  // Questions un-ticked during this visit stay on the page so that "Hoàn tác" can bring them back.
  const [removed, setRemoved] = useState<Record<string, true>>({});

  if (!hydrated) return <p className="search-note">Đang tải…</p>;

  const shown = (id: string) => done[id] || removed[id];
  const counts = groups.map((g) => ({
    id: g.id,
    title: g.title,
    n: g.parts.reduce((sum, p) => sum + p.questions.filter((q) => done[q.id]).length, 0),
  }));
  const total = counts.reduce((sum, g) => sum + g.n, 0);

  if (total === 0 && Object.keys(removed).length === 0) {
    return (
      <p className="review-empty">
        Bạn chưa đánh dấu câu nào là đã thuộc. Tick “Đã thuộc” ở cuối mỗi câu hỏi, rồi quay lại đây để
        ôn. <Link href="/">Về danh sách các phần</Link>.
      </p>
    );
  }

  const activeFilter = filter === "all" || counts.some((g) => g.id === filter && g.n > 0) ? filter : "all";

  function untick(id: string) {
    setRemoved((r) => ({ ...r, [id]: true }));
    toggleDone(id);
  }

  return (
    <>
      <div className="review-filter" role="group" aria-label="Lọc theo nhóm">
        <button
          type="button"
          className="btn"
          aria-pressed={activeFilter === "all"}
          onClick={() => setFilter("all")}
        >
          Tất cả ({total})
        </button>
        {counts
          .filter((g) => g.n > 0)
          .map((g) => (
            <button
              key={g.id}
              type="button"
              className="btn"
              aria-pressed={activeFilter === g.id}
              onClick={() => setFilter(g.id)}
            >
              {g.title} ({g.n})
            </button>
          ))}
      </div>

      {groups
        .filter((g) => activeFilter === "all" || g.id === activeFilter)
        .map((group) => {
          const parts = group.parts
            .map((p) => ({ ...p, questions: p.questions.filter((q) => shown(q.id)) }))
            .filter((p) => p.questions.length > 0);
          if (parts.length === 0) return null;
          return (
            <section key={group.id} className="review-group" aria-labelledby={`review-${group.id}`}>
              <h2 id={`review-${group.id}`} className="group-title">
                <span>{group.title}</span>
              </h2>
              {parts.map((part) => (
                <div key={part.slug} className="review-part">
                  <h3 className="review-part-title">{part.title}</h3>
                  <ol className="review-list">
                    {part.questions.map((q) => {
                      const isDone = !!done[q.id];
                      const isOpen = !!open[q.id] && isDone;
                      return (
                        <li key={q.id} className={isDone ? "review-row" : "review-row removed"}>
                          <div className="review-head">
                            <div className="review-main">
                              <span className="num">Câu {q.number}</span>
                              <span className="review-title">{q.title}</span>
                              <span className="review-where">{q.tag}</span>
                            </div>
                            <div className="review-actions">
                              {isDone ? (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-quiet"
                                    aria-expanded={isOpen}
                                    onClick={() => {
                                      if (!isOpen) void preloadContent();
                                      setOpen((o) => ({ ...o, [q.id]: !isOpen }));
                                    }}
                                  >
                                    {isOpen ? "Thu gọn" : "Xem nhanh"}
                                  </button>
                                  <Link className="btn btn-quiet" href={`/${part.slug}#${q.id}`}>
                                    Mở trong phần
                                  </Link>
                                  <button type="button" className="btn btn-quiet" onClick={() => untick(q.id)}>
                                    Bỏ đánh dấu
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="review-removed" role="status">
                                    Đã bỏ đánh dấu
                                  </span>
                                  <button type="button" className="btn btn-quiet" onClick={() => toggleDone(q.id)}>
                                    Hoàn tác
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          {isOpen && <ReviewPreview id={q.id} />}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </section>
          );
        })}
    </>
  );
}
