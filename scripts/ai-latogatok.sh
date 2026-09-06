#!/usr/bin/env bash
# Jelentés arról, MELY AI-ROBOTOK jártak a weblapon és mit olvastak.
#
# MIÉRT EZ, ÉS MIÉRT NEM „BEJELENTKEZÉS AZ AI-OKNÁL"
#   Nincs olyan csatorna, ahová egy weblap bejelentkezhetne egy nyelvi
#   modellnél. A ChatGPT-nek, a Claude-nak és a Gemininek nincs
#   „regisztráld a céged" végpontja. Egy AI háromféleképpen tud rólunk:
#   a tanítóadatból (oda nem lehet beküldeni), a válaszadáskori keresésből
#   (ide hatunk: Bing-index + IndexNow + llms.txt), és a felhasználó által
#   bekötött csatlakozóból (ez az agent.php).
#
#   Amit tehát mérni ÉRDEMES, az nem az, hogy „értesítettük-e őket", hanem
#   hogy JÖNNEK-E. Ha a GPTBot heti rendszerességgel letölti az llms.txt-t,
#   akkor a gépi rétegünk dolgozik. Ha hónapok óta egyik sem járt itt, akkor
#   hiába írunk még több JSON-t — a baj máshol van.
#
# SZEMÉLYES ADAT NEM KERÜL A JELENTÉSBE
#   A napló látogatói IP-címeket tartalmaz. Ez a szkript kizárólag
#   ÖSSZESÍT: robotonkénti kérésszám, utolsó látogatás, és a leggyakrabban
#   lekért címek. IP-cím, hivatkozó és egyedi kérés soha nem kerül a
#   kimenetbe.
#
# Használat:  ai-latogatok.sh <webgyoker> <port> <user@gep>

set -uo pipefail

WEB_ROOT="${1:?hiányzik a webgyökér}"
PORT="${2:?hiányzik a port}"
CEL="${3:?hiányzik a user@gép}"

TAV() {
  ssh -i ~/.ssh/id_deploy -p "$PORT" -o StrictHostKeyChecking=yes "$CEL" "$1" 2>/dev/null
}

SZULO="$(dirname "$WEB_ROOT")"

echo "— AI-robotok látogatásai —"

# ——— A napló felderítése ————————————————————————————————————————
# A tárhely nem dokumentálja, hol tartja a hozzáférési naplót, ezért
# megkeressük. Csak a fiók saját fájlrendszerében nézünk, két szint mélyen —
# a rendszerszintű /var/log úgysem olvasható megosztott tárhelyen.
#
# A NÉV NEM ELÉG. Az első futásnál a keresés a saját send-errors.log-unkat
# találta meg, a szkript naplónak vette, és üres táblázatot írt ki — mintha
# megmértük volna, hogy egyetlen robot sem járt itt. Ez rosszabb, mint a
# semmi: hamis megnyugvás. Ezért minden jelöltbe BELE IS NÉZÜNK, és csak azt
# fogadjuk el, amiben tényleges HTTP-kéréssorok vannak. A saját naplónkat
# külön is kizárjuk, hogy a szándék a kódból is látsszon.
JELOLTEK=$(TAV "find '$SZULO' -maxdepth 2 \\( -name '*access*log*' -o -name '*.log' \\) -type f -size +0 2>/dev/null | head -40")
NAPLOK=$(TAV "for f in \$(find '$SZULO' -maxdepth 2 \\( -name '*access*log*' -o -name '*.log' \\) -type f -size +0 2>/dev/null | head -40); do
  case \"\$f\" in */send-errors.log) continue ;; esac
  head -c 200000 \"\$f\" 2>/dev/null | grep -qaE '\\\"(GET|HEAD|POST) ' && echo \"\$f\"
done")

if [ -z "$NAPLOK" ]; then
  if [ -n "$JELOLTEK" ]; then
    echo "  Találtam naplónak látszó fájlokat, de egyik sem hozzáférési napló"
    echo "  (nincs bennük HTTP-kéréssor):"
    printf '%s\n' "$JELOLTEK" | sed 's/^/    /'
    echo
  fi
  echo "  A tárhelyen nem találtam hozzáférési naplót."
  echo

  # ——— Második út: a szolgáltató kimutatása ————————————————————
  # Megosztott tárhelyen a nyers napló gyakran nem érhető el, viszont a
  # szolgáltató készít belőle AWStats-kimutatást, és annak VAN külön
  # robot-szakasza. Az adatfájl szöveges (awstats<HH><ÉÉÉÉ>.<hely>.txt),
  # és a BEGIN_ROBOT … END_ROBOT blokkban soronként ez áll:
  #   robot-azonosító  kérés  forgalom  utolsó-látogatás  robots.txt-kérés
  # Ez pontosan az, amit keresünk — csak nem mi számoltuk össze.
  AWSTATS=$(TAV "find '$SZULO' -maxdepth 3 -name 'awstats*.txt' -type f -size +0 2>/dev/null | sort | tail -6")

  if [ -n "$AWSTATS" ]; then
    echo "  Van viszont AWStats-kimutatás — abban a szolgáltató maga számolta"
    echo "  össze a robotokat. A legutóbbi hónapok fájljai:"
    printf '%s\n' "$AWSTATS" | sed 's/^/    /'
    echo
    echo "  robot (az AWStats saját elnevezésével)   kérés   utoljára"
    AWFAJLOK=$(printf '%s\n' "$AWSTATS" | tr '\n' ' ')
    TAV "cat $AWFAJLOK 2>/dev/null | awk '
      /^BEGIN_ROBOT/ { b = 1; next }
      /^END_ROBOT/   { b = 0 }
      b && NF >= 4 {
        db[\$1] += \$2
        if (\$4 > u[\$1]) u[\$1] = \$4
      }
      END {
        for (k in db)
          printf \"    %-38s %6d   %s\n\", k, db[k],
                 substr(u[k],1,4) \"-\" substr(u[k],5,2) \"-\" substr(u[k],7,2)
      }' | sort -k2 -rn | head -25" || echo "    (a kimutatás nem olvasható)"
    echo
    echo "  Megjegyzés: az AWStats a saját robotlistája szerint sorol be, ami"
    echo "  nem azonos a mi huszonegy nevünkkel — egy ismeretlen új AI-robot"
    echo "  könnyen a „névtelen” sorba kerülhet nála."
    exit 0
  fi

  # ——— Harmadik út: legalább derítsük fel, mihez nyúlhatnánk ————
  # Ha kimutatás sincs, ne csak annyit mondjunk, hogy „nem megy”. Nézzük
  # meg, milyen statisztika-mappa létezik egyáltalán a fiókban, hogy a
  # következő körben legyen mit megnyitni.
  STATOK=$(TAV "find '$SZULO' -maxdepth 1 -type d \\( -name 'stat*' -o -iname '*webalizer*' -o -iname '*awstats*' \\) 2>/dev/null")
  if [ -n "$STATOK" ]; then
    echo "  Statisztika-mappa viszont van, csak nem ismerem a formátumát:"
    printf '%s\n' "$STATOK" | sed 's/^/    /'
    TAV "ls -1 $(printf '%s\n' "$STATOK" | tr '\n' ' ') 2>/dev/null | head -15" | sed 's/^/      /'
    echo
  fi

  echo "  Ez megosztott tárhelyen szokásos: a naplót gyakran csak a szolgáltató"
  echo "  vezérlőpultja mutatja meg, fájlként nem érhető el. Ilyenkor az"
  echo "  AI-robotok látogatását innen nem tudjuk mérni — a vezérlőpult"
  echo "  látogatottsági kimutatása viszont megmutathatja."
  echo "  Amit ettől függetlenül tudunk: a gépi réteg elérhető (ezt a telepítés"
  echo "  minden futásban ellenőrzi), és az IndexNow minden változást bejelent."
  exit 0
fi

echo "  hozzáférési naplók:"
printf '%s\n' "$NAPLOK" | sed 's/^/    /'

# ——— A robotok, akiket keresünk ————————————————————————————————
# Ugyanaz a lista, mint a robots.txt-ben nevesítettek, plusz a két nagy
# keresőrobot: a ChatGPT a Bing indexéből dolgozik, a Gemini a Google-éból,
# tehát a bingbot és a Googlebot látogatása közvetve AI-láthatóság is.
ROBOTOK=(
  GPTBot OAI-SearchBot ChatGPT-User
  ClaudeBot Claude-User Claude-SearchBot
  PerplexityBot Perplexity-User
  Google-Extended Applebot-Extended Applebot
  CCBot meta-externalagent meta-externalfetcher
  Amazonbot Bytespider cohere-ai
  MistralAI-User DuckAssistBot
  bingbot Googlebot
)

# Egyetlen távoli parancs az egészre: a napló nagy lehet, és minden robotra
# külön SSH-t nyitni lassú és fölösleges.
MINTA=$(IFS='|'; echo "${ROBOTOK[*]}")
FAJLOK=$(printf '%s\n' "$NAPLOK" | tr '\n' ' ')

echo
echo "  robot                    kérés   utoljára"
# A dátumot RENDEZHETŐ alakra hozzuk (2026-09-06), mielőtt összehasonlítanánk.
# A napló „06/Sep/2026” alakja szövegként rosszul rendeződik: a „06/Sep” kisebb
# lenne, mint a „31/Aug”, tehát az „utoljára” oszlop hazudna.
TAV "cat $FAJLOK 2>/dev/null | grep -aE '$MINTA' | awk -v minta='$MINTA' '
BEGIN {
  split(\"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec\", h, \" \")
  for (i = 1; i <= 12; i++) ho[h[i]] = sprintf(\"%02d\", i)
}
{
  n = split(minta, r, \"|\")
  for (i = 1; i <= n; i++) {
    if (index(\$0, r[i]) > 0) {
      db[r[i]]++
      if (match(\$0, /\\[[0-9][0-9]\\/[A-Za-z][A-Za-z][A-Za-z]\\/[0-9][0-9][0-9][0-9]/)) {
        nyers = substr(\$0, RSTART+1, 11)
        d = substr(nyers, 8, 4) \"-\" ho[substr(nyers, 4, 3)] \"-\" substr(nyers, 1, 2)
        if (d > utolso[r[i]]) utolso[r[i]] = d
      }
      break
    }
  }
}
END { for (k in db) printf \"    %-22s %6d   %s\n\", k, db[k], utolso[k] }
' | sort -k2 -rn" || echo "    (a napló nem olvasható)"

echo
echo "  a leggyakrabban lekért címek AI-robotoktól:"
TAV "cat $FAJLOK 2>/dev/null | grep -aE '$MINTA' | grep -aoE '\"(GET|HEAD) [^ ?\"]+' | awk '{print \$2}' | sort | uniq -c | sort -rn | head -12" \
  | sed 's/^/    /' || echo "    (nem olvasható)"

echo
echo "  Megjegyzés: a jelentés csak összesít — IP-cím és egyedi kérés nem kerül bele."
