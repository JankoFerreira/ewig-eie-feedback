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
