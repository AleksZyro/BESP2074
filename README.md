# BESP2074 - Balkan Economy Simulation Player

**Deutsch** | [English](./README_EN.md)

BESP2074 ist ein lokaler Balkan economy simulation player mit Python-Modell, strukturiertem JSON-Export, interaktivem Web-Dashboard und Grenzeditor. Das Projekt simuliert Länder und Regionen vom automatisch erkannten Basisjahr bis `2074`, visualisiert Kennzahlen auf einer Karte und zeigt, wie datengetriebene Szenario-Simulation, Dashboard-Frontend und Validierung zusammenarbeiten.

Für Nutzer ohne Informatik-Hintergrund gibt es eine Schritt-für-Schritt-Anleitung: [Installationsguide](./docs/INSTALLATION.md).

## Wofür dieses Projekt gefunden werden soll

BESP2074 ist relevant für Suchen nach:

- Balkan simulation, economy simulation und demographic simulation
- Python simulation model mit JSON export
- interactive dashboard, map dashboard und local web dashboard
- scenario modelling, reproducible seeds und simulated shock events
- portfolio project mit Python, JavaScript, tests und GitHub Actions

## Kurzprofil

- **Kategorie:** lokale Szenario- und Wirtschaftssimulation
- **Frontend:** statisches HTML/CSS/JavaScript-Dashboard mit Kartenansicht
- **Backend/Modell:** Python-CLI mit Länder-, Regions- und State-Dynamik
- **Output:** validierter JSON-Export für Dashboard und Reports
- **Ziel:** technische Portfolio-Demo für Simulation, Datenmodellierung und UI-State

## Modellcharakter und Nicht-Prognose

BESP2074 ist eine explorative Lern- und Szenariosimulation. Die Ergebnisse sind keine wirtschaftlichen, demografischen, politischen oder finanziellen Prognosen. Langfristige Verläufe entstehen aus vereinfachten Modellannahmen, Startwerten, Szenarien, Seeds und optionalen simulierten Schocks.

Landes-Baselines für Bevölkerung, GDP, Arbeitslosigkeit, Inflation und Demografie werden über World-Bank-Daten und ECB-Wechselkurse aktualisiert. Regionale Startwerte und einige soziale oder politische Kennzahlen sind Modellannahmen oder Arbeitswerte.

## Länderumfang

Das Projekt umfasst elf Länder:

- Albanien
- Bosnien und Herzegowina
- Bulgarien
- Griechenland
- Kroatien
- Montenegro
- Nordmazedonien
- Rumänien
- Serbien
- Slowenien
- Ungarn

## Hauptfunktionen

- Python-Simulationsmodell mit Länder-, Regions- und Staatskennzahlen.
- Reproduzierbare Seeds, Szenarien, Mehrfachläufe und optionale simulierte Ereignisse.
- JSON-Export nach `output/latest.json` für Dashboard und Verifier.
- Lokales Web-Dashboard mit Karte, Zeitachse, KPI-Modi, Dark-/Light-Mode und Run-Service.
- TXT-Export und Löschen des aktuellen Runs über den lokalen Service.
- Lokaler Grenzeditor für Karten-Overrides und Annexionsszenarien.
- Automatisierte Tests, JavaScript-Syntaxchecks und Release-Prüfung.

## Voraussetzungen

- Python `3.10+`; lokal geprüft mit Python `3.11.9`
- `pytest` für Tests; gepinnt in `requirements-dev.txt`
- Node.js für JavaScript-Syntaxchecks; lokal geprüft mit Node `v24.15.0`
- Kein Node-Paketmanager und kein `npm install` nötig

## Installation

Ausführlicher für normale Nutzer erklärt: [Installationsguide](./docs/INSTALLATION.md).

```powershell
git clone https://github.com/AleksZyro/BESP2074.git
cd BESP2074
python --version
python -m pip install -r requirements-dev.txt
python -m pytest
```

Unter Windows kann je nach Installation auch `py` statt `python` verwendet werden.

## Simulation

```powershell
python main.py --scenario baseline
python main.py --scenario baseline --disable-shocks
python main.py --scenario reform --seed reform-a
python main.py --list-scenarios
```

Standardmässig schreibt die Simulation den aktuellen Arbeitsrun nach `output/latest.json`. Alte `simulation_*.json`-Dateien werden im Standardlauf nicht automatisch gesammelt. Ein Archiv-Export ist nur bewusst über `--archive-output` vorgesehen.

## Dashboard

Lokalen Service starten:

```powershell
python tools\local_run_service.py --port 8011
```

Danach öffnen:

- Dashboard: <http://127.0.0.1:8011/dashboard/index.html>
- Grenzeditor: <http://127.0.0.1:8011/dashboard/editor.html>

Das Dashboard zeigt Länder, Regionen, KPI-Modi, Events, Dark-/Light-Mode, Timeline, Play-Funktion und Run-Verwaltung. Der aktuelle Run kann als TXT exportiert, als druckbare PDF-Ansicht geöffnet oder gelöscht werden.

BESP2074 ist keine GitHub-Pages-Webversion. Die vollständige Anwendung läuft lokal über den Python-Dienst, verarbeitet Runs und Daten lokal und soll später höchstens als Desktop-Anwendung veröffentlicht werden. Eine Desktop-Veröffentlichung ist noch nicht erfolgt.

## Grenzeditor

Der Grenzeditor schneidet keine neuen Polygone. Er ordnet vorhandene ADM-Flächen einem Zielland und optional einer Zielregion zu. Dadurch bleibt die Kartentopologie stabil.

Workflow:

1. Region oder Land auswählen.
2. Zielland und Zielregion setzen.
3. Annexionszuordnung lokal anwenden.
4. Speichern.
5. Dashboard oder Simulation neu laden.

## Szenarien und Seeds

Szenarien liegen in `data/scenarios.json`. Seeds steuern reproduzierbare Variation. Gleicher Seed und gleiche Einstellungen sollen denselben Run erzeugen. Verschiedene Seeds erzeugen unterschiedliche Verläufe.

## Events und Schocks

Schocks sind optionale, seed-stabile Modellereignisse aus `data/shocks.json`. Sie werden im Simulationsoutput gespeichert und nicht im Frontend erfunden. Schocks sind bewusst seltener eingestellt und können mehrere Regionen oder Länder betreffen.

## Architektur

- `data/countries.json`: Länder-Baselines und Modellparameter
- `data/regions.json`: regionale Startwerte und Modellannahmen
- `data/scenarios.json`: Szenarien
- `data/shocks.json`: optionale Schocks
- `main.py`: CLI-Einstieg
- `besp/`: Simulationsmodell, Loader, Exporter und Validierung
- `tools/local_run_service.py`: lokaler Dashboard- und Run-Service
- `dashboard/`: HTML, CSS, JavaScript, Karten und Editor
- `tests/`: automatisierte Tests

## Tests und Release-Prüfung

Pflichtcheck:

```powershell
python tools\verify_release_ready.py
```

Der Check führt Tests, JavaScript-Syntaxchecks, einen Baseline-Export und mehrere Export-/Geo-Verifier aus.

Letzter lokaler Auditlauf in diesem Arbeitsbaum:

- Datum: `2026-07-21`
- Betriebssystem: Windows 11 Home `10.0.26200`, 64-bit
- Python: `3.11.9`
- Node: `v24.15.0`
- Befehl: `python tools\verify_release_ready.py`
- Exit-Status: `0`
- Laufzeit: `5.54s`
- Ergebnis: `21 passed`, Release-Verifier erfolgreich

Diese Angabe beschreibt nur den lokalen Auditlauf in diesem Arbeitsbaum. Vor einer Veröffentlichung sollte der Check erneut in der Zielumgebung laufen.

Einzelchecks:

```powershell
python -m pytest
node --check dashboard/app.js
node --check dashboard/config.js
node --check dashboard/editor.js
node --check dashboard/map_utils.js
python main.py --scenario baseline --seed test-local
python tools\verify_export_year_state.py
python tools\verify_state_dynamics.py
python tools\verify_export_meta.py
python tools\verify_geo_coverage.py
python tools\verify_geo_name_normalization.py
```

## Build

Es gibt keinen separaten Build-Schritt und keinen Node-Paketmanager. Das Dashboard ist statisches HTML/CSS/JavaScript und wird vom lokalen Python-Service ausgeliefert. Die technische Validierung besteht aus Tests, JavaScript-Syntaxchecks und Export-/Geo-Verifiern.

## CI

Der Workflow `.github/workflows/ci.yml` läuft nur bei Pull Requests nach `main` und Pushes auf `main`. Er installiert `requirements-dev.txt`, richtet Node.js ein und führt `python tools\verify_release_ready.py` aus. Er deployt nichts und benötigt keine Secrets.

## Repository-Metadaten Vorschlag

- Description: `Local Balkan economy simulation with Python model, JSON export, map dashboard and scenario editor.`
- Topics: `python`, `simulation`, `economy-simulation`, `balkan`, `dashboard`, `scenario-modelling`, `data-visualization`, `portfolio-project`

## Daten aktualisieren

```powershell
python tools\refresh_country_baselines.py
```

Das Skript nutzt World-Bank-Indikatoren und ECB-EUR/USD-Referenzkurse. Es prüft mehrere Kandidatenjahre und wählt die beste gemeinsame Abdeckung. Datenrefreshes sollten als eigener, überprüfter Änderungsschritt behandelt werden.

## Screenshots

Geprüfte lokale Screenshots liegen unter `docs/screenshots/`:

- `dashboard-country-view.png`

## Projektstatus

BESP2074 ist technisch lokal nutzbar und bereit für Portfolio-Review. Ein offizieller öffentlicher Release sollte erst erfolgen, wenn die Geodaten-Attribution und Weiterverteilungsrechte final geklärt sind. Besonders relevant sind die vereinfachten Karten- und NUTS-Dateien in `dashboard/data/`.

## Bekannte Einschränkungen

- Keine echte Prognose und keine Entscheidungshilfe für Politik, Wirtschaft oder Finanzen.
- Regionale Werte enthalten Modellannahmen und Arbeitswerte.
- Karten basieren auf vereinfachten Drittanbieter-Geodaten; die vollständige Quellen- und Lizenzprüfung ist vor einem öffentlichen Release noch abzuschliessen.
- Der Grenzeditor ordnet bestehende Flächen um, erstellt aber keine freien Grenzschnitte.
- `output/` ist generiert und soll nicht committed werden.

## Lizenz und Drittanbieterquellen

Der selbst erstellte Quellcode und die eigene Projektdokumentation stehen unter der MIT-Lizenz in `LICENSE`.

Drittanbieter-Daten, Geodaten und externe Quellen unterliegen weiterhin ihren eigenen Lizenzen und Nutzungsbedingungen. Die MIT-Lizenz erteilt keine zusätzlichen Rechte an diesen Drittanbieter-Inhalten.

Details stehen in `THIRD_PARTY_NOTICES.md`. Unklare oder nicht belegte Lizenzpunkte sind dort als offene Risiken markiert.
