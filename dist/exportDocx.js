"use strict";
/**
 * Dieses Modul erzeugt einen DOCX‑Bericht, indem es ein Python‑Skript
 * aufruft, das die JSON‑Daten in eine minimale DOCX‑Datei umwandelt.
 * Die Wahl, Python zu nutzen, basiert auf der Tatsache, dass es
 * einfacher ist, ZIP‑basierte Word‑Dateien programmatisch zu erzeugen
 * als rein in TypeScript ohne zusätzliche Abhängigkeiten.  Für eine
 * native TypeScript‑Lösung könnte JSZip verwendet werden.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDocx = exportDocx;
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const child_process_1 = require("child_process");
function exportDocx(input, results, rightsAdjustment, outputPath) {
    const tmpJson = (0, path_1.join)((0, os_1.tmpdir)(), `immo_eval_${Date.now()}.json`);
    const data = { input, results, rightsAdjustment };
    (0, fs_1.writeFileSync)(tmpJson, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
    // Aufruf des Python‑Skripts zur Erstellung des DOCX
    const scriptPath = (0, path_1.join)(__dirname, '..', 'generate_docx.py');
    try {
        (0, child_process_1.execFileSync)('python3', [scriptPath, tmpJson, outputPath], { stdio: 'inherit' });
    }
    catch (err) {
        throw new Error('Fehler beim Erstellen der DOCX-Datei: ' + err);
    }
}
//# sourceMappingURL=exportDocx.js.map