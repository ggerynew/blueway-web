import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { asset } from '@/lib/asset';
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
  return { title: getDictionary(lang).partners.title };
}

export default async function PartnersPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { partners } = dict;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {partners.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{partners.lead}</p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.items.map((partner, i) => (
          <Reveal key={partner.name} delay={(i % 3) * 0.05}>
            <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm">
              {partner.logo ? (
                <h2 className="flex h-14 items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(partner.logo)}
                    alt={partner.name}
                    className={`w-auto object-contain ${
                      partner.logo.includes('cab-logo') || partner.logo.includes('start-logo')
                        ? 'max-h-14 max-w-[210px]'
                        : 'max-h-9 max-w-[180px]'
                    }`}
                  />
                </h2>
              ) : (
                <h2 className="flex h-14 items-center text-lg font-semibold tracking-tight text-brand-700">
                  {partner.name}
                </h2>
              )}
              <p className="mt-2 text-sm text-ink-muted">{partner.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
