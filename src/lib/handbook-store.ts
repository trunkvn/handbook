// Client-side state for the handbook (language, practice mode, theme, progress, search).
// Only import this from Client Components.
import { useSyncExternalStore } from "react";
import type { SearchHit } from "./search";
import { STORAGE_KEY } from "./storage-key";

export type Theme = "dark" | "light";
export type Lang = "en" | "both" | "vi";

interface Persisted {
  lang: Lang;
  practice: boolean;
  theme: Theme;
  done: Readonly<Record<string, true>>;
}

export interface HandbookState extends Persisted {
  query: string;
  results: readonly SearchHit[];
  /** False until the search index has been downloaded. */
  searchReady: boolean;
  /** Questions whose answer was revealed in practice mode. */
  revealed: Readonly<Record<string, true>>;
}

/** What the server renders, and what React uses while hydrating. */
const DEFAULT_STATE: HandbookState = {
  lang: "both",
  practice: false,
  theme: "dark",
  done: {},
  query: "",
  results: [],
  searchReady: false,
  revealed: {},
};

let state = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved: Record<string, unknown> = raw ? JSON.parse(raw) : {};
    const done: Record<string, true> = {};
    if (saved.done && typeof saved.done === "object") {
      for (const [id, v] of Object.entries(saved.done)) if (v) done[id] = true;
    }
    return {
      lang: saved.lang === "en" || saved.lang === "vi" ? saved.lang : "both",
      practice: saved.practice === true,
      theme: saved.theme === "light" ? "light" : "dark",
      done,
    };
  } catch {
    return {};
  }
}

export function getState(): HandbookState {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    state = { ...state, ...readStorage() };
  }
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Mirror display settings on <html> so CSS can react without re-rendering every card. */
function syncDocument({ theme, lang, practice }: HandbookState) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.lang = lang;
  if (practice) root.dataset.practice = "true";
  else delete root.dataset.practice;
}

/** Re-apply the saved display settings to <html>. */
export function applyDocumentSettings() {
  syncDocument(getState());
}

function update(patch: Partial<HandbookState>, persist = true) {
  state = { ...getState(), ...patch };
  if (persist) {
    try {
      const { lang, practice, theme, done } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, practice, theme, done }));
    } catch {}
    syncDocument(state);
  }
  listeners.forEach((l) => l());
}

export function useHandbook<T>(selector: (s: HandbookState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(DEFAULT_STATE),
  );
}

export const setLang = (lang: Lang) => update({ lang });
export const setTheme = (theme: Theme) => update({ theme });

export function togglePractice() {
  // Leaving practice mode forgets which answers were revealed.
  update({ practice: !getState().practice, revealed: {} });
}

export function reveal(id: string) {
  update({ revealed: { ...getState().revealed, [id]: true } }, false);
}

export function toggleDone(id: string) {
  const done = { ...getState().done };
  if (done[id]) delete done[id];
  else done[id] = true;
  update({ done });
}

export function resetProgress() {
  update({ done: {} });
}

/* ---------- Search ---------- */

let searcher: ((query: string) => SearchHit[]) | null = null;
let searcherLoading = false;

export function setQuery(query: string) {
  update({ query, results: searcher ? searcher(query) : [] }, false);
  if (!query.trim() || searcher || searcherLoading) return;
  // The search index (all question text) is a separate chunk, fetched on first use.
  searcherLoading = true;
  import("./search")
    .then((m) => {
      searcher = m.search;
      update({ searchReady: true, results: m.search(getState().query) }, false);
    })
    .catch(() => {
      searcherLoading = false;
    });
}
