// "Try it with your names": names typed on the Collections page carry into each collection's preview.
// Session-only, never sent anywhere.
export type TryNames = { first: string; second: string };
const KEY = 'ewig-try-names-v1';
export function readTryNames(): TryNames | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (value && typeof value.first === 'string' && typeof value.second === 'string' && (value.first.trim() || value.second.trim())) return { first: value.first.slice(0, 40), second: value.second.slice(0, 40) };
  } catch { /* storage unavailable */ }
  return null;
}
export function saveTryNames(names: TryNames | null) {
  try { if (names) sessionStorage.setItem(KEY, JSON.stringify(names)); else sessionStorage.removeItem(KEY); } catch { /* optional */ }
}
/** Applies tried names to a collection's starting state (only the fields that were filled in). */
export function withTryNames<T>(state: T, apply: (names: TryNames) => T): T {
  const names = typeof window === 'undefined' ? null : readTryNames();
  return names ? apply(names) : state;
}
