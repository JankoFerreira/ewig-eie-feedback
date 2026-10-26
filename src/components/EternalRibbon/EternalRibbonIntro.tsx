import { Flourish } from '../Flourish';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { defaultRibbonTheme } from './defaultConfig';
import type { EternalRibbonIntroProps } from './types';
import './EternalRibbonIntro.css';

const silkBow = new URL('./silk-bow.png', import.meta.url).href;

function bowColorFromHex(hex: string) {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match) return { hue: 0, saturation: 1, brightness: 1 };
  const [r, g, b] = match.slice(1).map(part => parseInt(part, 16) / 255);
  const high = Math.max(r, g, b);
  const low = Math.min(r, g, b);
  const span = high - low;
  const saturation = span === 0 ? 0 : span / (1 - Math.abs(high + low - 1));
  const tuning = { saturation: Math.max(.3, Math.min(1, saturation / .25 * .85)), brightness: Math.max(.74, Math.min(1.08, high / .73)) };
  if (span === 0) return { hue: 0, ...tuning };
  const sector = high === r ? ((g - b) / span) % 6 : high === g ? (b - r) / span + 2 : (r - g) / span + 4;
  return { hue: (sector * 60 + 360) % 360, ...tuning };
}

export function EternalRibbonIntro({
  coupleNames,
  initials,
  weddingDate,
  theme = {},
  invitationWording,
  language = 'en',
  fontFamily,
  animationSpeed = 1,
  showBotanicals = true,
  skipForReturningGuests = true,
  storageKey,
  onComplete,
}: EternalRibbonIntroProps) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const started = useRef(false);
  const completed = useRef(false);
  const [status, setStatus] = useState<'ready' | 'opening'>('ready');
  const key = storageKey ?? `eternal-ribbon:${coupleNames}:${weddingDate}`;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = { ...defaultRibbonTheme, ...theme };
  const bowColor = bowColorFromHex(colors.ribbonColor);
  const style = {
    '--er-envelope': colors.envelopeColor,
    '--er-ribbon': colors.ribbonColor,
    '--er-gold': colors.sealColor,
    '--er-ink': colors.textColor,
    '--er-backdrop': colors.backgroundColor,
    '--er-font': fontFamily ?? 'Georgia, serif',
    '--er-bow-shift': `${Math.round(bowColor.hue - 355)}deg`,
    '--er-bow-saturation': bowColor.saturation,
    '--er-bow-brightness': bowColor.brightness,
    backgroundImage: theme.backgroundImage ? `linear-gradient(#292f2530,#292f2530),url("${theme.backgroundImage}")` : undefined,
  } as CSSProperties;

  function finish() {
    if (completed.current) return;
    completed.current = true;
    try { if (skipForReturningGuests) sessionStorage.setItem(key, 'seen'); } catch { /* Browsers may block storage. */ }
    onComplete();
  }

  useEffect(() => {
    if (!skipForReturningGuests) return;
    try { if (sessionStorage.getItem(key) === 'seen') finish(); } catch { /* Continue without storage. */ }
    // The visit decision is intentionally made once when the intro mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (completed.current) return; requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('.er-seal')?.focus()); }, []);

  useEffect(() => () => { timeline.current?.kill(); }, []);

  function skip() {
    timeline.current?.kill();
    finish();
  }

  function open() {
    if (started.current || completed.current || !root.current) return;
    started.current = true;
    setStatus('opening');
    if (reduceMotion()) { finish(); return; }

    const scope = root.current;
    const q = (selector: string) => scope.querySelector(selector);
    const speed = Math.max(.5, Math.min(animationSpeed, 2));
    const t = gsap.timeline({ onComplete: finish, defaults: { ease: 'power2.inOut' } });
    timeline.current = t;
    t.to(q('.er-seal'), { y: -18, x: 18, rotate: 16, opacity: 0, duration: .65, ease: 'power2.in' }, 0)
      .to(q('.er-bow'), { y: -56, x: 11, rotate: 9, scale: 1.04, opacity: 0, duration: .95, ease: 'power2.inOut' }, .12)
      .to(q('.er-ribbon-left'), { xPercent: -110, rotate: -3, opacity: 0, duration: .85, ease: 'power2.inOut' }, .32)
      .to(q('.er-ribbon-right'), { xPercent: 110, rotate: 3, opacity: 0, duration: .85, ease: 'power2.inOut' }, .32)
      .to(q('.er-ribbon-top'), { yPercent: -110, opacity: 0, duration: .85, ease: 'power2.inOut' }, .43)
      .to(q('.er-ribbon-bottom'), { yPercent: 110, opacity: 0, duration: .85, ease: 'power2.inOut' }, .43)
      .to(q('.er-flap'), { rotateX: -174, duration: 1.05, ease: 'power2.inOut' }, 1.15)
      .to(q('.er-envelope-shadow'), { opacity: .18, scale: 1.1, duration: .65 }, 1.24)
      .to(q('.er-heading'), { opacity: 0, y: -28, duration: .5 }, 1.38)
      .to(q('.er-prompt'), { opacity: 0, duration: .4 }, 1.45)
      .to(q('.er-card'), { y: -205, duration: 1.12, ease: 'power2.out' }, 1.68)
      .to(q('.er-envelope-front'), { y: 14, opacity: .78, duration: .7 }, 1.93)
      .to(q('.er-card-inner'), { opacity: 1, duration: .7, ease: 'power1.out' }, 2.38)
      .to(q('.er-card'), { y: -165, scale: 1.14, duration: .72, ease: 'power2.inOut' }, 2.72)
      .to([q('.er-envelope-back'), q('.er-envelope-front'), q('.er-flap'), q('.er-botanicals')].filter(Boolean), { opacity: 0, y: 55, duration: .65 }, 3.02)
      .to(q('.er-card'), { scale: 2.2, opacity: 0, duration: 1.05, ease: 'power2.inOut' }, 3.36)
      .to(scope, { opacity: 0, duration: .5 }, 4.05);
    t.timeScale(speed);
  }

  const wording = invitationWording ?? (language === 'af' ? 'Twee mense. Een storie.' : 'Two hearts. One story.');
  return <div className="er-intro" ref={root} style={style} role="dialog" aria-modal="true" aria-label={language === 'af' ? 'Trouuitnodiging' : 'Wedding invitation'}>
    <div className="er-atmosphere" aria-hidden="true" />
    <button className="er-skip" type="button" onClick={skip}>{language === 'af' ? 'Slaan oor' : 'Skip opening'}</button>
    <div className="er-heading"><span>EWIG & EIE</span><h1>{language === 'af' ? 'Jy is uitgenooi' : 'You are invited'}</h1><p>{language === 'af' ? 'Twee mense. Een storie. Ewig & Eie.' : 'Two hearts. One story. Forever yours.'}</p></div>
    <div className="er-stage">
      <div className="er-envelope-shadow" />
      <div className="er-envelope">
        <div className="er-envelope-back" />
        <div className="er-card"><div className="er-card-inner"><span className="er-card-kicker">{language === 'af' ? 'MET LIEFDE' : 'WITH LOVE'}</span><span className="er-card-flourish" aria-hidden="true"><Flourish/></span><strong>{coupleNames}</strong><span className="er-card-wording">{wording}</span><time>{weddingDate}</time></div></div>
        <div className="er-flap" />
        <div className="er-envelope-front" />
        {showBotanicals && <svg className="er-botanicals" viewBox="0 0 510 330" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M24 307c39-29 58-67 69-107M38 294c-2-19-9-29-20-36M53 278c17-5 27-14 34-27M69 252c-2-16-10-25-19-31M78 230c14-4 25-12 32-23"/><path d="M485 307c-38-28-59-65-69-107M472 294c2-19 9-29 20-36M456 277c-17-5-26-14-33-27M441 252c2-16 9-25 19-31M432 230c-14-4-25-12-32-23"/></g><g fill="currentColor" opacity=".55"><path d="M18 258c-3-18 2-25 13-31 4 15-1 25-13 31ZM87 251c9-15 20-18 32-15-9 14-19 19-32 15ZM50 221c-3-16 2-24 13-30 4 16-1 25-13 30ZM110 207c9-14 19-17 30-14-8 13-18 17-30 14Z"/><path d="M492 258c3-18-2-25-13-31-4 15 1 25 13 31ZM423 251c-9-15-20-18-32-15 9 14 19 19 32 15ZM460 221c3-16-2-24-13-30-4 16 1 25 13 30ZM400 207c-9-14-19-17-30-14 8 13 18 17 30 14Z"/></g></svg>}
        <div className="er-ribbon er-ribbon-left" /><div className="er-ribbon er-ribbon-right" /><div className="er-ribbon er-ribbon-top" /><div className="er-ribbon er-ribbon-bottom" />
        <img className="er-bow" src={silkBow} alt="" aria-hidden="true" />
        <button className="er-seal" type="button" onClick={open} disabled={status !== 'ready'} aria-label={language === 'af' ? `Maak ${coupleNames} se uitnodiging oop` : `Open ${coupleNames}'s invitation`}><span>{initials}</span></button>
      </div>
    </div>
    <p className="er-prompt">{status === 'opening' ? (language === 'af' ? '’n Storie ontvou…' : 'A story unfolds…') : (language === 'af' ? 'Raak die monogram om oop te maak' : 'Touch the monogram to open')}</p>
  </div>;
}
