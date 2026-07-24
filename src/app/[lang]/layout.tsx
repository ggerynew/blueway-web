import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { asset } from '@/lib/asset';
import { getDictionary, isLocale, locales } from '@/lib/i18n';

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
  const skipLabel = lang === 'hu' ? 'Ugrás a tartalomra' : 'Skip to content';

  return (
    <div className="flex min-h-screen flex-col">
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
    </div>
  );
}
