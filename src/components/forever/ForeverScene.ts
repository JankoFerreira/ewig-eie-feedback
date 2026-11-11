import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * "Ewig": two strands — champagne gold and ivory pearl — twisting around one infinity line that never ends,
 * with drifting gold dust. Follows the pointer, turns with scroll, pauses when off screen.
 */
export type ForeverOptions = { reducedMotion: boolean };
export function createForeverScene(canvas: HTMLCanvasElement, { reducedMotion }: ForeverOptions) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9.5);

  // The infinity line (lemniscate of Bernoulli) with a gentle wave in depth.
  const a = 2.5;
  const base = (t: number) => { const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s; return new THREE.Vector3(a * c / d, a * s * c / d, 0.45 * Math.sin(2 * t)); };
  const up = new THREE.Vector3(0, 0, 1);
  const strand = (phase: number, radius: number, twists: number) => {
    const pts: THREE.Vector3[] = [];
    const N = 480;
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const p = base(t); const tangent = base(t + 0.001).sub(base(t - 0.001)).normalize();
      const n = new THREE.Vector3().crossVectors(tangent, up).normalize(); const b = new THREE.Vector3().crossVectors(tangent, n).normalize();
      const th = twists * t + phase;
      pts.push(p.add(n.multiplyScalar(Math.cos(th) * radius)).add(b.multiplyScalar(Math.sin(th) * radius)));
    }
    return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
  };

  const group = new THREE.Group();
  scene.add(group);
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd9bb7f, metalness: 1, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.35 });
  const pearl = new THREE.MeshPhysicalMaterial({ color: 0xf4ede2, metalness: 0.15, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.2, sheen: 1, sheenColor: new THREE.Color(0xfff4de), sheenRoughness: 0.4, envMapIntensity: 1.1 });
  const geoGold = new THREE.TubeGeometry(strand(0, 0.11, 9), 1100, 0.052, 20, true);
  const geoPearl = new THREE.TubeGeometry(strand(Math.PI, 0.11, 9), 1100, 0.052, 20, true);
  group.add(new THREE.Mesh(geoGold, gold), new THREE.Mesh(geoPearl, pearl));
  // A whisper-thin gold line through the centre: the "one line" both strands follow.
  const coreGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 240 }, (_, i) => base((i / 240) * Math.PI * 2)), true), 600, 0.012, 8, true);
  group.add(new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({ color: 0xe9d3a0, metalness: 1, roughness: 0.3, transparent: true, opacity: 0.55 })));

  // Gold dust.
  const dustCount = 420;
  const dust = new Float32Array(dustCount * 3); const seeds = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) { dust[i * 3] = (Math.random() - 0.5) * 11; dust[i * 3 + 1] = (Math.random() - 0.5) * 6.5; dust[i * 3 + 2] = (Math.random() - 0.5) * 4; seeds[i] = Math.random() * 10; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dust, 3));
  const sprite = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d')!; const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,240,205,1)'); r.addColorStop(0.35, 'rgba(232,203,140,.55)'); r.addColorStop(1, 'rgba(232,203,140,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex; })();
  const dustMat = new THREE.PointsMaterial({ size: 0.07, map: sprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 });
  const points = new THREE.Points(dustGeo, dustMat);
  scene.add(points);

  const key = new THREE.DirectionalLight(0xfff1d6, 2.2); key.position.set(3, 4, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc9d6c4, 1.2); rim.position.set(-5, -2, -4); scene.add(rim);

  let width = 0, height = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect(); width = Math.max(1, r.width); height = Math.max(1, r.height);
    renderer.setSize(width, height, false); camera.aspect = width / height;
    // Keep the whole infinity in frame on narrow screens.
    camera.position.z = width / height < 0.9 ? 12.5 : width / height < 1.3 ? 10.5 : 7.6;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2; pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2; };
  window.addEventListener('pointermove', onPointer, { passive: true });
  let scroll = 0;
  const onScroll = () => { const r = canvas.getBoundingClientRect(); scroll = Math.max(-1, Math.min(1, (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight)); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  let visible = true, raf = 0, last = performance.now(), time = 0;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    pointer.x += (pointer.tx - pointer.x) * 0.05; pointer.y += (pointer.ty - pointer.y) * 0.05;
    group.rotation.y = pointer.x * 0.35 + scroll * 0.6 + Math.sin(time * 0.25) * 0.12;
    group.rotation.x = -pointer.y * 0.22 + Math.cos(time * 0.2) * 0.06;
    group.rotation.z = Math.sin(time * 0.15) * 0.04;
    const pos = dustGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < dustCount; i++) { const y = pos.getY(i) + dt * (0.08 + (seeds[i] % 1) * 0.12); pos.setY(i, y > 3.4 ? -3.4 : y); pos.setX(i, pos.getX(i) + Math.sin(time + seeds[i]) * dt * 0.05); }
    pos.needsUpdate = true;
    points.rotation.y = pointer.x * 0.12;
    renderer.render(scene, camera);
    if (visible && !reducedMotion) raf = requestAnimationFrame(frame);
  };
  const start = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); };
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && !document.hidden; if (visible) start(); else cancelAnimationFrame(raf); }, { rootMargin: '120px' });
  io.observe(canvas);
  const onVisibility = () => { visible = !document.hidden; if (visible) start(); else cancelAnimationFrame(raf); };
  document.addEventListener('visibilitychange', onVisibility);
  if (reducedMotion) { group.rotation.set(-0.12, 0.3, 0); renderer.render(scene, camera); } else start();

  return () => {
    cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
    window.removeEventListener('pointermove', onPointer); window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVisibility);
    [geoGold, geoPearl, coreGeo, dustGeo].forEach(g => g.dispose()); [gold, pearl, dustMat].forEach(m => m.dispose()); sprite.dispose(); env.dispose(); pmrem.dispose(); renderer.dispose();
  };
}

export function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { return false; }
}
