import { CalcResult } from './types';
export function gewichtung(values:Partial<Record<string,CalcResult>>, weights:Partial<Record<string,number>>){
  const entries=Object.entries(values).filter(([,v])=>v&&isFinite(v.wert));
  const sumW=entries.reduce((a,[k])=>a+(weights[k]??0),0)||1;
  let total=0; for(const [k,v] of entries){ total+= (v.wert)*((weights[k]??0)/sumW); }
  const min=Math.min(...entries.map(([,v])=>v.wert));
  const max=Math.max(...entries.map(([,v])=>v.wert));
  return {wert: total, bandbreite:[min,max] as [number,number]};
}
export function ampelStatus(has:{core:boolean; vergleich?:boolean; ertrag?:boolean; sach?:boolean}){
  if(!has.core) return 'red';
  if((has.vergleich===false)||(has.ertrag===false)||(has.sach===false)) return 'yellow';
  return 'green';
}
