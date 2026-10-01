/* Stable fluids on the GPU. Never allocates inside the frame loop: every
   framebuffer is created at init or on resize.

   Units: positions are fractions of the canvas (y from the top). Velocities
   and radii are fractions of the canvas height (velocities per second), so
   the motion looks the same on any grid size. */

import {
  type GL,
  type Pair,
  type Program,
  type Target,
  type TexFormat,
  createPair,
  createProgram,
  createTarget,
  compileShader,
  deletePair,
  deleteTarget,
  fragmentHighp,
  getContext,
  isWebGL2,
  renderable,
  swap,
} from "./gl";
import {
  advectShader,
  clearShader,
  copyShader,
  curlShader,
  displayShader,
  divergenceShader,
  gradientShader,
  pressureShader,
  splatShader,
  vertexShader,
  vorticityShader,
  withDefines,
} from "./shaders";

export type RGB = [number, number, number];

export interface FluidColors {
  ground: RGB;
  ink1: RGB;
  ink2: RGB;
  pale: RGB;
}

export interface FluidOptions {
  /* Short side of the velocity grid, in texels. */
  simRes: number;
  /* Short side of the dye texture, in texels. */
  dyeRes: number;
  pressureIterations: number;
  /* Per second. The field loses this share of itself every second. */
  velocityDissipation: number;
  dyeDissipation: number;
  curl: number;
  /* Fastest allowed flow, in canvas heights per second. */
  velocityMax: number;
  colors: FluidColors;
  /* Test hooks: pick the slower paths on purpose. */
  force?: {
    webgl1?: boolean;
    byte?: boolean;
    noLinear?: boolean;
    software?: boolean;
  };
}

interface Programs {
  advectVel: Program;
  advectDye: Program;
  divergence: Program;
  curl: Program;
  vorticity: Program;
  pressure: Program;
  gradient: Program;
  clear: Program;
  splatVel: Program;
  splatDye: Program;
  copyVel: Program;
  copyDye: Program;
  display: Program;
}

const HALF_FLOAT_OES = 0x8d61;
const MAX_ASPECT = 4;

/* Grid size for a base resolution and a canvas aspect: the short side gets
   the base, the long side follows the aspect up to a cap. */
function gridSize(base: number, aspect: number): [number, number] {
  if (aspect >= 1) return [Math.min(Math.round(base * aspect), base * MAX_ASPECT), base];
  return [base, Math.min(Math.round(base / aspect), base * MAX_ASPECT)];
}

export class FluidSim {
  readonly webgl2: boolean;
  readonly halfFloat: boolean;
  readonly linear: boolean;

  private readonly gl: GL;
  private readonly canvas: HTMLCanvasElement;
  private readonly opts: FluidOptions;

  private velFmt: TexFormat;
  private dyeFmt: TexFormat;
  private scalarFmt: TexFormat;
  private velFilter: number;
  private dyeFilter: number;
  private defines: string[] = [];
  /* Byte patterns that decode to zero in the packed encoding. Null when the
     fields are half float, where zero bytes already mean zero. */
  private zeroVel: Uint8Array | null = null;
  private zeroScalar: Uint8Array | null = null;

  private p: Programs | null = null;
  private vertex: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;

  private velocity: Pair | null = null;
  private dye: Pair | null = null;
  private pressure: Pair | null = null;
  private curl: Target | null = null;
  private divergence: Target | null = null;
  private aspect = 1;
  private broken = false;

  static create(canvas: HTMLCanvasElement, opts: FluidOptions): FluidSim | string {
    const gl = getContext(canvas, {
      webgl1: opts.force?.webgl1,
      software: opts.force?.software,
    });
    if (!gl) return "no WebGL context";
    const sim = new FluidSim(gl, canvas, opts);
    const error = sim.init();
    if (error) {
      sim.dispose();
      return error;
    }
    return sim;
  }

  private constructor(gl: GL, canvas: HTMLCanvasElement, opts: FluidOptions) {
    this.gl = gl;
    this.canvas = canvas;
    this.opts = opts;
    this.webgl2 = isWebGL2(gl);

    const force = opts.force || {};
    let halfType: number | null = null;
    let linear = false;
    if (this.webgl2) {
      const colorFloat =
        gl.getExtension("EXT_color_buffer_float") ||
        gl.getExtension("EXT_color_buffer_half_float");
      if (colorFloat && !force.byte) {
        halfType = (gl as WebGL2RenderingContext).HALF_FLOAT;
        linear = true;
      }
    } else {
      const half = gl.getExtension("OES_texture_half_float");
      gl.getExtension("EXT_color_buffer_half_float");
      if (half && !force.byte) {
        halfType = HALF_FLOAT_OES;
        linear = !!gl.getExtension("OES_texture_half_float_linear");
      }
    }
    if (force.noLinear) linear = false;

    const byteFmt: TexFormat = { internalFormat: gl.RGBA, format: gl.RGBA, type: gl.UNSIGNED_BYTE };
    let velFmt = byteFmt;
    let dyeFmt = byteFmt;
    let scalarFmt = byteFmt;
    let halfFloat = false;

    if (halfType !== null) {
      const rgba: TexFormat = this.webgl2
        ? { internalFormat: (gl as WebGL2RenderingContext).RGBA16F, format: gl.RGBA, type: halfType }
        : { internalFormat: gl.RGBA, format: gl.RGBA, type: halfType };
      if (renderable(gl, rgba)) {
        halfFloat = true;
        dyeFmt = rgba;
        velFmt = rgba;
        scalarFmt = rgba;
        if (this.webgl2) {
          const gl2 = gl as WebGL2RenderingContext;
          const rg: TexFormat = { internalFormat: gl2.RG16F, format: gl2.RG, type: halfType };
          const r: TexFormat = { internalFormat: gl2.R16F, format: gl2.RED, type: halfType };
          if (renderable(gl, rg)) velFmt = rg;
          if (renderable(gl, r)) scalarFmt = r;
          else scalarFmt = velFmt;
        }
      }
    }

    this.halfFloat = halfFloat;
    this.linear = halfFloat ? linear : true;
    this.velFmt = velFmt;
    this.dyeFmt = dyeFmt;
    this.scalarFmt = scalarFmt;

    const packed = !halfFloat;
    const velManual = packed || !linear;
    const dyeManual = halfFloat && !linear;
    if (packed) {
      this.defines.push("PACKED", "BYTE_DYE");
      this.zeroVel = new Uint8Array([128, 0, 128, 0]);
      this.zeroScalar = new Uint8Array([128, 0, 0, 255]);
    }
    if (velManual) this.defines.push("VEL_MANUAL");
    if (dyeManual) this.defines.push("DYE_MANUAL");
    this.velFilter = velManual ? gl.NEAREST : gl.LINEAR;
    this.dyeFilter = dyeManual ? gl.NEAREST : gl.LINEAR;
  }

  private init(): string | null {
    const gl = this.gl;
    if (!this.halfFloat && !fragmentHighp(gl)) {
      return "byte textures need highp fragment shaders";
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
    if (typeof vertex === "string") return `vertex shader: ${vertex}`;
    this.vertex = vertex;

    const base = this.defines;
    const make = (name: string, source: string, extra: string[] = []): Program | string => {
      const built = createProgram(gl, vertex, withDefines(source, base.concat(extra)));
      return typeof built === "string" ? `${name}: ${built}` : built;
    };
    const list = {
      advectVel: make("advect velocity", advectShader, ["SOURCE_VELOCITY"]),
      advectDye: make("advect dye", advectShader),
      divergence: make("divergence", divergenceShader),
      curl: make("curl", curlShader),
      vorticity: make("vorticity", vorticityShader),
      pressure: make("pressure", pressureShader),
      gradient: make("gradient", gradientShader),
      clear: make("clear", clearShader),
      splatVel: make("splat velocity", splatShader, ["SPLAT_VELOCITY"]),
      splatDye: make("splat dye", splatShader),
      copyVel: make("copy velocity", copyShader, ["COPY_VELOCITY"]),
      copyDye: make("copy dye", copyShader),
      display: make("display", displayShader),
    };
    const programs: Partial<Programs> = {};
    for (const key of Object.keys(list) as (keyof Programs)[]) {
      const built = list[key];
      if (typeof built === "string") {
        for (const other of Object.values(list)) {
          if (typeof other !== "string") gl.deleteProgram(other.program);
        }
        return built;
      }
      programs[key] = built;
    }
    this.p = programs as Programs;

    /* One triangle that covers the whole viewport. */
    const buffer = gl.createBuffer();
    if (!buffer) return "createBuffer failed";
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    /* Constant uniforms. Texture units and texel sizes are set on resize. */
    const c = this.opts.colors;
    const d = this.p.display;
    gl.useProgram(d.program);
    gl.uniform3f(d.u.uGround, c.ground[0], c.ground[1], c.ground[2]);
    gl.uniform3f(d.u.uInk1, c.ink1[0], c.ink1[1], c.ink1[2]);
    gl.uniform3f(d.u.uInk2, c.ink2[0], c.ink2[1], c.ink2[2]);
    gl.uniform3f(d.u.uPale, c.pale[0], c.pale[1], c.pale[2]);
    gl.uniform1i(d.u.uDye, 0);
    gl.useProgram(this.p.clear.program);
    gl.uniform1f(this.p.clear.u.uValue, 0.8);
    gl.uniform1i(this.p.clear.u.uTexture, 0);
    gl.useProgram(this.p.vorticity.program);
    gl.uniform1f(this.p.vorticity.u.uStrength, this.opts.curl);
    gl.uniform1i(this.p.vorticity.u.uVelocity, 0);
    gl.uniform1i(this.p.vorticity.u.uCurl, 1);
    gl.useProgram(this.p.pressure.program);
    gl.uniform1i(this.p.pressure.u.uDivergence, 0);
    gl.uniform1i(this.p.pressure.u.uPressure, 1);
    gl.useProgram(this.p.gradient.program);
    gl.uniform1i(this.p.gradient.u.uPressure, 0);
    gl.uniform1i(this.p.gradient.u.uVelocity, 1);
    gl.useProgram(this.p.advectVel.program);
    gl.uniform1i(this.p.advectVel.u.uVelocity, 0);
    gl.uniform1i(this.p.advectVel.u.uSource, 1);
    gl.useProgram(this.p.advectDye.program);
    gl.uniform1i(this.p.advectDye.u.uVelocity, 0);
    gl.uniform1i(this.p.advectDye.u.uSource, 1);
    for (const prog of [this.p.divergence, this.p.curl]) {
      gl.useProgram(prog.program);
      gl.uniform1i(prog.u.uVelocity, 0);
    }
    for (const prog of [this.p.splatVel, this.p.splatDye]) {
      gl.useProgram(prog.program);
      gl.uniform1i(prog.u.uTarget, 0);
    }
    for (const prog of [this.p.copyVel, this.p.copyDye]) {
      gl.useProgram(prog.program);
      gl.uniform1i(prog.u.uTexture, 0);
    }
    /* Show the ground straight away rather than black until the first frame. */
    gl.clearColor(c.ground[0], c.ground[1], c.ground[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (gl.getError() !== gl.NO_ERROR) return "GL error during setup";
    return null;
  }

  get ready(): boolean {
    return this.p !== null && this.velocity !== null && !this.broken;
  }

  get failed(): boolean {
    return this.broken;
  }

  /* Canvas size in device pixels. Reallocates the grids when their size
     changes and stretches the old fields into the new ones. */
  resize(width: number, height: number): void {
    const gl = this.gl;
    const p = this.p;
    if (!p || this.broken || width < 2 || height < 2) return;
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
    this.aspect = width / height;

    const [sw, sh] = gridSize(this.opts.simRes, this.aspect);
    const [dw, dh] = gridSize(this.opts.dyeRes, this.aspect);
    const same =
      this.velocity !== null &&
      this.dye !== null &&
      this.velocity.w === sw &&
      this.velocity.h === sh &&
      this.dye.w === dw &&
      this.dye.h === dh;

    gl.useProgram(p.splatVel.program);
    gl.uniform1f(p.splatVel.u.uAspect, this.aspect);
    gl.uniform1f(p.splatVel.u.uVelMax, this.opts.velocityMax * sh);
    gl.useProgram(p.splatDye.program);
    gl.uniform1f(p.splatDye.u.uAspect, this.aspect);
    gl.useProgram(p.vorticity.program);
    gl.uniform1f(p.vorticity.u.uVelMax, this.opts.velocityMax * sh);
    if (same) return;

    const velocity = createPair(gl, sw, sh, this.velFmt, this.velFilter, this.zeroVel);
    const dye = createPair(gl, dw, dh, this.dyeFmt, this.dyeFilter);
    const pressure = createPair(gl, sw, sh, this.scalarFmt, gl.NEAREST, this.zeroScalar);
    const curl = createTarget(gl, sw, sh, this.scalarFmt, gl.NEAREST, this.zeroScalar);
    const divergence = createTarget(gl, sw, sh, this.scalarFmt, gl.NEAREST, this.zeroScalar);
    if (!velocity || !dye || !pressure || !curl || !divergence) {
      deletePair(gl, velocity);
      deletePair(gl, dye);
      deletePair(gl, pressure);
      deleteTarget(gl, curl);
      deleteTarget(gl, divergence);
      this.broken = true;
      return;
    }

    /* Carry the old fields over so a resize does not empty the pool. */
    if (this.velocity) {
      gl.useProgram(p.copyVel.program);
      gl.uniform2f(p.copyVel.u.uSrcTexel, this.velocity.tx, this.velocity.ty);
      this.bind(0, this.velocity.read.tex);
      this.blit(velocity.write);
      swap(velocity);
    }
    if (this.dye) {
      gl.useProgram(p.copyDye.program);
      gl.uniform2f(p.copyDye.u.uSrcTexel, this.dye.tx, this.dye.ty);
      this.bind(0, this.dye.read.tex);
      this.blit(dye.write);
      swap(dye);
    }
    deletePair(gl, this.velocity);
    deletePair(gl, this.dye);
    deletePair(gl, this.pressure);
    deleteTarget(gl, this.curl);
    deleteTarget(gl, this.divergence);
    this.velocity = velocity;
    this.dye = dye;
    this.pressure = pressure;
    this.curl = curl;
    this.divergence = divergence;

    const simGrid = [p.divergence, p.curl, p.vorticity, p.pressure, p.gradient, p.clear, p.advectVel, p.splatVel];
    for (const prog of simGrid) {
      gl.useProgram(prog.program);
      gl.uniform2f(prog.u.uTexel, velocity.tx, velocity.ty);
    }
    gl.useProgram(p.advectVel.program);
    gl.uniform2f(p.advectVel.u.uVelTexel, velocity.tx, velocity.ty);
    gl.uniform2f(p.advectVel.u.uSrcTexel, velocity.tx, velocity.ty);
    gl.useProgram(p.advectDye.program);
    gl.uniform2f(p.advectDye.u.uTexel, dye.tx, dye.ty);
    gl.uniform2f(p.advectDye.u.uVelTexel, velocity.tx, velocity.ty);
    gl.uniform2f(p.advectDye.u.uSrcTexel, dye.tx, dye.ty);
    gl.useProgram(p.splatDye.program);
    gl.uniform2f(p.splatDye.u.uTexel, dye.tx, dye.ty);
    gl.useProgram(p.display.program);
    gl.uniform2f(p.display.u.uTexel, dye.tx, dye.ty);
    gl.uniform2f(p.display.u.uDyeTexel, dye.tx, dye.ty);
  }

  /* Add ink and a push. x and y are fractions of the canvas from the top
     left, vx and vy are canvas heights per second (y down), a and b are the
     amounts of the two inks, radius is a fraction of the canvas height. */
  splat(x: number, y: number, vx: number, vy: number, a: number, b: number, radius: number): void {
    const gl = this.gl;
    const p = this.p;
    const velocity = this.velocity;
    const dye = this.dye;
    if (!p || !velocity || !dye || this.broken) return;
    const r2 = radius * radius;
    if (vx !== 0 || vy !== 0) {
      gl.useProgram(p.splatVel.program);
      gl.uniform2f(p.splatVel.u.uPoint, x, 1 - y);
      gl.uniform3f(p.splatVel.u.uValue, vx * velocity.h, -vy * velocity.h, 0);
      gl.uniform1f(p.splatVel.u.uRadius, r2);
      this.bind(0, velocity.read.tex);
      this.blit(velocity.write);
      swap(velocity);
    }
    if (a !== 0 || b !== 0) {
      gl.useProgram(p.splatDye.program);
      gl.uniform2f(p.splatDye.u.uPoint, x, 1 - y);
      gl.uniform3f(p.splatDye.u.uValue, a, b, 0);
      gl.uniform1f(p.splatDye.u.uRadius, r2);
      this.bind(0, dye.read.tex);
      this.blit(dye.write);
      swap(dye);
    }
  }

  /* Advance the fluid by dt seconds. */
  step(dt: number): void {
    const gl = this.gl;
    const p = this.p;
    const velocity = this.velocity;
    const dye = this.dye;
    const pressure = this.pressure;
    const curl = this.curl;
    const divergence = this.divergence;
    if (!p || !velocity || !dye || !pressure || !curl || !divergence || this.broken) return;

    gl.useProgram(p.curl.program);
    this.bind(0, velocity.read.tex);
    this.blit(curl);

    gl.useProgram(p.vorticity.program);
    gl.uniform1f(p.vorticity.u.uDt, dt);
    this.bind(0, velocity.read.tex);
    this.bind(1, curl.tex);
    this.blit(velocity.write);
    swap(velocity);

    gl.useProgram(p.divergence.program);
    this.bind(0, velocity.read.tex);
    this.blit(divergence);

    gl.useProgram(p.clear.program);
    this.bind(0, pressure.read.tex);
    this.blit(pressure.write);
    swap(pressure);

    gl.useProgram(p.pressure.program);
    this.bind(0, divergence.tex);
    for (let i = 0; i < this.opts.pressureIterations; i++) {
      this.bind(1, pressure.read.tex);
      this.blit(pressure.write);
      swap(pressure);
    }

    gl.useProgram(p.gradient.program);
    this.bind(0, pressure.read.tex);
    this.bind(1, velocity.read.tex);
    this.blit(velocity.write);
    swap(velocity);

    gl.useProgram(p.advectVel.program);
    gl.uniform1f(p.advectVel.u.uDt, dt);
    gl.uniform1f(p.advectVel.u.uDecay, Math.exp(-this.opts.velocityDissipation * dt));
    this.bind(0, velocity.read.tex);
    this.bind(1, velocity.read.tex);
    this.blit(velocity.write);
    swap(velocity);

    gl.useProgram(p.advectDye.program);
    gl.uniform1f(p.advectDye.u.uDt, dt);
    gl.uniform1f(p.advectDye.u.uDecay, Math.exp(-this.opts.dyeDissipation * dt));
    this.bind(0, velocity.read.tex);
    this.bind(1, dye.read.tex);
    this.blit(dye.write);
    swap(dye);
  }

  /* Draw the dye to the canvas. intensity scales the ink, 0 shows the ground. */
  render(intensity: number): void {
    const gl = this.gl;
    const p = this.p;
    const dye = this.dye;
    if (!p || !dye || this.broken) return;
    gl.useProgram(p.display.program);
    gl.uniform1f(p.display.u.uIntensity, intensity);
    this.bind(0, dye.read.tex);
    this.blit(null);
  }

  /* Keeps the context alive: a canvas returns the same context on every
     getContext call, so losing it would break a strict mode remount. */
  dispose(): void {
    const gl = this.gl;
    const lost = gl.isContextLost();
    if (!lost) {
      deletePair(gl, this.velocity);
      deletePair(gl, this.dye);
      deletePair(gl, this.pressure);
      deleteTarget(gl, this.curl);
      deleteTarget(gl, this.divergence);
      if (this.p) {
        for (const prog of Object.values(this.p)) gl.deleteProgram(prog.program);
      }
      if (this.vertex) gl.deleteShader(this.vertex);
      if (this.buffer) gl.deleteBuffer(this.buffer);
    }
    this.velocity = null;
    this.dye = null;
    this.pressure = null;
    this.curl = null;
    this.divergence = null;
    this.p = null;
    this.vertex = null;
    this.buffer = null;
    this.broken = true;
  }

  private bind(unit: number, tex: WebGLTexture): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
  }

  private blit(target: Target | null): void {
    const gl = this.gl;
    if (target) {
      gl.viewport(0, 0, target.w, target.h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
