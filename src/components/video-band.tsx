'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface VideoBandKlip {
  mp4: string;
  webm?: string;
  poszter: string;
  hossz: number;
  cim?: string;
}

export interface VideoBandCsempe {
  id: string;
  cim: string;
  videok: VideoBandKlip[];
}

export interface VideoBandFeliratok {
  /** A sáv rejtett címsora — a dokumentum vázlata miatt kell. */
  title: string;
  /** A klipválasztó vonalkasor neve képernyőolvasónak. */
  pickVideo: string;
  play: string;
  pause: string;
  /** A videó leírásának záró tagmondata: „…— néma, ismétlődő felvétel". */
  muted: string;
}

/**
 * Videósáv a kezdőlapra: teljes szélességű csempék, mindegyikben egy néma,
 * hurokban futó felvétel a gépeinkről.
 *
 * A klipek saját kiszolgálóról jönnek (lásd a miértet a bemutato-videok.ts
 * fejlécében), tehát itt natív `<video>` szól, nem beágyazott lejátszó. Ettől
 * a hurok pontos: a fájl maga a kívánt szakasz.
 *
 * A TERHELÉS KEZELÉSE a komponens fő feladata. Néhány órája még egy díszítő
 * effekt szaggatta be ezt a lapot, ezért itt minden lépés arra megy ki, hogy
 * a videó ne kerüljön a fő szálra és ne induljon el fölöslegesen:
 *
 *   - Lapbetöltéskor SEMMI nem tölt. A `<video>` `preload="none"`, és nincs
 *     `src`-e — csak a poszterkép megy ki a HTML-lel.
 *   - A forrás akkor kerül be, amikor a csempe 400 képpontra megközelíti a
 *     látóteret. Így a görgetés közben már kész, de a hajtás fölött nulla.
 *   - Lejátszani csak a láthatóak játszanak, és egyszerre legfeljebb annyi,
 *     amennyi indokolt: keskeny kijelzőn egy, szélesen három. A választás a
 *     láthatóság aránya szerint történik, tehát mindig az megy, amit néznek.
 *   - Háttérfülön (`visibilitychange`) mind megáll.
 *   - A haladásjelző NEM requestAnimationFrame-ből frissül, hanem a videó
 *     `timeupdate` eseményéből (~4/mp), és `transform: scaleX()`-re ír, ami a
 *     kompozitoron fut. A fő szálon így nulla a költsége.
 *
 * Aki csökkentett mozgást kér, vagy adattakarékos módban böngészik, annál
 * semmi nem indul magától: poszter marad, és van egy valódi indítógomb.
 * A szünetgomb mindig ott van és fókuszálható — a WCAG 2.2.2 megköveteli,
 * hogy az öt másodpercnél hosszabb, magától induló mozgás megállítható legyen.
 */

/**
 * Melyik fájlt kérje ez a böngésző.
 *
 * A WebM (VP9) azonos képminőségnél nagyjából harmadával kisebb, de a Safari
 * nem játssza le — ott az MP4 kell. A `canPlayType` üres sztringet ad, ha nem
 * tudja; minden más válasz („maybe", „probably") elfogadható.
 */
function valasztottForras(el: HTMLVideoElement): string | undefined {
  const { mp4, webm } = el.dataset;
  if (webm && el.canPlayType('video/webm; codecs="vp9"') !== '') return webm;
  return mp4;
}

/** Ugyanez klip-adatból, a kézi váltáshoz. */
function klipForras(el: HTMLVideoElement, klip: VideoBandKlip): string {
  if (klip.webm && el.canPlayType('video/webm; codecs="vp9"') !== '') return klip.webm;
  return klip.mp4;
}

/** Ennyivel a látótér előtt kezdjük tölteni a klipet. */
const TOLTES_ELOTT = '400px';
/** Efölött a láthatóság fölött játszhat egy csempe. */
const JATSZIK_FELETT = 0.4;
/** Ez alatt megáll — a két küszöb közti sáv a billegést akadályozza meg. */
const MEGALL_ALATT = 0.15;
/** Egyszerre ennyi klip futhat: keskeny kijelzőn egy, szélesen az összes. */
const EGYSZERRE_KESKENY = 1;
const EGYSZERRE_SZELES = 3;

export function VideoBand({
  csempek,
  feliratok,
}: {
  csempek: VideoBandCsempe[];
  feliratok: VideoBandFeliratok;
}) {
  const elemek = useRef(new Map<string, HTMLVideoElement>());
  const lathatosag = useRef(new Map<string, number>());
  /** Melyik klip megy éppen az egyes csempéken (index a csempe videói közt). */
  const [aktiv, setAktiv] = useState<Record<string, number>>(() =>
    Object.fromEntries(csempek.map((cs) => [cs.id, 0])),
  );
  /** Amit a látogató KÉZZEL állított meg — azt a görgetés nem indítja újra. */
  const kezzelAllitott = useRef(new Set<string>());
  const [allo, setAllo] = useState<Record<string, boolean>>({});
  const [onkentes, setOnkentes] = useState(false);

  const jelolo = useRef(new Map<string, HTMLSpanElement>());

  /** A pillanatnyi láthatóság alapján eldönti, minek kell mennie, és beállítja. */
  const ujraoszt = useCallback(() => {
    const keret =
      typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
        ? EGYSZERRE_SZELES
        : EGYSZERRE_KESKENY;

    const sorrend = [...lathatosag.current.entries()]
      .filter(([, arany]) => arany >= JATSZIK_FELETT)
      .sort((a, b) => b[1] - a[1])
      .slice(0, keret)
      .map(([id]) => id);
    const mehet = new Set(sorrend);

    for (const [id, el] of elemek.current) {
      const kell = mehet.has(id) && !kezzelAllitott.current.has(id) && !onkentes;
      const arany = lathatosag.current.get(id) ?? 0;
      if (kell) {
        // A React nem mindig írja ki a `muted` attribútumot, az önindítási
        // szabály viszont enélkül megtagadja a lejátszást — ezért itt is.
        el.muted = true;
        el.preload = 'auto';
        if (el.paused) {
          // A hibát NEM nyeljük el: ha a lejátszás nem indul (nem támogatott
          // kodek, önindítási tiltás), a gomb visszaváltson indításra, hogy a
          // látogató lássa, van mit tennie. A néma kudarc a legrosszabb.
          void el.play().then(
            () => setAllo((e) => (e[id] ? { ...e, [id]: false } : e)),
            () => setAllo((e) => (e[id] ? e : { ...e, [id]: true })),
          );
        }
      } else if (!el.paused && (arany < MEGALL_ALATT || !mehet.has(id))) {
        el.pause();
      }
    }
  }, [onkentes]);

  // Csökkentett mozgás vagy adattakarékos mód: semmi nem indul magától.
  useEffect(() => {
    const mozgas = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    type Halozat = { saveData?: boolean };
    const takarekos = (navigator as Navigator & { connection?: Halozat }).connection?.saveData;
    const allitsd = () => setOnkentes(Boolean(mozgas?.matches) || takarekos === true);
    allitsd();
    mozgas?.addEventListener('change', allitsd);
    return () => mozgas?.removeEventListener('change', allitsd);
  }, []);

  // Betöltés a látótér közelében, lejátszás a láthatóság szerint.
  useEffect(() => {
    const elemLista = [...elemek.current.values()];
    if (!elemLista.length) return;

    const tolto = new IntersectionObserver(
      (bejegyzesek) => {
        for (const b of bejegyzesek) {
          const el = b.target as HTMLVideoElement;
          if (b.isIntersecting && !el.getAttribute('src')) {
            const forras = valasztottForras(el);
            if (forras) {
              // Előbb CSAK a fejadatot kérjük (`metadata`): az a fájl elején
              // ülő pár száz kilobájt, amitől a hossz és az első képkocka
              // megvan. A teljes puffereléshez a lejátszás előtt kapcsolunk
              // — így a látótér szélét épp csak megkarcoló sáv nem tölt le
              // több megabájtot fölöslegesen.
              el.preload = 'metadata';
              el.setAttribute('src', forras);
              el.load();
            }
          }
        }
      },
      { rootMargin: TOLTES_ELOTT },
    );

    const jatszo = new IntersectionObserver(
      (bejegyzesek) => {
        for (const b of bejegyzesek) {
          const id = (b.target as HTMLElement).dataset.csempe;
          if (id) lathatosag.current.set(id, b.intersectionRatio);
        }
        ujraoszt();
      },
      // Sűrű küszöbsor: a láthatóság aránya folyamatosan követhető, tehát a
      // „melyik a legláthatóbb" döntés nem ugrál.
      { threshold: [0, 0.15, 0.3, 0.4, 0.6, 0.8, 1] },
    );

    for (const el of elemLista) {
      tolto.observe(el);
      jatszo.observe(el);
    }

    const lapValtas = () => {
      if (document.hidden) for (const el of elemek.current.values()) el.pause();
      else ujraoszt();
    };
    document.addEventListener('visibilitychange', lapValtas);

    return () => {
      tolto.disconnect();
      jatszo.disconnect();
      document.removeEventListener('visibilitychange', lapValtas);
    };
  }, [ujraoszt]);

  useEffect(() => {
    ujraoszt();
  }, [onkentes, ujraoszt]);

  /** Klipváltás egy csempén belül: forrás csere, majd indítás. */
  const valt = (csempeId: string, index: number, klip: VideoBandKlip) => {
    const el = elemek.current.get(csempeId);
    setAktiv((elozo) => ({ ...elozo, [csempeId]: index }));
    if (!el) return;
    el.dataset.mp4 = klip.mp4;
    if (klip.webm) el.dataset.webm = klip.webm;
    else delete el.dataset.webm;
    el.preload = 'auto';
    el.setAttribute('src', klipForras(el, klip));
    el.poster = klip.poszter;
    el.load();
    kezzelAllitott.current.delete(csempeId);
    setAllo((e) => ({ ...e, [csempeId]: false }));
    el.muted = true;
    void el.play().catch(() => {});
  };

  /** Kézi indítás/megállítás. A kézzel megállítottat a görgetés nem indítja. */
  const kapcsol = (csempeId: string) => {
    const el = elemek.current.get(csempeId);
    if (!el) return;
    if (el.paused) {
      kezzelAllitott.current.delete(csempeId);
      const forras = valasztottForras(el);
      if (!el.getAttribute('src') && forras) {
        el.preload = 'auto';
        el.setAttribute('src', forras);
        el.load();
      }
      el.muted = true;
      void el.play().catch(() => {});
      setAllo((e) => ({ ...e, [csempeId]: false }));
    } else {
      kezzelAllitott.current.add(csempeId);
      el.pause();
      setAllo((e) => ({ ...e, [csempeId]: true }));
    }
  };

  return (
    <section aria-labelledby="bemutato-cim" className="border-t border-line bg-ink/[0.03]">
      <h2 id="bemutato-cim" className="sr-only">
        {feliratok.title}
      </h2>
      {/* Teljes szélesség: ez a sáv szándékosan lép ki a lap max-w-6xl
          kereteéből — a mozgókép akkor hat, ha nem dobozban ül. A kis
          oldalpárnázás csak azért van, hogy a lekerekített sarkok ne
          ragadjanak a képernyő szélére. */}
      <div className="grid gap-2 px-2 py-2 sm:gap-3 sm:px-3 sm:py-3 lg:grid-cols-3">
        {csempek.map((csempe) => {
          const index = aktiv[csempe.id] ?? 0;
          const klip = csempe.videok[index] ?? csempe.videok[0];
          if (!klip) return null;
          const tobbKlip = csempe.videok.length > 1;
          const leiras = `${csempe.cim}${klip.cim ? ` — ${klip.cim}` : ''} — ${feliratok.muted}`;

          return (
            <div
              key={csempe.id}
              className="group relative aspect-video overflow-hidden rounded-xl bg-ink/90"
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={(el) => {
                  if (el) elemek.current.set(csempe.id, el);
                  else elemek.current.delete(csempe.id);
                }}
                data-csempe={csempe.id}
                data-mp4={klip.mp4}
                data-webm={klip.webm}
                poster={klip.poszter}
                preload="none"
                muted
                loop
                playsInline
                aria-label={leiras}
                className="h-full w-full object-cover"
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  const sav = jelolo.current.get(`${csempe.id}:${index}`);
                  if (sav && v.duration > 0) {
                    sav.style.transform = `scaleX(${v.currentTime / v.duration})`;
                  }
                }}
              />

              {/* A csempe címe — a videó fölött, olvasható háttérrel. */}
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent p-4">
                <p className="text-sm font-medium text-white drop-shadow-sm">{csempe.cim}</p>
              </div>

              {/* Indítás/szüneteltetés. Mindig a DOM-ban van és fókuszálható:
                  egérrel megjelenik, billentyűzettel odalépve is látszik. */}
              <button
                type="button"
                onClick={() => kapcsol(csempe.id)}
                aria-label={allo[csempe.id] || onkentes ? feliratok.play : feliratok.pause}
                className="absolute top-3 right-3 rounded-full bg-black/45 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                  {allo[csempe.id] || onkentes ? (
                    <path d="M8 5v14l11-7z" />
                  ) : (
                    <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
                  )}
                </svg>
              </button>

              {/* A klipválasztó vonalkasor. Egyetlen klipnél nincs mit
                  választani, ezért csak a másodiktól jelenik meg. */}
              {tobbKlip && (
                <div
                  role="group"
                  aria-label={feliratok.pickVideo}
                  className="absolute inset-x-0 bottom-0 flex gap-1.5 p-3"
                >
                  {csempe.videok.map((v, i) => (
                    <button
                      key={v.mp4}
                      type="button"
                      onClick={() => valt(csempe.id, i, v)}
                      aria-label={v.cim}
                      aria-current={i === index}
                      className="h-4 flex-1 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    >
                      <span className="block h-1 overflow-hidden rounded-full bg-white/35">
                        <span
                          ref={(el) => {
                            if (el) jelolo.current.set(`${csempe.id}:${i}`, el);
                            else jelolo.current.delete(`${csempe.id}:${i}`);
                          }}
                          className="block h-full origin-left bg-white"
                          style={{ transform: i === index ? 'scaleX(0)' : 'scaleX(0)' }}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
