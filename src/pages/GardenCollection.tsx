import { StudioCanvas, StudioTools, useGardenStudio } from '../collections/garden/GardenStudio';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Leaf, Menu, Pencil, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../i18n';
import { EternalRibbonIntro } from '../components/EternalRibbon';
import { CoupleDashboard } from '../components/couple/CoupleDashboard';
import { DemoRSVP } from '../components/couple/DemoRSVP';
import type { DemoGuest } from '../components/couple/guestModel';
import guestFixture from '../../concepts/garden/guests.demo.json';
import { GardenEditor } from '../collections/garden/GardenEditor';
import { defaultGardenDraft, gardenCopy, gardenImages, gardenManifest, gardenPalettes, validDate } from '../collections/garden/content';
import '../styles/garden-collection.css';

function GardenReveal({children,className=''}:{children:ReactNode;className?:string}) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced?false:{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.8,ease:[.22,.65,.3,1]}}>{children}</motion.div>;
}
const seedGuests = () => structuredClone(guestFixture.guests) as DemoGuest[];
type View = 'website' | 'invitation' | 'dashboard';

export default function GardenCollection() {
  const {language,setLanguage} = useLanguage();
  const af = language === 'af';
  const t = (en:string,afrikaans:string) => af ? afrikaans : en;
  const [search,setSearch] = useSearchParams();
  const requested = search.get('view');
  const view:View = requested==='invitation'||requested==='dashboard'?requested:'website';
  const studio = useGardenStudio();
  const draft=studio.state.draft;
  const setDraft=(next:typeof draft)=>studio.change({...studio.state,draft:next});
  const [editing,setEditing]=useState(false);
  const [selection,setSelection]=useState<{key:string;value:string;image:boolean}|null>(null);
  const [photo,setPhoto] = useState('');
  const photoRef = useRef('');
  const [photoError,setPhotoError] = useState(false);
  const [editor,setEditor] = useState(false);
  const [menu,setMenu] = useState(false);
  const [intro,setIntro] = useState(view==='invitation');
  const [replay,setReplay] = useState(0);
  const [guests,setGuests] = useState<DemoGuest[]>(seedGuests);
  const mainHeading = useRef<HTMLHeadingElement>(null);
  const copy = gardenCopy[language];
  const palette = gardenPalettes[draft.palette];
  const first = draft.first.trim()||'Clara', second = draft.second.trim()||'Ruben';
  const names = `${first} & ${second}`;
  const dateValue = validDate(draft.date)?draft.date:defaultGardenDraft.date;
  const dateObject = new Date(`${dateValue}T12:00:00Z`);
  const date = new Intl.DateTimeFormat(af?'af-ZA':'en-ZA',{day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Johannesburg'}).format(dateObject);
  const deadlineDate = new Date(dateObject); deadlineDate.setUTCDate(deadlineDate.getUTCDate()-30);
  const deadline = new Intl.DateTimeFormat(af?'af-ZA':'en-ZA',{day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Johannesburg'}).format(deadlineDate);
  const venue = draft.venue.trim()||'Die Varinghuis';
  const replaceNames = (text:string) => text.replaceAll('Clara',first).replaceAll('Ruben',second).replaceAll('Die Varinghuis',venue);
  const customStory = (af?draft.storyAf:draft.storyEn).trim();
  const story = customStory?customStory.split(/\n\s*\n/):copy.story.paragraphs.map(replaceNames);
  const customPhoto = photo&&!photoError?photo:'';
  const style = { '--garden-ink':palette.ink,'--garden-accent':palette.accent,'--garden-paper':palette.paper } as CSSProperties;

  useEffect(()=>{try{localStorage.setItem('ewig-garden-draft-v1',JSON.stringify(draft));}catch{/* Preview works without persistent storage. */}},[draft]);
  useEffect(()=>{setIntro(view==='invitation');setMenu(false);},[view]);
  useEffect(()=>{if(!intro)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[intro]);
  useEffect(()=>()=>{if(photoRef.current)URL.revokeObjectURL(photoRef.current);},[]);
  function changeView(next:View) { setSearch(next==='website'?{}:{view:next});window.scrollTo({top:0,behavior:'instant'}); }
  function scrollTo(id:string) { setMenu(false);document.getElementById(id)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }
  function finishIntro() { setIntro(false);requestAnimationFrame(()=>mainHeading.current?.focus({preventScroll:true})); }
  function reset() { studio.change({draft:{...defaultGardenDraft},edits:{}});if(photoRef.current)URL.revokeObjectURL(photoRef.current);photoRef.current='';setPhoto('');setPhotoError(false); }
  function setLocalPhoto(file:File) { const key=document.querySelector('.garden-welcome-photo img')?.getAttribute('data-studio-image');if(!key)return;const reader=new FileReader();reader.onload=()=>studio.change({...studio.state,edits:{...studio.state.edits,[key]:String(reader.result)}});reader.readAsDataURL(file); }
  const alt = (index:number) => gardenManifest.images[index].alt[language];

  return <div className="garden-collection" style={style} data-no-translate>
    <div inert={intro} aria-hidden={intro}>
      <div className="garden-preview-bar"><Link to="/collections" className="garden-back"><ArrowLeft size={15}/><span>{t('Designs','Ontwerpe')}</span></Link><span className="garden-preview-name">The Garden <i>{t('concept','konsep')}</i></span><nav aria-label={t('Explore this concept','Verken hierdie konsep')}>{(['website','invitation','dashboard'] as View[]).map(item=><button key={item} aria-current={view===item?'page':undefined} onClick={()=>changeView(item)}>{({website:t('Website','Webwerf'),invitation:t('Invitation','Uitnodiging'),dashboard:t('Dashboard','Paneel')})[item]}</button>)}</nav><button className="garden-edit-trigger" onClick={()=>{changeView('website');setEditing(true);}}><Pencil size={14}/>{t('Make it yours','Maak dit julle eie')}</button><div className="garden-language" aria-label={t('Language','Taal')}>{(['en','af'] as const).map(lang=><button aria-pressed={language===lang} key={lang} onClick={()=>setLanguage(lang)}>{lang.toUpperCase()}</button>)}</div></div>
      <StudioCanvas edits={studio.state.edits} active={editing} language={language} onEdit={(key,value,image)=>setSelection({key,value,image})}>
      {view==='website'&&<>
        <header className="garden-nav"><button className="garden-monogram" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>{first[0]}<i>&</i>{second[0]}</button><span>{t('A CELEBRATION OF US','’N VIERING VAN ONS')}</span><button className="garden-mobile-menu garden-icon-button" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-label={t('Wedding navigation','Trounavigasie')}>{menu?<X/>:<Menu/>}</button><nav className={menu?'is-open':''} aria-label={t('Wedding details','Troubesonderhede')}>{[['story',t('Our story','Ons storie')],['day',t('The day','Die dag')],['venue',t('The place','Die plek')],['rsvp','RSVP']].map(([id,label])=><button key={id} onClick={()=>scrollTo(`garden-${id}`)}>{label}</button>)}</nav></header>
        <section className="garden-welcome"><div className="garden-welcome-copy"><span className="garden-kicker">{t('TOGETHER WITH OUR FAMILIES','SAAM MET ONS FAMILIES')}</span><h1 ref={mainHeading} tabIndex={-1}>{first}<em>&</em>{second}</h1><div className="garden-welcome-note"><p className="garden-hero-date">{date}</p><p className="garden-hero-place">{venue} · {t('Elgin Valley','Elginvallei')}</p><button className="garden-button" onClick={()=>scrollTo('garden-rsvp')}>RSVP <ArrowUpRight size={17}/></button></div><small className="garden-welcome-caption">{t('WITH LOVE,','MET LIEFDE,')} {names}</small></div><div className="garden-welcome-photo"><picture><source media="(max-width: 700px)" srcSet={customPhoto||gardenImages.portrait}/><img src={customPhoto||gardenImages.hero} alt={customPhoto?t('Your selected preview photo','Julle gekose voorskoufoto'):alt(1)} fetchPriority="high" onError={()=>setPhotoError(true)}/></picture><span>{t('A DAY TO REMEMBER. A LIFE TOGETHER.','’N DAG OM TE ONTHOU. ’N LEWE SAAM.')}</span></div></section>
        <div className="garden-date-strip"><span>{venue}</span><Leaf size={16}/><span>{date}</span><Leaf size={16}/><span>{t('Garden vows. Glasshouse supper.','Tuinbeloftes. Glashuisaandete.')}</span></div>
        <section className="garden-section garden-story" id="garden-story"><GardenReveal className="garden-story-photo"><img src={customPhoto||gardenImages.portrait} alt={customPhoto?t('Your selected preview photo','Julle gekose voorskoufoto'):alt(0)} loading="lazy" onError={()=>setPhotoError(true)}/><span>{t('The best things grow slowly.','Die mooiste dinge groei stadig.')}</span></GardenReveal><GardenReveal className="garden-story-copy"><span className="garden-kicker">01 / {t('OUR STORY','ONS STORIE')}</span><h2>{customStory?t('A story that is ours.','’n Storie wat ons s’n is.'):copy.story.title}</h2>{story.slice(0,2).map((p,i)=><p key={i}>{p}</p>)}{story.length>2&&<details className="garden-story-more"><summary>{t('A little more of our story','Nog ’n stukkie van ons storie')}</summary>{story.slice(2).map((p,i)=><p key={i}>{p}</p>)}</details>}<span className="garden-handwritten">{t('And now, this next chapter.','En nou, hierdie volgende hoofstuk.')}</span></GardenReveal></section>
        <section className="garden-day" id="garden-day"><GardenReveal className="garden-day-heading"><span className="garden-kicker">02 / {t('THE DAY','DIE DAG')}</span><h2>{t('Nowhere to be.','Nêrens anders nie.')}<br/><em>{t('Except together.','Net hier, saam.')}</em></h2><p>{date}<br/>{t('All times South African Standard Time · UTC+2','Alle tye Suid-Afrikaanse Standaardtyd · UTC+2')}</p><img src={gardenImages.botanical} alt="" loading="lazy"/></GardenReveal><div className="garden-timeline">{copy.schedule.map((item,i)=><GardenReveal key={item.time}><div className="garden-timeline-item"><time>{item.time}</time><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><p>{item.description}</p></div></GardenReveal>)}</div></section>
        <section className="garden-section garden-venue" id="garden-venue"><GardenReveal><div className="garden-venue-heading"><div><span className="garden-kicker">03 / {t('THE PLACE','DIE PLEK')}</span><h2>{venue}</h2></div><span>{t('Elgin Valley, Western Cape','Elginvallei, Wes-Kaap')}<br/><small>{t('Fictional venue illustration','Voorstelling van ’n fiktiewe venue')}</small></span></div><figure><img src={gardenImages.venue} alt={alt(3)} loading="lazy"/><figcaption>{t('An orchard. An old glasshouse. A table with room for you.','’n Boord. ’n Ou glashuis. ’n Tafel met plek vir jou.')}</figcaption></figure><div className="garden-venue-copy">{copy.venue.map((p,i)=><p key={i}>{replaceNames(p)}</p>)}</div><p className="garden-demo-note">{t('This is an imagined venue. No real address, bookings or travel directions are provided.','Hierdie venue is denkbeeldig. Geen werklike adres, besprekings of padaanwysings word verskaf nie.')}</p></GardenReveal></section>
        <section className="garden-practical">{[{title:t('Garden formal','Tuinformeel'),copy:copy.dress},{title:t('Stay a little longer','Bly ’n bietjie langer'),copy:copy.stay[0],extra:copy.stay.slice(1)},{title:t('Your presence, please','Jou teenwoordigheid, asseblief'),copy:copy.gifts}].map((item,i)=><GardenReveal key={item.title}><span className="garden-kicker">0{i+1}</span><h3>{item.title}</h3><p>{item.copy}</p>{item.extra&&<details><summary>{t('Travel details','Reisbesonderhede')}</summary>{item.extra.map(p=><p key={p}>{p}</p>)}</details>}</GardenReveal>)}</section>
        <section className="garden-note"><img src={gardenImages.table} alt={alt(2)} loading="lazy"/><GardenReveal><span className="garden-kicker">{t('A LITTLE NOTE FROM US','’N KLEIN BOODSKAP VAN ONS')}</span><h2>{t('Come hungry.','Kom honger.')}<br/><em>{t('Leave room for pudding.','Hou plek vir poeding.')}</em></h2><p>{replaceNames(copy.note)}</p><span className="garden-handwritten">{t('With love,','Met liefde,')} {names}</span></GardenReveal></section>
        <section className="garden-section garden-questions"><GardenReveal><span className="garden-kicker">{t('THE LITTLE DETAILS','DIE KLEIN BESONDERHEDE')}</span><h2>{t('Wondering about','Wonder jy oor')}<br/><em>{t('anything?','iets?')}</em></h2></GardenReveal><div>{copy.questions.map((item,i)=><details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{i===8?t('In this demo, return to the RSVP form and update your preview response. A real wedding would use each guest’s private invitation link.','Keer in hierdie demo terug na die RSVP-vorm om jou voorbeeldantwoord by te werk. ’n Werklike troue sal elke gas se private uitnodigingskakel gebruik.'):item.answer.replaceAll(af?'16 September 2027':'16 September 2027',deadline)}</p></details>)}</div></section>
        <section className="garden-rsvp" id="garden-rsvp"><div className="garden-rsvp-image"><img src={gardenImages.botanical} alt={alt(4)} loading="lazy"/><span>{t('Good company. Full hearts.','Goeie geselskap. Vol harte.')}</span></div><DemoRSVP guests={guests} households={guestFixture.households} onChange={setGuests} af={af} deadline={deadline} onDashboard={()=>changeView('dashboard')}/></section>
      </>}
      {view==='dashboard'&&<CoupleDashboard guests={guests} names={names} af={af} onChange={setGuests} onReset={()=>setGuests(seedGuests())}/>}
      {view==='invitation'&&<section className="garden-invitation-view"><div className="garden-invitation-image"><img src={customPhoto||gardenImages.portrait} alt={customPhoto?t('Your selected photo','Julle gekose foto'):alt(0)} onError={()=>setPhotoError(true)}/></div><div className="garden-invitation-card"><span className="garden-kicker">{t('TOGETHER WITH OUR FAMILIES','SAAM MET ONS FAMILIES')}</span><h1 ref={mainHeading} tabIndex={-1}>{first} <em>&</em> {second}</h1><p>{t('Would love you to join us as we get married.','Nooi jou graag om ons troudag saam te vier.')}</p><Leaf size={23} strokeWidth={1}/><strong>{date}</strong><p>{venue} · {t('Elgin Valley','Elginvallei')}<br/>{t('Arrive at 15:00 · Ceremony at 15:30','Kom aan om 15:00 · Seremonie om 15:30')}</p><p>{t('Garden formal · Supper and dancing to follow','Tuinformeel · Aandete en dans ná die seremonie')}</p><button className="garden-button" onClick={()=>changeView('website')}>{t('Discover our day','Ontdek ons dag')} <ArrowUpRight size={17}/></button><button className="garden-text-button" onClick={()=>{setReplay(n=>n+1);setIntro(true);}}>{t('Open the envelope again','Maak die koevert weer oop')}</button></div></section>}
      <footer className="garden-footer"><span className="garden-footer-names">{names}</span><span>{t('Fictional wedding · Demonstration website by','Fiktiewe troue · Voorbeeldwebwerf deur')} <Link to="/">Ewig & Eie</Link></span><Link to="/contact?collection=The%20Garden%20Collection">{t('Let’s make your own.','Kom ons skep julle eie.')} <ArrowUpRight size={16}/></Link></footer>
      </StudioCanvas>
      <StudioTools studio={studio} af={af} active={editing} setActive={setEditing} selection={selection} setSelection={setSelection} onDetails={()=>setEditor(true)}/>
      <GardenEditor open={editor} onClose={()=>setEditor(false)} draft={draft} onChange={setDraft} af={af} onPhoto={setLocalPhoto} onReset={reset} photo={!!photo}/>
    </div>
    {intro&&<EternalRibbonIntro key={replay} coupleNames={names} initials={`${first[0]} & ${second[0]}`} weddingDate={date} language={language} theme={{ribbonColor:palette.ribbon,textColor:palette.ink,envelopeColor:palette.paper,backgroundColor:palette.paper}} skipForReturningGuests={false} onComplete={finishIntro}/>}
  </div>;
}
