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
assets/logo/            marchio ufficiale in SVG, estratto dal brand book
assets/video/           riprese d'archivio (H.264 720p + poster JPG)
assets/360/             panorami equirettangolari 4096×2048
assets/3d/              rilievo fotogrammetrico della statua (GLB, meshopt)
risorse/                master originali — NON versionati, vedi .gitignore
```

Nessun backend. È pubblicato con **GitHub Pages** dal branch `main`, root del repo:
<https://mr-flower.github.io/sanza-museo-immersivo/>
`risorse/` va tenuta fuori (~300 MB, e due file superano il limite GitHub di 100 MB).

## Da completare prima di pubblicare

- **Crediti**: le didascalie di video, panorami e rilievo 3D riportano `[da completare]`.
  Vanno accertati autore, anno e detentore dei diritti — è materiale d'archivio.
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

- **Marchio**: è quello ufficiale, estratto in vettoriale dal PDF del brand book
  (tavole 02.1–02.5); lettering e payoff sono i tracciati originali in Divenire già
  convertiti in curve. Sta nei `<symbol>` `#mk-lettering` e `#mk-marchio` a inizio
  `<body>`, si colora dall'esterno con `--mk-lettering` / `--mk-payoff`, e in
  `assets/logo/` ci sono le copie autonome. Su fondo scuro va in bianco (02.10) e
  **non** va colorato di giallo: 02.14 vieta i colori fuori palette istituzionale.
- **Palette**: giallo museo `#FFA300` (Pantone 137 C) da brand book 04.01, usato per la
  declinazione e gli accenti. L'azzurro istituzionale `#0092BC` (Pantone 313 C) è la
  versione del marchio su fondo chiaro.
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
  automatico), i panorami nelle costanti `PANO_*`, il rilievo in `MODELLO_3D` (gestiti
  sia meshopt sia Draco).

---

Comune di Sanza · con Scabec — Società Campana Beni Culturali
