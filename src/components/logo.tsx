import { Link } from '@/components/link';
import { asset } from '@/lib/asset';
import { fajlLenyomat } from '@/lib/fajl-lenyomat';
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

/**
 * A logófájlok tartalmi lenyomata a cím végén.
 *
 * A .htaccess a képeket fél évre gyorsítótáraztatja, a logó pedig FIX néven
 * megy a public mappából — enélkül a visszatérő látogató hónapokig a régi
 * képet látná. (Épp ez történt a süti-szkripttel, lásd a fajlLenyomat
 * leírását: a javítás kint volt a szerveren, mégsem érvényesült.)
 */
const ANIM = 'images/brand/blueway-logo-anim.webp';
const ANIM_1X = 'images/brand/blueway-logo-anim-1x.webp';
const ALLO = 'images/brand/blueway-logo-still-atlatszo.png';
const ANIM_V = fajlLenyomat(ANIM);
const ANIM_1X_V = fajlLenyomat(ANIM_1X);
const ALLO_V = fajlLenyomat(ALLO);

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
        // Egyetlen <picture>, két külön <img> helyett. A különbség nem
        // stílus, hanem forgalom: a két img változatban MINDKÉT fájl
        // letöltődött minden látogatónak — az animált 922 kB-ja a
        // csökkentett mozgást kérőknek is, akiknél CSS rejtette el. A
        // <picture> a kiválasztást a betöltés ELÉ hozza: a böngésző csak a
        // média-feltételnek megfelelő forrást kéri le, és a beállítás
        // megváltozásakor magától átvált.
        <picture>
          {/* Két képpontsűrűség. A fejléc a logót 168×48 CSS-képponton mutatja;
              a 336-os fájl retina kijelzőre való, közönséges irodai monitoron
              viszont a böngésző a képpontok felét eldobja — 585 kB-ot töltve le
              260 kB-nyi információért. A sűrűségjelzős srcset megkérdezés
              nélkül eldönti: 1x kijelzőn a kisebb fájl jön le, 2x-en a nagyobb.
              A vessző a srcset elválasztója, ezért fontos, hogy a lenyomat
              (?v=…) hexadecimális — vessző soha nincs benne. */}
          <source
            media="(prefers-reduced-motion: no-preference)"
            srcSet={
              `${asset(`/${ANIM_1X}`)}?v=${ANIM_1X_V} 1x, ` +
              `${asset(`/${ANIM}`)}?v=${ANIM_V} 2x`
            }
            width={336}
            height={96}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={mediaClassName}
            src={`${asset(`/${ALLO}`)}?v=${ALLO_V}`}
            alt="Blueway Trade"
            width={504}
            height={144}
          />
        </picture>
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
