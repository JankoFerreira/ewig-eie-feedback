import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Download, Sparkles } from 'lucide-react';
import { draftQuotePrices as prices } from '../config';
import { downloadEstimatePdf } from '../utils/estimatePdf';
import { useLanguage } from '../i18n';
import { AnimatedHeading } from './WordMotion';

type PackageId = 'website' | 'keepsake' | 'captured' | 'complete';
type ExtraId = 'rsvp' | 'gallery' | 'timeline' | 'domain' | 'digitalInvitation';
const packages: { id: PackageId; en: string; af: string; descriptionEn: string; descriptionAf: string; print: boolean; photo: boolean }[] = [
  { id: 'website', en: 'The Website', af: 'Die Webwerf', descriptionEn: 'A beautiful home for your story.', descriptionAf: '’n Pragtige tuiste vir julle storie.', print: false, photo: false },
  { id: 'keepsake', en: 'The Keepsake', af: 'Die Aandenking', descriptionEn: 'Website, 100 invites & 100 menu cards.', descriptionAf: 'Webwerf, 100 uitnodigings & 100 spyskaartjies.', print: true, photo: false },
  { id: 'captured', en: 'The Captured Story', af: 'Die Vasgevangde Storie', descriptionEn: 'Website & 6 hours of photography.', descriptionAf: 'Webwerf & 6 uur se fotografie.', print: false, photo: true },
  { id: 'complete', en: 'The Complete Story', af: 'Die Volledige Storie', descriptionEn: 'Website, print suite & 6 hours of photography.', descriptionAf: 'Webwerf, drukwerk & 6 uur se fotografie.', print: true, photo: true },
];
const packageContents: Record<PackageId, { en: string; af: string }[]> = {
  website: [
    { en: 'Personal, mobile-friendly website', af: 'Persoonlike, selfoonvriendelike webwerf' },
    { en: 'Story and wedding information pages', af: 'Storie- en trou-inligtingsblaaie' },
    { en: 'Six months of hosting', af: 'Ses maande se webhosting' },
  ],
  keepsake: [
    { en: 'Everything in The Website', af: 'Alles in Die Webwerf' },
    { en: 'Invitation design + 100 printed invites', af: 'Uitnodigingsontwerp + 100 gedrukte uitnodigings' },
    { en: '100 matching menu cards', af: '100 bypassende spyskaartjies' },
  ],
  captured: [
    { en: 'Everything in The Website', af: 'Alles in Die Webwerf' },
    { en: 'Six hours of photography allowance', af: 'Ses uur se fotografietoelaag' },
    { en: 'Photographer subject to availability', af: 'Fotograaf onderhewig aan beskikbaarheid' },
  ],
  complete: [
    { en: 'Everything in The Website', af: 'Alles in Die Webwerf' },
    { en: '100 invites + 100 menu cards', af: '100 uitnodigings + 100 spyskaartjies' },
    { en: 'Six hours of photography allowance', af: 'Ses uur se fotografietoelaag' },
  ],
};
const extraOptions: { id: ExtraId; en: string; af: string; price: number }[] = [
  { id: 'rsvp', en: 'RSVP & couple dashboard (planned)', af: 'RSVP en paartjiepaneel (beplan)', price: prices.rsvp },
  { id: 'gallery', en: 'Photo gallery', af: 'Fotogalery', price: prices.gallery },
  { id: 'timeline', en: 'Wedding day timeline', af: 'Troudagprogram', price: prices.timeline },
  { id: 'domain', en: 'Custom domain setup', af: 'Pasgemaakte domeinopstelling', price: prices.domain },
  { id: 'digitalInvitation', en: 'Digital invitation design', af: 'Digitale uitnodigingsontwerp', price: prices.digitalInvitation },
];
const money = (value: number) => `R${value.toLocaleString('en-ZA')}`;

export function QuoteBuilder() {
  const { language } = useLanguage();
  const af = language === 'af';
  const t = (en: string, afrikaans: string) => af ? afrikaans : en;
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [packageId, setPackageId] = useState<PackageId>('website');
  const [print, setPrint] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [invites, setInvites] = useState(100);
  const [menus, setMenus] = useState(false);
  const [hours, setHours] = useState(6);
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [copied, setCopied] = useState(false);
  const stepHeading = useRef<HTMLHeadingElement>(null);

  const selectedPackage = packages.find(item => item.id === packageId)!;
  const stageNames = af ? ['Versameling', 'Webwerf', 'Drukwerk & foto', 'Julle beraming'] : ['Collection', 'Website', 'Paper & photo', 'Your estimate'];
  const items = [
    { key: 'website', label: t('Personal wedding website', 'Persoonlike trouwebwerf'), amount: prices.website },
    ...extras.filter(id => id !== 'digitalInvitation').map(id => { const option = extraOptions.find(item => item.id === id)!; return { key: id, label: t(option.en, option.af), amount: option.price }; }),
    ...(print ? [
      { key: 'design', label: t('Invitation suite design', 'Uitnodigingsreeksontwerp'), amount: prices.invitationDesign },
      { key: 'invites', label: t(`${invites} printed invitations`, `${invites} gedrukte uitnodigings`), amount: invites * prices.invitationEach },
      ...(menus ? [{ key: 'menus', label: t(`${invites} menu cards`, `${invites} spyskaartjies`), amount: invites * prices.menuCardEach }] : []),
    ] : []),
    ...(photo ? [{ key: 'photo', label: t(`${hours} hours of photography`, `${hours} uur se fotografie`), amount: hours * prices.photographyHour }] : []),
    ...(extras.includes('digitalInvitation') ? [{ key: 'digitalInvitation', label: t('Digital invitation design', 'Digitale uitnodigingsontwerp'), amount: prices.digitalInvitation }] : []),
  ];
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const summary = [
    t('EWIG & EIE — DRAFT ESTIMATE', 'EWIG & EIE — KONSEPBERAMING'),
    t(selectedPackage.en, selectedPackage.af),
    '',
    ...items.map(item => `${item.label}: ${money(item.amount)}`),
    '',
    `${t('Indicative total', 'Geskatte totaal')}: ${money(total)}`,
    t('Draft planning figures only. Print specifications, photographer availability, final scope and pricing are confirmed in a written quote.', 'Slegs konsepbedrae vir beplanning. Drukspesifikasies, fotograafbeskikbaarheid, finale omvang en pryse word in ’n skriftelike kwotasie bevestig.'),
  ].join('\n');
  const enquiryCollection = packageId === 'website' ? '' : selectedPackage.en;
  const enquiryUrl = `/contact?estimate=${encodeURIComponent(summary)}${enquiryCollection ? `&collection=${encodeURIComponent(enquiryCollection)}` : ''}`;

  function selectPackage(id: PackageId) {
    const chosen = packages.find(item => item.id === id)!;
    setPackageId(id);
    setPrint(chosen.print);
    setPhoto(chosen.photo);
    setMenus(chosen.print);
    setInvites(100);
    setHours(6);
  }
  function toggleExtra(id: ExtraId) { setExtras(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]); }
  async function copy() {
    try { await navigator.clipboard.writeText(summary); setCopied(true); window.setTimeout(() => setCopied(false), 2200); } catch { setCopied(false); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'ewig-eie-estimate.txt'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function downloadPdf() {
    downloadEstimatePdf({
      language,
      packageName: t(selectedPackage.en, selectedPackage.af),
      items,
      total,
    });
  }

  return <section className="quote-builder section-pad" id="instant-estimate">
    <div className="quote-builder-heading"><span className="eyebrow"><span className="eyebrow-line"/>{t('MAKE IT YOURS', 'MAAK DIT JULLE EIE')}</span><AnimatedHeading effect="wave">{t('A clearer way to', '’n Makliker manier om')}{' '}<em>{t('plan the beautiful.', 'die mooi te beplan.')}</em></AnimatedHeading><p>{t('Choose your pieces. Watch the estimate change. Save a copy whenever you like.', 'Kies julle dele. Sien hoe die beraming verander. Bewaar enige tyd ’n afskrif.')}</p><span className="quote-draft-flag">✳ {t('Draft prices for planning', 'Konseppryse vir beplanning')}</span></div>
    <div className="quote-builder-layout">
      <div className="quote-flow">
        <div className="quote-progress" aria-label={t('Quote progress', 'Kwotasievordering')}>{stageNames.map((name, index) => <button key={name} type="button" className={index === step ? 'active' : index < step ? 'complete' : ''} onClick={() => setStep(index)} aria-current={index === step ? 'step' : undefined}><span>{index < step ? <Check size={15}/> : `0${index + 1}`}</span><small>{name}</small></button>)}</div>
        <AnimatePresence mode="wait" initial={false}><motion.div key={step} className="quote-stage" initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -12 }} transition={{ duration: .28 }} onAnimationComplete={() => { if (step > 0) stepHeading.current?.focus(); }}>
          <span className="quote-stage-kicker">0{step + 1} / 04</span>
          <h3 ref={stepHeading} tabIndex={-1}>{step === 0 ? t('Start with your story.', 'Begin met julle storie.') : step === 1 ? t('Make your website yours.', 'Maak julle webwerf eie.') : step === 2 ? t('The details beyond digital.', 'Die besonderhede buite digitaal.') : t('Here is your picture.', 'Hier is julle oorsig.')}</h3>
          <p className="quote-stage-copy">{step === 0 ? t('Pick a starting point. You can change every detail in the next steps.', 'Kies ’n beginpunt. Julle kan elke detail in die volgende stappe verander.') : step === 1 ? t('Only add what you actually need. Every choice appears in your total.', 'Voeg net by wat julle regtig nodig het. Elke keuse verskyn in julle totaal.') : step === 2 ? t('Print and photography are flexible planning estimates, shaped to your day.', 'Drukwerk en fotografie is buigsame konsepberamings wat by julle dag aangepas word.') : t('Keep this estimate, share it, or send it through with your enquiry.', 'Bewaar of deel hierdie beraming, of stuur dit saam met julle navraag.')}</p>
          {step === 0 && <div className="quote-package-grid">{packages.map(option => {
            const packageFrom = prices.website + (option.print ? prices.invitationDesign + 100 * (prices.invitationEach + prices.menuCardEach) : 0) + (option.photo ? 6 * prices.photographyHour : 0);
            return <button key={option.id} type="button" className={`quote-package ${packageId === option.id ? 'selected' : ''}`} aria-pressed={packageId === option.id} onClick={() => selectPackage(option.id)}><span className="quote-package-top"><span>{t(option.en, option.af)}</span><span className="quote-package-check">{packageId === option.id ? <Check size={16}/> : '✳'}</span></span><small>{t(option.descriptionEn, option.descriptionAf)}</small><span className="quote-package-includes">{packageContents[option.id].map(line => <span key={line.en}><Check size={13}/>{t(line.en, line.af)}</span>)}</span><strong>{t('Draft from', 'Konsep vanaf')} {money(packageFrom)}</strong></button>;
          })}<div className="quote-package-preview">{t('Want to see the feeling first?', 'Wil julle eers die gevoel sien?')} <Link to="/websites">{t('Explore the sample website and dashboard', 'Verken die voorbeeldwebwerf en paneel')} <ArrowUpRight size={15}/></Link><small>{t('The dashboard is a design preview; production features are scoped in your final quote.', 'Die paneel is ’n ontwerpvoorskou; produksiekenmerke word in julle finale kwotasie bepaal.')}</small></div></div>}
          {step === 1 && <div className="quote-extra-grid">{extraOptions.map(option => <label className={`quote-extra ${extras.includes(option.id) ? 'selected' : ''}`} key={option.id}><input type="checkbox" checked={extras.includes(option.id)} onChange={() => toggleExtra(option.id)}/><span className="quote-extra-name">{t(option.en, option.af)}</span><strong>+ {money(option.price)}</strong></label>)}</div>}
          {step === 2 && <div className="quote-detail-stack"><label className="quote-toggle"><input type="checkbox" checked={print} onChange={event => setPrint(event.target.checked)}/><span><strong>{t('Printed invitation suite', 'Gedrukte uitnodigingsreeks')}</strong><small>{t('Design plus printed invitations', 'Ontwerp plus gedrukte uitnodigings')}</small></span></label>{print && <div className="quote-suboptions"><label>{t('Invitation quantity', 'Aantal uitnodigings')}<select value={invites} onChange={event => setInvites(Number(event.target.value))}>{[50,100,150,200].map(value => <option key={value} value={value}>{value}</option>)}</select></label><label className="quote-toggle quote-mini-toggle"><input type="checkbox" checked={menus} onChange={event => setMenus(event.target.checked)}/><span>{t('Add matching menu cards', 'Voeg bypassende spyskaartjies by')} <small>+ {money(prices.menuCardEach)} {t('each', 'elk')}</small></span></label></div>}<label className="quote-toggle"><input type="checkbox" checked={photo} onChange={event => setPhoto(event.target.checked)}/><span><strong>{t('Photography allowance', 'Fotografietoelaag')}</strong><small>{t('Subject to partner availability', 'Onderhewig aan vennootbeskikbaarheid')}</small></span></label>{photo && <div className="quote-suboptions"><label>{t('Coverage', 'Dekking')}<select value={hours} onChange={event => setHours(Number(event.target.value))}>{[4,6,8,10,12].map(value => <option key={value} value={value}>{value} {t('hours', 'uur')}</option>)}</select></label><small>{money(prices.photographyHour)} {t('per hour, draft allowance', 'per uur, konsepbedrag')}</small></div>}</div>}
          {step === 3 && <div className="quote-review"><div className="quote-review-mark">✳</div><p>{t('Your choices are ready. The total is a planning guide, and the studio will confirm the final quote in writing.', 'Julle keuses is gereed. Die totaal is ’n beplanningsriglyn; die ateljee bevestig die finale kwotasie skriftelik.')}</p><div className="quote-review-actions"><Link className="hero-primary" to={enquiryUrl}>{t('Enquire with this estimate', 'Stuur hierdie beraming')}<ArrowUpRight size={18}/></Link><button type="button" onClick={downloadPdf}><Download size={16}/>{t('Download PDF', 'Laai PDF af')}</button><button type="button" onClick={copy}><Copy size={16}/>{copied ? t('Copied', 'Gekopieer') : t('Copy', 'Kopieer')}</button><button type="button" onClick={download}><Download size={16}/>{t('Text copy', 'Teksafskrif')}</button></div></div>}
          <div className="quote-stage-actions">{step > 0 && <button type="button" className="quote-back" onClick={() => setStep(step - 1)}><ArrowLeft size={17}/>{t('Back', 'Terug')}</button>}{step < 3 && <button type="button" className="quote-next" onClick={() => setStep(step + 1)}>{t('Continue', 'Gaan voort')}<ArrowRight size={18}/></button>}</div>
        </motion.div></AnimatePresence>
      </div>
      <aside className="quote-result" aria-live="polite"><span className="quote-result-kicker"><Sparkles size={16}/>{t('YOUR DRAFT ESTIMATE', 'JULLE KONSEPBERAMING')}</span><div className="quote-total">{money(total)}</div><span className="quote-total-note">{t('Indicative total', 'Geskatte totaal')}</span><div className="quote-line-items">{items.map(item => <div key={item.key}><span>{item.label}</span><strong>{money(item.amount)}</strong></div>)}</div><p className="quote-caveat">{t('Planning figures only. Paper, delivery, photographer availability and final scope are confirmed in a written quote. No details are sent or stored while you build.', 'Slegs beplanningsbedrae. Papier, aflewering, fotograafbeskikbaarheid en finale omvang word in ’n skriftelike kwotasie bevestig. Geen besonderhede word tydens die saamstel gestuur of gestoor nie.')}</p></aside>
    </div>
  </section>;
}
