import { asset } from '@/lib/asset';
import type { Locale } from '@/lib/i18n';

/**
 * Az űrlapok alatti jogi tájékoztató sor (ÁSZF 2.4. pont szerinti elfogadási
 * rend): az ajánlatkérés elküldése az ÁSZF elfogadásának minősül — a linkeknek
 * mindig elérhetőnek kell lenniük.
 */
export function LegalNotice({ lang }: { lang: Locale }) {
  const linkClass = 'underline transition-colors hover:text-ink';
  const aszf = (
    <a
      href={asset('/altalanos-szerzodesi-feltetelek.html')}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      ÁSZF
    </a>
  );
  const privacy = (
    <a
      href={asset(lang === 'hu' ? '/adatkezelesi-tajekoztato.html' : '/privacy-policy.html')}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {lang === 'hu' ? 'Adatkezelési tájékoztatót' : 'Privacy Policy'}
    </a>
  );

  return (
    <p className="mt-4 text-xs text-ink-muted">
      {lang === 'hu' ? (
        <>Az ajánlatkérés elküldésével elfogadom az {aszf}-et és megismertem az {privacy}.</>
      ) : (
        <>
          By sending the inquiry I accept the General Terms and Conditions ({aszf}, in Hungarian)
          and confirm that I have read the {privacy}.
        </>
      )}
    </p>
  );
}
