import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';

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
  return { title: getDictionary(lang).printheads.title };
}

export default async function PrintheadsPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { printheads } = dict;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {printheads.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{printheads.lead}</p>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {printheads.groups.map((group, i) => (
          <Reveal key={group.title} delay={i * 0.06}>
            <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-8">
              <h2 className="text-xl font-semibold tracking-tight">{group.title}</h2>
              <p className="mt-3 text-ink-muted">{group.body}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {group.brands.map((brand) => (
                  <li
                    key={brand}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium text-ink"
                  >
                    {brand}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="mt-8 max-w-2xl text-ink-muted">{printheads.note}</p>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="mt-12 flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{printheads.ctaTitle}</h2>
            <p className="mt-2 max-w-xl text-ink-muted">{printheads.ctaBody}</p>
          </div>
          <Link
            href={`/${lang}/kapcsolat`}
            className="shrink-0 rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            {dict.nav.quote}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
