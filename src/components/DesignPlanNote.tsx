import { Link } from 'react-router-dom';
import { designDemoPlan } from '../collections/shared/capabilities';
import { formatRand, planById } from '../plans';

const designNames = { garden: 'Garden', midnight: 'Midnight', ivory: 'Ivory' } as const;
/** Designs are free to choose; this explains which plan a design demo is showing. */
export function DesignPlanNote({ design, af, className = '' }: { design: keyof typeof designDemoPlan; af: boolean; className?: string }) {
  const plan = planById(designDemoPlan[design]);
  const t = (en: string, a: string) => af ? a : en;
  return <section className={`design-plan-note ${className}`} aria-label={t('Design and plan', 'Ontwerp en plan')} data-no-translate>
    <p className="dpn-kicker">EWIG & EIE · {designNames[design].toUpperCase()}</p>
    <h2>{t(`The ${designNames[design]} design comes with every plan.`, `Die ${designNames[design]}-ontwerp kom saam met elke plan.`)}</h2>
    <p>{t(`This demo shows the ${plan.name.en} plan (${formatRand(plan.price)}). Choose any plan with any design.`, `Hierdie demo wys die ${plan.name.af}-plan (${formatRand(plan.price)}). Kies enige plan met enige ontwerp.`)}</p>
    <p className="dpn-actions"><Link to="/pricing">{t('Compare plans', 'Vergelyk planne')} ↗</Link><Link to={`/contact?collection=${encodeURIComponent(`${designNames[design]} design`)}`}>{t('Enquire', 'Doen navraag')} ↗</Link></p>
  </section>;
}
