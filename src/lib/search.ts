// Full-text search across every part. Loaded on demand (dynamic import) the first time the user searches,
// so the content is not part of the initial JavaScript.
import { formatNumber, htmlToText, parts } from "@/content";

export interface SearchHit {
  id: string;
  slug: string;
  partTitle: string;
  number: string;
  title: string;
}

/** Lower-case and drop diacritics, so "dat lich" finds "đặt lịch". */
const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

const entries = parts.flatMap((part) =>
  part.questions.map((q) => {
    const title = htmlToText(q.title);
    const extras = (q.extras ?? []).flatMap((e) => [e.title, e.en, e.vi]);
    const body = [
      q.tag,
      q.titleVi,
      ...q.framework.steps,
      q.answer.en,
      q.answer.vi,
      ...extras,
      ...q.terms,
    ]
      .map(htmlToText)
      .join(" ");
    return {
      hit: { id: q.id, slug: part.slug, partTitle: part.title, number: formatNumber(q.number), title } satisfies SearchHit,
      title: strip(title + " " + htmlToText(q.titleVi)),
      body: strip(body),
    };
  }),
);

/** Every word must match; questions whose title matches come first. */
export function search(query: string): SearchHit[] {
  const words = strip(query.trim()).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const inTitle: SearchHit[] = [];
  const inBody: SearchHit[] = [];
  for (const e of entries) {
    if (!words.every((w) => e.title.includes(w) || e.body.includes(w))) continue;
    (words.every((w) => e.title.includes(w)) ? inTitle : inBody).push(e.hit);
  }
  return [...inTitle, ...inBody];
}
