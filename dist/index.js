"use strict";
/**
 * Einstiegspunkt für die Wertermittlung.  Dieses Script lädt die
 * Bewertungsdaten, validiert sie, ruft die einzelnen Module auf,
 * plausibilisiert die Ergebnisse und exportiert abschließend einen
 * DOCX‑Bericht.  Es kann entweder als Kommandozeilentool oder als
 * importierbares Modul verwendet werden.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEvaluation = runEvaluation;
const fs_1 = require("fs");
const dataSources_1 = require("./dataSources");
const bodenwert_1 = require("./bodenwert");
const sachwert_1 = require("./sachwert");
const ertragswert_1 = require("./ertragswert");
const vergleichswert_1 = require("./vergleichswert");
const rightsEncumbrances_1 = require("./rightsEncumbrances");
const plausi_1 = require("./plausi");
const exportDocx_1 = require("./exportDocx");
/**
 * Führt die Wertermittlung durch und gibt das Ergebnisobjekt zurück.
 */
function runEvaluation(input) {
    // Validierung der Datenquellen
    const ds = (0, dataSources_1.validateDataSources)(input.datenquellen);
    // Ergebnisse
    const results = { plausi: { gewichtungen: {}, finalValue: 0, begruendung: '' } };
    // Bodenwert (falls erforderlich für andere Verfahren)
    let bodenwertRes;
    if (input.verfahren.includes('sachwert') || input.verfahren.includes('ertragswert')) {
        bodenwertRes = (0, bodenwert_1.berechneBodenwert)(input);
        results.bodenwert = bodenwertRes;
    }
    // Vergleichswert
    if (input.verfahren.includes('vergleichswert')) {
        results.vergleichswert = (0, vergleichswert_1.berechneVergleichswert)(input);
    }
    // Ertragswert
    if (input.verfahren.includes('ertragswert')) {
        if (!bodenwertRes)
            bodenwertRes = (0, bodenwert_1.berechneBodenwert)(input);
        results.ertragswert = (0, ertragswert_1.berechneErtragswert)(input, bodenwertRes.value);
    }
    // Sachwert
    if (input.verfahren.includes('sachwert')) {
        if (!bodenwertRes)
            bodenwertRes = (0, bodenwert_1.berechneBodenwert)(input);
        results.sachwert = (0, sachwert_1.berechneSachwert)(input, bodenwertRes.value);
    }
    // Rechte und Belastungen
    let rightsAdjustment = 0;
    if (input.rechteBelastungen) {
        if (!bodenwertRes)
            bodenwertRes = (0, bodenwert_1.berechneBodenwert)(input);
        const rightsRes = (0, rightsEncumbrances_1.berechneRechteBelastungen)(input, bodenwertRes.value);
        rightsAdjustment = rightsRes.value;
        // Der Abzug wird zur Plausibilisierung als separate Info weitergegeben
        // Die Anwendung des Abzugs liegt im Ermessen der Gutachterin
    }
    // Plausibilisierung
    const availableResults = {};
    // Der Bodenwert selbst ist kein Verfahren nach § 6 und wird daher nicht gewichtet,
    // sondern fließt in die anderen Verfahren ein.  Wir berücksichtigen
    // Vergleichs-, Ertrags- und Sachwert.
    if (results.vergleichswert)
        availableResults['vergleichswert'] = results.vergleichswert;
    if (results.ertragswert)
        availableResults['ertragswert'] = results.ertragswert;
    if (results.sachwert)
        availableResults['sachwert'] = results.sachwert;
    const plRes = (0, plausi_1.plausibilisieren)(availableResults, input.verfahrensBegruendungen['sachwert'] || 'keine Angabe');
    results.plausi = {
        gewichtungen: plRes.gewichte,
        bandbreite: plRes.bandbreite,
        finalValue: plRes.value + rightsAdjustment,
        begruendung: input.verfahrensBegruendungen['sachwert'] || ''
    };
    return { results, rightsAdjustment };
}
// CLI-Support: node dist/index.js input.json output.docx
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node dist/index.js input.json [output.docx]');
        process.exit(1);
    }
    const inputPath = args[0];
    const outputPath = args[1] || 'out.docx';
    const raw = (0, fs_1.readFileSync)(inputPath, 'utf-8');
    const json = JSON.parse(raw);
    // Minimale Prüfung: Stichtag muss vorhanden sein
    if (!json.datenquellen || !json.datenquellen.stichtag) {
        console.error('Die Eingabedatei muss einen Stichtag enthalten.');
        process.exit(1);
    }
    const { results, rightsAdjustment } = runEvaluation(json);
    (0, exportDocx_1.exportDocx)(json, results, rightsAdjustment, outputPath);
    console.log(`DOCX-Bericht wurde erstellt: ${outputPath}`);
}
//# sourceMappingURL=index.js.map