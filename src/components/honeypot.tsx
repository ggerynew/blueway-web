/**
 * Rejtett csapdamező. Valódi látogató nem látja és nem tabbal rá, a
 * lapot végigolvasó spamrobotok viszont kitöltik — a Formspree és a saját
 * `server/send.php` is eldobja a küldést, ha ez a mező nem üres.
 *
 * A felirat a lap nyelvén szól. Nem a robot miatt: azt nem érdekli a nyelv.
 * Azért, mert a kimenetben ott áll, és egy magyar mondat egy angol lapon
 * akkor is oda nem illő, ha senki nem látja.
 */
export function Honeypot({ label }: { label: string }) {
  return (
    <div className="sr-only" aria-hidden="true">
      <label htmlFor="_gotcha">{label}</label>
      <input id="_gotcha" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
