"use client";

import { useEffect, useId, useSyncExternalStore, type MouseEvent } from "react";
import { isSpeechSupported, stopIfActive, toggleSpeak, useSpeech, type SpeechLang } from "@/lib/speech";

const noopSubscribe = () => () => {};

/** Reads the answer column it sits in aloud. Hidden when the browser has no speech synthesis. */
export function SpeakButton({ lang }: { lang: SpeechLang }) {
  const id = useId();
  const supported = useSyncExternalStore(noopSubscribe, isSpeechSupported, () => false);
  const speaking = useSpeech((s) => s.activeId === id);
  const notice = useSpeech((s) => (s.noticeId === id ? s.notice : null));

  // Leaving the page (or this button unmounting) must not leave the voice running.
  useEffect(() => () => stopIfActive(id), [id]);

  if (!supported) return null;

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    const body = e.currentTarget.closest(".col")?.querySelector<HTMLElement>(".col-body");
    if (body) toggleSpeak(id, body, lang);
  }

  const language = lang === "en" ? "tiếng Anh" : "tiếng Việt";
  return (
    <>
      {notice && (
        <span className="speak-note" role="status">
          {notice}
        </span>
      )}
      <button
        type="button"
        className="btn speak"
        aria-pressed={speaking}
        aria-label={speaking ? `Dừng đọc phần ${language}` : `Nghe phần ${language}`}
        title={speaking ? "Dừng" : "Nghe đọc"}
        onClick={onClick}
      >
        {speaking ? (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <rect x="3.5" y="3.5" width="9" height="9" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6v4h2.5L8 13V3L4.5 6H2z" fill="currentColor" />
            <path
              d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.3 3.7a6 6 0 0 1 0 8.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        )}
        {speaking ? "Dừng" : "Nghe"}
      </button>
    </>
  );
}
