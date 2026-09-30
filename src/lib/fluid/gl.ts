/* Small WebGL helpers for the ink simulation. Every call checks status and
   returns null on failure instead of throwing, so the caller can log once
   and fall back. */

export type GL = WebGLRenderingContext | WebGL2RenderingContext;

export interface TexFormat {
  internalFormat: number;
  format: number;
  type: number;
}

export interface Program {
  program: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
}

export interface Target {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  w: number;
  h: number;
  tx: number;
  ty: number;
}

export interface Pair {
  read: Target;
  write: Target;
  w: number;
  h: number;
  tx: number;
  ty: number;
}

export function isWebGL2(gl: GL): gl is WebGL2RenderingContext {
  return typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
}

export function getContext(
  canvas: HTMLCanvasElement,
  opts: { webgl1?: boolean; software?: boolean },
): GL | null {
  const attrs: WebGLContextAttributes = {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: !opts.software,
  };
  try {
    if (!opts.webgl1) {
      const gl2 = canvas.getContext("webgl2", attrs);
      if (gl2) return gl2;
    }
    const gl1 =
      canvas.getContext("webgl", attrs) ||
      (canvas.getContext("experimental-webgl", attrs) as WebGLRenderingContext | null);
    return gl1;
  } catch {
    return null;
  }
}

export function compileShader(
  gl: GL,
  type: number,
  source: string,
): WebGLShader | string {
  const shader = gl.createShader(type);
  if (!shader) return "createShader failed";
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "unknown shader error";
    gl.deleteShader(shader);
    return log;
  }
  return shader;
}

/* Links a program, binds aPosition to slot 0 and reads every active uniform
   location once so the frame loop only ever sets uniforms by name. */
export function createProgram(
  gl: GL,
  vertex: WebGLShader,
  fragmentSource: string,
): Program | string {
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (typeof fragment === "string") return fragment;
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(fragment);
    return "createProgram failed";
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "unknown link error";
    gl.deleteProgram(program);
    return log;
  }
  const u: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) u[info.name] = gl.getUniformLocation(program, info.name);
  }
  return { program, u };
}

/* fill is an optional 4 byte pattern for byte textures. Packed fields need
   it because their encoded zero is not zero bytes. */
export function createTarget(
  gl: GL,
  w: number,
  h: number,
  fmt: TexFormat,
  filter: number,
  fill: Uint8Array | null = null,
): Target | null {
  const tex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!tex || !fbo) return null;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  if (fill && fmt.type === gl.UNSIGNED_BYTE) {
    const data = new Uint8Array(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = fill[0];
      data[i + 1] = fill[1];
      data[i + 2] = fill[2];
      data[i + 3] = fill[3];
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, w, h, 0, fmt.format, fmt.type, data);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, w, h, 0, fmt.format, fmt.type, null);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if (!ok) {
    gl.deleteTexture(tex);
    gl.deleteFramebuffer(fbo);
    return null;
  }
  return { fbo, tex, w, h, tx: 1 / w, ty: 1 / h };
}

export function deleteTarget(gl: GL, t: Target | null): void {
  if (!t) return;
  gl.deleteFramebuffer(t.fbo);
  gl.deleteTexture(t.tex);
}

export function createPair(
  gl: GL,
  w: number,
  h: number,
  fmt: TexFormat,
  filter: number,
  fill: Uint8Array | null = null,
): Pair | null {
  const read = createTarget(gl, w, h, fmt, filter, fill);
  const write = createTarget(gl, w, h, fmt, filter, fill);
  if (!read || !write) {
    deleteTarget(gl, read);
    deleteTarget(gl, write);
    return null;
  }
  return { read, write, w, h, tx: 1 / w, ty: 1 / h };
}

export function deletePair(gl: GL, p: Pair | null): void {
  if (!p) return;
  deleteTarget(gl, p.read);
  deleteTarget(gl, p.write);
}

export function swap(p: Pair): void {
  const t = p.read;
  p.read = p.write;
  p.write = t;
}

/* Can this format be rendered to? Tries a tiny texture and reads the
   framebuffer status, then drains the error queue it may have left. */
export function renderable(gl: GL, fmt: TexFormat): boolean {
  const t = createTarget(gl, 4, 4, fmt, gl.NEAREST);
  const ok = t !== null;
  deleteTarget(gl, t);
  while (gl.getError() !== gl.NO_ERROR) {
    /* drain */
  }
  return ok;
}

export function fragmentHighp(gl: GL): boolean {
  const f = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  return !!f && f.precision > 0;
}
