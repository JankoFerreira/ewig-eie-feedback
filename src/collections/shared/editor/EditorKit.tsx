import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import './editor.css';

/**
 * One editor system for every design (Garden, Midnight, Ivory):
 * - "Make it yours" switches the page into edit mode and shows the same bottom bar.
 * - Click any words or photo on the page: a small card opens next to it.
 * - "Details & saving" opens the same side drawer for names, colours and drafts.
 * Each design only supplies what goes inside the card and the drawer.
 */
export type EditorLanguage = 'en' | 'af';
type Ctx = { active: boolean; language: EditorLanguage; current: string | null; open: (target: unknown, anchor: HTMLElement) => void };
const EditContext = createContext<Ctx>({ active: false, language: 'en', current: null, open: () => {} });
export const useEditing = () => useContext(EditContext);
export const targetKey = (target: unknown) => { const { label: _label, ...rest } = (target ?? {}) as Record<string, unknown>; return JSON.stringify(rest); };

/** Wraps on-page content. Inert outside edit mode; a focusable, clickable target inside it. */
export function Ed<T extends { label?: string; kind?: string }>({ target, children, block = false }: { target: T; children: ReactNode; block?: boolean }) {
  const { active, open, current, language } = useEditing();
  if (!active) return <>{children}</>;
  const empty = children === '' || children === null || children === undefined;
  const photo = target.kind === 'photo';
  const label = target.label ?? (photo ? (language === 'af' ? 'Verander foto' : 'Change photo') : (language === 'af' ? 'Redigeer' : 'Edit'));
  const Tag = block ? 'div' : 'span';
  return <Tag className={`ee-target ${photo ? 'is-photo' : ''} ${current === targetKey(target) ? 'is-current' : ''} ${empty ? 'is-empty' : ''}`} role="button" tabIndex={0}
    aria-label={target.label ? label : `${label}${typeof children === 'string' && children ? `: ${children.slice(0, 60)}` : ''}`}
    onClick={e => { e.preventDefault(); e.stopPropagation(); open(target, e.currentTarget); }}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); open(target, e.currentTarget); } }}>
    {empty ? <i>{language === 'af' ? '+ Voeg teks by' : '+ Add text'}</i> : children}
  </Tag>;
}

export type CardContent = { title: string; body: ReactNode };
type ShellProps<T> = {
  active: boolean; language: EditorLanguage; children: ReactNode; design: string;
  canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void; onDetails: () => void; onDone: () => void;
  renderCard: (target: T, setNote: (note: string) => void) => CardContent;
  /** Lets a design open the card itself (Garden wraps text automatically). */
  controller?: (open: (target: T, anchor: HTMLElement) => void) => void;
};
export function EditorShell<T>({ active, language, children, design, canUndo, canRedo, onUndo, onRedo, onDetails, onDone, renderCard, controller }: ShellProps<T>) {
  const [selected, setSelected] = useState<{ target: T; anchor: HTMLElement } | null>(null);
  useEffect(() => { if (!active) setSelected(null); }, [active]);
  const open = (target: T, anchor: HTMLElement) => setSelected({ target, anchor });
  useEffect(() => { controller?.(open); }); // eslint-disable-line react-hooks/exhaustive-deps
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const close = () => { const a = selected?.anchor; setSelected(null); requestAnimationFrame(() => a?.isConnected && a.focus()); };
  return <EditContext.Provider value={{ active, language, current: selected ? targetKey(selected.target) : null, open: (t2, a) => open(t2 as T, a) }}>
    {children}
    {active && <div className="ee-bar" role="toolbar" aria-label={t('Editing tools', 'Redigeergereedskap')} data-no-translate>
      <p><strong>{t('Editing', 'Redigeer')} · {design}</strong><span>{t('Click any words or photo to change it.', 'Klik enige woorde of foto om dit te verander.')}</span></p>
      <div>
        <button type="button" disabled={!canUndo} onClick={onUndo}>{t('Undo', 'Ontdoen')}</button>
        <button type="button" disabled={!canRedo} onClick={onRedo}>{t('Redo', 'Herdoen')}</button>
        <button type="button" onClick={onDetails}>{t('Details & saving', 'Besonderhede en stoor')}</button>
        <button type="button" className="ee-bar-done" onClick={onDone}>{t('Done', 'Klaar')}</button>
      </div>
    </div>}
    {active && selected && <EditCard key={targetKey(selected.target)} anchor={selected.anchor} language={language} onClose={close} content={setNote => renderCard(selected.target, setNote)}/>}
  </EditContext.Provider>;
}

function EditCard({ anchor, language, onClose, content }: { anchor: HTMLElement; language: EditorLanguage; onClose: () => void; content: (setNote: (n: string) => void) => CardContent }) {
  const card = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [note, setNote] = useState('');
  const { title, body } = content(setNote);
  useLayoutEffect(() => {
    const place = () => {
      if (window.innerWidth <= 700 || !anchor.isConnected) { setPos(null); return; }
      const r = anchor.getBoundingClientRect(); const w = 380; const h = card.current?.offsetHeight ?? 300;
      const below = r.bottom + 10 + h < window.innerHeight - 90;
      setPos({ top: Math.max(10, below ? r.bottom + 10 : r.top - h - 10), left: Math.min(window.innerWidth - w - 12, Math.max(12, r.left)) });
    };
    place(); window.addEventListener('resize', place); window.addEventListener('scroll', place, { passive: true });
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place); };
  }, [anchor]);
  useEffect(() => { card.current?.querySelector<HTMLElement>('input:not([type=checkbox]):not([type=file]),textarea,select')?.focus(); }, []);
  return <div ref={card} className={`ee-card ${pos ? '' : 'is-sheet'}`} style={pos ?? undefined} role="dialog" aria-label={title} data-no-translate
    onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}>
    <header><strong>{title}</strong><button type="button" onClick={onClose}>{language === 'af' ? 'Klaar' : 'Done'}</button></header>
    <div className="ee-card-body">{body}</div>
    {note && <p role="status" className="ee-small">{note}</p>}
  </div>;
}

/** The same side drawer in every design: names, colours, photos, drafts and backups. */
export function EditorDrawer({ open, onClose, language, design, intro, children, status, className = '' }: { open: boolean; onClose: () => void; language: EditorLanguage; design: string; intro?: ReactNode; children: ReactNode; status?: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (open && !d.open) d.showModal(); else if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => { if (!open) return; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [open]);
  const t = (en: string, af: string) => language === 'af' ? af : en;
  return <dialog ref={dialog} className={`ee-drawer ${className}`} onCancel={onClose} onClose={onClose} aria-labelledby="ee-drawer-title" data-no-translate>
    <div className="ee-drawer-head"><div><p className="ee-kicker">{design}</p><h2 id="ee-drawer-title">{t('Details & saving', 'Besonderhede en stoor')}</h2></div><button type="button" onClick={onClose}>{t('Close', 'Sluit')}</button></div>
    {intro && <p className="ee-drawer-intro">{intro}</p>}
    {children}
    {status !== undefined && <p className="ee-status" role="status">{status}</p>}
  </dialog>;
}

/** English + Afrikaans side by side, used by every card that edits wording. */
export function Bilingual({ label, value, onChange, rows = 2 }: { label: string; value: { en: string; af: string }; onChange: (v: { en: string; af: string }) => void; rows?: number }) {
  return <fieldset className="ee-pair"><legend>{label}</legend>
    {(['en', 'af'] as const).map(l => <label key={l} className="ee-field"><span>{l === 'en' ? 'English' : 'Afrikaans'}</span><textarea rows={Math.max(rows, Math.ceil(value[l].length / 46))} maxLength={4000} value={value[l]} onChange={e => onChange({ ...value, [l]: e.target.value })}/></label>)}
  </fieldset>;
}

export async function readPhoto(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('type');
  const src = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(file); });
  const ok = await new Promise<boolean>(resolve => { const i = new Image(); i.onload = () => resolve(true); i.onerror = () => resolve(false); i.src = src; });
  if (!ok) throw new Error('unreadable');
  return src;
}

/** Photo card body shared by Midnight and Ivory: replace, focal point, caption and description. */
export function PhotoFields({ language, src, focal, caption, alt, onReplace, onFocal, onCaption, onAlt, setNote }: {
  language: EditorLanguage; src: string; focal: string; caption?: { en: string; af: string }; alt?: { en: string; af: string };
  onReplace: (src: string) => void; onFocal: (focal: string) => void; onCaption?: (v: { en: string; af: string }) => void; onAlt?: (v: { en: string; af: string }) => void; setNote: (n: string) => void;
}) {
  const t = (en: string, af: string) => language === 'af' ? af : en;
  return <>
    <img className="ee-thumb" src={src} alt="" style={{ objectPosition: focal }}/>
    <label className="ee-field">{t('Replace (JPG, PNG or WebP, up to 8 MB)', 'Vervang (JPG, PNG of WebP, tot 8 MB)')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; try { onReplace(await readPhoto(f)); setNote(t('Replaced everywhere this photo appears.', 'Oral vervang waar hierdie foto verskyn.')); } catch { setNote(t('Choose a JPG, PNG or WebP photo under 8 MB.', 'Kies ’n JPG-, PNG- of WebP-foto kleiner as 8 MB.')); } }}/></label>
    <div className="ee-grid2">{[0, 1].map(axis => <label className="ee-field" key={axis}>{axis ? t('Focus up/down', 'Fokus op/af') : t('Focus left/right', 'Fokus links/regs')}<input type="range" min={0} max={100} value={parseInt(focal.split(' ')[axis]) || 50} onChange={e => { const f = focal.split(' '); f[axis] = `${e.target.value}%`; onFocal(f.join(' ')); }}/></label>)}</div>
    {caption && onCaption && <Bilingual label={t('Caption', 'Onderskrif')} value={caption} onChange={onCaption} rows={1}/>}
    {alt && onAlt && <Bilingual label={t('Description for screen readers', 'Beskrywing vir skermlesers')} value={alt} onChange={onAlt}/>}
  </>;
}
