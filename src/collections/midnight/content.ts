// No faces in demo imagery: the cover is the candlelit venue, the rest are details and hands.
import hero from '../../assets/midnight/midnight-venue.webp';
import venue from '../../assets/midnight/midnight-table-detail.webp';
import portrait from '../../assets/midnight/midnight-embrace.webp';
import table from '../../assets/midnight/midnight-hands.webp';
import detail from '../../assets/garden/garden-botanical-detail.webp';
import type { DemoGuest } from '../../components/couple/guestModel';
export type Language = 'en' | 'af';
export type Copy = { en: string; af: string };
export const words = (en: string, af: string): Copy => ({ en, af });
// Prices and inclusions live in src/plans.ts: Midnight is a design, free with every plan.
export const textDefaults: Record<string, Copy> = {
  'hero.eyebrow': words('AN EVENING, A LIFETIME', "’N AAND, ’N LEEFTYD"),
  'hero.note': words('Some nights stay with you forever.', 'Party aande bly vir altyd by jou.'),
  'story.title': words('The hours that became ours.', 'Die ure wat ons s’n geword het.'),
  'story.intro': words('Three chapters. A thousand small moments. And you, here for the next one.', 'Drie hoofstukke. Duisend klein oomblikke. En jy, hier vir die volgende een.'),
  'chapter.beginning.title': words('A table for two.', "’n Tafel vir twee."),
  'chapter.beginning.body': words('A rain-soaked bookshop in Cape Town. One last table at the café next door. Mila ordered coffee; Luca stayed until the chairs were stacked. Neither of us remembers the weather after that.', '’n Reënnat boekwinkel in Kaapstad. Een laaste tafel in die kafee langsaan. Mila het koffie bestel; Luca het gebly totdat die stoele opgepak is. Nie een van ons onthou die weer daarna nie.'),
  'chapter.promise.title': words('The quiet kind of yes.', 'Die stil soort ja.'),
  'chapter.promise.body': words('At the end of a long walk through the valley, the sun slipped behind the mountain. There was no audience. Just a question, a trembling laugh, and all the time in the world.', 'Aan die einde van ’n lang wandeling deur die vallei het die son agter die berg verdwyn. Daar was geen gehoor nie. Net ’n vraag, ’n bewerige laggie en al die tyd in die wêreld.'),
  'chapter.evening.title': words('A little closer, a little longer.', '’n Bietjie nader, ’n bietjie langer.'),
  'chapter.evening.body': words('Now we are gathering our favourite people around one candlelit table. Come for the vows. Stay for the stories, the second helping, and the song nobody wants to end.', 'Nou versamel ons ons gunstelingmense om een tafel by kerslig. Kom vir die beloftes. Bly vir die stories, die tweede porsie en die lied wat niemand wil laat eindig nie.'),
  'schedule.title': words('From first light to last dance.', 'Van die eerste lig tot die laaste dans.'),
  'venue.body': words('An imagined manor between the mountains and the vines. A courtyard for our vows, long tables for supper, and the whole night ahead of us.', '’n Denkbeeldige herehuis tussen die berge en wingerde. ’n Binnehof vir ons beloftes, lang tafels vir aandete en die hele nag voor ons.'),
  'details.dress.title': words('Evening elegance', 'Aandelegansie'),
  'details.dress.body': words('Black tie optional. Bring a warm layer for the courtyard and shoes made for dancing.', 'Swartdas opsioneel. Bring iets warms vir die binnehof en skoene waarmee jy kan dans.'),
  'details.travel.title': words('Stay in the valley', 'Bly in die vallei'),
  'details.travel.body': words('Plan a night in Franschhoek. Transport and accommodation details will be shared with invited guests once confirmed.', 'Beplan ’n nag in Franschhoek. Vervoer- en verblyfbesonderhede sal met genooide gaste gedeel word sodra dit bevestig is.'),
  'details.gifts.title': words('Your company is everything', 'Jou geselskap is alles'),
  'details.gifts.body': words('A full table and your good wishes are all we ask. No gifts are expected.', '’n Vol tafel en julle goeie wense is al wat ons vra. Geen geskenke word verwag nie.'),
  'faq.children.title': words('Are children invited?', 'Is kinders genooi?'),
  'faq.children.body': words('This is an adults-only evening. Your invitation lists each invited guest.', 'Hierdie is ’n aand net vir volwassenes. Jou uitnodiging lys elke genooide gas.'),
  'faq.contact.title': words('A question before the evening?', '’n Vraag voor die aand?'),
  'faq.contact.body': words('Use your invitation contact for arrangements. This fictional preview has no real wedding contact or venue address.', 'Gebruik jou uitnodigingskontak vir reëlings. Hierdie fiktiewe voorskou het geen werklike troukontak of venue-adres nie.'),
  'gallery.title': words('Proof that time can stand still.', 'Bewys dat tyd kan stilstaan.'),
  'rsvp.title': words('The evening needs you.', 'Die aand het jou nodig.'),
  'rsvp.body': words('A seat, a glass, a place in our story. Tell us which moments you can share.', '’n Stoel, ’n glas, ’n plek in ons storie. Vertel ons watter oomblikke jy kan deel.'),
  'invitation.wording': words('Together with our families, we invite you to an evening of promises, candlelight and celebration.', 'Saam met ons families nooi ons jou na ’n aand van beloftes, kerslig en feesviering.'),
  'footer.note': words('Until the last candle burns.', 'Tot die laaste kers uitbrand.'),
};
export type Media = { id: string; src: string; alt: Copy; caption: Copy; focal: string };
export type WeddingEvent = { id: string; name: Copy; date: string; time: string; location: string; description: Copy };
export type Meal = { id: string; name: Copy };
export type MidnightData = {
  collection: 'midnight'; version: 1; first: string; second: string; date: string; venue: string; region: string; deadline: string;
  colors: { background: string; text: string; accent: string }; text: Record<string, Copy>; media: Media[]; events: WeddingEvent[];
  schedule: { id: string; time: string; name: Copy }[]; meals: Meal[];
};
export const defaultMidnight: MidnightData = {
  collection: 'midnight', version: 1, first: 'Mila Jacobs', second: 'Luca Daniels', date: '2028-11-18', venue: 'Maison Nocturne', region: 'Franschhoek', deadline: '2028-10-18',
  colors: { background: '#17191b', text: '#f3eee5', accent: '#c9b58a' }, text: textDefaults,
  media: [
    { id: 'hero', src: hero, alt: words('The candlelit manor and long tables at blue hour', 'Die herehuis en lang tafels by kerslig in die blou uur'), caption: words('The world fell quiet.', 'Die wêreld het stil geword.'), focal: '50% 60%' },
    { id: 'portrait', src: portrait, alt: words('An embrace in an ivory satin dress, candles behind', '’n Omhelsing in ’n ivoorsatynrok, met kerse agter'), caption: words('Just us, for a moment.', 'Net ons, vir ’n oomblik.'), focal: '50% 40%' },
    { id: 'table', src: table, alt: words('Hands held by candlelight', 'Hande vasgehou by kerslig'), caption: words('Our favourite place: together.', 'Ons gunstelingplek: saam.'), focal: '50% 40%' },
    { id: 'venue', src: venue, alt: words('A long table of candles, crystal and white roses', '’n Lang tafel met kerse, kristal en wit rose'), caption: words('A place to linger.', '’n Plek om langer te bly.'), focal: '50% 50%' },
    { id: 'detail', src: detail, alt: words('Botanical details for the celebration', 'Botaniese besonderhede vir die viering'), caption: words('The smallest things.', 'Die kleinste dinge.'), focal: '50% 50%' },
  ],
  events: [
    { id: 'welcome', name: words('The welcome evening', 'Die verwelkomingsaand'), date: '2028-11-17', time: '18:00', location: 'Maison Nocturne · Terrace', description: words('A relaxed toast before the celebrations begin.', '’n Ontspanne heildronk voordat die viering begin.') },
    { id: 'wedding', name: words('The wedding', 'Die troue'), date: '2028-11-18', time: '16:30', location: 'Maison Nocturne · Courtyard', description: words('Our vows, followed by supper and dancing.', 'Ons beloftes, gevolg deur aandete en dans.') },
  ],
  schedule: [
    { id: 'arrival', time: '16:30', name: words('A glass on arrival', '’n Glas met aankoms') },
    { id: 'vows', time: '17:00', name: words('Promises in the courtyard', 'Beloftes in die binnehof') },
    { id: 'toast', time: '18:00', name: words('Golden-hour toasts', 'Heildronke in die goue uur') },
    { id: 'supper', time: '19:00', name: words('Supper by candlelight', 'Aandete by kerslig') },
    { id: 'dance', time: '20:30', name: words('One more song', 'Nog een lied') },
  ],
  meals: [{ id: 'beef', name: words('Slow-braised beef', 'Stadiggesmoorde beesvleis') }, { id: 'fish', name: words('Herb-roasted linefish', 'Kruiegebraaide lynvis') }, { id: 'vegan', name: words('Wild mushroom risotto (vegan)', 'Wilde-sampioenrisotto (veganisties)') }],
};
// Noah has already declined, so the B-list (backup guests) has a seat to suggest in the demo.
export const midnightGuests = (): DemoGuest[] => ['Amara Botha', 'Ethan Botha', 'Nina Williams', 'Theo Williams', 'Zoe Adams', 'Noah Adams'].map((name, i) => i === 5
  ? { id: `midnight-guest-${i}`, householdId: `midnight-household-${Math.floor(i / 2)}`, name, language: 'en', attendance: 'declined', dietaryRequirements: null, allergies: null, accessNeeds: null, respondedOn: '2028-09-02', eventAttendance: { welcome: 'declined', wedding: 'declined' }, meal: null }
  : { id: `midnight-guest-${i}`, householdId: `midnight-household-${Math.floor(i / 2)}`, name, language: 'en', attendance: 'pending', dietaryRequirements: null, allergies: null, accessNeeds: null, respondedOn: null, eventAttendance: { welcome: 'pending', wedding: 'pending' }, meal: null });
