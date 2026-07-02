import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { asset } from '@/lib/asset';
import { getDictionary, isLocale } from '@/lib/i18n';
import { categories, getCategory, getProductsByCategory } from '@/lib/products';

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
}: Readonly<{ params: Promise<{ lang: string; category: string }> }>) {
  const { lang, category } = await params;
  if (!isLocale(lang)) notFound();
  const cat = getCategory(category);
  if (!cat) notFound();
  const dict = getDictionary(lang);
  const items = getProductsByCategory(cat.slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <Link
          href={`/${lang}/termekek`}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← {dict.products.backToProducts}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
          {cat.name[lang]}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-muted">{cat.description[lang]}</p>
      </Reveal>

      {items.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="mt-12 rounded-2xl border border-line bg-white p-8">
            <p className="max-w-lg text-ink-muted">{dict.products.comingSoon}</p>
            <Link
              href={`/${lang}/kapcsolat`}
              className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              {dict.nav.quote}
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.05}>
              <Link
                href={`/${lang}/termekek/${cat.slug}/${product.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-surface p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(product.image)}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
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
      )}
    </div>
  );
}
