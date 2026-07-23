import type { Dictionary } from '@/lib/i18n';

type Diagram = Dictionary['labelQuote']['diagram'];

/**
 * Méretezett magyarázó rajz a címke ajánlatkérőhöz: címke (W/H/R) és tekercs (Ø D/Ø d),
 * a cab „Checklist" ábrái alapján. Tisztán SVG, a jelmagyarázattal együtt.
 */
export function LabelDiagram({ d }: { d: Diagram }) {
  const legend: [string, string][] = [
    ['W', d.w],
    ['H', d.h],
    ['R', d.r],
    ['Ø D', d.D],
    ['Ø d', d.d],
  ];

  return (
    <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
      <h2 className="text-sm font-medium tracking-wide text-ink uppercase">{d.title}</h2>

      <div className="mt-5 text-ink">
        <svg viewBox="0 0 760 300" className="h-auto w-full" role="img" aria-label={d.title}>
          <defs>
            <marker id="lq-arrow" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto">
              <path d="M0,0 L9,4.5 L0,9 z" fill="currentColor" />
            </marker>
          </defs>

          {/* ——— Címke ——— */}
          <g>
            {/* szállítási irány */}
            <line x1="120" y1="56" x2="300" y2="56" stroke="currentColor" strokeWidth="1.2" markerEnd="url(#lq-arrow)" />
            <text x="205" y="44" textAnchor="middle" className="fill-ink-muted" fontSize="12">
              {d.transport}
            </text>

            {/* címke */}
            <rect x="120" y="80" width="180" height="120" rx="18" fill="#fff" stroke="currentColor" strokeWidth="2" />

            {/* W méret (alul) */}
            <line x1="120" y1="200" x2="120" y2="244" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="300" y1="200" x2="300" y2="244" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="120" y1="234" x2="300" y2="234" stroke="currentColor" strokeWidth="1.2" markerStart="url(#lq-arrow)" markerEnd="url(#lq-arrow)" />
            <rect x="200" y="224" width="20" height="20" fill="#fff" />
            <text x="210" y="238" textAnchor="middle" className="fill-brand-700" fontSize="14" fontWeight="600">W</text>

            {/* H méret (bal) */}
            <line x1="120" y1="80" x2="76" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="120" y1="200" x2="76" y2="200" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="86" y1="80" x2="86" y2="200" stroke="currentColor" strokeWidth="1.2" markerStart="url(#lq-arrow)" markerEnd="url(#lq-arrow)" />
            <rect x="76" y="130" width="20" height="20" fill="#fff" />
            <text x="86" y="144" textAnchor="middle" className="fill-brand-700" fontSize="14" fontWeight="600">H</text>

            {/* R sarok lekerekítés */}
            <line x1="133" y1="90" x2="176" y2="62" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <text x="186" y="60" className="fill-brand-700" fontSize="14" fontWeight="600">R</text>

            <text x="210" y="285" textAnchor="middle" className="fill-ink-muted" fontSize="13">{d.labelCaption}</text>
          </g>

          {/* ——— Tekercs ——— */}
          <g transform="translate(410,0)">
            <circle cx="150" cy="140" r="95" fill="#fff" stroke="currentColor" strokeWidth="2" />
            <circle cx="150" cy="140" r="32" fill="var(--color-surface)" stroke="currentColor" strokeWidth="1.6" />

            {/* Ø D (felül) */}
            <line x1="55" y1="140" x2="55" y2="46" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="245" y1="140" x2="245" y2="46" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="55" y1="56" x2="245" y2="56" stroke="currentColor" strokeWidth="1.2" markerStart="url(#lq-arrow)" markerEnd="url(#lq-arrow)" />
            <rect x="128" y="46" width="44" height="20" fill="#fff" />
            <text x="150" y="60" textAnchor="middle" className="fill-brand-700" fontSize="14" fontWeight="600">Ø D</text>

            {/* Ø d (mag) */}
            <line x1="118" y1="140" x2="182" y2="140" stroke="currentColor" strokeWidth="1.2" markerStart="url(#lq-arrow)" markerEnd="url(#lq-arrow)" />
            <rect x="128" y="118" width="44" height="18" fill="var(--color-surface)" />
            <text x="150" y="132" textAnchor="middle" className="fill-brand-700" fontSize="13" fontWeight="600">Ø d</text>

            <text x="150" y="285" textAnchor="middle" className="fill-ink-muted" fontSize="13">{d.rollCaption}</text>
          </g>
        </svg>
      </div>

      {/* Jelmagyarázat */}
      <div className="mt-6 border-t border-line pt-5">
        <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">{d.note}</p>
        <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {legend.map(([sym, desc]) => (
            <div key={sym} className="flex items-baseline gap-3 text-sm">
              <dt className="w-12 shrink-0 font-semibold text-brand-700">{sym}</dt>
              <dd className="text-ink-muted">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
