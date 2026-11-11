import { Check } from 'lucide-react';
import { bigDaySet, bigDaySetValue, extras, formatRand, paymentTerms, plans, type ExtraGroup } from '../plans';

/** Small extras, day-of stationery, how payment works, and why custom beats a free template. */
export function ExtrasCatalogue({ af }: { af: boolean }) {
  const t = (en: string, a: string) => af ? a : en;
  const short = { essential: 'G', celebration: 'M', complete: 'I' } as const;
  const group = (g: ExtraGroup) => <ul className="xc-list">{extras.filter(e => e.group === g).map(e => <li key={e.id}>
    <span>{af ? e.name.af : e.name.en}</span>
    <span className="xc-incl" aria-label={t('Included with', 'Ingesluit by')}>{plans.map(p => <i key={p.id} className={e.includedIn.includes(p.id) ? 'is-on' : ''} title={af ? p.designName.af : p.designName.en}>{short[p.id]}</i>)}</span>
    <strong>{formatRand(e.price)}</strong>
  </li>)}</ul>;
  const setValue = bigDaySetValue();
  return <section className="section-pad xc" aria-labelledby="xc-title" data-no-translate>
    <div className="xc-head"><p className="xc-kicker">{t('SMALL EXTRAS', 'KLEIN EKSTRAS')}</p><h2 id="xc-title">{t('Add only', 'Voeg net by')} <em>{t('what you’ll use.', 'wat julle sal gebruik.')}</em></h2>
      <p>{t('Every package already includes some of these. The letters show where: G = Garden, M = Midnight, I = Ivory.', 'Elke pakket sluit reeds sommige hiervan in. Die letters wys waar: G = Tuin, M = Middernag, I = Ivoor.')}</p></div>
    <div className="xc-grid">
      <div><h3>{t('For your website', 'Vir julle webwerf')}</h3>{group('website')}</div>
      <div><h3>{t('Day-of stationery · digital', 'Dag-van-skryfbehoeftes · digitaal')}</h3>{group('dayof')}
        <div className="xc-bundle"><p className="xc-kicker">{t('BUNDLE', 'BUNDEL')}</p><h4>{af ? bigDaySet.name.af : bigDaySet.name.en}</h4>
          <p>{t('Programme, seating chart, RSVP reminder and deadline notice, matched to your website.', 'Program, sitplekkaart, RSVP-herinnering en sperdatumkennisgewing, wat by julle webwerf pas.')}</p>
          <p className="xc-price"><s>{formatRand(setValue)}</s> <strong>{formatRand(bigDaySet.price)}</strong> <span>{t(`save ${formatRand(setValue - bigDaySet.price)}`, `spaar ${formatRand(setValue - bigDaySet.price)}`)}</span></p>
          <p className="xc-note">{t('Included with The Ivory.', 'Ingesluit by Die Ivoor.')}</p></div>
      </div>
    </div>
    <div className="xc-bottom">
      <div className="xc-pay"><h3>{t('How payment works', 'Hoe betaling werk')}</h3><ul>{paymentTerms.lines.map(line => <li key={line.en}><Check size={15}/>{af ? line.af : line.en}</li>)}</ul></div>
      <div className="xc-compare"><h3>{t('A free template, or made for you?', '’n Gratis sjabloon, of vir julle gemaak?')}</h3>
        <table><thead><tr><th/><th>{t('Free template', 'Gratis sjabloon')}</th><th>Ewig &amp; Eie</th></tr></thead><tbody>
          {[[t('Your evenings', 'Julle aande'), t('Hours in an editor', 'Ure in ’n redigeerder'), t('One call and a review', 'Een oproep en ’n hersiening')],
            [t('Your design', 'Julle ontwerp'), t('Shared by thousands', 'Deur duisende gedeel'), t('Made to feel like you', 'Gemaak om soos julle te voel')],
            [t('Your guests', 'Julle gaste'), t('A form and a list', '’n Vorm en ’n lys'), t('Invitation, RSVP, B-list, seating and Today mode', 'Uitnodiging, RSVP, B-lys, sitplekke en Vandag-modus')],
            [t('Your to-do list', 'Julle doenlys'), t('Yours to build and fix', 'Julle s’n om te bou en reg te maak'), t('Ours to build and fix', 'Ons s’n om te bou en reg te maak')]].map(r => <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td><td>{r[2]}</td></tr>)}
        </tbody></table>
        <p className="xc-note">{t('Free is a fine choice for a small guest list and a close date. Beyond that, your time is the real price.', 'Gratis is ’n goeie keuse vir ’n klein gastelys en ’n naby datum. Verder as dit is julle tyd die werklike prys.')}</p></div>
    </div>
  </section>;
}
