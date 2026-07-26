import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import { MobileNav } from '@/components/mobile-nav';
import { LangSwitcher } from '@/components/lang-switcher';
import { Logo } from '@/components/logo';
import { ProductSearch, type SearchItem } from '@/components/product-search';
import { asset } from '@/lib/asset';
import { categories, manufacturers, products } from '@/lib/products';
import { guides } from '@/lib/knowledge';

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const nav = [
    { href: `/${lang}/termekek`, label: dict.nav.products },
    { href: `/${lang}/gyartok`, label: dict.nav.manufacturers },
    { href: `/${lang}/szolgaltatasok`, label: dict.nav.services },
    { href: `/${lang}/tudastar`, label: dict.nav.knowledge },
    { href: `/${lang}/kapcsolat`, label: dict.nav.contact },
  ];

  const searchItems: SearchItem[] = [
    ...products.map((p) => ({
      name: p.name,
      brand: p.brand,
      image: p.image ? asset(p.image) : '',
      href: `/${lang}/termekek/${p.category}/${p.slug}`,
    })),
    // Applikátorok is kereshetők — a szülő termék nevével a második sorban
    ...products.flatMap((p) =>
      (p.applicators ?? []).map((a) => ({
        name: a.name[lang],
        brand: `${p.name} — ${dict.ui.searchApplicator}`,
        image: a.image ? asset(a.image) : '',
        href: `/${lang}/termekek/${p.category}/${p.slug}/applikator/${a.slug}`,
      })),
    ),
    // Kategóriák és gyártók
    ...categories.map((c) => ({
      name: c.name[lang],
      brand: dict.ui.searchCategory,
      image: '',
      href: `/${lang}/termekek/${c.slug}`,
    })),
    ...manufacturers.map((m) => ({
      name: m.name,
      brand: dict.ui.searchManufacturer,
      image: m.logo ? asset(m.logo) : '',
      href: `/${lang}/gyartok/${m.slug}`,
    })),
    // Tudástár-cikkek
    ...guides.map((g) => ({
      name: g.title[lang],
      brand: dict.nav.knowledge,
      image: '',
      href: `/${lang}/tudastar/${g.slug}`,
    })),
  ];
  const search = (
    <ProductSearch
      items={searchItems}
      placeholder={dict.nav.searchPlaceholder}
      noResults={dict.nav.searchNoResults}
    />
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Logo lang={lang} mediaClassName="h-12 w-auto" />
        <nav className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
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
        <div className="hidden w-44 xl:w-56 lg:block">{search}</div>
        <div className="hidden items-center gap-3 md:flex">
          <LangSwitcher lang={lang} compact />
          <Link
            href={`/${lang}/kapcsolat`}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            {dict.nav.quote}
          </Link>
        </div>

        <MobileNav lang={lang} quoteLabel={dict.nav.quote} items={nav} />
      </div>

      {/* Kereső külön sorban, amíg a fejléc-sorban nem fér el (mobil / tablet) */}
      <div className="border-t border-line px-6 py-2.5 lg:hidden">
        <div className="mx-auto max-w-6xl">{search}</div>
      </div>
    </header>
  );
}
