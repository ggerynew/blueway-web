# Az alkatrészkereső adatai

Ebben a mappában az alkatrészkereső forrásadatai vannak. **A weblapra ebből
semmi nem kerül ki** — a Next.js csak a `public/` mappát tölti fel —, ezért a
deploy méretét és idejét nem befolyásolja.

| fájl | mi ez |
| --- | --- |
| `SPARES.md` | a gyári dokumentumok katalógusa: melyik PDF melyik géptípushoz való, hány oldal, melyik a duplikátum |
| `alkatreszek-teljes.json` | a kinyert, részletes jegyzék: 7894 sor, gépenként külön tétel, tételszámmal, csomagolási egységgel és forrásfájllal |

A weblapra a jóval kisebb, tömör változat kerül: `public/alkatreszek.json`
(143 kB, 2730 egyedi cikkszám). Azt a `scripts/alkatresz-index.py` állítja elő
ugyanabból a forrásból.

## Újragenerálás

A generátor a 60 gyári PDF-et kéri, ami **nincs a repóban** (122 MB — minden
CI-futásnál letöltésre kerülne, tehát meghosszabbítaná a deployt). A PDF-ek a
gyártói dokumentumtárból származnak; ha kéznél vannak egy mappában:

```
python3 scripts/alkatresz-index.py \
    --pdf <a PDF-ek mappája> \
    --md  data/SPARES.md \
    --ki  data/alkatreszek-teljes.json \
    --web public/alkatreszek.json
```

A futás a végén kiírja a lefedettséget. A mostani állapot:

```
gép:                 48
alkatrész:           7894
lefedettség:         7894/7894 (100,0%)
megnevezéssel:       7893 (100,0%)
szerelési egységgel: 7285 (92,3%)
```

A **lefedettség** azt méri, hogy a PDF-ekben előforduló összes cikkszám-alakú
sztringből mennyit sikerült tételként is kinyerni. Ha ez az arány egy új
dokumentumkészletnél leesik, a generátor kiegészítésre szorul — nem szabad
hiányos jegyzéket kitenni, mert a kereső hallgatása („nincs ilyen alkatrész")
ugyanolyan félrevezető, mint egy téves cikkszám.
