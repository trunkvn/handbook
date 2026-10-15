// Pure text helpers for reading answers aloud (no DOM, no imports, so they are easy to test).

export type SpeechLang = "en" | "vi";

/** Symbols that speech engines skip or read badly. */
const SYMBOLS: Record<SpeechLang, Record<string, string>> = {
  en: { "→": ", ", "≤": " at most ", "≥": " at least ", "×": " by ", "&": " and " },
  vi: { "→": ", ", "≤": " tối đa ", "≥": " tối thiểu ", "×": " nhân ", "&": " và " },
};

export function cleanForSpeech(text: string, lang: SpeechLang): string {
  let out = text;
  for (const [symbol, spoken] of Object.entries(SYMBOLS[lang])) out = out.split(symbol).join(spoken);
  return out.replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

/** Make the engine pause at the end of a block (a heading or list item has no full stop). */
export function endWithPause(text: string): string {
  return /[.!?…:;]$/.test(text) ? text : text + ".";
}

/** Split at ". ", "! ", "? " (a dot inside "Next.js" or "0.1" is not a sentence end). */
function sentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if ((c === "." || c === "!" || c === "?" || c === "…") && (next === undefined || next === " ")) {
      out.push(text.slice(start, i + 1).trim());
      start = i + 1;
    }
  }
  const rest = text.slice(start).trim();
  if (rest) out.push(rest);
  return out.filter(Boolean);
}

function splitWords(sentence: string, max: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const word of sentence.split(" ")) {
    if (cur && cur.length + 1 + word.length > max) {
      out.push(cur);
      cur = word;
    } else {
      cur = cur ? cur + " " + word : word;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * Cut text into pieces of at most `max` characters, at sentence ends where possible.
 * Browsers stop long utterances after a while (Chrome around 15 seconds), so we speak short pieces in turn.
 */
export function splitIntoChunks(text: string, max = 200): string[] {
  const chunks: string[] = [];
  let cur = "";
  const flush = () => {
    if (cur) chunks.push(cur);
    cur = "";
  };
  for (const sentence of sentences(text)) {
    if (sentence.length > max) {
      flush();
      chunks.push(...splitWords(sentence, max));
    } else if (cur && cur.length + 1 + sentence.length > max) {
      flush();
      cur = sentence;
    } else {
      cur = cur ? cur + " " + sentence : sentence;
    }
  }
  flush();
  return chunks;
}
