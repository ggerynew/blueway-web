'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Tile = { src: string; alt: string; href: string };

/**
 * Forgó termékgömb a főoldalra: a teljes kínálat fotói egy gömb felületén.
 *
 * Miért gömb és nem henger: a henger egyetlen sorral (vagy kettővel) dolgozik,
 * és a csempék száma korlátozza a kerülete. Az összes termék így nem fér el —
 * a gömb felülete viszont a sugár négyzetével nő, tehát ötven fölötti csempét
 * is elbír anélkül, hogy az egyes képek olvashatatlanul kicsik lennének.
 *
 * A csempék elhelyezése Fibonacci-gömb (aranyszög-spirál): ez osztja el a
 * pontokat a legegyenletesebben egy gömbön. Fontos, hogy DETERMINISZTIKUS —
 * a kiszolgálón és a böngészőben ugyanaz jön ki, tehát nincs hidratálási
 * eltérés. A véletlen csak a mozgásban van, az pedig a betöltés után indul.
 *
 * A forgás magától megy, és időnként irányt és szöget vált: két tengely körüli
 * sebességet tartunk, és néhány másodpercenként új célsebességet sorsolunk,
 * amire lágyan rááll. Egérrel (vagy érintéssel) bárhol meg lehet fogni és
 * forgatni; elengedés után a lendület kifut.
 *
 * Az EGÉSZ csempére kattintva megnyílik a termékoldal. Ha a mutató a lenyomás
 * óta elmozdult (tehát forgatás történt), a kattintást elnyeljük.
 */

/**
 * Tervezési méret: ekkora négyzetre van kitalálva a gömb, erre skálázunk.
 *
 * A SUGÁR és a CSEMPE_SZ aránya dönti el, összeérnek-e a képek. 55 csempénél
 * egyszerre 22 látszik, és R = 176 mellett ezek közül 24 pár átfedte egymást,
 * a legrosszabb 23 pixellel — 74 pixeles csempéken ez a szélek összeérése.
 *
 * A Fibonacci-gömbön a legközelebbi két pont távolsága ≈ 3,09·R/√n, tehát 55
 * csempénél 0,417·R. Ahhoz, hogy a 82 pixel széles csempék közt maradjon is
 * hézag, ennek jóval 82 fölött kell lennie: R = 265 → 110 pixel, tehát 28
 * pixel hézag.
 *
 * A TERV ezzel együtt nő, különben a gömb kilógna: a szélső csempék az
 * egyenlítő peremén vannak, R + fél csempe = 306 pixelre a középponttól.
 * 640-es tervmérettel marad ~5% ráhagyás.
 */
const TERV = 640;
const SUGAR = 265;
const CSEMPE_SZ = 82;
const CSEMPE_MA = 62;

/** Az X tengely körüli billenés határa — ennél tovább a képek fejre állnának. */
const BILLENES_HATAR = 22;

export function HeroTileWall({ tiles }: { tiles: Tile[] }) {
  const kulsoRef = useRef<HTMLDivElement>(null);
  const gombRef = useRef<HTMLDivElement>(null);
  const [meret, setMeret] = useState(TERV);

  const szog = useRef({ x: -6, y: 0 });
  const sebesseg = useRef({ x: 0, y: 0.09 });
  const celSebesseg = useRef({ x: 0.02, y: 0.09 });
  const huzas = useRef(false);
  const felette = useRef(false);
  const mozdult = useRef(false);
  const utolso = useRef({ x: 0, y: 0 });
  const kezdet = useRef({ x: 0, y: 0 });
  const automata = useRef(true);

  // A gömb fix pixelméretű; a tartóhoz igazítást skálázás végzi, hogy kisebb
  // kijelzőn se lógjon ki, és ne kelljen minden méretet újraszámolni.
  useEffect(() => {
    const el = kulsoRef.current;
    if (!el) return;
    const figyelo = new ResizeObserver(([bejegyzes]) => {
      setMeret(bejegyzes.contentRect.width || TERV);
    });
    figyelo.observe(el);
    return () => figyelo.disconnect();
  }, []);

  useEffect(() => {
    const el = gombRef.current;
    if (!el) return;

    // Aki kéri a csökkentett mozgást, annak a gömb áll — de kézzel forgatható.
    const csokkentett = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (csokkentett) {
      automata.current = false;
      sebesseg.current = { x: 0, y: 0 };
      celSebesseg.current = { x: 0, y: 0 };
    }

    // Új irány és szög sorsolása. Az előjel is változhat, tehát a gömb néha
    // visszafordul — ettől él a mozgás. A billenés a határ közelében befelé
    // fordul, hogy a csempék ne álljanak fejre.
    const ujIrany = () => {
      if (!automata.current) return;
      const jel = () => (Math.random() < 0.5 ? -1 : 1);
      const y = jel() * (0.045 + Math.random() * 0.13);
      let x = jel() * (0.012 + Math.random() * 0.05);
      if (szog.current.x > BILLENES_HATAR) x = -Math.abs(x);
      if (szog.current.x < -BILLENES_HATAR) x = Math.abs(x);
      celSebesseg.current = { x, y };
    };

    let ido = 0;
    const idozit = () => {
      ido = window.setTimeout(() => {
        ujIrany();
        idozit();
      }, 4000 + Math.random() * 5000);
    };
    idozit();

    let raf = 0;
    const kepkocka = () => {
      const all = huzas.current || felette.current;
      if (!all) {
        // Lágy ráállás a célsebességre — így az irányváltás nem rándulás.
        sebesseg.current.x += (celSebesseg.current.x - sebesseg.current.x) * 0.02;
        sebesseg.current.y += (celSebesseg.current.y - sebesseg.current.y) * 0.02;
        szog.current.x += sebesseg.current.x;
        szog.current.y += sebesseg.current.y;
        // Ha a billenés kifutna a határon, azonnal fordítsuk vissza a célt.
        if (Math.abs(szog.current.x) > BILLENES_HATAR) {
          celSebesseg.current.x = -Math.sign(szog.current.x) * Math.abs(celSebesseg.current.x);
        }
      }
      el.style.transform = `rotateX(${szog.current.x}deg) rotateY(${szog.current.y}deg)`;
      raf = requestAnimationFrame(kepkocka);
    };
    raf = requestAnimationFrame(kepkocka);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(ido);
    };
  }, []);

  // Húzás — ablakszintű figyelők, hogy a mutató a felületen kívül is működjön.
  useEffect(() => {
    function mozgas(e: PointerEvent) {
      if (!huzas.current) return;
      const dx = e.clientX - utolso.current.x;
      const dy = e.clientY - utolso.current.y;
      utolso.current = { x: e.clientX, y: e.clientY };
      szog.current.y += dx * 0.3;
      szog.current.x = Math.max(-60, Math.min(60, szog.current.x - dy * 0.2));
      sebesseg.current = { x: -dy * 0.2, y: dx * 0.3 };
      if (Math.hypot(e.clientX - kezdet.current.x, e.clientY - kezdet.current.y) > 6) {
        mozdult.current = true;
      }
    }
    function fel() {
      huzas.current = false;
    }
    window.addEventListener('pointermove', mozgas);
    window.addEventListener('pointerup', fel);
    return () => {
      window.removeEventListener('pointermove', mozgas);
      window.removeEventListener('pointerup', fel);
    };
  }, []);

  function lenyomas(e: React.PointerEvent) {
    huzas.current = true;
    mozdult.current = false;
    utolso.current = { x: e.clientX, y: e.clientY };
    kezdet.current = { x: e.clientX, y: e.clientY };
  }

  function kattintas(e: React.MouseEvent) {
    if (mozdult.current) e.preventDefault();
  }

  /**
   * Fibonacci-gömb: az i-edik pont helye az aranyszög szerint.
   * A visszaadott két szög közvetlenül CSS-forgatás, a csempe így kifelé néz.
   */
  const ARANYSZOG = Math.PI * (3 - Math.sqrt(5));
  const helyek = tiles.map((_, i) => {
    // A pólusokat kicsit elkerüljük (0,5 eltolás), különben ott torlódnának.
    const y = tiles.length === 1 ? 0 : 1 - ((i + 0.5) / tiles.length) * 2;
    const sugarY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = ARANYSZOG * i;
    const szelesseg = (Math.asin(y) * 180) / Math.PI; // -90…90
    const hosszusag = (Math.atan2(Math.sin(theta) * sugarY, Math.cos(theta) * sugarY) * 180) / Math.PI;
    return { szelesseg, hosszusag };
  });

  return (
    <div
      ref={kulsoRef}
      className="relative aspect-square w-full cursor-grab overflow-hidden rounded-[2rem] select-none active:cursor-grabbing"
      // Lágyabb perspektíva. 1100 pixelnél az elülső csempék jóval nagyobbnak
      // látszottak a hátsóknál, és az utolsó néhány átfedést épp ez okozta: a
      // méretük miatt értek össze, nem a távolságuk miatt.
      style={{ perspective: '1500px', touchAction: 'none' }}
      onPointerDown={lenyomas}
      onPointerEnter={() => (felette.current = true)}
      onPointerLeave={() => {
        felette.current = false;
        huzas.current = false;
      }}
    >
      {/* lágy háttérfény */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(120%_120%_at_70%_20%,var(--color-brand-100),transparent_60%)]"
      />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            transform: `scale(${meret / TERV})`,
            width: TERV,
            height: TERV,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div ref={gombRef} className="relative" style={{ transformStyle: 'preserve-3d' }}>
            {/* — Az izzó vörös mag és a lézernyalábok —
                A mag a gömb középpontjában ül, és minden csempéhez fut belőle
                egy vörös nyaláb — mintha azok tartanák a termékeket. A nyaláb
                ugyanazt a két forgatást kapja, mint a csempéje, majd egy
                rotateY(-90°) a saját hossztengelyét fordítja a csempe felé:
                így a vonal pontosan a középpontból a csempe közepéig ér.

                Minden nyaláb KÉT, hossztengelye mentén 90°-kal elforgatott
                lapból áll. Egyetlen lap éléről nézve eltűnne — a kereszt
                minden irányból vonalnak látszik.

                A mag ugyanezért három, egymásra merőleges korong: külön-külön
                lapos körök, együtt minden szögből gömbnek hatnak, a
                homályosítás pedig elmossa az élüket.

                Az időzítés az indexből számolt általálomszám — Math.random()
                itt hidratálási eltérést okozna, mert a kiszolgáló és a
                böngésző mást sorsolna. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {helyek.map(({ szelesseg, hosszusag }, i) => {
                const ido = (1.15 + (((i * 37) % 97) / 97) * 1.25).toFixed(2);
                const keses = (-(((i * 53) % 89) / 89) * 2.4).toFixed(2);
                const nyalab = `rotateY(${hosszusag}deg) rotateX(${-szelesseg}deg) rotateY(-90deg)`;
                // A fénylés a háttérszínátmenetbe van belesütve, nem
                // box-shadow és nem filter: azokat a böngésző a forgás minden
                // képkockájában újraszámolná — mérve a gömb 27 képkocka/mp-ről
                // 3,5-re esett tőlük. A színátmenetes elem egyszer rajzolódik
                // meg, utána csak transzformálódik.
                const lap = {
                  position: 'absolute' as const,
                  left: 0,
                  top: -3,
                  width: SUGAR,
                  height: 6,
                  transformOrigin: '0 50%',
                  background:
                    'radial-gradient(120% 50% at 0% 50%, rgba(255,90,65,0.95), rgba(255,45,45,0.35) 55%, rgba(255,45,45,0.1) 85%, transparent)',
                };
                return (
                  <div key={`nyalab-${i}`} style={{ transformStyle: 'preserve-3d' }}>
                    <div style={{ ...lap, transform: nyalab }}>
                      {/* A villám: fénylő csík, ami a magtól a csempéig fut és
                          vissza (alternate) — az útja a globals.css-ben. */}
                      <span
                        className="lezer-villam"
                        style={
                          {
                            position: 'absolute',
                            left: 0,
                            top: -2,
                            width: 34,
                            height: 10,
                            background:
                              'radial-gradient(50% 50% at 50% 50%, #fff 0%, #ff5a40 40%, rgba(255,60,40,0.35) 65%, transparent)',
                            '--villam-tav': `${SUGAR - 34}px`,
                            '--villam-ido': `${ido}s`,
                            '--villam-keses': `${keses}s`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                    <div style={{ ...lap, transform: `${nyalab} rotateX(90deg)` }} />
                  </div>
                );
              })}

              {/* A mag: három merőleges izzó korong + tágabb fényudvar. */}
              {['', 'rotateY(90deg)', 'rotateX(90deg)'].map((forgatas, i) => (
                <div
                  key={`mag-${i}`}
                  className="lezer-mag-korong"
                  style={{
                    position: 'absolute',
                    left: -30,
                    top: -30,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    transform: forgatas || undefined,
                    // Elmosás helyett lágy átmenet — a filter minden
                    // képkockában újraszámolódna a forgás alatt.
                    background:
                      'radial-gradient(circle, #fff 0%, #ffb3a0 18%, #ff6a50 34%, rgba(255,45,30,0.4) 58%, transparent 75%)',
                  }}
                />
              ))}
              <div
                className="lezer-mag-korong"
                style={{
                  position: 'absolute',
                  left: -70,
                  top: -70,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(255,70,45,0.45) 0%, rgba(255,50,32,0.22) 40%, rgba(255,45,30,0.08) 62%, transparent 78%)',
                }}
              />
            </div>

            {tiles.map((t, i) => {
              const { szelesseg, hosszusag } = helyek[i];
              return (
                <Link
                  key={`${t.href}-${i}`}
                  href={t.href}
                  aria-label={t.alt}
                  title={t.alt}
                  // Előtöltés nélkül. A falon minden termék szerepel, és a
                  // next/link a látótérbe kerülő linkek célját magától
                  // letöltené — mérve 44 adatcsomag, ~2,3 MB, minden főoldal-
                  // megnyitáskor. A fal böngészőfelület, nem célzott lista:
                  // egy csempére kattintva a betöltés így is azonnali érzetű.
                  prefetch={false}
                  onClick={kattintas}
                  className="absolute flex cursor-pointer items-center justify-center rounded-xl border border-line bg-white/95 p-1.5 shadow-[0_10px_28px_-10px_rgba(29,78,216,0.4)] ring-1 ring-transparent transition-[box-shadow,border-color] hover:border-brand-300 hover:ring-brand-500/50"
                  style={{
                    width: CSEMPE_SZ,
                    height: CSEMPE_MA,
                    left: -CSEMPE_SZ / 2,
                    top: -CSEMPE_MA / 2,
                    transform:
                      `rotateY(${hosszusag}deg) rotateX(${-szelesseg}deg) translateZ(${SUGAR}px)`,
                    // A gömb túloldalán lévő csempék nem látszanak — enélkül a
                    // hátulról nézett, tükrözött képek is átütnének.
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.src}
                    alt=""
                    className="pointer-events-none max-h-full max-w-full object-contain"
                    loading="lazy"
                    draggable={false}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* szélek elhalványítása a mélységérzethez */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(140%_100%_at_50%_50%,transparent_58%,var(--color-surface)_94%)]"
      />
    </div>
  );
}
