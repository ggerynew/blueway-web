import Link from 'next/link';
import { asset } from '@/lib/asset';
import { kepVerzio } from '@/lib/kep-verzio';

/**
 * Egyedi 404 — a statikus exportban 404.html-ként jelenik meg, amit a GitHub
 * Pages (és a legtöbb tárhely) automatikusan kiszolgál. Kétnyelvű, mert a
 * gyökér-layoutban nincs nyelvi kontextus.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(kepVerzio('/images/brand/blueway-logo-still.png'))}
        alt="Blueway Trade"
        className="h-12 w-auto"
      />
      <p className="mt-10 text-sm font-medium tracking-wide text-brand-700 uppercase">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
        Az oldal nem található
      </h1>
      <p className="mt-2 text-ink-muted">The page you are looking for cannot be found.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/hu"
          className="rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Vissza a főoldalra
        </Link>
        <Link
          href="/hu/termekek"
          className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium transition-colors hover:border-ink-muted"
        >
          Termékek
        </Link>
        <Link
          href="/en"
          className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium transition-colors hover:border-ink-muted"
        >
          English home
        </Link>
      </div>
    </div>
  );
}
