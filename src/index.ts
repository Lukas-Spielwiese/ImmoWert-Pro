/**
 * Einstiegspunkt für die Wertermittlung.  Dieses Script lädt die
 * Bewertungsdaten, validiert sie, ruft die einzelnen Module auf,
 * plausibilisiert die Ergebnisse und exportiert abschließend einen
 * DOCX‑Bericht.  Es kann entweder als Kommandozeilentool oder als
 * importierbares Modul verwendet werden.
 */

import { readFileSync } from 'fs';
import { EvaluationInput, CalculationResult, Procedure } from './types';
import { validateDataSources } from './dataSources';
import { berechneBodenwert } from './bodenwert';
import { berechneSachwert } from './sachwert';
import { berechneErtragswert } from './ertragswert';
import { berechneVergleichswert } from './vergleichswert';
import { berechneRechteBelastungen } from './rightsEncumbrances';
import { plausibilisieren } from './plausi';
import { exportDocx } from './exportDocx';

/**
 * Führt die Wertermittlung durch und gibt das Ergebnisobjekt zurück.
 */
export function runEvaluation(input: EvaluationInput): { results: CalculationResult; rightsAdjustment: number } {
  // Validierung der Datenquellen
  const ds = validateDataSources(input.datenquellen);
  // Ergebnisse
  const results: CalculationResult = { plausi: { gewichtungen: {}, finalValue: 0, begruendung: '' } };
  // Bodenwert (falls erforderlich für andere Verfahren)
  let bodenwertRes;
  if (input.verfahren.includes('sachwert') || input.verfahren.includes('ertragswert')) {
    bodenwertRes = berechneBodenwert(input);
    results.bodenwert = bodenwertRes;
  }
  // Vergleichswert
  if (input.verfahren.includes('vergleichswert')) {
    results.vergleichswert = berechneVergleichswert(input);
  }
  // Ertragswert
  if (input.verfahren.includes('ertragswert')) {
    if (!bodenwertRes) bodenwertRes = berechneBodenwert(input);
    results.ertragswert = berechneErtragswert(input, bodenwertRes.value);
  }
  // Sachwert
  if (input.verfahren.includes('sachwert')) {
    if (!bodenwertRes) bodenwertRes = berechneBodenwert(input);
    results.sachwert = berechneSachwert(input, bodenwertRes.value);
  }
  // Rechte und Belastungen
  let rightsAdjustment = 0;
  if (input.rechteBelastungen) {
    if (!bodenwertRes) bodenwertRes = berechneBodenwert(input);
    const rightsRes = berechneRechteBelastungen(input, bodenwertRes.value);
    rightsAdjustment = rightsRes.value;
    // Der Abzug wird zur Plausibilisierung als separate Info weitergegeben
    // Die Anwendung des Abzugs liegt im Ermessen der Gutachterin
  }
  // Plausibilisierung
  const availableResults: Partial<Record<Procedure, { value: number; protocol: string[] }>> = {};
  // Der Bodenwert selbst ist kein Verfahren nach § 6 und wird daher nicht gewichtet,
  // sondern fließt in die anderen Verfahren ein.  Wir berücksichtigen
  // Vergleichs-, Ertrags- und Sachwert.
  if (results.vergleichswert) availableResults['vergleichswert'] = results.vergleichswert;
  if (results.ertragswert) availableResults['ertragswert'] = results.ertragswert;
  if (results.sachwert) availableResults['sachwert'] = results.sachwert;
  const plRes = plausibilisieren(availableResults, input.verfahrensBegruendungen['sachwert'] || 'keine Angabe');
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
  const raw = readFileSync(inputPath, 'utf-8');
  const json = JSON.parse(raw) as EvaluationInput;
  // Minimale Prüfung: Stichtag muss vorhanden sein
  if (!json.datenquellen || !json.datenquellen.stichtag) {
    console.error('Die Eingabedatei muss einen Stichtag enthalten.');
    process.exit(1);
  }
  const { results, rightsAdjustment } = runEvaluation(json);
  exportDocx(json, results, rightsAdjustment, outputPath);
  console.log(`DOCX-Bericht wurde erstellt: ${outputPath}`);
}