/* ============================================================
   SANZA · museo immersivo — l'eseguibile del totem
   ------------------------------------------------------------
   Un Chromium con dentro il sito: sul PC del totem non serve
   nessun browser installato e non serve la rete. Il sito è lo
   stesso index.html del repo, copiato dentro l'exe al momento
   della compilazione (cartella site/ fra le risorse) e aperto in
   modalità totem, a schermo intero.

   I file non si aprono da file:// — da lì il browser blocca la
   lettura del modello 3D — ma da un indirizzo interno, app://sanza/,
   servito qui sotto direttamente dal disco.

   Si esce con Alt+F4. Opzione: --attesa=90 cambia i secondi di
   inattività prima del ritorno al benvenuto (vedi index.html).
   ============================================================ */
const { app, BrowserWindow, Menu, protocol, powerSaveBlocker } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { Readable } = require('node:stream');

const SITO = app.isPackaged
  ? path.join(process.resourcesPath, 'site')
  : path.join(__dirname, '..');            // in sviluppo: la radice del repo

const TIPI = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.glb': 'model/gltf-binary', '.wasm': 'application/wasm',
};

protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
}]);

/* Un doppio tocco sull'icona non deve aprire due musei */
if (!app.requestSingleInstanceLock()) app.quit();

app.commandLine.appendSwitch('disable-pinch');
app.commandLine.appendSwitch('overscroll-history-navigation', '0');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-features', 'Translate');

/* Serve un file del sito. I video chiedono il file a pezzi (Range):
   senza la risposta 206 partirebbero ma non si potrebbero riavvolgere. */
async function servi(richiesta) {
  const url = new URL(richiesta.url);
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(SITO, path.normalize(rel));
  if (!file.startsWith(SITO + path.sep)) return new Response(null, { status: 403 });

  let info;
  try { info = await fs.promises.stat(file); } catch { return new Response(null, { status: 404 }); }
  if (!info.isFile()) return new Response(null, { status: 404 });

  const intestazioni = {
    'Content-Type': TIPI[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
  };
  const m = /^bytes=(\d*)-(\d*)$/.exec(richiesta.headers.get('range') || '');
  if (m && (m[1] || m[2])) {
    let da = m[1] === '' ? Math.max(0, info.size - Number(m[2])) : Number(m[1]);
    let a = m[1] === '' || m[2] === '' ? info.size - 1 : Math.min(Number(m[2]), info.size - 1);
    if (da > a || da >= info.size) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${info.size}` } });
    }
    return new Response(Readable.toWeb(fs.createReadStream(file, { start: da, end: a })), {
      status: 206,
      headers: { ...intestazioni, 'Content-Length': String(a - da + 1), 'Content-Range': `bytes ${da}-${a}/${info.size}` },
    });
  }
  return new Response(Readable.toWeb(fs.createReadStream(file)), {
    status: 200,
    headers: { ...intestazioni, 'Content-Length': String(info.size) },
  });
}

function apri() {
  const attesa = process.argv.map(a => /^--attesa=(\d+)$/.exec(a)).find(Boolean);
  const indirizzo = 'app://sanza/?totem=1' + (attesa ? `&attesa=${attesa[1]}` : '');

  const finestra = new BrowserWindow({
    kiosk: true,
    fullscreen: true,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#0c1a21',      // la notte del sito: nessun lampo bianco all'avvio
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false },
  });

  /* Dal museo non si esce: niente finestre nuove, niente altri siti. */
  finestra.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  finestra.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://sanza/')) e.preventDefault(); });

  /* Se la pagina si pianta (memoria grafica, driver), si riparte da soli */
  finestra.webContents.on('render-process-gone', () => finestra.loadURL(indirizzo));
  finestra.on('unresponsive', () => finestra.webContents.reload());

  finestra.loadURL(indirizzo);
}

app.whenReady().then(() => {
  protocol.handle('app', servi);
  Menu.setApplicationMenu(null);
  powerSaveBlocker.start('prevent-display-sleep');   // lo schermo del totem non si spegne
  apri();
});
app.on('window-all-closed', () => app.quit());
