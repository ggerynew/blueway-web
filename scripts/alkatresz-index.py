#!/usr/bin/env python3
"""cab alkatrészlisták → az alkatrészkereső adatbázisa.

BEMENET
  --pdf      a 63 gyári PDF mappája (Spares.zip tartalma)
  --md       SPARES.md — a dokumentum-katalógus (melyik PDF melyik géphez való)
  --ki       a kimeneti JSON útvonala

MIÉRT KÉT BEMENET
  A SPARES.md a DOKUMENTUMOKAT írja le: melyik fájl melyik géptípushoz tartozik,
  hány oldal, melyik a duplikátum, melyik érvényes csak adott sorozatszámig.
  Ezt nem vezetjük le újra a PDF-ekből — onnan csak az jön, ami az MD-ben
  nincs benne: maguk az ALKATRÉSZEK.

A PDF-EK SZERKEZETE (16 339 cikkszámos soron mérve)
  A cikkszámot tartalmazó sor háromféle alakú:
      <cikkszám>                    39,7%   megnevezés a KÖVETKEZŐ sorban
      <cikkszám> Megnevezés …       50,6%   megnevezés UGYANABBAN a sorban
      <tétel> <cikkszám> …           5,0%   tételszám-előtaggal
  Mindhármat ugyanaz a menet kezeli, a cikkszámos sort horgonynak véve.

  A szerelési egység nevét („Printhead Assembly") az oldal tetején álló
  szakaszcímből vesszük. Keresés szempontjából ez a legfontosabb mező: a vevő
  erre keres rá („nyomtatófej"), nem cikkszámra.

  A cab ajánlási osztálya (SPR: A–D) azt mondja meg, mit érdemes raktáron
  tartani — ezzel rangsoroljuk a találatokat, hogy a valóban keresett alkatrész
  kerüljön előre a rögzítőcsavarok elé.

ELV
  Minden adat a gyári dokumentumból származik. Semmit nem következtetünk ki és
  nem egészítünk ki: egy téves cikkszám rossz alkatrész megrendelését jelenti.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit('Hiányzik a PyMuPDF: pip install pymupdf')

CIKK_ONALLO = re.compile(r'^(\d{7}\.\d{3})$')
CIKK_ELOL = re.compile(r'^(\d{7}\.\d{3})\s+(.+)$')
CIKK_TETELLEL = re.compile(r'^(\d+(?:\.\d+)?)\s+(\d{7}\.\d{3})\s*(.*)$')
BARMELY_CIKK = re.compile(r'\b\d{7}\.\d{3}\b')
TETELSZAM = re.compile(r'^\d+(?:\.\d+)?$')
SZAM = re.compile(r'^\d+$')

FEJLECEK = {
    'No', 'Part No.', 'Description', 'PU', 'Note', 'Notes', 'Serial No.',
    'from', 'to', 'Pos.', 'Figure/Page', 'No.', 'SPR', 'Spare Parts Register',
    'Spare Parts List', 'Service Manual', 'Spare Parts Index',
}
SPR_OSZTALY = {'A', 'B', 'C', 'D'}


# ——— SPARES.md: a dokumentum-katalógus ————————————————————————————
def katalogus(md: Path) -> dict[str, dict]:
    """fájlnév -> {termek, dokumentum, megjegyzes}"""
    ki = {}
    for sor in md.read_text(encoding='utf-8').splitlines():
        if not sor.startswith('|') or '.pdf' not in sor:
            continue
        oszlop = [x.strip() for x in sor.split('|')[1:-1]]
        if len(oszlop) < 3:
            continue
        fajl = oszlop[2].strip('`')
        ki[fajl] = {
            'termek': oszlop[0],
            'dokumentum': oszlop[1],
            'megjegyzes': oszlop[5] if len(oszlop) > 5 else '',
        }
    return ki


# ——— PDF: az alkatrészek ————————————————————————————————————————
def ertelmes(s: str | None) -> bool:
    return bool(s) and s not in FEJLECEK and bool(re.search(r'[A-Za-zÄÖÜäöüß]', s))


#: A tábla első oszlopának fejléce. Dokumentumonként más az írásmódja — a
#: 'No.' alak elhagyása 60 dokumentumból mintegy 20-ban ELTÜNTETTE az összes
#: szerelési egység nevét (a HERMES Q listájában például mind a tizenötöt).
TABLA_FEJ = ('No', 'No.', 'Pos', 'Pos.')

#: A cím és a táblafejléc közé oszlop-jelmagyarázat ékelődik: a „Note" oszlop
#: rövidítéseinek feloldása. Ezek nem szerelési egységek — a „Tube" például
#: 1362 tételre ragadt rá, miközben a valódi cím egy sorral feljebb áll
#: („Pneumatics Retainer Assembly").
JELMAGYARAZAT_SOR = {'Cable', 'Tube', 'Left', 'Right', 'Pressure reduced', 'Package unit'}

#: Ábraaláírás jelölése. Az UTÁNA álló sor a kép címe (gyakran németül), nem
#: a szakaszé — a valódi cím még feljebb van.
ABRA_JEL = re.compile(r'^(Bild|Fig\.?|Abb\.?)\s*\d+', re.I)

#: „Continuation from page 5" — a szakasz átnyúlik a következő oldalra. Ilyenkor
#: az előző oldal címét visszük tovább, különben az oldal tételei cím nélkül
#: maradnának, pedig ugyanahhoz az egységhez tartoznak.
FOLYTATAS = re.compile(r'^continuation\b', re.I)


def szakaszcim(sorok: list[str]) -> str | None:
    for i, s in enumerate(sorok):
        if s in TABLA_FEJ:
            for j in range(i - 1, -1, -1):
                e = sorok[j]
                if e in FEJLECEK or e in JELMAGYARAZAT_SOR:
                    continue
                if TETELSZAM.match(e) or len(e) < 3:
                    continue
                if re.fullmatch(r'[\d\s.,\-/]+', e):   # csupa szám/írásjel: hivatkozás, nem cím
                    continue
                if j > 0 and ABRA_JEL.match(sorok[j - 1]):
                    continue
                return e
            return None
    return None


def oldal_tetelei(sorok: list[str], cim: str | None) -> list[dict]:
    ki, i = [], 0
    while i < len(sorok):
        s = sorok[i]
        tetel = cikk = leiras = None
        ugras = 1

        m = CIKK_TETELLEL.match(s)
        if m:
            tetel, cikk, maradek = m.group(1), m.group(2), m.group(3).strip()
            leiras = maradek if ertelmes(maradek) else None
            if leiras is None and i + 1 < len(sorok) and ertelmes(sorok[i + 1]):
                leiras, ugras = sorok[i + 1], 2
        elif (m := CIKK_ELOL.match(s)):
            cikk, maradek = m.group(1), m.group(2).strip()
            leiras = maradek if ertelmes(maradek) else None
            if i > 0 and TETELSZAM.match(sorok[i - 1]):
                tetel = sorok[i - 1]
        elif (m := CIKK_ONALLO.match(s)):
            cikk = m.group(1)
            if i > 0 and TETELSZAM.match(sorok[i - 1]):
                tetel = sorok[i - 1]
            if i + 1 < len(sorok) and ertelmes(sorok[i + 1]):
                leiras, ugras = sorok[i + 1], 2

        if cikk:
            pu = spr = None
            k = i + ugras
            if k < len(sorok) and SZAM.match(sorok[k]):
                pu = int(sorok[k]); k += 1
            if k < len(sorok) and sorok[k] in SPR_OSZTALY:
                spr = sorok[k]
            ki.append({'cikkszam': cikk, 'megnevezes': leiras, 'tetel': tetel,
                       'pu': pu, 'spr': spr, 'csoport': cim})
            i += ugras
        else:
            i += 1
    return ki


def osszevon(tetelek: list[dict]) -> list[dict]:
    """Egy cikkszám többször is előfordul (tábla + hátsó mutató). A mezőket
    összefésüljük: amelyik előfordulásban megvan, az kerül be."""
    szerint: dict[str, dict] = {}
    for t in tetelek:
        c = t['cikkszam']
        if c not in szerint:
            szerint[c] = dict(t)
            continue
        for mezo in ('megnevezes', 'tetel', 'pu', 'spr', 'csoport'):
            if not szerint[c].get(mezo) and t.get(mezo):
                szerint[c][mezo] = t[mezo]
    return list(szerint.values())


#: A hátsó mutató („Spare Parts Register") oldalain nincs szerelési egység —
#: ott az összes cikkszám egy folyamatos listában áll. A szakaszcím-kereső
#: viszont talál valamit az oldal tetején: hol az SPR-osztályok jelmagyarázatát
#: („D - recommended spare parts for central stores"), hol a géptípus nevét.
#: Ezek nem szerelési egységek, és mérve 2200 tételre ragadtak rá tévesen.
#: A mutatóoldalakon ezért NINCS csoportnév — a helyes név úgyis megvan a
#: szerelési tábláknál, és az összevonás onnan hozza át.
#: Nem minden mutatóoldal nevezi meg magát: van, ahol csak a jelmagyarázat
#: („PU – Package unit”, „SPR – Spare part recommendation”) áll a tetején.
#: Ezt is felismerjük, különben a jelmagyarázat egy sora lesz a csoportnév —
#: a HERMES Q listájában így ragadt rá 598 tételre a „High Sensitivity”.
MUTATO_OLDAL = re.compile(r'spare parts? (register|index|recommendation)|package unit', re.I)
JELMAGYARAZAT = re.compile(r'^[A-D]\s*[-–]\s')


def mutatooldal(sorok: list[str]) -> bool:
    return any(MUTATO_OLDAL.search(s) for s in sorok[:12])


def dokumentum(ut: Path) -> tuple[list[dict], int, int]:
    d = fitz.open(ut)
    nyers, szoveg = [], []
    elozo_cim = None
    for oldal in d:
        sorok = [x.strip() for x in oldal.get_text().splitlines() if x.strip()]
        szoveg.append('\n'.join(sorok))
        cim = None if mutatooldal(sorok) else szakaszcim(sorok)
        if cim and JELMAGYARAZAT.match(cim):
            cim = None
        if cim and FOLYTATAS.match(cim):
            cim = elozo_cim
        elif cim:
            elozo_cim = cim
        nyers.extend(oldal_tetelei(sorok, cim))
    varhato = len(set(BARMELY_CIKK.findall('\n'.join(szoveg))))
    return osszevon(nyers), d.page_count, varhato


# ——— géptípus-azonosító ————————————————————————————————————————
def azonosito(nev: str) -> str:
    s = unicodedata.normalize('NFKD', nev).encode('ascii', 'ignore').decode()
    s = s.lower().replace('+', 'plus').replace('/', '-')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s


def keresokulcsok(nev: str) -> list[str]:
    """Amire a vevő ráírhat: „SQUIX 4", „squix4", „SQUIX 4.3" …"""
    alap = nev.lower()
    ki = {alap, alap.replace(' ', ''), alap.replace('/', ' ')}
    for darab in re.split(r'\s*/\s*', nev):
        d = darab.strip().lower()
        if d:
            ki.add(d)
            ki.add(d.replace(' ', ''))
    return sorted(x for x in ki if x)


def tomorit(gepek: list[dict], alkatreszek: list[dict]) -> dict:
    """A böngészőbe kerülő, tömör változat.

    A részletes jegyzékben ugyanaz a cikkszám annyiszor szerepel, ahány géphez
    való — 7894 sor, de csak 2730 EGYEDI cikkszám. A keresőnek a cikkszám az
    egység („ez az alkatrész ezekbe a gépekbe való"), ezért itt cikkszámonként
    egy sor áll, a gépek és a szerelési egységek pedig sorszámmal hivatkoznak
    egy-egy névtáblára. Így lesz a 1,27 MB-ból ~150 kB (tömörítve ~27 kB), ami
    már nyugodtan letölthető a keresőfül első megnyitásakor.

    A sor: [cikkszám, megnevezés, gép-sorszámok, egység-sorszámok, SPR]

    A GÉP ÉS AZ EGYSÉG SORSZÁMA EGYMÁSHOZ TARTOZIK: a c[i] az a szerelési
    egység, amelyben az alkatrész a g[i] gép listájában szerepel (−1, ha ott
    nincs megnevezve). Ez nem szépészeti kérdés. Egy szabványcsavar 28 gépben
    fordul elő, összesen tizenöt különböző szerelési egység alatt — ha ezt egy
    közös halmazba olvasztjuk, a csavar minden keresésre illeszkedni fog, mert
    a tizenöt név közt ott lesz a „Printhead Assembly" is. Élesben pontosan ez
    történt: az „A4+ fej"-re szabvány rögzítőelemek jöttek elő.
    """
    gep_ix = {g['id']: i for i, g in enumerate(gepek)}
    csoportok = sorted({x['csoport'] for x in alkatreszek if x['csoport']})
    cs_ix = {c: i for i, c in enumerate(csoportok)}

    szerint: dict[str, dict] = {}
    for x in alkatreszek:
        e = szerint.setdefault(x['cikkszam'], {'nev': '', 'gc': {}, 'spr': ''})
        gi = gep_ix[x['gep']]
        ci = cs_ix[x['csoport']] if x['csoport'] else -1
        # Egy gépnek több dokumentuma is lehet; az elsőként talált, megnevezett
        # egységet tartjuk meg.
        if e['gc'].get(gi, -1) < 0:
            e['gc'][gi] = ci
        if x['megnevezes'] and not e['nev']:
            e['nev'] = x['megnevezes']
        # Ugyanaz az alkatrész két listában eltérő osztályt kaphat; a szigorúbb
        # (előrébb sorolt) osztályt tartjuk meg, mert a keresés rangsorol vele.
        if x['spr'] and (not e['spr'] or x['spr'] < e['spr']):
            e['spr'] = x['spr']

    sorok = []
    for cikk, e in sorted(szerint.items()):
        g = sorted(e['gc'])
        sorok.append([cikk, e['nev'], g, [e['gc'][i] for i in g], e['spr']])

    return {
        'forras': 'cab Produkttechnik — gyári alkatrészlisták',
        'gepek': [{'id': g['id'], 'nev': g['nev'], 'k': g['kulcsok']} for g in gepek],
        'csoportok': csoportok,
        't': sorok,
    }


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--pdf', required=True, type=Path)
    p.add_argument('--md', required=True, type=Path)
    p.add_argument('--ki', required=True, type=Path)
    p.add_argument('--web', type=Path,
                   help='a böngészőbe kerülő tömör index (public/alkatreszek.json)')
    a = p.parse_args()

    kat = katalogus(a.md)
    gepek, alkatreszek = {}, []
    ossz_var = ossz_lett = 0

    for ut in sorted(a.pdf.glob('*.pdf')):
        if ' (1)' in ut.name:                 # bájtazonos duplikátum, lásd SPARES.md
            continue
        meta = kat.get(ut.name)
        if not meta:
            print(f'  ! nincs a katalógusban, kihagyva: {ut.name}', file=sys.stderr)
            continue
        tetelek, oldalak, varhato = dokumentum(ut)
        ossz_var += varhato
        ossz_lett += len(tetelek)
        if not tetelek:                        # kezelési/szerelési útmutató
            continue

        gep_id = azonosito(meta['termek'])
        g = gepek.setdefault(gep_id, {
            'id': gep_id,
            'nev': meta['termek'],
            'kulcsok': keresokulcsok(meta['termek']),
            'dokumentumok': [],
        })
        g['dokumentumok'].append({
            'fajl': ut.name,
            'tipus': meta['dokumentum'],
            'oldalak': oldalak,
            'megjegyzes': meta['megjegyzes'] or None,
        })
        for t in tetelek:
            alkatreszek.append({
                'gep': gep_id,
                'cikkszam': t['cikkszam'],
                'megnevezes': t['megnevezes'],
                'csoport': t['csoport'],
                'tetel': t['tetel'],
                'pu': t['pu'],
                'spr': t['spr'],
                'fajl': ut.name,
            })

    ki = {
        'forras': 'cab Produkttechnik — gyári alkatrészlisták',
        'gepek': sorted(gepek.values(), key=lambda g: g['nev']),
        'alkatreszek': alkatreszek,
    }
    a.ki.parent.mkdir(parents=True, exist_ok=True)
    a.ki.write_text(json.dumps(ki, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

    if a.web:
        tomor = tomorit(ki['gepek'], alkatreszek)
        a.web.parent.mkdir(parents=True, exist_ok=True)
        a.web.write_text(json.dumps(tomor, ensure_ascii=False, separators=(',', ':')),
                         encoding='utf-8')

    csoporttal = sum(1 for x in alkatreszek if x['csoport'])
    nevvel = sum(1 for x in alkatreszek if x['megnevezes'])
    print(f'gép:                {len(ki["gepek"])}')
    print(f'alkatrész:          {len(alkatreszek)}')
    print(f'lefedettség:        {ossz_lett}/{ossz_var} ({ossz_lett/max(1,ossz_var):.1%})')
    print(f'megnevezéssel:      {nevvel} ({nevvel/max(1,len(alkatreszek)):.1%})')
    print(f'szerelési egységgel:{csoporttal} ({csoporttal/max(1,len(alkatreszek)):.1%})')
    print(f'részletes jegyzék:  {a.ki}  ({a.ki.stat().st_size/1024:.0f} kB)')
    if a.web:
        egyedi = len(json.loads(a.web.read_text(encoding='utf-8'))['t'])
        print(f'tömör index:        {a.web}  ({a.web.stat().st_size/1024:.0f} kB, '
              f'{egyedi} egyedi cikkszám)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
