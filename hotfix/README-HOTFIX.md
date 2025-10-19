# Hotfix: ImmoWertV 2021 – Pflichtfelder, Ampel & Rechenprotokolle

Dieser Hotfix korrigiert die Live-Seite, bis der saubere Umbau (Core-TS + Next.js) fertig ist.

**Änderungen**
- Pflichtfeld Wertermittlungsstichtag; Verfahrenswahl + Begründung (§ 6).
- Datenbasis: BRW (inkl. Quellen/Stichtag & Anlage 5), LZ, SWF, Index.
- Sperrlogik: kein Rechenlauf ohne Stichtag/Quellen (§§ 9, 12; § 7/§ 18).
- Modellkonformitäts-Ampel (rot/gelb/grün).
- Rechenprotokolle pro Modul (für späteren DOCX-Rechenanhang).

**Deployment**
- Vercel: `outputDirectory=dist` oder via `vercel.json`.
