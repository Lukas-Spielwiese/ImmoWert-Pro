/**
 * Dieses Modul führt die Plausibilisierung und Gewichtung der
 * Wertermittlungsverfahren durch (§ 6 ImmoWertV).  Es fasst die
 * Ergebnisse der einzelnen Module zusammen, berechnet eine Bandbreite
 * und bildet den finalen Verkehrswert.  Die Gewichtungen können
 * gleichmäßig verteilt oder benutzerdefiniert sein.
 */
import { Procedure } from './types';
/**
 * Berechnet den finalen Verkehrswert aus den Ergebnissen der gewählten
 * Verfahren.  Wenn keine Gewichtungen übergeben werden, werden alle
 * Verfahren gleich gewichtet.  Bandbreite und Begründungsfeld werden
 * generiert.  Die Verteilung der Gewichte wird im Ergebnis protokolliert.
 */
export declare function plausibilisieren(results: Partial<Record<Procedure, {
    value: number;
    protocol: string[];
}>>, begruendung: string, gewichtungen?: Partial<Record<Procedure, number>>): {
    value: number;
    protocol: string[];
    gewichte: Record<Procedure, number>;
    bandbreite: {
        min: number;
        max: number;
    };
};
