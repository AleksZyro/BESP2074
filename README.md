# BESP - Balkan Economy Simulation Player

Minimal Python foundation for a realistic yearly Balkan socio-economic simulation.

Current scope:
- Countries and regions as dataclasses
- JSON start data
- Loader functions
- Multi-year annual simulation
- JSON export for a lightweight dashboard
- Terminal output plus Dashboard v1

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

Dashboard v1:
- Lives in `dashboard/`
- Loads `output/latest.json` automatically when served from the repository root
- Supports manual JSON loading through a file picker when opened directly
- Focuses on yearly country and region drilldowns only

Quick start:
1. Run `py main.py` to generate `output/latest.json`.
2. Open `dashboard/index.html`.
3. If the dashboard cannot auto-load the export, choose `output/latest.json` manually with the file picker.
