# BESP Project Phases

## Project Intent

BESP (Balkan Economy Simulation Player) is a realistic, yearly Balkan socio-economic simulation with region-sensitive behavior and export-driven visualization.

BESP should be:
- Singleplayer
- Sandbox
- Realistic and slow-moving
- Region-based
- Plausible over gamey

BESP should not be:
- A focus-tree game
- Fantasy alt-history
- Event spam
- Meme geopolitics
- UI-first work without a clean simulation/export base

## Workflow Rules

1. Phase-based development
- Larger work belongs to a named phase or subphase.

2. Bundle commits by coherent block
- Prefer one coherent commit over micro-commits.

3. No unnecessary PR/merge workflow
- Work directly on the agreed branch unless a PR is explicitly requested.

4. Commit naming schema
- `<phase>.<subphase> <type>: <description>`

Examples:
- `7.4 testcase: expand export and run-service verification coverage`
- `8.2 validation: integrate bounded yearly state progression and add dynamics checks`
- `8.3 dashboard: add politics state panels synced to active year`

Allowed commit types:
- `core`
- `validation`
- `debug`
- `testcase`
- `dashboard`
- `map`
- `controls`
- `shock`
- `docs`
- `refactor`
- `bridge`

## Phase Overview

### Phase 1 - Foundation
Status: complete

Contains:
- Project structure
- Dataclasses
- JSON base data
- Loader
- First yearly simulation pass

### Phase 2 - Structured Export Data
Status: complete

Contains:
- Structured region and country year results
- Country aggregates
- JSON export for dashboard usage

### Phase 3 - Economy v1
Status: complete

Contains:
- Regional GDP
- GDP growth
- GDP per capita
- Unemployment
- Country-level economic aggregates

### Phase 3.3 - Validation/Calibration Pass
Status: complete

Contains:
- Compact console output
- Sanity warnings
- Clearer constants/constraints
- Export metadata with `warning_count`

### Phase 4 - Dashboard v1 Without Map
Status: complete

Contains:
- Dashboard shell
- JSON loading from `output/latest.json`
- Metadata cards
- Country and region tables

### Phase 5 - Map v1
Status: complete (baseline + corrections)

Contains:
- Country layer
- Region layer
- Hover details
- Export-driven rendering
- Kosovo in SRB country scope for country view consistency

### Phase 5.6 - Timeline & Controlled Variation
Status: complete

Contains:
- Earliest-year default
- Year select
- Prev/next/play/pause/speed playback
- Precomputed-year playback only (no browser-side simulation)

### Phase 5.7 - Scenario-Driven Variation Inputs
Status: complete

Contains:
- Scenario model (`data/scenarios.json`)
- Deterministic variation seed input
- Auto-seed generation when seed omitted
- Scenario/seed metadata in export

### Phase 5.8 - Export Reload & Presentation Clarity
Status: implemented (superseded by 5.8.2 for fresh-run workflow)

Contains:
- Reload of `output/latest.json`
- Clear UI separation: playback vs export reload
- State-safe rebind of dashboard views

### Phase 5.8.2 - Local Run Service & Generate Run
Status: complete

Contains:
- Small Python standard-library service (`tools/local_run_service.py`)
- `Generate Run` trigger from dashboard
- Scenario selection and shocks toggle for local runs
- Automatic export reload after successful run
- Status states: idle/running/success/failed

### Phase 6 - Controls
Status: merged into 5.6 (no standalone implementation phase)

Note:
- Controls are delivered as part of Phase 5.6 timeline playback.

### Phase 7.1 - Shock System v1 (Bounded Core)
Status: complete

Contains:
- Shock definitions in `data/shocks.json`
- Bounded annual shock draw layer
- Exported `shock_events` and `meta.shocks`
- Optional `--disable-shocks`

### Phase 7.2 - Shock Expansion & Calibration
Status: complete

Contains:
- Cooldown windows
- Severity min/max scaling
- Per-country-year/category stacking caps
- Verifier: `tools/verify_shock_events.py`

### Phase 7.3 - Shock Validation & Balancing Pass
Status: complete

Contains:
- Probability/intensity balancing refinements
- Additional guardrails to avoid unrealistic clustering
- Reproducibility retention under identical seed

### Phase 7.4 - Testcase Expansion
Status: complete

Contains:
- Verifiers for year-state, scenario/seed meta, shock/meta consistency, run-service flow
- Expanded README test guidance

### Phase 7.5 - Refactor/Bloat-Reduction Pass
Status: complete

Contains:
- Duplicate helper consolidation
- Repetition reduction
- Net-negative line count while preserving behavior

### Phase 8 - Politics/State v1
Status: complete (baseline v1)

### Phase 8.1 - Core Model
Status: complete

Contains:
- Country state baselines in `data/countries.json`
- State export fields:
  - `budget_balance_pct_gdp`
  - `debt_to_gdp`
  - `stability_index`
  - `corruption_index`
  - `investment_climate_index`
- `meta.state_model` export marker

### Phase 8.2 - Tick Integration & Validation
Status: complete

Contains:
- Bounded yearly step caps for all state metrics
- State bound checks + yearly delta checks
- Verifier: `tools/verify_state_dynamics.py`
- Export marker: `meta.state_model.phase = "8.2"`

### Phase 8.3 - Dashboard Panels for Politics/State v1
Status: complete

### Phase 8.4 - Public UI Simplification + Metric Views
Status: complete

Contains:
- Cleaner public dashboard hierarchy with focus on timeline + map usage
- Advanced simulation controls moved into a collapsible section
- Sidebar KPI cards for simple user-facing indicators (population, GDP, unemployment, growth)
- Metric-based map view toggles (population, GDP per capita, unemployment, attractiveness)
- Year-synced country/region map coloring without changing simulation logic

### Phase 9 - Scope Expansion
Status: active

### Phase 9.1 - Country Scope Expansion v1
Status: complete

Contains:
- Adds Albania, North Macedonia, Bulgaria, and Hungary to `data/countries.json`
- Adds coarse starter regions for the four new countries in `data/regions.json`
- Keeps capital pull explicit where it matters (`Tirana`, `Skopje`, `Sofia`, `Budapest`)
- Updates dashboard country flags so expanded scope is readable in cards/tables
- Leaves current public map geodata coverage intentionally limited to BIH/MNE/SRB until a separate map-scope block adds vetted shapes and mappings for the wider region set

Contains:
- State cards (year-synced averages)
- State table by active year and country
- No frontend simulation logic duplication
- No timeline logic changes beyond state display binding

## Current Actual State (Codebase)

- Simulation years: `2020 -> 2030`
- Simulation/export country scope:
  - Serbia
  - Montenegro
  - Bosnia and Herzegovina
  - Albania
  - North Macedonia
  - Bulgaria
  - Hungary
- Export files:
  - `output/simulation_2020_2030.json`
  - `output/latest.json`
- Dashboard data source: `output/latest.json`
- Dashboard playback: precomputed years only
- Local run service can generate fresh runs and trigger dashboard reload
- Scenarios + seeds produce bounded, reproducible variation
- Shocks are bounded and export-auditable
- State values are integrated, bounded, validated, and visible in dashboard (Phase 8.3)
- Public map geodata coverage is still narrower than the full simulation scope and currently focuses on BIH/MNE/SRB (+ XKX stitched into SRB logic)

## Verify Commands (Current)

- `py main.py`
- `py tools/verify_export_year_state.py`
- `py tools/verify_export_meta.py`
- `py tools/verify_shock_events.py`
- `py tools/verify_state_dynamics.py`
- `py tools/verify_local_run_service.py --base-url http://127.0.0.1:8011`
- `py tools/verify_local_run_service.py --base-url http://127.0.0.1:8011 --e2e`
- `py tools/verify_map_fixture.py`

## Next Planned Blocks

1. Phase 9.2 - Expanded map/data coverage for ALB, MKD, BGR, and HUN
2. Phase 9.3 - Longer time horizon pass (20+ years, drift/balance validation)
3. Phase 9.4 - Run-flow simplification (`Play again` replacing separate generate-first workflow)
