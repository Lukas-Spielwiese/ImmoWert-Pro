"use strict";
/**
 * Implementiert das Vergleichswertverfahren (§§ 24–26 ImmoWertV).  Es
 * normiert Vergleichspreise auf den Bewertungsstichtag und den
 * Bewertungsgegenstand.  Für diese Beispielimplementierung wird der
 * arithmetische Mittelwert der Vergleichspreise pro m² gebildet; eine
 * Gewichtung oder Umrechnung nach spezifischen Merkmalen (§ 26) kann
 * durch Anpassung der Funktion `normalizePreis` erfolgen.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.berechneVergleichswert = berechneVergleichswert;
/**
 * Normalisiert den Preis eines Vergleichsobjekts.  In dieser
 * Minimalversion wird der Preis lediglich durch die Fläche geteilt, um
 * einen Quadratmeterpreis zu erhalten.  Erweiterungen (z. B. Stichtags-
 * anpassung via Indizes oder Zu-/Abschläge nach § 26) können hier
 * vorgenommen werden.
 */
function normalizePreis(obj) {
    return obj.preis / obj.flaeche;
}
/**
 * Berechnet den Vergleichswert, indem die normierten Preise der
 * Vergleichsobjekte gemittelt und mit der Fläche des Bewertungsobjekts
 * multipliziert werden.  Ist keine Fläche vorhanden, wird der Mittelwert
 * als Ergebnis verwendet.  Der Rechenweg wird protokolliert.
 */
function berechneVergleichswert(input) {
    const prot = [];
    const objs = input.vergleichsobjekte;
    if (!objs || objs.length === 0) {
        throw new Error('Keine Vergleichsobjekte vorhanden.');
    }
    const normiertePreise = objs.map(obj => {
        const np = normalizePreis(obj);
        prot.push(`Objektpreis \u20ac${obj.preis.toFixed(2)} / Fläche ${obj.flaeche.toFixed(2)} m² = \u20ac${np.toFixed(2)} pro m²`);
        return np;
    });
    const sum = normiertePreise.reduce((s, p) => s + p, 0);
    const mw = sum / normiertePreise.length;
    prot.push(`Durchschnittlicher Vergleichspreis: (Summe / Anzahl) = \u20ac${mw.toFixed(2)} pro m²`);
    // Preis auf die anrechenbare Fläche des Bewertungsobjekts anwenden
    const flaeche = input.anrechenbareFlaeche;
    const vergleichswert = mw * flaeche;
    prot.push(`Vergleichswert: \u20ac${mw.toFixed(2)} × ${flaeche.toFixed(2)} m² = \u20ac${vergleichswert.toFixed(2)}`);
    return { value: vergleichswert, protocol: prot };
}
//# sourceMappingURL=vergleichswert.js.map