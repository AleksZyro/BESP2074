# BESP2074 - Balkan Economy Simulation Player

[Deutsch](./README.md) | **English**

BESP2074 is a local year-by-year Balkan simulation with a Python model, structured JSON export, web dashboard, and boundary editor. It simulates countries and regions from the automatically detected baseline year to `2074`, visualises indicators on an interactive map, and includes local tools for run management and map overrides.

## Model Character and Non-Forecast Notice

BESP2074 is an exploratory learning and scenario simulation. Its results are not economic, demographic, political, or financial forecasts. Long-term paths are produced from simplified model assumptions, initial values, scenarios, seeds, and optional simulated shocks.

Country baselines for population, GDP, unemployment, inflation, and demography are refreshed from World Bank data and ECB exchange rates. Regional starting values and some social or political indicators are model assumptions or working estimates.

## Country Scope

The project covers eleven countries:

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

Kosovo is handled as a map overlay within the Serbia scope.

## Main Features

- Python simulation model with country, region, and state indicators.
- Reproducible seeds, scenarios, multiple runs, and optional simulated events.
- JSON export to `output/latest.json` for the dashboard and verifiers.
- Local web dashboard with map, timeline, KPI modes, dark/light mode, and run service.
- TXT export and deletion of the current run through the local service.
- Local boundary editor for map overrides and annexation scenarios.
- Automated tests, JavaScript syntax checks, and release validation.

## Requirements

- Python `3.10+`; locally checked with Python `3.11.9`
- `pytest` for tests; pinned in `requirements-dev.txt`
- Node.js for JavaScript syntax checks; locally checked with Node `v24.15.0`
- No Node package manager and no `npm install` required

## Installation

```powershell
git clone https://github.com/Aleksandros2/BESP2074.git
cd BESP2074
python --version
python -m pip install -r requirements-dev.txt
python -m pytest
```

On Windows, `py` may be used instead of `python` depending on the local installation.

## Simulation

```powershell
python main.py --scenario baseline
python main.py --scenario baseline --disable-shocks
python main.py --scenario reform --seed reform-a
python main.py --list-scenarios
```

By default, the simulation writes the current working run to `output/latest.json`. Old `simulation_*.json` files are not automatically collected in the standard run. Archive JSON export is only created when `--archive-output` is used deliberately.

## Dashboard

Start the local service:

```powershell
python tools\local_run_service.py --port 8011
```

Open:

- Dashboard: <http://127.0.0.1:8011/dashboard/index.html>
- Boundary editor: <http://127.0.0.1:8011/dashboard/editor.html>

The dashboard shows countries, regions, KPI modes, events, dark/light mode, timeline playback, and run management. The current run can be exported as TXT or deleted.

## Static Portfolio Demo

Alongside the full local version, the project includes a read-only static demo for GitHub Pages:

- Repository entry point: `dashboard/demo.html`
- Demo data: `dashboard/demo-data/latest.json`
- Target path on GitHub Pages: `/BESP2074/`

The demo loads prepared sample data only. It does not start new runs, delete runs, save boundary editor changes, modify `output/latest.json`, or call `/api/...` routes. TXT export in the demo runs fully in the browser from the loaded sample data.

The demo can be checked locally with a simple static file server. The full app with simulation, saving, deletion, and run generation still requires:

```powershell
python tools\local_run_service.py --port 8011
```

The Pages workflow `.github/workflows/deploy-pages.yml` prepares the static artifact. The actual deploy job only runs after GitHub Pages has been enabled manually and the repository variable `ENABLE_PAGES_DEPLOY` has been set to `true`. Configure this in GitHub:

1. `Settings -> Pages -> Build and deployment -> Source -> GitHub Actions`
2. `Settings -> Secrets and variables -> Actions -> Variables -> New repository variable`
3. Name: `ENABLE_PAGES_DEPLOY`, value: `true`

## Boundary Editor

The boundary editor does not cut new polygons. It reassigns existing ADM features to a target country and optionally to a target region. This keeps the map topology stable.

Workflow:

1. Select a region or country.
2. Set target country and target region.
3. Apply the annexation assignment locally.
4. Save.
5. Reload the dashboard or simulation.

## Scenarios and Seeds

Scenarios are stored in `data/scenarios.json`. Seeds control reproducible variation. The same seed and settings should produce the same run. Different seeds produce different paths.

## Events and Shocks

Shocks are optional seed-stable model events from `data/shocks.json`. They are stored in the simulation output and are not invented by the frontend. Shocks are intentionally rarer and may affect multiple regions or countries.

## Architecture

- `data/countries.json`: country baselines and model parameters
- `data/regions.json`: regional starting values and model assumptions
- `data/scenarios.json`: scenarios
- `data/shocks.json`: optional shocks
- `main.py`: CLI entry point
- `besp/`: simulation model, loader, exporter, and validation
- `tools/local_run_service.py`: local dashboard and run service
- `dashboard/`: HTML, CSS, JavaScript, maps, and editor
- `tests/`: automated tests

## Tests and Release Check

Required check:

```powershell
python tools\verify_release_ready.py
```

The check runs the Python tests, JavaScript syntax checks, a baseline export, and several export/geo verifiers.

Latest local audit run in this working tree:

- Date: `2026-07-07`
- Operating system: Windows 11 Home `10.0.26200`, 64-bit
- Python: `3.11.9`
- Node: `v24.15.0`
- Command: `python tools\verify_release_ready.py`
- Exit status: `0`
- Runtime: `6.64s`
- Result: `20 passed`, release verifier successful

This only documents the local audit run in this working tree. The check should be run again in the target environment before publication.

Individual checks:

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

There is no separate build step and no Node package manager. The dashboard is static HTML/CSS/JavaScript served by the local Python service. Technical validation consists of tests, JavaScript syntax checks, and export/geo verifiers.

## CI

The `.github/workflows/ci.yml` workflow runs only on pull requests to `main` and pushes to `main`. It installs `requirements-dev.txt`, sets up Node.js, and runs `python tools\verify_release_ready.py`. It does not deploy anything and requires no secrets.

## Data Updates

```powershell
python tools\refresh_country_baselines.py
```

The script uses World Bank indicators and ECB EUR/USD reference rates. It checks multiple candidate years and selects the best common coverage. Data refreshes should be treated as a separate reviewed change.

## Screenshots

Checked local screenshots are stored in `docs/screenshots/`:

- `dashboard-country-view.png`

## Project Status

BESP2074 is technically usable locally and ready for private review. Public publication still depends on complete licence and source attribution, especially for map and data files.

## Known Limitations

- Not a real forecast and not a decision tool for politics, economics, or finance.
- Regional values include model assumptions and working estimates.
- Maps are simplified third-party geodata.
- The boundary editor reassigns existing features but does not create free polygon cuts.
- `output/` is generated and should not be committed.

## Licence and Third-Party Sources

The self-authored source code and project documentation are licensed under the MIT Licence in `LICENSE`.

Third-party data, geodata, and external sources remain subject to their own licences and terms of use. The MIT Licence does not grant additional rights to those third-party materials.

Details are listed in `THIRD_PARTY_NOTICES.md`. Unclear or unverified licence points are marked as open risks there.
