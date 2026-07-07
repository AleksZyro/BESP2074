# BESP2074 Projektphasen

**Deutsch** | [English](./PROJECT_PHASES_EN.md)

## Projektziel

BESP2074 ist eine jahresbasierte Balkan-Simulation im privaten Review-Stand mit:

- exportgestützter Visualisierung
- klarer Trennung zwischen Python-Simulation und Benutzeroberfläche
- Regionen als echter Modellebene statt nur als Kartendarstellung
- plausiblen, langsamen Veränderungen statt einer übermässigen Ereignisflut
- lokalem Dashboard und lokalem Grenzeditor

Das aktuelle Projekt ist lokal nutzbar und technisch prüfbar. Weitere Ideen sind optionale spätere Erweiterungen und keine Voraussetzung für den privaten Review-Stand.

## Arbeitsregeln

1. Arbeit in klaren Blöcken umsetzen.
2. Ein Commit pro zusammenhängendem Block statt vieler kleiner Einzel-Commits.
3. Tests und Dokumentation gehören zum selben Funktionsblock.
4. Die Versionshistorie nicht leichtfertig umschreiben.

Empfohlenes Schema für Commit-Nachrichten:

`<phase>.<unterphase> <typ>: <beschreibung>`

Beispiele:

- `10.1 core: auto-select latest common baseline year`
- `10.3 dashboard: add multi-run batch summary`
- `10.4 map: add persistent boundary assignment editor`

Die Beispiele bleiben absichtlich auf Englisch, da sie die tatsächlich verwendeten Commit-Nachrichten zeigen.

## Phasenübersicht

### Phase 1 - Grundlagen
Status: umgesetzt

Basisstruktur, Datenklassen, JSON-Startdaten und erster Jahresschritt.

### Phase 2 - Strukturierter Export
Status: umgesetzt

Jahreswerte pro Land und Region sowie JSON-Export für das Dashboard.

### Phase 3 - Wirtschaft v1
Status: umgesetzt

Wirtschaftslogik mit BIP, Wachstum, Arbeitslosigkeit und Aggregation.

### Phase 4 - Dashboard v1
Status: umgesetzt

Erstes Dashboard ohne Kartenschicht.

### Phase 5 - Karte und Zeitachse
Status: umgesetzt

Karte, Jahresnavigation, Wiedergabe, erneutes Laden von Exporten und lokaler Ausführungsdienst.

### Phase 7 - Schocksystem
Status: umgesetzt

Begrenzte, mit identischen Startwerten reproduzierbare Schocks sowie passende Prüfskripte.

### Phase 8 - Politik und Staat v1
Status: umgesetzt

Staatliche Kennzahlen und deren Darstellung im Dashboard.

### Phase 9 - Erweiterung des Projektumfangs
Status: umgesetzt

Erweiterung auf elf Länder sowie verbesserte Kartenabdeckung.

### Phase 10 - Hauptarbeit
Status: umgesetzt

#### Phase 10.1 - Dynamische Aktualisierung des Basisjahrs
Status: umgesetzt

- Aktualisierung der Weltbank-Daten für `2023-2026`
- automatische Wahl des besten gemeinsamen Basisjahrs
- `main.py` erkennt das Startjahr dynamisch

#### Phase 10.2 - Ebene sozialer Kennzahlen
Status: umgesetzt

Neue Modellwerte:

- Integration / Assimilation
- Inflation / Deflation
- Zufriedenheit
- Wahlen

Diese Werte werden auf Regions- und Landesebene exportiert.

#### Phase 10.3 - Dienst für Mehrfachläufe
Status: umgesetzt

- `1-100` Durchläufe im lokalen Dashboard
- gleiche Startwerte bleiben reproduzierbar
- verschiedene Startwerte liefern auch ohne Schocks unterschiedliche Resultate
- Zusammenfassung mehrerer Durchläufe mit Minimal- und Maximalwerten

#### Phase 10.4 - Grenz- und Regionseditor
Status: umgesetzt

- lokaler Editor unter `dashboard/editor.html`
- dauerhafte Überschreibungen in `dashboard/data/map_assignments.json`
- vorhandene Verwaltungsflächen können neuen Ländern und Regionen zugeordnet werden
- einfacher Annexionsmodus mit Zielland und optionaler Zielregion
- neu annektierte Zielregionen starten mit tieferer Zufriedenheit

#### Phase 10.5 - Aggregations- und Konsistenztests
Status: umgesetzt

- automatisierter Test für den Vergleich von Länder- und Regionssummen pro Jahr
- Prüfskripte für Exportjahr, Metadatenkonsistenz und Zustandsdynamik

#### Phase 10.6 - Dokumentations- und Bedienungsbereinigung
Status: umgesetzt

- README auf den privaten Review-Stand gebracht
- Projektphasen bereinigt
- lokale Oberflächen- und Hilfetexte vereinfacht
- Dashboard-Steuerelemente, Hellmodus und Favicon finalisiert

## Aktueller Codezustand

- Länderumfang:
  - Serbien
  - Montenegro
  - Bosnien und Herzegowina
  - Albanien
  - Nordmazedonien
  - Bulgarien
  - Ungarn
  - Kroatien
  - Rumänien
  - Slowenien
  - Griechenland
- Exportdateien:
  - `output/latest.json`
  - `output/simulation_<start>_<end>.json` nur noch mit explizitem `--archive-output`
  - TXT-Report aus dem Dashboard mit Jahrbereich, Detailgrad, Events und Staatswerten
- Basisjahr:
  - automatisch aus `data/countries.json` erkannt
  - aktueller Aktualisierungsstand: `2024`
- Dashboard:
  - `dashboard/index.html`
  - Länder-, Regions-, Kennzahlen-, Grenz-, Dunkel- und Hellmodus
  - Griechenland rendert reale ADM2-Untergrenzen, Slowenien reale NUTS3-Untergrenzen innerhalb der bestehenden Makroregionen.
- Grenzeditor:
  - `dashboard/editor.html`
- Lokaler Dienst:
  - `tools/local_run_service.py`

## Prüfbefehle

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

1. Zusätzliche Vergleichsansicht für mehrere Durchläufe im Dashboard statt nur einer Zusammenfassung der Minimal- und Maximalwerte.
2. Optionaler Editor zum Aufteilen von Polygonen, falls frei gezeichnete Grenzen später wirklich nötig werden.
3. Weitere Datensatzaktualisierungen, sobald für `2025` oder `2026` genügend gemeinsame öffentliche Werte verfügbar sind.
