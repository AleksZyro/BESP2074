# BESP - Balkan Economy Simulation Player

Minimal Python foundation for a realistic yearly Balkan socio-economic simulation.

Project focus:
- Singleplayer sandbox
- Realistic, slow-moving annual simulation
- Regions matter as much as countries
- Frontend reads precomputed export data, not live simulation state
- No focus trees, no fantasy events, no absurd alt-history jumps

Project status:
- Phase 1 complete: foundation
- Phase 2 complete: structured export data
- Phase 3 complete: economy v1
- Phase 3.3 complete: validation / calibration pass
- Phase 4 complete: dashboard v1 without map-first scope creep
- Phase 5 complete in baseline form: map v1
- Next planned bridge phase: Phase 5.6 - Timeline & Controlled Variation

Current scope:
- Countries and regions as dataclasses
- JSON start data
- Loader functions
- Multi-year annual simulation
- JSON export for a lightweight dashboard
- Terminal output plus dashboard with real geodata map layer

Current simulation behavior:
- Births and deaths by country base rates and regional modifiers
- Region-sensitive external migration
- Population-weighted internal migration between regions of the same country
- Regional attractiveness based on economy, infrastructure, urbanization, metro pull and housing pressure
- Multi-year terminal output with area, density, natural change and migration values

Modeling principles:
- No focus trees
- No fantasy events
- No scripted alternative history
- Slow yearly changes
- Standard library only

Dashboard 5.x (map v1):
- Lives in `dashboard/`
- Loads `output/latest.json` automatically when served from the repository root
- Shows export metadata plus simple country and region summary tables
- Renders real geodata country boundaries (BIH, MNE, SRB) and ADM1 region boundaries
- Renders Kosovo geodata in the SRB scope to match BESP region data (`Kosovo and Metohija`)
- Country view renders SRB as one continuous block (Kosovo included in SRB scope, no separate country marker)
- Region labels are grouped by BESP region keys to avoid district-label clutter
- Bosnia map mapping currently assigns Brcko to RS rendering scope
- Keeps hover details export-driven with country fallback where region mapping is not available

Current dashboard limitations:
- Dashboard currently opens from the latest available export year, not the earliest year
- No year selector yet
- No play / pause / speed controls yet
- No flags in the country summary cards yet
- No live simulation runs in the browser; the dashboard only reads exported JSON data
- Current map and dashboard UI are still display-oriented, not timeline-driven

Phase 5 map status:
- Dashboard reads export data only (no duplicated simulation logic in JavaScript)
- No playback controls, no shocks, no backend/API changes
- Map rendering is frontend-only and uses preloaded GeoJSON files

Phase 5.6 - Timeline & Controlled Variation (planned next):
- Add year selection to the dashboard
- Default dashboard state should start from the earliest exported year instead of the latest
- Add play / pause / speed controls using already exported yearly data
- No live recalculation in the frontend
- Add controlled variation in the simulation core only when explicitly implemented in the next block
- Variation must be plausible, slow, bounded, reproducible, and sensitive to country / region context
- This phase absorbs the previously separate idea of a standalone controls-only phase

Phase 5.6 does not include:
- No shock system
- No inflation system v1
- No politics / state system
- No wild random effects
- No fantasy events
- No unbounded extreme values

Dashboard data flow:
1. `py main.py` runs the yearly simulation.
2. Python export pipeline writes `output/simulation_<start>_<end>.json` and `output/latest.json`.
3. `dashboard/app.js` fetches `output/latest.json`.
4. `dashboard/app.js` loads GeoJSON from `dashboard/data/`.
5. Dashboard renders metadata, tables, and map hover information.

Current data-selection behavior:
- `main.py` currently simulates `2020 -> 2030`
- `output/latest.json` contains all simulated year buckets in that range
- `dashboard/app.js` currently uses the latest available country and region rows for map cards and hover details
- This is why the dashboard currently surfaces `2029-2030` values first
- Changing the dashboard to start from the first exported year belongs to Phase 5.6, not the current map block

Map data source:
- Boundary files in `dashboard/data/` come from geoBoundaries simplified GeoJSON (ADM0/ADM1) for BIH, MNE, SRB, plus XKX (mapped into SRB scope for BESP consistency).

Map testcase fixture:
- Stable fixture: `dashboard/fixtures/map_fixture_latest.json`
- Fixture validation script: `tools/verify_map_fixture.py`
- Run check with `py tools/verify_map_fixture.py`

Quick start:
1. Run `py main.py` to generate `output/latest.json`.
2. From the repository root, run `py -m http.server 8000`.
3. Open `http://localhost:8000/dashboard/index.html`.

Documentation:
- See `PROJECT_PHASES.md` for the cleaned-up roadmap, workflow rules, and the new Phase 5.6 bridge phase.
