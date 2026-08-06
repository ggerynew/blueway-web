import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LinkedText } from '@/components/linked-text';
import { Reveal } from '@/components/reveal';
import { terms, termsByTheme } from '@/lib/fogalomtar';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { graf, morzsa, szervezetRef, weblapRef } from '@/lib/jsonld';
import { getGuide } from '@/lib/knowledge';
import { getCategory, getProduct, productName, products } from '@/lib/products';
import { absUrl, pageMetadata } from '@/lib/site';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    lang,
    path: 'fogalomtar',
    title: dict.glossary.title,
    description: dict.glossary.lead,
    // A fogalmak nevei maguk a keresett kifejezések — ezek töltik ki a leírást.
    extra: [terms.map((t) => t.name[lang]).join(', ')],
  });
}

export default async function GlossaryPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const csoportok = termsByTheme();
  const lapUrl = absUrl(`${lang}/fogalomtar`);

  const jsonLd = graf([
    {
      '@type': 'DefinedTermSet',
      '@id': `${lapUrl}#fogalomtar`,
      name: dict.glossary.title,
      description: dict.glossary.lead,
      inLanguage: lang,
      url: lapUrl,
      publisher: szervezetRef,
      // Minden fogalom saját horgonnyal — így egy kereső vagy AI-válaszmotor
      // pontosan arra a meghatározásra tud hivatkozni, amit idéz.
      hasDefinedTerm: terms.map((t) => ({
        '@type': 'DefinedTerm',
        '@id': `${lapUrl}#${t.slug}`,
        name: t.name[lang],
        description: t.definition[lang],
        url: `${lapUrl}#${t.slug}`,
        inDefinedTermSet: { '@id': `${lapUrl}#fogalomtar` },
      })),
    },
    {
      '@type': 'WebPage',
      '@id': lapUrl,
      name: dict.glossary.title,
      description: dict.glossary.lead,
      inLanguage: lang,
      url: lapUrl,
      isPartOf: weblapRef,
      mainEntity: { '@id': `${lapUrl}#fogalomtar` },
    },
    morzsa(lang, [{ name: dict.glossary.title, path: 'fogalomtar' }]),
  ]);

  /** Egy fogalom alatti továbbvezető hivatkozások — csak a létezők. */
  const kapcsolodo = (t: (typeof terms)[number]) => [
    ...(t.guides ?? []).flatMap((g) => {
      const x = getGuide(g);
      return x ? [{ cimke: dict.glossary.relatedGuides, nev: x.title[lang], href: `/${lang}/tudastar/${x.slug}` }] : [];
    }),
    ...(t.categories ?? []).flatMap((c) => {
      const x = getCategory(c);
      return x ? [{ cimke: dict.glossary.relatedCategories, nev: x.name[lang], href: `/${lang}/termekek/${x.slug}` }] : [];
    }),
    ...(t.products ?? []).flatMap((s) => {
      const p = products.find((x) => x.slug === s);
      return p && getProduct(p.category, p.slug)
        ? [{ cimke: dict.glossary.relatedProducts, nev: productName(p, lang), href: `/${lang}/termekek/${p.category}/${p.slug}` }]
        : [];
    }),
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {dict.glossary.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{dict.glossary.lead}</p>
        <p className="mt-2 text-sm text-ink-muted">{dict.glossary.termCount(terms.length)}</p>
      </Reveal>

      {/* Ugrósáv: egy lapon minden fogalom, a témakörök viszont elérhetők
          görgetés nélkül is. */}
      <Reveal delay={0.14}>
        <nav aria-label={dict.glossary.jumpTitle} className="mt-10 flex flex-wrap gap-2.5">
          {csoportok.map((g) => (
            <a
              key={g.theme}
              href={`#${g.theme}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700"
            >
              {dict.glossary.themes[g.theme]}
            </a>
          ))}
        </nav>
      </Reveal>

      <div className="mt-16 space-y-16">
        {csoportok.map((g) => (
          <section key={g.theme} id={g.theme} className="scroll-mt-32">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {dict.glossary.themes[g.theme]}
              </h2>
            </Reveal>
            <dl className="mt-8 space-y-10">
              {g.items.map((t) => {
                const linkek = kapcsolodo(t);
                return (
                  <div key={t.slug} id={t.slug} className="scroll-mt-32">
                    <dt>
                      <h3 className="text-lg font-semibold tracking-tight">{t.name[lang]}</h3>
                      {/* A rövid mondat a válasz a „mi az a …?" kérdésre —
                          sötétebb, mint a kifejtés, hogy elváljon tőle. */}
                      <p className="mt-1 text-ink">{t.short[lang]}</p>
                    </dt>
                    <dd className="mt-3 text-ink-muted">
                      <LinkedText text={t.definition[lang]} lang={lang} />
                      {linkek.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {linkek.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm transition-colors hover:border-brand-300 hover:text-brand-700"
                            >
                              <span className="text-ink-muted">{l.cimke}:</span> {l.nev}
                            </Link>
                          ))}
                        </div>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
