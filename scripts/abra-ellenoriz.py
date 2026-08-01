# -*- coding: utf-8 -*-
"""Az ábrák keretellenőrzése: kilóg-e szöveg vagy alakzat az SVG magasságából?

Az SVG nem vág le semmit — a kilógó felirat egyszerűen nem látszik, és ezt a
fájl írásakor semmi nem jelzi. Egy ilyen hibát a vonalkód-cikk frekvencia-
táblázatában is csak ez a szkript talált meg, miután már élesben volt.

Futtatás a projekt gyökeréből: python3 scripts/abra-ellenoriz.py
"""
import os
import re
import sys
import xml.etree.ElementTree as ET

MAPPAK = ['public/images/rfid', 'public/images/vonalkod']


def main() -> int:
    baj = 0
    for mappa in MAPPAK:
        if not os.path.isdir(mappa):
            continue
        for nev in sorted(os.listdir(mappa)):
            if not nev.endswith('.svg'):
                continue
            ut = os.path.join(mappa, nev)
            s = open(ut, encoding='utf-8').read()
            try:
                ET.parse(ut)
            except ET.ParseError as e:
                print(f'  ✗ {nev:30} érvénytelen XML: {e}')
                baj += 1
                continue
            m = re.search(r'height="([\d.]+)"[^>]*role', s) or re.search(r'\sheight="([\d.]+)"', s)
            ma = float(m.group(1))
            aljak = [float(y) for y in re.findall(r'<text[^>]*\sy="([\d.]+)"', s)]
            aljak += [float(y) + float(h) for y, h in
                      re.findall(r'<rect[^>]*\sy="([\d.]+)"[^>]*\sheight="([\d.]+)"', s)]
            if not aljak:
                continue
            legalso = max(aljak)
            if legalso > ma:
                print(f'  ✗ {nev:30} kilóg: legalsó elem {legalso:.0f}, a kép magassága {ma:.0f}')
                baj += 1
    print()
    print(f'{baj} ábra hibás' if baj else 'minden ábra érvényes XML, és semmi nem lóg ki a keretből')
    return 1 if baj else 0


if __name__ == '__main__':
    sys.exit(main())
