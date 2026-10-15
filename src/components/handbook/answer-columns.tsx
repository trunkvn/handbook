import type { AnswerColumns as AnswerColumnsData } from "@/content/types";
import { CopyButton } from "./copy-button";

function Column({ lang, label, html }: { lang: "en" | "vi"; label: string; html: string }) {
  return (
    <div className="col" lang={lang}>
      <div className="col-head">
        <span className="col-label">{label}</span>
        <CopyButton />
      </div>
      <div className="col-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/** English and Vietnamese answers side by side (stacked on narrow screens). */
export function AnswerColumns({ en, vi }: AnswerColumnsData) {
  return (
    <div className="body">
      <Column lang="en" label="ENGLISH" html={en} />
      <Column lang="vi" label="TIẾNG VIỆT" html={vi} />
    </div>
  );
}
