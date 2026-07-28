import Link from 'next/link';
import { CookieSettingsLink } from '@/components/cookie-settings-link';
import { asset } from '@/lib/asset';
import type { Dictionary, Locale } from '@/lib/i18n';

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links = [
    { href: `/${lang}/termekek`, label: dict.nav.products },
    { href: `/${lang}/gyartok`, label: dict.nav.manufacturers },
    { href: `/${lang}/szolgaltatasok`, label: dict.nav.services },
    { href: `/${lang}/tudastar`, label: dict.nav.knowledge },
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

          {/* Dun & Bradstreet (Bisnode) AAA tanúsítvány — minden oldal alján */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset('/images/brand/dnb-aaa-certificate.webp')}
            alt={dict.ui.certificateAlt}
            width={350}
            height={95}
            loading="lazy"
            decoding="async"
            className="mt-5 h-auto w-full max-w-[300px] rounded-lg bg-white p-2"
          />
        </div>

        <nav className="flex flex-col gap-2" aria-label={dict.footer.company}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="w-fit transition-colors hover:text-ink">
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
