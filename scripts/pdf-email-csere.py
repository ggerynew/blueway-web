# -*- coding: utf-8 -*-
"""A személyes e-mail cím cseréje a jogi PDF-ekben, a beágyazott betűkészlettel.

A PDF-ek Wordből, „Print to PDF"-fel készültek: a szöveg alrészhalmaz-
betűkészlet glyph-azonosítóival van kódolva, tehát nyers keresés-csere nem
működik. Ezért karakterszinten keressük meg a címet (rawdict), kitakarjuk a
pontos befoglalóját, és ugyanazzal a beágyazott betűvel, ugyanarra az
alapvonalra írjuk vissza az újat.

A záró pontosvesszőt is belevesszük a cseébe ott, ahol van: az új cím
rövidebb, és így a keletkező hézag szóközhelyre esik — sorkizárt szövegben ez
természetes, míg a pontosvessző elé csúszó hézag elírásnak látszana.
"""
import os
import sys
import tempfile

import fitz

REGI = 'gaspar@blueway.hu'
UJ = 'info@blueway.hu'

def betukeszlet(d, nev='CIDFont+F2'):
    for pno in range(d.page_count):
        for t in d.get_page_fonts(pno, full=True):
            if t[3] == nev:
                return d.extract_font(t[0])[3]
    return None

def elofordulasok(page, minta):
    """A minta karakterei: (befoglaló, első karakter alapvonala, betűméret)."""
    ki = []
    for blokk in page.get_text('rawdict')['blocks']:
        for sor in blokk.get('lines', []):
            for span in sor['spans']:
                szoveg = ''.join(c['c'] for c in span['chars'])
                kezd = szoveg.find(minta)
                while kezd != -1:
                    darab = span['chars'][kezd:kezd + len(minta)]
                    r = fitz.Rect(darab[0]['bbox'])
                    for c in darab[1:]:
                        r |= fitz.Rect(c['bbox'])
                    ki.append((r, fitz.Point(darab[0]['origin']), span['size'], span['font']))
                    kezd = szoveg.find(minta, kezd + 1)
    return ki

def javit(utvonal):
    d = fitz.open(utvonal)
    buf = betukeszlet(d)
    if not buf:
        print(f'{utvonal}: nem találom a betűkészletet'); return False
    # A betűkészlet FÁJLBÓL megy be. Lapra regisztrálni nem elég: az
    # apply_redactions() újraépíti a lap erőforrásait, és a korábban felvett
    # betű elveszik — emiatt bukott el az első próbálkozás.
    fajl = tempfile.NamedTemporaryFile(suffix='.ttf', delete=False)
    fajl.write(buf); fajl.close()
    db = 0
    for pno in range(d.page_count):
        page = d[pno]
        # a pontosvesszővel együtt, ha úgy áll
        for minta, csere in ((REGI + ';', UJ + ';'), (REGI, UJ)):
            for r, origo, meret, fnev in elofordulasok(page, minta):
                page.add_redact_annot(r + (-0.5, -0.5, 0.5, 0.5), fill=(1, 1, 1), cross_out=False)
                page.apply_redactions()
                page.insert_text(origo, csere, fontname='F2sub', fontfile=fajl.name,
                                 fontsize=meret, color=(0, 0, 0))
                print(f'   {pno+1}. oldal: „{minta}" → „{csere}"  ({fnev} {meret:.1f}pt, '
                      f'x={origo.x:.1f} y={origo.y:.1f})')
                db += 1
            if db:
                break
    # Új fájlba mentünk, és utána cseréljük: a PyMuPDF a megnyitott
    # eredetibe csak inkrementálisan írna, az viszont a régi szöveget is
    # bent hagyná a fájlban — nálunk pont az a lényeg, hogy eltűnjön.
    # A beírt betűkészlet TELJES fájlként kerülne be (384 kB), pedig
    # tizenöt karakter kell belőle. A subset_fonts() levágja a fölösleget.
    try:
        d.subset_fonts()
    except Exception as e:
        print(f'   (a betűkészlet szűkítése kimaradt: {e})')
    ideiglenes = utvonal + '.uj'
    d.save(ideiglenes, garbage=4, deflate=True, clean=True)
    d.close()
    os.replace(ideiglenes, utvonal)
    os.unlink(fajl.name)
    return db > 0

for f in ('public/dokumentumok/blueway-adatkezelesi-tajekoztato.pdf',
          'public/dokumentumok/blueway-aszf.pdf'):
    print(f'=== {f}')
    if not javit(f):
        print('   NEM sikerült'); sys.exit(1)
