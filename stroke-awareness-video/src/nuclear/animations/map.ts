import { fbm3 } from "./noise";

/**
 * Fictional scientific terrain map (no real geography): dark relief, contour lines, rivers/lakes,
 * generated once and cached. Size 1080×1080 (drawn at full resolution once).
 */
export const MAP = 1080;
let CACHE: ImageData | null = null;
export const mapImage = (ctx: CanvasRenderingContext2D) => {
  if (CACHE) return CACHE;
  const img = ctx.createImageData(MAP, MAP);
  const d = img.data;
  for (let y = 0; y < MAP; y++) {
    for (let x = 0; x < MAP; x++) {
      const u = x / MAP, v = y / MAP;
      const e = fbm3(u * 3.2 + 5, v * 3.2 + 1, 0.37, 6);
      const o = (y * MAP + x) * 4;
      let r: number, g: number, b: number;
      if (e < 0.42) {
        const t = Math.min(1, (0.42 - e) / 0.1);
        r = 10 - 2 * t; g = 36 - 10 * t; b = 58 - 12 * t; // water
      } else {
        const t = Math.min(1, (e - 0.42) / 0.3);
        r = 20 + 30 * t; g = 46 + 34 * t; b = 62 + 26 * t;
        const c = (e * 26) % 1;
        if (c < 0.06) { r += 26; g += 60; b += 66; } // contour
        // relief shading
        const ex = fbm3((u + 0.002) * 3.2 + 5, v * 3.2 + 1, 0.37, 4) - fbm3(u * 3.2 + 5, v * 3.2 + 1, 0.37, 4);
        const k = Math.max(-14, Math.min(14, ex * 2600));
        r += k; g += k; b += k;
      }
      if (Math.abs(e - 0.42) < 0.0035) { r = 86; g = 199; b = 217; } // coastline
      d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
  }
  CACHE = img;
  return img;
};
