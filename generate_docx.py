#!/usr/bin/env python3
"""
generate_docx.py – erstelle ein minimal strukturiertes DOCX‑Gutachten

Dieses Skript erzeugt ein einfaches DOCX‑Dokument aus einer JSON‑Datei, die
die Eingaben und Ergebnisse der Wertermittlung enthält.  Der Bericht
enthält die wichtigsten Abschnitte: Titelblatt, Bodenwert, Vergleichs-
wert, Ertragswert, Sachwert, Plausibilisierung und Hinweise zu Anhängen.
Das Layout ist schlicht gehalten, um das Hauptaugenmerk auf
Nachvollziehbarkeit zu legen.  Es ersetzt keine professionelle Format-
ierung, bietet jedoch alle notwendigen Informationen, die in der
Beurteilung nach ImmoWertV 2021 erforderlich sind.

Nutzung:

    python generate_docx.py input.json output.docx

Die JSON-Datei muss das folgende Schema besitzen:

{
  "input": { ... EvaluationInput ... },
  "results": { ... CalculationResult ... },
  "rightsAdjustment": number
}

Die DOCX-Datei wird am angegebenen Pfad erstellt.
"""

import json
import sys
import zipfile
import datetime


def xml_escape(text: str) -> str:
    """Escapes XML special characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def build_document(data: dict) -> str:
    lines = []
    # Titelblatt
    lines.append("Verkehrswertgutachten")
    lines.append("")
    inp = data.get("input", {})
    results = data.get("results", {})
    # Objektinfos
    lines.append(f"Objekt: {inp.get('objektbezeichnung', '-')}")
    lines.append(f"Wertermittlungsstichtag: {inp.get('datenquellen', {}).get('stichtag', '-')}")
    lines.append("")
    # Bodenwert
    bw_res = results.get('bodenwert')
    if bw_res:
        lines.append("1 – Bodenwert")
        for line in bw_res.get('protocol', []):
            lines.append(line)
        lines.append(f"Bodenwert: €{bw_res.get('value', 0):.2f}")
        lines.append("")
    # Vergleichswert
    vw_res = results.get('vergleichswert')
    if vw_res:
        lines.append("2 – Vergleichswert")
        for line in vw_res.get('protocol', []):
            lines.append(line)
        lines.append(f"Vergleichswert: €{vw_res.get('value', 0):.2f}")
        lines.append("")
    # Ertragswert
    ew_res = results.get('ertragswert')
    if ew_res:
        lines.append("3 – Ertragswert")
        for line in ew_res.get('protocol', []):
            lines.append(line)
        lines.append(f"Ertragswert: €{ew_res.get('value', 0):.2f}")
        lines.append("")
    # Sachwert
    sw_res = results.get('sachwert')
    if sw_res:
        lines.append("4 – Sachwert")
        for line in sw_res.get('protocol', []):
            lines.append(line)
        lines.append(f"Sachwert: €{sw_res.get('value', 0):.2f}")
        lines.append("")
    # Plausibilisierung
    pl = results.get('plausi', {})
    if pl:
        lines.append("5 – Plausibilisierung")
        gewichte = pl.get('gewichtungen', {})
        lines.append("Gewichtungen:")
        for k, v in gewichte.items():
            lines.append(f"  {k}: {v*100:.1f}%")
        band = pl.get('bandbreite', {})
        if band:
            lines.append(f"Bandbreite: €{band.get('min', 0):.2f} – €{band.get('max', 0):.2f}")
        lines.append(f"Finaler Verkehrswert: €{pl.get('finalValue', 0):.2f}")
        if 'begruendung' in pl:
            lines.append(f"Begründung: {pl['begruendung']}")
        lines.append("")
    # Rechte/Belastungen
    adj = data.get('rightsAdjustment', 0)
    if adj:
        lines.append("6 – Rechte und Belastungen")
        lines.append(f"Wertauswirkung: €{adj:.2f}")
        lines.append("")
    # Zeitstempel
    lines.append(f"Erstellt am: {datetime.date.today().isoformat()}")
    return "\n".join(lines)


def build_docx_xml(content: str) -> str:
    doc_text = xml_escape(content)
    return f"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" \
        f"<w:document xmlns:wpc=\"http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas\" xmlns:mc=\"http://schemas.openxmlformats.org/markup-compatibility/2006\" xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" xmlns:m=\"http://schemas.openxmlformats.org/officeDocument/2006/math\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:wp14=\"http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing\" xmlns:wp=\"http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing\" xmlns:w10=\"urn:schemas-microsoft-com:office:word\" xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" xmlns:w14=\"http://schemas.microsoft.com/office/word/2010/wordml\" xmlns:wpg=\"http://schemas.microsoft.com/office/word/2010/wordprocessingGroup\" xmlns:wpi=\"http://schemas.microsoft.com/office/word/2010/wordprocessingInk\" xmlns:wne=\"http://schemas.microsoft.com/office/word/2006/wordml\" xmlns:wps=\"http://schemas.microsoft.com/office/word/2010/wordprocessingShape\" mc:Ignorable=\"w14 wp14\">\n" \
        f"  <w:body>\n" \
        f"    <w:p>\n" \
        f"      <w:r>\n" \
        f"        <w:t xml:space=\"preserve\">{doc_text}</w:t>\n" \
        f"      </w:r>\n" \
        f"    </w:p>\n" \
        f"    <w:sectPr>\n" \
        f"      <w:pgSz w:w=\"11906\" w:h=\"16838\"/>\n" \
        f"      <w:pgMar w:top=\"1440\" w:right=\"1440\" w:bottom=\"1440\" w:left=\"1440\" w:header=\"708\" w:footer=\"708\" w:gutter=\"0\"/>\n" \
        f"    </w:sectPr>\n" \
        f"  </w:body>\n" \
        f"</w:document>"


def main():
    if len(sys.argv) != 3:
        print("Usage: generate_docx.py input.json output.docx", file=sys.stderr)
        sys.exit(1)
    input_json = sys.argv[1]
    output_docx = sys.argv[2]
    with open(input_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    content = build_document(data)
    document_xml = build_docx_xml(content)
    styles_xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<w:styles xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">\n  <w:style w:type=\"paragraph\" w:default=\"1\" w:styleId=\"Normal\">\n    <w:name w:val=\"Normal\"/>\n    <w:qFormat/>\n    <w:rsid w:val=\"00000000\"/>\n    <w:pPr/>\n    <w:rPr/>\n  </w:style>\n</w:styles>"
    # Erstelle docx (ZIP mit minimalen Dateien)
    with zipfile.ZipFile(output_docx, 'w', zipfile.ZIP_DEFLATED) as docx:
        docx.writestr('[Content_Types].xml', """<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">
  <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>
  <Default Extension=\"xml\" ContentType=\"application/xml\"/>
  <Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>
  <Override PartName=\"/word/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml\"/>
</Types>""")
        docx.writestr('_rels/.rels', """<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">
  <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>
</Relationships>""")
        docx.writestr('word/_rels/document.xml.rels', """<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">
  <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/>
</Relationships>""")
        docx.writestr('word/document.xml', document_xml)
        docx.writestr('word/styles.xml', styles_xml)
    print(f"Generated {output_docx}")


if __name__ == '__main__':
    main()