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
NAPLOK=$(TAV "find '$SZULO' -maxdepth 2 \\( -name '*access*log*' -o -name '*.log' \\) -type f -size +0 2>/dev/null | head -20")

if [ -z "$NAPLOK" ]; then
  echo "  A tárhelyen nem találtam hozzáférési naplót."
  echo "  Ez megosztott tárhelyen szokásos: a naplót gyakran csak a szolgáltató"
  echo "  vezérlőpultja mutatja meg, fájlként nem érhető el. Ilyenkor az"
  echo "  AI-robotok látogatását innen nem tudjuk mérni — a vezérlőpult"
  echo "  látogatottsági kimutatása viszont megmutathatja."
  echo "  Amit ettől függetlenül tudunk: a gépi réteg elérhető (ezt a telepítés"
  echo "  minden futásban ellenőrzi), és az IndexNow minden változást bejelent."
  exit 0
fi

echo "  megtalált naplófájlok:"
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
