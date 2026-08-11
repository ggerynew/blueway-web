#!/usr/bin/env python3
"""
A fejléc animált logójának méretre igazítása.

Miért. A blueway-logo-anim.webp 504×144 képpontos volt és 922 kB — minden
lap legnehezebb erőforrása, miközben a fejléc 168×48 CSS-képponton mutatja.
Kétszeres képpontsűrűségre 336×96 elég; a különbség a fejlécben nagyítóval
sem látszik (összevetve képkockánként), a fájl viszont 585 kB.

A bemenet a public-ban lévő MEGLÉVŐ fájl, mert az eredeti képkocka-sorozat
(logo-betukoz.py kimenete) munkamappában élt, és már nincs meg. Ebből
következik a védőkorlát: ha a fájl már 336 széles, a szkript NEM ír semmit —
az újratömörítés ismételgetése generációs veszteséget halmozna.

A bluewaytrade.us átmeneti lapjának 1008-as változatához szándékosan nem
nyúlunk: ott a logó 720 CSS-képponton áll, a tömörítés mérve alig nyer
(1751 → 1434 kB), és a lap úgyis ideiglenes.

Használat:
    python3 scripts/logo-anim-tomorit.py
"""

import os
import pathlib

from PIL import Image

GYOKER = pathlib.Path(__file__).resolve().parent.parent
FAJL = GYOKER / 'public/images/brand/blueway-logo-anim.webp'
CEL_SZELESSEG = 336
MINOSEG = 70


def main() -> None:
    im = Image.open(FAJL)
    if im.width <= CEL_SZELESSEG:
        print(f'már {im.width} képpont széles — nincs teendő (generációs veszteség ellen).')
        return

    elotte = os.path.getsize(FAJL)
    magassag = round(im.height * CEL_SZELESSEG / im.width)
    kockak, idok = [], []
    for i in range(im.n_frames):
        im.seek(i)
        kockak.append(im.convert('RGBA').resize((CEL_SZELESSEG, magassag), Image.LANCZOS))
        # A kockánkénti időzítés öröklődik — a logónál egységes 83 ms.
        idok.append(im.info.get('duration', 83))

    kockak[0].save(
        FAJL, save_all=True, append_images=kockak[1:], duration=idok,
        loop=0, quality=MINOSEG, method=6,
    )
    utana = os.path.getsize(FAJL)
    print(f'{FAJL.name}: {elotte // 1024} kB → {utana // 1024} kB '
          f'({im.width}×{im.height} → {CEL_SZELESSEG}×{magassag}, {len(kockak)} kocka)')


if __name__ == '__main__':
    main()
