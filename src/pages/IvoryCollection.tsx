import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { validDate } from '../collections/shared/dates';
import { ivoryGuests, ivoryHouseholds, ivoryPackage, ivorySeating, type Language } from '../collections/ivory/content';
import { IvoryEditor, useIvoryStudio } from '../collections/ivory/IvoryEditor';
import { IvoryRSVP } from '../collections/ivory/IvoryRSVP';
import { IvoryDashboard } from '../collections/ivory/IvoryDashboard';
import { EditorialGallery } from '../collections/ivory/EditorialGallery';
import { StationerySuite } from '../collections/ivory/Stationery';
import { Monogram, romanDate } from '../collections/ivory/Monogram';
import { DepthHero } from '../collections/ivory/DepthHero';
import { invitedEventsFor } from '../collections/ivory/model';
import '../styles/garden-collection.css';
import '../styles/ivory-collection.css';

// The shared invitation opening loads only when a guest chooses to open it.
const EternalRibbonIntro = lazy(() => import('../components/EternalRibbon/EternalRibbonIntro').then(m => ({ default: m.EternalRibbonIntro })));
const VIEWS = ['website', 'invitation', 'stationery', 'dashboard'] as const;
type View = typeof VIEWS[number];

export default function IvoryCollection() {
  const { language, setLanguage } = useLanguage();
  const lang = language as Language;
  const t = (en: string, af: string) => lang === 'af' ? af : en;
  const [search, setSearch] = useSearchParams();
  const view: View = (VIEWS as readonly string[]).includes(search.get('view') ?? '') ? search.get('view') as View : 'website';
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

  const copy = (id: string) => data.text[id]?.[lang] ?? '';
  const locale = lang === 'af' ? 'af-ZA' : 'en-ZA';
  const formatDate = (iso: string, weekday = false) => validDate(iso) ? new Intl.DateTimeFormat(locale, { ...(weekday ? { weekday: 'long' } : {}), day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' }).format(new Date(`${iso}T12:00:00Z`)) : t('Date to be confirmed', 'Datum word bevestig');
  const short = (iso: string) => validDate(iso) ? new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Johannesburg' }).format(new Date(`${iso}T12:00:00Z`)) : '';
  const media = (id: string) => data.media.find(m => m.id === id)!;
  const photo = (id: string, opts: { eager?: boolean } = {}) => { const m = media(id); return <img src={m.src} alt={m.alt[lang]} style={{ objectPosition: m.focal }} loading={opts.eager ? 'eager' : 'lazy'} fetchPriority={opts.eager ? 'high' : 'auto'} decoding="async"/>; };
  const go = (next: View, params: Record<string, string> = {}) => { setSearch(next === 'website' ? params : { view: next, ...params }); window.scrollTo({ top: 0 }); };
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  const names = `${data.couple.first} & ${data.couple.second}`;
  const placeholders = data.media.some(m => m.placeholder);
  const style = { '--iv-paper': data.colors.paper, '--iv-stone': data.colors.stone, '--iv-ink': data.colors.ink, '--iv-accent': data.colors.accent, '--garden-ink': data.colors.ink, '--garden-paper': data.colors.paper, '--garden-accent': data.colors.accent, '--garden-serif': "'Cormorant Garamond', Georgia, serif" } as CSSProperties;
  const invitedHousehold = ivoryHouseholds.find(h => h.id === household)!;
  const invitedEvents = data.events.filter(e => invitedEventsFor(ivoryHouseholds, household).includes(e.id));
  const mono = (size: number, date = false) => <Monogram left={data.monogram.left} right={data.monogram.right} style={data.monogram.style} size={size} date={date ? romanDate(data.date) : undefined}/>;

  return <div className="ivory-collection" style={style} data-no-translate lang={lang}>
    <div inert={opening} aria-hidden={opening || undefined}>
      <header className="iv-toolbar">
        <Link to="/collections" className="iv-back">← {t('Collections', 'Kolleksies')}</Link>
        <span className="iv-brand">THE IVORY COLLECTION <small>· {t('flagship', 'vlagskip')}</small></span>
        <nav aria-label={t('Collection preview', 'Kolleksievoorskou')}>{VIEWS.map(v => <button type="button" key={v} aria-current={view === v ? 'page' : undefined} onClick={() => go(v, v === 'invitation' ? { household } : {})}>{{ website: t('Website', 'Webwerf'), invitation: t('Invitation', 'Uitnodiging'), stationery: t('Stationery', 'Skryfbehoeftes'), dashboard: t('Dashboard', 'Paneel') }[v]}</button>)}</nav>
        <button type="button" className="iv-edit" onClick={() => setEditor(true)}>{t('Make it yours', 'Maak dit julle eie')}</button>
        <div className="iv-lang" role="group" aria-label={t('Language', 'Taal')}>{(['en', 'af'] as const).map(l => <button type="button" key={l} aria-pressed={l === lang} onClick={() => setLanguage(l)}>{l.toUpperCase()}</button>)}</div>
      </header>
      <p className="iv-fiction" role="note">{t('Fictional design concept · Amélie, James and Maison Aveline are imagined', 'Fiktiewe ontwerpkonsep · Amélie, James en Maison Aveline is denkbeeldig')}{placeholders ? t(' · photographs are placeholder plates', ' · foto’s is plekhouerplate') : ''}</p>

      {view === 'website' && <>
        <DepthHero background={media('hero')} foreground={media('heroForeground')} depth={data.heroDepth} language={lang}>
          <div className="iv-hero-card">
            <p className="iv-kicker">{copy('hero.kicker')}</p>
            <h1 id="iv-hero-names"><span>{data.couple.first}</span><em>&</em><span>{data.couple.second}</span></h1>
            <p className="iv-hero-date"><time dateTime={data.date}>{formatDate(data.date, true)}</time></p>
            <p className="iv-hero-venue">{data.venue} <span>· {data.region}</span></p>
            <div className="iv-hero-actions"><button type="button" className="iv-button" onClick={() => scrollTo('iv-rsvp')}>RSVP · {t('by', 'teen')} {formatDate(data.deadline)}</button></div>
            <button type="button" className="iv-link iv-hero-more" onClick={() => scrollTo('iv-letter')}>{copy('hero.issue')} ↓</button>
          </div>
        </DepthHero>

        <section className="iv-letter iv-section" id="iv-letter" aria-labelledby="iv-letter-title">
          {mono(110)}
          <div><p className="iv-kicker">{copy('letter.kicker')}</p><h2 id="iv-letter-title">{copy('letter.title')}</h2><p className="iv-hero-line-quote">{copy('hero.line')}</p><p className="iv-dropcap">{copy('letter.body')}</p><p className="iv-sign">{copy('letter.signoff')}<br/><span>{names}</span></p></div>
        </section>

        <section className="iv-story iv-section" aria-labelledby="iv-story-title">
          <figure className="iv-story-photo">{photo('portrait')}<figcaption>{media('portrait').caption[lang]}</figcaption></figure>
          <div className="iv-story-copy"><p className="iv-kicker">{copy('story.kicker')}</p><h2 id="iv-story-title">{copy('story.title')}</h2><blockquote>{copy('story.quote')}</blockquote><div className="iv-columns"><p>{copy('story.body1')}</p><p>{copy('story.body2')}</p></div></div>
        </section>

        <section className="iv-weekend iv-section" id="iv-weekend" aria-labelledby="iv-weekend-title">
          <header className="iv-section-head"><p className="iv-kicker">{copy('weekend.kicker')}</p><h2 id="iv-weekend-title">{copy('weekend.title')}</h2><p>{copy('weekend.intro')}</p></header>
          <ol className="iv-days">{data.events.map((event, i) => <li key={event.id} className="iv-day">
            <p className="iv-day-number" aria-hidden="true">{['I', 'II', 'III'][i]}</p>
            <h3>{event.name[lang]}</h3>
            <p className="iv-day-date"><time dateTime={event.date}>{short(event.date)}</time> · {event.time}</p>
            <p className="iv-day-place">{event.location}</p>
            <p>{event.description[lang]}</p>
            <p className="iv-day-dress"><span>{t('Dress', 'Drag')}</span> {event.dress[lang]}</p>
            <ul className="iv-moments">{data.itinerary.filter(m => m.eventId === event.id && !m.hidden).sort((a, b) => a.time.localeCompare(b.time)).map(m => <li key={m.id}><time>{m.time}</time><span>{m.name[lang]}{m.note[lang] && <small>{m.note[lang]}</small>}</span></li>)}</ul>
          </li>)}</ol>
        </section>

        <section className="iv-venue" aria-labelledby="iv-venue-title">
          <figure>{photo('venue')}<figcaption>{media('venue').caption[lang]}</figcaption></figure>
          <div className="iv-venue-copy"><p className="iv-kicker">{copy('venue.kicker')} · {data.region}</p><h2 id="iv-venue-title">{data.venue}</h2><p>{copy('venue.body')}</p><p className="iv-small">{copy('venue.access')}</p><p className="iv-fine">{t('Fictional venue. No address, booking or directions are provided.', 'Fiktiewe venue. Geen adres, bespreking of aanwysings word verskaf nie.')}</p></div>
        </section>

        <section className="iv-notes iv-section" aria-label={t('Practical notes', 'Praktiese notas')}>{['stay', 'travel', 'dress', 'gifts'].map(id => <article key={id}><h3>{copy(`notes.${id}.title`)}</h3><p>{copy(`notes.${id}.body`)}</p></article>)}</section>

        <section className="iv-section iv-gallery-section" aria-labelledby="iv-gallery-title">
          <header className="iv-section-head"><p className="iv-kicker">{copy('gallery.kicker')}</p><h2 id="iv-gallery-title">{copy('gallery.title')}</h2></header>
          <EditorialGallery media={data.media.filter(m => m.id !== 'hero' && m.id !== 'heroForeground')} language={lang} label={copy('gallery.title')}/>
        </section>

        <section className="iv-faq iv-section" aria-labelledby="iv-faq-title"><p className="iv-kicker" id="iv-faq-title">{copy('faq.kicker')}</p>{['children', 'events', 'weather', 'contact'].map(id => <details key={id}><summary>{copy(`faq.${id}.title`)}</summary><p>{copy(`faq.${id}.body`)}</p></details>)}</section>

        <section className="iv-rsvp iv-section" id="iv-rsvp" aria-labelledby="iv-rsvp-title">
          <div className="iv-rsvp-intro"><p className="iv-kicker">{copy('rsvp.kicker')} · {t('by', 'teen')} {formatDate(data.deadline)}</p><h2 id="iv-rsvp-title">{copy('rsvp.title')}</h2><p>{copy('rsvp.body')}</p><figure>{photo('detail')}</figure></div>
          <IvoryRSVP data={data} language={lang} guests={guests} households={ivoryHouseholds} household={rsvpHousehold} onHousehold={setRsvpHousehold} onChange={setGuests} onDashboard={() => go('dashboard')} formatDate={iso => formatDate(iso)}/>
        </section>
      </>}

      {view === 'invitation' && <section className="iv-invitation" aria-labelledby="iv-invite-title">
        <div className="iv-invite-controls">
          <p className="iv-kicker">{t('PERSONALISED INVITATION', 'GEPERSONALISEERDE UITNODIGING')}</p>
          <h1 id="iv-invite-title">{t('One invitation per household.', 'Een uitnodiging per huishouding.')}</h1>
          <p>{t('Each household sees its own name and only the gatherings it is invited to.', 'Elke huishouding sien sy eie naam en net die geleenthede waarna hy genooi is.')}</p>
          <label className="iv-field">{t('Preview for', 'Voorskou vir')}<select value={household} onChange={e => setSearch({ view: 'invitation', household: e.target.value }, { replace: true })}>{ivoryHouseholds.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></label>
          <div className="iv-invite-actions">
            <button type="button" ref={openButton} className="iv-button" onClick={() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setRevealed(true); return; } setOpening(true); }}>{revealed ? t('Replay the opening', 'Speel die opening weer') : t('Open the invitation', 'Maak die uitnodiging oop')}</button>
            {!revealed && <button type="button" className="iv-link" onClick={() => setRevealed(true)}>{t('Show the card without the opening', 'Wys die kaart sonder die opening')}</button>}
          </div>
          <p className="iv-fine">{t('Simulated. Real private links per household need a production backend.', 'Gesimuleer. Werklike private skakels per huishouding benodig ’n produksiebediener.')}</p>
        </div>
        <div className={`iv-envelope ${revealed ? 'is-revealed' : ''}`}>
          <div className="iv-envelope-back" aria-hidden="true"/>
          <article className="iv-invite-card" aria-hidden={!revealed} inert={!revealed}>
            {mono(118, true)}
            <p className="iv-card-small">{copy('invitation.lead')}</p>
            <h2>{data.couple.first} {data.couple.firstSurname}<em>&</em>{data.couple.second} {data.couple.secondSurname}</h2>
            <p className="iv-card-small">{copy('invitation.request')}<br/>{copy('invitation.weekend')}</p>
            <p className="iv-card-date"><time dateTime={data.date}>{formatDate(data.date, true)}</time></p>
            <p className="iv-card-small">{data.venue} · {data.region}</p>
            <ul className="iv-card-events">{invitedEvents.map(e => <li key={e.id}><span>{e.name[lang]}</span>{short(e.date)} · {e.time}</li>)}</ul>
            <p className="iv-card-fine">{copy('invitation.prepared')} <strong>{invitedHousehold.name}</strong> · {copy('invitation.reply')} {formatDate(data.deadline)}</p>
            <button type="button" className="iv-button" onClick={() => go('website', { household })}>{t('Reply & weekend details', 'Antwoord en naweekbesonderhede')}</button>
          </article>
          <div className="iv-envelope-front" aria-hidden="true">{!revealed && mono(64)}</div>
        </div>
      </section>}

      {view === 'stationery' && <section className="iv-stationery-view iv-section" aria-labelledby="iv-stationery-title">
        <header className="iv-section-head"><p className="iv-kicker">{t('COORDINATED DIGITAL STATIONERY', 'GEKOÖRDINEERDE DIGITALE SKRYFBEHOEFTES')}</p><h1 id="iv-stationery-title">{t('One identity, every touchpoint.', 'Een identiteit, elke raakpunt.')}</h1><p>{t('Names, dates, menu and monogram flow from the website editor into every piece. These are digital previews for screen and planning; print production is not included.', 'Name, datums, spyskaart en monogram vloei van die webwerfredigeerder na elke stuk. Dit is digitale voorskoue vir skerm en beplanning; drukwerk is nie ingesluit nie.')}</p></header>
        <StationerySuite data={data} language={lang} formatDate={iso => formatDate(iso)}/>
      </section>}

      {view === 'dashboard' && <IvoryDashboard data={data} language={lang} guests={guests} onGuests={setGuests} households={ivoryHouseholds} seating={seating} onSeating={setSeating} onReset={() => { setGuests(ivoryGuests()); setSeating(ivorySeating()); }} formatDate={iso => formatDate(iso)}/>}

      <section className="iv-scope" aria-labelledby="iv-scope-title">
        <div className="iv-scope-price">
          <p className="iv-kicker">EWIG & EIE · IVORY · {t('FLAGSHIP', 'VLAGSKIP')}</p>
          <h2 id="iv-scope-title">R{ivoryPackage.price.toLocaleString('en-ZA')}</h2>
          <p>{t('Wedding-weekend website package', 'Trounaweek-webwerfpakket')}</p>
          <Link className="iv-button" to="/contact?collection=The%20Ivory%20Collection">{t('Enquire about Ivory', 'Doen navraag oor Ivory')}</Link>
          <p className="iv-fine">{t(`Planned venue-partner price: R${ivoryPackage.plannedPartnerPrice.toLocaleString('en-ZA')}. Not yet available — it activates only once real venue agreements exist.`, `Beplande venuevennootprys: R${ivoryPackage.plannedPartnerPrice.toLocaleString('en-ZA')}. Nog nie beskikbaar nie — dit word eers geaktiveer wanneer werklike venue-ooreenkomste bestaan.`)}</p>
        </div>
        <div className="iv-scope-list">
          <h3>{t('Everything in Garden and Midnight, plus the weekend.', 'Alles in Garden en Midnight, plus die naweek.')}</h3>
          <ul>
            <li>{t('Bilingual editorial website with photographic cover, story, venue, gallery and FAQ', 'Tweetalige redaksionele webwerf met fotografiese voorblad, storie, venue, galery en vrae')}</li>
            <li>{t('Three-event weekend itinerary with dress notes and timed moments', 'Drie-geleentheid-naweekprogram met dragnotas en getydde oomblikke')}</li>
            <li>{t('Household invitations with event access per household', 'Huishoudinguitnodigings met geleentheidstoegang per huishouding')}</li>
            <li>{t('Replies per person, per event; dinner choices; dietary, allergy and access summaries', 'Antwoorde per persoon, per geleentheid; etekeuses; dieet-, allergie- en toegangsopsommings')}</li>
            <li>{t('Seating-plan tool with capacity and household checks', 'Sitplekplan-instrument met kapasiteit- en huishoudingkontroles')}</li>
            <li>{t('Planner exports: replies, catering, seating and run sheet', 'Beplanneruitvoer: antwoorde, spysenering, sitplekke en program')}</li>
            <li>{t('Personalised monogram, card-reveal invitation and coordinated digital stationery preview', 'Gepersonaliseerde monogram, kaartonthullingsuitnodiging en gekoördineerde digitale skryfbehoeftevoorskou')}</li>
          </ul>
          <h3>{t('Proposed service scope', 'Voorgestelde diensomvang')}</h3>
          <p>{t('A design consultation, assisted content setup and three consolidated revision rounds.', '’n Ontwerpkonsultasie, bygestane inhoudopstelling en drie saamgevoegde hersieningsrondtes.')}</p>
          <p className="iv-small">{t('Not included: photography, physical printing or unlimited bespoke development. Changes beyond the fixed layout are quoted separately.', 'Nie ingesluit nie: fotografie, fisiese drukwerk of onbeperkte pasgemaakte ontwikkeling. Veranderinge buite die vaste uitleg word apart gekwoteer.')}</p>
          <details><summary>{t('What works today, and what needs a production backend?', 'Wat werk vandag, en wat benodig ’n produksiebediener?')}</summary>
            <p>{t('Working in your browser now: editing in both languages, undo/redo, named drafts, backups, the invitation preview, stationery, sample replies, catering totals, seating and exports.', 'Werk nou in jou blaaier: redigering in albei tale, ontdoen/herdoen, benoemde konsepte, rugsteun, die uitnodigingvoorskou, skryfbehoeftes, voorbeeldantwoorde, spyseneringtotale, sitplekke en uitvoer.')}</p>
            <p>{t('Requires a production backend before real use: couple accounts, private household links, delivering invitations, storing real replies, reminders, shared planner access and publishing.', 'Benodig ’n produksiebediener voor werklike gebruik: paartjierekeninge, private huishoudingskakels, aflewering van uitnodigings, berging van regte antwoorde, herinneringe, gedeelde beplannertoegang en publisering.')}</p>
          </details>
        </div>
      </section>
      <footer className="iv-footer">{mono(56)}<p>{copy('footer.note')}</p><small>{t('Fictional design concept by', 'Fiktiewe ontwerpkonsep deur')} <Link to="/">Ewig & Eie</Link></small></footer>
      <IvoryEditor studio={studio} open={editor} onClose={() => setEditor(false)} language={lang}/>
    </div>
    {opening && <Suspense fallback={null}><EternalRibbonIntro coupleNames={names} initials={`${data.monogram.left} & ${data.monogram.right}`} weddingDate={formatDate(data.date)} invitationWording={`${copy('invitation.lead')} · ${copy('invitation.request')}`} language={lang} storageKey="ewig-ivory-invitation-v1" skipForReturningGuests={false} fontFamily="'Cormorant Garamond', Georgia, serif" theme={{ envelopeColor: data.colors.paper, textColor: data.colors.ink, backgroundColor: data.colors.stone, ribbonColor: data.colors.accent }} onComplete={() => { setOpening(false); setRevealed(true); requestAnimationFrame(() => openButton.current?.focus()); }}/></Suspense>}
  </div>;
}
