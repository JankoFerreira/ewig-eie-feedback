import type { PlanId } from '../../plans';

// What each package unlocks. Each design is its own package (Garden = Essential, Midnight = Celebration, Ivory = Complete).
export type Capability =
  | 'rsvp' | 'guestDashboard' | 'csvExport' | 'todayMode'
  | 'multiEvent' | 'mealChoices' | 'gallery'
  | 'households' | 'cateringSummary' | 'seatingPlan' | 'plannerExports' | 'budgetPlanner' | 'disposableCamera' | 'monogram';

const essential: Capability[] = ['rsvp', 'guestDashboard', 'csvExport', 'todayMode'];
const celebration: Capability[] = [...essential, 'multiEvent', 'mealChoices', 'gallery'];
const complete: Capability[] = [...celebration, 'households', 'cateringSummary', 'seatingPlan', 'plannerExports', 'budgetPlanner', 'disposableCamera', 'monogram'];
export const planCapabilities: Record<PlanId, readonly Capability[]> = { essential, celebration, complete };

// Each design is sold as one package. Seating and budget can be added to Garden or Midnight as paid add-ons.
export const designDemoPlan = { garden: 'essential', midnight: 'celebration', ivory: 'complete' } as const;
export const collectionCapabilities: Record<keyof typeof designDemoPlan, readonly Capability[]> = {
  garden: planCapabilities[designDemoPlan.garden], midnight: planCapabilities[designDemoPlan.midnight], ivory: planCapabilities[designDemoPlan.ivory],
};
export const hasCapability = (design: keyof typeof designDemoPlan, capability: Capability) => collectionCapabilities[design].includes(capability);
