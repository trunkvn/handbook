import { parts } from "./parts";

export { parts };
export { getGroup, groups, orderedParts } from "./groups";
export type { PartGroup } from "./groups";
export type { Part, Question } from "./types";

const entities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/** Plain text of an HTML fragment (for the table of contents). */
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39);/g, (e) => entities[e])
    .replace(/\s+/g, " ")
    .trim();
}

export const getPart = (slug: string) => parts.find((p) => p.slug === slug);

export const totalQuestions = parts.reduce((n, p) => n + p.questions.length, 0);

export const formatNumber = (n: number) => String(n).padStart(2, "0");
