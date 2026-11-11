import { createNamedDraftStore } from '../shared/draftStorage';
import { matchesTemplate, isFocal, isHexColour, isSafeImageSource, isTime } from '../shared/validateTemplate';
import { validDate } from '../shared/dates';
import { defaultIvory, monogramStyles, IVORY_VERSION, type IvoryData } from './content';

// Isolated from Garden ('ewig-garden-studio') and Midnight ('ewig-midnight-studio-v1').
export const IVORY_DATABASE = 'ewig-ivory-studio-v1';
const ASSET_PREFIX = 'ivory-asset:';

function restoreBundledPhotos(value: unknown) {
  if (!value || typeof value !== 'object' || !('media' in value) || !Array.isArray(value.media)) return;
  for (const media of value.media) {
    if (media && typeof media === 'object' && typeof media.src === 'string' && media.src.startsWith(ASSET_PREFIX)) {
      const original = defaultIvory.media.find(m => media.src === `${ASSET_PREFIX}${m.id}` && media.id === m.id);
      if (!original) throw new Error('Unknown bundled photograph');
      media.src = original.src;
    }
  }
}

const rule = (key: string, input: unknown, template: unknown): boolean | undefined => {
  if (typeof template === 'string') {
    if (key === 'id' || key === 'eventId' || key === 'collection') return input === template;
    if (key === 'date' || key === 'deadline') return typeof input === 'string' && validDate(input);
    if (key === 'time') return isTime(input);
    if (['paper', 'stone', 'ink', 'accent'].includes(key)) return isHexColour(input);
    if (key === 'focal') return isFocal(input);
    if (key === 'src') return isSafeImageSource(input);
    if (key === 'style') return (monogramStyles as readonly string[]).includes(input as string);
    if (key === 'left' || key === 'right') return typeof input === 'string' && input.trim().length > 0 && [...input].length <= 3;
    if (['first', 'second', 'venue', 'name'].includes(key) && typeof input === 'string' && !input.trim()) return false;
    if (typeof input === 'string' && input.length > (['first', 'second', 'firstSurname', 'secondSurname', 'venue', 'region', 'location', 'name'].includes(key) ? 120 : 4000)) return false;
  }
  if (key === 'capacity') return Number.isInteger(input) && (input as number) >= 1 && (input as number) <= 20;
  return undefined;
};

/** Validates (and clones) Ivory data. Throws for other collections, future versions or broken layouts. */
export function validateIvory(value: unknown): IvoryData {
  const copy = structuredClone(value);
  if (copy && typeof copy === 'object' && (copy as { version?: unknown }).version !== IVORY_VERSION) throw new Error('Unsupported Ivory version');
  restoreBundledPhotos(copy);
  if (!matchesTemplate(defaultIvory, copy, rule)) throw new Error('Unsupported Ivory v1 data');
  const data = copy as IvoryData;
  const day = (id: string) => data.events.find(e => e.id === id)!.date;
  if (day('wedding') !== data.date) throw new Error('Wedding dates disagree');
  if (!(day('welcome') <= data.date && data.date <= day('brunch'))) throw new Error('Weekend events are out of order');
  if (data.deadline > data.date) throw new Error('RSVP deadline falls after the wedding');
  return data;
}

/** Moves every event by the same number of days when the wedding date changes. */
export function shiftWeekend(data: IvoryData, date: string): IvoryData {
  if (!validDate(date) || !validDate(data.date)) return { ...data, date };
  const delta = (Date.parse(`${date}T12:00:00Z`) - Date.parse(`${data.date}T12:00:00Z`)) / 864e5;
  const move = (d: string) => new Date(Date.parse(`${d}T12:00:00Z`) + delta * 864e5).toISOString().slice(0, 10);
  return { ...data, date, deadline: move(data.deadline), events: data.events.map(e => ({ ...e, date: move(e.date) })) };
}

function portable(data: IvoryData): IvoryData {
  const result = validateIvory(data);
  result.media = result.media.map(m => ({ ...m, src: defaultIvory.media.some(d => d.id === m.id && d.src === m.src) ? `${ASSET_PREFIX}${m.id}` : m.src }));
  return result;
}

export type SavedIvory = { name: string; data: IvoryData };
const drafts = createNamedDraftStore<IvoryData>(IVORY_DATABASE);
const validName = (name: string) => !!name.trim() && name.length <= 120;

export async function listIvoryDrafts(): Promise<SavedIvory[]> {
  const rows = await drafts.list();
  return rows.flatMap(row => { try { return [{ name: row.name, data: validateIvory(row.state) }]; } catch { return []; } });
}
export async function saveIvoryDraft(name: string, data: IvoryData) {
  if (!validName(name)) throw new Error('Invalid draft name');
  return drafts.save(name.trim(), portable(data));
}
export function serializeIvoryBackup(name: string, data: IvoryData) {
  if (!validName(name)) throw new Error('Invalid draft name');
  return JSON.stringify({ collection: 'ivory', version: IVORY_VERSION, name: name.trim(), data: portable(data) }, null, 2);
}
export function parseIvoryBackup(text: string): SavedIvory {
  if (text.length > 80 * 1024 * 1024) throw new Error('Backup too large');
  const backup = JSON.parse(text);
  if (!backup || backup.collection !== 'ivory' || backup.version !== IVORY_VERSION || typeof backup.name !== 'string' || !validName(backup.name)) throw new Error('Not an Ivory v1 backup');
  return { name: backup.name.trim(), data: validateIvory(backup.data) };
}
