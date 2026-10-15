// Saves what the user typed in each exercise editor, keyed by question id.
const KEY = "interview-handbook-code-v1";

function readAll(): Record<string, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

export const loadCode = (id: string): string | undefined => {
  const value = readAll()[id];
  return typeof value === "string" ? value : undefined;
};

export function saveCode(id: string, code: string | null) {
  try {
    const all = readAll();
    if (code === null) delete all[id];
    else all[id] = code;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}
