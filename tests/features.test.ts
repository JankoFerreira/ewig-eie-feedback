import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emptyRoster, liveSchedule, markDone, nowNext, shiftFrom, validRoster, minutesFor, type Slot } from '../src/features/today/model';
import { createMockPhotoService, CameraLimitError, SHOTS_PER_GUEST, MAX_CAMERA_GUESTS } from '../src/features/camera/service';
import { historyReducer, type History } from '../src/collections/shared/useHistory';
import { publicFeatures } from '../src/config';

const slots: Slot[] = [
  { id: 'welcome', date: '2029-03-09', time: '18:30', title: 'Welcome' },
  { id: 'arrive', date: '2029-03-10', time: '15:00', title: 'Arrive' },
  { id: 'vows', date: '2029-03-10', time: '15:30', title: 'Ceremony' },
  { id: 'dinner', date: '2029-03-10', time: '18:30', title: 'Dinner' },
  { id: 'brunch', date: '2029-03-11', time: '10:30', title: 'Brunch' },
];

test('a late ceremony moves it and everything after it that day, nothing before or on other days', () => {
  const r = shiftFrom(slots, emptyRoster(), 'vows', 5, 'T');
  const live = liveSchedule(slots, r);
  const at = (id: string) => live.find(s => s.id === id)!;
  assert.equal(at('arrive').time, '15:00'); assert.equal(at('vows').time, '15:35'); assert.equal(at('dinner').time, '18:35');
  assert.equal(at('welcome').time, '18:30'); assert.equal(at('brunch').time, '10:30');
  assert.equal(at('vows').planned, '15:30');
  const twice = shiftFrom(slots, shiftFrom(slots, r, 'dinner', 15), 'vows', -5);
  assert.equal(liveSchedule(slots, twice).find(s => s.id === 'dinner')!.time, '18:45');
  assert.equal(r.updatedAt, 'T');
  assert.deepEqual(shiftFrom(slots, r, 'missing', 5), r);
});

test('now / next follows live times; roster validation rejects junk', () => {
  const live = liveSchedule(slots, shiftFrom(slots, emptyRoster(), 'vows', 10));
  const n = nowNext(live, minutesFor('2029-03-10', '15:35'));
  assert.equal(n.current?.id, 'arrive'); assert.equal(n.next?.id, 'vows'); assert.equal(n.minutesToNext, 5);
  assert.equal(nowNext(live, minutesFor('2029-03-01', '08:00')).current, null);
  assert.ok(validRoster(markDone(emptyRoster(), 'vows', true)));
  for (const bad of [null, {}, { version: 2, delays: {}, done: {} }, { version: 1, delays: { a: 'x' }, done: {} }, { version: 1, delays: { a: 9999 }, done: {} }]) assert.equal(validRoster(bad), false);
});

const blob = (size = 2000) => new Blob([new Uint8Array(size)], { type: 'image/webp' });
const shot = (guestId: string) => ({ guestId, guestName: guestId, blob: blob(), width: 10, height: 10, format: 'webp' as const });

test('disposable camera: 20 shots per guest, removed photos still count, couple adds without limits', async () => {
  const s = createMockPhotoService('w');
  for (let i = 0; i < SHOTS_PER_GUEST; i++) await s.upload(shot('g1'));
  await assert.rejects(s.upload(shot('g1')), (e: unknown) => e instanceof CameraLimitError && e.code === 'roll-finished');
  s.setRemoved(s.list()[0].id, true);
  assert.equal(s.allowance('g1').remaining, 0, 'removing a photo does not give the shot back');
  assert.equal(s.list().length, 19); assert.equal(s.list({ includeRemoved: true }).length, 20);
  s.setRemoved(s.list({ includeRemoved: true }).find(p => p.removed)!.id, false); assert.equal(s.list().length, 20);
  for (let i = 0; i < 30; i++) await s.addCouplePhoto({ blob: blob(), width: 1, height: 1, format: 'webp' });
  assert.equal(s.list().length, 50); assert.equal(s.allowance('g2').remaining, 20);
  await assert.rejects(s.upload({ ...shot('g3'), blob: blob(7 * 1024 * 1024) }), (e: unknown) => e instanceof CameraLimitError && e.code === 'too-large');
});

test('disposable camera: at most 60 guests (1,200 photos); existing guests keep shooting', async () => {
  const s = createMockPhotoService('w2');
  for (let g = 0; g < MAX_CAMERA_GUESTS; g++) await s.upload(shot(`g${g}`));
  await assert.rejects(s.upload(shot('late-guest')), (e: unknown) => e instanceof CameraLimitError && e.code === 'guest-limit');
  assert.equal(s.allowance('late-guest').guestLimitReached, true);
  await s.upload(shot('g0')); assert.equal(s.allowance('g0').remaining, 18);
  assert.equal(MAX_CAMERA_GUESTS * SHOTS_PER_GUEST, 1200);
});

test('editor typing coalesces into one undo step per field; other fields start a new step', () => {
  let h: History<string> = { state: 'a', past: [], future: [] };
  for (const v of ['ab', 'abc', 'abcd']) h = historyReducer(h, { type: 'change', value: v, group: 'copy:title' });
  assert.equal(h.past.length, 1);
  h = historyReducer(h, { type: 'change', value: 'x', group: 'copy:body' }); assert.equal(h.past.length, 2);
  h = historyReducer(h, { type: 'undo' }); assert.equal(h.state, 'abcd');
  h = historyReducer(h, { type: 'undo' }); assert.equal(h.state, 'a');
  h = historyReducer(h, { type: 'change', value: 'n' }); h = historyReducer(h, { type: 'change', value: 'nn' }); assert.equal(h.past.length, 2, 'ungrouped changes stay separate');
});

test('hidden for now: printed stationery, photographers, Ivory stationery', () => {
  assert.deepEqual(publicFeatures, { printedStationery: false, photographers: false, ivoryStationery: false });
});
