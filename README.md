# BESP - Balkan Economy Simulation Player

Minimal Python foundation for a realistic yearly Balkan socio-economic simulation.

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

Phase 5 map status:
- Dashboard reads export data only (no duplicated simulation logic in JavaScript)
- No playback controls, no shocks, no backend/API changes
- Map rendering is frontend-only and uses preloaded GeoJSON files

Dashboard data flow:
1. `py main.py` runs the yearly simulation.
2. Python export pipeline writes `output/simulation_<start>_<end>.json` and `output/latest.json`.
3. `dashboard/app.js` fetches `output/latest.json`.
4. `dashboard/app.js` loads GeoJSON from `dashboard/data/`.
5. Dashboard renders metadata, tables, and map hover information.

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
