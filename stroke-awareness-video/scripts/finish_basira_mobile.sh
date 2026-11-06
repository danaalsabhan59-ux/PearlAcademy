#!/usr/bin/env bash
# Final audio pass for the vertical Basira video: trim the audio to exactly 60 s
# and +7 dB so the soft effects stay audible on phones (≈ -28 LUFS). The video stream is copied unchanged.
set -euo pipefail
FILE="${1:-out/basirah/basirah-ai-mobile.mp4}"
ffmpeg -v error -y -i "$FILE" -map 0:v -map 0:a -c:v copy -af "volume=7dB,atrim=end=60" -c:a aac -b:a 256k "${FILE%.mp4}.tmp.mp4"
mv "${FILE%.mp4}.tmp.mp4" "$FILE"
echo "Finished $FILE"
