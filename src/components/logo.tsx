import Link from 'next/link';
import { asset } from '@/lib/asset';
import type { Locale } from '@/lib/i18n';

// Fogaskerék körvonala (10 fog), középen kivágott lyukkal (evenodd).
const GEAR_OUTER =
  'M49.75,-5.02L49.75,5.02L39.78,7.59L36.65,17.24L43.20,25.18L37.30,33.30L27.72,29.52L19.51,35.49L20.15,45.76L10.60,48.86L5.08,40.18L-5.08,40.18L-10.60,48.86L-20.15,45.76L-19.51,35.49L-27.72,29.52L-37.30,33.30L-43.20,25.18L-36.65,17.24L-39.78,7.59L-49.75,5.02L-49.75,-5.02L-39.78,-7.59L-36.65,-17.24L-43.20,-25.18L-37.30,-33.30L-27.72,-29.52L-19.51,-35.49L-20.15,-45.76L-10.60,-48.86L-5.08,-40.18L5.08,-40.18L10.60,-48.86L20.15,-45.76L19.51,-35.49L27.72,-29.52L37.30,-33.30L43.20,-25.18L36.65,-17.24L39.78,-7.59Z';
const GEAR_HOLE = 'M24,0A24,24 0 1 0 -24,0A24,24 0 1 0 24,0Z';
const GEAR_PATH = `${GEAR_OUTER} ${GEAR_HOLE}`;

// Fogaskerék-klaszter az eredeti logó elrendezését követve: felül nagy, bal-alul, jobbra.
const GEARS = [
  { cx: 30, cy: 64, r: 25, spin: 'ccw' as const }, // bal-alsó (hátul)
  { cx: 74, cy: 62, r: 23, spin: 'ccw' as const }, // jobb (hátul)
  { cx: 52, cy: 40, r: 30, spin: 'cw' as const }, // felső (elöl)
];

function Gear({
  cx,
  cy,
  r,
  spin,
}: {
  cx: number;
  cy: number;
  r: number;
  spin: 'cw' | 'ccw';
}) {
  const s = r / 50;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <g className={`bw-gear ${spin === 'cw' ? 'bw-gear-cw' : 'bw-gear-ccw'}`}>
        <path
          d={GEAR_PATH}
          fill="url(#bwGearGrad)"
          fillRule="evenodd"
          stroke="#0b4a74"
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <circle r={24} fill="none" stroke="#bfe2f6" strokeWidth={2.4} opacity={0.55} />
      </g>
    </g>
  );
}

export function Logo({
  lang,
  className,
  wordmarkClassName = 'h-7 w-auto',
  gearClassName = 'h-9 w-9',
}: {
  lang: Locale;
  className?: string;
  wordmarkClassName?: string;
  gearClassName?: string;
}) {
  return (
    <Link
      href={`/${lang}`}
      aria-label="Blueway Trade"
      className={`flex items-center gap-2.5 ${className ?? ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset('/images/brand/blueway-wordmark.png')}
        alt="Blueway Trade"
        className={wordmarkClassName}
        width={760}
        height={170}
      />
      <svg
        viewBox="0 0 100 100"
        className={gearClassName}
        aria-hidden="true"
        style={{ filter: 'drop-shadow(0 3px 6px rgba(29,78,216,0.28))' }}
      >
        <defs>
          <radialGradient id="bwGearGrad" cx="38%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#eaf6ff" />
            <stop offset="42%" stopColor="#8fccef" />
            <stop offset="72%" stopColor="#2b9bd6" />
            <stop offset="100%" stopColor="#0d5f92" />
          </radialGradient>
        </defs>
        {GEARS.map((g) => (
          <Gear key={`${g.cx}-${g.cy}`} {...g} />
        ))}
      </svg>
    </Link>
  );
}
