"use strict";
/**
 * Dieses Modul enthält Funktionen zur Validierung und Handhabung der
 * Datenquellen (Bodenrichtwert, Liegenschaftszinssatz, Indizes etc.).
 * Es prüft insbesondere, ob Stichtage vorhanden sind und liefert
 * Berechnungshilfen wie Indexfaktoren zur zeitlichen Anpassung.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDataSources = validateDataSources;
exports.indexFaktor = indexFaktor;
exports.getIndexValue = getIndexValue;
/**
 * Validiert die übergebenen Datenquellen.  Wirft einen Fehler, wenn
 * Pflichtangaben fehlen oder Stichtage nicht gesetzt sind.
 */
function validateDataSources(d) {
    const data = d;
    // Mindestens der allgemeine Stichtag ist Pflicht.
    if (!data.stichtag) {
        throw new Error('Wertermittlungsstichtag fehlt.');
    }
    // Wenn BRW vorhanden ist, muss auch der Stichtag und die Quelle angegeben sein.
    if (data.brwWert !== undefined) {
        if (!data.brwQuelle || !data.brwStichtag) {
            throw new Error('Bodenrichtwert ohne Quelle oder Stichtag angegeben.');
        }
    }
    // Wenn ein Liegenschaftszinssatz vorhanden ist, muss auch Quelle und Stichtag existieren.
    if (data.liegenschaftsZinssatz !== undefined) {
        if (!data.lzQuelle || !data.lzStichtag) {
            throw new Error('Liegenschaftszinssatz ohne Quelle oder Stichtag angegeben.');
        }
    }
    // Wenn Sachwertfaktor vorhanden ist, muss Quelle und Stichtag existieren.
    if (data.sachwertFaktor !== undefined) {
        if (!data.swfQuelle || !data.swfStichtag) {
            throw new Error('Sachwertfaktor ohne Quelle oder Stichtag angegeben.');
        }
    }
    return data;
}
/**
 * Ermittelt einen Indexfaktor für die Fortschreibung von Werten mit Hilfe
 * eines Basisindex und eines Zielindex.  Die NHK 2010 sind auf das Jahr
 * 2010 bezogen; daher entspricht der Basisindex dem Indexwert 2010.  Der
 * Indexfaktor wird als Zielindex / Basisindex berechnet.
 *
 * @param basisIndex Indexwert des Basisjahrs (z. B. 100 für 2010)
 * @param zielIndex  Indexwert zum Wertermittlungsstichtag
 */
function indexFaktor(basisIndex, zielIndex) {
    if (basisIndex <= 0 || zielIndex <= 0) {
        throw new Error('Indexwerte müssen positiv sein.');
    }
    return zielIndex / basisIndex;
}
/**
 * Liest einen Indexwert aus den Datenquellen basierend auf dem Schlüssel.
 * Dieser einfache Helper erwartet, dass der Anwender den aktuellen
 * Baupreisindex bzw. Verbraucherpreisindex als Zahl einträgt.  Bei
 * professionellen Anwendungen sollten diese Indizes automatisiert aus
 * amtlichen Reihen (Destatis) geladen werden.
 *
 * @param key "baupreisindex" oder "verbraucherpreisindex"
 */
function getIndexValue(ds, key) {
    if (key === 'baupreisindex') {
        if (ds.baupreisindex === undefined) {
            throw new Error('Baupreisindex ist nicht gesetzt.');
        }
        return ds.baupreisindex;
    }
    else {
        if (ds.verbraucherpreisindex === undefined) {
            throw new Error('Verbraucherpreisindex ist nicht gesetzt.');
        }
        return ds.verbraucherpreisindex;
    }
}
//# sourceMappingURL=dataSources.js.map