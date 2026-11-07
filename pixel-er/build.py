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
JS_ORDER = ["core.js", "ecg.js", "art.js", "game.js", "builder.js", "app.js"]
CONFIG = {"showUnreviewed": True}


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
    DIST.mkdir(exist_ok=True)
    (DIST / "index.html").write_text(out, encoding="utf-8")
    print(f"dist/index.html  {len(out.encode('utf-8')) / 1024:.0f} KB  ·  {len(cases)} case(s): "
          + ", ".join(c["id"] for c in cases))
    return 0


if __name__ == "__main__":
    sys.exit(main())
