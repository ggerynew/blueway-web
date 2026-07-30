import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DnbCertificate } from '@/components/dnb-certificate';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { SITE_URL, absUrl, pageMetadata } from '@/lib/site';

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
    path: 'rolunk',
    title: dict.about.title,
    description: dict.about.lead,
  });
}

export default async function AboutPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { about } = dict;

  // AboutPage + a cégadatok — a keresők így a bemutatkozást is a céghez kötik.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `${about.title} — Blueway Trade Kft.`,
    description: about.lead,
    url: absUrl(`${lang}/rolunk`),
    inLanguage: lang,
    mainEntity: {
      '@type': 'Organization',
      name: 'Blueway Trade Kft.',
      url: SITE_URL,
      foundingDate: '2014',
      email: dict.contact.email,
      telephone: dict.footer.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nagytarcsa',
        addressCountry: 'HU',
      },
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{about.title}</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{about.lead}</p>
      </Reveal>

      {/* Számok: alapítás, tapasztalat, minősítés, telephely */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {about.facts.map((fact, i) => (
          <Reveal key={fact.label} delay={0.12 + i * 0.05}>
            <div className="h-full rounded-2xl border border-line bg-white p-6">
              <p className="text-2xl font-semibold tracking-tight text-brand-700">{fact.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{fact.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          {about.intro.map((paragraph, i) => (
            <Reveal key={paragraph.slice(0, 24)} delay={i * 0.06}>
              <p className="text-lg leading-relaxed text-ink-muted">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="h-full rounded-2xl border border-line bg-surface p-8">
            <h2 className="text-xl font-semibold tracking-tight">{about.whyTitle}</h2>
            <div className="mt-4 space-y-4">
              {about.why.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Dun & Bradstreet tanúsítvány — kiemelt sáv, élő képként */}
      <Reveal delay={0.08}>
        <div className="mt-14 flex flex-col items-center gap-8 rounded-2xl border border-amber-300/70 bg-amber-50/60 p-8 md:flex-row md:p-10">
          <DnbCertificate
            lang={lang}
            dict={dict}
            className="block w-full max-w-[350px] shrink-0 rounded-xl bg-white p-3 shadow-sm"
            imgClassName="h-auto w-full border border-[#CCCCCC]"
          />
          <div>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              {about.certificateTitle}
            </h2>
            <p className="mt-2 max-w-xl text-ink-muted">{about.certificateBody}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <h2 className="mt-16 text-2xl font-semibold tracking-tight md:text-3xl">
          {about.offerTitle}
        </h2>
      </Reveal>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {about.offer.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05} className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6">
              <span className="text-sm font-medium text-brand-700">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.05}>
        <div className="mt-14 flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{about.ctaTitle}</h2>
            <p className="mt-2 max-w-xl text-ink-muted">{about.ctaBody}</p>
          </div>
          <Link
            href={`/${lang}/kapcsolat`}
            className="shrink-0 rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            {about.ctaButton}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
