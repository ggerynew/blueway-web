import type { Metadata } from 'next';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { absUrl } from '@/lib/site';

/**
 * A gyökér csak átirányít a magyar változatra. Kanonikusként a /hu-t adjuk
 * meg, különben a kereső két címen látná ugyanazt a főoldalt.
 */
export const metadata: Metadata = {
  alternates: { canonical: absUrl('hu') },
};

export default function RootPage() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${asset('/hu')}`} />
      <div className="flex min-h-screen items-center justify-center">
        <Link href="/hu" className="text-sm text-ink-muted">
          → blueway.hu
        </Link>
      </div>
    </>
  );
}
