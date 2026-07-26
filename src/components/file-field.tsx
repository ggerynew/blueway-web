'use client';

import { useEffect, useRef, useState } from 'react';
import { getDictionary, type Locale } from '@/lib/i18n';

/**
 * Fájlcsatoló mező saját, lefordított gombbal. A böngésző natív
 * `<input type="file">` gombja mindig a böngésző nyelvén jelenik meg
 * (magyar Chrome-ban „Fájlok kiválasztása” akkor is, ha az oldal olasz),
 * ezért az inputot elrejtjük, és helyette saját gombot rajzolunk.
 */
export function FileField({
  id,
  name,
  label,
  hint,
  lang,
  accept,
}: {
  id: string;
  name: string;
  label: string;
  hint: string;
  lang: Locale;
  accept: string;
}) {
  const t = getDictionary(lang).ui;
  const inputRef = useRef<HTMLInputElement>(null);
  const [names, setNames] = useState<string[]>([]);

  // Az űrlap reset()-je kiüríti az inputot — a kijelzést is követni kell.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => setNames([]);
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, []);

  return (
    <div>
      <span className="block text-sm font-medium text-ink">{label}</span>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-brand-700 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-800"
        >
          {t.fileChoose}
        </button>
        <span className="text-xs text-ink-muted">
          {names.length === 0
            ? t.fileNone
            : names.length === 1
              ? names[0]
              : t.fileCount(names.length)}
        </span>
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
        onChange={(e) => setNames(Array.from(e.target.files ?? []).map((f) => f.name))}
      />
      <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}
