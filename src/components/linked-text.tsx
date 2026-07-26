import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { manufacturers, products } from '@/lib/products';

/** Egy felismerhető hivatkozás: a szövegben keresett név és a céloldal útvonala. */
interface Alias {
  text: string;
  path: string;
}

/** Márkaelőtag a termék nevében — a rövid alak (pl. „XENO 4”) is legyen találat. */
const BRAND_PREFIXES = ['CAB ', 'POSTEK ', 'TYKMA ', 'START '];

const ALIASES: Alias[] = (() => {
  const list: Alias[] = [];
  const seen = new Set<string>();
  const add = (name: string, path: string) => {
    const key = name.toLowerCase();
    // A túl rövid alakok (pl. „OX”) félreérthetők lennének, azokat kihagyjuk.
    if (name.length < 3 || seen.has(key)) return;
    seen.add(key);
    list.push({ text: name, path });
  };

  for (const p of products) {
    const path = `/termekek/${p.category}/${p.slug}`;
    add(p.name, path);
    for (const prefix of BRAND_PREFIXES) {
      if (p.name.toUpperCase().startsWith(prefix)) add(p.name.slice(prefix.length), path);
    }
  }
  // Gyártónevek is hivatkozzanak — a márkanév (CAB) és a hivatalos írásmód (cab)
  // ugyanarra a gyártói oldalra mutat.
  for (const m of manufacturers) {
    const path = `/gyartok/${m.slug}`;
    add(m.name, path);
    add(m.brand, path);
  }

  // Hosszabb név előbb, hogy a „SQUIX 4 M” ne „SQUIX 4”-ként illeszkedjen, és
  // hogy a „CAB XENO 1” verje a puszta „cab” gyártónevet.
  return list.sort((a, b) => b.text.length - a.text.length);
})();

const ESCAPED = ALIASES.map((a) => a.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

// A gépnevek latin betűsek, ezért csak latin betű/szám tapadását zárjuk ki. A
// koreai és kínai ragok/írásjelek közvetlenül a névhez érnek — azokat engedjük.
const BOUNDARY = 'A-Za-z0-9\\u00C0-\\u024F';
const PATTERN = new RegExp(`(?<![${BOUNDARY}])(${ESCAPED.join('|')})(?![${BOUNDARY}])`, 'giu');
/** Ugyanaz, de a vizsgált pozícióhoz kötve — a szomszédos találat kiszűréséhez. */
const AT_START = new RegExp(`^(${ESCAPED.join('|')})(?![${BOUNDARY}])`, 'iu');

/**
 * Szöveg megjelenítése úgy, hogy az ismert gép- és gyártónevek a megfelelő
 * oldalra mutató linkké válnak. Szövegrészenként célonként csak az első
 * előfordulást linkeljük, hogy a bekezdés ne teljen meg ismétlődő
 * hivatkozásokkal.
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
    // „cab cablabel S3”: a gyártónevet ne linkeljük, ha rögtön utána egy másik
    // név kezdődik — két egymás melletti link egyetlen aláhúzásnak látszana.
    const rest = text.slice(m.index + matched.length);
    if (AT_START.test(rest.replace(/^ /, ''))) continue;
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
