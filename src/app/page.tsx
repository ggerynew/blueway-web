import type { Metadata } from 'next';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { HREFLANG, locales } from '@/lib/i18n';
import { absUrl } from '@/lib/site';

/**
 * A gyökér csak átirányít egy nyelvi változatra. Kanonikusként a /hu-t adjuk
 * meg, különben a kereső két címen látná ugyanazt a főoldalt.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: absUrl('hu'),
    // A gyökér a belépési pont: a márkanévre keresve erre a címre mutatnak a
    // hivatkozások. A nyelvi változatokat innen is felsoroljuk, hogy a kereső
    // egy lépésből mind a hetet megtalálja.
    languages: {
      ...Object.fromEntries(locales.map((l) => [HREFLANG[l], absUrl(l)])),
      'x-default': absUrl('hu'),
    },
  },
};

/** A nyelvválasztóban a nyelv a SAJÁT nevén szerepel — azt ismeri fel a látogató. */
const NYELV_NEVE: Record<(typeof locales)[number], string> = {
  hu: 'Magyar',
  en: 'English (UK)',
  us: 'English (US)',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
  ko: '한국어',
  zh: '中文',
};

/**
 * Ez dönti el, melyik nyelven érkezik meg a látogató a blueway.hu címen.
 *
 * Ha korábban választott nyelvet ÉS a kényelmi sütiket engedélyezte, akkor a
 * blueway_lang süti alapján a saját nyelvére megy; egyébként a magyarra.
 * Enélkül a süti csak ígéret lenne: a hozzájárulási szöveg mind a hét nyelven
 * említi, a weblap viszont nem vette volna hasznát.
 *
 * Miért soron belüli szkript és nem React-komponens: itt a sorrend a lényeg. Ez
 * a néhány sor a HTML feldolgozása közben, még az első kirajzolás előtt lefut,
 * tehát nem villan fel üres oldal. Egy useEffect csak a React betöltése után
 * futna, jóval később.
 *
 * A location.replace (és nem assign) azért kell, hogy a gyökér ne kerüljön be a
 * böngésző előzményébe: a Vissza gomb különben ide dobná a látogatót, innen
 * pedig azonnal újra előre — csapdába esne.
 *
 * A süti értékét ellenőrizzük az ismert nyelvek listáján. Egy kézzel átírt süti
 * így legfeljebb a magyar változatra visz, nem pedig egy általa megadott címre.
 */
const NYELVVALASZTO = `(function(){try{
var b=${JSON.stringify(asset(''))},n=${JSON.stringify(locales)};
var m=document.cookie.match(/(?:^|; )blueway_lang=([^;]*)/);
var v=m?decodeURIComponent(m[1]):'';
location.replace(b+'/'+(n.indexOf(v)>-1?v:'hu'));
}catch(e){location.replace(${JSON.stringify(asset('/hu'))});}})();`;

export default function RootPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: NYELVVALASZTO }} />
      {/* Szkript nélküli böngészőknek (és a keresőknek) marad a magyar változat. */}
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${asset('/hu')}`} />
      </noscript>
      {/*
        Ami a szkript nélkül marad: valódi nyelvválasztó, nem üres oldal.
        A látogató ezt gyakorlatilag sosem látja — a fenti szkript még az első
        kirajzolás előtt továbbviszi —, de a keresőrobotnak és a szkript nélküli
        böngészőnek ez az egyetlen fogódzó. Mind a hét nyelvi változat innen
        elérhető egy hivatkozással, és van rendes H1 is.
      */}
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Blueway Trade Kft.</h1>
        <p className="text-ink-muted">Termékjelölési megoldások — válasszon nyelvet</p>
        <nav aria-label="Nyelvválasztó">
          <ul className="flex flex-wrap justify-center gap-3">
            {locales.map((l) => (
              <li key={l}>
                <Link
                  href={`/${l}`}
                  hrefLang={HREFLANG[l]}
                  className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-ink-muted"
                >
                  {NYELV_NEVE[l]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
