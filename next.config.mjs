import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const isStaticExport = process.env.STATIC_EXPORT === '1';

/**
 * Az alkatrész-adatbázis tartalmi lenyomata.
 *
 * A böngésző futásidőben tölti le az alkatreszek.json-t, a címében pedig eddig
 * semmi nem árulta el, hogy megváltozott-e. A .htaccess a JSON-ra nem ír elő
 * lejáratot, tehát a böngésző a saját becslésére hagyatkozik — egy frissített
 * alkatrészlista így napokig nem ér el a visszatérő látogatóhoz.
 *
 * Ugyanaz a hiba, mint a képeknél, de a javítás nem lehet ugyanaz: a letöltést
 * kliensoldali kód végzi, ott nincs fájlrendszer. A lenyomat ezért itt, a
 * build konfigurációjában készül el, és környezeti változóként épül bele a
 * kliens csomagjába.
 */
const alkatreszLenyomat = createHash('sha256')
  .update(readFileSync(new URL('./public/alkatreszek.json', import.meta.url)))
  .digest('hex')
  .slice(0, 8);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Állandó build-azonosító.
  //
  // A Next.js alapból véletlen azonosítót sorsol minden buildhez, és azt
  // beleírja MINDEN oldalba: egyszer HTML-megjegyzésként a doctype után,
  // egyszer pedig a lapozás adatcsomagjába. Emiatt két, forrásban teljesen
  // azonos build kimenete mégis eltér — mérve: 1481 fájlból 1307 „változott",
  // 70 MB, holott a különbség mindössze ez a húsz karakter.
  //
  // A tárhelyre FTP-vel töltünk fel, ahol az idő nagyrészt a FÁJLOK SZÁMÁVAL
  // nő, nem a mérettel. Rögzített azonosítóval egy szokásos deploy annyi
  // fájlt visz át, amennyi tényleg megváltozott — egy szöveg javításánál
  // néhányat, nem ezerháromszázat.
  //
  // Mit veszítünk vele: az azonosító arra is szolgál, hogy a böngésző
  // észrevegye, ha közben új verzió került ki, és teljes újratöltéssel
  // váltson. Erre itt nincs szükség: a HTML-t a .htaccess minden kérésnél
  // újraellenőrizteti (max-age=0, must-revalidate), a JS-darabok neve pedig
  // tartalom szerinti lenyomatot tartalmaz, tehát egy megváltozott darab új
  // néven érkezik. Az azonosító mappájában csak a két útvonal-jegyzék lakik
  // (_buildManifest.js, _ssgManifest.js); ezeket a .htaccess szándékosan
  // kiveszi az „immutable" gyorsítótárazás alól, hogy egy útvonal
  // hozzáadása után ne ragadjon be a régi változat.
  generateBuildId: () => 'blueway',

  env: { NEXT_PUBLIC_ALKATRESZ_V: alkatreszLenyomat },

  ...(isStaticExport
    ? {
        output: 'export',
        basePath,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
