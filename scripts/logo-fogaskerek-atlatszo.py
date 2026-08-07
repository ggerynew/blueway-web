#!/usr/bin/env python3
"""
A Blueway-logó fogaskerekeinek belsejéből kiveszi a bent maradt fehér hátteret.

A logó átlátszó változataiban a kerekek KÖRÜL átlátszó a kép, a kerekek
BELSEJÉBEN viszont ott maradt a fehér — az eredeti vágás csak a külső
kontúrt követte. Világos fejlécen ez nem tűnik fel, sötét háttéren viszont
három fehér folt lesz belőle.

A javítás nem egyszerű „fehéret átlátszóra": az úgy recés, fehér szegélyes
peremet hagyna. Amit csinál:

  1. Megkeresi a szinte tiszta fehér, összefüggő foltokat — ezek a furatok —,
     és csak néhány képponttal tágítja őket, hogy az átmenet is beleférjen.
     A kerék világoskék teste így érintetlen marad, pedig önmagában az is
     világos.
  2. A folton belül a fehérség mértékéből számol átlátszóságot: a tiszta
     fehér teljesen eltűnik, a fehér és a sötét fogaskerék közti átmeneti
     képpontok arányosan halványodnak. Ettől marad sima a perem.
  3. A megmaradó színt visszaszámolja fehér háttérből (un-premultiply),
     különben a félig átlátszó szélek fehéres fátylat hagynának.

Használat:
    python3 scripts/logo-fogaskerek-atlatszo.py <fájl> [<fájl> ...]

PNG-t és animált WebP-t is kezel; a WebP minden képkockáján végigmegy, mert
a kerekek forognak, tehát a furat képkockánként máshol van.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
from collections import deque

import numpy as np
from PIL import Image, ImageSequence

# Két küszöb, mert egy nem elég. A MAG szigorú: csak a szinte tiszta fehér
# számít furatnak. A PEREM engedékeny: eddig terjeszkedünk a magból kifelé,
# hogy a fehér és a sötét fogaskerék közti átmenet is halványodjon.
#
# Miért nem elég egy küszöb: a kerék világoskék felülete önmagában is világos
# (a legkisebb csatornája 180 körül), tehát egyetlen laza küszöb a kerék
# TESTÉT is fehérnek nézné, és kilyukasztaná. A mag ott viszont sehol nincs
# meg, a furatot pedig sötét gyűrű zárja körbe — a terjeszkedés megáll rajta.
MAG_KUSZOB = 235
PEREM_KUSZOB = 180

# Ennél kisebb fehér foltot nem bántunk: a feliratban van néhány egy-két
# képpontos világos szemcse, azokból nem akarunk tűszúrásokat csinálni.
LEGKISEBB_MAG = 100

# Ennyi képponttal tágítjuk a magot, hogy az átmenet is belekerüljön.
PEREM_TAGITAS = 2

# Az animált WebP újratömörítésének minősége. Az eredeti is veszteséges volt,
# tehát ez már a második menet — magasabb értékkel csak a fájl hízna, látható
# nyereség nélkül: a logó a fejlécben 48 képpont magasan jelenik meg, a kép
# viszont 144, tehát harmadára kicsinyítve.
WEBP_MINOSEG = 80


def _legkisebb_csatorna(a: np.ndarray) -> np.ndarray:
    return np.minimum(np.minimum(a[..., 0], a[..., 1]), a[..., 2])


def folt_maszk(a: np.ndarray) -> np.ndarray:
    """Az a terület, ameddig a magból terjeszkedhetünk."""
    return (a[..., 3] > 0) & (_legkisebb_csatorna(a) >= PEREM_KUSZOB)


def _tagit(maszk: np.ndarray, mennyivel: int) -> np.ndarray:
    """A maszk kiterjesztése néhány képponttal, minden irányba."""
    ki = maszk.copy()
    for _ in range(mennyivel):
        elozo = ki
        ki = elozo.copy()
        ki[1:, :] |= elozo[:-1, :]
        ki[:-1, :] |= elozo[1:, :]
        ki[:, 1:] |= elozo[:, :-1]
        ki[:, :-1] |= elozo[:, 1:]
    return ki


def furat_maszk(a: np.ndarray) -> np.ndarray:
    """
    A kitakarítandó terület: a fehér furatok és a peremük.

    A magok (szinte tiszta fehér foltok) köré csak PEREM_TAGITAS képpontot
    terjeszkedünk, nem szabadon. Ez azért fontos, mert a bal felső kerék
    furata a kép tetején ki van vágva, és a világoskék keréktesten át elér a
    képszélig — szabad terjeszkedéssel vagy a fél kereket kilyukasztanánk,
    vagy (ha a képszélhez érő foltot eldobjuk) épp ezt a furatot hagynánk
    fehéren. A fehér és a sötét gyűrű közti átmenet egy-két képpont széles,
    ennyi tágítás tehát pont elég, és semmi máshoz nem ér hozzá.
    """
    mag = (a[..., 3] > 0) & (_legkisebb_csatorna(a) >= MAG_KUSZOB)
    magas, szeles = mag.shape
    elfogadott = np.zeros_like(mag, dtype=bool)
    latott = np.zeros_like(mag, dtype=bool)

    for y0 in range(magas):
        for x0 in range(szeles):
            if not mag[y0, x0] or latott[y0, x0]:
                continue
            sor = deque([(y0, x0)])
            latott[y0, x0] = True
            folt = []
            while sor:
                y, x = sor.popleft()
                folt.append((y, x))
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < magas and 0 <= nx < szeles \
                                and mag[ny, nx] and not latott[ny, nx]:
                            latott[ny, nx] = True
                            sor.append((ny, nx))
            if len(folt) >= LEGKISEBB_MAG:
                ys, xs = zip(*folt)
                elfogadott[np.array(ys), np.array(xs)] = True

    if not elfogadott.any():
        return elfogadott
    return _tagit(elfogadott, PEREM_TAGITAS) & folt_maszk(a)


def kepkocka_javit(kep: Image.Image):
    """Egy képkocka javítása. Visszaadja az új képet és a törölt képpontszámot."""
    a = np.array(kep.convert('RGBA')).astype(np.float64)
    cel = furat_maszk(a)
    if not cel.any():
        return kep.convert('RGBA'), 0

    minc = _legkisebb_csatorna(a)
    # 1.0 a tiszta fehérnél (teljesen eltűnik), 0.0 a küszöbnél (marad).
    fedes = np.clip((255.0 - minc) / (255.0 - PEREM_KUSZOB), 0.0, 1.0)

    uj = a.copy()
    # Szín visszaszámolása fehér háttérből, csak ahol marad valami látható.
    marad = cel & (fedes > 0.004)
    for cs in range(3):
        c = a[..., cs]
        uj[..., cs] = np.where(
            marad,
            np.clip((c - 255.0 * (1.0 - fedes)) / np.maximum(fedes, 1e-6), 0, 255),
            c,
        )
    uj[..., 3] = np.where(cel, a[..., 3] * fedes, a[..., 3])
    torolt = int((cel & (uj[..., 3] < 8)).sum())
    return Image.fromarray(uj.round().astype(np.uint8), 'RGBA'), torolt


def idozites(ut: str):
    """
    Képkocka-időzítés ezredmásodpercben, a forrásfájlból.

    A Pillow ennél az animált WebP-nél nem adja vissza (mindenhol None), a
    webpmux viszont kiírja. Ez nem szépészeti kérdés: rossz időzítéssel a
    fogaskerekek más sebességgel forognának, mint eddig.
    """
    try:
        ki = subprocess.run(['webpmux', '-info', ut], capture_output=True,
                            text=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError):
        return None
    sorok = re.findall(r'^\s*\d+:\s+\d+\s+\d+\s+\w+\s+\d+\s+\d+\s+(\d+)', ki, re.M)
    return [int(x) for x in sorok] or None


def animacio_ment(ut: str, kockak, ido) -> None:
    """
    Animált WebP visszaírása.

    Miért img2webp és nem a Pillow: a Pillow minden képkockát TELJES képként
    ír ki, az eredeti viszont csak a megváltozott részt tárolja képkockánként
    (a naplója szerint 504×144 helyett 378×144, 182×144 kivágásokkal). Emiatt
    a Pillow kimenete négyszer akkora lett. Az img2webp `-min_size` kapcsolója
    ugyanazt a részképkocka-szerkezetet állítja elő.
    """
    if not shutil.which('img2webp'):
        raise SystemExit(
            'Hiányzik az img2webp. Enélkül az animáció négyszeresére hízna.\n'
            '  Ubuntu/Debian:  apt-get install webp\n'
            '  macOS:          brew install webp'
        )
    with tempfile.TemporaryDirectory() as mappa:
        nevek = []
        for i, k in enumerate(kockak):
            nev = os.path.join(mappa, f'{i:04d}.png')
            k.save(nev)
            nevek.append(nev)
        parancs = ['img2webp', '-loop', '0', '-lossy', '-min_size',
                   '-q', str(WEBP_MINOSEG), '-m', '6']
        if ido and len(set(ido)) == 1:
            parancs += ['-d', str(ido[0])]
            parancs += nevek
        elif ido:
            for h, nev in zip(ido, nevek):
                parancs += ['-d', str(h), nev]
        else:
            parancs += ['-d', '83'] + nevek
        parancs += ['-o', ut]
        subprocess.run(parancs, check=True, capture_output=True)


def fajl_javit(ut: str) -> None:
    kep = Image.open(ut)
    darab = getattr(kep, 'n_frames', 1)
    ido = idozites(ut) if darab > 1 else None
    ujak, osszes = [], 0
    for keret in ImageSequence.Iterator(kep):
        ujkep, torolt = kepkocka_javit(keret)
        ujak.append(ujkep)
        osszes += torolt
    elotte = os.path.getsize(ut)
    if darab > 1 and ut.lower().endswith('.webp'):
        animacio_ment(ut, ujak, ido)
    else:
        ujak[0].save(ut)
    print(f'{ut}: {darab} képkocka, {osszes} képpont lett átlátszó, '
          f'{elotte} → {os.path.getsize(ut)} bájt')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for ut in sys.argv[1:]:
        fajl_javit(ut)
