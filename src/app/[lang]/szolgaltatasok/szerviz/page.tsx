import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LegalNotice } from '@/components/legal-notice';
import { Reveal } from '@/components/reveal';
import { ServiceRequestForm } from '@/components/service-request-form';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { morzsa, szervezetRef } from '@/lib/jsonld';
import { SZERVIZ_TELEFONOK, absUrl, pageMetadata, telLink } from '@/lib/site';

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
    path: 'szolgaltatasok/szerviz',
    title: `${dict.servicePage.title} — ${dict.nav.services}`,
    description: dict.servicePage.lead,
    extra: [dict.servicePage.onsiteTitle, dict.servicePage.sendInTitle, dict.servicePage.phoneTitle],
  });
}

export default async function ServicePage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.servicePage;
  const email = dict.contact.email;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      morzsa(lang, [
      { name: dict.nav.services, path: 'szolgaltatasok' },
        { name: t.title, path: 'szolgaltatasok/szerviz' },
      ]),
      {
        '@type': 'Service',
        name: t.title,
        description: t.lead,
        serviceType: t.title,
        provider: szervezetRef,
        telephone: SZERVIZ_TELEFONOK[0],
        email,
        areaServed: { '@type': 'Country', name: 'Hungary' },
        url: absUrl(`${lang}/szolgaltatasok/szerviz`),
      },
    ],
  };

  /** A három szervizút — azonos csempén, hogy egyik se tűnjön mellékesnek. */
  const utak = [
    { cim: t.onsiteTitle, szoveg: t.onsiteBody, extra: null as React.ReactNode },
    {
      cim: t.sendInTitle,
      szoveg: t.sendInBody,
      extra: (
        <div className="mt-4 rounded-xl bg-surface p-4">
          {/* A cím ELŐTT áll, mert utána már senki nem olvas tovább: aki a
              címet keresi, azt kimásolja és becsomagolja a gépet. */}
          <p className="mb-4 border-l-2 border-brand-500 pl-3 text-sm font-medium text-ink">
            {t.sendInNote}
          </p>
          <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            {t.addressLabel}
          </p>
          <address className="mt-1 text-sm font-medium not-italic text-ink">
            Blueway Trade Kft.
            <br />
            {dict.contact.site}
          </address>
        </div>
      ),
    },
    {
      cim: t.phoneTitle,
      szoveg: t.phoneBody,
      extra: (
        <div className="mt-4 space-y-3">
          {SZERVIZ_TELEFONOK.map((szam, i) => (
            <div key={szam}>
              <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                {i === 0 ? t.phonePrimaryLabel : t.phoneSecondaryLabel}
              </p>
              <a
                href={telLink(szam)}
                className="text-lg font-medium text-brand-700 transition-colors hover:text-brand-800"
              >
                {szam}
              </a>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <nav className="text-sm text-ink-muted" aria-label="breadcrumb">
          <Link href={`/${lang}/szolgaltatasok`} className="transition-colors hover:text-ink">
            {dict.nav.services}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{t.title}</span>
        </nav>
      </Reveal>

      <Reveal delay={0.05}>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-5xl">{t.title}</h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{t.lead}</p>
      </Reveal>

      <div className="mt-12 grid items-stretch gap-4 md:grid-cols-3">
        {utak.map((u, i) => (
          <Reveal key={u.cim} delay={0.14 + i * 0.05} className="h-full">
            <div className="product-tile flex h-full flex-col p-7">
              <h2 className="text-xl font-semibold tracking-tight">{u.cim}</h2>
              <p className="mt-3 flex-1 text-ink-muted">{u.szoveg}</p>
              {u.extra}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-line bg-white p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t.emailTitle}</h2>
            <p className="mt-2 text-ink-muted">{t.emailBody}</p>
          </div>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(t.form.subject)}`}
            className="shrink-0 text-lg font-medium text-brand-700 transition-colors hover:text-brand-800"
          >
            {email}
          </a>
        </div>
      </Reveal>

      <Reveal delay={0.34}>
        <section id="szerviz-megkereses" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t.formTitle}</h2>
          <p className="mt-3 max-w-2xl text-ink-muted">{t.formLead}</p>
          <div className="mt-8 rounded-2xl border border-line bg-white p-6 md:p-8">
            <ServiceRequestForm
              labels={t.form}
              recipient={email}
              lang={lang}
              honeypotLabel={dict.ui.honeypot}
            />
            <LegalNotice lang={lang} />
          </div>
        </section>
      </Reveal>
    </div>
  );
}
