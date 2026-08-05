import type { Dictionary, Locale } from '@/lib/i18n';

/**
 * Dun & Bradstreet tanúsítvány — élő, beágyazott változat.
 *
 * A képet a D&B szolgáltatja, és NAPONTA frissül: a weblap tehát mindig a
 * cég aktuális minősítését mutatja, nem egy befagyasztott képet. Ezért nem
 * saját fájlból jön, és ezért nem is állítunk konkrét minősítést a helyettesítő
 * szövegben (alt) — azt a kép maga mondja meg.
 */

/** A cégazonosító a D&B rendszerében — ez választja ki, kinek a tanúsítványa. */
const CID = '9664936';

/** A tanúsítványt magyarázó D&B oldal, amit a kép hivatkozása megnyit. */
const DNB_OLDAL = 'https://www.dnb.com/hu-hu/szolgaltatasok/tanusitvany.html';

/**
 * A kép nyelve. A D&B magyar, angol és német változatot ad; a többi nyelvhez az
 * angol megy, mert az áll a legközelebb ahhoz, amit egy nem magyar látogató el
 * tud olvasni. (A magyarázó szöveg viszont mindig az oldal nyelvén jelenik meg.)
 */
const KEP_NYELV: Record<Locale, 'hu' | 'en' | 'de'> = {
  hu: 'hu',
  de: 'de',
  en: 'en',
  it: 'en',
  es: 'en',
  ko: 'en',
  zh: 'en',
};

export function DnbCertificate({
  lang,
  dict,
  className,
  imgClassName,
}: {
  lang: Locale;
  dict: Dictionary;
  /** A hivatkozás (külső keret) osztályai — elhelyezés, méretkorlát. */
  className?: string;
  /** Magának a képnek az osztályai. */
  imgClassName?: string;
}) {
  const src =
    `https://certificate.hungary.dnb.com/getimage?cid=${CID}` +
    `&lang=${KEP_NYELV[lang]}&typ=l&bg=FFFFFF&fg=000000`;

  return (
    <a
      href={DNB_OLDAL}
      target="_blank"
      rel="noopener noreferrer"
      title={dict.ui.certificateTooltip}
      className={className}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={dict.ui.certificateAlt}
        // A méret CSAK a helyfoglalásra kell: e nélkül a kép nulla magasságról
        // ugrik a helyére, és arrébb löki alatta a láblécet.
        //
        // A két szám a D&B fekvő („typ=l") tanúsítványának valódi mérete, a
        // szolgáltatótól letöltött képről mérve. Torzítani nem tud: a CSS-ben
        // a magasság `h-auto`, tehát az attribútumok aránya csak a betöltés
        // PILLANATÁIG él — utána a kép saját aránya veszi át. Ha a D&B egyszer
        // más méretű képet ad, annak legfeljebb egy apró elmozdulás a
        // következménye, nem megnyúlt logó.
        width={2300}
        height={635}
        loading="lazy"
        decoding="async"
        className={imgClassName}
      />
    </a>
  );
}
