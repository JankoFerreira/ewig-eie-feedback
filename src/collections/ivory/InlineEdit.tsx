import type { ReactNode } from 'react';
import type { IvoryData, Language } from './content';
import { shiftWeekend } from './storage';
import type { useIvoryStudio } from './IvoryEditor';
import { Bilingual, Ed as SharedEd, EditorShell, PhotoFields, targetKey, type CardContent } from '../shared/editor/EditorKit';
export { readPhoto } from '../shared/editor/EditorKit';

/** Ivory's targets for the shared on-page editor (same system as Garden and Midnight). */
export type EditTarget =
  | { kind: 'copy'; id: string; label?: string }
  | { kind: 'field'; field: 'first' | 'second' | 'firstSurname' | 'secondSurname' | 'venue' | 'region'; label?: string }
  | { kind: 'date'; field: 'date' | 'deadline'; label?: string }
  | { kind: 'event'; id: string; field: 'name' | 'description' | 'dress' | 'location' | 'time' | 'date'; label?: string }
  | { kind: 'moment'; id: string; label?: string }
  | { kind: 'photo'; id: string; label?: string }
  | { kind: 'meal'; id: string; label?: string };

export function Ed({ target, children, block }: { target: EditTarget; children: ReactNode; block?: boolean }) { return <SharedEd target={target} block={block}>{children}</SharedEd>; }
export { useEditing } from '../shared/editor/EditorKit';

type Studio = ReturnType<typeof useIvoryStudio>;
type ProviderProps = { studio: Studio; active: boolean; language: Language; children: ReactNode; onStyle: () => void; onDone: () => void };
export function InlineEditProvider({ studio, active, language, children, onStyle, onDone }: ProviderProps) {
  return <EditorShell<EditTarget> active={active} language={language} design="The Ivory" canUndo={studio.canUndo} canRedo={studio.canRedo} onUndo={studio.undo} onRedo={studio.redo} onDetails={onStyle} onDone={onDone}
    renderCard={(target, setNote) => ivoryCard(target, studio, language, setNote)}>{children}</EditorShell>;
}

function ivoryCard(target: EditTarget, studio: Studio, language: Language, setNote: (n: string) => void): CardContent {
  const data = studio.state;
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const set = (fn: (d: IvoryData) => IvoryData, suffix: string) => studio.change(fn, `${targetKey(target)}:${suffix}`);
  if (target.kind === 'copy') return { title: t('Wording', 'Bewoording'), body: <Bilingual label={t('Text', 'Teks')} value={data.text[target.id]} onChange={v => set(d => ({ ...d, text: { ...d.text, [target.id]: v } }), 'copy')}/> };
  if (target.kind === 'field') {
    const labels = { first: t('First name', 'Eerste naam'), second: t('Second name', 'Tweede naam'), firstSurname: t('Surname', 'Van'), secondSurname: t('Surname', 'Van'), venue: t('Venue', 'Venue'), region: t('Region', 'Streek') };
    const f = target.field;
    const value = f === 'venue' || f === 'region' ? data[f] : data.couple[f];
    return { title: labels[f], body: <><label className="ee-field">{labels[f]}<input maxLength={120} value={value} onChange={e => { const v = e.target.value; set(d => f === 'venue' ? { ...d, venue: v, events: d.events.map(ev => ({ ...ev, location: d.venue ? ev.location.split(d.venue).join(v) : ev.location })) } : f === 'region' ? { ...d, region: v } : { ...d, couple: { ...d.couple, [f]: v } }, 'v'); }}/></label>
      {(f === 'first' || f === 'second') && <p className="ee-small">{t('The monogram letters are changed under “Details & saving”.', 'Die monogramletters word onder “Besonderhede en stoor” verander.')}</p>}</> };
  }
  if (target.kind === 'date') {
    const title = target.field === 'date' ? t('Wedding date', 'Troudatum') : t('Reply deadline', 'Antwoordsperdatum');
    return { title, body: <><label className="ee-field">{title}<input type="date" value={data[target.field]} onChange={e => { const v = e.target.value; set(d => target.field === 'date' ? shiftWeekend(d, v) : { ...d, deadline: v }, 'v'); }}/></label>
      {target.field === 'date' && <p className="ee-small">{t('The whole weekend and the reply deadline move with it.', 'Die hele naweek en die antwoordsperdatum skuif saam.')}</p>}</> };
  }
  if (target.kind === 'event') {
    const ev = data.events.find(e => e.id === target.id)!;
    const patch = (p: Partial<typeof ev>, suffix: string) => set(d => ({ ...d, events: d.events.map(e => e.id === ev.id ? { ...e, ...p } : e) }), suffix);
    const f = target.field;
    let body: ReactNode;
    if (f === 'name' || f === 'description' || f === 'dress') body = <Bilingual label={{ name: t('Name', 'Naam'), description: t('Description', 'Beskrywing'), dress: t('Dress', 'Drag') }[f]} value={ev[f]} onChange={v => patch({ [f]: v }, f)}/>;
    else if (f === 'location') body = <label className="ee-field">{t('Location', 'Ligging')}<input maxLength={120} value={ev.location} onChange={e => patch({ location: e.target.value }, 'location')}/></label>;
    else body = <div className="ee-grid2">
      <label className="ee-field">{t('Date', 'Datum')}<input type="date" value={ev.date} onChange={e => { const v = e.target.value; if (ev.id === 'wedding') set(d => shiftWeekend(d, v), 'date'); else patch({ date: v }, 'date'); }}/></label>
      <label className="ee-field">{t('Start time', 'Begintyd')}<input type="time" value={ev.time} onChange={e => patch({ time: e.target.value }, 'time')}/></label>
    </div>;
    return { title: ev.name[language], body };
  }
  if (target.kind === 'moment') {
    const m = data.itinerary.find(i => i.id === target.id)!;
    const patch = (p: Partial<typeof m>, suffix: string) => set(d => ({ ...d, itinerary: d.itinerary.map(i => i.id === m.id ? { ...i, ...p } : i) }), suffix);
    return { title: t('Schedule moment', 'Programoomblik'), body: <><label className="ee-field">{t('Time', 'Tyd')}<input type="time" value={m.time} onChange={e => patch({ time: e.target.value }, 'time')}/></label>
      <Bilingual label={t('Moment', 'Oomblik')} value={m.name} onChange={v => patch({ name: v }, 'name')} rows={1}/>
      <Bilingual label={t('Small note', 'Klein nota')} value={m.note} onChange={v => patch({ note: v }, 'note')} rows={1}/>
      <label className="ee-check"><input type="checkbox" checked={!m.hidden} onChange={e => patch({ hidden: !e.target.checked }, 'hidden')}/>{t('Show on the website', 'Wys op die webwerf')}</label></> };
  }
  if (target.kind === 'meal') {
    const meal = data.meals.find(m => m.id === target.id)!;
    return { title: t('Dinner option', 'Aandete-keuse'), body: <Bilingual label={t('Dish', 'Gereg')} value={meal.name} onChange={v => set(d => ({ ...d, meals: d.meals.map(x => x.id === meal.id ? { ...x, name: v } : x) }), 'name')} rows={1}/> };
  }
  const m = data.media.find(x => x.id === target.id)!;
  const patch = (p: Partial<typeof m>, suffix: string) => set(d => ({ ...d, media: d.media.map(x => x.id === m.id ? { ...x, ...p } : x) }), suffix);
  const fg = m.id === 'heroForeground';
  return { title: fg ? t('Cover foreground (transparent PNG/WebP)', 'Voorbladvoorgrond (deursigtige PNG/WebP)') : t('Photograph', 'Foto'),
    body: <PhotoFields language={language} src={m.src} focal={m.focal} caption={fg ? undefined : m.caption} alt={fg ? undefined : m.alt} setNote={setNote}
      onReplace={src => studio.change(d => ({ ...d, media: d.media.map(x => x.id === m.id ? { ...x, src, placeholder: false } : x) }))}
      onFocal={focal => patch({ focal }, 'focal')} onCaption={v => patch({ caption: v }, 'caption')} onAlt={v => patch({ alt: v }, 'alt')}/> };
}
