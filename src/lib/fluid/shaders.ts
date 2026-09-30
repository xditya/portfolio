/* GLSL for the ink simulation.
   Everything is written in GLSL ES 1.00 so the same source runs on WebGL1
   and WebGL2. Compile time defines pick the texture encoding:

   PACKED        signed fields (velocity, pressure, divergence, curl) live in
                 RGBA8 textures as 16 bit fixed point pairs. Used when no
                 half float render target is available.
   VEL_MANUAL    velocity reads at arbitrary positions do their own bilinear
                 filtering (packed textures, or half float without linear).
   DYE_MANUAL    the same for the dye texture (half float without linear).
   BYTE_DYE      the dye texture is 8 bit, so decay also subtracts a little
                 or faint ink would round back to itself and never leave.
   SOURCE_VELOCITY, SPLAT_VELOCITY, COPY_VELOCITY pick the velocity variant
   of a shader that also has a dye variant. */

export const vertexShader = /* glsl */ `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 uTexel;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/* Shared head of every fragment shader. */
const head = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
`;

/* Field encoding and the sampling helpers.
   Velocity is in simulation texels per second, y up. */
const fields = /* glsl */ `
const float PACK_RANGE = 2048.0;

#ifdef PACKED
vec2 packS(float v) {
  float t = clamp(v / (2.0 * PACK_RANGE) + 0.5, 0.0, 65535.0 / 65536.0);
  float q = floor(t * 65536.0 + 0.5);
  float hi = floor(q / 256.0);
  float lo = q - hi * 256.0;
  return vec2(hi, lo) / 255.0;
}
float unpackS(vec2 c) {
  float q = floor(c.x * 255.0 + 0.5) * 256.0 + floor(c.y * 255.0 + 0.5);
  return (q / 65536.0 - 0.5) * (2.0 * PACK_RANGE);
}
vec4 packVel(vec2 v) { return vec4(packS(v.x), packS(v.y)); }
vec2 unpackVel(vec4 c) { return vec2(unpackS(c.xy), unpackS(c.zw)); }
vec4 packScalar(float s) { return vec4(packS(s), 0.0, 1.0); }
float unpackScalar(vec4 c) { return unpackS(c.xy); }
#else
vec4 packVel(vec2 v) { return vec4(v, 0.0, 1.0); }
vec2 unpackVel(vec4 c) { return c.xy; }
vec4 packScalar(float s) { return vec4(s, 0.0, 0.0, 1.0); }
float unpackScalar(vec4 c) { return c.x; }
#endif

vec2 velAt(sampler2D t, vec2 uv) { return unpackVel(texture2D(t, uv)); }
float scalarAt(sampler2D t, vec2 uv) { return unpackScalar(texture2D(t, uv)); }

vec2 velSample(sampler2D t, vec2 uv, vec2 ts) {
#ifdef VEL_MANUAL
  vec2 st = uv / ts - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 a = velAt(t, (i + vec2(0.5, 0.5)) * ts);
  vec2 b = velAt(t, (i + vec2(1.5, 0.5)) * ts);
  vec2 c = velAt(t, (i + vec2(0.5, 1.5)) * ts);
  vec2 d = velAt(t, (i + vec2(1.5, 1.5)) * ts);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
#else
  return texture2D(t, uv).xy;
#endif
}

vec4 dyeSample(sampler2D t, vec2 uv, vec2 ts) {
#ifdef DYE_MANUAL
  vec2 st = uv / ts - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec4 a = texture2D(t, (i + vec2(0.5, 0.5)) * ts);
  vec4 b = texture2D(t, (i + vec2(1.5, 0.5)) * ts);
  vec4 c = texture2D(t, (i + vec2(0.5, 1.5)) * ts);
  vec4 d = texture2D(t, (i + vec2(1.5, 1.5)) * ts);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
#else
  return texture2D(t, uv);
#endif
}
`;

/* Semi Lagrangian advection. Each texel looks back along the velocity and
   takes what was there, then decays a little. Runs for velocity (SOURCE_VELOCITY)
   and for the dye. */
export const advectShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uVelTexel;
uniform vec2 uSrcTexel;
uniform float uDt;
uniform float uDecay;
void main() {
  vec2 vel = velSample(uVelocity, vUv, uVelTexel);
  vec2 back = vUv - uDt * vel * uVelTexel;
#ifdef SOURCE_VELOCITY
  gl_FragColor = packVel(velSample(uSource, back, uSrcTexel) * uDecay);
#else
  vec3 d = dyeSample(uSource, back, uSrcTexel).xyz * uDecay;
#ifdef BYTE_DYE
  d = max(d - 0.75 / 255.0, 0.0);
#endif
  gl_FragColor = vec4(d, 1.0);
#endif
}
`;

/* Divergence of the velocity field. The border acts as a wall: the texel
   beyond the edge is treated as the mirror of the one inside. */
export const divergenceShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uVelocity;
void main() {
  float L = velAt(uVelocity, vL).x;
  float R = velAt(uVelocity, vR).x;
  float T = velAt(uVelocity, vT).y;
  float B = velAt(uVelocity, vB).y;
  vec2 C = velAt(uVelocity, vUv);
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  gl_FragColor = packScalar(0.5 * (R - L + T - B));
}
`;

/* Curl (vorticity), the z component of the rotation of the velocity. */
export const curlShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uVelocity;
void main() {
  float L = velAt(uVelocity, vL).y;
  float R = velAt(uVelocity, vR).y;
  float T = velAt(uVelocity, vT).x;
  float B = velAt(uVelocity, vB).x;
  gl_FragColor = packScalar(0.5 * (R - L - T + B));
}
`;

/* Vorticity confinement. Pushes the flow along the gradient of |curl| so the
   small swirls that advection smears out get some of their energy back. */
export const vorticityShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uStrength;
uniform float uDt;
uniform float uVelMax;
void main() {
  float L = scalarAt(uCurl, vL);
  float R = scalarAt(uCurl, vR);
  float T = scalarAt(uCurl, vT);
  float B = scalarAt(uCurl, vB);
  float C = scalarAt(uCurl, vUv);
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uStrength * C;
  force.y *= -1.0;
  vec2 vel = velAt(uVelocity, vUv) + force * uDt;
  gl_FragColor = packVel(clamp(vel, -uVelMax, uVelMax));
}
`;

/* One Jacobi relaxation step of the pressure Poisson equation. */
export const pressureShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = scalarAt(uPressure, vL);
  float R = scalarAt(uPressure, vR);
  float T = scalarAt(uPressure, vT);
  float B = scalarAt(uPressure, vB);
  float div = scalarAt(uDivergence, vUv);
  gl_FragColor = packScalar((L + R + B + T - div) * 0.25);
}
`;

/* Subtract the pressure gradient so the velocity field stops compressing. */
export const gradientShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = scalarAt(uPressure, vL);
  float R = scalarAt(uPressure, vR);
  float T = scalarAt(uPressure, vT);
  float B = scalarAt(uPressure, vB);
  vec2 vel = velAt(uVelocity, vUv) - 0.5 * vec2(R - L, T - B);
  gl_FragColor = packVel(vel);
}
`;

/* Scale a scalar field. Used to soften the pressure before each solve. */
export const clearShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uTexture;
uniform float uValue;
void main() {
  gl_FragColor = packScalar(scalarAt(uTexture, vUv) * uValue);
}
`;

/* Add a gaussian blob to a field. uPoint is in texture space, uRadius is the
   squared radius as a fraction of the height (uAspect corrects x). The velocity
   variant adds uValue.xy, the dye variant adds uValue.xyz. */
export const splatShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uPoint;
uniform vec3 uValue;
uniform float uRadius;
uniform float uVelMax;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  float w = exp(-dot(p, p) / uRadius);
#ifdef SPLAT_VELOCITY
  vec2 vel = velAt(uTarget, vUv) + w * uValue.xy;
  gl_FragColor = packVel(clamp(vel, -uVelMax, uVelMax));
#else
  vec3 d = texture2D(uTarget, vUv).xyz + w * uValue;
  gl_FragColor = vec4(min(d, 4.0), 1.0);
#endif
}
`;

/* Stretch a field into a new texture on resize. */
export const copyShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uTexture;
uniform vec2 uSrcTexel;
void main() {
#ifdef COPY_VELOCITY
  gl_FragColor = packVel(velSample(uTexture, vUv, uSrcTexel));
#else
  gl_FragColor = dyeSample(uTexture, vUv, uSrcTexel);
#endif
}
`;

/* Dye to colour. The two ink densities sit in the red and green channels.
   Each ink adds its colour over the ground, and where both are dense a pale
   highlight comes through. A small blur softens the edges and a touch of
   noise keeps the dark gradients from banding. */
export const displayShader =
  head +
  fields +
  /* glsl */ `
uniform sampler2D uDye;
uniform vec2 uDyeTexel;
uniform vec3 uGround;
uniform vec3 uInk1;
uniform vec3 uInk2;
uniform vec3 uPale;
uniform float uIntensity;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
#ifdef DYE_MANUAL
  vec2 d = dyeSample(uDye, vUv, uDyeTexel).xy;
#else
  vec2 o = uDyeTexel * 1.25;
  vec2 d = texture2D(uDye, vUv).xy * 0.36
    + (texture2D(uDye, vUv + vec2(o.x, o.y)).xy
    + texture2D(uDye, vUv + vec2(-o.x, o.y)).xy
    + texture2D(uDye, vUv + vec2(o.x, -o.y)).xy
    + texture2D(uDye, vUv + vec2(-o.x, -o.y)).xy) * 0.16;
#endif
  d = min(d, 1.0) * uIntensity;
  float h = max(0.0, d.x + d.y - 1.05) * 1.3;
  vec3 c = uGround + d.x * (uInk1 - uGround) + d.y * (uInk2 - uGround) + h * (uPale - uGround);
  c += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`;

/* Prepend the defines a variant needs. */
export function withDefines(source: string, defines: string[]): string {
  if (defines.length === 0) return source;
  return defines.map((d) => `#define ${d} 1\n`).join("") + source;
}
