import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { HeroVisual } from '@/components/hero-visual';
import { getDictionary, isLocale } from '@/lib/i18n';

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
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
            <HeroVisual />
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
    </>
  );
}
