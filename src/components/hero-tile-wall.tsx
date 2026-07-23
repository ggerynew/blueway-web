'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

type Tile = { src: string; alt: string; href: string };

/**
 * Folyamatosan forgó 3D „csempe fal" a termékfotókból. Magától lassan pörög,
 * egérrel (vagy érintéssel) bárhol meg lehet fogni és forgatni; elengedés után
 * a lendület kifut, majd visszaáll az automatikus forgásra.
 *
 * A csempe KÖZEPÉN egy kis kör alakú kattintási zóna nyitja meg a termékoldalt.
 * Ha a mutató a lenyomás óta elmozdult (tehát forgatás történt), a kattintást
 * elnyeljük — így a forgatást a kattintózóna nem zavarja meg.
 */
export function HeroTileWall({
  tiles,
  columns,
}: {
  tiles: Tile[];
  columns?: number;
}) {
  const spinRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastX = useRef(0);
  const startX = useRef(0);
  const autoSpeed = useRef(0.06);

  const COLS = columns ?? Math.ceil(tiles.length / 2);
  const step = 360 / COLS;
  const tileW = 132;
  const tileH = 104;
  const rowGap = 14;
  const radius = Math.round(((tileW + 22) / 2) / Math.tan(Math.PI / COLS));

  // Folyamatos forgás (rAF)
  useEffect(() => {
    const el = spinRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) autoSpeed.current = 0;

    let raf = 0;
    const frame = () => {
      if (!dragging.current) {
        angle.current += autoSpeed.current + velocity.current;
        velocity.current *= 0.94;
        if (Math.abs(velocity.current) < 0.001) velocity.current = 0;
      }
      el.style.transform = `translateZ(-${radius}px) rotateY(${angle.current}deg)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [radius]);

  // Húzás – ablakszintű figyelők, hogy a mutató a felületen kívül is működjön
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      const d = dx * 0.35;
      angle.current += d;
      velocity.current = d;
      if (Math.abs(e.clientX - startX.current) > 6) moved.current = true;
    }
    function onUp() {
      dragging.current = false;
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    moved.current = false;
    lastX.current = e.clientX;
    startX.current = e.clientX;
    velocity.current = 0;
  }

  // Ha forgatás történt, ne navigáljon a kattintás
  function onLinkClick(e: React.MouseEvent) {
    if (moved.current) e.preventDefault();
  }

  return (
    <div
      className="relative aspect-square w-full cursor-grab overflow-hidden rounded-[2rem] select-none active:cursor-grabbing"
      style={{ perspective: '1100px', touchAction: 'none' }}
      onPointerDown={onPointerDown}
    >
      {/* lágy háttérfény */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(120%_120%_at_70%_20%,var(--color-brand-100),transparent_60%)]"
      />

      {/* színpad – enyhén megdöntve */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-9deg)' }}
      >
        <div
          ref={spinRef}
          className="relative"
          style={{
            transformStyle: 'preserve-3d',
            width: tileW,
            height: tileH * 2 + rowGap,
          }}
        >
          {tiles.map((t, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const yOff = (row - 0.5) * (tileH + rowGap);
            return (
              <div
                key={`${t.href}-${i}`}
                className="group absolute flex items-center justify-center rounded-xl border border-line bg-white/95 p-2 shadow-[0_8px_24px_-10px_rgba(29,78,216,0.35)]"
                style={{
                  width: tileW,
                  height: tileH,
                  left: 0,
                  top: 0,
                  transform: `rotateY(${col * step}deg) translateZ(${radius}px) translateY(${yOff}px)`,
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

                {/* kis kör alakú kattintási zóna a közepén → termékoldal */}
                <Link
                  href={t.href}
                  aria-label={t.alt}
                  onClick={onLinkClick}
                  className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full ring-1 ring-transparent transition-all hover:bg-white/80 hover:ring-brand-500/60 hover:shadow-md"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="text-brand-700 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <path
                      d="M7 17L17 7M17 7H9M17 7v8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* szélek elhalványítása a mélységérzethez */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(140%_100%_at_50%_50%,transparent_55%,var(--color-surface)_92%)]"
      />
    </div>
  );
}
