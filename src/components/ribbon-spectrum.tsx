import type { Locale } from '@/lib/i18n';

const T = {
  hu: {
    aria: 'Festékszalag-választó sáv: wax a resin irányába',
    appsLabel: 'Felhasználási területek',
    matsLabel: 'Címke alapanyag',
    apps: [
      ['Doboz- és szállítmánycímkék,', 'logisztika, polccímkék'],
      ['Termékcímkék, élelmiszer,', 'kozmetika, egészségügy'],
      ['Autóipar, elektronika,', 'vegyipar (GHS), labor'],
    ],
    mats: [
      ['Natúr (vellum) és', 'matt papír'],
      ['Műnyomó papír,', 'PP / PE fólia'],
      ['PET, poliimid,', 'vinil, PVC'],
    ],
    zones: ['WAX', 'WAX-RESIN', 'RESIN'],
    axis: 'Ár és tartósság',
    low: 'alacsonyabb',
    high: 'magasabb',
  },
  en: {
    aria: 'Ribbon selector band: from wax towards resin',
    appsLabel: 'Applications',
    matsLabel: 'Label substrate',
    apps: [
      ['Box and shipping labels,', 'logistics, shelf labels'],
      ['Product labels, food,', 'cosmetics, healthcare'],
      ['Automotive, electronics,', 'chemicals (GHS), labs'],
    ],
    mats: [
      ['Uncoated (vellum) and', 'matte paper'],
      ['Coated paper,', 'PP / PE film'],
      ['PET, polyimide,', 'vinyl, PVC'],
    ],
    zones: ['WAX', 'WAX-RESIN', 'RESIN'],
    axis: 'Price and durability',
    low: 'lower',
    high: 'higher',
  },
} as const;

const CENTERS = [190, 450, 710];

/**
 * Festékszalag-választó sáv: balról a gazdaságos wax (papír, egyszerű
 * dobozcímkézés), jobbra a drágább resin (speciális anyagok, autóipar,
 * elektronika). Fent a felhasználási területek, lent az alapanyagok,
 * alul az ár/tartósság tengely.
 */
export function RibbonSpectrum({ lang }: { lang: Locale }) {
  const t = T[lang];
  return (
    <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
      <svg viewBox="0 0 900 348" className="h-auto w-full text-ink" role="img" aria-label={t.aria}>
        <defs>
          <linearGradient id="rs-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#dbeafe" />
            <stop offset="0.5" stopColor="#60a5fa" />
            <stop offset="1" stopColor="#1e40af" />
          </linearGradient>
          <marker id="rs-arrow" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="currentColor" />
          </marker>
        </defs>

        {/* Felhasználási területek (fent) */}
        <text x="60" y="34" fontSize="12" className="fill-ink-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {t.appsLabel}
        </text>
        {t.apps.map(([l1, l2], i) => (
          <g key={l1}>
            <text x={CENTERS[i]} y="66" textAnchor="middle" fontSize="13" className="fill-ink">{l1}</text>
            <text x={CENTERS[i]} y="84" textAnchor="middle" fontSize="13" className="fill-ink">{l2}</text>
            <line x1={CENTERS[i]} y1="96" x2={CENTERS[i]} y2="132" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </g>
        ))}

        {/* A sáv */}
        <rect x="60" y="138" width="780" height="54" rx="12" fill="url(#rs-grad)" stroke="currentColor" strokeWidth="1.4" />
        <line x1="320" y1="142" x2="320" y2="188" stroke="#fff" strokeWidth="1.4" strokeDasharray="5 5" opacity="0.85" />
        <line x1="580" y1="142" x2="580" y2="188" stroke="#fff" strokeWidth="1.4" strokeDasharray="5 5" opacity="0.85" />
        <text x={CENTERS[0]} y="171" textAnchor="middle" fontSize="17" fontWeight="700" fill="#1e3a8a">{t.zones[0]}</text>
        <text x={CENTERS[1]} y="171" textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff">{t.zones[1]}</text>
        <text x={CENTERS[2]} y="171" textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff">{t.zones[2]}</text>

        {/* Alapanyagok (lent) */}
        {t.mats.map(([l1, l2], i) => (
          <g key={l1}>
            <line x1={CENTERS[i]} y1="198" x2={CENTERS[i]} y2="228" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <text x={CENTERS[i]} y="248" textAnchor="middle" fontSize="13" className="fill-ink">{l1}</text>
            <text x={CENTERS[i]} y="266" textAnchor="middle" fontSize="13" className="fill-ink">{l2}</text>
          </g>
        ))}
        <text x="60" y="296" fontSize="12" className="fill-ink-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {t.matsLabel}
        </text>

        {/* Ár / tartósság tengely */}
        <line x1="60" y1="322" x2="828" y2="322" stroke="currentColor" strokeWidth="1.4" markerEnd="url(#rs-arrow)" />
        <text x="450" y="314" textAnchor="middle" fontSize="13" fontWeight="600" className="fill-brand-700">{t.axis}</text>
        <text x="60" y="342" fontSize="12" className="fill-ink-muted">{t.low}</text>
        <text x="840" y="342" textAnchor="end" fontSize="12" className="fill-ink-muted">{t.high}</text>
      </svg>
    </div>
  );
}
