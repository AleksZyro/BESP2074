# BESP Project Phases

## Project Intent

BESP = Balkan Economy Simulation Player.

The project is meant to become a realistic, yearly Balkan socio-economic simulator with region-sensitive development, later supported by a dashboard, a map, timeline playback, and plausible shocks.

BESP should be:
- Singleplayer
- Sandbox
- Realistic
- Slow-moving
- Region-based
- Plausible instead of gamey

BESP should not be:
- A focus-tree game
- Fantasy alt-history
- Event spam
- Meme geopolitics
- UI-first work without a clean simulation/export base

## Workflow Rules

### 1. Phase-based development
Larger work belongs to a named phase or subphase.

### 2. Bundle commits by coherent block
Prefer one larger commit per coherent block over many micro-commits.

### 3. No unnecessary PR / merge workflows without agreement
Prefer direct work on the agreed branch unless a branch / PR step is explicitly wanted.

### 4. Commit naming schema
Format:

`<phase>.<subphase> <type>: <description>`

Examples:
- `3.3 validation: add sanity checks and compact console output`
- `4.1 dashboard: add static JSON-driven dashboard shell`
- `5.x debug: build serbia country view from region geometry`
- `5.6 controls: add year selection and export playback`
- `5.7 core: add bounded seeded yearly variation`
- `5.7 docs: document scenario-driven variation inputs`
- `5.8 dashboard: add export reload flow`
- `5.8.2 bridge: add local run service and generate-run dashboard flow`

### 5. Allowed commit types
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

## Phase Overview

### Phase 1 - Foundation
Status: complete

Contains:
- Project structure
- Dataclasses
- JSON start data
- Loader
- First yearly simulation pass

### Phase 2 - Structured Export Data
Status: complete

Contains:
- Structured region and country year results
- Country aggregates
- JSON export for later UI use

### Phase 3 - Economy v1
Status: complete

Contains:
- Regional GDP
- GDP growth
- GDP per capita
- Unemployment
- Country-level economic aggregates

### Phase 3.3 - Validation / Calibration Pass
Status: complete

Contains:
- More compact console output
- Warnings / sanity checks
- Clearer constants and constraints
- Export metadata with `warning_count`

### Phase 4 - Dashboard v1 Without Map
Status: complete

Contains:
- Dashboard shell
- JSON loading from `output/latest.json`
- Metadata panels
- Country and region tables

Explicitly not in scope:
- No map-first workflow
- No controls
- No new simulation logic

### Phase 5 - Map v1
Status: baseline implemented

Contains:
- Country map layer
- Region map layer
- Hover details
- Export-driven map rendering

Current implementation note:
- Map rendering works on top of precomputed export data
- The map does not yet make the dashboard timeline-driven

### Phase 5.6 - Timeline & Controlled Variation
Status: in progress

Purpose:
- Bridge the gap between static map/dashboard display and later system expansion
- Make the exported years navigable and playable
- Define realistic bounded variation before any shock system is introduced
- Fold the old standalone controls idea into one cleaner bridge phase

Contains:
- Year selection in the dashboard
- Earliest-year default instead of latest-year default
- Play / pause / speed controls based on precomputed export data
- No live recalculation in frontend JavaScript
- Controlled variation in the simulation core when implemented:
  - plausible
  - slow
  - bounded
  - reproducible
  - region- and country-sensitive

Explicitly not in scope:
- No shock phase
- No inflation system v1
- No politics / state layer
- No event spam
- No wild random effects
- No unbounded extreme values

Current reason for this phase:
- The dashboard already loads precomputed JSON correctly
- Timeline controls are now the correct bridge between static display and later systems
- Controlled variation is now introduced as a bounded deterministic layer instead of literal randomness
- A fuller shock / policy layer still remains outside this phase

### Phase 5.7 - Scenario-Driven Variation Inputs
Status: active

Purpose:
- Stop treating one deterministic baseline path as the only meaningful run result
- Keep the model realistic and bounded while allowing different plausible paths
- Make variation depend on explicit simulation inputs rather than roulette-like randomness

Contains:
- Scenario definitions in project data
- Deterministic variation seed input
- Export metadata for chosen scenario and seed
- Scenario-aware simulation biases for growth, migration, unemployment, and demographic drift

Explicitly not in scope:
- No wild random generator
- No shock system
- No inflation system v1
- No politics / state block
- No live browser-side simulation

Current implementation note:
- Identical scenario + identical seed still produce identical results on purpose
- Different scenarios and/or seeds can now create different but bounded and reproducible outcomes
- Runs without an explicit seed now generate a fresh seed automatically, so repeated simulations create new plausible paths by default
- This phase is the bridge between a single fixed path and later explicit shock / policy systems

### Phase 5.8 - Export Reload & Presentation Clarity
Status: implemented, but superseded by 5.8.2 for local fresh-run workflow

Purpose:
- Keep the dashboard publicly presentable without making the browser responsible for starting Python
- Make it obvious that `Play` only replays exported years
- Make it easy to reload a newly generated `output/latest.json` without stale dashboard state

Contains:
- Explicit `Reload Export` action in the dashboard
- Clean playback/reload guidance in the UI
- Reset to earliest available year after reload
- State-safe refresh of metadata, cards, map, hover, and tables

Explicitly not in scope:
- No browser-to-Python execution
- No backend/API bridge
- No new simulation engine behavior
- No new map layer work

Current implementation note:
- Users still generate new runs outside the dashboard with `py main.py`
- The dashboard then reloads the newest JSON export and replays only those precomputed years
- This keeps the architecture suitable for later public presentation and hosting

### Phase 5.8.2 - Local Run Service & Generate Run
Status: complete

Purpose:
- Correct the limited 5.8 reload-only solution without jumping to Phase 6
- Let the dashboard trigger a fresh local simulation run without direct browser-to-shell execution
- Keep `Play` strictly as timeline playback while introducing a separate `Generate Run` action

Contains:
- Small local Python standard-library run service
- `Generate Run` action in the dashboard
- Scenario selection for local runs
- Automatic reload of `output/latest.json` after a successful local run
- Clear status states for idle / running / success / failed

Explicitly not in scope:
- No large backend rewrite
- No Flask / FastAPI / Node backend
- No new map features
- No shocks
- No politics / state layer

Current implementation note:
- The dashboard talks to the local run service over lightweight HTTP endpoints
- The service is responsible for launching `main.py`
- Frontend JavaScript does not execute shell commands directly
- `Reload Export` remains available, but `Generate Run` now covers the local fresh-run workflow cleanly

### Phase 6 - Controls (merged into 5.6)
Status: merged / no standalone phase

Purpose:
- Keep numbering continuity for historical planning notes
- Clarify why commits may jump from 5.x to 7.x

Current implementation note:
- The old standalone Phase 6 controls plan (Play/Pause/Speed) was absorbed into Phase 5.6
- Controls already exist in the dashboard as export playback controls, not as a separate phase

### Phase 7.1 - Shock System v1 (bounded core)
Status: complete

Purpose:
- Introduce plausible first shocks without event-spam design
- Keep shocks bounded, explainable, and seed-consistent
- Export shock metadata so each run remains auditable

Contains:
- Shock definitions in `data/shocks.json`
- Bounded country-year shock draw layer in the simulation core
- Exported `shock_events` plus `meta.shocks` summary
- Optional per-run shock toggle (`--disable-shocks`, run-service payload)

Explicitly not in scope:
- No fantasy event scripting
- No politics/state coupling yet
- No inflation system v1 yet
- No map redesign work

Current implementation note:
- Shocks are annual and reproducible under the same seed
- Effects are capped to avoid unrealistic blowups
- Initial shock families: economic and climate

### Phase 7.2 - Shock Expansion & Calibration
Status: complete

Purpose:
- Reduce unrealistic clustering of shock events while keeping variability
- Keep shock intensity plausible and bounded under all seeds
- Add explicit testcase-style validation for shock export quality

Contains:
- Cooldown windows per shock type (`cooldown_years`)
- Bounded per-event severity scaling (`severity_min` / `severity_max`)
- Caps per country-year and category-country-year to limit stacked shocks
- Shock testcase verifier script (`tools/verify_shock_events.py`)

Explicitly not in scope:
- No politics/state coupling
- No inflation system v1
- No map redesign work

Current implementation note:
- Same seed still reproduces identical shock timing/intensity
- Different seeds produce different but bounded shock paths
- Exported shock metadata/event list is now verified by a dedicated integrity script

Phase numbering note:
- The earlier idea of a separate standalone "controls phase" is now absorbed into Phase 5.6
- This keeps timeline playback and controlled variation together instead of splitting one coherent block across multiple phases

### Phase 7 - Shock System v1
Status: in progress (7.1 core + 7.2 calibration complete)

Likely first shocks:
- Recession
- Energy price shock
- Tourism shock
- Flood
- Drought
- Heat wave

### Phase 8 - Politics / State v1
Status: active (8.2 tick integration implemented)

Possible future systems:
- Budget
- Debt
- Stability
- Corruption
- Investment climate
- Later inflation

### Phase 8.1 - Politics / State v1 Core Model
Status: complete

Contains:
- Baseline country-state inputs in `data/countries.json`
- Träge, begrenzte jährliche State-Entwicklung auf Länderaggregat-Ebene
- Export fields in `CountryYearResult`:
  - `budget_balance_pct_gdp`
  - `debt_to_gdp`
  - `stability_index`
  - `corruption_index`
  - `investment_climate_index`
- `meta.state_model` export marker for phase/version traceability

Explicitly not in scope:
- No shock rework
- No map/dashboard feature redesign
- No policy-tree or event-scripting layer
- No inflation subsystem yet

### Phase 8.2 - State Tick Integration & Validation
Status: complete

Contains:
- Explicit yearly state-step limits for:
  - budget balance
  - debt ratio
  - stability
  - corruption
  - investment climate
- Validation checks for state bounds and year-to-year state deltas
- Dedicated verifier script for state dynamics (`tools/verify_state_dynamics.py`)
- Updated export metadata marker: `meta.state_model.phase = "8.2"`

## Current Roadmap Order

1. Phase 5 documentation and map baseline completed
2. Phase 5.6 timeline and controlled variation
3. Phase 5.7 scenario-driven variation inputs
4. Phase 5.8 export reload and dashboard clarity
5. Phase 5.8.2 local run service and generate-run flow
6. Phase 6 merged into 5.6 (no separate implementation block)
7. Phase 7.1 bounded shock core
8. Phase 7.3 shock validation and balancing pass
9. Phase 8.2 politics / state tick integration and validation

## Current Actual State

- Python simulation currently runs from `2020` to `2030`
- The export pipeline writes both `output/simulation_2020_2030.json` and `output/latest.json`
- The dashboard currently reads `output/latest.json`
- The dashboard now defaults to the earliest available year data
- Time progression is now controllable in the dashboard using precomputed export years
- The dashboard reloads `output/latest.json` on demand but does not start new simulations itself
- The dashboard can now ask a small local run service to generate a fresh run and then reload the new export automatically
- The frontend does not re-simulate anything live
- Controlled yearly variation now exists in the Python core as a bounded deterministic layer
- Scenario and seed inputs now allow multiple plausible paths without unbounded randomness
- If the same seed is reused, the same path can still be reproduced on purpose
- Shock events are now generated in a bounded way and exported for run transparency
- Shock calibration now includes cooldowns, stacking caps, and bounded severity scaling
- State-core values are now integrated into yearly progression with explicit delta caps and validation checks
