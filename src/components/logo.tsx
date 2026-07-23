import Link from 'next/link';
import { asset } from '@/lib/asset';
import type { Locale } from '@/lib/i18n';

/**
 * Blueway Trade logó: animált videó (forgó fogaskerekek), némítva, folyamatos
 * ismétléssel. Csökkentett mozgást kérő felhasználóknak (prefers-reduced-motion)
 * statikus képet mutatunk helyette (CSS váltja). A fehér háttér a világos
 * fejléchez `mix-blend-mode: multiply`-jal simul.
 */
export function Logo({
  lang,
  className,
  mediaClassName = 'h-10 w-auto',
}: {
  lang: Locale;
  className?: string;
  mediaClassName?: string;
}) {
  const still = asset('/images/brand/blueway-logo-still.png');
  return (
    <Link
      href={`/${lang}`}
      aria-label="Blueway Trade"
      className={`flex items-center ${className ?? ''}`}
    >
      <video
        className={`logo-media logo-video ${mediaClassName}`}
        width={1008}
        height={288}
        autoPlay
        loop
        muted
        playsInline
        poster={still}
        aria-hidden="true"
      >
        <source src={asset('/videos/blueway-logo.mp4')} type="video/mp4" />
      </video>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`logo-media logo-still ${mediaClassName}`}
        src={still}
        alt="Blueway Trade"
        width={504}
        height={144}
      />
    </Link>
  );
}
