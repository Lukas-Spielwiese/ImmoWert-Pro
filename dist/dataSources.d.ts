/**
 * Dieses Modul enthält Funktionen zur Validierung und Handhabung der
 * Datenquellen (Bodenrichtwert, Liegenschaftszinssatz, Indizes etc.).
 * Es prüft insbesondere, ob Stichtage vorhanden sind und liefert
 * Berechnungshilfen wie Indexfaktoren zur zeitlichen Anpassung.
 */
import { DataSources } from './types';
/**
 * Validiert die übergebenen Datenquellen.  Wirft einen Fehler, wenn
 * Pflichtangaben fehlen oder Stichtage nicht gesetzt sind.
 */
export declare function validateDataSources(d: any): DataSources;
/**
 * Ermittelt einen Indexfaktor für die Fortschreibung von Werten mit Hilfe
 * eines Basisindex und eines Zielindex.  Die NHK 2010 sind auf das Jahr
 * 2010 bezogen; daher entspricht der Basisindex dem Indexwert 2010.  Der
 * Indexfaktor wird als Zielindex / Basisindex berechnet.
 *
 * @param basisIndex Indexwert des Basisjahrs (z. B. 100 für 2010)
 * @param zielIndex  Indexwert zum Wertermittlungsstichtag
 */
export declare function indexFaktor(basisIndex: number, zielIndex: number): number;
/**
 * Liest einen Indexwert aus den Datenquellen basierend auf dem Schlüssel.
 * Dieser einfache Helper erwartet, dass der Anwender den aktuellen
 * Baupreisindex bzw. Verbraucherpreisindex als Zahl einträgt.  Bei
 * professionellen Anwendungen sollten diese Indizes automatisiert aus
 * amtlichen Reihen (Destatis) geladen werden.
 *
 * @param key "baupreisindex" oder "verbraucherpreisindex"
 */
export declare function getIndexValue(ds: DataSources, key: 'baupreisindex' | 'verbraucherpreisindex'): number;
