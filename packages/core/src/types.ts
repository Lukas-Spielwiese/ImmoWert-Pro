import { z } from 'zod';
export const ProcedureSchema=z.enum(['vergleichswert','ertragswert','sachwert']);
export type Procedure=z.infer<typeof ProcedureSchema>;
export const DataSource=z.object({value:z.number(),stichtag:z.string(),quelle:z.string()});
export const DataSourcesSchema=z.object({
  brw: z.object({zone:z.string(),wert:z.number(),stichtag:z.string(),quelle:z.string()}),
  lz: DataSource.optional(),
  swf: DataSource.optional(),
  bpi: DataSource,
  vergleichsfaktoren: z.string().optional(),
  anlage5: z.string()
});
export const EvaluationInputSchema=z.object({
  stichtag:z.string(),
  verfahren:z.array(ProcedureSchema).min(1),
  verfahrensBegruendungen:z.record(z.string()).optional(),
  datenquellen:DataSourcesSchema,
  flaechen: z.object({ bgf: z.number().positive(), grundstueck: z.number().positive() }),
  sachwert: z.object({ gebaeudeart: z.string(), standardstufe: z.number().min(1).max(5) }).optional(),
  ertragswert: z.object({ mieten: z.array(z.object({flaeche:z.number(), miete:z.number()})), bk: z.object({verwaltung:z.number(), instandhaltung:z.number(), nichtUmlage:z.number(), mietausfall:z.number()}) }).optional()
});
export type EvaluationInput=z.infer<typeof EvaluationInputSchema>;
export interface CalcLine{label:string;value:string;}
export interface CalcResult{wert:number;protokoll:CalcLine[]}
