/**
 * Dieses Modul erzeugt einen DOCX‑Bericht, indem es ein Python‑Skript
 * aufruft, das die JSON‑Daten in eine minimale DOCX‑Datei umwandelt.
 * Die Wahl, Python zu nutzen, basiert auf der Tatsache, dass es
 * einfacher ist, ZIP‑basierte Word‑Dateien programmatisch zu erzeugen
 * als rein in TypeScript ohne zusätzliche Abhängigkeiten.  Für eine
 * native TypeScript‑Lösung könnte JSZip verwendet werden.
 */
import { EvaluationInput, CalculationResult } from './types';
export declare function exportDocx(input: EvaluationInput, results: CalculationResult, rightsAdjustment: number, outputPath: string): void;
