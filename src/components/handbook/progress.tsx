"use client";

import { resetProgress, useHandbook } from "@/lib/handbook-store";

export function Progress({ ids }: { ids: string[] }) {
  const count = useHandbook((s) => ids.filter((id) => s.done[id]).length);
  const total = ids.length;
  const percent = Math.round((count / total) * 100);

  function reset() {
    if (count === 0 || confirm("Đặt lại toàn bộ tiến độ?")) resetProgress();
  }

  return (
    <div className="progress">
      <div className="progress-meta">
        <span>
          {count} / {total} đã thuộc
        </span>
        <button className="btn btn-quiet" type="button" onClick={reset}>
          Đặt lại
        </button>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Tiến độ"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
