import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SITE_URL, absUrl } from '@/lib/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Blueway Trade Kft. — Termékjelölési megoldások',
    template: '%s | Blueway Trade Kft.',
  },
  description:
    'Címkenyomtatás, lézeres jelölés, alkatrészellátás és szerviz — a legegyszerűbb feladattól a nagyvállalati komplex rendszerekig.',
  openGraph: {
    siteName: 'Blueway Trade Kft.',
    type: 'website',
    images: [{ url: absUrl('images/og.png'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  // A `robots: { index: true, follow: true }` szándékosan nincs itt. Az
  // indexelés az alapértelmezés, tehát a címke a 889 rendes lapon semmit nem
  // mondott — a 404-en viszont ártott: a Next oda saját „noindex" címkét ír,
  // és a gyökérből érkező „index, follow" ellentmondott neki. Az ellentmondást
  // a keresők a szigorúbb javára oldják fel, tehát a lap eddig sem indexelődött,
  // de a nem létező címek lapja nem múlhat azon, ki hogyan old fel egy vitát.
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  );
}
