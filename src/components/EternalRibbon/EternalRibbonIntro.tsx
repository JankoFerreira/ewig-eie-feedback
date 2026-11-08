import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { createPortal } from 'react-dom';
import { defaultRibbonTheme } from './defaultConfig';
import { SilkRibbon, type SilkRibbonHandle } from './SilkRibbon';
import type { EternalRibbonIntroProps } from './types';
import './EternalRibbonIntro.css';

const envelope = new URL('./assets/cotton-envelope.webp', import.meta.url).href;
const flapPath = 'M.039 .109 C.05 .157 .054 .18 .072 .204 L.458 .691 Q.5 .754 .542 .691 L.929 .204 C.952 .171 .959 .139 .962 .109 Z';

function ribbonHue(hex: string) {
  const parts = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!parts) return 0;
  const [r,g,b] = parts.slice(1).map(part => parseInt(part,16)/255);
  const max = Math.max(r,g,b), min = Math.min(r,g,b), span = max-min;
  if (!span) return 0;
  const sector = max === r ? ((g-b)/span)%6 : max === g ? (b-r)/span+2 : (r-g)/span+4;
  return (sector*60+360)%360 - 81;
}

export function EternalRibbonIntro({
  coupleNames, initials, weddingDate, theme = {}, invitationWording,
  language = 'en', fontFamily, animationSpeed = 1,
  skipForReturningGuests = true, storageKey, onComplete,
}: EternalRibbonIntroProps) {
  const root = useRef<HTMLDivElement>(null);
  const fabric = useRef<SilkRibbonHandle>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const started = useRef(false);
  const completed = useRef(false);
  const [status, setStatus] = useState<'ready' | 'opening'>('ready');
  const id = useId().replace(/:/g, '');
  const key = storageKey ?? `eternal-ribbon-cotton:${coupleNames}:${weddingDate}`;
  const af = language === 'af';
  const colors = { ...defaultRibbonTheme, ...theme };
  const style = {
    '--er-ink': colors.textColor,
    '--er-paper': colors.envelopeColor,
    '--er-backdrop': colors.backgroundColor,
    '--er-font': fontFamily ?? "'Cormorant Garamond', Georgia, serif",
    '--er-ribbon-hue': `${ribbonHue(colors.ribbonColor)}deg`,
    backgroundImage: theme.backgroundImage ? `linear-gradient(#f7f5efce,#f7f5efce),url("${theme.backgroundImage}")` : undefined,
  } as CSSProperties;

  function finish() {
    if (completed.current) return;
    completed.current = true;
    try { if (skipForReturningGuests) sessionStorage.setItem(key, 'seen'); } catch { /* Storage is optional. */ }
    onComplete();
  }

  useEffect(() => {
    if (skipForReturningGuests) {
      try { if (sessionStorage.getItem(key) === 'seen') { finish(); return; } } catch { /* Continue without storage. */ }
    }
    const frame = requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('.er-seal')?.focus({ preventScroll: true }));
    return () => { cancelAnimationFrame(frame); timeline.current?.kill(); };
    // The visit decision belongs to this mounted invitation, including a replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function skip() { timeline.current?.kill(); finish(); }

  function open() {
    if (started.current || completed.current || !root.current) return;
    started.current = true;
    setStatus('opening');
    root.current.querySelector<HTMLButtonElement>('.er-skip')?.focus({ preventScroll: true });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    const scope = root.current;
    const q = (selector: string) => scope.querySelector(selector);
    const pull = { left: 0, right: 0 };
    const updateFabric = () => fabric.current?.pull(pull.left, pull.right);
    const t = gsap.timeline({ onComplete: finish, defaults: { ease: 'power2.inOut' } });
    timeline.current = t;

    // A small peel, then a staggered pull through the knot; no floating or bounce.
    t.to(q('.er-seal'), { rotate: -9, rotationY: -28, x: -8, y: -11, duration: .55 }, 0)
      .to(q('.er-seal'), { x: -32, y: -34, opacity: 0, duration: .45 }, .4)
      .to(pull, { left: 1, duration: 1.85, onUpdate: updateFabric, ease: 'power1.inOut' }, .45)
      .to(pull, { right: 1, duration: 1.85, onUpdate: updateFabric, ease: 'power1.inOut' }, .72)
      .to(q('.er-prompt'), { opacity: 0, duration: .45 }, .3)
      .to(q('.er-flap'), { rotationX: -166, duration: 1.15, transformPerspective: 1100 }, 2.2)
      .to(q('.er-flap-shade'), { opacity: .12, duration: .8 }, 2.25)
      .set(q('.er-flap'), { zIndex: 2 }, 2.8)
      .to(q('.er-heading'), { opacity: 0, y: -8, duration: .5 }, 2.65)
      .to(q('.er-card'), { yPercent: -43, duration: 1.05, ease: 'power2.out' }, 2.95)
      .to([q('.er-envelope-back'), q('.er-envelope-front'), q('.er-flap')], { opacity: 0, y: 35, duration: .85 }, 3.5)
      .to(q('.er-card'), { yPercent: -12, scale: 1.08, rotate: 2, duration: .85 }, 3.75)
      .to(scope, { opacity: 0, duration: .8 }, 5.15);
    t.timeScale(Number.isFinite(animationSpeed) ? Math.max(.5, Math.min(animationSpeed,2)) : 1);
  }

  const names = coupleNames.split(' & ');
  return createPortal(<div className="er-intro" ref={root} style={style} data-opening={status === 'opening'}
    role="dialog" aria-modal="true" aria-label={af ? 'Trouuitnodiging' : 'Wedding invitation'}
    onKeyDown={event => {
      if (event.key === 'Escape') skip();
      if (event.key !== 'Tab' || !root.current) return;
      const buttons = Array.from(root.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
      const first = buttons[0], last = buttons[buttons.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
    <div className="er-atmosphere" aria-hidden="true"/>
    <span className="er-signature" aria-hidden="true">Ewig <i>&</i> Eie <span>{af ? 'VIR ALTYD. VIR JULLE.' : 'FOREVER. YOURS.'}</span></span>
    <button className="er-skip" type="button" onClick={skip}>{af ? 'Slaan oor' : 'Skip opening'} <span aria-hidden="true">↗</span></button>
    <div className="er-composition">
      <div className="er-heading">
        <span>{af ? 'MET LIEFDE, VIR JOU' : 'WITH LOVE, JUST FOR YOU'}</span>
        <h1>{af ? 'Jy is uitgenooi.' : 'You are invited.'}</h1>
        <p>{af ? 'Elke groot liefdesverhaal begin met iets kleins.' : 'A little moment. The beginning of forever.'}</p>
      </div>
      <div className="er-stage">
        <svg className="er-clip-defs" aria-hidden="true"><defs>
          <clipPath id={`${id}-flap`} clipPathUnits="objectBoundingBox"><path d={flapPath}/></clipPath>
          <clipPath id={`${id}-pocket`} clipPathUnits="objectBoundingBox"><path clipRule="evenodd" d={`M0 0H1V1H0Z ${flapPath}`}/></clipPath>
        </defs></svg>
        <div className="er-envelope">
          <div className="er-envelope-back"/>
          <div className="er-card">
            <div className="er-card-inner">
              <span className="er-card-kicker">{af ? 'SAAM MET ONS FAMILIES' : 'TOGETHER WITH OUR FAMILIES'}</span>
              <div className="er-card-names">{names.length === 2 ? <><strong>{names[0]}</strong><i>&</i><strong>{names[1]}</strong></> : <strong>{coupleNames}</strong>}</div>
              <p>{invitationWording ?? (af ? 'Ons nooi jou om deel van ons storie te wees.' : 'Invite you to be part of our forever.')}</p>
              <span className="er-card-rule" aria-hidden="true"/>
              <time>{weddingDate}</time>
              <span className="er-card-foot">{af ? 'TWEE STORIES. VIR ALTYD VERWEEF.' : 'TWO STORIES. FOREVER INTERTWINED.'}</span>
            </div>
          </div>
          <div className="er-envelope-front" style={{ clipPath: `url(#${id}-pocket)` }}><img src={envelope} alt="" draggable={false}/></div>
          <div className="er-flap" style={{ clipPath: `url(#${id}-flap)` }}><img src={envelope} alt="" draggable={false}/><span className="er-flap-shade"/></div>
          <SilkRibbon ref={fabric}/>
          <button className="er-seal" type="button" onClick={open} disabled={status !== 'ready'} aria-label={af ? `Maak ${coupleNames} se uitnodiging oop` : `Open ${coupleNames}'s invitation`}>
            <span className="er-monogram">{initials}</span>
          </button>
        </div>
      </div>
      <p className="er-prompt" aria-live="polite"><span className="er-prompt-line" aria-hidden="true"/>{status === 'opening' ? (af ? 'Julle storie ontvou' : 'Your story unfolds') : (af ? 'Raak die seël om oop te maak' : 'Touch the seal to open')}<span className="er-prompt-line" aria-hidden="true"/></p>
    </div>
    <span className="er-footnote">{af ? '’n Uitnodiging om te koester' : 'An invitation to be treasured'}</span>
  </div>, document.body);
}
