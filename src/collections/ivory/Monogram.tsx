import { useId } from 'react';
import type { MonogramStyle } from './content';

type Props = { left: string; right: string; style: MonogramStyle; date?: string; size?: number; title?: string; className?: string };

/** Personalised vector monogram. Pure SVG so it stays sharp on screen and in print exports. */
export function Monogram({ left, right, style, date, size = 160, title, className = '' }: Props) {
  const a = left.trim() || '·', b = right.trim() || '·';
  const arc = `iv-arc-${useId().replace(/[^a-z0-9]/gi, '')}`;
  return <svg className={`iv-monogram iv-monogram-${style} ${className}`} viewBox="0 0 200 200" width={size} height={size} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
    {title && <title>{title}</title>}
    {style === 'ring' && <>
      <circle cx="100" cy="100" r="92" fill="none" stroke="var(--iv-accent)" strokeWidth="1.2"/>
      <circle cx="100" cy="100" r="86" fill="none" stroke="var(--iv-accent)" strokeWidth=".5"/>
      <text x="72" y="114" textAnchor="middle" className="iv-mono-letter" fontSize="70">{a}</text>
      <line x1="116" y1="56" x2="86" y2="146" stroke="var(--iv-accent)" strokeWidth="1"/>
      <text x="130" y="146" textAnchor="middle" className="iv-mono-letter" fontSize="70">{b}</text>
      {date && <><path id={arc} d="M30 100 a70 70 0 0 0 140 0" fill="none"/><text className="iv-mono-date" fontSize="9.5" letterSpacing="3.4"><textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">{date}</textPath></text></>}
    </>}
    {style === 'arch' && <>
      <path d="M38 178 V92 a62 62 0 0 1 124 0 V178" fill="none" stroke="var(--iv-accent)" strokeWidth="1.2"/>
      <path d="M46 178 V94 a54 54 0 0 1 108 0 V178" fill="none" stroke="var(--iv-accent)" strokeWidth=".5"/>
      <text x="100" y="116" textAnchor="middle" className="iv-mono-letter" fontSize="64">{a}</text>
      <line x1="76" y1="128" x2="124" y2="128" stroke="var(--iv-accent)" strokeWidth=".8"/>
      <text x="100" y="168" textAnchor="middle" className="iv-mono-letter" fontSize="44">{b}</text>
      {date && <text x="100" y="194" textAnchor="middle" className="iv-mono-date" fontSize="9" letterSpacing="3">{date}</text>}
    </>}
    {style === 'stacked' && <>
      <line x1="100" y1="14" x2="100" y2="40" stroke="var(--iv-accent)" strokeWidth=".8"/>
      <text x="100" y="104" textAnchor="middle" className="iv-mono-letter" fontSize="60">{a}</text>
      <text x="100" y="124" textAnchor="middle" className="iv-mono-amp" fontSize="16">and</text>
      <text x="100" y="178" textAnchor="middle" className="iv-mono-letter" fontSize="60">{b}</text>
      {date && <text x="100" y="196" textAnchor="middle" className="iv-mono-date" fontSize="8.5" letterSpacing="3">{date}</text>}
    </>}
  </svg>;
}

/** Roman-numeral date for the monogram ring, e.g. X · III · MMXXIX. */
export function romanDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  const roman = (n: number) => [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].reduce((s, [v, r]) => { while (n >= (v as number)) { s += r; n -= v as number; } return s; }, '');
  return `${roman(d)} · ${roman(m)} · ${roman(y)}`;
}
