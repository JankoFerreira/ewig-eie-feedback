import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Heart } from 'lucide-react';
import { EternalRibbonIntro, type EternalRibbonTheme } from '../components/EternalRibbon';
import { images } from '../config';
import { useLanguage } from '../i18n';
import '../styles/invitation-preview.css';

const palettes: Record<string, { label: string; accent: string; ribbon: string; background: string }> = {
  sage: { label: 'Sage', accent: '#718a72', ribbon: '#89917A', background: '#DED0BD' },
  rose: { label: 'Rose', accent: '#af7e7b', ribbon: '#b99597', background: '#e7d6cf' },
  midnight: { label: 'Midnight', accent: '#45546c', ribbon: '#6e8192', background: '#c9d0d4' },
};

export default function InvitationPreview() {
  const [search] = useSearchParams();
  const { language } = useLanguage();
  const af = language === 'af';
  const first = (search.get('first') || 'Amelia').trim().slice(0, 24) || 'Amelia';
  const second = (search.get('second') || 'Oliver').trim().slice(0, 24) || 'Oliver';
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(search.get('date') || '') ? search.get('date')! : '2027-03-20';
  const paletteId = search.get('palette') || 'sage';
  const palette = palettes[paletteId] || palettes.sage;
  const date = new Intl.DateTimeFormat(af ? 'af-ZA' : 'en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${dateValue}T12:00:00`));
  const [intro, setIntro] = useState(true);
  const [replays, setReplays] = useState(0);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpSent, setRsvpSent] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (!intro) return; const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = old; }; }, [intro]);
  const theme: EternalRibbonTheme = { envelopeColor: '#F7F3EA', ribbonColor: palette.ribbon, sealColor: '#C6A66B', textColor: '#414735', backgroundColor: palette.background };
  function finishIntro() { setIntro(false); requestAnimationFrame(() => heading.current?.focus()); }
  function replay() { setReplays(previous => previous + 1); setIntro(true); window.scrollTo(0, 0); }

  return <div className="couple-demo" style={{ '--couple-accent': palette.accent } as React.CSSProperties}><div className="couple-demo-content" inert={intro} aria-hidden={intro}>
    <nav className="couple-demo-nav" aria-label={af ? 'Voorbeeldnavigasie' : 'Preview navigation'}><Link to="/" className="couple-demo-return"><ArrowLeft size={16}/>{af ? 'Terug na Ewig & Eie' : 'Back to Ewig & Eie'}</Link><span>{first.charAt(0).toUpperCase()} <i>&</i> {second.charAt(0).toUpperCase()}</span><button type="button" onClick={replay}>{af ? 'Speel opening weer' : 'Replay opening'}</button></nav>
    <section className="couple-demo-hero" style={{ backgroundImage: `linear-gradient(180deg,#14201455,#17231d9e),url('${images.heroMain}')` }}><div><span>{af ? 'MET LIEFDE NOOI ONS JULLE' : 'WITH LOVE, WE INVITE YOU'}</span><h1 ref={heading} tabIndex={-1}>{first} <i>&</i> {second}</h1><p>{date} · Cape Town</p><Link to={{ pathname: "/invitation-preview", search: '?section=the-day' }}>{af ? 'Ontdek ons dag' : 'Discover our day'} <ArrowUpRight size={17}/></Link></div></section>
    <section className="couple-demo-story" id="the-day"><span className="couple-demo-kicker">01 / {af ? 'ONS STORIE' : 'OUR STORY'}</span><h2>{af ? 'Een dag. Ons hele storie.' : 'One day. Our whole story.'}</h2><p>{af ? '’n Klein voorskou van hoe julle trouwebwerf kan voel: persoonlik, rustig en maklik vir elke gas.' : 'A small glimpse of how your wedding website could feel: personal, considered and easy for every guest.'}</p><div className="couple-demo-details"><div><span>01</span><h3>{af ? 'Die seremonie' : 'The ceremony'}</h3><p>16:00 · Cape Town</p></div><div><span>02</span><h3>{af ? 'Die viering' : 'The celebration'}</h3><p>{af ? 'Musiek, kos en herinneringe' : 'Music, food and memories'}</p></div><div><span>03</span><h3>RSVP</h3><p>{af ? 'Laat weet ons asseblief' : 'Please let us know'}</p></div></div></section>
    <section className="couple-demo-rsvp"><Heart size={25}/><span className="couple-demo-kicker">RSVP / {af ? 'VOORSKOU' : 'PREVIEW'}</span><h2>{af ? 'Sal julle daar wees?' : 'Will you be there?'}</h2>{rsvpSent ? <p>{af ? `Dankie, ${rsvpName}! Hierdie is ’n voorbeeld; jou antwoord is nie gestoor nie.` : `Thank you, ${rsvpName}! This is a preview; your answer was not saved.`}</p> : <form onSubmit={event => { event.preventDefault(); setRsvpSent(true); }}><label>{af ? 'Jou naam' : 'Your name'}<input required maxLength={60} value={rsvpName} onChange={event => setRsvpName(event.target.value)} /></label><button type="submit">{af ? 'Antwoord op uitnodiging' : 'Reply to invitation'} <ArrowUpRight size={17}/></button></form>}<small>{af ? 'Interaktiewe ontwerpvoorskou. Geen data word gestuur of gestoor nie.' : 'Interactive design preview. No data is sent or stored.'}</small></section></div>
    {intro && <EternalRibbonIntro key={replays} coupleNames={`${first} & ${second}`} initials={`${first.charAt(0).toUpperCase()} & ${second.charAt(0).toUpperCase()}`} weddingDate={date} language={language} theme={theme} skipForReturningGuests={replays === 0} onComplete={finishIntro}/>}
  </div>;
}
