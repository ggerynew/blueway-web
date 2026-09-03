#!/usr/bin/env bash
# A régi weblap maradékának ELTÁVOLÍTÁSA a tárhelyről.
#
# MIÉRT KÜLÖN SZKRIPT, KÜLÖN KAPCSOLÓVAL
#   Ez az egyetlen pontja a telepítésnek, ami TÖRÖL. Minden más lépés csak ír
#   és felülír, tehát a hibája javítható egy újabb futással — ezé nem. Ezért
#   alapból ki van kapcsolva, kézzel kell kérni, és a végrehajtás előtt
#   kötelező leltárt ír.
#
# MIÉRT SSH-N ÉS NEM FTP-N
#   Volt már egy FTP-s archiváló szkriptünk (ftp-archive.sh), csak épp soha
#   nem futott le: az FTP-s feltöltési ágba került, az pedig kimarad, valahányszor
#   az SSH sikerül — vagyis minden egyes telepítésnél. A törlés ezért oda kerül,
#   ahol a munka ténylegesen zajlik, az SSH-ág végére.
#
# MIT TÖRÖL
#   Kizárólag a régi Yii-weblapból ismert, NÉV SZERINT felsorolt bejegyzéseket.
#   Soha nem azt, hogy „minden, ami nem a miénk" — egy hibás vagy üres listázás
#   úgy magát a weblapot vinné el.
#
# HÁROM VÉDELEM
#   1. Tiltólista: a .well-known (ide teszi a fájlját az SSL-ellenőrzés), a
#      backups-forpsi (a SZOLGÁLTATÓ mentései, nem a régi weblapé) és a
#      .ftpquota — ezekhez semmilyen módban nem nyúlunk.
#   2. Ami a saját buildünkben (out/) is szerepel, az a weblap része, kimarad.
#      Ezen bukott el annak idején a js mappa, amiben a süti-szkript lakik.
#   3. Törlés előtt ÉS után is listázunk, és az eredményt abból olvassuk ki,
#      mi maradt — nem a parancs kimenetéből, ami némán is hazudhat.
#
# Használat:  szerver-takaritas.sh <mod> <webgyoker> <port> <user@gep>
#   mod: leltar      — csak listáz, semmit nem változtat
#        probafutas  — kiírja, mit törölne
#        vegrehajt   — törli

set -uo pipefail

MOD="${1:?hiányzik a mód}"
WEB_ROOT="${2:?hiányzik a webgyökér}"
PORT="${3:?hiányzik a port}"
CEL="${4:?hiányzik a user@gép}"

TAV() {
  ssh -i ~/.ssh/id_deploy -p "$PORT" -o StrictHostKeyChecking=yes "$CEL" "$1" 2>/dev/null
}

# A régi weblapból ismert bejegyzések. A lista az ftp-archive.sh-ból származik,
# ott a költözéskor a webgyökér tényleges listájából állt össze.
JELOLTEK=(
  _blueway_old.rar          # a régi weblap teljes mentése, 95 MB
  pma                       # phpMyAdmin
  admin protected uploads softaculous
  css fonts less
  index.php index2.php
  .gitignore
  favicon-16x16.png favicon-32x32.png favicon-96x96.png
)

# A SZÜLŐKÖNYVTÁRBAN lévő maradék. A 2026-09-03-i leltár alapján derült ki,
# mi micsoda — a nevekből nem lett volna kitalálható, ezért mértük meg:
#
#   ARCHIVE   394 MB  a mi archiválásunk 2026-07-29-ről: _blueway_old.rar
#                     (a régi weblap teljes mentése), admin, css, faviconok
#   www_      207 MB  a régi webgyökér: app.php, app_dev.php, assets
#   vendor    155 MB  a régi alkalmazás Composer-függőségei
#   app        29 MB  AppKernel.php, AppCache.php — Symfony alkalmazásmag
#   src       336 kB  AppBundle, Application — a régi alkalmazás forrása
#   data        4 kB  egy régi .htpasswd
#   teszt.txt     0   a költözéskor keletkezett próbafájl
#
# Amihez SZÁNDÉKOSAN nem nyúlunk, pedig szintén ott van:
#   www            az élő weblap gyökere
#   backups-forpsi a SZOLGÁLTATÓ mentései
#   .ftpquota      a tárhelyszámláló
#   stat, tmp      üres, a tárhely sajátja
#   softaculous    a tárhely automata telepítője
#   .htaccess      a szülőkönyvtáré, 168 bájt — nem tudjuk, mit szolgál ki
SZULO_JELOLTEK=(ARCHIVE www_ vendor app src data teszt.txt)

# Ezekhez soha, semmilyen körülmények között. A `www` a legfontosabb: az az
# élő weblap gyökere, és a szülőkönyvtárban áll a törlendők mellett.
TILTOTT=(.well-known backups-forpsi .ftpquota www stat tmp softaculous .htaccess . ..)

SZULO="$(dirname "$WEB_ROOT")"

echo "— a régi weblap maradéka ($MOD) —"
echo "webgyökér: $WEB_ROOT"

# ——— Leltár ————————————————————————————————————————————————————
LISTA=$(TAV "ls -A '$WEB_ROOT'" | sed '/^$/d')
DB=$(printf '%s\n' "$LISTA" | grep -c . || true)
if [ "$DB" -eq 0 ]; then
  echo "::error::A webgyökér listája ÜRES — ez nem lehet helyes, hiszen a weblap fent van. A takarítás kimarad, semmihez nem nyúltunk."
  exit 1
fi
echo "a webgyökérben $DB bejegyzés van"

# A szülőkönyvtár is érdekes: ide került a régi weblap ARCHIVE mappája, és itt
# lakik a szolgáltató mentése is — látni akarjuk, mi van ott.
echo "— a szülőkönyvtár ($SZULO) —"
TAV "ls -la '$SZULO'" | sed 's/^/  /' || echo "  (nem listázható)"

# A szülőkönyvtár bejegyzéseinek MÉRETE és tartalma. Enélkül vakon döntenénk
# arról, mi tűnjön el: a nevekből nem derül ki, hogy a `stat` a tárhely
# látogatottsági statisztikája-e vagy a régi weblap hagyatéka. Csak olvasunk.
echo "— a szülőkönyvtár bejegyzéseinek mérete és tartalma —"
TAV "cd '$SZULO' && for n in *; do
  [ \"\$n\" = 'www' ] && continue
  [ \"\$n\" = 'backups-forpsi' ] && continue
  m=\$(du -sh \"\$n\" 2>/dev/null | cut -f1)
  echo \"  \$n  (\$m)\"
  ls -A \"\$n\" 2>/dev/null | head -6 | sed 's/^/       /'
done" || echo "  (nem listázható)"

# ——— Mi tűnik el, mi marad ——————————————————————————————————————
TORLENDO=()
for nev in "${JELOLTEK[@]}"; do
  printf '%s\n' "$LISTA" | grep -qxF -- "$nev" || continue

  kihagy=""
  for t in "${TILTOTT[@]}"; do
    [ "$nev" = "$t" ] && kihagy="tiltólistán"
  done
  # A legfontosabb védelem: ha a név a saját buildünkben is létezik, akkor a
  # weblap része, és hozzá sem nyúlunk.
  [ -e "out/$nev" ] && kihagy="a weblap része"

  if [ -n "$kihagy" ]; then
    echo "  kihagyva:  $nev  ($kihagy)"
  else
    MERET=$(TAV "du -sh '$WEB_ROOT/$nev' 2>/dev/null | cut -f1" || echo '?')
    echo "  törlendő:  $nev  (${MERET:-?})"
    TORLENDO+=("$nev")
  fi
done

# A webgyökérben lévő, általunk nem ismert bejegyzések — ezekhez NEM nyúlunk,
# de kiírjuk, hogy legyen róluk képünk.
echo "— a webgyökér többi bejegyzése (ezekhez nem nyúlunk) —"
printf '%s\n' "$LISTA" | while read -r nev; do
  [ -z "$nev" ] && continue
  benne=0
  for j in "${JELOLTEK[@]}"; do [ "$nev" = "$j" ] && benne=1; done
  [ "$benne" -eq 1 ] && continue
  jel=""
  [ -e "out/$nev" ] && jel=" (a weblap része)"
  echo "  $nev$jel"
done

# ——— A szülőkönyvtárban lévő maradék ————————————————————————————
# A régi weblap java része NEM a webgyökérben van, hanem egy szinttel
# feljebb: részben a mi 2026-07-29-i archiválásunk tette oda, részben a
# költözés előttről maradt ott. Ezért kezeljük külön.
SZULO_LISTA=$(TAV "ls -A '$SZULO'" | sed '/^$/d')
SZULO_TORLENDO=()
echo "— a szülőkönyvtárból törlendő —"
for nev in "${SZULO_JELOLTEK[@]}"; do
  printf '%s\n' "$SZULO_LISTA" | grep -qxF -- "$nev" || continue
  kihagy=""
  for t in "${TILTOTT[@]}"; do
    [ "$nev" = "$t" ] && kihagy="tiltólistán"
  done
  # Öv és nadrágtartó: a webgyökér nevéhez soha nem nyúlunk, akkor sem, ha
  # valaki tévedésből felvenné a jelöltek közé.
  [ "$SZULO/$nev" = "$WEB_ROOT" ] && kihagy="ez maga a webgyökér"
  if [ -n "$kihagy" ]; then
    echo "  kihagyva:  $nev  ($kihagy)"
  else
    MERET=$(TAV "du -sh '$SZULO/$nev' 2>/dev/null | cut -f1" || echo '?')
    echo "  törlendő:  $nev  (${MERET:-?})"
    SZULO_TORLENDO+=("$nev")
  fi
done
[ ${#SZULO_TORLENDO[@]} -eq 0 ] && echo "  (nincs ilyen bejegyzés)"

if [ "$MOD" = "leltar" ]; then
  echo "Leltár volt — a szerveren semmi nem változott."
  exit 0
fi

OSSZES=$(( ${#TORLENDO[@]} + ${#SZULO_TORLENDO[@]} ))
if [ "$OSSZES" -eq 0 ]; then
  echo "Nincs mit törölni: a listából egyetlen bejegyzés sincs a szerveren."
  exit 0
fi

echo "összesen $OSSZES bejegyzés törlendő (${#TORLENDO[@]} a webgyökérből, ${#SZULO_TORLENDO[@]} a szülőkönyvtárból)"

if [ "$MOD" != "vegrehajt" ]; then
  echo "Próbafutás volt — a szerveren semmi nem változott."
  exit 0
fi

# ——— A törlés ————————————————————————————————————————————————————
# Bejegyzésenként külön parancs, teljes útvonallal, soha nem helyettesítő
# karakterrel. Egy elgépelt minta itt nem javítható.
for nev in "${TORLENDO[@]}"; do
  TAV "rm -rf '$WEB_ROOT/$nev'"
done
for nev in "${SZULO_TORLENDO[@]}"; do
  TAV "rm -rf '$SZULO/$nev'"
done

# A szülőkönyvtár eredménye — szintén a maradékból olvasva.
SZULO_MARADT=$(TAV "ls -A '$SZULO'" | sed '/^$/d')
for nev in "${SZULO_TORLENDO[@]}"; do
  if printf '%s\n' "$SZULO_MARADT" | grep -qxF -- "$nev"; then
    echo "::warning::Nem sikerült törölni a szülőkönyvtárból: $nev"
  else
    echo "  törölve: $SZULO/$nev"
  fi
done
# A legfontosabb ellenőrzés: megvan-e még az élő weblap gyökere.
if printf '%s\n' "$SZULO_MARADT" | grep -qxF -- "$(basename "$WEB_ROOT")"; then
  echo "  a webgyökér a helyén van"
else
  echo "::error::A WEBGYÖKÉR ELTŰNT a szülőkönyvtárból. Azonnali teendő: telepíts újra."
  exit 1
fi
echo "— a szülőkönyvtár szabad helye a takarítás után —"
TAV "df -h '$SZULO' | tail -2" | sed 's/^/  /' || true

# ——— Az eredmény a MARADÉKBÓL, nem a parancs kimenetéből ——————————
MARADT=$(TAV "ls -A '$WEB_ROOT'" | sed '/^$/d')
HIBAS=0
for nev in "${TORLENDO[@]}"; do
  if printf '%s\n' "$MARADT" | grep -qxF -- "$nev"; then
    echo "::warning::Nem sikerült törölni: $nev"
    HIBAS=$((HIBAS + 1))
  else
    echo "  törölve: $nev"
  fi
done
[ "$HIBAS" -gt 0 ] && echo "::warning::$HIBAS bejegyzés a webgyökérben maradt."

UJ_DB=$(printf '%s\n' "$MARADT" | grep -c . || true)
echo "— a takarítás után a webgyökérben $UJ_DB bejegyzés van —"
if [ "$UJ_DB" -eq 0 ]; then
  echo "::error::A webgyökér ÜRESEN maradt. Ez súlyos hiba — azonnal telepíts újra."
  exit 1
fi
