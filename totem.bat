@echo off
rem ============================================================
rem  SANZA museo - avvio del totem (Windows)
rem  Doppio clic: apre il sito a schermo intero, in modalita chiosco.
rem  Per uscire: Alt+F4 (serve una tastiera).
rem  Istruzioni complete nel README, sezione "Totem del museo".
rem ============================================================

set "URL=https://mr-flower.github.io/sanza-museo-immersivo/?totem=1"

rem Profilo dedicato e permanente: e qui che resta la copia del sito
rem per quando manca la rete. Non usare --incognito: la cancellerebbe
rem a ogni chiusura.
set "PROFILO=%LOCALAPPDATA%\SanzaTotem"

set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%BROWSER%" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%BROWSER%" set "BROWSER=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not exist "%BROWSER%" (
  echo Google Chrome non trovato. Installarlo da https://www.google.com/chrome/
  pause
  exit /b 1
)

start "" "%BROWSER%" --kiosk "%URL%" --user-data-dir="%PROFILO%" ^
  --no-first-run --no-default-browser-check --noerrdialogs ^
  --disable-session-crashed-bubble --disable-features=Translate ^
  --disable-pinch --overscroll-history-navigation=0 ^
  --autoplay-policy=no-user-gesture-required
