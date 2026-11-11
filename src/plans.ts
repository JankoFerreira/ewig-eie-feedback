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
