/**
 * Rejtett csapdamező. Valódi látogató nem látja és nem tabbal rá, a
 * lapot végigolvasó spamrobotok viszont kitöltik — a Formspree és a saját
 * `server/send.php` is eldobja a küldést, ha ez a mező nem üres.
 */
export function Honeypot() {
  return (
    <div className="sr-only" aria-hidden="true">
      <label htmlFor="_gotcha">Ezt a mezőt hagyja üresen</label>
      <input id="_gotcha" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
