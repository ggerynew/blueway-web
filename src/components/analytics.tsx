'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    goatcounter?: {
      count?: (vars: { path?: string; title?: string; referrer?: string }) => void;
    };
  }
}

/**
 * A GoatCounter count.js csak a teljes oldalbetöltést számolja. Az oldal
 * next/link-kel navigál, ilyenkor nem tölt újra a dokumentum, ezért a
 * további oldalmegtekintéseket nekünk kell jelezni. Az első futást
 * kihagyjuk: azt már a count.js elküldte betöltéskor.
 */
export function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.goatcounter?.count?.({
      path: window.location.pathname + window.location.search,
      title: document.title,
    });
  }, [pathname]);

  return null;
}
