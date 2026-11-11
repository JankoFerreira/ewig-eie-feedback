import { useState } from 'react';
import { Check, UserPlus } from 'lucide-react';
import { approveBackup, backupSuggestions, moveBackup, openSeats, setBackupStatus, type BackupGuest, type DemoGuest } from './guestModel';

/** B-list: backups wait in order; when an invited guest declines, the next one is suggested and the couple approves. */
export function BackupGuests({ guests, onGuests, backups, onBackups, af }: { guests: DemoGuest[]; onGuests: (g: DemoGuest[]) => void; backups: BackupGuest[]; onBackups: (b: BackupGuest[]) => void; af: boolean }) {
  const t = (en: string, a: string) => af ? a : en;
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const seats = openSeats(guests, backups);
  const suggestions = backupSuggestions(guests, backups);
  const today = new Date().toISOString().slice(0, 10);
  const approve = (id: string) => { const next = approveBackup(guests, backups, id, today); onGuests(next.guests); onBackups(next.backups); const b = backups.find(x => x.id === id); setNote(t(`Invitation sent to ${b?.name} (demo: nothing is really sent).`, `Uitnodiging aan ${b?.name} gestuur (demo: niks word regtig gestuur nie).`)); };
  const status = { waiting: t('Waiting', 'Wag'), invited: t('Invited', 'Genooi'), skipped: t('Skipped', 'Oorgeslaan') };
  return <section className="cd-backups" aria-labelledby="cd-backups-title">
    <header><span className="garden-kicker">{t('A-LIST & B-LIST', 'A-LYS & B-LYS')}</span><h2 id="cd-backups-title">{t('Backup guests', 'Rugsteungaste')}</h2>
      <p>{t('Your guest list is your A-list. When someone can’t come, the next person on your B-list is suggested here. Nothing is sent until you approve.', 'Julle gastelys is julle A-lys. Wanneer iemand nie kan kom nie, word die volgende persoon op julle B-lys hier voorgestel. Niks word gestuur voordat julle goedkeur nie.')}</p></header>
    <div className={`cd-suggest ${suggestions.length ? 'has-seats' : ''}`} aria-live="polite">
      {suggestions.length ? <>
        <strong>{t(`${seats} ${seats === 1 ? 'seat has' : 'seats have'} opened up.`, `${seats} ${seats === 1 ? 'plek het' : 'plekke het'} oopgegaan.`)}</strong>
        <ul>{suggestions.map(b => <li key={b.id}><span>{t('Invite', 'Nooi')} <b>{b.name}</b>?</span><span><button type="button" className="cd-approve" onClick={() => approve(b.id)}><Check size={15}/>{t('Approve & invite', 'Keur goed en nooi')}</button><button type="button" onClick={() => onBackups(setBackupStatus(backups, b.id, 'skipped'))}>{t('Skip', 'Slaan oor')}</button></span></li>)}</ul>
      </> : <p>{seats ? t('Seats are open, but your B-list has no one waiting.', 'Plekke is oop, maar niemand wag op julle B-lys nie.') : t('No open seats right now. Suggestions appear when an invited guest declines.', 'Geen oop plekke nie. Voorstelle verskyn wanneer ’n genooide gas nie kan kom nie.')}</p>}
      {note && <p className="cd-backup-note" role="status">{note}</p>}
    </div>
    <ol className="cd-backup-list">{backups.map((b, i) => <li key={b.id} className={`is-${b.status}`}>
      <span className="cd-backup-rank">{i + 1}</span><span className="cd-backup-name">{b.name}</span>
      <span className="cd-backup-status">{status[b.status]}{b.invitedOn ? ` · ${b.invitedOn}` : ''}</span>
      <span className="cd-backup-actions">
        {b.status === 'skipped' && <button type="button" onClick={() => onBackups(setBackupStatus(backups, b.id, 'waiting'))}>{t('Restore', 'Herstel')}</button>}
        <button type="button" aria-label={t(`Move ${b.name} up`, `Skuif ${b.name} op`)} disabled={i === 0} onClick={() => onBackups(moveBackup(backups, b.id, -1))}><span aria-hidden="true">↑</span></button>
        <button type="button" aria-label={t(`Move ${b.name} down`, `Skuif ${b.name} af`)} disabled={i === backups.length - 1} onClick={() => onBackups(moveBackup(backups, b.id, 1))}><span aria-hidden="true">↓</span></button>
      </span>
    </li>)}</ol>
    <form className="cd-backup-add" onSubmit={e => { e.preventDefault(); const n = name.trim().slice(0, 80); if (!n) return; onBackups([...backups, { id: `bk${Date.now()}`, name: n, status: 'waiting' }]); setName(''); }}>
      <label><span className="garden-sr-only">{t('Backup guest name', 'Naam van rugsteungas')}</span><input value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder={t('Add someone to your B-list…', 'Voeg iemand by julle B-lys…')}/></label>
      <button type="submit" className="garden-button garden-button-outline"><UserPlus size={15}/>{t('Add to B-list', 'Voeg by B-lys')}</button>
    </form>
  </section>;
}
