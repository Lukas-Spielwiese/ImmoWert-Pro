# ImmoWert Pro – Replatforming (Phase 1)

Dies ist das Monorepo-Grundgerüst für die ImmoWertV-2021-konforme Anwendung.

## Struktur
- `packages/core`: Kernlogik (TS), Module: Bodenwert (§§40–45), Vergleichswert (§§24–26), Ertragswert (§§27–34), Sachwert (§§35–39), Export (DOCX).
- `apps/web`: Next.js 14 (App Router) – Minimalmaske (Stichtag/BRW/Fläche/BPI/LZ) + Ampel.

## Build (lokal)
```bash
npm i
npm run build -w packages/core
npm run dev -w apps/web
```

## Vercel
`vercel.json` dieses Branches baut `apps/web` und liefert `.next` aus.

## Nächste Schritte
- Vollständige Masken: Datenbasis (inkl. **Anlage 5**), Rechte/Belastungen, Plausibilisierung (§6).
- Unit-Tests ausbauen (AWM §38, Index §18/§36, Δ-RND Anlage 2).
- DOCX-Template mit Deckblatt, Inhaltsverzeichnis, Parameterblatt, Rechenanhang, Bildern (16:9).
