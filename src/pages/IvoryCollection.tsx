import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { validDate } from '../collections/shared/dates';
import { ivoryGuests, ivoryHouseholds, ivorySeating, type Language } from '../collections/ivory/content';
import { DesignPlanNote } from '../components/DesignPlanNote';
import '../styles/plans.css';
import { IvoryEditor, useIvoryStudio } from '../collections/ivory/IvoryEditor';
import { IvoryRSVP } from '../collections/ivory/IvoryRSVP';
import { IvoryDashboard } from '../collections/ivory/IvoryDashboard';
import { EditorialGallery } from '../collections/ivory/EditorialGallery';
import { StationerySuite } from '../collections/ivory/Stationery';
import { publicFeatures } from '../config';
import { TodayMode, RosterPanel } from '../features/today/Today';
import { GuestCameraView } from '../features/camera/GuestCamera';
import type { Slot } from '../features/today/model';
import { Monogram, romanDate } from '../collections/ivory/Monogram';
import { DepthHero } from '../collections/ivory/DepthHero';
import { Ed, InlineEditProvider } from '../collections/ivory/InlineEdit';
import { autoSeat, invitedEventsFor } from '../collections/ivory/model';
import '../styles/garden-collection.css';
import '../styles/ivory-collection.css';

// The shared invitation opening loads only when a guest chooses to open it.
const EternalRibbonIntro = lazy(() => import('../components/EternalRibbon/EternalRibbonIntro').then(m => ({ default: m.EternalRibbonIntro })));
const ALL_VIEWS = ['invitation', 'website', 'stationery', 'dashboard', 'today', 'roster', 'camera'] as const;
type View = typeof ALL_VIEWS[number];
// Stationery is hidden for now (publicFeatures.ivoryStationery); the component stays for later.
const VIEWS = ALL_VIEWS.filter(v => v !== 'stationery' || publicFeatures.ivoryStationery);
// The roster is reached by its private link, not the toolbar.
const NAV_VIEWS = VIEWS.filter(v => v !== 'roster' && v !== 'camera'); // camera opens from Today mode

export default function IvoryCollection() {
  const { language, setLanguage } = useLanguage();
  const lang = language as Language;
  const t = (en: string, af: string) => lang === 'af' ? af : en;
  const [search, setSearch] = useSearchParams();
  // Every design opens on its invitation first; ?view=website shows the website.
  const view: View = (VIEWS as readonly string[]).includes(search.get('view') ?? '') ? search.get('view') as View : 'invitation';
  const household = ivoryHouseholds.some(h => h.id === search.get('household')) ? search.get('household')! : ivoryHouseholds[4].id;
  const studio = useIvoryStudio();
  const data = studio.state;
  const [editor, setEditor] = useState(false);
  const [guests, setGuests] = useState(ivoryGuests);
  const [seating, setSeating] = useState(ivorySeating);
  const [opening, setOpening] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [rsvpHousehold, setRsvpHousehold] = useState(household);
  const openButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!opening) return; const before = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = before; }; }, [opening]);
  useEffect(() => { setRevealed(false); }, [household]);
  // The envelope plays when the invitation is shown; with reduced motion the card is simply revealed.
  useEffect(() => { if (view !== 'invitation' || revealed) return; if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setRevealed(true); else setOpening(true); }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  const copy = (id: string) => data.text[id]?.[lang] ?? '';
  // On-page editable copy (inert outside edit mode).
  const C = (id: string) => <Ed target={{ kind: 'copy', id }}>{copy(id)}</Ed>;
  const [editing, setEditing] = useState(false);
  const locale = lang === 'af' ? 'af-ZA' : 'en-ZA';
  const formatDate = (iso: string, weekday = false) => validDate(iso) ? new Intl.DateTimeFormat(locale, { ...(weekday ? { weekday: 'long' } : {}), day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' }).format(new Date(`${iso}T12:00:00Z`)) : t('Date to be confirmed', 'Datum word bevestig');
  const short = (iso: string) => validDate(iso) ? new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Johannesburg' }).format(new Date(`${iso}T12:00:00Z`)) : '';
  const media = (id: string) => data.media.find(m => m.id === id)!;
  const photo = (id: string, opts: { eager?: boolean } = {}) => { const m = media(id); return <Ed block target={{ kind: 'photo', id }}><img src={m.src} alt={m.alt[lang]} style={{ objectPosition: m.focal }} loading={opts.eager ? 'eager' : 'lazy'} fetchPriority={opts.eager ? 'high' : 'auto'} decoding="async"/></Ed>; };
  const go = (next: View, params: Record<string, string> = {}) => { setSearch(next === 'invitation' ? params : { view: next, ...params }); window.scrollTo({ top: 0 }); };
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  const names = `${data.couple.first} & ${data.couple.second}`;
  const placeholders = data.media.some(m => m.placeholder);
  const style = { '--iv-paper': data.colors.paper, '--iv-stone': data.colors.stone, '--iv-ink': data.colors.ink, '--iv-accent': data.colors.accent, '--garden-ink': data.colors.ink, '--garden-paper': data.colors.paper, '--garden-accent': data.colors.accent, '--garden-serif': "'Cormorant Garamond', Georgia, serif" } as CSSProperties;
  const invitedHousehold = ivoryHouseholds.find(h => h.id === household)!;
  const invitedEvents = data.events.filter(e => invitedEventsFor(ivoryHouseholds, household).includes(e.id));
  // Today mode follows the couple's own schedule (visible moments only).
  const slots: Slot[] = data.events.flatMap(e => data.itinerary.filter(m => m.eventId === e.id && !m.hidden).map(m => ({ id: m.id, date: e.date, time: m.time, title: m.name[lang], place: m.note[lang] || e.location })));
  const mono = (size: number, date = false) => <Monogram left={data.monogram.left} right={data.monogram.right} style={data.monogram.style} size={size} date={date ? romanDate(data.date) : undefined}/>;

  return <div className={`ivory-collection${editing ? ' is-editing' : ''}`} style={style} data-no-translate lang={lang}>
    <InlineEditProvider studio={studio} active={editing && !opening} language={lang} onStyle={() => setEditor(true)} onDone={() => setEditing(false)}>
    <div inert={opening} aria-hidden={opening || undefined}>
      <header className="iv-toolbar">
        <Link to="/collections" className="iv-back">← {t('Collections', 'Kolleksies')}</Link>
        <span className="iv-brand">THE IVORY COLLECTION <small>· {t('flagship', 'vlagskip')}</small></span>
        <nav aria-label={t('Collection preview', 'Kolleksievoorskou')}>{NAV_VIEWS.map(v => <button type="button" key={v} aria-current={view === v ? 'page' : undefined} onClick={() => go(v, v === 'invitation' ? { household } : {})}>{{ website: t('Website', 'Webwerf'), invitation: t('Invitation', 'Uitnodiging'), stationery: t('Stationery', 'Skryfbehoeftes'), dashboard: t('Dashboard', 'Paneel'), today: t('Today', 'Vandag'), roster: t('Roster', 'Rooster'), camera: t('Camera', 'Kamera') }[v]}</button>)}</nav>
        <button type="button" className="iv-edit" aria-pressed={editing} onClick={() => setEditing(e => !e)}>{editing ? t('Finish editing', 'Klaar redigeer') : t('Make it yours', 'Maak dit julle eie')}</button>
        <div className="iv-lang" role="group" aria-label={t('Language', 'Taal')}>{(['en', 'af'] as const).map(l => <button type="button" key={l} aria-pressed={l === lang} onClick={() => setLanguage(l)}>{l.toUpperCase()}</button>)}</div>
      </header>
      <p className="iv-fiction" role="note">{t('Fictional design concept · Amélie, James and Maison Aveline are imagined', 'Fiktiewe ontwerpkonsep · Amélie, James en Maison Aveline is denkbeeldig')}{placeholders ? t(' · photographs are placeholder plates', ' · foto’s is plekhouerplate') : ''}</p>

      {view === 'website' && <>
        <DepthHero background={media('hero')} foreground={media('heroForeground')} depth={data.heroDepth} language={lang}>
          <div className="iv-hero-card">
            <p className="iv-kicker">{C('hero.kicker')}</p>
            <h1 id="iv-hero-names"><span><Ed target={{ kind: 'field', field: 'first' }}>{data.couple.first}</Ed></span><em>&</em><span><Ed target={{ kind: 'field', field: 'second' }}>{data.couple.second}</Ed></span></h1>
            <p className="iv-hero-date"><Ed target={{ kind: 'date', field: 'date', label: t('Edit wedding date', 'Redigeer troudatum') }}><time dateTime={data.date}>{formatDate(data.date, true)}</time></Ed></p>
            <p className="iv-hero-venue"><Ed target={{ kind: 'field', field: 'venue' }}>{data.venue}</Ed> <span>· <Ed target={{ kind: 'field', field: 'region' }}>{data.region}</Ed></span></p>
            <div className="iv-hero-actions"><button type="button" className="iv-button" onClick={() => scrollTo('iv-rsvp')}>RSVP · {t('by', 'teen')} {formatDate(data.deadline)}</button>{editing && <Ed target={{ kind: 'date', field: 'deadline', label: t('Reply deadline', 'Antwoordsperdatum') }}>{t('Reply deadline', 'Antwoordsperdatum')}</Ed>}</div>
            {editing && <p className="iv-hero-photo-edits"><Ed target={{ kind: 'photo', id: 'hero', label: t('Change cover photo', 'Verander voorbladfoto') }}>{t('Cover photo', 'Voorbladfoto')}</Ed><Ed target={{ kind: 'photo', id: 'heroForeground', label: t('Change foreground layer', 'Verander voorgrondlaag') }}>{t('Foreground layer', 'Voorgrondlaag')}</Ed></p>}
            <button type="button" className="iv-link iv-hero-more" onClick={() => scrollTo('iv-letter')}>{copy('hero.issue')} ↓</button>{editing && <Ed target={{ kind: 'copy', id: 'hero.issue' }}>{t('Edit link text', 'Redigeer skakelteks')}</Ed>}
          </div>
        </DepthHero>

        <section className="iv-letter iv-section" id="iv-letter" aria-labelledby="iv-letter-title">
          {mono(110)}
          <div><p className="iv-kicker">{C('letter.kicker')}</p><h2 id="iv-letter-title">{C('letter.title')}</h2><p className="iv-hero-line-quote">{C('hero.line')}</p><p className="iv-dropcap">{C('letter.body')}</p><p className="iv-sign">{C('letter.signoff')}<br/><span>{names}</span></p></div>
        </section>

        <section className="iv-story iv-section" aria-labelledby="iv-story-title">
          <figure className="iv-story-photo">{photo('portrait')}<figcaption><Ed target={{ kind: 'photo', id: 'portrait' }}>{media('portrait').caption[lang]}</Ed></figcaption></figure>
          <div className="iv-story-copy"><p className="iv-kicker">{C('story.kicker')}</p><h2 id="iv-story-title">{C('story.title')}</h2><blockquote>{C('story.quote')}</blockquote><div className="iv-columns"><p>{C('story.body1')}</p><p>{C('story.body2')}</p></div></div>
        </section>

        <section className="iv-weekend iv-section" id="iv-weekend" aria-labelledby="iv-weekend-title">
          <header className="iv-section-head"><p className="iv-kicker">{C('weekend.kicker')}</p><h2 id="iv-weekend-title">{C('weekend.title')}</h2><p>{C('weekend.intro')}</p></header>
          <ol className="iv-days">{data.events.map((event, i) => <li key={event.id} className="iv-day">
            <p className="iv-day-number" aria-hidden="true">{['I', 'II', 'III'][i]}</p>
            <h3><Ed target={{ kind: 'event', id: event.id, field: 'name' }}>{event.name[lang]}</Ed></h3>
            <p className="iv-day-date"><Ed target={{ kind: 'event', id: event.id, field: 'time', label: `${t('Edit date and time', 'Redigeer datum en tyd')}: ${event.name[lang]}` }}><time dateTime={event.date}>{short(event.date)}</time> · {event.time}</Ed></p>
            <p className="iv-day-place"><Ed target={{ kind: 'event', id: event.id, field: 'location' }}>{event.location}</Ed></p>
            <p><Ed target={{ kind: 'event', id: event.id, field: 'description' }}>{event.description[lang]}</Ed></p>
            <p className="iv-day-dress"><span>{t('Dress', 'Drag')}</span> <Ed target={{ kind: 'event', id: event.id, field: 'dress' }}>{event.dress[lang]}</Ed></p>
            <ul className="iv-moments">{data.itinerary.filter(m => m.eventId === event.id && (!m.hidden || editing)).sort((a, b) => a.time.localeCompare(b.time)).map(m => <li key={m.id} className={m.hidden ? 'iv-moment-hidden' : undefined}><Ed block target={{ kind: 'moment', id: m.id, label: `${t('Edit moment', 'Redigeer oomblik')}: ${m.time} ${m.name[lang]}` }}><time>{m.time}</time><span>{m.name[lang]}{m.note[lang] && <small>{m.note[lang]}</small>}{m.hidden && <small>{t('Hidden from guests', 'Versteek vir gaste')}</small>}</span></Ed></li>)}</ul>
          </li>)}</ol>
        </section>

        <section className="iv-venue" aria-labelledby="iv-venue-title">
          <figure>{photo('venue')}<figcaption><Ed target={{ kind: 'photo', id: 'venue' }}>{media('venue').caption[lang]}</Ed></figcaption></figure>
          <div className="iv-venue-copy"><p className="iv-kicker">{C('venue.kicker')} · {data.region}</p><h2 id="iv-venue-title"><Ed target={{ kind: 'field', field: 'venue' }}>{data.venue}</Ed></h2><p>{C('venue.body')}</p><p className="iv-small">{C('venue.access')}</p><p className="iv-fine">{t('Fictional venue. No address, booking or directions are provided.', 'Fiktiewe venue. Geen adres, bespreking of aanwysings word verskaf nie.')}</p></div>
        </section>

        <section className="iv-notes iv-section" aria-label={t('Practical notes', 'Praktiese notas')}>{['stay', 'travel', 'dress', 'gifts'].map(id => <article key={id}><h3>{C(`notes.${id}.title`)}</h3><p>{C(`notes.${id}.body`)}</p></article>)}</section>

        <section className="iv-section iv-gallery-section" aria-labelledby="iv-gallery-title">
          <header className="iv-section-head"><p className="iv-kicker">{C('gallery.kicker')}</p><h2 id="iv-gallery-title">{C('gallery.title')}</h2></header>
          <EditorialGallery media={data.media.filter(m => m.id !== 'hero' && m.id !== 'heroForeground')} language={lang} label={copy('gallery.title')} renderItem={editing ? (m, img) => <Ed block target={{ kind: 'photo', id: m.id }}>{img}</Ed> : undefined}/>
        </section>

        <section className="iv-faq iv-section" aria-labelledby="iv-faq-title"><p className="iv-kicker" id="iv-faq-title">{C('faq.kicker')}</p>{['children', 'events', 'weather', 'contact'].map(id => <details key={id} open={editing || undefined}><summary>{C(`faq.${id}.title`)}</summary><p>{C(`faq.${id}.body`)}</p></details>)}</section>

        <section className="iv-rsvp iv-section" id="iv-rsvp" aria-labelledby="iv-rsvp-title">
          <div className="iv-rsvp-intro"><p className="iv-kicker">{C('rsvp.kicker')} · {t('by', 'teen')} {formatDate(data.deadline)}</p><h2 id="iv-rsvp-title">{C('rsvp.title')}</h2><p>{C('rsvp.body')}</p><figure>{photo('detail')}</figure></div>
          <IvoryRSVP data={data} language={lang} guests={guests} households={ivoryHouseholds} household={rsvpHousehold} onHousehold={setRsvpHousehold} onChange={setGuests} onDashboard={() => go('dashboard')} formatDate={iso => formatDate(iso)}/>
        </section>
      </>}

      {view === 'invitation' && <section className="iv-invitation" aria-labelledby="iv-invite-title">
        <div className="iv-invite-controls">
          <p className="iv-kicker">{t('YOU ARE INVITED', 'JULLE IS GENOOI')}</p>
          <h1 id="iv-invite-title">{t('A weekend in the Winelands.', '’n Naweek in die Wynland.')}</h1>
          <p>{t('Open your invitation for the details, then discover the weekend.', 'Maak julle uitnodiging oop vir die besonderhede, en ontdek dan die naweek.')}</p>
          <div className="iv-invite-actions">
            <button type="button" ref={openButton} className="iv-button" onClick={() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setRevealed(true); return; } setOpening(true); }}>{revealed ? t('Replay the opening', 'Speel die opening weer') : t('Open the invitation', 'Maak die uitnodiging oop')}</button>
            {!revealed && <button type="button" className="iv-link" onClick={() => setRevealed(true)}>{t('Show the card without the opening', 'Wys die kaart sonder die opening')}</button>}
          </div>
        </div>
        <div className={`iv-envelope ${revealed ? 'is-revealed' : ''}`}>
          <div className="iv-envelope-back" aria-hidden="true"/>
          <article className="iv-invite-card" aria-hidden={!revealed} inert={!revealed}>
            {mono(118, true)}
            <p className="iv-card-small">{C('invitation.lead')}</p>
            <h2><Ed target={{ kind: 'field', field: 'first' }}>{data.couple.first}</Ed> <Ed target={{ kind: 'field', field: 'firstSurname' }}>{data.couple.firstSurname}</Ed><em>&</em><Ed target={{ kind: 'field', field: 'second' }}>{data.couple.second}</Ed> <Ed target={{ kind: 'field', field: 'secondSurname' }}>{data.couple.secondSurname}</Ed></h2>
            <p className="iv-card-small">{C('invitation.request')}<br/>{C('invitation.weekend')}</p>
            <p className="iv-card-date"><time dateTime={data.date}>{formatDate(data.date, true)}</time></p>
            <p className="iv-card-small">{data.venue} · {data.region}</p>
            <ul className="iv-card-events">{invitedEvents.map(e => <li key={e.id}><span>{e.name[lang]}</span>{short(e.date)} · {e.time}</li>)}</ul>
            <p className="iv-card-fine">{C('invitation.prepared')} <strong>{invitedHousehold.name}</strong> · {C('invitation.reply')} {formatDate(data.deadline)}</p>
            <button type="button" className="iv-button" onClick={() => go('website', { household })}>{t('Discover our day', 'Ontdek ons dag')}</button>
          </article>
          <div className="iv-envelope-front" aria-hidden="true">{!revealed && mono(64)}</div>
        </div>
      </section>}

      {view === 'stationery' && <section className="iv-stationery-view iv-section" aria-labelledby="iv-stationery-title">
        <header className="iv-section-head"><p className="iv-kicker">{t('COORDINATED DIGITAL STATIONERY', 'GEKOÖRDINEERDE DIGITALE SKRYFBEHOEFTES')}</p><h1 id="iv-stationery-title">{t('One identity, every touchpoint.', 'Een identiteit, elke raakpunt.')}</h1><p>{t('Names, dates, menu and monogram flow from the website editor into every piece. These are digital previews for screen and planning; print production is not included.', 'Name, datums, spyskaart en monogram vloei van die webwerfredigeerder na elke stuk. Dit is digitale voorskoue vir skerm en beplanning; drukwerk is nie ingesluit nie.')}</p></header>
        <StationerySuite data={data} language={lang} formatDate={iso => formatDate(iso)}/>
      </section>}

      {view === 'dashboard' && <IvoryDashboard data={data} language={lang} guests={guests} onGuests={setGuests} households={ivoryHouseholds} seating={seating} onSeating={setSeating} onReset={() => { setGuests(ivoryGuests()); setSeating(ivorySeating()); }} formatDate={iso => formatDate(iso)}/>}

      {view === 'today' && <TodayMode seatingFrom="wedding-dinner" seating={(() => { const seated = autoSeat(guests, data, seating); return { tables: data.tables.map(table => ({ name: table.name, guests: guests.filter(g => g.attendance === 'accepted' && seated[g.id] === table.id).map(g => g.name) })) }; })()} slots={slots} weddingId="ivory-demo" language={lang} names={names} onOpenRoster={() => go('roster')} extra={<button type="button" className="today-camera" onClick={() => go('camera')}>{t('Open the disposable camera · 20 shots', 'Maak die weggooikamera oop · 20 foto’s')}</button>}/>}
      {view === 'camera' && <GuestCameraView weddingId="ivory-demo" language={lang} names={names} guests={guests.map(g => ({ id: g.id, name: g.name }))}/>}
      {view === 'roster' && <RosterPanel slots={slots} weddingId="ivory-demo" language={lang} names={names}/>}

      {view !== 'today' && view !== 'roster' && view !== 'camera' && <DesignPlanNote design="ivory" af={lang === 'af'} className="iv-plan-note"/>}
      <footer className="iv-footer">{mono(56)}<p>{C('footer.note')}</p><small>{t('Fictional design concept by', 'Fiktiewe ontwerpkonsep deur')} <Link to="/">Ewig & Eie</Link></small></footer>
      <IvoryEditor studio={studio} open={editor} onClose={() => setEditor(false)} language={lang}/>
    </div>
    </InlineEditProvider>
    {opening && <Suspense fallback={null}><EternalRibbonIntro coupleNames={names} initials={`${data.monogram.left} & ${data.monogram.right}`} weddingDate={formatDate(data.date)} invitationWording={`${copy('invitation.lead')} · ${copy('invitation.request')}`} language={lang} storageKey="ewig-ivory-invitation-v1" skipForReturningGuests={false} fontFamily="'Cormorant Garamond', Georgia, serif" theme={{ envelopeColor: data.colors.paper, textColor: data.colors.ink, backgroundColor: data.colors.stone, ribbonColor: data.colors.accent }} onComplete={() => { setOpening(false); setRevealed(true); requestAnimationFrame(() => openButton.current?.focus()); }}/></Suspense>}
  </div>;
}
