// Reads answers aloud with the browser's Web Speech API (speechSynthesis). Client only.
import { useSyncExternalStore } from "react";
import { getState } from "./handbook-store";
import { cleanForSpeech, endWithPause, splitIntoChunks, type SpeechLang } from "./speech-text";

export type { SpeechLang };

const BCP47: Record<SpeechLang, string> = { en: "en-US", vi: "vi-VN" };

const NO_VOICE: Record<SpeechLang, string> = {
  en: "Thiết bị chưa có giọng đọc tiếng Anh.",
  vi: "Thiết bị chưa có giọng đọc tiếng Việt. Hãy cài giọng Vietnamese trong cài đặt của hệ điều hành.",
};

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/* ---------- Voices ---------- */

const NO_VOICES: readonly SpeechSynthesisVoice[] = [];
let voices: readonly SpeechSynthesisVoice[] = NO_VOICES;
let voicesBound = false;
const voiceListeners = new Set<() => void>();

/** Re-read the voice list; returns true when it changed (the snapshot must stay stable otherwise). */
function refreshVoices(): boolean {
  const next = window.speechSynthesis.getVoices();
  const same = next.length === voices.length && next.every((v, i) => v.voiceURI === voices[i].voiceURI);
  if (same) return false;
  voices = next;
  return true;
}

function bindVoices() {
  voicesBound = true;
  refreshVoices();
  // Chrome loads voices asynchronously and announces them with this event.
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    if (refreshVoices()) voiceListeners.forEach((l) => l());
  });
}

export function getVoicesSnapshot(): readonly SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return NO_VOICES;
  if (!voicesBound) bindVoices();
  return voices;
}

export function subscribeVoices(listener: () => void) {
  if (!isSpeechSupported()) return () => {};
  getVoicesSnapshot();
  voiceListeners.add(listener);
  return () => {
    voiceListeners.delete(listener);
  };
}

export const getServerVoices = () => NO_VOICES;

/** Android reports "vi_VN", desktop browsers "vi-VN". */
const baseLang = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace("_", "-").split("-")[0];

export function voicesFor(lang: SpeechLang, all: readonly SpeechSynthesisVoice[] = getVoicesSnapshot()) {
  return all.filter((v) => baseLang(v) === lang);
}

/** The chosen voice if it still exists; otherwise the best match (exact locale, then on-device). */
export function pickVoice(lang: SpeechLang, preferredURI: string): SpeechSynthesisVoice | null {
  if (isSpeechSupported() && voices.length === 0) refreshVoices();
  const candidates = voicesFor(lang);
  if (candidates.length === 0) return null;
  const chosen = candidates.find((v) => v.voiceURI === preferredURI);
  if (chosen) return chosen;
  const target = BCP47[lang].toLowerCase();
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang.toLowerCase().replace("_", "-") === target ? 2 : 0) + (v.localService ? 1 : 0);
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

/* ---------- Playback state ---------- */

interface SpeechState {
  /** Which button is speaking right now. */
  activeId: string | null;
  notice: string | null;
  noticeId: string | null;
}

const IDLE: SpeechState = { activeId: null, notice: null, noticeId: null };
let state = IDLE;
const listeners = new Set<() => void>();

function setState(patch: Partial<SpeechState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSpeech<T>(selector: (s: SpeechState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(IDLE),
  );
}

/* ---------- Playback ---------- */

export interface SpeechBlock {
  /** Element to highlight while this block is spoken. */
  el: HTMLElement | null;
  text: string;
}

let generation = 0; // bumped on every start/stop, so callbacks of a cancelled run are ignored
// Chrome may drop an utterance (and never fire its events) if nothing references it, so keep them until they end.
const retained = new Set<SpeechSynthesisUtterance>();
let highlighted: HTMLElement | null = null;
let noticeTimer = 0;

function highlight(el: HTMLElement | null) {
  highlighted?.classList.remove("speaking");
  highlighted = el;
  if (!el) return;
  el.classList.add("speaking");
  const rect = el.getBoundingClientRect();
  if (rect.top < 80 || rect.bottom > window.innerHeight - 40) {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
  }
}

export function stopSpeaking() {
  generation++;
  retained.clear();
  highlight(null);
  if (isSpeechSupported()) window.speechSynthesis.cancel();
  if (state.activeId) setState({ activeId: null });
}

/** Stop only if `id` is the one speaking (used when its button disappears). */
export function stopIfActive(id: string) {
  if (state.activeId === id) stopSpeaking();
}

function notify(id: string, message: string) {
  window.clearTimeout(noticeTimer);
  setState({ notice: message, noticeId: id });
  noticeTimer = window.setTimeout(() => setState({ notice: null, noticeId: null }), 7000);
}

/** Speak the blocks one after another, highlighting each. Must run inside a click handler (iOS requires it). */
export function speak(id: string, blocks: SpeechBlock[], lang: SpeechLang) {
  stopSpeaking();
  const settings = getState();
  const voice = pickVoice(lang, lang === "en" ? settings.voiceEn : settings.voiceVi);
  if (!voice) {
    notify(id, NO_VOICE[lang]);
    return;
  }

  const queue = blocks.flatMap((block) =>
    splitIntoChunks(cleanForSpeech(block.text, lang)).map((text, i) => ({ el: block.el, text, startsBlock: i === 0 })),
  );
  const token = ++generation;
  window.clearTimeout(noticeTimer);
  setState({ activeId: id, notice: null, noticeId: null });

  const finish = () => {
    if (token !== generation) return;
    retained.clear();
    highlight(null);
    setState({ activeId: null });
  };

  let index = 0;
  const next = () => {
    if (token !== generation) return;
    const item = queue[index++];
    if (!item) return finish();
    if (item.startsBlock) highlight(item.el);
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = BCP47[lang];
    utterance.voice = voice;
    utterance.rate = getState().speechRate; // read per piece, so changing the speed applies right away
    utterance.onend = () => {
      retained.delete(utterance);
      next();
    };
    utterance.onerror = (e) => {
      retained.delete(utterance);
      if (token !== generation) return;
      if (e.error === "canceled" || e.error === "interrupted") return;
      finish();
    };
    retained.add(utterance);
    window.speechSynthesis.speak(utterance);
  };
  next();
}

export function toggleSpeak(id: string, body: HTMLElement, lang: SpeechLang) {
  if (state.activeId === id) stopSpeaking();
  else speak(id, collectBlocks(body), lang);
}

const SAMPLE: Record<SpeechLang, string> = {
  en: "This is how the English voice sounds.",
  vi: "Đây là giọng đọc tiếng Việt.",
};

export function toggleSample(lang: SpeechLang) {
  const id = `sample-${lang}`;
  if (state.activeId === id) stopSpeaking();
  else speak(id, [{ el: null, text: SAMPLE[lang] }], lang);
}

/**
 * Turn an answer into spoken blocks: paragraphs, headings and list items, one by one.
 * Code blocks are skipped (reading code aloud is useless).
 */
export function collectBlocks(root: HTMLElement): SpeechBlock[] {
  const blocks: SpeechBlock[] = [];
  const push = (el: HTMLElement, text: string) => {
    const t = text.replace(/\s+/g, " ").trim();
    if (t) blocks.push({ el, text: endWithPause(t) });
  };
  const isList = (el: Element) => el.tagName === "UL" || el.tagName === "OL";

  const visit = (el: Element) => {
    if (!(el instanceof HTMLElement) || el.tagName === "PRE") return;
    if (isList(el)) {
      for (const li of Array.from(el.children)) visit(li);
    } else if (el.tagName === "LI") {
      // a list item's own text; nested lists and code blocks are handled separately
      let own = "";
      for (const node of Array.from(el.childNodes)) {
        if (node instanceof HTMLElement && (isList(node) || node.tagName === "PRE")) continue;
        own += node.textContent ?? "";
      }
      push(el, own);
      for (const child of Array.from(el.children)) if (isList(child)) visit(child);
    } else {
      push(el, el.textContent ?? "");
    }
  };
  for (const child of Array.from(root.children)) visit(child);
  return blocks;
}

if (typeof window !== "undefined") {
  // Never keep talking after the page is gone.
  window.addEventListener("pagehide", () => {
    if (isSpeechSupported()) window.speechSynthesis.cancel();
  });
}
