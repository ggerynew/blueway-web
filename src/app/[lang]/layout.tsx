import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AnalyticsRouteTracker } from '@/components/analytics';
import { PartsFinder } from '@/components/parts-finder';
import { asset } from '@/lib/asset';
import { getDictionary, HREFLANG, isLocale, locales } from '@/lib/i18n';
import { graf, szervezetNode, weblapNode } from '@/lib/jsonld';
import { SUTI_VERZIO } from '@/lib/suti-verzio';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * Az alkatrészkereső fül megjelenjen-e.
 *
 * Egyelőre ki van kapcsolva. A kereső maga megvan és működik
 * (src/components/parts-finder.tsx, src/lib/alkatresz.ts, a jegyzék pedig a
 * public/alkatreszek.json) — csak nem mutatjuk a látogatóknak, amíg nincs
 * végigpróbálva valódi vevői kérdésekkel. A visszakapcsolás ez az egy sor.
 *
 * Az adatkezelési tájékoztató vonatkozó pontja szándékosan bent marad: olyat
 * ír le, ami ilyenkor nem történik, ami legfeljebb fölösleges — a fordítottja
 * viszont hiba lenne, és a visszakapcsoláskor újra kellene verziózni.
 */
const ALKATRESZKERESO = false;

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

  // A cég és a weblap csomópontja állandó @id-vel. Minden további oldal
  // ezekre HIVATKOZIK, nem újraírja őket — így a kereső és az AI-válaszmotor
  // is tudja, hogy a hétszáz lapon ugyanarról a cégről van szó.
  const alapGraf = graf([szervezetNode(lang), weblapNode(lang)]);

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(alapGraf) }}
      />
      {/* Sets the correct document language per locale (root <html> defaults to hu). WCAG 3.1.1
          Also exposes the basePath for the cookie-consent script (policy URLs). */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            // BCP-47 címke, nem a mappanév: a `us` önmagában nem nyelvkód, a
            // felolvasó és a kereső `en-US`-t vár. (A brit változat `en-GB`.)
            `document.documentElement.lang=${JSON.stringify(HREFLANG[lang])};` +
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
      {/* Alkatrészkereső — jobbról nyíló fül. Minden oldalról elérhető, mert
          az alkatrész gyakran nem a termékoldalról indulva jut eszébe a
          vevőnek: a szervizhívás közben nyitja ki. */}
      {ALKATRESZKERESO && <PartsFinder lang={lang} />}
      <Toaster position="bottom-right" richColors />
      {/* Süti-hozzájárulás kezelő (consent banner) — minden oldalon.
          A cím végén a fájl tartalmi lenyomata: enélkül a böngésző az
          egyéves, „immutable" gyorsítótár miatt a régi szkriptet futtatná
          a javítások után is (lásd src/lib/suti-verzio.ts). */}
      <Script
        src={`${asset('/js/blueway-cookie-consent.js')}?v=${SUTI_VERZIO}`}
        strategy="afterInteractive"
      />
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
