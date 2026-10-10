# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Eine einzige Person: Lena. Sie nutzt die App auf ihrem iPhone als Home-Bildschirm-App (PWA), meist **morgens vor dem Kleiderschrank**, um schnell zu entscheiden, was sie heute anzieht. Bedienung meist mit einer Hand, mit wenig Zeit und Geduld.

## Product Purpose

Lenas Kleidung digital erfassen (Foto, Kategorie, Farben, Saison, Notiz), schnell wiederfinden und zu benannten Outfits kombinieren. Damit ist morgens sofort klar, was sie anziehen kann. Erfolg bedeutet: Ein Teil ist in Sekunden erfasst, ein passendes Outfit in Sekunden gefunden, und es gehen keine Daten verloren.

## Positioning

Ein persönlicher, privater Kleiderschrank für genau eine Person. Kein Konto, keine Cloud, keine Werbung und kein Social Feed. Die App gehört Lena, spricht sie mit Namen an und wirkt wie ihr eigener Schrank, nicht wie ein Shopping- oder Mode-Portal.

## Operating Context

- Morgens vor dem offenen Schrank, oft in Eile. Die Frage lautet „Was ziehe ich heute an?“.
- Teile werden mit der iPhone-Kamera oder aus der Fotomediathek erfasst.
- Backups sind JSON-Dateien, die Lena über das iOS-Teilen-Menü in iCloud Drive sichert und bei Bedarf wieder einspielt.
- Die App läuft offline vom Home-Bildschirm. Safari und die Home-Bildschirm-App haben getrennte Speicher.

## Capabilities and Constraints

- Teile: Foto (Pflicht), Kategorie (Pflicht, genau eine von 9: Oberteil, Hose, Rock, Kleid, Jacke/Mantel, Schuhe, Tasche, Accessoire, Sonstiges), Farben (0..n aus 14), Saisons (0..n: Frühling, Sommer, Herbst, Winter), Notiz (optional).
- Filtern nach Kategorie, Farbe und Saison. Outfits sind benannte Auswahlen von Teilen.
- Einstellungen: Backup erstellen/sichern, Backup einspielen (ersetzt alles), Speicherübersicht.
- **Neu gewünscht:** eine persönliche Begrüßung auf der Startseite mit wechselnden Texten rund um Outfits und Kleiderschrank, ähnlich der wechselnden Begrüßung im Claude-Hauptfenster. Der **Name ist in den Einstellungen wählbar**. Ohne Namen gibt es eine Begrüßung ohne Anrede.
- Technisch: keine Server, keine Accounts, alles lokal (IndexedDB). Das Backup-Format v1 muss kompatibel bleiben. Die Oberfläche ist komplett auf Deutsch.
- Offen: Wetter-Anbindung gibt es nicht. Sie bräuchte einen externen Dienst und ist nicht beschlossen.

## Brand Commitments

- Der App-Name „Kleiderschrank“ und das Kleiderbügel-Symbol bestehen bereits.
- Ton: warm, persönlich, Deutsch in Alltagssprache, du-Form.

## Evidence on Hand

- Es gibt keine echten Fotos von Lenas Kleidung im Repository. Lenas Daten liegen nur auf ihrem iPhone. Für Entwürfe dienen generierte Platzhalter-Teile; echte Inhalte dürfen nicht erfunden werden.

## Product Principles

1. **Die Kleidung ist der Star.** Fotos haben Vorrang vor Verwaltung, Filtern und Hinweisen.
2. **Morgens in Sekunden.** Der wichtigste Weg ist „App öffnen → passendes Outfit oder Teil sehen“, mit einer Hand.
3. **Lenas eigener Raum.** Persönliche Ansprache und Wärme statt neutralem System-Look, ohne Kitsch.
4. **Nichts geht verloren.** Riskante Aktionen (Löschen, Import, Formular verlassen) sind abgesichert.

## Accessibility & Inclusion

Standard: WCAG AA, Tippflächen ≥ 44 pt, Unterstützung für VoiceOver. Keine besonderen zusätzlichen Anforderungen bekannt.
