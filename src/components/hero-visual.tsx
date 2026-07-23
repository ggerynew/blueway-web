/**
 * Dekoratív hero-vizuál: egy „kinyomtatott címke" motívum, a termékjelölés
 * témájára. Tisztán CSS/SVG, tartalmi jelentés nélkül (aria-hidden).
 */
export function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-square w-full select-none"
    >
      {/* lágy háttérfény */}
      <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(120%_120%_at_70%_20%,var(--color-brand-100),transparent_60%)]" />

      {/* hátsó kártya (mélység) */}
      <div className="absolute left-8 top-16 h-56 w-64 rotate-[-6deg] rounded-2xl border border-line bg-white/70 shadow-sm" />

      {/* fő címkekártya */}
      <div className="absolute right-8 top-10 w-72 rotate-[3deg] rounded-2xl border border-line bg-white p-5 shadow-md">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
          <span className="h-2 w-24 rounded-full bg-line" />
          <span className="ml-auto h-2 w-8 rounded-full bg-line" />
        </div>

        {/* vonalkód */}
        <svg viewBox="0 0 200 64" className="mt-5 h-16 w-full" role="presentation">
          {[4, 10, 13, 20, 25, 28, 36, 41, 48, 53, 58, 66, 72, 78, 84, 90, 97, 104, 110, 118, 124, 131, 138, 145, 152, 160, 166, 173, 180, 188, 194].map(
            (x, i) => (
              <rect
                key={i}
                x={x}
                y={0}
                width={i % 3 === 0 ? 3.2 : 1.6}
                height={52}
                fill="var(--color-ink)"
              />
            ),
          )}
        </svg>
        <p className="mt-3 text-center font-mono text-xs tracking-widest text-ink-muted">
          CAB · SQUIX · 4
        </p>
      </div>

      {/* zöld „nyomtatva" jelölés */}
      <div className="absolute bottom-12 right-16 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-xs font-medium text-emerald-700">Ready</span>
      </div>
    </div>
  );
}
