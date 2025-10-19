import { indexPfad } from '../src/sachwert';
test('Indexpfad 120/100=1.2', ()=>{ expect(indexPfad(100,120)).toBeCloseTo(1.2,4); });
