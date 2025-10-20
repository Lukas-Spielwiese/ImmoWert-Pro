import { deltaRND } from '../src/anlage2'; test('Δ-RND Summation', ()=>{ expect(deltaRND(['roof','windows'] as any)).toBeGreaterThan(0); });
