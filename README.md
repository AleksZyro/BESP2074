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
- Phase 5.6 complete: timeline and controlled variation bridge phase
- Phase 5.7 complete: scenario-driven variation inputs
- Phase 5.8 implemented: export reload and dashboard clarity
- Phase 5.8.2 complete: local run service and generate-run dashboard flow
- Phase 6 merged into 5.6: controls are delivered as part of timeline playback
- Phase 7.1 complete: bounded shock core (economic + climate)
- Phase 7.2 complete: shock calibration guardrails and testcase verifier
- Phase 7.3 complete: shock validation and balancing pass
- Phase 7.4 complete: testcase expansion for export + dashboard flow
- Phase 7.5 complete: refactor / bloat-reduction pass (net negative)
- Phase 8.1 complete: politics/state v1 core model and export wiring
- Phase 8.2 complete: yearly tick integration + state validation pass
- Phase 8.3 complete: dashboard state-value panels with timeline year sync
- Phase 8.4 complete: public UI simplification with metric-based map views
- Phase 9.1 complete: scope expansion v1 with four additional Balkan-adjacent countries

Current scope:
- Countries and regions as dataclasses
- JSON start data
- Loader functions
- Multi-year annual simulation
- JSON export for a lightweight dashboard
- Terminal output plus dashboard with real geodata map layer

Current simulation country scope:
- Serbia
- Montenegro
- Bosnia and Herzegovina
- Albania
- North Macedonia
- Bulgaria
- Hungary

Current simulation behavior:
- Births and deaths by country base rates and regional modifiers
- Region-sensitive external migration
- Population-weighted internal migration between regions of the same country
- Regional attractiveness based on economy, infrastructure, urbanization, metro pull and housing pressure
- Bounded yearly variation for births, deaths, migration, GDP growth, and unemployment
- Scenario-driven variation inputs so runs can follow different plausible paths without degenerating into literal randomness
- Bounded yearly shocks (Phase 7.1) with realistic, capped effects
- Shock calibration guardrails (Phase 7.2): cooldowns, event caps per country-year, and bounded severity scaling
- Country state v1 core (Phase 8.1): budget balance, debt ratio, stability index, corruption index, and investment-climate index
- State values are step-limited per year (Phase 8.2) for plausible inertial progression
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
- Simulation/export scope is now broader than the current geodata coverage; ALB, MKD, BGR, and HUN already participate in the simulation/export layer, while map geodata coverage still remains focused on BIH/MNE/SRB for now
- Country view renders SRB as one continuous block (Kosovo included in SRB scope, no separate country marker)
- Region labels are grouped by BESP region keys to avoid district-label clutter
- Bosnia map mapping currently assigns Brcko to RS rendering scope
- Keeps hover details export-driven with country fallback where region mapping is not available
- Public-facing layout now prioritizes simple timeline + map usage with Advanced controls collapsed by default
- Map metric buttons (Population, GDP per capita, Unemployment, Attractiveness) recolor country/region layers by selected year values
- Sidebar KPI cards summarize active scope (Countries/Regions) for selected year in simpler language
- Standard mode keeps the mixed overview visible, while metric overlays now switch the right column to a single-category view with year-to-year direction arrows

Current dashboard limitations:
- No live simulation runs in the browser; the dashboard reads exported JSON data
- No remote/public backend yet; run generation currently uses a local helper service
- Controlled variation and shocks are bounded by design and not a full policy engine
- `Reload Export` reloads the latest JSON only; it does not start Python from the browser
- `Generate Run` uses a local run service to start a fresh simulation without turning browser JavaScript into a shell launcher

Phase 5 map status:
- Dashboard reads export data only (no duplicated simulation logic in JavaScript)
- No playback controls, no shocks, no backend/API changes
- Map rendering is frontend-only and uses preloaded GeoJSON files

Phase 5.6 - Timeline & Controlled Variation:
- Add year selection to the dashboard
- Default dashboard state should start from the earliest exported year instead of the latest
- Add play / pause / speed controls using already exported yearly data
- No live recalculation in the frontend
- Add controlled variation in the simulation core only when explicitly implemented in the next block
- Variation must be plausible, slow, bounded, reproducible, and sensitive to country / region context
- This phase absorbs the previously separate idea of a standalone controls-only phase

Phase 5.6 current implementation:
- Dashboard starts from the earliest exported year
- Year selection, previous/next stepping, and play / pause / speed buttons are available
- Country summary cards now show flags
- Dashboard no longer shows the old top-right `Loaded ...` status banner
- Variation is deterministic and bounded, not literal random noise

Phase 5.7 - Scenario-driven variation inputs:
- The simulation can now be run with explicit scenario codes from `data/scenarios.json`
- The simulation can now be run with an explicit deterministic variation seed
- If no seed is provided, each new run generates a fresh seed automatically
- Different seeds and scenarios can produce different plausible end states without introducing chaotic roulette behavior
- Export metadata now records scenario and variation seed so dashboard output remains explainable
- Frontend still reads exported JSON only; no live recalculation has been added

Phase 5.8 - Export Reload:
- `Play` replays the already exported years from `output/latest.json`
- `Reload Export` refetches `output/latest.json` and resets the dashboard to the earliest available year
- New simulation runs are still created outside the dashboard with `py main.py`
- No browser-to-Python execution or backend bridge is introduced in this phase

Phase 5.8.2 - Local Run Service:
- `Generate Run` starts a fresh local simulation through a small Python standard-library service
- `Reload Export` remains available for explicitly reloading the newest JSON output
- `Play` still only replays the years of the currently loaded export
- The dashboard talks to the local run service instead of directly executing shell/Python from frontend code

Phase 7.1 - Shock System v1 (bounded):
- Adds plausible annual economic and climate shocks (e.g., recession, energy price shock, tourism slump, flood, heatwave/drought)
- Shock draws are seed-consistent and bounded (no runaway absurd values)
- Shock effects are exported as `shock_events` plus shock metadata in `meta.shocks`
- Shocks can be disabled per run via CLI (`--disable-shocks`) or via the local run service payload

Phase 7.2 - Shock expansion and calibration:
- Adds cooldown windows per shock type to avoid immediate year-to-year repeats for the same country
- Caps stacked shocks per country-year and per category-country-year
- Adds bounded per-event severity scaling so shock strength varies plausibly but remains constrained
- Adds testcase verifier `tools/verify_shock_events.py` for export-level shock integrity checks

Phase 5.6 / 5.7 do not include:
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
5. The local run service can optionally trigger a fresh simulation run and keep status for the dashboard.
6. Dashboard renders metadata, tables, timeline playback, reload state, run status, and map hover information.

Scenario examples:
- `py main.py --scenario baseline`
- `py main.py --scenario baseline --seed baseline-2020`
- `py main.py --scenario reform --seed reform-a`
- `py main.py --scenario stagnation --seed stress-1`
- `py main.py --scenario baseline --disable-shocks`
- `py main.py --list-scenarios`

Current data-selection behavior:
- `main.py` currently simulates `2020 -> 2030`
- `output/latest.json` contains all simulated year buckets in that range
- `output/latest.json` now also records scenario and variation seed in export metadata
- `output/latest.json` now also records `meta.state_model` for the Phase 8.2 integrated state-core payload
- Runs without `--seed` now generate a fresh seed automatically, so repeated simulations can diverge in bounded ways
- `dashboard/app.js` now starts from the earliest available year bucket and can step/play through later buckets
- Map cards, hover details, and summary tables follow the currently selected export year
- State cards and state table (Phase 8.3) also follow the currently selected export year
- Country and region tables now also include ALB, MKD, BGR, and HUN rows after simulation runs

Map data source:
- Boundary files in `dashboard/data/` come from geoBoundaries simplified GeoJSON (ADM0/ADM1) for BIH, MNE, SRB, plus XKX (mapped into SRB scope for BESP consistency).

Phase 9.1 - Scope expansion v1:
- Adds Albania, North Macedonia, Bulgaria, and Hungary to the simulation/export scope
- Adds coarse starter regions for each new country with capital pull preserved where useful
- Keeps the expansion intentionally moderate: more playable country breadth first, no premature province explosion
- Leaves the public geodata map on BIH/MNE/SRB until the next map/data expansion block adds vetted geometry and mapping for the wider scope

Map testcase fixture:
- Stable fixture: `dashboard/fixtures/map_fixture_latest.json`
- Fixture validation script: `tools/verify_map_fixture.py`
- Run check with `py tools/verify_map_fixture.py`

Export testcase verifiers:
- Year-state consistency: `py tools/verify_export_year_state.py`
- Scenario/seed meta consistency: `py tools/verify_export_meta.py`
- State dynamics consistency: `py tools/verify_state_dynamics.py`

Shock testcase verifier:
- Verify latest run with `py tools/verify_shock_events.py`

Local run service verifier:
- Basic API health: `py tools/verify_local_run_service.py --base-url http://127.0.0.1:8011`
- End-to-end run flow: `py tools/verify_local_run_service.py --base-url http://127.0.0.1:8011 --e2e`

Quick start:
1. Run `py main.py` to generate `output/latest.json`.
2. From the repository root, run `py tools/local_run_service.py --port 8011`.
3. Open `http://localhost:8011/dashboard/index.html`.
4. Use `Generate Run` for a new local simulation or `Reload Export` to re-read the newest JSON.
5. Use `Play` only to replay the loaded years.
6. Optional export checks: `py tools/verify_export_year_state.py`, `py tools/verify_export_meta.py`, and `py tools/verify_state_dynamics.py`
7. Optional service health check: `py tools/verify_local_run_service.py --base-url http://127.0.0.1:8011`
8. Optional local E2E run check: `py tools/verify_local_run_service.py --base-url http://127.0.0.1:8011 --e2e`
9. Optional shock integrity check after a run: `py tools/verify_shock_events.py`

Documentation:
- See `PROJECT_PHASES.md` for the full up-to-date roadmap, workflow rules, current phase states, and next planned blocks.
