# BESP - Balkan Economy Simulation Player

BESP ist eine realistische, jahresbasierte Balkan-Simulation mit exportgetriebener Kartenansicht. Die Simulation rechnet in Python, exportiert strukturierte JSON-Daten und zeigt sie im lokalen Dashboard inklusive Grenzeditor an.

## Hauptarbeitsstand

- Das Startjahr wird nicht mehr hart auf `2020` oder `2024` fixiert.
- `tools/refresh_country_baselines.py` prüft `2023-2026` und wählt automatisch das gemeinsame Jahr mit der besten Datenabdeckung.
- Im aktuellen Datenstand gewinnt `2024` als bestes gemeinsames Basisjahr.
- Die Simulation führt fünf neue Parameter:
  - `integration`
  - `inflation`
  - `corruption`
  - `satisfaction`
  - `elections`
- Mehrfachläufe mit `1-100` Runs sind über den lokalen Service möglich.
- Auch ohne Schocks liefern verschiedene Seeds verschiedene Verläufe.
- Gleicher Seed bleibt reproduzierbar.
- Die Simulation läuft nun vom erkannten Basisjahr bis `2050`.
- Der Grenzeditor bietet einen einfachen Annexionsmodus: Zielland wählen, Provinzen anklicken, speichern.
- Frisch annektierte Zielregionen starten mit tieferer Zufriedenheit und erholen sich über mehrere Jahre.
- Aggregationstests prüfen, dass Länderwerte pro Jahr exakt zur Summe der Regionen passen.

## Aktueller Länderumfang

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

## Modellumfang

### Demografie und Wirtschaft

- Geburten, Todesfälle und Nettoaussenmigration pro Jahr
- Binnenmigration innerhalb eines Landes über Attraktivitätsunterschiede
- Regionales BIP, BIP-Wachstum und Arbeitslosigkeit
- Regionale Attraktivität aus Wirtschaft, Infrastruktur, Urbanisierung, Metro-Pull und Wohnungsdruck

### Neue Sozial- und Politikwerte

- `integration_index`
- `inflation_rate`
- `corruption_index`
- `satisfaction_index`
- `election_tension_index`

Diese Werte wirken aufeinander und fliessen auch in die staatlichen Kennzahlen ein.

`corruption_index` ist bewusst als negativer Index modelliert: tiefer ist besser. Er wirkt auf Stabilität, Investitionsklima, Zufriedenheit und indirekt auf Wachstum. In der Karte ist Korruption deshalb eine eigene Metrik, bleibt aber in der Simulation mit den staatlichen Kennzahlen verknüpft.

### Warum die Startintegration so gesetzt ist

`base_integration_index` ist bewusst kein Zufallswert. Er beschreibt den strukturellen Startzustand eines Landes, bevor die eigentliche Simulation Jahr für Jahr arbeitet. Dafür werden mehrere Faktoren zusammengezogen:

- Nähe zu EU- und Binnenmarktstrukturen
- institutionelle Stabilität und staatliche Handlungsfähigkeit
- Korruptionsniveau und Vertrauen in Verwaltung
- Arbeitsmobilität und grenzüberschreitende Verflechtung
- innerer Zusammenhalt zwischen Regionen und politischen Lagern

Ein höherer Startwert bedeutet im Modell also nicht einfach «besseres Land», sondern dass Integration, Anpassung und die Aufnahme neuer Gebiete anfangs stabiler funktionieren. Ein tieferer Startwert bedeutet mehr Reibung, mehr Spannungen und langsamere Angleichung. Darum fällt nach einer Annexion die Zufriedenheit zuerst ab und erholt sich erst über mehrere Jahre wieder.

### Staatsebene

- `budget_balance_pct_gdp`
- `debt_to_gdp`
- `stability_index`
- `corruption_index`
- `investment_climate_index`

### Schocks

- Schocks sind optional und bewusst begrenzt.
- Ohne Schocks bleiben die Runs trotzdem variabel, weil unterschiedliche Seeds kontrollierte Jahresabweichungen erzeugen.

## Architektur

1. `data/countries.json` und `data/regions.json` definieren Startwerte.
2. `tools/refresh_country_baselines.py` aktualisiert die Länderbaselines aus World-Bank-Daten.
3. `main.py` erkennt das beste Basisjahr automatisch und simuliert vom Basisjahr bis `2050`.
4. `besp/exporter.py` schreibt `output/latest.json`.
5. `tools/local_run_service.py` liefert Dashboard, Run-API und Grenzeditor-API lokal aus.
6. `dashboard/index.html` visualisiert Länder, Regionen, Kennzahlen und Mehrfachläufe.
7. `dashboard/editor.html` bearbeitet GeoJSON-Zuordnungen über persistente Overrides in `dashboard/data/map_assignments.json`.

## Datenaktualisierung

World-Bank-Baselines neu holen:

```powershell
py tools\refresh_country_baselines.py
```

Das Skript:

- prüft die Jahre `2023`, `2024`, `2025`, `2026`
- vergleicht die Abdeckung pro Indikator und Land
- schreibt:
  - `data/world_bank_baseline_latest.json`
  - `data/world_bank_baseline_<jahr>.json`
- aktualisiert `data/countries.json`

## Simulation starten

Standardlauf:

```powershell
py main.py --scenario baseline
```

Ohne Schocks:

```powershell
py main.py --scenario baseline --disable-shocks
```

Deterministisch mit fixem Seed:

```powershell
py main.py --scenario reform --seed reform-a
```

Verfügbare Szenarien anzeigen:

```powershell
py main.py --list-scenarios
```

## Dashboard und Grenzeditor

Lokalen Service starten:

```powershell
py tools\local_run_service.py --port 8011
```

Danach im Browser:

- Dashboard: [http://127.0.0.1:8011/dashboard/index.html](http://127.0.0.1:8011/dashboard/index.html)
- Grenzeditor: [http://127.0.0.1:8011/dashboard/editor.html](http://127.0.0.1:8011/dashboard/editor.html)

### Grenzeditor-Prinzip

Der Editor schneidet keine Polygone freihaendig. Stattdessen ordnet er vorhandene ADM-Flaechen neu zu. Das ist fuer diese Hauptarbeit absichtlich stabiler:

- gleiche Topologie wie die Quelldaten
- nachvollziehbare Overrides
- kein Risiko durch kaputte selbstgezeichnete Geometrien

Workflow:

1. Features filtern
2. Flaechen auswaehlen
3. Ziel-Land, Ziel-Region und Visual-Key setzen
4. Override speichern
5. Dashboard neu laden

## Mehrfachlaeufe

Im Dashboard:

- `Runs` zwischen `1` und `100`
- `Generate Runs` startet mehrere lokale Durchlaeufe
- die Batch-Zusammenfassung zeigt Min/Max-Spannen und die Zahl unterschiedlicher Seeds

Wichtig:

- gleiche Seeds => gleiche Resultate
- verschiedene Seeds => verschiedene Verlaeufe
- Schocks aus => trotzdem keine identischen Ergebnisse, solange der Seed nicht fixiert ist

## Tests und Verifier

Unit Test fuer exakte Laender-/Regionsaggregation:

```powershell
python -m unittest tests.test_country_region_aggregation
```

Weitere Checks:

```powershell
py tools\verify_export_year_state.py
py tools\verify_state_dynamics.py
py tools\verify_export_meta.py
py tools\verify_geo_coverage.py
py tools\verify_geo_name_normalization.py
```

Servicecheck:

```powershell
py tools\verify_local_run_service.py --base-url http://127.0.0.1:8011
py tools\verify_local_run_service.py --base-url http://127.0.0.1:8011 --e2e
```

## Commit-Regel fuer die Hauptarbeit

Die bestehende Git-History wird nicht automatisch umgeschrieben. Ab jetzt gilt:

- keine Mikro-Commits fuer jede Kleinigkeit
- zusammenhaengende Arbeit in einem Block committen
- Doku, Tests und Code fuer denselben Funktionsblock gemeinsam committen

Das detaillierte Phasenmodell steht in [PROJECT_PHASES.md](C:\Users\Startklar\OneDrive - Alte Kantonsschule Aarau\Desktop\Dokumente\Playground\BESP-Balkan-Economy-Simulation-Player-\PROJECT_PHASES.md).
