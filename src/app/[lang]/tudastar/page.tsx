import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { guides } from '@/lib/knowledge';
import { szervezetRef, weblapRef } from '@/lib/jsonld';
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
    path: 'tudastar',
    title: dict.knowledge.title,
    description: dict.knowledge.lead,
  });
}

export default async function KnowledgePage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // Útmutató-lista strukturált adatként (CollectionPage + ItemList)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absUrl(`${lang}/tudastar`),
    name: dict.knowledge.title,
    description: dict.knowledge.lead,
    inLanguage: lang,
    url: absUrl(`${lang}/tudastar`),
    isPartOf: weblapRef,
    publisher: szervezetRef,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: guides.map((g, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: g.title[lang],
        url: absUrl(`${lang}/tudastar/${g.slug}`),
      })),
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {dict.knowledge.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{dict.knowledge.lead}</p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {guides.map((guide, i) => (
          <Reveal key={guide.slug} delay={(i % 2) * 0.06} className="h-full">
            <Link
              href={`/${lang}/tudastar/${guide.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-line bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
            >
              <h2 className="text-xl font-semibold tracking-tight group-hover:text-brand-700">
                {guide.title[lang]}
              </h2>
              <p className="mt-3 flex-1 text-ink-muted">{guide.short[lang]}</p>
              <span className="mt-5 text-sm font-medium text-brand-700">
                {dict.knowledge.readMore} →
              </span>
            </Link>
          </Reveal>
        ))}
        <Reveal delay={(guides.length % 2) * 0.06} className="h-full">
          <Link
            href={`/${lang}/gyik`}
            className="group flex h-full flex-col rounded-2xl border border-line bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
          >
            <h2 className="text-xl font-semibold tracking-tight group-hover:text-brand-700">
              {dict.faq.title}
            </h2>
            <p className="mt-3 flex-1 text-ink-muted">{dict.faq.short}</p>
            <span className="mt-5 text-sm font-medium text-brand-700">
              {dict.knowledge.readMore} →
            </span>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
