import { ermittleModernisierungsBonus } from '../src/sachwert';

test('ermittleModernisierungsBonus gibt korrekte ΔRND zurück', () => {
  expect(ermittleModernisierungsBonus([])).toBe(0);
  // 3 Punkte (z.B. nur Fenster) → 0 Jahre
  expect(ermittleModernisierungsBonus(['windows'])).toBe(0);
  // 5 Punkte (Dach) → +5 Jahre
  expect(ermittleModernisierungsBonus(['roof'])).toBe(5);
  // 8 Punkte (Dach + Fenster) → +10 Jahre
  expect(ermittleModernisierungsBonus(['roof', 'windows'])).toBe(10);
  // 18 Punkte (alle Maßnahmen) → +20 Jahre
  expect(ermittleModernisierungsBonus(['roof','windows','plumbing','heating','exteriorInsulation','bathrooms','interior','layout'])).toBe(20);
});