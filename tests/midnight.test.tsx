import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { defaultMidnight, midnightGuests, midnightPackage } from '../src/collections/midnight/content';
import { MIDNIGHT_DATABASE, parseMidnightBackup, serializeMidnightBackup, validateMidnight } from '../src/collections/midnight/storage';
import { historyReducer, type History } from '../src/collections/shared/useHistory';
import { commitHouseholdReplies, mealCount, summarizeEvent, summarizeGuests, updateEventResponse } from '../src/components/couple/guestModel';
import { CoupleDashboard } from '../src/components/couple/CoupleDashboard';
import { MidnightRSVP } from '../src/collections/midnight/MidnightRSVP';
import MidnightCollection from '../src/pages/MidnightCollection';
import GardenCollection from '../src/pages/GardenCollection';
import gardenFixture from '../concepts/garden/guests.demo.json';

test('bilingual text, photos, colours and event details survive a portable backup', () => {
  const data = structuredClone(defaultMidnight);
  data.first = 'Test couple';
  data.text['chapter.promise.body'].af = 'Ons eie verhaal.';
  data.colors.accent = '#b2a48e';
  data.events[0].location = 'A new terrace';
  data.media[1].src = 'data:image/png;base64,aGVsbG8=';
  const serialized = serializeMidnightBackup('Evening draft', data);
  assert.match(serialized, /midnight-asset:hero/);
  assert.equal(serialized.includes(defaultMidnight.media[0].src), false);
  const restored = parseMidnightBackup(serialized);
  assert.equal(restored.name, 'Evening draft');
  assert.deepEqual(restored.data, data);
  restored.data.first = 'Changed';
  assert.equal(data.first, 'Test couple');
});

test('rejects Garden, future versions, unsafe photos and malformed fixed layouts', () => {
  for (const mutate of [
    (d: any) => { d.collection = 'garden'; },
    (d: any) => { d.version = 2; },
    (d: any) => { d.media[0].src = 'javascript:alert(1)'; },
    (d: any) => { d.media[0].src = 'data:image/svg+xml,<svg/>'; },
    (d: any) => { d.media[0].id = 'unknown'; },
    (d: any) => { d.events.pop(); },
    (d: any) => { d.date = '2028-02-31'; },
    (d: any) => { d.events[1].date = '2028-11-19'; },
    (d: any) => { d.events[0].time = '27:00'; },
    (d: any) => { d.colors.accent = 'red;display:none'; },
    (d: any) => { d.media[0].focal = '101% 20%'; },
    (d: any) => { delete d.text['hero.note'].af; },
  ]) {
    const data = structuredClone(defaultMidnight); mutate(data);
    assert.throws(() => validateMidnight(data));
  }
  assert.throws(() => parseMidnightBackup('{broken'));
  assert.throws(() => parseMidnightBackup(JSON.stringify({ version: 1, draft: {}, edits: {} })));
  assert.throws(() => serializeMidnightBackup('', defaultMidnight));
  assert.notEqual(MIDNIGHT_DATABASE, 'ewig-garden-studio');
  assert.equal(midnightPackage.price, 5600);
  assert.equal(midnightPackage.plannedPartnerPrice, 3600);
  assert.equal(midnightPackage.partnerEligibilityActive, false);
});

test('edits and restore are reversible, redo branches are cleared, Garden state stays compatible', () => {
  const original = structuredClone(defaultMidnight);
  let h: History<typeof original> = { state: original, past: [], future: [] };
  h = historyReducer(h, { type: 'change', value: { ...h.state, first: 'Edited' } });
  h = historyReducer(h, { type: 'undo' }); assert.deepEqual(h.state, original);
  h = historyReducer(h, { type: 'redo' }); assert.equal(h.state.first, 'Edited');
  h = historyReducer(h, { type: 'change', value: parseMidnightBackup(serializeMidnightBackup('Original', original)).data });
  h = historyReducer(h, { type: 'undo' }); assert.equal(h.state.first, 'Edited');
  h = historyReducer(h, { type: 'change', value: current => ({ ...current, second: 'New branch' }) });
  assert.equal(h.future.length, 0);
  for (let i = 0; i < 100; i++) h = historyReducer(h, { type: 'change', value: { ...h.state, first: String(i) } });
  assert.equal(h.past.length, 60);
  const garden = { draft: { first: 'Clara' }, edits: { 'en:garden.story': 'Original' } };
  let gh: History<typeof garden> = { state: garden, past: [], future: [] };
  gh = historyReducer(gh, { type: 'change', value: { ...garden, edits: { 'en:garden.story': 'Edited' } } });
  gh = historyReducer(gh, { type: 'undo' }); assert.deepEqual(gh.state, garden);
});

test('two-event replies, household isolation, changed responses and meal totals agree', () => {
  const guests = midnightGuests();
  const events = ['welcome', 'wedding']; const meals = ['beef','fish','vegan'];
  const household = guests[0].householdId;
  assert.throws(() => commitHouseholdReplies(guests, household, guests.slice(0,2), events, meals, 'test'));
  const first = { ...updateEventResponse(updateEventResponse(guests[0], 'welcome', 'accepted'), 'wedding', 'accepted'), meal: 'vegan' };
  const second = updateEventResponse(updateEventResponse(guests[1], 'welcome', 'accepted'), 'wedding', 'declined');
  const result = commitHouseholdReplies(guests, household, [first, second], events, meals, '2028-09-01');
  assert.deepEqual(summarizeEvent(result, 'welcome'), { accepted: 2, declined: 0, pending: 4 });
  assert.deepEqual(summarizeEvent(result, 'wedding'), { accepted: 1, declined: 1, pending: 4 });
  assert.equal(mealCount(result, 'vegan'), 1);
  assert.deepEqual(result.slice(2), guests.slice(2));
  assert.equal(result[0].respondedOn, '2028-09-01');
  assert.equal(guests[0].attendance, 'pending');
  const declined = updateEventResponse(first, 'wedding', 'declined');
  assert.equal(declined.meal, null);
  const changed = commitHouseholdReplies(result, household, [declined, second], events, meals, '2028-09-02');
  assert.equal(mealCount(changed, 'vegan'), 0);
  assert.equal(summarizeEvent(changed, 'welcome').accepted, 2);
  assert.throws(() => commitHouseholdReplies(guests, household, [first, guests[2]], events, meals, 'test'));
  assert.throws(() => commitHouseholdReplies(guests, household, [first, first], events, meals, 'test'));
  assert.throws(() => commitHouseholdReplies(guests, household, [{ ...first, meal: 'invalid' }, second], events, meals, 'test'));
});

test('Garden totals remain unchanged and shared dashboard renders both collection modes', () => {
  const guests = gardenFixture.guests as Parameters<typeof summarizeGuests>[0];
  assert.deepEqual(summarizeGuests(guests), { invited: 8, accepted: 5, declined: 1, pending: 2, dietary: 3, allergies: 1 });
  const markup = renderToStaticMarkup(<CoupleDashboard guests={guests} onChange={() => {}} onReset={() => {}} names="Clara & Ruben" af={false}/>);
  assert.match(markup, /Clara &amp; Ruben/); assert.equal(markup.includes('cd-event-summaries'), false);
  const midnight = renderToStaticMarkup(<CoupleDashboard guests={midnightGuests()} onChange={() => {}} onReset={() => {}} names="Mila & Luca" af events={defaultMidnight.events.map(e => ({ id:e.id, label:e.name.af }))} meals={defaultMidnight.meals.map(m => ({id:m.id,label:m.name.af}))}/>);
  assert.match(midnight, /Die verwelkomingsaand/); assert.match(midnight, /Trouetes/);
});

test('collection pages and Afrikaans RSVP render without server services', () => {
  const midnight = renderToStaticMarkup(<MemoryRouter><MidnightCollection/></MemoryRouter>);
  for (const text of ['Mila Jacobs', 'Luca Daniels', 'Maison Nocturne', 'CHAPTER', 'FICTIONAL DESIGN CONCEPT', 'R5', 'two consolidated revision rounds']) assert.ok(midnight.includes(text), text);
  const garden = renderToStaticMarkup(<MemoryRouter><GardenCollection/></MemoryRouter>);
  assert.match(garden, /Clara/); assert.match(garden, /Ruben/);
  const af = renderToStaticMarkup(<MidnightRSVP data={defaultMidnight} language="af" guests={midnightGuests()} onChange={() => {}} onDashboard={() => {}}/>);
  assert.match(af, /Stoor voorbeeldantwoord/); assert.match(af, /Die verwelkomingsaand/); assert.match(af, /Die troue/);
});
