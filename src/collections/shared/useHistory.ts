import { useReducer } from 'react';
export type History<T> = { state: T; past: T[]; future: T[] };
export type HistoryAction<T> = { type: 'change'; value: T | ((previous: T) => T) } | { type: 'undo' | 'redo' };
export function historyReducer<T>(h: History<T>, a: HistoryAction<T>): History<T> {
  if (a.type === 'change') return { state: typeof a.value === 'function' ? (a.value as (previous: T) => T)(h.state) : a.value, past: [...h.past.slice(-59), h.state], future: [] };
  if (a.type === 'undo' && h.past.length) return { state: h.past.at(-1)!, past: h.past.slice(0, -1), future: [h.state, ...h.future] };
  if (a.type === 'redo' && h.future.length) return { state: h.future[0], past: [...h.past, h.state], future: h.future.slice(1) };
  return h;
}
// Shared by Garden and Midnight. A restore is one reversible change.
export function useHistory<T>(initial: () => T) {
  const [history, dispatch] = useReducer(historyReducer<T>, undefined, () => ({ state: initial(), past: [], future: [] }));
  return { state: history.state, change: (value: T | ((previous: T) => T)) => dispatch({ type: 'change', value }), undo: () => dispatch({ type: 'undo' }), redo: () => dispatch({ type: 'redo' }), canUndo: !!history.past.length, canRedo: !!history.future.length };
}
