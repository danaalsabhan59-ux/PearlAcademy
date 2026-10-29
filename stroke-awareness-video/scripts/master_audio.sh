#!/usr/bin/env bash
# Two-pass loudness mastering of the rendered film's audio to -14 LUFS / -1 dBTP
# (social-media level). The video stream is copied unchanged.
set -euo pipefail
FILE="${1:-out/stroke-code-world-stroke-day.mp4}"
STATS=$(ffmpeg -hide_banner -i "$FILE" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -vn -f null - 2>&1 | sed -n '/^{/,/^}/p')
read -r I TP LRA TH OFF <<<"$(echo "$STATS" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")"
ffmpeg -v error -y -i "$FILE" -map 0:v -map 0:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true,aresample=48000" \
  -c:a aac -b:a 320k "${FILE%.mp4}.mastered.mp4"
mv "${FILE%.mp4}.mastered.mp4" "$FILE"
echo "Mastered $FILE"
