#!/usr/bin/env bash
# A régi weblap maradékának félretétele a webgyökérből.
#
# A tükrözés nem töröl, ezért a régi weblap fájljai ott maradtak az újak
# mellett. Ez a szkript áthelyezi őket egy ARCHIVE mappába, ami a webgyökéren
# KÍVÜL van — így megmaradnak, de az internetről nem tölthetők le.
#
# Nem töröl semmit: minden mozgatás átnevezés, és bármikor visszafordítható.
#
# Használat:  ftp-archive.sh probafutas   — csak kiírja, mit tenne
#             ftp-archive.sh vegrehajt    — el is végzi
#
# Elvárt környezeti változók: FTP_HOST, FTP_USER, LFTP_PASSWORD, WEB_ROOT,
# SETTINGS (az lftp beállításai), és a helyi build az out/ mappában.

set -uo pipefail

MOD="${1:-probafutas}"

# A hívó shell-jéből ezeknek exportálva kell megérkezniük. Enélkül a set -u
# egy "unbound variable" sorral állna meg, amiből nem derül ki, mi hiányzik.
for valtozo in FTP_HOST FTP_USER LFTP_PASSWORD WEB_ROOT SETTINGS; do
  if [ -z "${!valtozo:-}" ]; then
    echo "::error::Az archiváláshoz hiányzik a(z) $valtozo környezeti változó. A hívó lépésben exportálni kell — a szkript külön folyamatban fut."
    exit 1
  fi
done

# A régi weblapból ismert bejegyzések. Csak ezekhez nyúlunk — nem "minden,
# ami nem a miénk", mert egy téves listázás akkor a weblapot vinné el.
JELOLTEK=(
  _blueway_old.rar          # a régi weblap teljes mentése, 95 MB
  pma                       # phpMyAdmin
  admin protected uploads softaculous
  css fonts less
  index.php index2.php
  .gitignore
  favicon.ico favicon-16x16.png favicon-32x32.png favicon-96x96.png
)

# Ezekhez soha, semmilyen körülmények között:
#   .well-known     — az SSL-tanúsítvány ellenőrzése teszi ide a fájlját
#   backups-forpsi  — a szolgáltató mentései
#   .ftpquota       — a tárhelyszámláló
TILTOTT=(.well-known backups-forpsi .ftpquota . ..)

ARCHIVE="$(dirname "$WEB_ROOT")/ARCHIVE"
[ "$ARCHIVE" = "//ARCHIVE" ] && ARCHIVE="/ARCHIVE"

echo "— archiválás ($MOD) —"
echo "webgyökér: $WEB_ROOT"
echo "cél:       $ARCHIVE"

# Mi van most a webgyökérben?
LISTA=$(lftp -u "$FTP_USER" --env-password \
  -e "$SETTINGS cls -1 '$WEB_ROOT/'; bye" "$FTP_HOST" 2>/dev/null) || {
  echo "::error::A webgyökeret nem sikerült listázni — az archiválás kimarad."
  exit 1
}

MOZGATANDO=()
for nev in "${JELOLTEK[@]}"; do
  # Ott van-e egyáltalán a szerveren?
  if ! printf '%s\n' "$LISTA" | grep -qxF -- "$nev" &&
     ! printf '%s\n' "$LISTA" | grep -qxF -- "$nev/"; then
    continue
  fi

  # Tiltólista.
  kihagy=""
  for t in "${TILTOTT[@]}"; do
    [ "$nev" = "$t" ] && kihagy="tiltólistán"
  done

  # A legfontosabb védelem: ha a névhez tartozik fájl vagy mappa a saját
  # buildünkben is, akkor a weblap része, és hozzá sem nyúlunk. Ezen bukott
  # el a js mappa is, amiben a süti-tájékoztató szkriptje lakik.
  [ -e "out/$nev" ] && kihagy="a weblap része"

  if [ -n "$kihagy" ]; then
    echo "  kihagyva:  $nev  ($kihagy)"
  else
    MOZGATANDO+=("$nev")
  fi
done

if [ ${#MOZGATANDO[@]} -eq 0 ]; then
  echo "Nincs mit archiválni — a webgyökérben nincs a listából egy bejegyzés sem."
  exit 0
fi

echo "áthelyezendő (${#MOZGATANDO[@]}):"
for nev in "${MOZGATANDO[@]}"; do echo "  $nev"; done

if [ "$MOD" != "vegrehajt" ]; then
  echo "Próbafutás volt — a szerveren semmi nem változott."
  exit 0
fi

# Az áthelyezés. Minden bejegyzés külön mv, pontosvesszővel elválasztva: az
# lftp az alapbeállítása szerint egy hibás parancs után is folytatja, tehát
# egy elakadt bejegyzés nem viszi el a többit. Shell-szintaxist (zárójel,
# && , ||) szándékosan nem használunk — az lftp nem shell.
PARANCS="$SETTINGS mkdir -p '$ARCHIVE';"
for nev in "${MOZGATANDO[@]}"; do
  PARANCS="$PARANCS mv '$WEB_ROOT/$nev' '$ARCHIVE/$nev';"
done
lftp -u "$FTP_USER" --env-password -e "$PARANCS bye" "$FTP_HOST"

# Az eredményt nem az lftp kimenetéből olvassuk ki, hanem abból, hogy mi
# maradt a webgyökérben — ez akkor is igazat mond, ha egy mv némán elszállt.
MARADT=$(lftp -u "$FTP_USER" --env-password \
  -e "$SETTINGS cls -1 '$WEB_ROOT/'; bye" "$FTP_HOST" 2>/dev/null)
HIBAS=0
for nev in "${MOZGATANDO[@]}"; do
  if printf '%s\n' "$MARADT" | grep -qxF -- "$nev" ||
     printf '%s\n' "$MARADT" | grep -qxF -- "$nev/"; then
    echo "::warning::Nem sikerült áthelyezni: $nev"
    HIBAS=$((HIBAS + 1))
  else
    echo "  áthelyezve: $nev"
  fi
done
[ "$HIBAS" -gt 0 ] && echo "::warning::$HIBAS bejegyzés a webgyökérben maradt."

echo "— az archiválás után a webgyökér —"
lftp -u "$FTP_USER" --env-password \
  -e "$SETTINGS cls -1 '$WEB_ROOT/'; bye" "$FTP_HOST" 2>/dev/null | sort | tr '\n' ' '
echo
