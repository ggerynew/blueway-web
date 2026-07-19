'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n';

type FormLabels = Dictionary['contact']['form'];

export function ContactForm({
  labels,
  recipient,
}: {
  labels: FormLabels;
  recipient: string;
}) {
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const company = String(data.get('company') ?? '').trim();
    const subject = String(data.get('subject') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    const bodyLines = [
      message,
      '',
      '—',
      `${labels.name}: ${name}`,
      `${labels.email}: ${email}`,
      company ? `${labels.company}: ${company}` : '',
    ].filter(Boolean);

    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

    try {
      window.location.href = mailto;
      toast.success(labels.success);
      form.reset();
    } catch {
      toast.error(labels.error);
    } finally {
      setSending(false);
    }
  }

  const fieldClass =
    'mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
  const labelClass = 'block text-sm font-medium text-ink';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {labels.name} <span className="text-brand-600">*</span>
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
            {labels.email} <span className="text-brand-600">*</span>
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

      <div>
        <label htmlFor="company" className={labelClass}>
          {labels.company}
        </label>
        <input
          id="company"
          name="company"
          type="text"
          placeholder={labels.companyPlaceholder}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          {labels.subject} <span className="text-brand-600">*</span>
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
          {labels.message} <span className="text-brand-600">*</span>
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
