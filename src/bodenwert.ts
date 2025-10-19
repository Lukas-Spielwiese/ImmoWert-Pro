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
export function berechneBodenwert(input: EvaluationInput): { value: number; protocol: string[] } {
  const prot: string[] = [];
  const ds = input.datenquellen;
  if (ds.brwWert === undefined) {
    throw new Error('Bodenrichtwert ist für die Bodenwertermittlung erforderlich.');
  }
  if (!ds.brwStichtag) {
    throw new Error('Stichtag des Bodenrichtwerts fehlt.');
  }
  const flaeche = input.anrechenbareFlaeche;
  const basis = ds.brwWert * flaeche;
  prot.push(`BRW (\u20ac${ds.brwWert.toFixed(2)}/m²) × anrechenbare Fläche (${flaeche.toFixed(2)} m²) = \u20ac${basis.toFixed(2)}`);
  let value = basis;
  if (input.bodenwertAdjustments) {
    const adj = input.bodenwertAdjustments;
    value += adj;
    const sign = adj >= 0 ? '+' : '';
    prot.push(`Anpassung gem. §§ 41–45: ${sign}\u20ac${adj.toFixed(2)}`);
  }
  prot.push(`Bodenwert gesamt: \u20ac${value.toFixed(2)}`);
  return { value, protocol: prot };
}