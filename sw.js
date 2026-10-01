/* ============================================================
   SANZA · museo immersivo — service worker
   ------------------------------------------------------------
   Serve a una cosa sola: che il totem del museo continui a
   funzionare quando la rete cade. Il sito sta su GitHub Pages,
   quindi senza rete la pagina non arriverebbe affatto; con
   questo, dopo la prima apertura il totem lavora dalla cache e
   si riallinea da solo appena la connessione torna.

   Due livelli, perché lo stesso indirizzo lo aprono anche i
   visitatori dal telefono:

   GUSCIO    pagina, librerie, caratteri e mappa (~2 MB). Precaricato
             sempre, per tutti: è poco e vale anche in mobilità.
   MEDIA     video, panorami 360 e modello 3D (~35 MB). NON si
             precaricano da soli — sarebbero 35 MB addosso a chi
             passa di lì col telefono. Finiscono in cache solo
             quando vengono davvero guardati, oppure tutti in
             blocco se la pagina lo chiede (modalità totem:
             apri il sito con ?totem=1).

   Aggiornamenti: si serve la cache e intanto si richiede la rete
   (stale-while-revalidate). Una modifica pubblicata con un push
   compare al caricamento successivo, non a quello in corso.

   Quando cambiano i media o le librerie: aggiorna l'elenco qui
   sotto e alza VERSIONE, altrimenti il totem resta sui vecchi.
   ============================================================ */

const VERSIONE = 'sanza-museo-v2';

const GUSCIO = [
  './',
  './index.html',
  './assets/vendor/fonts/fonts.css',
  './assets/vendor/pannellum/pannellum.css',
  './assets/vendor/pannellum/pannellum.js',
  './assets/vendor/three/three.min.js',
  './assets/vendor/three/loaders/GLTFLoader.js',
  './assets/vendor/three/loaders/DRACOLoader.js',
  './assets/vendor/three/libs/meshopt_decoder.js',
  './assets/logo/sanza-marchio.svg',
  './assets/logo/sanza-marchio-negativo.svg',
  './assets/logo/sanza-museo.svg',
  './assets/logo/sanza-museo-negativo.svg',
  './assets/logo/sanza-lettering.svg',
  './assets/logo/sanza-museo-lettering.svg',
  './assets/logo/sanza-casa.svg',
  './assets/logo/icona.svg',
  './assets/logo/icona-192.png',
  './assets/logo/icona-512.png',
  './manifest.webmanifest',
  './assets/mappa/sanza-cervati.jpg',
];
/* i caratteri: solo i pesi che la pagina usa davvero nei testi */
for (const f of ['Archivo-500','Archivo-600','Archivo-700','Archivo-800','Archivo-900',
                 'HankenGrotesk-300','HankenGrotesk-400','HankenGrotesk-500',
                 'HankenGrotesk-600','HankenGrotesk-700','HankenGrotesk-800']) {
  GUSCIO.push(`./assets/vendor/fonts/${f}-latin.woff2`);
  GUSCIO.push(`./assets/vendor/fonts/${f}-latin-ext.woff2`);
}

const MEDIA = [
  './assets/video/marunnari-notte.mp4',
  './assets/video/marunnari-notte.jpg',
  './assets/video/marunnari-vetta.mp4',
  './assets/video/marunnari-vetta.jpg',
  './assets/360/vallevona-inghiottitoio.jpg',
  './assets/360/santuario.jpg',
  './assets/360/grotta.jpg',
  './assets/360/cervati-vetta.jpg',
  './assets/3d/madonna-della-neve.glb',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSIONE)
      .then(c => c.addAll(GUSCIO))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const nome of await caches.keys()) {
      if (nome !== VERSIONE) await caches.delete(nome);
    }
    await self.clients.claim();
  })());
});

/* La pagina chiede il precarico completo (modalità totem). Uno alla
   volta, senza fretta: se uno fallisce si tira avanti con gli altri,
   e la chiamata successiva riprenderà quello rimasto indietro. */
self.addEventListener('message', e => {
  if (e.data !== 'precarica-tutto') return;
  e.waitUntil((async () => {
    const c = await caches.open(VERSIONE);
    let fatti = 0, mancanti = 0;
    for (const url of MEDIA) {
      if (await c.match(url)) { fatti++; continue; }
      try { await c.add(url); fatti++; } catch { mancanti++; }
    }
    const esito = { tipo: 'precarico', fatti, mancanti, totale: MEDIA.length };
    for (const cl of await self.clients.matchAll()) cl.postMessage(esito);
  })());
});

/* I video arrivano con richieste Range: una risposta 206 in cache
   sarebbe un troncone inservibile. Si tiene il file intero (cache.add
   fa un GET pieno) e la fetta la si ritaglia qui. */
async function ritaglia(richiesta, risposta) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(richiesta.headers.get('range') || '');
  if (!m) return risposta;
  const buf = await risposta.arrayBuffer(), size = buf.byteLength;
  let da = m[1] === '' ? null : parseInt(m[1], 10);
  let a  = m[2] === '' ? null : parseInt(m[2], 10);
  if (da === null) { da = Math.max(0, size - a); a = size - 1; }
  if (a === null || a >= size) a = size - 1;
  if (da > a || da >= size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  const fetta = buf.slice(da, a + 1);
  return new Response(fetta, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': risposta.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Length': String(fetta.byteLength),
      'Content-Range': `bytes ${da}-${a}/${size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* In cache ogni file ha una copia sola, sotto l'indirizzo senza
     parametri. Il totem apre la pagina con ?totem=1: se la copia
     rinfrescata finisse sotto quell'indirizzo, accanto a quella
     precaricata come './', la ricerca troverebbe sempre la prima —
     la vecchia — e il totem non si aggiornerebbe mai. */
  const chiave = url.origin + url.pathname;

  e.respondWith((async () => {
    const c = await caches.open(VERSIONE);
    const salvata = await c.match(chiave, { ignoreVary: true });

    if (salvata) {
      /* rinfresco in sottofondo: la versione nuova sarà pronta al
         caricamento successivo. Solo per il guscio — rifare la rete
         su 35 MB di media a ogni visita non ha senso. */
      if (!req.headers.get('range')) {
        e.waitUntil((async () => {
          try {
            const fresca = await fetch(req);
            if (fresca.ok && fresca.status === 200) await c.put(chiave, fresca.clone());
          } catch { /* offline: si tiene quella che c'è */ }
        })());
      }
      return ritaglia(req, salvata.clone());
    }

    try {
      const rete = await fetch(req);
      /* le 206 non si archiviano: si rimanda a quando il file
         entrerà intero, col precarico o con cache.add */
      if (rete.ok && rete.status === 200 && rete.type === 'basic') {
        c.put(chiave, rete.clone());
      }
      return rete;
    } catch (err) {
      /* offline e non in cache: per una navigazione si ripiega
         sulla pagina, il resto è perduto e amen */
      if (req.mode === 'navigate') {
        const pagina = await c.match('./index.html');
        if (pagina) return pagina;
      }
      throw err;
    }
  })());
});
