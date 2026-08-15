#!/usr/bin/env python3
"""
Az animált logó egyszeres képpontsűrűségű változata.

Miért. A fejléc a logót 168×48 CSS-képponton mutatja, a fájl viszont 336×96 —
kétszeres sűrűségre méretezve. Retina kijelzőn ez helyes, közönséges irodai
monitoron viszont a böngésző a képpontok felét eldobja: 585 kB-ot tölt le
azért, hogy 260 kB-nyi információt mutasson. Márpedig a látogatóink jó része
irodai gépen ül.

A megoldás nem a 336-os fájl rontása, hanem egy MÁSODIK fájl: a `<picture>`
`srcset`-je sűrűségjelzővel („1x", „2x") választ közülük, és a böngésző csak
azt az egyet tölti le, amelyik a kijelzőjéhez való.

Miért a meglévő 336-os fájlból dolgozunk. Az eredeti képkocka-sorozat
(logo-betukoz.py kimenete) munkamappában élt, és már nincs meg — ugyanaz a
helyzet, mint a logo-anim-tomorit.py-nál. A felezéssel járó átlagolás elfedi
a q70-es tömörítés nyomait, tehát a generációs veszteség itt nem gyűlik: a
kimenet mindig ugyanabból az egy forrásból készül újra.

Használat:
    python3 scripts/logo-anim-1x.py
"""

import os
import pathlib

from PIL import Image

GYOKER = pathlib.Path(__file__).resolve().parent.parent
FORRAS = GYOKER / 'public/images/brand/blueway-logo-anim.webp'
CEL = GYOKER / 'public/images/brand/blueway-logo-anim-1x.webp'
CEL_SZELESSEG = 168
MINOSEG = 70


def main() -> None:
    im = Image.open(FORRAS)
    if im.width <= CEL_SZELESSEG:
        raise SystemExit(f'a forrás {im.width} képpont széles — ebből nem lesz 1x változat.')

    magassag = round(im.height * CEL_SZELESSEG / im.width)
    kockak, idok = [], []
    for i in range(im.n_frames):
        im.seek(i)
        kockak.append(im.convert('RGBA').resize((CEL_SZELESSEG, magassag), Image.LANCZOS))
        idok.append(im.info.get('duration', 83))

    kockak[0].save(
        CEL, save_all=True, append_images=kockak[1:], duration=idok,
        loop=0, quality=MINOSEG, method=6,
    )
    print(f'{CEL.name}: {os.path.getsize(CEL) // 1024} kB '
          f'({CEL_SZELESSEG}×{magassag}, {len(kockak)} kocka) — '
          f'a 2x változat {os.path.getsize(FORRAS) // 1024} kB')


if __name__ == '__main__':
    main()
