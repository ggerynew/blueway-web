#!/usr/bin/env bash
#
# A kezdőlapi videósáv klipjeinek előállítása a gyártói forrásfelvételekből.
#
# Miért szkript és nem kézi parancs: a vágás pontjai a kódban is szerepelnek
# (src/lib/bemutato-videok.ts, `forras` mező), és a kettőnek egyeznie kell.
# Ha a szakasz változik, ITT és OTT is át kell írni — egy helyen a parancs,
# a másikon a nyilvántartás.
#
# Használat:
#   scripts/bemutato-klipek.sh <forras-mappa>
# ahol a forrás-mappában ezek a fájlok vannak (bármilyen kiterjesztéssel):
#   hermes-q.*   gyz6.*   lm-plus.*
#
# Amit csinál minden klippel:
#   - kivágja a megadott szakaszt (a keresés a bemenet ELŐTT áll, ezért gyors
#     és képkocka-pontos újrakódolással);
#   - TÖRLI a hangsávot (-an): a sáv néma, és a hang csak méret;
#   - 540 képpont magasra skáláz — a csempe ~470 képpont széles, ennél többre
#     nincs szükség, a fájl viszont a négyzetével nőne;
#   - két formátumot ad: MP4/H.264 a Safarinak (kötelező) és WebM/VP9 a
#     többieknek (kisebb);
#   - a `+faststart` a fejlécet a fájl elejére teszi, enélkül a videó csak
#     teljes letöltés után indulna;
#   - poszterképet vág az első képkockából.
set -euo pipefail

FORRAS_MAPPA="${1:?Használat: scripts/bemutato-klipek.sh <forras-mappa>}"
FF="${FFMPEG:-ffmpeg}"
CEL_VIDEO="public/videos/bemutato"
CEL_KEP="public/images/bemutato"
mkdir -p "$CEL_VIDEO" "$CEL_KEP"

# nev:kezdet:hossz — a szakaszok a bemutato-videok.ts `forras` mezőivel egyeznek
KLIPEK=(
  "hermes-q:8:30"    # P-9HXQJ-Lds   8 mp → 38 mp
  "gyz6:11:61"       # gyz6JmDsWIc  11 mp → 1:12
  "lm-plus:6:114"    # Q7-qCKuZ708   6 mp → 2:00
)

for sor in "${KLIPEK[@]}"; do
  IFS=: read -r NEV KEZDET HOSSZ <<< "$sor"
  BE=$(find "$FORRAS_MAPPA" -maxdepth 1 -type f -name "$NEV.*" | head -1)
  if [ -z "$BE" ]; then
    echo "kimarad: $NEV — nincs forrásfájl a(z) $FORRAS_MAPPA mappában"
    continue
  fi
  echo "$NEV  ($KEZDET mp-től $HOSSZ mp hosszan, forrás: $(basename "$BE"))"

  "$FF" -hide_banner -loglevel error -y -ss "$KEZDET" -i "$BE" -t "$HOSSZ" \
    -an -vf "scale=-2:540" -c:v libx264 -profile:v high -crf 24 -preset slow \
    -pix_fmt yuv420p -movflags +faststart "$CEL_VIDEO/$NEV.mp4"

  "$FF" -hide_banner -loglevel error -y -i "$CEL_VIDEO/$NEV.mp4" \
    -an -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 "$CEL_VIDEO/$NEV.webm"

  "$FF" -hide_banner -loglevel error -y -i "$CEL_VIDEO/$NEV.mp4" \
    -frames:v 1 -c:v libwebp -q:v 78 "$CEL_KEP/$NEV.webp"

  printf '   mp4: %s   webm: %s   poszter: %s\n' \
    "$(du -h "$CEL_VIDEO/$NEV.mp4" | cut -f1)" \
    "$(du -h "$CEL_VIDEO/$NEV.webm" | cut -f1)" \
    "$(du -h "$CEL_KEP/$NEV.webp" | cut -f1)"
done

echo
echo "Kész. A kezdőlap a meglévő fájlú csempéket magától megjeleníti — kód nem kell hozzá."
