'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileField, type FajlFeliratok } from '@/components/file-field';
import { Honeypot } from '@/components/honeypot';
import { sendForm } from '@/lib/send-form';
import type { Dictionary, Locale } from '@/lib/i18n';

type FormLabels = Dictionary['contact']['form'];

/**
 * A csatolmányok együttes felső határa. Ugyanaz az érték, mint a többi
 * űrlapon és a szerveroldali send.php-ban — mérésből, nem becslésből: 7 MB
 * fölött a tárhely levelezője némán eldobja a levelet (lásd file-field.tsx).
 */
const MAX_CSATOLMANY = 7 * 1024 * 1024;

export function ContactForm({
  labels,
  recipient,
  lang,
  honeypotLabel,
  fajlFeliratok,
}: {
  labels: FormLabels;
  recipient: string;
  /** A fájlmező feliratai és a méretkijelzés nyelve. */
  lang: Locale;
  /** A rejtett csapdamező felirata a lap nyelvén. */
  honeypotLabel: string;
  fajlFeliratok: FajlFeliratok;
}) {
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const company = String(data.get('company') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const subject = String(data.get('subject') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const _gotcha = String(data.get('_gotcha') ?? '').trim();

    const csatolo = form.elements.namedItem('attachments') as HTMLInputElement | null;
    const files = Array.from(csatolo?.files ?? []);
    if (files.reduce((n, f) => n + f.size, 0) > MAX_CSATOLMANY) {
      toast.error(labels.attachTooLarge);
      setSending(false);
      return;
    }

    const bodyLines = [
      message,
      '',
      '—',
      `${labels.name}: ${name}`,
      `${labels.email}: ${email}`,
      `${labels.company}: ${company}`,
      phone ? `${labels.phone}: ${phone}` : '',
      // A mailto-tartalék nem tud fájlt vinni, csak a nevüket — így a
      // látogató tudja, mit kell kézzel mellékelnie a megnyíló levélhez.
      files.length ? `${labels.attachBody}: ${files.map((f) => f.name).join(', ')}` : '',
    ].filter(Boolean);

    try {
      const result = await sendForm({
        fields: { name, email, company, phone, subject, message, _gotcha },
        subject: subject || `${labels.subject}: ${name}`,
        bodyLines,
        recipient,
        files,
      });
      toast.success(
        result === 'sent' ? labels.sent : files.length ? labels.attachMailto : labels.success,
      );
      form.reset();
    } catch {
      toast.error(labels.error);
    } finally {
      setSending(false);
    }
  }

  const fieldClass =
    'mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
  const labelClass = 'block text-sm font-medium text-ink';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
      <Honeypot label={honeypotLabel} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {labels.name} <span className="text-brand-600" aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder={labels.namePlaceholder}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {labels.email} <span className="text-brand-600" aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder={labels.emailPlaceholder}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelClass}>
            {labels.company}{' '}
            <span className="text-brand-600" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            placeholder={labels.companyPlaceholder}
            className={fieldClass}
          />
        </div>
        {/* A telefonszám nem kötelező — de ha megadják, sokszor egy hívás
            gyorsabban elintézi az ügyet, mint a levélváltás. */}
        <div>
          <label htmlFor="phone" className={labelClass}>
            {labels.phone}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder={labels.phonePlaceholder}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          {labels.subject} <span className="text-brand-600" aria-hidden="true">*</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder={labels.subjectPlaceholder}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          {labels.message} <span className="text-brand-600" aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder={labels.messagePlaceholder}
          className={`${fieldClass} resize-y`}
        />
      </div>

      <FileField
        feliratok={fajlFeliratok}
        id="attachments"
        name="attachments"
        label={labels.attach}
        hint={labels.attachHint}
        lang={lang}
        accept="image/*,.pdf"
        tooLarge={labels.attachTooLarge}
      />

      <p className="text-xs text-ink-muted">{labels.requiredNote}</p>

      <button
        type="submit"
        disabled={sending}
        className="rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {sending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
