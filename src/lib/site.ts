import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/i18n';

/**
 * Az oldal publikus alap-URL-je (basePath-szel együtt). FORPSI/egyedi domainre
 * költözéskor a NEXT_PUBLIC_SITE_URL környezeti változóval írható felül
 * (pl. https://www.blueway.hu), a basePath pedig üresre állítandó.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://ggerynew.github.io/blueway-web';

export const SITE_NAME = 'Blueway Trade Kft.';

/** Abszolút URL egy (nyelv nélküli) útvonalból, pl. absUrl('hu/termekek'). */
export function absUrl(path: string) {
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`;
}

/**
 * Egységes oldal-metaadatok: cím, leírás, canonical és hreflang alternatívák,
 * Open Graph / Twitter kártya. A `path` a nyelvi előtag NÉLKÜLI útvonal
 * (pl. 'termekek/cimkenyomtatok' vagy '' a főoldalhoz).
 */
export function pageMetadata({
  lang,
  path,
  title,
  description,
  image,
}: {
  lang: Locale;
  path: string;
  title: string;
  description: string;
  /** Abszolút vagy site-relatív OG-kép; alapértelmezés a brand OG-kép. */
  image?: string;
}): Metadata {
  const suffix = path ? `/${path.replace(/^\/+/, '')}` : '';
  const canonical = absUrl(`${lang}${suffix}`);
  const ogImage = image ?? absUrl('images/og.png');
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, absUrl(`${l}${suffix}`)])),
        'x-default': absUrl(`hu${suffix}`),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: lang === 'hu' ? 'hu_HU' : 'en_US',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
