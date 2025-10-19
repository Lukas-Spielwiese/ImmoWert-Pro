/**
 * Einstiegspunkt für die Wertermittlung.  Dieses Script lädt die
 * Bewertungsdaten, validiert sie, ruft die einzelnen Module auf,
 * plausibilisiert die Ergebnisse und exportiert abschließend einen
 * DOCX‑Bericht.  Es kann entweder als Kommandozeilentool oder als
 * importierbares Modul verwendet werden.
 */
import { EvaluationInput, CalculationResult } from './types';
/**
 * Führt die Wertermittlung durch und gibt das Ergebnisobjekt zurück.
 */
export declare function runEvaluation(input: EvaluationInput): {
    results: CalculationResult;
    rightsAdjustment: number;
};
