import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductMedia } from '@/components/product-media';
import { ProductThumb } from '@/components/product-thumb';
import { ProductInquiry } from '@/components/product-inquiry';
import { Reveal } from '@/components/reveal';
import { asset } from '@/lib/asset';
import { getDictionary, isLocale } from '@/lib/i18n';
import { getCategory, getProduct, getProductsByCategory, manufacturers, products } from '@/lib/products';

export function generateStaticParams() {
  return products.map((p) => ({ category: p.category, product: p.slug }));
}

export default async function ProductPage({
  params,
}: Readonly<{ params: Promise<{ lang: string; category: string; product: string }> }>) {
  const { lang, category, product: productSlug } = await params;
  if (!isLocale(lang)) notFound();
  const cat = getCategory(category);
  const product = getProduct(category, productSlug);
  if (!cat || !product) notFound();
  const dict = getDictionary(lang);
  const others = getProductsByCategory(cat.slug).filter((p) => p.slug !== product.slug);
  const brandManufacturer = manufacturers.find((m) => m.brand === product.brand);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <nav className="text-sm text-ink-muted">
          <Link href={`/${lang}/termekek`} className="transition-colors hover:text-ink">
            {dict.products.backToProducts}
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/${lang}/termekek/${cat.slug}`}
            className="transition-colors hover:text-ink"
          >
            {cat.name[lang]}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </Reveal>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal delay={0.05}>
          <ProductMedia
            name={product.name}
            image={product.image}
            videoId={product.videoId}
            model3d={product.model3d}
            model3dIsDemo={product.model3dIsDemo}
            labels={dict.products.media}
          />
        </Reveal>

        <Reveal delay={0.12}>
          <div>
            {brandManufacturer?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset(brandManufacturer.logo)}
                alt={product.brand}
                className={`w-auto object-contain ${
                  brandManufacturer.slug === 'cab' ? 'h-12' : 'h-8'
                }`}
              />
            ) : (
              <p className="text-sm font-medium tracking-wide text-brand-700 uppercase">
                {product.brand}
              </p>
            )}
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-lg text-ink-muted">{product.description[lang]}</p>

            <h2 className="mt-8 text-sm font-medium tracking-wide text-ink uppercase">
              {dict.products.featuresTitle}
            </h2>
            <ul className="mt-3 space-y-2">
              {product.features.map((f) => (
                <li key={f.hu} className="flex items-start gap-2 text-ink-muted">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {f[lang]}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3">
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
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <section id="ajanlatkeres" className="mt-20 scroll-mt-24 border-t border-line pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            {dict.products.inquiry.title}
          </h2>
          <p className="mt-2 max-w-xl text-ink-muted">{dict.products.inquiry.lead}</p>
          <div className="mt-6 rounded-2xl border border-line bg-white p-6 md:p-8">
            <ProductInquiry
              labels={dict.products.inquiry}
              recipient={dict.contact.email}
              productName={product.name}
            />
          </div>
        </section>
      </Reveal>

      {others.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-20 border-t border-line pt-10">
            <h2 className="text-lg font-semibold tracking-tight">
              {dict.products.otherProducts}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.slice(0, 4).map((p) => (
                <Link
                  key={p.slug}
                  href={`/${lang}/termekek/${cat.slug}/${p.slug}`}
                  className="group product-tile p-4"
                >
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-surface p-3">
                    <ProductThumb image={p.image} name={p.name} />
                  </div>
                  <p className="mt-3 text-sm font-medium group-hover:text-brand-700">
                    {p.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
