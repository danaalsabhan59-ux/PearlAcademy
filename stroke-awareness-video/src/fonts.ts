import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Cairo (SIL Open Font License) — bundled locally so renders never depend on the network.
for (const weight of ["700", "800"]) {
  for (const subset of ["arabic", "latin"]) {
    loadFont({
      family: "Cairo",
      url: staticFile(`fonts/cairo-${subset}-${weight}-normal.woff2`),
      weight,
    });
  }
}
