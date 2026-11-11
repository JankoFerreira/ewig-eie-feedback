// Each design is its own package: Garden = Essential, Midnight = Celebration, Ivory = Complete.
// This file is the single source for package names, prices, media allowances, hosting and add-ons.
// Draft prices: confirm before launch. The venue-partner discount stays switched off until real agreements exist.

export type PlanId = 'essential' | 'celebration' | 'complete';
export type DesignId = 'garden' | 'midnight' | 'ivory';
export type Line = { en: string; af: string };
const l = (en: string, af: string): Line => ({ en, af });

/** Media the couple can place on their website. Videos are limited in length. */
export type MediaAllowance = { photos: number; videos: number };
export const videoMaxSeconds = 60;

export type Plan = { id: PlanId; name: Line; design: DesignId; designName: Line; price: number; summary: Line; media: MediaAllowance; hostingMonths: number; includes: Line[]; demo: DesignId };

export const plans: Plan[] = [
  {
    id: 'essential', name: l('Essential', 'Essensieel'), design: 'garden', designName: l('The Garden', 'Die Tuin'), price: 5000, demo: 'garden',
    media: { photos: 5, videos: 0 }, hostingMonths: 6,
    summary: l('A soft, romantic website your guests can reply on.', '’n Sagte, romantiese webwerf waarop julle gaste kan antwoord.'),
    includes: [
      l('English and Afrikaans', 'Engels en Afrikaans'),
      l('Edit words and photos right on the page', 'Verander woorde en foto’s reg op die blad'),
      l('Digital invitation with the envelope opening', 'Digitale uitnodiging met die koevertopening'),
      l('Online RSVP and guest list with export', 'Aanlyn RSVP en gastelys met uitvoer'),
      l('Today mode and a day-of roster for your MC', 'Vandag-modus en ’n dagrooster vir julle seremoniemeester'),
    ],
  },
  {
    id: 'celebration', name: l('Celebration', 'Viering'), design: 'midnight', designName: l('The Midnight', 'Die Middernag'), price: 6500, demo: 'midnight',
    media: { photos: 12, videos: 1 }, hostingMonths: 9,
    summary: l('Modern and warm, for celebrations with more than one gathering.', 'Modern en warm, vir vierings met meer as een geleentheid.'),
    includes: [
      l('Replies for each event, such as a welcome evening', 'Antwoorde per geleentheid, soos ’n verwelkomingsaand'),
      l('Meal choices and dietary notes', 'Etekeuses en dieetnotas'),
      l('Photo gallery', 'Fotogalery'),
      l('Two rounds of changes by us', 'Twee rondtes veranderinge deur ons'),
    ],
  },
  {
    id: 'complete', name: l('Complete', 'Volledig'), design: 'ivory', designName: l('The Ivory', 'Die Ivoor'), price: 8500, demo: 'ivory',
    media: { photos: 20, videos: 2 }, hostingMonths: 12,
    summary: l('Our flagship: the whole weekend, planned in one place.', 'Ons vlagskip: die hele naweek, op een plek beplan.'),
    includes: [
      l('One invitation per household', 'Een uitnodiging per huishouding'),
      l('Catering summary and seating planner', 'Spyseneringopsomming en sitplekbeplanner'),
      l('Wedding and honeymoon budget', 'Trou- en wittebroodsbegroting'),
      l('Planner exports and a printable pack', 'Beplanneruitvoer en ’n drukbare pakket'),
      l('Disposable camera for up to 60 guests', 'Weggooikamera vir tot 60 gaste'),
      l('Design consultation, setup help and three rounds of changes', 'Ontwerpkonsultasie, hulp met opstelling en drie rondtes veranderinge'),
    ],
  },
];

export const formatRand = (n: number) => `R${n.toLocaleString('en-ZA')}`;
export const planById = (id: PlanId) => plans.find(p => p.id === id)!;
export const planForDesign = (design: DesignId) => plans.find(p => p.design === design)!;

export const mediaLine = (media: MediaAllowance, af: boolean) => {
  const photos = af ? `${media.photos} foto’s` : `${media.photos} photos`;
  if (!media.videos) return photos;
  const videos = af ? `${media.videos} video${media.videos > 1 ? '’s' : ''}` : `${media.videos} video${media.videos > 1 ? 's' : ''}`;
  return af ? `${photos} en ${videos} (tot 1 minuut elk)` : `${photos} and ${videos} (up to 1 minute each)`;
};

// Hosting: each package includes some months from launch; after that it is charged per month. Draft figures.
export const hosting = { monthlyAfter: 150 };
export const hostingLine = (plan: Plan, af: boolean) => af
  ? `${plan.hostingMonths} maande webhosting ingesluit, daarna ${formatRand(hosting.monthlyAfter)} per maand`
  : `${plan.hostingMonths} months of hosting included, then ${formatRand(hosting.monthlyAfter)} a month`;

// Optional add-ons. Seating and budget come with Ivory and can be added to Garden or Midnight.
export type AddOnId = 'seating' | 'budget';
export const addOnPrices: Record<AddOnId, { name: Line; price: number; includedIn: PlanId[] }> = {
  seating: { name: l('Seating planner', 'Sitplekbeplanner'), price: 750, includedIn: ['complete'] },
  budget: { name: l('Wedding & honeymoon budget', 'Trou- en wittebroodsbegroting'), price: 500, includedIn: ['complete'] },
};
export const addOns = {
  disposableCamera: { name: l('Disposable camera', 'Weggooikamera'), note: l('Add to Garden or Midnight. Price confirmed with you.', 'Voeg by Tuin of Middernag. Prys word met julle bevestig.') },
  photography: { name: l('Photography', 'Fotografie'), note: l('Planning estimate in the builder below; booked with the photographer.', 'Beplanningsberaming in die bouer hieronder; met die fotograaf bespreek.') },
};

export const venuePartnerDiscount = { active: false, note: l('A venue-partner discount is planned for couples booking through a partner venue. It applies only once real agreements exist.', '’n Venuevennootafslag word beplan vir paartjies wat deur ’n vennootvenue bespreek. Dit geld eers wanneer werklike ooreenkomste bestaan.') };



// ---- Small extras and day-of digital stationery (draft prices) ----
// Each package already includes some of these; cards show what is included and what it is worth.
export type ExtraGroup = 'website' | 'dayof';
export type Extra = { id: string; group: ExtraGroup; name: Line; price: number; includedIn: PlanId[] };
export const extras: Extra[] = [
  { id: 'countdown', group: 'website', name: l('Countdown to the day', 'Aftelling tot die dag'), price: 150, includedIn: ['essential', 'celebration', 'complete'] },
  { id: 'map', group: 'website', name: l('Venue map', 'Venuekaart'), price: 150, includedIn: ['essential', 'celebration', 'complete'] },
  { id: 'songs', group: 'website', name: l('Song requests from guests', 'Liedjieversoeke van gaste'), price: 150, includedIn: ['celebration', 'complete'] },
  { id: 'registry', group: 'website', name: l('Gift registry link', 'Geskenkregister-skakel'), price: 150, includedIn: ['celebration', 'complete'] },
  { id: 'travel', group: 'website', name: l('Travel, stay & things to do', 'Reis, verblyf en dinge om te doen'), price: 300, includedIn: ['celebration', 'complete'] },
  { id: 'bridalParty', group: 'website', name: l('Bridal party & family introductions', 'Bruidsparty en familie-bekendstelling'), price: 250, includedIn: ['complete'] },
  { id: 'voice', group: 'website', name: l('Personal voice message for guests', 'Persoonlike stemboodskap vir gaste'), price: 300, includedIn: ['complete'] },
  { id: 'childhood', group: 'website', name: l('Childhood photo section', 'Kinderfoto-afdeling'), price: 250, includedIn: [] },
  { id: 'morePhotos', group: 'website', name: l('10 more photos', '10 ekstra foto’s'), price: 250, includedIn: [] },
  { id: 'domain', group: 'website', name: l('Your own domain, bought for you', 'Julle eie domein, vir julle gekoop'), price: 400, includedIn: ['complete'] },
  { id: 'programme', group: 'dayof', name: l('Wedding day programme', 'Troudagprogram'), price: 700, includedIn: ['complete'] },
  { id: 'seatingChart', group: 'dayof', name: l('Digital seating chart', 'Digitale sitplekkaart'), price: 500, includedIn: ['complete'] },
  { id: 'rsvpReminder', group: 'dayof', name: l('RSVP reminder', 'RSVP-herinnering'), price: 450, includedIn: ['celebration', 'complete'] },
  { id: 'rsvpDeadline', group: 'dayof', name: l('RSVP deadline notice', 'RSVP-sperdatumkennisgewing'), price: 450, includedIn: ['complete'] },
  { id: 'thankYou', group: 'dayof', name: l('Thank-you card after the day', 'Dankiekaartjie ná die dag'), price: 300, includedIn: ['complete'] },
];
/** The Big Day Set: the four day-of pieces together, for less. */
export const bigDaySet = { id: 'bigDaySet', name: l('The Big Day Set', 'Die Groot Dag-stel'), pieces: ['programme', 'seatingChart', 'rsvpReminder', 'rsvpDeadline'], price: 1750 };
export const bigDaySetValue = () => bigDaySet.pieces.reduce((sum, id) => sum + (extras.find(e => e.id === id)?.price ?? 0), 0);
export const includedExtras = (plan: PlanId) => extras.filter(e => e.includedIn.includes(plan));
export const includedValue = (plan: PlanId) => includedExtras(plan).reduce((sum, e) => sum + e.price, 0);
/** How payment works (shown on Pricing). */
export const paymentTerms = {
  deposit: 0.5,
  lines: [
    l('50% deposit to start, the balance before your website goes live.', '50% deposito om te begin, die balans voordat julle webwerf regstreeks gaan.'),
    l('Paid by EFT against an invoice. No subscriptions.', 'Betaal per EFT teen ’n faktuur. Geen intekeninge nie.'),
    l('Already own a domain? We connect it for free.', 'Besit julle reeds ’n domein? Ons koppel dit gratis.'),
  ],
};
