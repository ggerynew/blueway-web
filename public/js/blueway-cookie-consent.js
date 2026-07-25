/*!
 * Blueway Trade Kft. – süti-hozzájárulás kezelő / cookie consent banner (HU + EN + DE + KO + ZH)
 * Verzió: 1.2 (2026-07-25) – az Adatkezelési Tájékoztató 2.0 verziójával összhangban.
 * 1.2: német, koreai és kínai felirat-fordítások; a szöveg tartalma változatlan.
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
      catPrefDesc: 'A választott nyelv megjegyzése (blueway_lang, 6 hónap).',
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
      catPrefDesc: 'Remembering your language choice (blueway_lang, 6 months).',
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
      catPrefDesc: 'Speicherung Ihrer Sprachwahl (blueway_lang, 6 Monate).',
      catThird: 'Cookies von Drittanbietern',
      catThirdDesc: 'Anzeige der Google-Maps-Karte (Cookies von google.com, z. B. NID). Daten können unter den Garantien des EU-US Data Privacy Framework (DPF) in die USA übermittelt werden.',
      save: 'Einstellungen speichern',
      cancel: 'Abbrechen',
      placeholder: 'Zur Anzeige dieses Inhalts (Google Maps) müssen Drittanbieter-Cookies aktiviert werden. ',
      placeholderLink: 'Cookie-Einstellungen öffnen'
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
      catPrefDesc: '선택한 언어를 기억합니다 (blueway_lang, 6개월).',
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
      catPrefDesc: '记住您选择的语言（blueway_lang，6 个月）。',
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

  /* ---------- public API ---------- */
  window.BluewayConsent = {
    open: openSettings,
    get: readConsent,
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
    if (!c) showBanner();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
