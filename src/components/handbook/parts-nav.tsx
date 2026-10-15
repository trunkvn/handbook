"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHandbook } from "@/lib/handbook-store";
import { PartCount } from "./part-count";
import { SearchResults } from "./search-results";

export interface NavPart {
  slug: string;
  title: string;
  questions: { id: string; number: string; title: string }[];
}

export interface NavGroup {
  id: string;
  title: string;
  parts: NavPart[];
}

/**
 * Sidebar navigation: parts grouped by topic. The group of the current part is open, the others are
 * collapsed (click a heading to open or close one), and the current part lists its questions.
 */
export function PartsNav({ groups }: { groups: NavGroup[] }) {
  const searching = useHandbook((s) => s.query.trim() !== "");
  const done = useHandbook((s) => s.done);
  const slug = usePathname().split("/")[1];
  const currentGroup = groups.find((g) => g.parts.some((p) => p.slug === slug));
  const current = currentGroup?.parts.find((p) => p.slug === slug);
  // Only the groups the user opened or closed by hand; the rest follow the current page.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [spyId, setSpyId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Scroll spy: highlight the question near the top of the viewport and keep it visible in the sidebar.
  useEffect(() => {
    if (!current) return;
    const cards = current.questions
      .map((q) => document.getElementById(q.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setSpyId(entry.target.id);
          const link = navRef.current?.querySelector(`a[href="#${entry.target.id}"]`);
          const box = link?.closest(".sidebar");
          if (!link || !box) continue;
          const l = link.getBoundingClientRect();
          const b = box.getBoundingClientRect();
          if (l.top < b.top + 80 || l.bottom > b.bottom - 40) {
            box.scrollTop += l.top - b.top - b.height / 2;
          }
        }
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [current]);

  // On narrow screens the parts are a horizontal chip row: keep the current one in view.
  const currentSlug = current?.slug;
  useEffect(() => {
    const row = navRef.current?.querySelector<HTMLElement>(".toc-groups");
    const item = row?.querySelector<HTMLElement>("li.current");
    if (row && item) row.scrollLeft = item.offsetLeft - (row.clientWidth - item.offsetWidth) / 2;
  }, [currentSlug, searching]);

  if (searching) return <SearchResults />;

  const activeId = current?.questions.some((q) => q.id === spyId) ? spyId : null;

  return (
    <nav className="toc" aria-label="Mục lục" ref={navRef}>
      <div className="toc-groups">
        {groups.map((group) => {
          const open = toggled[group.id] ?? group.id === currentGroup?.id;
          const listId = `toc-group-${group.id}`;
          return (
            <div key={group.id} className={open ? "toc-group open" : "toc-group"}>
              <button
                type="button"
                className="toc-group-head"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setToggled({ ...toggled, [group.id]: !open })}
              >
                <span className="chev" aria-hidden="true">
                  ▸
                </span>
                <span className="label">{group.title}</span>
                <PartCount ids={group.parts.flatMap((p) => p.questions.map((q) => q.id))} />
              </button>
              <ol className="toc-parts" id={listId}>
                {group.parts.map((part) => {
                  const isCurrent = part.slug === current?.slug;
                  return (
                    <li key={part.slug} className={isCurrent ? "current" : undefined}>
                      <Link
                        href={`/${part.slug}`}
                        className="toc-part"
                        aria-current={isCurrent ? "page" : undefined}
                      >
                        <span className="t">{part.title}</span>
                        <PartCount ids={part.questions.map((q) => q.id)} />
                      </Link>
                      {isCurrent && (
                        <ol className="toc-questions">
                          {part.questions.map((q) => (
                            <li key={q.id}>
                              <a
                                href={`#${q.id}`}
                                className={[activeId === q.id && "active", done[q.id] && "done"]
                                  .filter(Boolean)
                                  .join(" ")}
                                aria-current={activeId === q.id ? "location" : undefined}
                              >
                                <span className="n">{q.number}</span>
                                <span className="t">{q.title}</span>
                              </a>
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
