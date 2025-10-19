"use strict";
/**
 * Bewertet Rechte und Belastungen nach §§ 46–52.  Dies ist eine
 * exemplarische Umsetzung: Nießbrauch, Wohnrecht und Dienstbarkeiten
 * reduzieren den Bodenwert um je 5 %.  Für ein Erbbaurecht wird der
 * Kapitalwert des Erbbauzinses berechnet.  Die tatsächlichen
 * Auswirkungen können wesentlich komplexer sein und sollten im
 * Gutachten mit entsprechenden Fachkommentaren erläutert werden.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.berechneRechteBelastungen = berechneRechteBelastungen;
const ertragswert_1 = require("./ertragswert");
function berechneRechteBelastungen(input, bodenwert) {
    const prot = [];
    const rechte = input.rechteBelastungen;
    let adjustment = 0;
    if (!rechte) {
        return { value: 0, protocol: prot };
    }
    const percentPerRight = 0.05; // 5 % Abzug pro Recht
    const booleanRights = [
        { flag: rechte.nießbrauch, name: 'Nießbrauch' },
        { flag: rechte.wohnrecht, name: 'Wohnrecht' },
        { flag: rechte.leitungsrecht, name: 'Leitungsrecht' },
        { flag: rechte.wegerecht, name: 'Wegerecht' },
        { flag: rechte.grunddienstbarkeit, name: 'Grunddienstbarkeit' }
    ];
    for (const r of booleanRights) {
        if (r.flag) {
            const abz = bodenwert * percentPerRight;
            adjustment -= abz;
            prot.push(`${r.name}: Abzug 5 % des Bodenwerts = -\u20ac${abz.toFixed(2)}`);
        }
    }
    // Erbbau
    if (rechte.erbbauzins !== undefined && rechte.erbbauRestlaufzeit !== undefined) {
        const zinssatz = input.datenquellen.liegenschaftsZinssatz || 3; // default 3 %
        const barwert = rechte.erbbauzins * (0, ertragswert_1.barwertFaktor)(zinssatz, rechte.erbbauRestlaufzeit);
        adjustment -= barwert;
        prot.push(`Erbbauzinskapitalwert: Erbbauzins \u20ac${rechte.erbbauzins.toFixed(2)} × Barwertfaktor(i=${zinssatz} %, n=${rechte.erbbauRestlaufzeit}) = -\u20ac${barwert.toFixed(2)}`);
    }
    return { value: adjustment, protocol: prot };
}
//# sourceMappingURL=rightsEncumbrances.js.map