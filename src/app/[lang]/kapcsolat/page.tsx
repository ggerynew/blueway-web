import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/contact-form';
import { LegalNotice } from '@/components/legal-notice';
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
  return { title: getDictionary(lang).contact.title };
}

export default async function ContactPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { contact } = dict;

  // Google Maps – a nagytarcsai telephely (API-kulcs nélküli beágyazás)
  const mapQuery = 'Déri Miksa u. 10/A, 2142 Nagytarcsa, Hungary';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&hl=${lang}&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const info = [
    { label: contact.companyLabel, value: contact.company, href: undefined },
    { label: contact.siteLabel, value: contact.site, href: undefined },
    { label: contact.billingLabel, value: contact.billing, href: undefined },
    {
      label: contact.phoneLabel,
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, '')}`,
    },
    { label: contact.emailLabel, value: contact.email, href: `mailto:${contact.email}` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {contact.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{contact.lead}</p>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <Reveal delay={0.12}>
          <div>
            <h2 className="text-sm font-medium tracking-wide text-ink uppercase">
              {contact.infoTitle}
            </h2>
            <dl className="mt-6 space-y-5">
              {info.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-ink">
                    {row.href ? (
                      <a href={row.href} className="transition-colors hover:text-brand-700">
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
            <ContactForm labels={contact.form} recipient={contact.email} />
            <LegalNotice lang={lang} />
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.12}>
        <section className="mt-16">
          <h2 className="text-sm font-medium tracking-wide text-ink uppercase">
            {contact.mapLabel}
          </h2>
          {/* A térkép csak a harmadik feles sütikhez adott hozzájárulás után
              töltődik be — a consent kezelő állítja be a src-t a data-src-ből. */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
            <iframe
              title={`${contact.company} — ${contact.site}`}
              data-consent="thirdparty"
              data-src={mapSrc}
              className="h-[360px] w-full md:h-[420px]"
              style={{ border: 0, display: 'none' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
          >
            {contact.mapOpen}
            <span aria-hidden="true">→</span>
          </a>
        </section>
      </Reveal>
    </div>
  );
}
