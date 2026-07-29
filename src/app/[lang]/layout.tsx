import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AnalyticsRouteTracker } from '@/components/analytics';
import { asset } from '@/lib/asset';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { SITE_URL, absUrl } from '@/lib/site';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const skipLabel = dict.ui.skipToContent;

  // Cégadatok strukturált formában a keresőknek (Organization / LocalBusiness)
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Blueway Trade Kft.',
    url: SITE_URL,
    logo: absUrl('images/brand/blueway-logo-still.png'),
    email: 'info@blueway.hu',
    telephone: '+36302796679',
    taxID: '25051632-2-13',
    vatID: 'HU25051632',
    // A cég egyéb hivatalos jelenlétei — ettől a keresők ugyanahhoz a
    // szervezethez kötik a Facebook-oldalt is.
    sameAs: ['https://www.facebook.com/share/1Bb1i3eHqk/'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Déri Miksa u. 10/A.',
      addressLocality: 'Nagytarcsa',
      postalCode: '2142',
      addressCountry: 'HU',
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {/* Sets the correct document language per locale (root <html> defaults to hu). WCAG 3.1.1
          Also exposes the basePath for the cookie-consent script (policy URLs). */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            `document.documentElement.lang=${JSON.stringify(lang)};` +
            `window.__BLUEWAY_BASE__=${JSON.stringify(process.env.NEXT_PUBLIC_BASE_PATH || '')};`,
        }}
      />
      <a
        href="#main"
        className="sr-only rounded-full bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]"
      >
        {skipLabel}
      </a>
      <Header lang={lang} dict={dict} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer lang={lang} dict={dict} />
      <Toaster position="bottom-right" richColors />
      {/* Süti-hozzájárulás kezelő (consent banner) — minden oldalon */}
      <Script src={asset('/js/blueway-cookie-consent.js')} strategy="afterInteractive" />
      {/* Látogatottságmérés (GoatCounter): sütit nem tesz le, IP-címet és
          teljes User-Agentet nem tárol, csak napi összesítést — ezért
          jogos érdek alapján, consent nélkül futhat (lásd az adatkezelési
          tájékoztató III/5. pontját). A GOATCOUNTER_CODE repo-secret
          felülírja, üres értékkel kikapcsolható. */}
      {process.env.NEXT_PUBLIC_GOATCOUNTER_CODE && (
        <>
          <Script
            data-goatcounter={`https://${process.env.NEXT_PUBLIC_GOATCOUNTER_CODE}.goatcounter.com/count`}
            src="https://gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
          <AnalyticsRouteTracker />
        </>
      )}
    </div>
  );
}
