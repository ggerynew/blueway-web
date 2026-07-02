import Link from 'next/link';
import { asset } from '@/lib/asset';

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
