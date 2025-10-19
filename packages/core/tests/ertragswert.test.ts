import { barwertFaktor } from '../src/ertragswert';
test('Barwertfaktor §34', ()=>{ expect(barwertFaktor(5,10)).toBeCloseTo(7.7217,4); });
