import english from '../../../concepts/garden/CONTENT.en.md?raw';
import afrikaans from '../../../concepts/garden/CONTENT.af.md?raw';
import manifest from '../../../concepts/garden/assets.json';
import hero from '../../assets/garden/garden-hero.webp';
import portrait from '../../assets/garden/garden-couple-reference.webp';
import table from '../../assets/garden/garden-candid-table.webp';
import venue from '../../assets/garden/garden-venue.webp';
import botanical from '../../assets/garden/garden-botanical-detail.webp';

export const gardenImages = { hero, portrait, table, venue, botanical };
export const gardenManifest = manifest;
export type GardenLanguage = 'en' | 'af';

function section(raw: string, name: string) {
  return raw.split(`## ${name}\n`)[1]?.split('\n## ')[0]?.trim() ?? '';
}
function paragraphs(text: string) { return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean); }
function heading(text: string) { return text.match(/^### (.+)$/m)?.[1] ?? ''; }
function story(text: string) {
  const parts = text.split(/^### /m).slice(1);
  return { title: parts[0].split('\n')[0], paragraphs: paragraphs(parts[0].split('\n').slice(1).join('\n')), milestones: parts[1]?.split('\n').slice(1).filter(Boolean) ?? [] };
}
function buildCopy(raw: string, af: boolean) {
  const welcome = section(raw, af ? 'Welkom' : 'Welcome');
  const day = paragraphs(section(raw, af ? 'Die dag' : 'The day'));
  const questions = section(raw, af ? 'Vrae' : 'Questions').split(/^### /m).slice(1).map(item => ({ question: item.split('\n')[0], answer: item.split('\n').slice(1).join('\n').trim() }));
  return {
    headline: heading(welcome), welcome: paragraphs(welcome.split(/^### .+$/m)[1] ?? '')[0],
    story: story(section(raw, af ? 'Ons storie' : 'Our story')),
    schedule: day.slice(1).join('\n').split('\n').filter(Boolean).map(line => ({ time: line.slice(0,5), description: line.slice(8) })),
    venue: paragraphs(section(raw, af ? 'Die venue' : 'The venue').replace(/^### .+\n/m,'')).slice(1,3),
    dress: paragraphs(section(raw, af ? 'Wat om aan te trek' : 'What to wear').replace(/^### .+\n/m,'')).join(' '),
    stay: paragraphs(section(raw, af ? 'Reis en verblyf' : 'Travel & your stay')),
    gifts: section(raw, af ? 'Geskenke' : 'Gifts'), questions,
    note: paragraphs(section(raw, af ? "'n Persoonlike boodskap" : 'A personal note'))[0],
  };
}
export const gardenCopy = { en: buildCopy(english.replace(/\r/g,''),false), af: buildCopy(afrikaans.replace(/\r/g,''),true) };
export const gardenPalettes = {
  sage: { name: { en:'Garden sage',af:'Tuinsalie' }, ink:'#344638',accent:'#A8B5A0',paper:'#F7F3EA',ribbon:'#89917A' },
  rose: { name: { en:'Soft rose',af:'Sagte roos' }, ink:'#583d3c',accent:'#C69C91',paper:'#faf2ec',ribbon:'#b99597' },
  olive: { name: { en:'Deep olive',af:'Diep olyf' }, ink:'#3e442a',accent:'#a4a584',paper:'#f5f1e5',ribbon:'#8e9166' },
};
export type GardenDraft = {
  first: string; second: string; date: string; venue: string;
  palette: keyof typeof gardenPalettes; headlineEn: string; headlineAf: string;
  storyEn: string; storyAf: string;
};
export const defaultGardenDraft: GardenDraft = {
  first:'Clara',second:'Ruben',date:'2027-10-16',venue:'Die Varinghuis',palette:'sage',
  headlineEn:gardenCopy.en.headline,headlineAf:gardenCopy.af.headline,storyEn:'',storyAf:'',
};
import { validDate } from '../shared/dates';
export { validDate };
export function readGardenDraft(): GardenDraft {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem('ewig-garden-draft-v1') ?? 'null');
    if (!saved || typeof saved !== 'object') return { ...defaultGardenDraft };
    const result = { ...defaultGardenDraft };
    for (const key of ['first','second','venue','headlineEn','headlineAf','storyEn','storyAf'] as const) {
      const value = (saved as Record<string,unknown>)[key];
      if (typeof value === 'string') result[key] = value.slice(0,key.startsWith('story') ? 2500 : 120);
    }
    const data = saved as Record<string,unknown>;
    if (typeof data.date === 'string' && validDate(data.date)) result.date = data.date;
    if (typeof data.palette === 'string' && Object.hasOwn(gardenPalettes,data.palette)) result.palette = data.palette as GardenDraft['palette'];
    return result;
  } catch { return { ...defaultGardenDraft }; }
}
