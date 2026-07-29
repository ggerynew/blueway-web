<?php
/**
 * Űrlapküldő végpont saját PHP-tárhelyre (FORPSI).
 *
 * A weblap statikus export, saját szervere nincs — az űrlapok ezért egy
 * külső végpontra POST-olnak. Ez a szkript ugyanazt a szerződést teljesíti,
 * mint a Formspree: multipart/form-data POST érkezik, JSON válasz megy vissza,
 * a HTTP státusz dönt (2xx = elküldve). Így a kliensoldalon csak a végpont
 * címét kell átírni (NEXT_PUBLIC_FORM_ENDPOINT).
 *
 * Telepítés:
 *   1. Másold a weboldal gyökerébe (pl. /send.php).
 *   2. A RECIPIENT és a FROM is info@blueway.hu — más címre irányításhoz lent
 *      írd át. A FROM mindig a saját domainen lévő cím legyen (SPF/DKIM miatt);
 *      a látogató címe Reply-To-ba kerül, így a Válasz gomb neki válaszol.
 *   3. Másold mellé a `.user.ini`-t is: a PHP alapértelmezett feltöltési
 *      korlátja gyakran 2 MB, a weblap viszont 10 MB-ig enged csatolni.
 *   4. A build: NEXT_PUBLIC_FORM_ENDPOINT=https://<domain>/send.php
 *
 * Nem igényel Composer-t és külső könyvtárat: sima mail() hívás.
 */

declare(strict_types=1);

// ——— Beállítások ———————————————————————————————————————————————
const RECIPIENT      = 'info@blueway.hu';
const FROM           = 'info@blueway.hu';          // saját domain, SPF/DKIM alá
const FROM_NAME      = 'Blueway Trade weboldal';
const MAX_TOTAL_SIZE = 10 * 1024 * 1024;           // csatolmányok együtt, mint a kliensen
const RATE_LIMIT     = 5;                          // küldés / IP / óra
const ALLOWED_EXT    = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf', 'ai', 'eps', 'zip'];

// ——— Naplózás ——————————————————————————————————————————————————
/**
 * Rövid sor a send-errors.log fájlba, a szkript mellé.
 *
 * Miért kell: ha a küldés elakad, a látogató csak annyit lát, hogy a
 * levelezője nyílik meg — a weblap ilyenkor a tartalékra vált. Az ok
 * (memóriakorlát, túl nagy levél, a mail() visszautasítása) enélkül csak a
 * tárhely hibanaplójából derülne ki, ahhoz viszont nem mindig van hozzáférés.
 *
 * SZEMÉLYES ADAT NEM KERÜL BELE: se név, se e-mail cím, se üzenetszöveg, se
 * fájlnév — csak időpont, státusz, méretek és a hiba szövege. A .htaccess a
 * .log kiterjesztést amúgy sem szolgálja ki, tehát kívülről nem olvasható.
 */
function naploz(string $mit): void
{
    $sor = sprintf(
        "%s\t%s\tcsatolmany=%s\tlevel=%s\tcsucsmemoria=%s\tmemory_limit=%s\n",
        date('c'),
        $mit,
        number_format((float) ($GLOBALS['bw_meret'] ?? 0) / 1048576, 1) . 'MB',
        number_format((float) ($GLOBALS['bw_levelmeret'] ?? 0) / 1048576, 1) . 'MB',
        number_format(memory_get_peak_usage(true) / 1048576, 1) . 'MB',
        ini_get('memory_limit')
    );
    @file_put_contents(__DIR__ . '/send-errors.log', $sor, FILE_APPEND | LOCK_EX);
}

// Végzetes hiba (jellemzően memóriakorlát) esetén is maradjon nyoma, és a
// böngésző is értelmes választ kapjon a néma üres 500 helyett.
register_shutdown_function(static function (): void {
    $e = error_get_last();
    if ($e === null || !in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        return;
    }
    naploz('VEGZETES: ' . $e['message']);
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['ok' => false, 'error' => 'Server error while sending.'], JSON_UNESCAPED_UNICODE);
});

// ——— Segédek ———————————————————————————————————————————————————
function fail(int $status, string $message): void
{
    naploz($status . ': ' . $message);
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

/** Fejlécbe kerülő értékből minden sortörést kiszedünk (header injection ellen). */
function headerSafe(string $value): string
{
    return trim(str_replace(["\r", "\n", "\0"], ' ', $value));
}

/** UTF-8 fejléc kódolása, hogy az ékezetek ne törjenek el. */
function encodeHeader(string $value): string
{
    return '=?UTF-8?B?' . base64_encode(headerSafe($value)) . '?=';
}

/** php.ini méret („12M”, „8K”, „1G” vagy csupasz bájt) bájtra váltása. */
function iniBytes(string $value): int
{
    $value = trim($value);
    if ($value === '') {
        return 0;
    }
    $number = (int) $value;
    switch (strtoupper(substr($value, -1))) {
        case 'G':
            return $number * 1024 * 1024 * 1024;
        case 'M':
            return $number * 1024 * 1024;
        case 'K':
            return $number * 1024;
        default:
            return $number;
    }
}

// ——— Előellenőrzések ———————————————————————————————————————————
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    // A 405 mellé kiírjuk az érvényes PHP-korlátokat. Ezekből látszik, hogy a
    // .user.ini érvényesül-e: ha nem, a csatolmányos küldés a PHP alapértékein
    // akad el, még mielőtt ez a szkript bármit látna belőle. A három érték nem
    // titok, és semmilyen támadási felületet nem nyit.
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok'    => false,
        'error' => 'Method not allowed',
        'php'   => [
            'post_max_size'       => ini_get('post_max_size'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'memory_limit'        => ini_get('memory_limit'),
        ],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// A post_max_size túllépésekor a PHP üres $_POST-ot és $_FILES-t ad, hibaüzenet
// nélkül. Ezt külön kell elkapni, különben „hiányzó e-mail cím” lenne a válasz.
$postMaxBytes  = iniBytes((string) ini_get('post_max_size'));
$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($_POST === [] && $postMaxBytes > 0 && $contentLength > $postMaxBytes) {
    fail(413, 'The submission is larger than the server accepts.');
}

// Rejtett csapdamező: valódi látogató sosem tölti ki, a robotok igen.
// Csendben sikert jelentünk, hogy a küldő ne tudja meg, hogy kiszűrtük.
if (!empty($_POST['_gotcha'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

// Egyszerű, fájl alapú sebességkorlát IP-nként.
$ip     = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$bucket = sys_get_temp_dir() . '/bw-form-' . hash('sha256', $ip) . '.txt';
$hits   = is_readable($bucket) ? array_filter(
    array_map('intval', explode(',', (string) file_get_contents($bucket))),
    function (int $t): bool {
        return $t > time() - 3600;
    }
) : [];
if (count($hits) >= RATE_LIMIT) {
    fail(429, 'Too many submissions, please try again later.');
}
$hits[] = time();
@file_put_contents($bucket, implode(',', $hits), LOCK_EX);

// ——— Mezők ————————————————————————————————————————————————————
$email = headerSafe((string) ($_POST['email'] ?? ''));
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(422, 'A valid email address is required.');
}

$subject = headerSafe((string) ($_POST['_subject'] ?? 'Üzenet a weboldalról'));

$lines = [];
foreach ($_POST as $key => $value) {
    if ($key === '_subject' || $key === '_gotcha' || $key === '_probe' || !is_string($value) || trim($value) === '') {
        continue;
    }
    $lines[] = $key . ': ' . trim($value);
}
$lines[] = '';
$lines[] = '—';
$lines[] = 'Küldve: ' . date('Y-m-d H:i:s');
$lines[] = 'IP: ' . $ip;
$body = implode("\r\n", $lines);

// ——— Csatolmányok —————————————————————————————————————————————
$attachments = [];
$totalSize   = 0;
foreach ($_FILES as $file) {
    // A `multiple` mező tömbként érkezik, az egyedi mező skalárként.
    $names = is_array($file['name']) ? $file['name'] : [$file['name']];
    $tmps  = is_array($file['tmp_name']) ? $file['tmp_name'] : [$file['tmp_name']];
    $errs  = is_array($file['error']) ? $file['error'] : [$file['error']];

    foreach ($names as $i => $name) {
        if (($errs[$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file($tmps[$i])) {
            continue;
        }
        $ext = strtolower(pathinfo((string) $name, PATHINFO_EXTENSION));
        if (!in_array($ext, ALLOWED_EXT, true)) {
            fail(415, 'Unsupported file type: .' . $ext);
        }
        $totalSize += (int) filesize($tmps[$i]);
        $GLOBALS['bw_meret'] = $totalSize;
        if ($totalSize > MAX_TOTAL_SIZE) {
            fail(413, 'The attachments exceed 10 MB in total.');
        }
        // Rögtön kódolt alakban tároljuk, és a nyers tartalmat elengedjük.
        // Enélkül a csúcsmemória a fájl méretének öt-hatszorosa lenne (nyers
        // + base64 + tördelt másolat egyszerre), ami egy 8 MB-os képnél már
        // 40 MB fölött jár — osztott tárhelyen ez memóriakorlát-túllépéssel,
        // néma 500-as hibával végződhet.
        $nyers = (string) file_get_contents($tmps[$i]);
        $attachments[] = [
            // A fájlnévből csak a nevet tartjuk meg, útvonalat sosem.
            'name' => headerSafe(basename((string) $name)),
            'b64'  => chunk_split(base64_encode($nyers)),
        ];
        unset($nyers);
    }
}

// ——— Levél összeállítása ——————————————————————————————————————
$headers = [
    'From: ' . encodeHeader(FROM_NAME) . ' <' . FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'X-Mailer: blueway-web',
];

if ($attachments === []) {
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $message   = $body;
} else {
    $boundary  = 'bw' . bin2hex(random_bytes(16));
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

    $parts = [
        '--' . $boundary,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        '',
        $body,
    ];
    foreach ($attachments as $a) {
        $parts[] = '--' . $boundary;
        $parts[] = 'Content-Type: application/octet-stream; name="' . $a['name'] . '"';
        $parts[] = 'Content-Disposition: attachment; filename="' . $a['name'] . '"';
        $parts[] = 'Content-Transfer-Encoding: base64';
        $parts[] = '';
        $parts[] = $a['b64'];
    }
    $parts[]  = '--' . $boundary . '--';
    $message  = implode("\r\n", $parts);
}

$GLOBALS['bw_levelmeret'] = strlen($message);

// ——— Próbamód ——————————————————————————————————————————————————
// A `_probe` mezővel minden lefut — fájlbeolvasás, base64, a levél
// összeállítása —, csak a küldés marad el. Így megmérhető, hogy egy nagy
// csatolmány egyáltalán eljut-e a szkriptig és mekkora levél lesz belőle,
// anélkül hogy próbalevelek mennének a céges postafiókba. A rejtett
// csapdamezőhöz hasonlóan egy valódi látogató sosem küldi el.
if (!empty($_POST['_probe'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok'    => true,
        'probe' => [
            'csatolmany_db'   => count($attachments),
            'csatolmany_bajt' => $totalSize,
            'level_bajt'      => strlen($message),
            'csucsmemoria'    => memory_get_peak_usage(true),
            'post_max_size'   => ini_get('post_max_size'),
            'memory_limit'    => ini_get('memory_limit'),
        ],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$sent = mail(RECIPIENT, encodeHeader($subject), $message, implode("\r\n", $headers), '-f' . FROM);

if (!$sent) {
    fail(500, 'The message could not be sent.');
}

// A sikeres küldést is naplózzuk. Enélkül az „elküldve, de nem érkezett meg”
// eset megkülönböztethetetlen attól, hogy a szkript el sem indult: üres napló
// mindkettőnél. Így viszont látszik, hogy a mail() átvette-e a levelet, és
// mekkorát — ez dönti el, hogy a szkriptben vagy a levelezőrendszerben van a
// hiba. Személyes adat továbbra sem kerül bele.
naploz('OK csatolmanyok=' . count($attachments));

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
