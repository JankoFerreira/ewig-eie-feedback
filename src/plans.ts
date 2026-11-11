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


/** Founding couples: a small launch offer in exchange for showcase rights and feedback.
 *  The exact rate (free or reduced) is agreed per couple and confirmed in writing. */
export const foundingCouples = {
  active: true,
  spots: 3,
  title: l('Founding couples', 'Stigterspaartjies'),
  intro: l(
    'We are opening a few places at a founding rate while we launch. In return we ask for a little help showing our work.',
    'Ons maak ’n paar plekke teen ’n stigterstarief oop terwyl ons begin. In ruil vra ons ’n bietjie hulp om ons werk te wys.'
  ),
  conditions: [
    l('Up to three couples only.', 'Hoogstens drie paartjies.'),
    l('The plan, design and number of revision rounds are fixed in writing before we start. Anything extra is quoted separately.', 'Die plan, ontwerp en aantal hersieningsrondtes word skriftelik vasgelê voordat ons begin. Enigiets ekstra word apart gekwoteer.'),
    l('We may show your website in our portfolio and on social media. Guest details are never shown, and you approve what we share.', 'Ons mag julle webwerf in ons portefeulje en op sosiale media wys. Gastebesonderhede word nooit gewys nie, en julle keur goed wat ons deel.'),
    l('A short written testimonial after the wedding.', '’n Kort geskrewe getuigskrif ná die troue.'),
    l('A small “Made with Ewig & Eie” credit in your website footer.', '’n Klein “Gemaak deur Ewig & Eie”-erkenning onderaan julle webwerf.'),
  ],
  cta: l('Ask about a founding place', 'Vra oor ’n stigtersplek'),
};
