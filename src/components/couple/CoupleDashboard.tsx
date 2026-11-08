import { useState } from 'react';
import { Check, Clock3, Download, Search, Users } from 'lucide-react';
import { summarizeGuests, type Attendance, type DemoGuest } from './guestModel';

type Props = { guests: DemoGuest[]; onChange: (guests: DemoGuest[]) => void; names: string; af: boolean; onReset: () => void };
export function CoupleDashboard({ guests, onChange, names, af, onReset }: Props) {
  const [filter,setFilter] = useState<'all' | Attendance>('all');
  const [query,setQuery] = useState('');
  const stats = summarizeGuests(guests);
  const t = (en: string, afrikaans: string) => af ? afrikaans : en;
  const labels = { accepted:t('Attending','Woon by'),declined:t('Declined','Kan nie kom nie'),pending:t('Awaiting reply','Wag op antwoord') };
  const visible = guests.filter(g => (filter === 'all' || g.attendance === filter) && g.name.toLowerCase().includes(query.toLowerCase()));
  function exportGuests() {
    const cell = (text: string) => `"${text.replace(/"/g,'""')}"`;
    const rows = [['Guest','Attendance','Dietary requirements','Allergies','Access needs'],...guests.map(g => [g.name,g.attendance,g.dietaryRequirements?.join('; ') ?? 'Unanswered',g.allergies?.map(a => `${a.ingredient}: ${a.note}`).join('; ') ?? 'Unanswered',g.accessNeeds ?? ''])];
    const url = URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row => row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'}));
    const link = document.createElement('a'); link.href = url; link.download = 'garden-demo-guests.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  }
  return <section className="couple-dashboard" aria-label={t('Couple dashboard preview','Paartjiepaneelvoorskou')}>
    <div className="cd-heading"><div><span className="garden-kicker">{t('YOUR LITTLE PLANNING SPACE','JULLE EIE BEPLANNINGSRUIMTE')}</span><h1>{t('Hello,','Hallo,')} <em>{names}.</em></h1><p>{t('The people you love. Every detail in one place.','Die mense vir wie julle lief is. Elke detail op een plek.')}</p></div><button className="garden-button garden-button-outline" onClick={exportGuests}><Download size={16}/>{t('Export guest list','Laai gastelys af')}</button></div>
    <p className="garden-demo-note">{t('Interactive demo · 8 fictional guests, a sample of the 64-person wedding. Changes stay in this preview and reset on reload.','Interaktiewe demo · 8 fiktiewe gaste, ’n voorbeeld van die troue met 64 gaste. Veranderinge bly in hierdie voorskou en herstel wanneer jy herlaai.')}</p>
    <div className="cd-stats">{[
      {icon:Users,value:stats.invited,label:t('Invited','Genooi')},
      {icon:Check,value:stats.accepted,label:t('Attending','Woon by')},
      {icon:Clock3,value:stats.pending,label:t('Awaiting reply','Wag op antwoord')},
      {icon:Users,value:stats.declined,label:t('Unable to join','Kan nie kom nie')},
    ].map(({icon:Icon,value,label}) => <div key={label}><Icon size={18}/><strong>{value}</strong><span>{label}</span></div>)}</div>
    <div className="cd-catering"><span>{t('A little care goes a long way.','’n Bietjie omgee maak ’n groot verskil.')}</span><p>{t(`${stats.dietary} attending guests have dietary requirements. ${stats.allergies} have allergy notes to discuss with the caterer.`,`${stats.dietary} gaste wat bywoon het dieetbehoeftes. ${stats.allergies} het allergienotas om met die spysenier te bespreek.`)}</p></div>
    <div className="cd-guest-panel"><div className="cd-controls"><h2>{t('Your guest list','Julle gastelys')}</h2><label className="cd-search"><Search size={17}/><span className="garden-sr-only">{t('Search guests','Soek gaste')}</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('Find a guest…','Soek ’n gas…')}/></label><label><span className="garden-sr-only">{t('Filter attendance','Filter bywoning')}</span><select value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="all">{t('All guests','Alle gaste')}</option>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>
      <div className="cd-table-scroll"><table><caption className="garden-sr-only">{t('Fictional guests and RSVP responses','Fiktiewe gaste en RSVP-antwoorde')}</caption><thead><tr><th>{t('Guest','Gas')}</th><th>RSVP</th><th>{t('A little extra care','’n Bietjie ekstra sorg')}</th></tr></thead><tbody>{visible.map(guest=><tr key={guest.id}><td><span className="cd-avatar" aria-hidden="true">{guest.name.split(' ').map(n=>n[0]).join('')}</span><strong>{guest.name}</strong></td><td><select aria-label={`${guest.name} RSVP`} className={`cd-status cd-status-${guest.attendance}`} value={guest.attendance} onChange={e=>onChange(guests.map(g=>g.id===guest.id?{...g,attendance:e.target.value as Attendance}:g))}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></td><td>{guest.dietaryRequirements?.length ? guest.dietaryRequirements.join(', ') : guest.dietaryRequirements === null ? t('Not confirmed','Nog nie bevestig nie') : t('No dietary requirements','Geen dieetbehoeftes')}{!!guest.allergies?.length && <span className="cd-allergy">{t('Allergy','Allergie')}: {guest.allergies.map(a=>`${a.ingredient} — ${a.note}`).join('; ')}</span>}{guest.accessNeeds && <small>{guest.accessNeeds}</small>}</td></tr>)}</tbody></table>{!visible.length && <p className="cd-empty">{t('No guests match this search.','Geen gaste stem met hierdie soektog ooreen nie.')}</p>}</div>
      <div className="cd-bottom"><small>{t('Sample responses dated August 2027. Nothing is sent to guests.','Voorbeeldantwoorde gedateer Augustus 2027. Niks word aan gaste gestuur nie.')}</small><button className="garden-text-button" onClick={onReset}>{t('Reset demo guests','Herstel demogaste')}</button></div>
    </div>
  </section>;
}
