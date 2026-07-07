# BESP2074 - Balkan Economy Simulation Player

**Deutsch** | [English](./README_EN.md)

BESP2074 ist eine lokale, jahresbasierte Balkan-Simulation mit Python-Modell, strukturiertem JSON-Export, Web-Dashboard und Grenzeditor. Das Projekt simuliert Länder und Regionen vom automatisch erkannten Basisjahr bis `2074`, visualisiert Kennzahlen auf einer interaktiven Karte und enthält lokale Werkzeuge für Run-Verwaltung und Karten-Overrides.

## Modellcharakter und Nicht-Prognose

BESP2074 ist eine explorative Lern- und Szenariosimulation. Die Ergebnisse sind keine wirtschaftlichen, demografischen, politischen oder finanziellen Prognosen. Langfristige Verläufe entstehen aus vereinfachten Modellannahmen, Startwerten, Szenarien, Seeds und optionalen simulierten Schocks.

Landes-Baselines für Bevölkerung, GDP, Arbeitslosigkeit, Inflation und Demografie werden über World-Bank-Daten und ECB-Wechselkurse aktualisiert. Regionale Startwerte und einige soziale oder politische Kennzahlen sind Modellannahmen oder Arbeitswerte.

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

Kosovo wird kartografisch als Overlay innerhalb des Serbien-Scopes geführt.

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

```powershell
git clone https://github.com/Aleksandros2/BESP2074.git
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

Das Dashboard zeigt Länder, Regionen, KPI-Modi, Events, Dark-/Light-Mode, Timeline, Play-Funktion und Run-Verwaltung. Der aktuelle Run kann als TXT exportiert oder gelöscht werden.

## Statische Portfolio-Demo

Zusätzlich zur lokalen Vollversion gibt es eine schreibgeschützte statische Demo für GitHub Pages:

- Einstieg im Repository: `dashboard/demo.html`
- Demo-Daten: `dashboard/demo-data/latest.json`
- Zielpfad auf GitHub Pages: `/BESP2074/`

Die Demo lädt nur vorbereitete Beispieldaten. Sie startet keine neuen Runs, löscht keine Runs, speichert keine Grenzeditor-Änderungen, verändert kein `output/latest.json` und ruft keine `/api/...`-Routen auf. Der TXT-Export läuft in der Demo vollständig im Browser aus den geladenen Beispieldaten.

Lokal kann die Demo mit einem einfachen statischen Dateiserver geprüft werden. Die volle App mit Simulation, Speichern, Löschen und Run-Erzeugung benötigt weiterhin:

```powershell
python tools\local_run_service.py --port 8011
```

Der Pages-Workflow `.github/workflows/deploy-pages.yml` bereitet das statische Artefakt vor. Der echte Deploy-Job läuft erst, wenn GitHub Pages manuell aktiviert ist und die Repository-Variable `ENABLE_PAGES_DEPLOY` auf `true` gesetzt wurde. Dafür in GitHub einstellen:

1. `Settings -> Pages -> Build and deployment -> Source -> GitHub Actions`
2. `Settings -> Secrets and variables -> Actions -> Variables -> New repository variable`
3. Name: `ENABLE_PAGES_DEPLOY`, Wert: `true`

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

- Datum: `2026-07-07`
- Betriebssystem: Windows 11 Home `10.0.26200`, 64-bit
- Python: `3.11.9`
- Node: `v24.15.0`
- Befehl: `python tools\verify_release_ready.py`
- Exit-Status: `0`
- Laufzeit: `6.64s`
- Ergebnis: `20 passed`, Release-Verifier erfolgreich

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

## Daten aktualisieren

```powershell
python tools\refresh_country_baselines.py
```

Das Skript nutzt World-Bank-Indikatoren und ECB-EUR/USD-Referenzkurse. Es prüft mehrere Kandidatenjahre und wählt die beste gemeinsame Abdeckung. Datenrefreshes sollten als eigener, überprüfter Änderungsschritt behandelt werden.

## Screenshots

Geprüfte lokale Screenshots liegen unter `docs/screenshots/`:

- `dashboard-country-view.png`

## Projektstatus

BESP2074 ist technisch lokal nutzbar und bereit für privaten Review. Für eine öffentliche Veröffentlichung bleiben Lizenz- und Quellenhinweise entscheidend, besonders für Karten- und Datendateien.

## Bekannte Einschränkungen

- Keine echte Prognose und keine Entscheidungshilfe für Politik, Wirtschaft oder Finanzen.
- Regionale Werte enthalten Modellannahmen und Arbeitswerte.
- Karten basieren auf vereinfachten Drittanbieter-Geodaten.
- Der Grenzeditor ordnet bestehende Flächen um, erstellt aber keine freien Grenzschnitte.
- `output/` ist generiert und soll nicht committed werden.

## Lizenz und Drittanbieterquellen

Der selbst erstellte Quellcode und die eigene Projektdokumentation stehen unter der MIT-Lizenz in `LICENSE`.

Drittanbieter-Daten, Geodaten und externe Quellen unterliegen weiterhin ihren eigenen Lizenzen und Nutzungsbedingungen. Die MIT-Lizenz erteilt keine zusätzlichen Rechte an diesen Drittanbieter-Inhalten.

Details stehen in `THIRD_PARTY_NOTICES.md`. Unklare oder nicht belegte Lizenzpunkte sind dort als offene Risiken markiert.
