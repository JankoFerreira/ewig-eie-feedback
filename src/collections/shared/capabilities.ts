// What each collection's package unlocks. Dashboards and scope copy read this instead of
// hard-coding collection names, so a future tier only needs a new entry here.
export type Capability =
  | 'rsvp' | 'guestDashboard' | 'csvExport'
  | 'multiEvent' | 'mealChoices' | 'gallery'
  | 'households' | 'cateringSummary' | 'seatingPlan' | 'plannerExports' | 'stationeryPreview' | 'monogram';

export const collectionCapabilities: Record<'garden' | 'midnight' | 'ivory', readonly Capability[]> = {
  garden: ['rsvp', 'guestDashboard', 'csvExport'],
  midnight: ['rsvp', 'guestDashboard', 'csvExport', 'multiEvent', 'mealChoices', 'gallery'],
  ivory: ['rsvp', 'guestDashboard', 'csvExport', 'multiEvent', 'mealChoices', 'gallery', 'households', 'cateringSummary', 'seatingPlan', 'plannerExports', 'stationeryPreview', 'monogram'],
};

export const hasCapability = (collection: keyof typeof collectionCapabilities, capability: Capability) => collectionCapabilities[collection].includes(capability);
