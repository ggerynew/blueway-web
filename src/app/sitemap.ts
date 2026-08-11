import type { MetadataRoute } from 'next';
import { HREFLANG, locales } from '@/lib/i18n';
import { categories, manufacturers, products } from '@/lib/products';
import { guides } from '@/lib/knowledge';
import { industries } from '@/lib/iparagak';
import { absUrl } from '@/lib/site';

export const dynamic = 'force-static';

/** Teljes oldaltérkép mindkét nyelvre — a statikus exportba sitemap.xml-ként kerül. */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const add = (path: string, priority: number) => {
    for (const lang of locales) {
      const suffix = path ? `/${path}` : '';
      entries.push({
        url: absUrl(`${lang}${suffix}`),
        changeFrequency: 'weekly',
        priority,
        alternates: {
          // Az x-default is itt van, nem csak a lapok fejlécében. A Google a
          // hreflang-jelzések KONZISZTENCIÁJÁT kéri: ha a lap 9 bejegyzést
          // mond (8 nyelv + x-default), a sitemap pedig csak 8-at, a két
          // forrás nem ugyanazt a halmazt állítja, és a klaszterezés
          // kiszámíthatatlanabb. Az alapértelmezett a magyar — ez a cég
          // elsődleges piaca, és a lapok fejléce is ide mutat.
          languages: {
            ...Object.fromEntries(
              locales.map((l) => [HREFLANG[l], absUrl(`${l}${suffix}`)]),
            ),
            'x-default': absUrl(`hu${suffix}`),
          },
        },
      });
    }
  };

  add('', 1);
  add('termekek', 0.9);
  add('gyartok', 0.8);
  add('szolgaltatasok', 0.7);
  add('szolgaltatasok/szerviz', 0.8);
  add('iparagak', 0.8);
  add('tudastar', 0.7);
  add('fogalomtar', 0.7);
  add('gyik', 0.7);
  add('cimke-ajanlatkero', 0.8);
  add('rolunk', 0.6);
  add('kapcsolat', 0.7);
  for (const c of categories) add(`termekek/${c.slug}`, 0.8);
  for (const p of products) add(`termekek/${p.category}/${p.slug}`, 0.7);
  for (const p of products) {
    for (const a of p.applicators ?? []) {
      add(`termekek/${p.category}/${p.slug}/applikator/${a.slug}`, 0.5);
    }
  }
  for (const m of manufacturers) add(`gyartok/${m.slug}`, 0.7);
  for (const g of guides) add(`tudastar/${g.slug}`, 0.7);
  for (const i of industries) add(`iparagak/${i.slug}`, 0.8);

  // Statikus jogi oldalak (nem nyelvi útvonalon).
  //
  // Az adatkezelési tájékoztató és az angol párja a LAPJAIKON kölcsönös
  // hreflang-párban állnak (hu + en + x-default) — a sitemap ugyanazt
  // mondja, hogy a két jelzési forrás ne térjen el. Az ÁSZF-nek nincs
  // nyelvi párja, ott nincs mit jelezni.
  const jogiPar = {
    hu: absUrl('adatkezelesi-tajekoztato.html'),
    en: absUrl('privacy-policy.html'),
    'x-default': absUrl('adatkezelesi-tajekoztato.html'),
  };
  for (const f of ['adatkezelesi-tajekoztato.html', 'privacy-policy.html']) {
    entries.push({
      url: absUrl(f),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: { languages: jogiPar },
    });
  }
  entries.push({
    url: absUrl('altalanos-szerzodesi-feltetelek.html'),
    changeFrequency: 'yearly',
    priority: 0.3,
  });

  return entries;
}
