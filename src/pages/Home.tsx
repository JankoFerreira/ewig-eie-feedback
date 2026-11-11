import ivoryPreview from '../assets/ivory/ivory-detail.webp';
import gardenPreview from '../assets/garden/garden-venue.webp';
import midnightPreview from '../assets/midnight/midnight-venue.webp';
import { Flourish } from '../components/Flourish';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Heart } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { images, publicFeatures } from '../config';
import { formatRand, planForDesign, mediaLine } from '../plans';
import { useLanguage } from '../i18n';
import { AnimatedHeading, KineticWords, RotatingWord } from '../components/WordMotion';
import { Eyebrow, Reveal } from '../components/Shared';
import { StoryPortal } from '../components/StoryPortal';
import '../styles/home-luxe.css';
import { Ribbon } from '../components/Ribbon';
import { HeroTiles } from '../components/HeroTiles';
import '../styles/ribbon.css';

type PreviewTab = 'home' | 'details' | 'rsvp';
const previewPalettes = {
  sage: { labelEn: 'Sage', labelAf: 'Salie', color: '#6f8a71' },
  rose: { labelEn: 'Rose', labelAf: 'Roos', color: '#b17e7a' },
  midnight: { labelEn: 'Midnight', labelAf: 'Middernag', color: '#46556d' },
};
type PreviewPalette = keyof typeof previewPalettes;
const formatDate = (value: string, af: boolean) => {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(af ? 'af-ZA' : 'en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

function WebsitePreview({ af, firstName, secondName, date, palette }: { af: boolean; firstName: string; secondName: string; date: string; palette: PreviewPalette }) {
  const [tab, setTab] = useState<PreviewTab>('home');
  const reduced = useReducedMotion();
  const tabs: { id: PreviewTab; en: string; af: string }[] = [
    { id: 'home', en: 'Our story', af: 'Ons storie' },
    { id: 'details', en: 'The day', af: 'Die dag' },
    { id: 'rsvp', en: 'RSVP', af: 'RSVP' },
  ];
  return <div className="preview-browser" style={{ '--preview-accent': previewPalettes[palette].color } as React.CSSProperties}><div className="preview-browser-top"><span className="preview-browser-dots" aria-hidden="true"><i/><i/><i/></span><span>{af ? 'JULLE TROUWEBWERF · VOORSKOU' : 'YOUR WEDDING WEBSITE · PREVIEW'}</span><span className="preview-browser-mark"><Flourish/></span></div><div className="preview-browser-body"><div className="preview-browser-nav"><span>{firstName.charAt(0).toUpperCase()} <i>&</i> {secondName.charAt(0).toUpperCase()}</span><div role="tablist" aria-label={af ? 'Voorbeeldblaaie' : 'Preview pages'}>{tabs.map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}>{af ? item.af : item.en}</button>)}</div></div><AnimatePresence mode="wait"><motion.div key={tab} className={`preview-screen preview-screen-${tab}`} initial={reduced ? false : { opacity: 0, scale: 1.025, filter: 'blur(8px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={reduced ? undefined : { opacity: 0, scale: .985, filter: 'blur(6px)' }} transition={{ duration: .48 }}>
    {tab === 'home' && <><div className="preview-screen-photo" style={{ backgroundImage: `url('${images.heroMain}')` }}/><div className="preview-screen-overlay"><span>{af ? 'MET LIEFDE NOOI ONS JULLE' : 'WITH LOVE, WE INVITE YOU'}</span><strong>{firstName} <i>&</i> {secondName}</strong><small>{formatDate(date, af)} &nbsp; <Flourish/> &nbsp; CAPE TOWN</small></div></>}
    {tab === 'details' && <><div className="preview-details-photo" style={{ backgroundImage: `url('${images.table}')` }}/><div className="preview-details-copy"><span>{formatDate(date, af).toUpperCase()}</span><strong>{af ? '’n Dag om te onthou.' : 'A day to remember.'}</strong><p>{af ? 'Die seremonie begin om 16:00. Kom vier saam met ons onder die sterre.' : 'The ceremony begins at 16:00. Stay and celebrate under the stars.'}</p><small>CAPE TOWN · SOUTH AFRICA</small></div></>}
    {tab === 'rsvp' && <div className="preview-rsvp"><Heart size={22}/><span>{af ? 'ONS SIEN UIT NA JULLE' : 'WE CAN’T WAIT TO SEE YOU'}</span><strong>{af ? 'Sal julle daar wees?' : 'Will you be there?'}</strong><p>{af ? 'Antwoord aanlyn en laat ons weet wat julle nodig het.' : 'Reply online and let us know what you need.'}</p><Link to="/collections/garden">{af ? 'Probeer die RSVP-voorbeeld' : 'Try the RSVP preview'} <ArrowUpRight size={16}/></Link></div>}
  </motion.div></AnimatePresence></div></div>;
}

export default function Home() {
  const { language } = useLanguage();
  const reduced = useReducedMotion();
  const af = language === 'af';
  const t = (en: string, afrikaans: string) => af ? afrikaans : en;
  const [firstName, setFirstName] = useState('Amelia');
  const [secondName, setSecondName] = useState('Oliver');
  const [previewDate, setPreviewDate] = useState('2027-03-20');
  const [palette, setPalette] = useState<PreviewPalette>('sage');
  const [storyOpen, setStoryOpen] = useState(false);
  const closeStory = useCallback(() => setStoryOpen(false), []);
  const safeFirst = firstName.trim() || 'Amelia';
  const safeSecond = secondName.trim() || 'Oliver';
  const invitationUrl = `/invitation-preview?${new URLSearchParams({ first: safeFirst, second: safeSecond, date: previewDate, palette }).toString()}`;
  const steps = af ? [
    { n: 'I', title: 'Vertel ons', copy: 'Kies julle ontwerp en vertel ons van julle dag.' },
    { n: 'II', title: 'Ons skep saam', copy: 'Ons bou dit en verfyn dit saam met julle.' },
    { n: 'III', title: 'Julle deel', copy: 'Een pragtige skakel vir al julle gaste.' },
  ] : [
    { n: 'I', title: 'Tell us', copy: 'Pick your design and tell us about your day.' },
    { n: 'II', title: 'We create together', copy: 'We build it and refine it with you.' },
    { n: 'III', title: 'You share', copy: 'One beautiful link for all your guests.' },
  ];
  const work = [
    { design: 'garden' as const, image: gardenPreview, en: 'The Garden', af: 'Die Tuin', moodEn: 'Soft, romantic, alive', moodAf: 'Sag, romanties, lewendig' },
    { design: 'midnight' as const, image: midnightPreview, en: 'The Midnight', af: 'Die Middernag', moodEn: 'Modern, warm, memorable', moodAf: 'Modern, warm, onvergeetlik' },
    { design: 'ivory' as const, image: ivoryPreview, en: 'The Ivory', af: 'Die Ivoor', moodEn: 'Our flagship wedding weekend', moodAf: 'Ons vlagskip-trounaweek' },
  ];
  return <div className="home-luxe">
    <HeroTiles className="hero editorial-hero home-cover" style={{ backgroundImage: `url('${images.hero}')` }} front={images.hero} back={images.designs} caption={<><span>{t('FROM THE DAY TO THE INVITATION', 'VAN DIE DAG TOT DIE UITNODIGING')}</span><strong>{t('Every detail,', 'Elke detail,')} <em>{t('made to match.', 'pragtig verbind.')}</em></strong></>}><div className="hero-content"><motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }} className="hero-kicker">{(publicFeatures.printedStationery ? t('WEDDING WEBSITES, PAPER & THE LITTLE THINGS', 'TROUWEBWERWE, DRUKWERK & DIE KLEIN DINGE') : t('WEDDING WEBSITES, INVITATIONS & THE LITTLE THINGS', 'TROUWEBWERWE, UITNODIGINGS & DIE KLEIN DINGE'))}</motion.p><motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .25 }}><KineticWords text={t('A day that feels', '’n Dag wat')} className="hero-kinetic"/><br/><RotatingWord key={language} words={af ? ['soos julle voel.', 'na towerkuns voel.', 'altyd bybly.'] : ['like yours.', 'like magic.', 'forever yours.']}/></motion.h1><motion.p className="hero-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}>{t('One beautiful home for your story and your guests.', 'Een pragtige tuiste vir julle storie en julle gaste.')}</motion.p><motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .65 }} className="hero-actions"><button type="button" onClick={() => setStoryOpen(true)} className="hero-primary">{t('Make it yours', 'Maak dit julle eie')} <ArrowUpRight size={17}/></button><Link to="/pricing" className="hero-secondary">{t('See the websites', 'Sien die webwerwe')} <ArrowRight size={17}/></Link></motion.div><span className="hero-signature">Ewig & Eie <i><Flourish/></i> {t('forever & your own', 'ewig & julle eie')}</span></div><motion.div className="hero-invitation-wrap" initial={reduced ? false : { opacity: 0, y: 18, rotate: 7 }} animate={{ opacity: 1, y: 0, rotate: 5 }} transition={{ delay: .85, duration: .8, ease: 'easeOut' }} whileHover={reduced ? undefined : { y: -7, rotate: 0 }}><button type="button" onClick={() => setStoryOpen(true)} className="hero-invitation" aria-label={t('Personalize a sample wedding invitation', 'Maak ’n voorbeeldtrou-uitnodiging julle eie')}><span className="hero-invitation-top">{t('A LITTLE PREVIEW', '’N KLEIN VOORSKOU')}</span><span className="hero-invitation-monogram">{safeFirst.charAt(0).toUpperCase()} <i>&</i> {safeSecond.charAt(0).toUpperCase()}</span><span className="hero-invitation-rule"/><span className="hero-invitation-copy">{t('You are invited', 'Julle is genooi')}</span><span className="hero-invitation-action">{t('Make it yours', 'Maak dit julle eie')}</span><ArrowUpRight size={15} aria-hidden="true"/></button></motion.div><div className="hero-bottom"><Link to={{ pathname: "/", search: '?section=experience' }}>{t('SCROLL TO DISCOVER', 'ROL OM TE ONTDEK')} <ArrowDown size={14}/></Link></div></HeroTiles>
    <StoryPortal open={storyOpen} onClose={closeStory} firstName={firstName} onFirstNameChange={setFirstName} secondName={secondName} onSecondNameChange={setSecondName} date={previewDate} onDateChange={setPreviewDate} palette={palette} onPaletteChange={setPalette} invitationUrl={invitationUrl} af={af}/>
    <div className="lx-strip" aria-label={t('What every website includes', 'Wat elke webwerf insluit')}><span>{t('English & Afrikaans', 'Engels & Afrikaans')}</span><i aria-hidden="true">◆</i><span>{t('Online RSVP & guest list', 'Aanlyn RSVP & gastelys')}</span><i aria-hidden="true">◆</i><span>{t('Digital invitation', 'Digitale uitnodiging')}</span><i aria-hidden="true">◆</i><span>{t('One once-off payment', 'Een eenmalige betaling')}</span></div>

    <section className="showcase-section section-pad" id="experience" data-watermark={t('The feeling', 'Die gevoel')}><Reveal className="showcase-intro"><Eyebrow>{t('FIRST, THE FEELING', 'EERS, DIE GEVOEL')}</Eyebrow><AnimatedHeading effect="bloom">{t('A website worth', '’n Webwerf wat')}<br/><em>{t('sharing.', 'julle wil deel.')}</em></AnimatedHeading><p>{t('Try your names and colour right here.', 'Probeer julle name en kleur sommer hier.')}</p><div className="preview-personalize" aria-label={t('Personalize the wedding website preview', 'Verpersoonlik die trouwebwerfvoorskou')}><div className="preview-personalize-heading"><span><Flourish/> {t('MAKE THIS PREVIEW YOURS', 'MAAK HIERDIE VOORSKOU JULLE EIE')}</span></div><div className="preview-personalize-fields"><label>{t('Your name', 'Jou naam')}<input type="text" maxLength={24} autoComplete="given-name" value={firstName} onChange={event => setFirstName(event.target.value)}/></label><label>{t('Partner’s name', 'Maat se naam')}<input type="text" maxLength={24} value={secondName} onChange={event => setSecondName(event.target.value)}/></label></div><fieldset className="preview-palette-options"><legend>{t('Choose your colour', 'Kies julle kleur')}</legend><div>{(Object.keys(previewPalettes) as PreviewPalette[]).map(key => <button key={key} type="button" aria-pressed={palette === key} onClick={() => setPalette(key)} style={{ '--swatch': previewPalettes[key].color } as React.CSSProperties}><i/>{af ? previewPalettes[key].labelAf : previewPalettes[key].labelEn}</button>)}</div></fieldset><Link className="preview-open-link" to={invitationUrl}>{t('Open your invitation', 'Maak julle uitnodiging oop')} <ArrowUpRight size={16}/></Link></div></Reveal><Reveal className="showcase-visual" delay={.12}><span className="showcase-float"><Flourish/> {t('INTERACTIVE CONCEPT PREVIEW', 'INTERAKTIEWE KONSEPVOORBEELD')}</span><WebsitePreview af={af} firstName={safeFirst} secondName={safeSecond} date={previewDate} palette={palette}/></Reveal></section>

    <section className="minimal-process section-pad" id="process" data-watermark={t('The process', 'Die proses')}><div className="minimal-section-top"><Eyebrow>{t('THE PROCESS', 'DIE PROSES')}</Eyebrow><AnimatedHeading effect="wave">{t('Simple from hello', 'Eenvoudig van hallo')}<br/><em>{t('to “I do.”', 'tot “ek wil.”')}</em></AnimatedHeading></div><div className="minimal-steps">{steps.map((item, index) => <Reveal className="minimal-step" key={item.n} delay={index * .1}><span>{item.n}</span><div className="minimal-step-symbol"><Flourish/></div><h3>{item.title}</h3><p>{item.copy}</p></Reveal>)}</div></section>


    <section className="minimal-work section-pad" id="work" data-watermark={t('The websites', 'Die webwerwe')}><div className="minimal-work-heading"><div><Eyebrow>{t('THE WEBSITES', 'DIE WEBWERWE')}</Eyebrow><AnimatedHeading effect="bloom">{t('Three websites.', 'Drie webwerwe.')}<br/><em>{t('Pick yours.', 'Kies julle s’n.')}</em></AnimatedHeading><p>{t('Each design is its own package. Open a demo and imagine your story in it.', 'Elke ontwerp is ’n eie pakket. Maak ’n demo oop en verbeel julle storie daarin.')}</p></div><Link to="/pricing" className="text-link">{t('Compare websites', 'Vergelyk webwerwe')} <ArrowUpRight size={17}/></Link></div><div className="minimal-work-grid">{work.map((item, index) => <Reveal className="minimal-work-card" key={item.en} delay={index * .08}><Link to={`/collections/${item.design}`}><div className="minimal-work-image"><img src={item.image} alt={t(`${item.en} wedding design concept`, `${item.af}-trouontwerpkonsep`)} loading="lazy"/><span>{t(planForDesign(item.design).name.en, planForDesign(item.design).name.af).toUpperCase()}</span></div><h3>{t(item.en, item.af)}</h3><p>{t(item.moodEn, item.moodAf)}</p><div className="lx-card-foot"><strong>{formatRand(planForDesign(item.design).price)}</strong><small className="concept-start">{mediaLine(planForDesign(item.design).media, af)}</small></div><span className="lx-card-link">{t('View the demo', 'Sien die demo')} <ArrowUpRight size={14}/></span></Link></Reveal>)}</div></section>

    <section className="minimal-final"><Ribbon tone="dark"/><Eyebrow>{t('YOUR STORY STARTS HERE', 'JULLE STORIE BEGIN HIER')}</Eyebrow><AnimatedHeading effect="drift">{t('Shall we make', 'Sal ons iets')}<br/><em>{t('something lovely?', 'pragtigs maak?')}</em></AnimatedHeading><Link to="/contact" className="hero-primary">{t('Tell us about your day', 'Vertel ons van julle dag')} <ArrowUpRight size={18}/></Link></section>
  </div>;
}
