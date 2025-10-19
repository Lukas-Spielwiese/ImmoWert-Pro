import { CalcResult } from './types';
export interface RightsInput{ niessbrauch?:boolean; wohnrecht?:boolean; leitungsWeg?:boolean; erbbau?:{zins:number; restlaufzeit:number; lz:number;}; }
export function rechteAbzug(basis:number, r:RightsInput={}):CalcResult{
  let faktor=1;
  if(r.niessbrauch) faktor-=0.05;
  if(r.wohnrecht) faktor-=0.05;
  if(r.leitungsWeg) faktor-=0.05;
  let prot=[{label:'Ausgangswert', value: basis.toFixed(2)},{label:'Rechte-Abschlag pauschal', value: ((1-faktor)*100).toFixed(2)+' %'}];
  let wert=basis*faktor;
  if(r.erbbau){
    const rente=basis*(r.erbbau.zins/100);
    const rbf=(1-Math.pow(1+r.erbbau.lz/100,-r.erbbau.restlaufzeit))/(r.erbbau.lz/100);
    const kapitalwert=rente*rbf;
    wert=basis-kapitalwert;
    prot.push({label:'Erbbauzins (jährlich)', value:rente.toFixed(2)});
    prot.push({label:'Barwertfaktor (Erbbau)', value: rbf.toFixed(4)});
    prot.push({label:'Kapitalwert Erbbauzins', value: kapitalwert.toFixed(2)});
  }
  prot.push({label:'Wert nach Rechten', value: wert.toFixed(2)});
  return {wert, protokoll: prot};
}
