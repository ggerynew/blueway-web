/**
 * Betöltő-horog, hogy a Node közvetlenül futtathassa a weblap TypeScript
 * adatfájljait (products.ts, knowledge.ts, i18n.ts) — build nélkül.
 *
 * Két dolgot old fel, amit a Node magától nem ért:
 *   - a „@/…" útvonal-rövidítést (a tsconfig paths beállítása, a src/-re mutat)
 *   - a kiterjesztés nélküli relatív importot („./i18n" → „./i18n.ts")
 *
 * A típusok levetkőztetését a --experimental-strip-types kapcsoló végzi;
 * ez a horog csak a feloldásról szól. Használat:
 *
 *   node --experimental-strip-types --import ./scripts/ts-betolto.mjs <szkript>
 */
import { register } from 'node:module';

register(new URL('./ts-betolto-horog.mjs', import.meta.url));
