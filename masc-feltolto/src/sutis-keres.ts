/**
 * HTTP-kérés munkamenet-sütivel.
 *
 * A Node beépített `fetch`-e szándékosan NEM kezel sütit: minden kérés magában
 * áll. A MASC viszont munkamenetre épül — bejelentkezés után a szerver egy
 * sütit ad, és minden további kérésnek azt vissza kell küldenie, különben a
 * konnektor „errAccess"-szel felel. Ezért kell ez a kis sütistartó.
 *
 * Csak annyit tud, amennyi kell: eltárolja a `Set-Cookie` fejlécekből a
 * név=érték párokat, és minden kérésre visszaküldi őket. Lejárati időt,
 * tartomány- és útvonalszabályt nem néz — egyetlen kiszolgálóval beszélünk,
 * egyetlen futás erejéig, ott ezeknek nincs szerepük.
 */
import type { Naplo } from './naplo.js';

export class SutisKeres {
  private sutik = new Map<string, string>();
  private naplo: Naplo;
  /**
   * Hol kötöttünk ki a legutóbbi kérés után, az átirányításokat követve.
   *
   * A lépcsős belépéshez kell: a MASC portálra belépve a szerver átdob a
   * cégválasztó/második belépési lapra, és a következő lépés űrlapja ott van.
   * Enélkül a második lépés címét kézzel kellene kitalálni.
   */
  vegsoUrl = '';

  constructor(naplo: Naplo) {
    this.naplo = naplo;
  }

  /**
   * Kézzel megadott süti betöltése — ezt a böngészőből másolja ki a felhasználó.
   * Több süti pontosvesszővel elválasztva adható meg.
   */
  sutitBeallit(nyers: string): void {
    for (const darab of nyers.split(';')) {
      const sor = darab.trim();
      if (sor === '') continue;
      const hatar = sor.indexOf('=');
      if (hatar <= 0) continue;
      this.sutik.set(sor.slice(0, hatar).trim(), sor.slice(hatar + 1).trim());
    }
  }

  /** Van-e egyáltalán sütink? Bejelentkezés után ezt érdemes ellenőrizni. */
  vanSuti(): boolean {
    return this.sutik.size > 0;
  }

  /** A sütik nevei — a naplóba jó, az értékük nem kerül ki. */
  sutiNevek(): string[] {
    return [...this.sutik.keys()];
  }

  private sutiFejlec(): string {
    return [...this.sutik].map(([nev, ertek]) => `${nev}=${ertek}`).join('; ');
  }

  private sutikatEltarol(valasz: Response): void {
    // A getSetCookie() azért kell, mert több Set-Cookie fejléc is jöhet, és a
    // sima headers.get() ezeket vesszővel összefűzve adná vissza — a süti
    // értékében viszont lehet vessző, tehát a szétvágás elrontaná őket.
    const fejlecek = valasz.headers.getSetCookie?.() ?? [];
    for (const fejlec of fejlecek) {
      const elsoResz = fejlec.split(';')[0] ?? '';
      const hatar = elsoResz.indexOf('=');
      if (hatar <= 0) continue;
      const nev = elsoResz.slice(0, hatar).trim();
      const ertek = elsoResz.slice(hatar + 1).trim();
      if (ertek === '' || ertek === 'deleted') {
        this.sutik.delete(nev);
      } else {
        this.sutik.set(nev, ertek);
      }
    }
  }

  /**
   * Kérés a sütikkel; a válaszban kapott sütiket elteszi.
   *
   * Az átirányítást magunk követjük (`redirect: 'manual'`), mert a bejelentkezés
   * jellemzően 302-vel felel, ÉS ilyenkor adja a munkamenet-sütit. Ha a fetch-re
   * bíznánk a követést, a köztes válaszok sütijei elvesznének.
   */
  async keres(url: string, opciok: RequestInit = {}, maxAtiranyitas = 5): Promise<Response> {
    let jelenlegiUrl = url;

    for (let lepes = 0; lepes <= maxAtiranyitas; lepes++) {
      const fejlecek = new Headers(opciok.headers ?? {});
      if (this.sutik.size > 0) fejlecek.set('cookie', this.sutiFejlec());
      // Az elFinder ettől ad JSON-t; enélkül némelyik telepítés HTML-lapot küld.
      if (!fejlecek.has('x-requested-with')) {
        fejlecek.set('x-requested-with', 'XMLHttpRequest');
      }
      if (!fejlecek.has('user-agent')) {
        fejlecek.set('user-agent', 'blueway-masc-feltolto/1.0');
      }

      this.naplo.reszlet(`→ ${opciok.method ?? 'GET'} ${jelenlegiUrl}`);
      const valasz = await fetch(jelenlegiUrl, {
        ...opciok,
        headers: fejlecek,
        redirect: 'manual',
      });
      this.sutikatEltarol(valasz);
      this.naplo.reszlet(`← ${valasz.status} ${valasz.headers.get('content-type') ?? ''}`);

      const atiranyit = valasz.status >= 300 && valasz.status < 400;
      const cel = valasz.headers.get('location');
      if (!atiranyit || !cel) {
        this.vegsoUrl = jelenlegiUrl;
        return valasz;
      }

      if (lepes === maxAtiranyitas) {
        throw new Error(`Túl sok átirányítás (${maxAtiranyitas}) — utolsó cél: ${cel}`);
      }
      jelenlegiUrl = new URL(cel, jelenlegiUrl).toString();
      // Átirányítás után a POST-ból GET lesz, törzs nélkül — ez a böngészők
      // viselkedése 302-nél, és a bejelentkezés is erre számít.
      opciok = { method: 'GET' };
    }

    throw new Error('Az átirányítás követése váratlanul véget ért.');
  }
}
