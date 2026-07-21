import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { ProductThumb } from '@/components/product-thumb';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { manufacturers, getManufacturer, getProductsByBrand } from '@/lib/products';

export function generateStaticParams() {
  return locales.flatMap((lang) => manufacturers.map((m) => ({ lang, brand: m.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; brand: string }>;
}): Promise<Metadata> {
  const { lang, brand } = await params;
  if (!isLocale(lang)) return {};
  const m = getManufacturer(brand);
  return { title: m ? m.name : getDictionary(lang).manufacturers.title };
}

export default async function ManufacturerPage({
  params,
}: Readonly<{ params: Promise<{ lang: string; brand: string }> }>) {
  const { lang, brand } = await params;
  if (!isLocale(lang)) notFound();
  const manufacturer = getManufacturer(brand);
  if (!manufacturer) notFound();
  const dict = getDictionary(lang);
  const items = getProductsByBrand(manufacturer.brand);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <Link
          href={`/${lang}/gyartok`}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← {dict.manufacturers.backToManufacturers}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
          {manufacturer.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          {manufacturer.description[lang]}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product, i) => (
          <Reveal key={product.slug} delay={(i % 3) * 0.05}>
            <Link
              href={`/${lang}/termekek/${product.category}/${product.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
            >
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-surface p-4">
                <ProductThumb
                  image={product.image}
                  name={product.name}
                  imgClassName="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <h2 className="mt-4 font-semibold tracking-tight group-hover:text-brand-700">
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">{product.short[lang]}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
