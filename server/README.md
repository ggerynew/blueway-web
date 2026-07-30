# Saját űrlapküldő végpont (`send.php`)

A weblap statikus export: nincs mögötte szerver, ezért az űrlapok egy külső
végpontra POST-olnak. Jelenleg ez a Formspree. Ha a végleges tárhely (FORPSI)
tud PHP-t futtatni, a Formspree kiváltható ezzel a szkripttel — és akkor a
csatolmányokra sincs csomagkorlát, az adatok pedig nem mennek át harmadik félen.

A kliensoldalon nincs teendő: a `send.php` ugyanazt a szerződést teljesíti, mint
a Formspree (multipart POST be, JSON ki, a HTTP státusz dönt), csak a végpont
címét kell átállítani.

## Telepítés

1. Töltsd fel a `send.php`-t a weboldal gyökerébe (`https://<domain>/send.php`).
2. A fájl eleji `RECIPIENT` és `FROM` is `info@blueway.hu` — külön postafiók
   nem kell hozzá. Ha máshová szeretnéd a leveleket, a `RECIPIENT`-et írd át.
   A `FROM` **mindig a saját domainen lévő cím maradjon**: ha feladóként a
   látogató címét írnánk be, az SPF/DKIM ellenőrzés megbukna, és a levél a
   spam mappába kerülne. A látogató címe `Reply-To`-ként megy, tehát a Válasz
   gomb neki válaszol.
3. Építsd a weblapot a végpont címével:

   ```
   NEXT_PUBLIC_FORM_ENDPOINT=https://<domain>/send.php \
   NEXT_PUBLIC_BASE_PATH= \
   NEXT_PUBLIC_SITE_URL=https://<domain> \
   STATIC_EXPORT=1 npm run build
   ```

4. Küldj át egy próbaüzenetet az éles oldalról, és nézd meg, hogy megérkezik-e
   (a spam mappát is).

## Mit csinál

- csak `POST`-ot fogad;
- kötelező és érvényes e-mail cím, különben `422`;
- rejtett csapdamező (`_gotcha`): ha ki van töltve, csendben eldobja a küldést;
- IP-nként óránként 5 küldés, felette `429`;
- csatolmányok: csak a megengedett kiterjesztések, összesen legfeljebb 7 MB
  (ugyanaz a korlát, mint a böngészőben), MIME multipart levélbe csomagolva;
- minden fejlécbe kerülő értékből kiszedi a sortöréseket (header injection),
  az ékezetes tárgyat/nevet base64-gyel kódolja.

## Ha a tárhely nem tud PHP-t

Nincs teendő: hagyd a `NEXT_PUBLIC_FORM_ENDPOINT`-ot a Formspree címén.
Ha üresen marad, az űrlapok a látogató levelezőjét nyitják meg kész üzenettel —
ez a tartalék akkor is működik, ha a végpont hibát ad.
