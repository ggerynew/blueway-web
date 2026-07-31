import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LegalNotice } from '@/components/legal-notice';
import { ProductInquiry } from '@/components/product-inquiry';
import { Reveal } from '@/components/reveal';
import { asset } from '@/lib/asset';
import { ZoomableImage } from '@/components/zoomable-image';
import { getDictionary, isLocale } from '@/lib/i18n';
import { getApplicator, getBrandLogo, getCategory, products , productName } from '@/lib/products';
import type { Metadata } from 'next';
import { absUrl, pageMetadata } from '@/lib/site';

export function generateStaticParams() {
  return products.flatMap((p) =>
    (p.applicators ?? []).map((a) => ({
      category: p.category,
      product: p.slug,
      applicator: a.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string; product: string; applicator: string }>;
}): Promise<Metadata> {
  const { lang, category, product: productSlug, applicator: applicatorSlug } = await params;
  if (!isLocale(lang)) return {};
  const found = getApplicator(category, productSlug, applicatorSlug);
  if (!found) return {};
  const { product, applicator } = found;
  return pageMetadata({
    lang,
    path: `termekek/${category}/${product.slug}/applikator/${applicator.slug}`,
    title: `${applicator.name[lang]} — ${productName(product, lang)}`,
    description: applicator.description[lang],
    image: applicator.image ? absUrl(applicator.image.replace(/^\//, '')) : undefined,
    // A műszaki paraméterek (címkeszélesség, löket, ciklusidő) pontosan azok,
    // amikre az applikátort keresik — a leírás ezekkel egészül ki, ha rövid.
    extra: (applicator.params ?? []).map((x) => `${x.label[lang]}: ${x.value[lang]}`),
  });
}

export default async function ApplicatorPage({
  params,
}: Readonly<{
  params: Promise<{ lang: string; category: string; product: string; applicator: string }>;
}>) {
  const { lang, category, product: productSlug, applicator: applicatorSlug } = await params;
  if (!isLocale(lang)) notFound();
  const cat = getCategory(category);
  const found = getApplicator(category, productSlug, applicatorSlug);
  if (!cat || !found) notFound();
  const { product, applicator } = found;
  const dict = getDictionary(lang);
  const brandLogo = product.brandLogo ?? getBrandLogo(product.brand);

  // Applikátor mint termék + morzsamenü a keresőknek
  const appUrl = absUrl(`${lang}/termekek/${category}/${product.slug}/applikator/${applicator.slug}`);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: `${applicator.name[lang]} — ${productName(product, lang)}`,
        description: applicator.description[lang],
        brand: { '@type': 'Brand', name: product.brand },
        isAccessoryOrSparePartFor: {
          '@type': 'Product',
          name: productName(product, lang),
          url: absUrl(`${lang}/termekek/${category}/${product.slug}`),
        },
        url: appUrl,
        ...(applicator.image ? { image: absUrl(applicator.image.replace(/^\//, '')) } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.products.title, item: absUrl(`${lang}/termekek`) },
          { '@type': 'ListItem', position: 2, name: cat.name[lang], item: absUrl(`${lang}/termekek/${cat.slug}`) },
          { '@type': 'ListItem', position: 3, name: productName(product, lang), item: absUrl(`${lang}/termekek/${category}/${product.slug}`) },
          { '@type': 'ListItem', position: 4, name: applicator.name[lang], item: appUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <nav className="text-sm text-ink-muted">
          <Link href={`/${lang}/termekek`} className="transition-colors hover:text-ink">
            {dict.products.backToProducts}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${lang}/termekek/${cat.slug}`} className="transition-colors hover:text-ink">
            {cat.name[lang]}
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/${lang}/termekek/${cat.slug}/${product.slug}`}
            className="transition-colors hover:text-ink"
          >
            {productName(product, lang)}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{applicator.name[lang]}</span>
        </nav>
      </Reveal>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal delay={0.05}>
          <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-white p-3">
            <ZoomableImage
              src={applicator.image}
              alt={applicator.name[lang]}
              nagyitasFelirat={dict.ui.imageZoom}
              bezarasFelirat={dict.ui.imageClose}
            />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div>
            {brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset(brandLogo)}
                alt={product.brand}
                className={`w-auto object-contain ${
                  product.brand === 'CAB' || product.brand === 'START International'
                    ? 'h-12'
                    : 'h-8'
                }`}
              />
            ) : (
              <p className="text-sm font-medium tracking-wide text-brand-700 uppercase">
                {product.brand} · {productName(product, lang)}
              </p>
            )}
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {applicator.name[lang]}
            </h1>
            <p className="mt-4 text-lg text-ink-muted">
              {(applicator.longDescription ?? applicator.description)[lang]}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#ajanlatkeres"
                className="inline-block rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
              >
                {dict.products.requestQuote}
              </a>
              {product.datasheet && (
                <a
                  href={asset(product.datasheet)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {dict.products.datasheet}
                </a>
              )}
              {applicator.videoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${applicator.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {dict.products.watchVideo}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      {applicator.params && applicator.params.length > 0 && (
        <Reveal delay={0.05}>
          <section className="mt-16 border-t border-line pt-10">
            <h2 className="text-xl font-semibold tracking-tight">
              {dict.products.applicatorParamsTitle}
            </h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
              <table className="w-full text-left text-sm">
                <tbody>
                  {applicator.params.map((p, i) => (
                    <tr key={p.label.hu} className={i % 2 === 1 ? 'bg-surface' : ''}>
                      <th className="w-1/2 px-5 py-3 font-medium text-ink align-top">
                        {p.label[lang]}
                      </th>
                      <td className="px-5 py-3 text-ink-muted">{p.value[lang]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.05}>
        <section id="ajanlatkeres" className="mt-16 scroll-mt-24 border-t border-line pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            {dict.products.inquiry.title}
          </h2>
          <p className="mt-2 max-w-xl text-ink-muted">{dict.products.inquiry.lead}</p>
          <div className="mt-6 rounded-2xl border border-line bg-white p-6 md:p-8">
            <ProductInquiry
              labels={dict.products.inquiry}
              recipient={dict.contact.email}
              productName={`${productName(product, lang)} — ${applicator.name[lang]}`}
              lang={lang}
            />
            <LegalNotice lang={lang} />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-12">
          <Link
            href={`/${lang}/termekek/${cat.slug}/${product.slug}`}
            className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
          >
            ← {dict.products.backToProduct}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
