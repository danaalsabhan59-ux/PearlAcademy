#!/usr/bin/env python3
"""Build PIXEL ER into one self-contained file: dist/index.html

    python3 build.py

Reads src/*.js, src/style.css, cases/*.json and assets/logo-emergency-club.png.
Standard library only. Cases are validated by `node tests/engine.test.js`.
"""
import base64
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC, CASES, DIST = ROOT / "src", ROOT / "cases", ROOT / "dist"
JS_ORDER = ["core.js", "ecg.js", "art.js", "online.js", "game.js", "builder.js", "app.js"]
EDGE_OUT = ROOT / "supabase" / "functions" / "pixel-er-submit" / "index.ts"

# Public connection settings of the club's Supabase project (the same values the
# club platform already ships to every browser). Never put a service-role key here.
CONFIG = {
    "showUnreviewed": True,
    "supabaseUrl": "https://cbswqehpufnlnczhznti.supabase.co",
    "supabaseKey": "sb_publishable_ZZCyodaZrGNXyvUMBKf11g_Nb-FS9jF",
    "submitFunction": "pixel-er-submit",
}


def public_key(key: str) -> bool:
    """True only for keys that are meant to be public (never a secret/service-role key)."""
    if key.startswith("sb_publishable_"):
        return True
    if key.startswith("eyJ"):  # legacy JWT keys: accept only role=anon
        try:
            payload = key.split(".")[1]
            payload += "=" * (-len(payload) % 4)
            return json.loads(base64.urlsafe_b64decode(payload)).get("role") == "anon"
        except (IndexError, ValueError):
            return False
    return False


def main() -> int:
    shell = (SRC / "shell.html").read_text(encoding="utf-8")
    css = (SRC / "style.css").read_text(encoding="utf-8")
    js = "\n;\n".join((SRC / f).read_text(encoding="utf-8") for f in JS_ORDER)

    logo = ROOT / "assets" / "logo-emergency-club.png"
    logo_uri = "data:image/png;base64," + base64.b64encode(logo.read_bytes()).decode("ascii")
    js = js.replace("/*LOGO*/", logo_uri)

    cases = []
    for path in sorted(CASES.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("id") + ".json" != path.name:
            print(f"error: {path.name} has id {data.get('id')!r}", file=sys.stderr)
            return 1
        cases.append(data)

    def safe_json(obj) -> str:
        # '<' escaped so case text can never close the <script> block.
        return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")

    if "</script" in js.lower() or "</style" in css.lower():
        print("error: a source file contains a literal closing tag", file=sys.stderr)
        return 1

    out = (shell.replace("/*CSS*/", css)
                .replace("/*CASES*/", safe_json(cases))
                .replace("/*CONFIG*/", safe_json(CONFIG))
                .replace("/*JS*/", js))
    if not public_key(CONFIG["supabaseKey"]):
        print("error: only the public (publishable/anon) key may be embedded", file=sys.stderr)
        return 1

    # Server-side scoring function: same engine as the game, so scores always match.
    edge = (SRC / "edge-submit.ts").read_text(encoding="utf-8")
    edge = (edge.replace("/*CORE*/", (SRC / "core.js").read_text(encoding="utf-8"))
                .replace("/*SUBMIT*/", (SRC / "submit.js").read_text(encoding="utf-8")))
    EDGE_OUT.parent.mkdir(parents=True, exist_ok=True)
    EDGE_OUT.write_text(edge, encoding="utf-8")

    DIST.mkdir(exist_ok=True)
    (DIST / "index.html").write_text(out, encoding="utf-8")
    print(f"dist/index.html  {len(out.encode('utf-8')) / 1024:.0f} KB  ·  {len(cases)} case(s): "
          + ", ".join(c["id"] for c in cases))
    print(f"{EDGE_OUT.relative_to(ROOT)}  {len(edge.encode('utf-8')) / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
