import { Link } from 'react-router-dom';
import { formatRand, mediaLine, planForDesign, type DesignId } from '../plans';

/** Bottom note on each design demo: the design is its own package. */
export function DesignPlanNote({ design, af, className = '' }: { design: DesignId; af: boolean; className?: string }) {
  const plan = planForDesign(design);
  const t = (en: string, a: string) => af ? a : en;
  const name = af ? plan.designName.af : plan.designName.en;
  return <section className={`design-plan-note ${className}`} aria-label={t('Package', 'Pakket')} data-no-translate>
    <p className="dpn-kicker">EWIG & EIE · {(af ? plan.name.af : plan.name.en).toUpperCase()}</p>
    <h2>{t(`${name}: ${formatRand(plan.price)}`, `${name}: ${formatRand(plan.price)}`)}</h2>
    <p>{t(`Everything you see in this demo, with ${mediaLine(plan.media, false)}. Need something different? Ask us.`, `Alles wat julle in hierdie demo sien, met ${mediaLine(plan.media, true)}. Iets anders nodig? Vra ons.`)}</p>
    <p className="dpn-actions"><Link to="/pricing">{t('Compare websites', 'Vergelyk webwerwe')} ↗</Link><Link to={`/contact?collection=${encodeURIComponent(plan.designName.en)}`}>{t('Enquire', 'Doen navraag')} ↗</Link></p>
  </section>;
}
