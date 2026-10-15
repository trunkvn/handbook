"use client";

import { togglePractice, useHandbook } from "@/lib/handbook-store";

export function PracticeSwitch() {
  const on = useHandbook((s) => s.practice);
  return (
    <label className="switch">
      <span>
        Chế độ luyện tập
        <small>Ẩn đáp án, tự nói trước rồi mới xem</small>
      </span>
      <button
        type="button"
        role="switch"
        className="switch-btn"
        aria-checked={on}
        aria-label="Chế độ luyện tập"
        onClick={togglePractice}
      >
        <span className="thumb" />
      </button>
    </label>
  );
}
