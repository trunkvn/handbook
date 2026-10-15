"use client";

import { Suspense, use } from "react";
import { AnswerColumns } from "./answer-columns";

let loading: Promise<typeof import("@/content")> | null = null;

/** The full content is a separate chunk: it is only downloaded when someone opens a preview. */
export function preloadContent() {
  loading ??= import("@/content");
  return loading;
}

function Loaded({ id }: { id: string }) {
  const { parts } = use(preloadContent());
  const q = parts.flatMap((p) => p.questions).find((x) => x.id === id);
  if (!q) return null;

  return (
    <div className="review-preview">
      <p className="q-vi" dangerouslySetInnerHTML={{ __html: q.titleVi }} />
      <div className="framework">
        <h4>{q.framework.title}</h4>
        <ol>
          {q.framework.steps.map((step, i) => (
            <li key={i}>
              <span dangerouslySetInnerHTML={{ __html: step }} />
            </li>
          ))}
        </ol>
      </div>
      <AnswerColumns {...q.answer} />
      {q.extras?.map((extra) => (
        <div className="extra" key={extra.title}>
          <p className="extra-title">{extra.title}</p>
          <AnswerColumns en={extra.en} vi={extra.vi} />
        </div>
      ))}
    </div>
  );
}

/** Framework and bilingual answer of one question, shown inline on the review page. */
export function ReviewPreview({ id }: { id: string }) {
  return (
    <Suspense fallback={<p className="search-note">Đang tải nội dung…</p>}>
      <Loaded id={id} />
    </Suspense>
  );
}
