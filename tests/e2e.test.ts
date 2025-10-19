import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

// E2E-Test: Führt die Bewertung mit den Beispieldaten aus und erzeugt einen DOCX-Bericht.
// Anschließend wird überprüft, ob die Datei existiert.
test('e2e: Bewertung und DOCX-Export funktionieren', () => {
  const root = join(__dirname, '..');
  const jsonPath = join(root, 'example.json');
  const outPath = join(root, 'tmp_test.docx');
  // Führe CLI aus
  execSync(`node dist/index.js ${jsonPath} ${outPath}`, { cwd: root });
  const exists = existsSync(outPath);
  expect(exists).toBe(true);
  // Aufräumen
  if (exists) unlinkSync(outPath);
});