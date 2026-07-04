# BESP2074 - Balkan Economy Simulation Player

BESP2074 ist eine jahresbasierte Balkan-Simulation mit Python-Modell, strukturiertem JSON-Export und lokalem Web-Dashboard. Das Projekt simuliert Länder und Regionen vom automatisch erkannten Basisjahr bis `2074`, visualisiert Kennzahlen auf einer interaktiven Karte und enthält einen lokalen Grenzeditor für Annexionsszenarien.

## Kurzüberblick

- Python-Simulationsmodell mit Länder-, Regions- und Staatskennzahlen.
- Elf Länder mit regionalen Ausgangsdaten und automatischer Baseline-Erkennung.
- Reproduzierbare Seeds, Szenarien, Mehrfachläufe und optionale simulierte Ereignisse.
- Strukturierter JSON-Export für Dashboard und Verifier.
- Lokales Web-Dashboard mit Karte, Zeitachse, KPI-Modi, Dark-/Light-Mode und Run-Service.
- Lokaler Grenzeditor für Karten-Overrides und Annexionsszenarien.
- Automatisierte Tests, JavaScript-Syntaxchecks und Release-Prüfungen.

## Modellcharakter

BESP2074 ist eine explorative Lern- und Szenariosimulation. Die erzeugten Ergebnisse sind keine wirtschaftlichen, demografischen oder politischen Prognosen. Langfristige Verläufe basieren auf vereinfachten Modellannahmen, Szenarien, Seeds und optionalen simulierten Ereignissen.

Die Simulation ist bewusst nicht rein pessimistisch. Länder können sich je nach Ausgangslage, Szenario, Seed und Schocks verbessern oder verschlechtern. Schocks sind temporäre Modellereignisse und sollen Runs beeinflussen, aber nicht dauerhaft jeden Verlauf bestimmen.

## Länderumfang

Das Projekt umfasst elf Länder:

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

## Voraussetzungen

- Python `3.10+`; entwickelt und geprüft mit Python `3.11`.
- Für die Simulation und den lokalen Service werden nur Python-Standardbibliotheken verwendet.
- `pytest` wird für die automatisierte Test-Suite benötigt.
- Node.js wird nur für JavaScript-Syntaxchecks mit `node --check` benötigt.
- Es gibt kein `npm install` und keine Node-Paketabhängigkeiten.

## Schnellstart

1. Repository klonen und in den Projektordner wechseln:

```powershell
git clone https://github.com/Aleksandros2/BESP-Balkan-Economy-Simulation-Player-.git
cd BESP-Balkan-Economy-Simulation-Player-
```

2. Python prüfen:

```powershell
python --version
```

Alternativ unter Windows:

```powershell
py --version
```

3. Simulation ausführen:

```powershell
python main.py --scenario baseline
```

Alternativ unter Windows:

```powershell
py main.py --scenario baseline
```

4. Lokalen Dashboard-Service starten:

```powershell
python tools\local_run_service.py --port 8011
```

Alternativ unter Windows:

```powershell
py tools\local_run_service.py --port 8011
```

5. Dashboard öffnen:

- Dashboard: [http://127.0.0.1:8011/dashboard/index.html](http://127.0.0.1:8011/dashboard/index.html)
- Grenzeditor: [http://127.0.0.1:8011/dashboard/editor.html](http://127.0.0.1:8011/dashboard/editor.html)

## Simulation

BESP2074 rechnet jährlich:

- Bevölkerung, Geburten, Todesfälle und Migration
- regionales GDP und GDP pro Kopf
- Arbeitslosigkeit und Attraktivität
- Integration, Inflation, Zufriedenheit, Korruption und Wahlspannung
- Budget, Schuldenquote, Stabilität und Investitionsklima auf Staatsebene

Nützliche Befehle:

```powershell
python main.py --scenario baseline
python main.py --scenario baseline --disable-shocks
python main.py --scenario reform --seed reform-a
python main.py --list-scenarios
```

## Dashboard und Grenzeditor

Das Dashboard lädt `output/latest.json`, zeigt die simulierten Jahre bis `2074` und stellt Länder, Regionen, KPI-Modi, Ereignisbriefe und Mehrfachläufe dar. Über `Play` kann die Zeitachse abgespielt werden; am Ende kann ein neuer Ergebnisrun gestartet werden, wenn der lokale Service läuft.

Der Grenzeditor schneidet keine neuen Polygone. Er ordnet vorhandene ADM-Flächen neu zu. Dadurch bleibt die Kartentopologie stabil.

Workflow im Grenzeditor:

1. Region oder Land auswählen.
2. Zielland und Zielregion setzen.
3. Annexionszuordnung lokal anwenden.
4. Speichern.
5. Simulation oder Dashboard neu laden.

## Events und Schocks

Schocks sind optional. Im Standardlauf sind sie aktiviert, aber bewusst seltener eingestellt:

- maximal zwei Event-Briefe pro Jahr
- längerer Mindest-Cooldown zwischen ähnlichen Schocks
- tiefere Standardwahrscheinlichkeiten in `data/shocks.json`
- grenzübergreifende Events können in mehreren betroffenen Ländern einen Brief anzeigen

Die Event-Daten kommen aus dem Simulationsoutput in `output/latest.json`. Das Frontend erzeugt keine eigenen Ereignisse.

## Architektur

1. `data/countries.json` und `data/regions.json` definieren Startwerte.
2. `data/scenarios.json` definiert Szenarien.
3. `data/shocks.json` definiert optionale Schocks.
4. `main.py` erkennt das Basisjahr und simuliert bis `2074`.
5. `besp/exporter.py` schreibt strukturierte JSON-Exporte.
6. `tools/local_run_service.py` liefert Dashboard, Run-API und Editor-API lokal aus.
7. `dashboard/index.html` zeigt Karte, Zeitachse, KPIs und Mehrfachläufe.
8. `dashboard/editor.html` verwaltet lokale Karten-Overrides.

## Qualitätssicherung

Empfohlener Abschlusscheck:

```powershell
python tools\verify_release_ready.py
```

Alternativ unter Windows, wenn `py` auf dieselbe Python-Umgebung mit `pytest` zeigt:

```powershell
py tools\verify_release_ready.py
```

Der Release-Check führt aus:

- komplette Python-Test-Suite
- JavaScript-Syntaxchecks für Dashboard, Config und Editor
- Baseline-Export bis `2074`
- Export-Meta- und Jahresprüfungen
- Staatsdynamik-Prüfung
- GeoJSON-Abdeckungsprüfung
- Namensnormalisierungsprüfung

Einzelchecks für Debugging:

```powershell
python -m pytest
node --check dashboard/app.js
node --check dashboard/config.js
node --check dashboard/editor.js
python main.py --scenario baseline --seed test-local
python tools\verify_export_year_state.py
python tools\verify_state_dynamics.py
python tools\verify_export_meta.py
python tools\verify_geo_coverage.py
python tools\verify_geo_name_normalization.py
```

Release readiness check completed successfully.

## Daten aktualisieren

World-Bank-Baselines können neu geholt werden:

```powershell
python tools\refresh_country_baselines.py
```

Das Skript prüft die Jahre `2023` bis `2026`, wählt die beste gemeinsame Datenabdeckung und aktualisiert die Baseline-Dateien. Da neuere Jahre je nach Indikator noch unvollständig sein können, sollte ein Datenrefresh immer als eigener, überprüfter Änderungsschritt behandelt werden.

## Projektstatus

BESP2074 ist als lokales Abschlussprojekt vollständig nutzbar. Die Hauptbereiche Simulation, Export, Dashboard, Grenzeditor, Mehrfachläufe, Events, Kartenlogik und Tests sind abgeschlossen.

Optionale zukünftige Erweiterungen sind keine Voraussetzung für den abgeschlossenen Projektstand. Sinnvolle spätere Ideen wären eine zusätzliche Batch-Vergleichsansicht, ein freier Polygon-Split-Editor oder weitere Datenrefreshes, sobald neuere Jahre vollständigere öffentliche Daten bieten.
