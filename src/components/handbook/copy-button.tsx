"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

/** Copies the text of the sibling `.col-body` of the column it sits in. */
export function CopyButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(e: MouseEvent<HTMLButtonElement>) {
    const body = e.currentTarget.closest(".col")?.querySelector<HTMLElement>(".col-body");
    if (!body || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(body.innerText.trim());
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button type="button" className="btn copy" onClick={copy}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
