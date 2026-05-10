# BESP - Balkan Economy Simulation Player

Minimal Python foundation for a realistic yearly Balkan socio-economic simulation.

Current scope:
- Countries and regions as dataclasses
- JSON start data
- Loader functions
- Multi-year annual simulation
- Terminal output only

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
