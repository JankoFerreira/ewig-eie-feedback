import { emptyRoster, validRoster, type Roster } from './model';

/**
 * How the roster travels from the MC/planner's phone to every guest.
 * Production: a backend endpoint (private roster token for writes, public read) with push (SSE/WebSocket).
 * Demo: this browser only — open the roster and Today mode in two tabs and they stay in step.
 */
export interface RosterSync {
  load(): Roster;
  save(roster: Roster): void;
  subscribe(listener: (roster: Roster) => void): () => void;
}

export function localRosterSync(weddingId: string): RosterSync {
  const key = `ewig-roster-v1:${weddingId}`;
  const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(key);
  const read = () => { try { const v = JSON.parse(localStorage.getItem(key) ?? 'null'); return validRoster(v) ? v : emptyRoster(); } catch { return emptyRoster(); } };
  return {
    load: read,
    save(roster) { try { localStorage.setItem(key, JSON.stringify(roster)); } catch { /* demo storage optional */ } channel?.postMessage(roster); },
    subscribe(listener) {
      const onMessage = (e: MessageEvent) => { if (validRoster(e.data)) listener(e.data); };
      const onStorage = (e: StorageEvent) => { if (e.key === key) listener(read()); };
      channel?.addEventListener('message', onMessage); window.addEventListener('storage', onStorage);
      return () => { channel?.removeEventListener('message', onMessage); window.removeEventListener('storage', onStorage); };
    },
  };
}
