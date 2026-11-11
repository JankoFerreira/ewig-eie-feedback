import { eventResponse, type Attendance, type DemoGuest } from '../../components/couple/guestModel';
import type { Household, IvoryData, Language } from './content';

export type Seating = Record<string, string>;

export const invitedEventsFor = (households: Household[], householdId: string) => households.find(h => h.id === householdId)?.invitedEvents ?? [];
export const isInvited = (households: Household[], guest: DemoGuest, eventId: string) => invitedEventsFor(households, guest.householdId).includes(eventId);

/** Event totals that only count guests invited to that event. */
export function summarizeInvitedEvent(guests: DemoGuest[], households: Household[], eventId: string) {
  const result: Record<Attendance, number> & { invited: number } = { invited: 0, accepted: 0, declined: 0, pending: 0 };
  for (const guest of guests) if (isInvited(households, guest, eventId)) { result.invited++; result[eventResponse(guest, eventId)]++; }
  return result;
}

export function householdStatus(guests: DemoGuest[], households: Household[], householdId: string): 'complete' | 'partial' | 'awaiting' {
  const members = guests.filter(g => g.householdId === householdId);
  const answers = members.flatMap(g => invitedEventsFor(households, householdId).map(e => eventResponse(g, e)));
  if (answers.every(a => a !== 'pending')) return 'complete';
  return answers.some(a => a !== 'pending') ? 'partial' : 'awaiting';
}

export type CateringRow = { label: string; count: number; guests: string[] };
/** Kitchen summary for the wedding dinner: meals, dietary labels and allergy notes of attending guests only. */
export function cateringSummary(guests: DemoGuest[], data: IvoryData, language: Language) {
  const attending = guests.filter(g => g.attendance === 'accepted');
  const meals: CateringRow[] = data.meals.map(m => { const list = attending.filter(g => g.meal === m.id); return { label: m.name[language], count: list.length, guests: list.map(g => g.name) }; });
  const unselected = attending.filter(g => !g.meal || !data.meals.some(m => m.id === g.meal)).map(g => g.name);
  const dietary = new Map<string, string[]>();
  for (const g of attending) for (const d of g.dietaryRequirements ?? []) { const key = d.trim(); if (key) dietary.set(key, [...(dietary.get(key) ?? []), g.name]); }
  const allergies = attending.filter(g => g.allergies?.length).map(g => ({ guest: g.name, detail: g.allergies!.map(a => [a.ingredient, a.note].filter(Boolean).join(' — ')).join('; ') }));
  const unanswered = attending.filter(g => g.dietaryRequirements === null).map(g => g.name);
  const access = attending.filter(g => g.accessNeeds).map(g => ({ guest: g.name, detail: g.accessNeeds! }));
  return { attending: attending.length, meals, unselected, dietary: [...dietary].map(([label, names]) => ({ label, count: names.length, guests: names })), allergies, unanswered, access };
}

export type TableReport = { id: string; name: string; capacity: number; seated: DemoGuest[]; over: boolean; provisional: number; allergies: number };
/** Checks a seating plan. Only guests attending (or still pending) the wedding can hold a seat. */
export function analyseSeating(guests: DemoGuest[], data: IvoryData, seating: Seating) {
  const seatable = guests.filter(g => g.attendance !== 'declined');
  const tables: TableReport[] = data.tables.map(t => {
    const seated = seatable.filter(g => seating[g.id] === t.id);
    return { id: t.id, name: t.name, capacity: t.capacity, seated, over: seated.length > t.capacity, provisional: seated.filter(g => g.attendance === 'pending').length, allergies: seated.filter(g => g.allergies?.length).length };
  });
  const unseated = guests.filter(g => g.attendance === 'accepted' && !data.tables.some(t => t.id === seating[g.id]));
  const declinedButSeated = guests.filter(g => g.attendance === 'declined' && seating[g.id]);
  const households = new Map<string, Set<string>>();
  for (const g of seatable) if (seating[g.id]) households.set(g.householdId, new Set([...(households.get(g.householdId) ?? []), seating[g.id]]));
  const splitHouseholds = [...households].filter(([, set]) => set.size > 1).map(([id]) => id);
  const seats = data.tables.reduce((n, t) => n + t.capacity, 0);
  return { tables, unseated, declinedButSeated, splitHouseholds, seats, seated: tables.reduce((n, t) => n + t.seated.length, 0) };
}

/** Removes declined guests and fills remaining attending households into tables, keeping households together. */
export function autoSeat(guests: DemoGuest[], data: IvoryData, seating: Seating): Seating {
  const next: Seating = {};
  for (const g of guests) if (g.attendance === 'accepted' && data.tables.some(t => t.id === seating[g.id])) next[g.id] = seating[g.id];
  const free = new Map(data.tables.map(t => [t.id, t.capacity - Object.values(next).filter(id => id === t.id).length]));
  const waiting = new Map<string, DemoGuest[]>();
  for (const g of guests) if (g.attendance === 'accepted' && !next[g.id]) waiting.set(g.householdId, [...(waiting.get(g.householdId) ?? []), g]);
  for (const members of [...waiting.values()].sort((a, b) => b.length - a.length)) {
    const joined = members.map(m => guests.find(g => g.householdId === m.householdId && next[g.id])).find(Boolean);
    const preferred = joined ? next[joined.id] : undefined;
    const table = (preferred && (free.get(preferred) ?? 0) >= members.length) ? preferred : [...free].sort((a, b) => b[1] - a[1]).find(([, n]) => n >= members.length)?.[0];
    if (!table) continue; // Not enough room together: leave for the couple to decide.
    for (const m of members) next[m.id] = table;
    free.set(table, (free.get(table) ?? 0) - members.length);
  }
  return next;
}
