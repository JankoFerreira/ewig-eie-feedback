// Today mode: the couple's own schedule, kept live on the day by a trusted person (MC or planner).
// Times are local wedding times (Africa/Johannesburg); a slot's live start = planned start + its delay.

export type Slot = { id: string; date: string; time: string; title: string; place?: string };
export type Roster = { version: 1; delays: Record<string, number>; done: Record<string, boolean>; updatedAt: string | null };
export const emptyRoster = (): Roster => ({ version: 1, delays: {}, done: {}, updatedAt: null });

const toMinutes = (date: string, time: string) => {
  const [y, m, d] = date.split('-').map(Number); const [hh, mm] = time.split(':').map(Number);
  return Date.UTC(y, m - 1, d, hh, mm) / 60000;
};
const fromMinutes = (minutes: number) => { const d = new Date(minutes * 60000); return { date: d.toISOString().slice(0, 10), time: d.toISOString().slice(11, 16) }; };

export function sortSlots(slots: Slot[]) { return [...slots].sort((a, b) => toMinutes(a.date, a.time) - toMinutes(b.date, b.time)); }

export type LiveSlot = Slot & { planned: string; delay: number; start: number; done: boolean };
/** Applies the roster to the planned schedule. */
export function liveSchedule(slots: Slot[], roster: Roster): LiveSlot[] {
  return sortSlots(slots).map(s => {
    const delay = roster.delays[s.id] ?? 0; const start = toMinutes(s.date, s.time) + delay; const live = fromMinutes(start);
    return { ...s, planned: s.time, date: live.date, time: live.time, delay, start, done: !!roster.done[s.id] };
  });
}

/** Moves this slot and every later slot on the same day by `minutes` (negative pulls them earlier). */
export function shiftFrom(slots: Slot[], roster: Roster, slotId: string, minutes: number, now = new Date().toISOString()): Roster {
  const ordered = sortSlots(slots); const index = ordered.findIndex(s => s.id === slotId);
  if (index < 0 || !Number.isFinite(minutes)) return roster;
  const day = ordered[index].date; const delays = { ...roster.delays };
  for (const s of ordered.slice(index)) if (s.date === day) delays[s.id] = Math.max(-180, Math.min(600, (delays[s.id] ?? 0) + Math.round(minutes)));
  return { ...roster, delays, updatedAt: now };
}
export function markDone(roster: Roster, slotId: string, done: boolean, now = new Date().toISOString()): Roster {
  return { ...roster, done: { ...roster.done, [slotId]: done }, updatedAt: now };
}

/** What is happening now, what is next, and minutes until next — for a given moment in wedding-local minutes. */
export function nowNext(live: LiveSlot[], nowMinutes: number) {
  const started = live.filter(s => s.start <= nowMinutes);
  const current = started.length ? started[started.length - 1] : null;
  const next = live.find(s => s.start > nowMinutes) ?? null;
  return { current, next, minutesToNext: next ? Math.round(next.start - nowMinutes) : null };
}

/** Current wall-clock time expressed as wedding-local minutes (Africa/Johannesburg is UTC+2, no DST). */
export const weddingNowMinutes = (date = new Date()) => Math.floor(date.getTime() / 60000) + 120;
export const minutesFor = toMinutes;

export function validRoster(value: unknown): value is Roster {
  if (!value || typeof value !== 'object') return false;
  const r = value as Roster;
  return r.version === 1 && !!r.delays && typeof r.delays === 'object' && Object.values(r.delays).every(n => Number.isInteger(n) && Math.abs(n) <= 600)
    && !!r.done && typeof r.done === 'object' && Object.values(r.done).every(b => typeof b === 'boolean');
}

// ---- Table seating on the day ----
export type SeatingTablePlan = { name: string; guests: string[] };
export type SeatingPlan = { tables: SeatingTablePlan[] };
/** From the reception slot onward, Today mode leads with "Find your seat". */
export function seatingIsLive(live: LiveSlot[], seatingFrom: string | undefined, nowMinutes: number) {
  const slot = seatingFrom ? live.find(s => s.id === seatingFrom) : undefined;
  return { slot: slot ?? null, live: !!slot && nowMinutes >= slot.start };
}
/** Finds tables whose guests match what a guest typed (accents and case ignored). */
const fold = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function findSeat(plan: SeatingPlan, query: string) {
  const q = fold(query);
  if (q.length < 2) return [];
  return plan.tables.flatMap(t => t.guests.filter(g => fold(g).split(/\s+/).some(part => part.startsWith(q)) || fold(g).includes(q)).map(guest => ({ guest, table: t.name })));
}
/** Demo seating for designs without a seating planner: attending guests in order, a set number per table. */
export function demoSeatingPlan(names: string[], tableNames: string[], perTable = 8): SeatingPlan {
  const tables = tableNames.map(name => ({ name, guests: [] as string[] }));
  names.forEach((n, i) => tables[Math.min(tables.length - 1, Math.floor(i / perTable))].guests.push(n));
  return { tables: tables.filter(t => t.guests.length) };
}
