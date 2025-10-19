"use strict";
/**
 * Dieses Modul führt die Plausibilisierung und Gewichtung der
 * Wertermittlungsverfahren durch (§ 6 ImmoWertV).  Es fasst die
 * Ergebnisse der einzelnen Module zusammen, berechnet eine Bandbreite
 * und bildet den finalen Verkehrswert.  Die Gewichtungen können
 * gleichmäßig verteilt oder benutzerdefiniert sein.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.plausibilisieren = plausibilisieren;
/**
 * Berechnet den finalen Verkehrswert aus den Ergebnissen der gewählten
 * Verfahren.  Wenn keine Gewichtungen übergeben werden, werden alle
 * Verfahren gleich gewichtet.  Bandbreite und Begründungsfeld werden
 * generiert.  Die Verteilung der Gewichte wird im Ergebnis protokolliert.
 */
function plausibilisieren(results, begruendung, gewichtungen) {
    const available = Object.keys(results);
    const prot = [];
    if (available.length === 0) {
        throw new Error('Keine Ergebnisse zur Plausibilisierung vorhanden.');
    }
    // Normalisierte Gewichte
    let weights = {};
    if (!gewichtungen) {
        const eq = 1 / available.length;
        available.forEach(p => {
            weights[p] = eq;
        });
    }
    else {
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
        const v = results[p].value;
        finalValue += w * v;
        prot.push(`${p}-Verfahren: Wert \u20ac${v.toFixed(2)} × Gewicht ${w.toFixed(3)} = \u20ac${(v * w).toFixed(2)}`);
    });
    // Bandbreite: min/max
    const values = available.map(p => results[p].value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    prot.push(`Bandbreite der Werte: min=\u20ac${min.toFixed(2)}, max=\u20ac${max.toFixed(2)}`);
    prot.push(`Begründung der Gewichtung: ${begruendung}`);
    return { value: finalValue, protocol: prot, gewichte: weights, bandbreite: { min, max } };
}
//# sourceMappingURL=plausi.js.map