'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileField } from '@/components/file-field';
import { Honeypot } from '@/components/honeypot';
import { sendForm } from '@/lib/send-form';
import type { Dictionary, Locale } from '@/lib/i18n';
import { MAX_CSATOLMANY } from '@/lib/csatolmany';

type Labels = Dictionary['servicePage']['form'];


const mezoOsztaly =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const cimkeOsztaly = 'block text-sm font-medium text-ink';

function Mezo({
  id,
  label,
  required,
  placeholder,
  type = 'text',
}: {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={cimkeOsztaly}>
        {label}{' '}
        {required && (
          <span className="text-brand-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className={mezoOsztaly}
      />
    </div>
  );
}

export function ServiceRequestForm({
  labels,
  recipient,
  lang,
  honeypotLabel,
}: {
  labels: Labels;
  recipient: string;
  lang: Locale;
  /** A rejtett csapdamező felirata a lap nyelvén. */
  honeypotLabel: string;
}) {
  const [kuldes, setKuldes] = useState(false);

  async function kuld(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setKuldes(true);
    const form = e.currentTarget;
    const d = new FormData(form);
    const g = (k: string) => String(d.get(k) ?? '').trim();

    const csatolo = form.elements.namedItem('attachments') as HTMLInputElement | null;
    const files = Array.from(csatolo?.files ?? []);
    if (files.reduce((n, f) => n + f.size, 0) > MAX_CSATOLMANY) {
      toast.error(labels.attachTooLarge);
      setKuldes(false);
      return;
    }

    const modKulcs = g('mode');
    const mod =
      modKulcs === 'sendin'
        ? labels.modeSendIn
        : modKulcs === 'phone'
          ? labels.modePhone
          : labels.modeOnsite;

    const sorok = [
      `${labels.machine}: ${g('machine')}`,
      g('serial') ? `${labels.serial}: ${g('serial')}` : '',
      `${labels.modeLabel} ${mod}`,
      '',
      `${labels.fault}:`,
      g('fault'),
      '',
      '—',
      `${labels.name}: ${g('name')}`,
      `${labels.company}: ${g('company')}`,
      `${labels.email}: ${g('email')}`,
      g('phone') ? `${labels.phone}: ${g('phone')}` : '',
    ].filter(Boolean);

    try {
      const eredmeny = await sendForm({
        fields: {
          name: g('name'),
          company: g('company'),
          email: g('email'),
          phone: g('phone'),
          machine: g('machine'),
          serial: g('serial'),
          mode: mod,
          fault: g('fault'),
          _gotcha: g('_gotcha'),
        },
        subject: `${labels.subject} — ${g('machine')}`,
        bodyLines: sorok,
        recipient,
        files,
      });
      toast.success(eredmeny === 'sent' ? labels.sent : labels.success);
      form.reset();
    } catch {
      toast.error(labels.error);
    } finally {
      setKuldes(false);
    }
  }

  return (
    <form onSubmit={kuld} className="space-y-10">
      <Honeypot label={honeypotLabel} />

      <section>
        <h2 className="text-sm font-medium tracking-wide text-ink uppercase">
          {labels.contactTitle}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Mezo id="name" label={labels.name} required placeholder={labels.namePlaceholder} />
          <Mezo
            id="company"
            label={labels.company}
            required
            placeholder={labels.companyPlaceholder}
          />
          <Mezo
            id="email"
            label={labels.email}
            type="email"
            required
            placeholder={labels.emailPlaceholder}
          />
          <Mezo id="phone" label={labels.phone} type="tel" placeholder={labels.phonePlaceholder} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium tracking-wide text-ink uppercase">
          {labels.machineTitle}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Mezo
            id="machine"
            label={labels.machine}
            required
            placeholder={labels.machinePlaceholder}
          />
          <Mezo id="serial" label={labels.serial} placeholder={labels.serialPlaceholder} />
        </div>

        <div className="mt-4">
          <label htmlFor="fault" className={cimkeOsztaly}>
            {labels.fault}{' '}
            <span className="text-brand-600" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            id="fault"
            name="fault"
            rows={5}
            required
            placeholder={labels.faultPlaceholder}
            className={mezoOsztaly}
          />
        </div>

        <fieldset className="mt-6">
          <legend className={cimkeOsztaly}>{labels.modeLabel}</legend>
          <div className="mt-2 space-y-2">
            {(
              [
                ['onsite', labels.modeOnsite],
                ['sendin', labels.modeSendIn],
                ['phone', labels.modePhone],
              ] as const
            ).map(([ertek, felirat], i) => (
              <label key={ertek} className="flex items-center gap-2.5 text-sm text-ink-muted">
                <input type="radio" name="mode" value={ertek} defaultChecked={i === 0} />
                {felirat}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6">
          <FileField
            id="attachments"
            name="attachments"
            label={labels.attach}
            hint={labels.attachHint}
            lang={lang}
            accept="image/*,.pdf"
            tooLarge={labels.attachTooLarge}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={kuldes}
        className="rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {kuldes ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
