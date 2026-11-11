import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { gardenPalettes, type GardenDraft } from './content';
import { EditorDrawer } from '../shared/editor/EditorKit';
import { GardenDrafts, type useGardenStudio } from './GardenStudio';

type Props = { open: boolean; onClose: () => void; draft: GardenDraft; onChange: (draft: GardenDraft) => void; af: boolean; onPhoto: (file: File) => void; onReset: () => void; photo: boolean; studio: ReturnType<typeof useGardenStudio> };
/** Garden's "Details & saving" drawer, in the same shared drawer as Midnight and Ivory. */
export function GardenEditor({ open, onClose, draft, onChange, af, onPhoto, onReset, photo, studio }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');
  const t = (en: string, afrikaans: string) => af ? afrikaans : en;
  const update = (patch: Partial<GardenDraft>) => onChange({ ...draft, ...patch });
  return <EditorDrawer open={open} onClose={onClose} language={af ? 'af' : 'en'} design="The Garden" className="garden-drawer"
    intro={t('Words and photos are edited right on the page: close this panel and click them. Here you set names, colours and save your work.', 'Woorde en foto’s word reg op die blad geredigeer: maak hierdie paneel toe en klik daarop. Hier stel julle name en kleure en stoor julle werk.')}>
    <div className="ee-actions"><button type="button" disabled={!studio.canUndo} onClick={studio.undo}>{t('Undo', 'Ontdoen')}</button><button type="button" disabled={!studio.canRedo} onClick={studio.redo}>{t('Redo', 'Herdoen')}</button><button type="button" onClick={() => { onReset(); setFileError(''); if (fileInput.current) fileInput.current.value = ''; }}>{t('Reset to concept', 'Herstel na konsep')}</button></div>
    <details open><summary>{t('Names, date & venue', 'Name, datum en venue')}</summary>
      <div className="ee-grid2"><label className="ee-field">{t('Your name', 'Jou naam')}<input maxLength={24} value={draft.first} onChange={e => update({ first: e.target.value })}/></label><label className="ee-field">{t('Partner’s name', 'Maat se naam')}<input maxLength={24} value={draft.second} onChange={e => update({ second: e.target.value })}/></label></div>
      <div className="ee-grid2"><label className="ee-field">{t('Wedding date', 'Troudatum')}<input type="date" min="2020-01-01" max="2099-12-31" value={draft.date} onChange={e => update({ date: e.target.value })}/></label><label className="ee-field">{t('Venue name', 'Venue se naam')}<input maxLength={60} value={draft.venue} onChange={e => update({ venue: e.target.value })}/></label></div>
    </details>
    <details open><summary>{t('Colours', 'Kleure')}</summary>
      <div className="ee-swatches" role="group" aria-label={t('Your colours', 'Julle kleure')}>{Object.entries(gardenPalettes).map(([id, p]) => <button type="button" className="ee-swatch" key={id} aria-pressed={draft.palette === id} onClick={() => update({ palette: id as GardenDraft['palette'] })}><i style={{ background: p.accent }}/>{p.name[af ? 'af' : 'en']}</button>)}</div>
    </details>
    <details><summary>{t('Headline & story', 'Opskrif en storie')} · {af ? 'AF' : 'EN'}</summary>
      <label className="ee-field">{t('Welcome headline', 'Welkomopskrif')}<input maxLength={100} value={af ? draft.headlineAf : draft.headlineEn} onChange={e => update(af ? { headlineAf: e.target.value } : { headlineEn: e.target.value })}/></label>
      <label className="ee-field">{t('Your story', 'Julle storie')}<textarea rows={5} maxLength={2500} value={af ? draft.storyAf : draft.storyEn} placeholder={t('Leave blank to keep Clara and Ruben’s story, or write your own.', 'Laat oop om Clara en Ruben se storie te hou, of skryf julle eie.')} onChange={e => update(af ? { storyAf: e.target.value } : { storyEn: e.target.value })}/></label>
    </details>
    <details><summary>{t('Main photo', 'Hooffoto')}</summary>
      <label className="ee-field"><span><ImagePlus size={14}/> {photo ? t('Replace your photo', 'Vervang julle foto') : t('Try your own photo', 'Probeer julle eie foto')}</span><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file = e.target.files?.[0]; if (!file) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { setFileError(t('Choose a JPG, PNG or WebP smaller than 8 MB.', 'Kies ’n JPG, PNG of WebP kleiner as 8 MB.')); return; } setFileError(''); onPhoto(file); }}/></label>
      {fileError && <p role="alert" className="ee-error">{fileError}</p>}
      <small>{t('This photo stays on this device until you leave the preview. Other photos are changed by clicking them on the page.', 'Hierdie foto bly op hierdie toestel totdat jy die voorskou verlaat. Ander foto’s word verander deur op die blad daarop te klik.')}</small>
    </details>
    <GardenDrafts studio={studio} af={af}/>
  </EditorDrawer>;
}
