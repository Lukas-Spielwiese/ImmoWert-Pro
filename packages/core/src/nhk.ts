export interface NHKKey { gebaeudeart: string; standardstufe: number; }
export interface NHKDatensatz { key: NHKKey; nhk2010: number; quelle: string; stichtag?: string; }
export const NHK_TABLE: NHKDatensatz[] = [ { key: { gebaeudeart: 'Einfamilienhaus', standardstufe: 3 }, nhk2010: 1200, quelle: 'NHK 2010 (Anlage 4) – PLATZHALTER', stichtag: '2010-01-01' } ];
export function findNHK(gebaeudeart: string, standardstufe: number){ return NHK_TABLE.find(d => d.key.gebaeudeart === gebaeudeart && d.key.standardstufe === standardstufe)?.nhk2010; }
