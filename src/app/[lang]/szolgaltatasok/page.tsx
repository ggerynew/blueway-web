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
  return { title: getDictionary(lang).services.title };
}

export default async function ServicesPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { services } = dict;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {services.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{services.lead}</p>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {services.items.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.06}>
            <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6">
              <span className="text-sm font-medium text-brand-700">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-ink-muted">{item.body}</p>
              <ul className="mt-5 space-y-2">
                {item.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {p}
                  </li>
                ))}
              </ul>
              {item.meta && (
                <p className="mt-auto pt-6 text-xs font-medium tracking-wide text-ink-muted uppercase">
                  {item.meta}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-16 flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{services.ctaTitle}</h2>
            <p className="mt-2 max-w-xl text-ink-muted">{services.ctaBody}</p>
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
