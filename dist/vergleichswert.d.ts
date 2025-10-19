/**
 * Implementiert das Vergleichswertverfahren (§§ 24–26 ImmoWertV).  Es
 * normiert Vergleichspreise auf den Bewertungsstichtag und den
 * Bewertungsgegenstand.  Für diese Beispielimplementierung wird der
 * arithmetische Mittelwert der Vergleichspreise pro m² gebildet; eine
 * Gewichtung oder Umrechnung nach spezifischen Merkmalen (§ 26) kann
 * durch Anpassung der Funktion `normalizePreis` erfolgen.
 */
import { EvaluationInput } from './types';
/**
 * Berechnet den Vergleichswert, indem die normierten Preise der
 * Vergleichsobjekte gemittelt und mit der Fläche des Bewertungsobjekts
 * multipliziert werden.  Ist keine Fläche vorhanden, wird der Mittelwert
 * als Ergebnis verwendet.  Der Rechenweg wird protokolliert.
 */
export declare function berechneVergleichswert(input: EvaluationInput): {
    value: number;
    protocol: string[];
};
