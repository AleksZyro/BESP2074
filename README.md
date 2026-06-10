# BESP2074 - Balkan Economy Simulation Player

BESP2074 ist eine jahresbasierte Balkan-Simulation mit Python-Modell, JSON-Export und lokalem Dashboard. Das Projekt simuliert Länder und Regionen vom automatisch erkannten Basisjahr bis `2074`, zeigt Kennzahlen auf einer interaktiven Karte und enthält einen Grenzeditor für lokale Annexionsszenarien.

## Stand

- Automatische Baseline-Erkennung aus den vorhandenen Daten.
- Simulation bis `2074`.
- Länder-, Regionen- und Staatskennzahlen pro Jahr.
- Mehrfachläufe mit reproduzierbaren Seeds.
- Optionale, seltenere Schocks und Event-Briefe aus dem Simulationsoutput.
- Grenzeditor für lokale Gebietszuordnungen.
- Smooth Annexionsdynamik: Bevölkerung und GDP wechseln direkt, Raten und Scores nähern sich über mehrere Jahre an.
- Dashboard mit Länder-, Regions-, KPI-, Border-, Dark- und Light-Mode.

## Länderumfang

- Albania
- Bosnia and Herzegovina
- Bulgaria
- Croatia
- Greece
- Hungary
- Montenegro
- North Macedonia
- Romania
- Serbia
- Slovenia

## Modell

BESP2074 rechnet jährlich:

- Bevölkerung, Geburten, Todesfälle und Migration
- regionales GDP und GDP pro Kopf
- Arbeitslosigkeit und Attraktivität
- Integration, Inflation, Zufriedenheit, Korruption und Wahlspannung
- Budget, Schuldenquote, Stabilität und Investitionsklima auf Staatsebene

Die Simulation ist bewusst nicht rein pessimistisch. Länder können sich je nach Ausgangslage, Szenario, Seed und Schocks verbessern oder verschlechtern. Schocks sind temporäre Modellereignisse und sollen Runs beeinflussen, aber nicht dauerhaft jeden Verlauf zerstören.

## Events und Schocks

Schocks sind optional. Im Standardlauf sind sie aktiviert, aber bewusst seltener eingestellt:

- maximal zwei Event-Briefe pro Jahr
- längerer Mindest-Cooldown zwischen ähnlichen Schocks
- tiefere Standardwahrscheinlichkeiten in `data/shocks.json`
- grenzübergreifende Events können in mehreren betroffenen Ländern einen Brief anzeigen

Die Event-Daten kommen aus `output/latest.json`. Das Frontend erfindet keine eigenen Events.

## Architektur

1. `data/countries.json` und `data/regions.json` definieren Startwerte.
2. `data/scenarios.json` definiert Szenarien.
3. `data/shocks.json` definiert optionale Schocks.
4. `main.py` erkennt das Basisjahr und simuliert bis `2074`.
5. `besp/exporter.py` schreibt strukturierte JSON-Exporte.
6. `tools/local_run_service.py` liefert Dashboard, Run-API und Editor-API lokal aus.
7. `dashboard/index.html` zeigt Karte, Zeitachse, KPIs und Mehrfachläufe.
8. `dashboard/editor.html` verwaltet lokale Karten-Overrides.

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

Szenarien anzeigen:

```powershell
py main.py --list-scenarios
```

## Dashboard starten

Lokalen Service starten:

```powershell
py tools\local_run_service.py --port 8011
```

Danach öffnen:

- Dashboard: [http://127.0.0.1:8011/dashboard/index.html](http://127.0.0.1:8011/dashboard/index.html)
- Grenzeditor: [http://127.0.0.1:8011/dashboard/editor.html](http://127.0.0.1:8011/dashboard/editor.html)

## Grenzeditor

Der Editor schneidet keine neuen Polygone. Er ordnet vorhandene ADM-Flächen neu zu. Dadurch bleibt die Kartentopologie stabil.

Workflow:

1. Region oder Land auswählen.
2. Zielland und Zielregion setzen.
3. Annexionszuordnung lokal anwenden.
4. Speichern.
5. Simulation oder Dashboard neu laden.

## Mehrfachläufe

Im Dashboard können `1` bis `100` Runs erzeugt werden. Gleicher Seed bleibt reproduzierbar, unterschiedliche Seeds erzeugen unterschiedliche Verläufe. Wenn die Zeitachse am Ende angekommen ist, kann `Play` den nächsten vorhandenen Run laden oder einen neuen Ergebnisrun starten.

## Tests

Empfohlene Abschlusschecks:

```powershell
python -m pytest
node --check dashboard/app.js
node --check dashboard/config.js
node --check dashboard/editor.js
py main.py --scenario baseline --seed test-local
```

Weitere Verifier:

```powershell
py tools\verify_export_year_state.py
py tools\verify_state_dynamics.py
py tools\verify_export_meta.py
py tools\verify_geo_coverage.py
py tools\verify_geo_name_normalization.py
```

## Daten aktualisieren

World-Bank-Baselines neu holen:

```powershell
py tools\refresh_country_baselines.py
```

Das Skript prüft die Jahre `2023` bis `2026`, wählt die beste gemeinsame Datenabdeckung und aktualisiert die Baseline-Dateien.

## Projektstatus

BESP2074 ist als lokales Abschlussprojekt vorbereitet. Die wichtigsten Arbeitsbereiche sind Simulation, Export, Dashboard, Grenzeditor, Mehrfachläufe, Events, Kartenlogik und Tests.
