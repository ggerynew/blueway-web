import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { products } from '@/lib/products';

/** Egy felismerhető géphivatkozás: a szövegben keresett név és a termék útvonala. */
interface Alias {
  text: string;
  path: string;
}

/** Márkaelőtag a termék nevében — a rövid alak (pl. „XENO 4”) is legyen találat. */
const BRAND_PREFIXES = ['CAB ', 'POSTEK ', 'TYKMA ', 'START '];

const ALIASES: Alias[] = (() => {
  const list: Alias[] = [];
  const seen = new Set<string>();
  for (const p of products) {
    const path = `/termekek/${p.category}/${p.slug}`;
    const names = [p.name];
    for (const prefix of BRAND_PREFIXES) {
      if (p.name.toUpperCase().startsWith(prefix)) names.push(p.name.slice(prefix.length));
    }
    for (const n of names) {
      const key = n.toLowerCase();
      // A túl rövid alakok (pl. „OX”) félreérthetők lennének, azokat kihagyjuk.
      if (n.length < 3 || seen.has(key)) continue;
      seen.add(key);
      list.push({ text: n, path });
    }
  }
  // Hosszabb név előbb, hogy a „SQUIX 4 M” ne „SQUIX 4”-ként illeszkedjen.
  return list.sort((a, b) => b.text.length - a.text.length);
})();

// A gépnevek latin betűsek, ezért csak latin betű/szám tapadását zárjuk ki. A
// koreai és kínai ragok/írásjelek közvetlenül a névhez érnek — azokat engedjük.
const BOUNDARY = 'A-Za-z0-9\\u00C0-\\u024F';
const PATTERN = new RegExp(
  `(?<![${BOUNDARY}])(${ALIASES.map((a) => a.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![${BOUNDARY}])`,
  'giu',
);

/**
 * Szöveg megjelenítése úgy, hogy az ismert gépnevek a termékoldalra mutató
 * linkké válnak. Szövegrészenként csak az első előfordulást linkeljük, hogy a
 * bekezdés ne teljen meg ismétlődő hivatkozásokkal.
 */
export function LinkedText({ text, lang }: { text: string; lang: Locale }) {
  const parts: React.ReactNode[] = [];
  const linked = new Set<string>();
  let last = 0;
  let key = 0;

  PATTERN.lastIndex = 0;
  for (let m = PATTERN.exec(text); m !== null; m = PATTERN.exec(text)) {
    const matched = m[1];
    const alias = ALIASES.find((a) => a.text.toLowerCase() === matched.toLowerCase());
    if (!alias || linked.has(alias.path)) continue;
    linked.add(alias.path);
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link
        key={`l${key++}`}
        href={`/${lang}${alias.path}`}
        className="text-brand-700 underline underline-offset-2 transition-colors hover:text-brand-800"
      >
        {matched}
      </Link>,
    );
    last = m.index + matched.length;
  }
  if (last === 0) return <>{text}</>;
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
