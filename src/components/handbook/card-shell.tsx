"use client";

import type { ReactNode } from "react";
import { reveal, useHandbook } from "@/lib/handbook-store";

/**
 * Client wrapper around a question: owns the state-dependent classes (done, revealed)
 * while the heavy content stays server-rendered and arrives through the slots.
 */
export function CardShell({
  id,
  header,
  playground,
  answer,
  footer,
}: {
  id: string;
  header: ReactNode;
  /** Optional code editor, shown before the answer so the user can try first. */
  playground?: ReactNode;
  answer: ReactNode;
  footer: ReactNode;
}) {
  const done = useHandbook((s) => !!s.done[id]);
  const revealed = useHandbook((s) => !!s.revealed[id]);
  const className = ["card", done && "done", revealed && "revealed"]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className} id={id}>
      {header}
      {playground}
      <div className="reveal">
        <button type="button" className="btn" onClick={() => reveal(id)}>
          Hiện đáp án
        </button>
      </div>
      <div className="reveal-zone">{answer}</div>
      {footer}
    </article>
  );
}
