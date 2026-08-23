'use client';

import { useEffect, useState } from 'react';

/**
 * A copyright-évszám — futásidőben, nem a build pillanatában.
 *
 * A lábléc kiszolgálói komponens, a weblap pedig statikus kivitel: a
 * `new Date().getFullYear()` ott a BUILD évét égette a HTML-be, mind a 909
 * lapon. Ha az év fordulója után nincs újabb telepítés, a lap alján a tavalyi
 * év áll — némán, minden nyelven.
 *
 * A megoldás egy apró kliens komponens. Az első megjelenítés a kiszolgálói
 * HTML-lel azonos (a build éve), és csak a betöltés UTÁN vált a látogató
 * órájának évére — így nincs hidratálási eltérés, és JavaScript nélkül is
 * értelmes érték látszik. A suppressHydrationWarning arra az egy-két hétre
 * kell, amikor a build még tavalyi, a látogató már idei: ott a szöveg
 * szándékosan tér el.
 */
export function Ev({ buildEv }: { buildEv: number }) {
  const [ev, setEv] = useState(buildEv);
  useEffect(() => {
    setEv(new Date().getFullYear());
  }, []);
  return <span suppressHydrationWarning>{ev}</span>;
}
