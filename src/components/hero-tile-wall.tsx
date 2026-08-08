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
  const vaszonRef = useRef<HTMLCanvasElement>(null);
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

    // ——— A lézer-réteg előkészítése ————————————————————————————————
    // A csempék iránya a gömbön, egységvektorként. Ugyanaz a képlet, mint a
    // CSS-forgatásé: rotateY(λ) rotateX(−φ) translateZ(R) a (R·cosφ·sinλ,
    // R·sinφ, R·cosφ·cosλ) pontba visz. A villámok üteme az indexből számolt
    // álvéletlen, hogy ne egyszerre lüktessen mind.
    const iranyok = helyek.map(({ szelesseg, hosszusag }) => {
      const fi = (szelesseg * Math.PI) / 180;
      const lam = (hosszusag * Math.PI) / 180;
      return {
        x: Math.cos(fi) * Math.sin(lam),
        y: Math.sin(fi),
        z: Math.cos(fi) * Math.cos(lam),
      };
    });
    const utemek = helyek.map((_, i) => ({
      ido: 1.15 + (((i * 37) % 97) / 97) * 1.25,
      fazis: ((i * 53) % 89) / 89,
    }));

    const vaszon = vaszonRef.current;
    const ctx = vaszon?.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (vaszon && ctx) {
      vaszon.width = TERV * dpr;
      vaszon.height = TERV * dpr;
      ctx.scale(dpr, dpr);
    }
    /** A perspektíva mélysége — a tartó `perspective: 1500px` értékével azonos. */
    const P = 1500;
    const KOZEP = TERV / 2;

    const rajzol = (most: number) => {
      if (!ctx) return;
      ctx.clearRect(0, 0, TERV, TERV);
      const rx = (szog.current.x * Math.PI) / 180;
      const ry = (szog.current.y * Math.PI) / 180;
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const cy = Math.cos(ry), sy = Math.sin(ry);

      // Egy pont a középpont és a csempe közti szakaszon (t: 0…1), kivetítve.
      const vetit = (v: { x: number; y: number; z: number }, t: number) => {
        const x1 = v.x * cy + v.z * sy;
        const z1 = -v.x * sy + v.z * cy;
        const y2 = v.y * cx - z1 * sx;
        const z2 = v.y * sx + z1 * cx;
        const a = SUGAR * t;
        const s = P / (P - z2 * a);
        return { x: KOZEP + x1 * a * s, y: KOZEP + y2 * a * s, z: z2 };
      };

      ctx.lineCap = 'round';
      for (let i = 0; i < iranyok.length; i++) {
        const veg = vetit(iranyok[i], 1);
        // A hátsó félteke nyalábjai halványabbak — ez adja a mélységet.
        const melyseg = (veg.z + 1) / 2;
        const er = 0.35 + 0.5 * melyseg;

        ctx.strokeStyle = `rgba(255,45,45,${(0.5 * er).toFixed(3)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(KOZEP, KOZEP);
        ctx.lineTo(veg.x, veg.y);
        ctx.stroke();

        // A mag felőli szakasz fényesebb — a nyaláb onnan „táplálkozik".
        const belso = vetit(iranyok[i], 0.68);
        ctx.strokeStyle = `rgba(255,85,60,${(0.8 * er).toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(KOZEP, KOZEP);
        ctx.lineTo(belso.x, belso.y);
        ctx.stroke();

        // A villám: rövid, fénylő szakasz, ami a magtól a csempéig fut és
        // vissza (háromszögjel), enyhe remegéssel.
        const u0 = most / 1000 / utemek[i].ido + utemek[i].fazis;
        const m = u0 % 2;
        const u = m < 1 ? m : 2 - m;
        const a1 = vetit(iranyok[i], Math.max(0, u - 0.05));
        const a2 = vetit(iranyok[i], Math.min(1, u + 0.05));
        const rezges = Math.sin(most / 47 + i) * 1.2;
        ctx.strokeStyle = `rgba(255,60,40,${(0.55 * er + 0.25).toFixed(3)})`;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(a1.x, a1.y + rezges);
        ctx.lineTo(a2.x, a2.y - rezges);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(a1.x, a1.y + rezges);
        ctx.lineTo(a2.x, a2.y - rezges);
        ctx.stroke();
      }

      // Az izzó mag: fényudvar + fehér közepű korong, lüktetéssel.
      const luktetes = 0.8 + 0.2 * Math.sin(most / 450);
      ctx.globalAlpha = luktetes;
      const udvar = ctx.createRadialGradient(KOZEP, KOZEP, 0, KOZEP, KOZEP, 72);
      udvar.addColorStop(0, 'rgba(255,70,45,0.5)');
      udvar.addColorStop(0.5, 'rgba(255,50,32,0.2)');
      udvar.addColorStop(1, 'rgba(255,45,30,0)');
      ctx.fillStyle = udvar;
      ctx.fillRect(KOZEP - 72, KOZEP - 72, 144, 144);
      const mag = ctx.createRadialGradient(KOZEP, KOZEP, 0, KOZEP, KOZEP, 30);
      mag.addColorStop(0, '#fff');
      mag.addColorStop(0.25, '#ffb3a0');
      mag.addColorStop(0.5, 'rgba(255,106,80,0.75)');
      mag.addColorStop(1, 'rgba(255,45,30,0)');
      ctx.fillStyle = mag;
      ctx.fillRect(KOZEP - 30, KOZEP - 30, 60, 60);
      ctx.globalAlpha = 1;
    };

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
      // Csökkentett mozgásnál az idő áll: a nyalábok látszanak, de a villámok
      // és a lüktetés nem mozog — összhangban a gömb álló forgásával.
      rajzol(csokkentett ? 0 : performance.now());
      raf = requestAnimationFrame(kepkocka);
    };
    raf = requestAnimationFrame(kepkocka);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(ido);
    };
    // A helyek a csempelistából determinisztikusan számolódnak, és a lista a
    // statikus oldalon nem változik — az első renderelés értéke végig érvényes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `scale(${meret / TERV})`,
            width: TERV,
            height: TERV,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* — Az izzó vörös mag, a lézernyalábok és a rajtuk futó villámok —
              Egyetlen vásznon, nem DOM-elemekként. Az első változat ~180 külön
              3D-elemből állt, és a preserve-3d térben ezek mélységi rendezése
              minden képkockában a fő szálon futott — élesben a görgetés
              szaggatott, a forgás lelassult. A vászon egyetlen réteg: a
              nyalábokat a forgatás amúgy is meglévő animációs ciklusa rajzolja
              újra, képkockánként ~150 vonalhúzással.

              A vászon lapos, z=0-nál áll, ezért NEM a forgó gömbben ül, hanem
              mellette: a rajzolás vetíti ki a csempék irányát ugyanazzal a
              forgatással és perspektívával, amit a CSS használ. Az elülső
              csempék a mélységi rendezés szerint a vászon fölé kerülnek, tehát
              a nyaláb vége a csempe MÖGÖTT tűnik el — mintha az tartaná. */}
          <canvas
            ref={vaszonRef}
            aria-hidden="true"
            width={TERV}
            height={TERV}
            className="pointer-events-none absolute"
            style={{ left: 0, top: 0, width: TERV, height: TERV }}
          />
          <div ref={gombRef} className="relative" style={{ transformStyle: 'preserve-3d' }}>
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
