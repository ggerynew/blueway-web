'use client';

import { useEffect, useRef } from 'react';

type Tile = { src: string; alt: string };

/**
 * Folyamatosan forgó 3D „csempe fal" a termékfotókból. Magától lassan pörög,
 * egérrel (vagy érintéssel) meg lehet fogni és forgatni; elengedés után a
 * lendület kifut, majd visszaáll az automatikus forgásra. A tilék egy henger
 * palástján, két sorban helyezkednek el. prefers-reduced-motion esetén nem
 * pörög magától, de húzni továbbra is lehet.
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
  const velocity = useRef(0); // extra lendület húzás után (deg/frame)
  const dragging = useRef(false);
  const lastX = useRef(0);
  const autoSpeed = useRef(0.06); // alap automatikus forgás (deg/frame)

  const COLS = columns ?? Math.ceil(tiles.length / 2);
  const step = 360 / COLS;
  const tileW = 132;
  const tileH = 104;
  const rowGap = 14;
  // sugár, hogy a szomszédos tilék épp elférjenek egy kis réssel
  const radius = Math.round(((tileW + 22) / 2) / Math.tan(Math.PI / COLS));

  useEffect(() => {
    const el = spinRef.current;
    if (!el) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) autoSpeed.current = 0;

    let raf = 0;
    const frame = () => {
      if (!dragging.current) {
        angle.current += autoSpeed.current + velocity.current;
        velocity.current *= 0.94; // lendület lecsengése
        if (Math.abs(velocity.current) < 0.001) velocity.current = 0;
      }
      el.style.transform = `translateZ(-${radius}px) rotateY(${angle.current}deg)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [radius]);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    lastX.current = e.clientX;
    velocity.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    const d = dx * 0.35;
    angle.current += d;
    velocity.current = d; // az utolsó mozdulat adja a lendületet
  }
  function endDrag(e: React.PointerEvent) {
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
  }

  return (
    <div
      aria-hidden="true"
      className="relative aspect-square w-full cursor-grab overflow-hidden rounded-[2rem] select-none active:cursor-grabbing"
      style={{ perspective: '1100px', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* lágy háttérfény */}
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(120%_120%_at_70%_20%,var(--color-brand-100),transparent_60%)]" />

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
                key={`${t.src}-${i}`}
                className="absolute flex items-center justify-center rounded-xl border border-line bg-white/95 p-2 shadow-[0_8px_24px_-10px_rgba(29,78,216,0.35)]"
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
                  alt={t.alt}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* szélek elhalványítása a mélységérzethez */}
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(140%_100%_at_50%_50%,transparent_55%,var(--color-surface)_92%)]" />
    </div>
  );
}
