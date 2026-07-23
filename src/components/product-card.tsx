import Link from 'next/link';
import { Reveal } from '@/components/reveal';
import { ProductThumb } from '@/components/product-thumb';
import type { Locale } from '@/lib/i18n';
import type { Product } from '@/lib/products';

export function ProductCard({
  product,
  lang,
  delay = 0,
}: {
  product: Product;
  lang: Locale;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/${lang}/termekek/${product.category}/${product.slug}`}
        className="group product-tile flex h-full flex-col p-5"
      >
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-surface p-4">
          <ProductThumb
            image={product.image}
            name={product.name}
            imgClassName="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <h3 className="mt-4 font-semibold tracking-tight group-hover:text-brand-700">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-ink-muted">{product.short[lang]}</p>
      </Link>
    </Reveal>
  );
}
