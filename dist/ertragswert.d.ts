/**
 * Dieses Modul implementiert das Ertragswertverfahren nach §§ 27–34
 * ImmoWertV.  Es berechnet zunächst den Rohertrag aus den
 * Mietwerten, zieht die Bewirtschaftungskosten (Anlage 3) ab,
 * ermittelt die Verzinsung des Bodenwerts und kapitalisiert den
 * Gebäudereinertrag mit dem Barwertfaktor (§ 34).
 */
import { EvaluationInput } from './types';
/**
 * Rentenbarwertfaktor für eine endliche Laufzeit n Jahre bei Zinssatz i.
 * Formel: [(1 + i)^n - 1] / [i * (1 + i)^n].  Der Zinssatz wird als
 * Prozent (z. B. 3.5 für 3,5 %) übergeben und intern als Dezimalzahl
 * verwendet.
 */
export declare function barwertFaktor(i: number, n: number): number;
/**
 * Berechnet den Ertragswert (§§ 27–34).  Erfordert einen bereits
 * berechneten Bodenwert und einen Liegenschaftszinssatz.  Fehlende
 * Eingaben führen zu Fehlermeldungen.
 */
export declare function berechneErtragswert(input: EvaluationInput, bodenwert: number): {
    value: number;
    protocol: string[];
};
