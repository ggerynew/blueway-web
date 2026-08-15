'use client';

import { Link } from '@/components/link';
import { usePathname } from 'next/navigation';
import { rememberLang } from '@/lib/consent';
import { HREFLANG, locales, type Locale } from '@/lib/i18n';

/**
 * A nyelv neve a saját nyelvén — hoverre (title) és felolvasóknak.
 *
 * A két angol változat országjelölést kap: egymás mellett két angol zászló áll,
 * és a különbséget csak a név mondja meg. A brit szövegek helyesírása brit
 * (colour, labelling, catalogue), az amerikaié amerikai.
 */
const NAMES: Record<Locale, string> = {
  hu: 'Magyar',
  en: 'English (UK)',
  us: 'English (US)',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
  ko: '한국어',
  zh: '中文',
};

/** Egyszerűsített zászlók inline SVG-ként (Windowson az emoji-zászló nem jelenik meg). */
function Flag({ code }: { code: Locale }) {
  const common = { className: 'h-full w-full', 'aria-hidden': true } as const;
  switch (code) {
    case 'hu':
      return (
        <svg viewBox="0 0 24 16" {...common}>
          <rect width="24" height="16" fill="#fff" />
          <rect width="24" height="5.33" fill="#CE2939" />
          <rect y="10.67" width="24" height="5.33" fill="#477050" />
        </svg>
      );
    case 'en':
      return (
        <svg viewBox="0 0 24 16" {...common}>
          <rect width="24" height="16" fill="#012169" />
          <path d="M0,0 L24,16 M24,0 L0,16" stroke="#fff" strokeWidth="3.2" />
          <path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" strokeWidth="1.6" />
          <path d="M12,0 V16 M0,8 H24" stroke="#fff" strokeWidth="5.2" />
          <path d="M12,0 V16 M0,8 H24" stroke="#C8102E" strokeWidth="3" />
        </svg>
      );
    case 'us':
      return (
        <svg viewBox="0 0 24 16" {...common}>
          <rect width="24" height="16" fill="#fff" />
          {/* 13 sáv, a páros sorszámúak pirosak */}
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={(i * 16) / 13} width="24" height={16 / 13} fill="#B22234" />
          ))}
          <rect width="9.6" height={(7 * 16) / 13} fill="#3C3B6E" />
          {/* Ekkora zászlón az ötágú csillag egy folt lenne: a felismerhetőséget
              az eltolt soros rács adja, ahogy a kínai zászló kis csillagainál is. */}
          {Array.from({ length: 5 }, (_, sor) =>
            Array.from({ length: sor % 2 ? 4 : 5 }, (_, oszlop) => (
              <circle
                key={`${sor}-${oszlop}`}
                cx={1.2 + oszlop * 1.8 + (sor % 2 ? 0.9 : 0)}
                cy={1.15 + sor * 1.72}
                r="0.4"
                fill="#fff"
              />
            )),
          )}
        </svg>
      );
    case 'de':
      return (
        <svg viewBox="0 0 24 16" {...common}>
          <rect width="24" height="5.33" fill="#000" />
          <rect y="5.33" width="24" height="5.33" fill="#D00" />
          <rect y="10.67" width="24" height="5.33" fill="#FFCE00" />
        </svg>
      );
    case 'it':
      return (
        <svg viewBox="0 0 24 16" {...common}>
          <rect width="8" height="16" fill="#009246" />
          <rect x="8" width="8" height="16" fill="#fff" />
          <rect x="16" width="8" height="16" fill="#CE2B37" />
        </svg>
      );
    case 'es':
      return (
        <svg viewBox="0 0 24 16" {...common}>
          <rect width="24" height="16" fill="#AA151B" />
          <rect y="4" width="24" height="8" fill="#F1BF00" />
        </svg>
      );
    case 'ko':
      return (
        <svg viewBox="0 0 24 16" {...common}>
          <rect width="24" height="16" fill="#fff" stroke="#d4d4d8" strokeWidth="0.5" />
          <g transform="rotate(-33 12 8)">
            <path d="M8,8 a4,4 0 0 1 8,0 z" fill="#CD2E3A" />
            <path d="M16,8 a4,4 0 0 1 -8,0 z" fill="#0047A0" />
            <circle cx="10" cy="8" r="2" fill="#CD2E3A" />
            <circle cx="14" cy="8" r="2" fill="#0047A0" />
          </g>
          {/* A négy sarokban a trigramok — nélkülük a zászló egy halvány pötty */}
          {(
            [
              [4.6, 3.6, 33],
              [19.4, 12.4, 33],
              [19.4, 3.6, -33],
              [4.6, 12.4, -33],
            ] as const
          ).map(([cx, cy, angle]) => (
            <g key={`${cx}-${cy}`} transform={`rotate(${angle} ${cx} ${cy})`} fill="#0A0A0A">
              <rect x={cx - 2.5} y={cy - 1.7} width="5" height="0.9" />
              <rect x={cx - 2.5} y={cy - 0.45} width="5" height="0.9" />
              <rect x={cx - 2.5} y={cy + 0.8} width="5" height="0.9" />
            </g>
          ))}
        </svg>
      );
    case 'zh':
      return (
        <svg viewBox="0 0 24 16" {...common}>
          <rect width="24" height="16" fill="#EE1C25" />
          <path d="M4.5,2 l0.9,2.8 2.9,0 -2.3,1.7 0.9,2.8 -2.4,-1.7 -2.4,1.7 0.9,-2.8 -2.3,-1.7 2.9,0 z" fill="#FFFF00" />
          <circle cx="9.5" cy="2" r="0.7" fill="#FFFF00" />
          <circle cx="11" cy="4" r="0.7" fill="#FFFF00" />
          <circle cx="11" cy="6.5" r="0.7" fill="#FFFF00" />
          <circle cx="9.5" cy="8.5" r="0.7" fill="#FFFF00" />
        </svg>
      );
  }
}

/**
 * Zászlós nyelvválasztó: minden elérhető nyelv látszik; hoverre a nyelv saját
 * neve jelenik meg (title). A váltás ugyanazt az oldalt nyitja a másik nyelven.
 *
 * Hivatkozás, nem gomb. Korábban gomb volt `router.push`-sal, és emiatt három
 * dolog nem működött, amit a látogató egy nyelvválasztótól elvár: nem lehetett
 * új lapon megnyitni (középső gomb, Ctrl+kattintás), nem lehetett a másik
 * nyelvű címet kimásolni, és JavaScript nélkül egyáltalán nem csinált semmit.
 * A `<Link>` ugyanúgy kliensoldalon vált, de van valódi címe.
 */
export function LangSwitcher({
  lang,
  compact = false,
}: {
  lang: Locale;
  /** Szűkebb kiosztás oda, ahol a zászlósor más elemekkel osztozik a soron. */
  compact?: boolean;
}) {
  const pathname = usePathname() || `/${lang}`;

  // A fejlécben nyolc zászló áll a logó és a hétpontos menü mellett. Mérve: az
  // lg töréspont alján (1024 px) a teljes méretű sor 14 képponttal túlcsordul —
  // a nyolcadik zászló pont annyival több, mint amennyi hely maradt. Ezért a
  // fejlécben lg-n szűkebb, xl-től teljes méretű. A mobilmenüben saját sora
  // van, ott nincs mivel osztoznia.
  const zaszloMeret = compact
    ? 'h-[15px] w-[22px] xl:h-[18px] xl:w-[26px]'
    : 'h-[18px] w-[26px]';
  const koz = compact ? 'gap-1 xl:gap-1.5' : 'gap-1.5';

  function utvonal(next: Locale) {
    const parts = pathname.split('/');
    if (parts.length > 1) parts[1] = next;
    return parts.join('/') || `/${next}`;
  }

  return (
    <div className={`flex items-center ${koz}`} role="group" aria-label="Language / Nyelv">
      {locales.map((l) => (
        <Link
          key={l}
          href={utvonal(l)}
          hrefLang={HREFLANG[l]}
          // Előtöltés nélkül: a hét zászló hat idegen nyelvű adatcsomagot
          // töltene le minden lapon (~270 kB), pedig nyelvet a látogatók
          // töredéke vált — és ő is egyszer.
          prefetch={false}
          // A választást megjegyezzük, hogy a látogató legközelebb a
          // gyökércímen (blueway.hu) is a saját nyelvén érkezzen meg. Csak
          // akkor kerül süti a gépére, ha a kényelmi sütiket engedélyezte — az
          // ellenőrzés a hozzájárulás-kezelőben van, nem itt.
          onClick={() => rememberLang(l)}
          title={NAMES[l]}
          aria-label={NAMES[l]}
          aria-current={l === lang ? 'true' : undefined}
          className={`block ${zaszloMeret} overflow-hidden rounded-[3px] shadow-sm ring-offset-1 transition-all focus:ring-2 focus:ring-brand-500 focus:outline-none ${
            l === lang
              ? 'ring-2 ring-brand-600'
              : 'opacity-55 hover:opacity-100 hover:ring-1 hover:ring-line'
          }`}
        >
          <Flag code={l} />
        </Link>
      ))}
    </div>
  );
}
