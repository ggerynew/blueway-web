/**
 * Űrlapküldés: ha be van állítva a NEXT_PUBLIC_FORMSPREE_ENDPOINT, akkor a
 * szerver (Formspree) küldi a levelet AJAX-szal; egyébként `mailto` fallback
 * (a látogató levelezője nyílik meg). Így statikus hostingon (GitHub Pages) is
 * működik, és a mailto mindig tartalék marad.
 */
export type SendResult = 'sent' | 'mailto';

export async function sendForm(opts: {
  /** Formspree mezők (kulcs → érték). */
  fields: Record<string, string>;
  /** E-mail tárgy. */
  subject: string;
  /** A `mailto` fallback törzse soronként. */
  bodyLines: string[];
  /** `mailto` címzett. */
  recipient: string;
  /** Csatolt fájlok — Formspree-n feltöltve; mailto esetén a levélhez kézzel kell mellékelni. */
  files?: File[];
}): Promise<SendResult> {
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
  const files = opts.files ?? [];

  if (endpoint) {
    const body = new FormData();
    for (const [k, v] of Object.entries(opts.fields)) {
      if (v) body.set(k, v);
    }
    body.set('_subject', opts.subject);
    files.forEach((f, i) => body.append(i === 0 ? 'upload' : `upload${i + 1}`, f, f.name));
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body,
    });
    if (!res.ok) throw new Error('Form send failed');
    return 'sent';
  }

  const mailto = `mailto:${opts.recipient}?subject=${encodeURIComponent(
    opts.subject,
  )}&body=${encodeURIComponent(opts.bodyLines.join('\n'))}`;
  window.location.href = mailto;
  return 'mailto';
}
