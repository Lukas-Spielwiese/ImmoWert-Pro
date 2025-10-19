/**
 * Bewertet Rechte und Belastungen nach §§ 46–52.  Dies ist eine
 * exemplarische Umsetzung: Nießbrauch, Wohnrecht und Dienstbarkeiten
 * reduzieren den Bodenwert um je 5 %.  Für ein Erbbaurecht wird der
 * Kapitalwert des Erbbauzinses berechnet.  Die tatsächlichen
 * Auswirkungen können wesentlich komplexer sein und sollten im
 * Gutachten mit entsprechenden Fachkommentaren erläutert werden.
 */
import { EvaluationInput } from './types';
export declare function berechneRechteBelastungen(input: EvaluationInput, bodenwert: number): {
    value: number;
    protocol: string[];
};
