import { CalcResult } from './types';
export function barwertFaktor(i:number,n:number){const r=i/100;return (1-Math.pow(1+r,-n))/r;}
export function ertragswert({rohertrag,bk, bodenwert, lz, laufzeit}:{rohertrag:number;bk:number;bodenwert:number;lz:number;laufzeit:number;}):CalcResult{
  const reinertrag=rohertrag-bk; const bwvz=bodenwert*(lz/100); const gebReinertrag=reinertrag-bwvz; const f=barwertFaktor(lz,laufzeit); const wert=gebReinertrag*f + bodenwert;
  return {wert, protokoll:[{label:'Rohertrag', value: rohertrag.toFixed(2)},{label:'Bewirtschaftungskosten', value: bk.toFixed(2)},{label:'Reinertrag', value: reinertrag.toFixed(2)},{label:'Bodenwertverzinsung', value: bwvz.toFixed(2)},{label:'Gebäudereinertrag', value: gebReinertrag.toFixed(2)},{label:'Barwertfaktor (§34)', value: f.toFixed(4)},{label:'Ertragswert', value: wert.toFixed(2)}]};
}
