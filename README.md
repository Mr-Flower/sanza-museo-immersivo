# SANZA · museo immersivo

Sito statico dedicato al pellegrinaggio della **Madonna della Neve** sul Monte Cervati:
la notte del 26 luglio i *marunnari* portano la statua a spalla da Sanza (558 m) fino
alla vetta (1898 m). Una pagina sola, che segue la salita dal buio alla luce.

Declinazione **museo** dell'identità *Sanza · il borgo dell'accoglienza*.

## Aprirlo in locale

**Non** con un doppio clic sul file: da `file://` il browser blocca per CORS la lettura
del modello 3D (`.glb`), e sembra un guasto del solo 3D mentre video e panorami funzionano.

```
python3 -m http.server
```

poi `http://localhost:8000/`.

## Struttura

```
index.html              tutto il sito: markup, stile e script in un file solo
sw.js                   service worker: il sito regge senza rete (vedi «Totem»)
totem-app/              l'eseguibile portatile del totem (Electron), vedi «Totem»
totem.bat               in alternativa: avvio del sito online in Chrome a schermo intero
manifest.webmanifest    nome e icona per installare il sito come app
assets/logo/            marchio ufficiale in SVG, estratto dal brand book
assets/video/           riprese d'archivio (H.264 720p + poster JPG)
assets/360/             panorami equirettangolari 4096×2048
assets/3d/              rilievo fotogrammetrico della statua (GLB, meshopt)
assets/mappa/           la carta della salita, immagine statica (vedi «Note tecniche»)
assets/vendor/          pannellum, three e i caratteri: nessun CDN, vedi sotto
risorse/                master originali — NON versionati, vedi .gitignore
```

Nessun backend. È pubblicato con **GitHub Pages** dal branch `main`, root del repo:
<https://mr-flower.github.io/sanza-museo-immersivo/>
`risorse/` va tenuta fuori (~300 MB, e due file superano il limite GitHub di 100 MB).

## Totem del museo

Il sito gira su un totem verticale touch (9:16, 42") collegato a un PC Windows.
Si apre l'indirizzo pubblico di GitHub Pages con **`?totem=1`** in coda, così una
modifica pubblicata con un push arriva al totem da sola, senza mettere mano alla
macchina in sala. `?totem=1` cambia quattro cose rispetto al sito normale:

- **Testi grandi.** L'unità di base è legata alla larghezza dello schermo
  (`1rem = 1/37` della larghezza, ~29 px su un pannello da 1080): il corpo del
  testo è alto circa un centimetro e mezzo, qualunque sia la risoluzione del
  pannello. Per ingrandire o rimpicciolire tutto insieme si cambia quel `37` in
  `html.totem{font-size:calc(100vw / 37)}` — più basso, più grande.
  L'impaginazione è quella verticale del telefono.
- **Ritorno al benvenuto.** Dopo un minuto senza tocchi e senza video in
  riproduzione si torna alla schermata di scelta della lingua; negli ultimi 15
  secondi compare «Sei ancora qui?» con il conto alla rovescia. Il tempo si
  regola dall'indirizzo: `?totem=1&attesa=90` (secondi, minimo 30).
  Tornata al benvenuto la pagina si ricarica: è così che il totem prende gli
  aggiornamenti senza essere riavviato. Al benvenuto si torna anche a mano,
  dalla casetta in testata o dal pulsante in fondo alla pagina (anche fuori
  dal totem).
- **Comandi da sala.** Video con un solo comando grande (un tocco avvia, un
  tocco ferma), pulsanti dei 360 e del 3D ingranditi, niente selezione del
  testo né menu della pressione lunga, link verso altri siti spenti.
- **Tutto in cache.** Video, panorami e modello 3D (~35 MB) vengono scaricati
  subito, per reggere senza rete (vedi sotto).

### L'eseguibile (consigliato)

**`Sanza-Museo.exe`** è il sito chiuso in un eseguibile portatile per Windows:
doppio clic e parte a schermo intero, in modalità totem. Dentro c'è tutto —
pagina, video, panorami, modello 3D e il motore del browser — quindi sul PC non
serve Chrome e non serve la rete, nemmeno la prima volta.

Si scarica sempre da qui, ed è sempre l'ultima versione:
<https://github.com/Mr-Flower/sanza-museo-immersivo/releases/download/totem/Sanza-Museo.exe>

- Si copia il file sul PC del totem (anche da chiavetta) e si apre. Non
  installa nulla. All'avvio impiega qualche secondo, perché si scompatta in una
  cartella temporanea: è normale.
- La prima volta Windows può mostrare «PC protetto da Windows» (il file non è
  firmato): *Ulteriori informazioni → Esegui comunque*.
- Si esce con `Alt+F4` (serve una tastiera collegata).
- Per farlo partire all'accensione: `Win+R`, scrivere `shell:startup`, e
  mettere lì un collegamento all'exe.
- Il tempo di inattività si cambia nel collegamento, aggiungendo in fondo alla
  destinazione ` --attesa=90` (secondi).
- **Aggiornamenti**: il sito dentro l'exe è quello del momento in cui è stato
  compilato. A ogni push su `main` GitHub ricompila l'exe da solo (Actions →
  «Eseguibile del totem», una decina di minuti) e lo rimette all'indirizzo qui
  sopra: per aggiornare il totem si scarica di nuovo e si sostituisce il file.

Il codice sta in `totem-app/` (Electron): `main.js` apre la finestra e serve i
file del sito da un indirizzo interno, `app://sanza/`. Per provarlo o compilarlo
a mano serve Node: `cd totem-app && npm install`, poi `npm start` per aprirlo e
`npm run exe` per compilare (su Windows; il risultato va in `totem-app/dist/`).

Vanno comunque sistemate sul PC le cose elencate in «Sul PC, una volta sola»
qui sotto.

### In alternativa: il sito online in Chrome (Windows)

Rispetto all'exe ha un vantaggio — le modifiche pubblicate arrivano al totem da
sole — e due condizioni: Chrome installato e la rete almeno alla prima apertura.

Nel repo c'è **`totem.bat`**: doppio clic e Chrome si apre a schermo intero in
modalità chiosco sull'indirizzo del totem. Serve Google Chrome installato.

1. Copiare `totem.bat` sul PC del totem (basta quel file; l'icona è
   `assets/logo/icona.ico`).
2. Tasto destro sul file → *Crea collegamento*, spostare il collegamento sul
   desktop, rinominarlo «Sanza museo» e da *Proprietà → Cambia icona* scegliere
   `icona.ico`. In *Proprietà → Esegui* mettere *Ridotta a icona*, così la
   finestra nera del comando non si vede.
3. Per farlo partire all'accensione: `Win+R`, scrivere `shell:startup`, e
   copiare lì il collegamento.
4. La prima volta aprirlo **con la rete collegata** e lasciarlo un paio di
   minuti: sta scaricando i media. Poi staccare il cavo e riaprirlo per
   verificare che parta lo stesso.

Si esce con `Alt+F4` (serve una tastiera collegata).

Le opzioni che contano, per chi dovesse rifare il comando a mano:

```
chrome.exe --kiosk "https://mr-flower.github.io/sanza-museo-immersivo/?totem=1" ^
  --user-data-dir="%LOCALAPPDATA%\SanzaTotem" ^
  --no-first-run --no-default-browser-check --noerrdialogs ^
  --disable-session-crashed-bubble --disable-features=Translate ^
  --disable-pinch --overscroll-history-navigation=0 ^
  --autoplay-policy=no-user-gesture-required
```

- `--user-data-dir` dà al totem un profilo suo e **permanente**: è lì che vive
  la copia del sito per quando manca la rete. Per questo **non va usato
  `--incognito`**, che la cancellerebbe a ogni chiusura. Stessa ragione per cui
  la modalità chiosco di **Edge** non va bene: gira sempre in InPrivate.
- `--disable-pinch` e `--overscroll-history-navigation=0` tolgono lo zoom a due
  dita e lo «scorri per tornare indietro».
- Non serve più `--force-device-scale-factor`: la dimensione dei testi la
  decide la pagina.

Sul PC, una volta sola:

- schermo ruotato in verticale (*Impostazioni → Schermo → Orientamento*);
- accesso automatico all'avvio (`netplwiz`, togliere la richiesta di password);
- *Alimentazione*: mai spegnere lo schermo, mai sospendere; salvaschermo spento;
- notifiche disattivate (*Non disturbare* sempre attivo) e orario di attività
  di Windows Update impostato sulle ore di apertura, così non riavvia in sala;
- i gesti dai bordi dello schermo (lo scorrimento da sinistra o da destra che
  apre i pannelli di Windows) si spengono dal registro:
  `HKLM\SOFTWARE\Policies\Microsoft\Windows\EdgeUI`, valore DWORD
  `AllowEdgeSwipe` = `0`.

In alternativa al `.bat`: aprendo il sito in Chrome, dal menu *Trasmetti, salva
e condividi → Installa pagina come app* si ottiene un'icona sul desktop che apre
il sito in una finestra propria a schermo intero (c'è un `manifest.webmanifest`
apposta). È più rapido ma meno chiuso: non toglie pinch e gesti, e non è un vero
chiosco. Va bene per una prova, per la sala è meglio il `.bat`.

### Senza rete

Niente CDN: pannellum, three e i due caratteri stanno in `assets/vendor/`
(versioni congelate — pannellum 2.5.6, three r128, sottoinsiemi latin e
latin-ext), così una rete che cade non lascia i 360 muti e i testi con il
carattere sbagliato. Sopra c'è `sw.js`, che tiene in cache la pagina intera:
dopo la prima apertura il totem lavora offline, anche se viene acceso senza
rete, e si riallinea da solo quando la connessione torna. Un push si vede al
secondo ritorno al benvenuto: al primo la versione nuova viene scaricata, a
quello dopo viene mostrata.

`?totem=1` fa anche precaricare tutti i media — video, panorami e modello 3D,
~35 MB. Fuori da quel caso **non** succede: lo stesso indirizzo lo aprono i
visitatori dal telefono, e i media entrano in cache solo se guardati davvero.
In console (`F12`) si legge `[totem] media in cache: 9/9 — pronto anche
offline`: è il modo per sapere, in fase di installazione, che il totem regge
anche staccato.

Quando cambiano i media o le librerie va aggiornato l'elenco in cima a `sw.js`
e alzata la costante `VERSIONE`, altrimenti il totem resta sui vecchi file.

Nel sito non c'è più niente che dipenda da internet: anche la mappa è
un'immagine del repo (vedi «Note tecniche»).

Se in sala non ci sarà **mai** rete, nemmeno la prima volta, l'indirizzo
pubblico non basta: va copiata la cartella del sito sul PC e servita in locale
(`python -m http.server 8000` avviato insieme al totem, e nel `.bat`
`URL=http://localhost:8000/?totem=1`). In quel caso gli aggiornamenti si
portano a mano.

## Lingue

Il sito è in italiano e in inglese. La prima schermata fa scegliere la lingua;
poi si cambia dal selettore `IT | EN` in testata. Dal telefono la scelta vale
per la visita in corso, sul totem si richiede a ogni visitatore.

L'italiano è quello scritto nell'HTML e resta la fonte. Ogni elemento da
tradurre porta un `data-t="chiave"`, e l'inglese corrispondente sta
nell'oggetto `EN` all'inizio dello script. Per aggiungere o cambiare un testo:
si scrive l'italiano nella pagina, gli si dà una chiave, e si mette la stessa
chiave in `EN`. Le poche frasi generate dallo script e le etichette per i
lettori di schermo stanno in `TESTI`, nelle due lingue.

## Da completare prima di pubblicare

- **Crediti**: panorami 360° e rilievo 3D sono accreditati al **Centro ICT per i Beni
  Culturali — Università degli Studi di Salerno**, 2026, che ne detiene i diritti.
  I **due video d'archivio** provengono da **TeleCervati**; restano da accertare
  l'anno delle riprese e il detentore dei diritti, e le loro didascalie lo dichiarano.
- **Panorama mancante**: la partenza notturna dalla Chiesa Madre non ha ancora una
  ripresa reale. Il visore che mostrava un placeholder procedurale è stato tolto:
  quando la ripresa arriverà, si rimette con lo stesso schema degli altri quattro.
- **Hotspot**: i punti d'interesse dei 360 si aggiungono negli array `hotSpots` con
  pitch/yaw. Sui quattro panorami reali sono da rifare: quelli precedenti erano tarati
  sui placeholder procedurali e sulle foto vere sarebbero caduti su punti a caso, così
  sono stati rimossi. Per ricavare le coordinate: aprire il visore, inquadrare il punto
  e leggere `viewer.getPitch()` / `viewer.getYaw()` dalla console.
- **Carattere**: il brand book prescrive il **Divenire**, non disponibile. Il marchio non
  ne ha bisogno (è vettoriale, lettering già in curve), ma i testi della pagina usano
  `Archivo` e `Hanken Grotesk` come sostituti.

## Note tecniche non ovvie

- **Marchio**: è quello ufficiale nella **declinazione museo** (brand book 04.01),
  estratto in vettoriale dal PDF: lettering, parola "museo" e payoff sono i tracciati
  originali in Divenire già convertiti in curve, nelle proporzioni del lockup (02.7).
  Sta nei `<symbol>` `#mk-museo` (lockup intero), `#mk-museo-lett` (senza payoff) e
  `#mk-lettering` (solo logotipo) a inizio `<body>`; il colore si passa dall'esterno con
  `--mk-marchio` / `--mk-payoff`. Copie autonome in `assets/logo/`.
  Il marchio museo **è giallo** `#FFA300` — non è un accento aggiunto, è la
  declinazione cromatica prevista. Il payoff segue il fondo: bianco su scuro, nero su
  chiaro (02.10). Nella testata si usa il solo logotipo perché alle dimensioni della
  barra payoff e "museo" scenderebbero sotto la leggibilità (02.9).
- **Palette**: solo i colori del brand book — giallo museo `#FFA300` (137 C), azzurro
  istituzionale `#0092BC` (313 C), nero/bianco e i neutri di fondo. Niente varianti
  inventate del giallo: dove il giallo non regge il contrasto (la sezione chiara della
  vetta) si passa ai colori istituzionali, nero per i testi piccoli e azzurro per la
  quota grande.
- **Pittogramma casa**: la casetta del righello, dei nodi della mappa, della legenda e
  delle schede è la **A del marchio**, con la porticina ad arco — lo stesso tracciato del
  `<symbol>` `#casa`, applicato come maschera CSS così prende il colore da `currentColor`.
- **Mappa**: non è Google Maps ma un'immagine, `assets/mappa/sanza-cervati.jpg`
  (1515×1237), così funziona senza rete e il dito che ci passa sopra scorre la
  pagina. È un ritaglio di OpenTopoMap a zoom 14 fra 15.445–15.575 E e
  40.2245–40.3055 N; il credito «© OpenStreetMap contributors, SRTM · OpenTopoMap
  (CC-BY-SA)» sta nell'angolo e **va lasciato**, è la condizione della licenza.
  I tre nodi sono link posizionati in percentuale (`left`/`top`) sulle coordinate
  di OpenStreetMap: Chiesa di Santa Maria Assunta (40.2422 N, 15.5518 E),
  Affondatore di Vallivona (40.2629, 15.4702), santuario della Madonna della Neve
  (40.2901, 15.4773). Se si cambia l'immagine vanno ricalcolate le percentuali.
- **Rotella del mouse**: i 360 hanno `mouseZoom:false` e si aprono a `hfov 120` (il
  massimo di pannellum), così il puntatore che passa sopra un panorama non ruba lo
  scroll alla pagina; per avvicinarsi ci sono i pulsanti `+/−`. Il 3D invece zooma con
  la rotella, ma non nei 400 ms successivi a uno scroll — stessa ragione.
- **Il modello 3D non va decimato qui**: la mesh è una *triangle soup* (vertici mai
  condivisi), quindi il simplify normale non riduce nulla e quello aggressivo (`gltfpack -sa`)
  collassa le cuciture UV e riempie la doratura di macchie scure. La decimazione va fatta
  a monte, nel software di fotogrammetria, dove le UV vengono ricostruite. Per lo stesso
  motivo il peso non scende sotto gli ~8 MB: senza vertici condivisi la geometria non si
  comprime oltre (meshopt 8,2 MB contro 16,5 MB di Draco). Pipeline da un master:
  rimozione di `COLOR_0` (duplica la texture e scurisce l'oro a chiazze),
  `gltf-transform resize --width 2048 --height 2048`, poi `gltfpack -cc`.
- **Pannellum**: su cdnjs non esistono le varianti `.min` — usare `pannellum.js`/`.css`.
- **Sostituire i media**: i video sono in `VIDEO_NOTTE` / `VIDEO_VETTA` (basta cambiare
  `src`: un file `.mp4`/`.webm` o un URL embed YouTube/Vimeo viene riconosciuto in
  automatico; il titolo va dato in italiano e in inglese), i panorami nelle costanti `PANO_*`, il rilievo in `MODELLO_3D` (gestiti
  sia meshopt sia Draco).

---

Comune di Sanza · con Scabec — Società Campana Beni Culturali
