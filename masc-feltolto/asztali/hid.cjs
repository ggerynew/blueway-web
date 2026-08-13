/**
 * Híd az ablak és a program között.
 *
 * Az ablakokban futó kód NEM ér el fájlrendszert és hálózatot: csak az itt
 * felsorolt műveleteket hívhatja. Ez nem formaság — a bizonylatok és a
 * jelszavak a fő folyamatban maradnak, az ablak csak kér és megjelenít.
 *
 * Szándékosan sima CommonJS fájl (.cjs), nem TypeScript: az Electron a
 * homokozott (sandbox) előbetöltőt CommonJS-ként tölti be, és így fordítási
 * lépés nélkül, pontosan ez a fájl kerül a helyére.
 */
const { contextBridge, ipcRenderer } = require('electron');

/** Eseményfeliratkozás úgy, hogy a leiratkozás is lehetséges legyen. */
function figyel(csatorna, visszahivas) {
  const kezelo = (_esemeny, ...ervek) => visszahivas(...ervek);
  ipcRenderer.on(csatorna, kezelo);
  return () => ipcRenderer.removeListener(csatorna, kezelo);
}

contextBridge.exposeInMainWorld('masc', {
  cegek: {
    lista: () => ipcRenderer.invoke('cegek:lista'),
    uj: () => ipcRenderer.invoke('cegek:uj'),
    ment: (ceg) => ipcRenderer.invoke('cegek:ment', ceg),
    torol: (cegId) => ipcRenderer.invoke('cegek:torol', cegId),
    jelszoMenthetoE: () => ipcRenderer.invoke('cegek:jelszoMenthetoE'),
  },
  ceg: {
    adat: (cegId) => ipcRenderer.invoke('ceg:adat', cegId),
    csatlakoz: (cegId) => ipcRenderer.invoke('ceg:csatlakoz', cegId),
    lecsatlakoz: (cegId) => ipcRenderer.invoke('ceg:lecsatlakoz', cegId),
    szinkron: (cegId) => ipcRenderer.invoke('ceg:szinkron', cegId),
    atvizsgal: (cegId) => ipcRenderer.invoke('ceg:atvizsgal', cegId),
    fajlok: (cegId) => ipcRenderer.invoke('ceg:fajlok', cegId),
    ujraSorba: (cegId, ut) => ipcRenderer.invoke('ceg:ujraSorba', cegId, ut),
    ablak: (cegId) => ipcRenderer.invoke('ceg:ablak', cegId),
  },
  mappatValaszt: () => ipcRenderer.invoke('mappa:valaszt'),
  fajltMutat: (ut) => ipcRenderer.invoke('fajl:mutat', ut),

  amikorValtozas: (visszahivas) => figyel('ceg:valtozas', visszahivas),
  amikorNaplo: (visszahivas) => figyel('ceg:naplo', visszahivas),
  amikorFajl: (visszahivas) => figyel('ceg:fajl', visszahivas),
  amikorCegekFrissultek: (visszahivas) => figyel('cegek:frissult', visszahivas),
});
