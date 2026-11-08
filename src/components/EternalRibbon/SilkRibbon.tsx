import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const silk = new URL('./assets/sage-silk.webp', import.meta.url).href;
export type SilkRibbonHandle = { pull: (left: number, right: number) => void };

// A photograph mapped onto two fine fabric meshes. The loop compresses before
// the tail travels; the original weave and folds stay visible throughout.
const vertexSource = `
  attribute vec2 uv;
  uniform vec2 progress;
  varying vec2 texCoord;
  void main() {
    texCoord = uv;
    float side = uv.x < .5 ? -1. : 1.;
    float p = side < 0. ? progress.x : progress.y;
    float tension = smoothstep(0., .35, p);
    float slip = smoothstep(.2, .72, p);
    float pull = smoothstep(.48, 1., p);
    float nearKnot = 1. - smoothstep(.22, .48, abs(uv.x - .5));
    float loop = 1. - smoothstep(.36, .45, uv.y);
    float tail = smoothstep(.49, .84, uv.y);
    vec2 point = uv;
    point.x = .5 + (uv.x - .5) * (1. - .14 * tension * nearKnot * loop);
    point.y = .44 + (uv.y - .44) * (1. - .82 * slip * loop * nearKnot - .35 * slip * tail);
    point.x += side * (.045 * tension * tail + 1.55 * pull);
    point.y += .1 * tension * tail + side * .13 * pull;
    point.y += sin((uv.x - .5) * 8. - pull * 3.) * .035 * sin(p * 3.14159);
    gl_Position = vec4((point.x + 1.) / 3. * 2. - 1., .5 - point.y, 0., 1.);
  }
`;
const fragmentSource = `
  precision mediump float;
  uniform sampler2D fabric;
  varying vec2 texCoord;
  void main() { gl_FragColor = texture2D(fabric, texCoord); }
`;

export const SilkRibbon = forwardRef<SilkRibbonHandle>(function SilkRibbon(_, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const paint = useRef<((left: number, right: number) => void) | null>(null);
  const progress = useRef<[number, number]>([0, 0]);
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({ pull(left, right) {
    progress.current = [left, right];
    paint.current?.(left, right);
    // A usable photographic fallback for devices without WebGL.
    fallback.current?.querySelectorAll<HTMLElement>('.er-silk-half').forEach((half, index) => {
      const p = index === 0 ? left : right;
      half.style.transform = `translate(${(index === 0 ? -1 : 1) * p * 140}%, ${p * 12}%)`;
    });
  } }), []);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const gl = element.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (!program || !buffer || !texture) return;
    let disposed = false;
    let observer: ResizeObserver | undefined;
    const contextLost = (event: Event) => { event.preventDefault(); paint.current = null; setReady(false); };
    element.addEventListener('webglcontextlost', contextLost);

    function clean() {
      disposed = true;
      observer?.disconnect();
      paint.current = null;
      element?.removeEventListener('webglcontextlost', contextLost);
      shaders.forEach(shader => gl?.deleteShader(shader));
      gl?.deleteTexture(texture); gl?.deleteBuffer(buffer); gl?.deleteProgram(program);
    }
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(type);
      if (!shader) return clean;
      shaders.push(shader);
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return clean;
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return clean;
    gl.useProgram(program);

    const points: number[] = [];
    const columns = 40, rows = 24;
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
      // Separate seam vertices prevent the left/right progress from bridging.
      const seam = x < columns / 2 ? -.00001 : .00001;
      const a = x / columns + (x === columns / 2 ? seam : 0);
      const b = (x + 1) / columns + (x + 1 === columns / 2 ? seam : 0);
      const c = y / rows, d = (y + 1) / rows;
      points.push(a,c, b,c, a,d, a,d, b,c, b,d);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    const uv = gl.getAttribLocation(program, 'uv');
    gl.enableVertexAttribArray(uv); gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
    const uniform = gl.getUniformLocation(program, 'progress');
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    const image = new Image();
    image.onload = () => {
      if (disposed || gl.isContextLost()) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      const draw = (left: number, right: number) => {
        gl.viewport(0, 0, element.width, element.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uniform, left, right);
        gl.drawArrays(gl.TRIANGLES, 0, points.length / 2);
      };
      paint.current = draw;
      const resize = () => {
        const bounds = element.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        element.width = Math.max(1, Math.round(bounds.width * ratio));
        element.height = Math.max(1, Math.round(bounds.height * ratio));
        draw(...progress.current);
      };
      observer = new ResizeObserver(resize); observer.observe(element);
      resize(); setReady(true);
    };
    image.src = silk;
    return clean;
  }, []);

  return <div className="er-silk" aria-hidden="true">
    <div ref={fallback} className="er-silk-fallback" style={{ visibility: ready ? 'hidden' : 'visible' }}>
      <img className="er-silk-half er-silk-left" src={silk} alt="" draggable={false}/>
      <img className="er-silk-half er-silk-right" src={silk} alt="" draggable={false}/>
    </div>
    <canvas ref={canvas} style={{ visibility: ready ? 'visible' : 'hidden' }}/>
  </div>;
});
