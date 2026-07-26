'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';

/** A nyelv neve a saját nyelvén — hoverre (title) és felolvasóknak. */
const NAMES: Record<Locale, string> = {
  hu: 'Magyar',
  en: 'English',
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
            <path d="M7.5,8 a4.5,4.5 0 0 1 9,0 z" fill="#CD2E3A" />
            <path d="M16.5,8 a4.5,4.5 0 0 1 -9,0 z" fill="#0047A0" />
            <circle cx="9.75" cy="8" r="2.25" fill="#CD2E3A" />
            <circle cx="14.25" cy="8" r="2.25" fill="#0047A0" />
          </g>
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
 */
export function LangSwitcher({ lang }: { lang: Locale; compact?: boolean }) {
  const pathname = usePathname() || `/${lang}`;
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === lang) return;
    const parts = pathname.split('/');
    if (parts.length > 1) parts[1] = next;
    router.push(parts.join('/') || `/${next}`);
  }

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Language / Nyelv">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          title={NAMES[l]}
          aria-label={NAMES[l]}
          aria-current={l === lang ? 'true' : undefined}
          className={`h-[18px] w-[26px] overflow-hidden rounded-[3px] shadow-sm ring-offset-1 transition-all focus:ring-2 focus:ring-brand-500 focus:outline-none ${
            l === lang
              ? 'ring-2 ring-brand-600'
              : 'opacity-55 hover:opacity-100 hover:ring-1 hover:ring-line'
          }`}
        >
          <Flag code={l} />
        </button>
      ))}
    </div>
  );
}
