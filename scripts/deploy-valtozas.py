#!/usr/bin/env python3
"""Csak a ténylegesen megváltozott fájlokat készíti elő feltöltésre.

MIÉRT
  A build kimenete 158 MB, ebből 77 MB adatlap-PDF, 2,4 MB termékfotó és
  0,7 MB videó. Ezek hónapokig egy bájtot sem változnak, az FTP-s deploy
  mégis minden futásban újratöltötte mindet — ez a tíz percből nyolc.

  Az lftp `--only-newer` itt nem segít: a futtató minden alkalommal üres
  gépen, frissen állítja elő a fájlokat, tehát a helyi módosítási idő MINDIG
  frissebb a szerveren lévőnél, akkor is, ha a tartalom azonos. A méret
  szerinti összehasonlítás (`--ignore-time`) viszont csendben kihagyna egy
  azonos hosszúságú javítást — egy elgépelés kijavítása nem kerülne ki.

  Ezért TARTALOM szerint döntünk: minden fájlról sha256 lenyomat készül, és
  a szerveren tárolt előző lenyomatlistával hasonlítjuk össze. Ami nem
  szerepel benne, vagy más a lenyomata, az megy fel — más semmi.

MIÉRT A SZERVEREN TÁROLJUK A LISTÁT
  Mert a kérdés nem az, hogy mi változott az előző BUILD óta, hanem az, hogy
  mi tér el attól, ami a SZERVEREN van. Egy megszakadt vagy visszavont deploy
  után csak ez a kettő ad helyes választ. A lista a webgyökérbe kerül, a
  .htaccess pedig nem szolgálja ki (lásd a deploy-manifest.json szabályt).

BIZTONSÁGI FÉK
  Ha a lenyomatlista hiányzik (első futás, vagy törölték), a szkript nem
  találgat: mindent felküldendőnek jelöl. Így egy elveszett lista legfeljebb
  egy lassú deployt okoz, sosem hiányzó fájlt.

HASZNÁLAT
  python3 scripts/deploy-valtozas.py --mappa out --elozo elozo.json \
      --stage stage --uj deploy-manifest.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path


def lenyomat(ut: Path) -> str:
    h = hashlib.sha256()
    with ut.open('rb') as f:
        for darab in iter(lambda: f.read(1 << 20), b''):
            h.update(darab)
    return h.hexdigest()


def betolt(ut: Path | None) -> dict[str, str]:
    """Az előző lenyomatlista. Hiányzó vagy sérült fájl esetén üres —
    ilyenkor minden felkerül, ami biztonságos, csak lassú."""
    if not ut or not ut.is_file() or ut.stat().st_size == 0:
        return {}
    try:
        adat = json.loads(ut.read_text(encoding='utf-8'))
    except (ValueError, OSError) as hiba:
        print(f'  ! az előző lenyomatlista nem olvasható ({hiba}) — teljes feltöltés', file=sys.stderr)
        return {}
    fajlok = adat.get('fajlok') if isinstance(adat, dict) else None
    return fajlok if isinstance(fajlok, dict) else {}


def emberi(bajt: int) -> str:
    for egyseg, hatar in (('GB', 1 << 30), ('MB', 1 << 20), ('kB', 1 << 10)):
        if bajt >= hatar:
            return f'{bajt / hatar:.1f} {egyseg}'
    return f'{bajt} B'


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--mappa', required=True, type=Path, help='a build kimenete (out)')
    p.add_argument('--elozo', type=Path, help='a szerverről letöltött előző lenyomatlista')
    p.add_argument('--stage', required=True, type=Path, help='ide kerülnek a feltöltendők')
    p.add_argument('--uj', required=True, type=Path, help='az új lenyomatlista útvonala')
    a = p.parse_args()

    if not a.mappa.is_dir():
        print(f'::error::Nincs meg a build kimenete: {a.mappa}', file=sys.stderr)
        return 1

    regi = betolt(a.elozo)
    if a.stage.exists():
        shutil.rmtree(a.stage)

    mostani: dict[str, str] = {}
    valtozott: list[tuple[str, int]] = []
    ossz_bajt = valtozott_bajt = 0

    for ut in sorted(a.mappa.rglob('*')):
        if not ut.is_file():
            continue
        nev = ut.relative_to(a.mappa).as_posix()
        meret = ut.stat().st_size
        jel = lenyomat(ut)
        mostani[nev] = jel
        ossz_bajt += meret
        if regi.get(nev) == jel:
            continue
        valtozott.append((nev, meret))
        valtozott_bajt += meret
        cel = a.stage / nev
        cel.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ut, cel)

    # A lenyomatlista maga is felmegy, méghozzá a feltöltendők között — de
    # csak a sikeres tükrözés UTÁN íratjuk ki a szerverre (lásd a
    # munkafolyamatot), különben egy félbeszakadt deploy után a szerver azt
    # állítaná magáról, hogy naprakész.
    a.uj.parent.mkdir(parents=True, exist_ok=True)
    a.uj.write_text(
        json.dumps({'fajlok': mostani}, ensure_ascii=False, sort_keys=True, indent=0),
        encoding='utf-8',
    )

    torolt = sorted(set(regi) - set(mostani))

    print(f'fájl a buildben:     {len(mostani)}  ({emberi(ossz_bajt)})')
    if not regi:
        print('előző lenyomatlista: nincs — minden fájl felkerül')
    else:
        print(f'előző lenyomatlista: {len(regi)} fájl')
    print(f'feltöltendő:         {len(valtozott)}  ({emberi(valtozott_bajt)})')
    if ossz_bajt:
        print(f'megtakarítás:        {emberi(ossz_bajt - valtozott_bajt)} '
              f'({1 - valtozott_bajt / ossz_bajt:.1%} nem megy fel újra)')
    for nev, meret in valtozott[:40]:
        print(f'  + {nev}  ({emberi(meret)})')
    if len(valtozott) > 40:
        print(f'  … és további {len(valtozott) - 40} fájl')
    if torolt:
        # Nem töröljük őket: a deploy alapból nem nyúl a szerveren lévő
        # idegen fájlokhoz (a régi weblap maradéka is ott van még). Kiírjuk,
        # hogy látszódjon, mi az, ami már nincs a buildben.
        print(f'a buildből kikerült: {len(torolt)} fájl (a szerveren marad, '
              f'takarításhoz a delete_extra kapcsoló való)')
        for nev in torolt[:20]:
            print(f'  - {nev}')

    # A munkafolyamat ebből tudja, kell-e egyáltalán tükrözni.
    print(f'VALTOZOTT={len(valtozott)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
