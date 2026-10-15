/** Side-by-side English / Vietnamese HTML fragments. */
export interface AnswerColumns {
  en: string;
  vi: string;
}

/** Optional deeper dive shown under the main answer. */
export interface Extra extends AnswerColumns {
  title: string;
}

export interface Question {
  /** Anchor id, e.g. `q05`. Also the key used for saved progress, so never rename it. */
  id: string;
  number: number;
  tag: string;
  /** HTML: may contain inline `<code>`. */
  title: string;
  /** HTML: Vietnamese translation of the question. */
  titleVi: string;
  framework: { title: string; steps: string[] };
  /** HTML fragments rendered with `dangerouslySetInnerHTML`; authored in-repo, so trusted. */
  answer: AnswerColumns;
  extras?: Extra[];
  terms: string[];
}

export interface Part {
  id: string;
  /** URL segment: the part lives at `/<slug>`. */
  slug: string;
  roman: string;
  title: string;
  /** HTML: may contain inline `<code>`. */
  description: string;
  questions: Question[];
}
