// Writes the silent film's scene windows + animation cues for generate_nuclear_ambience.py --plan
import { writeFileSync } from "node:fs";
import { SILENT_CUE_TABLE, SILENT_TOTAL, SSCENES } from "../src/nuclear/silent/timeline";
const cues: Record<string, number> = { ...SILENT_CUE_TABLE, "s3:تحملها#1": SILENT_CUE_TABLE["s3:تحمل#1"] };
writeFileSync(process.argv[2], JSON.stringify({ total: SILENT_TOTAL, scenes: Object.fromEntries(SSCENES.map((s) => [s.id, [s.start, s.end]])), cues }, null, 1));
