import { useEffect, useState } from 'react';
import { commitHouseholdReplies, eventResponse, parseDietaryRequirements, updateEventResponse, type Attendance, type DemoGuest } from '../../components/couple/guestModel';
import type { Household, IvoryData, Language } from './content';
import { invitedEventsFor } from './model';

type Props = { data: IvoryData; language: Language; guests: DemoGuest[]; households: Household[]; household: string; onHousehold: (id: string) => void; onChange: (guests: DemoGuest[]) => void; onDashboard: () => void; formatDate: (iso: string) => string };

export function IvoryRSVP({ data, language, guests, households, household, onHousehold, onChange, onDashboard, formatDate }: Props) {
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const [drafts, setDrafts] = useState<Record<string, DemoGuest>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { setDrafts({}); setMessage(null); }, [household]);
  const events = data.events.filter(e => invitedEventsFor(households, household).includes(e.id));
  const members = guests.filter(g => g.householdId === household).map(g => drafts[g.id] ?? g);
  const edit = (guest: DemoGuest, patch: Partial<DemoGuest>) => { setDrafts(d => ({ ...d, [guest.id]: { ...guest, ...patch } })); setMessage(null); };
  const choice = (guest: DemoGuest, eventId: string, value: Attendance) => edit(guest, updateEventResponse(guest, eventId, value));
  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      onChange(commitHouseholdReplies(guests, household, members, events.map(ev => ev.id), data.meals.map(m => m.id), new Date().toISOString()));
      setDrafts({});
      setMessage({ ok: true, text: t('Reply saved in this preview. Dashboard totals, catering and seating have updated. Nothing was sent, and reloading resets the demo.', 'Antwoord in hierdie voorskou gestoor. Paneeltotale, spysenering en sitplekke is bygewerk. Niks is gestuur nie, en herlaai herstel die demo.') });
    } catch {
      setMessage({ ok: false, text: t('Please answer every gathering for each guest, and choose dinner for everyone attending the wedding.', 'Antwoord asseblief elke geleentheid vir elke gas, en kies aandete vir almal wat die troue bywoon.') });
    }
  }
  return <div className="iv-rsvp-form">
    <label className="iv-field">{t('Preview as a fictional household', 'Voorskou as ’n fiktiewe huishouding')}
      <select value={household} onChange={e => onHousehold(e.target.value)}>{households.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select>
    </label>
    <p className="iv-rsvp-invited">{t('Invited to', 'Genooi na')}: {events.map(e => e.name[language]).join(' · ')}</p>
    <form onSubmit={submit} noValidate>
      {members.map(guest => <fieldset key={guest.id} className="iv-guest">
        <legend>{guest.name}</legend>
        {events.map(event => {
          const value = eventResponse(guest, event.id);
          return <fieldset key={event.id} className="iv-choice"><legend>{event.name[language]} <small>{formatDate(event.date)} · {event.time}</small></legend>
            {(['accepted', 'declined'] as const).map(option => <label key={option}><input type="radio" name={`${guest.id}-${event.id}`} value={option} checked={value === option} onChange={() => choice(guest, event.id, option)}/>{option === 'accepted' ? t('Joyfully accepts', 'Aanvaar met vreugde') : t('Regretfully declines', 'Bedank met spyt')}</label>)}
          </fieldset>;
        })}
        {guest.attendance === 'accepted' && <label className="iv-field">{t('Wedding dinner', 'Trouete')}
          <select value={guest.meal ?? ''} onChange={e => edit(guest, { meal: e.target.value || null })}><option value="">{t('Choose dinner', 'Kies aandete')}</option>{data.meals.map(m => <option key={m.id} value={m.id}>{m.name[language]}</option>)}</select>
        </label>}
        {Object.values(guest.eventAttendance ?? {}).includes('accepted') && <details className="iv-needs"><summary>{t('Dietary, allergy and access notes', 'Dieet-, allergie- en toegangsnotas')}</summary>
          <label className="iv-field">{t('Dietary requirements (comma separated, or “none”)', 'Dieetbehoeftes (geskei met kommas, of “geen”)')}<input maxLength={180} value={guest.dietaryRequirements?.join(', ') ?? ''} onChange={e => edit(guest, { dietaryRequirements: parseDietaryRequirements(e.target.value) })}/></label>
          <label className="iv-field">{t('Allergies or cross-contact concerns', 'Allergieë of kruiskontak-bekommernisse')}<input maxLength={200} value={guest.allergies?.map(a => a.ingredient).join('; ') ?? ''} onChange={e => edit(guest, { allergies: e.target.value.trim() ? [{ ingredient: e.target.value, note: '' }] : [] })}/></label>
          <label className="iv-field">{t('Access needs', 'Toegangsbehoeftes')}<input maxLength={200} value={guest.accessNeeds ?? ''} onChange={e => edit(guest, { accessNeeds: e.target.value || null })}/></label>
        </details>}
      </fieldset>)}
      <button type="submit" className="iv-button">{t('Save preview reply', 'Stoor voorbeeldantwoord')}</button>
      {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'iv-ok' : 'iv-error'}>{message.text}</p>}
      {message?.ok && <button type="button" className="iv-link" onClick={onDashboard}>{t('See it in the planning dashboard', 'Sien dit in die beplanningspaneel')} →</button>}
    </form>
    <small className="iv-fine">{t('Demonstration only. A live site needs private invitation links, server validation and secure storage before real guests reply.', 'Slegs ’n demonstrasie. ’n Regte webwerf benodig private uitnodigingskakels, bedienervalidering en veilige berging voordat regte gaste antwoord.')}</small>
  </div>;
}
