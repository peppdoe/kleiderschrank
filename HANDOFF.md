# Übergabe: Kleiderschrank-App für Lena

Stand: 11.10.2026 (abends). Diese Datei richtet sich an einen neuen Chat ohne Vorwissen. Lies zuerst diese Datei, dann [CLAUDE.md](CLAUDE.md) (Befehle, Regeln, Stolperfallen) und vor jeder Änderung an der Oberfläche [DESIGN.md](DESIGN.md).

---

## 1. Ziel des Projekts

Eine Web-App (PWA) für **Lenas iPhone**. Sie fotografiert ihre Kleidung, gibt jedem Teil eine Kategorie, Farben, Saisons und eine Notiz, findet Teile über Filter wieder und stellt daraus benannte **Looks** zusammen (im Code: `outfit`), optional mit einem Foto, auf dem sie den Look trägt. Typischer Moment: **morgens vor dem Schrank, mit einer Hand**, Frage „Was ziehe ich heute an?“.

- **Nutzerin:** genau eine Person (Lena). Der Auftraggeber (GitHub `peppdoe`) baut die App für sie.
- **Kein Server, kein Login, keine Cloud:** Alle Daten liegen lokal in IndexedDB auf dem iPhone. Gesichert wird über eine JSON-Backup-Datei, die Lena per Teilen-Menü in iCloud Drive ablegt.
- **Erfolg heißt:** Ein Teil ist in Sekunden erfasst, ein passendes Outfit in Sekunden gefunden, und es gehen keine Daten verloren.
- Produktbeschreibung mit Prinzipien: [PRODUCT.md](PRODUCT.md)

**Live:** https://peppdoe.github.io/kleiderschrank/ (aktueller Stand mit Gestaltung „Pflegeetikett“, siehe Abschnitt 3)
**Repo:** https://github.com/peppdoe/kleiderschrank (öffentlich, enthält keine persönlichen Daten)

---

## 2. Getroffene Entscheidungen und Begründungen

### Technik
| Entscheidung | Begründung |
|---|---|
| **PWA statt nativer App** | Für eine native App bräuchte man einen Mac, Xcode und den Apple-Developer-Account (99 €/Jahr). Der Nutzer wollte „ohne Probleme einrichten, nichts mieten“. |
| **Daten nur lokal (IndexedDB über Dexie)**, Backup als Datei | Nutzer wollte ausdrücklich „nur auf dem iPhone, mit Backup“. Eine Cloud bräuchte Login und Dienst. |
| **Vite 5 + React 18 + TypeScript (strict) + Dexie 4 + vite-plugin-pwa** | Verbreitet, gut testbar und erweiterbar. Der Nutzer hat diesen Ansatz gewählt. |
| **GitHub Pages** als Hosting, Deploy per GitHub Actions bei jedem Push auf `main` | Kostenlos und automatisch. Das Repo muss öffentlich sein (Free-Plan). |
| **Hash-Routing** (`#/item/…`) | Vermeidet Probleme mit nicht gefundenen Seiten (404) auf GitHub Pages. |
| **Kein Login** | Die Seite liefert nur die leere App aus, Daten verlassen das iPhone nie. Ein Login hätte einen Server gebraucht, ohne Schutzgewinn. Nutzer hat gefragt und zugestimmt. |
| **Fotos im Browser verkleinert:** 1200 px (lange Kante), Vorschaubild 3:4 (360×480) | Spart Speicher und Backup-Größe bei 100+ Teilen. 3:4 passt zu Kleidung und zu den Kacheln im Raster. |
| **Backup in zwei Schritten** („Backup erstellen“ → „Backup sichern“) | Safari öffnet das Teilen-Menü nur direkt nach einem Tipp. Würde vorher gerechnet, ginge diese Bindung an den Tipp verloren. |
| **Schriftart Jost lokal eingebunden** (`@fontsource-variable/jost`) | Funktioniert offline, und es gibt keine Anfragen an Google. |
| **Git-Identität** nur im Repo: `peppdoe` / `340721352+peppdoe@users.noreply.github.com` | Die private E-Mail bleibt aus der öffentlichen Historie. |

### Gestaltung
| Entscheidung | Begründung |
|---|---|
| **Gestaltungswelt „Pflegeetikett“**: flaches Namensband mit gestrichelter Naht (zuerst navyblau, am 11.10. auf Wunsch des Nutzers auf die Saisonfarbe umgestellt; Hell/Dunkel bleibt automatisch nach iPhone-Einstellung), Karton-Anhänger (Kraftpapier) mit Lochung für Filter und Auswahl, Saisons als Pflegesymbole, Porzellan-Grund `#f5f6f8` | Vom Nutzer auf der Impeccable-Entscheidungsseite gewählt (gegen den ausgelosten „Abholschein“). Wunsch: „warm & persönlich“ statt neutralem iOS-Look. |
| **Persönliche Begrüßung** („Guten Morgen, Lena“ + wechselnder Spruch zu Kleidung und Saison), **Name in den Einstellungen wählbar** | Ausdrücklicher Wunsch des Nutzers, „wie bei Claude im Hauptfenster“. Die Sprüche sind höchstens 30 Zeichen lang (eine Zeile) und nennen nie konkrete Kleidungsstücke, weil Lena sie vielleicht nicht besitzt. Ein Test erzwingt beides. |
| **Saison-Reihe = „Heute“-Regler**: Die aktuelle Saison ist beim Öffnen vorausgewählt und filtert Schrank und „Heute“. Einfachauswahl: ein zweiter Tipp zeigt alles. | Nutzerwahl in der zweiten Kritik („Heute-Regler“). Passt zum Morgen-Moment. |
| **Teile ohne Saison gelten als ganzjährig** | Sonst würden Taschen, Accessoires usw. beim voreingestellten Saisonfilter verschwinden. |
| **Rot („Fadenrot“) nur für** Hauptaktion, aktiven Tab, zerstörerische Aktionen, Fehler und Fokus | Ergebnis des Finish-Reviews. Rot soll eine klare Bedeutung haben. |
| **Keine Karten um Fotos/Outfits, keine Pillen-Chips, keine Emojis, keine Kicker-Zeile über Überschriften** | Regeln des Impeccable-Qualitätsbodens und des Gestaltungsauftrags. |
| **In Formularen keine Tab-Leiste; Aktionen fest unten** | Ein versehentlicher Tipp auf die Tab-Leiste hätte Eingaben verworfen. Speichern liegt in Daumenreichweite. |
| **Rückfragen per Bodenblatt** (Verwerfen, Löschen, Import) statt `window.confirm` | Passt zur Gestaltung, hält den Fokus und setzt den sicheren Weg als Standard. |
| **Import zeigt** Inhalt des Backups und aktuellen Stand im Vergleich, mit „Erst aktuellen Stand sichern“ | Ein Import ersetzt alles, das Risiko von Datenverlust soll sichtbar sein. |
| **Höchstens ein Hinweis auf der Startseite**, das Backup geht vor dem Installationstipp; der Installationstipp steht unter dem Schrank | Die Kleidung soll im Vordergrund stehen. |
| **Saison steuert nur „Heute“**, Spruch und Fadenfarbe; der Schrank zeigt immer alle Teile (passende oben, Rest unter „Für andere Saisons“) | Kritik Runde 4: Ein gefilterter Schrank wirkte morgens, als fehlten Teile. Nutzerwahl am 11.10. |
| **Tragebild für Looks** in eigener Tabelle `outfitPhotos` (Dexie v2), Backup v1 mit optionalem Schlüssel | Wunsch des Nutzers; eigene Tabelle hält Teil- und Look-Fotos sauber getrennt, alte Backups bleiben einspielbar. |
| **„Look“ statt „Outfit“** in der Oberfläche | So spricht Lena; im Code bleibt `outfit`. |
| **Teile mit optionalem Namen**; Titel = Name oder Kategorie, nie die Notiz | Vorher wurde die erste Notizzeile heimlich zum Titel. |
| **Feste Leisten unten** auf Detailseiten und in Formularen; oben nur der Titel | Einhandbedienung; die installierte iPhone-App hat keine Wischgeste zurück. |
| **Saisons als echte Pflegesymbole**, immer mit Namen; Etikett eines Teils in seiner eigenen Saison | „Etikett-Welt ganz durchziehen“ (Nutzerwahl); ohne Namen liest niemand ein Bügeleisen als Herbst. |
| **Farben als Farbfelder mit Namen**, Filterblatt nur mit vorhandenen Werten und Anzahl | Keine Anhänger-Wand, kein Filter führt ins Leere, Farbenblinde lesen den Namen. |

### Arbeitsweise
- **TDD:** Erst ein fehlschlagender Test, dann der Code. Vor jedem Commit laufen `npm test` und `npx tsc --noEmit`.
- **Design-Arbeit über das Impeccable-Plugin:** Kritik, Entscheidungsseite, Umsetzung, unabhängiger Finish-Review, danach `DESIGN.md` aktualisieren.
- **Veröffentlichen nur nach ausdrücklicher Freigabe.** Der Nutzer will erst hochladen, **wenn das Design fertig ist.**

---

## 3. Aktueller Stand (11.10.2026, abends)

- **`main` = `origin/main` = Live** (Commit `1650d75`). Alles ist gemergt, gepusht und deployt (Deploy-Lauf vom 11.10., erfolgreich). Im ausgelieferten Bundle der Live-Seite sind die neuen Texte per `curl` bestätigt. Die Live-Seite selbst im Browser-Pane zu öffnen wurde beim letzten Mal abgelehnt; beim nächsten Mal dort einmal ansehen. Bereits installierte Apps holen sich das Update beim nächsten Start (im Browser ggf. zweimal laden, der Service Worker liefert die alte Version noch einmal aus).
- **Branches:** nur `main` und der alte, voll gemergte `feature/pflegeetikett` (kann gelöscht werden). Neue Arbeit auf einem neuen Feature-Branch beginnen.
- **Qualität:** 247 Tests grün, `tsc --noEmit` sauber, Build sauber, `impeccable detect --json src index.html` → 0 Befunde.
- **Design-Kritik (Verlauf):** 22 → 26 → 28 → 28 → **26/40** (Runde 4, 11.10., Bericht `.impeccable/critique/2026-10-11T02-38-09Z__src.md`). Alle Befunde aus Runde 4 sind danach umgesetzt, aber **noch nicht neu bewertet**. Die 26 lag teils an strengeren Maßstäben, teils an Ungereimtheiten, die inzwischen behoben sind.
- **Datenmodell heute:** Dexie **Version 2** (`items`, `photos`, `outfits`, `meta`, neu `outfitPhotos`). Teile haben optional `favorite` und `name` (beide ohne Index). Backup bleibt **v1** mit optionalem Schlüssel `outfitPhotos`.
- **Abnahme auf echtem iPhone:** noch **nicht** erfolgt (Checkliste in [README.md](README.md)).

### Was am 11.10. dazukam (Überblick)

1. **Tragebild für Looks:** optionales Foto von Lena im Look. Ersetzt überall die Collage (Heute, Liste, Detail oben), darunter die Teile. Vorschau oben bündig zugeschnitten (Spiegel-Selfies behalten den Kopf). Spec und Plan: `docs/superpowers/specs/2026-10-11-outfit-tragebild-design.md`, `docs/superpowers/plans/2026-10-11-outfit-tragebild.md`.
2. **Schrank:** Saison-Reihe auf das Namensband gedruckt (wie Pflegesymbole auf einem Etikett), Datum neben „Heute“. **Die Saison steuert nur noch „Heute“**, Spruch und Fadenfarbe; der Schrank zeigt immer alle Teile, passende oben, der Rest unter „Für andere Saisons“ (Nutzerentscheidung).
3. **Teile:** optionales Namensfeld; Titel = Name, sonst Kategorie (die Notiz wird nie zum Titel). Formular-Reihenfolge: Foto (kleiner, als antippbarer Rahmen) → Kategorie → Farbe → Saison → Name → Notiz.
4. **Sprache:** überall „Look“ statt „Outfit“ (Tab „Looks“); Ton wie eine Freundin.
5. **Filter:** Filterblatt zeigt nur vorhandene Kategorien/Farben mit Anzahl; Farben als Farbfelder mit Namen (Filter und Formular).
6. **Daumenreichweite:** Detailseiten mit fester Leiste unten (‹ Zurück | Bearbeiten), Formulare mit fester Leiste unten (Abbrechen/Zurück | Hauptaktion). Oben bleibt nur der Titel. Unter einer Collage stehen die Teile als kleiner Streifen.
7. **Erster Start:** „Noch ganz viel Platz hier.“ + „Erstes Teil fotografieren“; ohne Teile kein Plus-Knopf und keine Saison-Wahl; Looks-Tab ohne Teile führt zum ersten Foto.
8. **Etikett-Welt:** Saisons als echte Pflegesymbole (Waschbottich mit Spross, Trockner-Quadrat als Sonne, Bügeleisen mit Blatt, Bleich-Dreieck mit Schneeflocke), immer mit Namen; das Etikett eines Teils ist in seiner eigenen Saison genäht.
9. **Barrierefreiheit/Fehler:** Herz mit navy Kontur (≥ 3:1), ein fester Ansagebereich für VoiceOver (`components/Toast.tsx`), „Filter lösen“ behält die Saison.

---

## 4. Offene Aufgaben (in Reihenfolge)

1. **Live-Seite einmal im Browser ansehen** (Handy-Größe, hell/dunkel) und prüfen, dass die Datenbank dort auf Version 2 läuft (`indexedDB.open('kleiderschrank')` → Version 20, Tabelle `outfitPhotos`).
2. **Optional: neue Kritik** (`/impeccable critique`), um die Wirkung der Runde-4-Korrekturen zu messen (zuletzt 26/40).
3. **Noch offen aus der Kritik (bewusst nicht angefasst):**
   - Schrift wächst nicht mit der iOS-Textgröße (alles in px; Umstellung auf rem / Dynamic Type wäre ein größerer Umbau).
   - Kein Rückgängig nach dem Löschen eines Teils (Idee: Toast „Teil gelöscht – Rückgängig“).
   - Der Name wird beim ersten Start nicht abgefragt (steht nur in den Einstellungen).
   - Kein „Speichern und nächstes Teil“ für mehrere Teile hintereinander.
   - `.impeccable/design.json` ist älter als `DESIGN.md`; bei Gelegenheit `/impeccable document` laufen lassen.
4. **Abnahme auf Lenas iPhone** mit der Checkliste in `README.md`. Besonders: Hochformat- und HEIC-Fotos (Drehung), Kamera, Offline-Start, Backup nach iCloud Drive und zurück (inkl. Tragebild), Begrüßung mit Namen, Saison-Regler, Tragebild als Spiegel-Selfie.
5. **Nach Lenas Test klären:** „Heute“ nach Anlass/Vibe (Uni, Abends, Cozy …)? Fehlende Kategorien/Farben (Jeans, Blazer, Schmuck; Denim, Creme, Oliv, Bordeaux)? „Heute getragen“ / „Lange nicht getragen“? Eigene Saison für Looks? Jeweils Datenmodell-Änderung, deshalb erst mit ihren echten Wörtern. Die App ist ein Geschenk.
6. Nach der Abnahme: Probleme beheben, `CLAUDE.md` und `DESIGN.md` nachziehen.

**Arbeitsweise, die sich bewährt hat:** Feature-Branch → TDD (erst fehlschlagender Test) → Sichtprüfung im Browser-Pane (375×812, hell und dunkel) → `impeccable detect` → DESIGN.md/CLAUDE.md nachziehen → Commit. Größere Features über Brainstorming → Spec → Plan → Umsetzung. **Mergen und Pushen nach `main` nur nach ausdrücklicher Freigabe** („hochladen“).

---

## 5. Wichtige Dateien und Pfade

**Projektordner:** `C:\Claude Projekte\Kleiderschrank App Lena`

| Pfad | Inhalt |
|---|---|
| `CLAUDE.md` | Befehle, Struktur, Regeln, Test-Fallstricke, iOS-Besonderheiten |
| `PRODUCT.md` | Nutzerin, Zweck, Prinzipien (Impeccable-Produktbeschreibung) |
| `DESIGN.md` + `.impeccable/design.json` | Gestaltungssystem „Pflegeetikett“: Farben hell/dunkel, Schriftgrößen, Radien, Komponenten, benannte Regeln |
| `.impeccable/surfaces/src.md` | Gestaltungsauftrag (Direction Contract), auf den gebauten Stand synchronisiert |
| `.impeccable/critique/` | Kritik-Berichte (22, 26, 28, 28, 26 von 40; neuester `2026-10-11T02-38-09Z__src.md`) |
| `.impeccable/mocks/decision/` | Skizzen der Entscheidungsrunde (`model-pick.html` = gewählte Richtung) |
| `README.md` | Anleitung für Lena + Abnahme-Checkliste fürs iPhone |
| `docs/superpowers/specs/2026-10-10-kleiderschrank-app-design.md` | Ursprüngliche Spec |
| `docs/superpowers/plans/2026-10-10-kleiderschrank-app.md` | Ursprünglicher Umsetzungsplan (erledigt) |
| `docs/superpowers/specs/2026-10-11-outfit-tragebild-design.md`, `docs/superpowers/plans/2026-10-11-outfit-tragebild.md` | Spec und Plan Tragebild (erledigt) |
| `src/App.tsx` | Routing, voreingestellte Saison, Foto-Entwurf, gemeinsamer Toast (`setNotice`) |
| `src/db/` | Dexie-Schema und Datenzugriff (`items.ts`, `outfits.ts`, `meta.ts`). Bildschirme greifen nur hierüber zu. |
| `src/lib/` | Logik: `filters` (inkl. `facetCounts`), `backup`, `image` (inkl. `topCrop`), `greeting` (Begrüßung/Saison), `today` (Looks zur Saison, `stitchSeason`), `route`, `describe` (`itemTitle`) |
| `src/components/` | u. a. `LabelBand`, `SeasonSymbols`, `FilterTags`, `FilterSheet`, `SwatchGroup`, `Sheet`, `ConfirmSheet`, `ImportSheet`, `ItemGrid`, `OutfitLook`, `OutfitPhotoPicker`, `DetailBar`, `Toast`, `Icon` (eigene SVG-Symbole) |
| `src/screens/` | Schrank, Teil-Formular/-Detail, Looks (Dateien heißen `Outfit…`), Look-Editor/-Detail, Einstellungen |
| `src/styles.css` | Gesamte Gestaltung inkl. Dark Mode |
| `.github/workflows/deploy.yml` | Test, Build, Deploy auf GitHub Pages |
| `.claude/launch.json` | Dev-/Preview-Server für das Browser-Fenster |
| `.impeccable/review/` | Review-Screenshots (nicht versioniert) |

**Werkzeuge:**
- Node 24: `C:\Program Files\nodejs`. In Bash bei Bedarf `export PATH="/c/Program Files/nodejs:$PATH"`.
- GitHub CLI: `C:\Program Files\GitHub CLI`, angemeldet als `peppdoe` (Scopes: repo, workflow).
- Impeccable-CLI: `C:/Users/harin/.claude/plugins/cache/impeccable/impeccable/4.5.2/skills/impeccable/scripts/impeccable` (z. B. `detect --json src index.html`).
- Review-Screenshots in exakter Größe: ein Hilfsskript steuert Edge headless über das DevTools-Protokoll. Es lag im Scratchpad der alten Sitzung und ist **nicht** im Repo. Liegt jetzt im Repo: `node scripts/capture-review.mjs .impeccable/review` (Dev-Server muss laufen, Zielordner vorher anlegen; legt in einem frischen Edge-Profil Demo-Daten an und nimmt Schrank, Looks, Look-Detail, Teil-Detail, Teil-Formular und Einstellungen hell/dunkel auf). Technik: Edge unter `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`, `--headless=new --remote-debugging-port`, `Emulation.setDeviceMetricsOverride` 375×812 bzw. 1280×800, `Page.captureScreenshot`. Demo-Daten im Browser über `await import('/kleiderschrank/src/db/items.ts')` anlegen.

---

## 6. Bekannte Probleme und Stolperfallen

- **Nicht auf echtem iPhone getestet.** Ob EXIF-Drehung, HEIC, Teilen-Menü, Download in der Home-Bildschirm-App und `navigator.storage.persist()` wirklich funktionieren, ist offen.
- **Safari und die Home-Bildschirm-App haben getrennte Speicher.** Daten aus Safari werden nicht übernommen. Die App weist darauf hin. Lena muss zuerst installieren, dann erfassen.
- **Ältere Vorschaubilder sind quadratisch** (vor der 3:4-Umstellung erfasst). Sie werden zugeschnitten angezeigt und können leicht unscharf wirken. Betrifft nur Teile, die Lena eventuell schon mit der alten Live-Version erfasst hat.
- **Bash-Werkzeug und deutsche Anführungszeichen/Backticks:** Inline-`node -e`- oder Heredoc-Befehle mit „“, `’` oder Backticks scheitern oft. Änderungen deshalb mit dem Edit/Write-Werkzeug oder über ein `.cjs`-Skript in einer Datei machen.
- **Tests mit `useLiveQuery`** sind asynchron. Immer `findBy…` statt `getBy…`. Sonst werden die Tests wackelig (ist mehrfach passiert).
- **Tests mit Datum:** Die Saison wird aus dem echten Datum vorausgewählt. Tests, die von der Saison abhängen, setzen `vi.useFakeTimers({ toFake: ['Date'] })` und `vi.setSystemTime(...)`.
- **jsdom:** `Blob` wird im Test-Setup durch Nodes `Blob` ersetzt (fake-indexeddb). Canvas und `createImageBitmap` fehlen, `lib/image.ts` wird in Screen-Tests gemockt.
- **In Testdateien mit `vi.mock(..., vi.fn())` kein `vi.restoreAllMocks()`**: Das leert die Mock-Implementierungen.
- **npm 11 blockiert Install-Skripte** (esbuild, sharp). Bisher ohne Folgen. Falls Vite oder der Icon-Generator streiken: `npm install-scripts approve <paket>`.
- **Browser-Fenster in Claude:** Eine eingestellte Handy-Größe oder der Dark Mode wird nach jedem Zug bzw. bei Größenänderung zurückgesetzt. Bei Bedarf neu setzen.
- **Vite `base` ist `/kleiderschrank/`.** Wird das Repo umbenannt, muss `base` mit.
- **Backup-Format v1** (`{ app, version: 1, exportedAt, items, outfits, photos, outfitPhotos? }`) nicht ohne Migration ändern. Schema-Änderungen nur über eine neue Dexie-Version in `src/db/schema.ts` (aktuell Version 2).
- **Bash-Heredocs mit `\n` in Template-Strings** gehen in Node-Skripten oft schief (der Ersatztext passt dann nicht). Mehrzeilige Code-Ersetzungen mit dem Edit-Werkzeug machen oder Zeilen per `[...].join('\n')` zusammensetzen.
- **Screenshots im Browser-Pane hinken manchmal einen Schritt hinterher** (zeigen noch die vorige Seite). Nach `navigate` kurz warten oder den Screenshot einzeln wiederholen.
- **Alter Service Worker auf `localhost:4173`** (Preview) kann eine uralte Version ausliefern. Dann im Pane `navigator.serviceWorker.getRegistrations()` abmelden, `caches` leeren und neu laden. Der Preview-Port hat eine eigene, leere Datenbank – gut, um den ersten Start zu prüfen.
- **Demo-Daten** liegen in der IndexedDB von `localhost:5173` (12 Teile, 3 Looks, ein Look mit Demo-Tragebild). Frische Demo-Daten erzeugt `node scripts/capture-review.mjs <ordner>` in einem eigenen Edge-Profil.
- **Fest positionierte Leisten:** Detail-Leiste (über der Tab-Leiste) und Formular-Leiste (ganz unten) sind `position: fixed`; `.app` bzw. `.app--form` reservieren unten Platz. Neue Elemente am Seitenende darauf prüfen.
- **Toasts:** nie direkt rendern, sondern über `setNotice` in `App.tsx` (eine Ansage-Region für VoiceOver). Bildschirme bekommen dafür einen Callback (z. B. `onNotice` im Look-Detail). Die Einstellungen haben ihre eigene Statuszeile.
