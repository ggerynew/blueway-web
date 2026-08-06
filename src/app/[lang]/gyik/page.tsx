import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { LinkedText } from '@/components/linked-text';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { getCategory } from '@/lib/products';
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
    path: 'gyik',
    title: dict.faq.title,
    description: dict.faq.lead,
  });
}

export default async function FaqPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const nyelv = lang; // isLocale után már Locale — a beágyazott függvény ezt látja
  const dict = getDictionary(nyelv);
  const { faq } = dict;

  // FAQPage strukturált adat — a Google ebből építhet gazdag találatot
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': absUrl(`${lang}/gyik`),
    isPartOf: weblapRef,
    publisher: szervezetRef,
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  /**
   * A válasz alatti hivatkozás felirata azt mondja meg, HOVA visz.
   *
   * Korábban minden nem tudástári hivatkozás „Címke ajánlatkérés" feliratot
   * kapott, függetlenül a céljától — az elszívós kérdéseknél például a
   * kategórialapra vitt, de ajánlatkérést ígért. A felirat mostantól a
   * célpontból következik, tehát nem tud eltérni tőle.
   */
  function hivatkozasFelirata(href: string): string {
    if (href.startsWith('/tudastar')) return dict.knowledge.readMore;
    const kategoria = href.match(/^\/termekek\/([a-z0-9-]+)$/);
    if (kategoria) {
      const cat = getCategory(kategoria[1]);
      if (cat) return cat.name[nyelv];
    }
    if (href === '/termekek') return dict.products.title;
    if (href === '/gyartok') return dict.manufacturers.title;
    if (href === '/szolgaltatasok') return dict.nav.services;
    return dict.nav.labelQuote;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{faq.title}</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{faq.lead}</p>
      </Reveal>

      <div className="mt-12 space-y-3">
        {faq.items.map((item, i) => (
          <Reveal key={item.q} delay={Math.min(i * 0.03, 0.15)}>
            <details className="group rounded-2xl border border-line bg-white open:shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 font-medium tracking-tight select-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-brand-700 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-ink-muted">
                  <LinkedText text={item.a} lang={lang} />
                </p>
                {item.href && (
                  <Link
                    href={`/${lang}${item.href}`}
                    className="mt-3 inline-block text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
                  >
                    {hivatkozasFelirata(item.href)} →
                  </Link>
                )}
              </div>
            </details>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.05}>
        <div className="mt-14 rounded-2xl border border-line bg-white p-8">
          <h2 className="text-lg font-semibold tracking-tight">{dict.knowledge.ctaTitle}</h2>
          <p className="mt-2 max-w-xl text-ink-muted">{dict.knowledge.ctaText}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/${lang}/kapcsolat`}
              className="rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              {dict.knowledge.ctaButton}
            </Link>
            <Link
              href={`/${lang}/tudastar`}
              className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium transition-colors hover:border-ink-muted"
            >
              {dict.knowledge.title}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
