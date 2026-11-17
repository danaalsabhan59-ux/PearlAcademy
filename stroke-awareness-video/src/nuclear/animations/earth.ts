import { fbm3 } from "./noise";

/**
 * A procedural, fictional planet (no real continents or borders) rendered per pixel:
 * equirectangular colour + cloud textures generated once, then shaded on a sphere.
 */
const TW = 1024, TH = 512;
let TEX: { col: Float32Array; cloud: Float32Array } | null = null;

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
export const getTex = () => {
  if (TEX) return TEX;
  const col = new Float32Array(TW * TH * 3);
  const cloud = new Float32Array(TW * TH);
  for (let y = 0; y < TH; y++) {
    const lat = (0.5 - y / TH) * Math.PI;
    for (let x = 0; x < TW; x++) {
      const lon = (x / TW) * Math.PI * 2;
      const px = Math.cos(lat) * Math.cos(lon), py = Math.sin(lat), pz = Math.cos(lat) * Math.sin(lon);
      const e = fbm3(px * 1.6 + 7, py * 1.6 + 3, pz * 1.6 + 11, 6);
      const iceN = fbm3(px * 5 + 3, py * 5, pz * 5, 3);
      const ice = Math.max(0, Math.min(1, (Math.abs(lat) - 1.2 + (iceN - 0.5) * 0.35) / 0.08));
      let c: number[];
      if (e < 0.5) {
        const d = Math.min(1, (0.5 - e) / 0.14);
        c = mix([28, 92, 128], [9, 34, 62], d); // shallow → deep ocean
      } else {
        const t = Math.min(1, (e - 0.5) / 0.16);
        const dry = fbm3(px * 3 + 2, py * 3, pz * 3, 3);
        const arid = Math.max(0, Math.min(1, (dry - 0.45) / 0.2));
        c = mix(mix([46, 88, 52], [126, 112, 78], arid), [150, 146, 128], t * 0.5);
      }
      c = mix(c, [214, 224, 232], ice * 0.85);
      const i = y * TW + x;
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      const cl = fbm3(px * 2.4 + 40, py * 4 + 9, pz * 2.4, 5);
      cloud[i] = Math.max(0, Math.min(1, (cl - 0.52) * 3.2));
    }
  }
  TEX = { col, cloud };
  return TEX;
};

export type EarthView = {
  cx: number; cy: number; r: number; // canvas pixels
  lon: number; // rotation (rad)
  tilt: number; // rad
  alpha: number;
  light?: [number, number, number];
};

export const drawEarth = (ctx: CanvasRenderingContext2D, w: number, h: number, v: EarthView) => {
  const { col, cloud } = getTex();
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const L = v.light ?? [-0.55, -0.35, 0.76];
  const ln = Math.hypot(...L);
  const lx = L[0] / ln, ly = L[1] / ln, lz = L[2] / ln;
  const ct = Math.cos(v.tilt), st = Math.sin(v.tilt);
  const R = v.r, ATM = 1.07;
  const x0 = Math.max(0, Math.floor(v.cx - R * ATM)), x1 = Math.min(w, Math.ceil(v.cx + R * ATM));
  const y0 = Math.max(0, Math.floor(v.cy - R * ATM)), y1 = Math.min(h, Math.ceil(v.cy + R * ATM));
  for (let y = y0; y < y1; y++) {
    const ny = (y - v.cy) / R;
    for (let x = x0; x < x1; x++) {
      const nx = (x - v.cx) / R;
      const q = nx * nx + ny * ny;
      const o = (y * w + x) * 4;
      if (q > 1) {
        // atmosphere halo
        const rr = Math.sqrt(q);
        if (rr < ATM) {
          const a = Math.pow(1 - (rr - 1) / (ATM - 1), 2.2) * 0.75;
          const lit = Math.max(0.15, (-nx * lx - ny * ly) * 0.6 + 0.6);
          d[o] = 86; d[o + 1] = 199; d[o + 2] = 217; d[o + 3] = 255 * a * lit * v.alpha;
        }
        continue;
      }
      const nz = Math.sqrt(1 - q);
      // view → globe: tilt around X, then longitude around Y
      const gy = -ny * ct + nz * st;
      const gz0 = ny * st + nz * ct;
      const lat = Math.asin(Math.max(-1, Math.min(1, gy)));
      let lon = Math.atan2(gz0, nx) + v.lon;
      lon = ((lon % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const tx = Math.min(TW - 1, Math.floor((lon / (2 * Math.PI)) * TW));
      const ty = Math.min(TH - 1, Math.floor((0.5 - lat / Math.PI) * TH));
      const ti = ty * TW + tx;
      const diff = Math.max(0, nx * lx + -ny * -ly + nz * lz);
      const shade = 0.07 + 0.95 * Math.pow(diff, 0.8);
      const cl = cloud[ti];
      let r = col[ti * 3] * (1 - cl) + 235 * cl;
      let g = col[ti * 3 + 1] * (1 - cl) + 240 * cl;
      let b = col[ti * 3 + 2] * (1 - cl) + 245 * cl;
      const rim = Math.pow(1 - nz, 3) * 0.9;
      r = r * shade + 86 * rim * (0.3 + diff);
      g = g * shade + 199 * rim * (0.3 + diff);
      b = b * shade + 217 * rim * (0.3 + diff);
      // faint spec on oceans
      const spec = col[ti * 3 + 2] > col[ti * 3 + 1] ? Math.pow(Math.max(0, diff), 30) * 60 * (1 - cl) : 0;
      d[o] = Math.min(255, r + spec);
      d[o + 1] = Math.min(255, g + spec);
      d[o + 2] = Math.min(255, b + spec);
      d[o + 3] = 255 * v.alpha;
    }
  }
  ctx.putImageData(img, 0, 0);
};

/** Equirectangular colour + cloud-alpha canvases for the 3D globe (generated once). */
let CAN: { color: HTMLCanvasElement; clouds: HTMLCanvasElement } | null = null;
export const globeCanvases = () => {
  if (CAN) return CAN;
  const { col, cloud } = getTex();
  const mk = () => { const c = document.createElement("canvas"); c.width = TW; c.height = TH; return c; };
  const color = mk(), clouds = mk();
  const ci = color.getContext("2d")!.createImageData(TW, TH), ki = clouds.getContext("2d")!.createImageData(TW, TH);
  for (let i = 0; i < TW * TH; i++) {
    ci.data[i * 4] = col[i * 3]; ci.data[i * 4 + 1] = col[i * 3 + 1]; ci.data[i * 4 + 2] = col[i * 3 + 2]; ci.data[i * 4 + 3] = 255;
    const a = cloud[i] * 255; ki.data[i * 4] = a; ki.data[i * 4 + 1] = a; ki.data[i * 4 + 2] = a; ki.data[i * 4 + 3] = 255;
  }
  color.getContext("2d")!.putImageData(ci, 0, 0); clouds.getContext("2d")!.putImageData(ki, 0, 0);
  CAN = { color, clouds };
  return CAN;
};
