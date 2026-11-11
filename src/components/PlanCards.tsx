import { Link } from 'react-router-dom';
import { addOnPrices, formatRand, hostingLine, includedExtras, includedValue, mediaLine, plans } from '../plans';
import '../styles/plans.css';

/** The three websites. Each design is its own package and lists only what it adds to the one before. */
export function PlanCards({ af, compact = false }: { af: boolean; compact?: boolean }) {
  const t = (en: string, a: string) => af ? a : en;
  return <div className="plan-cards" data-no-translate>{plans.map((plan, i) => {
    const addable = (Object.keys(addOnPrices) as (keyof typeof addOnPrices)[]).filter(id => !addOnPrices[id].includedIn.includes(plan.id));
    return <article key={plan.id} className={`plan-card ${plan.id === 'complete' ? 'is-featured' : ''}`} aria-labelledby={`plan-${plan.id}`}>
      {plan.id === 'complete' && <span className="plan-badge">{t('Flagship', 'Vlagskip')}</span>}
      <p className="plan-tier">{(af ? plan.name.af : plan.name.en).toUpperCase()}</p>
      <h3 id={`plan-${plan.id}`}>{af ? plan.designName.af : plan.designName.en}</h3>
      <p className="plan-price">{formatRand(plan.price)}<small>{t('once-off', 'eenmalig')}</small></p>
      <p className="plan-summary">{af ? plan.summary.af : plan.summary.en}</p>
      <p className="plan-media">{mediaLine(plan.media, af)}</p>
      <ul>
        {i > 0 && <li className="plan-inherit">{t(`All ${plans[i - 1].designName.en} features`, `Alle ${plans[i - 1].designName.af}-funksies`)}</li>}
        {(compact ? plan.includes.slice(0, 3) : plan.includes).map(line => <li key={line.en}>{af ? line.af : line.en}</li>)}
      </ul>
      {!compact && <div className="plan-extras"><p><strong>{t(`Extras worth ${formatRand(includedValue(plan.id))} included`, `Ekstras ter waarde van ${formatRand(includedValue(plan.id))} ingesluit`)}</strong></p><p>{includedExtras(plan.id).map(e => af ? e.name.af : e.name.en).join(' · ')}</p></div>}
      {!compact && <p className="plan-hosting">{hostingLine(plan, af)}</p>}
      {!compact && addable.length > 0 && <p className="plan-addons">{t('Add-ons: ', 'Byvoegings: ')}{addable.map(id => `${af ? addOnPrices[id].name.af : addOnPrices[id].name.en} +${formatRand(addOnPrices[id].price)}`).join(' · ')}</p>}
      <div className="plan-links">
        <Link className="plan-cta" to={compact ? '/pricing' : `/contact?collection=${encodeURIComponent(plan.designName.en)}`}>{compact ? t('See what’s included', 'Sien wat ingesluit is') : t(`Choose ${plan.designName.en}`, `Kies ${plan.designName.af}`)}</Link>
        {!compact && <Link className="plan-demo" to={`/collections/${plan.design}`}>{t('View the demo', 'Sien die demo')} ↗</Link>}
      </div>
    </article>;
  })}</div>;
}
