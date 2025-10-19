/**
 * Implementiert das Sachwertverfahren nach §§ 35–39 ImmoWertV.  Die
 * Normalherstellungskosten (NHK 2010) und die Gesamtnutzungsdauer (GND)
 * werden in diesem Modul als Konstanten hinterlegt.  Die Restnutzungs-
 * dauer (RND) wird aus Baujahr und Modernisierungsgrad (Anlage 2) oder
 * direkt aus der Eingabe berechnet.  Der Gebäudesachwert wird durch
 * Anwendung des Baupreisindex (§§ 18, 36) auf die NHK ermittelt.
 */

import { EvaluationInput, BuildingType, StandardLevel, Procedure } from './types';
import { indexFaktor } from './dataSources';

// Approximate NHK 2010 values (€ /m² BGF) for different building types and standard levels.
// These values are placeholders and must be replaced with the official table from
// ImmoWertV Anlage 4.  The keys are BuildingTypeEnum and StandardLevelEnum.
const NHK_VALUES: Record<BuildingType, Record<StandardLevel, number>> = {
  einfamilienhaus: { '1': 800, '2': 1000, '3': 1200, '4': 1400, '5': 1600 },
  zweifamilienhaus: { '1': 850, '2': 1050, '3': 1250, '4': 1450, '5': 1650 },
  reihenhaus: { '1': 700, '2': 900, '3': 1050, '4': 1250, '5': 1450 },
  mehrfamilienhaus: { '1': 750, '2': 900, '3': 1050, '4': 1200, '5': 1350 },
  wohnungseigentum: { '1': 1000, '2': 1200, '3': 1400, '4': 1600, '5': 1800 }
};

// Typical total useful life (GND) in years per building type and standard level, based on
// ImmoWertV Anlage 1.  Higher standards often imply longer lifetimes.
const GND_VALUES: Record<BuildingType, Record<StandardLevel, number>> = {
  einfamilienhaus: { '1': 60, '2': 65, '3': 70, '4': 75, '5': 80 },
  zweifamilienhaus: { '1': 60, '2': 65, '3': 70, '4': 75, '5': 80 },
  reihenhaus: { '1': 60, '2': 65, '3': 70, '4': 75, '5': 80 },
  mehrfamilienhaus: { '1': 65, '2': 70, '3': 70, '4': 70, '5': 70 },
  wohnungseigentum: { '1': 65, '2': 70, '3': 70, '4': 70, '5': 70 }
};

/**
 * Ermittelt den Modernisierungsbonus (ΔRND) in Jahren basierend auf
 * Anlage 2.  Je nach Summe der Maßnahmenpunkte wird eine typisierte
 * Verlängerung der Restnutzungsdauer zurückgegeben.  Dies ist eine
 * vereinfachte Repräsentation – im Gutachten sollte auf die
 * gesetzlichen Grundlagen verwiesen werden.
 */
export function ermittleModernisierungsBonus(modernisierung: string[] | undefined): number {
  if (!modernisierung || modernisierung.length === 0) {
    return 0;
  }
  // Punkte gemäß Anlage 2: Dach (4), Fenster (2), Installationen (2), Heizung (2),
  // Außenwanddämmung (4), Bäder (2), Innenausbau (2), Grundriss (2).
  const punkteTabelle: Record<string, number> = {
    roof: 4,
    windows: 2,
    plumbing: 2,
    heating: 2,
    exteriorInsulation: 4,
    bathrooms: 2,
    interior: 2,
    layout: 2
  };
  let summe = 0;
  for (const m of modernisierung) {
    summe += punkteTabelle[m] || 0;
  }
  // Zuordnungen: 0–3 Punkte: 0 Jahre; 4–7 Punkte: +5 Jahre; 8–12 Punkte: +10 Jahre;
  // 13–17 Punkte: +15 Jahre; ≥18 Punkte: +20 Jahre.
  if (summe >= 18) return 20;
  if (summe >= 13) return 15;
  if (summe >= 8) return 10;
  if (summe >= 4) return 5;
  return 0;
}

/**
 * Bestimmt die Gesamtnutzungsdauer (GND) des Gebäudes aus Typ und Standard.
 */
function getGND(type: BuildingType, standard: StandardLevel): number {
  return GND_VALUES[type][standard];
}

/**
 * Berechnet die Alterswertminderung (1 - RND/GND).  Negative AWM (z. B. wenn
 * das Alter kleiner als die Modernisierungsverlängerung ist) wird auf 0
 * begrenzt.
 */
function berechneAWM(rnd: number, gnd: number): number {
  const awm = 1 - rnd / gnd;
  return awm < 0 ? 0 : awm;
}

/**
 * Parst das Jahr aus einem ISO‑Datum (yyyy-mm-dd).  Wenn das
 * Datum nicht dem erwarteten Format entspricht, wird eine Fehlermeldung
 * geworfen.
 */
function parseYear(dateString: string): number {
  const m = dateString.match(/^(\d{4})/);
  if (!m) {
    throw new Error(`Ungültiges Datum: ${dateString}`);
  }
  return parseInt(m[1], 10);
}

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
export function berechneSachwert(
  input: EvaluationInput,
  bodenwert: number
): { value: number; protocol: string[] } {
  const prot: string[] = [];
  const ds = input.datenquellen;
  // NHK für die ausgewählte Gebäudeart und Standardstufe
  const nhk = NHK_VALUES[input.gebaeudeArt][input.standard];
  prot.push(`NHK 2010 für ${input.gebaeudeArt} Standard ${input.standard}: \u20ac${nhk.toFixed(2)} je m² BGF`);
  // Baupreisindex
  if (ds.baupreisindex === undefined) {
    throw new Error('Baupreisindex erforderlich für Indexierung der NHK.');
  }
  const basisIndex = 100; // 2010 = 100 (Basisjahr)
  const indexF = indexFaktor(basisIndex, ds.baupreisindex);
  prot.push(`Baupreisindex-Faktor: ${ds.baupreisindex.toFixed(2)} / ${basisIndex} = ${indexF.toFixed(4)}`);
  // Fläche
  const bgf = input.anrechenbareFlaeche;
  // Unkorrigierter Herstellungskostenwert
  const hk = nhk * indexF * bgf;
  prot.push(`Herstellungskosten: NHK × Indexfaktor × BGF = \u20ac${nhk.toFixed(2)} × ${indexF.toFixed(4)} × ${bgf.toFixed(2)} = \u20ac${hk.toFixed(2)}`);
  // Gesamtnutzungsdauer
  const gnd = getGND(input.gebaeudeArt, input.standard);
  prot.push(`Gesamtnutzungsdauer (GND) gem. Anlage 1: ${gnd} Jahre`);
  // Alter
  let rnd: number;
  if (input.restnutzungsdauer !== undefined) {
    rnd = input.restnutzungsdauer;
    prot.push(`Restnutzungsdauer manuell angegeben: ${rnd} Jahre`);
  } else {
    if (!input.baujahr) {
      throw new Error('Baujahr erforderlich zur Berechnung der Restnutzungsdauer.');
    }
    // Alter zum Stichtag
    const stichtagJahr = parseYear(ds.stichtag);
    const age = stichtagJahr - input.baujahr;
    prot.push(`Alter zum Stichtag: ${stichtagJahr} - ${input.baujahr} = ${age} Jahre`);
    const bonus = ermittleModernisierungsBonus(input.modernisierung);
    if (bonus > 0) {
      prot.push(`Modernisierungsbonus (ΔRND) nach Anlage 2: +${bonus} Jahre`);
    }
    rnd = gnd - age + bonus;
    if (rnd < 0) rnd = 0;
    prot.push(`Restnutzungsdauer (RND): GND - Alter + Δ = ${gnd} - ${age} + ${bonus} = ${rnd} Jahre`);
  }
  // Alterswertminderung
  const awm = berechneAWM(rnd, gnd);
  prot.push(`Alterswertminderung (AWM): 1 - RND/GND = 1 - ${rnd}/${gnd} = ${awm.toFixed(4)}`);
  const sachwertGebaeude = hk * (1 - awm);
  prot.push(`Gebäudesachwert: Herstellungskosten × (1 - AWM) = \u20ac${hk.toFixed(2)} × ${ (1 - awm).toFixed(4)} = \u20ac${sachwertGebaeude.toFixed(2)}`);
  // Außenanlagen (optional)
  // In dieser Version werden keine separaten Außenanlagen behandelt.  Das könnte
  // erweitert werden, indem input Außenanlagenwerte enthält.
  let gesamterSachwert = sachwertGebaeude;
  prot.push(`Sachwert vor Faktor: \u20ac${gesamterSachwert.toFixed(2)}`);
  // Sachwertfaktor nach § 39 anwenden, falls vorhanden
  if (ds.sachwertFaktor !== undefined) {
    const faktor = ds.sachwertFaktor;
    prot.push(`Sachwertfaktor nach § 39: ${faktor}`);
    gesamterSachwert *= faktor;
    prot.push(`Sachwert nach Faktor: \u20ac${gesamterSachwert.toFixed(2)}`);
  }
  return { value: gesamterSachwert, protocol: prot };
}