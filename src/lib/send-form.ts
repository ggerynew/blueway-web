/**
 * Űrlapküldés: ha be van állítva a NEXT_PUBLIC_FORM_ENDPOINT, akkor az küldi a
 * levelet AJAX-szal; egyébként `mailto` fallback (a látogató levelezője nyílik
 * meg). Így statikus hostingon (GitHub Pages) is működik, és a mailto mindig
 * tartalék marad.
 *
 * A végpont bármi lehet, ami multipart POST-ot fogad és 2xx-szel válaszol:
 * jelenleg Formspree, a költözés után a saját tárhelyen futó `server/send.php`.
 * A régi NEXT_PUBLIC_FORMSPREE_ENDPOINT nevet is elfogadjuk.
 */
export type SendResult = 'sent' | 'mailto';

function openMailto(opts: { subject: string; bodyLines: string[]; recipient: string }): SendResult {
  const mailto = `mailto:${opts.recipient}?subject=${encodeURIComponent(
    opts.subject,
  )}&body=${encodeURIComponent(opts.bodyLines.join('\n'))}`;
  window.location.href = mailto;
  return 'mailto';
}

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
  const endpoint =
    process.env.NEXT_PUBLIC_FORM_ENDPOINT || process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
  const files = opts.files ?? [];

  if (endpoint) {
    try {
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
      if (res.ok) return 'sent';
      // A Formspree elutasíthatja a küldést: elfogyott a havi keret, vagy a
      // csomag nem enged fájlfeltöltést. Ilyenkor is jusson el az érdeklődés.
      console.warn('Form endpoint rejected the submission:', res.status);
    } catch (err) {
      console.warn('Form endpoint unreachable:', err);
    }
  }

  return openMailto(opts);
}
