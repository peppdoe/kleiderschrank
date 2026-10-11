# Outfit-Tragebild – Design

**Datum:** 2026-10-11
**Status:** Design abgestimmt, bereit für Implementierungsplan

## 1. Ziel

Lena kann zu jedem Outfit **ein optionales Foto** ablegen, auf dem sie den Look trägt (typisch: Spiegel-Selfie). Ein Look mit Foto zeigt überall zuerst dieses Foto, im Outfit-Detail darunter die einzelnen Teile. Ohne Foto bleibt alles wie bisher (Collage aus den Teilen).

**Erfolg heißt:**
- Ein Tragebild ist beim Anlegen oder jederzeit später in wenigen Tipps hinzugefügt, geändert oder entfernt.
- Unter „Heute“, in der Outfit-Liste und im Outfit-Detail erscheint der Look mit Foto als Foto.
- Bestehende Daten auf Lenas iPhone bleiben erhalten; alte Backups lassen sich weiter einspielen.

**Abgestimmte Entscheidungen (Nutzer, 11.10.2026):**
- Hinzufügen beim Anlegen (Namens-Schritt im Editor) **und** später im Outfit-Detail.
- Anzeige **überall**: „Heute“ auf der Startseite, Outfit-Liste, Outfit-Detail.
- Speicherung als eigene Tabelle (Weg A), Vorschaubild **oben bündig** zugeschnitten.

**Nicht enthalten (YAGNI):** mehrere Fotos pro Outfit, Zuschneiden in der App, Tragebilder für einzelne Teile.

## 2. Datenmodell

### Schema (Dexie-Version 2)

Neue Tabelle, alles andere unverändert:

```ts
export interface OutfitPhoto {
  outfitId: string;
  full: Blob;   // JPEG, max. 1200 px lange Kante, Qualität 0.85
  thumb: Blob;  // JPEG 360×480 (3:4), oben bündig zugeschnitten
}

this.version(2).stores({ outfitPhotos: 'outfitId' });
```

- `version(1)` bleibt unverändert stehen. Version 2 fügt nur die Tabelle hinzu; Dexie übernimmt bestehende Tabellen und Daten ohne Upgrade-Funktion.
- `outfitPhotos` ist von `photos` (Teil-Fotos) getrennt, damit Speicher-, Lösch- und Backup-Logik beider Arten unabhängig bleiben.

### Datenzugriff (`src/db/outfits.ts`)

Bildschirme greifen weiterhin nur über diese Datei zu.

- `type PhotoChange = PhotoBlobs | null | undefined` – Foto setzen, entfernen (`null`) oder unverändert lassen (`undefined`).
- `createOutfit(name, itemIds, photo?: PhotoBlobs)` – legt Outfit und ggf. Foto in **einer** Transaktion an.
- `updateOutfit(id, name, itemIds, photo?: PhotoChange)` – aktualisiert Outfit und Foto in **einer** Transaktion.
- `setOutfitPhoto(outfitId, blobs)` – für das Hinzufügen/Ändern direkt aus dem Detail. Wirft, wenn das Outfit nicht existiert. Aktualisiert `updatedAt` des Outfits.
- `removeOutfitPhoto(outfitId)` – entfernt das Foto, aktualisiert `updatedAt`.
- `getOutfitPhoto(outfitId)` – liefert `OutfitPhoto | undefined`.
- `deleteOutfit(id)` – löscht Outfit **und** Foto in einer Transaktion.
- Das Löschen eines Teils (`db/items.ts`) ändert nichts am Tragebild; ein Outfit ohne verbliebene Teile behält sein Foto.

## 3. Bildverarbeitung (`src/lib/image.ts`)

- Neue reine Funktion `topCrop(width, height, ratio)`: größter Ausschnitt mit dem Seitenverhältnis `ratio`; horizontal mittig, vertikal **oben bündig** (`sy = 0`). Bei Bildern, die breiter als `ratio` sind, identisch zu `centerCrop`.
- `processPhoto(file, { anchor })` und `makeThumb(full, { anchor })` erhalten eine Option `anchor: 'center' | 'top'` (Standard `'center'`, damit Teil-Fotos unverändert bleiben). Tragebilder nutzen `'top'`.
- EXIF-Drehung, Vollbildgröße und Qualität wie bei Teil-Fotos.

## 4. Backup

Format bleibt **Version 1**. Neuer **optionaler** Schlüssel:

```json
{ "app": "kleiderschrank", "version": 1, "exportedAt": "…", "items": [], "outfits": [],
  "photos": [{ "itemId": "…", "full": "<base64>" }],
  "outfitPhotos": [{ "outfitId": "…", "full": "<base64>" }] }
```

- **Export:** schreibt `outfitPhotos` immer (ggf. leeres Array), im selben Lese-Snapshot wie die übrigen Tabellen.
- **Parse:** fehlt `outfitPhotos`, gilt es als leer (ältere Sicherungen). Ist es vorhanden, muss es ein Array sein; jeder Eintrag braucht `outfitId` und `full` als Text, sonst „Ungültige Sicherung: Outfit-Foto unvollständig“. Einträge zu Outfits, die nicht im Backup stehen, werden verworfen; doppelte `outfitId` → der letzte gewinnt (wie bei Teil-Fotos). Beschädigtes Base64 → „Ungültige Sicherung: Foto beschädigt“.
- `ParsedBackup` erhält `outfitPhotos: { outfitId: string; full: Blob }[]`.
- **Import:** erzeugt Vorschaubilder mit `anchor: 'top'` **vor** dem Ersetzen; ersetzt dann `items`, `photos`, `outfits` und `outfitPhotos` in **einer** Transaktion (alle vier werden geleert).
- Ältere App-Versionen ignorieren den unbekannten Schlüssel (Outfit-Fotos gehen dort verloren, sonst nichts).
- Das Import-Blatt (`ImportSheet`) zeigt weiterhin Teile und Outfits; Fotos werden nicht gezählt.

## 5. Oberfläche

### Neue Komponente `OutfitLook`

`<OutfitLook outfitId itemIds />`: lädt per `useLiveQuery` das Vorschaubild aus `getOutfitPhoto`. Mit Foto: ein 3:4-Bild (`object-fit: cover`, 4px Ecken wie Foto-Kacheln, `alt=""` im Verbund mit dem Outfit-Namen). Ohne Foto: `OutfitPreview` wie bisher. Solange geladen wird: Chip-Fläche im 3:4-Format (kein Springen).

Ersetzt `OutfitPreview` in:
- `WardrobeScreen` (Streifen „Heute“)
- `OutfitsScreen` (Outfit-Liste)

Der Editor zeigt in der Auswahl weiterhin die Collage (dort zählt die Auswahl), im Namens-Schritt siehe unten.

### Outfit-Detail (`OutfitDetailScreen`)

**Mit Foto:**
1. Tragebild als Vollbild in voller Breite, unbeschnitten (`object-fit: contain`), höchstens ca. 70 % der Bildschirmhöhe.
2. Darunter leise Links: „Foto ändern“ (Datei-Auswahl) · „Foto entfernen“ (Bodenblatt „Foto entfernen?“, sicherer Weg als Standard; zerstörerische Bestätigung in Fadenrot).
3. Das eingenähte Etikett (Name, Anzahl, Saisons) wie bisher.
4. Abschnitt „Teile“ mit dem Raster. Die Collage entfällt (keine Doppelung).

**Ohne Foto:**
1. Collage wie bisher, Etikett darunter.
2. Gestrichelter Rahmen (Naht-Sprache, wie der leere Foto-Rahmen im Teil-Formular), komplett antippbar (`FilePicker`), Text „Zeig, wie du den Look trägst“ mit Kamera-Symbol.
3. „Teile“ wie bisher.

Ein gewähltes Foto wird sofort verarbeitet und gespeichert (`setOutfitPhoto`); währenddessen zeigt der Rahmen „Foto wird vorbereitet …“ und ist gesperrt. Danach Toast „Foto gespeichert“ (lokal im `OutfitDetailScreen`, gleiche Klasse `toast` und Dauer wie die Toasts in `App.tsx`, 3,5 s).

### Editor, Namens-Schritt (`OutfitEditorScreen`)

- Oben: gewähltes oder vorhandenes Tragebild statt der Collage; sonst Collage.
- Unter dem Namensfeld: Abschnitt „Foto von dir im Look“ mit Hinweis „optional“.
  - Ohne Foto: gestrichelter, antippbarer Rahmen (wie im Detail).
  - Mit Foto: leise Links „Ändern“ · „Entfernen“ (Entfernen im Editor ohne Rückfrage, da erst beim Speichern wirksam).
- Das Foto wird bei der Wahl sofort verarbeitet (`processPhoto` mit `anchor: 'top'`) und als Entwurf gehalten; gespeichert wird es erst mit „Speichern“ zusammen mit dem Outfit.
- Ein geändertes oder entferntes Foto zählt als ungespeicherte Änderung („Änderungen verwerfen?“ beim Abbrechen).
- „Speichern“ bleibt gesperrt, solange ein Foto verarbeitet wird.

### Fehler

- Unlesbares Foto: Meldung über `userMessage` direkt unter dem Rahmen (`role="alert"`), Name, Auswahl und ein bisher gesetztes Foto bleiben erhalten.
- Speicherfehler (z. B. Speicher voll): wie bisher über `userMessage` mit `role="alert"`.

### Texte (Ton: Freundin, „Look“)

- „Zeig, wie du den Look trägst“
- „Foto von dir im Look“ · „optional“
- „Foto ändern“ · „Foto entfernen“ · Blatt: „Foto entfernen?“ / „Das Foto von dir im Look wird gelöscht. Das Outfit und seine Teile bleiben.“ / Bestätigen „Entfernen“, Abbrechen „Behalten“
- Toast „Foto gespeichert“
- Bildalternativtext im Detail: „Du im Look „<Name>““

## 6. Gestaltung

Regeln aus `DESIGN.md` gelten: keine Karten um das Foto, gestrichelte Linien nur als Naht, Fadenrot nur für die zerstörerische Bestätigung und Fokus, Saisonfarbe nur für Nähte. Das Etikett wird an die Unterkante des Tragebilds „angenäht“ wie bisher an die Collage. Nach der Umsetzung `DESIGN.md` (Komponente „Outfit Look“) und `CLAUDE.md` (Schema-Version 2, Backup-Schlüssel `outfitPhotos`) nachziehen.

## 7. Tests (TDD)

- **Schema:** Datenbank mit Version 1 und Daten anlegen, mit Version 2 öffnen → Teile, Fotos, Outfits, Meta unverändert; `outfitPhotos` leer.
- **db/outfits:** `createOutfit` mit Foto; `updateOutfit` mit Foto setzen / `null` entfernen / `undefined` unverändert; `setOutfitPhoto` und `removeOutfitPhoto` inkl. `updatedAt`; `setOutfitPhoto` für unbekanntes Outfit wirft; `deleteOutfit` löscht das Foto mit; Teil löschen lässt Tragebild bestehen.
- **lib/image:** `topCrop` für Hochformat (oben bündig), Querformat (mittig), exakt 3:4.
- **lib/backup:** Export enthält `outfitPhotos`; Rundreise Export → Import erhält das Foto; altes Backup ohne Schlüssel wird akzeptiert; `outfitPhotos` kein Array / Eintrag unvollständig → Fehler; Foto zu unbekanntem Outfit verworfen; Import leert `outfitPhotos`.
- **Screens (jsdom, `lib/image` gemockt):** Detail mit Foto zeigt Bild und kein Collage-Element, ohne Foto den Rahmen; Foto im Detail hinzufügen speichert und zeigt Toast; Entfernen fragt nach; Editor: Foto anhängen und speichern legt Outfit mit Foto an; Abbrechen nach Foto-Wahl fragt „Änderungen verwerfen?“; Outfit-Liste und „Heute“ zeigen bei vorhandenem Foto das Bild.
- Im Browser-Pane: echtes Hochformat-Foto durch `processPhoto(file, { anchor: 'top' })` schicken und Vorschaubild prüfen.
