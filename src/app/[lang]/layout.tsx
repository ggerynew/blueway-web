import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getDictionary, isLocale, locales } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={lang} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer dict={dict} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
