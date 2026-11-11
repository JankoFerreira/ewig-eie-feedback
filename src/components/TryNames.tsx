import { useState, type CSSProperties } from 'react';
import { readTryNames, saveTryNames, type TryNames } from '../collections/shared/tryNames';

/** One name input that previews every collection with the couple's own names. */
export function TryNamesForm({ af, onChange }: { af: boolean; onChange: (names: TryNames | null) => void }) {
  const saved = readTryNames();
  const [first, setFirst] = useState(saved?.first ?? '');
  const [second, setSecond] = useState(saved?.second ?? '');
  const t = (en: string, a: string) => af ? a : en;
  const update = (f: string, s: string) => { setFirst(f); setSecond(s); const next = f.trim() || s.trim() ? { first: f.trim(), second: s.trim() } : null; saveTryNames(next); onChange(next); };
  return <form className="try-names" onSubmit={e => e.preventDefault()} aria-labelledby="try-names-title" data-no-translate>
    <p id="try-names-title"><strong>{t('Try it with your names', 'Probeer dit met julle name')}</strong> <span>{t('Every collection below updates, and opening one carries your names in.', 'Elke versameling hieronder verander, en julle name gaan saam wanneer julle een oopmaak.')}</span></p>
    <label>{t('Your name', 'Jou naam')}<input value={first} maxLength={40} autoComplete="given-name" onChange={e => update(e.target.value, second)} placeholder="Amélie"/></label>
    <span aria-hidden="true">&amp;</span>
    <label>{t('Your partner’s name', 'Jou maat se naam')}<input value={second} maxLength={40} onChange={e => update(first, e.target.value)} placeholder="James"/></label>
    {(first || second) && <button type="button" onClick={() => update('', '')}>{t('Clear', 'Maak skoon')}</button>}
    <small>{t('Stays in this browser tab only. Nothing is sent.', 'Bly net in hierdie blaaieroortjie. Niks word gestuur nie.')}</small>
  </form>;
}

const looks: Record<string, CSSProperties & { label: string }> = {
  garden: { label: 'Garden', background: '#f7f3eacc', color: '#344638', fontFamily: "'Cormorant Garamond', Georgia, serif" },
  midnight: { label: 'Midnight', background: '#17191bd9', color: '#f3eee5', fontFamily: "'Cormorant Garamond', Georgia, serif" },
  ivory: { label: 'Ivory', background: '#f6f1e7d9', color: '#383d2c', fontFamily: "'Cormorant Garamond', Georgia, serif" },
};
/** The couple's names set in a collection's own palette, laid over its preview image. */
export function TryNamesOverlay({ collection, names }: { collection: keyof typeof looks; names: TryNames }) {
  const { label, ...style } = looks[collection];
  return <div className={`try-overlay try-overlay-${collection}`} style={style} aria-label={`${label}: ${names.first} & ${names.second}`}>
    <span>{names.first || '…'}</span><i>&amp;</i><span>{names.second || '…'}</span>
  </div>;
}
