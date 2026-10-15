"use client";

import { useSyncExternalStore } from "react";
import { SPEECH_RATES, setSpeechRate, setVoice, useHandbook } from "@/lib/handbook-store";
import {
  getServerVoices,
  getVoicesSnapshot,
  isSpeechSupported,
  subscribeVoices,
  toggleSample,
  useSpeech,
  voicesFor,
  type SpeechLang,
} from "@/lib/speech";

const noopSubscribe = () => () => {};

function VoicePicker({ lang, label }: { lang: SpeechLang; label: string }) {
  const all = useSyncExternalStore(subscribeVoices, getVoicesSnapshot, getServerVoices);
  const chosen = useHandbook((s) => (lang === "en" ? s.voiceEn : s.voiceVi));
  const sampling = useSpeech((s) => s.activeId === `sample-${lang}`);
  const options = voicesFor(lang, all);
  const id = `voice-${lang}`;

  return (
    <div className="speech-row">
      <label className="speech-label" htmlFor={id}>
        {label}
      </label>
      <div className="speech-voice">
        <select
          id={id}
          className="input"
          value={options.some((v) => v.voiceURI === chosen) ? chosen : ""}
          disabled={options.length === 0}
          onChange={(e) => setVoice(lang, e.target.value)}
        >
          <option value="">{options.length === 0 ? "Máy chưa có giọng này" : "Tự động"}</option>
          {options.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-quiet"
          aria-pressed={sampling}
          disabled={options.length === 0}
          onClick={() => toggleSample(lang)}
        >
          {sampling ? "Dừng" : "Nghe thử"}
        </button>
      </div>
    </div>
  );
}

/** Speed and voice for the "listen" buttons. Hidden when the browser cannot speak. */
export function SpeechSettings() {
  const supported = useSyncExternalStore(noopSubscribe, isSpeechSupported, () => false);
  const rate = useHandbook((s) => s.speechRate);
  if (!supported) return null;

  return (
    <details className="speech-settings">
      <summary>Giọng đọc</summary>
      <div className="speech-row">
        <span className="speech-label" id="lbl-rate">
          Tốc độ
        </span>
        <div className="seg" role="group" aria-labelledby="lbl-rate">
          {SPEECH_RATES.map((r) => (
            <button
              key={r}
              type="button"
              className="seg-btn"
              aria-pressed={rate === r}
              onClick={() => setSpeechRate(r)}
            >
              {r}×
            </button>
          ))}
        </div>
      </div>
      <VoicePicker lang="en" label="Giọng tiếng Anh" />
      <VoicePicker lang="vi" label="Giọng tiếng Việt" />
    </details>
  );
}
