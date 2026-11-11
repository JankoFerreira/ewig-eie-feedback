import type { ReactNode } from 'react';
import type { Language, MidnightData } from './content';
import type { useMidnightStudio } from './MidnightEditor';
import { Bilingual, Ed as SharedEd, EditorShell, PhotoFields, targetKey, type CardContent } from '../shared/editor/EditorKit';

/** Midnight's targets for the shared on-page editor (same system as Garden and Ivory). */
export type MidTarget =
  | { kind: 'copy'; id: string; label?: string }
  | { kind: 'field'; field: 'first' | 'second' | 'venue' | 'region'; label?: string }
  | { kind: 'date'; field: 'date' | 'deadline'; label?: string }
  | { kind: 'event'; id: string; field: 'name' | 'description' | 'location' | 'when'; label?: string }
  | { kind: 'schedule'; id: string; label?: string }
  | { kind: 'photo'; id: string; label?: string };

export function Ed({ target, children, block }: { target: MidTarget; children: ReactNode; block?: boolean }) { return <SharedEd target={target} block={block}>{children}</SharedEd>; }

type Studio = ReturnType<typeof useMidnightStudio>;
export function MidnightInlineProvider({ studio, active, language, children, onDetails, onDone }: { studio: Studio; active: boolean; language: Language; children: ReactNode; onDetails: () => void; onDone: () => void }) {
  return <EditorShell<MidTarget> active={active} language={language} design="The Midnight" canUndo={studio.canUndo} canRedo={studio.canRedo} onUndo={studio.undo} onRedo={studio.redo} onDetails={onDetails} onDone={onDone}
    renderCard={(target, setNote) => midnightCard(target, studio, language, setNote)}>{children}</EditorShell>;
}

function midnightCard(target: MidTarget, studio: Studio, language: Language, setNote: (n: string) => void): CardContent {
  const data = studio.state;
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const set = (fn: (d: MidnightData) => MidnightData, suffix: string) => studio.change(fn, `${targetKey(target)}:${suffix}`);
  if (target.kind === 'copy') return { title: t('Wording', 'Bewoording'), body: <Bilingual label={t('Text', 'Teks')} value={data.text[target.id]} onChange={v => set(d => ({ ...d, text: { ...d.text, [target.id]: v } }), 'copy')}/> };
  if (target.kind === 'field') {
    const f = target.field;
    const labels = { first: t('First name', 'Eerste naam'), second: t('Second name', 'Tweede naam'), venue: t('Venue', 'Venue'), region: t('Region', 'Streek') };
    return { title: labels[f], body: <label className="ee-field">{labels[f]}<input maxLength={120} value={data[f]} onChange={e => { const v = e.target.value; set(d => f === 'venue' ? { ...d, venue: v, events: d.events.map(ev => ({ ...ev, location: d.venue ? ev.location.split(d.venue).join(v) : ev.location })) } : { ...d, [f]: v }, 'v'); }}/></label> };
  }
  if (target.kind === 'date') {
    const title = target.field === 'date' ? t('Wedding date', 'Troudatum') : t('Reply deadline', 'Antwoordsperdatum');
    return { title, body: <label className="ee-field">{title}<input type="date" value={data[target.field]} onChange={e => { const v = e.target.value; set(d => target.field === 'date' ? { ...d, date: v, events: d.events.map(ev => ev.id === 'wedding' ? { ...ev, date: v } : ev) } : { ...d, deadline: v }, 'v'); }}/></label> };
  }
  if (target.kind === 'event') {
    const ev = data.events.find(e => e.id === target.id)!;
    const patch = (p: Partial<typeof ev>, suffix: string) => set(d => ({ ...d, events: d.events.map(e => e.id === ev.id ? { ...e, ...p } : e), ...(ev.id === 'wedding' && p.date ? { date: p.date } : {}) }), suffix);
    const f = target.field;
    const body = f === 'name' || f === 'description' ? <Bilingual label={f === 'name' ? t('Name', 'Naam') : t('Description', 'Beskrywing')} value={ev[f]} onChange={v => patch({ [f]: v }, f)}/>
      : f === 'location' ? <label className="ee-field">{t('Location', 'Ligging')}<input maxLength={120} value={ev.location} onChange={e => patch({ location: e.target.value }, 'location')}/></label>
      : <div className="ee-grid2"><label className="ee-field">{t('Date', 'Datum')}<input type="date" value={ev.date} onChange={e => patch({ date: e.target.value }, 'date')}/></label><label className="ee-field">{t('Start time', 'Begintyd')}<input type="time" value={ev.time} onChange={e => patch({ time: e.target.value }, 'time')}/></label></div>;
    return { title: ev.name[language], body };
  }
  if (target.kind === 'schedule') {
    const item = data.schedule.find(s => s.id === target.id)!;
    const patch = (p: Partial<typeof item>, suffix: string) => set(d => ({ ...d, schedule: d.schedule.map(s => s.id === item.id ? { ...s, ...p } : s) }), suffix);
    return { title: t('Schedule moment', 'Programoomblik'), body: <><label className="ee-field">{t('Time', 'Tyd')}<input type="time" value={item.time} onChange={e => patch({ time: e.target.value }, 'time')}/></label><Bilingual label={t('Moment', 'Oomblik')} value={item.name} onChange={v => patch({ name: v }, 'name')} rows={1}/></> };
  }
  const m = data.media.find(x => x.id === target.id)!;
  const patch = (p: Partial<typeof m>, suffix: string) => set(d => ({ ...d, media: d.media.map(x => x.id === m.id ? { ...x, ...p } : x) }), suffix);
  return { title: t('Photograph', 'Foto'), body: <PhotoFields language={language} src={m.src} focal={m.focal} caption={m.caption} alt={m.alt} setNote={setNote}
    onReplace={src => studio.change(d => ({ ...d, media: d.media.map(x => x.id === m.id ? { ...x, src } : x) }))} onFocal={focal => patch({ focal }, 'focal')} onCaption={v => patch({ caption: v }, 'caption')} onAlt={v => patch({ alt: v }, 'alt')}/> };
}
