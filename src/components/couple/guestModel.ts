export type Attendance = 'accepted' | 'declined' | 'pending';
export type DemoGuest = {
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
