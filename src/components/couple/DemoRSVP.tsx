import { EditableChunk } from '../../collections/garden/GardenStudio';
import { useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { parseDietaryRequirements, type DemoGuest, type Attendance } from './guestModel';

type Props = { guests: DemoGuest[]; households: { id: string; label: string }[]; onChange: (guests: DemoGuest[]) => void; af: boolean; deadline: string; onDashboard: () => void };
export function DemoRSVP({guests,households,onChange,af,deadline,onDashboard}:Props) {
  const [household,setHousehold] = useState(households[0].id);
  const [responses,setResponses] = useState<Record<string,Partial<DemoGuest>>>({});
  const [sent,setSent] = useState(false);
  const [error,setError] = useState('');
  const t = (en:string,afrikaans:string) => af ? afrikaans : en;
  const members = guests.filter(g=>g.householdId===household).map(g=>({...g,...responses[g.id]}));
  function update(id:string,patch:Partial<DemoGuest>) { setResponses(prev=>({...prev,[id]:{...prev[id],...patch}}));setSent(false); }
  return <EditableChunk id="rsvp"><div className="garden-rsvp-form">
    <span className="garden-kicker">RSVP · {deadline}</span><h2>{t('A place for you.','’n Plek vir jou.')}</h2><p>{t('Shall we save you a seat? Reply for each person on your invitation.','Hou ons vir jou ’n plek? Antwoord vir elke persoon op jou uitnodiging.')}</p>
    <label className="garden-field">{t('Try a sample invitation','Probeer ’n voorbeelduitnodiging')}<select value={household} onChange={e=>{setHousehold(e.target.value);setSent(false);setError('');}}>{households.map(h=><option key={h.id} value={h.id}>{guests.filter(g=>g.householdId===h.id).map(g=>g.name).join(' & ')}</option>)}</select></label>
    <form onSubmit={e=>{e.preventDefault();if(members.some(g=>g.attendance==='pending')){setError(t('Choose a response for every invited guest.','Kies ’n antwoord vir elke genooide gas.'));return;}onChange(guests.map(g=>members.find(m=>m.id===g.id)??g));setError('');setSent(true);}}>
      {members.map(g=><fieldset className="garden-guest-rsvp" key={g.id}><legend>{g.name}</legend><div className="garden-response-options">{(['accepted','declined'] as Attendance[]).map(value=><label key={value}><input type="radio" name={`attendance-${g.id}`} value={value} checked={g.attendance===value} onChange={()=>update(g.id,{attendance:value})}/><span>{value==='accepted'?t('Joyfully accept','Ja, met graagte'):t('Sadly decline','Ongelukkig nie')}</span></label>)}</div>{g.attendance==='accepted'&&<details><summary>{t('Dietary, allergy or access needs','Dieet-, allergie- of toeganklikheidsbehoeftes')}</summary><label className="garden-field">{t('Dietary requirements','Dieetbehoeftes')}<input maxLength={180} placeholder={t('None, vegetarian, vegan…','Geen, vegetaries, veganisties…')} value={g.dietaryRequirements?.length===0?t('None','Geen'):g.dietaryRequirements?.join(', ')??''} onChange={e=>update(g.id,{dietaryRequirements:parseDietaryRequirements(e.target.value)})}/></label><label className="garden-field">{t('Allergies and cross-contact concerns','Allergieë en kontak met allergene')}<textarea maxLength={300} value={g.allergies?.map(a=>a.ingredient+(a.note?`: ${a.note}`:'')).join('; ')??''} onChange={e=>update(g.id,{allergies:e.target.value.trim()?[{ingredient:e.target.value,note:''}]:[]})}/></label><label className="garden-field">{t('Access needs','Toeganklikheidsbehoeftes')}<textarea maxLength={300} value={g.accessNeeds??''} onChange={e=>update(g.id,{accessNeeds:e.target.value||null})}/></label></details>}</fieldset>)}
      {error&&<p className="garden-form-error" role="alert">{error}</p>}
      <button className="garden-button" type="submit">{sent?t('Update preview response','Werk voorbeeldantwoord by'):t('Save preview response','Stoor voorbeeldantwoord')} <ArrowUpRight size={18}/></button>
      {sent&&<div className="garden-rsvp-success" role="status"><Check size={18}/><p>{t('Saved in this preview. Your dashboard now reflects these replies. No RSVP was sent; reloading resets the demo.','In hierdie voorskou gestoor. Julle paneel wys nou hierdie antwoorde. Geen RSVP is gestuur nie; herlaai herstel die demo.')}</p><button type="button" className="garden-text-button" onClick={onDashboard}>{t('See it in the dashboard','Sien dit in die paneel')} ↗</button></div>}
    </form><small>{t('Fictional guests only. Please do not enter real personal or medical details.','Slegs fiktiewe gaste. Moet asseblief nie werklike persoonlike of mediese besonderhede invoer nie.')}</small>
  </div></EditableChunk>;
}
