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
 *     látóteret — de csak annyi csempéé, amennyi játszani is fog. Telefonon
 *     ez egy: ott korábban mind a három klip letöltődött, pedig egyszerre
 *     csak egy megy, és a különbség mobilneten több megabájt.
 *   - Lejátszani csak a láthatóak játszanak, és egyszerre legfeljebb annyi,
 *     amennyi indokolt: keskeny kijelzőn egy, szélesen három. A választás a
 *     láthatóság aránya szerint történik, tehát mindig az megy, amit néznek.
 *   - Háttérfülön (`visibilitychange`) mind megáll.
 *   - A haladásjelző NEM requestAnimationFrame-ből frissül, hanem a videó
 *     `timeupdate` eseményéből (~4/mp), és `transform: scaleX()`-re ír, ami a
 *     kompozitoron fut. A fő szálon így nulla a költsége.
 *
 * Aki csökkentett mozgást kér, vagy adattakarékos módban böngészik, annál
 * semmi nem indul magától: poszter marad, és van egy valódi indítógomb. Nála
 * a letöltés is elmarad — adattakarékos módban megabájtokat tölteni olyan
 * videóhoz, ami sosem indul el, pont az ellenkezője a kérésnek.
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
  /** Amelyik csempe már a látótér közelébe ért — betöltésre jelölt. */
  const kozel = useRef(new Set<string>());
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

    // Betöltésre az kerül, ami játszani IS fog: a látótér közelébe ért
    // csempék közül a legláthatóbb `keret` darab. Enélkül telefonon mind a
    // három klip letöltődött, pedig egyszerre csak egy játszik — mérve több
    // megabájt fölösleges forgalom mobilneten.
    if (!onkentes) {
      const jeloltek = [...kozel.current]
        .sort((a, b) => (lathatosag.current.get(b) ?? 0) - (lathatosag.current.get(a) ?? 0))
        .slice(0, keret);
      for (const id of jeloltek) {
        const el = elemek.current.get(id);
        if (!el || el.getAttribute('src')) continue;
        const forras = valasztottForras(el);
        if (!forras) continue;
        // Előbb CSAK a fejadatot kérjük (`metadata`): az a fájl elején ülő
        // pár száz kilobájt, amitől a hossz és az első képkocka megvan. A
        // teljes puffereléshez a lejátszás előtt kapcsolunk.
        el.preload = 'metadata';
        el.setAttribute('src', forras);
        el.load();
      }
    }

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

    // Ez a megfigyelő MAGA nem tölt: csak számon tartja, melyik csempe ért a
    // látótér közelébe. A döntést az `ujraoszt` hozza meg, mert csak az tudja,
    // hány klip futhat egyszerre — és csak annyit szabad letölteni.
    const tolto = new IntersectionObserver(
      (bejegyzesek) => {
        let valtozott = false;
        for (const b of bejegyzesek) {
          const id = (b.target as HTMLElement).dataset.csempe;
          if (!id) continue;
          if (b.isIntersecting) {
            if (!kozel.current.has(id)) {
              kozel.current.add(id);
              valtozott = true;
            }
          } else if (kozel.current.delete(id)) {
            valtozott = true;
          }
        }
        if (valtozott) ujraoszt();
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
      {/* A rács PONTOSAN a lap többi szakaszának keretét kapja: max-w-6xl,
          px-6, gap-10 — ugyanaz, amin az alatta lévő három pillér ül. Így a
          három csempe oszloponként a három bekezdés fölé esik, és a köztük
          lévő hézag széles kijelzőn sem tágul: a keret fix, csak a mellette
          maradó margó nő.

          Korábban teljes szélességben feküdt, azzal az érveléssel, hogy a
          mozgókép akkor hat, ha nem dobozban ül. Nagy kijelzőn ez nem jött
          be: a csempék elhúztak az alattuk lévő hasábok fölül, és a sáv
          inkább fejlécnek látszott, mint a laphoz tartozó szakasznak.

          A hasábok száma a csempék számához igazodik. Ez nem szépészeti
          kérdés: a klipek egyesével érkeznek a gyártótól, és egy háromhasábos
          rácsban az egyetlen meglévő csempe a bal harmadban állna, kétharmad
          üres helyet hagyva maga mellett.

          A hasábokra váltás `lg`-nél történik, nem `md`-nél, pedig a pillérek
          alább már ott hármasával állnak. Nem elnézés: egyszerre legfeljebb
          három klip futhat, és `lg` alatt csak egy — három hasáb ott két
          megfagyott poszterrel járna. */}
      <div
        className={`mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:gap-10 ${
          csempek.length >= 3 ? 'lg:grid-cols-3' : csempek.length === 2 ? 'lg:grid-cols-2' : ''
        }`}
      >
        {csempek.map((csempe) => {
          const index = aktiv[csempe.id] ?? 0;
          const klip = csempe.videok[index] ?? csempe.videok[0];
          if (!klip) return null;
          const tobbKlip = csempe.videok.length > 1;
          const leiras = `${csempe.cim}${klip.cim ? ` — ${klip.cim}` : ''} — ${feliratok.muted}`;

          return (
            <div
              key={csempe.id}
              // A `max-h` kevés csempénél számít: hármasával a doboz úgyis
              // csak ~190 képpont magas, de egyetlen csempe a teljes kereten
              // 16:9-cel több mint 600 képpontot kérne — az már nem sáv,
              // hanem fejléc. A felső korlát mellett a kép `object-cover`-rel
              // vágódik, ami egy gépfelvételnél nem veszteség.
              className="group relative aspect-video max-h-[420px] overflow-hidden rounded-xl bg-ink/90"
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
              {/* A csempe keskenyebb lett, ezért a felirat is szerényebb
                  párnázást kap — különben a cím a kép jó részét eltakarná. */}
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent p-3">
                <p className="text-xs font-medium text-white drop-shadow-sm sm:text-sm">
                  {csempe.cim}
                </p>
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
