import { z } from 'zod';
import { DataSourcesSchema } from './types';
export type DataSources = z.infer<typeof DataSourcesSchema>;
export function validateDataSources(d:any){
  const res=DataSourcesSchema.safeParse(d);
  if(!res.success){ throw new Error('Ungültige Datenquellen: '+res.error.message); }
  const ds=res.data;
  const missing:string[]=[];
  if(!ds.brw?.zone||!ds.brw?.wert||!ds.brw?.stichtag||!ds.brw?.quelle) missing.push('BRW (Zone/Wert/Stichtag/Quelle)');
  if(!ds.bpi?.value||!ds.bpi?.stichtag||!ds.bpi?.quelle) missing.push('Baupreisindex (Wert/Stichtag/Quelle)');
  return { ok: missing.length===0, missing, data: ds };
}
export function indexFaktor(basis:number, aktuell:number){ if(!basis) basis=100; return aktuell/(basis); }
