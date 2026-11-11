import { useEffect, useRef, type ReactNode } from 'react';
import type { Media, Language } from './content';

type Props = { background: Media; foreground: Media; depth: boolean; language: Language; children: ReactNode };

/**
 * Full-bleed, depth-layered cover. Three planes sit in real CSS 3D space:
 * the photograph (far), the details (middle) and an optional transparent foreground (near).
 * Pointer movement tilts the stage a degree or two; scrolling eases the planes apart.
 * Reduced motion keeps every plane still. No WebGL, no extra library.
 */
export function DepthHero({ background, foreground, depth, language, children }: Props) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0, tx = 0, ty = 0, x = 0, y = 0, scroll = 0;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const apply = () => {
      frame = 0;
      x += (tx - x) * .08; y += (ty - y) * .08;
      el.style.setProperty('--iv-rx', `${(-y * 1.6).toFixed(3)}deg`);
      el.style.setProperty('--iv-ry', `${(x * 2.2).toFixed(3)}deg`);
      el.style.setProperty('--iv-scroll', scroll.toFixed(3));
      if (Math.abs(tx - x) > .001 || Math.abs(ty - y) > .001) frame = requestAnimationFrame(apply);
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(apply); };
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; queue(); };
    const leave = () => { tx = 0; ty = 0; queue(); };
    const onScroll = () => { const r = el.getBoundingClientRect(); scroll = Math.min(1, Math.max(0, -r.top / r.height)); queue(); };
    if (fine) { el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { cancelAnimationFrame(frame); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); window.removeEventListener('scroll', onScroll); };
  }, []);
  return <section ref={root} className={`iv-hero ${depth ? 'has-depth' : ''}`} aria-labelledby="iv-hero-names">
    <div className="iv-depth-stage">
      <div className="iv-depth-scene">
        <div className="iv-plane iv-plane-back"><img src={background.src} alt={background.alt[language]} style={{ objectPosition: background.focal }} loading="eager" fetchPriority="high" decoding="async"/></div>
        <div className="iv-plane iv-plane-haze" aria-hidden="true"/>
        <div className="iv-plane iv-plane-mid">{children}</div>
        {depth && <div className="iv-plane iv-plane-front" aria-hidden="true"><img src={foreground.src} alt="" style={{ objectPosition: foreground.focal }} decoding="async"/></div>}
      </div>
    </div>
    <p className="iv-hero-caption">{background.caption[language]}</p>
  </section>;
}
