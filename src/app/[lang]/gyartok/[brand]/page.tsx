import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { ProductCard } from '@/components/product-card';
import { asset } from '@/lib/asset';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { categories, manufacturers, getManufacturer, getProductsByBrand , productName } from '@/lib/products';
import { absUrl, pageMetadata } from '@/lib/site';

export function generateStaticParams() {
  return locales.flatMap((lang) => manufacturers.map((m) => ({ lang, brand: m.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; brand: string }>;
}): Promise<Metadata> {
  const { lang, brand } = await params;
  if (!isLocale(lang)) return {};
  const m = getManufacturer(brand);
  if (!m) return {};
  // A márkanév minden nyelven ugyanaz — a „Gyártó / Hersteller / 제조사” utótag
  // teszi egyértelművé, mit talál az olvasó, és különbözteti meg a változatokat.
  return pageMetadata({
    lang,
    path: `gyartok/${m.slug}`,
    title: `${m.name} — ${getDictionary(lang).ui.searchManufacturer}`,
    description: m.description[lang],
    // A gyártótól forgalmazott géptípusok — tényszerű, gyártónként más, és
    // épp ezekre a típusnevekre keresnek rá.
    extra: [
      // A kapcsolókulcs az m.brand, NEM az m.name — a kettő három gyártónál
      // eltér („cab"/„CAB", „Purex International"/„Purex"), és a rossz kulccsal
      // a lista üres marad. Az oldal törzse is m.brand-del keres (lent).
      getProductsByBrand(m.brand)
        .map((p) => productName(p, lang))
        .join(', '),
    ],
  });
}

export default async function ManufacturerPage({
  params,
}: Readonly<{ params: Promise<{ lang: string; brand: string }> }>) {
  const { lang, brand } = await params;
  if (!isLocale(lang)) notFound();
  const manufacturer = getManufacturer(brand);
  if (!manufacturer) notFound();
  const dict = getDictionary(lang);
  const items = getProductsByBrand(manufacturer.brand);

  // Kategória szerinti csoportosítás (a categories sorrendje szerint)
  const categoryGroups = categories
    .map((c) => ({ category: c, list: items.filter((p) => p.category === c.slug) }))
    .filter((g) => g.list.length > 0);

  // Morzsamenü + terméklista strukturált adatként
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.manufacturers.title, item: absUrl(`${lang}/gyartok`) },
          { '@type': 'ListItem', position: 2, name: manufacturer.name, item: absUrl(`${lang}/gyartok/${manufacturer.slug}`) },
        ],
      },
      {
        '@type': 'ItemList',
        name: manufacturer.name,
        itemListElement: items.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: productName(p, lang),
          url: absUrl(`${lang}/termekek/${p.category}/${p.slug}`),
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <Link
          href={`/${lang}/gyartok`}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← {dict.manufacturers.backToManufacturers}
        </Link>
        {manufacturer.logo ? (
          <h1 className="mt-5">
            <span className="inline-flex items-center rounded-2xl bg-white px-6 py-4 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.28)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(manufacturer.logo)}
                alt={manufacturer.name}
                className="h-12 w-auto md:h-14"
              />
            </span>
          </h1>
        ) : (
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            {manufacturer.name}
          </h1>
        )}
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          {manufacturer.description[lang]}
        </p>
      </Reveal>

      {/* Alkalmazási területek — iparáganként, mert a gép kiválasztását nem a
          műszaki adatok döntik el, hanem az, milyen szennyezőt termel a
          folyamat. A termékek listája ez alatt jön. */}
      {manufacturer.industries && manufacturer.industries.length > 0 && (
        <Reveal delay={0.08}>
          <section className="mt-14 border-t border-line pt-10">
            <h2 className="text-xl font-semibold tracking-tight">
              {dict.manufacturers.industriesTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-ink-muted">{dict.manufacturers.industriesLead}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {manufacturer.industries.map((ind) => (
                <div
                  key={ind.name[lang]}
                  className="h-full rounded-2xl border border-line bg-white p-6"
                >
                  <h3 className="font-semibold tracking-tight">{ind.name[lang]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{ind.text[lang]}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      <div className="mt-12 space-y-14">
        {categoryGroups.map((group) => (
          <section key={group.category.slug}>
            <Reveal>
              {/* A kategória neve a szakasz címe — a kártyák h3-ak maradnak. */}
              <h2 className="text-xl font-semibold tracking-tight">
                <Link
                  href={`/${lang}/termekek/${group.category.slug}`}
                  className="transition-colors hover:text-brand-700"
                >
                  {group.category.name[lang]}
                </Link>
              </h2>
            </Reveal>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.list.map((product, i) => (
                <ProductCard key={product.slug} product={product} lang={lang} delay={(i % 3) * 0.05} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
