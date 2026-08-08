#!/usr/bin/env python3
"""
Padlóárnyék eltávolítása termékfotóról.

A gyártói fotók egy részén a gép egy világosszürke „padlón" áll, és vet rá
egy elmosódó árnyékot. A weblapon viszont a termékkép fehér csempén ül, így
az árnyék nem talajt idéz, hanem piszkos foltnak látszik a kép sarkában.

Miért nem elég küszöbölni: az árnyék szürkéje (190–250) pontosan ugyanabba a
tartományba esik, mint a gép fehér burkolata (209–237). Fényesség alapján a
kettő nem választható szét — a burkolat egy része sötétebb, mint az árnyék
világosabb része.

Amiben viszont különböznek: az árnyék SIMA. Elmosódó átmenet, képpontonként
néhány szintnyi változással. A gép körvonala ezzel szemben lépcső: a fehér
háttérről 255-ről 226-ra esik egy-két képpont alatt. Ezért nem a fényesség,
hanem a MEREDEKSÉG a határ — a kitöltés a sima szürkén átfolyik, a gép élén
megáll.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

# Efölött a fényesség fölött lehet háttér vagy árnyék. A gép legsötétebb
# burkolatrésze 209, tehát a küszöb nem mehet feljebb 200-nál sem, mert akkor
# a burkolatot is elnyelné — 185 kényelmes tartalékot hagy.
VILAGOS_KUSZOB = 185
# Efölött a meredekség fölött él van, ott a kitöltés megáll. Az árnyék belső
# meredeksége 0–4, a gép körvonaláé 15–50. A 6 azért nem 8 vagy 10: a burkolat
# bal oldalán van egy képpontnyi lágy szakasz (249-es érték, 0,8 meredekség),
# amin a magasabb küszöbű kitöltés beszökött a gépbe, és kifehérítette az egész
# házat. Mérve, nem becsülve: 8-nál a burkolat eltűnt, 6-nál épen maradt.
EL_KUSZOB = 6
# A gát egy képpontnyi réseit összezárjuk, hogy a lágy szakaszok ne engedjék át
# a kitöltést.
GAT_ZARAS = 1
# A megmaradó él-képpontokat ennyivel tágítjuk, hogy az árnyék pereme se
# maradjon ott halvány keretként.
PEREM_TAGITAS = 2


def arnyek_nelkul(kep: Image.Image, el_kuszob: int = EL_KUSZOB) -> Image.Image:
    a = np.asarray(kep.convert('RGB')).astype(np.int16)
    vilagossag = a.max(2).astype(float)

    # Meredekség: a két irányú különbség nagysága.
    dy = ndimage.sobel(vilagossag, 0)
    dx = ndimage.sobel(vilagossag, 1)
    meredek = np.hypot(dx, dy) / 4.0

    # A gát: sötét képpont vagy él. Ezen a kitöltés nem jut át.
    gat = (vilagossag < VILAGOS_KUSZOB) | (meredek >= el_kuszob)
    if GAT_ZARAS:
        gat = ndimage.binary_closing(gat, np.ones((3, 3)), iterations=GAT_ZARAS)

    # Kitöltés a kép szélétől: ami innen elérhető, az háttér vagy árnyék.
    cimke, _ = ndimage.label(~gat)
    szeli = set(cimke[0].tolist()) | set(cimke[-1].tolist())
    szeli |= set(cimke[:, 0].tolist()) | set(cimke[:, -1].tolist())
    szeli.discard(0)
    hatter = np.isin(cimke, list(szeli))

    # Az árnyék pereme meredekebb, mint a belseje, ezért kimarad a kitöltésből
    # és halvány keretként ottmaradna. A háttérré nyilvánított területet ezért
    # kitágítjuk — de csak olyan képpontokra, amik maguk is világosak.
    tagitott = ndimage.binary_dilation(hatter, iterations=PEREM_TAGITAS)
    hatter = tagitott & (vilagossag >= VILAGOS_KUSZOB)

    ki = a.copy()
    ki[hatter] = 255

    # Takarítás: az árnyék pereme néhány vékony csíkban és pontban túléli a
    # kitöltést, mert a saját meredeksége zárta el az utat. Ezek a maradványok
    # nem érnek hozzá a géphez, tehát elég a legnagyobb összefüggő nem-fehér
    # területet — magát a gépet — megtartani, a többit kifehéríteni.
    marad = np.asarray(ki).max(2) < 250
    cimke2, db = ndimage.label(marad, np.ones((3, 3)))
    if db > 1:
        meretek = ndimage.sum(marad, cimke2, range(1, db + 1))
        gep = int(np.argmax(meretek)) + 1
        ki[marad & (cimke2 != gep)] = 255

    return Image.fromarray(ki.astype(np.uint8))


def main(ervek: list[str]) -> None:
    """Használat: talaj-arnyek-eltavolitas.py [--el N] kép.webp …

    Az `--el` a fenti EL_KUSZOB felülírása. Azért állítható, mert a küszöböt a
    kép tárgya szabja meg: a magányos, sötét részekkel bíró gépnél 6 a jó
    érték, a fehér címketekercsek halmazánál viszont már 4-nél is beleharap a
    kitöltés a tekercsekbe — ott 3 a legtöbb, ami még kárt nem tesz.
    """
    el = EL_KUSZOB
    utvonalak = []
    i = 0
    while i < len(ervek):
        if ervek[i] == '--el':
            el = int(ervek[i + 1])
            i += 2
        else:
            utvonalak.append(ervek[i])
            i += 1

    for u in utvonalak:
        p = Path(u)
        eredeti = Image.open(p)
        elotte = np.asarray(eredeti.convert('RGB')).astype(int)
        uj = arnyek_nelkul(eredeti, el)
        utana = np.asarray(uj).astype(int)
        valtozott = (elotte != utana).any(2).sum()
        uj.save(p, 'WEBP', quality=88, method=6)
        print(f'{p.name} (él={el}): {valtozott} képpont fehérre '
              f'({valtozott / elotte[..., 0].size * 100:.1f}%), {p.stat().st_size / 1024:.1f} kB')


if __name__ == '__main__':
    main(sys.argv[1:])
