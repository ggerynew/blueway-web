#!/usr/bin/env python3
"""Összeállítja az IndexNow-bejelentés törzsét — csak a VÁLTOZOTT címekkel.

MIÉRT
  A telepítés eddig minden alkalommal mind a 907 címet bejelentette a
  Bingnek, akkor is, ha egyetlen betű változott. A Bing Webmaster Tools ezt
  2026 szeptemberében név szerint kifogásolta:

      „Avoid IndexNow Batch Mode to prevent excessive server load and
       potential indexing delays."

  Az IndexNow arra való, hogy megmondjuk, MI ÚJ. Ha mindig mindent
  bejelentünk, a jelzés semmit nem mond, a kereső pedig a saját ütemében
  térképez fel újra — tehát épp azt veszítjük el, amiért az egészet
  bekötöttük.

HONNAN TUDJUK, MI VÁLTOZOTT
  Két forrás van, mert a telepítésnek két ága van, és mindkettő tartalom
  szerint dönt, nem fájlidő szerint:

    --lista   az SSH-s ág: az rsync --out-format=%n kimenete, --checksum
              mellett. Ez az éles út.
    --stage   az FTP-s tartalék ág: a deploy-valtozas.py ide másolja a
              megváltozott fájlokat, sha256 alapján.

MIÉRT METSZÜNK A SITEMAPPEL
  Mert nem minden HTML lap tartozik a nyilvános címtérbe: a 404-es lap, a
  gyökér nyelvválasztója és a lapozás segédfájljai nem valók a keresőbe. A
  sitemap a mérvadó lista; ami nincs benne, azt nem jelentjük be. Ez egyben
  az útvonal→cím fordítást is elvégzi: a lapok kiterjesztés nélküli címen
  élnek (/hu/rolunk), a kézzel írt jogi oldalak viszont .html-lel — a két
  alakot nem kell külön szabályba önteni, elég megnézni, melyik szerepel a
  sitemapben.

BIZTONSÁGI FÉK
  Ha a stage mappa hiányzik (teljes tükrözés, első futás, vagy elveszett
  lenyomatlista), nem találgatunk: a TELJES listát jelentjük be, ahogy
  eddig. Egy fölösleges teljes bejelentés nem árt; egy elmaradt viszont
  azt jelenti, hogy egy új lap hetekig nem kerül be.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def sitemap_cimek(sitemap: Path) -> list[str]:
    szoveg = sitemap.read_text(encoding='utf-8')
    return [m.group(1) for m in re.finditer(r'<loc>([^<]+)</loc>', szoveg)]


def cimre(relativ_utak: list[str], gyoker_cim: str, ismert: set[str]) -> list[str]:
    """Relatív fájlutakból címek, a sitemappel metszve, sorrendtartóan."""
    talalt: list[str] = []
    latott: set[str] = set()
    for rel in relativ_utak:
        rel = rel.strip().lstrip('./')
        if not rel.endswith('.html'):
            continue
        # Mindkét alakot megpróbáljuk: a lapok kiterjesztés nélkül élnek, a
        # kézzel írt jogi oldalak viszont .html-lel szerepelnek a sitemapben.
        for jelolt in (f'{gyoker_cim}{rel[:-len(".html")]}', f'{gyoker_cim}{rel}'):
            if jelolt in ismert and jelolt not in latott:
                talalt.append(jelolt)
                latott.add(jelolt)
                break
    return talalt


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--sitemap', required=True, type=Path)
    p.add_argument('--hoszt', required=True)
    p.add_argument('--kulcs', required=True)
    p.add_argument('--kimenet', required=True, type=Path)
    p.add_argument('--stage', type=Path, help='a megváltozott fájlok mappája (FTP-s ág)')
    p.add_argument('--lista', type=Path, help='megváltozott fájlutak soronként (SSH-s ág)')
    a = p.parse_args()

    mind = sitemap_cimek(a.sitemap)
    if not mind:
        print('HIBA: a sitemap egyetlen címet sem tartalmaz', file=sys.stderr)
        return 1

    gyoker_cim = f'https://{a.hoszt}/'
    ismert = set(mind)

    if a.lista and a.lista.is_file():
        utak = a.lista.read_text(encoding='utf-8').splitlines()
        cimek = cimre(utak, gyoker_cim, ismert)
        mod = 'valtozott'
    elif a.stage and a.stage.is_dir():
        utak = [u.relative_to(a.stage).as_posix() for u in sorted(a.stage.rglob('*.html'))]
        cimek = cimre(utak, gyoker_cim, ismert)
        mod = 'valtozott'
    else:
        cimek = mind
        mod = 'teljes'

    # Az IndexNow egy kérésben legfeljebb 10 000 címet fogad.
    if len(cimek) > 10000:
        cimek = cimek[:10000]

    a.kimenet.write_text(
        json.dumps(
            {
                'host': a.hoszt,
                'key': a.kulcs,
                'keyLocation': f'{gyoker_cim}{a.kulcs}.txt',
                'urlList': cimek,
            }
        ),
        encoding='utf-8',
    )
    print(f'MOD={mod}')
    print(f'DB={len(cimek)}')
    print(f'OSSZES={len(mind)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
