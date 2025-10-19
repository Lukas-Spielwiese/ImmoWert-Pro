/*
 * docxGenerator.js – Professioneller DOCX‑Bericht
 *
 * Diese Version erzeugt ein strukturiertes Gutachten im DOCX‑Format. Es
 * gliedert die Inhalte in sinnvolle Abschnitte (Objektbeschreibung,
 * Datenquellen, Modernisierung, Sachwert‑, Ertrags‑ und
 * Vergleichswertverfahren, Ergebnisse sowie Freitexte) und listet die
 * Dateinamen aller hochgeladenen Anlagen auf. Bilder werden aus
 * Kompatibilitätsgründen **nicht automatisch eingebettet**; die Anwenderin
 * kann sie nach dem Export im Ordner `attachments/` ergänzen und in
 * Word selbst einfügen. Die generierte Datei verwendet einfache
 * Fließtexte – eine ausgefeilte Layoutgestaltung bleibt bewusst
 * ausgespart, um maximale Portabilität zu erreichen.
 */

// JSZip wird im globalen Namespace (via jszip.min.js) bereitgestellt.

/**
 * Erzeugt eine DOCX‑Datei aus den strukturierten Gutachtendaten.
 *
 * @param {Object} data Das aus der App ermittelte Datenobjekt.
 * @returns {Promise<Blob>} Promise, das den DOCX‑Blob liefert.
 */
function generateDocx(data) {
  const zip = new JSZip();

  // Hilfsfunktion zum Escapen von XML‑Sonderzeichen
  function xmlEscape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Hilfsfunktion: erstellt einen Abschnitt mit Überschrift und Inhalt.
  function section(title, lines) {
    const arr = [];
    arr.push(title);
    arr.push('');
    lines.forEach(l => arr.push(l));
    arr.push('');
    return arr;
  }

  // Baue Textinhalt
  const content = [];
  // Titelseite
  content.push('Verkehrswertgutachten');
  content.push('');
  content.push(`Objektnummer: ${data.onr || ''}`);
  content.push(`Gebäudeart: ${data.objekt.gebaeudeart || ''} (Standardstufe ${data.objekt.standardstufe || ''})`);
  content.push(`Baujahr: ${data.objekt.baujahr || ''}`);
  content.push(`BGF: ${data.objekt.bgf || 0} m²`);
  content.push(`Grundstücksfläche: ${data.objekt.grundstueck.flaeche || 0} m²`);
  content.push(`Rechte/Lasten: ${data.objekt.rechte_lasten || '–'}`);
  content.push(`Besonderheiten: ${data.objekt.besonderheiten || '–'}`);
  content.push('');
  content.push('');
  content.push(`Stichtage – Wertermittlung: ${data.stichtage.wertermittlung || ''}, Daten: ${data.stichtage.daten || ''}, Foto: ${data.stichtage.foto || ''}`);
  content.push('');

  // Abschnitt 1 – Objektbeschreibung
  const objLines = [];
  objLines.push(`Lagebeschreibung: ${data.objekt.lage_beschreibung || '–'}`);
  objLines.push(`Nutzung / Gebäudeart: ${data.objekt.nutzung || '–'}`);
  objLines.push(`Übliche Gesamtnutzungsdauer: ${data.objekt.gnd || ''} Jahre`);
  objLines.push(`Restnutzungsdauer: ${data.objekt.restnutzungsdauer || ''} Jahre`);
  objLines.push(`Modernisierung: ${data.objekt.modernisierungspunkte || 0} Punkte, ${data.objekt.modernisierungsgrad || ''}`);
  content.push(...section('1 – Objektbeschreibung', objLines));

  // Abschnitt 2 – Datenquellen
  const dqLines = [];
  if (data.datenquellen.brw) {
    dqLines.push(`Bodenrichtwert: ${data.datenquellen.brw.wert || ''} €/m² (Zone: ${data.objekt.grundstueck.brw_zone || ''})`);
  }
  if (data.datenquellen.lz) {
    dqLines.push(`Liegenschaftszinssatz: ${data.datenquellen.lz.wert || ''} %`);
  }
  if (data.datenquellen.bpi) {
    dqLines.push(`Baupreisindex (2010=100): ${data.datenquellen.bpi.wert || ''}`);
  }
  dqLines.push(`Regionalfaktor: ${data.datenquellen.regionalFactor || 1}`);
  dqLines.push(`Marktanpassungsfaktor: ${data.datenquellen.marketFactor || 1}`);
  dqLines.push(`NHK Basis (2010): ${data.datenquellen.nhkBase || ''} €/m²`);
  content.push(...section('2 – Datenquellen & Parameter', dqLines));

  // Abschnitt 3 – Modernisierung
  const modLines = [];
  modLines.push(`Modernisierungspunkte: ${data.objekt.modernisierungspunkte || 0}`);
  modLines.push(`Modernisierungsgrad: ${data.objekt.modernisierungsgrad || ''}`);
  content.push(...section('3 – Modernisierung', modLines));

  // Abschnitt 4 – Sachwertverfahren
  const sw = data.verfahren.sachwert;
  const svLines = [];
  svLines.push(`Normalherstellungskosten (Basis): ${sw.nhk} €/m²`);
  svLines.push(`NHK aktuell: ${sw.nhkCurrent.toFixed(2)} €/m² (BPI×Regionalfaktor)`);
  svLines.push(`Altersfaktor: ${(sw.ageFactor * 100).toFixed(2)} %`);
  svLines.push(`Modernisierungszuschlag: ${(sw.modernisierungsFaktor * 100).toFixed(0)} %`);
  svLines.push(`Vorläufiger Sachwert (Gebäude+Grundstück): ${sw.vorlaeufig.toFixed(2)} €`);
  svLines.push(`Marktanpassung: Faktor ${data.datenquellen.marketFactor || 1}`);
  svLines.push(`Sachwert (Endwert): ${sw.resultat.toFixed(2)} €`);
  if (sw.text) svLines.push(`Anmerkungen: ${sw.text}`);
  content.push(...section('4 – Sachwertverfahren', svLines));

  // Abschnitt 5 – Ertragswertverfahren
  const ew = data.verfahren.ertragswert;
  const ewLines = [];
  if (ew.rohertrag > 0) {
    ewLines.push(`Rohertrag: ${ew.rohertrag.toFixed(2)} € p.a.`);
    ewLines.push(`Bewirtschaftungskosten: ${ew.bewirtschaftungskosten.toFixed(2)} € p.a.`);
    ewLines.push(`Reinertrag: ${ew.reinertrag.toFixed(2)} € p.a.`);
    ewLines.push(`Liegenschaftszinssatz: ${data.datenquellen.lz.wert || ''} %`);
    ewLines.push(`Ertragswert: ${ew.resultat.toFixed(2)} €`);
  } else {
    ewLines.push('Keine vermieteten Einheiten angegeben; Ertragswertverfahren nicht angewendet.');
  }
  if (ew.text) ewLines.push(`Anmerkungen: ${ew.text}`);
  content.push(...section('5 – Ertragswertverfahren', ewLines));

  // Abschnitt 6 – Vergleichswertverfahren
  const vw = data.verfahren.vergleichswert;
  const vwLines = [];
  if (vw && vw.vergleichswerte && vw.vergleichswerte.length > 0) {
    vw.vergleichswerte.forEach((c, idx) => {
      const w = c.weight ? ` (Gewichtung ${c.weight}%)` : '';
      vwLines.push(`Vergleich ${idx + 1}: ${c.price.toFixed(2)} €${w}`);
    });
    vwLines.push(`Vergleichswert: ${vw.resultat.toFixed(2)} €`);
  } else {
    vwLines.push('Keine Vergleichswerte angegeben.');
  }
  if (vw.text) vwLines.push(`Anmerkungen: ${vw.text}`);
  content.push(...section('6 – Vergleichswertverfahren', vwLines));

  // Abschnitt 7 – Plausibilisierung & Ergebnis
  const pl = data.plausi;
  const plLines = [];
  plLines.push(`Bandbreite: ${pl.bandbreite.min.toFixed(2)} € – ${pl.bandbreite.max.toFixed(2)} €`);
  plLines.push(`Finaler Verkehrswert: ${pl.final.toFixed(2)} €`);
  if (pl.wahlBegruendung) plLines.push(`Begründung der Wertfestlegung: ${pl.wahlBegruendung}`);
  content.push(...section('7 – Plausibilisierung & Ergebnis', plLines));

  // Abschnitt 8 – Freitexte / sonstige Hinweise
  // Zusammenfassung aller übrigen Texte (Notizen etc.)
  const notesSection = [];
  if (data.verfahren && data.verfahren.sachwert && data.verfahren.sachwert.text) {
    // Der Sachwerttext wird bereits in Abschnitt 4 ausgegeben
  }
  if (data.verfahren && data.verfahren.ertragswert && data.verfahren.ertragswert.text) {
    // Ertragswerttext wird in Abschnitt 5 ausgegeben
  }
  if (data.verfahren && data.verfahren.vergleichswert && data.verfahren.vergleichswert.text) {
    // Vergleichstext wird in Abschnitt 6 ausgegeben
  }
  if (data.plausi && data.plausi.wahlBegruendung) {
    // In Abschnitt 7 enthalten
  }
  // Zusätzliche Notizen sind in data.plausi.wahlBegruendung enthalten
  // Wir fügen dennoch einen generischen Abschnitt hinzu
  if (data.plausi && data.plausi.wahlBegruendung) {
    notesSection.push(`Notizen: ${data.plausi.wahlBegruendung}`);
  }
  if (notesSection.length > 0) {
    content.push(...section('8 – Weitere Notizen', notesSection));
  }

  // Abschnitt 9 – Anhänge
  const attachmentsList = [];
  // Die Dateinamen der Anlagen werden im JSON nicht gespeichert; die App fügt
  // sie dem ZIP‑Ordner `attachments/` hinzu. Die Nutzerin kann die Dateinamen
  // beim Export auslesen (attachmentsFiles) und hier ergänzen.
  attachmentsList.push('Die hochgeladenen Bilder/Dateien finden Sie im Verzeichnis attachments/ der ZIP‑Datei.');
  attachmentsList.push('Bitte fügen Sie diese manuell in den Bericht ein (16:9‑Format empfohlen).');
  content.push(...section('9 – Anhänge', attachmentsList));

  // Füge alle Zeilen zusammen
  const docText = xmlEscape(content.join('\n'));

  // document.xml – Minimaler Aufbau mit einem einzigen Textlauf
  const documentXml = `<?xml version="1.0" encoding="UTF-8"?>\n<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">\n  <w:body>\n    <w:p>\n      <w:r>\n        <w:t xml:space="preserve">${docText}</w:t>\n      </w:r>\n    </w:p>\n    <w:sectPr>\n      <w:pgSz w:w="11906" w:h="16838"/>\n      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>\n    </w:sectPr>\n  </w:body>\n</w:document>`;

  // styles.xml – Minimaler Stil
  const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">\n    <w:name w:val="Normal"/>\n    <w:qFormat/>\n    <w:rsid w:val="00000000"/>\n    <w:pPr/>\n    <w:rPr/>\n  </w:style>\n</w:styles>`;

  // Content‑Types
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>\n</Types>`);
  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n</Relationships>`);
  const word = zip.folder('word');
  word.file('document.xml', documentXml);
  word.file('styles.xml', stylesXml);
  word.folder('_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n</Relationships>`);

  // Generiere Blob
  return zip.generateAsync({ type: 'blob' });
}

// Im Browser‑Scope verfügbar machen
window.generateDocx = generateDocx;