import { CalcResult } from './types';
export interface Vergleichsfall { datum: string; preis: number; flaeche: number; faktoren?: Record<string, number>; beschreibung?: string; }
export interface VergleichParams { zielStichtag: string; indexFaktor: (von: string, nach: string) => number; }
export function normierterPreis(fall: Vergleichsfall, params: VergleichParams){ const idx=params.indexFaktor(fall.datum, params.zielStichtag)||1; const basis= fall.preis * idx; const faktorProdukt= Object.values(fall.faktoren||{}).reduce((p,v)=>p*(v||1),1); return basis * faktorProdukt; }
export function vergleichswertAusFaellen(faelle: Vergleichsfall[], params: VergleichParams): CalcResult{ const norm=faelle.map(f=>normierterPreis(f,params)); const mw= norm.length? norm.reduce((a,b)=>a+b,0)/norm.length : 0; return {wert: mw, protokoll:[{label:'Anzahl Vergleichsfälle', value: String(faelle.length)},{label:'Normpreise Ø', value: mw.toFixed(2)}]}; }
