"use client";

import { useHandbook } from "@/lib/handbook-store";

/** "3/5": how many of the given questions are marked as learned. */
export function PartCount({ ids }: { ids: string[] }) {
  const done = useHandbook((s) => ids.filter((id) => s.done[id]).length);
  return (
    <span className="count" title="Đã thuộc / tổng số câu">
      {done}/{ids.length}
    </span>
  );
}
