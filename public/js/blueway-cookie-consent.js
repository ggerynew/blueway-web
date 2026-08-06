/*!
 * Blueway Trade Kft. – süti-hozzájárulás kezelő / cookie consent banner (HU + EN + DE + IT + ES + KO + ZH)
 * Verzió: 1.5 (2026-07-30) – az Adatkezelési Tájékoztató 2.1 verziójával összhangban.
 * 1.2: német, koreai és kínai felirat-fordítások; a szöveg tartalma változatlan.
 * 1.3: olasz és spanyol felirat-fordítások.
 * 1.4: a nyelvi süti használatba került. A setLangCookie eddig is készen volt,
 *      de senki nem hívta, és senki nem olvasta — a hozzájárulási szöveg
 *      tehát olyan sütit ígért, ami a gyakorlatban nem létezett. Mostantól a
 *      nyelvválasztó zászlóra kattintva íródik ki (hozzájárulás esetén), és a
 *      gyökércím (blueway.hu) ez alapján dönti el, melyik nyelv fogadja a
 *      visszatérő látogatót. A szkript maga nem változott.
 * 1.5: az alkatrészkereső a kényelmi kategóriába tartozó munkamenet-tárolót
 *      használ (blueway_alkatresz), hogy a beszélgetés ne vesszen el
 *      oldalváltáskor. A kategória leírása ezért kiegészült; a szkript
 *      logikája nem változott — az `allowed('preferences')` eddig is
 *      megvolt, most a kereső is ezt kérdezi meg.
 *
 * BEILLESZTÉS / INTEGRATION
 * -------------------------
 * 1. Töltsd be minden oldalon, közvetlenül a </body> előtt:
 *      <script src="/js/blueway-cookie-consent.js"></script>
 *    Nyelv: a <html lang="hu"> / <html lang="en"> attribútumból veszi (alapértelmezés: hu).
 *
 * 2. Google Maps beágyazás – NE közvetlen src-vel, hanem így:
 *      <iframe data-consent="thirdparty"
 *              data-src="https://www.google.com/maps/embed?pb=..."
 *              width="600" height="450" style="border:0"
 *              loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
 *    A térkép csak a harmadik feles sütikhez adott hozzájárulás UTÁN töltődik be.
 *
 * 3. Nyelvi süti beállítása kizárólag ezen keresztül (hozzájárulást ellenőrzi):
 *      BluewayConsent.setLangCookie('hu');  // vagy 'en'
 *    A weblapon ezt a nyelvválasztó hívja (src/lib/consent.ts), és a gyökércím
 *    (src/app/page.tsx) olvassa vissza, hogy a visszatérő látogató a saját
 *    nyelvén érkezzen meg. A visszaadott érték false, ha nincs hozzájárulás.
 *
 * 4. Lábléc-link a beállítások újranyitásához:
 *      <a href="#" onclick="BluewayConsent.open();return false">Süti-beállítások</a>
 *
 * 5. Google Fonts: a betűkészleteket saját szerverről szolgáld ki (self-host).
 *
 * MŰKÖDÉS
 * -------
 * - Választás tárolása: "blueway_consent" első feles süti (6 hónap), JSON:
 *   {"v":1,"ts":"<ISO>","necessary":true,"preferences":bool,"thirdparty":bool}
 *   (időbélyeg + verzió = a hozzájárulás igazolhatósága, GDPR 7. cikk (1)).
 * - Hozzájárulás előtt semmilyen nem szükséges süti nem kerül elhelyezésre.
 * - Az elutasítás egyenrangú gombként jelenik meg (NAIH/EDPB elvárás).
 * - A tájékoztató módosításakor növeld a CONSENT_VERSION-t → új hozzájárulás-kérés.
 */
(function () {
  'use strict';

  var CONSENT_COOKIE = 'blueway_consent';
  var CONSENT_VERSION = 1;
  var CONSENT_DAYS = 183;               // ~6 hónap / months
  var LANG_COOKIE = 'blueway_lang';
  var LANG_DAYS = 183;

  var LANG = (document.documentElement.lang || 'hu').slice(0, 2).toLowerCase();

  var T_ALL = {
    hu: {
      policyUrl: (window.__BLUEWAY_BASE__ || '') + '/adatkezelesi-tajekoztato.html',
      bannerTitle: 'Sütiket használunk',
      bannerText: 'Weboldalunk a működéshez feltétlenül szükséges sütiket használ, továbbá – kizárólag az Ön hozzájárulásával – kényelmi (nyelvi beállítás) és harmadik féltől származó (Google Maps) sütiket. Részletek: ',
      policyLink: 'Adatkezelési tájékoztató',
      acceptAll: 'Összes elfogadása',
      rejectAll: 'Csak a szükségesek',
      settings: 'Beállítások',
      dialogTitle: 'Süti-beállítások',
      catNecessary: 'Feltétlenül szükséges sütik',
      catNecessaryDesc: 'A weboldal működéséhez és az Ön választásának tárolásához szükségesek (blueway_consent). Nem igényelnek hozzájárulást.',
      catPref: 'Kényelmi sütik',
      catPrefDesc: 'A választott nyelv megjegyzése (blueway_lang süti, 6 hónap), valamint az alkatrészkeresőben folytatott beszélgetés megőrzése oldalváltáskor (blueway_alkatresz, a böngészőlap bezárásáig).',
      catThird: 'Harmadik féltől származó sütik',
      catThirdDesc: 'Google Maps térkép megjelenítése (a google.com sütijei, pl. NID). Az adatok az USA-ba továbbítódhatnak az EU–USA adatvédelmi keretrendszer (DPF) garanciái mellett.',
      save: 'Beállítások mentése',
      cancel: 'Mégse',
      placeholder: 'A tartalom (Google Maps) megjelenítéséhez a harmadik féltől származó sütik engedélyezése szükséges. ',
      placeholderLink: 'Süti-beállítások megnyitása'
    },
    en: {
      policyUrl: (window.__BLUEWAY_BASE__ || '') + '/privacy-policy.html',
      bannerTitle: 'We use cookies',
      bannerText: 'Our website uses strictly necessary cookies, and – only with your consent – preference cookies (language setting) and third-party cookies (Google Maps). Details: ',
      policyLink: 'Privacy Policy',
      acceptAll: 'Accept all',
      rejectAll: 'Necessary only',
      settings: 'Settings',
      dialogTitle: 'Cookie settings',
      catNecessary: 'Strictly necessary cookies',
      catNecessaryDesc: 'Required for the operation of the website and for storing your choice (blueway_consent). No consent is required.',
      catPref: 'Preference cookies',
      catPrefDesc: 'Remembering your language choice (blueway_lang cookie, 6 months) and keeping the spare part finder conversation when moving between pages (blueway_alkatresz, until the browser tab is closed).',
      catThird: 'Third-party cookies',
      catThirdDesc: 'Displaying the Google Maps map (cookies set by google.com, e.g. NID). Data may be transferred to the USA under the safeguards of the EU–US Data Privacy Framework (DPF).',
      save: 'Save settings',
      cancel: 'Cancel',
      placeholder: 'To display this content (Google Maps), third-party cookies must be enabled. ',
      placeholderLink: 'Open cookie settings'
    },
    de: {
      policyUrl: (window.__BLUEWAY_BASE__ || '') + '/privacy-policy.html',
      bannerTitle: 'Wir verwenden Cookies',
      bannerText: 'Unsere Website verwendet unbedingt erforderliche Cookies sowie – nur mit Ihrer Einwilligung – Präferenz-Cookies (Spracheinstellung) und Cookies von Drittanbietern (Google Maps). Details: ',
      policyLink: 'Datenschutzerklärung (EN)',
      acceptAll: 'Alle akzeptieren',
      rejectAll: 'Nur erforderliche',
      settings: 'Einstellungen',
      dialogTitle: 'Cookie-Einstellungen',
      catNecessary: 'Unbedingt erforderliche Cookies',
      catNecessaryDesc: 'Erforderlich für den Betrieb der Website und die Speicherung Ihrer Auswahl (blueway_consent). Keine Einwilligung erforderlich.',
      catPref: 'Präferenz-Cookies',
      catPrefDesc: 'Speicherung Ihrer Sprachwahl (Cookie blueway_lang, 6 Monate) sowie Erhalt des Gesprächs in der Ersatzteilsuche beim Seitenwechsel (blueway_alkatresz, bis zum Schließen des Browser-Tabs).',
      catThird: 'Cookies von Drittanbietern',
      catThirdDesc: 'Anzeige der Google-Maps-Karte (Cookies von google.com, z. B. NID). Daten können unter den Garantien des EU-US Data Privacy Framework (DPF) in die USA übermittelt werden.',
      save: 'Einstellungen speichern',
      cancel: 'Abbrechen',
      placeholder: 'Zur Anzeige dieses Inhalts (Google Maps) müssen Drittanbieter-Cookies aktiviert werden. ',
      placeholderLink: 'Cookie-Einstellungen öffnen'
    },
    it: {
      policyUrl: (window.__BLUEWAY_BASE__ || '') + '/privacy-policy.html',
      bannerTitle: 'Utilizziamo i cookie',
      bannerText: 'Il nostro sito utilizza cookie strettamente necessari e \u2013 solo con il Suo consenso \u2013 cookie di preferenza (impostazione della lingua) e cookie di terze parti (Google Maps). Dettagli: ',
      policyLink: 'Informativa sulla privacy (EN)',
      acceptAll: 'Accetta tutti',
      rejectAll: 'Solo necessari',
      settings: 'Impostazioni',
      dialogTitle: 'Impostazioni dei cookie',
      catNecessary: 'Cookie strettamente necessari',
      catNecessaryDesc: 'Necessari per il funzionamento del sito e per memorizzare la Sua scelta (blueway_consent). Non richiedono consenso.',
      catPref: 'Cookie di preferenza',
      catPrefDesc: 'Memorizzazione della lingua scelta (cookie blueway_lang, 6 mesi) e conservazione della conversazione nella ricerca ricambi al cambio di pagina (blueway_alkatresz, fino alla chiusura della scheda del browser).',
      catThird: 'Cookie di terze parti',
      catThirdDesc: 'Visualizzazione della mappa Google Maps (cookie impostati da google.com, ad es. NID). I dati possono essere trasferiti negli USA con le garanzie del quadro UE-USA sulla privacy dei dati (DPF).',
      save: 'Salva le impostazioni',
      cancel: 'Annulla',
      placeholder: 'Per visualizzare questo contenuto (Google Maps) \u00e8 necessario abilitare i cookie di terze parti. ',
      placeholderLink: 'Apri le impostazioni dei cookie'
    },
    es: {
      policyUrl: (window.__BLUEWAY_BASE__ || '') + '/privacy-policy.html',
      bannerTitle: 'Utilizamos cookies',
      bannerText: 'Nuestro sitio web utiliza cookies estrictamente necesarias y \u2013 solo con su consentimiento \u2013 cookies de preferencia (configuraci\u00f3n de idioma) y cookies de terceros (Google Maps). Detalles: ',
      policyLink: 'Pol\u00edtica de privacidad (EN)',
      acceptAll: 'Aceptar todas',
      rejectAll: 'Solo las necesarias',
      settings: 'Configuraci\u00f3n',
      dialogTitle: 'Configuraci\u00f3n de cookies',
      catNecessary: 'Cookies estrictamente necesarias',
      catNecessaryDesc: 'Necesarias para el funcionamiento del sitio y para guardar su elecci\u00f3n (blueway_consent). No requieren consentimiento.',
      catPref: 'Cookies de preferencia',
      catPrefDesc: 'Memorizaci\u00f3n del idioma elegido (cookie blueway_lang, 6 meses) y conservaci\u00f3n de la conversaci\u00f3n del buscador de repuestos al cambiar de p\u00e1gina (blueway_alkatresz, hasta cerrar la pesta\u00f1a del navegador).',
      catThird: 'Cookies de terceros',
      catThirdDesc: 'Visualizaci\u00f3n del mapa de Google Maps (cookies establecidas por google.com, p. ej. NID). Los datos pueden transferirse a EE. UU. con las garant\u00edas del Marco de Privacidad de Datos UE-EE. UU. (DPF).',
      save: 'Guardar configuraci\u00f3n',
      cancel: 'Cancelar',
      placeholder: 'Para mostrar este contenido (Google Maps) es necesario habilitar las cookies de terceros. ',
      placeholderLink: 'Abrir la configuraci\u00f3n de cookies'
    },
    ko: {
      policyUrl: (window.__BLUEWAY_BASE__ || '') + '/privacy-policy.html',
      bannerTitle: '쿠키를 사용합니다',
      bannerText: '본 웹사이트는 반드시 필요한 쿠키를 사용하며, 귀하의 동의가 있는 경우에만 환경설정 쿠키(언어 설정)와 제3자 쿠키(Google Maps)를 사용합니다. 자세한 내용: ',
      policyLink: '개인정보 처리방침 (EN)',
      acceptAll: '모두 허용',
      rejectAll: '필수만 허용',
      settings: '설정',
      dialogTitle: '쿠키 설정',
      catNecessary: '반드시 필요한 쿠키',
      catNecessaryDesc: '웹사이트 운영과 귀하의 선택 저장(blueway_consent)에 필요합니다. 동의가 필요하지 않습니다.',
      catPref: '환경설정 쿠키',
      catPrefDesc: '선택한 언어를 기억합니다 (blueway_lang 쿠키, 6개월). 또한 페이지를 이동해도 부품 검색의 대화 내용을 유지합니다 (blueway_alkatresz, 브라우저 탭을 닫을 때까지).',
      catThird: '제3자 쿠키',
      catThirdDesc: 'Google Maps 지도 표시 (google.com이 설정하는 쿠키, 예: NID). 데이터는 EU-미국 데이터 프라이버시 프레임워크(DPF)의 보호 조치에 따라 미국으로 이전될 수 있습니다.',
      save: '설정 저장',
      cancel: '취소',
      placeholder: '이 콘텐츠(Google Maps)를 표시하려면 제3자 쿠키를 허용해야 합니다. ',
      placeholderLink: '쿠키 설정 열기'
    },
    zh: {
      policyUrl: (window.__BLUEWAY_BASE__ || '') + '/privacy-policy.html',
      bannerTitle: '我们使用 Cookie',
      bannerText: '本网站使用运行所必需的 Cookie，并且仅在您同意的情况下使用偏好 Cookie（语言设置）和第三方 Cookie（Google Maps）。详情： ',
      policyLink: '隐私政策 (EN)',
      acceptAll: '全部接受',
      rejectAll: '仅必要项',
      settings: '设置',
      dialogTitle: 'Cookie 设置',
      catNecessary: '严格必要的 Cookie',
      catNecessaryDesc: '网站运行和保存您的选择（blueway_consent）所必需。无需征得同意。',
      catPref: '偏好 Cookie',
      catPrefDesc: '记住您选择的语言（blueway_lang cookie，6 个月），并在切换页面时保留备件查询中的对话（blueway_alkatresz，直至关闭浏览器标签页）。',
      catThird: '第三方 Cookie',
      catThirdDesc: '显示 Google Maps 地图（由 google.com 设置的 Cookie，例如 NID）。数据可能在欧盟-美国数据隐私框架（DPF）的保障下传输至美国。',
      save: '保存设置',
      cancel: '取消',
      placeholder: '要显示此内容（Google Maps），需要允许第三方 Cookie。 ',
      placeholderLink: '打开 Cookie 设置'
    }
  };
  if (!T_ALL[LANG]) LANG = 'hu';
  var T = T_ALL[LANG];

  /* ---------- cookie helpers ---------- */
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax' +
      (location.protocol === 'https:' ? ';Secure' : '');
  }
  function getCookie(name) {
    var m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }
  function delCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }

  /* ---------- state ---------- */
  function readConsent() {
    try {
      var raw = getCookie(CONSENT_COOKIE);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (c.v !== CONSENT_VERSION) return null;
      return c;
    } catch (e) { return null; }
  }
  function saveConsent(preferences, thirdparty) {
    var c = {
      v: CONSENT_VERSION,
      ts: new Date().toISOString(),
      necessary: true,
      preferences: !!preferences,
      thirdparty: !!thirdparty
    };
    setCookie(CONSENT_COOKIE, JSON.stringify(c), CONSENT_DAYS);
    if (!c.preferences) delCookie(LANG_COOKIE);
    return c;
  }

  /* ---------- gate third-party content (Google Maps) ---------- */
  function applyThirdParty(allowed) {
    var els = document.querySelectorAll('[data-consent="thirdparty"]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (allowed) {
        if (el.dataset.src && el.src !== el.dataset.src) el.src = el.dataset.src;
        el.style.display = '';
        var ph = el.previousElementSibling;
        if (ph && ph.classList.contains('bwc-placeholder')) ph.remove();
      } else {
        if (el.src) el.removeAttribute('src');
        el.style.display = 'none';
        if (!(el.previousElementSibling && el.previousElementSibling.classList.contains('bwc-placeholder'))) {
          var p = document.createElement('div');
          p.className = 'bwc-placeholder';
          p.appendChild(document.createTextNode(T.placeholder));
          var a = document.createElement('a');
          a.href = '#'; a.className = 'bwc-open'; a.textContent = T.placeholderLink;
          a.addEventListener('click', function (ev) { ev.preventDefault(); openSettings(); });
          p.appendChild(a);
          el.parentNode.insertBefore(p, el);
        }
      }
    }
  }

  /* ---------- UI ---------- */
  var css =
    '.bwc-banner{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#1f3864;color:#fff;' +
    'font:14px/1.5 system-ui,Arial,sans-serif;padding:16px;box-shadow:0 -2px 12px rgba(0,0,0,.3)}' +
    '.bwc-inner{max-width:960px;margin:0 auto}' +
    '.bwc-banner a{color:#9dc3ff}' +
    '.bwc-btns{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}' +
    '.bwc-btn{cursor:pointer;border:0;border-radius:4px;padding:10px 18px;font:600 14px system-ui,Arial,sans-serif}' +
    '.bwc-accept{background:#4caf50;color:#fff}' +
    '.bwc-reject{background:#e0e0e0;color:#222}' +
    '.bwc-settings{background:transparent;color:#fff;border:1px solid #fff}' +
    '.bwc-modal{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.bwc-dialog{background:#fff;color:#222;max-width:560px;width:100%;border-radius:8px;padding:24px;font:14px/1.5 system-ui,Arial,sans-serif;max-height:90vh;overflow:auto}' +
    '.bwc-dialog h2{margin:0 0 12px;font-size:18px;color:#1f3864}' +
    '.bwc-cat{border-top:1px solid #e0e0e0;padding:12px 0}' +
    '.bwc-cat label{display:flex;justify-content:space-between;align-items:center;gap:12px;font-weight:600}' +
    '.bwc-cat p{margin:6px 0 0;color:#555}' +
    '.bwc-placeholder{background:#f2f4f8;border:1px dashed #9ab;color:#345;padding:24px;text-align:center;' +
    'font:14px/1.5 system-ui,Arial,sans-serif;border-radius:6px;margin:8px 0}';

  var banner, modal;

  function injectCss() {
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function showBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'bwc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', T.dialogTitle);
    banner.innerHTML =
      '<div class="bwc-inner">' +
      '<strong>' + T.bannerTitle + '</strong><br>' +
      T.bannerText + '<a href="' + T.policyUrl + '">' + T.policyLink + '</a>.' +
      '<div class="bwc-btns">' +
      '<button class="bwc-btn bwc-accept">' + T.acceptAll + '</button>' +
      '<button class="bwc-btn bwc-reject">' + T.rejectAll + '</button>' +
      '<button class="bwc-btn bwc-settings">' + T.settings + '</button>' +
      '</div></div>';
    document.body.appendChild(banner);
    banner.querySelector('.bwc-accept').addEventListener('click', function () { finish(true, true); });
    banner.querySelector('.bwc-reject').addEventListener('click', function () { finish(false, false); });
    banner.querySelector('.bwc-settings').addEventListener('click', openSettings);
  }

  function hideBanner() { if (banner) { banner.remove(); banner = null; } }

  function openSettings() {
    if (modal) return;
    var current = readConsent() || { preferences: false, thirdparty: false };
    modal = document.createElement('div');
    modal.className = 'bwc-modal';
    modal.innerHTML =
      '<div class="bwc-dialog" role="dialog" aria-label="' + T.dialogTitle + '">' +
      '<h2>' + T.dialogTitle + '</h2>' +
      '<div class="bwc-cat"><label>' + T.catNecessary +
      '<input type="checkbox" checked disabled></label>' +
      '<p>' + T.catNecessaryDesc + '</p></div>' +
      '<div class="bwc-cat"><label>' + T.catPref +
      '<input type="checkbox" id="bwc-pref"' + (current.preferences ? ' checked' : '') + '></label>' +
      '<p>' + T.catPrefDesc + '</p></div>' +
      '<div class="bwc-cat"><label>' + T.catThird +
      '<input type="checkbox" id="bwc-third"' + (current.thirdparty ? ' checked' : '') + '></label>' +
      '<p>' + T.catThirdDesc + '</p></div>' +
      '<div class="bwc-btns">' +
      '<button class="bwc-btn bwc-accept">' + T.save + '</button>' +
      '<button class="bwc-btn bwc-reject">' + T.cancel + '</button>' +
      '</div></div>';
    document.body.appendChild(modal);
    modal.querySelector('.bwc-accept').addEventListener('click', function () {
      finish(modal.querySelector('#bwc-pref').checked, modal.querySelector('#bwc-third').checked);
    });
    modal.querySelector('.bwc-reject').addEventListener('click', closeSettings);
  }

  function closeSettings() { if (modal) { modal.remove(); modal = null; } }

  function finish(pref, third) {
    var c = saveConsent(pref, third);
    closeSettings();
    hideBanner();
    applyThirdParty(c.thirdparty);
    document.dispatchEvent(new CustomEvent('blueway:consent', { detail: c }));
  }

  /* ---------- új tartalom a lapon ----------
   * A weblap egyoldalas alkalmazásként navigál: a menüből kattintva nem
   * töltődik újra a lap, csak kicserélődik a tartalma. Az `init` viszont
   * egyszer fut le, betöltéskor — a kapcsolatoldalra ÁTKATTINTVA tehát a
   * frissen beillesztett térkép-iframe úgy maradt, ahogy a kiszolgáló adta:
   * `src` nélkül, rejtve. Frissítésre működött, kattintásra nem.
   *
   * Ezért figyeljük, kerül-e új, hozzájáruláshoz kötött elem a lapra, és ha
   * igen, újra alkalmazzuk rá a döntést. Képkockánként legfeljebb egyszer:
   * a figyelő maga csak egy jelzőt állít, a munkát a rajzolás előtt végezzük.
   */
  var ujraVar = false;
  function ujraAlkalmaz() {
    if (ujraVar) return;
    ujraVar = true;
    var futtat = function () {
      ujraVar = false;
      var c = readConsent();
      applyThirdParty(!!(c && c.thirdparty));
    };
    if (window.requestAnimationFrame) window.requestAnimationFrame(futtat);
    else setTimeout(futtat, 0);
  }

  function figyelesIndit() {
    if (!window.MutationObserver) return;
    new MutationObserver(function (lista) {
      for (var i = 0; i < lista.length; i++) {
        var uj = lista[i].addedNodes;
        for (var j = 0; j < uj.length; j++) {
          var n = uj[j];
          if (n.nodeType !== 1) continue;
          // Maga az elem, vagy bármi alatta.
          if (n.matches && n.matches('[data-consent]')) return ujraAlkalmaz();
          if (n.querySelector && n.querySelector('[data-consent]')) return ujraAlkalmaz();
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- public API ---------- */
  window.BluewayConsent = {
    open: openSettings,
    get: readConsent,
    /** Újra alkalmazza a döntést a lapon lévő beágyazásokra. */
    refresh: ujraAlkalmaz,
    allowed: function (cat) {
      var c = readConsent();
      if (cat === 'necessary') return true;
      return !!(c && c[cat]);
    },
    setLangCookie: function (lang) {
      if (this.allowed('preferences')) { setCookie(LANG_COOKIE, lang, LANG_DAYS); return true; }
      return false;
    }
  };

  /* ---------- init ---------- */
  function init() {
    injectCss();
    var c = readConsent();
    applyThirdParty(!!(c && c.thirdparty));
    figyelesIndit();
    if (!c) showBanner();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
