"use client";

import { toggleDone, useHandbook } from "@/lib/handbook-store";

export function DoneToggle({ id }: { id: string }) {
  const done = useHandbook((s) => !!s.done[id]);
  return (
    <label className="done-toggle">
      <input type="checkbox" className="done-cb" checked={done} onChange={() => toggleDone(id)} />{" "}
      <span>Đã thuộc</span>
    </label>
  );
}
