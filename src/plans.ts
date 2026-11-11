// Designs and plans are separate: any design (Garden, Midnight, Ivory) can be paired with any plan.
// This file is the single source for plan names, prices and what each plan includes.
// Draft prices: confirm before launch. The venue-partner discount stays switched off until real agreements exist.

export type PlanId = 'essential' | 'celebration' | 'complete';
export type Line = { en: string; af: string };
const l = (en: string, af: string): Line => ({ en, af });

export type Plan = { id: PlanId; name: Line; price: number; summary: Line; includes: Line[]; demo: 'garden' | 'midnight' | 'ivory' };

export const plans: Plan[] = [
  {
    id: 'essential', name: l('Essential', 'Essensieel'), price: 5000, demo: 'garden',
    summary: l('A beautiful wedding website your guests can reply on.', '’n Pragtige trouwebwerf waarop julle gaste kan antwoord.'),
    includes: [
      l('Any design, in English and Afrikaans', 'Enige ontwerp, in Engels en Afrikaans'),
      l('Edit words and photos right on the page', 'Verander woorde en foto’s reg op die blad'),
      l('Digital invitation with the envelope opening', 'Digitale uitnodiging met die koevertopening'),
      l('Online RSVP and guest list with export', 'Aanlyn RSVP en gastelys met uitvoer'),
      l('Today mode and a day-of roster for your MC', 'Vandag-modus en ’n dagrooster vir julle seremoniemeester'),
    ],
  },
  {
    id: 'celebration', name: l('Celebration', 'Viering'), price: 6500, demo: 'midnight',
    summary: l('For celebrations with more than one gathering.', 'Vir vierings met meer as een geleentheid.'),
    includes: [
      l('Replies for each event, such as a welcome evening', 'Antwoorde per geleentheid, soos ’n verwelkomingsaand'),
      l('Meal choices and dietary notes', 'Etekeuses en dieetnotas'),
      l('Photo gallery', 'Fotogalery'),
      l('Two rounds of changes by us', 'Twee rondtes veranderinge deur ons'),
    ],
  },
  {
    id: 'complete', name: l('Complete', 'Volledig'), price: 8500, demo: 'ivory',
    summary: l('The whole weekend, planned in one place.', 'Die hele naweek, op een plek beplan.'),
    includes: [
      l('One invitation per household', 'Een uitnodiging per huishouding'),
      l('Catering summary and seating planner', 'Spyseneringopsomming en sitplekbeplanner'),
      l('Planner exports and a printable pack', 'Beplanneruitvoer en ’n drukbare pakket'),
      l('Wedding and honeymoon budget', 'Trou- en wittebroodsbegroting'),
      l('Disposable camera for up to 60 guests', 'Weggooikamera vir tot 60 gaste'),
      l('Design consultation, setup help and three rounds of changes', 'Ontwerpkonsultasie, hulp met opstelling en drie rondtes veranderinge'),
    ],
  },
];

export const planById = (id: PlanId) => plans.find(p => p.id === id)!;

// Optional extras, outside the plans.
export const addOns = {
  disposableCamera: { name: l('Disposable camera', 'Weggooikamera'), note: l('Add to Essential or Celebration. Price confirmed with you.', 'Voeg by Essensieel of Viering. Prys word met julle bevestig.') },
  photography: { name: l('Photography', 'Fotografie'), note: l('Planning estimate in the builder below; booked with the photographer.', 'Beplanningsberaming in die bouer hieronder; met die fotograaf bespreek.') },
};

export const venuePartnerDiscount = { active: false, note: l('A venue-partner discount is planned for couples booking through a partner venue. It applies only once real agreements exist.', '’n Venuevennootafslag word beplan vir paartjies wat deur ’n vennootvenue bespreek. Dit geld eers wanneer werklike ooreenkomste bestaan.') };

export const formatRand = (n: number) => `R${n.toLocaleString('en-ZA')}`;

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
    l('Your wedding is three to six months away when we start.', 'Julle troue is drie tot ses maande weg wanneer ons begin.'),
    l('The plan, design and number of revision rounds are fixed in writing before we start. Anything extra is quoted separately.', 'Die plan, ontwerp en aantal hersieningsrondtes word skriftelik vasgelê voordat ons begin. Enigiets ekstra word apart gekwoteer.'),
    l('We may show your website in our portfolio and on social media. Guest details are never shown, and you approve what we share.', 'Ons mag julle webwerf in ons portefeulje en op sosiale media wys. Gastebesonderhede word nooit gewys nie, en julle keur goed wat ons deel.'),
    l('A short written testimonial after the wedding.', '’n Kort geskrewe getuigskrif ná die troue.'),
    l('A small “Made with Ewig & Eie” credit in your website footer.', '’n Klein “Gemaak deur Ewig & Eie”-erkenning onderaan julle webwerf.'),
  ],
  cta: l('Ask about a founding place', 'Vra oor ’n stigtersplek'),
};
