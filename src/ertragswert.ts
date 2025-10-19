/**
 * Dieses Modul implementiert das Ertragswertverfahren nach §§ 27–34
 * ImmoWertV.  Es berechnet zunächst den Rohertrag aus den
 * Mietwerten, zieht die Bewirtschaftungskosten (Anlage 3) ab,
 * ermittelt die Verzinsung des Bodenwerts und kapitalisiert den
 * Gebäudereinertrag mit dem Barwertfaktor (§ 34).
 */

import { EvaluationInput, MietwertInput, Bewirtschaftungskosten } from './types';

/**
 * Berechnet den Rohertrag als Summe der Jahresnettokaltmieten aller
 * Mietwerte.  Fehlende Mietwerte resultieren in einem Rohertrag von 0.
 */
function berechneRohertrag(mietwerte: MietwertInput[] | undefined): number {
  if (!mietwerte || mietwerte.length === 0) return 0;
  return mietwerte.reduce((sum, m) => sum + m.jahresnettokaltmiete, 0);
}

/**
 * Berechnet die Bewirtschaftungskosten gem. Anlage 3 als Summe der
 * prozentualen Anteile vom Rohertrag.  Negative Werte werden wie
 * in `types.ts` blockiert.  Die Kostenarten werden einzeln in
 * einer Tabelle im Protokoll ausgewiesen.
 */
function berechneBewirtschaftungskosten(
  bwk: Bewirtschaftungskosten | undefined,
  rohertrag: number,
  prot: string[]
): number {
  if (!bwk) return 0;
  const anteile = [
    { name: 'Verwaltungskosten', wert: bwk.verwaltung },
    { name: 'Instandhaltungskosten', wert: bwk.instandhaltung },
    { name: 'Nicht umlagefähige BK', wert: bwk.nichtUmlagefaehigeBK },
    { name: 'Mietausfallwagnis', wert: bwk.mietausfallwagnis }
  ];
  let sum = 0;
  anteile.forEach(item => {
    const betrag = (rohertrag * item.wert) / 100;
    sum += betrag;
    prot.push(`${item.name}: ${item.wert.toFixed(2)} % vom Rohertrag = \u20ac${betrag.toFixed(2)}`);
  });
  return sum;
}

/**
 * Rentenbarwertfaktor für eine endliche Laufzeit n Jahre bei Zinssatz i.
 * Formel: [(1 + i)^n - 1] / [i * (1 + i)^n].  Der Zinssatz wird als
 * Prozent (z. B. 3.5 für 3,5 %) übergeben und intern als Dezimalzahl
 * verwendet.
 */
export function barwertFaktor(i: number, n: number): number {
  const rate = i / 100;
  if (n <= 0) return 0;
  const pow = Math.pow(1 + rate, n);
  return (pow - 1) / (rate * pow);
}

/**
 * Berechnet den Ertragswert (§§ 27–34).  Erfordert einen bereits
 * berechneten Bodenwert und einen Liegenschaftszinssatz.  Fehlende
 * Eingaben führen zu Fehlermeldungen.
 */
export function berechneErtragswert(
  input: EvaluationInput,
  bodenwert: number
): { value: number; protocol: string[] } {
  const prot: string[] = [];
  const ds = input.datenquellen;
  if (ds.liegenschaftsZinssatz === undefined) {
    throw new Error('Liegenschaftszinssatz ist erforderlich für das Ertragswertverfahren.');
  }
  // Rohertrag
  const rohertrag = berechneRohertrag(input.mietwerte);
  prot.push(`Rohertrag (Summe Jahresnettokaltmieten): \u20ac${rohertrag.toFixed(2)}`);
  // Bewirtschaftungskosten
  const bewKosten = berechneBewirtschaftungskosten(input.bewirtschaftungskosten, rohertrag, prot);
  prot.push(`Summe Bewirtschaftungskosten: \u20ac${bewKosten.toFixed(2)}`);
  // Reinertrag
  const reinertrag = rohertrag - bewKosten;
  prot.push(`Reinertrag des Grundstücks: Rohertrag - Bewirtschaftungskosten = \u20ac${rohertrag.toFixed(2)} - \u20ac${bewKosten.toFixed(2)} = \u20ac${reinertrag.toFixed(2)}`);
  // Verzinsung des Bodenwerts
  const zinssatz = ds.liegenschaftsZinssatz;
  const bodenZins = (bodenwert * zinssatz) / 100;
  prot.push(`Bodenwertverzinsung (§ 31): Bodenwert × LZ = \u20ac${bodenwert.toFixed(2)} × ${zinssatz.toFixed(2)} % = \u20ac${bodenZins.toFixed(2)}`);
  // Gebäudereinertrag
  const gebaeudeReinertrag = reinertrag - bodenZins;
  prot.push(`Gebäudereinertrag: Reinertrag - Bodenwertverzinsung = \u20ac${reinertrag.toFixed(2)} - \u20ac${bodenZins.toFixed(2)} = \u20ac${gebaeudeReinertrag.toFixed(2)}`);
  // Restnutzungsdauer für Ertragswert: wir verwenden die RND wie beim Sachwert, wenn vorhanden
  let rnd: number;
  if (input.restnutzungsdauer !== undefined) {
    rnd = input.restnutzungsdauer;
  } else {
    // Fallback: 30 Jahre als Annahme
    rnd = 30;
  }
  // Barwertfaktor
  const barwert = barwertFaktor(zinssatz, rnd);
  prot.push(`Rentenbarwertfaktor (§ 34) für i=${zinssatz.toFixed(2)} %, n=${rnd} Jahre: ${barwert.toFixed(4)}`);
  // Gebäudewert
  const gebaeudeWert = gebaeudeReinertrag * barwert;
  prot.push(`Barwert der baulichen Anlagen: Gebäudereinertrag × Barwertfaktor = \u20ac${gebaeudeReinertrag.toFixed(2)} × ${barwert.toFixed(4)} = \u20ac${gebaeudeWert.toFixed(2)}`);
  // Ertragswert
  const ertragswert = gebaeudeWert + bodenwert;
  prot.push(`Ertragswert: Gebäudewert + Bodenwert = \u20ac${gebaeudeWert.toFixed(2)} + \u20ac${bodenwert.toFixed(2)} = \u20ac${ertragswert.toFixed(2)}`);
  return { value: ertragswert, protocol: prot };
}