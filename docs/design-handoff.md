# Blueway — Fejlesztői handoff (design spec)

Forrás Figma: **Blueway — Weboldal** — `fkJMnmU3tTC4AGooN3Ju4F`
Keretek: `Homepage — HU` (1:2), `Contact — HU` (5:2), `Product — CAB SQUIX 4 — HU` (7:2)
Kód: Next.js 15 (App Router) + Tailwind CSS 4. A tokenek forrása: `src/app/globals.css` (`@theme`).

Ez a dokumentum a Figma-dizájnt köti a kódhoz. A táblázatok bal oldala a vizuális érték, jobb oldala a **Tailwind-osztály / token**, amit a kódban használunk.

---

## 1. Színek (design tokenek)

`@theme`-ben definiálva, minden Tailwind util-ban `*-brand-700`, `*-ink`, stb. formában érhető el.

| Token | HEX | Használat |
|---|---|---|
| `brand-500` | `#3b82f6` | Listajel-pöttyök (feature bullet) |
| `brand-600` | `#2563eb` | Kötelező mező `*` jelölés |
| `brand-700` | `#1d4ed8` | **Elsődleges akció**, linkek, eyebrow, kiemelés |
| `brand-800` | `#1e40af` | Elsődleges gomb hover |
| `brand-100` | `#dbeafe` | Fókuszgyűrű (`ring`), kijelölés háttér |
| `ink` | `#111114` | Főszöveg, sötét gomb (header CTA) |
| `ink-muted` | `#55555e` | Másodlagos szöveg, leadek, footer |
| `surface` | `#fafafa` | Oldal háttér |
| `line` | `#e7e7ea` | Keretek, elválasztók |
| `#ffffff` | white | Kártyák, header, input háttér |

Kontraszt: `ink-muted`/surface ≈ 7:1, `brand-700`/white ≈ 7.8:1 → AA/AAA felett.

---

## 2. Tipográfia

Betű: **Inter** (`next/font`, `--font-inter`), `latin` + `latin-ext` (magyar ékezetek). Súlyok: Regular 400, Medium 500, Semi Bold 600.

| Szerep | Méret (mobil → md) | Súly | Tracking | Line-height | Osztályok |
|---|---|---|---|---|---|
| Hero H1 | 36 → 60px | 600 | −2% | ~104% | `text-4xl md:text-6xl font-semibold tracking-tight text-balance` |
| Aloldal H1 | 30 → 48px | 600 | −2% | ~110% | `text-3xl md:text-5xl font-semibold tracking-tight` |
| Termék H1 | 30 → 36px | 600 | −2% | — | `text-3xl md:text-4xl font-semibold tracking-tight` |
| Szekció H2 / kártyacím | 20px | 600 | −1% | — | `text-xl font-semibold tracking-tight` |
| Lead | 18px | 400 | — | 150% | `text-lg text-ink-muted` |
| Törzsszöveg | 16px | 400 | — | 150% | `text-ink-muted` |
| Eyebrow / meta | 14px | 500 | +0.5px, UPPERCASE | — | `text-sm font-medium uppercase tracking-wide text-brand-700` |
| Mikro-címke (info/feature fejléc) | 11–13px | 500 | +0.5px, UPPERCASE | — | `text-xs/text-sm font-medium uppercase` |
| Nav / link | 14px | 400 | — | — | `text-sm text-ink-muted` |

---

## 3. Térköz, konténer, rács

- **Konténer:** `max-w-6xl` (1152px) középre, `px-6` (24px) oldalpadding. (A Figma-keretek 1440px-en 96px oldalpaddinggel a `max-w-6xl`+`px-6` vizuális megfelelője.)
- **Szekció-ritmus (függőleges):** `py-16 md:py-24` (64 → 96px). Hero: `pt-24 pb-20 md:pt-36 md:pb-28`.
- **Rács:** kártyák `grid gap-4`, oszlopok `sm:grid-cols-2 lg:grid-cols-3` (partnerek/termékek), pillérek `md:grid-cols-3`, nyomtatófejek `md:grid-cols-2`.
- **Töréspontok:** Tailwind alap — `sm` 640, `md` 768 (tipográfia + oszlopváltás), `lg` 1024.

---

## 4. Sugarak, keret, árnyék

| Elem | Sugár | Keret | Egyéb |
|---|---|---|---|
| Kártya | `rounded-2xl` (16px) | `border border-line` | hover: `-translate-y-0.5 border-brand-300 shadow-sm` |
| Pill gomb | `rounded-full` | — | — |
| Input / textarea | `rounded-xl` (12px) | `border border-line` | fókusz: `border-brand-500 ring-2 ring-brand-100` |
| Tab-csoport | `rounded-full` | `border border-line` | aktív tab: `bg-ink text-white` |
| Médiakeret (termék) | `rounded-2xl` | `border border-line` | 4:3 arány, `object-contain` |

---

## 5. Komponensek

### Gombok
| Variáns | Háttér | Szöveg | Padding | Hover |
|---|---|---|---|---|
| Elsődleges | `bg-brand-700` | white | `px-6 py-3` `text-sm font-medium` | `bg-brand-800` |
| Másodlagos | white | `ink` | `px-6 py-3` | `border-ink-muted` (keret: `border-line`) |
| Header CTA (Ajánlatkérés) | `bg-ink` | white | `px-4 py-2` | `bg-brand-700` |

### Header (`src/components/header.tsx`)
- Sticky, `bg-surface/80 backdrop-blur-md`, alsó `border-line`, magasság `h-16`.
- Logó: „**blue**way" — `blue` = `brand-700`, `way` = `ink`, 18px/600.
- Nav (`md:flex`, mobilon rejtve): 5 link, `gap-7`, `text-sm text-ink-muted` → hover `text-ink`.
- Nyelvváltó: `hreflang` + `aria-label` (a11y), majd a sötét CTA pill.

### Kártya (kategória / partner / termék)
- White háttér, `border-line`, `rounded-2xl`, `p-5`/`p-6`.
- Cím `text-lg font-semibold` → hover `text-brand-700`, leírás `text-sm text-ink-muted`.

### Űrlapmező (`src/components/contact-form.tsx`)
- Címke 14px/500 `ink`; kötelezőnél `*` `brand-600`, `aria-hidden` (a `required` közvetíti a jelentést).
- Input: `rounded-xl border-line px-4 py-2.5 text-sm`, placeholder `ink-muted/60`, fókusz `ring-2 ring-brand-100 border-brand-500`.
- Küldés: elsődleges pill. Visszajelzés: **Sonner** toast (`richColors`, `bottom-right`). Küldés `mailto`-val (nincs backend).

### Footer (`src/components/footer.tsx`)
- Felső `border-line`, `max-w-6xl`, `py-10`, `text-sm text-ink-muted`.
- Bal: cégnév (`font-medium text-ink`) + címek. Jobb: telefon/e-mail linkek + copyright.

---

## 6. Mozgás (`src/components/reveal.tsx`)

Belépő animáció (Motion): `opacity 0→1`, `y 16→0`, `blur 4px→0`.
- Időzítés: `duration 0.5s`, ease `[0.21, 0.47, 0.32, 0.98]`.
- `whileInView`, `once: true`, `viewport margin -10%`.
- Sorrend: `delay` propszal lépcsőzve (jellemzően 0.05–0.08s / elem).

---

## 7. Akadálymentesség (beépítve)

- `<html lang>` locale szerint (`hu`/`en`) — WCAG 3.1.1.
- „Ugrás a tartalomra" skip-link + `main#main` — WCAG 2.4.1.
- Nyelvváltó `aria-label` + `hreflang` — WCAG 4.1.2.
- Kötelező mezők: `required` + a `*` `aria-hidden`.
- Látható fókuszgyűrűk az űrlapon; képek `alt`, videó-`iframe` `title`, `model-viewer` `alt`.

---

## 8. Nyitott pontok / követendő

- **Valódi médiafeltöltés Figmába:** a termékkeret képslotja jelenleg placeholder (az egress-policy tiltja a `mcp.figma.com`-ot). Valós fotóhoz: kézi feltöltés a Figmában, vagy engedélyezett hálózati környezet.
- **EN Figma-keretek:** jelenleg csak HU keretek vannak.
- **`lang` statikus exportnál** futásidejű scripttel áll be; middleware-alapú i18n esetén teljesen szerveroldalivá tehető.
