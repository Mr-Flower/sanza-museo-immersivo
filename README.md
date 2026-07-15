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

poi `http://localhost:8000/sanza-immersiva.html`.

## Struttura

```
sanza-immersiva.html    tutto il sito: markup, stile e script in un file solo
assets/video/           riprese d'archivio (H.264 720p + poster JPG)
assets/360/             panorami equirettangolari 4096×2048
assets/3d/              rilievo fotogrammetrico della statua (GLB, meshopt)
risorse/                master originali — NON versionati, vedi .gitignore
```

Nessun backend: pubblicabile su GitHub Pages o Cloudflare Pages servendo la root.
`risorse/` va tenuta fuori (~250 MB, e due file superano il limite GitHub di 100 MB).

## Da completare prima di pubblicare

- **Crediti**: le didascalie di video, panorami e rilievo 3D riportano `[da completare]`.
  Vanno accertati autore, anno e detentore dei diritti — è materiale d'archivio.
- **Panorama mancante**: `PANO_MARUNNARI` (la partenza notturna dalla Chiesa Madre) non
  ha ancora una ripresa reale: mostra un placeholder procedurale, dichiarato come «demo».
- **Hotspot**: da ri-piazzare sui quattro panorami reali (vedi le note a fine pagina).
- **Carattere**: il brand book prescrive il **Divenire**, non disponibile; il lettering
  usa `Archivo` come sostituto.

## Note tecniche non ovvie

- **Palette**: giallo museo `#FFA300` (Pantone 137 C) da brand book 04.01. L'azzurro
  istituzionale `#0092BC` è definito in `--azzurro` ma riservato ai contesti Comune.
- **Il modello 3D non va decimato qui**: la mesh è una *triangle soup* (vertici mai
  condivisi), quindi il simplify normale non riduce nulla e quello aggressivo (`gltfpack -sa`)
  collassa le cuciture UV e riempie la doratura di macchie scure. La decimazione va fatta
  a monte, nel software di fotogrammetria. Vedi le note a fine pagina per la pipeline.
- **Pannellum**: su cdnjs non esistono le varianti `.min` — usare `pannellum.js`/`.css`.

---

Comune di Sanza · con Scabec — Società Campana Beni Culturali
