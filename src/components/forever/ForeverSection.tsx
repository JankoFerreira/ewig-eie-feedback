import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './forever.css';

/** The homepage centrepiece: a 3D infinity of gold and ivory ("ewig" = forever). three.js loads only when this comes near view. */
export function ForeverSection({ af }: { af: boolean }) {
  const t = (en: string, a: string) => af ? a : en;
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'idle' | 'live' | 'fallback'>('idle');
  useEffect(() => {
    const el = canvas.current; if (!el) return;
    let dispose: (() => void) | undefined; let cancelled = false;
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return; io.disconnect();
      try {
        const mod = await import('./ForeverScene');
        if (cancelled) return;
        if (!mod.webglAvailable()) { setState('fallback'); return; }
        dispose = mod.createForeverScene(el, { reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches });
        setState('live');
      } catch { if (!cancelled) setState('fallback'); }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); dispose?.(); };
  }, []);
  return <section className={`forever forever-${state}`} aria-labelledby="forever-title">
    <div className="forever-glow" aria-hidden="true"/>
    <canvas ref={canvas} className="forever-canvas" aria-hidden="true"/>
    {state === 'fallback' && <svg className="forever-fallback" viewBox="-3 -1.6 6 3.2" aria-hidden="true"><defs><linearGradient id="fg" x1="0" x2="1"><stop offset="0" stopColor="#f4ede2"/><stop offset=".5" stopColor="#d9bb7f"/><stop offset="1" stopColor="#f4ede2"/></linearGradient></defs><path d="M0 0 C .9 -1.25 2.6 -1.25 2.6 0 S .9 1.25 0 0 S -2.6 -1.25 -2.6 0 S -.9 1.25 0 0" fill="none" stroke="url(#fg)" strokeWidth=".09"/></svg>}
    <div className="forever-copy">
      <p className="forever-kicker">EWIG &amp; EIE</p>
      <h2 id="forever-title"><span>Ewig</span> <em>{t('forever.', 'vir altyd.')}</em><br/><span>Eie</span> <em>{t('your own.', 'julle eie.')}</em></h2>
      <p>{t('Two lives, one line that never ends. We make one beautiful home for your wedding: designed for you, kept for you, and yours to share.', 'Twee lewens, een lyn wat nooit eindig nie. Ons maak een pragtige tuiste vir julle troue: vir julle ontwerp, vir julle bewaar, en julle s’n om te deel.')}</p>
      <Link to="/pricing" className="forever-cta">{t('Begin yours', 'Begin julle s’n')} <ArrowUpRight size={16}/></Link>
    </div>
  </section>;
}
