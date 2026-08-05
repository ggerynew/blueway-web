# -*- coding: utf-8 -*-
"""Kicsinyített képek a főoldali csempefalhoz.

A falon minden termék fotója 82×62 képpontos csempén jelenik meg, a
termékoldali képek viszont 800–900 képpont szélesek — a főoldal így ~2 MB
képet töltött le, amiből a látogató ötvenedrésznyit látott.

Ez a szkript a public/images/products/ tartalmából 164×124-es befoglalóra
kicsinyített (2×-es, tehát nagy felbontású kijelzőn is éles) változatokat
készít a public/images/tiles/ mappába. A főoldal ezekre hivatkozik.

Futtatása csak új termékkép felvételekor kell:  python3 scripts/csempe-kepek.py
Az eredmény a repóba kerül, mint a többi kép.
"""
import pathlib

from PIL import Image

FORRAS = pathlib.Path('public/images/products')
CEL = pathlib.Path('public/images/tiles')

#: A csempe CSS-mérete (82×62) kétszerese — nagy felbontású kijelzőre.
DOBOZ = (164, 124)


def main():
    CEL.mkdir(exist_ok=True)
    osszes_regi = osszes_uj = 0
    darab = 0
    for f in sorted(FORRAS.glob('*.webp')) + sorted(FORRAS.glob('*.jpg')):
        im = Image.open(f)
        im.thumbnail(DOBOZ, Image.LANCZOS)
        ki = CEL / (f.stem + '.webp')
        im.save(ki, 'WEBP', quality=82, method=6)
        osszes_regi += f.stat().st_size
        osszes_uj += ki.stat().st_size
        darab += 1
    print(f'{darab} csempekép: {osszes_regi // 1024} kB → {osszes_uj // 1024} kB '
          f'({100 * osszes_uj // max(1, osszes_regi)}%)')


if __name__ == '__main__':
    main()
