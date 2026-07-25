'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';

const NAMES: Record<Locale, string> = {
  hu: 'Magyar',
  en: 'English',
  de: 'Deutsch',
  ko: '한국어',
  zh: '中文',
};

/**
 * Nyelvválasztó: az aktuális útvonal nyelvi előtagját cseréli, így ugyanaz az
 * oldal nyílik meg a választott nyelven.
 */
export function LangSwitcher({ lang, compact }: { lang: Locale; compact?: boolean }) {
  const pathname = usePathname() || `/${lang}`;
  const router = useRouter();

  function switchTo(next: string) {
    const parts = pathname.split('/');
    if (parts.length > 1) parts[1] = next;
    router.push(parts.join('/') || `/${next}`);
  }

  return (
    <select
      value={lang}
      aria-label="Language / Nyelv"
      onChange={(e) => switchTo(e.target.value)}
      className={`cursor-pointer rounded-full border border-line bg-white text-sm text-ink-muted transition-colors hover:text-ink focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none ${
        compact ? 'px-2 py-1.5' : 'px-3 py-2'
      }`}
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {compact ? l.toUpperCase() : NAMES[l]}
        </option>
      ))}
    </select>
  );
}
