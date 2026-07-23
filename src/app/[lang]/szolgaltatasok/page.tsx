import type { Metadata } from 'next';
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
  const mailto = `mailto:${services.email}?subject=${encodeURIComponent(services.mailtoSubject)}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {services.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 text-lg text-ink-muted">{services.lead}</p>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-12 rounded-2xl border border-line bg-white p-8">
          <h2 className="text-2xl font-semibold tracking-tight">{services.service.title}</h2>
          <p className="mt-3 text-ink-muted">{services.service.body}</p>
          <ul className="mt-6 space-y-2">
            {services.service.points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-ink-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs font-medium tracking-wide text-ink-muted uppercase">
            {services.service.brands}
          </p>

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
              {services.contactLabel}
            </p>
            <a
              href={mailto}
              className="mt-1 inline-block text-lg font-medium text-brand-700 transition-colors hover:text-brand-800"
            >
              {services.email}
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.16}>
        <div className="mt-10 flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{services.ctaTitle}</h2>
            <p className="mt-2 max-w-xl text-ink-muted">{services.ctaBody}</p>
          </div>
          <a
            href={mailto}
            className="shrink-0 rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            {services.ctaButton}
          </a>
        </div>
      </Reveal>
    </div>
  );
}
