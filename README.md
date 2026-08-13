# BESP2074 - Balkan Economy Simulation Player

**Deutsch** | [English](./README_EN.md)

BESP2074 ist eine lokale Balkan-Simulation bis `2074`. Das Projekt verbindet ein Python-Simulationsmodell mit JSON-Export, interaktivem Web-Dashboard, Kartenansicht, Szenarien, Schocks und einem Grenzeditor.

Es ist als technische Portfolio-Demo gebaut: Datenmodellierung, reproduzierbare Simulation, Frontend-State, Kartenvisualisierung und automatisierte Validierung in einem Projekt.

## Demo

![BESP2074 Simulation](./docs/screenshots/dashboard-simulation.gif)

![Dashboard Screenshot](./docs/screenshots/dashboard-country-view.png)

## Was man sieht

- Länder und Regionen des Balkans auf einer interaktiven Karte
- Timeline von automatisch erkanntem Basisjahr bis `2074`
- Szenarien, Seeds und optionale simulierte Schocks
- KPI-Modi für Bevölkerung, GDP, Arbeitslosigkeit, Inflation, Verschuldung und weitere Werte
- Lokaler Run-Service mit Export, Reload und Run-Verwaltung
- Grenzeditor für Karten-Overrides und Annexionsszenarien

## Schnellstart

```powershell
git clone https://github.com/AleksZyro/BESP2074.git
cd BESP2074
python -m pip install -r requirements-dev.txt
python -m pytest
python tools\local_run_service.py --port 8011
```

Danach öffnen:

- Dashboard: <http://127.0.0.1:8011/dashboard/index.html>
- Grenzeditor: <http://127.0.0.1:8011/dashboard/editor.html>

Für Nutzer ohne Informatik-Hintergrund gibt es eine Schritt-für-Schritt-Anleitung: [Installationsguide](./docs/INSTALLATION.md).

## Simulation starten

```powershell
python main.py --scenario baseline
python main.py --scenario baseline --disable-shocks
python main.py --scenario reform --seed reform-a
python main.py --list-scenarios
```

Standardmässig schreibt die Simulation den aktuellen Arbeitsrun nach `output/latest.json`. Das Dashboard liest diese Datei über den lokalen Python-Service.

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

## Projektaufbau

- `main.py`: CLI-Einstieg für Simulationen
- `besp/`: Simulationsmodell, Loader, Exporter und Validierung
- `data/`: Länder, Regionen, Szenarien und Schocks
- `dashboard/`: HTML, CSS, JavaScript, Kartenansicht und Editor
- `tools/local_run_service.py`: lokaler Dashboard- und Run-Service
- `tests/`: automatisierte Tests
- `docs/`: Installation und Screenshots

## Qualität prüfen

```powershell
python tools\verify_release_ready.py
```

Der Check führt Tests, JavaScript-Syntaxchecks, einen Baseline-Export und mehrere Export-/Geo-Verifier aus.

<details>
<summary>Rechtliches, Einschränkungen und Release-Hinweise</summary>

## Modellcharakter

BESP2074 ist eine explorative Lern- und Szenariosimulation. Die Ergebnisse sind keine wirtschaftlichen, demografischen, politischen oder finanziellen Prognosen. Langfristige Verläufe entstehen aus vereinfachten Modellannahmen, Startwerten, Szenarien, Seeds und optionalen simulierten Schocks.

Landes-Baselines für Bevölkerung, GDP, Arbeitslosigkeit, Inflation und Demografie werden über World-Bank-Daten und ECB-Wechselkurse aktualisiert. Regionale Startwerte und einige soziale oder politische Kennzahlen sind Modellannahmen oder Arbeitswerte.

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

## Release-Status

BESP2074 ist technisch lokal nutzbar und bereit für Portfolio-Review. Ein offizieller öffentlicher Release sollte erst erfolgen, wenn die Geodaten-Attribution und Weiterverteilungsrechte final geklärt sind. Besonders relevant sind die vereinfachten Karten- und NUTS-Dateien in `dashboard/data/`.

## Letzter lokaler Auditlauf

- Datum: `2026-07-21`
- Betriebssystem: Windows 11 Home `10.0.26200`, 64-bit
- Python: `3.11.9`
- Node: `v24.15.0`
- Befehl: `python tools\verify_release_ready.py`
- Exit-Status: `0`
- Laufzeit: `5.54s`
- Ergebnis: `21 passed`, Release-Verifier erfolgreich

Diese Angabe beschreibt nur den lokalen Auditlauf in diesem Arbeitsbaum. Vor einer Veröffentlichung sollte der Check erneut in der Zielumgebung laufen.

## Daten aktualisieren

```powershell
python tools\refresh_country_baselines.py
```

Das Skript nutzt World-Bank-Indikatoren und ECB-EUR/USD-Referenzkurse. Es prüft mehrere Kandidatenjahre und wählt die beste gemeinsame Abdeckung. Datenrefreshes sollten als eigener, überprüfter Änderungsschritt behandelt werden.

## Einzelchecks

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

## Build und CI

Es gibt keinen separaten Build-Schritt und keinen Node-Paketmanager. Das Dashboard ist statisches HTML/CSS/JavaScript und wird vom lokalen Python-Service ausgeliefert.

Der Workflow `.github/workflows/ci.yml` läuft nur bei Pull Requests nach `main` und Pushes auf `main`. Er installiert `requirements-dev.txt`, richtet Node.js ein und führt `python tools\verify_release_ready.py` aus. Er deployt nichts und benötigt keine Secrets.

## Repository-Metadaten Vorschlag

- Description: `Local Balkan economy simulation with Python model, JSON export, map dashboard and scenario editor.`
- Topics: `python`, `simulation`, `economy-simulation`, `balkan`, `dashboard`, `scenario-modelling`, `data-visualization`, `portfolio-project`

</details>
