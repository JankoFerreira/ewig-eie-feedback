import { createNamedDraftStore } from '../shared/draftStorage';
import { defaultMidnight, type MidnightData } from './content';
import { validDate } from '../garden/content';
export const MIDNIGHT_DATABASE = 'ewig-midnight-studio-v1';
export function validateMidnight(value: unknown): MidnightData {
  value = structuredClone(value);
  if (value && typeof value === 'object' && 'media' in value && Array.isArray(value.media)) {
    for (const media of value.media) {
      if (media && typeof media === 'object' && typeof media.src === 'string' && media.src.startsWith('midnight-asset:')) {
        const original = defaultMidnight.media.find(m => media.src === `midnight-asset:${m.id}` && media.id === m.id);
        if (!original) throw new Error('Unknown bundled photograph');
        media.src = original.src;
      }
    }
  }
  const valid = (template: unknown, input: unknown, key = ''): boolean => {
    if (typeof template === 'string') {
      if (typeof input !== 'string' || input.length > (key === 'src' ? 12 * 1024 * 1024 : 4000)) return false;
      if (key === 'id' || key === 'collection') return input === template;
      if (key === 'date' || key === 'deadline') return validDate(input);
      if (key === 'time') return /^([01]\d|2[0-3]):[0-5]\d$/.test(input);
      if (['background', 'text', 'accent'].includes(key)) return /^#[0-9a-f]{6}$/i.test(input);
      if (key === 'focal') return /^\d{1,3}% \d{1,3}%$/.test(input) && input.split(' ').every(n => parseInt(n) <= 100);
      if (key === 'src') return /^(data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=\s]+|https:\/\/[^\s]+|\/?[^:]*\.(webp|png|jpg|jpeg))$/i.test(input);
      return true;
    }
    if (typeof template === 'number') return input === template;
    if (Array.isArray(template)) return Array.isArray(input) && input.length === template.length && template.every((v, i) => valid(v, input[i]));
    if (template && typeof template === 'object') return !!input && typeof input === 'object' && !Array.isArray(input) && Object.keys(input).length === Object.keys(template).length && Object.entries(template).every(([k, v]) => Object.hasOwn(input, k) && valid(v, (input as Record<string, unknown>)[k], k));
    return false;
  };
  if (!valid(defaultMidnight, value)) throw new Error('Unsupported Midnight v1 data');
  const data = structuredClone(value) as MidnightData;
  if (data.events.find(e => e.id === 'wedding')?.date !== data.date) throw new Error('Wedding dates disagree');
  return data;
}
export type SavedMidnight = { name: string; data: MidnightData };
const drafts = createNamedDraftStore<MidnightData>(MIDNIGHT_DATABASE);
function portableData(data: MidnightData): MidnightData {
  const result = validateMidnight(data);
  result.media = result.media.map(media => ({ ...media, src: defaultMidnight.media.some(m => m.id === media.id && m.src === media.src) ? `midnight-asset:${media.id}` : media.src }));
  return result;
}
export async function listMidnightDrafts(): Promise<SavedMidnight[]> {
  return (await drafts.list()).map(row => ({ name: row.name, data: row.state ?? (row as unknown as SavedMidnight).data }));
}
export async function saveMidnightDraft(name: string, data: MidnightData) {
  if (!name.trim() || name.length > 200) throw new Error('Invalid draft name');
  return drafts.save(name.trim(), portableData(data));
}
export function serializeMidnightBackup(name: string, data: MidnightData) {
  if (!name.trim() || name.length > 200) throw new Error('Invalid draft name');
  return JSON.stringify({ name: name.trim(), data: portableData(data) }, null, 2);
}
export function parseMidnightBackup(text: string): SavedMidnight {
  if (text.length > 60 * 1024 * 1024) throw new Error('Backup too large');
  const backup = JSON.parse(text);
  if (!backup || typeof backup.name !== 'string' || !backup.name.trim() || backup.name.length > 200) throw new Error('Invalid draft name');
  return { name: backup.name, data: validateMidnight(backup.data) };
}
