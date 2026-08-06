import Link from 'next/link';
import { Reveal } from '@/components/reveal';
import { ProductThumb } from '@/components/product-thumb';
import type { Locale } from '@/lib/i18n';
import { productName, type Product } from '@/lib/products';

export function ProductCard({
  product,
  lang,
  delay = 0,
  headingLevel: Heading = 'h3',
  className,
}: {
  product: Product;
  lang: Locale;
  delay?: number;
  /** A kártyacím szintje: h2, ha közvetlenül a h1 alatt áll, egyébként h3. */
  headingLevel?: 'h2' | 'h3';
  /** A kártyát körülvevő doboz osztályai — ahol a kártya alá még szöveg kerül. */
  className?: string;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <Link
        href={`/${lang}/termekek/${product.category}/${product.slug}`}
        className="group product-tile flex h-full flex-col p-5"
      >
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-surface p-4">
          <ProductThumb
            image={product.image}
            name={productName(product, lang)}
            imgClassName="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <Heading className="mt-4 font-semibold tracking-tight group-hover:text-brand-700">
          {productName(product, lang)}
        </Heading>
        <p className="mt-1 text-sm text-ink-muted">{product.short[lang]}</p>
      </Link>
    </Reveal>
  );
}
