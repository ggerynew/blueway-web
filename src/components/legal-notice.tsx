import { asset } from '@/lib/asset';
import { getDictionary, type Locale } from '@/lib/i18n';

/**
 * Az űrlapok alatti jogi tájékoztató sor (ÁSZF 2.4. pont szerinti elfogadási
 * rend): az ajánlatkérés elküldése az ÁSZF elfogadásának minősül — a linkeknek
 * mindig elérhetőnek kell lenniük. A mondat a szótárból jön, a két link helyét
 * a {aszf} és {privacy} jelölő adja meg, mert a nyelvek szórendje eltér.
 */
export function LegalNotice({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).ui;
  const linkClass = 'underline transition-colors hover:text-ink';

  const links: Record<string, React.ReactNode> = {
    aszf: (
      <a
        key="aszf"
        href={asset('/altalanos-szerzodesi-feltetelek.html')}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {t.aszfLabel}
      </a>
    ),
    privacy: (
      <a
        key="privacy"
        href={asset(lang === 'hu' ? '/adatkezelesi-tajekoztato.html' : '/privacy-policy.html')}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {t.privacyLabel}
      </a>
    ),
  };

  const parts = t.legalNotice.split(/\{(aszf|privacy)\}/);

  return (
    <p className="mt-4 text-xs text-ink-muted">
      {parts.map((part, i) => (i % 2 === 1 ? links[part] : part))}
    </p>
  );
}
