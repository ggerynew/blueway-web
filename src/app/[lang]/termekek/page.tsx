import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale } from '@/lib/i18n';
import { categories, getProductsByCategory } from '@/lib/products';

export default async function ProductsPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {dict.products.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-xl text-lg text-ink-muted">{dict.products.lead}</p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => {
          const count = getProductsByCategory(cat.slug).length;
          return (
            <Reveal key={cat.slug} delay={i * 0.05}>
              <Link
                href={`/${lang}/termekek/${cat.slug}`}
                className="group product-tile flex h-full flex-col justify-between p-6"
              >
                <div>
                  <h2 className="text-lg font-semibold tracking-tight group-hover:text-brand-700">
                    {cat.name[lang]}
                  </h2>
                  <p className="mt-2 text-sm text-ink-muted">{cat.description[lang]}</p>
                </div>
                <p className="mt-6 text-sm font-medium text-brand-700">
                  {count > 0 ? dict.products.productCount(count) : dict.products.browseCategory}
                  <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </p>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
