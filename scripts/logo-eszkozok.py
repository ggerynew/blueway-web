# -*- coding: utf-8 -*-
"""A logó kimeneti fájljainak előállítása az újraszedett képkockákból.

A `logo-betukoz.py` a 145 átlátszó képkockát írja ki (1008×288). Ebből
készül az öt fájl, amit a weblap és a bluewaytrade.us használ:

    public/images/brand/blueway-logo-anim.webp            504×144, animált
    public/images/brand/blueway-logo-still-atlatszo.png   504×144, átlátszó
    public/images/brand/blueway-logo-still.png            504×144, fehér alapon
    server/us/blueway-logo-anim.webp                     1008×288, animált
    server/us/blueway-logo-still.png                     1008×288, átlátszó

Két dolog, ami nem magától értetődő:

Minden MÁSODIK kockát tartjuk meg, és megdupláltuk a képkocka-időt
(42 → 83 ms). A fogaskerekek lassan forognak, tehát a felére csökkentett
képkockaszám nem látszik, a fájl viszont feleakkora.

A fehér alapú PNG nem külön rajz, hanem az átlátszó kompozitja fehérre.
Régebben ez a fájl kimaradt a frissítésből, és a 404-es lapon meg a
schema.org adatokban még a régi betűközzel jelent meg a logó.
"""
import glob
import pathlib

import numpy as np
from PIL import Image

SC = pathlib.Path('/tmp/claude-0/-home-user-blueway-web/2ebbcacd-f1b9-5af6-8a4a-448ae5002e3f/scratchpad')
FORRAS = sorted(glob.glob(str(SC / 'ujkockak' / '*.png')))

LEPES = 2       # minden második kocka
IDO = 83        # ms/kocka — a 42 ms kétszerese

#: A WebP tömörítés minősége. Mindkét kép jóval kisebbre skálázva jelenik
#: meg (a fejlécben ~140, a .us lapon legfeljebb 720 CSS képpont széles),
#: ezért a 75 nem látszik meg rajta: sávosodás nincs, a kontúrok élesek.
#: Cserébe a fejléc logója minden oldalon ~110 kB-tal könnyebb.
MINOSEG = 75
#: A method=6 mindössze 1,5%-ot farag a méreten, viszont sokszoros idő.
MODSZER = 4


def main():
    if not FORRAS:
        raise SystemExit(f'nincs képkocka itt: {SC / "ujkockak"}')

    nagy = [Image.open(f).convert('RGBA') for f in FORRAS[::LEPES]]
    kicsi = [k.resize((k.width // 2, k.height // 2), Image.LANCZOS) for k in nagy]
    print(f'{len(FORRAS)} kockából {len(nagy)} marad, {nagy[0].size} és {kicsi[0].size}')

    def anim(kockak, cel):
        kockak[0].save(cel, save_all=True, append_images=kockak[1:],
                       duration=IDO, loop=0, quality=MINOSEG, method=MODSZER)

    def feherre(im):
        h = Image.new('RGBA', im.size, (255, 255, 255, 255))
        return Image.alpha_composite(h, im).convert('RGB')

    anim(kicsi, 'public/images/brand/blueway-logo-anim.webp')
    kicsi[0].save('public/images/brand/blueway-logo-still-atlatszo.png')
    feherre(kicsi[0]).save('public/images/brand/blueway-logo-still.png')

    anim(nagy, 'server/us/blueway-logo-anim.webp')
    nagy[0].save('server/us/blueway-logo-still.png')

    for f in ('public/images/brand/blueway-logo-anim.webp',
              'public/images/brand/blueway-logo-still-atlatszo.png',
              'public/images/brand/blueway-logo-still.png',
              'server/us/blueway-logo-anim.webp',
              'server/us/blueway-logo-still.png'):
        im = Image.open(f)
        print(f'{f}  {im.size}  {getattr(im, "n_frames", 1)} kocka  '
              f'{round(pathlib.Path(f).stat().st_size / 1024)} kB')


if __name__ == '__main__':
    main()
