# -*- coding: utf-8 -*-
"""Címkeanyag-ábrák a Tudástárhoz.

Egyelőre egy ábra: a háromféle felépítés egymás mellett — hordozós,
linerless és InNo-Liner. Az adatok a cab „Print and apply systems
HERMES QL” katalógusából (04/2026) valók.

Az ábra szándékosan SVG: a rétegek vékony csíkok, raszterben nagyításkor
összemosódnának.
"""
import pathlib

KI = pathlib.Path('public/images/cimke')
KI.mkdir(parents=True, exist_ok=True)


def xml(t: str) -> str:
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


BETU = "font-family='ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif'"

# Egy oszlop = egy felépítés. A rétegek FELÜLRŐL lefelé, ahogy a címke áll:
# (felirat, magasság, kitöltés, szövegszín)
OSZLOPOK = [
    (
        'Hordozós (klasszikus)',
        [
            ('nyomtatható felület', 30, '#f8fafc', '#0f172a'),
            ('ragasztó', 16, '#fde68a', '#78350f'),
            ('szilikonréteg', 12, '#e2e8f0', '#334155'),
            ('HORDOZÓ — hulladék', 34, '#cbd5e1', '#1e293b'),
        ],
        'A hordozó a tekercs tömegének és térfogatának\njelentős részét viszi el, majd hulladék lesz.',
    ),
    (
        'Linerless',
        [
            ('szilikonréteg', 12, '#e2e8f0', '#334155'),
            ('nyomtatható felület', 30, '#f8fafc', '#0f172a'),
            ('ragasztó', 16, '#fde68a', '#78350f'),
        ],
        'A szilikon a címke SAJÁT felületén van, hogy a\nfeltekercselt szalag ne ragadjon önmagához.',
    ),
    (
        'InNo-Liner',
        [
            ('nyomtatható felület', 30, '#f8fafc', '#0f172a'),
            ('ragasztó — vízzel aktiválódik', 16, '#bfdbfe', '#1e3a8a'),
        ],
        'Szilikon egyáltalán nincs benne. Nedvszívó karton-\nés papírfelületre való, jellemzően szállítási címke.',
    ),
]

SZEL, MAG = 1000, 360
OSZ_SZEL = 250          # a rétegköteg szélessége
KOZ = (SZEL - 3 * OSZ_SZEL) / 4
ALAP = 224              # közös alapvonal: a felragasztás felülete

r = [
    f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {SZEL} {MAG}' width='{SZEL}' height='{MAG}' "
    f"role='img' aria-label='A háromféle címkefelépítés'>",
    f"<rect width='{SZEL}' height='{MAG}' fill='#ffffff'/>",
    f"<text x='{SZEL/2}' y='34' text-anchor='middle' {BETU} font-size='21' font-weight='600' fill='#0f172a'>"
    "Ugyanaz a címke háromféle felépítésben</text>",
    f"<text x='{SZEL/2}' y='58' text-anchor='middle' {BETU} font-size='14' fill='#64748b'>"
    "a rétegek felülről lefelé; a kötegek alja mindenütt a felragasztás felülete</text>",
]

for i, (cim, retegek, jegyzet) in enumerate(OSZLOPOK):
    x = KOZ + i * (OSZ_SZEL + KOZ)
    kx = x + OSZ_SZEL / 2
    teljes = sum(m for _, m, _, _ in retegek)
    y = ALAP - teljes                      # alulról építkezünk
    r.append(
        f"<text x='{kx}' y='96' text-anchor='middle' {BETU} font-size='15' "
        f"font-weight='600' fill='#1d4ed8'>{xml(cim)}</text>"
    )
    for felirat, m, szin, szszin in retegek:
        r.append(
            f"<rect x='{x}' y='{y}' width='{OSZ_SZEL}' height='{m}' fill='{szin}' "
            "stroke='#94a3b8' stroke-width='1'/>"
        )
        r.append(
            f"<text x='{kx}' y='{y + m / 2 + 4}' text-anchor='middle' {BETU} font-size='11.5' "
            f"fill='{szszin}'>{xml(felirat)}</text>"
        )
        y += m
    for k, sor in enumerate(jegyzet.split('\n')):
        r.append(
            f"<text x='{kx}' y='{269 + k * 17}' text-anchor='middle' {BETU} font-size='12' "
            f"fill='#475569'>{xml(sor)}</text>"
        )

# közös alapvonal a három köteg alatt
r.append(
    f"<line x1='{KOZ - 14}' y1='{ALAP + 6}' x2='{SZEL - KOZ + 14}' y2='{ALAP + 6}' "
    "stroke='#0f172a' stroke-width='2.5'/>"
)
r.append(
    f"<text x='{SZEL/2}' y='{ALAP + 24}' text-anchor='middle' {BETU} font-size='11.5' fill='#64748b'>"
    "a felragasztás felülete</text>"
)
r.append(
    f"<text x='{SZEL/2}' y='{MAG - 14}' text-anchor='middle' {BETU} font-size='12.5' fill='#334155'>"
    "Hordozó nélkül nincs kivágás: a címke hosszát a nyomtató vágója szabja meg, feladatonként külön."
    "</text>"
)
r.append('</svg>')

ut = KI / 'cimke-felepites.svg'
ut.write_text('\n'.join(r), encoding='utf-8')
print('kész:', ut, ut.stat().st_size, 'bájt')
