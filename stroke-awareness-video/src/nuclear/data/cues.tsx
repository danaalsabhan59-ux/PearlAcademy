import React, { useContext } from "react";
import { sc as scNarr, SceneId } from "./timeline";
import { at as atNarr } from "./words";

/**
 * Where scenes get their timing from. The narrated film uses the voice's word timings (default);
 * the silent film provides card-based timings. `hideKeyWords` lets the silent film replace the
 * scenes' small headlines with its own large cinematic typography.
 */
export type CueAPI = {
  at: (id: SceneId, word: string, n?: number) => number;
  sc: (id: SceneId) => { start: number; end: number };
  hideKeyWords: boolean;
  silent: boolean;
};
const DEFAULT: CueAPI = { at: atNarr, sc: scNarr, hideKeyWords: false, silent: false };
export const CueContext = React.createContext<CueAPI>(DEFAULT);
export const useCues = () => useContext(CueContext);
