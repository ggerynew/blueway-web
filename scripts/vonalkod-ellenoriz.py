# -*- coding: utf-8 -*-
"""A cikkbe kerülő vonalkódok VISSZAOLVASÁSA.

Egy hibás vonalkód a cikkben rosszabb, mint a semmi: a látogató ránéz,
leolvassa a telefonjával, és mást kap, mint amit a szöveg állít. Ezért minden
ábrát képpé alakítunk és a zxing dekóderrel visszaolvasunk — a cikk csak azt
állíthatja egy kódról, amit a dekóder tényleg kiolvas belőle.

Futtatás a projekt gyökeréből: python3 scripts/vonalkod-ellenoriz.py
"""
import io
import os
import sys

import cairosvg
import zxingcpp
from PIL import Image

KI = 'public/images/vonalkod'
GS = chr(29)  # mezőelválasztó a GS1 kódokban (FNC1 a nem első helyen)

VART = {
    'ean-13.svg': '5990123456783',
    'ean-8.svg': '59901235',
    'code-39.svg': 'BLUEWAY 123',
    'code-128.svg': 'BW-2026-0815',
    'itf-14.svg': '15990123456780',
    # a dekóder a GS1 kódokat AI-kre bontva adja vissza: ez egyben azt is
    # igazolja, hogy az FNC1 a helyén van, és a mezőhatárok jók
    'gs1-128-karton.svg': '(01)15990123456780(10)L2608A(17)270131',
    'gs1-128-sscc.svg': '(00)359901230000001236',
    'gs1-databar.svg': '(01)05990123456783',
    'qr.svg': 'https://blueway.hu',
    'datamatrix.svg': 'BW-2026-0815',
    'gs1-datamatrix.svg': '(01)15990123456780(17)270131(10)L2608A',
    'pdf417.svg': 'Blueway Trade Kft., 2142 Nagytarcsa, Deri Miksa u. 10/A.',
    'aztec.svg': 'BW-2026-0815',
}


def main() -> int:
    baj = 0
    for nev in sorted(os.listdir(KI)):
        if not nev.endswith('.svg') or nev not in VART:
            continue
        png = cairosvg.svg2png(url=os.path.join(KI, nev), scale=4)
        kep = Image.open(io.BytesIO(png)).convert('L')
        talalatok = zxingcpp.read_barcodes(kep)
        if not talalatok:
            print(f'  ✗ {nev}: a dekóder NEM olvasta el')
            baj += 1
            continue
        t = talalatok[0]
        # a dekóder a FNC1-et \x1d-ként adja vissza; a kiíráshoz láthatóvá tesszük
        kapott = t.text
        vart = VART[nev]
        rendben = kapott == vart
        if not rendben:
            baj += 1
        jel = '✓' if rendben else '✗'
        print(f'  {jel} {nev:22} {str(t.format):14} „{kapott.replace(GS, "<GS>")}”')
        if not rendben:
            print(f'      elvárt:               „{vart.replace(GS, "<GS>")}”')

    print()
    print(f'{baj} hibás ábra' if baj else 'minden kód visszaolvasható, és a várt tartalmat adja')
    return 1 if baj else 0


if __name__ == '__main__':
    sys.exit(main())
