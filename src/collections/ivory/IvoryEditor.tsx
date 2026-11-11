import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from '../shared/useHistory';
import { contrastRatio } from '../shared/validateTemplate';
import { defaultIvory, monogramStyles, type Copy, type IvoryData, type Language } from './content';
import { listIvoryDrafts, parseIvoryBackup, saveIvoryDraft, serializeIvoryBackup, shiftWeekend, validateIvory, type SavedIvory } from './storage';
import { Monogram } from './Monogram';
import { download } from './exports';

export const useIvoryStudio = () => useHistory(() => structuredClone(defaultIvory));
type Studio = ReturnType<typeof useIvoryStudio>;
type Props = { studio: Studio; open: boolean; onClose: () => void; language: Language };

export const ivoryPalettes = [
  { id: 'ivory', en: 'Ivory & olive', af: 'Ivoor en olyf', colors: defaultIvory.colors },
  { id: 'linen', en: 'Linen & ink', af: 'Linne en ink', colors: { paper: '#f7f3ec', stone: '#e6e0d5', ink: '#2f3337', accent: '#a98c5a' } },
  { id: 'sand', en: 'Sand & cedar', af: 'Sand en seder', colors: { paper: '#f4eee4', stone: '#e0d4c2', ink: '#45372b', accent: '#b39363' } },
];

const groupLabels: Record<string, [string, string]> = { hero: ['Cover', 'Voorblad'], letter: ['Letter', 'Brief'], story: ['Story', 'Storie'], weekend: ['Weekend', 'Naweek'], venue: ['Venue', 'Venue'], notes: ['Practical notes', 'Praktiese notas'], gallery: ['Gallery', 'Galery'], faq: ['Questions', 'Vrae'], rsvp: ['Reply', 'Antwoord'], invitation: ['Invitation', 'Uitnodiging'], stationery: ['Stationery', 'Skryfbehoeftes'], footer: ['Footer', 'Voetskrif'] };

export function IvoryEditor({ studio, open, onClose, language }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('Our Ivory weekend');
  const [saved, setSaved] = useState<SavedIvory[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const data = studio.state;
  const problem = useMemo(() => { try { validateIvory(data); return ''; } catch (e) { return (e as Error).message; } }, [data]);
  useEffect(() => {
    if (open) { if (!dialog.current?.open) dialog.current?.showModal(); listIvoryDrafts().then(setSaved).catch(() => setMessage(t('Browser storage is unavailable here. Download a backup instead.', 'Blaaierberging is nie hier beskikbaar nie. Laai eerder ’n rugsteun af.'))); }
    else if (dialog.current?.open) dialog.current.close();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const update = (patch: Partial<IvoryData>) => studio.change(current => ({ ...current, ...patch }));
  const input = (label: string, value: string, change: (v: string) => void, type = 'text', extra: { max?: number; required?: boolean } = {}) =>
    <label className="iv-field">{label}<input type={type} value={value} maxLength={type === 'text' ? extra.max ?? 120 : undefined} required={extra.required} onChange={e => change(e.target.value)}/></label>;
  const copyInput = (label: string, value: Copy, change: (v: Copy) => void, rows = 2) =>
    <label className="iv-field">{label} <small>· {language.toUpperCase()}</small><textarea rows={rows} maxLength={4000} value={value[language]} onChange={e => change({ ...value, [language]: e.target.value })}/></label>;
  const ratio = (a: string, b: string) => { const r = contrastRatio(a, b); return <span className={r >= 4.5 ? 'iv-pass' : 'iv-warn'}>{r.toFixed(1)}:1 {r >= 4.5 ? t('· passes AA', '· slaag AA') : t('· too low for body text', '· te laag vir lopende teks')}</span>; };
  const groups = Object.keys(data.text).reduce<Record<string, string[]>>((acc, id) => { const g = id.split('.')[0]; (acc[g] ??= []).push(id); return acc; }, {});

  async function replacePhoto(id: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setMessage(t('Choose a JPG, PNG or WebP photograph under 8 MB.', 'Kies ’n JPG-, PNG- of WebP-foto kleiner as 8 MB.')); return; }
    const src = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(file); }).catch(() => '');
    if (!src) { setMessage(t('That photograph could not be read.', 'Daardie foto kon nie gelees word nie.')); return; }
    const ok = await new Promise<boolean>(resolve => { const img = new Image(); img.onload = () => resolve(true); img.onerror = () => resolve(false); img.src = src; });
    if (!ok) { setMessage(t('That file is not a readable photograph.', 'Daardie lêer is nie ’n leesbare foto nie.')); return; }
    studio.change(current => ({ ...current, media: current.media.map(m => m.id === id ? { ...m, src, placeholder: false } : m) }));
    setMessage(t('Photograph replaced everywhere it appears. Save a draft to keep it.', 'Foto oral vervang waar dit verskyn. Stoor ’n konsep om dit te hou.'));
  }

  return <dialog ref={dialog} className="iv-editor" aria-labelledby="iv-editor-title" onClose={onClose} onCancel={onClose} data-no-translate>
    <header className="iv-editor-head"><div><p className="iv-kicker">IVORY STUDIO</p><h2 id="iv-editor-title">{t('Make it yours', 'Maak dit julle eie')}</h2></div><button type="button" onClick={onClose}>{t('Done', 'Klaar')}</button></header>
    <p className="iv-editor-intro">{t('The layout stays fixed; every word, photograph, colour and time is yours. Wording is edited per language — switch EN/AF in the toolbar to edit the other version.', 'Die uitleg bly vas; elke woord, foto, kleur en tyd is julle s’n. Bewoording word per taal geredigeer — skakel EN/AF in die nutsbalk om die ander weergawe te redigeer.')}</p>
    <div className="iv-editor-actions" role="toolbar" aria-label={t('History', 'Geskiedenis')}>
      <button type="button" disabled={!studio.canUndo} onClick={studio.undo}>{t('Undo', 'Ontdoen')}</button>
      <button type="button" disabled={!studio.canRedo} onClick={studio.redo}>{t('Redo', 'Herdoen')}</button>
      <button type="button" onClick={() => { studio.change(structuredClone(defaultIvory)); setMessage(t('Concept content restored. Undo to go back.', 'Konsepinhoud herstel. Ontdoen om terug te gaan.')); }}>{t('Reset to concept', 'Herstel na konsep')}</button>
    </div>
    {problem && <p className="iv-error" role="alert">{t('Check this before saving:', 'Kontroleer dit voor jy stoor:')} {problem === 'Weekend events are out of order' ? t('the welcome evening must be on or before the wedding, and brunch on or after it.', 'die verwelkoming moet op of voor die troue wees, en brunch op of daarna.') : problem === 'RSVP deadline falls after the wedding' ? t('the reply deadline must be before the wedding.', 'die antwoordsperdatum moet voor die troue wees.') : t('a required field is empty or invalid.', '’n verpligte veld is leeg of ongeldig.')}</p>}

    <details open><summary>{t('Couple & monogram', 'Paartjie en monogram')}</summary>
      <div className="iv-grid2">
        {input(t('First name', 'Eerste naam'), data.couple.first, v => update({ couple: { ...data.couple, first: v } }), 'text', { required: true })}
        {input(t('Surname', 'Van'), data.couple.firstSurname, v => update({ couple: { ...data.couple, firstSurname: v } }))}
        {input(t('Second name', 'Tweede naam'), data.couple.second, v => update({ couple: { ...data.couple, second: v } }), 'text', { required: true })}
        {input(t('Surname', 'Van'), data.couple.secondSurname, v => update({ couple: { ...data.couple, secondSurname: v } }))}
        {input(t('Monogram left', 'Monogram links'), data.monogram.left, v => update({ monogram: { ...data.monogram, left: v } }), 'text', { max: 3 })}
        {input(t('Monogram right', 'Monogram regs'), data.monogram.right, v => update({ monogram: { ...data.monogram, right: v } }), 'text', { max: 3 })}
      </div>
      <fieldset className="iv-mono-picker"><legend>{t('Monogram style', 'Monogramstyl')}</legend>{monogramStyles.map(style => <label key={style}><input type="radio" name="iv-mono-style" checked={data.monogram.style === style} onChange={() => update({ monogram: { ...data.monogram, style } })}/><Monogram left={data.monogram.left} right={data.monogram.right} style={style} size={70}/><span>{style === 'ring' ? t('Ring', 'Ring') : style === 'arch' ? t('Arch', 'Boog') : t('Stacked', 'Gestapel')}</span></label>)}</fieldset>
    </details>

    <details><summary>{t('Date & venue', 'Datum en venue')}</summary>
      <div className="iv-grid2">
        {input(t('Wedding date (moves the whole weekend)', 'Troudatum (skuif die hele naweek)'), data.date, v => studio.change(c => shiftWeekend(c, v)), 'date')}
        {input(t('Reply deadline', 'Antwoordsperdatum'), data.deadline, v => update({ deadline: v }), 'date')}
        {input(t('Venue', 'Venue'), data.venue, v => update({ venue: v, events: data.events.map(e => ({ ...e, location: data.venue ? e.location.split(data.venue).join(v) : e.location })) }), 'text', { required: true })}
        {input(t('Region', 'Streek'), data.region, v => update({ region: v }))}
      </div>
    </details>

    <details><summary>{t('Colours', 'Kleure')}</summary>
      <div className="iv-palettes">{ivoryPalettes.map(p => <button type="button" key={p.id} onClick={() => update({ colors: { ...p.colors } })} aria-label={`${t('Use palette', 'Gebruik palet')} ${t(p.en, p.af)}`}>{Object.values(p.colors).map(c => <i key={c} style={{ background: c }}/>)}<span>{t(p.en, p.af)}</span></button>)}</div>
      <div className="iv-grid2">{(['paper', 'stone', 'ink', 'accent'] as const).map(key => <label className="iv-field iv-colour" key={key}>{{ paper: t('Paper (background)', 'Papier (agtergrond)'), stone: t('Stone (panels)', 'Klip (panele)'), ink: t('Ink (text & buttons)', 'Ink (teks en knoppies)'), accent: t('Champagne (details only)', 'Sjampanje (slegs detail)') }[key]}<input type="color" value={data.colors[key]} onChange={e => update({ colors: { ...data.colors, [key]: e.target.value } })}/></label>)}</div>
      <ul className="iv-contrast"><li>{t('Ink on paper', 'Ink op papier')}: {ratio(data.colors.ink, data.colors.paper)}</li><li>{t('Ink on stone', 'Ink op klip')}: {ratio(data.colors.ink, data.colors.stone)}</li><li>{t('Champagne is decorative and never used for text.', 'Sjampanje is dekoratief en word nooit vir teks gebruik nie.')}</li></ul>
    </details>

    <details><summary>{t('The weekend', 'Die naweek')}</summary>
      {data.events.map(event => <fieldset key={event.id} className="iv-fieldset"><legend>{event.name[language]}</legend>
        {copyInput(t('Name', 'Naam'), event.name, v => update({ events: data.events.map(e => e.id === event.id ? { ...e, name: v } : e) }), 1)}
        <div className="iv-grid2">
          {input(t('Date', 'Datum'), event.date, v => event.id === 'wedding' ? studio.change(c => shiftWeekend(c, v)) : update({ events: data.events.map(e => e.id === event.id ? { ...e, date: v } : e) }), 'date')}
          {input(t('Time', 'Tyd'), event.time, v => update({ events: data.events.map(e => e.id === event.id ? { ...e, time: v } : e) }), 'time')}
        </div>
        {input(t('Location', 'Ligging'), event.location, v => update({ events: data.events.map(e => e.id === event.id ? { ...e, location: v } : e) }))}
        {copyInput(t('Dress', 'Drag'), event.dress, v => update({ events: data.events.map(e => e.id === event.id ? { ...e, dress: v } : e) }), 1)}
        {copyInput(t('Description', 'Beskrywing'), event.description, v => update({ events: data.events.map(e => e.id === event.id ? { ...e, description: v } : e) }))}
        <p className="iv-editor-sub">{t('Schedule moments', 'Programoomblikke')}</p>
        {data.itinerary.filter(i => i.eventId === event.id).map(item => <div className="iv-moment" key={item.id}>
          {input(t('Time', 'Tyd'), item.time, v => update({ itinerary: data.itinerary.map(i => i.id === item.id ? { ...i, time: v } : i) }), 'time')}
          {copyInput(t('Moment', 'Oomblik'), item.name, v => update({ itinerary: data.itinerary.map(i => i.id === item.id ? { ...i, name: v } : i) }), 1)}
          {copyInput(t('Note', 'Nota'), item.note, v => update({ itinerary: data.itinerary.map(i => i.id === item.id ? { ...i, note: v } : i) }), 1)}
          <label className="iv-check"><input type="checkbox" checked={!item.hidden} onChange={e => update({ itinerary: data.itinerary.map(i => i.id === item.id ? { ...i, hidden: !e.target.checked } : i) })}/>{t('Show on the website', 'Wys op die webwerf')}</label>
        </div>)}
      </fieldset>)}
    </details>

    <details><summary>{t('Dinner & tables', 'Aandete en tafels')}</summary>
      {data.meals.map(meal => <div key={meal.id}>{copyInput(t('Dinner option', 'Aandete-keuse'), meal.name, v => update({ meals: data.meals.map(m => m.id === meal.id ? { ...m, name: v } : m) }), 1)}</div>)}
      <div className="iv-tables-edit">{data.tables.map(table => <div key={table.id} className="iv-grid2">
        {input(t('Table name', 'Tafelnaam'), table.name, v => update({ tables: data.tables.map(x => x.id === table.id ? { ...x, name: v } : x) }), 'text', { required: true })}
        <label className="iv-field">{t('Seats', 'Sitplekke')}<input type="number" min={1} max={20} value={table.capacity} onChange={e => update({ tables: data.tables.map(x => x.id === table.id ? { ...x, capacity: Math.max(1, Math.min(20, Math.round(Number(e.target.value) || 1))) } : x) })}/></label>
      </div>)}</div>
    </details>

    <details><summary>{t('All wording', 'Alle bewoording')} · {language.toUpperCase()}</summary>
      {Object.entries(groups).map(([group, ids]) => <fieldset key={group} className="iv-fieldset"><legend>{t(...(groupLabels[group] ?? [group, group]))}</legend>
        {ids.map(id => <div key={id}>{copyInput(id.split('.').slice(1).join(' · '), data.text[id], v => update({ text: { ...data.text, [id]: v } }), data.text[id].en.length > 90 ? 4 : 1)}</div>)}
      </fieldset>)}
    </details>

    <details><summary>{t('Photographs', 'Foto’s')}</summary>
      <p className="iv-editor-sub">{t('Each photograph has a stable ID and is reused wherever it appears. JPG, PNG or WebP up to 8 MB.', 'Elke foto het ’n vaste ID en word oral hergebruik waar dit verskyn. JPG, PNG of WebP tot 8 MB.')}</p>
      {data.media.map(m => <fieldset key={m.id} className="iv-fieldset iv-photo-edit"><legend>{m.id}{m.placeholder ? ` · ${t('placeholder plate', 'plekhouerplaat')}` : ''}</legend>
        <img src={m.src} alt="" width={120} height={90} style={{ objectPosition: m.focal }}/>
        <label className="iv-field">{t('Replace photograph', 'Vervang foto')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { replacePhoto(m.id, e.target.files?.[0]); e.target.value = ''; }}/></label>
        {copyInput(t('Description for screen readers', 'Beskrywing vir skermlesers'), m.alt, v => update({ media: data.media.map(x => x.id === m.id ? { ...x, alt: v } : x) }))}
        {copyInput(t('Caption', 'Onderskrif'), m.caption, v => update({ media: data.media.map(x => x.id === m.id ? { ...x, caption: v } : x) }), 1)}
        <div className="iv-grid2">{[0, 1].map(axis => <label className="iv-field" key={axis}>{axis ? t('Vertical focus', 'Vertikale fokus') : t('Horizontal focus', 'Horisontale fokus')}<input type="range" min={0} max={100} value={parseInt(m.focal.split(' ')[axis])} onChange={e => update({ media: data.media.map(x => { if (x.id !== m.id) return x; const f = x.focal.split(' '); f[axis] = `${e.target.value}%`; return { ...x, focal: f.join(' ') }; }) })}/></label>)}</div>
      </fieldset>)}
    </details>

    <details open><summary>{t('Drafts & backups', 'Konsepte en rugsteun')}</summary>
      {input(t('Draft name', 'Konsepnaam'), name, setName)}
      <div className="iv-editor-actions">
        <button type="button" disabled={busy || !name.trim() || !!problem} onClick={async () => { setBusy(true); try { await saveIvoryDraft(name, data); setSaved(await listIvoryDrafts()); setMessage(t(`“${name.trim()}” saved on this device. Nothing was published.`, `“${name.trim()}” op hierdie toestel gestoor. Niks is gepubliseer nie.`)); } catch { setMessage(t('Could not save. Check the highlighted details, or download a backup.', 'Kon nie stoor nie. Kontroleer die besonderhede, of laai ’n rugsteun af.')); } finally { setBusy(false); } }}>{t('Save draft', 'Stoor konsep')}</button>
        <button type="button" disabled={!!problem} onClick={() => { try { download('ewig-ivory-v1.json', serializeIvoryBackup(name, data), 'application/json'); setMessage(t('Backup downloaded.', 'Rugsteun afgelaai.')); } catch { setMessage(t('Check your draft name and dates first.', 'Kontroleer eers jou konsepnaam en datums.')); } }}>{t('Download backup', 'Laai rugsteun af')}</button>
      </div>
      <label className="iv-field">{t('Open a saved draft', 'Maak ’n gestoorde konsep oop')}<select value="" onChange={e => { const d = saved.find(s => s.name === e.target.value); if (!d) return; studio.change(d.data); setName(d.name); setMessage(t(`“${d.name}” opened. Undo returns to your previous version.`, `“${d.name}” oopgemaak. Ontdoen keer terug na jou vorige weergawe.`)); }}><option value="">{saved.length ? t('Choose…', 'Kies…') : t('No saved drafts yet', 'Nog geen gestoorde konsepte nie')}</option>{saved.map(d => <option key={d.name}>{d.name}</option>)}</select></label>
      <label className="iv-field">{t('Import an Ivory backup (.json)', 'Voer ’n Ivory-rugsteun in (.json)')}<input type="file" accept=".json,application/json" onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; try { const b = parseIvoryBackup(await file.text()); studio.change(b.data); setName(b.name); setMessage(t('Backup imported. Save it as a draft to keep it on this device.', 'Rugsteun ingevoer. Stoor dit as ’n konsep om dit op hierdie toestel te hou.')); } catch { setMessage(t('That file is not a compatible Ivory backup. Nothing changed.', 'Daardie lêer is nie ’n versoenbare Ivory-rugsteun nie. Niks het verander nie.')); } }}/></label>
      <small className="iv-fine">{t('Drafts live only in this browser (separate from Garden and Midnight). Guest replies and the seating plan are demo data and reset on reload.', 'Konsepte bestaan net in hierdie blaaier (apart van Garden en Midnight). Gasantwoorde en die sitplekplan is demodata en herstel ná herlaai.')}</small>
    </details>
    <p role="status" className="iv-editor-status">{message}</p>
  </dialog>;
}
