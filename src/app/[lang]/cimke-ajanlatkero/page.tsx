import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LabelQuoteForm } from '@/components/label-quote-form';
import { LabelDiagram } from '@/components/label-diagram';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).labelQuote.title };
}

export default async function LabelQuotePage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { labelQuote } = dict;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {labelQuote.title}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-4 text-lg text-ink-muted">{labelQuote.lead}</p>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="mt-10">
          <LabelDiagram d={labelQuote.diagram} />
        </div>
      </Reveal>

      <Reveal delay={0.18}>
        <div className="mt-6 rounded-2xl border border-line bg-white p-6 md:p-8">
          <LabelQuoteForm labels={labelQuote} recipient={dict.contact.email} />
        </div>
      </Reveal>
    </div>
  );
}
