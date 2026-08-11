'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LangSwitcher } from '@/components/lang-switcher';
import type { Locale } from '@/lib/i18n';

export function MobileNav({
  lang,
  items,
  feliratok: t,
}: {
  lang: Locale;
  items: { href: string; label: string }[];
  /** A két gombfelirat a kiszolgálótól — a getDictionary kliensoldali
   *  hívása a teljes nyolcnyelvű szótárat húzta volna be ezért a kettőért. */
  feliratok: { openMenu: string; closeMenu: string };
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t.closeMenu : t.openMenu}
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
          /* top-full: a fejléc ALJÁTÓL nyílik, a kereső sorát is beleértve —
             fix 64 px-nél az első menüpont a kereső mögé kerülne. */
          className="absolute inset-x-0 top-full border-b border-line bg-surface shadow-lg"
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
            <div className="mt-3 border-t border-line pt-4">
              <LangSwitcher lang={lang} />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
