/**
 * Dieses Modul erzeugt einen DOCX‑Bericht, indem es ein Python‑Skript
 * aufruft, das die JSON‑Daten in eine minimale DOCX‑Datei umwandelt.
 * Die Wahl, Python zu nutzen, basiert auf der Tatsache, dass es
 * einfacher ist, ZIP‑basierte Word‑Dateien programmatisch zu erzeugen
 * als rein in TypeScript ohne zusätzliche Abhängigkeiten.  Für eine
 * native TypeScript‑Lösung könnte JSZip verwendet werden.
 */

import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execFileSync } from 'child_process';

import { EvaluationInput, CalculationResult } from './types';

export function exportDocx(
  input: EvaluationInput,
  results: CalculationResult,
  rightsAdjustment: number,
  outputPath: string
): void {
  const tmpJson = join(tmpdir(), `immo_eval_${Date.now()}.json`);
  const data = { input, results, rightsAdjustment };
  writeFileSync(tmpJson, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
  // Aufruf des Python‑Skripts zur Erstellung des DOCX
  const scriptPath = join(__dirname, '..', 'generate_docx.py');
  try {
    execFileSync('python3', [scriptPath, tmpJson, outputPath], { stdio: 'inherit' });
  } catch (err) {
    throw new Error('Fehler beim Erstellen der DOCX-Datei: ' + err);
  }
}