import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { ProductCard } from '@/components/product-card';
import { asset } from '@/lib/asset';
import { getDictionary, isLocale } from '@/lib/i18n';
import { categories, getCategory, getProductsByCategory, manufacturers } from '@/lib/products';

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

  // Gyártó szerinti csoportosítás (a manufacturers sorrendje szerint)
  const brandGroups = manufacturers
    .map((m) => ({ manufacturer: m, list: items.filter((p) => p.brand === m.brand) }))
    .filter((g) => g.list.length > 0);
  const multiBrand = brandGroups.length > 1;

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
      ) : multiBrand ? (
        <div className="mt-12 space-y-14">
          {brandGroups.map((group) => (
            <section key={group.manufacturer.slug}>
              <Reveal>
                <Link
                  href={`/${lang}/gyartok/${group.manufacturer.slug}`}
                  className="group inline-flex items-center gap-3 text-brand-700 transition-colors hover:text-brand-800"
                >
                  {group.manufacturer.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset(group.manufacturer.logo)}
                      alt={group.manufacturer.name}
                      className={`w-auto object-contain ${
                        group.manufacturer.slug === 'cab'
                          ? 'max-h-24 max-w-[280px]'
                          : 'max-h-11 max-w-[180px]'
                      }`}
                    />
                  ) : (
                    <span className="text-sm font-medium tracking-wide uppercase">
                      {group.manufacturer.name}
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="text-xl transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </Reveal>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.list.map((product, i) => (
                  <ProductCard key={product.slug} product={product} lang={lang} delay={(i % 3) * 0.05} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cat.slug === 'cimkek-es-festekszalagok' && (
            <Reveal>
              <Link
                href={`/${lang}/cimke-ajanlatkero`}
                className="group product-tile flex h-full flex-col overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset('/images/products/cimkek.jpg')}
                    alt={dict.products.labelsTile.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-semibold tracking-tight group-hover:text-brand-700">
                    {dict.products.labelsTile.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {dict.products.labelsTile.text}
                  </p>
                </div>
              </Link>
            </Reveal>
          )}
          {items.map((product, i) => (
            <ProductCard key={product.slug} product={product} lang={lang} delay={(i % 3) * 0.05} />
          ))}
        </div>
      )}
    </div>
  );
}
