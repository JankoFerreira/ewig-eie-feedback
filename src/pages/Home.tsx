import { useState } from 'react';
import { Link } from 'react-router-dom';
import gardenPortrait from '../assets/garden/garden-couple-reference.webp';
import gardenHero from '../assets/garden/garden-hero.webp';
import midnightPortrait from '../assets/midnight/midnight-portrait.webp';
import midnightTable from '../assets/midnight/midnight-table.webp';
import ivoryDetail from '../assets/ivory/ivory-detail.webp';
import { useLanguage } from '../i18n';
import { PlanCards } from '../components/PlanCards';
import { readTryNames } from '../collections/shared/tryNames';
import { plans, formatRand } from '../plans';
import '../styles/home-simple.css';

// One promise, one button, then three pillars. Designs and plans are separate (see src/plans.ts).
const designs = [
  { key: 'ivory', name: 'Ivory', to: '/collections/ivory', image: ivoryDetail, couple: ['Amélie', 'James'], mood: { en: 'Editorial weekend', af: 'Redaksionele naweek' } },
  { key: 'garden', name: 'Garden', to: '/collections/garden', image: gardenPortrait, couple: ['Clara', 'Ruben'], mood: { en: 'Soft and botanical', af: 'Sag en botanies' } },
  { key: 'midnight', name: 'Midnight', to: '/collections/midnight', image: midnightPortrait, couple: ['Mila', 'Luca'], mood: { en: 'Candlelit evening', af: 'Aand by kerslig' } },
] as const;

export default function Home() {
  const { language } = useLanguage();
  const af = language === 'af';
  const t = (en: string, a: string) => af ? a : en;
  const [tried] = useState(readTryNames);
  const from = formatRand(Math.min(...plans.map(p => p.price)));
  return <div className="hs" data-no-translate>
    <section className="hs-hero" aria-labelledby="hs-title">
      <p className="hs-kicker">{t('WEDDING WEBSITES · INVITATIONS · PLANNING', 'TROUWEBWERWE · UITNODIGINGS · BEPLANNING')}</p>
      <h1 id="hs-title">{t('One beautiful home', 'Een pragtige tuiste')}<br/><em>{t('for your wedding.', 'vir julle troue.')}</em></h1>
      <p className="hs-lead">{t('Your website, invitation and replies, with the planning tools to match. Designed with you, in English and Afrikaans.', 'Julle webwerf, uitnodiging en antwoorde, met die beplanningsgereedskap wat daarby pas. Saam met julle ontwerp, in Engels en Afrikaans.')}</p>
      <Link className="hs-cta" to="/collections">{t('Choose your design', 'Kies julle ontwerp')}</Link>
      <p className="hs-sub"><Link to="/pricing">{t(`Plans from ${from}`, `Planne vanaf ${from}`)}</Link><span aria-hidden="true">·</span><Link to="/invitation-preview">{t('Open a sample invitation', 'Maak ’n voorbeelduitnodiging oop')}</Link></p>
      <div className="hs-fan">{designs.map((d, i) => <Link key={d.key} to={d.to} className={`hs-card hs-card-${i} hs-card-${d.key}`} aria-label={`${d.name}: ${t('open the design', 'maak die ontwerp oop')}`}>
        <img src={d.image} alt="" loading={i === 1 ? 'eager' : 'lazy'} decoding="async"/>
        <span className="hs-card-names"><span>{tried?.first || d.couple[0]}</span><i>&amp;</i><span>{tried?.second || d.couple[1]}</span></span>
        <span className="hs-card-label">{d.name}<small>{af ? d.mood.af : d.mood.en}</small></span>
      </Link>)}</div>
    </section>

    <section className="hs-steps" id="process" aria-labelledby="hs-steps-title">
      <h2 id="hs-steps-title" className="hs-h2">{t('Simple from hello to “I do”.', 'Eenvoudig van hallo tot “ek wil”.')}</h2>
      <ol>
        <li><span>01</span><h3>{t('Choose a design', 'Kies ’n ontwerp')}</h3><p>{t('Garden, Midnight or Ivory. Try each one with your own names.', 'Garden, Midnight of Ivory. Probeer elkeen met julle eie name.')}</p></li>
        <li><span>02</span><h3>{t('We set it up together', 'Ons stel dit saam op')}</h3><p>{t('Send us your story and photos. Change any word yourself, right on the page.', 'Stuur vir ons julle storie en foto’s. Verander enige woord self, reg op die blad.')}</p></li>
        <li><span>03</span><h3>{t('Share one link', 'Deel een skakel')}</h3><p>{t('Guests open the invitation, reply in a minute and find everything on the day.', 'Gaste maak die uitnodiging oop, antwoord binne ’n minuut en kry alles op die dag.')}</p></li>
      </ol>
    </section>

    <section className="hs-pillar" id="experience" aria-labelledby="hs-p1">
      <div className="hs-pillar-media"><img src={gardenHero} alt={t('The Garden design on a wedding website', 'Die Garden-ontwerp op ’n trouwebwerf')} loading="lazy" decoding="async"/></div>
      <div className="hs-pillar-copy"><p className="hs-kicker">01 · {t('YOUR WEBSITE', 'JULLE WEBWERF')}</p><h2 id="hs-p1" className="hs-h2">{t('Your story, beautifully told.', 'Julle storie, pragtig vertel.')}</h2>
        <p>{t('The story, the day, the venue and the little details, laid out with care and easy to update yourselves.', 'Die storie, die dag, die venue en die klein besonderhede, met sorg uitgelê en maklik om self op te dateer.')}</p>
        <Link className="hs-link" to="/collections">{t('Explore the designs', 'Verken die ontwerpe')} →</Link></div>
    </section>

    <section className="hs-pillar hs-pillar-flip" aria-labelledby="hs-p2">
      <div className="hs-pillar-media"><img src={midnightTable} alt={t('A candlelit table from the Midnight design', '’n Tafel by kerslig uit die Midnight-ontwerp')} loading="lazy" decoding="async"/></div>
      <div className="hs-pillar-copy"><p className="hs-kicker">02 · {t('YOUR GUESTS', 'JULLE GASTE')}</p><h2 id="hs-p2" className="hs-h2">{t('Invited, answered, on time.', 'Genooi, geantwoord, betyds.')}</h2>
        <p>{t('An invitation they open like the real thing, replies for every event, and Today mode that keeps everyone on schedule on the day.', '’n Uitnodiging wat hulle oopmaak soos die regte ding, antwoorde vir elke geleentheid, en Vandag-modus wat almal op die dag op skedule hou.')}</p>
        <p className="hs-links"><Link className="hs-link" to="/invitation-preview">{t('Open a sample invitation', 'Maak ’n voorbeelduitnodiging oop')} →</Link><Link className="hs-link" to="/collections/midnight?view=today">{t('See Today mode', 'Sien Vandag-modus')} →</Link></p></div>
    </section>

    <section className="hs-pillar" aria-labelledby="hs-p3">
      <div className="hs-pillar-media hs-dash" aria-hidden="true">
        <div className="hs-dash-row"><strong>18</strong><span>{t('attending the wedding', 'woon die troue by')}</span></div>
        <div className="hs-dash-row"><strong>7 · 6 · 5</strong><span>{t('lamb · fish · vegetarian', 'lam · vis · vegetaries')}</span></div>
        <div className="hs-dash-row"><strong>{t('Table', 'Tafel')} Chenin</strong><span>8 / 8 {t('seats', 'sitplekke')}</span></div>
        <div className="hs-dash-row"><strong>R45 000</strong><span>{t('still to pay', 'nog te betaal')}</span></div>
        <div className="hs-dash-row"><strong>214</strong><span>{t('guest photos', 'gasfoto’s')}</span></div>
        <small>{t('Sample figures', 'Voorbeeldsyfers')}</small>
      </div>
      <div className="hs-pillar-copy"><p className="hs-kicker">03 · {t('YOUR PLAN', 'JULLE PLAN')}</p><h2 id="hs-p3" className="hs-h2">{t('Every detail, in one place.', 'Elke besonderheid, op een plek.')}</h2>
        <p>{t('Catering totals, seating, your budget and a disposable camera for your guests. Calm for you, clear for your planner.', 'Spyseneringtotale, sitplekke, julle begroting en ’n weggooikamera vir julle gaste. Rustig vir julle, duidelik vir julle beplanner.')}</p>
        <Link className="hs-link" to="/collections/ivory?view=dashboard">{t('See the planning dashboard', 'Sien die beplanningspaneel')} →</Link></div>
    </section>

    <section className="hs-plans" id="work" aria-labelledby="hs-plans-title">
      <h2 id="hs-plans-title" className="hs-h2">{t('Three plans. Any design.', 'Drie planne. Enige ontwerp.')}</h2>
      <p className="hs-plans-lead">{t('One payment, no subscriptions.', 'Een betaling, geen intekening nie.')}</p>
      <PlanCards af={af} compact/>
    </section>

    <section className="hs-final">
      <h2 className="hs-h2">{t('Tell us about your day.', 'Vertel ons van julle dag.')}</h2>
      <Link className="hs-cta" to="/contact">{t('Get in touch', 'Kontak ons')}</Link>
    </section>
  </div>;
}
