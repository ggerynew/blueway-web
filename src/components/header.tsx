import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import { MobileNav } from '@/components/mobile-nav';
import { LangSwitcher } from '@/components/lang-switcher';
import { Logo } from '@/components/logo';
import { ProductSearch, type SearchItem } from '@/components/product-search';
import { asset } from '@/lib/asset';
import { categories, manufacturers, products , productName } from '@/lib/products';
import { guides } from '@/lib/knowledge';

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const nav = [
    { href: `/${lang}/termekek`, label: dict.nav.products },
    // Az iparágak a termékek MELLETT állnak, nem alattuk: ugyanahhoz a
    // kínálathoz két belépés, és a vevő jellemzően a feladatában gondolkodik.
    { href: `/${lang}/iparagak`, label: dict.nav.industries },
    { href: `/${lang}/gyartok`, label: dict.nav.manufacturers },
    { href: `/${lang}/szolgaltatasok`, label: dict.nav.services },
    { href: `/${lang}/tudastar`, label: dict.nav.knowledge },
    { href: `/${lang}/rolunk`, label: dict.nav.about },
    { href: `/${lang}/kapcsolat`, label: dict.nav.contact },
  ];

  const searchItems: SearchItem[] = [
    ...products.map((p) => ({
      name: productName(p, lang),
      brand: p.brand,
      image: p.image ? asset(p.image) : '',
      href: `/${lang}/termekek/${p.category}/${p.slug}`,
    })),
    // Applikátorok is kereshetők — a szülő termék nevével a második sorban
    ...products.flatMap((p) =>
      (p.applicators ?? []).map((a) => ({
        name: a.name[lang],
        brand: `${productName(p, lang)} — ${dict.ui.searchApplicator}`,
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
        <Logo lang={lang} className="shrink-0" mediaClassName="h-12 w-auto" />
        {/* A teljes menüsor csak lg-től fér el a nyolc zászló és a kereső mellett;
            alatta a hamburgermenü viszi ugyanezeket a pontokat. */}
        <nav className="hidden items-center gap-4 text-sm whitespace-nowrap text-ink-muted lg:flex xl:gap-5">
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
        <div className="hidden shrink-0 items-center lg:flex">
          <LangSwitcher lang={lang} compact />
        </div>

        <MobileNav lang={lang} items={nav} />
      </div>

      {/* A kereső saját sorban: a fejléc-sorban a nyolc zászló, a menü és az
          ajánlatkérő gomb mellett egyetlen nyelven sem maradna neki hely. */}
      <div className="border-t border-line px-6 py-2.5">
        <div className="mx-auto max-w-6xl">{search}</div>
      </div>
    </header>
  );
}
