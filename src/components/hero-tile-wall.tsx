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

/** Tervezési méret: ekkora négyzetre van kitalálva a gömb, erre skálázunk. */
const TERV = 500;
const SUGAR = 176;
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
      style={{ perspective: '1100px', touchAction: 'none' }}
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
            {tiles.map((t, i) => {
              const { szelesseg, hosszusag } = helyek[i];
              return (
                <Link
                  key={`${t.href}-${i}`}
                  href={t.href}
                  aria-label={t.alt}
                  title={t.alt}
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
