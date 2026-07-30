import type { Metadata } from 'next';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { locales } from '@/lib/i18n';
import { absUrl } from '@/lib/site';

/**
 * A gyökér csak átirányít egy nyelvi változatra. Kanonikusként a /hu-t adjuk
 * meg, különben a kereső két címen látná ugyanazt a főoldalt.
 */
export const metadata: Metadata = {
  alternates: { canonical: absUrl('hu') },
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
      <div className="flex min-h-screen items-center justify-center">
        <Link href="/hu" className="text-sm text-ink-muted">
          → blueway.hu
        </Link>
      </div>
    </>
  );
}
