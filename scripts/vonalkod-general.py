# -*- coding: utf-8 -*-
"""A vonalkód-cikk ábráinak előállítása és VISSZAOLVASÁSOS ellenőrzése.

Futtatás a projekt gyökeréből: python3 scripts/vonalkod-general.py
"""
import importlib.util, io, os, subprocess, sys

spec = importlib.util.spec_from_file_location('v', 'scripts/vonalkod-abrak.py')
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)

KI = 'public/images/vonalkod'
os.makedirs(KI, exist_ok=True)

# ——— a cikken végigvitt példa ———
TORZS = '599012345678'
GTIN13 = TORZS + v.gs1_ellenorzo(TORZS)                     # 5990123456783
GTIN14 = '1' + TORZS + v.gs1_ellenorzo('1' + TORZS)         # 15990123456780
SSCC = '3599012300000012' + '3'
SSCC = SSCC[:17] + v.gs1_ellenorzo(SSCC[:17])
SSCC = '35990123000000123' + v.gs1_ellenorzo('35990123000000123')

fajlok = {}


def ment(nev, svg):
    ut = os.path.join(KI, nev)
    open(ut, 'w', encoding='utf-8').write(svg)
    fajlok[nev] = svg
    return ut


# ————————————————— 1D —————————————————
# EAN-13: a vezérjelek lelógnak, ahogy a szabvány kéri
vez = [(0, 3), (45, 50), (92, 95)]
ment('ean-13.svg', v.svg_1d(v.ean13_sav(GTIN13), f'{GTIN13[0]}  {GTIN13[1:7]}  {GTIN13[7:]}',
                            modul=3, magassag=80, csendzona=11, vezerjel=vez, felirat_meret=15))
EAN8 = '5990123' + v.gs1_ellenorzo('5990123')
ment('ean-8.svg', v.svg_1d(v.ean8_sav(EAN8), f'{EAN8[:4]}  {EAN8[4:]}', modul=3, magassag=70,
                           csendzona=7, vezerjel=[(0, 3), (31, 36), (64, 67)], felirat_meret=15))
ment('code-39.svg', v.svg_1d(v.code39_sav('BLUEWAY 123'), '*BLUEWAY 123*', modul=2, magassag=70))
ment('code-128.svg', v.svg_1d(v.code128_sav('BW-2026-0815'), 'BW-2026-0815', modul=2, magassag=70))
ment('itf-14.svg', v.svg_itf14(v.itf_sav(GTIN14), f'{GTIN14[0]}  {GTIN14[1:3]} {GTIN14[3:8]} {GTIN14[8:13]}  {GTIN14[13]}'))

# GS1-128: a | jel a mezőzáró FNC1. A (17) fix hosszú, utána nem kell.
karton_adat = f'01{GTIN14}10L2608A|17270131'
ment('gs1-128-karton.svg', v.svg_1d(v.code128_sav(karton_adat, gs1=True),
                                    f'(01) {GTIN14}  (10) L2608A  (17) 270131',
                                    modul=2, magassag=80, felirat_meret=15))
ment('gs1-128-sscc.svg', v.svg_1d(v.code128_sav(f'00{SSCC}', gs1=True),
                                  f'(00) {SSCC[0]} {SSCC[1:8]} {SSCC[8:17]} {SSCC[17]}',
                                  modul=3, magassag=90, felirat_meret=14))

# GS1 DataBar — a BWIPP referencia-implementációból (ISO/IEC 24724)
import treepoem
db = treepoem.generate_barcode('databaromni', f'(01)0{GTIN13}', options={'height': 0.4})
ment('gs1-databar.svg', v.svg_1d(v.kep_sav(db), f'(01) 0{GTIN13}',
                                 modul=3, magassag=66, csendzona=2, felirat_meret=16))

# ————————————————— 2D —————————————————
import segno
qr = segno.make('https://blueway.hu', error='m')
ment('qr.svg', v.svg_2d(qr.matrix, modul=6, csendzona=4))

from ppf.datamatrix import DataMatrix
dm = DataMatrix('BW-2026-0815')
ment('datamatrix.svg', v.svg_2d(dm.matrix, modul=8, csendzona=2))

# A GS1 DataMatrixban az FNC1 az ELSŐ helyen áll, és nem GS adatkarakter,
# hanem külön kódszó — ezt a nyers DataMatrix-kódoló nem tudja előállítani,
# ezért itt is a BWIPP referenciát használjuk.
gs1dm = treepoem.generate_barcode('gs1datamatrix', f'(01){GTIN14}(17)270131(10)L2608A')
ment('gs1-datamatrix.svg', v.svg_2d(v.kep_modulok(gs1dm), modul=8, csendzona=2))

import pdf417gen
from pdf417gen.rendering import render_image
kodok = pdf417gen.encode('Blueway Trade Kft., 2142 Nagytarcsa, Deri Miksa u. 10/A.', columns=6, security_level=3)
# scale=1 mellett egy képpont pontosan egy modul
ment('pdf417.svg', v.svg_2d(v.kep_modulok(render_image(kodok, scale=1, ratio=1, padding=0)),
                            modul=4, csendzona=2, sor_magassag=3))

from aztec_code_generator import AztecCode
az = AztecCode('BW-2026-0815')
ment('aztec.svg', v.svg_2d(az.matrix, modul=8, csendzona=1))

print(f'{len(fajlok)} ábra kész')
for n in sorted(fajlok):
    print(' ', n, len(fajlok[n]), 'bájt')
print('\nPÉLDÁK: GTIN-13', GTIN13, '| GTIN-14', GTIN14, '| SSCC', SSCC)
