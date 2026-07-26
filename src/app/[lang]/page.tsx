import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { HeroTileWall } from '@/components/hero-tile-wall';
import { asset } from '@/lib/asset';
import { getDictionary, isLocale } from '@/lib/i18n';
import { products } from '@/lib/products';
import { guides } from '@/lib/knowledge';
import { SITE_URL, pageMetadata } from '@/lib/site';

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
    path: '',
    title:
      lang === 'hu'
        ? 'Blueway Trade Kft. — Termékjelölési megoldások'
        : 'Blueway Trade Ltd. — Product marking solutions',
    description: dict.hero.lead,
  });
}

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // Termékfotók a forgó hero-falhoz — a teljes katalógusból egyenletesen válogatva.
  const withImage = products.filter((p) => p.image);
  const TILE_COUNT = Math.min(17, withImage.length);
  const heroTiles = Array.from({ length: TILE_COUNT }, (_, i) => {
    const p = withImage[Math.round((i * (withImage.length - 1)) / (TILE_COUNT - 1))];
    return {
      src: asset(p.image as string),
      alt: p.name,
      href: `/${lang}/termekek/${p.category}/${p.slug}`,
    };
  });
  // Címkék csempe a falra — a letisztított tekercses képpel.
  heroTiles.splice(1, 0, {
    src: asset('/images/products/cimkek.webp'),
    alt: dict.products.labelsTile.title,
    href: `/${lang}/termekek/cimkek-es-festekszalagok`,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Blueway Trade Kft.',
    url: SITE_URL,
    inLanguage: lang,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-36 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <p className="text-sm font-medium tracking-wide text-brand-700 uppercase">
                {dict.hero.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
                {dict.hero.title}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg text-ink-muted">{dict.hero.lead}</p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href={`/${lang}/kapcsolat`}
                  className="rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
                >
                  {dict.hero.ctaPrimary}
                </Link>
                <Link
                  href={`/${lang}/termekek`}
                  className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium transition-colors hover:border-ink-muted"
                >
                  {dict.hero.ctaSecondary}
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="hidden lg:block">
            <HeroTileWall tiles={heroTiles} />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-3">
          {dict.pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <div>
                <span className="text-sm font-medium text-brand-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  {pillar.title}
                </h2>
                <p className="mt-3 text-ink-muted">{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Tudástár-ajánló: a legfrissebb útmutatók a főoldalról is elérhetők */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {dict.knowledge.title}
                </h2>
                <p className="mt-3 max-w-xl text-ink-muted">{dict.knowledge.lead}</p>
              </div>
              <Link
                href={`/${lang}/tudastar`}
                className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
              >
                {dict.knowledge.title} →
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {guides.slice(0, 3).map((guide, i) => (
              <Reveal key={guide.slug} delay={i * 0.06} className="h-full">
                <Link
                  href={`/${lang}/tudastar/${guide.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
                >
                  <h3 className="font-semibold tracking-tight group-hover:text-brand-700">
                    {guide.title[lang]}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-ink-muted">{guide.short[lang]}</p>
                  <span className="mt-4 text-sm font-medium text-brand-700">
                    {dict.knowledge.readMore} →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
