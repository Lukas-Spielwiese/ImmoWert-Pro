/**
 * Implementiert das Sachwertverfahren nach §§ 35–39 ImmoWertV.  Die
 * Normalherstellungskosten (NHK 2010) und die Gesamtnutzungsdauer (GND)
 * werden in diesem Modul als Konstanten hinterlegt.  Die Restnutzungs-
 * dauer (RND) wird aus Baujahr und Modernisierungsgrad (Anlage 2) oder
 * direkt aus der Eingabe berechnet.  Der Gebäudesachwert wird durch
 * Anwendung des Baupreisindex (§§ 18, 36) auf die NHK ermittelt.
 */
import { EvaluationInput } from './types';
/**
 * Ermittelt den Modernisierungsbonus (ΔRND) in Jahren basierend auf
 * Anlage 2.  Je nach Summe der Maßnahmenpunkte wird eine typisierte
 * Verlängerung der Restnutzungsdauer zurückgegeben.  Dies ist eine
 * vereinfachte Repräsentation – im Gutachten sollte auf die
 * gesetzlichen Grundlagen verwiesen werden.
 */
export declare function ermittleModernisierungsBonus(modernisierung: string[] | undefined): number;
/**
 * Berechnet den Sachwert der baulichen Anlagen (§§ 35–39).  Der
 * Rückgabewert enthält sowohl den Wert als auch ein Protokoll der
 * Zwischenschritte.  Zur Berechnung wird zwingend ein
 * Baupreisindex benötigt; sofern kein Index angegeben ist, wird ein
 * Fehler ausgelöst.
 *
 * @param input Bewertungsdaten
 * @param bodenwert Der zuvor berechnete Bodenwert wird benötigt, um den
 *                  Sachwertfaktor ggf. anzuwenden.
 */
export declare function berechneSachwert(input: EvaluationInput, bodenwert: number): {
    value: number;
    protocol: string[];
};
