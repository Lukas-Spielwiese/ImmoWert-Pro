/**
 * Dieses Modul führt die Plausibilisierung und Gewichtung der
 * Wertermittlungsverfahren durch (§ 6 ImmoWertV).  Es fasst die
 * Ergebnisse der einzelnen Module zusammen, berechnet eine Bandbreite
 * und bildet den finalen Verkehrswert.  Die Gewichtungen können
 * gleichmäßig verteilt oder benutzerdefiniert sein.
 */

import { CalculationResult, Procedure } from './types';

/**
 * Berechnet den finalen Verkehrswert aus den Ergebnissen der gewählten
 * Verfahren.  Wenn keine Gewichtungen übergeben werden, werden alle
 * Verfahren gleich gewichtet.  Bandbreite und Begründungsfeld werden
 * generiert.  Die Verteilung der Gewichte wird im Ergebnis protokolliert.
 */
export function plausibilisieren(
  results: Partial<Record<Procedure, { value: number; protocol: string[] }>>,
  begruendung: string,
  gewichtungen?: Partial<Record<Procedure, number>>
): { value: number; protocol: string[]; gewichte: Record<Procedure, number>; bandbreite: { min: number; max: number } } {
  const available: Procedure[] = Object.keys(results) as Procedure[];
  const prot: string[] = [];
  if (available.length === 0) {
    throw new Error('Keine Ergebnisse zur Plausibilisierung vorhanden.');
  }
  // Normalisierte Gewichte
  let weights: Record<Procedure, number> = {} as any;
  if (!gewichtungen) {
    const eq = 1 / available.length;
    available.forEach(p => {
      weights[p] = eq;
    });
  } else {
    let sum = 0;
    available.forEach(p => {
      const w = gewichtungen[p] ?? 0;
      sum += w;
    });
    if (sum <= 0) {
      throw new Error('Die Summe der Gewichtungen muss > 0 sein.');
    }
    available.forEach(p => {
      weights[p] = (gewichtungen[p] ?? 0) / sum;
    });
  }
  // Finaler Wert
  let finalValue = 0;
  available.forEach(p => {
    const w = weights[p];
    const v = results[p]!.value;
    finalValue += w * v;
    prot.push(`${p}-Verfahren: Wert \u20ac${v.toFixed(2)} × Gewicht ${w.toFixed(3)} = \u20ac${(v * w).toFixed(2)}`);
  });
  // Bandbreite: min/max
  const values = available.map(p => results[p]!.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  prot.push(`Bandbreite der Werte: min=\u20ac${min.toFixed(2)}, max=\u20ac${max.toFixed(2)}`);
  prot.push(`Begründung der Gewichtung: ${begruendung}`);
  return { value: finalValue, protocol: prot, gewichte: weights, bandbreite: { min, max } };
}