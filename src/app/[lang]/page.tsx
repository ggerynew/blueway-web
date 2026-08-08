import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { HeroTileWall } from '@/components/hero-tile-wall';
import { asset } from '@/lib/asset';
import { kepVerzio } from '@/lib/kep-verzio';
import { getDictionary, isLocale } from '@/lib/i18n';
import { industries } from '@/lib/iparagak';
import { productName, products } from '@/lib/products';
import { guides } from '@/lib/knowledge';
import { graf, szervezetRef, weblapRef } from '@/lib/jsonld';
import { absUrl, pageMetadata } from '@/lib/site';

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
    // A címsorhoz a gyökér-layout hozzáfűzi a cégnevet, ezért itt a szlogen áll.
    title: dict.hero.title,
    description: dict.hero.lead,
  });
}

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // Termékfotók a forgó hero-gömbhöz — a TELJES kínálat, nem válogatás.
  // A gömb felülete elbírja: a hengeres elrendezésnél a kerület korlátozta a
  // csempék számát, itt viszont minden termék elfér olvasható méretben.
  // A képek a tiles/ mappából jönnek, nem a products/-ból: a csempe 82×62
  // képpontos, a termékfotó 900 széles — a kicsinyített készlettel a fal
  // ~2 MB helyett ~180 kB képet tölt. Előállítása: scripts/csempe-kepek.py.
  const heroTiles = products
    .filter((p) => p.image)
    .map((p) => ({
      src: asset(
        kepVerzio(
          (p.image as string)
            .replace('/images/products/', '/images/tiles/')
            .replace(/\.(webp|jpg)$/, '.webp'),
        ),
      ),
      alt: productName(p, lang),
      href: `/${lang}/termekek/${p.category}/${p.slug}`,
    }));
  // Címkék csempe a falra — a letisztított tekercses képpel.
  heroTiles.splice(1, 0, {
    src: asset(kepVerzio('/images/tiles/cimkek.webp')),
    alt: dict.products.labelsTile.title,
    href: `/${lang}/termekek/cimkek-es-festekszalagok`,
  });

  // A WebSite és az Organization csomópontot az elrendezés írja ki, minden
  // lapon egyszer. Itt már csak maga a nyitólap kap saját azonosítót, és
  // hozzáköti magát a kettőhöz.
  const jsonLd = graf([
    {
      '@type': 'WebPage',
      '@id': absUrl(lang),
      name: dict.hero.title,
      description: dict.hero.lead,
      inLanguage: lang,
      url: absUrl(lang),
      isPartOf: weblapRef,
      about: szervezetRef,
      primaryImageOfPage: absUrl('images/og.png'),
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-36 md:pb-28">
        {/* Egyenlő oszlopok: a gömbnek a nagyobb sugárral több hely kell,
            különben a csempék a szétválás árán zsugorodnának. A szövegoldal
            így is bőven elfér — a címsor és a bevezető saját maximumig ér. */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <Reveal>
              <p className="text-sm font-medium tracking-wide text-brand-700 uppercase">
                {dict.hero.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance hyphens-auto break-words md:text-6xl">
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

      {/* Iparági belépés: aki nem géptípust keres, hanem a saját feladatát,
          innen indul. Csak nevek, kép nélkül — a főoldal súlya így nem nő. */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {dict.industries.title}
                </h2>
                <p className="mt-3 max-w-xl text-ink-muted">{dict.industries.lead}</p>
              </div>
              <Link
                href={`/${lang}/iparagak`}
                className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
              >
                {dict.industries.title} →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {industries.map((ind) => (
                <Link
                  key={ind.slug}
                  href={`/${lang}/iparagak/${ind.slug}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700"
                >
                  {ind.name[lang]}
                </Link>
              ))}
            </div>
          </Reveal>
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
                  className="group product-tile flex h-full flex-col p-6"
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
