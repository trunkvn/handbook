"use client";

import { setLang, useHandbook, type Lang } from "@/lib/handbook-store";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "both", label: "EN + VI" },
  { value: "vi", label: "VI" },
];

export function LangSwitch() {
  const lang = useHandbook((s) => s.lang);
  return (
    <div className="seg" role="group" aria-labelledby="lbl-lang">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          className="seg-btn"
          aria-pressed={lang === o.value}
          onClick={() => setLang(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
