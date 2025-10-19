import { CalcResult } from './types';
export function vergleichswert(preise:number[]):CalcResult{
  const n=preise.length||1; const mw=preise.reduce((a,b)=>a+b,0)/n;
  return {wert:mw, protokoll:[{label:'Mittelwert normierter Vergleichspreise (§§24–26)', value: mw.toFixed(2)}]};
}
