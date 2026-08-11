import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { terms } from '@/lib/fogalomtar';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { guides } from '@/lib/knowledge';
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
  // A morzsa nem díszítés: a felső szintű szekciólapok közül eddig csak a
  // kapcsolat és a fogalomtár kapott BreadcrumbList-et, a többi nem — a
  // kétszintű lánc (Főoldal → szakasz) a keresőben is érvényes morzsa.
  const jsonLd = graf([{
    '@type': 'CollectionPage',
    '@id': absUrl(`${lang}/tudastar`),
    name: dict.knowledge.title,
    description: dict.knowledge.lead,
    inLanguage: nyelvKod(lang),
    url: absUrl(`${lang}/tudastar`),
    isPartOf: weblapRef(lang),
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
  }, morzsa(lang, [{ name: dict.knowledge.title, path: 'tudastar' }])]);

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
        {/* A fogalomtár az útmutatók ELŐTT áll, és teljes értékű csempeként:
            aki egy szakszót keres, nem akar végigolvasni egy útmutatót, csak
            a meghatározást kéri — a többi lap szókincse is innen való.
            Eddig egy keskeny hivatkozás volt a rács fölött; a helye maradt,
            a súlya nőtt.

            A késleltetések ezért eggyel eltolódnak: a rácsban az útmutatók
            az 1. helytől kezdődnek, nem a nulladiktól. */}
        <Reveal className="h-full">
          <Link
            href={`/${lang}/fogalomtar`}
            className="group product-tile flex h-full flex-col p-7"
          >
            <h2 className="text-xl font-semibold tracking-tight group-hover:text-brand-700">
              {dict.glossary.title}
            </h2>
            <p className="mt-3 flex-1 text-ink-muted">{dict.glossary.lead}</p>
            <span className="mt-5 text-sm font-medium text-brand-700">
              {dict.glossary.termCount(terms.length)} →
            </span>
          </Link>
        </Reveal>
        {guides.map((guide, i) => (
          <Reveal key={guide.slug} delay={((i + 1) % 2) * 0.06} className="h-full">
            <Link
              href={`/${lang}/tudastar/${guide.slug}`}
              className="group product-tile flex h-full flex-col p-7"
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
        <Reveal delay={((guides.length + 1) % 2) * 0.06} className="h-full">
          <Link
            href={`/${lang}/gyik`}
            className="group product-tile flex h-full flex-col p-7"
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
