import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { manufacturers, getProductsByBrand } from '@/lib/products';

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
  return { title: getDictionary(lang).manufacturers.title };
}

export default async function ManufacturersPage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {dict.manufacturers.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{dict.manufacturers.lead}</p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {manufacturers.map((m, i) => {
          const count = getProductsByBrand(m.brand).length;
          return (
            <Reveal key={m.slug} delay={i * 0.05}>
              <Link
                href={`/${lang}/gyartok/${m.slug}`}
                className="group product-tile flex h-full flex-col justify-between p-6"
              >
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-brand-700">
                    {m.name}
                  </h2>
                  <p className="mt-2 text-sm text-ink-muted">{m.description[lang]}</p>
                </div>
                <p className="mt-6 text-sm font-medium text-brand-700">
                  {dict.products.productCount(count)}
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
