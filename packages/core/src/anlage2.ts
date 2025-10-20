export type Modernisierungsmerkmal = 'roof'|'facade'|'windows'|'heating'|'sanitary'|'electrics'|'insulation';
const DELTA_RND: Record<Modernisierungsmerkmal, number> = { roof:5, facade:3, windows:3, heating:5, sanitary:4, electrics:3, insulation:4 };
export function deltaRND(merkmale: Modernisierungsmerkmal[]){ return (merkmale||[]).reduce((s,m)=> s + (DELTA_RND[m]||0), 0); }
