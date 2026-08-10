#!/usr/bin/env python3
"""
A böngészőfül- és a készülékikonok előállítása a logó fogaskerekeiből.

Miért kellett ez. A korábbi ikonok a fogaskerekek KIVÁGÁSAI voltak: a rajz
mind a négy szélén túlfutott, és fehér, átlátszatlan háttéren ült. Egy
böngészőfülön ez pont annyit mutatott, amennyi egy 16 képpontos négyzetbe
belefér a kép közepéből — vagyis egy levágott szélű folt, körülötte fehér
téglalappal, ami sötét témájú böngészőben külön feltűnt.

Amit ez a szkript csinál:

  1. A logó ÁTLÁTSZÓ változatából kivágja a fogaskerék-csoportot. A vágás
     helye nem találgatás: a felirat és a kerekek között nincs teljesen üres
     oszlop (a „Y” farka átnyúlik), ezért a vágási pont képkockánként lett
     kimérve, és az átlátszósági doboz vágja pontosra.
  2. Négyzetes vászon közepére teszi, arányosan kicsinyítve, KÖRBEN
     margóval. A margó nem díszítés: enélkül a rajz a fül ikonkeretének
     széléhez ragadna, és megint levágottnak látszana.
  3. Az átlátszóságot végig megtartja — a fül háttere világos és sötét
     témában is átüt.

A készülékikon (apple-icon) KIVÉTEL: az iOS a home képernyőn nem tiszteli
az átlátszóságot, feketére komponálja. Ott tehát szándékosan fehér alap van.

Használat:
    python3 scripts/ikonok.py
"""

import pathlib

from PIL import Image

GYOKER = pathlib.Path(__file__).resolve().parent.parent
FORRAS = GYOKER / 'public/images/brand/blueway-logo-still-atlatszo.png'

# A fogaskerék-csoport kezdete a logón belül. Kimérve: 325-nél még benne van
# a „Y” farka, 355-nél már sérül a bal kerék. 340 a tiszta vágás.
KEREKEK_X = 340

# Margó a négyzet oldalhosszának arányában, körben. 6% éppen annyi, hogy a
# rajz ne érjen a kerethez, de a fül apró ikonján se vesszen el.
MARGO = 0.06


def fogaskerekek() -> Image.Image:
    """A fogaskerék-csoport, pontosan a tartalmára vágva."""
    logo = Image.open(FORRAS).convert('RGBA')
    kivagas = logo.crop((KEREKEK_X, 0, logo.width, logo.height))
    doboz = kivagas.getchannel('A').getbbox()
    if doboz is None:
        raise SystemExit('A kivágás üres — a KEREKEK_X érték rossz.')
    return kivagas.crop(doboz)


def negyzetre(kep: Image.Image, oldal: int, hatter=None) -> Image.Image:
    """Négyzetes vászon közepére, arányosan, körben margóval."""
    belso = int(oldal * (1 - 2 * MARGO))
    arany = min(belso / kep.width, belso / kep.height)
    meret = (max(1, round(kep.width * arany)), max(1, round(kep.height * arany)))
    kicsi = kep.resize(meret, Image.LANCZOS)

    vaszon = Image.new('RGBA', (oldal, oldal), hatter or (0, 0, 0, 0))
    vaszon.paste(kicsi, ((oldal - meret[0]) // 2, (oldal - meret[1]) // 2), kicsi)
    return vaszon


def main() -> None:
    kerekek = fogaskerekek()
    print(f'fogaskerék-csoport: {kerekek.width}×{kerekek.height}')

    # A böngészőfül ikonja.
    #
    # 256 és nem 512: ezt a fájlt MINDEN látogató letölti, a fülre pedig 16
    # vagy 32 képpont kerül belőle. Az 512-es változat 178 kB volt, a 256-os
    # 61 — ugyanaz a kép, harmadannyi. A 256 még mindig nyolcszorosa annak,
    # amit a fül kér, és bőven a készülékikon 180 fölött.
    ful = GYOKER / 'src/app/icon.png'
    negyzetre(kerekek, 256).save(ful, optimize=True)
    print(f'  {ful.relative_to(GYOKER)} — 256×256, átlátszó')

    # A klasszikus favicon.ico. Három méret egy fájlban: a böngészők a fülre
    # a 16-ost, a könyvjelzősávra és a lapváltóra a nagyobbakat kérik. Ha
    # csak egy méret volna benne, a többit a böngésző skálázná — az pedig
    # 16 képponton mosott lesz.
    ico = GYOKER / 'public/favicon.ico'
    negyzetre(kerekek, 256).save(ico, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print(f'  {ico.relative_to(GYOKER)} — 16/32/48/64, átlátszó')

    # A készülékikon. Itt fehér alap kell: az iOS az átlátszót feketére
    # komponálja, tehát átlátszóan mentve fekete négyzetben ülne a logó.
    alma = GYOKER / 'src/app/apple-icon.png'
    negyzetre(kerekek, 180, hatter=(255, 255, 255, 255)).convert('RGB').save(alma)
    print(f'  {alma.relative_to(GYOKER)} — 180×180, fehér alapon')

    # A bluewaytrade.us átmeneti lapja a saját favicon.ico-ját kapja (lásd a
    # .htaccess átírását). Ugyanaz a fájl volt benne, tehát ugyanaz a hiba —
    # egy javítás, két hely.
    us = GYOKER / 'server/us-atmeneti/favicon.ico'
    if us.parent.is_dir():
        negyzetre(kerekek, 256).save(us, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
        print(f'  {us.relative_to(GYOKER)} — 16/32/48/64, átlátszó')


if __name__ == '__main__':
    main()
