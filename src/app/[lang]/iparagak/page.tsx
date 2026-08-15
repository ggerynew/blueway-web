import type { Metadata } from 'next';
import { Link } from '@/components/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { industries } from '@/lib/iparagak';
import { graf, morzsa, nyelvKod, szervezetRef, weblapRef } from '@/lib/jsonld';
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
    path: 'iparagak',
    title: dict.industries.title,
    description: dict.industries.lead,
    extra: [industries.map((i) => i.name[lang]).join(', ')],
  });
}

export default async function IndustriesPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // A morzsa nem díszítés: a felső szintű szekciólapok közül eddig csak a
  // kapcsolat és a fogalomtár kapott BreadcrumbList-et, a többi nem — a
  // kétszintű lánc (Főoldal → szakasz) a keresőben is érvényes morzsa.
  const jsonLd = graf([{
    '@type': 'CollectionPage',
    '@id': absUrl(`${lang}/iparagak`),
    name: dict.industries.title,
    description: dict.industries.lead,
    inLanguage: nyelvKod(lang),
    url: absUrl(`${lang}/iparagak`),
    isPartOf: weblapRef(lang),
    publisher: szervezetRef,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: industries.map((ind, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: ind.name[lang],
        url: absUrl(`${lang}/iparagak/${ind.slug}`),
      })),
    },
  }, morzsa(lang, [{ name: dict.industries.title, path: 'iparagak' }])]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {dict.industries.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{dict.industries.lead}</p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {industries.map((ind, i) => (
          <Reveal key={ind.slug} delay={(i % 2) * 0.06} className="h-full">
            <Link
              href={`/${lang}/iparagak/${ind.slug}`}
              className="group product-tile flex h-full flex-col p-7"
            >
              <h2 className="text-xl font-semibold tracking-tight group-hover:text-brand-700">
                {ind.name[lang]}
              </h2>
              <p className="mt-3 flex-1 text-ink-muted">{ind.short[lang]}</p>
              <span className="mt-5 text-sm font-medium text-brand-700">
                {/* A kártyán az ajánlott gépek száma a legbeszédesebb: megmondja,
                    hogy nem egy általános szöveg vár, hanem konkrét kínálat. */}
                {dict.industries.machineCount(ind.products.length)} →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
