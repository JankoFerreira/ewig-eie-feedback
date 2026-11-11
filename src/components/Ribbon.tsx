import { useEffect, useMemo, useRef } from 'react';

/**
 * A satin ribbon drawn as a lit 3D band: it twists along its length, the face catches a soft sheen,
 * the back is a shade darker, and it casts a blurred shadow. Pure SVG, rendered once as an image.
 */
type Tone = 'light' | 'dark';
type Vec = [number, number];
const SEGMENTS = 320;

// The ribbon's path across a 1200 × 420 frame: two cubic curves, plus a falling tail.
const MAIN: Vec[][] = [
  [[-90, 70], [130, 20], [230, 330], [480, 372]],
  [[480, 372], [740, 414], [930, 340], [1060, 210]],
  [[1060, 210], [1140, 120], [1220, 70], [1310, 60]],
];
const TAIL: Vec[][] = [[[1060, 210], [1120, 300], [1080, 390], [1010, 480]]];

const bez = (p: Vec[], t: number): Vec => { const u = 1 - t; return [u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0], u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]]; };
function sample(curves: Vec[][], n: number): Vec[] {
  const pts: Vec[] = [];
  for (let i = 0; i <= n; i++) { const g = (i / n) * curves.length; const c = Math.min(curves.length - 1, Math.floor(g)); pts.push(bez(curves[c], g - c)); }
  return pts;
}

const PALETTE: Record<Tone, { front: number[]; back: number[]; edge: string; shadow: string }> = {
  light: { front: [222, 205, 168], back: [196, 176, 134], edge: 'rgba(255,255,255,.55)', shadow: 'rgba(60,55,40,.18)' },
  dark: { front: [214, 186, 128], back: [150, 124, 78], edge: 'rgba(255,240,205,.5)', shadow: 'rgba(0,0,0,.55)' },
};

/** Colour and outline of each slice of the band for a given twist phase. */
function geometry(pts: Vec[], width: number, twists: number, phase: number, tone: Tone) {
  const { front, back } = PALETTE[tone];
  const light = [-0.35, -0.55, 0.76]; // from the upper left, towards the viewer
  const edgesA: Vec[] = [], edgesB: Vec[] = [], colours: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    let tx = q[0] - o[0], ty = q[1] - o[1]; const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
    const nx = -ty, ny = tx;
    const s = i / (pts.length - 1);
    // Taper the ends so the ribbon looks cut, not clipped.
    const taper = Math.min(1, s * 14, (1 - s) * 14);
    const theta = s * Math.PI * 2 * twists + phase;
    const half = (width / 2) * Math.cos(theta) * (0.35 + 0.65 * taper);
    edgesA.push([p[0] + nx * half, p[1] + ny * half]);
    edgesB.push([p[0] - nx * half, p[1] - ny * half]);
    // Surface normal of a flat band turned by theta about its centre line.
    const n = [nx * Math.sin(theta), ny * Math.sin(theta), Math.cos(theta)];
    const facing = n[2] >= 0;
    const nn = facing ? n : [-n[0], -n[1], -n[2]];
    const diffuse = Math.max(0, nn[0] * light[0] + nn[1] * light[1] + nn[2] * light[2]);
    // Satin sheen: a broad, soft highlight (half-vector with the viewer at +z).
    const h = [light[0], light[1], light[2] + 1]; const hl = Math.hypot(h[0], h[1], h[2]);
    const spec = Math.pow(Math.max(0, (nn[0] * h[0] + nn[1] * h[1] + nn[2] * h[2]) / hl), 18);
    const base = facing ? front : back;
    const k = 0.48 + diffuse * 0.62;
    const c = base.map(v => Math.min(255, Math.round(v * k + spec * 120)));
    colours.push(`rgb(${c[0]},${c[1]},${c[2]})`);
  }
  return { edgesA, edgesB, colours };
}
const pt = (p: Vec) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

/** One band as SVG markup: blurred shadow, shaded slices, fine edges. */
function bandSvg(curves: Vec[][], width: number, twists: number, phase: number, tone: Tone, shadowId: string) {
  const pts = sample(curves, SEGMENTS);
  const g = geometry(pts, width, twists, phase, tone);
  const outline = `M${g.edgesA.map(pt).join('L')}L${[...g.edgesB].reverse().map(pt).join('L')}Z`;
  let slices = '';
  for (let i = 0; i < pts.length - 1; i++) slices += `<polygon points="${pt(g.edgesA[i])} ${pt(g.edgesA[i + 1])} ${pt(g.edgesB[i + 1])} ${pt(g.edgesB[i])}" fill="${g.colours[i]}" stroke="${g.colours[i]}" stroke-width="1.1" stroke-linejoin="round"/>`;
  const { shadow, edge } = PALETTE[tone];
  return `<path d="${outline}" fill="${shadow}" filter="url(#${shadowId})" transform="translate(10 26)"/>${slices}`
    + `<polyline points="${g.edgesA.map(pt).join(' ')}" fill="none" stroke="${edge}" stroke-width=".8"/>`
    + `<polyline points="${g.edgesB.map(pt).join(' ')}" fill="none" stroke="${edge}" stroke-width=".5" stroke-opacity=".6"/>`;
}

/** The whole ribbon as one SVG image, built once per tone and cached. */
const cache = new Map<Tone, string>();
function ribbonImage(tone: Tone) {
  if (!cache.has(tone)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420"><defs><filter id="s" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="14"/></filter></defs>`
      + bandSvg(TAIL, 58, 1.25, 0.9, tone, 's') + bandSvg(MAIN, 78, 2.5, 0.9, tone, 's') + '</svg>';
    cache.set(tone, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  }
  return cache.get(tone)!;
}

/**
 * Drawn once into a single image, so the browser paints it once. While the section is on screen,
 * scrolling only slides and tilts that image slightly (a GPU transform: no repainting, no lag).
 */
export function Ribbon({ className = '', tone = 'light' }: { className?: string; tone?: Tone }) {
  const img = useRef<HTMLImageElement>(null);
  const src = useMemo(() => ribbonImage(tone), [tone]);
  useEffect(() => {
    const el = img.current; if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let visible = false, queued = 0;
    const update = () => {
      queued = 0;
      const r = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight + r.height))) - 0.5;
      el.style.transform = `translate3d(${(progress * -60).toFixed(1)}px, ${(progress * 34).toFixed(1)}px, 0) rotate(${(progress * -2.4).toFixed(2)}deg) scale(1.08)`;
    };
    const onScroll = () => { if (visible && !queued) queued = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) onScroll(); });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(queued); };
  }, []);
  return <img ref={img} src={src} alt="" aria-hidden="true" decoding="async" className={`ribbon-ornament ribbon-${tone} ${className}`}/>;
}
