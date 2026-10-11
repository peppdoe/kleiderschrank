# Übergabe: Kleiderschrank-App für Lena

Stand: 11.10.2026. Diese Datei richtet sich an einen neuen Chat ohne Vorwissen. Lies zuerst diese Datei, dann [CLAUDE.md](CLAUDE.md) (Befehle, Regeln, Stolperfallen) und vor jeder Änderung an der Oberfläche [DESIGN.md](DESIGN.md).

---

## 1. Ziel des Projekts

Eine Web-App (PWA) für **Lenas iPhone**. Sie fotografiert ihre Kleidung, gibt jedem Teil eine Kategorie, Farben, Saisons und eine Notiz, findet Teile über Filter wieder und stellt daraus benannte **Outfits** zusammen. Typischer Moment: **morgens vor dem Schrank, mit einer Hand**, Frage „Was ziehe ich heute an?“.

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
| **Höchstens ein Hinweis auf der Startseite**, das Backup geht vor dem Installationstipp | Die Kleidung soll im Vordergrund stehen. |

### Arbeitsweise
- **TDD:** Erst ein fehlschlagender Test, dann der Code. Vor jedem Commit laufen `npm test` und `npx tsc --noEmit`.
- **Design-Arbeit über das Impeccable-Plugin:** Kritik, Entscheidungsseite, Umsetzung, unabhängiger Finish-Review, danach `DESIGN.md` aktualisieren.
- **Veröffentlichen nur nach ausdrücklicher Freigabe.** Der Nutzer will erst hochladen, **wenn das Design fertig ist.**

---

## 3. Aktueller Stand

- **`main` = `origin/main` = `feature/pflegeetikett`** (Commit `453ac87`). Die neue Gestaltung mit allen Kritik-Runden, Saison-Anzeige für Outfits, Looks und Lieblingsteilen ist gemergt und gepusht. Der Deploy vom 11.10.2026 war erfolgreich, und die Live-Seite zeigt den neuen Stand (am 11.10. im Browser geprüft). Bereits installierte Apps holen sich das Update beim nächsten Start. Im Browser kann dafür ein zweites Neuladen nötig sein, weil der Service Worker die alte Version noch einmal ausliefert.
- **Qualität:**
  - 183 Tests grün, `tsc --noEmit` sauber.
  - `impeccable detect --json src index.html` meldet 0 Befunde.
  - Der letzte Finish-Review endete mit **ship**. Er hat aber nur die letzten Korrekturen bewertet, keine komplett neue Gesamtprüfung.
- **Design-Kritik:** 22/40 (Ausgangsstand) → 26/40 (nach dem ersten Umbau). Die zweite Runde ist umgesetzt, aber noch nicht neu bewertet.
- **Entwicklungsserver:** War für den Nutzer im Browser-Fenster offen (Dark Mode, iPhone-Größe). Im neuen Chat neu starten: Konfiguration `dev` in `.claude/launch.json`.
- **Abnahme auf echtem iPhone:** noch **nicht** erfolgt (Checkliste in [README.md](README.md)).

---

## 4. Offene Aufgaben (in Reihenfolge)

1. **Nutzer schaut sich das Design an und gibt Rückmeldung.** Wünsche umsetzen, dabei die Regeln aus `DESIGN.md` einhalten.
   - Erledigt (11.10.): Outfits zeigen, in welchen Saisons sie unter „Heute“ erscheinen (Liste, Detail, live im Editor; `lib/today.ts` `outfitSeasons`, `components/OutfitSeasons.tsx`). Bewusst **keine** eigene Saison-Auswahl für Outfits: Die Saison ergibt sich aus den Teilen, ein Sonderfall wird über die Saisons des Teils gelöst. Falls Lena bei der Abnahme doch selbst festlegen will, als optionales Feld nachrüsten (Backup v1 bleibt kompatibel).
2. **Erledigt (11.10.): Gestaltungswelt weitertragen.** Outfit-Namen als gewebtes Etikett in der Liste, Outfit-Detail als eingenähtes Etikett, Live-Vorschau des Namensbands unter dem Namensfeld in den Einstellungen. Finish-Review: alle vier Befunde behoben. Ursprüngliche Idee: Der Reviewer nannte das als Idee, nicht als Fehler:
   - Outfit-Liste: Namen als gewebtes Etikett (Pflegesymbole pro Outfit sind erledigt).
   - Outfit-Detailansicht: wie die Teil-Detailansicht als Etikett.
   - Einstellungen: das Namensband dort zeigen, wo Lena ihren Namen einträgt.
3. **Erledigt (11.10.): neue Kritik mit Fokus „Lena ist 20“** → 28/40 (vorher 26). Danach alle fünf Befunde umgesetzt, ohne Rückfrage am Stück: Sprache wie eine Freundin, Saisonfaden-Farben und Blush-Kraft, Abschnittstitel ohne Versalien und flacheres Band, Outfits als Collage/Looks, Lieblingsteile mit Herz und „Lieblinge“-Filter, Speicher-Moment beim Outfit. Ursprünglich: **Optional: neue Kritik** mit `/impeccable critique`, um zu messen, wo die App nach Runde 2 steht (zuletzt 26/40).
4. **Erledigt (11.10.): hochgeladen.** `feature/pflegeetikett` ist per Fast-Forward in `main`, gepusht und deployt. Die Live-Seite ist kontrolliert. Künftige Änderungen weiterhin erst nach ausdrücklicher Freigabe pushen.
4b. **Erledigt (11.10.): Tragebild für Outfits** (gemergt in `main`, am 11.10. gepusht und live; Datenbank-Umstellung auf Version 2 in der Live-Seite geprüft). Optionales Foto von Lena im Look; ersetzt die Collage unter „Heute“, in der Liste und oben im Detail, darunter die Teile. Schema-Version 2 (`outfitPhotos`), Backup v1 mit optionalem `outfitPhotos`. Spec: `docs/superpowers/specs/2026-10-11-outfit-tragebild-design.md`, Plan: `docs/superpowers/plans/2026-10-11-outfit-tragebild.md`.
4c. **Erledigt (11.10.): Kritik vom 11.10. (28/40) abgearbeitet** auf Branch `feature/kritik-runde-3` (nicht gemergt, nicht gepusht). Alle 5 Punkte plus „Etikett-Welt ganz durchziehen“:
   - Saison-Reihe auf dem Namensband, Datum neben „Heute“, Installationshinweis unter dem Schrank → Raster beginnt bei ~537 statt 634 px (375×812).
   - Optionaler Name für Teile (`name`, ohne Index, Backup v1); überall „Look“ statt „Outfit“ (Tab „Looks“), freundlichere Systemsätze.
   - Filterblatt zeigt nur vorhandene Werte mit Anzahl; Farben als Farbfelder (Filter und Formular).
   - Detailseiten: Zurück + Bearbeiten in einer Leiste unten; Teile unter einer Collage als Streifen.
   - Erster Start: Einladung mit „Erstes Teil fotografieren“, kein Plus-Knopf und keine Saison-Wahl ohne Teile; Looks-Tab ohne Teile führt zum ersten Foto.
   - Saisons als echte Pflegesymbole; Etikett eines Teils in seiner eigenen Saison; Spruch folgt gewählter Saison; Herz-Kontur navy (≥ 3:1); fester Ansagebereich für VoiceOver; „Filter lösen“ behält die Saison.
4d. **Als Nächstes:** `/impeccable polish` und neue Kritik (Vergleich zu 28/40), dann nach Freigabe mergen und hochladen.
5. **Nach Lenas Test klären:** Möchte sie „Heute“ nach Anlass/Vibe (Uni, Abends, Cozy …) statt nur nach Saison? Fehlen ihr Kategorien oder Farben (z. B. Jeans, Blazer, Schmuck; Denim, Creme, Oliv, Bordeaux)? Will sie „Heute getragen“ / „Lange nicht getragen“? Braucht jeweils eine Datenmodell-Änderung, deshalb bewusst erst mit ihren echten Wörtern. Die App ist ein Geschenk.
6. **Abnahme auf Lenas iPhone** mit der Checkliste in `README.md`. Besonders prüfen:
   - Hochformat- und HEIC-Fotos (richtige Drehung)
   - Kamera
   - Offline-Start vom Home-Bildschirm
   - Backup nach iCloud Drive und wieder einspielen
   - Begrüßung mit Namen und Saison-Regler
7. Nach der Abnahme: gefundene Probleme beheben, gegebenenfalls `CLAUDE.md` und `DESIGN.md` nachziehen.

---

## 5. Wichtige Dateien und Pfade

**Projektordner:** `C:\Claude Projekte\Kleiderschrank App Lena`

| Pfad | Inhalt |
|---|---|
| `CLAUDE.md` | Befehle, Struktur, Regeln, Test-Fallstricke, iOS-Besonderheiten |
| `PRODUCT.md` | Nutzerin, Zweck, Prinzipien (Impeccable-Produktbeschreibung) |
| `DESIGN.md` + `.impeccable/design.json` | Gestaltungssystem „Pflegeetikett“: Farben hell/dunkel, Schriftgrößen, Radien, Komponenten, benannte Regeln |
| `.impeccable/surfaces/src.md` | Gestaltungsauftrag (Direction Contract), auf den gebauten Stand synchronisiert |
| `.impeccable/critique/` | Kritik-Berichte (22/40, 26/40) |
| `.impeccable/mocks/decision/` | Skizzen der Entscheidungsrunde (`model-pick.html` = gewählte Richtung) |
| `README.md` | Anleitung für Lena + Abnahme-Checkliste fürs iPhone |
| `docs/superpowers/specs/2026-10-10-kleiderschrank-app-design.md` | Ursprüngliche Spec |
| `docs/superpowers/plans/2026-10-10-kleiderschrank-app.md` | Ursprünglicher Umsetzungsplan (erledigt) |
| `src/App.tsx` | Routing, voreingestellte Saison, Foto-Entwurf, „Teil gespeichert“ |
| `src/db/` | Dexie-Schema und Datenzugriff (`items.ts`, `outfits.ts`, `meta.ts`). Bildschirme greifen nur hierüber zu. |
| `src/lib/` | Logik: `filters`, `backup`, `image`, `greeting` (Begrüßung/Saison), `today` (Outfits zur Saison), `route`, `describe` |
| `src/components/` | u. a. `LabelBand`, `SeasonSymbols`, `FilterTags`, `FilterSheet`, `Sheet`, `ConfirmSheet`, `ImportSheet`, `ItemGrid`, `Icon` (eigene SVG-Symbole) |
| `src/screens/` | Schrank, Teil-Formular/-Detail, Outfits, Outfit-Editor/-Detail, Einstellungen |
| `src/styles.css` | Gesamte Gestaltung inkl. Dark Mode |
| `.github/workflows/deploy.yml` | Test, Build, Deploy auf GitHub Pages |
| `.claude/launch.json` | Dev-/Preview-Server für das Browser-Fenster |
| `.impeccable/review/` | Review-Screenshots (nicht versioniert) |

**Werkzeuge:**
- Node 24: `C:\Program Files\nodejs`. In Bash bei Bedarf `export PATH="/c/Program Files/nodejs:$PATH"`.
- GitHub CLI: `C:\Program Files\GitHub CLI`, angemeldet als `peppdoe` (Scopes: repo, workflow).
- Impeccable-CLI: `C:/Users/harin/.claude/plugins/cache/impeccable/impeccable/4.5.2/skills/impeccable/scripts/impeccable` (z. B. `detect --json src index.html`).
- Review-Screenshots in exakter Größe: ein Hilfsskript steuert Edge headless über das DevTools-Protokoll. Es lag im Scratchpad der alten Sitzung und ist **nicht** im Repo. Liegt jetzt im Repo: `node scripts/capture-review.mjs .impeccable/review` (Dev-Server muss laufen; legt in einem frischen Edge-Profil Demo-Daten an und nimmt Schrank, Outfits, Outfit-Detail und Einstellungen hell/dunkel auf). Technik: Edge unter `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`, `--headless=new --remote-debugging-port`, `Emulation.setDeviceMetricsOverride` 375×812 bzw. 1280×800, `Page.captureScreenshot`. Demo-Daten im Browser über `await import('/kleiderschrank/src/db/items.ts')` anlegen.

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
- **Backup-Format v1** (`{ app, version: 1, exportedAt, items, outfits, photos }`) nicht ohne Migration ändern. Schema-Änderungen nur über eine neue Dexie-Version in `src/db/schema.ts`.
