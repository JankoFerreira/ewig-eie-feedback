import type { IvoryData, Language } from './content';
import { Monogram, romanDate } from './Monogram';

type Props = { data: IvoryData; language: Language; formatDate: (iso: string) => string; sampleGuest?: string; sampleTable?: string };

/** Coordinated digital stationery suite. Every line is drawn from the same editable content. */
export function StationerySuite({ data, language, formatDate, sampleGuest = 'Chloé Martin', sampleTable }: Props) {
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const copy = (id: string) => data.text[id][language];
  const { couple, monogram } = data;
  const mono = (size: number, withDate = false) => <Monogram left={monogram.left} right={monogram.right} style={monogram.style} size={size} date={withDate ? romanDate(data.date) : undefined}/>;
  const wedding = data.events.find(e => e.id === 'wedding')!;
  const tableName = sampleTable ?? data.tables[0].name;
  const pieces = [
    { id: 'save', label: t('Save the date', 'Hou die datum oop'), body: <>{mono(84)}<p className="iv-card-kicker">{copy('stationery.save.title')}</p><h3>{couple.first} <em>&</em> {couple.second}</h3><p>{formatDate(data.date)}</p><p className="iv-card-small">{data.venue} · {data.region}</p><p className="iv-card-fine">{copy('stationery.save.line')}</p></> },
    { id: 'invitation', label: t('Invitation', 'Uitnodiging'), body: <>{mono(92, true)}<p className="iv-card-small">{copy('invitation.lead')}</p><h3>{couple.first} {couple.firstSurname}<em>&</em>{couple.second} {couple.secondSurname}</h3><p className="iv-card-small">{copy('invitation.request')}</p><p>{formatDate(data.date)} · {wedding.time}</p><p className="iv-card-small">{data.venue}, {data.region}</p></> },
    { id: 'details', label: t('Weekend card', 'Naweekkaart'), body: <><p className="iv-card-kicker">{copy('stationery.details.title')}</p><dl>{data.events.map(e => <div key={e.id}><dt>{e.name[language]}</dt><dd>{formatDate(e.date)} · {e.time}<br/><span>{e.dress[language]}</span></dd></div>)}</dl></> },
    { id: 'reply', label: t('Reply card', 'Antwoordkaart'), body: <><p className="iv-card-kicker">{copy('stationery.reply.title')}</p><p>{copy('invitation.reply')} {formatDate(data.deadline)}</p><p className="iv-card-small">{copy('stationery.reply.line')}</p><p className="iv-card-code" aria-label={t('Sample invitation code', 'Voorbeelduitnodigingskode')}>AV · 0310 · DEMO</p></> },
    { id: 'menu', label: t('Menu', 'Spyskaart'), body: <>{mono(56)}<p className="iv-card-kicker">{copy('stationery.menu.title')}</p><p className="iv-card-small">{copy('stationery.menu.starter')}</p><span className="iv-rule" aria-hidden="true"/>{data.meals.map(m => <p key={m.id} className="iv-card-small">{m.name[language]}</p>)}<span className="iv-rule" aria-hidden="true"/><p className="iv-card-small">{copy('stationery.menu.dessert')}</p></> },
    { id: 'place', label: t('Place & table cards', 'Plek- en tafelkaarte'), body: <div className="iv-card-pair"><div><h3>{sampleGuest}</h3><p className="iv-card-fine">{copy('stationery.place.note')}</p></div><div><p className="iv-card-kicker">{copy('stationery.table.prefix')}</p><h3>{tableName}</h3></div></div> },
    { id: 'thanks', label: t('Thank-you card', 'Dankiekaart'), body: <>{mono(64)}<p className="iv-card-kicker">{copy('stationery.thanks.title')}</p><p className="iv-card-small">{copy('stationery.thanks.body')}</p><p className="iv-card-sign">{couple.first} & {couple.second}</p></> },
  ];
  return <div className="iv-stationery">
    {pieces.map(p => <figure key={p.id} className={`iv-card iv-card-${p.id}`}>
      <div className="iv-card-paper">{p.body}</div>
      <figcaption>{p.label}</figcaption>
    </figure>)}
  </div>;
}
