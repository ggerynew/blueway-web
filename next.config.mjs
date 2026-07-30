const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const isStaticExport = process.env.STATIC_EXPORT === '1';

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

  ...(isStaticExport
    ? {
        output: 'export',
        basePath,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
