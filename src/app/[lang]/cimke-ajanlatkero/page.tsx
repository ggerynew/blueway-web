import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LabelQuoteForm } from '@/components/label-quote-form';
import { LegalNotice } from '@/components/legal-notice';
import { LabelDiagram } from '@/components/label-diagram';
import { Reveal } from '@/components/reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { graf, morzsa } from '@/lib/jsonld';
import { pageMetadata } from '@/lib/site';

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
  const dict = getDictionary(lang);
  return pageMetadata({
    lang,
    path: 'cimke-ajanlatkero',
    title: dict.labelQuote.title,
    description: dict.labelQuote.lead,
  });
}

export default async function LabelQuotePage({
  params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { labelQuote } = dict;

  // Ez a lap eddig semmilyen strukturált adatot nem adott. A morzsa a
  // legkisebb értelmes egység: a kereső ebből tudja, hogy a lap a
  // főoldal alatti szekció, és morzsa-rich-resultot is kaphat.
  const jsonLd = graf([morzsa(lang, [{ name: dict.labelQuote.title, path: 'cimke-ajanlatkero' }])]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <LabelQuoteForm
              fajlFeliratok={{
                fileChoose: dict.ui.fileChoose,
                fileRemove: dict.ui.fileRemove,
                fileTotal: dict.ui.fileTotal,
              }}
            labels={labelQuote}
            recipient={dict.contact.email}
            lang={lang}
            honeypotLabel={dict.ui.honeypot}
          />
          <LegalNotice lang={lang} />
        </div>
      </Reveal>
    </div>
  );
}
