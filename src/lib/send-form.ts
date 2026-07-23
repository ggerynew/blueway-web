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
}): Promise<SendResult> {
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  if (endpoint) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(opts.fields)) {
      if (v) params.set(k, v);
    }
    params.set('_subject', opts.subject);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: params,
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
