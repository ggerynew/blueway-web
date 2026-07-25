'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

export interface SearchItem {
  name: string;
  brand: string;
  /** Teljes (basePath-szel ellátott) kép-URL vagy üres string. */
  image: string;
  /** Nyelvesített termékoldal-útvonal. */
  href: string;
}

/** Ékezet- és kisbetű-független kereséshez normalizál. */
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Fejléc-kereső: gépelés közben legördülő listában, képekkel mutatja az
 * illeszkedő termékeket. A találatra kattintva a termék oldalára visz.
 */
export function ProductSearch({
  items,
  placeholder,
  noResults,
}: {
  items: SearchItem[];
  placeholder: string;
  noResults: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    const scored = items
      .map((item) => {
        const name = norm(item.name);
        const brand = norm(item.brand);
        let score = -1;
        if (name.startsWith(q)) score = 0;
        else if (name.includes(q)) score = 1;
        else if (`${brand} ${name}`.includes(q)) score = 2;
        return { item, score };
      })
      .filter((r) => r.score >= 0);
    scored.sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name));
    return scored.slice(0, 8).map((r) => r.item);
  }, [items, query]);

  // Kattintás a komponensen kívülre: lista bezárása
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (e.key === 'Escape') setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[Math.min(active, results.length - 1)];
      if (target) window.location.href = target.href;
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="9" cy="9" r="6" />
        <line x1="13.5" y1="13.5" x2="17.5" y2="17.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={query}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => query.trim() && setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-full border border-line bg-white py-2 pr-4 pl-9 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      {open && query.trim() && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-muted">{noResults}</p>
          ) : (
            <ul className="max-h-[min(60vh,420px)] overflow-y-auto py-1">
              {results.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                      i === active ? 'bg-surface' : ''
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          className="max-h-9 max-w-9 object-contain"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-ink-muted">
                          {item.name.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">{item.brand}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
