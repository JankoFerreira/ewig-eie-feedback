import { createNamedDraftStore } from '../shared/draftStorage';
import { useHistory } from '../shared/useHistory';
import { withTryNames } from '../shared/tryNames';
import { Children, createContext, useContext, cloneElement, isValidElement, useEffect, useRef, useState, type ReactNode, type ReactElement } from 'react';
import { defaultGardenDraft, readGardenDraft, type GardenDraft } from './content';
import { EditorShell, readPhoto } from '../shared/editor/EditorKit';
export type StudioState = { draft: GardenDraft; edits: Record<string,string> };
// Names tried on the Collections page apply only when this browser has no saved Garden details yet.
const initial = ():StudioState=>{const draft=readGardenDraft();let saved=false;try{saved=!!localStorage.getItem('ewig-garden-draft-v1');}catch{/* no storage */}return {draft:saved?draft:withTryNames(draft,n=>({...draft,first:n.first||draft.first,second:n.second||draft.second})),edits:{}};};
export function useGardenStudio(){ return useHistory(initial); }
const { list: savedDrafts, save: saveDraft } = createNamedDraftStore<StudioState>('ewig-garden-studio');

type OnEdit=(key:string,value:string,image:boolean,anchor:HTMLElement)=>void;
type CanvasSettings={edits:Record<string,string>;onEdit:OnEdit;active:boolean;language:string};
const StudioContext=createContext<CanvasSettings|null>(null);
export function EditableChunk({children,id}:{children:ReactNode;id:string}){const settings=useContext(StudioContext);return settings?<StudioCanvas {...settings} base={id}>{children}</StudioCanvas>:<>{children}</>;}
export function StudioCanvas({children,edits,onEdit,active,language,base="garden"}:{children:ReactNode;edits:Record<string,string>;onEdit:OnEdit;active:boolean;language:string;base?:string}){
 function walk(nodes:ReactNode,path:string):ReactNode{return Children.map(nodes,(node,index)=>{
 const key=`${path}.${index}`;
 if(typeof node==='string'||typeof node==='number'){if(!String(node).trim())return node;const id=`${language}:${key}`;return <span className={active?'ee-target':undefined} role={active?'button':undefined} data-studio-key={id} onClick={active?e=>{e.preventDefault();e.stopPropagation();onEdit(id,String(node),false,e.currentTarget);}:undefined} tabIndex={active?0:undefined} onKeyDown={active?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onEdit(id,String(node),false,e.currentTarget);}}:undefined}>{edits[id]??node}</span>;}
 if(!isValidElement(node))return node;
 const el=node as ReactElement<{children?:ReactNode;className?:string;src?:string;srcSet?:string;alt?:string}>;
 if(/garden-preview-bar|garden-editor|couple-dashboard|ee-/.test(el.props.className??''))return el;
 if(['input','textarea','select','option','svg'].includes(String(el.type)))return el;
 if(el.type==='img'){const id=`image:${key}`;return cloneElement(el,{src:edits[id]??el.props.src,'data-studio-image':id,...(active?{onClick:(e:React.MouseEvent<HTMLElement>)=>{e.preventDefault();e.stopPropagation();onEdit(id,el.props.src??'',true,e.currentTarget);},onKeyDown:(e:React.KeyboardEvent<HTMLElement>)=>{if(e.key==='Enter'){e.preventDefault();onEdit(id,el.props.src??'',true,e.currentTarget);}},tabIndex:0,role:'button',className:(el.props.className??'')+' ee-target'}:{})} as object);}
 if(el.type==='source'){const imageKey=`image:${path}.${index+1}`;return cloneElement(el,{srcSet:edits[imageKey]??el.props.srcSet});}
 return cloneElement(el,{children:walk(el.props.children,key)});
 });}
 return <StudioContext.Provider value={{edits,onEdit,active,language}}>{walk(children,base)}</StudioContext.Provider>;
}
export type GardenTarget={key:string;value:string;image:boolean};
type Studio=ReturnType<typeof useGardenStudio>;
/** Garden on the shared editor: the page wraps its own text, the shell supplies the bar and the card. */
export function GardenEditorShell({studio,af,active,onDetails,onDone,openRef,children}:{studio:Studio;af:boolean;active:boolean;onDetails:()=>void;onDone:()=>void;openRef:{current:((t:GardenTarget,a:HTMLElement)=>void)|null};children:ReactNode}){
 const t=(en:string,a:string)=>af?a:en;
 return <EditorShell<GardenTarget> active={active} language={af?'af':'en'} design="The Garden" canUndo={studio.canUndo} canRedo={studio.canRedo} onUndo={studio.undo} onRedo={studio.redo} onDetails={onDetails} onDone={onDone} controller={open=>{openRef.current=open;}}
  renderCard={(target,setNote)=>{
   const current=studio.state.edits[target.key]??target.value;
   const apply=(v:string)=>studio.change(state=>({...state,edits:{...state.edits,[target.key]:v}}),`garden:${target.key}`);
   const restore=()=>studio.change(state=>{const edits={...state.edits};delete edits[target.key];return {...state,edits};});
   if(target.image)return {title:t('Photograph','Foto'),body:<><img className="ee-thumb" src={current} alt=""/><label className="ee-field">{t('Replace (JPG, PNG or WebP, up to 8 MB)','Vervang (JPG, PNG of WebP, tot 8 MB)')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;try{apply(await readPhoto(f));setNote(t('Photo replaced. Save a draft to keep it.','Foto vervang. Stoor ’n konsep om dit te hou.'));}catch{setNote(t('Choose a JPG, PNG or WebP photo under 8 MB.','Kies ’n JPG-, PNG- of WebP-foto kleiner as 8 MB.'));}}}/></label>{studio.state.edits[target.key]&&<div className="ee-actions"><button type="button" className="ee-swatch" onClick={restore}>{t('Use the original photo','Gebruik die oorspronklike foto')}</button></div>}</>};
   return {title:t('Wording','Bewoording'),body:<><label className="ee-field"><span>{af?'Afrikaans':'English'}</span><textarea rows={Math.max(2,Math.ceil(current.length/46))} maxLength={4000} value={current} onChange={e=>apply(e.target.value)}/></label><p className="ee-small">{t('Switch the page language to edit the other language.','Verander die bladsytaal om die ander taal te redigeer.')}</p>{studio.state.edits[target.key]!==undefined&&<div className="ee-actions"><button type="button" className="ee-swatch" onClick={restore}>{t('Restore original wording','Herstel oorspronklike bewoording')}</button></div>}</>};
  }}>{children}</EditorShell>;
}
/** Drafts and backups, shown inside the shared "Details & saving" drawer. */
export function GardenDrafts({studio,af}:{studio:Studio;af:boolean}){
 const [name,setName]=useState('Our Garden wedding');const [saved,setSaved]=useState<{name:string;state:StudioState}[]>([]);const [message,setMessage]=useState('');const upload=useRef<HTMLInputElement>(null);
 const t=(en:string,a:string)=>af?a:en;
 useEffect(()=>{savedDrafts().then(setSaved).catch(()=>setMessage(t('Browser draft storage is unavailable. Download a backup instead.','Blaaierberging is nie beskikbaar nie. Laai ’n rugsteun af.')));},[]); // eslint-disable-line react-hooks/exhaustive-deps
 return <details open><summary>{t('Drafts & backups','Konsepte en rugsteun')}</summary>
  <label className="ee-field">{t('Draft name','Konsepnaam')}<input maxLength={60} value={name} onChange={e=>setName(e.target.value)}/></label>
  <div className="ee-actions"><button type="button" onClick={async()=>{try{await saveDraft(name.trim()||'Our Garden wedding',studio.state);setSaved(await savedDrafts());setMessage(t('Draft saved on this device, including your photos.','Konsep op hierdie toestel gestoor, met julle foto’s.'));}catch{setMessage(t('Could not save. Please download a backup.','Kon nie stoor nie. Laai asseblief ’n rugsteun af.'));}}}>{t('Save draft','Stoor konsep')}</button>
  <button type="button" onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,name,...studio.state},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ewig-garden-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>{t('Download backup','Laai rugsteun af')}</button>
  <button type="button" onClick={()=>upload.current?.click()}>{t('Import backup','Voer rugsteun in')}</button></div>
  <label className="ee-field">{t('Open a saved draft','Maak ’n gestoorde konsep oop')}<select value="" onChange={e=>{const item=saved.find(s=>s.name===e.target.value);if(item){studio.change(item.state);setName(item.name);setMessage(t('Draft opened.','Konsep oopgemaak.'));}}}><option value="">{t('Choose a saved draft…','Kies ’n gestoorde konsep…')}</option>{saved.map(d=><option key={d.name}>{d.name}</option>)}</select></label>
  <input ref={upload} hidden type="file" accept="application/json,.json" onChange={async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>40*1024*1024)throw Error();const data=JSON.parse(await file.text());if(data.version!==1||!data.draft||typeof data.edits!=='object'||!data.edits)throw Error();const next={...defaultGardenDraft};for(const key of Object.keys(next) as (keyof GardenDraft)[]){if(typeof data.draft[key]!=='string')throw Error();(next as Record<string,string>)[key]=data.draft[key].slice(0,2500);}if(!['sage','rose','olive'].includes(next.palette))throw Error();const edits:Record<string,string>={};for(const [key,val]of Object.entries(data.edits)){if(typeof val!=='string'||!(/^(en:|af:|image:)/.test(key)))throw Error();if(key.startsWith('image:')&&!/^data:image\/(png|jpeg|webp);base64,/.test(val))throw Error();edits[key]=val;}studio.change({draft:next,edits});setMessage(t('Backup imported.','Rugsteun ingevoer.'));}catch{setMessage(t('This is not a supported Garden draft file.','Hierdie is nie ’n ondersteunde Garden-konseplêer nie.'));}e.target.value='';}}/>
  <small>{t('Drafts live only in this browser. Save before leaving. The layout stays fixed.','Konsepte bestaan net in hierdie blaaier. Stoor voordat jy vertrek. Die uitleg bly vas.')}</small>
  {message&&<p className="ee-small" role="status">{message}</p>}
 </details>;
}
