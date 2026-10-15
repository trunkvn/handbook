"use client";

import { setTheme, useHandbook, type Theme } from "@/lib/handbook-store";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export function ThemeSwitch() {
  const theme = useHandbook((s) => s.theme);
  return (
    <div className="themes" role="group" aria-label="Giao diện">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          className="btn"
          aria-pressed={theme === o.value}
          onClick={() => setTheme(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
