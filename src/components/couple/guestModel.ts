export type Attendance = 'accepted' | 'declined' | 'pending';
export type DemoGuest = {
  eventAttendance?: Record<string, Attendance>; meal?: string | null;
  id: string; householdId: string; name: string; language: string; attendance: Attendance;
  dietaryRequirements: string[] | null;
  allergies: { ingredient: string; note: string }[] | null;
  accessNeeds: string | null; respondedOn: string | null;
};
export function summarizeGuests(guests: DemoGuest[]) {
  const accepted = guests.filter(g => g.attendance === 'accepted');
  return {
    invited: guests.length, accepted: accepted.length,
    declined: guests.filter(g => g.attendance === 'declined').length,
    pending: guests.filter(g => g.attendance === 'pending').length,
    dietary: accepted.filter(g => g.dietaryRequirements?.length).length,
    allergies: accepted.filter(g => g.allergies?.length).length,
  };
}
export function parseDietaryRequirements(value: string): string[] | null {
  if (!value.trim()) return null;
  if (/^(none|geen)$/i.test(value.trim())) return [];
  return value.split(',').map(item=>item.trim()).filter(Boolean);
}

export function eventResponse(guest: DemoGuest, eventId: string): Attendance {
  return eventId === 'wedding' ? guest.attendance : guest.eventAttendance?.[eventId] ?? 'pending';
}
export function summarizeEvent(guests: DemoGuest[], eventId: string) {
  const result = { accepted: 0, declined: 0, pending: 0 };
  guests.forEach(guest => result[eventResponse(guest, eventId)]++);
  return result;
}
export function updateEventResponse(guest: DemoGuest, eventId: string, attendance: Attendance): DemoGuest {
  return { ...guest, eventAttendance: { ...guest.eventAttendance, [eventId]: attendance }, ...(eventId === 'wedding' ? { attendance, meal: attendance === 'accepted' ? guest.meal : null } : {}) };
}
export function mealCount(guests: DemoGuest[], mealId: string) {
  return guests.filter(guest => guest.attendance === 'accepted' && guest.meal === mealId).length;
}
export function commitHouseholdReplies(guests: DemoGuest[], householdId: string, replies: DemoGuest[], eventIds: string[], mealIds: string[], respondedOn: string): DemoGuest[] {
  const invited = guests.filter(guest => guest.householdId === householdId);
  if (!invited.length || invited.length !== replies.length || new Set(replies.map(r => r.id)).size !== invited.length) throw new Error('Incomplete household');
  if (replies.some(r => !invited.some(g => g.id === r.id) || r.householdId !== householdId || eventIds.some(id => !['accepted','declined'].includes(eventResponse(r, id))) || (r.attendance === 'accepted' && !mealIds.includes(r.meal ?? '')))) throw new Error('Incomplete reply');
  return guests.map(guest => {
    const reply = replies.find(r => r.id === guest.id);
    return reply ? { ...reply, meal: reply.attendance === 'accepted' ? reply.meal : null, respondedOn } : guest;
  });
}

// ---- A-list / B-list ----
// The guest list is the A-list. Backup (B-list) guests wait in priority order and are not invited, counted or seated
// until a seat opens (an invited guest declines) AND the couple approves the suggestion.
export type BackupStatus = 'waiting' | 'invited' | 'skipped';
export type BackupGuest = { id: string; name: string; status: BackupStatus; invitedOn?: string };
export const isBackupGuest = (guest: DemoGuest) => guest.id.startsWith('b-');
/** Seats opened by declines, minus backups already invited into them. */
export function openSeats(guests: DemoGuest[], backups: BackupGuest[]) {
  const declined = guests.filter(g => g.attendance === 'declined').length;
  return Math.max(0, declined - backups.filter(b => b.status === 'invited').length);
}
/** The next waiting backups, one per open seat, in the couple's order. */
export function backupSuggestions(guests: DemoGuest[], backups: BackupGuest[]) {
  return backups.filter(b => b.status === 'waiting').slice(0, openSeats(guests, backups));
}
/** Couple approved: the backup is invited and joins the guest list as a pending reply. */
export function approveBackup(guests: DemoGuest[], backups: BackupGuest[], id: string, today: string): { guests: DemoGuest[]; backups: BackupGuest[] } {
  const backup = backups.find(b => b.id === id);
  if (!backup || backup.status !== 'waiting' || !backupSuggestions(guests, backups).some(b => b.id === id)) return { guests, backups };
  const guest: DemoGuest = { id: `b-${backup.id}`, householdId: `b-${backup.id}`, name: backup.name, language: 'en', attendance: 'pending', dietaryRequirements: null, allergies: null, accessNeeds: null, respondedOn: null };
  return { guests: [...guests, guest], backups: backups.map(b => b.id === id ? { ...b, status: 'invited', invitedOn: today } : b) };
}
export function setBackupStatus(backups: BackupGuest[], id: string, status: 'waiting' | 'skipped') { return backups.map(b => b.id === id && b.status !== 'invited' ? { ...b, status } : b); }
export function moveBackup(backups: BackupGuest[], id: string, by: -1 | 1) {
  const i = backups.findIndex(b => b.id === id); const j = i + by;
  if (i < 0 || j < 0 || j >= backups.length) return backups;
  const next = [...backups]; [next[i], next[j]] = [next[j], next[i]]; return next;
}
export const demoBackups = (): BackupGuest[] => ['Lerato Dlamini', 'Johan Pretorius', 'Naledi Khumalo', 'Ruan Steyn', 'Ayesha Patel'].map((name, i) => ({ id: `bk${i + 1}`, name, status: 'waiting' as const }));
