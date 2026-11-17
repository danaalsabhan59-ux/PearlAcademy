import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Cairo and Press Start 2P are SIL Open Font License fonts, bundled locally.
for (const weight of ["700", "800"]) {
  for (const subset of ["arabic", "latin"]) {
    loadFont({ family: "Cairo", url: staticFile(`fonts/cairo-${subset}-${weight}-normal.woff2`), weight });
  }
}
loadFont({ family: "Press Start 2P", url: staticFile("fonts/press-start-2p-latin-400-normal.woff2"), weight: "400" });
