import hero from '../../assets/ivory/ivory-hero.webp';
import portrait from '../../assets/ivory/ivory-portrait.webp';
import venue from '../../assets/ivory/ivory-venue.webp';
import ceremony from '../../assets/ivory/ivory-ceremony.webp';
import detail from '../../assets/ivory/ivory-detail.webp';
import table from '../../assets/ivory/ivory-table.webp';
import heroForeground from '../../assets/ivory/ivory-hero-foreground.webp';
import type { DemoGuest } from '../../components/couple/guestModel';

export type Language = 'en' | 'af';
export type Copy = { en: string; af: string };
export const words = (en: string, af: string): Copy => ({ en, af });

// Commercial facts. Partner pricing stays inactive until a signed venue agreement exists.
export const ivoryPackage = {
  price: 8000,
  plannedPartnerPrice: 6000,
  partnerEligibilityActive: false,
  revisionRounds: 3,
  service: ['design-consultation', 'assisted-content-setup', 'three-consolidated-revision-rounds'],
  excluded: ['photography', 'physical-printing', 'unlimited-bespoke-development'],
} as const;

export const IVORY_VERSION = 1 as const;
export const monogramStyles = ['ring', 'arch', 'stacked'] as const;
export type MonogramStyle = typeof monogramStyles[number];

export type Media = { id: string; src: string; alt: Copy; caption: Copy; focal: string; placeholder: boolean };
export type IvoryEvent = { id: string; name: Copy; date: string; time: string; location: string; dress: Copy; description: Copy };
export type ItineraryItem = { id: string; eventId: string; time: string; name: Copy; note: Copy; hidden: boolean };
export type Meal = { id: string; name: Copy };
export type SeatingTable = { id: string; name: string; capacity: number };
export type Household = { id: string; name: string; invitedEvents: string[] };

export type IvoryData = {
  collection: 'ivory'; version: typeof IVORY_VERSION;
  couple: { first: string; firstSurname: string; second: string; secondSurname: string };
  monogram: { left: string; right: string; style: MonogramStyle };
  date: string; deadline: string; venue: string; region: string;
  /** Depth-layered cover: a transparent foreground image floats in front of the details. */
  heroDepth: boolean;
  colors: { paper: string; stone: string; ink: string; accent: string };
  text: Record<string, Copy>; media: Media[]; events: IvoryEvent[]; itinerary: ItineraryItem[];
  meals: Meal[]; tables: SeatingTable[];
};

// Every key is a stable content ID. Layout code reads these IDs; never positional keys.
export const ivoryText: Record<string, Copy> = {
  'hero.kicker': words('THE WEDDING WEEKEND', 'DIE TROUNAWEEK'),
  'hero.issue': words('Volume I · Three days in the Winelands', 'Volume I · Drie dae in die Wynland'),
  'hero.line': words('We would love you there, for every unhurried hour of it.', 'Ons wil jou graag daar hê, vir elke rustige uur daarvan.'),
  'letter.kicker': words('A NOTE FROM US', '’N BRIEFIE VAN ONS'),
  'letter.title': words('Before the weekend begins.', 'Voordat die naweek begin.'),
  'letter.body': words('We have kept the plans simple: a supper among the olives, a ceremony in the old chapel, a long dinner in the barn, and coffee before everyone drives home. Come for one part or all three. Everything you need is on this page, and it will stay up to date.', 'Ons het die planne eenvoudig gehou: ’n aandete tussen die olyfbome, ’n seremonie in die ou kapel, ’n lang ete in die skuur, en koffie voordat almal huis toe ry. Kom vir een deel of al drie. Alles wat jy nodig het, is op hierdie blad, en dit bly op datum.'),
  'letter.signoff': words('With love,', 'Met liefde,'),
  'story.kicker': words('OUR STORY', 'ONS STORIE'),
  'story.title': words('Two careful people. One easy decision.', 'Twee versigtige mense. Een maklike besluit.'),
  'story.quote': words('“We were both ten minutes early. It was the first thing we had in common.”', '“Ons was albei tien minute vroeg. Dit was die eerste ding wat ons in gemeen gehad het.”'),
  'story.body1': words('James arrived at the archive with a water-damaged site plan of an old Winelands homestead. Amélie, the paper conservator on duty, told him it would take six weeks. He visited every Thursday to “check on its progress”.', 'James het by die argief opgedaag met ’n waterbeskadigde terreinplan van ’n ou Wynlandse opstal. Amélie, die papierrestourateur aan diens, het gesê dit sal ses weke neem. Hy het elke Donderdag kom kuier om “die vordering te kontroleer”.'),
  'story.body2': words('The plan was finished in five weeks. The Thursdays continued. Four years later, in a reading room he had restored, James gave her a hand-bound book with one blank page and a single question on the last line.', 'Die plan was binne vyf weke klaar. Die Donderdae het voortgegaan. Vier jaar later, in ’n leeskamer wat hy gerestoureer het, het James vir haar ’n handgebinde boek gegee met een leë bladsy en ’n enkele vraag op die laaste reël.'),
  'weekend.kicker': words('THE WEEKEND', 'DIE NAWEEK'),
  'weekend.title': words('Three days, unhurried.', 'Drie dae, sonder haas.'),
  'weekend.intro': words('Your invitation shows which gatherings are planned for your household. All times are South African Standard Time.', 'Jou uitnodiging wys watter geleenthede vir jou huishouding beplan is. Alle tye is Suid-Afrikaanse standaardtyd.'),
  'venue.kicker': words('THE PLACE', 'DIE PLEK'),
  'venue.body': words('An imagined farmhouse estate among old olive trees and vineyards: a whitewashed chapel, a long barn for dinner and an orchard room for Sunday coffee.', '’n Denkbeeldige plaasopstal tussen ou olyfbome en wingerde: ’n witgekalkte kapel, ’n lang skuur vir aandete en ’n boordkamer vir Sondagkoffie.'),
  'venue.access': words('Paths are gravel. Please tell us about access needs in your reply so arrangements can be confirmed with the venue.', 'Paadjies is gruis. Vertel ons asseblief in jou antwoord van toeganklikheidsbehoeftes sodat reëlings met die venue bevestig kan word.'),
  'notes.stay.title': words('Staying nearby', 'Oornag naby'),
  'notes.stay.body': words('Guests travelling for the weekend will receive accommodation suggestions with their confirmation. No rooms have been reserved in this concept.', 'Gaste wat vir die naweek reis, sal verblyfvoorstelle saam met hul bevestiging ontvang. Geen kamers is in hierdie konsep bespreek nie.'),
  'notes.travel.title': words('Getting there', 'Hoe om daar te kom'),
  'notes.travel.body': words('The estate is a fictional address. A real couple’s page would share verified directions and transport here.', 'Die landgoed is ’n fiktiewe adres. ’n Regte paartjie se blad sal hier geverifieerde aanwysings en vervoer deel.'),
  'notes.dress.title': words('What to wear', 'Wat om aan te trek'),
  'notes.dress.body': words('Soft tones, natural fabrics and shoes that forgive gravel. Evenings can be cool, so bring a layer.', 'Sagte kleure, natuurlike materiaal en skoene wat gruis vergewe. Aande kan koel wees, bring dus iets warms.'),
  'notes.gifts.title': words('Gifts', 'Geskenke'),
  'notes.gifts.body': words('Your company is the gift. If you would like to mark the day, a handwritten note for our book would mean the most.', 'Julle geselskap is die geskenk. As jy die dag wil vier, sal ’n handgeskrewe briefie vir ons boek die meeste beteken.'),
  'gallery.kicker': words('PAGES FROM OUR YEAR', 'BLADSYE UIT ONS JAAR'),
  'gallery.title': words('A few quiet frames.', '’n Paar stil rame.'),
  'faq.kicker': words('GOOD TO KNOW', 'GOED OM TE WEET'),
  'faq.children.title': words('Are children invited?', 'Is kinders genooi?'),
  'faq.children.body': words('This is an adults-only weekend. Your invitation lists everyone invited in your household.', 'Hierdie is ’n naweek net vir volwassenes. Jou uitnodiging lys almal in jou huishouding wat genooi is.'),
  'faq.events.title': words('Do I need to attend all three days?', 'Moet ek al drie dae bywoon?'),
  'faq.events.body': words('Not at all. Reply separately for each gathering on your invitation.', 'Glad nie. Antwoord afsonderlik vir elke geleentheid op jou uitnodiging.'),
  'faq.weather.title': words('What if it rains?', 'Wat as dit reën?'),
  'faq.weather.body': words('The ceremony moves inside the chapel and dinner is already under cover.', 'Die seremonie skuif die kapel binne en die ete is reeds onder dak.'),
  'faq.contact.title': words('Who can I ask?', 'Wie kan ek vra?'),
  'faq.contact.body': words('A real page lists a named contact. This fictional concept has no wedding contact details.', '’n Regte blad noem ’n kontakpersoon. Hierdie fiktiewe konsep het geen troukontakbesonderhede nie.'),
  'rsvp.kicker': words('YOUR REPLY', 'JOU ANTWOORD'),
  'rsvp.title': words('Kindly reply for your household.', 'Antwoord asseblief vir jou huishouding.'),
  'rsvp.body': words('Choose each gathering separately, select dinner and tell us anything the kitchen or venue should know.', 'Kies elke geleentheid afsonderlik, kies ’n aandete en vertel ons enigiets wat die kombuis of venue moet weet.'),
  'invitation.lead': words('Together with their families', 'Saam met hul families'),
  'invitation.request': words('request the pleasure of your company at their marriage', 'versoek die genoeë van u geselskap by hul huwelik'),
  'invitation.weekend': words('and the weekend of celebration that follows', 'en die naweek van feesviering wat volg'),
  'invitation.reply': words('Kindly reply by', 'Antwoord asseblief voor'),
  'invitation.prepared': words('Prepared for', 'Voorberei vir'),
  'footer.note': words('Until the last page.', 'Tot die laaste bladsy.'),
  'stationery.save.title': words('Save the date', 'Hou die datum oop'),
  'stationery.save.line': words('Formal invitation to follow', 'Formele uitnodiging volg'),
  'stationery.details.title': words('The weekend', 'Die naweek'),
  'stationery.reply.title': words('Répondez s’il vous plaît', 'Antwoord asseblief'),
  'stationery.reply.line': words('Reply online with your invitation code', 'Antwoord aanlyn met jou uitnodigingskode'),
  'stationery.menu.title': words('Dinner', 'Aandete'),
  'stationery.menu.starter': words('Heirloom tomato, buffalo mozzarella, olive oil from the estate', 'Erfstuktamatie, buffelmozzarella, olyfolie van die landgoed'),
  'stationery.menu.dessert': words('Buttermilk panna cotta, poached quince', 'Karringmelk-panna cotta, gestoofde kweper'),
  'stationery.place.note': words('We are so glad you are here.', 'Ons is so bly jy is hier.'),
  'stationery.table.prefix': words('Table', 'Tafel'),
  'stationery.thanks.title': words('Thank you', 'Dankie'),
  'stationery.thanks.body': words('For travelling, for celebrating and for every kind word in our book.', 'Dat julle gereis het, saam gevier het en vir elke liewe woord in ons boek.'),
};

export const defaultIvory: IvoryData = {
  collection: 'ivory', version: IVORY_VERSION,
  couple: { first: 'Amélie', firstSurname: 'Botha', second: 'James', secondSurname: 'van der Merwe' },
  monogram: { left: 'A', right: 'J', style: 'ring' },
  date: '2029-03-10', deadline: '2029-01-31', venue: 'Maison Aveline', region: 'Cape Winelands', heroDepth: true,
  colors: { paper: '#f6f1e7', stone: '#e4dccd', ink: '#383d2c', accent: '#b8975f' },
  text: ivoryText,
  media: [
    { id: 'hero', src: hero, placeholder: true, alt: words('Placeholder plate: a limewashed chapel doorway in morning light, standing in for the couple’s courtyard portrait', 'Plekhouerplaat: ’n witgekalkte kapeldeur in oggendlig, in die plek van die paartjie se binnehofportret'), caption: words('The chapel door, early.', 'Die kapeldeur, vroeg.'), focal: '62% 45%' },
    { id: 'portrait', src: portrait, placeholder: true, alt: words('Placeholder plate: sheer curtains in soft light, standing in for a close portrait of Amélie and James', 'Plekhouerplaat: deurskynende gordyne in sagte lig, in die plek van ’n intieme portret van Amélie en James'), caption: words('The reading room.', 'Die leeskamer.'), focal: '50% 40%' },
    { id: 'venue', src: venue, placeholder: true, alt: words('Placeholder plate: an imagined gabled farmhouse between vineyards and mountains', 'Plekhouerplaat: ’n denkbeeldige geweloplaashuis tussen wingerde en berge'), caption: words('Maison Aveline, imagined.', 'Maison Aveline, verbeel.'), focal: '60% 50%' },
    { id: 'ceremony', src: ceremony, placeholder: true, alt: words('Placeholder plate: an aisle between olive trees leading to a small chapel', 'Plekhouerplaat: ’n paadjie tussen olyfbome na ’n klein kapel'), caption: words('The olive walk.', 'Die olyflaan.'), focal: '50% 50%' },
    { id: 'detail', src: detail, placeholder: true, alt: words('Placeholder plate: ivory stationery cards with a champagne ribbon and wax seal on linen', 'Plekhouerplaat: ivoorkleurige skryfbehoeftes met ’n sjampanjelint en wasseël op linne'), caption: words('Paper, ribbon, wax.', 'Papier, lint, was.'), focal: '50% 45%' },
    { id: 'table', src: table, placeholder: true, alt: words('Placeholder plate: a long candlelit dinner table in a barn', 'Plekhouerplaat: ’n lang kersverligte aandetetafel in ’n skuur'), caption: words('The long table.', 'Die lang tafel.'), focal: '50% 55%' },
    // Transparent foreground for the depth-layered cover (PNG/WebP with transparency). Not shown in the gallery.
    { id: 'heroForeground', src: heroForeground, placeholder: true, alt: words('', ''), caption: words('Cover foreground layer', 'Voorbladvoorgrondlaag'), focal: '50% 50%' },
  ],
  events: [
    { id: 'welcome', name: words('Welcome evening', 'Verwelkomingsaand'), date: '2029-03-09', time: '18:30', location: 'Maison Aveline · The Olive Terrace', dress: words('Relaxed linen', 'Ontspanne linne'), description: words('Drinks and small plates among the olives for those arriving early.', 'Drankies en klein happies tussen die olyfbome vir dié wat vroeg aankom.') },
    { id: 'wedding', name: words('The wedding', 'Die troue'), date: '2029-03-10', time: '15:30', location: 'Maison Aveline · The Chapel & Long Barn', dress: words('Formal · soft tones welcome', 'Formeel · sagte kleure welkom'), description: words('Our ceremony in the old chapel, followed by dinner and dancing.', 'Ons seremonie in die ou kapel, gevolg deur aandete en dans.') },
    { id: 'brunch', name: words('Farewell brunch', 'Afskeidsbrunch'), date: '2029-03-11', time: '10:30', location: 'Maison Aveline · The Orchard Room', dress: words('Come as you are', 'Kom soos jy is'), description: words('Coffee, pastries and a slow goodbye.', 'Koffie, gebak en ’n stadige totsiens.') },
  ],
  itinerary: [
    { id: 'welcome-drinks', eventId: 'welcome', time: '18:30', name: words('Drinks on the terrace', 'Drankies op die terras'), note: words('Olive Terrace', 'Olyfterras'), hidden: false },
    { id: 'welcome-supper', eventId: 'welcome', time: '19:30', name: words('A long supper of small plates', '’n Lang aandete van klein happies'), note: words('Seating is informal', 'Sitplekke is informeel'), hidden: false },
    { id: 'wedding-arrival', eventId: 'wedding', time: '15:00', name: words('Arrive under the oaks', 'Aankoms onder die eikebome'), note: words('Lemonade and shade', 'Limonade en koelte'), hidden: false },
    { id: 'wedding-ceremony', eventId: 'wedding', time: '15:30', name: words('Ceremony in the old chapel', 'Seremonie in die ou kapel'), note: words('Please be seated by 15:20', 'Sit asseblief teen 15:20'), hidden: false },
    { id: 'wedding-courtyard', eventId: 'wedding', time: '16:30', name: words('Drinks in the courtyard', 'Drankies in die binnehof'), note: words('Portraits for the couple', 'Portrette vir die paartjie'), hidden: false },
    { id: 'wedding-dinner', eventId: 'wedding', time: '18:30', name: words('Dinner in the Long Barn', 'Aandete in die Lang Skuur'), note: words('Seating plan at the door', 'Sitplekplan by die deur'), hidden: false },
    { id: 'wedding-dancing', eventId: 'wedding', time: '21:00', name: words('First dance, then everyone', 'Eerste dans, dan almal'), note: words('Flat shoes provided', 'Plat skoene word voorsien'), hidden: false },
    { id: 'wedding-close', eventId: 'wedding', time: '23:30', name: words('Carriages', 'Vertrek'), note: words('Pre-arranged transport only', 'Slegs vooraf gereelde vervoer'), hidden: false },
    { id: 'brunch-coffee', eventId: 'brunch', time: '10:30', name: words('Coffee and pastries', 'Koffie en gebak'), note: words('Orchard Room', 'Boordkamer'), hidden: false },
    { id: 'brunch-goodbye', eventId: 'brunch', time: '12:30', name: words('Slow goodbyes', 'Stadige totsiens'), note: words('', ''), hidden: true },
  ],
  meals: [
    { id: 'lamb', name: words('Slow-roasted lamb, olive and lemon', 'Stadig gebraaide lam, olyf en suurlemoen') },
    { id: 'linefish', name: words('Linefish, beurre blanc and fennel', 'Lynvis, beurre blanc en vinkel') },
    { id: 'garden', name: words('Roasted heirloom vegetables and barley (vegetarian)', 'Geroosterde erfstukgroente en gars (vegetaries)') },
  ],
  tables: [
    { id: 'table-1', name: 'Chenin', capacity: 8 },
    { id: 'table-2', name: 'Sémillon', capacity: 6 },
    { id: 'table-3', name: 'Cinsault', capacity: 6 },
    { id: 'table-4', name: 'Grenache', capacity: 6 },
    { id: 'table-5', name: 'Verdelho', capacity: 6 },
  ],
};

// ---- Fictional demonstration guests (never real people, never contacted) ----
export const ivoryHouseholds: Household[] = [
  { id: 'iv-h01', name: 'Elsa & Pieter Botha', invitedEvents: ['welcome', 'wedding', 'brunch'] },
  { id: 'iv-h02', name: 'Rina Botha', invitedEvents: ['welcome', 'wedding', 'brunch'] },
  { id: 'iv-h03', name: 'Marike & Johan van der Merwe', invitedEvents: ['welcome', 'wedding', 'brunch'] },
  { id: 'iv-h04', name: 'Lise van der Merwe & Daniel Fourie', invitedEvents: ['welcome', 'wedding', 'brunch'] },
  { id: 'iv-h05', name: 'Chloé Martin', invitedEvents: ['welcome', 'wedding', 'brunch'] },
  { id: 'iv-h06', name: 'Naledi & Sipho Khumalo', invitedEvents: ['wedding', 'brunch'] },
  { id: 'iv-h07', name: 'Thandi Mokoena & Ruan Smit', invitedEvents: ['wedding', 'brunch'] },
  { id: 'iv-h08', name: 'Yusuf & Leila Davids', invitedEvents: ['wedding', 'brunch'] },
  { id: 'iv-h09', name: 'Kobus & Anri Steyn', invitedEvents: ['wedding', 'brunch'] },
  { id: 'iv-h10', name: 'Zanele Dube & Pieter-Jan de Wet', invitedEvents: ['wedding', 'brunch'] },
  { id: 'iv-h11', name: 'Grace Adeyemi & Tom Wilson', invitedEvents: ['wedding'] },
  { id: 'iv-h12', name: 'Emma & Lucas Meyer', invitedEvents: ['wedding'] },
  { id: 'iv-h13', name: 'Hannah Pillay', invitedEvents: ['wedding'] },
  { id: 'iv-h14', name: 'Marco Rossi', invitedEvents: ['wedding'] },
];

type Seed = [name: string, household: string, language: Language, replies: Record<string, 'accepted' | 'declined' | 'pending'>, meal: string | null, dietary: string[] | null, allergy: string | null, access: string | null];
const seeds: Seed[] = [
  ['Elsa Botha', 'iv-h01', 'af', { welcome: 'accepted', wedding: 'accepted', brunch: 'accepted' }, 'linefish', [], null, null],
  ['Pieter Botha', 'iv-h01', 'af', { welcome: 'accepted', wedding: 'accepted', brunch: 'accepted' }, 'lamb', [], null, null],
  ['Rina Botha', 'iv-h02', 'af', { welcome: 'declined', wedding: 'accepted', brunch: 'accepted' }, 'garden', ['Vegetarian'], null, 'Step-free route and a seat near the aisle'],
  ['Marike van der Merwe', 'iv-h03', 'af', { welcome: 'accepted', wedding: 'accepted', brunch: 'accepted' }, 'lamb', [], null, null],
  ['Johan van der Merwe', 'iv-h03', 'af', { welcome: 'accepted', wedding: 'accepted', brunch: 'accepted' }, 'lamb', [], null, null],
  ['Lise van der Merwe', 'iv-h04', 'en', { welcome: 'accepted', wedding: 'accepted', brunch: 'declined' }, 'garden', ['Vegetarian'], 'Tree nuts', null],
  ['Daniel Fourie', 'iv-h04', 'en', { welcome: 'accepted', wedding: 'accepted', brunch: 'declined' }, 'linefish', [], null, null],
  ['Chloé Martin', 'iv-h05', 'en', { welcome: 'accepted', wedding: 'accepted', brunch: 'accepted' }, 'linefish', ['Pescatarian'], null, null],
  ['Naledi Khumalo', 'iv-h06', 'en', { wedding: 'accepted', brunch: 'accepted' }, 'garden', ['Vegetarian'], null, null],
  ['Sipho Khumalo', 'iv-h06', 'en', { wedding: 'accepted', brunch: 'accepted' }, 'lamb', [], null, null],
  ['Thandi Mokoena', 'iv-h07', 'en', { wedding: 'pending', brunch: 'pending' }, null, null, null, null],
  ['Ruan Smit', 'iv-h07', 'af', { wedding: 'pending', brunch: 'pending' }, null, null, null, null],
  ['Yusuf Davids', 'iv-h08', 'en', { wedding: 'accepted', brunch: 'accepted' }, 'linefish', ['Halal'], null, null],
  ['Leila Davids', 'iv-h08', 'en', { wedding: 'accepted', brunch: 'accepted' }, 'garden', ['Halal'], 'Shellfish', null],
  ['Kobus Steyn', 'iv-h09', 'af', { wedding: 'accepted', brunch: 'declined' }, 'lamb', [], null, null],
  ['Anri Steyn', 'iv-h09', 'af', { wedding: 'declined', brunch: 'declined' }, null, null, null, null],
  ['Zanele Dube', 'iv-h10', 'en', { wedding: 'accepted', brunch: 'accepted' }, 'linefish', ['Gluten-free'], 'Coeliac: no gluten cross-contact', null],
  ['Pieter-Jan de Wet', 'iv-h10', 'af', { wedding: 'accepted', brunch: 'accepted' }, 'lamb', [], null, null],
  ['Grace Adeyemi', 'iv-h11', 'en', { wedding: 'accepted' }, 'garden', ['Vegan'], null, null],
  ['Tom Wilson', 'iv-h11', 'en', { wedding: 'accepted' }, 'linefish', [], null, null],
  ['Emma Meyer', 'iv-h12', 'en', { wedding: 'pending' }, null, null, null, null],
  ['Lucas Meyer', 'iv-h12', 'en', { wedding: 'pending' }, null, null, null, null],
  ['Hannah Pillay', 'iv-h13', 'en', { wedding: 'declined' }, null, null, null, null],
  ['Marco Rossi', 'iv-h14', 'en', { wedding: 'accepted' }, 'lamb', [], null, null],
];

export const ivoryGuests = (): DemoGuest[] => seeds.map(([name, householdId, language, replies, meal, dietary, allergy, access], i) => ({
  id: `iv-g${String(i + 1).padStart(2, '0')}`, householdId, name, language,
  attendance: replies.wedding ?? 'pending', eventAttendance: { ...replies }, meal,
  dietaryRequirements: dietary, allergies: allergy ? [{ ingredient: allergy, note: '' }] : dietary === null ? null : [],
  accessNeeds: access, respondedOn: replies.wedding === 'pending' ? null : '2029-01-12',
}));

// A partly finished plan, so the seating tool has something real to demonstrate.
export const ivorySeating = (): Record<string, string> => ({
  'iv-g01': 'table-1', 'iv-g02': 'table-1', 'iv-g03': 'table-1', 'iv-g04': 'table-1', 'iv-g05': 'table-1',
  'iv-g06': 'table-2', 'iv-g07': 'table-2', 'iv-g08': 'table-2',
});
