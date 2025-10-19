import { EvaluationInput } from './types';
/**
 * Berechnet den Bodenwert gem. §§ 40–45 ImmoWertV.  Es wird der
 * Bodenrichtwert (BRW) mit der anrechenbaren Fläche multipliziert und
 * anschließend ein optionaler Zu-/Abschlag berücksichtigt.  Der
 * Rechenweg wird als Liste von Strings zurückgegeben, damit im
 * Gutachten ein nachvollziehbares Protokoll erstellt werden kann.
 *
 * @param input Bewertungsdaten
 */
export declare function berechneBodenwert(input: EvaluationInput): {
    value: number;
    protocol: string[];
};
