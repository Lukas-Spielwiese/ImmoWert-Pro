import { CalcResult } from './types';
export function indexPfad(bpiBasis:number,bpiStichtag:number){return bpiStichtag/(bpiBasis||100);}
export function alterswertminderung(gnd:number, rnd:number){ const awm=(gnd-rnd)/gnd; return Math.max(0, Math.min(0.9, awm)); }
export function sachwert({nhk,bgf,bpiBasis,bpiStichtag,aussenanlagen=0,gnd,rnd,swf=1}:{nhk:number;bgf:number;bpiBasis:number;bpiStichtag:number;aussenanlagen?:number;gnd:number;rnd:number;swf?:number;}):CalcResult{
  const idx=indexPfad(bpiBasis,bpiStichtag); const herstell=nhk*bgf*idx + aussenanlagen; const awm=alterswertminderung(gnd,rnd); const vorFaktor=herstell*(1-awm); const wert=vorFaktor*swf;
  return {wert, protokoll:[{label:'NHK 2010 [€/m² BGF]', value: nhk.toFixed(2)},{label:'BGF [m²]', value: bgf.toString()},{label:'Index (§18/§36)', value: idx.toFixed(4)},{label:'Herstellungskosten (indexiert)', value: (nhk*bgf*idx).toFixed(2)},{label:'Außen-/sonstige Anlagen (§37)', value: aussenanlagen.toFixed(2)},{label:'AWM-Faktor (§38)', value: (1-awm).toFixed(4)},{label:'Sachwertfaktor (§39)', value: swf.toFixed(4)},{label:'Sachwert', value: wert.toFixed(2)}]};
}
