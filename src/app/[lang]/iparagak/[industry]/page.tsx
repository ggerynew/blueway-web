import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LinkedText } from '@/components/linked-text';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { getIndustry, industries } from '@/lib/iparagak';
import { getGuide } from '@/lib/knowledge';
import { categories, products } from '@/lib/products';
import { absUrl, pageMetadata } from '@/lib/site';

export function generateStaticParams() {
  return locales.flatMap((lang) => industries.map((i) => ({ lang, industry: i.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; industry: string }>;
}): Promise<Metadata> {
  const { lang, industry: slug } = await params;
  if (!isLocale(lang)) return {};
  const ind = getIndustry(slug);
  if (!ind) return {};
  return pageMetadata({
    lang,
    path: `iparagak/${ind.slug}`,
    title: ind.name[lang],
    description: ind.short[lang],
    // A szakaszcímek pont a feladatokat nevezik meg — ezekre keresnek rá.
    extra: ind.sections.map((s) => s.title[lang]),
  });
}

export default async function IndustryPage({
  params,
}: Readonly<{ params: Promise<{ lang: string; industry: string }> }>) {
  const { lang, industry: slug } = await params;
  if (!isLocale(lang)) notFound();
  const ind = getIndustry(slug);
  if (!ind) notFound();
  const dict = getDictionary(lang);

  // Az ajánlott gépek a saját kategóriájuk szerint csoportosítva — így látszik,
  // hogy egy iparági feladat több géptípust is érint, nem csak nyomtatót.
  const csoportok = categories
    .map((c) => ({
      category: c,
      items: ind.products
        .map((ip) => products.find((p) => p.slug === ip.slug))
        .filter((p): p is NonNullable<typeof p> => !!p && p.category === c.slug),
    }))
    .filter((g) => g.items.length > 0);

  const indok = (productSlug: string) =>
    ind.products.find((p) => p.slug === productSlug)?.reason[lang];

  const utmutatok = (ind.guides ?? [])
    .map((g) => getGuide(g))
    .filter((g): g is NonNullable<typeof g> => !!g);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: ind.name[lang],
        description: ind.short[lang],
        inLanguage: lang,
        url: absUrl(`${lang}/iparagak/${ind.slug}`),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.industries.title, item: absUrl(`${lang}/iparagak`) },
          { '@type': 'ListItem', position: 2, name: ind.name[lang], item: absUrl(`${lang}/iparagak/${ind.slug}`) },
        ],
      },
      {
        '@type': 'ItemList',
        name: ind.name[lang],
        itemListElement: csoportok
          .flatMap((g) => g.items)
          .map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
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
          href={`/${lang}/iparagak`}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← {dict.industries.title}
        </Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
          {ind.name[lang]}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-5 max-w-3xl text-lg text-ink-muted">
          <LinkedText text={ind.lead[lang]} lang={lang} />
        </p>
      </Reveal>

      {/* ——— Tipikus feladatok ——— */}
      <div className="mt-14 space-y-10">
        {ind.sections.map((sec, i) => (
          <Reveal key={sec.title[lang]} delay={Math.min(i, 3) * 0.05}>
            <section>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                {sec.title[lang]}
              </h2>
              <p className="mt-3 max-w-3xl text-ink-muted">
                <LinkedText text={sec.text[lang]} lang={lang} />
              </p>
            </section>
          </Reveal>
        ))}
      </div>

      {/* ——— Vonatkozó előírások ——— */}
      {ind.regulations && ind.regulations.length > 0 && (
        <Reveal>
          <section className="mt-14 rounded-2xl border border-line bg-surface-soft p-7">
            <h2 className="text-xl font-semibold tracking-tight">
              {dict.industries.regulationsTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              {dict.industries.regulationsLead}
            </p>
            <dl className="mt-5 space-y-4">
              {ind.regulations.map((r) => (
                <div key={r.name}>
                  <dt className="font-medium">{r.name}</dt>
                  <dd className="mt-1 text-ink-muted">{r.explanation[lang]}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>
      )}

      {/* ——— Ajánlott gépek, kategóriánként ——— */}
      <div className="mt-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {dict.industries.productsTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-ink-muted">{dict.industries.productsLead}</p>
        </Reveal>
        <div className="mt-8 space-y-12">
          {csoportok.map((g) => (
            <section key={g.category.slug}>
              <Reveal>
                <h3 className="text-lg font-semibold tracking-tight">
                  <Link
                    href={`/${lang}/termekek/${g.category.slug}`}
                    className="transition-colors hover:text-brand-700"
                  >
                    {g.category.name[lang]}
                  </Link>
                </h3>
              </Reveal>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((p, i) => (
                  // A kártya kitölti a sor magasságát, így az alatta álló
                  // indoklás minden oszlopban egy vonalban kezdődik.
                  <div key={p.slug} className="flex flex-col">
                    <ProductCard
                      product={p}
                      lang={lang}
                      delay={(i % 3) * 0.05}
                      headingLevel="h3"
                      className="flex flex-1 flex-col"
                    />
                    {/* A gép saját leírását a terméklap mondja el; itt csak az
                        érdekes: miért pont ez a gép ehhez az iparághoz. */}
                    <p className="mt-2 px-1 text-sm text-ink-muted">{indok(p.slug)}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ——— Kapcsolódó útmutatók ——— */}
      {utmutatok.length > 0 && (
        <Reveal>
          <section className="mt-16">
            <h2 className="text-xl font-semibold tracking-tight">
              {dict.industries.guidesTitle}
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {utmutatok.map((g) => (
                <Link
                  key={g.slug}
                  href={`/${lang}/tudastar/${g.slug}`}
                  className="group rounded-xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300"
                >
                  <span className="font-medium group-hover:text-brand-700">{g.title[lang]}</span>
                  <p className="mt-1 text-sm text-ink-muted">{g.short[lang]}</p>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ——— Ajánlatkérés ——— */}
      <Reveal>
        <section className="mt-16 rounded-2xl border border-line bg-white p-8 text-center">
          <h2 className="text-xl font-semibold tracking-tight">{dict.industries.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-xl text-ink-muted">{dict.industries.ctaText}</p>
          <Link
            href={`/${lang}/kapcsolat`}
            className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            {dict.industries.ctaButton}
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
