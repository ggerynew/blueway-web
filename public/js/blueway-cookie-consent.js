/*!
 * Blueway Trade Kft. – süti-hozzájárulás kezelő / cookie consent banner (HU + EN)
 * Verzió: 1.1 (2026-07-24) – az Adatkezelési Tájékoztató 2.0 verziójával összhangban.
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
  if (LANG !== 'en') LANG = 'hu';

  var T = {
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
    }
  }[LANG];

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
