import { lazy, Suspense, useRef, useState } from 'react';
import { CoupleDashboard } from '../../components/couple/CoupleDashboard';
import type { DemoGuest } from '../../components/couple/guestModel';
import { collectionCapabilities, type Capability } from '../shared/capabilities';
import type { Household, IvoryData, Language } from './content';
import { analyseSeating, autoSeat, cateringSummary, householdStatus, isInvited, summarizeInvitedEvent, type Seating } from './model';
import { cateringCsv, download, householdCsv, runSheetCsv, seatingCsv } from './exports';

// The shared wedding & honeymoon planner, loaded only when its tab opens. Ivory keeps its own storage key.
const BudgetPlanner = lazy(() => import('../../features/budget/BudgetPlanner'));
export const IVORY_BUDGET_KEY = 'ewig-ivory-budget-v1';

type Tab = { id: string; requires: Capability; en: string; af: string };
const TABS: Tab[] = [
  { id: 'guests', requires: 'guestDashboard', en: 'Guests', af: 'Gaste' },
  { id: 'catering', requires: 'cateringSummary', en: 'Catering', af: 'Spysenering' },
  { id: 'seating', requires: 'seatingPlan', en: 'Seating', af: 'Sitplekke' },
  { id: 'exports', requires: 'plannerExports', en: 'Planner exports', af: 'Beplanneruitvoer' },
  { id: 'budget', requires: 'budgetPlanner', en: 'Budget', af: 'Begroting' },
];

type Props = { data: IvoryData; language: Language; guests: DemoGuest[]; onGuests: (g: DemoGuest[]) => void; households: Household[]; seating: Seating; onSeating: (s: Seating) => void; onReset: () => void; formatDate: (iso: string) => string };

export function IvoryDashboard({ data, language, guests, onGuests, households, seating, onSeating, onReset, formatDate }: Props) {
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const tabs = TABS.filter(tab => collectionCapabilities.ivory.includes(tab.requires));
  const [active, setActive] = useState(tabs[0].id);
  const [notice, setNotice] = useState('');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const names = `${data.couple.first} & ${data.couple.second}`;
  const catering = cateringSummary(guests, data, language);
  const seatReport = analyseSeating(guests, data, seating);
  const wedding = summarizeInvitedEvent(guests, households, 'wedding');
  const onKey = (e: React.KeyboardEvent, index: number) => {
    const next = e.key === 'ArrowRight' ? index + 1 : e.key === 'ArrowLeft' ? index - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return; e.preventDefault();
    const tab = tabs[(next + tabs.length) % tabs.length]; setActive(tab.id); tabRefs.current[tab.id]?.focus();
  };
  const file = (name: string) => `ivory-${data.couple.first}-${data.couple.second}-${name}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.-]+/g, '-');

  return <div className="iv-dashboard">
    <header className="iv-dash-head">
      <div><p className="iv-kicker">{t('PLANNING DASHBOARD · DEMONSTRATION', 'BEPLANNINGSPANEEL · DEMONSTRASIE')}</p><h1>{t('The weekend,', 'Die naweek,')} <em>{t('at a glance.', 'in een oogopslag.')}</em></h1></div>
      <dl className="iv-dash-totals">
        <div><dt>{t('Invited', 'Genooi')}</dt><dd>{guests.length}</dd></div>
        <div><dt>{t('Attending the wedding', 'Woon die troue by')}</dt><dd>{wedding.accepted}</dd></div>
        <div><dt>{t('Awaiting reply', 'Wag op antwoord')}</dt><dd>{wedding.pending}</dd></div>
        <div><dt>{t('Seated', 'Geplaas')}</dt><dd>{seatReport.seated}/{seatReport.seats}</dd></div>
      </dl>
    </header>
    <p className="iv-demo-banner" role="note">{t(`Fictional guests only (${guests.length} people in ${households.length} households). Changes stay on this page and reset on reload. No invitations, emails or reminders are sent — that needs a production backend.`, `Slegs fiktiewe gaste (${guests.length} mense in ${households.length} huishoudings). Veranderinge bly op hierdie blad en herstel ná herlaai. Geen uitnodigings, e-posse of herinneringe word gestuur nie — dit benodig ’n produksiebediener.`)}</p>

    <div className="iv-tabs" role="tablist" aria-label={t('Dashboard sections', 'Paneelafdelings')}>
      {tabs.map((tab, i) => <button key={tab.id} ref={el => { tabRefs.current[tab.id] = el; }} role="tab" id={`iv-tab-${tab.id}`} aria-controls={`iv-panel-${tab.id}`} aria-selected={active === tab.id} tabIndex={active === tab.id ? 0 : -1} onClick={() => setActive(tab.id)} onKeyDown={e => onKey(e, i)}>{t(tab.en, tab.af)}</button>)}
    </div>

    <section role="tabpanel" id={`iv-panel-${active}`} aria-labelledby={`iv-tab-${active}`} tabIndex={0} className="iv-panel">
      {active === 'guests' && <CoupleDashboard guests={guests} onChange={onGuests} names={names} af={language === 'af'} onReset={onReset} collection="ivory" events={data.events.map(e => ({ id: e.id, label: e.name[language] }))} meals={data.meals.map(m => ({ id: m.id, label: m.name[language] }))} isInvited={(g, eventId) => isInvited(households, g, eventId)} householdLabel={g => { const h = households.find(x => x.id === g.householdId); return h ? `${h.name} · ${householdStatus(guests, households, h.id) === 'complete' ? t('replied', 'geantwoord') : householdStatus(guests, households, h.id) === 'partial' ? t('partly replied', 'gedeeltelik') : t('awaiting reply', 'wag op antwoord')}` : ''; }} demoNote={t('Guests are grouped by household: each household receives one invitation showing only its gatherings. Edit any reply below; every total follows.', 'Gaste is per huishouding gegroepeer: elke huishouding ontvang een uitnodiging met net sy geleenthede. Verander enige antwoord hieronder; elke totaal volg.')}/>}

      {active === 'catering' && <div className="iv-catering">
        <article><h2>{t('Wedding dinner', 'Trouete')}</h2><p className="iv-small">{catering.attending} {t('attending guests', 'gaste wat bywoon')}</p><ul>{catering.meals.map(m => <li key={m.label}><strong>{m.count}</strong> {m.label}</li>)}{!!catering.unselected.length && <li className="iv-warn-text"><strong>{catering.unselected.length}</strong> {t('still to choose', 'moet nog kies')}: {catering.unselected.join(', ')}</li>}</ul></article>
        <article><h2>{t('Dietary requirements', 'Dieetbehoeftes')}</h2>{catering.dietary.length ? <ul>{catering.dietary.map(d => <li key={d.label}><strong>{d.count}</strong> {d.label}<small>{d.guests.join(', ')}</small></li>)}</ul> : <p>{t('None recorded.', 'Niks aangeteken nie.')}</p>}{!!catering.unanswered.length && <p className="iv-small">{t('Not yet answered', 'Nog nie beantwoord nie')}: {catering.unanswered.join(', ')}</p>}<p className="iv-fine">{t('Labels overlap; do not add them to estimate plates.', 'Etikette oorvleuel; moenie hulle optel om borde te skat nie.')}</p></article>
        <article><h2>{t('Allergies — confirm with the caterer', 'Allergieë — bevestig met die spysenier')}</h2>{catering.allergies.length ? <ul>{catering.allergies.map(a => <li key={a.guest}><strong>{a.guest}</strong> — {a.detail}<small>{t('Table', 'Tafel')}: {data.tables.find(x => x.id === seating[guests.find(g => g.name === a.guest)?.id ?? ''])?.name ?? t('not seated', 'nie geplaas nie')}</small></li>)}</ul> : <p>{t('None recorded.', 'Niks aangeteken nie.')}</p>}</article>
        <article><h2>{t('Access needs', 'Toegangsbehoeftes')}</h2>{catering.access.length ? <ul>{catering.access.map(a => <li key={a.guest}><strong>{a.guest}</strong> — {a.detail}</li>)}</ul> : <p>{t('None recorded.', 'Niks aangeteken nie.')}</p>}</article>
        <article><h2>{t('Headcounts by gathering', 'Koppetalle per geleentheid')}</h2><ul>{data.events.map(e => <li key={e.id}><strong>{summarizeInvitedEvent(guests, households, e.id).accepted}</strong> {e.name[language]}</li>)}</ul></article>
      </div>}

      {active === 'seating' && <div className="iv-seating">
        <div className="iv-seating-bar">
          <p>{seatReport.seated} {t('of', 'van')} {seatReport.seats} {t('seats used', 'sitplekke gebruik')} · {seatReport.unseated.length} {t('attending guests unseated', 'bywonende gaste nie geplaas nie')}</p>
          <button type="button" className="iv-button" onClick={() => { onSeating(autoSeat(guests, data, seating)); setNotice(t('Attending households placed together where they fit. Declined guests were removed. Review before exporting.', 'Bywonende huishoudings saam geplaas waar hulle pas. Gaste wat bedank het, is verwyder. Hersien voor uitvoer.')); }}>{t('Seat remaining households', 'Plaas oorblywende huishoudings')}</button>
          <button type="button" className="iv-link" onClick={() => { onSeating({}); setNotice(t('Seating plan cleared.', 'Sitplekplan skoongemaak.')); }}>{t('Clear plan', 'Maak plan skoon')}</button>
        </div>
        <p role="status" className="iv-small">{notice}</p>
        {(seatReport.splitHouseholds.length > 0 || seatReport.declinedButSeated.length > 0 || seatReport.tables.some(x => x.over)) && <ul className="iv-warnings" aria-label={t('Seating checks', 'Sitplekkontroles')}>
          {seatReport.tables.filter(x => x.over).map(x => <li key={x.id}>{x.name}: {x.seated.length}/{x.capacity} — {t('over capacity', 'oor kapasiteit')}</li>)}
          {seatReport.splitHouseholds.map(id => <li key={id}>{households.find(h => h.id === id)?.name}: {t('household split across tables', 'huishouding oor tafels verdeel')}</li>)}
          {seatReport.declinedButSeated.map(g => <li key={g.id}>{g.name}: {t('declined but still seated', 'het bedank maar is nog geplaas')}</li>)}
        </ul>}
        <div className="iv-seating-grid">
          {seatReport.tables.map(table => <article key={table.id} className={table.over ? 'iv-over' : ''} aria-label={`${table.name}, ${table.seated.length} / ${table.capacity}`}>
            <header><h2>{table.name}</h2><span>{table.seated.length}/{table.capacity}</span></header>
            <ol>{table.seated.map(g => <li key={g.id}>{g.name}{g.attendance === 'pending' && <em> · {t('provisional', 'voorlopig')}</em>}{!!g.allergies?.length && <span className="iv-flag" title={t('Allergy note', 'Allergienota')}> · {t('allergy', 'allergie')}</span>}</li>)}
              {Array.from({ length: Math.max(0, table.capacity - table.seated.length) }, (_, i) => <li key={`empty-${i}`} className="iv-empty-seat" aria-hidden="true">—</li>)}</ol>
          </article>)}
        </div>
        <div className="iv-table-scroll"><table className="iv-assign"><caption>{t('Assign guests to tables', 'Ken gaste aan tafels toe')}</caption>
          <thead><tr><th scope="col">{t('Guest', 'Gas')}</th><th scope="col">RSVP</th><th scope="col">{t('Table', 'Tafel')}</th></tr></thead>
          <tbody>{guests.filter(g => g.attendance !== 'declined' || seating[g.id]).map(g => <tr key={g.id}><th scope="row">{g.name}<small>{households.find(h => h.id === g.householdId)?.name}</small></th><td>{g.attendance === 'accepted' ? t('Attending', 'Woon by') : g.attendance === 'pending' ? t('Awaiting', 'Wag') : t('Declined', 'Bedank')}</td>
            <td><select aria-label={`${g.name}: ${t('table', 'tafel')}`} value={seating[g.id] ?? ''} onChange={e => { const next = { ...seating }; if (e.target.value) next[g.id] = e.target.value; else delete next[g.id]; onSeating(next); }}><option value="">{t('Not seated', 'Nie geplaas nie')}</option>{seatReport.tables.map(x => <option key={x.id} value={x.id}>{x.name} ({x.seated.length}/{x.capacity})</option>)}</select></td></tr>)}</tbody>
        </table></div>
      </div>}

      {active === 'budget' && <div className="iv-budget">
        <p className="iv-demo-banner" role="note">{t('Unlike the demo guests, this budget is real and saved in this browser only (separate from the standalone planner). It is in English for now. Use its backup to move it between devices.', 'Anders as die demogaste is hierdie begroting eg en word net in hierdie blaaier gestoor (apart van die losstaande beplanner). Dit is tans in Engels. Gebruik die rugsteun om dit tussen toestelle te skuif.')}</p>
        <Suspense fallback={<p className="iv-small">{t('Loading budget…', 'Laai begroting…')}</p>}><BudgetPlanner storageKey={IVORY_BUDGET_KEY} embedded/></Suspense>
      </div>}
      {active === 'exports' && <div className="iv-exports">
        <p>{t('Spreadsheet-ready files for your planner, venue and caterer. They are generated in your browser from the fictional data on this page.', 'Sigbladgereed lêers vir julle beplanner, venue en spysenier. Hulle word in jou blaaier geskep uit die fiktiewe data op hierdie blad.')}</p>
        <ul>
          <li><button type="button" className="iv-button" onClick={() => download(file('households.csv'), householdCsv(guests, households, data, language))}>{t('Household replies (CSV)', 'Huishoudingantwoorde (CSV)')}</button><span>{t('Every guest, every gathering, dinner choice and reply date.', 'Elke gas, elke geleentheid, etekeuse en antwoorddatum.')}</span></li>
          <li><button type="button" className="iv-button" onClick={() => download(file('catering.csv'), cateringCsv(guests, households, data, seating, language))}>{t('Catering summary (CSV)', 'Spyseneringsopsomming (CSV)')}</button><span>{t('Headcounts, meals, dietary labels, allergies and access notes, with tables.', 'Koppetalle, etes, dieetetikette, allergieë en toegangsnotas, met tafels.')}</span></li>
          <li><button type="button" className="iv-button" onClick={() => download(file('seating.csv'), seatingCsv(guests, data, seating, language))}>{t('Seating plan (CSV)', 'Sitplekplan (CSV)')}</button><span>{t('Table, seat, guest, meal and dietary note — ready for place cards.', 'Tafel, sitplek, gas, ete en dieetnota — gereed vir plekkaartjies.')}</span></li>
          <li><button type="button" className="iv-button" onClick={() => download(file('run-sheet.csv'), runSheetCsv(data, language))}>{t('Weekend run sheet (CSV)', 'Naweekprogram (CSV)')}</button><span>{t('Every gathering and visible moment, in time order.', 'Elke geleentheid en sigbare oomblik, in tydsorde.')}</span></li>
          <li><button type="button" className="iv-button" onClick={() => window.print()}>{t('Print planner pack', 'Druk beplannerspakket')}</button><span>{t('Run sheet, headcounts, kitchen notes and seating on clean pages. Choose “Save as PDF” to share.', 'Program, koppetalle, kombuisnotas en sitplekke op netjiese bladsye. Kies “Stoor as PDF” om te deel.')}</span></li>
        </ul>
        <p className="iv-fine">{t('Production: scheduled exports, planner access accounts and live sync need a backend.', 'Produksie: geskeduleerde uitvoer, beplannerrekeninge en lewendige sinkronisering benodig ’n bediener.')}</p>
      </div>}
    </section>
    <div className="iv-print-pack" aria-hidden="true">
      <h1>{names} · {t('Planner pack', 'Beplannerspakket')}</h1>
      <p>{formatDate(data.date)} · {data.venue}, {data.region} · {t('Fictional demonstration data', 'Fiktiewe demonstrasiedata')}</p>
      <section><h2>{t('Run sheet', 'Program')}</h2><table><tbody>{data.events.flatMap(e => [<tr key={e.id}><th colSpan={3}>{e.name[language]} · {formatDate(e.date)} · {e.location}</th></tr>, ...data.itinerary.filter(i => i.eventId === e.id && !i.hidden).sort((a, b) => a.time.localeCompare(b.time)).map(i => <tr key={i.id}><td>{i.time}</td><td>{i.name[language]}</td><td>{i.note[language]}</td></tr>)])}</tbody></table></section>
      <section><h2>{t('Headcounts & dinner', 'Koppetalle en aandete')}</h2><table><tbody>{data.events.map(e => <tr key={e.id}><td>{e.name[language]}</td><td>{summarizeInvitedEvent(guests, households, e.id).accepted}</td></tr>)}{catering.meals.map(m => <tr key={m.label}><td>{m.label}</td><td>{m.count}</td></tr>)}</tbody></table></section>
      <section><h2>{t('Dietary, allergy & access', 'Dieet, allergie en toegang')}</h2><table><tbody>{catering.dietary.map(d => <tr key={d.label}><td>{d.label}</td><td>{d.guests.join(', ')}</td></tr>)}{catering.allergies.map(a => <tr key={a.guest}><td>{t('Allergy', 'Allergie')}: {a.detail}</td><td>{a.guest}</td></tr>)}{catering.access.map(a => <tr key={a.guest}><td>{t('Access', 'Toegang')}: {a.detail}</td><td>{a.guest}</td></tr>)}</tbody></table></section>
      <section><h2>{t('Seating', 'Sitplekke')}</h2><table><tbody>{seatReport.tables.map(x => <tr key={x.id}><th>{x.name} ({x.seated.length}/{x.capacity})</th><td>{x.seated.map(g => g.name).join(', ')}</td></tr>)}</tbody></table></section>
    </div>
  </div>;
}
