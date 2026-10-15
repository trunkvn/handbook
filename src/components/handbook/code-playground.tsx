"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { loadCode, saveCode } from "@/lib/code-storage";
import { runCode, type RunResult } from "@/lib/code-runner/run";

const CodeEditor = dynamic(() => import("./code-editor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => <div className="code-loading">Đang tải trình soạn code…</div>,
});

type RunState = { kind: "idle" } | { kind: "running" } | { kind: "done"; result: RunResult };

const PHASE_LABEL = {
  syntax: "Lỗi cú pháp",
  runtime: "Lỗi khi chạy",
  timeout: "Hết thời gian",
} as const;

/** Write the solution in the page and check it against the exercise's tests. */
export function CodePlayground({ id, starter, tests }: { id: string; starter: string; tests: string }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(starter);
  const [state, setState] = useState<RunState>({ kind: "idle" });

  // Keep what the user typed, so a reload does not lose it.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => saveCode(id, code === starter ? null : code), 400);
    return () => window.clearTimeout(timer);
  }, [open, id, code, starter]);

  function toggle() {
    if (!open) setCode(loadCode(id) ?? starter);
    setOpen(!open);
  }

  async function run() {
    if (state.kind === "running") return;
    setState({ kind: "running" });
    setState({ kind: "done", result: await runCode(code, tests) });
  }

  function reset() {
    if (code !== starter && !confirm("Đặt lại về mã mẫu? Code bạn đã viết sẽ mất.")) return;
    setCode(starter);
    saveCode(id, null);
    setState({ kind: "idle" });
  }

  return (
    <div className="playground">
      <button type="button" className="playground-toggle" aria-expanded={open} onClick={toggle}>
        <span aria-hidden="true">{open ? "▾" : "▸"}</span> Viết code trực tiếp
      </button>

      {open && (
        <div className="playground-body">
          <CodeEditor value={code} onChange={setCode} onRun={run} />
          <div className="playground-bar">
            <button type="button" className="btn btn-run" onClick={run} disabled={state.kind === "running"}>
              {state.kind === "running" ? "Đang chạy…" : "Chạy test"}
            </button>
            <button type="button" className="btn btn-quiet" onClick={reset}>
              Đặt lại
            </button>
            <span className="playground-hint">Ctrl/⌘ + Enter để chạy · Esc rồi Tab để rời editor</span>
          </div>
          <Results state={state} />
        </div>
      )}
    </div>
  );
}

function Results({ state }: { state: RunState }) {
  if (state.kind !== "done") return <div className="results" role="status" aria-live="polite" />;
  const { result } = state;

  return (
    <div className="results" role="status" aria-live="polite">
      {result.status === "error" ? (
        <>
          <p className="results-summary fail">{PHASE_LABEL[result.phase]}</p>
          <pre className="results-msg">{result.message}</pre>
        </>
      ) : (
        <>
          <ResultSummary result={result} />
          <ul className="results-list">
            {result.results.map((r, i) => (
              <li key={i} className={r.pass ? "pass" : "fail"}>
                <span className="mark" aria-label={r.pass ? "đạt" : "chưa đạt"}>
                  {r.pass ? "✓" : "✗"}
                </span>
                <span className="name">{r.name}</span>
                {!r.pass && r.message && <pre className="results-msg">{r.message}</pre>}
              </li>
            ))}
          </ul>
        </>
      )}
      {result.logs.length > 0 && (
        <div className="results-console">
          <span className="results-console-label">Console</span>
          <pre>
            {result.logs.map((l, i) => (
              <span key={i} className={l.level}>
                {l.text}
                {"\n"}
              </span>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}

function ResultSummary({ result }: { result: Extract<RunResult, { status: "ok" }> }) {
  const passed = result.results.filter((r) => r.pass).length;
  const total = result.results.length;
  const all = total > 0 && passed === total;
  return (
    <p className={all ? "results-summary pass" : "results-summary fail"}>
      {all ? `Tất cả ${total} test đạt ✓` : `${passed} / ${total} test đạt`}
    </p>
  );
}
