/**
 * A süti-hozzájárulás kezelő (public/js/blueway-cookie-consent.js) felülete.
 *
 * A szkript sima JS, a weblap TypeScript — a kettő között ez a fájl a szerződés.
 * Azért csak ezen keresztül nyúlunk a nyelvi sütihez, mert a hozzájárulás
 * ellenőrzése a szkript dolga: ő tudja, mit engedélyezett a látogató, és ő
 * törli a sütit, ha a hozzájárulást visszavonják.
 */
type ConsentCategory = 'necessary' | 'preferences' | 'thirdparty';

type ConsentApi = {
  allowed: (category: ConsentCategory) => boolean;
  setLangCookie: (lang: string) => boolean;
};

function api(): ConsentApi | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { BluewayConsent?: ConsentApi }).BluewayConsent;
}

/**
 * Megjegyzi a választott nyelvet — de csak ha a látogató a kényelmi sütiket
 * engedélyezte. Hozzájárulás nélkül nem történik semmi, és ez nem hiba: a
 * weblap ilyenkor is működik, csak a következő látogatásnál nem emlékszik.
 *
 * A visszatérési érték azt mondja meg, tényleg letettük-e a sütit — a hívónak
 * nem kell vele foglalkoznia, a naplózáshoz és a tesztekhez viszont hasznos.
 * Ha a hozzájárulás-kezelő szkript még nem töltődött be (a látogató a betöltés
 * első pillanatában vált nyelvet), a választás nem íródik ki; a következő
 * váltás már igen.
 */
export function rememberLang(lang: string): boolean {
  return api()?.setLangCookie(lang) ?? false;
}
