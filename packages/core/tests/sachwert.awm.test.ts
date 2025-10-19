import { alterswertminderung } from '../src/sachwert';
test('AWM 50/80=0.375 begrenzt', ()=>{ expect(alterswertminderung(80,50)).toBeCloseTo((80-50)/80,5); });
