# ImmoWertProTS – Verkehrswertermittlung nach ImmoWertV 2021

Diese Codebasis ist eine umfassende Überarbeitung der ursprünglichen "ImmoWertPro"‑Applikation.  Ziel ist es, die Wertermittlung von Immobilien ausschließlich auf Basis der **Immobilienwertermittlungsverordnung 2021 (ImmoWertV 2021)** inklusive ihrer Anlagen 1–5 durchzuführen.  Die ehemaligen Richtlinien (SW‑RL/EW‑RL/VW‑RL) werden **nicht mehr verwendet**.  Stattdessen werden alle Berechnungen modellkonform nach den entsprechenden Paragraphen der ImmoWertV umgesetzt und vollständig dokumentiert.

## Projektstruktur

```text
immo-wert-pro-ts/
├── src/                    # TypeScript‑Quellcode
│   ├── index.ts            # Einstiegspunkt (aggregiert alle Module)
│   ├── types.ts            # Zentrale Typdefinitionen und Zod‑Schemas
│   ├── dataSources.ts      # Laden und Validieren externer Daten (BRW, LZ, Indizes etc.)
│   ├── bodenwert.ts        # Berechnung des Bodenwerts (§§ 40–45)
│   ├── vergleichswert.ts   # Vergleichswertverfahren (§§ 24–26)
│   ├── ertragswert.ts      # Ertragswertverfahren (§§ 27–34)
│   ├── sachwert.ts         # Sachwertverfahren (§§ 35–39; Anlagen 1–4)
│   ├── rightsEncumbrances.ts # Modellierung und Bewertung von Rechten/Belastungen (§§ 46–52)
│   ├── plausi.ts           # Plausibilisierung und Gewichtung (§ 6)
│   └── exportDocx.ts       # Erzeugen eines DOCX‑Gutachtens mit Rechenanhang
├── tests/                  # Unit‑ und E2E‑Tests (Jest, Playwright)
│   ├── jest.config.js
│   ├── ertragswert.test.ts
│   ├── sachwert.test.ts
│   └── e2e.test.ts        # Playwright‑Test (GUI‑Ablauf)
├── example.json           # Beispielhafte Bewertungsdaten
├── example.docx           # Ergebnis eines Beispiel‑Exports (synthetische Daten)
├── tsconfig.json          # TypeScript‑Konfiguration
└── CHANGELOG.md           # Nachvollziehbare Änderungen
```

## Installation und Nutzung

1. **Abhängigkeiten installieren**

   ```sh
   npm install
   ```

   Für diese Demo werden keine externen Pakete benötigt.  Jest und Playwright sind als Dev‑Dependencies definiert; sollten sie nicht installiert sein, müssen sie per `npm install --save-dev jest @types/jest playwright` nachinstalliert werden.

2. **TypeScript kompilieren**

   ```sh
   npm run build
   ```

   Dieser Befehl erzeugt das Verzeichnis `dist/` mit den kompilierten JavaScript‑Dateien.

3. **Tests ausführen**

   ```sh
   npm test
   ```

   Führt alle Unit‑Tests aus.  Der E2E‑Test (`playwright`) kann über `npm run test:e2e` gestartet werden.

4. **Beispielgutachten erzeugen**

   ```sh
   node dist/index.js example.json example.docx
   ```

   Der Kommandozeilen‑Wrapper im Einstiegspunkt liest Bewertungsdaten aus einer JSON‑Datei, führt alle Berechnungen durch, prüft die Eingaben auf Modellkonformität und erstellt ein DOCX‑Gutachten im definierten Format.

## Fachlicher Ablauf (gem. ImmoWertV 2021)

1. **Stammdaten & Rechtsrahmen**: Pflichteingaben sind der Wertermittlungsstichtag und die Verfahrenswahl.  Weitere Pflichtfelder (Planungsrecht, Objektabgrenzung, Rechte/Belastungen) werden mit Zod validiert.  Eine Ampel zeigt die Modellkonformität basierend auf der Verfügbarkeit und Stichtagstreue der Daten.

2. **Datenbasis (Quellen & Stichtage)**: Bodenrichtwert, Liegenschaftszinssatz, Sachwertfaktoren, Vergleichsfaktoren, Indexreihen (Baupreis, Verbraucherpreis), Erbbau‑Parameter und der Merkmalekatalog (Anlage 5) werden strukturiert erfasst.  Fehlende oder veraltete Stichtage blockieren die Berechnung.

3. **Bodenwert (§§ 40–45)**: Der Bodenwert wird primär aus dem Bodenrichtwert (Zone) und der anrechenbaren Fläche ermittelt.  Zu‑/Abschläge gem. §§ 41–45 können als separate Auf- bzw. Abschlagwerte eingegeben werden.  Der Rechenweg (BRW × Fläche ± Anpassungen) wird protokolliert.

4. **Vergleichswert (§§ 24–26)**: Jede Vergleichstransaktion wird mit Datum, Fläche, Zustand, Lage, Rechten/Belastungen und Preis hinterlegt.  Die Preise werden auf den Bewertungsstichtag angepasst (§§ 7, 18) und mithilfe von Vergleichs- und Umrechnungskoeffizienten (§ 26) normiert.  Der arithmetische Mittelwert oder ein gewichtetes Mittel liefert den Vergleichswert.

5. **Ertragswert (§§ 27–34)**: Ausgehend von Ist‑, Soll‑ und Markt­mieten werden Roherträge ermittelt, Bewirtschaftungskosten nach Anlage 3 abgezogen und der Reinertrag des Grundstücks berechnet.  Bodenwertverzinsung (§ 31) und Barwertfaktoren (§ 34) fließen ein.  Eine objektspezifische Anpassung des Liegenschaftszinssatzes (§ 33) ist möglich.  Transparent werden Rohertrag → Bewirtschaftungskosten → Reinertrag → Gebäudereinertrag → Kapitalisierung → Ertragswert dargestellt.

6. **Sachwert (§§ 35–39; Anlagen 1–4)**: Die NHK 2010 aus Anlage 4 werden für jede Gebäudeart/Standardklasse verwendet.  Eine Indexierung der Herstellungskosten erfolgt über den Baupreisindex (§§ 18, 36).  Die Gesamtnutzungsdauer aus Anlage 1 und die restliche Nutzungsdauer (unter Berücksichtigung des Modernisierungsgrades nach Anlage 2) bestimmen die Alterswertminderung.  Außenanlagen (§ 37) und Sachwertfaktoren (§ 39) werden einbezogen.  

7. **Rechte und Belastungen (§§ 46–52)**: Nießbrauch, Wohnrechte, Dienstbarkeiten, Erbbaurechte und andere Belastungen werden strukturiert erfasst und mittels finanzmathematischer Methoden bewertet (z. B. Erbbauzinskapitalisierung).  

8. **Plausibilisierung & Gewichtung (§ 6)**: Die Ergebnisse der Bodenwert‑, Vergleichswert‑, Ertragswert‑ und Sachwertverfahren werden gegenübergestellt.  Gewichtungen und Bandbreiten werden mit Begründung angegeben.  

9. **Transparente Rechenprotokolle**: Jedes Modul protokolliert Formel, Eingaben, Quellen, Stichtage und Zwischensummen.  Diese werden sowohl im UI ausklappbar angezeigt als auch als Rechenanhänge im DOCX exportiert.  

10. **DOCX‑Export**: Über `exportDocx.ts` wird aus einer vordefinierten Vorlage ein professionelles Gutachten erzeugt (Deckblatt, Inhaltsverzeichnis, Rechtsrahmen, Parameterblatt, vier Verfahrenskapitel, Plausibilisierung, Ergebnis, Anlagenverzeichnis).  Bilder aus dem `attachments`‑Ordner werden eingebettet (16:9‑Format).  Seitennummern, Kopf‑/Fußzeilen und Versionsstand werden gesetzt.

## Bekanntes Limit & Ausblick

- Die NHK 2010 sind als Konstanten hinterlegt.  Künftige Aktualisierungen der NHK oder des Baupreisindex müssen manuell in `src/sachwert.ts` aktualisiert werden.
- Der Playwright‑Test verwendet eine vereinfachte HTML‑Oberfläche in `dist/ui.html` zur Demonstration.  Die produktive Einbindung in eine Next.js‑ oder Vercel‑App muss separat erfolgen.
- Dieses Repository ist ein fachliches und technisches Muster; es ersetzt nicht die gutachterliche Verantwortung.
