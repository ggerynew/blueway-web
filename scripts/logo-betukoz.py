# -*- coding: utf-8 -*-
"""A Blueway logó betűközeinek növelése — a feliraton, az animáció megtartásával.

MIÉRT ÍGY

A logó betűi zárt, saját fekete kontúrral rajzolt alakzatok, amelyek nagyon
közel állnak egymáshoz: a 2654 képpont széles eredetin a B és az L között
11 képpont hézag van, ami a weblap 504 képpontos méretében már csak kettő —
innen a „összeolvadnak" érzés.

A vágás nem lehet függőleges vonal, mert a W, az A és az Y átlós élekkel
érintkezik. Ezért minden fekete képpontot a legközelebbi betű kék lapjához
rendelünk: a közös varrat pont félbe hasad, és mindkét betű megtartja a
saját kontúrvastagságát.

A felirat TELJES SZÉLESSÉGE nem változik: a nagyobb hézagot a betűk arányos
kicsinyítése ellensúlyozza. Így a logó szerkezete — felirat és fogaskerekek
egymáshoz képest — érintetlen marad.

Az animációban a fogaskerekek forognak, a felirat áll. A kettőt ezen az
alapon választjuk szét (képpontonkénti szórás a képkockák között), tehát a
fogaskerekekhez egyáltalán nem nyúlunk.
"""
import glob
import pathlib
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

SC = pathlib.Path('/tmp/claude-0/-home-user-blueway-web/2ebbcacd-f1b9-5af6-8a4a-448ae5002e3f/scratchpad')
NAGY = SC / 'logo' / 'Blueway Vector Logo.png'   # 2654×779, ugyanaz a rajz élesebben
KOCKAK = sorted(glob.glob(str(SC / 'kockak2' / '*.png')))  # 145 kocka, 1008×288, átlátszó

#: Mennyivel nőjön a hézag: a betűszélesség hányada. 0,10 kis méretben is
#: olvashatóan elválasztja a betűket, de a szó még egyben marad.
TOBBLET = 0.10

SOROK = {
    'BLUEWAY': dict(y=(212, 447), x=(0, 1760),
                    betuk=[('B', [113]), ('L', [296]), ('U', [568]), ('E', [767, 837]),
                           ('W', [979, 1115, 1240]), ('A', [1399]), ('Y', [1607, 1681])]),
    'TRADE': dict(y=(466, 601), x=(500, 1260),
                  betuk=[('T', [601]), ('R', [735]), ('A', [874]), ('D', [1011]), ('E', [1131, 1173])]),
}


def betuk_szetvalasztasa():
    """Betűnként egy maszk: a kék lap és a hozzá tartozó fekete kontúr."""
    rgb = np.array(Image.open(NAGY).convert('RGB')).astype(int)
    tart = rgb.min(axis=2) <= 235
    kek = tart & (rgb[..., 2] > 120) & (rgb[..., 2] - rgb[..., 0] > 40)
    ki = {}
    for nev, cfg in SOROK.items():
        y0, y1 = cfg['y']; x0, x1 = cfg['x']
        ablak = (slice(y0, y1 + 1), slice(x0, x1 + 1))
        c, n = ndimage.label(kek[ablak])
        kozep = {i: round(x0 + np.where(c == i)[1].mean())
                 for i in range(1, n + 1) if (c == i).sum() >= 400}
        magok = np.zeros(c.shape, np.int32)
        for bi, (_, sulypontok) in enumerate(cfg['betuk'], start=1):
            for sp in sulypontok:
                cid = min(kozep, key=lambda q: abs(kozep[q] - sp))
                assert abs(kozep[cid] - sp) < 6, f'{nev}: {sp} → {kozep[cid]}'
                magok[c == cid] = bi
        # a fekete kontúr a legközelebbi maghoz kerül — a varrat félbe hasad
        _, (iy, ix) = ndimage.distance_transform_edt(magok == 0, return_indices=True)
        cimke = magok[iy, ix]
        cimke[~tart[ablak]] = 0
        lista = []
        for bi, (betu, _) in enumerate(cfg['betuk'], start=1):
            m = np.zeros(tart.shape, bool)
            m[ablak] = (cimke == bi)
            lista.append((betu, m))
        ki[nev] = lista
    return rgb, ki


def uj_felirat(rgb, betuk, tobblet_arany):
    """A felirat újrarajzolása nagyobb hézagokkal, RGBA-ban, átlátszó háttérrel."""
    H, W = rgb.shape[:2]
    kimenet = np.zeros((H, W, 4), np.uint8)
    for lista in betuk.values():
        dobozok = []
        for betu, m in lista:
            ys, xs = np.where(m)
            dobozok.append((m, xs.min(), xs.max(), ys.min(), ys.max()))
        bal = min(d[1] for d in dobozok); jobb = max(d[2] for d in dobozok)
        teljes = jobb - bal + 1
        atlagszel = float(np.mean([d[2] - d[1] + 1 for d in dobozok]))
        tobblet = atlagszel * tobblet_arany
        skala = teljes / (teljes + tobblet * (len(dobozok) - 1))
        kozep_y = (min(d[3] for d in dobozok) + max(d[4] for d in dobozok)) / 2
        eltolas = 0.0
        for m, x0, x1, y0, y1 in dobozok:
            szin = rgb[y0:y1 + 1, x0:x1 + 1].astype(np.uint8)
            msk = (m[y0:y1 + 1, x0:x1 + 1] * 255).astype(np.uint8)
            uw = max(1, round((x1 - x0 + 1) * skala)); uh = max(1, round((y1 - y0 + 1) * skala))
            kszin = np.array(Image.fromarray(szin).resize((uw, uh), Image.LANCZOS))
            kmsk = np.array(Image.fromarray(msk).resize((uw, uh), Image.LANCZOS))
            ux = round(bal + (x0 - bal) * skala + eltolas)
            uy = round(kozep_y + (y0 - kozep_y) * skala)
            cel = kimenet[uy:uy + uh, ux:ux + uw]
            if cel.shape[:2] != (uh, uw):
                uh, uw = cel.shape[:2]
                kszin, kmsk = kszin[:uh, :uw], kmsk[:uh, :uw]
            # ahol az új betű átlátszóbb, ott ne törölje a már meglévőt
            hol = kmsk > cel[..., 3]
            cel[..., :3][hol] = kszin[hol]
            cel[..., 3][hol] = kmsk[hol]
            eltolas += tobblet * skala
    return kimenet


def felirat_maszk(kockak):
    """Az ÁLLÓ (nem forgó) tartalom a felirat; a fogaskerekek mozognak."""
    t = np.stack(kockak).astype(np.int16)
    szoras = t[..., :3].std(axis=0).mean(axis=2) + t[..., 3].std(axis=0)
    allo = (t[0][..., 3] > 40) & (szoras <= 8)
    c, n = ndimage.label(allo)
    maszk = np.zeros(allo.shape, bool)
    for i in range(1, n + 1):
        folt = (c == i)
        if folt.sum() < 60:
            continue
        xs = np.where(folt)[1]
        if xs.max() < 675:          # a fogaskerekek ennél jobbra kezdődnek
            maszk |= folt
    return ndimage.binary_dilation(maszk, iterations=2)


def main():
    rgb, betuk = betuk_szetvalasztasa()
    uj = uj_felirat(rgb, betuk, TOBBLET)

    kockak = [np.array(Image.open(f).convert('RGBA')) for f in KOCKAK]
    maszk = felirat_maszk(kockak)
    ys, xs = np.where(maszk)
    regi_doboz = (xs.min(), ys.min(), xs.max(), ys.max())
    print(f'a régi felirat helye a kockán: x={regi_doboz[0]}-{regi_doboz[2]} y={regi_doboz[1]}-{regi_doboz[3]}')

    # az új felirat ugyanabba a dobozba
    uys, uxs = np.where(uj[..., 3] > 40)
    uj_kivag = uj[uys.min():uys.max() + 1, uxs.min():uxs.max() + 1]
    cw = regi_doboz[2] - regi_doboz[0] + 1
    ch = regi_doboz[3] - regi_doboz[1] + 1
    uj_kicsi = np.array(Image.fromarray(uj_kivag).resize((cw, ch), Image.LANCZOS))
    print(f'az új felirat {uj_kivag.shape[1]}×{uj_kivag.shape[0]} → {cw}×{ch}')

    KI = SC / 'ujkockak'
    KI.mkdir(exist_ok=True)
    for i, k in enumerate(kockak):
        k = k.copy()
        k[maszk] = 0                                   # a régi felirat törlése
        sav = k[regi_doboz[1]:regi_doboz[3] + 1, regi_doboz[0]:regi_doboz[2] + 1]
        a = uj_kicsi[..., 3:4].astype(float) / 255.0    # alfa szerinti keverés
        sav[..., :3] = (uj_kicsi[..., :3] * a + sav[..., :3] * (1 - a)).astype(np.uint8)
        sav[..., 3] = np.maximum(sav[..., 3], uj_kicsi[..., 3])
        Image.fromarray(k).save(KI / f'{i:04d}.png')
    print(f'kész: {len(kockak)} kocka a {KI} mappában')


if __name__ == '__main__':
    main()
