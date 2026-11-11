import { useEffect, useRef, type ReactNode } from 'react';
import './hero-tiles.css';

/**
 * Scroll-pinned hero whose photograph turns over tile by tile into a second image.
 * The hero stays in place for one screen of scrolling while a wave of tiles (bottom-left first)
 * lifts, turns and settles; each tile catches a sheen mid-turn. Only transforms change, so it runs
 * on the GPU. With reduced motion the hero is a normal, static hero.
 */
type Props = { front: string; back: string; frontPosition?: [number, number]; children: ReactNode; caption?: ReactNode; className?: string; style?: React.CSSProperties };

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = src; });

export function HeroTiles({ front, back, frontPosition = [0.5, 0.42], children, caption, className = '', style }: Props) {
  const pin = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = pin.current, section = hero.current, layer = grid.current;
    if (!host || !section || !layer) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { host.classList.add('is-static'); return; }
    let cancelled = false, raf = 0, tiles: { el: HTMLDivElement; delay: number }[] = [], images: [HTMLImageElement, HTMLImageElement] | null = null, last = -1;

    const cover = (img: HTMLImageElement, w: number, h: number, [px, py]: [number, number]) => {
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const bw = img.naturalWidth * scale, bh = img.naturalHeight * scale;
      return { bw, bh, ox: (w - bw) * px, oy: (h - bh) * py };
    };
    const build = () => {
      if (!images) return;
      const w = section.clientWidth, h = section.clientHeight;
      const cols = w < 700 ? 5 : Math.round(w / 140);
      const size = w / cols, rows = Math.ceil(h / size);
      const f = cover(images[0], w, h, frontPosition), b = cover(images[1], w, h, [0.5, 0.5]);
      layer.textContent = ''; tiles = [];
      const frag = document.createDocumentFragment();
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = c * size, y = r * size;
        const tile = document.createElement('div'); tile.className = 'ht-tile';
        tile.style.cssText = `left:${x}px;top:${y}px;width:${size + .6}px;height:${size + .6}px`;
        tile.innerHTML = `<div class="ht-face ht-front" style="background:url('${front}') ${f.ox - x}px ${f.oy - y}px/${f.bw}px ${f.bh}px no-repeat"></div><div class="ht-face ht-back" style="background:url('${back}') ${b.ox - x}px ${b.oy - y}px/${b.bw}px ${b.bh}px no-repeat"></div>`;
        frag.appendChild(tile);
        // A diagonal wave from the bottom-left corner, with a little randomness so it feels hand-turned.
        const delay = ((rows - 1 - r) / Math.max(1, rows - 1)) * 0.62 + (c / Math.max(1, cols - 1)) * 0.22 + Math.random() * 0.06;
        tiles.push({ el: tile, delay: delay / 0.9 });
      }
      layer.appendChild(frag);
      last = -1; update();
    };
    const update = () => {
      raf = 0;
      const rect = host.getBoundingClientRect();
      const travel = Math.max(1, host.offsetHeight - window.innerHeight);
      const p = clamp(-rect.top / travel);
      if (Math.abs(p - last) < 0.0015) return;
      last = p;
      section.style.setProperty('--flip', p.toFixed(3));
      host.classList.toggle('is-turning', p > 0.001);
      for (const t of tiles) {
        const local = ease(clamp((p * 1.12 - t.delay * 0.62) / 0.38));
        const lift = Math.sin(local * Math.PI);
        t.el.style.transform = local <= 0 ? '' : `translateZ(${(lift * 46).toFixed(1)}px) rotateX(${(-180 * local).toFixed(2)}deg)`;
        t.el.style.setProperty('--sheen', (lift * 0.55).toFixed(3));
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    Promise.all([load(front), load(back)]).then(pair => { if (cancelled) return; images = pair; build(); }).catch(() => host.classList.add('is-static'));
    const ro = new ResizeObserver(() => build()); ro.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelled = true; ro.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [front, back]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={pin} className="ht-pin">
    <section ref={hero} className={`ht-hero ${className}`} style={style}>
      <div ref={grid} className="ht-grid" aria-hidden="true"/>
      {children}
      {caption && <div className="ht-caption" aria-hidden="true">{caption}</div>}
    </section>
  </div>;
}
