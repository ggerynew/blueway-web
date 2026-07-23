import { asset } from '@/lib/asset';

/**
 * Termékkép vagy — ha nincs valós fotó — egységes placeholder (fotó-ikon + név).
 * Az őt körülvevő aspect-arányos dobozt a hívó adja.
 */
export function ProductThumb({
  image,
  name,
  imgClassName,
}: {
  image?: string;
  name: string;
  imgClassName?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset(image)}
        alt={name}
        className={imgClassName ?? 'max-h-full max-w-full object-contain'}
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 px-3 text-center text-ink-muted">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <circle cx="8.5" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path
          d="M4 17l4.5-4.5 3.5 3.5 3.5-3.5L20 16.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
      <span className="text-xs font-medium">{name}</span>
    </div>
  );
}
