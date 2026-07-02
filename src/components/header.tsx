import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const nav = [
    { href: `/${lang}/termekek`, label: dict.nav.products },
    { href: `/${lang}/szolgaltatasok`, label: dict.nav.services },
    { href: `/${lang}/nyomtatofejek`, label: dict.nav.printheads },
    { href: `/${lang}/partnereink`, label: dict.nav.partners },
    { href: `/${lang}/kapcsolat`, label: dict.nav.contact },
  ];
  const otherLang: Locale = lang === 'hu' ? 'en' : 'hu';

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={`/${lang}`} className="text-lg font-semibold tracking-tight">
          <span className="text-brand-700">blue</span>way
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-muted md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href={`/${otherLang}`}
            className="text-sm text-ink-muted uppercase transition-colors hover:text-ink"
          >
            {otherLang}
          </Link>
          <Link
            href={`/${lang}/kapcsolat`}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            {dict.nav.quote}
          </Link>
        </div>
      </div>
    </header>
  );
}
