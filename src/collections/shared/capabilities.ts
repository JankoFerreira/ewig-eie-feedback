import type { PlanId } from '../../plans';

// What each PLAN unlocks. Designs (Garden, Midnight, Ivory) are free to choose and carry no features of their own.
export type Capability =
  | 'rsvp' | 'guestDashboard' | 'csvExport' | 'todayMode'
  | 'multiEvent' | 'mealChoices' | 'gallery'
  | 'households' | 'cateringSummary' | 'seatingPlan' | 'plannerExports' | 'budgetPlanner' | 'disposableCamera' | 'monogram';

const essential: Capability[] = ['rsvp', 'guestDashboard', 'csvExport', 'todayMode'];
const celebration: Capability[] = [...essential, 'multiEvent', 'mealChoices', 'gallery'];
const complete: Capability[] = [...celebration, 'households', 'cateringSummary', 'seatingPlan', 'plannerExports', 'budgetPlanner', 'disposableCamera', 'monogram'];
export const planCapabilities: Record<PlanId, readonly Capability[]> = { essential, celebration, complete };

// Each design page currently demonstrates one plan. Making every design support every plan is the next engineering step.
export const designDemoPlan = { garden: 'essential', midnight: 'celebration', ivory: 'complete' } as const;
export const collectionCapabilities: Record<keyof typeof designDemoPlan, readonly Capability[]> = {
  garden: planCapabilities[designDemoPlan.garden], midnight: planCapabilities[designDemoPlan.midnight], ivory: planCapabilities[designDemoPlan.ivory],
};
export const hasCapability = (design: keyof typeof designDemoPlan, capability: Capability) => collectionCapabilities[design].includes(capability);
