import unittest

from besp.loader import load_scenario_map, load_world
from besp.models import ShockDefinition
from besp.simulation import simulate_period
from main import resolve_simulation_year_window


class ShockEventRegionExportTests(unittest.TestCase):
    def test_shock_events_export_affected_regions(self) -> None:
        start_year, _end_year = resolve_simulation_year_window("data")
        countries = load_world("data")
        scenario = load_scenario_map("data")["baseline"]
        shock = ShockDefinition(
            code="heatwave_drought",
            name="Heatwave and drought",
            description="Agricultural and lowland areas are hit first.",
            category="climate",
            annual_probability=1.0,
            gdp_growth_bias=-0.01,
            unemployment_bias=0.004,
            net_migration_rate_shift=-0.001,
        )

        _results, events = simulate_period(
            countries,
            start_year,
            start_year + 1,
            scenario=scenario,
            variation_seed="event-region-export",
            shock_definitions=[shock],
        )

        self.assertTrue(events)
        for event in events:
            self.assertTrue(event.affected_region_names)
            self.assertTrue(event.affected_region_keys)
            self.assertTrue(
                all(key.startswith(f"{event.country_code}::") for key in event.affected_region_keys)
            )


if __name__ == "__main__":
    unittest.main()
