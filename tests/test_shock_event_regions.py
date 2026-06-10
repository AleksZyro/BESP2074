import unittest

from besp.loader import load_scenario_map, load_shock_map, load_world
from besp.models import Country, Region, ShockDefinition
from besp.simulation import build_country_shock_effects, simulate_period
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
                all("::" in key for key in event.affected_region_keys)
            )

    def test_cross_border_event_exports_and_applies_neighbor_effects(self) -> None:
        countries = [
            Country(
                name="Serbia",
                code="SRB",
                base_birth_rate=0.01,
                base_death_rate=0.01,
                base_net_migration_rate=0.0,
                stability=0.5,
                eu_integration=0.4,
                corruption=0.5,
                regions=[
                    Region(
                        name="Vojvodina",
                        country_code="SRB",
                        population=1_800_000,
                        area_km2=21_000,
                        urbanization=0.62,
                        infrastructure=0.65,
                        housing_capacity=2_000_000,
                        economic_attractiveness=0.6,
                        gdp_billion_eur=20.0,
                    )
                ],
            ),
            Country(
                name="Croatia",
                code="HRV",
                base_birth_rate=0.01,
                base_death_rate=0.01,
                base_net_migration_rate=0.0,
                stability=0.5,
                eu_integration=0.6,
                corruption=0.5,
                regions=[
                    Region(
                        name="Slavonia",
                        country_code="HRV",
                        population=700_000,
                        area_km2=12_000,
                        urbanization=0.48,
                        infrastructure=0.55,
                        housing_capacity=900_000,
                        economic_attractiveness=0.45,
                        gdp_billion_eur=8.0,
                    )
                ],
            ),
            Country(
                name="Hungary",
                code="HUN",
                base_birth_rate=0.01,
                base_death_rate=0.01,
                base_net_migration_rate=0.0,
                stability=0.5,
                eu_integration=0.6,
                corruption=0.5,
                regions=[
                    Region(
                        name="Great Plains",
                        country_code="HUN",
                        population=2_000_000,
                        area_km2=42_000,
                        urbanization=0.52,
                        infrastructure=0.58,
                        housing_capacity=2_300_000,
                        economic_attractiveness=0.50,
                        gdp_billion_eur=18.0,
                    )
                ],
            ),
            Country(
                name="Bosnia and Herzegovina",
                code="BIH",
                base_birth_rate=0.01,
                base_death_rate=0.01,
                base_net_migration_rate=0.0,
                stability=0.5,
                eu_integration=0.35,
                corruption=0.5,
                regions=[
                    Region(
                        name="Republika Srpska",
                        country_code="BIH",
                        population=1_100_000,
                        area_km2=24_000,
                        urbanization=0.44,
                        infrastructure=0.50,
                        housing_capacity=1_300_000,
                        economic_attractiveness=0.42,
                        gdp_billion_eur=7.0,
                    )
                ],
            ),
        ]
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
        self.assertLessEqual(max(events_by_year.values()), 3)


if __name__ == "__main__":
    unittest.main()
