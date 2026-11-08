import { useEffect, useRef, useState } from 'react';
import { X, ArrowUpRight, ImagePlus } from 'lucide-react';
import { gardenPalettes, type GardenDraft } from './content';

type Props = { open: boolean; onClose: () => void; draft: GardenDraft; onChange: (draft: GardenDraft) => void; af: boolean; onPhoto: (file: File) => void; onReset: () => void; photo: boolean };
export function GardenEditor({open,onClose,draft,onChange,af,onPhoto,onReset,photo}:Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pointer = useRef<HTMLSpanElement>(null);
  const [fileError,setFileError] = useState('');
  const t = (en:string,afrikaans:string) => af ? afrikaans : en;
  useEffect(()=>{if(open&&!dialog.current?.open)dialog.current?.showModal();else if(!open&&dialog.current?.open)dialog.current?.close();},[open]);
  useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[open]);
  const update = (patch:Partial<GardenDraft>) => onChange({...draft,...patch});
  return <dialog ref={dialog} className="garden-editor" onCancel={onClose} onClose={onClose} aria-labelledby="garden-editor-title" onPointerMove={event=>{if(event.pointerType==='mouse'&&pointer.current){pointer.current.style.opacity='1';pointer.current.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;}}} onPointerLeave={()=>{if(pointer.current)pointer.current.style.opacity='0';}}>
    <span className="garden-dialog-cursor" ref={pointer} aria-hidden="true">♥</span>
    <div className="garden-editor-header"><span className="garden-kicker">THE GARDEN COLLECTION</span><button type="button" className="garden-icon-button" onClick={onClose} aria-label={t('Close editor','Maak redigeerder toe')}><X/></button></div>
    <h2 id="garden-editor-title">{t('Make it','Maak dit')} <em>{t('yours.','julle eie.')}</em></h2><p>{t('Same considered layout. Your own little world.','Dieselfde deurdagte uitleg. Julle eie klein wêreld.')}</p>
    <div className="garden-editor-two"><label className="garden-field">{t('Your name','Jou naam')}<input maxLength={24} value={draft.first} onChange={e=>update({first:e.target.value})}/></label><label className="garden-field">{t('Partner’s name','Maat se naam')}<input maxLength={24} value={draft.second} onChange={e=>update({second:e.target.value})}/></label></div>
    <div className="garden-editor-two"><label className="garden-field">{t('Wedding date','Troudatum')}<input type="date" min="2020-01-01" max="2099-12-31" value={draft.date} onChange={e=>update({date:e.target.value})}/></label><label className="garden-field">{t('Venue name','Venue se naam')}<input maxLength={60} value={draft.venue} onChange={e=>update({venue:e.target.value})}/></label></div>
    <fieldset className="garden-palette"><legend>{t('Your colours','Julle kleure')}</legend>{Object.entries(gardenPalettes).map(([id,p])=><button type="button" key={id} aria-pressed={draft.palette===id} onClick={()=>update({palette:id as GardenDraft['palette']})}><i style={{background:p.accent}}/>{p.name[af?'af':'en']}</button>)}</fieldset>
    <label className="garden-field">{t('Welcome headline (English)','Welkomopskrif (Afrikaans)')}<input maxLength={100} value={af?draft.headlineAf:draft.headlineEn} onChange={e=>update(af?{headlineAf:e.target.value}:{headlineEn:e.target.value})}/></label>
    <label className="garden-field">{t('Your story (English)','Julle storie (Afrikaans)')}<textarea rows={5} maxLength={2500} value={af?draft.storyAf:draft.storyEn} placeholder={t('Leave blank to explore Clara and Ruben’s story, or write your own.','Laat oop om Clara en Ruben se storie te verken, of skryf julle eie.')} onChange={e=>update(af?{storyAf:e.target.value}:{storyEn:e.target.value})}/></label>
    <label className="garden-photo-upload"><ImagePlus size={24}/><span>{photo?t('Replace your photo','Vervang julle foto'):t('Try your own photo','Probeer julle eie foto')}<small>JPG, PNG, WebP · {t('up to 8 MB','tot 8 MB')}</small></span><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){setFileError(t('Choose a JPG, PNG or WebP smaller than 8 MB.','Kies ’n JPG, PNG of WebP kleiner as 8 MB.'));return;}setFileError('');onPhoto(file);}}/></label>
    {fileError&&<p role="alert" className="garden-form-error">{fileError}</p>}
    <small className="garden-editor-note">{t('Text and colours are saved in this browser. Your photo stays on this device and lasts until you leave the preview. Nothing is published.','Teks en kleure word in hierdie blaaier gestoor. Julle foto bly op hierdie toestel totdat jy die voorskou verlaat. Niks word gepubliseer nie.')}</small>
    <div className="garden-editor-actions"><button className="garden-text-button" type="button" onClick={()=>{onReset();setFileError('');if(fileInput.current)fileInput.current.value='';}}>{t('Reset concept','Herstel konsep')}</button><button className="garden-button" type="button" onClick={onClose}>{t('See my preview','Sien my voorskou')} <ArrowUpRight size={17}/></button></div>
  </dialog>;
}
