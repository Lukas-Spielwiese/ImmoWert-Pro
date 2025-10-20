import { z } from 'zod';
export const DataSource = z.object({ value: z.number(), stichtag: z.string(), quelle: z.string() });
export const BRWSchema = z.object({ zone: z.string().optional(), wert: z.number(), stichtag: z.string(), quelle: z.string() });
export const DataSourcesSchema = z.object({ brw: BRWSchema, lz: DataSource.optional(), swf: DataSource.optional(), bpi: DataSource, vergleichsfaktoren: z.string().optional(), anlage5: z.string() });
export type DataSources = z.infer<typeof DataSourcesSchema>;
export function validateDataSources(ds: unknown): DataSources { const parsed = DataSourcesSchema.safeParse(ds); if (!parsed.success) throw new Error('Ungültige Datenquellen: ' + parsed.error.message); return parsed.data; }
export function indexFaktor(basis: number, stichtagIndex: number) { if ((basis || 0) <= 0) basis = 100; return stichtagIndex / basis; }
