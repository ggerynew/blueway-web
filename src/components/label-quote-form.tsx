'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { sendForm } from '@/lib/send-form';
import { asset } from '@/lib/asset';
import type { Dictionary } from '@/lib/i18n';

type Labels = Dictionary['labelQuote'];

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const labelClass = 'block text-sm font-medium text-ink';

function Field({
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
      <label htmlFor={id} className={labelClass}>
        {label} {required && <span className="text-brand-600" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className={fieldClass}
      />
    </div>
  );
}

export function LabelQuoteForm({
  labels,
  recipient,
}: {
  labels: Labels;
  recipient: string;
}) {
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const d = new FormData(form);
    const g = (k: string) => String(d.get(k) ?? '').trim();

    const spec: [string, string][] = [
      [labels.width, g('width') && `${g('width')} mm`],
      [labels.height, g('height') && `${g('height')} mm`],
      [labels.material, g('material')],
      [labels.quantity, g('quantity')],
      [labels.cornerRadius, g('cornerRadius') && `${g('cornerRadius')} mm`],
      [labels.rollOuter, g('rollOuter') && `${g('rollOuter')} mm`],
      [labels.rollInner, g('rollInner') && `${g('rollInner')} mm`],
      [labels.winding, g('winding')],
      [labels.color, g('color')],
      [labels.ribbonQuality, g('ribbon')],
    ];

    const diagramUrl =
      (typeof window !== 'undefined' ? window.location.origin : '') +
      asset('/images/cimke-meretek.svg');

    const bodyLines = [
      labels.emailHeading,
      '',
      labels.specTitle,
      ...spec.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    ];
    if (g('notes')) bodyLines.push('', `${labels.notes}:`, g('notes'));
    bodyLines.push(
      '',
      '—',
      `${labels.name}: ${g('name')}`,
      `${labels.company}: ${g('company')}`,
      `${labels.email}: ${g('email')}`,
      `${labels.phone}: ${g('phone')}`,
      '',
      `${labels.diagramLink}: ${diagramUrl}`,
    );

    const subjectWho = g('company') || g('name') || g('email');
    const fields: Record<string, string> = {
      name: g('name'),
      company: g('company'),
      email: g('email'),
      phone: g('phone'),
      width: g('width'),
      height: g('height'),
      material: g('material'),
      quantity: g('quantity'),
      cornerRadius: g('cornerRadius'),
      rollOuter: g('rollOuter'),
      rollInner: g('rollInner'),
      winding: g('winding'),
      color: g('color'),
      ribbon: g('ribbon'),
      notes: g('notes'),
      diagram: diagramUrl,
    };

    try {
      const result = await sendForm({
        fields,
        subject: `${labels.title} — ${subjectWho}`,
        bodyLines,
        recipient,
      });
      toast.success(result === 'sent' ? labels.sent : labels.success);
      form.reset();
    } catch {
      toast.error(labels.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Kapcsolattartó */}
      <section>
        <h2 className="text-sm font-medium tracking-wide text-ink uppercase">
          {labels.contactTitle}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="name" label={labels.name} placeholder={labels.namePlaceholder} />
          <Field id="company" label={labels.company} placeholder={labels.companyPlaceholder} />
          <Field id="email" label={labels.email} type="email" required placeholder={labels.emailPlaceholder} />
          <Field id="phone" label={labels.phone} type="tel" placeholder={labels.phonePlaceholder} />
        </div>
      </section>

      {/* Címke specifikáció */}
      <section>
        <h2 className="text-sm font-medium tracking-wide text-ink uppercase">
          {labels.specTitle}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="width" label={labels.width} type="number" required placeholder="mm" />
          <Field id="height" label={labels.height} type="number" required placeholder="mm" />
          <div>
            <label htmlFor="material" className={labelClass}>
              {labels.material} <span className="text-brand-600" aria-hidden="true">*</span>
            </label>
            <select id="material" name="material" required defaultValue="" className={fieldClass}>
              <option value="" disabled>{labels.materialChoose}</option>
              <option value={labels.materialPaper}>{labels.materialPaper}</option>
              <option value={labels.materialPlastic}>{labels.materialPlastic}</option>
              <option value={labels.materialOther}>{labels.materialOther}</option>
            </select>
          </div>
          <Field id="quantity" label={labels.quantity} required placeholder={labels.quantityPlaceholder} />
        </div>
      </section>

      {/* További paraméterek (opcionális) */}
      <section>
        <h2 className="text-sm font-medium tracking-wide text-ink uppercase">
          {labels.optionalTitle}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="cornerRadius" label={labels.cornerRadius} type="number" placeholder="mm" />
          <Field id="color" label={labels.color} placeholder={labels.colorPlaceholder} />
          <Field id="rollOuter" label={labels.rollOuter} type="number" placeholder="mm" />
          <Field id="rollInner" label={labels.rollInner} type="number" placeholder="mm" />
          <div>
            <label htmlFor="winding" className={labelClass}>{labels.winding}</label>
            <select id="winding" name="winding" defaultValue="" className={fieldClass}>
              <option value="">{labels.windingChoose}</option>
              <option value={labels.windingInside}>{labels.windingInside}</option>
              <option value={labels.windingOutside}>{labels.windingOutside}</option>
            </select>
          </div>
          <div>
            <label htmlFor="ribbon" className={labelClass}>{labels.ribbonQuality}</label>
            <select id="ribbon" name="ribbon" defaultValue="" className={fieldClass}>
              <option value="">{labels.ribbonChoose}</option>
              <option value={labels.ribbonWax}>{labels.ribbonWax}</option>
              <option value={labels.ribbonWaxResin}>{labels.ribbonWaxResin}</option>
              <option value={labels.ribbonResin}>{labels.ribbonResin}</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="notes" className={labelClass}>{labels.notes}</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder={labels.notesPlaceholder}
            className={`${fieldClass} resize-y`}
          />
        </div>
      </section>

      <div>
        <p className="text-xs text-ink-muted">{labels.requiredNote}</p>
        <button
          type="submit"
          disabled={sending}
          className="mt-4 rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          {sending ? labels.sending : labels.submit}
        </button>
      </div>
    </form>
  );
}
