# BESP2074 Project Phases

## Projektziel

BESP2074 ist eine abgeschlossene, jahresbasierte Balkan-Simulation mit:

- exportgetriebener Visualisierung
- klarer Trennung zwischen Python-Simulation und Frontend
- Regionen als echter Modellschicht statt nur Kartenoptik
- plausiblen, langsamen Veränderungen statt Event-Spam
- lokalem Dashboard und lokalem Grenzeditor

Das aktuelle Projekt ist vollständig nutzbar. Weitere Ideen sind optionale spätere Erweiterungen und keine Voraussetzung für den abgeschlossenen Stand.

## Workflow-Regeln

1. Arbeit in klaren Blöcken umsetzen.
2. Ein Commit pro zusammenhängendem Block statt viele Mikro-Commits.
3. Tests und Doku gehören zum selben Funktionsblock.
4. Historie nicht leichtfertig umschreiben.

Empfohlenes Commit-Schema:

`<phase>.<subphase> <type>: <beschreibung>`

Beispiele:

- `10.1 core: auto-select latest common baseline year`
- `10.3 dashboard: add multi-run batch summary`
- `10.4 map: add persistent boundary assignment editor`

## Phasenübersicht

### Phase 1 - Foundation
Status: complete

Basisstruktur, Dataclasses, JSON-Startdaten, erster Jahrestick.

### Phase 2 - Structured Export
Status: complete

Jahreswerte pro Land und Region, JSON-Export für das Dashboard.

### Phase 3 - Economy v1
Status: complete

Wirtschaftslogik mit BIP, Wachstum, Arbeitslosigkeit und Aggregation.

### Phase 4 - Dashboard v1
Status: complete

Erstes Dashboard ohne Kartenschicht.

### Phase 5 - Map and Timeline
Status: complete

Karte, Jahresnavigation, Wiedergabe, Export-Reload und lokaler Run-Service.

### Phase 7 - Shock System
Status: complete

Begrenzte, seed-konsistente Schocks mit Verifiern.

### Phase 8 - Politics and State v1
Status: complete

Staatliche Kennzahlen und Dashboard-Anzeige.

### Phase 9 - Scope Expansion
Status: complete

Erweiterung auf elf Länder plus verbesserte Kartenabdeckung.

### Phase 10 - Hauptarbeit
Status: complete

#### Phase 10.1 - Dynamic Baseline Refresh
Status: complete

- World-Bank-Refresh für `2023-2026`
- automatische Wahl des besten gemeinsamen Basisjahrs
- `main.py` erkennt das Startjahr dynamisch

#### Phase 10.2 - Social Metric Layer
Status: complete

Neue Modellwerte:

- Integration / Assimilation
- Inflation / Deflation
- Zufriedenheit
- Wahlen

Diese Werte werden auf Regions- und Landesebene exportiert.

#### Phase 10.3 - Multi-Run Service
Status: complete

- `1-100` Durchläufe im lokalen Dashboard
- gleiche Seeds bleiben reproduzierbar
- verschiedene Seeds liefern auch ohne Schocks unterschiedliche Resultate
- Batch-Zusammenfassung für Min/Max-Spannen

#### Phase 10.4 - Boundary / Region Editor
Status: complete

- lokaler Editor unter `dashboard/editor.html`
- persistente Overrides in `dashboard/data/map_assignments.json`
- vorhandene ADM-Flächen können neuen Ländern und Regionen zugeordnet werden
- einfacher Annexionsmodus mit Zielland und optionaler Zielregion
- frisch annektierte Zielregionen starten mit tieferer Zufriedenheit

#### Phase 10.5 - Aggregation and Consistency Tests
Status: complete

- Unit Test für Länder- gegen Regionssummen pro Jahr
- Verifier für Exportjahr, Meta-Konsistenz und Zustandsdynamik

#### Phase 10.6 - Doku und UX-Bereinigung
Status: complete

- README auf Abschlussstand gebracht
- Projektphasen bereinigt
- lokale UI-Texte und Hilfetexte vereinfacht
- Dashboard-Controls, Light Mode und Favicon finalisiert

## Aktueller Codezustand

- Länderumfang:
  - Serbia
  - Montenegro
  - Bosnia and Herzegovina
  - Albania
  - North Macedonia
  - Bulgaria
  - Hungary
  - Croatia
  - Romania
  - Slovenia
  - Greece
- Export:
  - `output/latest.json`
  - `output/simulation_<start>_<end>.json`
- Basisjahr:
  - automatisch erkannt aus `data/countries.json`
  - aktueller Refresh-Stand: `2024`
- Dashboard:
  - `dashboard/index.html`
  - Länder-, Regions-, KPI-, Border-, Dark- und Light-Mode
  - Griechenland rendert reale ADM2-Unterlinien, Slowenien reale NUTS3-Unterlinien innerhalb der bestehenden Makroregionen.
- Grenzeditor:
  - `dashboard/editor.html`
- Lokaler Service:
  - `tools/local_run_service.py`

## Verify Commands

```powershell
python tools\verify_release_ready.py
python -m pytest
node --check dashboard/app.js
node --check dashboard/config.js
node --check dashboard/editor.js
python main.py --scenario baseline
python main.py --scenario baseline --disable-shocks
python tools\verify_export_year_state.py
python tools\verify_state_dynamics.py
python tools\verify_export_meta.py
python tools\verify_geo_coverage.py
python tools\verify_geo_name_normalization.py
python tools\local_run_service.py --port 8011
```

## Optionale spätere Erweiterungen

Diese Punkte sind keine offenen Abschlussaufgaben:

1. Zusätzliche Batch-Vergleichsansicht im Dashboard statt nur Min/Max-Zusammenfassung.
2. Optionaler Polygon-Split-Editor, falls freie Grenzziehung später wirklich nötig wird.
3. Weitere Datensatz-Refreshes, sobald für `2025` oder `2026` genug gemeinsame öffentliche Werte verfügbar sind.
