import { useReducer } from 'react';
export type History<T> = { state: T; past: T[]; future: T[]; group?: string };
// `group` coalesces a burst of edits to the same field (e.g. typing) into one undo step.
export type HistoryAction<T> = { type: 'change'; value: T | ((previous: T) => T); group?: string } | { type: 'undo' | 'redo' };
export function historyReducer<T>(h: History<T>, a: HistoryAction<T>): History<T> {
  if (a.type === 'change') {
    const state = typeof a.value === 'function' ? (a.value as (previous: T) => T)(h.state) : a.value;
    if (a.group && a.group === h.group && h.past.length) return { state, past: h.past, future: [], group: a.group };
    return { state, past: [...h.past.slice(-59), h.state], future: [], group: a.group };
  }
  if (a.type === 'undo' && h.past.length) return { state: h.past.at(-1)!, past: h.past.slice(0, -1), future: [h.state, ...h.future] };
  if (a.type === 'redo' && h.future.length) return { state: h.future[0], past: [...h.past, h.state], future: h.future.slice(1) };
  return h;
}
// Shared by Garden, Midnight and Ivory. A restore is one reversible change.
export function useHistory<T>(initial: () => T) {
  const [history, dispatch] = useReducer(historyReducer<T>, undefined, () => ({ state: initial(), past: [], future: [] }));
  return { state: history.state, change: (value: T | ((previous: T) => T), group?: string) => dispatch({ type: 'change', value, group }), undo: () => dispatch({ type: 'undo' }), redo: () => dispatch({ type: 'redo' }), canUndo: !!history.past.length, canRedo: !!history.future.length };
}
