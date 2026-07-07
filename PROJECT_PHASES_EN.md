# BESP2074 Project Phases

[Deutsch](./PROJECT_PHASES.md) | **English**

## Project Goal

BESP2074 is a year-based Balkan simulation in private review state with:

- export-driven visualization
- a clear separation between the Python simulation and the frontend
- regions as an actual model layer rather than only a visual map feature
- plausible, gradual development instead of excessive event generation
- a local dashboard and a local border editor

The current project is locally usable and technically verifiable. Further ideas are optional future extensions and are not required for the private review state.

## Workflow Rules

1. Implement work in clearly defined blocks.
2. Use one commit per coherent block instead of many micro-commits.
3. Tests and documentation belong to the same feature block.
4. Do not rewrite history without a good reason.

Recommended commit format:

`<phase>.<subphase> <type>: <description>`

Examples:

- `10.1 core: auto-select latest common baseline year`
- `10.3 dashboard: add multi-run batch summary`
- `10.4 map: add persistent boundary assignment editor`

## Phase Overview

### Phase 1 - Foundation
Status: implemented

Basic structure, dataclasses, JSON baseline data, and the first yearly simulation tick.

### Phase 2 - Structured Export
Status: implemented

Yearly country and regional values with JSON exports for the dashboard.

### Phase 3 - Economy v1
Status: implemented

Economic logic for GDP, growth, unemployment, and aggregation.

### Phase 4 - Dashboard v1
Status: implemented

Initial dashboard without a map layer.

### Phase 5 - Map and Timeline
Status: implemented

Map, year navigation, playback, export reload, and local run service.

### Phase 7 - Shock System
Status: implemented

Limited, seed-consistent shocks with verification tools.

### Phase 8 - Politics and State v1
Status: implemented

State-level indicators and dashboard presentation.

### Phase 9 - Scope Expansion
Status: implemented

Expansion to eleven countries and improved map coverage.

### Phase 10 - Main Development Work
Status: implemented

#### Phase 10.1 - Dynamic Baseline Refresh
Status: implemented

- World Bank refresh for `2023-2026`
- automatic selection of the best common baseline year
- dynamic start-year detection in `main.py`

#### Phase 10.2 - Social Metric Layer
Status: implemented

New model values:

- integration / assimilation
- inflation / deflation
- satisfaction
- elections

These values are exported at regional and country level.

#### Phase 10.3 - Multi-Run Service
Status: implemented

- `1-100` runs in the local dashboard
- identical seeds remain reproducible
- different seeds produce different results even when shocks are disabled
- batch summaries for minimum and maximum ranges

#### Phase 10.4 - Boundary / Region Editor
Status: implemented

- local editor at `dashboard/editor.html`
- persistent overrides in `dashboard/data/map_assignments.json`
- existing administrative areas can be reassigned to countries and regions
- simple annexation mode with a target country and optional target region
- newly annexed target regions start with lower satisfaction

#### Phase 10.5 - Aggregation and Consistency Tests
Status: implemented

- unit test comparing yearly country totals with regional totals
- verification tools for export year, metadata consistency, and state dynamics

#### Phase 10.6 - Documentation and UX Cleanup
Status: implemented

- README updated to reflect the private review state
- project-phase documentation cleaned up
- local UI and help text simplified
- dashboard controls, light mode, and favicon finalized

## Current Code State

- Country scope:
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
- Exports:
  - `output/latest.json`
  - `output/simulation_<start>_<end>.json`
- Baseline year:
  - detected automatically from `data/countries.json`
  - current refresh state: `2024`
- Dashboard:
  - `dashboard/index.html`
  - country, regional, KPI, border, dark, and light modes
  - Greece renders real ADM2 sub-boundaries, while Slovenia renders real NUTS3 sub-boundaries inside the existing macro-regions.
- Border editor:
  - `dashboard/editor.html`
- Local service:
  - `tools/local_run_service.py`

## Verification Commands

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

## Optional Future Extensions

These items are not unfinished release tasks:

1. An additional batch-comparison view in the dashboard instead of only a minimum/maximum summary.
2. An optional polygon-splitting editor if freely drawn borders become genuinely necessary later.
3. Further dataset refreshes once enough common public values are available for `2025` or `2026`.
