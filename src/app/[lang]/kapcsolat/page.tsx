import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/contact-form';
import { LegalNotice } from '@/components/legal-notice';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { NAVIGACIO, TERKEP_URL, graf, morzsa, szervezetRef, weblapRef } from '@/lib/jsonld';
import { absUrl, pageMetadata } from '@/lib/site';

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
    path: 'kapcsolat',
    title: dict.contact.title,
    description: dict.contact.lead,
  });
}

export default async function ContactPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { contact } = dict;

  // A kapcsolatoldalnak eddig nem volt saját strukturált adata, pedig ez az
  // a lap, amit a kereső a cég elérhetőségeihez köt. A cégadatokat nem
  // ismételjük meg: a központi szervezet-csomópontra hivatkozunk.
  const jsonLd = graf([
    {
      '@type': 'ContactPage',
      '@id': absUrl(`${lang}/kapcsolat`),
      name: dict.contact.title,
      description: dict.contact.lead,
      inLanguage: lang,
      url: absUrl(`${lang}/kapcsolat`),
      isPartOf: weblapRef,
      about: szervezetRef,
      mainEntity: szervezetRef,
      significantLink: TERKEP_URL,
    },
    morzsa(lang, [{ name: dict.contact.title, path: 'kapcsolat' }]),
  ]);

  // Google Maps – a nagytarcsai telephely (API-kulcs nélküli beágyazás)
  const mapQuery = 'Déri Miksa u. 10/A, 2142 Nagytarcsa, Hungary';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&hl=${lang}&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const info = [
    { label: contact.companyLabel, value: contact.company, href: undefined },
    { label: contact.siteLabel, value: contact.site, href: undefined },
    { label: contact.billingLabel, value: contact.billing, href: undefined },
    // A nyitvatartás azért van itt is, nem csak a Google cégprofilban: aki a
    // weblapról hív, itt látja, mikor van értelme. A kettőnek egyeznie kell.
    { label: contact.hoursLabel, value: contact.hours, href: undefined },
    {
      label: contact.phoneLabel,
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, '')}`,
    },
    { label: contact.emailLabel, value: contact.email, href: `mailto:${contact.email}` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            <ContactForm
              labels={contact.form}
              recipient={contact.email}
              lang={lang}
              honeypotLabel={dict.ui.honeypot}
            />
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
          {/* Útvonaltervezés indítása. Sima hivatkozások, nem beágyazás:
              amíg a látogató rá nem kattint, egyetlen kérés sem megy ki a
              Google-höz vagy a Waze-hez, tehát nem tartoznak a
              süti-hozzájárulás alá — ellentétben a fenti térképpel.

              Az ikonok saját rajzú SVG-k, nem a szolgáltatások logói: a
              márkajelek átvétele védjegykérdés, és külső fájlt sem akarunk
              betölteni miattuk. A célt a felirat mondja meg. */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={NAVIGACIO.google}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink-muted"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-brand-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.6" />
              </svg>
              {contact.navGoogle}
            </a>
            <a
              href={NAVIGACIO.waze}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink-muted"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-brand-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.5 3.5 3.8 10.2c-.8.3-.8 1.5.1 1.7l6.6 1.6 1.6 6.6c.2.9 1.4.9 1.7.1L20.5 3.5Z" />
              </svg>
              {contact.navWaze}
            </a>
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
            >
              {contact.mapOpen}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
