"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
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
  onEnter?: () => void;
};

type Floater = {
  obj: THREE.Object3D;
  baseY: number;
  amp: number;
  speed: number;
  phase: number;
  spin: number;
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
      // manual letter-spacing
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
    ctx.fillStyle = "#4D62FF";
    ctx.fillText(suffix, -tw / 2 + lw + (tw - lw) / 2, 0);
    ctx.restore();
    texture.needsUpdate = true;
  };
  draw(0);
  return { sprite, draw };
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

    /* ── Renderer / scene / camera ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.bg);
    scene.fog = new THREE.Fog(C.bg, 70, 240);

    const camera = new THREE.PerspectiveCamera(
      58,
      mount.clientWidth / mount.clientHeight,
      0.1,
      500,
    );
    camera.position.set(0, 14, 22);

    scene.add(new THREE.AmbientLight(0x8890b8, 0.55));
    const keyLight = new THREE.DirectionalLight(0xc9cfff, 0.9);
    keyLight.position.set(40, 80, 30);
    scene.add(keyLight);

    /* ── Ground ── */
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(WORLD_RADIUS + 60, 64),
      new THREE.MeshStandardMaterial({ color: 0x07080d, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);

    const grid = new THREE.GridHelper(360, 72, C.accent, 0x141a2e);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);

    // world edge ring
    const edge = new THREE.Mesh(
      new THREE.TorusGeometry(WORLD_RADIUS, 0.25, 8, 128),
      new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0.5 }),
    );
    edge.rotation.x = Math.PI / 2;
    edge.position.y = 0.3;
    scene.add(edge);

    /* ── Stars ── */
    {
      const starGeo = new THREE.BufferGeometry();
      const n = 900;
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const r = 180 + Math.random() * 160;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1) * 0.5; // upper hemisphere bias
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = 10 + Math.abs(r * Math.cos(phi)) * 0.6;
        pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      scene.add(
        new THREE.Points(
          starGeo,
          new THREE.PointsMaterial({ color: 0x9aa4c8, size: 0.7, sizeAttenuation: true }),
        ),
      );
    }

    /* ── Bookkeeping ── */
    const floaters: Floater[] = [];
    const interactables: Interactable[] = [];
    const clickTargets: THREE.Object3D[] = [];
    const bursts: Burst[] = [];
    const disposables: { dispose: () => void }[] = [];

    const addFloater = (obj: THREE.Object3D, amp = 0.4, speed = 1, spin = 0) => {
      floaters.push({
        obj,
        baseY: obj.position.y,
        amp,
        speed,
        phase: Math.random() * Math.PI * 2,
        spin,
      });
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

    /* ── Player ship ── */
    const player = new THREE.Group();
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), glowMat(C.accent, 1.1));
    player.add(core);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.08, 8, 48),
      new THREE.MeshBasicMaterial({ color: C.accentSoft, transparent: true, opacity: 0.85 }),
    );
    halo.rotation.x = Math.PI / 2;
    player.add(halo);
    const playerLight = new THREE.PointLight(C.accent, 60, 26);
    playerLight.position.y = 2;
    player.add(playerLight);
    player.position.set(0, 1.6, 14);
    scene.add(player);

    // landing pad at spawn
    const pad = new THREE.Mesh(
      new THREE.RingGeometry(2.4, 3.4, 48),
      new THREE.MeshBasicMaterial({
        color: C.accent,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, 0.05, 14);
    scene.add(pad);

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

    // About monolith
    {
      const g = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(4.5, 7, 0.8), glowMat(C.accent, 0.25));
      slab.position.y = 3.5;
      g.add(slab);
      const slabEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(slab.geometry),
        new THREE.LineBasicMaterial({ color: C.accentSoft, transparent: true, opacity: 0.7 }),
      );
      slabEdges.position.copy(slab.position);
      g.add(slabEdges);
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

    const crystalByProject = new Map<string, THREE.Mesh>();

    {
      const zoneLabel = makeTextSprite("PROJECTS", { size: 3.2, color: "#5F6470", weight: 900, spacing: 8 });
      zoneLabel.position.set(0, 16, -92);
      scene.add(zoneLabel);

      const clusterR = 78;
      GAME_YEARS.forEach((year, yi) => {
        const angle = -Math.PI / 2 + (yi - (GAME_YEARS.length - 1) / 2) * 0.52;
        const cx = Math.cos(angle) * clusterR;
        const cz = Math.sin(angle) * clusterR;
        const projects = GAME_PROJECTS.filter((p) => p.year === year);

        // year ring + label
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(9, 9.6, 48),
          new THREE.MeshBasicMaterial({
            color: C.accent,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
          }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(cx, 0.06, cz);
        scene.add(ring);

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
          const crystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(p.featured ? 1.6 : 1.15),
            glowMat(collected ? C.accentSoft : C.accent, collected ? 1.4 : 0.35),
          );
          crystal.position.y = 2.6;
          g.add(crystal);
          crystalByProject.set(p.name, crystal);

          const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 1, 0.5, 6),
            new THREE.MeshStandardMaterial({ color: C.card, roughness: 0.8 }),
          );
          base.position.y = 0.25;
          g.add(base);

          const nameLbl = makeTextSprite(p.name, { size: 0.85, color: "#F4F4EF", weight: 700 });
          nameLbl.position.y = 4.6;
          g.add(nameLbl);

          g.position.set(px, 0, pz);
          scene.add(g);
          addFloater(crystal, 0.35, 1.3, 0.8);

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
      const zoneLabel = makeTextSprite("EXPERIENCE", { size: 3, color: "#5F6470", weight: 900, spacing: 8 });
      zoneLabel.position.set(96, 18, 0);
      scene.add(zoneLabel);

      GAME_EXPERIENCE.forEach((exp, i) => {
        const h = 6 + (GAME_EXPERIENCE.length - i) * 2.2;
        const x = 82;
        const z = (i - (GAME_EXPERIENCE.length - 1) / 2) * 16;

        const g = new THREE.Group();
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(5.5, h, 5.5),
          glowMat(exp.current ? C.accent : 0x2a3354, exp.current ? 0.5 : 0.12),
        );
        tower.position.y = h / 2;
        g.add(tower);
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(tower.geometry),
          new THREE.LineBasicMaterial({
            color: exp.current ? C.accentSoft : 0x39415c,
            transparent: true,
            opacity: 0.8,
          }),
        );
        edges.position.copy(tower.position);
        g.add(edges);

        const lbl = makeTextSprite(`${exp.company}\n${exp.period}`, {
          size: 1,
          color: exp.current ? "#97A3FF" : "#A3A8B3",
          weight: 700,
        });
        lbl.position.y = h + 2.4;
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
      started: number; // timestamp, 0 = not started
      done: boolean;
      position: THREE.Vector3;
    }[] = [];

    {
      const zoneLabel = makeTextSprite("STATS", { size: 3, color: "#5F6470", weight: 900, spacing: 8 });
      zoneLabel.position.set(0, 16, 96);
      scene.add(zoneLabel);

      GAME_STATS.forEach((s, i) => {
        const x = (i - (GAME_STATS.length - 1) / 2) * 14;
        const z = 84;
        const g = new THREE.Group();

        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(2.2, 2.6, 4, 6),
          glowMat(C.accent, 0.2),
        );
        pillar.position.y = 2;
        g.add(pillar);

        const counter = makeCounterSprite(s.suffix, 3);
        counter.sprite.position.y = 6.6;
        g.add(counter.sprite);
        addFloater(counter.sprite, 0.25, 1);

        const lbl = makeTextSprite(s.label.toUpperCase(), {
          size: 0.9,
          color: "#5F6470",
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
      const techLabel = makeTextSprite("TECH STACK", { size: 1.6, color: "#5F6470", weight: 900, spacing: 6 });
      techLabel.position.set(-42, 9, 62);
      scene.add(techLabel);

      GAME_TECH_STACK.forEach((t, i) => {
        const a = (i / GAME_TECH_STACK.length) * Math.PI * 2;
        const x = -42 + Math.cos(a) * 7;
        const z = 62 + Math.sin(a) * 7;
        const g = new THREE.Group();
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(1, 24, 24),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(t.color),
            emissive: new THREE.Color(t.color),
            emissiveIntensity: 0.5,
            roughness: 0.4,
          }),
        );
        orb.position.y = 3;
        g.add(orb);
        addFloater(orb, 0.3, 1.2 + i * 0.1);
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
      const zoneLabel = makeTextSprite("PORTALS", { size: 3, color: "#5F6470", weight: 900, spacing: 8 });
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
          new THREE.TorusGeometry(2.4, 0.18, 12, 48),
          new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.7,
            roughness: 0.3,
          }),
        );
        torus.position.y = 3.4;
        torus.rotation.y = Math.PI / 2;
        g.add(torus);
        addFloater(torus, 0.25, 1, 0);

        const disc = new THREE.Mesh(
          new THREE.CircleGeometry(2.2, 32),
          new THREE.MeshBasicMaterial({
            color: col,
            transparent: true,
            opacity: 0.14,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        disc.position.y = 3.4;
        disc.rotation.y = Math.PI / 2;
        g.add(disc);

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

    {
      const g = new THREE.Group();
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.9, 70, 12, 1, true),
        new THREE.MeshBasicMaterial({
          color: C.accent,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      beam.position.y = 35;
      g.add(beam);
      const baseCone = new THREE.Mesh(new THREE.ConeGeometry(3, 5, 6), glowMat(C.accent, 0.8));
      baseCone.position.y = 2.5;
      g.add(baseCone);
      const lbl = makeTextSprite("CONTACT", { size: 1.4, color: "#97A3FF", weight: 900, spacing: 6 });
      lbl.position.y = 9.5;
      g.add(lbl);
      addFloater(lbl, 0.3, 1.2);
      g.position.set(58, 0, -52);
      scene.add(g);

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
      const s = makeTextSprite(t, { size: 0.8, color: "#5F6470", weight: 600, spacing: 4, opacity: 0.9 });
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
      if (dt > 400 || moved > 12) return; // it was a drag, not a click
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

    setDiscovered(
      GAME_PROJECTS.filter((p) => collectedSet.has(p.name)).length,
    );

    const spawnBurst = (at: THREE.Vector3, color: number) => {
      const n = 36;
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
          size: 0.35,
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
      const crystal = crystalByProject.get(name);
      if (crystal) {
        const m = crystal.material as THREE.MeshStandardMaterial;
        m.emissive = new THREE.Color(C.accentSoft);
        m.emissiveIntensity = 1.4;
      }
      spawnBurst(i.position.clone().setY(3), C.accentSoft);
      const count = GAME_PROJECTS.filter((p) => collectedSet.has(p.name)).length;
      setDiscovered(count);
      trackEvent("game_project_discovered", { project: name, progress: count });
      if (count === GAME_PROJECTS.length) {
        setToast("🏆 ACHIEVEMENT — ALL 19 PROJECTS DISCOVERED!");
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
      vel.multiplyScalar(Math.pow(0.0035, dt)); // exponential damping
      player.position.addScaledVector(vel, dt);

      // keep inside world
      const flat = new THREE.Vector2(player.position.x, player.position.z);
      if (flat.length() > WORLD_RADIUS) {
        flat.setLength(WORLD_RADIUS);
        player.position.x = flat.x;
        player.position.z = flat.y;
        vel.multiplyScalar(0.4);
      }

      /* player visuals */
      player.position.y = 1.6 + Math.sin(t * 2.2) * 0.18;
      core.rotation.y += dt * 1.4;
      halo.rotation.z += dt * 0.8;
      player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -vel.x * 0.012, 0.1);
      player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, vel.z * 0.012, 0.1);

      /* camera follow */
      camTarget.set(
        player.position.x + vel.x * 0.25,
        player.position.y + 13,
        player.position.z + 18 + vel.z * 0.2,
      );
      camera.position.lerp(camTarget, 1 - Math.pow(0.001, dt));
      camera.lookAt(player.position.x, player.position.y + 1.5, player.position.z);

      /* floaters */
      for (const f of floaters) {
        f.obj.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * f.amp;
        if (f.spin) f.obj.rotation.y += f.spin * dt;
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

      renderer.render(scene, camera);
    };
    loop();

    /* ── Resize ── */
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
        const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      disposables.forEach((d) => d.dispose());
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
