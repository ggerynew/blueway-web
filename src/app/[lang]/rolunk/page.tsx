import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DnbCertificate } from '@/components/dnb-certificate';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { graf, morzsa, nyelvKod, szervezetRef, weblapRef } from '@/lib/jsonld';
import { getCategory, products } from '@/lib/products';
import { SITE_URL, absUrl, pageMetadata } from '@/lib/site';

/**
 * A „Mit kínálunk” pontok célpontjai, a szótár offer tömbjével azonos
 * sorrendben.
 *
 * Miért itt, és nem a szótárban: a szövegek nyelvenként változnak, az
 * útvonalak nem. Nyolc nyelvre lemásolva csak eltévedni lehetne bennük —
 * egy elgépelt szlug hét nyelven jó maradna, a nyolcadikon 404-re vinne.
 */
const AJANLAT_CELOK = [
  'termekek/cimkenyomtatok',
  'termekek/lezer-gravirozok',
  'termekek/cimkek-es-festekszalagok',
  'termekek/szoftverek',
  'szolgaltatasok',
] as const;

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
    path: 'rolunk',
    title: dict.about.title,
    description: dict.about.lead,
  });
}

export default async function AboutPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const nyelv = lang; // isLocale után már Locale — a beágyazott függvény ezt látja
  const dict = getDictionary(lang);
  const { about } = dict;

  // AboutPage + a cégadatok — a keresők így a bemutatkozást is a céghez kötik.
  // A morzsa nem díszítés: a felső szintű szekciólapok közül eddig csak a
  // kapcsolat és a fogalomtár kapott BreadcrumbList-et, a többi nem — a
  // kétszintű lánc (Főoldal → szakasz) a keresőben is érvényes morzsa.
  const jsonLd = graf([{
    '@type': 'AboutPage',
    name: `${about.title} — Blueway Trade Kft.`,
    description: about.lead,
    url: absUrl(`${lang}/rolunk`),
    inLanguage: nyelvKod(lang),
    isPartOf: weblapRef(lang),
    mainEntity: szervezetRef,
  }, morzsa(lang, [{ name: about.title, path: 'rolunk' }])]);

  // A szótár és a hivatkozáslista együtt mozog. Ha valaki hatodik pontot ír
  // a „Mit kínálunk” listába, itt derül ki, a buildben — nem a látogatónál,
  // egy hivatkozás nélküli csempe képében.
  if (about.offer.length !== AJANLAT_CELOK.length) {
    throw new Error(
      `A „Mit kínálunk” ${about.offer.length} pontjához ${AJANLAT_CELOK.length} hivatkozás tartozik.`,
    );
  }

  /**
   * A hivatkozás felirata a CÉLPONTBÓL következik, nem külön szöveg — így
   * nem tud eltérni tőle (ugyanez a rend a GYIK-lapon). A kategóriáknál a
   * termékek száma a legbeszédesebb: megmondja, hogy nem egy általános
   * szöveg vár, hanem konkrét kínálat.
   */
  function celFelirata(ut: string): string {
    if (ut === 'szolgaltatasok') return dict.nav.services;
    const szlug = ut.match(/^termekek\/([a-z0-9-]+)$/)?.[1];
    const kategoria = szlug ? getCategory(szlug) : undefined;
    if (!kategoria) {
      throw new Error(`A „Mit kínálunk” pont ismeretlen célra mutat: ${ut}`);
    }
    const db = products.filter((p) => p.category === kategoria.slug).length;
    return db > 0 ? dict.products.productCount(db) : kategoria.name[nyelv];
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{about.title}</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{about.lead}</p>
      </Reveal>

      {/* Számok: alapítás, tapasztalat, minősítés, telephely */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {about.facts.map((fact, i) => (
          <Reveal key={fact.label} delay={0.12 + i * 0.05}>
            <div className="h-full rounded-2xl border border-line bg-white p-6">
              <p className="text-2xl font-semibold tracking-tight text-brand-700">{fact.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{fact.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          {about.intro.map((paragraph, i) => (
            <Reveal key={paragraph.slice(0, 24)} delay={i * 0.06}>
              <p className="text-lg leading-relaxed text-ink-muted">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="h-full rounded-2xl border border-line bg-surface p-8">
            <h2 className="text-xl font-semibold tracking-tight">{about.whyTitle}</h2>
            <div className="mt-4 space-y-4">
              {about.why.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Dun & Bradstreet tanúsítvány — kiemelt sáv, élő képként */}
      <Reveal delay={0.08}>
        <div className="mt-14 flex flex-col items-center gap-8 rounded-2xl border border-amber-300/70 bg-amber-50/60 p-8 md:flex-row md:p-10">
          <DnbCertificate
            lang={lang}
            dict={dict}
            className="block w-full max-w-[350px] shrink-0 rounded-xl bg-white p-3 shadow-sm"
            imgClassName="h-auto w-full border border-[#CCCCCC]"
          />
          <div>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              {about.certificateTitle}
            </h2>
            <p className="mt-2 max-w-xl text-ink-muted">{about.certificateBody}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <h2 className="mt-16 text-2xl font-semibold tracking-tight md:text-3xl">
          {about.offerTitle}
        </h2>
      </Reveal>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {about.offer.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05} className="h-full">
            <Link
              href={`/${lang}/${AJANLAT_CELOK[i]}`}
              className="group product-tile flex h-full flex-col p-6"
            >
              <span className="text-sm font-medium text-brand-700">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-semibold tracking-tight group-hover:text-brand-700">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-ink-muted">{item.body}</p>
              <p className="mt-5 text-sm font-medium text-brand-700">
                {celFelirata(AJANLAT_CELOK[i])}
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </p>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.05}>
        <div className="mt-14 flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{about.ctaTitle}</h2>
            <p className="mt-2 max-w-xl text-ink-muted">{about.ctaBody}</p>
          </div>
          <Link
            href={`/${lang}/kapcsolat`}
            className="shrink-0 rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            {about.ctaButton}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
