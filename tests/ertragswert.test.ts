import { barwertFaktor } from '../src/ertragswert';

test('barwertFaktor berechnet Rentenbarwert korrekt', () => {
  // Zinssatz 5 % über 10 Jahre: Faktor ~7.7217
  const f = barwertFaktor(5, 10);
  expect(f).toBeCloseTo(7.7217, 4);
});