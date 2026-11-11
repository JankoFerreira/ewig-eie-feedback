import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Copy, IvoryData, Language } from './content';
import { shiftWeekend } from './storage';
import type { useIvoryStudio } from './IvoryEditor';

/**
 * Garden-style, on-page editing for Ivory: click any words, time or photo where it appears,
 * change it in a small card and watch the page update. Every target points at a stable content ID.
 */
export type EditTarget =
  | { kind: 'copy'; id: string; label?: string }
  | { kind: 'field'; field: 'first' | 'second' | 'firstSurname' | 'secondSurname' | 'venue' | 'region'; label?: string }
  | { kind: 'date'; field: 'date' | 'deadline'; label?: string }
  | { kind: 'event'; id: string; field: 'name' | 'description' | 'dress' | 'location' | 'time' | 'date'; label?: string }
  | { kind: 'moment'; id: string; label?: string }
  | { kind: 'photo'; id: string; label?: string }
  | { kind: 'meal'; id: string; label?: string };

type Studio = ReturnType<typeof useIvoryStudio>;
type Ctx = { active: boolean; open: (target: EditTarget, anchor: HTMLElement) => void; current: string | null; language: Language };
const EditContext = createContext<Ctx>({ active: false, open: () => {}, current: null, language: 'en' });
export const useEditing = () => useContext(EditContext);
const keyOf = (t: EditTarget) => `${t.kind}:${'id' in t ? t.id : ''}:${'field' in t ? t.field : ''}`;

/** Wraps on-page content. Inert outside edit mode; a focusable, clickable target inside it. */
export function Ed({ target, children, block = false }: { target: EditTarget; children: ReactNode; block?: boolean }) {
  const { active, open, current, language } = useEditing();
  if (!active) return <>{children}</>;
  const empty = children === '' || children === null || children === undefined;
  const label = target.label ?? (target.kind === 'photo' ? (language === 'af' ? 'Verander foto' : 'Change photo') : (language === 'af' ? 'Redigeer' : 'Edit'));
  const Tag = block ? 'div' : 'span';
  return <Tag className={`iv-ed ${current === keyOf(target) ? 'is-current' : ''} ${empty ? 'is-empty' : ''}`} role="button" tabIndex={0} aria-label={target.label ? label : `${label}${typeof children === 'string' && children ? `: ${children.slice(0, 60)}` : ''}`}
    onClick={e => { e.preventDefault(); e.stopPropagation(); open(target, e.currentTarget); }}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); open(target, e.currentTarget); } }}>
    {empty ? <i>{language === 'af' ? '+ Voeg teks by' : '+ Add text'}</i> : children}
  </Tag>;
}

export async function readPhoto(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('type');
  const src = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(file); });
  const ok = await new Promise<boolean>(resolve => { const i = new Image(); i.onload = () => resolve(true); i.onerror = () => resolve(false); i.src = src; });
  if (!ok) throw new Error('unreadable');
  return src;
}

type ProviderProps = { studio: Studio; active: boolean; language: Language; children: ReactNode; onStyle: () => void; onDone: () => void };
export function InlineEditProvider({ studio, active, language, children, onStyle, onDone }: ProviderProps) {
  const [target, setTarget] = useState<{ t: EditTarget; anchor: HTMLElement } | null>(null);
  useEffect(() => { if (!active) setTarget(null); }, [active]);
  const t = (en: string, af: string) => language === 'af' ? af : en;
  return <EditContext.Provider value={{ active, language, current: target ? keyOf(target.t) : null, open: (tt, anchor) => setTarget({ t: tt, anchor }) }}>
    {children}
    {active && <div className="iv-editbar" role="toolbar" aria-label={t('Editing tools', 'Redigeergereedskap')} data-no-translate>
      <p><strong>{t('Editing', 'Redigeer')}</strong> <span>{t('Click any words, time or photo to change it.', 'Klik enige woorde, tyd of foto om dit te verander.')}</span></p>
      <div>
        <button type="button" disabled={!studio.canUndo} onClick={studio.undo}>{t('Undo', 'Ontdoen')}</button>
        <button type="button" disabled={!studio.canRedo} onClick={studio.redo}>{t('Redo', 'Herdoen')}</button>
        <button type="button" onClick={onStyle}>{t('Colours, monogram & saving', 'Kleure, monogram en stoor')}</button>
        <button type="button" className="iv-editbar-done" onClick={onDone}>{t('Done', 'Klaar')}</button>
      </div>
    </div>}
    {active && target && <EditCard key={keyOf(target.t)} target={target.t} anchor={target.anchor} studio={studio} language={language} onClose={() => { const a = target.anchor; setTarget(null); requestAnimationFrame(() => a.isConnected && a.focus()); }}/>}
  </EditContext.Provider>;
}

function EditCard({ target, anchor, studio, language, onClose }: { target: EditTarget; anchor: HTMLElement; studio: Studio; language: Language; onClose: () => void }) {
  const card = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [note, setNote] = useState('');
  const data = studio.state;
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const group = (suffix: string) => `${keyOf(target)}:${suffix}`;
  const set = (fn: (d: IvoryData) => IvoryData, suffix: string) => studio.change(fn, group(suffix));
  useLayoutEffect(() => {
    const place = () => {
      if (window.innerWidth <= 700) { setPos(null); return; }
      const r = anchor.getBoundingClientRect(); const w = 380; const h = card.current?.offsetHeight ?? 300;
      const below = r.bottom + 10 + h < window.innerHeight;
      setPos({ top: Math.max(10, below ? r.bottom + 10 : r.top - h - 10), left: Math.min(window.innerWidth - w - 12, Math.max(12, r.left)) });
    };
    place(); window.addEventListener('resize', place); window.addEventListener('scroll', place, { passive: true });
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place); };
  }, [anchor]);
  useEffect(() => { card.current?.querySelector<HTMLElement>('input:not([type=checkbox]),textarea,select')?.focus(); }, []);

  const bilingual = (label: string, value: Copy, change: (v: Copy) => void, suffix: string, rows = 2) => <fieldset className="iv-card-pair-fields"><legend>{label}</legend>
    {(['en', 'af'] as const).map(l => <label key={l} className="iv-field"><span>{l === 'en' ? 'English' : 'Afrikaans'}</span><textarea rows={Math.max(rows, Math.ceil(value[l].length / 46))} maxLength={4000} value={value[l]} onChange={e => { change({ ...value, [l]: e.target.value }); void suffix; }}/></label>)}
  </fieldset>;
  let title = t('Edit', 'Redigeer'); let body: ReactNode = null;

  if (target.kind === 'copy') {
    title = t('Wording', 'Bewoording');
    body = bilingual(t('Text', 'Teks'), data.text[target.id], v => set(d => ({ ...d, text: { ...d.text, [target.id]: v } }), 'copy'), 'copy', 2);
  } else if (target.kind === 'field') {
    const labels = { first: t('First name', 'Eerste naam'), second: t('Second name', 'Tweede naam'), firstSurname: t('Surname', 'Van'), secondSurname: t('Surname', 'Van'), venue: t('Venue', 'Venue'), region: t('Region', 'Streek') };
    const value = target.field === 'venue' || target.field === 'region' ? data[target.field] : data.couple[target.field];
    title = labels[target.field];
    body = <label className="iv-field">{labels[target.field]}<input maxLength={120} value={value} onChange={e => { const v = e.target.value; set(d => target.field === 'venue' ? { ...d, venue: v, events: d.events.map(ev => ({ ...ev, location: d.venue ? ev.location.split(d.venue).join(v) : ev.location })) } : target.field === 'region' ? { ...d, region: v } : { ...d, couple: { ...d.couple, [target.field]: v } }, 'v'); }}/></label>;
    if (target.field === 'first' || target.field === 'second') body = <>{body}<p className="iv-small">{t('The monogram letters are changed under “Colours, monogram & saving”.', 'Die monogramletters word onder “Kleure, monogram en stoor” verander.')}</p></>;
  } else if (target.kind === 'date') {
    title = target.field === 'date' ? t('Wedding date', 'Troudatum') : t('Reply deadline', 'Antwoordsperdatum');
    body = <><label className="iv-field">{title}<input type="date" value={data[target.field]} onChange={e => { const v = e.target.value; set(d => target.field === 'date' ? shiftWeekend(d, v) : { ...d, deadline: v }, 'v'); }}/></label>
      {target.field === 'date' && <p className="iv-small">{t('The whole weekend and the reply deadline move with it.', 'Die hele naweek en die antwoordsperdatum skuif saam.')}</p>}</>;
  } else if (target.kind === 'event') {
    const ev = data.events.find(e => e.id === target.id)!;
    const patch = (p: Partial<typeof ev>, suffix: string) => set(d => ({ ...d, events: d.events.map(e => e.id === ev.id ? { ...e, ...p } : e) }), suffix);
    title = ev.name[language];
    if (target.field === 'name' || target.field === 'description' || target.field === 'dress') body = bilingual({ name: t('Name', 'Naam'), description: t('Description', 'Beskrywing'), dress: t('Dress', 'Drag') }[target.field], ev[target.field], v => patch({ [target.field]: v }, target.field), target.field);
    else if (target.field === 'location') body = <label className="iv-field">{t('Location', 'Ligging')}<input maxLength={120} value={ev.location} onChange={e => patch({ location: e.target.value }, 'location')}/></label>;
    else body = <div className="iv-grid2">
      <label className="iv-field">{t('Date', 'Datum')}<input type="date" value={ev.date} onChange={e => { const v = e.target.value; if (ev.id === 'wedding') set(d => shiftWeekend(d, v), 'date'); else patch({ date: v }, 'date'); }}/></label>
      <label className="iv-field">{t('Start time', 'Begintyd')}<input type="time" value={ev.time} onChange={e => patch({ time: e.target.value }, 'time')}/></label>
    </div>;
  } else if (target.kind === 'moment') {
    const m = data.itinerary.find(i => i.id === target.id)!;
    const patch = (p: Partial<typeof m>, suffix: string) => set(d => ({ ...d, itinerary: d.itinerary.map(i => i.id === m.id ? { ...i, ...p } : i) }), suffix);
    title = t('Schedule moment', 'Programoomblik');
    body = <><label className="iv-field">{t('Time', 'Tyd')}<input type="time" value={m.time} onChange={e => patch({ time: e.target.value }, 'time')}/></label>
      {bilingual(t('Moment', 'Oomblik'), m.name, v => patch({ name: v }, 'name'), 'name', 1)}
      {bilingual(t('Small note', 'Klein nota'), m.note, v => patch({ note: v }, 'note'), 'note', 1)}
      <label className="iv-check"><input type="checkbox" checked={!m.hidden} onChange={e => patch({ hidden: !e.target.checked }, 'hidden')}/>{t('Show on the website', 'Wys op die webwerf')}</label></>;
  } else if (target.kind === 'meal') {
    const meal = data.meals.find(m => m.id === target.id)!;
    title = t('Dinner option', 'Aandete-keuse');
    body = bilingual(t('Dish', 'Gereg'), meal.name, v => set(d => ({ ...d, meals: d.meals.map(x => x.id === meal.id ? { ...x, name: v } : x) }), 'name'), 'name', 1);
  } else if (target.kind === 'photo') {
    const m = data.media.find(x => x.id === target.id)!;
    const patch = (p: Partial<typeof m>, suffix: string) => set(d => ({ ...d, media: d.media.map(x => x.id === m.id ? { ...x, ...p } : x) }), suffix);
    title = m.id === 'heroForeground' ? t('Cover foreground (transparent PNG/WebP)', 'Voorbladvoorgrond (deursigtige PNG/WebP)') : t('Photograph', 'Foto');
    body = <>
      <img className="iv-card-thumb" src={m.src} alt="" style={{ objectPosition: m.focal }}/>
      <label className="iv-field">{t('Replace (JPG, PNG or WebP, up to 8 MB)', 'Vervang (JPG, PNG of WebP, tot 8 MB)')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; try { const src = await readPhoto(f); studio.change(d => ({ ...d, media: d.media.map(x => x.id === m.id ? { ...x, src, placeholder: false } : x) })); setNote(t('Replaced everywhere this photo appears.', 'Oral vervang waar hierdie foto verskyn.')); } catch { setNote(t('Choose a JPG, PNG or WebP photo under 8 MB.', 'Kies ’n JPG-, PNG- of WebP-foto kleiner as 8 MB.')); } }}/></label>
      <div className="iv-grid2">{[0, 1].map(axis => <label className="iv-field" key={axis}>{axis ? t('Focus up/down', 'Fokus op/af') : t('Focus left/right', 'Fokus links/regs')}<input type="range" min={0} max={100} value={parseInt(m.focal.split(' ')[axis])} onChange={e => { const f = m.focal.split(' '); f[axis] = `${e.target.value}%`; patch({ focal: f.join(' ') }, `focal${axis}`); }}/></label>)}</div>
      {m.id !== 'heroForeground' && <>{bilingual(t('Caption', 'Onderskrif'), m.caption, v => patch({ caption: v }, 'caption'), 'caption', 1)}{bilingual(t('Description for screen readers', 'Beskrywing vir skermlesers'), m.alt, v => patch({ alt: v }, 'alt'), 'alt', 2)}</>}
    </>;
  }

  return <div ref={card} className={`iv-editcard ${pos ? '' : 'is-sheet'}`} style={pos ?? undefined} role="dialog" aria-label={title} data-no-translate
    onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}>
    <header><strong>{title}</strong><button type="button" onClick={onClose}>{t('Done', 'Klaar')}</button></header>
    <div className="iv-editcard-body">{body}</div>
    {note && <p role="status" className="iv-small">{note}</p>}
  </div>;
}
