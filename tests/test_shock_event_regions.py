import unittest

from besp.loader import load_scenario_map, load_shock_map, load_world
from besp.models import Country, Region, ShockDefinition
from besp.simulation import build_country_shock_effects, simulate_period
from main import resolve_simulation_year_window


def single_region_country(
    name: str,
    code: str,
    region_name: str,
    population: int,
    area_km2: float,
    urbanization: float,
    infrastructure: float,
    housing_capacity: int,
    economic_attractiveness: float,
    gdp_billion_eur: float,
    eu_integration: float,
) -> Country:
    return Country(
        name=name,
        code=code,
        base_birth_rate=0.01,
        base_death_rate=0.01,
        base_net_migration_rate=0.0,
        stability=0.5,
        eu_integration=eu_integration,
        corruption=0.5,
        regions=[
            Region(
                name=region_name,
                country_code=code,
                population=population,
                area_km2=area_km2,
                urbanization=urbanization,
                infrastructure=infrastructure,
                housing_capacity=housing_capacity,
                economic_attractiveness=economic_attractiveness,
                gdp_billion_eur=gdp_billion_eur,
            )
        ],
    )


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
                all("::" in key for key in event.affected_region_keys)
            )

    def test_cross_border_event_exports_and_applies_neighbor_effects(self) -> None:
        country_specs = [
            ("Serbia", "SRB", "Vojvodina", 1_800_000, 21_000, 0.62, 0.65, 2_000_000, 0.60, 20.0, 0.40),
            ("Croatia", "HRV", "Slavonia", 700_000, 12_000, 0.48, 0.55, 900_000, 0.45, 8.0, 0.60),
            ("Hungary", "HUN", "Great Plains", 2_000_000, 42_000, 0.52, 0.58, 2_300_000, 0.50, 18.0, 0.60),
            ("Bosnia and Herzegovina", "BIH", "Republika Srpska", 1_100_000, 24_000, 0.44, 0.50, 1_300_000, 0.42, 7.0, 0.35),
        ]
        countries = [single_region_country(*spec) for spec in country_specs]
        shock = ShockDefinition(
            code="flood_event",
            name="Flood Event",
            description="Test flood",
            category="climate",
            annual_probability=1.0,
            gdp_growth_bias=-0.02,
            unemployment_bias=0.01,
            country_weight_overrides={"SRB": 1.0, "HRV": 0.0, "HUN": 0.0, "BIH": 0.0},
        )

        effects, events, _last_triggered = build_country_shock_effects(
            countries,
            [shock],
            2025,
            "cross-border-test-0",
        )

        self.assertEqual(len(events), 1)
        event = events[0]
        self.assertIn("SRB::vojvodina", event.affected_region_keys)
        self.assertIn("HRV::slavonia", event.affected_region_keys)
        self.assertIn("HUN::great plains", event.affected_region_keys)
        self.assertIn("BIH::republika srpska", event.affected_region_keys)
        self.assertLess(effects["SRB"]["gdp_growth_bias"], 0)
        self.assertLess(effects["HRV"]["gdp_growth_bias"], 0)
        self.assertGreater(effects["HRV"]["unemployment_bias"], 0)

    def test_default_shocks_are_capped_to_avoid_event_spam(self) -> None:
        start_year, end_year = resolve_simulation_year_window("data")
        countries = load_world("data")
        scenario = load_scenario_map("data")["baseline"]
        shocks = list(load_shock_map("data").values())

        _results, events = simulate_period(
            countries,
            start_year,
            end_year,
            scenario=scenario,
            variation_seed="event-frequency-cap",
            shock_definitions=shocks,
        )

        events_by_year: dict[int, int] = {}
        for event in events:
            events_by_year[event.start_year] = events_by_year.get(event.start_year, 0) + 1

        self.assertTrue(events)
        self.assertLessEqual(max(events_by_year.values()), 2)


if __name__ == "__main__":
    unittest.main()
