import { Link } from 'react-router-dom';
import { formatRand, plans } from '../plans';
import '../styles/plans.css';

/** The three plans, each listing only what it adds to the one before. */
export function PlanCards({ af, compact = false }: { af: boolean; compact?: boolean }) {
  const t = (en: string, a: string) => af ? a : en;
  return <div className="plan-cards" data-no-translate>{plans.map((plan, i) => <article key={plan.id} className={`plan-card ${plan.id === 'complete' ? 'is-featured' : ''}`} aria-labelledby={`plan-${plan.id}`}>
    {plan.id === 'complete' && <span className="plan-badge">{t('Everything', 'Alles')}</span>}
    <h3 id={`plan-${plan.id}`}>{af ? plan.name.af : plan.name.en}</h3>
    <p className="plan-price">{formatRand(plan.price)}<small>{t('once-off', 'eenmalig')}</small></p>
    <p className="plan-summary">{af ? plan.summary.af : plan.summary.en}</p>
    <ul>
      {i > 0 && <li className="plan-inherit">{t(`Everything in ${plans[i - 1].name.en}`, `Alles in ${plans[i - 1].name.af}`)}</li>}
      {(compact ? plan.includes.slice(0, 3) : plan.includes).map(line => <li key={line.en}>{af ? line.af : line.en}</li>)}
    </ul>
    <Link className="plan-cta" to={compact ? '/pricing' : `/contact?collection=${encodeURIComponent(`${plan.name.en} plan`)}`}>{compact ? t('See what’s included', 'Sien wat ingesluit is') : t(`Choose ${plan.name.en}`, `Kies ${plan.name.af}`)}</Link>
  </article>)}</div>;
}
