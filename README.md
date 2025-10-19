# Professionelle Immobiliengutachten‑App (ImmoWertPro)

Dieses Verzeichnis enthält eine überarbeitete Version des reinen
Client‑seitigen Verkehrswertgutachten‑Generators. Die Zielsetzung der
Überarbeitung besteht darin, eine **professionelle Anwendung** zu schaffen,
die das Sachwertverfahren nach **ImmoWertV 2021** in der Fassung ab
2025 abbildet und Ihnen alle wichtigen Stellgrößen konfigurierbar
bereitstellt. Im Mittelpunkt stehen:

* eine **umfangreiche Datenerfassung** mit Freitextfeldern,
  Modernisierungspunkten, Baualters‑ und Nutzungsdauern,
  Bodenrichtwerten, Liegenschaftszinssätzen sowie regionalen und
  preisindexbezogenen Korrekturfaktoren.
* die **Einbindung der Normalherstellungskosten 2010 (NHK 2010)** je
  Gebäudeart und Standardstufe sowie eine lineare Alterswertminderung
  in Abhängigkeit von Alter und üblichen Gesamtnutzungsdauern
  (Anlage 3 SW‑RL). Die Baupreisentwicklung wird über einen
  **Baupreisindex** berücksichtigt, der manuell aktualisierbar ist.
* die Möglichkeit, den **Modernisierungsgrad** nach Anlage 4 SW‑RL
  punktgenau durch Ankreuzen von Modernisierungsmaßnahmen zu ermitteln.
* die Ermittlung der vorläufigen Sachwerte, Ertragswerte und
  Vergleichswerte mit Plausibilisierung und manueller Feinanpassung.
* die **Generierung eines ausführlichen Gutachtens** als DOCX, das
  strukturiert alle Eingaben, Rechnungen und Begründungen aufführt.
  Bilder lassen sich zusammen mit der Exportdatei (`.ivg.zip`) hochladen
  und werden im Exportordner `attachments/` abgelegt. Für eine
  komfortable Nachbearbeitung ist im DOCX lediglich ein Hinweis auf
  vorhandene Bilder enthalten; die automatische Einbettung ist aus
  Kompatibilitätsgründen bewusst nicht implementiert.
* ein **Import‑/Export‑Format** im ZIP‑Container (`.ivg.zip`), das
  `gutachten.json` (strukturierte Fachdaten), `meta.json` (Hashes
  und Zeitstempel), `Gutachten.docx` (Bericht) und
  `attachments/` (Bilder) enthält. Exporte lassen sich in der App
  wieder importieren.

## Hinweis zur Aktualisierung externer Daten

Die in `script.js` hinterlegten Standardwerte (NHK‑Tabellen,
Gesamtnutzungsdauern, Baupreisindex, regionale Faktoren) sind
Momentaufnahmen. **Pflegen Sie diese regelmäßig**, indem Sie die
entsprechenden Konstanten aktualisieren (z. B. die
`BAUPREISINDEX`‑Werte oder die NHK‑Kostensätze). Eine automatische
Online‑Aktualisierung ist aus Datenschutz‑ und Lizenzgründen nicht
integriert. Quellen: ImmoWertV 2021; Sachwertrichtlinie (SW‑RL);
Bundesfinanzministerium (Baupreisindex 2022: 141 % für Wohngebäude,
142 % für Bürogebäude)【559551144243427†L422-L445】.

## Nutzung

1. Öffnen Sie `index.html` in einem Browser. Die App funktioniert
   vollständig offline. Geben Sie die Objektdaten sowie alle
   erforderlichen Parameter ein. Verwenden Sie die Freitextfelder
   (z. B. Objektbeschreibung, Rechte/Lasten, Verfahrens‑Begründungen),
   um besondere Merkmale zu dokumentieren.
2. Klicken Sie auf **„Berechnung durchführen“**, um die vorläufigen
   Vergleichs‑, Ertrags‑ und Sachwerte zu berechnen. Die App führt
   einfache Plausibilitätsprüfungen durch, zeigt Bandbreiten an und
   bietet die Möglichkeit, einen manuellen Verkehrswert festzulegen.
3. Exportieren Sie das Gutachten über **„Exportieren (JSON + DOCX)“**.
   Es wird ein ZIP‑Container heruntergeladen. Fügen Sie nach dem
   Export ggf. weitere Bilder in den Ordner `attachments/` hinzu
   (z. B. mit einem externen Dateimanager) und ergänzen Sie diese
   anschließend manuell im DOCX.
4. Importieren Sie bestehende `.ivg.zip`‑Dateien jederzeit über
   **„Importieren“**. Die App stellt alle Eingaben wieder her.

## Haftungsausschluss

Diese Software stellt **keinen Ersatz für eine professionelle
Sachverständigentätigkeit** dar. Die implementierten Algorithmen
orientieren sich an öffentlich verfügbaren Regelwerken (ImmoWertV,
SW‑RL), sind jedoch stark vereinfacht. Prüfen Sie alle Ergebnisse
sorgfältig, legen Sie eigenes Expertenwissen zugrunde und dokumentieren
Ihre Begründungen ausführlich.