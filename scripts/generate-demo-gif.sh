#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/demo.gif"
TMP="$(mktemp -d)"
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf

lines=(
  "Panasch - structured JSON logs"
  "level=30 msg=hello userId=u1"
  "level=30 msg=hello format=logfmt"
  "gen_ai.request.model=gpt-4 prompt redacted"
)

mkdir -p "$ROOT/docs"
i=0
for line in "${lines[@]}"; do
  i=$((i + 1))
  printf '%s' "$line" > "$TMP/caption.txt"
  ffmpeg -y -f lavfi -i "color=c=#0f1419:s=860x320:d=1" \
    -vf "drawtext=fontfile=${FONT}:textfile=${TMP}/caption.txt:x=28:y=120:fontsize=22:fontcolor=#e7ecf3" \
    -frames:v 1 -update 1 "$TMP/frame$(printf %02d "$i").png" >/dev/null 2>&1
done

ffmpeg -y -framerate 1 -i "$TMP/frame%02d.png" \
  -vf "fps=2,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer" \
  "$OUT" >/dev/null 2>&1

rm -rf "$TMP"
echo "Wrote $OUT"
