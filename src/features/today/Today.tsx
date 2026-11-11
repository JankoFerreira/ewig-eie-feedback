import { useEffect, useMemo, useState } from 'react';
import { liveSchedule, markDone, minutesFor, nowNext, shiftFrom, weddingNowMinutes, type Roster, type Slot } from './model';
import { localRosterSync, type RosterSync } from './sync';
import './today.css';

type Lang = 'en' | 'af';
const text = (lang: Lang) => (en: string, af: string) => lang === 'af' ? af : en;

/** Shared roster state for one wedding, kept in step with every open view. */
export function useRoster(weddingId: string, sync?: RosterSync) {
  const channel = useMemo(() => sync ?? localRosterSync(weddingId), [weddingId, sync]);
  const [roster, setRoster] = useState<Roster>(() => channel.load());
  useEffect(() => channel.subscribe(setRoster), [channel]);
  const update = (next: Roster) => { setRoster(next); channel.save(next); };
  return { roster, update };
}

/** Wedding-local "now". Before or after the wedding, a demo slider lets people preview the day. */
function useNow(slots: Slot[]) {
  const [real, setReal] = useState(() => weddingNowMinutes());
  useEffect(() => { const id = setInterval(() => setReal(weddingNowMinutes()), 20000); return () => clearInterval(id); }, []);
  const first = slots.length ? Math.min(...slots.map(s => minutesFor(s.date, s.time))) : real;
  const last = slots.length ? Math.max(...slots.map(s => minutesFor(s.date, s.time))) : real;
  const live = real >= first - 120 && real <= last + 240;
  const [preview, setPreview] = useState(first + 5);
  return { now: live ? real : preview, live, first, last, preview, setPreview };
}

const fmt = (lang: Lang, date: string) => new Intl.DateTimeFormat(lang === 'af' ? 'af-ZA' : 'en-ZA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
const clock = (minutes: number) => new Date(minutes * 60000).toISOString().slice(11, 16);

/** What guests see on the day: now, next, and the rest of the day with live times. */
export function TodayMode({ slots, weddingId, language, names, onOpenRoster, extra }: { slots: Slot[]; weddingId: string; language: Lang; names: string; onOpenRoster?: () => void; extra?: React.ReactNode }) {
  const t = text(language);
  const { roster } = useRoster(weddingId);
  const { now, live: isLive, first, last, preview, setPreview } = useNow(slots);
  const schedule = liveSchedule(slots, roster);
  const { current, next, minutesToNext } = nowNext(schedule, now);
  const late = schedule.find(s => s.delay > 0 && s.start >= now);
  const days = [...new Set(schedule.map(s => s.date))];
  return <section className="today" aria-labelledby="today-title" data-no-translate>
    <header className="today-head"><p className="today-kicker">{t('TODAY', 'VANDAG')} · {names}</p><h1 id="today-title">{current ? current.title : t('Not long now.', 'Nie meer lank nie.')}</h1>
      {current?.place && <p className="today-place">{current.place}</p>}
      {late && <p className="today-late" role="status">{t(`Running ${late.delay} min behind — times below are updated.`, `Loop ${late.delay} min agter — tye hieronder is bygewerk.`)}</p>}
    </header>
    {next && <div className="today-next" aria-live="polite"><span>{t('Next', 'Volgende')}</span><strong>{next.title}</strong><span>{next.time}{minutesToNext !== null && minutesToNext < 180 ? ` · ${t('in', 'oor')} ${minutesToNext} min` : ''}{next.place ? ` · ${next.place}` : ''}</span></div>}
    {extra}
    {days.map(day => <div key={day} className="today-day"><h2>{fmt(language, day)}</h2><ol>{schedule.filter(s => s.date === day).map(s => <li key={s.id} className={s.start <= now ? (s.id === current?.id ? 'is-now' : 'is-past') : ''} aria-current={s.id === current?.id ? 'step' : undefined}>
      <time>{s.time}{s.delay !== 0 && <small>{t('was', 'was')} {s.planned}</small>}</time><span>{s.title}{s.place && <small>{s.place}</small>}</span>
    </li>)}</ol></div>)}
    {!isLive && <div className="today-demo"><label>{t('Preview the day at', 'Voorskou die dag om')} <strong>{clock(preview)}</strong><input type="range" min={first - 30} max={last + 60} step={5} value={preview} onChange={e => setPreview(Number(e.target.value))}/></label>
      <small>{t('Before the day, this slider lets you see Today mode at any time. On the day it follows the real clock.', 'Voor die dag laat hierdie skuifbalk julle Vandag-modus op enige tyd sien. Op die dag volg dit die regte horlosie.')}</small></div>}
    {onOpenRoster && <p className="today-roster-link"><button type="button" onClick={onOpenRoster}>{t('MC or planner? Open the day-of roster (demo)', 'MS of beplanner? Maak die dagrooster oop (demo)')}</button></p>}
  </section>;
}

/** The private roster for the MC or planner: one tap moves a moment and everything after it. */
export function RosterPanel({ slots, weddingId, language, names }: { slots: Slot[]; weddingId: string; language: Lang; names: string }) {
  const t = text(language);
  const { roster, update } = useRoster(weddingId);
  const [history, setHistory] = useState<Roster[]>([]);
  const schedule = liveSchedule(slots, roster);
  const apply = (next: Roster) => { setHistory(h => [...h.slice(-19), roster]); update(next); };
  const days = [...new Set(schedule.map(s => s.date))];
  return <section className="roster" aria-labelledby="roster-title" data-no-translate>
    <header><p className="today-kicker">{t('DAY-OF ROSTER · PRIVATE LINK', 'DAGROOSTER · PRIVATE SKAKEL')}</p><h1 id="roster-title">{names}</h1>
      <p>{t('Running late? Tap +5 on the moment that slipped. It and everything after it that day move together, and guests see it straight away.', 'Loop dit laat? Tik +5 op die oomblik wat geskuif het. Dit en alles daarna op dié dag skuif saam, en gaste sien dit dadelik.')}</p></header>
    <div className="roster-actions"><button type="button" disabled={!history.length} onClick={() => { const prev = history.at(-1); if (prev) { setHistory(h => h.slice(0, -1)); update({ ...prev, updatedAt: new Date().toISOString() }); } }}>{t('Undo last change', 'Ontdoen laaste verandering')}</button>
      <button type="button" onClick={() => { if (window.confirm(t('Put every time back to the original schedule?', 'Sit elke tyd terug na die oorspronklike program?'))) apply({ version: 1, delays: {}, done: {}, updatedAt: new Date().toISOString() }); }}>{t('Reset to planned times', 'Herstel na beplande tye')}</button>
      {roster.updatedAt && <small role="status">{t('Updated', 'Bygewerk')} {new Date(roster.updatedAt).toLocaleTimeString(language === 'af' ? 'af-ZA' : 'en-ZA', { hour: '2-digit', minute: '2-digit' })}</small>}</div>
    {days.map(day => <div key={day} className="roster-day"><h2>{fmt(language, day)}</h2><ol>{schedule.filter(s => s.date === day).map(s => <li key={s.id} className={s.done ? 'is-done' : ''}>
      <div className="roster-time"><strong>{s.time}</strong>{s.delay !== 0 && <small>{s.delay > 0 ? '+' : ''}{s.delay} min · {t('planned', 'beplan')} {s.planned}</small>}</div>
      <div className="roster-title">{s.title}{s.place && <small>{s.place}</small>}</div>
      <div className="roster-buttons" role="group" aria-label={`${t('Adjust', 'Pas aan')} ${s.title}`}>
        <button type="button" onClick={() => apply(shiftFrom(slots, roster, s.id, -5))} aria-label={`${s.title}: ${t('5 minutes earlier, with everything after', '5 minute vroeër, met alles daarna')}`}>−5</button>
        <button type="button" onClick={() => apply(shiftFrom(slots, roster, s.id, 5))} aria-label={`${s.title}: ${t('5 minutes later, with everything after', '5 minute later, met alles daarna')}`}>+5</button>
        <button type="button" onClick={() => apply(shiftFrom(slots, roster, s.id, 15))} aria-label={`${s.title}: ${t('15 minutes later, with everything after', '15 minute later, met alles daarna')}`}>+15</button>
        <label className="roster-done"><input type="checkbox" checked={s.done} onChange={e => apply(markDone(roster, s.id, e.target.checked))}/>{t('Done', 'Klaar')}</label>
      </div>
    </li>)}</ol></div>)}
    <p className="roster-note">{t('Demo: changes sync between tabs in this browser only. Live, this private link is protected by a token and changes reach every guest’s phone through the backend.', 'Demo: veranderinge sinkroniseer net tussen oortjies in hierdie blaaier. Regstreeks word hierdie private skakel deur ’n sleutel beskerm en bereik veranderinge elke gas se foon via die bediener.')}</p>
  </section>;
}
