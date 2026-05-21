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

Phase numbering note:
- The earlier idea of a separate standalone "controls phase" is now absorbed into Phase 5.6
- This keeps timeline playback and controlled variation together instead of splitting one coherent block across multiple phases

### Phase 7 - Shock System v1
Status: planned

Likely first shocks:
- Recession
- Energy price shock
- Tourism shock
- Flood
- Drought
- Heat wave

### Phase 8 - Politics / State v1
Status: planned

Possible future systems:
- Budget
- Debt
- Stability
- Corruption
- Investment climate
- Later inflation

## Current Roadmap Order

1. Phase 5 documentation and map baseline completed
2. Phase 5.6 timeline and controlled variation
3. Phase 7 shock system
4. Phase 8 politics / state

## Current Actual State

- Python simulation currently runs from `2020` to `2030`
- The export pipeline writes both `output/simulation_2020_2030.json` and `output/latest.json`
- The dashboard currently reads `output/latest.json`
- The dashboard now defaults to the earliest available year data
- Time progression is now controllable in the dashboard using precomputed export years
- The frontend does not re-simulate anything live
- Controlled yearly variation now exists in the Python core as a bounded deterministic layer
