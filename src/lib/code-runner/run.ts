import { WORKER_SOURCE } from "./harness";

export interface TestResult {
  name: string;
  pass: boolean;
  message?: string;
  ms: number;
}

export interface LogLine {
  level: "log" | "warn" | "error";
  text: string;
}

export type RunResult =
  | { status: "ok"; results: TestResult[]; logs: LogLine[] }
  | { status: "error"; phase: "syntax" | "runtime" | "timeout"; message: string; logs: LogLine[] };

const TIMEOUT_MS = 6000;

/**
 * Runs the user's code and the exercise tests in a throwaway Web Worker, so an infinite loop
 * can only freeze the worker (which we terminate), never the page.
 */
export function runCode(code: string, tests: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
    const worker = new Worker(url);

    const finish = (result: RunResult) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(result);
    };

    const timer = window.setTimeout(
      () =>
        finish({
          status: "error",
          phase: "timeout",
          message: `Chạy quá ${TIMEOUT_MS / 1000}s: có thể có vòng lặp vô hạn hoặc thuật toán quá chậm.`,
          logs: [],
        }),
      TIMEOUT_MS,
    );

    worker.onmessage = (e: MessageEvent<RunResult>) => finish(e.data);
    worker.onerror = (e) =>
      finish({ status: "error", phase: "runtime", message: e.message || "Lỗi không xác định", logs: [] });
    worker.postMessage({ code, tests });
  });
}
