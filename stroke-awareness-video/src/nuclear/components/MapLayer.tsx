import React, { useLayoutEffect, useRef } from "react";
import { MAP, mapImage } from "../animations/map";

/** The cached fictional terrain map (1080×1080 canvas). Position/transform it with `style`. */
export const MapLayer: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.putImageData(mapImage(ctx), 0, 0);
  }, []);
  return <canvas ref={ref} width={MAP} height={MAP} style={{ position: "absolute", width: MAP, height: MAP, ...style }} />;
};
