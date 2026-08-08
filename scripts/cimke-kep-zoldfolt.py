#!/usr/bin/env python3
"""
A „Címkék és festékszalagok" kép vonalkódos tekercsén lévő műtermék javítása.

Mit lát a látogató: a tekercs oldalán négy türkiz téglalap. Miért hiba: a
tekercs henger, a rajta lévő címkék a görbületet követik — a türkiz foltok
viszont tengelyre állított, éles sarkú téglalapok, körülöttük fehér glóriával.
Nem a címkék nyomata, hanem utólag a képre illesztett folt: egy összemásolás
maradványa.

A javítás: a foltokat a saját soruk két oldalán lévő ép képpontokból töltjük
ki. Ezek a foltok egy függőleges, nyomatlan sávban ülnek a tekercsen, tehát a
kitöltés eredménye sima világosszürke csík — pontosan az, aminek ott lennie
kell: a címkeszalag nyomatlan margója.

A maszkot három képponttal tágítjuk, mert a foltok körüli fehér glória is a
műtermék része; nélküle a folt eltűnne, a kerete viszont ottmaradna.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

MASZK_TAGITAS = 3
SIMITAS = 1.2


def zoldfolt_maszk(a: np.ndarray) -> np.ndarray:
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # Türkiz: a zöld csatorna érdemben a vörös fölött van, és a kék fölött is.
    # A felső korlát azért kell, hogy a fényes fehér ne kerüljön bele.
    zold = (g > r + 15) & (g > b + 5) & (g > 80) & (g < 200)
    return ndimage.binary_dilation(zold, np.ones((3, 3)), iterations=MASZK_TAGITAS)


def javit(kep: Image.Image) -> Image.Image:
    a = np.asarray(kep.convert('RGB')).astype(float)
    maszk = zoldfolt_maszk(a)
    if not maszk.any():
        return kep.convert('RGB')

    ki = a.copy()
    sorok = np.where(maszk.any(1))[0]
    for y in sorok:
        sor = maszk[y]
        ep = np.where(~sor)[0]
        if not ep.size:
            continue
        for x in np.where(sor)[0]:
            bal = ep[ep < x]
            jobb = ep[ep > x]
            minta = []
            if bal.size:
                minta.append(a[y, bal[-1]])
            if jobb.size:
                minta.append(a[y, jobb[0]])
            if minta:
                ki[y, x] = np.mean(minta, 0)

    # A soronkénti kitöltés függőlegesen csíkos lehet; a foltok BELSEJÉT
    # elsimítjuk. A pereme marad éles, hogy a környező vonalkód ne mosódjon el.
    belso = ndimage.binary_erosion(maszk, np.ones((3, 3)), iterations=1)
    ki[belso] = ndimage.gaussian_filter(ki, (SIMITAS, SIMITAS, 0))[belso]
    return Image.fromarray(np.clip(ki, 0, 255).astype(np.uint8))


def main(utvonalak: list[str]) -> None:
    for u in utvonalak:
        p = Path(u)
        eredeti = Image.open(p)
        elotte = np.asarray(eredeti.convert('RGB')).astype(float)
        db = zoldfolt_maszk(elotte).sum()
        javit(eredeti).save(p, 'WEBP', quality=88, method=6)
        print(f'{p.name}: {db} képpontnyi türkiz folt és glóriája kitöltve, '
              f'{p.stat().st_size / 1024:.1f} kB')


if __name__ == '__main__':
    main(sys.argv[1:])
