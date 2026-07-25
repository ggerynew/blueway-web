'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { sendForm } from '@/lib/send-form';
import type { Dictionary } from '@/lib/i18n';

type Labels = Dictionary['products']['inquiry'];

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const labelClass = 'block text-sm font-medium text-ink';

export function ProductInquiry({
  labels,
  recipient,
  productName,
}: {
  labels: Labels;
  recipient: string;
  productName: string;
}) {
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const d = new FormData(form);
    const g = (k: string) => String(d.get(k) ?? '').trim();

    const attachInput = form.elements.namedItem('attachments') as HTMLInputElement | null;
    const files = Array.from(attachInput?.files ?? []);
    if (files.reduce((n, f) => n + f.size, 0) > 10 * 1024 * 1024) {
      toast.error(labels.attachTooLarge);
      setSending(false);
      return;
    }

    const bodyLines = [
      `${labels.title} — ${productName}`,
      '',
      g('message'),
      '',
      '—',
      `${labels.name}: ${g('name')}`,
      `${labels.company}: ${g('company')}`,
      `${labels.email}: ${g('email')}`,
      g('phone') ? `${labels.phone}: ${g('phone')}` : '',
      files.length ? `${labels.attachBody}: ${files.map((f) => f.name).join(', ')}` : '',
    ].filter((l, i) => l !== '' || i > 0);

    try {
      const result = await sendForm({
        fields: {
          product: productName,
          name: g('name'),
          company: g('company'),
          email: g('email'),
          phone: g('phone'),
          message: g('message'),
        },
        subject: `${labels.title} — ${productName}`,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pi-name" className={labelClass}>
            {labels.name} <span className="text-brand-600" aria-hidden="true">*</span>
          </label>
          <input id="pi-name" name="name" type="text" required placeholder={labels.namePlaceholder} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="pi-company" className={labelClass}>
            {labels.company} <span className="text-brand-600" aria-hidden="true">*</span>
          </label>
          <input id="pi-company" name="company" type="text" required placeholder={labels.companyPlaceholder} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="pi-email" className={labelClass}>
            {labels.email} <span className="text-brand-600" aria-hidden="true">*</span>
          </label>
          <input id="pi-email" name="email" type="email" required placeholder={labels.emailPlaceholder} className={fieldClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pi-phone" className={labelClass}>{labels.phone}</label>
          <input id="pi-phone" name="phone" type="tel" placeholder={labels.phonePlaceholder} className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pi-message" className={labelClass}>{labels.message}</label>
          <input id="pi-message" name="message" type="text" placeholder={labels.messagePlaceholder} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="pi-attachments" className={labelClass}>{labels.attach}</label>
        <input
          id="pi-attachments"
          name="attachments"
          type="file"
          multiple
          accept="image/*,.pdf,.ai,.eps,.svg,.zip"
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink transition-colors file:mr-4 file:rounded-full file:border-0 file:bg-brand-700 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-brand-800"
        />
        <p className="mt-1.5 text-xs text-ink-muted">{labels.attachHint}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          {sending ? labels.sending : labels.submit}
        </button>
        <p className="text-xs text-ink-muted">{labels.requiredNote}</p>
      </div>
    </form>
  );
}
