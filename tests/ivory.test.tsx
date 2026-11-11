import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { defaultIvory, ivoryGuests, ivoryHouseholds, ivoryPackage, ivorySeating } from '../src/collections/ivory/content';
import { IVORY_DATABASE, parseIvoryBackup, serializeIvoryBackup, shiftWeekend, validateIvory } from '../src/collections/ivory/storage';
import { analyseSeating, autoSeat, cateringSummary, householdStatus, summarizeInvitedEvent } from '../src/collections/ivory/model';
import { cateringCsv, householdCsv, runSheetCsv, seatingCsv } from '../src/collections/ivory/exports';
import { contrastRatio } from '../src/collections/shared/validateTemplate';
import { collectionCapabilities, hasCapability } from '../src/collections/shared/capabilities';
import { MIDNIGHT_DATABASE } from '../src/collections/midnight/storage';
import { commitHouseholdReplies, updateEventResponse } from '../src/components/couple/guestModel';
import { CoupleDashboard } from '../src/components/couple/CoupleDashboard';
import { conceptPrices } from '../src/config';
import IvoryCollection from '../src/pages/IvoryCollection';
import { StationerySuite } from '../src/collections/ivory/Stationery';

test('commercial facts: R8,000 flagship, inactive R6,000 partner price, honest exclusions', () => {
  assert.equal(ivoryPackage.price, 8000); assert.equal(conceptPrices.ivory, 8000);
  assert.equal(ivoryPackage.plannedPartnerPrice, 6000); assert.equal(ivoryPackage.partnerEligibilityActive, false);
  assert.equal(ivoryPackage.revisionRounds, 3);
  for (const x of ['photography', 'physical-printing', 'unlimited-bespoke-development']) assert.ok((ivoryPackage.excluded as readonly string[]).includes(x));
  assert.ok(conceptPrices.ivory > conceptPrices.midnight && conceptPrices.midnight > conceptPrices.garden);
});

test('fictional facts: 10 March 2029 is a Saturday and the weekend runs Friday to Sunday', () => {
  assert.equal(new Date('2029-03-10T12:00:00Z').getUTCDay(), 6);
  assert.deepEqual(defaultIvory.events.map(e => e.date), ['2029-03-09', '2029-03-10', '2029-03-11']);
  assert.equal(defaultIvory.venue, 'Maison Aveline');
});

test('every bilingual string exists in both languages and IDs are unique', () => {
  for (const [id, copy] of Object.entries(defaultIvory.text)) { assert.ok(copy.en.trim(), `${id} en`); assert.ok(copy.af.trim(), `${id} af`); }
  for (const list of [defaultIvory.media, defaultIvory.events, defaultIvory.itinerary, defaultIvory.meals, defaultIvory.tables]) assert.equal(new Set(list.map(i => i.id)).size, list.length);
  assert.equal(new Set(ivoryGuests().map(g => g.id)).size, 24);
});

test('accessible default colours: ink on paper and stone meet WCAG AA, muted text too', () => {
  const { ink, paper, stone } = defaultIvory.colors;
  assert.ok(contrastRatio(ink, paper) >= 7); assert.ok(contrastRatio(ink, stone) >= 4.5);
  const mix = (a: string, b: string, w: number) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * w + parseInt(b.slice(i, i + 2), 16) * (1 - w)).toString(16).padStart(2, '0')).join('');
  assert.ok(contrastRatio(mix(ink, paper, .78), paper) >= 4.5, 'muted text on paper');
  assert.ok(contrastRatio(mix(ink, stone, .78), stone) >= 4.5, 'muted text on stone');
});

test('portable backup round-trips edits, photos and colours; bundled photos are referenced, not embedded', () => {
  const data = structuredClone(defaultIvory);
  data.couple.first = 'Céline'; data.text['story.body1'].af = 'Ons eie storie.'; data.colors.accent = '#a98c5a';
  data.media[0] = { ...data.media[0], src: 'data:image/png;base64,aGVsbG8=', placeholder: false };
  data.itinerary[9].hidden = false; data.tables[2].capacity = 10; data.monogram = { left: 'C', right: 'J', style: 'arch' };
  const text = serializeIvoryBackup('Weekend draft', data);
  assert.match(text, /ivory-asset:portrait/); assert.equal(text.includes(defaultIvory.media[1].src), false);
  const restored = parseIvoryBackup(text);
  assert.equal(restored.name, 'Weekend draft'); assert.deepEqual(restored.data, data);
});

test('rejects other collections, future versions, unsafe photos and broken fixed layouts', () => {
  for (const mutate of [
    (d: any) => { d.collection = 'midnight'; }, (d: any) => { d.version = 2; },
    (d: any) => { d.media[0].src = 'javascript:alert(1)'; }, (d: any) => { d.media[0].src = 'data:image/svg+xml,<svg/>'; },
    (d: any) => { d.media[0].id = 'cover'; }, (d: any) => { d.itinerary.pop(); }, (d: any) => { d.itinerary[0].eventId = 'wedding'; },
    (d: any) => { d.date = '2029-02-30'; }, (d: any) => { d.events[1].date = '2029-03-12'; }, (d: any) => { d.events[0].date = '2029-03-11'; },
    (d: any) => { d.deadline = '2029-04-01'; }, (d: any) => { d.events[0].time = '25:00'; }, (d: any) => { d.colors.ink = 'red'; },
    (d: any) => { d.media[0].focal = '120% 10%'; }, (d: any) => { d.tables[0].capacity = 0; }, (d: any) => { d.tables[0].capacity = 3.5; },
    (d: any) => { d.monogram.style = 'script'; }, (d: any) => { d.monogram.left = ''; }, (d: any) => { d.couple.first = ' '; },
    (d: any) => { delete d.text['hero.line'].af; }, (d: any) => { d.text.extra = { en: 'x', af: 'x' }; }, (d: any) => { d.itinerary[0].hidden = 'no'; },
  ]) { const d = structuredClone(defaultIvory); mutate(d); assert.throws(() => validateIvory(d)); }
  assert.throws(() => parseIvoryBackup('{broken'));
  assert.throws(() => parseIvoryBackup(JSON.stringify({ name: 'x', data: defaultIvory })), 'missing collection marker');
  assert.throws(() => serializeIvoryBackup(' ', defaultIvory));
  assert.notEqual(IVORY_DATABASE, MIDNIGHT_DATABASE); assert.notEqual(IVORY_DATABASE, 'ewig-garden-studio');
});

test('changing the wedding date moves the whole weekend and the deadline together', () => {
  const moved = shiftWeekend(defaultIvory, '2029-04-14');
  assert.deepEqual(moved.events.map(e => e.date), ['2029-04-13', '2029-04-14', '2029-04-15']);
  assert.equal(moved.deadline, '2029-03-07'); assert.doesNotThrow(() => validateIvory(moved));
  assert.equal(defaultIvory.date, '2029-03-10');
});

test('household invitations: totals only count invited guests; replies stay inside the household', () => {
  const guests = ivoryGuests();
  assert.deepEqual(summarizeInvitedEvent(guests, ivoryHouseholds, 'welcome'), { invited: 8, accepted: 7, declined: 1, pending: 0 });
  assert.deepEqual(summarizeInvitedEvent(guests, ivoryHouseholds, 'wedding'), { invited: 24, accepted: 18, declined: 2, pending: 4 });
  assert.deepEqual(summarizeInvitedEvent(guests, ivoryHouseholds, 'brunch'), { invited: 18, accepted: 12, declined: 4, pending: 2 });
  assert.equal(householdStatus(guests, ivoryHouseholds, 'iv-h07'), 'awaiting');
  const [a, b] = guests.filter(g => g.householdId === 'iv-h07');
  const ra = { ...updateEventResponse(updateEventResponse(a, 'wedding', 'accepted'), 'brunch', 'declined'), meal: 'garden' };
  const rb = updateEventResponse(updateEventResponse(b, 'wedding', 'declined'), 'brunch', 'declined');
  const next = commitHouseholdReplies(guests, 'iv-h07', [ra, rb], ['wedding', 'brunch'], defaultIvory.meals.map(m => m.id), '2029-01-20');
  assert.equal(summarizeInvitedEvent(next, ivoryHouseholds, 'wedding').accepted, 19);
  assert.equal(householdStatus(next, ivoryHouseholds, 'iv-h07'), 'complete');
  assert.deepEqual(next.filter(g => g.householdId !== 'iv-h07'), guests.filter(g => g.householdId !== 'iv-h07'));
});

test('catering summary: attending guests only, overlapping labels, allergies and access', () => {
  const c = cateringSummary(ivoryGuests(), defaultIvory, 'en');
  assert.equal(c.attending, 18);
  assert.deepEqual(c.meals.map(m => m.count), [7, 6, 5]); assert.equal(c.unselected.length, 0);
  assert.equal(c.dietary.find(d => d.label === 'Vegetarian')?.count, 3);
  assert.equal(c.allergies.length, 3); assert.equal(c.access.length, 1);
  assert.equal(c.meals.reduce((n, m) => n + m.count, 0), c.attending);
});

test('seating: capacity, split households, declined guests and auto-seat keeping households together', () => {
  const guests = ivoryGuests();
  const start = analyseSeating(guests, defaultIvory, ivorySeating());
  assert.equal(start.seated, 8); assert.equal(start.unseated.length, 10); assert.equal(start.seats, 32);
  const messy = { ...ivorySeating(), 'iv-g16': 'table-3', 'iv-g10': 'table-4' };
  const report = analyseSeating(guests, defaultIvory, messy);
  assert.deepEqual(report.declinedButSeated.map(g => g.name), ['Anri Steyn']); assert.deepEqual(report.splitHouseholds, []);
  const seated = autoSeat(guests, defaultIvory, messy);
  const after = analyseSeating(guests, defaultIvory, seated);
  assert.equal(after.unseated.length, 0); assert.equal(after.declinedButSeated.length, 0);
  assert.ok(after.tables.every(t => !t.over));
  assert.equal(seated['iv-g09'], seated['iv-g10'], 'Khumalo household together');
  const crowded = { ...ivorySeating(), 'iv-g06': 'table-1', 'iv-g07': 'table-1', 'iv-g08': 'table-1', 'iv-g09': 'table-1' };
  assert.equal(analyseSeating(guests, defaultIvory, crowded).tables[0].over, true);
});

test('planner exports are spreadsheet-safe and complete', () => {
  const guests = ivoryGuests(); guests[0] = { ...guests[0], name: '=HYPERLINK("x")' };
  const households = householdCsv(guests, ivoryHouseholds, defaultIvory, 'en');
  assert.match(households, /"'=HYPERLINK\(""x""\)"/); assert.match(households, /not invited/);
  assert.match(cateringCsv(guests, ivoryHouseholds, defaultIvory, ivorySeating(), 'en'), /Coeliac/);
  assert.match(seatingCsv(guests, defaultIvory, ivorySeating(), 'af'), /Nie geplaas nie/);
  const run = runSheetCsv(defaultIvory, 'en');
  assert.match(run, /Ceremony in the old chapel/); assert.equal(run.includes('Slow goodbyes'), false);
  assert.ok(run.indexOf('"15:00"') < run.indexOf('"15:30"'));
});

test('capabilities: Ivory unlocks the advanced tools; Garden and Midnight are unchanged', () => {
  for (const c of ['households', 'seatingPlan', 'plannerExports', 'cateringSummary', 'budgetPlanner'] as const) { assert.ok(hasCapability('ivory', c)); assert.equal(hasCapability('midnight', c), false); }
  assert.ok(collectionCapabilities.midnight.every(c => collectionCapabilities.ivory.includes(c)));
});

test('shared dashboard: uninvited guests are shown as such and excluded from event totals', () => {
  const markup = renderToStaticMarkup(<CoupleDashboard guests={ivoryGuests()} onChange={() => {}} onReset={() => {}} names="Amélie & James" af={false} collection="ivory" events={defaultIvory.events.map(e => ({ id: e.id, label: e.name.en }))} meals={defaultIvory.meals.map(m => ({ id: m.id, label: m.name.en }))} isInvited={(g, e) => ivoryHouseholds.find(h => h.id === g.householdId)!.invitedEvents.includes(e)}/>);
  assert.match(markup, /Not invited/);
  assert.match(markup, /<strong>7<\/strong> Attending/); // welcome evening: 7 of 8 invited
  assert.equal(markup.includes('â€'), false, 'no mojibake');
});

test('page renders the cover, fictional label, scope and Afrikaans stationery without services', () => {
  const html = renderToStaticMarkup(<MemoryRouter initialEntries={['/collections/ivory']}><IvoryCollection/></MemoryRouter>);
  for (const s of ['Amélie', 'James', 'Maison Aveline', 'RSVP', 'Fictional design concept', 'placeholder plates', 'R8', 'R6', 'three consolidated revision rounds', 'Not included: photography, physical printing']) assert.ok(html.includes(s), s);
  const af = renderToStaticMarkup(<StationerySuite data={defaultIvory} language="af" formatDate={d => d}/>);
  for (const s of ['Hou die datum oop', 'Dankie', 'Versoek', 'Tafel'].map(x => x.toLowerCase())) assert.ok(af.toLowerCase().includes(s), s);
});
