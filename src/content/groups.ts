import { parts } from "./parts";
import type { Part } from "./types";

// How the parts are grouped in the sidebar and on the home page, in display order.
// Every part must appear in exactly one group (checked below, so a forgotten part fails the build).
const layout = [
  {
    id: "gioi-thieu",
    title: "Giới thiệu & hành vi",
    slugs: ["gioi-thieu-ban-than", "kinh-nghiem-hanh-vi", "cau-chuyen-star"],
  },
  {
    id: "du-an",
    title: "Dự án thực tế",
    slugs: ["kien-truc-tang-api", "thanh-toan-thuong-mai", "xac-thuc-bao-mat", "thanh-toan-bao-mat-nang-cao"],
  },
  {
    id: "js-ts",
    title: "JavaScript & TypeScript",
    slugs: ["javascript-core", "typescript"],
  },
  {
    id: "framework",
    title: "React, Vue & hiệu năng",
    slugs: ["react-next-js", "vue-nuxt", "hieu-nang-web"],
  },
  {
    id: "viet-code",
    title: "Viết code",
    slugs: ["viet-code-tay", "viet-code-ngay-3", "viet-code-ngay-4"],
  },
  {
    id: "leetcode",
    title: "LeetCode",
    slugs: ["leetcode", "leetcode-ngay-2", "leetcode-ngay-3", "leetcode-ngay-4"],
  },
];

export interface PartGroup {
  id: string;
  title: string;
  parts: Part[];
}

export const groups: PartGroup[] = layout.map((g) => ({
  id: g.id,
  title: g.title,
  parts: g.slugs.map((slug) => {
    const part = parts.find((p) => p.slug === slug);
    if (!part) throw new Error(`groups.ts: unknown part slug "${slug}"`);
    return part;
  }),
}));

/** All parts in sidebar order (used for previous / next links). */
export const orderedParts: Part[] = groups.flatMap((g) => g.parts);

const missing = parts.filter((p) => !orderedParts.includes(p));
if (missing.length || orderedParts.length !== parts.length) {
  throw new Error(
    `groups.ts: every part must be in exactly one group. Missing or duplicated: ${
      missing.map((p) => p.slug).join(", ") || "(duplicate slug)"
    }`,
  );
}

export const getGroup = (slug: string) => groups.find((g) => g.parts.some((p) => p.slug === slug));
