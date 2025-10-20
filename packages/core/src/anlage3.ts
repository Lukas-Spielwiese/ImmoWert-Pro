export interface Anlage3BewKost { verwaltung: number; instandhaltung: number; nichtUmlage: number; mietausfall: number; }
export function sumBewirtschaftungskosten(bk: Anlage3BewKost){ return bk.verwaltung + bk.instandhaltung + bk.nichtUmlage + bk.mietausfall; }
export function bewirtschaftungAusRohertrag(rohertrag: number, bk: Anlage3BewKost){ const sum=sumBewirtschaftungskosten(bk); return { sum, quote: sum / Math.max(1, rohertrag) }; }
