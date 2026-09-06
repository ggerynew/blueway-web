<?php
/**
 * Ügynök-végpont: a weblap CSELEKVŐ rétege.
 *
 * MIÉRT VAN
 *   A weblapnak eddig egy OLVASÓ gépi rétege volt: llms.txt, llms-full.txt,
 *   ai/termekek.json, alkatreszek.json. Ezekből egy AI-ügynök megérti, mit
 *   árulunk — de nem tud KÉRDEZNI. Nem tudja megkeresni, melyik nyomtatófej
 *   való egy SQUIX 4-be, és nem tud ajánlatot kérni. Ez a végpont erről szól.
 *
 * KÉT AJTÓ, EGY LOGIKA
 *   POST + JSON-RPC → MCP (Model Context Protocol). Ezt beszélik az ügynök-
 *     csatlakozók: a felhasználó felveszi a végpontot, és onnantól a Claude
 *     vagy a ChatGPT eszközként hívja.
 *   GET + ?tool=…    → sima JSON. Ehhez nem kell protokoll és kézfogás: aki
 *     az llms.txt-ből megtudja a címet, egyetlen lekéréssel használhatja.
 *
 *   A kettő ugyanazt a négy eszközt adja. Azért mindkettő, mert a két út
 *   máshonnan érkezik: az MCP-hez a felhasználónak be kell kötnie minket, a
 *   GET-et viszont bármelyik keresésből érkező ügynök azonnal hívhatja.
 *
 * MIÉRT PHP, ÉS MIÉRT EGYETLEN FÁJL
 *   A weblap statikus kivitel, saját kiszolgálónk nincs. A tárhelyen PHP fut
 *   (ezt a send.php évek óta bizonyítja), külső könyvtár nélkül. Adatbázis
 *   sincs: az adat a már meglévő, minden építéskor frissülő JSON-fájlokból
 *   jön — tehát a válasz sosem avul el a weblaphoz képest.
 *
 * BIZTONSÁG
 *   Az olvasó eszközök csak a nyilvános JSON-fájlokat kérdezik le, semmit nem
 *   írnak. Az EGYETLEN író eszköz az ajánlatkérés, és az sem szabad
 *   levélküldő: a címzett bedrótozva a cég saját címe, a küldés IP-nként
 *   óránként korlátozott, és a levél tárgya megmondja, hogy ügynöktől jött —
 *   hogy a postafiókban elsőre látszódjon.
 */

declare(strict_types=1);

// ——— Beállítások ———————————————————————————————————————————————
const CIMZETT       = 'info@blueway.hu';
const FELADO        = 'info@blueway.hu';          // saját domain, SPF/DKIM alá
const FELADO_NEV    = 'Blueway Trade — ügynök-végpont';
const SEBESSEG      = 5;                          // ajánlatkérés / IP / óra
const TALALAT_MAX   = 50;                         // egy válaszban ennyi tétel
const WEBLAP        = 'https://blueway.hu';

/**
 * Az MCP protokollverziója.
 *
 * A kliens a kézfogáskor megmondja, melyiket beszéli. Mi ugyanazt válaszoljuk
 * vissza, ha értelmesnek látszik — ez a szokásos kompatibilitási minta, és
 * nálunk kockázat nélküli: a végpont viselkedése nem függ a verziótól, négy
 * egyszerű eszközt ad, semmi verzióspecifikus képességet.
 */
const MCP_VERZIO    = '2025-06-18';

// ——— Válaszadás ————————————————————————————————————————————————
/**
 * A CORS engedélyezése nem lazaság, hanem a lényeg.
 *
 * Az ügynökök jelentős része böngészőben fut, más eredetről. Enélkül a
 * böngésző eldobná a választ, és a végpont pont annak lenne használhatatlan,
 * akinek épült. Kockázat nincs: minden adat amúgy is nyilvános, és a
 * végpontnak nincs munkamenete vagy sütije, amit el lehetne lopni.
 */
function fejlecek(): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version');
    header('X-Robots-Tag: noindex');
}

function valasz(array $adat, int $statusz = 200): never
{
    http_response_code($statusz);
    echo json_encode($adat, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ——— Adatbetöltés ——————————————————————————————————————————————
/**
 * A JSON-fájlok a weblap gyökeréből jönnek — ugyanazok, amiket az AI-olvasók
 * is letöltenek. Egyetlen forrás: ha a weblap frissül, ez a végpont is.
 */
function adat(string $fajl): array
{
    static $gyorsito = [];
    if (isset($gyorsito[$fajl])) {
        return $gyorsito[$fajl];
    }
    $ut = __DIR__ . '/' . $fajl;
    if (!is_readable($ut)) {
        valasz(['error' => 'Az adatfájl nem érhető el: ' . $fajl], 500);
    }
    $tartalom = json_decode((string) file_get_contents($ut), true);
    if (!is_array($tartalom)) {
        valasz(['error' => 'Az adatfájl olvashatatlan: ' . $fajl], 500);
    }
    return $gyorsito[$fajl] = $tartalom;
}

/** Ékezet- és kisbetű-független összehasonlításhoz. */
function normal(string $s): string
{
    $s = mb_strtolower(trim($s), 'UTF-8');
    return strtr($s, [
        'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ö' => 'o', 'ő' => 'o',
        'ú' => 'u', 'ü' => 'u', 'ű' => 'u',
    ]);
}

function korlat(mixed $ertek, int $alap = 20): int
{
    $n = is_numeric($ertek) ? (int) $ertek : $alap;
    return max(1, min(TALALAT_MAX, $n));
}

/**
 * Magyar alkatrésznevek angol megfelelői.
 *
 * MIÉRT KELL: a gyári cab alkatrészlisták ANGOLUL vannak — „Printhead”,
 * „Roller”, „Sensor” —, a vevő és az őt kiszolgáló ügynök viszont magyarul
 * kérdez. Enélkül a „nyomtatófej” pontosan nulla találatot ad, holott 129
 * ilyen tétel van a listában. Ez nem elméleti hiba: mérve.
 *
 * A lista nem találgatás: a 2730 alkatrésznév leggyakoribb szavaiból
 * készült, azokra, amiket egy magyar kérdező tényleg használ.
 */
const SZOTAR = [
    'nyomtatofej' => 'printhead',
    'fej'         => 'printhead',
    'henger'      => 'roller',
    'gorgo'       => 'roller',
    'erzekelo'    => 'sensor',
    'szenzor'     => 'sensor',
    'kabel'       => 'cable',
    'lemez'       => 'plate',
    'burkolat'    => 'cover',
    'fedel'       => 'cover',
    'tengely'     => 'axle',
    'csavar'      => 'screw',
    'szij'        => 'belt',
    'rugo'        => 'spring',
    'motor'       => 'motor',
    'fogaskerek'  => 'gear',
    'szelep'      => 'valve',
    'kar'         => 'lever',
    'tarto'       => 'bracket',
    'alatet'      => 'washer',
    'cso'         => 'tube',
    'gyuru'       => 'ring',
    'vezeto'      => 'guide',
    'panel'       => 'pcb',
    'festekszalag' => 'ribbon',
    'szalag'      => 'ribbon',
    'agy'         => 'hub',
    'kes'         => 'knife',
    'penge'       => 'blade',
    'szuro'       => 'filter',
    'tapegyseg'   => 'supply',
    'kijelzo'     => 'display',
    'akku'        => 'battery',
    'csapagy'     => 'bearing',
];

/**
 * A keresőszó magyarul is, angolul is. Az eredetit MEGTARTJUK: a cikkszámot
 * és a részleges angol szavakat is meg kell találni.
 */
function keresoszavak(string $q): array
{
    $q = normal($q);
    if ($q === '') {
        return [];
    }
    $lista = [$q];
    foreach (SZOTAR as $hu => $en) {
        if (str_contains($q, $hu)) {
            $lista[] = $en;
        }
    }
    return array_values(array_unique($lista));
}

// ——— 1. eszköz: alkatrészkeresés ————————————————————————————————
/**
 * Ez a végpont legértékesebb szolgáltatása.
 *
 * 2730 alkatrész 48 géphez, a gyári cab-listákból. Ezt HTML-ből kikaparni
 * reménytelen, itt viszont egyetlen kérdés: „milyen nyomtatófej való a
 * SQUIX 4-be?" A gépet keresőkulcsok alapján azonosítjuk, mert a vevő
 * ritkán a katalógus pontos írásmódját használja.
 */
function alkatresz_kereses(array $p): array
{
    $a       = adat('alkatreszek.json');
    $gepSzo  = normal((string) ($p['gep'] ?? ''));
    $szavak  = keresoszavak((string) ($p['q'] ?? ''));
    $limit   = korlat($p['limit'] ?? null);

    // Melyik gépekre illik a megadott név?
    $gepIndexek = [];
    $gepNevek   = [];
    foreach ($a['gepek'] as $i => $g) {
        $gepNevek[$i] = $g['nev'] ?? (string) $i;
        if ($gepSzo === '') {
            continue;
        }
        $talalt = str_contains(normal((string) ($g['nev'] ?? '')), $gepSzo);
        foreach (($g['k'] ?? []) as $kulcs) {
            if (str_contains(normal((string) $kulcs), $gepSzo)) {
                $talalt = true;
            }
        }
        if ($talalt) {
            $gepIndexek[$i] = true;
        }
    }
    if ($gepSzo !== '' && $gepIndexek === []) {
        // A nemleges válasz mondja meg azt is, MIRE terjed ki a készlet.
        // Enélkül az ügynök nem tudja, hogy elgépelte-e a nevet, vagy olyat
        // kérdezett, amiről itt eleve nincs adat — a lézerek például nincsenek
        // benne, mert az index a cab nyomtató- és applikátor-alkatrészlistákból
        // készült.
        return [
            'talalat'  => 0,
            'uzenet'   => 'Erre a gépnévre nincs alkatrészadatunk. Ez az index a cab címkenyomtatók '
                . 'és applikátorok gyári alkatrészlistáiból készült — lézeres jelölőgépekre '
                . '(XENO, Minilase, Vereo) nem terjed ki. Azokhoz kérj ajánlatot az ajanlatkeres eszközzel.',
            'lefedettseg' => 'cab címkenyomtatók és print & apply applikátorok',
            'ismert_gepek' => array_values($gepNevek),
        ];
    }

    $csoportok = $a['csoportok'] ?? [];
    $tetelek   = [];
    foreach ($a['t'] as $sor) {
        [$cikkszam, $megnevezes, $gepek, $csoportIdx] = [$sor[0], $sor[1], $sor[2] ?? [], $sor[3] ?? []];

        if ($gepIndexek !== []) {
            $illik = false;
            foreach ($gepek as $gi) {
                if (isset($gepIndexek[$gi])) {
                    $illik = true;
                    break;
                }
            }
            if (!$illik) {
                continue;
            }
        }
        if ($szavak !== []) {
            $szoveg = normal($cikkszam . ' ' . $megnevezes);
            $illik  = false;
            foreach ($szavak as $sz) {
                if (str_contains($szoveg, $sz)) {
                    $illik = true;
                    break;
                }
            }
            if (!$illik) {
                continue;
            }
        }

        $sajatGepek = [];
        foreach ($gepek as $gi) {
            if (isset($gepNevek[$gi])) {
                $sajatGepek[] = $gepNevek[$gi];
            }
        }
        $egysegek = [];
        foreach ($csoportIdx as $ci) {
            if ($ci >= 0 && isset($csoportok[$ci])) {
                $egysegek[] = is_array($csoportok[$ci]) ? ($csoportok[$ci]['nev'] ?? '') : (string) $csoportok[$ci];
            }
        }

        $tetelek[] = array_filter([
            'cikkszam'        => $cikkszam,
            'megnevezes'      => $megnevezes,
            'gepek'           => $sajatGepek,
            'szerelesi_egyseg' => array_values(array_unique(array_filter($egysegek))),
            'spr_osztaly'     => $sor[4] ?? '',
        ], static fn ($v) => $v !== '' && $v !== []);

        if (count($tetelek) >= $limit) {
            break;
        }
    }

    return [
        'talalat'      => count($tetelek),
        'korlatozva'   => count($tetelek) >= $limit,
        'alkatreszek'  => $tetelek,
        'forras'       => $a['forras'] ?? '',
        'megjegyzes'   => 'Az árakat és az elérhetőséget nem tartjuk itt nyilván — arra az ajanlatkeres eszköz való.',
    ];
}

// ——— 2. eszköz: termékkeresés ——————————————————————————————————
function termek_kereses(array $p): array
{
    $d       = adat('ai/termekek.json');
    $kereso  = normal((string) ($p['q'] ?? ''));
    $kat     = normal((string) ($p['kategoria'] ?? ''));
    $iparag  = normal((string) ($p['iparag'] ?? ''));
    $limit   = korlat($p['limit'] ?? null);

    $tetelek = [];
    foreach ($d['products'] as $t) {
        $szoveg = normal(implode(' ', [
            $t['name']['hu'] ?? '', $t['name']['en'] ?? '',
            $t['brand'] ?? '',
            $t['summary']['hu'] ?? '', $t['summary']['en'] ?? '',
            $t['category']['hu'] ?? '', $t['category']['en'] ?? '',
        ]));
        if ($kereso !== '' && !str_contains($szoveg, $kereso)) {
            continue;
        }
        if ($kat !== ''
            && !str_contains(normal((string) ($t['category']['slug'] ?? '')), $kat)
            && !str_contains(normal((string) ($t['category']['hu'] ?? '')), $kat)
            && !str_contains(normal((string) ($t['category']['en'] ?? '')), $kat)) {
            continue;
        }
        if ($iparag !== '') {
            $van = false;
            foreach (($t['industries'] ?? []) as $i) {
                if (str_contains(normal((string) $i), $iparag)) {
                    $van = true;
                }
            }
            if (!$van) {
                continue;
            }
        }

        $jellemzok = [];
        foreach (($t['features'] ?? []) as $f) {
            $jellemzok[] = $f['hu'] ?? ($f['en'] ?? '');
        }

        $tetelek[] = [
            'slug'       => $t['slug'] ?? '',
            'nev'        => $t['name']['hu'] ?? ($t['name']['en'] ?? ''),
            'gyarto'     => $t['brand'] ?? '',
            'kategoria'  => $t['category']['hu'] ?? '',
            'osszefoglalo' => $t['summary']['hu'] ?? ($t['summary']['en'] ?? ''),
            'jellemzok'  => array_values(array_filter($jellemzok)),
            'iparagak'   => $t['industries'] ?? [],
            'url'        => $t['url'] ?? '',
        ];
        if (count($tetelek) >= $limit) {
            break;
        }
    }

    return [
        'talalat'    => count($tetelek),
        'korlatozva' => count($tetelek) >= $limit,
        'termekek'   => $tetelek,
        'megjegyzes' => 'Árat nem teszünk közzé: a gépek konfigurációfüggők. Ajánlatért az ajanlatkeres eszköz.',
    ];
}

// ——— 3. eszköz: fogalomtár ——————————————————————————————————————
function fogalom_kereses(array $p): array
{
    $d      = adat('ai/termekek.json');
    $kereso = normal((string) ($p['q'] ?? ''));
    $limit  = korlat($p['limit'] ?? null, 5);

    $tetelek = [];
    foreach ($d['glossary'] as $f) {
        $szoveg = normal(implode(' ', [
            $f['term']['hu'] ?? '', $f['term']['en'] ?? '', $f['slug'] ?? '',
            $f['summary']['hu'] ?? '',
        ]));
        if ($kereso !== '' && !str_contains($szoveg, $kereso)) {
            continue;
        }
        $tetelek[] = [
            'fogalom'      => $f['term']['hu'] ?? '',
            'term_en'      => $f['term']['en'] ?? '',
            'osszefoglalo' => $f['summary']['hu'] ?? '',
            'meghatarozas' => $f['definition']['hu'] ?? '',
            'url'          => WEBLAP . '/hu/fogalomtar#' . ($f['slug'] ?? ''),
        ];
        if (count($tetelek) >= $limit) {
            break;
        }
    }

    return ['talalat' => count($tetelek), 'fogalmak' => $tetelek];
}

// ——— 4. eszköz: ajánlatkérés (az EGYETLEN, ami ír) ————————————————
function ajanlatkeres(array $p): array
{
    // Sebességkorlát IP-nként. Ugyanaz a minta, mint a send.php-ban: fájl
    // alapú, mert adatbázis nincs, és a szórásnak elég.
    $ip     = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $vodor  = sys_get_temp_dir() . '/bw-agent-' . hash('sha256', $ip) . '.txt';
    $utesek = is_readable($vodor)
        ? array_filter(
            array_map('intval', explode(',', (string) file_get_contents($vodor))),
            static fn (int $t): bool => $t > time() - 3600
        )
        : [];
    if (count($utesek) >= SEBESSEG) {
        return ['ok' => false, 'hiba' => 'Óránként legfeljebb ' . SEBESSEG . ' ajánlatkérés küldhető egy címről.'];
    }

    $email = trim((string) ($p['email'] ?? ''));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'hiba' => 'Érvényes e-mail cím kell (email).'];
    }
    $uzenet = trim((string) ($p['uzenet'] ?? ''));
    if (mb_strlen($uzenet) < 10) {
        return ['ok' => false, 'hiba' => 'Az üzenet túl rövid — írd le, mire kell a megoldás (uzenet).'];
    }

    // Fejlécinjektálás ellen: a fejlécbe kerülő értékből minden sortörés ki.
    $tiszta = static fn (string $s): string => trim(str_replace(["\r", "\n", "\0"], ' ', $s));
    $email  = $tiszta($email);

    $sorok = ['— Ügynök által beküldött ajánlatkérés —', ''];
    foreach ([
        'Név'          => $p['nev'] ?? '',
        'Cég'          => $p['ceg'] ?? '',
        'E-mail'       => $email,
        'Telefon'      => $p['telefon'] ?? '',
        'Termék'       => $p['termek'] ?? '',
        'Cikkszám'     => $p['cikkszam'] ?? '',
    ] as $cimke => $ertek) {
        $ertek = $tiszta((string) $ertek);
        if ($ertek !== '') {
            $sorok[] = $cimke . ': ' . mb_substr($ertek, 0, 200);
        }
    }
    $sorok[] = '';
    $sorok[] = 'Üzenet:';
    $sorok[] = mb_substr($uzenet, 0, 4000);
    $sorok[] = '';
    $sorok[] = 'Ezt a kérést egy AI-ügynök küldte a /agent.php végponton keresztül.';
    $sorok[] = 'A megadott adatokat a beküldő ügynök gyűjtötte — visszaigazolás előtt érdemes ellenőrizni.';

    $fejlecek = [
        'From: ' . FELADO_NEV . ' <' . FELADO . '>',
        'Reply-To: ' . $email,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: blueway-agent',
    ];

    // A tárgy KIMONDJA, hogy ügynöktől jött: a postafiókban elsőre látszódjon,
    // hogy ezt nem ember gépelte be egy űrlapon.
    $targy   = '[ügynök] Ajánlatkérés a weblapról';
    $sikeres = @mail(CIMZETT, '=?UTF-8?B?' . base64_encode($targy) . '?=', implode("\n", $sorok), implode("\r\n", $fejlecek));

    if (!$sikeres) {
        return ['ok' => false, 'hiba' => 'A küldés nem sikerült. Írj közvetlenül: ' . CIMZETT];
    }

    $utesek[] = time();
    @file_put_contents($vodor, implode(',', $utesek), LOCK_EX);

    return [
        'ok'         => true,
        'uzenet'     => 'Az ajánlatkérés megérkezett. Munkanapokon rövid időn belül válaszolunk a megadott címre.',
        'kapcsolat'  => ['email' => CIMZETT, 'telefon' => '+36 30 279 6679'],
    ];
}

// ——— Az eszközök leírása (ezt kapja meg az ügynök) ————————————————
function eszkozok(): array
{
    return [
        [
            'name'        => 'alkatresz_kereses',
            'title'       => 'Alkatrészkeresés géptípusra',
            'description' => 'Megkeresi a Blueway Trade által forgalmazott cab gépek alkatrészeit. '
                . '2730 alkatrész 48 géptípushoz, a gyári alkatrészlistákból. '
                . 'Add meg a gép típusát (pl. „SQUIX 4”, „HERMES Q”, „XENO 4”) és/vagy egy keresőszót '
                . '(cikkszám vagy megnevezés, pl. „nyomtatófej”, „5954118”). '
                . 'Árat és készletet nem ad — arra az ajanlatkeres eszköz való.',
            'inputSchema' => [
                'type'       => 'object',
                'properties' => [
                    'gep'   => ['type' => 'string', 'description' => 'A géptípus, ahogy a vevő mondja (pl. „SQUIX 4”).'],
                    'q'     => ['type' => 'string', 'description' => 'Keresőszó: cikkszám vagy alkatrész-megnevezés.'],
                    'limit' => ['type' => 'integer', 'description' => 'Legfeljebb ennyi találat (alap 20, max 50).'],
                ],
            ],
        ],
        [
            'name'        => 'termek_kereses',
            'title'       => 'Termékkeresés',
            'description' => 'A forgalmazott 59 gép és termék között keres: címkenyomtatók, print & apply '
                . 'rendszerek, lézeres jelölők, címkeadagolók, füstelszívók, festékszalagok, szoftverek. '
                . 'Szűrhető kategóriára és iparágra is.',
            'inputSchema' => [
                'type'       => 'object',
                'properties' => [
                    'q'         => ['type' => 'string', 'description' => 'Keresőszó a névben, márkában, leírásban.'],
                    'kategoria' => ['type' => 'string', 'description' => 'Kategória, pl. „cimkenyomtatok”, „lezer-gravirozok”.'],
                    'iparag'    => ['type' => 'string', 'description' => 'Iparág, pl. „gyogyszeripar”, „elektronikai-gyartas”.'],
                    'limit'     => ['type' => 'integer', 'description' => 'Legfeljebb ennyi találat (alap 20, max 50).'],
                ],
            ],
        ],
        [
            'name'        => 'fogalom_kereses',
            'title'       => 'Szakkifejezés magyarázata',
            'description' => 'A termékjelölés szakszavait magyarázza el (59 fogalom): termotranszfer nyomtatás, '
                . 'Data Matrix, GHS, SPR-osztály, fiber lézer és társaik.',
            'inputSchema' => [
                'type'       => 'object',
                'properties' => [
                    'q'     => ['type' => 'string', 'description' => 'A keresett szakkifejezés.'],
                    'limit' => ['type' => 'integer', 'description' => 'Legfeljebb ennyi találat (alap 5).'],
                ],
                'required' => ['q'],
            ],
        ],
        [
            'name'        => 'ajanlatkeres',
            'title'       => 'Ajánlatkérés beküldése',
            'description' => 'Ajánlatkérést küld a Blueway Trade munkatársainak. Csak akkor hívd, ha a felhasználó '
                . 'ezt kifejezetten kérte, és megadta az e-mail címét. A kérés a cég postafiókjába megy, és '
                . 'jelezve lesz benne, hogy ügynök küldte.',
            'inputSchema' => [
                'type'       => 'object',
                'properties' => [
                    'email'    => ['type' => 'string', 'description' => 'A felhasználó e-mail címe — ide megy a válasz.'],
                    'uzenet'   => ['type' => 'string', 'description' => 'Mire kell a megoldás: feladat, mennyiség, anyag, környezet.'],
                    'nev'      => ['type' => 'string', 'description' => 'A felhasználó neve.'],
                    'ceg'      => ['type' => 'string', 'description' => 'A cég neve.'],
                    'telefon'  => ['type' => 'string', 'description' => 'Telefonszám, ha megadta.'],
                    'termek'   => ['type' => 'string', 'description' => 'A szóban forgó gép vagy termék.'],
                    'cikkszam' => ['type' => 'string', 'description' => 'Alkatrész cikkszáma, ha erről van szó.'],
                ],
                'required' => ['email', 'uzenet'],
            ],
        ],
    ];
}

function eszkoz_futtatas(string $nev, array $p): array
{
    return match ($nev) {
        'alkatresz_kereses' => alkatresz_kereses($p),
        'termek_kereses'    => termek_kereses($p),
        'fogalom_kereses'   => fogalom_kereses($p),
        'ajanlatkeres'      => ajanlatkeres($p),
        default             => ['error' => 'Ismeretlen eszköz: ' . $nev],
    };
}

// ——— Kiszolgálás ———————————————————————————————————————————————
fejlecek();
$mod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// A böngészőben futó ügynök előbb egy OPTIONS kérést küld.
if ($mod === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ——— GET: sima JSON, protokoll nélkül ——————————————————————————
if ($mod === 'GET') {
    $tool = (string) ($_GET['tool'] ?? '');
    if ($tool === '') {
        // Névjegy: mit tud ez a végpont. Ez az, amit egy ügynök elsőre lekér.
        valasz([
            'nev'        => 'Blueway Trade — ügynök-végpont',
            'leiras'     => 'A weblap cselekvő rétege: alkatrész- és termékkeresés, szakszómagyarázat, ajánlatkérés.',
            'ceg'        => adat('ai/termekek.json')['company'] ?? [],
            'hasznalat'  => [
                'mcp'  => 'POST ' . WEBLAP . '/agent.php — JSON-RPC 2.0, Model Context Protocol',
                'json' => 'GET ' . WEBLAP . '/agent.php?tool=<eszköz>&<paraméterek>',
            ],
            'peldak'     => [
                WEBLAP . '/agent.php?tool=alkatresz_kereses&gep=SQUIX+4&q=nyomtatofej',
                WEBLAP . '/agent.php?tool=termek_kereses&kategoria=lezer-gravirozok',
                WEBLAP . '/agent.php?tool=fogalom_kereses&q=Data+Matrix',
            ],
            'eszkozok'   => array_map(
                static fn (array $e): array => [
                    'nev'        => $e['name'],
                    'leiras'     => $e['description'],
                    'parameterek' => array_keys($e['inputSchema']['properties'] ?? []),
                ],
                eszkozok()
            ),
            'olvaso_reteg' => [
                WEBLAP . '/llms.txt',
                WEBLAP . '/llms-full.txt',
                WEBLAP . '/ai/termekek.json',
                WEBLAP . '/alkatreszek.json',
            ],
        ]);
    }
    // Az ajánlatkérés GET-tel nem küldhető: az írás POST dolga, és egy
    // véletlenül megnyitott hivatkozás sosem küldhet levelet.
    if ($tool === 'ajanlatkeres') {
        valasz(['error' => 'Az ajánlatkérés csak POST-tal küldhető.'], 405);
    }
    valasz(eszkoz_futtatas($tool, $_GET));
}

// ——— POST: MCP (JSON-RPC 2.0) ——————————————————————————————————
if ($mod !== 'POST') {
    valasz(['error' => 'Csak GET, POST és OPTIONS.'], 405);
}

$nyers = (string) file_get_contents('php://input');
$keres = json_decode($nyers, true);

// A POST a sima JSON-utat is kiszolgálja: ha nem JSON-RPC érkezik, hanem
// egy ?tool= paraméteres űrlap, azt is elfogadjuk. Így az ajánlatkérés
// protokoll nélkül is beküldhető.
if (!is_array($keres) || !isset($keres['jsonrpc'])) {
    $tool = (string) ($_POST['tool'] ?? ($keres['tool'] ?? ''));
    if ($tool === '') {
        valasz(['error' => 'Hiányzó jsonrpc mező vagy tool paraméter.'], 400);
    }
    $p = is_array($keres) ? $keres : $_POST;
    valasz(eszkoz_futtatas($tool, $p));
}

$metodus = (string) ($keres['method'] ?? '');
$azon    = $keres['id'] ?? null;
$par     = is_array($keres['params'] ?? null) ? $keres['params'] : [];

/** JSON-RPC válaszburok. */
$rpc = static function (mixed $eredmeny) use ($azon): never {
    valasz(['jsonrpc' => '2.0', 'id' => $azon, 'result' => $eredmeny]);
};
$rpcHiba = static function (int $kod, string $uzenet) use ($azon): never {
    valasz(['jsonrpc' => '2.0', 'id' => $azon, 'error' => ['code' => $kod, 'message' => $uzenet]]);
};

// Az értesítéseknek (nincs id) nem jár válasz — a JSON-RPC így írja elő.
if ($azon === null && str_starts_with($metodus, 'notifications/')) {
    http_response_code(202);
    exit;
}

switch ($metodus) {
    case 'initialize':
        $kert = (string) ($par['protocolVersion'] ?? '');
        $rpc([
            // A kliens verzióját tükrözzük vissza, ha értelmesnek látszik.
            'protocolVersion' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $kert) ? $kert : MCP_VERZIO,
            'capabilities'    => ['tools' => ['listChanged' => false]],
            'serverInfo'      => [
                'name'    => 'blueway-trade',
                'title'   => 'Blueway Trade — termékjelölés',
                'version' => '1.0.0',
            ],
            'instructions'    => 'A Blueway Trade Kft. ipari termékjelöléssel foglalkozik: címkenyomtatók, '
                . 'print & apply rendszerek, lézeres jelölők, címkeadagolók, füstelszívók, festékszalagok. '
                . 'Alkatrészkérdésnél az alkatresz_kereses eszközt hívd a géptípussal. '
                . 'Ajánlatot csak akkor kérj, ha a felhasználó kifejezetten kérte és megadta az e-mail címét.',
        ]);

    case 'ping':
        $rpc([]);

    case 'tools/list':
        $rpc(['tools' => eszkozok()]);

    case 'tools/call':
        $nev = (string) ($par['name'] ?? '');
        $arg = is_array($par['arguments'] ?? null) ? $par['arguments'] : [];
        $ismert = array_column(eszkozok(), 'name');
        if (!in_array($nev, $ismert, true)) {
            $rpcHiba(-32602, 'Ismeretlen eszköz: ' . $nev);
        }
        $eredmeny = eszkoz_futtatas($nev, $arg);
        // Az MCP a tartalmat szövegblokként várja. A structuredContent a
        // gépi feldolgozásnak jobb, de a text minden klienssel működik.
        $rpc([
            'content' => [[
                'type' => 'text',
                'text' => json_encode($eredmeny, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
            ]],
            'structuredContent' => $eredmeny,
            'isError'           => isset($eredmeny['error']) || (isset($eredmeny['ok']) && $eredmeny['ok'] === false),
        ]);

    default:
        $rpcHiba(-32601, 'Ismeretlen metódus: ' . $metodus);
}
