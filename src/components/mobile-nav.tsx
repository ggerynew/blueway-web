'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n';

export function MobileNav({
  lang,
  quoteLabel,
  items,
}: {
  lang: Locale;
  quoteLabel: string;
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const otherLang: Locale = lang === 'hu' ? 'en' : 'hu';
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? (lang === 'hu' ? 'Menü bezárása' : 'Close menu') : lang === 'hu' ? 'Menü megnyitása' : 'Open menu'}
        className="-mr-1 flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-line/60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 border-b border-line bg-surface shadow-lg"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="rounded-lg px-2 py-2.5 text-base text-ink-muted transition-colors hover:bg-white hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex items-center justify-between border-t border-line pt-4">
              <Link
                href={`/${otherLang}`}
                hrefLang={otherLang}
                onClick={close}
                aria-label={lang === 'hu' ? 'Váltás angol nyelvre' : 'Switch to Hungarian'}
                className="rounded-sm px-2 text-sm uppercase text-ink-muted transition-colors hover:text-ink"
              >
                {otherLang}
              </Link>
              <Link
                href={`/${lang}/kapcsolat`}
                onClick={close}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                {quoteLabel}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
