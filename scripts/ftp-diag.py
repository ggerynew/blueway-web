#!/usr/bin/env python3
"""Miért nem enged be az FTP-kiszolgáló?

Az lftp csak annyit mond, hogy "530 Login authentication failed" — abból nem
derül ki, hol romlik el. Ez a szkript magával a kiszolgálóval beszélget, és
minden választ kiír, hogy legyen mit összehasonlítani azzal, amit egy működő
kliens (net2ftp, TotalCommander) lát.

Semmilyen titkos adatot nem ír ki: a jelszó csak a PASS parancsban megy el, a
naplóba a kiszolgáló válasza kerül, nem a beküldött érték.

A kimenet alapján szétválasztható a négy lehetséges ok:

  * a bejelentkezés itt is elbukik  -> a hozzáférési adat vagy a kiszolgáló
    korlátozása a hibás, nem az lftp;
  * a bejelentkezés itt sikerül     -> az lftp hívásával van baj;
  * a kapcsolat létre sem jön       -> tűzfal vagy rossz kiszolgálónév;
  * csak a titkosított ág megy      -> a titkosítás kikapcsolása volt a hiba.
"""

import ftplib
import os
import socket
import sys
import time

HOST = os.environ.get('FTP_HOST', '').strip()
USER = os.environ.get('FTP_USER', '').strip()
PASSWORD = os.environ.get('FTP_PASSWORD', '')
WEB_ROOT = os.environ.get('WEB_ROOT', '').strip()
PORT = int(os.environ.get('FTP_PORT', '21'))
TIMEOUT = 25


def line(text=''):
    print(text, flush=True)


def describe_target():
    line('— a kiszolgáló —')
    if not HOST:
        line('nincs megadva kiszolgálónév')
        return
    try:
        name, aliases, addrs = socket.gethostbyname_ex(HOST)
        line('feloldott név: %s' % name)
        line('IP-cím(ek):    %s' % ', '.join(addrs))
    except OSError as exc:
        line('a nevet nem lehet feloldani: %s' % exc)


def attempt(label, secure):
    """Egy bejelentkezési kísérlet. True, ha sikerült."""
    line()
    line('— kísérlet: %s —' % label)
    ftp = ftplib.FTP_TLS() if secure else ftplib.FTP()
    try:
        ftp.connect(HOST, PORT, timeout=TIMEOUT)
    except OSError as exc:
        line('a kapcsolat nem jött létre: %s' % exc)
        return False

    line('köszönés: %s' % ftp.getwelcome())

    try:
        feat = ftp.sendcmd('FEAT')
        line('FEAT: %s' % ' | '.join(p.strip() for p in feat.splitlines()))
    except (ftplib.Error, OSError) as exc:
        line('FEAT nem támogatott: %s' % exc)

    if secure:
        try:
            ftp.auth()
            line('AUTH TLS: rendben')
        except (ftplib.Error, OSError) as exc:
            line('AUTH TLS elutasítva: %s' % exc)
            ftp.close()
            return False

    try:
        line('USER -> %s' % ftp.sendcmd('USER ' + USER))
    except ftplib.Error as exc:
        line('USER elutasítva: %s' % exc)
        ftp.close()
        return False

    started = time.monotonic()
    try:
        # A jelszó csak ide megy el; a naplóba a válasz kerül, nem a jelszó.
        answer = ftp.sendcmd('PASS ' + PASSWORD)
        line('PASS -> %s   (%.1f mp alatt)' % (answer, time.monotonic() - started))
    except ftplib.Error as exc:
        line('PASS elutasítva: %s   (%.1f mp alatt)' % (exc, time.monotonic() - started))
        line('   A kiszolgáló megkapta a felhasználónevet és a jelszót, és nem')
        line('   fogadta el. Ha ugyanezekkel az adatokkal egy asztali kliens')
        line('   belép, két magyarázat marad:')
        line('     1. a GitHub-titokba került jelszó mégsem azonos a beírttal')
        line('        (elgépelés, félbevágott beillesztés, ékezetes karakter);')
        line('     2. a fiókon IP-korlátozás van, és ez a gép nincs engedve —')
        line('        a futtató címe fentebb ki van írva.')
        line('   A válaszidő segít dönteni: a több másodperces késleltetés a')
        line('   sikertelen jelszóellenőrzés büntetése, tehát inkább az elsőre')
        line('   utal. Az azonnali elutasítás inkább a másodikra.')
        ftp.close()
        return False

    if secure:
        try:
            ftp.prot_p()
        except (ftplib.Error, OSError) as exc:
            line('PROT P nem ment: %s' % exc)

    line('BEJELENTKEZVE.')
    try:
        line('munkakönyvtár: %s' % ftp.pwd())
        line('itt található: %s' % ', '.join(sorted(ftp.nlst())[:20]))
    except (ftplib.Error, OSError) as exc:
        line('a könyvtár nem listázható: %s' % exc)

    if WEB_ROOT:
        try:
            ftp.cwd(WEB_ROOT)
            line('%s -> rendben, ez a webgyökér' % WEB_ROOT)
        except (ftplib.Error, OSError) as exc:
            line('%s -> nem elérhető: %s' % (WEB_ROOT, exc))

    try:
        ftp.quit()
    except (ftplib.Error, OSError):
        ftp.close()
    return True


def main():
    line('felhasználónév hossza: %d' % len(USER))
    line('jelszó hossza:         %d' % len(PASSWORD))
    describe_target()

    if not HOST or not USER:
        line('hiányzó adat — a kísérletek kimaradnak')
        return 1

    # Előbb a titkosított ág, mert ez a kívánatos. Ha az megy, a titkosítás
    # kikapcsolására nincs is szükség.
    secure_ok = attempt('titkosított (AUTH TLS)', secure=True)
    plain_ok = attempt('titkosítás nélkül', secure=False)

    line()
    line('— összegzés —')
    line('titkosítva:      %s' % ('sikerült' if secure_ok else 'nem sikerült'))
    line('titkosítás nélkül: %s' % ('sikerült' if plain_ok else 'nem sikerült'))
    return 0 if (secure_ok or plain_ok) else 1


if __name__ == '__main__':
    sys.exit(main())
