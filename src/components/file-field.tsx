'use client';

import { useEffect, useRef, useState } from 'react';
import { getDictionary, type Locale } from '@/lib/i18n';
import { MAX_CSATOLMANY } from '@/lib/csatolmany';



/** „1,4 MB” — a nyelv szerinti tizedesjellel. */
function meret(bajt: number, lang: string): string {
  const mb = bajt / (1024 * 1024);
  if (mb >= 1) return `${mb.toLocaleString(lang, { maximumFractionDigits: 1 })} MB`;
  const kb = bajt / 1024;
  return `${kb.toLocaleString(lang, { maximumFractionDigits: 0 })} kB`;
}

/**
 * Fájlcsatoló mező saját, lefordított gombbal és a kiválasztott fájlok
 * listájával.
 *
 * A böngésző natív `<input type="file">` gombja mindig a böngésző nyelvén
 * jelenik meg (magyar Chrome-ban „Fájlok kiválasztása” akkor is, ha az oldal
 * olasz), ezért az inputot elrejtjük, és helyette saját gombot rajzolunk.
 *
 * A fájlokat itt tartjuk számon, és a `DataTransfer`-en keresztül írjuk vissza
 * az inputba. Enélkül egyetlen fájl sem volna eltávolítható: a `FileList` csak
 * olvasható, tehát a látogató a méretkorlát átlépése után nem tudna mit tenni
 * azon kívül, hogy elölről kezdi a kiválasztást.
 */
export function FileField({
  id,
  name,
  label,
  hint,
  lang,
  accept,
  tooLarge,
}: {
  id: string;
  name: string;
  label: string;
  hint: string;
  lang: Locale;
  accept: string;
  /** A méretkorlát átlépésekor megjelenő üzenet (az űrlap szótárából). */
  tooLarge?: string;
}) {
  const t = getDictionary(lang).ui;
  const inputRef = useRef<HTMLInputElement>(null);
  const [fajlok, setFajlok] = useState<File[]>([]);

  // A kijelzett listát visszaírjuk az inputba, mert a küldés azt olvassa.
  const szinkron = (lista: File[]) => {
    setFajlok(lista);
    const input = inputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    lista.forEach((f) => dt.items.add(f));
    input.files = dt.files;
  };

  // Az űrlap reset()-je kiüríti az inputot — a kijelzést is követni kell.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => setFajlok([]);
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, []);

  // Az újabb választás HOZZÁAD a listához, nem lecseréli: aki két lépésben
  // csatol, ne veszítse el az elsőt. Az azonos nevű és méretű fájl kimarad.
  const hozzaad = (ujak: File[]) => {
    const kulcs = (f: File) => `${f.name}:${f.size}`;
    const meglevo = new Set(fajlok.map(kulcs));
    szinkron([...fajlok, ...ujak.filter((f) => !meglevo.has(kulcs(f)))]);
  };

  const ossz = fajlok.reduce((n, f) => n + f.size, 0);
  const tulNagy = ossz > MAX_CSATOLMANY;

  return (
    <div>
      <span className="block text-sm font-medium text-ink">{label}</span>
      {/* A gomb másodlagos (fehér, keretes): az űrlap egyetlen kék gombja a
          küldés maradjon. Mellette rögtön a tudnivaló áll — külön „nincs
          kiválasztott fájl” sorra nincs szükség, a fájllista úgyis megjelenik. */}
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
        >
          {t.fileChoose}
        </button>
        <span className="text-xs text-ink-muted">{hint}</span>
      </div>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        multiple
        accept={accept}
        aria-label={label}
        className="sr-only"
        onChange={(e) => {
          const ujak = Array.from(e.target.files ?? []);
          // ELŐBB ürítjük a mezőt, és csak UTÁNA írjuk vissza a teljes
          // listát (a hozzaad → szinkron teszi meg). Az ürítés azért kell,
          // hogy ugyanaz a fájl újra kiválasztható legyen: nélküle a
          // böngésző nem küldene change eseményt, mert az érték nem
          // változott.
          //
          // A sorrend nem stílus kérdése. Fordítva — előbb visszaírni,
          // aztán üríteni — az ürítés a most beállított listát is elvitte:
          // a felületen ott állt a kiválasztott fájl, a mezőben viszont nem
          // volt semmi, és a küldés ezt a mezőt olvassa. A csatolmány így
          // sosem ért el a levélig.
          e.target.value = '';
          hozzaad(ujak);
        }}
      />

      {fajlok.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {fajlok.map((f) => (
            <li
              key={`${f.name}:${f.size}`}
              className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-xs"
            >
              <span className="min-w-0 flex-1 truncate text-ink" title={f.name}>
                {f.name}
              </span>
              <span className="shrink-0 tabular-nums text-ink-muted">{meret(f.size, lang)}</span>
              <button
                type="button"
                onClick={() => szinkron(fajlok.filter((x) => x !== f))}
                aria-label={`${t.fileRemove} — ${f.name}`}
                title={t.fileRemove}
                className="shrink-0 rounded-full p-1 leading-none text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {fajlok.length > 0 && (
        <p className={`mt-1.5 text-xs ${tulNagy ? 'font-medium text-red-600' : 'text-ink-muted'}`}>
          {t.fileTotal(meret(ossz, lang))}
          {tulNagy && tooLarge ? ` — ${tooLarge}` : null}
        </p>
      )}
    </div>
  );
}
