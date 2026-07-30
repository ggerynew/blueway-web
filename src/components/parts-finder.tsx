'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { asset } from '@/lib/asset';
import { getDictionary, type Locale } from '@/lib/i18n';
import { sendForm } from '@/lib/send-form';
import {
  betoltIndex,
  gepFelismeres,
  keres,
  type AlkatreszIndex,
  type Talalat,
} from '@/lib/alkatresz';

/**
 * Alkatrészkereső — jobbról nyíló fül, beszélgetés formában.
 *
 * MIÉRT NEM NYELVI MODELL VÁLASZOL
 *   Egy cikkszám nem véleménykérdés: ha a válasz egy karakterrel téved, rossz
 *   alkatrész érkezik meg a vevőhöz, jellemzően több hét csúszással. Ezért a
 *   kereső NEM generál szöveget: minden cikkszám, megnevezés és szerelési
 *   egység közvetlenül a gyári cab alkatrészlistából jön (public/alkatreszek.json).
 *   A „beszélgetés" a kérdezés módja, nem a válasz forrása.
 *
 * A FOLYAMAT
 *   1. A vevő beírja, mit keres — akár a saját nyelvén („nyomtatófej").
 *   2. Ha a találatok több géptípust érintenek, a kereső rákérdez a gépre, és
 *      megmondja, hol találja: a gép hátulján lévő adattáblán, vagy a kijelző
 *      menüjében az Info pontnál. Ez a lépés adja a szűkítés javát.
 *   3. Cikkszámra azonnal ajánlat kérhető — a vevő kifejezett hozzájárulásával.
 *   4. Ha elakad, a beszélgetés összefoglalója átadható kollégáinknak — szintén
 *      csak hozzájárulással. Enélkül semmi nem hagyja el a böngészőt.
 *
 * ADATKEZELÉS
 *   A beszélgetés a böngészőben marad. Csak akkor kerül levélbe, ha a vevő a
 *   jelölőnégyzetet bepipálja és elküldi — a levél tartalmát előtte szó szerint
 *   látja. A menet a lapváltás miatt a böngésző munkamenet-tárolójában él
 *   tovább, és csak akkor, ha a látogató a kényelmi tárolást engedélyezte.
 */

type Uzenet = {
  id: number;
  ki: 'gep' | 'vevo';
  szoveg: string;
  talalatok?: Talalat[];
  /** A géptípus kérdésénél a listát is megmutatjuk. */
  gepkerdes?: boolean;
};

/** Ennyi találatnál/géptípusnál már érdemes rákérdezni a gépre. */
const SZUKITES_HATAR = 3;
const TAROLO = 'blueway_alkatresz';

function engedelyezettTarolas(): boolean {
  if (typeof window === 'undefined') return false;
  const c = (window as unknown as { BluewayConsent?: { allowed: (k: string) => boolean } })
    .BluewayConsent;
  return c?.allowed('preferences') ?? false;
}

export function PartsFinder({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).parts;
  const [nyitva, setNyitva] = useState(false);
  const [index, setIndex] = useState<AlkatreszIndex | null>(null);
  const [betoltes, setBetoltes] = useState(false);
  const [hiba, setHiba] = useState(false);
  const [uzenetek, setUzenetek] = useState<Uzenet[]>([]);
  const [beirt, setBeirt] = useState('');
  const [gepId, setGepId] = useState<string | null>(null);
  const [gepSzuro, setGepSzuro] = useState('');
  const [urlap, setUrlap] = useState<null | { cikkszam?: string }>(null);
  const [kuldes, setKuldes] = useState(false);

  const kovetkezoId = useRef(0);
  const also = useRef<HTMLDivElement>(null);
  const mezo = useRef<HTMLInputElement>(null);

  // Mobilon a nyitógomb a jobb alsó sarokban ül, a süti-sáv viszont ugyanoda
  // kerül, és telefonon 250 pixel magas — mérve: 390×844-es kijelzőn teljesen
  // eltakarta a gombot, tehát a kereső addig LÁTHATATLAN volt, amíg a látogató
  // nem válaszolt a sávnak. Ezért a gombot a sáv fölé emeljük, amíg az kint van.
  const [alsoTavolsag, setAlsoTavolsag] = useState(16);

  const gepNev = useMemo(
    () => index?.gepek.find((g) => g.id === gepId)?.nev ?? null,
    [index, gepId],
  );

  function hozzafuz(u: Omit<Uzenet, 'id'>) {
    setUzenetek((elozo) => [...elozo, { ...u, id: (kovetkezoId.current += 1) }]);
  }

  // ——— megnyitás: ilyenkor töltjük le az indexet, előbb nem ————————
  useEffect(() => {
    if (!nyitva || index || betoltes) return;
    setBetoltes(true);
    betoltIndex()
      .then(setIndex)
      .catch(() => setHiba(true))
      .finally(() => setBetoltes(false));
  }, [nyitva, index, betoltes]);

  // ——— a menet visszaállítása lapváltás után ————————————————————
  useEffect(() => {
    if (!engedelyezettTarolas()) return;
    try {
      const mentett = sessionStorage.getItem(TAROLO);
      if (!mentett) return;
      const adat = JSON.parse(mentett) as { uzenetek: Uzenet[]; gepId: string | null };
      if (Array.isArray(adat.uzenetek) && adat.uzenetek.length) {
        setUzenetek(adat.uzenetek);
        kovetkezoId.current = Math.max(...adat.uzenetek.map((u) => u.id));
        setGepId(adat.gepId ?? null);
      }
    } catch {
      /* sérült tartalom: nem baj, üresen indulunk */
    }
  }, []);

  useEffect(() => {
    if (!engedelyezettTarolas() || !uzenetek.length) return;
    try {
      sessionStorage.setItem(TAROLO, JSON.stringify({ uzenetek, gepId }));
    } catch {
      /* tele a tároló: a kereső ettől még működik */
    }
  }, [uzenetek, gepId]);

  useEffect(() => {
    if (nyitva) {
      also.current?.scrollIntoView({ block: 'end' });
      mezo.current?.focus();
    }
  }, [nyitva, uzenetek, urlap]);

  // Nyitáskor bemutatkozik, ha még nincs mit folytatni.
  useEffect(() => {
    if (nyitva && !uzenetek.length) hozzafuz({ ki: 'gep', szoveg: t.greeting });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nyitva]);

  // A süti-sáv magasságát követjük: a szkript a válasz után kiveszi a DOM-ból,
  // ilyenkor a gomb visszaül a sarokba. Két figyelő kell hozzá: a sáv
  // megjelenését/eltűnését a body gyermeklistája mutatja, a magasságát pedig
  // csak méret-figyelő adja meg (a szöveg hét nyelven más-más sort tör).
  useEffect(() => {
    const PEREM = 16;
    let meret: ResizeObserver | null = null;
    const merd = () => {
      const sav = document.querySelector<HTMLElement>('.bwc-banner');
      if (!sav) {
        meret?.disconnect();
        meret = null;
        setAlsoTavolsag(PEREM);
        return;
      }
      if (!meret) {
        meret = new ResizeObserver(() => setAlsoTavolsag(sav.offsetHeight + 12));
        meret.observe(sav);
      }
      setAlsoTavolsag(sav.offsetHeight + 12);
    };
    merd();
    const jelenlet = new MutationObserver(merd);
    jelenlet.observe(document.body, { childList: true });
    return () => {
      jelenlet.disconnect();
      meret?.disconnect();
    };
  }, []);

  // Escape-re zár, mint minden réteg a weblapon.
  useEffect(() => {
    if (!nyitva) return;
    const kez = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNyitva(false);
    };
    window.addEventListener('keydown', kez);
    return () => window.removeEventListener('keydown', kez);
  }, [nyitva]);

  // ——— a keresés menete ————————————————————————————————————————
  function valaszol(kerdes: string, valasztottGep = gepId) {
    if (!index) return;

    // A beírt szövegben lehet géptípus is („nyomtatófej SQUIX 4") — ilyenkor
    // nem kell külön rákérdezni.
    const felismert = gepFelismeres(index, kerdes);
    const gep = valasztottGep ?? felismert[0] ?? null;
    if (gep && gep !== valasztottGep) {
      setGepId(gep);
      const nev = index.gepek.find((g) => g.id === gep)?.nev;
      if (nev) hozzafuz({ ki: 'gep', szoveg: t.machineSet(nev) });
    }

    const eredmeny = keres(index, kerdes, gep);
    if (!eredmeny.talalatok.length) {
      hozzafuz({ ki: 'gep', szoveg: gep ? t.noResultsMachine : t.noResults });
      return;
    }

    hozzafuz({
      ki: 'gep',
      szoveg: t.resultsFor(eredmeny.talalatok.length),
      talalatok: eredmeny.talalatok,
    });

    // Ha nincs megadva gép, és a találatok több típust érintenek, a lista
    // önmagában nem elég: a 4"-os és a 6"-os nyomtatófej különböző cikkszám.
    if (
      !gep &&
      !eredmeny.cikkszamra &&
      (eredmeny.erintettGepek.length > SZUKITES_HATAR ||
        eredmeny.talalatok.length > SZUKITES_HATAR)
    ) {
      hozzafuz({ ki: 'gep', szoveg: `${t.askMachine}\n\n${t.whereIsType}`, gepkerdes: true });
    }
  }

  function kuld(e: React.FormEvent) {
    e.preventDefault();
    const szoveg = beirt.trim();
    if (!szoveg) return;
    setBeirt('');
    hozzafuz({ ki: 'vevo', szoveg });
    if (hiba) {
      hozzafuz({ ki: 'gep', szoveg: t.loadError });
      return;
    }
    if (!index) {
      // Még tölt: amint megjön az index, a következő kérdés már működik.
      hozzafuz({ ki: 'gep', szoveg: t.loading });
      betoltIndex()
        .then((i) => {
          setIndex(i);
          const eredmeny = keres(i, szoveg, gepId);
          hozzafuz(
            eredmeny.talalatok.length
              ? { ki: 'gep', szoveg: t.resultsFor(eredmeny.talalatok.length), talalatok: eredmeny.talalatok }
              : { ki: 'gep', szoveg: t.noResults },
          );
        })
        .catch(() => {
          setHiba(true);
          hozzafuz({ ki: 'gep', szoveg: t.loadError });
        });
      return;
    }
    valaszol(szoveg);
  }

  function gepValasztas(id: string) {
    if (!index) return;
    const nev = index.gepek.find((g) => g.id === id)?.nev;
    setGepId(id);
    setGepSzuro('');
    hozzafuz({ ki: 'vevo', szoveg: nev ?? id });
    // Az utolsó vevői kérdést megismételjük a szűkített körben.
    const utolso = [...uzenetek].reverse().find((u) => u.ki === 'vevo');
    if (utolso) valaszol(utolso.szoveg, id);
    else hozzafuz({ ki: 'gep', szoveg: t.machineReady });
  }

  /** A levélbe kerülő összefoglaló — a vevő pontosan ezt látja küldés előtt. */
  function atirat(): string {
    const sorok = uzenetek.map((u) => {
      const fej = u.ki === 'vevo' ? '>' : '·';
      const talalat = (u.talalatok ?? [])
        .slice(0, 6)
        .map((x) => `    ${x.cikkszam}  ${x.megnevezes}`)
        .join('\n');
      return [`${fej} ${u.szoveg}`, talalat].filter(Boolean).join('\n');
    });
    return sorok.join('\n');
  }

  async function urlapKuldes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const adat = new FormData(form);
    const hozzajarul = adat.get('hozzajarulas') === 'on';
    if (!hozzajarul) {
      toast.error(t.consentRequired);
      return;
    }
    setKuldes(true);
    const nev = String(adat.get('nev') ?? '').trim();
    const email = String(adat.get('email') ?? '').trim();
    const telefon = String(adat.get('telefon') ?? '').trim();
    const ceg = String(adat.get('ceg') ?? '').trim();
    const megjegyzes = String(adat.get('megjegyzes') ?? '').trim();
    const cikkszam = urlap?.cikkszam ?? '';

    const targy = cikkszam
      ? `${t.subjectQuote}: ${cikkszam}`
      : `${t.subjectHelp}${gepNev ? ` — ${gepNev}` : ''}`;
    const torzs = [
      megjegyzes,
      '',
      cikkszam ? `${t.partNumber}: ${cikkszam}` : '',
      gepNev ? `${t.machine}: ${gepNev}` : '',
      '',
      `— ${t.transcript} —`,
      atirat(),
      '',
      '—',
      `${t.formName}: ${nev}`,
      `${t.formEmail}: ${email}`,
      telefon ? `${t.formPhone}: ${telefon}` : '',
      ceg ? `${t.formCompany}: ${ceg}` : '',
    ].filter((x) => x !== undefined);

    try {
      const eredmeny = await sendForm({
        fields: {
          nev,
          email,
          telefon,
          ceg,
          cikkszam,
          gep: gepNev ?? '',
          megjegyzes,
          beszelgetes: atirat(),
          _gotcha: String(adat.get('_gotcha') ?? ''),
        },
        subject: targy,
        bodyLines: torzs,
        recipient: 'info@blueway.hu',
      });
      toast.success(eredmeny === 'sent' ? t.sent : t.sentMailto);
      setUrlap(null);
      hozzafuz({ ki: 'gep', szoveg: t.sent });
    } catch {
      toast.error(t.error);
    } finally {
      setKuldes(false);
    }
  }

  const gepLista = useMemo(() => {
    if (!index) return [];
    const sz = gepSzuro.trim().toLowerCase();
    if (!sz) return index.gepek;
    return index.gepek.filter((g) => g.k.some((k) => k.includes(sz)) || g.id.includes(sz));
  }, [index, gepSzuro]);

  const mezoOsztaly =
    'w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

  return (
    <>
      {/* A fül. Jobb szélen, függőleges felirattal — nem takar tartalmat. */}
      <button
        type="button"
        onClick={() => setNyitva(true)}
        aria-expanded={nyitva}
        className={`fixed top-1/2 right-0 z-40 hidden -translate-y-1/2 rounded-l-xl bg-brand-700 py-4 pr-2 pl-2.5 text-xs font-medium tracking-wide text-white shadow-lg transition-[background-color,padding] hover:bg-brand-800 hover:pr-3 md:block ${
          nyitva ? 'pointer-events-none opacity-0' : ''
        }`}
        style={{ writingMode: 'vertical-rl' }}
      >
        {t.tabLabel}
      </button>

      {/* Mobilon feliratos gomb: a függőleges fül ott elfedné a tartalmat, a
          puszta nagyító-ikon viszont nem árulja el, mi rejlik mögötte. */}
      <button
        type="button"
        onClick={() => setNyitva(true)}
        className={`fixed right-4 z-40 flex items-center gap-2 rounded-full bg-brand-700 py-3 pr-4 pl-3.5 text-sm font-medium text-white shadow-lg transition-[background-color,bottom] hover:bg-brand-800 md:hidden ${
          nyitva ? 'pointer-events-none opacity-0' : ''
        }`}
        style={{ bottom: alsoTavolsag }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" strokeLinecap="round" />
        </svg>
        {t.tabLabel}
      </button>

      {nyitva && (
        <div
          className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-[1px]"
          onClick={() => setNyitva(false)}
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-modal={nyitva}
        aria-label={t.title}
        // Csukott állapotban a fül a képernyőn kívül van, de a benne lévő
        // gombok tabbal még elérhetők lennének. Az `inert` egyszerre veszi ki
        // őket a billentyűzet-sorrendből és a képernyőolvasóból — az
        // aria-hidden önmagában csak az utóbbit tenné meg.
        inert={!nyitva}
        className={`fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl transition-transform duration-300 ${
          nyitva ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">{t.title}</h2>
            <p className="mt-0.5 text-xs text-ink-muted">{t.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setNyitva(false)}
            aria-label={t.close}
            className="-mt-1 -mr-1 rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {gepNev && (
          <div className="flex items-center justify-between gap-3 border-b border-line bg-brand-50 px-5 py-2 text-xs">
            <span className="truncate font-medium text-brand-800">{t.machineSet(gepNev)}</span>
            <button
              type="button"
              onClick={() => {
                setGepId(null);
                hozzafuz({ ki: 'gep', szoveg: `${t.askMachine}\n\n${t.whereIsType}`, gepkerdes: true });
              }}
              className="shrink-0 underline transition-colors hover:text-brand-900"
            >
              {t.changeMachine}
            </button>
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {uzenetek.map((u) => (
            <div key={u.id} className={u.ki === 'vevo' ? 'flex justify-end' : ''}>
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                  u.ki === 'vevo'
                    ? 'bg-brand-700 text-white'
                    : 'border border-line bg-white text-ink'
                }`}
              >
                {u.szoveg}
              </div>

              {u.talalatok && u.talalatok.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {u.talalatok.map((x) => (
                    <li
                      key={x.cikkszam}
                      className="rounded-xl border border-line bg-white p-3 text-sm"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-mono font-medium text-brand-800">{x.cikkszam}</span>
                        {x.spr && (
                          <span
                            title={t.sprHint}
                            className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-muted"
                          >
                            {t.sprLabel} {x.spr}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5">{x.megnevezes}</p>
                      {x.egysegek[0] && (
                        <p className="mt-1 text-xs text-ink-muted">
                          {t.assembly}: {x.egysegek[0]}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-ink-muted">{t.usedIn(x.gepek.length)}</p>
                      <button
                        type="button"
                        onClick={() => setUrlap({ cikkszam: x.cikkszam })}
                        className="mt-2 rounded-full bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-800"
                      >
                        {t.quote}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {u.gepkerdes && index && (
                <div className="mt-2 rounded-xl border border-line bg-white p-3">
                  <input
                    type="text"
                    value={gepSzuro}
                    onChange={(e) => setGepSzuro(e.target.value)}
                    placeholder={t.machineFilter}
                    className={mezoOsztaly}
                    aria-label={t.machineFilter}
                  />
                  <div className="mt-2 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
                    {gepLista.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => gepValasztas(g.id)}
                        className="rounded-full border border-line px-2.5 py-1 text-xs transition-colors hover:border-brand-300 hover:bg-brand-50"
                      >
                        {g.nev}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {betoltes && <p className="text-xs text-ink-muted">{t.loading}</p>}

          {/* Kézi átvétel: bármikor kérhető, nem csak találat nélkül. */}
          {!urlap && uzenetek.length > 1 && (
            <button
              type="button"
              onClick={() => setUrlap({})}
              className="text-xs text-brand-700 underline transition-colors hover:text-brand-800"
            >
              {t.stuck}
            </button>
          )}

          {urlap && (
            <form
              onSubmit={urlapKuldes}
              className="space-y-2.5 rounded-2xl border border-brand-200 bg-white p-4"
            >
              <p className="text-sm font-medium">
                {urlap.cikkszam ? `${t.quote} — ${urlap.cikkszam}` : t.handoffTitle}
              </p>
              <p className="text-xs text-ink-muted">{t.handoffIntro}</p>
              {/* Rejtett csapdamező a küldőrobotoknak. */}
              <input
                type="text"
                name="_gotcha"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <input name="nev" required placeholder={t.formName} className={mezoOsztaly} />
              <input
                name="email"
                type="email"
                required
                placeholder={t.formEmail}
                className={mezoOsztaly}
              />
              <input name="telefon" placeholder={t.formPhone} className={mezoOsztaly} />
              <input name="ceg" placeholder={t.formCompany} className={mezoOsztaly} />
              <textarea
                name="megjegyzes"
                rows={2}
                placeholder={t.formNote}
                className={mezoOsztaly}
              />

              <details className="rounded-xl border border-line bg-surface p-2.5">
                <summary className="cursor-pointer text-xs font-medium">{t.transcript}</summary>
                <pre className="mt-2 max-h-40 overflow-auto text-[11px] whitespace-pre-wrap text-ink-muted">
                  {atirat()}
                </pre>
              </details>

              <label className="flex items-start gap-2 text-xs text-ink-muted">
                <input type="checkbox" name="hozzajarulas" className="mt-0.5" required />
                <span>
                  {t.consent}{' '}
                  <a
                    href={asset(
                      lang === 'hu' ? '/adatkezelesi-tajekoztato.html' : '/privacy-policy.html',
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {t.privacyLink}
                  </a>
                </span>
              </label>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={kuldes}
                  className="rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
                >
                  {kuldes ? t.sending : t.sendRequest}
                </button>
                <button
                  type="button"
                  onClick={() => setUrlap(null)}
                  className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-ink-muted"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          )}

          <div ref={also} />
        </div>

        <form onSubmit={kuld} className="border-t border-line bg-white px-5 py-3">
          <div className="flex gap-2">
            <input
              ref={mezo}
              value={beirt}
              onChange={(e) => setBeirt(e.target.value)}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              className={mezoOsztaly}
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              {t.send}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">{t.disclaimer}</p>
        </form>
      </aside>
    </>
  );
}
