import Link from 'next/link';
import { asset } from '@/lib/asset';
import type { Locale } from '@/lib/i18n';

/**
 * Blueway Trade logó: animált (forgó fogaskerekek), folyamatos ismétléssel.
 * Csökkentett mozgást kérő felhasználóknak (prefers-reduced-motion) statikus
 * képet mutatunk helyette (CSS váltja).
 *
 * Két változat él egymás mellett, az ATLATSZO kapcsoló dönt:
 *  - true:  átlátszó hátterű animált WebP + átlátszó álló PNG. Nem kell hozzá
 *    keverési trükk, bármilyen háttéren jó.
 *  - false: a korábbi MP4 videó fehér háttérrel, amit a `.logo-media` osztály
 *    `mix-blend-mode: multiply`-ja simít a világos fejléchez. A fájlok
 *    (videos/blueway-logo.mp4, brand/blueway-logo-still.png) szándékosan a
 *    helyükön maradtak, hogy a kapcsoló átbillentésével vissza lehessen állni.
 */
const ATLATSZO = true;

export function Logo({
  lang,
  className,
  mediaClassName = 'h-10 w-auto',
}: {
  lang: Locale;
  className?: string;
  mediaClassName?: string;
}) {
  return (
    <Link
      href={`/${lang}`}
      aria-label="Blueway Trade"
      className={`flex items-center ${className ?? ''}`}
    >
      {ATLATSZO ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`logo-video ${mediaClassName}`}
            src={asset('/images/brand/blueway-logo-anim.webp')}
            alt=""
            aria-hidden="true"
            width={504}
            height={144}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`logo-still ${mediaClassName}`}
            src={asset('/images/brand/blueway-logo-still-atlatszo.png')}
            alt="Blueway Trade"
            width={504}
            height={144}
          />
        </>
      ) : (
        <>
          <video
            className={`logo-media logo-video ${mediaClassName}`}
            width={1008}
            height={288}
            autoPlay
            loop
            muted
            playsInline
            poster={asset('/images/brand/blueway-logo-still.png')}
            aria-hidden="true"
          >
            <source src={asset('/videos/blueway-logo.mp4')} type="video/mp4" />
          </video>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`logo-media logo-still ${mediaClassName}`}
            src={asset('/images/brand/blueway-logo-still.png')}
            alt="Blueway Trade"
            width={504}
            height={144}
          />
        </>
      )}
    </Link>
  );
}
