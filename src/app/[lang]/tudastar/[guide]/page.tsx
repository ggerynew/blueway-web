import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { RibbonSpectrum } from '@/components/ribbon-spectrum';
import { asset } from '@/lib/asset';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { getGuide, guides } from '@/lib/knowledge';
import { absUrl, pageMetadata } from '@/lib/site';

export function generateStaticParams() {
  return locales.flatMap((lang) => guides.map((g) => ({ lang, guide: g.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; guide: string }>;
}): Promise<Metadata> {
  const { lang, guide: slug } = await params;
  if (!isLocale(lang)) return {};
  const guide = getGuide(slug);
  if (!guide) return {};
  return pageMetadata({
    lang,
    path: `tudastar/${guide.slug}`,
    title: guide.title[lang],
    description: guide.short[lang],
  });
}

export default async function GuidePage({
  params,
}: Readonly<{ params: Promise<{ lang: string; guide: string }> }>) {
  const { lang, guide: slug } = await params;
  if (!isLocale(lang)) notFound();
  const guide = getGuide(slug);
  if (!guide) notFound();
  const dict = getDictionary(lang);

  // Article + breadcrumb strukturált adat a keresőknek
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title[lang],
        description: guide.short[lang],
        inLanguage: lang,
        author: { '@type': 'Organization', name: 'Blueway Trade Kft.' },
        publisher: { '@type': 'Organization', name: 'Blueway Trade Kft.' },
        mainEntityOfPage: absUrl(`${lang}/tudastar/${guide.slug}`),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.knowledge.title, item: absUrl(`${lang}/tudastar`) },
          { '@type': 'ListItem', position: 2, name: guide.title[lang], item: absUrl(`${lang}/tudastar/${guide.slug}`) },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <Link
          href={`/${lang}/tudastar`}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← {dict.knowledge.back}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance md:text-5xl">
          {guide.title[lang]}
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-ink-muted">{guide.lead[lang]}</p>
      </Reveal>

      {guide.slug === 'festekszalag-valaszto' && (
        <Reveal delay={0.08}>
          <div className="mt-10">
            <RibbonSpectrum lang={lang} />
          </div>
        </Reveal>
      )}

      <div className="mt-12 space-y-12">
        {guide.sections.map((section, i) => (
          <Reveal key={section.title[lang]} delay={Math.min(i * 0.04, 0.16)}>
            <section>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                {section.title[lang]}
              </h2>
              {section.paragraphs.map((p) => (
                <p key={p[lang].slice(0, 32)} className="mt-4 leading-relaxed text-ink-muted">
                  {p[lang]}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b[lang].slice(0, 32)} className="flex gap-3 text-ink-muted">
                      <span aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700">—</span>
                      <span>{b[lang]}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.files && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {section.files.map((f) => (
                    <a
                      key={f.href}
                      href={asset(f.href)}
                      download
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink-muted"
                    >
                      <span aria-hidden="true" className="text-brand-700">
                        ↓
                      </span>
                      {f.label[lang]}
                    </a>
                  ))}
                </div>
              )}
              {section.link && (
                <Link
                  href={`/${lang}${section.link.href}`}
                  className="mt-5 inline-block rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
                >
                  {section.link.label[lang]} →
                </Link>
              )}
            </section>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.05}>
        <div className="mt-16 rounded-2xl border border-line bg-white p-8">
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
              href={`/${lang}/cimke-ajanlatkero`}
              className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium transition-colors hover:border-ink-muted"
            >
              {dict.nav.labelQuote}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
