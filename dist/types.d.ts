/**
 * Vereinfachte Typdefinitionen für die Wertermittlung.  Anstelle der
 * Bibliothek "zod" werden hier reine TypeScript-Typen verwendet.
 * Validierungen müssen manuell erfolgen; TypeScript dient lediglich
 * zur statischen Typkontrolle während der Entwicklung.
 */
export type Procedure = 'vergleichswert' | 'ertragswert' | 'sachwert';
export type BuildingType = 'einfamilienhaus' | 'zweifamilienhaus' | 'reihenhaus' | 'mehrfamilienhaus' | 'wohnungseigentum';
export type StandardLevel = '1' | '2' | '3' | '4' | '5';
export type ModernizationKey = 'roof' | 'windows' | 'plumbing' | 'heating' | 'exteriorInsulation' | 'bathrooms' | 'interior' | 'layout';
export interface VergleichsobjektInput {
    transaktionsdatum: string;
    flaeche: number;
    preis: number;
    zustand?: string;
    lage?: string;
    rechteBelastungen?: string;
    bemerkung?: string;
}
export interface MietwertInput {
    mietkategorie: 'ist' | 'soll' | 'markt';
    flaeche: number;
    jahresnettokaltmiete: number;
}
export interface Bewirtschaftungskosten {
    verwaltung: number;
    instandhaltung: number;
    nichtUmlagefaehigeBK: number;
    mietausfallwagnis: number;
}
export interface DataSources {
    stichtag: string;
    brwZone?: string;
    brwWert?: number;
    brwQuelle?: string;
    brwStichtag?: string;
    liegenschaftsZinssatz?: number;
    lzQuelle?: string;
    lzStichtag?: string;
    sachwertFaktor?: number;
    swfQuelle?: string;
    swfStichtag?: string;
    vergleichsfaktoren?: Record<string, number>;
    vergleichsfaktorenQuelle?: string;
    vergleichsfaktorenStichtag?: string;
    baupreisindex?: number;
    baupreisindexStichtag?: string;
    verbraucherpreisindex?: number;
    verbraucherpreisindexStichtag?: string;
}
export interface RechteBelastungen {
    nießbrauch?: boolean;
    wohnrecht?: boolean;
    leitungsrecht?: boolean;
    wegerecht?: boolean;
    grunddienstbarkeit?: boolean;
    erbbauzins?: number;
    erbbauRestlaufzeit?: number;
    erbbauWertsicherung?: number;
}
export interface EvaluationInput {
    verfahren: Procedure[];
    verfahrensBegruendungen: Record<Procedure, string>;
    objektbezeichnung: string;
    objektBeschreibung?: string;
    planungsrecht?: string;
    anrechenbareFlaeche: number;
    grundstuecksflaeche: number;
    gebaeudeArt: BuildingType;
    standard: StandardLevel;
    baujahr?: number;
    restnutzungsdauer?: number;
    modernisierung?: ModernizationKey[];
    mietwerte?: MietwertInput[];
    bewirtschaftungskosten?: Bewirtschaftungskosten;
    vergleichsobjekte?: VergleichsobjektInput[];
    datenquellen: DataSources;
    rechteBelastungen?: RechteBelastungen;
    bemerkungen?: string;
    bodenwertAdjustments?: number;
}
export interface ModulResult {
    value: number;
    protocol: string[];
}
export interface PlausibilisierungResult {
    /**
     * Gewichtungen der einzelnen Verfahren.  Nicht jedes Verfahren ist
     * zwingend enthalten; daher wird eine Partial‑Definition gewählt.
     */
    gewichtungen: Partial<Record<Procedure, number>>;
    bandbreite?: {
        min: number;
        max: number;
    };
    finalValue: number;
    begruendung: string;
}
export interface CalculationResult {
    bodenwert?: ModulResult;
    vergleichswert?: ModulResult;
    ertragswert?: ModulResult;
    sachwert?: ModulResult;
    plausi: PlausibilisierungResult;
}
