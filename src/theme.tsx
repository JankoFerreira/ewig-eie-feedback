import { useEffect, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

/** Light and dark theme for the main site. Follows the device until the visitor chooses; the choice is remembered.
 *  Design demos (Garden, Midnight, Ivory), the invitation preview and the budget planner keep their own look. */
export type Theme = 'light' | 'dark';
const KEY = 'ewig-theme';
const listeners = new Set<() => void>();
const media = () => typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function stored(): Theme | null { try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch { return null; } }
function current(): Theme { return stored() ?? (media()?.matches ? 'dark' : 'light'); }
function subscribe(fn: () => void) {
  listeners.add(fn); const m = media(); m?.addEventListener?.('change', fn);
  return () => { listeners.delete(fn); m?.removeEventListener?.('change', fn); };
}
export function setTheme(theme: Theme) { try { localStorage.setItem(KEY, theme); } catch { /* private mode */ } listeners.forEach(fn => fn()); }
export const useTheme = () => useSyncExternalStore(subscribe, current, () => 'light' as Theme);

export const SAMPLE_PATHS = /\/(budget|invitation-preview|collections\/(garden|midnight|ivory))\/?$/;
/** Puts the theme on <html>. Sample pages always render in their own (light-root) look. */
export function useApplyTheme(pathname: string) {
  const theme = useTheme();
  useEffect(() => {
    const value = SAMPLE_PATHS.test(pathname) ? 'light' : theme;
    document.documentElement.dataset.theme = value;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#121513' : '#f7f4ef');
  }, [theme, pathname]);
}

export function ThemeToggle({ af, className = '', withLabel = false }: { af: boolean; className?: string; withLabel?: boolean }) {
  const theme = useTheme();
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = next === 'dark' ? (af ? 'Skakel na donker modus' : 'Switch to dark mode') : (af ? 'Skakel na ligte modus' : 'Switch to light mode');
  return <button type="button" className={`theme-toggle ${className}`} onClick={() => setTheme(next)} aria-label={withLabel ? undefined : label} title={label} aria-pressed={theme === 'dark'}>
    {theme === 'dark' ? <Sun size={15} aria-hidden="true"/> : <Moon size={15} aria-hidden="true"/>}{withLabel && <span>{next === 'dark' ? (af ? 'Donker modus' : 'Dark mode') : (af ? 'Ligte modus' : 'Light mode')}</span>}
  </button>;
}
