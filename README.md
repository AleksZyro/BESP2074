# BESP - Balkan Economy Simulation Player

Minimal Python foundation for a realistic yearly Balkan socio-economic simulation.

Current scope:
- Countries and regions as dataclasses
- JSON start data
- Loader functions
- Multi-year annual simulation
- JSON export for a lightweight dashboard
- Terminal output plus Dashboard 4.1 shell

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

Dashboard 4.1:
- Lives in `dashboard/`
- Loads `output/latest.json` automatically when served from the repository root
- Shows export metadata plus simple country and region summary tables
- Does not add filters, maps, playback, or new simulation logic

Phase 4 status:
- Dashboard reads export data only (no duplicated simulation logic in JavaScript)
- No map, no playback controls, no shocks, no backend/API changes
- Scope remains a static export viewer as intended for Phase 4

Dashboard data flow:
1. `py main.py` runs the yearly simulation.
2. Python export pipeline writes `output/simulation_<start>_<end>.json` and `output/latest.json`.
3. `dashboard/app.js` fetches `output/latest.json`.
4. Dashboard renders metadata plus country and region summary tables.

Map testcase fixture:
- Stable fixture: `dashboard/fixtures/map_fixture_latest.json`
- Fixture validation script: `tools/verify_map_fixture.py`
- Run check with `py tools/verify_map_fixture.py`

Quick start:
1. Run `py main.py` to generate `output/latest.json`.
2. From the repository root, run `py -m http.server 8000`.
3. Open `http://localhost:8000/dashboard/index.html`.
