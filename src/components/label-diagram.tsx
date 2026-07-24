import type { Dictionary } from '@/lib/i18n';

type Diagram = Dictionary['labelQuote']['diagram'];

/**
 * Mérnöki stílusú magyarázó rajz a címke ajánlatkérőhöz: két címke a hordozó
 * (liner) szalagon, méretezve — W szélesség, H hossz (futásirányban, fentről
 * lefelé), G címkeköz, R sarok lekerekítés —, valamint a tekercs (Ø D / Ø d).
 * Tisztán SVG, a jelmagyarázattal együtt.
 */
export function LabelDiagram({ d }: { d: Diagram }) {
  const legend: [string, string][] = [
    ['W', d.w],
    ['H', d.h],
    ['G', d.g],
    ['R', d.r],
    ['Ø D', d.D],
    ['Ø d', d.d],
  ];

  return (
    <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
      <h2 className="text-sm font-medium tracking-wide text-ink uppercase">{d.title}</h2>

      <div className="mt-5 text-ink">
        <svg viewBox="0 0 760 470" className="h-auto w-full" role="img" aria-label={d.title}>
          <defs>
            <marker id="lq-arrow" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto">
              <path d="M0,0 L9,4.5 L0,9 z" fill="currentColor" />
            </marker>
          </defs>

          {/* ——— Címkék a hordozón ——— */}
          <g>
            {/* hordozó szalag — hullámos (megszakított) felső és alsó éllel */}
            <path
              d="M 170 46
                 C 182 36, 195 36, 207.5 46
                 C 220 56, 232.5 56, 245 46
                 C 257.5 36, 270 36, 282.5 46
                 C 295 56, 307.5 56, 320 46
                 L 320 398
                 C 307.5 408, 295 408, 282.5 398
                 C 270 388, 257.5 388, 245 398
                 C 232.5 408, 220 408, 207.5 398
                 C 195 388, 182 388, 170 398
                 Z"
              fill="var(--color-surface)"
              stroke="currentColor"
              strokeWidth="1.6"
            />

            {/* hordozó felirat */}
            <line x1="245" y1="64" x2="298" y2="42" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <text x="304" y="46" className="fill-ink-muted" fontSize="12">{d.liner}</text>

            {/* két címke egymás alatt */}
            <rect x="182" y="78" width="126" height="120" rx="14" fill="#fff" stroke="currentColor" strokeWidth="2" />
            <rect x="182" y="224" width="126" height="120" rx="14" fill="#fff" stroke="currentColor" strokeWidth="2" />

            {/* futásirány (fentről lefelé) */}
            <line x1="140" y1="110" x2="140" y2="330" stroke="currentColor" strokeWidth="1.2" markerEnd="url(#lq-arrow)" />
            <text
              x="126"
              y="220"
              textAnchor="middle"
              transform="rotate(-90 126 220)"
              className="fill-ink-muted"
              fontSize="12"
            >
              {d.transport}
            </text>

            {/* R sarok lekerekítés */}
            <line x1="190" y1="86" x2="162" y2="56" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <text x="156" y="52" textAnchor="end" className="fill-brand-700" fontSize="14" fontWeight="600">R</text>

            {/* H méret — címkehossz futásirányban (jobbra) */}
            <line x1="312" y1="78" x2="364" y2="78" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="312" y1="198" x2="364" y2="198" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="356" y1="78" x2="356" y2="198" stroke="currentColor" strokeWidth="1.2" markerStart="url(#lq-arrow)" markerEnd="url(#lq-arrow)" />
            <rect x="346" y="128" width="20" height="20" fill="#fff" />
            <text x="356" y="142" textAnchor="middle" className="fill-brand-700" fontSize="14" fontWeight="600">H</text>

            {/* G méret — címkeköz (kívülre mutató nyilakkal) */}
            <line x1="312" y1="224" x2="364" y2="224" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="356" y1="198" x2="356" y2="224" stroke="currentColor" strokeWidth="1.2" />
            <line x1="356" y1="172" x2="356" y2="197" stroke="currentColor" strokeWidth="1.2" markerEnd="url(#lq-arrow)" />
            <line x1="356" y1="250" x2="356" y2="225" stroke="currentColor" strokeWidth="1.2" markerEnd="url(#lq-arrow)" />
            <text x="370" y="216" className="fill-brand-700" fontSize="14" fontWeight="600">G</text>

            {/* W méret — címkeszélesség (alul) */}
            <line x1="182" y1="348" x2="182" y2="428" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="308" y1="348" x2="308" y2="428" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="182" y1="420" x2="308" y2="420" stroke="currentColor" strokeWidth="1.2" markerStart="url(#lq-arrow)" markerEnd="url(#lq-arrow)" />
            <rect x="235" y="410" width="20" height="20" fill="#fff" />
            <text x="245" y="424" textAnchor="middle" className="fill-brand-700" fontSize="14" fontWeight="600">W</text>

            <text x="245" y="458" textAnchor="middle" className="fill-ink-muted" fontSize="13">{d.labelCaption}</text>
          </g>

          {/* ——— Tekercs ——— */}
          <g>
            {/* középvonalak */}
            <line x1="455" y1="225" x2="695" y2="225" stroke="currentColor" strokeWidth="1" strokeDasharray="12 4 3 4" opacity="0.35" />
            <line x1="575" y1="105" x2="575" y2="345" stroke="currentColor" strokeWidth="1" strokeDasharray="12 4 3 4" opacity="0.35" />

            <circle cx="575" cy="225" r="105" fill="#fff" stroke="currentColor" strokeWidth="2" />
            <circle cx="575" cy="225" r="36" fill="var(--color-surface)" stroke="currentColor" strokeWidth="1.6" />

            {/* Ø D (felül) */}
            <line x1="470" y1="225" x2="470" y2="66" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="680" y1="225" x2="680" y2="66" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="470" y1="76" x2="680" y2="76" stroke="currentColor" strokeWidth="1.2" markerStart="url(#lq-arrow)" markerEnd="url(#lq-arrow)" />
            <rect x="553" y="66" width="44" height="20" fill="#fff" />
            <text x="575" y="80" textAnchor="middle" className="fill-brand-700" fontSize="14" fontWeight="600">Ø D</text>

            {/* Ø d (mag) — mutatóvonallal */}
            <line x1="640" y1="162" x2="602" y2="200" stroke="currentColor" strokeWidth="1.2" markerEnd="url(#lq-arrow)" />
            <text x="646" y="166" className="fill-brand-700" fontSize="14" fontWeight="600">Ø d</text>

            <text x="575" y="458" textAnchor="middle" className="fill-ink-muted" fontSize="13">{d.rollCaption}</text>
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
