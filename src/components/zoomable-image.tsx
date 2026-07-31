'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { asset } from '@/lib/asset';

/**
 * Termékfotó csempén, kattintásra teljes méretben.
 *
 * MIÉRT GOMB ÉS NEM SIMA KÉP
 *   A nagyítás művelet, nem hivatkozás: gombként a billentyűzet is eléri
 *   (Tab, majd Enter vagy szóköz), és a képernyőolvasó is elmondja, mi
 *   történik. Egy `onClick`-es `div` mindkettőt elrontaná.
 *
 * A NAGYÍTOTT NÉZET
 *   A kép a képernyő 92%-áig nő, de az arányát tartja — a termékfotók
 *   különböző alakúak, a fix méret vagy levágná, vagy torzítaná őket.
 *   Bezárás: Escape, a háttérre kattintás, a bezárógomb, vagy magára a képre
 *   kattintás. Mindegyik kézre eshet, és egyik sem meglepő.
 *
 * A LAP GÖRGETÉSÉT megállítjuk, amíg a nagyított kép nyitva van: enélkül a
 * háttér elgörögne a nagyított kép mögött, és bezáráskor a látogató máshol
 * találná magát, mint ahol elindult.
 *
 * MIÉRT A BODY VÉGÉRE KERÜL (portál)
 *   A `position: fixed` nem mindig a képernyőhöz igazodik: ha bármelyik ős
 *   transzformációt, szűrőt vagy perspektívát visel, az új koordináta-
 *   rendszert nyit, és a „fix" elem ahhoz tapad. Itt pontosan ez történt — a
 *   beúszó animáció `filter: blur(0px)`-et hagy az elemen, és emiatt a
 *   nagyított nézet a 524×498 pixeles médiakeretbe szorult az 1366×950-es
 *   képernyő helyett, sötét háttér nélkül. Mérve. A portál a body végére
 *   teszi a réteget, ahol nincs fölötte ilyen ős.
 */
export function ZoomableImage({
  src,
  alt,
  /** A csempe (a képet körülvevő doboz) osztályai. */
  className = 'flex h-full w-full items-center justify-center rounded-xl bg-surface p-5',
  /** Magának a képnek az osztályai. */
  imgClassName = 'max-h-full max-w-full object-contain',
  nagyitasFelirat,
  bezarasFelirat,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  nagyitasFelirat: string;
  bezarasFelirat: string;
}) {
  const [nyitva, setNyitva] = useState(false);
  const nyitoRef = useRef<HTMLButtonElement>(null);
  const bezaroRef = useRef<HTMLButtonElement>(null);

  const bezar = useCallback(() => {
    setNyitva(false);
    // A fókusz oda kerül vissza, ahonnan indult — különben a lap tetejére
    // ugrana, és a billentyűzettel navigáló elveszítené a helyét.
    nyitoRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!nyitva) return;
    const kez = (e: KeyboardEvent) => {
      if (e.key === 'Escape') bezar();
    };
    const eredetiTulcsordulas = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', kez);
    bezaroRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', kez);
      document.body.style.overflow = eredetiTulcsordulas;
    };
  }, [nyitva, bezar]);

  return (
    <>
      <button
        ref={nyitoRef}
        type="button"
        onClick={() => setNyitva(true)}
        aria-label={`${alt} — ${nagyitasFelirat}`}
        className={`${className} group cursor-zoom-in`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(src)}
          alt={alt}
          className={`${imgClassName} transition-transform duration-300 group-hover:scale-[1.03]`}
        />
      </button>

      {nyitva &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={bezar}
            className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          >
            <button
              ref={bezaroRef}
              type="button"
              onClick={bezar}
              aria-label={bezarasFelirat}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(src)}
              alt={alt}
              className="max-h-[92vh] max-w-[92vw] object-contain"
            />
          </div>,
          document.body,
        )}
    </>
  );
}
