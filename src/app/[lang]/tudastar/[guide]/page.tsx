import type { Metadata } from 'next';
import { Link } from '@/components/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { RibbonSpectrum } from '@/components/ribbon-spectrum';
import { LinkedText } from '@/components/linked-text';
import { asset } from '@/lib/asset';
import { kepVerzio } from '@/lib/kep-verzio';
import { abraUt, getDictionary, isLocale, locales } from '@/lib/i18n';
import { getGuide, guides } from '@/lib/knowledge';
import { morzsa, nyelvKod, szervezetRef, weblapRef } from '@/lib/jsonld';
import { absUrl, pageMetadata } from '@/lib/site';

/** A tudástár első köre ezen a napon jelent meg — az e nélküli cikkek dátuma. */
const PUBLISHED = '2026-07-26';

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
        inLanguage: nyelvKod(lang),
        image: absUrl('images/og.png'),
        datePublished: guide.kiadva ?? PUBLISHED,
        dateModified: guide.modositva ?? guide.kiadva ?? PUBLISHED,
        author: szervezetRef,
        publisher: szervezetRef,
        isPartOf: weblapRef(lang),
        mainEntityOfPage: absUrl(`${lang}/tudastar/${guide.slug}`),
      },
      morzsa(lang, [
      { name: dict.knowledge.title, path: 'tudastar' },
        { name: guide.title[lang], path: `tudastar/${guide.slug}` },
      ]),
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
                  <LinkedText text={p[lang]} lang={lang} />
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b[lang].slice(0, 32)} className="flex gap-3 text-ink-muted">
                      <span aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700">—</span>
                      <span>
                        <LinkedText text={b[lang]} lang={lang} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {section.images && (
                <div
                  className={`mt-6 grid gap-5 ${
                    section.images.length > 1 && !section.images.some((k) => k.wide)
                      ? 'sm:grid-cols-2'
                      : ''
                  }`}
                >
                  {section.images.map((kep) => (
                    // A `min-w-0` nem díszítés: rácselemként a figure alapból a
                    // tartalma legkisebb szélességére nő, tehát a 820 képpontos
                    // ábra magát a LAPOT tolná szélesebbre a telefonon. Ezzel a
                    // görgetés a kép keretén belül marad.
                    <figure
                      key={kep.src}
                      className={`min-w-0 ${kep.wide ? 'sm:col-span-2' : ''}`}
                    >
                      {/* A fehér háttér nem díszítés: a vonalkód csak sötét-világos
                          kontraszttal olvasható le, tehát a kép alatt akkor is
                          fehérnek kell lennie, ha a lap háttere más. */}
                      {/* A nagy ábrák (wide) telefonon oldalt görgethetők. Enélkül a
                          900 képpont széles rajz 390-re zsugorodik, és a 11 pontos
                          felirat 5 pont alá esik — a fókuszábrán hat méretvonal és
                          hat felirat van, ott ez olvashatatlan. A vízszintes görgetés
                          a kép SAJÁT keretén belül marad, a lap maga nem csúszik el.
                          A kis szimbólumok (QR, EAN) nem kapják meg: azok kicsik. */}
                      <div
                        className={`rounded-xl border border-line bg-white p-4 ${
                          kep.wide ? 'overflow-x-auto sm:overflow-hidden' : 'overflow-hidden'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset(kepVerzio(abraUt(kep.src, lang)))}
                          alt={kep.alt[lang]}
                          loading="lazy"
                          className={
                            kep.wide
                              ? 'mx-auto h-auto w-[820px] max-w-none sm:w-full sm:max-w-full'
                              : 'mx-auto h-auto w-full max-w-full'
                          }
                        />
                      </div>
                      <figcaption className="mt-2 text-sm text-ink-muted">
                        {kep.caption[lang]}
                      </figcaption>
                    </figure>
                  ))}
                </div>
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
