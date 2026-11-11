import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../i18n';
import { EternalRibbonIntro } from '../components/EternalRibbon';
import { CoupleDashboard } from '../components/couple/CoupleDashboard';
import { midnightGuests } from '../collections/midnight/content';
import { DesignPlanNote } from '../components/DesignPlanNote';
import '../styles/plans.css';
import { MidnightEditor, useMidnightStudio } from '../collections/midnight/MidnightEditor';
import { Ed, MidnightInlineProvider } from '../collections/midnight/MidnightInline';
import { CinematicGallery } from '../collections/midnight/CinematicGallery';
import { MidnightRSVP } from '../collections/midnight/MidnightRSVP';
import { validDate } from '../collections/garden/content';
import { TodayMode, RosterPanel } from '../features/today/Today';
import { GuestCameraView } from '../features/camera/GuestCamera';
import { demoSeatingPlan, type Slot } from '../features/today/model';
import '../styles/garden-collection.css';
import '../styles/midnight-collection.css';
function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .7 }}>{children}</motion.div>;
}
export default function MidnightCollection() {
  const { language, setLanguage } = useLanguage();
  const af = language === 'af';
  const t = (en: string, a: string) => af ? a : en;
  const [search, setSearch] = useSearchParams();
  const requestedView = search.get('view');
  // Every design opens on its invitation first; ?view=website shows the website.
  const view = requestedView === 'dashboard' || requestedView === 'website' || requestedView === 'today' || requestedView === 'roster' || requestedView === 'camera' ? requestedView : 'invitation';
  const studio = useMidnightStudio();
  const data = studio.state;
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState(false);
  const [intro, setIntro] = useState(false);
  // The envelope plays when the invitation is shown (skipped when the visitor prefers less motion).
  useEffect(() => { if (view === 'invitation' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setIntro(true); }, [view]);
  const [guests, setGuests] = useState(midnightGuests);
  const openingTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!intro) return; const before = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = before; }; }, [intro]);
  const copy = (id: string) => data.text[id][language];
  const C = (id: string) => <Ed target={{ kind: 'copy', id }}>{copy(id)}</Ed>;
  const F = (field: 'first' | 'second' | 'venue' | 'region') => <Ed target={{ kind: 'field', field }}>{data[field]}</Ed>;
  const names = `${data.first} & ${data.second}`;
  // Today mode: the welcome evening plus the wedding-day schedule the couple set.
  const welcome = data.events.find(e => e.id === 'welcome');
  const slots: Slot[] = [...(welcome ? [{ id: 'welcome', date: welcome.date, time: welcome.time, title: welcome.name[language], place: welcome.location }] : []), ...data.schedule.map(item => ({ id: item.id, date: data.date, time: item.time, title: item.name[language], place: data.events.find(e => e.id === 'wedding')?.location }))];
  const date = (value: string) => validDate(value) ? new Intl.DateTimeFormat(af ? 'af-ZA' : 'en-ZA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' }).format(new Date(`${value}T12:00:00Z`)) : t('Choose a date', 'Kies ’n datum');
  const media = (id: string) => data.media.find(m => m.id === id)!;
  const photo = (id: string, eager = false, editable = true) => { const m = media(id); const img = <img src={m.src} alt={m.alt[language]} style={{ objectPosition: m.focal }} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'}/>; return editable ? <Ed block target={{ kind: 'photo', id }}>{img}</Ed> : img; };
  const changeView = (value: string) => { setSearch(value === 'invitation' ? {} : { view: value }); window.scrollTo({ top: 0 }); };
  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  const style = { '--mid-bg': data.colors.background, '--mid-text': data.colors.text, '--mid-accent': data.colors.accent, '--garden-ink': data.colors.text, '--garden-paper': data.colors.background, '--garden-accent': data.colors.accent, '--garden-serif': "'Cormorant Garamond', Georgia, serif" } as CSSProperties;
  return <div className={`midnight-collection${editing ? ' is-editing' : ''}`} style={style} data-no-translate>
    <MidnightInlineProvider studio={studio} active={editing && view === 'website' && !intro} language={language} onDetails={() => setEditor(true)} onDone={() => setEditing(false)}>
    <div inert={intro} aria-hidden={intro}>
      <header className="mid-toolbar"><Link to="/collections">← {t('Collections', 'Kolleksies')}</Link><span className="mid-brand">THE MIDNIGHT COLLECTION</span><nav aria-label={t('Collection preview', 'Kolleksievoorskou')}>{(['invitation','website','dashboard','today'] as const).map(v => <button key={v} aria-current={view === v ? 'page' : undefined} onClick={() => changeView(v)}>{v === 'website' ? t('Website', 'Webwerf') : v === 'invitation' ? t('Invitation', 'Uitnodiging') : v === 'today' ? t('Today', 'Vandag') : t('Dashboard', 'Paneel')}</button>)}</nav><button aria-pressed={editing} onClick={() => { changeView('website'); setEditing(e => !e); }}>{editing ? t('Finish editing', 'Klaar redigeer') : t('Make it yours', 'Maak dit julle eie')}</button><div className="mid-languages">{(['en','af'] as const).map(l => <button key={l} aria-pressed={l === language} onClick={() => setLanguage(l)}>{l.toUpperCase()}</button>)}</div></header>
      {view === 'website' && <>
        <section className="mid-hero">{photo('hero', true, false)}<div className="mid-hero-shade"/><div className="mid-hero-top"><span>{data.first.split(' ')[0][0]} & {data.second.split(' ')[0][0]}</span><nav aria-label={t('Wedding sections', 'Trouafdelings')}><button onClick={() => scroll('mid-story')}>{t('Our story', 'Ons storie')}</button><button onClick={() => scroll('mid-evening')}>{t('The evening', 'Die aand')}</button><button onClick={() => scroll('mid-gallery')}>{t('Gallery', 'Galery')}</button></nav></div><div className="mid-hero-copy"><span className="mid-kicker">{C('hero.eyebrow')}</span><h1><span>{F('first')}</span><em>&</em><span>{F('second')}</span></h1><p><Ed target={{ kind: 'date', field: 'date' }}>{date(data.date)}</Ed> <span> / </span> {F('venue')}, {F('region')}</p><button className="mid-primary" onClick={() => scroll('mid-rsvp')}>RSVP ↗</button>{editing && <p className="mid-hero-edits"><Ed target={{ kind: 'photo', id: 'hero', label: t('Change cover photo', 'Verander voorbladfoto') }}>{t('Cover photo', 'Voorbladfoto')}</Ed> <Ed target={{ kind: 'date', field: 'deadline', label: t('Change reply deadline', 'Verander antwoordsperdatum') }}>{t('Reply deadline', 'Antwoordsperdatum')}</Ed></p>}</div><div className="mid-hero-bottom"><span>{C('hero.note')}</span><button onClick={() => scroll('mid-story')}>{t('Our next chapter', 'Ons volgende hoofstuk')} ↓</button></div></section>
        <p className="mid-concept-label">{t('FICTIONAL DESIGN CONCEPT · IMAGINED COUPLE & VENUE', 'FIKTIEWE ONTWERPKONSEP · DENKBEELDIGE PAARTJIE EN VENUE')}</p>
        <section className="mid-section" id="mid-story"><Reveal className="mid-intro"><span className="mid-kicker">01 / {t('THE STORY', 'DIE STORIE')}</span><h2>{C('story.title')}</h2><p>{C('story.intro')}</p></Reveal>{[['beginning','portrait'],['promise','detail'],['evening','table']].map(([id, image], i) => <Reveal className={`mid-chapter mid-chapter-${i}`} key={id}><div className="mid-chapter-photo">{photo(image)}<span>{media(image).caption[language]}</span></div><div className="mid-chapter-copy"><span className="mid-kicker">{t('CHAPTER', 'HOOFSTUK')} {['I','II','III'][i]}</span><h3>{C(`chapter.${id}.title`)}</h3><p>{C(`chapter.${id}.body`)}</p><span className="mid-chapter-number" aria-hidden="true">0{i + 1}</span></div></Reveal>)}</section>
        <section className="mid-evening mid-section" id="mid-evening"><Reveal className="mid-intro"><span className="mid-kicker">02 / {t('THE GATHERING', 'DIE SAMEKOMS')}</span><h2>{C('schedule.title')}</h2></Reveal><div className="mid-event-grid">{data.events.map(event => <article key={event.id}><span className="mid-kicker"><Ed target={{ kind: 'event', id: event.id, field: 'when' }}>{date(event.date)} · {event.time}</Ed></span><h3><Ed target={{ kind: 'event', id: event.id, field: 'name' }}>{event.name[language]}</Ed></h3><p><Ed target={{ kind: 'event', id: event.id, field: 'location' }}>{event.location}</Ed></p><p><Ed target={{ kind: 'event', id: event.id, field: 'description' }}>{event.description[language]}</Ed></p></article>)}</div><div className="mid-timeline"><p>{date(data.date)}<br/><small>{t('All times SAST · UTC+2', 'Alle tye SAST · UTC+2')}</small></p><ol>{data.schedule.map(item => <li key={item.id}><Ed target={{ kind: 'schedule', id: item.id }}><time>{item.time}</time><span>{item.name[language]}</span></Ed></li>)}</ol></div></section>
        <section className="mid-venue"><div>{photo('venue')}</div><Reveal><span className="mid-kicker">{F('region')}</span><h2>{F('venue')}</h2><p>{C('venue.body')}</p><small>{t('Fictional venue illustration. No address, booking or travel directions are provided.', 'Fiktiewe venuevoorstelling. Geen adres, bespreking of padaanwysings word verskaf nie.')}</small></Reveal></section>
        <section className="mid-practical mid-section">{['dress','travel','gifts'].map(id => <article key={id}><h3>{C(`details.${id}.title`)}</h3><p>{C(`details.${id}.body`)}</p></article>)}</section>
        <section className="mid-section" id="mid-gallery"><Reveal className="mid-intro"><span className="mid-kicker">03 / {t('THE STILL FRAMES', 'DIE STILBEELDE')}</span><h2>{C('gallery.title')}</h2></Reveal><CinematicGallery media={data.media} language={language}/></section>
        <section className="mid-faq mid-section">{['children','contact'].map(id => <details key={id} open={editing || undefined}><summary>{C(`faq.${id}.title`)}</summary><p>{C(`faq.${id}.body`)}</p></details>)}</section>
        <section className="mid-rsvp mid-section" id="mid-rsvp"><div><span className="mid-kicker">04 / RSVP · {date(data.deadline)}</span><h2>{C('rsvp.title')}</h2><p>{C('rsvp.body')}</p></div><MidnightRSVP data={data} language={language} guests={guests} onChange={setGuests} onDashboard={() => changeView('dashboard')}/></section>
      </>}
      {view === 'dashboard' && <CoupleDashboard guests={guests} onChange={setGuests} names={names} af={af} onReset={() => setGuests(midnightGuests())} collection="midnight" events={data.events.map(e => ({ id: e.id, label: e.name[language] }))} meals={data.meals.map(m => ({ id: m.id, label: m.name[language] }))}/>}
      {view === 'invitation' && <section className="mid-invitation"><div>{photo('portrait', true)}</div><article><span className="mid-kicker">{C('hero.eyebrow')}</span><h1>{data.first}<em>&</em>{data.second}</h1><p>{C('invitation.wording')}</p><p>{date(data.date)} · {data.events.find(e => e.id === 'wedding')?.time}<br/>{data.venue}, {data.region}</p><button className="mid-primary" onClick={() => changeView('website')}>{t('Discover our day', 'Ontdek ons dag')} ↗</button><button ref={openingTrigger} onClick={() => setIntro(true)}>{t('Open the envelope again', 'Maak die koevert weer oop')}</button></article></section>}
      {view === 'today' && <TodayMode seatingFrom="supper" seating={demoSeatingPlan(guests.filter(g => g.attendance !== 'declined').map(g => g.name), ['Candle', 'Ember', 'Velvet', 'Starlight', 'Moon'], 6)} slots={slots} weddingId="midnight-demo" language={language} names={names} onOpenRoster={() => changeView('roster')} extra={<button type="button" className="today-camera" onClick={() => changeView('camera')}>{t('Open the disposable camera · add-on', 'Maak die weggooikamera oop · byvoeging')}</button>}/>}
      {view === 'camera' && <GuestCameraView weddingId="midnight-demo" language={language} names={names} guests={guests.map(g => ({ id: g.id, name: g.name }))} addOn/>}
      {view === 'roster' && <RosterPanel slots={slots} weddingId="midnight-demo" language={language} names={names}/>}
      {view !== 'today' && view !== 'roster' && view !== 'camera' && <DesignPlanNote design="midnight" af={af} className="mid-plan-note"/>}
      <footer className="mid-footer"><span>{names}</span><p>{C('footer.note')}</p><small>{t('Fictional design concept by', 'Fiktiewe ontwerpkonsep deur')} <Link to="/">Ewig & Eie</Link></small></footer>
      <MidnightEditor studio={studio} open={editor} onClose={() => setEditor(false)} language={language}/>
    </div>
    </MidnightInlineProvider>
    {intro && <EternalRibbonIntro coupleNames={names} initials={`${data.first[0] ?? ''} & ${data.second[0] ?? ''}`} weddingDate={date(data.date)} invitationWording={copy('invitation.wording')} language={language} storageKey="ewig-midnight-invitation-v1" skipForReturningGuests={false} theme={{ envelopeColor: data.colors.text, textColor: data.colors.background, backgroundColor: data.colors.background, ribbonColor: data.colors.accent }} onComplete={() => { setIntro(false); requestAnimationFrame(() => openingTrigger.current?.focus()); }}/ >}
  </div>;
}
