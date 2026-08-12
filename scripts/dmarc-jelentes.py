#!/usr/bin/env python3
"""
DMARC összesítő jelentések feldolgozása — olvasható összefoglalóvá.

MIÉRT VAN EZ

A DMARC-rekordunk ma `p=none`, ami annyit tesz: „figyelj és jelents, de ne
csinálj semmit". A rekord célja nem ez — hanem hogy egyszer `quarantine`,
majd `reject` legyen belőle, és a nevünkben küldött hamis levelek ne
jussanak el a címzettekhez. Csakhogy a szigorítás VISSZAFELÉ is sülhet: ha
egy valódi levelünk nem felel meg a DMARC-nak, azt a fogadó kiszolgáló a
szemétbe teszi vagy eldobja — a vevő nem kapja meg az árajánlatot, és nem is
tudja meg, hogy volt.

A jelentések pontosan ezt a kockázatot mérik meg. A világ levelezőrendszerei
naponta beszámolnak róla, ki küldött a blueway.hu nevében, és az megfelelt-e.
Ez a szkript ezt a beszámolót fordítja le egyetlen kérdésre:

    BIZTONSÁGOS-E MÁR SZIGORÍTANI?

MIT KELL TUDNI A VÁLASZ ÉRTELMEZÉSÉHEZ

A DMARC akkor teljesül, ha az SPF VAGY a DKIM megfelel — és a levél
feladója egyezik a borítékon szereplővel („igazodás"). A blueway.hu-nak ma
NINCS DKIM-kulcsa: tizennégy szokásos szelektort megpróbáltunk, egyik sem
válaszolt. Vagyis minden a puszta SPF-en múlik, az pedig TOVÁBBÍTÁSKOR
ELROMLIK: ha valaki a levelünket átirányítja egy másik postafiókba, a
továbbító kiszolgáló IP-je nem szerepel az SPF-ünkben, és a levél elbukik.
Ez ma nem baj (p=none), quarantine mellett viszont az ilyen levelek a
szemétmappában landolnának.

Ezért a szkript nem csak százalékot mond, hanem külön kiemeli, ha a
megfelelés csak SPF-en áll — mert akkor a szigorítás előtt DKIM kell.

HASZNÁLAT

A jelentések a dmarc@blueway.hu postafiókba érkeznek, tömörített
mellékletként. Mentsd le őket egy mappába (a levelezőből: mellékletek
mentése), majd:

    python3 scripts/dmarc-jelentes.py <mappa-vagy-fájlok>

Például:

    python3 scripts/dmarc-jelentes.py ~/Letoltesek/dmarc/
    python3 scripts/dmarc-jelentes.py jelentes1.xml.gz jelentes2.zip

Mindhárom szokásos formátumot érti (.xml, .gz, .zip) — a szolgáltatók
ugyanis nem egyformán csomagolnak: a Google zip-et küld, mások gzip-et.

A jelentéseket NEM tárolja és nem küldi sehová: beolvassa, összegzi,
kiírja. Személyes adat nincs bennük (a DMARC összesítő jelentés IP-t és
darabszámot tartalmaz, levélcímet és tartalmat nem), de a bemeneti fájlokat
sem érdemes a repóba tenni.
"""

import argparse
import collections
import gzip
import io
import pathlib
import socket
import struct
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

# ——— Küszöbök a döntéshez ——————————————————————————————————————
#
# 99%: a maradék 1% jellemzően továbbított levél és eseti gépi feladó. Ez
# alatt a szigorítás valódi leveleket dobatna el.
BIZTONSAGOS_ARANY = 99.0
# Két hét: ennél rövidebb minta nem mutatja meg a havi számlázási körleveleket,
# a nyaralás miatti átirányításokat és a ritkább gépi feladókat.
ELEG_NAP = 14
# Ennél kevesebb levélből nem érdemes következtetni.
ELEG_LEVEL = 100


def ptr_nev(ip: str) -> str | None:
    """Kié az IP — fordított névfeloldás, saját DNS-kérdéssel.

    Nincs `dig` a fejlesztői gépen, a `socket.gethostbyaddr` pedig a rendszer
    beállításain múlik és hosszan blokkolhat. Ez a néhány sor kiszámítható:
    hatmásodperces határidő, hiba esetén None — a jelentés enélkül is teljes,
    a név csak kényelem.
    """
    try:
        ford = '.'.join(reversed(ip.split('.'))) + '.in-addr.arpa'
        fej = struct.pack('>HHHHHH', 0x1234, 0x0100, 1, 0, 0, 0)
        q = b''.join(bytes([len(c)]) + c.encode() for c in ford.split('.')) + b'\x00'
        q += struct.pack('>HH', 12, 1)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(6)
        s.sendto(fej + q, ('8.8.8.8', 53))
        adat, _ = s.recvfrom(4096)
        s.close()

        def nevet_olvas(i):
            resz = []
            while True:
                hossz = adat[i]
                if hossz == 0:
                    i += 1
                    break
                if hossz & 0xC0:
                    mutato = struct.unpack('>H', adat[i:i + 2])[0] & 0x3FFF
                    resz.append(nevet_olvas(mutato)[0])
                    i += 2
                    break
                resz.append(adat[i + 1:i + 1 + hossz].decode(errors='replace'))
                i += 1 + hossz
            return '.'.join(resz), i

        db = struct.unpack('>H', adat[6:8])[0]
        i = 12
        while adat[i] != 0:
            i += adat[i] + 1
        i += 5
        for _ in range(db):
            _n, i = nevet_olvas(i)
            tip, _o, _t, rdlen = struct.unpack('>HHIH', adat[i:i + 10])
            i += 10
            if tip == 12:
                return nevet_olvas(i)[0]
            i += rdlen
    except Exception:
        return None
    return None


def xml_tartalmak(ut: pathlib.Path):
    """A fájlból előbányászott XML-ek — akárhogy is van becsomagolva.

    A szolgáltatók nem egyformán csomagolnak (a Google zip-et küld, mások
    gzipet), a levelezők pedig néha átnevezik a kiterjesztést. Ezért nem a
    névre hagyatkozunk, hanem a tartalom első bájtjaira.
    """
    nyers = ut.read_bytes()
    if nyers[:2] == b'PK':
        with zipfile.ZipFile(io.BytesIO(nyers)) as z:
            for nev in z.namelist():
                if nev.lower().endswith('.xml'):
                    yield nev, z.read(nev)
        return
    if nyers[:2] == b'\x1f\x8b':
        yield ut.name, gzip.decompress(nyers)
        return
    yield ut.name, nyers


def szoveg(elem, ut: str, alap: str = '') -> str:
    """Egy mező értéke, üres elemet is elviselve."""
    talalt = elem.find(ut)
    if talalt is None or talalt.text is None:
        return alap
    return talalt.text.strip()


class Osszesites:
    def __init__(self):
        self.jelentesek = {}          # report_id → (org, kezdet, veg)
        self.forrasok = collections.defaultdict(
            lambda: {'db': 0, 'megfelel': 0, 'spf': 0, 'dkim': 0, 'fejlec': set()},
        )
        self.hazirendek = collections.Counter()
        self.kezdet = None
        self.veg = None

    def feldolgoz(self, xml: bytes, honnan: str) -> bool:
        try:
            gyoker = ET.fromstring(xml)
        except ET.ParseError as hiba:
            print(f'   ! {honnan}: nem értelmezhető XML ({hiba})', file=sys.stderr)
            return False
        if gyoker.tag != 'feedback':
            print(f'   ! {honnan}: nem DMARC-jelentés (gyökérelem: {gyoker.tag})', file=sys.stderr)
            return False

        meta = gyoker.find('report_metadata')
        azonosito = szoveg(meta, 'report_id') if meta is not None else ''
        org = szoveg(meta, 'org_name', '(ismeretlen)') if meta is not None else '(ismeretlen)'
        try:
            kezd = int(szoveg(meta, 'date_range/begin', '0'))
            vege = int(szoveg(meta, 'date_range/end', '0'))
        except ValueError:
            kezd = vege = 0

        # Ugyanaz a jelentés több fájlban is megérkezhet (újraküldés, kézi
        # mentés kétszer) — az azonosító alapján csak egyszer számoljuk.
        kulcs = f'{org}:{azonosito}'
        if kulcs in self.jelentesek:
            return False
        self.jelentesek[kulcs] = (org, kezd, vege)

        if kezd:
            self.kezdet = kezd if self.kezdet is None else min(self.kezdet, kezd)
        if vege:
            self.veg = vege if self.veg is None else max(self.veg, vege)

        hazirend = gyoker.find('policy_published')
        if hazirend is not None:
            self.hazirendek[
                f"p={szoveg(hazirend, 'p', '?')} sp={szoveg(hazirend, 'sp', '—')} "
                f"pct={szoveg(hazirend, 'pct', '100')} "
                f"adkim={szoveg(hazirend, 'adkim', 'r')} aspf={szoveg(hazirend, 'aspf', 'r')}"
            ] += 1

        for rekord in gyoker.findall('record'):
            sor = rekord.find('row')
            if sor is None:
                continue
            ip = szoveg(sor, 'source_ip', '?')
            try:
                db = int(szoveg(sor, 'count', '0'))
            except ValueError:
                db = 0
            # A policy_evaluated MÁR az igazodást is figyelembe vevő eredmény —
            # nem ugyanaz, mint a nyers auth_results. A DMARC akkor teljesül,
            # ha a kettő közül BÁRMELYIK megfelel.
            spf_ok = szoveg(sor, 'policy_evaluated/spf').lower() == 'pass'
            dkim_ok = szoveg(sor, 'policy_evaluated/dkim').lower() == 'pass'

            f = self.forrasok[ip]
            f['db'] += db
            if spf_ok or dkim_ok:
                f['megfelel'] += db
            if spf_ok:
                f['spf'] += db
            if dkim_ok:
                f['dkim'] += db
            azon = rekord.find('identifiers')
            if azon is not None:
                fejlec = szoveg(azon, 'header_from')
                if fejlec:
                    f['fejlec'].add(fejlec)
        return True


def nap(ido: int) -> str:
    if not ido:
        return '?'
    return datetime.fromtimestamp(ido, timezone.utc).strftime('%Y-%m-%d')


def main() -> int:
    ertelmezo = argparse.ArgumentParser(
        description='DMARC összesítő jelentések feldolgozása.',
    )
    ertelmezo.add_argument('utak', nargs='+', help='jelentésfájlok vagy egy mappa')
    ertelmezo.add_argument('--nincs-nevfeloldas', action='store_true',
                           help='ne kérdezze meg, kié az IP (offline gépen)')
    ervek = ertelmezo.parse_args()

    fajlok: list[pathlib.Path] = []
    for nyers in ervek.utak:
        ut = pathlib.Path(nyers).expanduser()
        if ut.is_dir():
            fajlok.extend(sorted(x for x in ut.rglob('*') if x.is_file()))
        elif ut.is_file():
            fajlok.append(ut)
        else:
            print(f'Nincs ilyen fájl vagy mappa: {ut}', file=sys.stderr)

    if not fajlok:
        print('Nem találtam feldolgozandó fájlt.', file=sys.stderr)
        return 1

    ossz = Osszesites()
    beolvasva = 0
    for f in fajlok:
        try:
            for nev, xml in xml_tartalmak(f):
                if ossz.feldolgoz(xml, f'{f.name}:{nev}'):
                    beolvasva += 1
        except Exception as hiba:
            print(f'   ! {f.name}: nem sikerült kicsomagolni ({hiba})', file=sys.stderr)

    if not beolvasva:
        print('Egyetlen értelmezhető DMARC-jelentést sem találtam.', file=sys.stderr)
        return 1

    osszes = sum(f['db'] for f in ossz.forrasok.values())
    megfelel = sum(f['megfelel'] for f in ossz.forrasok.values())
    csak_spf = sum(f['spf'] - min(f['spf'], f['dkim']) for f in ossz.forrasok.values())
    dkim_van = sum(f['dkim'] for f in ossz.forrasok.values())
    arany = (megfelel / osszes * 100) if osszes else 0.0
    napok = ((ossz.veg - ossz.kezdet) / 86400) if (ossz.kezdet and ossz.veg) else 0

    print()
    print('═══ DMARC-jelentés ══════════════════════════════════════════')
    print(f'  {beolvasva} jelentés {len({o for o, _, _ in ossz.jelentesek.values()})} '
          f'szolgáltatótól: '
          f'{", ".join(sorted({o for o, _, _ in ossz.jelentesek.values()}))}')
    print(f'  Időszak: {nap(ossz.kezdet)} — {nap(ossz.veg)} ({napok:.0f} nap)')
    for hr, db in ossz.hazirendek.most_common():
        print(f'  Közzétett házirend: {hr}  ({db} jelentésben)')
    print()
    print(f'  Levelek száma:      {osszes}')
    print(f'  DMARC-nak megfelel: {megfelel} ({arany:.1f}%)')
    print(f'  Ebből DKIM-mel is:  {dkim_van}')
    print(f'  Csak SPF-en múlik:  {csak_spf}')

    # ——— Feladók, a legtöbbet küldővel kezdve ————————————————
    print()
    print('─── Feladó gépek ────────────────────────────────────────────')
    rendezett = sorted(ossz.forrasok.items(), key=lambda x: -x[1]['db'])
    for ip, adat in rendezett:
        bukott = adat['db'] - adat['megfelel']
        jel = '✓' if bukott == 0 else '✗'
        nev = '' if ervek.nincs_nevfeloldas else (ptr_nev(ip) or '')
        cimke = f' [{nev}]' if nev else ''
        fejlecek = ', '.join(sorted(adat['fejlec'])) or '?'
        print(f'  {jel} {ip:<16}{cimke}'.rstrip())
        print(f'      {adat["db"]} levél, ebből {bukott} nem felel meg '
              f'(SPF {adat["spf"]}, DKIM {adat["dkim"]}) — feladó: {fejlecek}')

    # ——— A tényleges kérdés ————————————————————————————————
    print()
    print('─── Szigoríthatunk? ─────────────────────────────────────────')
    akadalyok = []
    if osszes < ELEG_LEVEL:
        akadalyok.append(f'kevés a minta ({osszes} levél, legalább {ELEG_LEVEL} kellene)')
    if napok < ELEG_NAP:
        akadalyok.append(f'rövid az időszak ({napok:.0f} nap, legalább {ELEG_NAP} kellene)')
    if arany < BIZTONSAGOS_ARANY:
        akadalyok.append(f'a megfelelés {arany:.1f}%, a küszöb {BIZTONSAGOS_ARANY}%')
    if dkim_van == 0:
        akadalyok.append('NINCS DKIM: a megfelelés csak SPF-en áll, ami továbbításkor elromlik')

    if not akadalyok:
        print('  IGEN — a minta elég nagy, elég hosszú, és a levelek gyakorlatilag')
        print('  mind megfelelnek. A következő lépés: p=none → p=quarantine, pct=25')
        print('  kezdéssel, majd fokozatosan 100-ig. A rekord:')
        print('    v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc@blueway.hu')
    else:
        print('  MÉG NEM. Ami hiányzik:')
        for a in akadalyok:
            print(f'    • {a}')
        if dkim_van == 0:
            print()
            print('  A DKIM a legfontosabb: kérd a tárhelyszolgáltatótól a bekapcsolását')
            print('  a blueway.hu-ra. Nélküle egy továbbított levelünk quarantine')
            print('  mellett a szemétmappába kerülne, és a vevő nem tudná meg.')
        bukok = [(ip, a) for ip, a in rendezett if a['db'] - a['megfelel'] > 0]
        if bukok:
            print()
            print('  A nem megfelelő feladókat egyenként el kell dönteni:')
            print('  a MIÉNK-et javítani kell (SPF-be felvenni), az IDEGEN pedig')
            print('  éppen a hamisítás, ami ellen a szigorítás véd.')
    print()
    return 0


if __name__ == '__main__':
    sys.exit(main())
