import { Link } from '@/components/link';
import { CookieSettingsLink } from '@/components/cookie-settings-link';
import { DnbCertificate } from '@/components/dnb-certificate';
import { asset } from '@/lib/asset';
import type { Dictionary, Locale } from '@/lib/i18n';

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links = [
    { href: `/${lang}/termekek`, label: dict.nav.products },
    { href: `/${lang}/iparagak`, label: dict.nav.industries },
    { href: `/${lang}/gyartok`, label: dict.nav.manufacturers },
    { href: `/${lang}/szolgaltatasok`, label: dict.nav.services },
    { href: `/${lang}/tudastar`, label: dict.nav.knowledge },
    { href: `/${lang}/fogalomtar`, label: dict.nav.glossary },
    { href: `/${lang}/gyik`, label: dict.faq.title },
    { href: `/${lang}/cimke-ajanlatkero`, label: dict.nav.labelQuote },
    { href: `/${lang}/rolunk`, label: dict.nav.about },
    { href: `/${lang}/kapcsolat`, label: dict.nav.contact },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 text-sm text-ink-muted sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p className="font-medium text-ink">{dict.footer.company}</p>
          <p className="mt-2">{dict.footer.address}</p>
          <p>{dict.footer.billing}</p>
          <p className="mt-2">{dict.footer.taxNumber}</p>
          <p>{dict.footer.regNumber}</p>

          {/* Dun & Bradstreet tanúsítvány — minden oldal alján, élő képként */}
          <DnbCertificate
            lang={lang}
            dict={dict}
            // Rögzített szélesség, nem `w-fit`. A `w-fit` a betöltetlen képnél
            // nullára zsugorodik, a képnek pedig `w-full` a szélessége — így a
            // width/height attribútumokból számolt arány sem tud helyet
            // foglalni, és a jelvény érkezésekor arrébb ugrik a fél lábléc.
            // A 316 px = a kép 300 px-e + a p-2 kétszer 8 px-e, tehát a kész
            // lap ugyanúgy néz ki, mint eddig.
            className="mt-5 block w-full max-w-[316px] rounded-lg bg-white p-2"
            imgClassName="h-auto w-full max-w-[300px] border border-[#CCCCCC]"
          />
        </div>

        <nav className="flex flex-col gap-2" aria-label={dict.footer.company}>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              // A lábléc minden lapon látszik, tehát az előtöltése minden
              // lapon fut — mérve ~1,5 MB adatcsomag ment el olyan lapokra
              // (fogalomtár: 273 kB), amiket a látogató jó eséllyel meg sem
              // nyit. Kattintásra tölt, egy kis várakozásért cserébe.
              prefetch={false}
              className="w-fit transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={asset(dict.footer.termsHref)}
            className="w-fit transition-colors hover:text-ink"
          >
            {dict.footer.terms}
          </a>
          <a
            href={asset(dict.footer.privacyPolicyHref)}
            className="w-fit transition-colors hover:text-ink"
          >
            {dict.footer.privacyPolicy}
          </a>
          <CookieSettingsLink label={dict.footer.cookieSettings} />
        </nav>

        <div className="md:text-right">
          <p>
            <a href={`tel:${dict.footer.phone.replace(/\s/g, '')}`} className="hover:text-ink">
              {dict.footer.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${dict.footer.email}`} className="hover:text-ink">
              {dict.footer.email}
            </a>
          </p>
          {/* Az ajánlatkérő gomb a fejlécből került ide, az elérhetőségek alá. */}
          <Link
            href={`/${lang}/kapcsolat`}
            className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            {dict.nav.quote}
          </Link>

          {/* A cégoldal a Facebookon. Külső hivatkozás, ezért új lapon nyílik;
              a rel="noopener" nélkül a megnyíló oldal hozzáférne ehhez az
              ablakhoz. A felolvasó a szöveges címkét mondja, nem az ikont. */}
          <div className="mt-5 flex md:justify-end">
            <a
              href="https://www.facebook.com/share/1Bb1i3eHqk/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.footer.facebookLabel}
              title={dict.footer.facebookLabel}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-brand-700 hover:text-brand-700"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14 8.5V6.8c0-.7.5-.9.8-.9h2.1V3h-2.9C11.1 3 10.5 5 10.5 6.3v2.2H9V12h1.5v9H14v-9h2.4l.3-3.5H14Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-muted">
          © {new Date().getFullYear()} {dict.footer.company} {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
