"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { event as trackEvent } from "@/lib/gtag";
import {
  GAME_PROJECTS,
  GAME_YEARS,
  GAME_STATS,
  GAME_EXPERIENCE,
  GAME_TECH_STACK,
  GAME_SOCIALS,
  GAME_LINKS,
  GAME_ABOUT,
  GAME_STATEMENT,
} from "@/lib/gameData";

/* ───────────────────────── Types ───────────────────────── */

type Action = { label: string; href: string; internal?: boolean };

type HudPanel = {
  id: string;
  kind: string;
  title: string;
  subtitle?: string;
  body?: string;
  chips?: string[];
  actions: Action[];
  collected?: boolean;
};

type Interactable = {
  id: string;
  kind: string;
  position: THREE.Vector3;
  radius: number;
  panel: Omit<HudPanel, "id" | "kind">;
  object: THREE.Object3D;
};

type Floater = {
  obj: THREE.Object3D;
  baseY: number;
  amp: number;
  speed: number;
  phase: number;
};

type Spinner = { obj: THREE.Object3D; speed: number; axis: "x" | "y" | "z" };

type Pulse = {
  mat: THREE.Material & { opacity: number };
  base: number;
  amp: number;
  speed: number;
  phase: number;
};

type Orbiter = {
  geo: THREE.BufferGeometry;
  center: THREE.Vector3;
  radius: number;
  speed: number;
  phase: number;
  count: number;
  plane: "yz" | "xz";
};

type Burst = {
  points: THREE.Points;
  velocities: THREE.Vector3[];
  born: number;
};

/* ─────────────────────── Constants ─────────────────────── */

const C = {
  bg: 0x05060a,
  ink: 0xf4f4ef,
  inkDim: 0xa3a8b3,
  muted: 0x5f6470,
  accent: 0x4d62ff,
  accentSoft: 0x97a3ff,
  card: 0x0d1018,
};

const WORLD_RADIUS = 132;
const STORAGE_KEY = "xditya-game-discovered";

/* ─────────────────── Canvas text sprites ─────────────────── */

function makeTextSprite(
  text: string,
  opts: {
    size?: number; // world height of one line
    color?: string;
    weight?: number;
    family?: string;
    spacing?: number;
    opacity?: number;
  } = {},
): THREE.Sprite {
  const {
    size = 2,
    color = "#F4F4EF",
    weight = 800,
    family = "'Archivo', 'Arial Black', sans-serif",
    spacing = 0,
    opacity = 1,
  } = opts;

  const fs = 90;
  const pad = 28;
  const lines = text.split("\n");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = `${weight} ${fs}px ${family}`;
  ctx.font = font;
  const widths = lines.map((l) => ctx.measureText(l).width + l.length * spacing);
  const w = Math.ceil(Math.max(...widths)) + pad * 2;
  const lineH = fs * 1.22;
  const h = Math.ceil(lineH * lines.length) + pad * 2;
  canvas.width = w;
  canvas.height = h;
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  lines.forEach((line, i) => {
    if (spacing > 0) {
      const total = ctx.measureText(line).width + line.length * spacing;
      let x = w / 2 - total / 2;
      ctx.textAlign = "left";
      for (const ch of line) {
        ctx.fillText(ch, x, pad + lineH * i + lineH / 2);
        x += ctx.measureText(ch).width + spacing;
      }
      ctx.textAlign = "center";
    } else {
      ctx.fillText(line, w / 2, pad + lineH * i + lineH / 2);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  const worldH = size * lines.length;
  sprite.scale.set(worldH * (w / h), worldH, 1);
  return sprite;
}

/** A number sprite whose value can be re-drawn (for count-up stats). */
function makeCounterSprite(suffix: string, size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 200;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  sprite.scale.set(size * (560 / 200), size, 1);
  const draw = (value: number) => {
    ctx.clearRect(0, 0, 560, 200);
    ctx.font = "900 120px 'Archivo', 'Arial Black', sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const label = `${value}`;
    const sw = ctx.measureText(label + suffix).width;
    const scale = Math.min(1, 520 / sw);
    ctx.save();
    ctx.translate(280, 100);
    ctx.scale(scale, scale);
    const lw = ctx.measureText(label).width;
    const tw = ctx.measureText(label + suffix).width;
    ctx.fillStyle = "#F4F4EF";
    ctx.fillText(label, -tw / 2 + lw / 2, 0);
    ctx.fillStyle = "#6E80FF";
    ctx.fillText(suffix, -tw / 2 + lw + (tw - lw) / 2, 0);
    ctx.restore();
    texture.needsUpdate = true;
  };
  draw(0);
  return { sprite, draw };
}

/* ─────────────── Shared procedural textures ─────────────── */

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function makeGroundTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(512, 512, 60, 512, 512, 512);
  g.addColorStop(0, "#0e1228");
  g.addColorStop(0.45, "#090c18");
  g.addColorStop(1, "#04050a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 1024);
  // faint concentric rings
  ctx.strokeStyle = "rgba(77,98,255,0.10)";
  for (let r = 90; r < 512; r += 84) {
    ctx.beginPath();
    ctx.arc(512, 512, r, 0, Math.PI * 2);
    ctx.lineWidth = r % 168 === 90 ? 2.5 : 1;
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeChevronTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(20, 88);
  ctx.lineTo(64, 40);
  ctx.lineTo(108, 88);
  ctx.stroke();
  return new THREE.CanvasTexture(c);
}

function makeTowerTexture(accentHex: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0a0d17";
  ctx.fillRect(0, 0, 128, 256);
  const cols = 5;
  const rows = 12;
  const cw = 128 / cols;
  const ch = 256 / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const r = Math.random();
      if (r > 0.62) ctx.fillStyle = accentHex;
      else if (r > 0.45) ctx.fillStyle = "#2b3354";
      else ctx.fillStyle = "#10131f";
      ctx.fillRect(x * cw + 4, y * ch + 5, cw - 8, ch - 10);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ─────────────────────── Component ─────────────────────── */

export default function PortfolioGame() {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const joyRef = useRef({ x: 0, y: 0 });
  const startedRef = useRef(false);
  const interactRef = useRef<(() => void) | null>(null);

  const [started, setStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [panel, setPanel] = useState<HudPanel | null>(null);
  const [zone, setZone] = useState("THE GRID");
  const [discovered, setDiscovered] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  const totalProjects = GAME_PROJECTS.length;

  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  useEffect(() => {
    setIsTouch(typeof window !== "undefined" && "ontouchstart" in window);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const touchDevice = "ontouchstart" in window;

    /* ── Renderer / scene / camera / bloom ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    const pixelRatio = Math.min(window.devicePixelRatio, touchDevice ? 1.4 : 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.bg);
    scene.fog = new THREE.Fog(0x070a16, 70, 250);

    const camera = new THREE.PerspectiveCamera(
      58,
      mount.clientWidth / mount.clientHeight,
      0.1,
      600,
    );
    camera.position.set(0, 14, 22);

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(mount.clientWidth, mount.clientHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      touchDevice ? 0.65 : 0.85, // strength
      0.55, // radius
      0.32, // threshold
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ── Lights ── */
    scene.add(new THREE.HemisphereLight(0x36427e, 0x05060a, 0.85));
    scene.add(new THREE.AmbientLight(0x3c4468, 0.5));
    const keyLight = new THREE.DirectionalLight(0xaab4ff, 0.75);
    keyLight.position.set(40, 90, 30);
    scene.add(keyLight);

    /* ── Sky dome ── */
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(440, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color(0x05070f) },
          horizon: { value: new THREE.Color(0x141a38) },
          bottom: { value: new THREE.Color(0x04050a) },
        },
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom;
          varying vec3 vDir;
          void main() {
            float y = vDir.y;
            vec3 col = y > 0.0
              ? mix(horizon, top, pow(min(y * 2.2, 1.0), 0.7))
              : mix(horizon, bottom, min(-y * 3.0, 1.0));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    );
    scene.add(sky);

    /* ── Ground ── */
    const groundTex = makeGroundTexture();
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(WORLD_RADIUS + 80, 80),
      new THREE.MeshBasicMaterial({ map: groundTex }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.06;
    scene.add(ground);

    const grid = new THREE.GridHelper(380, 76, 0x3346cc, 0x10162e);
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.28;
    scene.add(grid);

    // world edge ring + light pillars
    const edge = new THREE.Mesh(
      new THREE.TorusGeometry(WORLD_RADIUS, 0.3, 8, 160),
      new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0.55 }),
    );
    edge.rotation.x = Math.PI / 2;
    edge.position.y = 0.3;
    scene.add(edge);

    /* ── Bookkeeping ── */
    const floaters: Floater[] = [];
    const spinners: Spinner[] = [];
    const pulses: Pulse[] = [];
    const orbiters: Orbiter[] = [];
    const interactables: Interactable[] = [];
    const clickTargets: THREE.Object3D[] = [];
    const bursts: Burst[] = [];
    const textures: THREE.Texture[] = [groundTex];

    const glowTex = makeGlowTexture();
    textures.push(glowTex);

    const addFloater = (obj: THREE.Object3D, amp = 0.4, speed = 1) => {
      floaters.push({ obj, baseY: obj.position.y, amp, speed, phase: Math.random() * Math.PI * 2 });
    };
    const addSpinner = (obj: THREE.Object3D, speed: number, axis: "x" | "y" | "z" = "y") => {
      spinners.push({ obj, speed, axis });
    };
    const addPulse = (mat: THREE.Material & { opacity: number }, base: number, amp: number, speed = 2) => {
      pulses.push({ mat, base, amp, speed, phase: Math.random() * Math.PI * 2 });
    };

    const addGlow = (parent: THREE.Object3D, color: number, scale: number, y: number, opacity = 0.55) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      s.scale.set(scale, scale, 1);
      s.position.y = y;
      parent.add(s);
      return s;
    };

    const registerInteractable = (i: Interactable) => {
      interactables.push(i);
      i.object.traverse((o) => {
        o.userData.iid = i.id;
      });
      clickTargets.push(i.object);
    };

    const glowMat = (color: number, intensity = 0.6) =>
      new THREE.MeshStandardMaterial({
        color: C.card,
        emissive: color,
        emissiveIntensity: intensity,
        roughness: 0.35,
        metalness: 0.2,
      });

    // edge light pillars at compass points
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.55, 22, 8, 1, true),
        new THREE.MeshBasicMaterial({
          color: C.accent,
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      pillar.position.set(Math.cos(a) * WORLD_RADIUS, 11, Math.sin(a) * WORLD_RADIUS);
      scene.add(pillar);
      addPulse(pillar.material, 0.16, 0.08, 0.8 + i * 0.13);
    }

    /* ── Stars ── */
    {
      const starGeo = new THREE.BufferGeometry();
      const n = 1200;
      const pos = new Float32Array(n * 3);
      const sizes = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const r = 200 + Math.random() * 180;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1) * 0.5;
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = 14 + Math.abs(r * Math.cos(phi)) * 0.65;
        pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        sizes[i] = Math.random();
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      scene.add(
        new THREE.Points(
          starGeo,
          new THREE.PointsMaterial({
            color: 0xc7cdf0,
            size: 0.9,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.85,
          }),
        ),
      );
    }

    /* ── Ambient drifting dust ── */
    const dust = (() => {
      const n = 320;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const r = Math.sqrt(Math.random()) * (WORLD_RADIUS + 10);
        const a = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = Math.random() * 36;
        pos[i * 3 + 2] = Math.sin(a) * r;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color: 0x6b7cff,
          size: 0.28,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      scene.add(pts);
      return geo;
    })();

    /* ── Decorative low-poly rocks ── */
    {
      const zoneCenters = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -80),
        new THREE.Vector3(82, 0, 0),
        new THREE.Vector3(0, 0, 84),
        new THREE.Vector3(-42, 0, 62),
        new THREE.Vector3(-88, 0, 0),
        new THREE.Vector3(58, 0, -52),
      ];
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x0b0e1a,
        emissive: C.accent,
        emissiveIntensity: 0.05,
        roughness: 0.9,
        flatShading: true,
      });
      for (let i = 0; i < 30; i++) {
        const r = 28 + Math.random() * 100;
        const a = Math.random() * Math.PI * 2;
        const p = new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
        if (zoneCenters.some((c) => p.distanceTo(c) < 24)) continue;
        const size = 0.8 + Math.random() * 2.2;
        const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), rockMat);
        rock.position.set(p.x, size * (0.5 + Math.random() * 1.6), p.z);
        rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        scene.add(rock);
        addFloater(rock, 0.15 + Math.random() * 0.25, 0.3 + Math.random() * 0.4);
        addSpinner(rock, (Math.random() - 0.5) * 0.3);
      }
    }

    /* ── Glowing chevron paths to each zone ── */
    {
      const chevTex = makeChevronTexture();
      textures.push(chevTex);
      const routes = [
        { to: new THREE.Vector3(0, 0, -80) },
        { to: new THREE.Vector3(82, 0, 0) },
        { to: new THREE.Vector3(0, 0, 84) },
        { to: new THREE.Vector3(-88, 0, 0) },
        { to: new THREE.Vector3(58, 0, -52) },
      ];
      routes.forEach(({ to }) => {
        const dir = to.clone().normalize();
        const angle = Math.atan2(dir.x, dir.z);
        for (let i = 0; i < 8; i++) {
          const d = 22 + i * 6.5;
          const mat = new THREE.MeshBasicMaterial({
            map: chevTex,
            color: C.accent,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const chev = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), mat);
          chev.position.set(dir.x * d, 0.08, dir.z * d);
          chev.rotation.x = -Math.PI / 2;
          chev.rotation.z = angle + Math.PI;
          scene.add(chev);
          pulses.push({ mat, base: 0.22, amp: 0.22, speed: 2.4, phase: -i * 0.55 });
        }
      });
    }

    /* ── Player ship ── */
    const player = new THREE.Group();
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 1), glowMat(C.accent, 1.3));
    player.add(core);
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.25, 0),
      new THREE.MeshBasicMaterial({ color: C.accentSoft, wireframe: true, transparent: true, opacity: 0.4 }),
    );
    player.add(shell);
    addSpinner(core, 1.4);
    addSpinner(shell, -0.9);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.07, 8, 48),
      new THREE.MeshBasicMaterial({ color: C.accentSoft, transparent: true, opacity: 0.9 }),
    );
    halo.rotation.x = Math.PI / 2;
    player.add(halo);
    addGlow(player, C.accent, 7, 0, 0.5);
    const playerLight = new THREE.PointLight(C.accent, 70, 30);
    playerLight.position.y = 2;
    player.add(playerLight);
    player.position.set(0, 1.6, 14);
    scene.add(player);

    // engine trail — line strip fading to black (additive)
    const TRAIL_N = 64;
    const trailGeo = new THREE.BufferGeometry();
    const trailPos = new Float32Array(TRAIL_N * 3);
    for (let i = 0; i < TRAIL_N; i++) {
      trailPos[i * 3] = player.position.x;
      trailPos[i * 3 + 1] = player.position.y;
      trailPos[i * 3 + 2] = player.position.z;
    }
    const trailCol = new Float32Array(TRAIL_N * 3);
    for (let i = 0; i < TRAIL_N; i++) {
      const f = Math.pow(i / (TRAIL_N - 1), 1.6); // head bright, tail dark
      const col = new THREE.Color(C.accentSoft).multiplyScalar(f);
      trailCol[i * 3] = col.r;
      trailCol[i * 3 + 1] = col.g;
      trailCol[i * 3 + 2] = col.b;
    }
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
    const trail = new THREE.Line(
      trailGeo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    trail.frustumCulled = false;
    scene.add(trail);

    // spawn pad
    [
      { r0: 2.4, r1: 3.4, op: 0.5 },
      { r0: 4.2, r1: 4.5, op: 0.25 },
    ].forEach(({ r0, r1, op }) => {
      const ringMat = new THREE.MeshBasicMaterial({
        color: C.accent,
        transparent: true,
        opacity: op,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 56), ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.05, 14);
      scene.add(ring);
      addPulse(ringMat, op, op * 0.5, 1.6);
    });

    /* ════════════ CENTER — hero / about ════════════ */

    const heroName = makeTextSprite("XDITYA.", { size: 9, color: "#F4F4EF", weight: 900 });
    heroName.position.set(0, 13, -16);
    scene.add(heroName);
    addFloater(heroName, 0.5, 0.6);

    const heroSub = makeTextSprite("FULL-STACK DEV — OPEN SOURCE — BOT BUILDER", {
      size: 1.2,
      color: "#97A3FF",
      weight: 500,
      spacing: 6,
    });
    heroSub.position.set(0, 7.6, -16);
    scene.add(heroSub);

    // slow rotating wireframe icosahedron backdrop
    const heroDeco = new THREE.Mesh(
      new THREE.IcosahedronGeometry(9, 1),
      new THREE.MeshBasicMaterial({ color: C.accent, wireframe: true, transparent: true, opacity: 0.14 }),
    );
    heroDeco.position.set(0, 18, -44);
    scene.add(heroDeco);
    addSpinner(heroDeco, 0.12);
    addFloater(heroDeco, 1.2, 0.3);

    // About monolith
    {
      const g = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(4.5, 7, 0.8), glowMat(C.accent, 0.3));
      slab.position.y = 3.5;
      g.add(slab);
      const slabEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(slab.geometry),
        new THREE.LineBasicMaterial({ color: C.accentSoft, transparent: true, opacity: 0.8 }),
      );
      slabEdges.position.copy(slab.position);
      g.add(slabEdges);
      addGlow(g, C.accent, 10, 0.4, 0.4);
      const lbl = makeTextSprite("ABOUT ME", { size: 1.1, color: "#97A3FF", weight: 700, spacing: 5 });
      lbl.position.y = 8.6;
      g.add(lbl);
      g.position.set(0, 0, -24);
      scene.add(g);
      addFloater(lbl, 0.25, 1.4);

      registerInteractable({
        id: "about",
        kind: "about",
        position: new THREE.Vector3(0, 0, -24),
        radius: 8,
        object: g,
        panel: {
          title: GAME_ABOUT.name,
          subtitle: `${GAME_ABOUT.role} · ${GAME_ABOUT.location} · ${GAME_ABOUT.age}y old`,
          body: `${GAME_STATEMENT} ${GAME_ABOUT.whatIDo}`,
          chips: ["Open Source", GAME_ABOUT.available],
          actions: [
            { label: "Full about page", href: "/about", internal: true },
            { label: "Resume ↓", href: GAME_ABOUT.resume },
          ],
        },
      });
    }

    /* ════════════ NORTH — projects archipelago ════════════ */

    const collectedSet = new Set<string>();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) (JSON.parse(raw) as string[]).forEach((n) => collectedSet.add(n));
    } catch {
      /* ignore */
    }

    const crystalByProject = new Map<string, { core: THREE.Mesh; shell: THREE.Mesh; glow: THREE.Sprite }>();

    {
      const zoneLabel = makeTextSprite("PROJECTS", { size: 3.2, color: "#6F7587", weight: 900, spacing: 8 });
      zoneLabel.position.set(0, 16, -92);
      scene.add(zoneLabel);

      const clusterR = 78;
      GAME_YEARS.forEach((year, yi) => {
        const angle = -Math.PI / 2 + (yi - (GAME_YEARS.length - 1) / 2) * 0.52;
        const cx = Math.cos(angle) * clusterR;
        const cz = Math.sin(angle) * clusterR;
        const projects = GAME_PROJECTS.filter((p) => p.year === year);

        const ringMat = new THREE.MeshBasicMaterial({
          color: C.accent,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(new THREE.RingGeometry(9, 9.5, 64), ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(cx, 0.06, cz);
        scene.add(ring);
        addPulse(ringMat, 0.26, 0.12, 1.2);

        const yearLbl = makeTextSprite(String(year), { size: 2.6, color: "#A3A8B3", weight: 900 });
        yearLbl.position.set(cx, 9, cz);
        scene.add(yearLbl);
        addFloater(yearLbl, 0.3, 0.9);

        projects.forEach((p, pi) => {
          const a = (pi / projects.length) * Math.PI * 2;
          const px = cx + Math.cos(a) * 6.2;
          const pz = cz + Math.sin(a) * 6.2;

          const g = new THREE.Group();
          const collected = collectedSet.has(p.name);
          const scale = p.featured ? 1.5 : 1.1;

          const cg = new THREE.Group();
          cg.position.y = 2.7;
          const crystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(scale),
            glowMat(collected ? C.accentSoft : C.accent, collected ? 1.6 : 0.4),
          );
          cg.add(crystal);
          const cShell = new THREE.Mesh(
            new THREE.OctahedronGeometry(scale * 1.45),
            new THREE.MeshBasicMaterial({
              color: collected ? C.accentSoft : C.accent,
              wireframe: true,
              transparent: true,
              opacity: collected ? 0.5 : 0.25,
            }),
          );
          cg.add(cShell);
          addSpinner(crystal, 0.8);
          addSpinner(cShell, -0.5);
          g.add(cg);
          addFloater(cg, 0.35, 1.3);

          const glowSprite = addGlow(g, collected ? C.accentSoft : 0x2334a0, 6.5, 0.35, collected ? 0.65 : 0.4);
          crystalByProject.set(p.name, { core: crystal, shell: cShell, glow: glowSprite });

          if (p.featured) {
            const beam = new THREE.Mesh(
              new THREE.CylinderGeometry(0.22, 0.34, 26, 8, 1, true),
              new THREE.MeshBasicMaterial({
                color: C.accent,
                transparent: true,
                opacity: 0.14,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide,
              }),
            );
            beam.position.y = 13;
            g.add(beam);
          }

          const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 1, 0.5, 6),
            new THREE.MeshStandardMaterial({ color: C.card, roughness: 0.8 }),
          );
          base.position.y = 0.25;
          g.add(base);

          const nameLbl = makeTextSprite(p.name, { size: 0.85, color: "#F4F4EF", weight: 700 });
          nameLbl.position.y = 4.9;
          g.add(nameLbl);

          g.position.set(px, 0, pz);
          scene.add(g);

          const stat = p.users
            ? `${p.users} users`
            : p.stars
              ? `★ ${p.stars >= 1000 ? `${Math.round(p.stars / 1000)}K` : p.stars}+`
              : null;

          registerInteractable({
            id: `project:${p.name}`,
            kind: "project",
            position: new THREE.Vector3(px, 0, pz),
            radius: 5,
            object: g,
            panel: {
              title: p.name,
              subtitle: `${p.year}${stat ? ` — ${stat}` : ""} · ${p.tagline}`,
              body: p.description,
              chips: p.tech,
              actions: [
                { label: "GitHub ↗", href: p.github },
                ...(p.url ? [{ label: "Live ↗", href: p.url }] : []),
              ],
              collected,
            },
          });
        });
      });
    }

    /* ════════════ EAST — experience towers ════════════ */

    {
      const zoneLabel = makeTextSprite("EXPERIENCE", { size: 3, color: "#6F7587", weight: 900, spacing: 8 });
      zoneLabel.position.set(96, 18, 0);
      scene.add(zoneLabel);

      GAME_EXPERIENCE.forEach((exp, i) => {
        const h = 7 + (GAME_EXPERIENCE.length - i) * 2.4;
        const x = 82;
        const z = (i - (GAME_EXPERIENCE.length - 1) / 2) * 16;

        const g = new THREE.Group();
        const towerTex = makeTowerTexture(exp.current ? "#5d70ff" : "#39466e");
        textures.push(towerTex);
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(5.5, h, 5.5),
          new THREE.MeshStandardMaterial({
            color: 0xbfc4d8,
            map: towerTex,
            emissive: 0xffffff,
            emissiveMap: towerTex,
            emissiveIntensity: exp.current ? 0.65 : 0.4,
            roughness: 0.7,
          }),
        );
        tower.position.y = h / 2;
        g.add(tower);
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(tower.geometry),
          new THREE.LineBasicMaterial({
            color: exp.current ? C.accentSoft : 0x39415c,
            transparent: true,
            opacity: 0.9,
          }),
        );
        edges.position.copy(tower.position);
        g.add(edges);

        if (exp.current) {
          // antenna with blinking beacon on the current employer's tower
          const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 3.2, 6),
            new THREE.MeshBasicMaterial({ color: 0x39415c }),
          );
          mast.position.y = h + 1.6;
          g.add(mast);
          const tip = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 12, 12),
            new THREE.MeshBasicMaterial({ color: C.accentSoft, transparent: true, opacity: 1 }),
          );
          tip.position.y = h + 3.3;
          g.add(tip);
          addPulse(tip.material, 0.7, 0.5, 4);
          addGlow(g, C.accent, 9, 0.4, 0.35);
        }

        const lbl = makeTextSprite(`${exp.company}\n${exp.period}`, {
          size: 1,
          color: exp.current ? "#97A3FF" : "#A3A8B3",
          weight: 700,
        });
        lbl.position.y = h + (exp.current ? 5.6 : 2.6);
        g.add(lbl);
        addFloater(lbl, 0.25, 1.1);

        g.position.set(x, 0, z);
        scene.add(g);

        registerInteractable({
          id: `exp:${exp.company}`,
          kind: "experience",
          position: new THREE.Vector3(x, 0, z),
          radius: 7.5,
          object: g,
          panel: {
            title: exp.title,
            subtitle: `${exp.company} · ${exp.period}${exp.current ? " · NOW" : ""}`,
            body: exp.description,
            actions: [{ label: "Full about page", href: "/about", internal: true }],
          },
        });
      });
    }

    /* ════════════ SOUTH — stats plaza + tech garden ════════════ */

    const statCounters: {
      draw: (v: number) => void;
      target: number;
      started: number;
      done: boolean;
      position: THREE.Vector3;
    }[] = [];

    {
      const zoneLabel = makeTextSprite("STATS", { size: 3, color: "#6F7587", weight: 900, spacing: 8 });
      zoneLabel.position.set(0, 16, 96);
      scene.add(zoneLabel);

      GAME_STATS.forEach((s, i) => {
        const x = (i - (GAME_STATS.length - 1) / 2) * 14;
        const z = 84;
        const g = new THREE.Group();

        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(2.2, 2.6, 4, 6),
          glowMat(C.accent, 0.25),
        );
        pillar.position.y = 2;
        g.add(pillar);
        const pillarEdges = new THREE.LineSegments(
          new THREE.EdgesGeometry(pillar.geometry),
          new THREE.LineBasicMaterial({ color: C.accentSoft, transparent: true, opacity: 0.5 }),
        );
        pillarEdges.position.copy(pillar.position);
        g.add(pillarEdges);
        addGlow(g, C.accent, 8, 0.3, 0.3);

        const counter = makeCounterSprite(s.suffix, 3);
        counter.sprite.position.y = 6.6;
        g.add(counter.sprite);
        addFloater(counter.sprite, 0.25, 1);

        const lbl = makeTextSprite(s.label.toUpperCase(), {
          size: 0.9,
          color: "#6F7587",
          weight: 600,
          spacing: 4,
        });
        lbl.position.y = 4.6;
        g.add(lbl);

        g.position.set(x, 0, z);
        scene.add(g);

        statCounters.push({
          draw: counter.draw,
          target: s.value,
          started: 0,
          done: false,
          position: new THREE.Vector3(x, 0, z),
        });
      });

      registerInteractable({
        id: "stats",
        kind: "stat",
        position: new THREE.Vector3(0, 0, 84),
        radius: 16,
        object: new THREE.Group(),
        panel: {
          title: "By the numbers",
          subtitle: "GitHub · since 2020",
          body: GAME_STATS.map((s) => `${s.label}: ${s.value}${s.suffix}`).join("  ·  "),
          actions: [{ label: "GitHub profile ↗", href: "https://github.com/xditya" }],
        },
      });

      // Tech garden — colored orbs on pedestals
      const techLabel = makeTextSprite("TECH STACK", { size: 1.6, color: "#6F7587", weight: 900, spacing: 6 });
      techLabel.position.set(-42, 9, 62);
      scene.add(techLabel);

      GAME_TECH_STACK.forEach((t, i) => {
        const a = (i / GAME_TECH_STACK.length) * Math.PI * 2;
        const x = -42 + Math.cos(a) * 7;
        const z = 62 + Math.sin(a) * 7;
        const col = new THREE.Color(t.color);
        const g = new THREE.Group();
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(1, 24, 24),
          new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.65,
            roughness: 0.4,
          }),
        );
        orb.position.y = 3;
        g.add(orb);
        addFloater(orb, 0.3, 1.2 + i * 0.1);
        addGlow(g, col.getHex(), 4.5, 3, 0.45);
        const ped = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.7, 1.6, 6),
          new THREE.MeshStandardMaterial({ color: C.card, roughness: 0.8 }),
        );
        ped.position.y = 0.8;
        g.add(ped);
        const lbl = makeTextSprite(t.name, { size: 0.75, color: "#A3A8B3", weight: 600 });
        lbl.position.y = 5;
        g.add(lbl);
        g.position.set(x, 0, z);
        scene.add(g);
      });

      registerInteractable({
        id: "tech",
        kind: "tech",
        position: new THREE.Vector3(-42, 0, 62),
        radius: 11,
        object: new THREE.Group(),
        panel: {
          title: "Tech Stack",
          subtitle: "Tools of the trade",
          body: GAME_ABOUT.howIWork,
          chips: GAME_TECH_STACK.map((t) => t.name),
          actions: [{ label: "Full about page", href: "/about", internal: true }],
        },
      });
    }

    /* ════════════ WEST — portals (socials + links) ════════════ */

    {
      const zoneLabel = makeTextSprite("PORTALS", { size: 3, color: "#6F7587", weight: 900, spacing: 8 });
      zoneLabel.position.set(-96, 18, 0);
      scene.add(zoneLabel);

      const makePortal = (
        x: number,
        z: number,
        color: string,
        label: string,
        sub: string,
        id: string,
        kind: string,
        panelBody: string,
        actions: Action[],
      ) => {
        const g = new THREE.Group();
        const col = new THREE.Color(color);
        const torus = new THREE.Mesh(
          new THREE.TorusGeometry(2.4, 0.16, 12, 48),
          new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.85,
            roughness: 0.3,
          }),
        );
        torus.position.y = 3.4;
        torus.rotation.y = Math.PI / 2;
        g.add(torus);
        addFloater(torus, 0.25, 1);

        const discMat = new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const disc = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32), discMat);
        disc.position.y = 3.4;
        disc.rotation.y = Math.PI / 2;
        g.add(disc);
        addPulse(discMat, 0.14, 0.08, 1.8);
        addGlow(g, col.getHex(), 7, 3.4, 0.4);

        // orbiting spark particles around the ring
        const sparkN = 10;
        const sparkGeo = new THREE.BufferGeometry();
        sparkGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sparkN * 3), 3));
        const sparks = new THREE.Points(
          sparkGeo,
          new THREE.PointsMaterial({
            color: col,
            size: 0.32,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        sparks.frustumCulled = false;
        scene.add(sparks);
        orbiters.push({
          geo: sparkGeo,
          center: new THREE.Vector3(x, 3.4, z),
          radius: 2.4,
          speed: 1.4,
          phase: Math.random() * Math.PI * 2,
          count: sparkN,
          plane: "yz",
        });

        const lbl = makeTextSprite(label, { size: 0.95, color: "#F4F4EF", weight: 700 });
        lbl.position.y = 6.8;
        g.add(lbl);

        g.position.set(x, 0, z);
        scene.add(g);

        registerInteractable({
          id,
          kind,
          position: new THREE.Vector3(x, 0, z),
          radius: 4.5,
          object: g,
          panel: { title: label, subtitle: sub, body: panelBody, actions },
        });
      };

      GAME_SOCIALS.forEach((s, i) => {
        const z = (i - (GAME_SOCIALS.length - 1) / 2) * 11;
        makePortal(
          -78,
          z,
          s.color,
          s.label,
          "Social portal",
          `social:${s.label}`,
          "social",
          `Find me on ${s.label}.`,
          [{ label: `Open ${s.label} ↗`, href: s.href }],
        );
      });

      GAME_LINKS.forEach((l, i) => {
        const z = (i - (GAME_LINKS.length - 1) / 2) * 11;
        makePortal(
          -98,
          z,
          "#97A3FF",
          l.name,
          l.external ? "Tool · external" : "Internal page",
          `link:${l.name}`,
          "link",
          l.description,
          [{ label: `Open ↗`, href: l.href, internal: !l.external }],
        );
      });
    }

    /* ════════════ NE — contact beacon ════════════ */

    let beaconRingsRef: { mesh: THREE.Mesh; offset: number }[] = [];
    {
      const g = new THREE.Group();
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.9, 70, 12, 1, true),
        new THREE.MeshBasicMaterial({
          color: C.accent,
          transparent: true,
          opacity: 0.38,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      beam.position.y = 35;
      g.add(beam);
      const baseCone = new THREE.Mesh(new THREE.ConeGeometry(3, 5, 6), glowMat(C.accent, 0.9));
      baseCone.position.y = 2.5;
      g.add(baseCone);
      addGlow(g, C.accent, 12, 0.5, 0.5);
      const lbl = makeTextSprite("CONTACT", { size: 1.4, color: "#97A3FF", weight: 900, spacing: 6 });
      lbl.position.y = 9.5;
      g.add(lbl);
      addFloater(lbl, 0.3, 1.2);
      g.position.set(58, 0, -52);
      scene.add(g);

      // rising pulse rings around the beam
      const beaconRings: { mesh: THREE.Mesh; offset: number }[] = [];
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.6, 0.07, 8, 32),
          new THREE.MeshBasicMaterial({
            color: C.accentSoft,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(58, 0, -52);
        scene.add(ring);
        beaconRings.push({ mesh: ring, offset: i / 3 });
      }
      // animated in the loop via closure
      beaconRingsRef = beaconRings;

      registerInteractable({
        id: "contact",
        kind: "contact",
        position: new THREE.Vector3(58, 0, -52),
        radius: 9,
        object: g,
        panel: {
          title: "Get in touch",
          subtitle: `${GAME_ABOUT.available} — ${GAME_ABOUT.location}`,
          body: "Have a project in mind, or just want to say hi? Reach out via the contact form or email.",
          chips: [GAME_ABOUT.email],
          actions: [
            { label: "Contact form", href: "/contact", internal: true },
            { label: "Email ↗", href: `mailto:${GAME_ABOUT.email}` },
          ],
        },
      });
    }

    /* ── Signposts near spawn ── */
    [
      { t: "PROJECTS", p: new THREE.Vector3(0, 2.2, -8) },
      { t: "EXPERIENCE", p: new THREE.Vector3(12, 2.2, 2) },
      { t: "STATS + TECH", p: new THREE.Vector3(0, 2.2, 26) },
      { t: "PORTALS", p: new THREE.Vector3(-12, 2.2, 2) },
    ].forEach(({ t, p }) => {
      const s = makeTextSprite(t, { size: 0.8, color: "#6F7587", weight: 600, spacing: 4, opacity: 0.9 });
      s.position.copy(p);
      scene.add(s);
    });

    /* ─────────────── Input ─────────────── */

    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) {
        e.preventDefault();
      }
      if (k === "e" || k === "enter") {
        interactRef.current?.();
        return;
      }
      keys.add(k);
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    /* ── Click / tap raycast ── */
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downAt = 0;
    let downPos = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      downAt = performance.now();
      downPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!startedRef.current) return;
      const dt = performance.now() - downAt;
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dt > 400 || moved > 12) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(clickTargets, true);
      if (!hits.length) return;
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && !obj.userData.iid) obj = obj.parent;
      if (!obj) return;
      const target = interactables.find((i) => i.id === obj!.userData.iid);
      if (!target) return;
      const dist = player.position.distanceTo(target.position);
      if (dist <= target.radius * 1.6) {
        runFirstAction(target);
      } else {
        setToast(`TOO FAR — FLY CLOSER TO ${target.panel.title.toUpperCase()}`);
        setTimeout(() => setToast(null), 1800);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    /* ─────────────── HUD wiring ─────────────── */

    let activeId: string | null = null;
    let lastPanelKey = "";
    let lastZone = "";

    const emitPanel = (i: Interactable | null) => {
      if (!i) {
        if (activeId !== null) {
          activeId = null;
          lastPanelKey = "";
          setPanel(null);
        }
        return;
      }
      const collected = i.kind === "project" ? collectedSet.has(i.panel.title) : undefined;
      const key = `${i.id}:${collected ?? "-"}`;
      if (key !== lastPanelKey) {
        activeId = i.id;
        lastPanelKey = key;
        setPanel({ id: i.id, kind: i.kind, ...i.panel, collected });
      }
    };

    const runFirstAction = (i: Interactable) => {
      const a = i.panel.actions[0];
      if (!a) return;
      trackEvent("game_interact", { target: i.id, link_url: a.href });
      if (a.internal) router.push(a.href);
      else window.open(a.href, "_blank", "noopener,noreferrer");
    };

    interactRef.current = () => {
      if (!activeId) return;
      const i = interactables.find((x) => x.id === activeId);
      if (i) runFirstAction(i);
    };

    setDiscovered(GAME_PROJECTS.filter((p) => collectedSet.has(p.name)).length);

    const spawnBurst = (at: THREE.Vector3, color: number) => {
      const n = 42;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      const velocities: THREE.Vector3[] = [];
      for (let i = 0; i < n; i++) {
        pos[i * 3] = at.x;
        pos[i * 3 + 1] = at.y;
        pos[i * 3 + 2] = at.z;
        const v = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 1.6 + 0.4,
          (Math.random() - 0.5) * 2,
        ).multiplyScalar(6 + Math.random() * 6);
        velocities.push(v);
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const points = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color,
          size: 0.4,
          transparent: true,
          opacity: 1,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      scene.add(points);
      bursts.push({ points, velocities, born: performance.now() });
    };

    const collectProject = (i: Interactable) => {
      const name = i.panel.title;
      if (collectedSet.has(name)) return;
      collectedSet.add(name);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...collectedSet]));
      } catch {
        /* ignore */
      }
      const c = crystalByProject.get(name);
      if (c) {
        const m = c.core.material as THREE.MeshStandardMaterial;
        m.emissive = new THREE.Color(C.accentSoft);
        m.emissiveIntensity = 1.6;
        (c.shell.material as THREE.MeshBasicMaterial).color = new THREE.Color(C.accentSoft);
        (c.shell.material as THREE.MeshBasicMaterial).opacity = 0.5;
        c.glow.material.color = new THREE.Color(C.accentSoft);
        c.glow.material.opacity = 0.65;
      }
      spawnBurst(i.position.clone().setY(3), C.accentSoft);
      const count = GAME_PROJECTS.filter((p) => collectedSet.has(p.name)).length;
      setDiscovered(count);
      trackEvent("game_project_discovered", { project: name, progress: count });
      if (count === GAME_PROJECTS.length) {
        setToast(`🏆 ACHIEVEMENT — ALL ${GAME_PROJECTS.length} PROJECTS DISCOVERED!`);
        setTimeout(() => setToast(null), 6000);
        spawnBurst(player.position.clone().setY(3), C.ink);
        trackEvent("game_completed", {});
      } else {
        setToast(`DISCOVERED — ${name} (${count}/${GAME_PROJECTS.length})`);
        setTimeout(() => setToast(null), 2600);
      }
    };

    const zoneFor = (p: THREE.Vector3): string => {
      const zones: { name: string; c: THREE.Vector3; r: number }[] = [
        { name: "PROJECTS ARCHIPELAGO", c: new THREE.Vector3(0, 0, -80), r: 50 },
        { name: "EXPERIENCE TOWERS", c: new THREE.Vector3(82, 0, 0), r: 42 },
        { name: "STATS PLAZA", c: new THREE.Vector3(0, 0, 84), r: 36 },
        { name: "TECH GARDEN", c: new THREE.Vector3(-42, 0, 62), r: 18 },
        { name: "PORTAL FIELD", c: new THREE.Vector3(-88, 0, 0), r: 42 },
        { name: "CONTACT BEACON", c: new THREE.Vector3(58, 0, -52), r: 20 },
        { name: "SPAWN — HOME", c: new THREE.Vector3(0, 0, 0), r: 30 },
      ];
      for (const z of zones) if (p.distanceTo(z.c) < z.r) return z.name;
      return "THE GRID";
    };

    /* ─────────────── Game loop ─────────────── */

    const vel = new THREE.Vector3();
    const camTarget = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      /* movement */
      if (startedRef.current) {
        const dir = new THREE.Vector3();
        if (keys.has("w") || keys.has("arrowup")) dir.z -= 1;
        if (keys.has("s") || keys.has("arrowdown")) dir.z += 1;
        if (keys.has("a") || keys.has("arrowleft")) dir.x -= 1;
        if (keys.has("d") || keys.has("arrowright")) dir.x += 1;
        dir.x += joyRef.current.x;
        dir.z += joyRef.current.y;
        if (dir.lengthSq() > 1) dir.normalize();
        const boost = keys.has("shift") ? 1.8 : 1;
        vel.addScaledVector(dir, 130 * boost * dt);
      }
      vel.multiplyScalar(Math.pow(0.0035, dt));
      player.position.addScaledVector(vel, dt);

      const flat = new THREE.Vector2(player.position.x, player.position.z);
      if (flat.length() > WORLD_RADIUS) {
        flat.setLength(WORLD_RADIUS);
        player.position.x = flat.x;
        player.position.z = flat.y;
        vel.multiplyScalar(0.4);
      }

      /* player visuals */
      player.position.y = 1.6 + Math.sin(t * 2.2) * 0.18;
      halo.rotation.z += dt * 0.8;
      player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -vel.x * 0.012, 0.1);
      player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, vel.z * 0.012, 0.1);

      /* trail: shift ring buffer toward tail, head = player */
      const tp = trailGeo.getAttribute("position") as THREE.BufferAttribute;
      const arr = tp.array as Float32Array;
      arr.copyWithin(0, 3);
      arr[(TRAIL_N - 1) * 3] = player.position.x;
      arr[(TRAIL_N - 1) * 3 + 1] = player.position.y - 0.2;
      arr[(TRAIL_N - 1) * 3 + 2] = player.position.z;
      tp.needsUpdate = true;

      /* camera follow */
      camTarget.set(
        player.position.x + vel.x * 0.25,
        player.position.y + 13,
        player.position.z + 18 + vel.z * 0.2,
      );
      camera.position.lerp(camTarget, 1 - Math.pow(0.001, dt));
      camera.lookAt(player.position.x, player.position.y + 1.5, player.position.z);

      /* animation registries */
      for (const f of floaters) {
        f.obj.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * f.amp;
      }
      for (const s of spinners) {
        s.obj.rotation[s.axis] += s.speed * dt;
      }
      for (const p of pulses) {
        p.mat.opacity = p.base + Math.sin(t * p.speed + p.phase) * p.amp;
      }
      for (const o of orbiters) {
        const pa = o.geo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < o.count; i++) {
          const a = o.phase + t * o.speed + (i / o.count) * Math.PI * 2;
          if (o.plane === "yz") {
            pa.setXYZ(i, o.center.x, o.center.y + Math.cos(a) * o.radius, o.center.z + Math.sin(a) * o.radius);
          } else {
            pa.setXYZ(i, o.center.x + Math.cos(a) * o.radius, o.center.y, o.center.z + Math.sin(a) * o.radius);
          }
        }
        pa.needsUpdate = true;
      }

      /* beacon rings rise & fade */
      for (const { mesh, offset } of beaconRingsRef) {
        const prog = ((t * 0.25 + offset) % 1 + 1) % 1;
        mesh.position.y = 2 + prog * 46;
        const sc = 1 + prog * 1.6;
        mesh.scale.set(sc, sc, sc);
        (mesh.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - prog);
      }

      /* dust drift */
      {
        const pa = dust.getAttribute("position") as THREE.BufferAttribute;
        const a = pa.array as Float32Array;
        for (let i = 0; i < a.length; i += 3) {
          a[i + 1] += dt * 0.7;
          if (a[i + 1] > 38) a[i + 1] = 0;
        }
        pa.needsUpdate = true;
      }

      /* nearest interactable */
      if (startedRef.current) {
        let best: Interactable | null = null;
        let bestD = Infinity;
        for (const i of interactables) {
          const d = player.position.distanceTo(i.position);
          if (d < i.radius && d < bestD) {
            best = i;
            bestD = d;
          }
        }
        if (best && best.kind === "project") collectProject(best);
        emitPanel(best);

        const zn = zoneFor(player.position);
        if (zn !== lastZone) {
          lastZone = zn;
          setZone(zn);
        }
      }

      /* stat count-ups */
      for (const sc of statCounters) {
        if (sc.done) continue;
        if (!sc.started && player.position.distanceTo(sc.position) < 22) {
          sc.started = performance.now();
        }
        if (sc.started) {
          const p = Math.min((performance.now() - sc.started) / 1600, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          sc.draw(Math.floor(ease * sc.target));
          if (p >= 1) sc.done = true;
        }
      }

      /* bursts */
      for (let bi = bursts.length - 1; bi >= 0; bi--) {
        const b = bursts[bi];
        const age = (performance.now() - b.born) / 1000;
        if (age > 1.1) {
          scene.remove(b.points);
          b.points.geometry.dispose();
          (b.points.material as THREE.Material).dispose();
          bursts.splice(bi, 1);
          continue;
        }
        const posAttr = b.points.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < b.velocities.length; i++) {
          b.velocities[i].y -= 18 * dt;
          posAttr.setXYZ(
            i,
            posAttr.getX(i) + b.velocities[i].x * dt,
            posAttr.getY(i) + b.velocities[i].y * dt,
            posAttr.getZ(i) + b.velocities[i].z * dt,
          );
        }
        posAttr.needsUpdate = true;
        (b.points.material as THREE.PointsMaterial).opacity = 1 - age / 1.1;
      }

      composer.render();
    };
    loop();

    /* ── Resize ── */
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloom.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      interactRef.current = null;
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      textures.forEach((tx) => tx.dispose());
      composer.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [router]);

  const startGame = () => {
    setStarted(true);
    setShowHelp(false);
    trackEvent("game_start", {});
  };

  /* ─────────────────────── HUD / overlays ─────────────────────── */

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {/* vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(3,4,8,0.6) 100%)",
        }}
      />

      {/* Zone label */}
      {started && (
        <div
          className="mono-label"
          style={{
            position: "absolute",
            top: "84px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "var(--muted)",
            letterSpacing: "0.2em",
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          {zone}
        </div>
      )}

      {/* Progress */}
      {started && (
        <div
          style={{
            position: "absolute",
            top: "84px",
            right: "clamp(16px, 4vw, 40px)",
            textAlign: "right",
            pointerEvents: "none",
          }}
        >
          <div className="mono-label" style={{ color: "var(--ink-dim)" }}>
            PROJECTS {discovered}/{totalProjects}
          </div>
          <div
            style={{
              width: "140px",
              height: "3px",
              background: "var(--line-strong)",
              marginTop: "8px",
              marginLeft: "auto",
            }}
          >
            <div
              style={{
                width: `${(discovered / totalProjects) * 100}%`,
                height: "100%",
                background: "var(--accent)",
                transition: "width 400ms ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Help button */}
      {started && (
        <button
          onClick={() => setShowHelp((v) => !v)}
          aria-label="Game help"
          style={{
            position: "absolute",
            top: "84px",
            left: "clamp(16px, 4vw, 40px)",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: "1px solid var(--line-strong)",
            background: "rgba(5,6,10,0.7)",
            color: "var(--ink-dim)",
            fontFamily: "var(--font-mono-stack)",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          ?
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="mono-sm"
          style={{
            position: "absolute",
            top: "140px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(13,16,24,0.92)",
            border: "1px solid var(--accent)",
            color: "var(--accent-soft)",
            padding: "10px 22px",
            letterSpacing: "0.1em",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            maxWidth: "90vw",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {toast}
        </div>
      )}

      {/* Info panel */}
      {started && panel && (
        <div
          style={{
            position: "absolute",
            bottom: isTouch ? "120px" : "28px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(560px, calc(100vw - 32px))",
            background: "rgba(10,12,18,0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--line-strong)",
            padding: "18px 22px",
            zIndex: 5,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "20px",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              {panel.title}
            </span>
            {panel.kind === "project" && (
              <span className="mono-sm" style={{ color: "var(--accent-soft)", whiteSpace: "nowrap" }}>
                {panel.collected ? "✓ DISCOVERED" : "NEW"}
              </span>
            )}
          </div>
          {panel.subtitle && (
            <div className="mono-sm" style={{ color: "var(--accent-soft)", marginTop: "4px" }}>
              {panel.subtitle}
            </div>
          )}
          {panel.body && (
            <p style={{ color: "var(--ink-dim)", fontSize: "14px", lineHeight: 1.5, margin: "10px 0 0" }}>
              {panel.body}
            </p>
          )}
          {panel.chips && panel.chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
              {panel.chips.map((c) => (
                <span key={c} className="chip" style={{ fontSize: "11px", padding: "4px 10px" }}>
                  {c}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "14px", alignItems: "center" }}>
            {panel.actions.map((a, idx) => (
              <button
                key={a.label}
                onClick={() => {
                  trackEvent("game_interact", { target: panel.id, link_url: a.href });
                  if (a.internal) router.push(a.href);
                  else window.open(a.href, "_blank", "noopener,noreferrer");
                }}
                className="mono-sm"
                style={{
                  background: idx === 0 ? "var(--accent)" : "transparent",
                  color: idx === 0 ? "#fff" : "var(--ink-dim)",
                  border: idx === 0 ? "1px solid var(--accent)" : "1px solid var(--line-strong)",
                  padding: "8px 16px",
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {a.label}
              </button>
            ))}
            {!isTouch && (
              <span className="mono-sm" style={{ color: "var(--muted)" }}>
                or press <b style={{ color: "var(--ink-dim)" }}>E</b>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Touch controls */}
      {started && isTouch && (
        <>
          <Joystick vecRef={joyRef} />
          {panel && (
            <button
              onClick={() => interactRef.current?.()}
              style={{
                position: "absolute",
                right: "28px",
                bottom: "44px",
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                border: "1px solid var(--accent)",
                background: "rgba(77,98,255,0.25)",
                color: "var(--ink)",
                fontFamily: "var(--font-mono-stack)",
                fontSize: "13px",
                letterSpacing: "0.1em",
                zIndex: 6,
              }}
            >
              GO
            </button>
          )}
        </>
      )}

      {/* Intro / help overlay */}
      {(!started || showHelp) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background: "rgba(5,6,10,0.82)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div style={{ maxWidth: "520px", textAlign: "center" }}>
            <p className="mono-label" style={{ color: "var(--accent-soft)", marginBottom: "18px" }}>
              PORTFOLIO — PLAYABLE EDITION
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(36px, 8vw, 64px)",
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                lineHeight: 1,
                marginBottom: "20px",
              }}
            >
              Enter the
              <br />
              <span style={{ color: "var(--accent)" }}>Grid</span>
            </h1>
            <p style={{ color: "var(--ink-dim)", fontSize: "15px", lineHeight: 1.6, marginBottom: "26px" }}>
              Pilot the orb through my portfolio world. Discover all{" "}
              {totalProjects} project crystals, climb the experience towers,
              charge the stat pillars, and jump through portals to my socials
              and tools.
            </p>
            <div
              className="mono-sm"
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "8px 18px",
                textAlign: "left",
                width: "fit-content",
                margin: "0 auto 30px",
                color: "var(--muted)",
              }}
            >
              <span style={{ color: "var(--ink-dim)" }}>{isTouch ? "JOYSTICK" : "WASD / ↑↓←→"}</span>
              <span>move</span>
              <span style={{ color: "var(--ink-dim)" }}>{isTouch ? "GO BUTTON / TAP" : "E / CLICK"}</span>
              <span>interact · open links</span>
              {!isTouch && (
                <>
                  <span style={{ color: "var(--ink-dim)" }}>SHIFT</span>
                  <span>boost</span>
                </>
              )}
            </div>
            <button
              onClick={startGame}
              className="btn-fill"
              style={{ cursor: "pointer", border: "none", fontSize: "14px" }}
            >
              {started ? "Resume" : "Start Exploring"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Touch joystick ─────────────────── */

function Joystick({ vecRef }: { vecRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activeId = useRef<number | null>(null);

  const update = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = (clientX - cx) / (rect.width / 2);
    let dy = (clientY - cy) / (rect.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    vecRef.current = { x: dx, y: dy };
    setKnob({ x: dx * 34, y: dy * 34 });
  };

  const reset = () => {
    activeId.current = null;
    vecRef.current = { x: 0, y: 0 };
    setKnob({ x: 0, y: 0 });
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={(e) => {
        activeId.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (activeId.current === e.pointerId) update(e.clientX, e.clientY);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
      style={{
        position: "absolute",
        left: "28px",
        bottom: "36px",
        width: "110px",
        height: "110px",
        borderRadius: "50%",
        border: "1px solid var(--line-strong)",
        background: "rgba(13,16,24,0.5)",
        touchAction: "none",
        zIndex: 6,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(77,98,255,0.55)",
          border: "1px solid var(--accent-soft)",
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
