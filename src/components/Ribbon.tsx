import { useEffect, useMemo, useRef } from 'react';

/**
 * A satin ribbon drawn as a lit 3D band: it twists along its length, the face catches a soft sheen,
 * the back is a shade darker, and it casts a blurred shadow. It drifts very slowly when in view
 * (still for reduced motion). Pure SVG, no libraries.
 */
type Tone = 'light' | 'dark';
type Vec = [number, number];
const SEGMENTS = 420;

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
const quad = (a: Vec, b: Vec, c: Vec, d: Vec) => `${a[0].toFixed(1)},${a[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)} ${d[0].toFixed(1)},${d[1].toFixed(1)}`;

type Registry = { current: Set<(p: number) => void> };
function Band({ curves, width, twists, tone, phase, idPrefix, registry }: { curves: Vec[][]; width: number; twists: number; tone: Tone; phase: { current: number }; idPrefix: string; registry: Registry }) {
  const pts = useMemo(() => sample(curves, SEGMENTS), [curves]);
  const polys = useRef<(SVGPolygonElement | null)[]>([]);
  const shadow = useRef<SVGPathElement>(null);
  const edgeA = useRef<SVGPolylineElement>(null);
  const edgeB = useRef<SVGPolylineElement>(null);
  const draw = (ph: number) => {
    const g = geometry(pts, width, twists, ph, tone);
        for (let i = 0; i < pts.length - 1; i++) {
      const el = polys.current[i]; if (!el) continue;
      el.setAttribute('points', quad(g.edgesA[i], g.edgesA[i + 1], g.edgesB[i + 1], g.edgesB[i]));
      el.setAttribute('fill', g.colours[i]); el.setAttribute('stroke', g.colours[i]);
    }
    const outline = `M${g.edgesA.map(p => p.map(v => v.toFixed(1)).join(',')).join('L')}L${[...g.edgesB].reverse().map(p => p.map(v => v.toFixed(1)).join(',')).join('L')}Z`;
    shadow.current?.setAttribute('d', outline);
    edgeA.current?.setAttribute('points', g.edgesA.map(p => p.join(',')).join(' '));
    edgeB.current?.setAttribute('points', g.edgesB.map(p => p.join(',')).join(' '));
  };
  useEffect(() => { draw(phase.current); registry.current.add(draw); return () => { registry.current.delete(draw); }; }); // eslint-disable-line react-hooks/exhaustive-deps
  return <g data-ribbon-band={idPrefix}>
    <path ref={shadow} fill={PALETTE[tone].shadow} filter={`url(#${idPrefix}-shadow)`} transform="translate(10 26)"/>
    {pts.slice(0, -1).map((_, i) => <polygon key={i} ref={el => { polys.current[i] = el; }} strokeWidth={1.1} strokeLinejoin="round" shapeRendering="geometricPrecision"/>)}
    <polyline ref={edgeA} fill="none" stroke={PALETTE[tone].edge} strokeWidth={0.8}/>
    <polyline ref={edgeB} fill="none" stroke={PALETTE[tone].edge} strokeWidth={0.5} strokeOpacity={0.6}/>
  </g>;
}

export function Ribbon({ className = '', tone = 'light' }: { className?: string; tone?: Tone }) {
  const svg = useRef<SVGSVGElement>(null);
  const phase = useRef(0.6);
  const id = useRef(`rb${Math.random().toString(36).slice(2, 8)}`).current;
  const registry = useRef(new Set<(p: number) => void>());
  useEffect(() => {
    const el = svg.current; if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, visible = false, last = performance.now();
    const tick = (now: number) => {
      phase.current += Math.min(0.05, (now - last) / 1000) * 0.18; last = now; // one slow turn every ~35 s
      registry.current.forEach(fn => fn(phase.current));
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { last = performance.now(); raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf); });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [id]);
  return <svg ref={svg} className={`ribbon-ornament ribbon-${tone} ${className}`} viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs><filter id={`${id}-shadow`} x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="14"/></filter></defs>
    <Band curves={TAIL} width={58} twists={1.25} tone={tone} phase={phase} idPrefix={`${id}-tail`} registry={registry}/>
    <Band curves={MAIN} width={78} twists={2.5} tone={tone} phase={phase} idPrefix={`${id}-main`} registry={registry}/>
  </svg>;
}
