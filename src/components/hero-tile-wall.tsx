'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

type Tile = { src: string; alt: string; href: string };

/**
 * Folyamatosan forgó 3D „csempe fal" a termékfotókból. Magától lassan pörög,
 * egérrel (vagy érintéssel) bárhol meg lehet fogni és forgatni; elengedés után
 * a lendület kifut, majd visszaáll az automatikus forgásra.
 *
 * Az EGÉSZ csempére kattintva megnyílik a termékoldal (nagy, biztos célpont).
 * Amíg a kurzor a falon van, a forgás megáll — így a kattintás célpontja stabil
 * marad; a kurzort elhúzva a forgás újraindul. Ha a mutató a lenyomás óta
 * elmozdult (forgatás), a kattintást elnyeljük, hogy a forgatást ne zavarja.
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
  const hovering = useRef(false);
  const moved = useRef(false);
  const lastX = useRef(0);
  const startX = useRef(0);
  const autoSpeed = useRef(0.05);

  const COLS = columns ?? Math.ceil(tiles.length / 2);
  const step = 360 / COLS;
  const tileW = 168;
  const tileH = 128;
  const rowGap = 16;
  const radius = Math.round(((tileW + 24) / 2) / Math.tan(Math.PI / COLS));

  // Folyamatos forgás (rAF). Hover vagy húzás közben megáll.
  useEffect(() => {
    const el = spinRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) autoSpeed.current = 0;

    let raf = 0;
    const frame = () => {
      const paused = dragging.current || hovering.current;
      if (!paused) {
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
      style={{ perspective: '1200px', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => {
        hovering.current = false;
        dragging.current = false;
      }}
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
              <Link
                key={`${t.href}-${i}`}
                href={t.href}
                aria-label={t.alt}
                onClick={onLinkClick}
                className="group absolute flex cursor-pointer items-center justify-center rounded-2xl border border-line bg-white/95 p-2 shadow-[0_10px_28px_-10px_rgba(29,78,216,0.4)] ring-1 ring-transparent transition-[box-shadow,border-color] hover:border-brand-300 hover:ring-brand-500/50"
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
              </Link>
            );
          })}
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
