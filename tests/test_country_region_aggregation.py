import unittest

from besp.loader import load_scenario_map, load_world
from besp.simulation import aggregate_country_results, simulate_period
from main import resolve_simulation_year_window


class CountryRegionAggregationTests(unittest.TestCase):
    @staticmethod
    def run_country_results(seed: str):
        start_year, end_year = resolve_simulation_year_window("data")
        countries = load_world("data")
        scenario = load_scenario_map("data")["baseline"]
        region_results, _shock_events = simulate_period(
            countries,
            start_year,
            end_year,
            scenario=scenario,
            variation_seed=seed,
            shock_definitions=[],
        )
        return aggregate_country_results(region_results, countries)

    def test_country_totals_match_region_sums_for_every_year(self) -> None:
        start_year, end_year = resolve_simulation_year_window("data")
        countries = load_world("data")
        scenario = load_scenario_map("data")["baseline"]
        region_results, _shock_events = simulate_period(
            countries,
            start_year,
            end_year,
            scenario=scenario,
            variation_seed="unit-aggregation-check",
            shock_definitions=[],
        )
        country_results = aggregate_country_results(region_results, countries)

        regions_by_year_country: dict[tuple[int, int, str], list] = {}
        for region_result in region_results:
            key = (
                region_result.start_year,
                region_result.end_year,
                region_result.country_code,
            )
            regions_by_year_country.setdefault(key, []).append(region_result)

        integer_fields = [
            "start_population",
            "end_population",
            "births",
            "deaths",
            "natural_change",
            "net_external_migration",
            "internal_migration",
        ]
        float_fields = [
            "start_gdp_billion_eur",
            "end_gdp_billion_eur",
        ]

        for country_result in country_results:
            key = (
                country_result.start_year,
                country_result.end_year,
                country_result.country_code,
            )
            region_group = regions_by_year_country[key]
            for field_name in integer_fields:
                with self.subTest(key=key, field=field_name):
                    self.assertEqual(
                        getattr(country_result, field_name),
                        sum(getattr(region_result, field_name) for region_result in region_group),
                    )
            for field_name in float_fields:
                with self.subTest(key=key, field=field_name):
                    self.assertAlmostEqual(
                        getattr(country_result, field_name),
                        sum(getattr(region_result, field_name) for region_result in region_group),
                        places=6,
                    )

    def test_same_seed_is_reproducible_without_shocks(self) -> None:
        first_run = self.run_country_results("stable-seed")
        second_run = self.run_country_results("stable-seed")
        first_signature = [
            (
                row.start_year,
                row.country_code,
                row.end_population,
                round(row.end_gdp_billion_eur, 6),
                round(row.average_unemployment_rate, 6),
                round(row.average_integration_index, 6),
                round(row.average_inflation_rate, 6),
                round(row.average_satisfaction_index, 6),
                round(row.election_tension_index, 6),
                round(row.election_alignment_index, 6),
                row.election_last_year,
                row.election_next_year,
            )
            for row in first_run
        ]
        second_signature = [
            (
                row.start_year,
                row.country_code,
                row.end_population,
                round(row.end_gdp_billion_eur, 6),
                round(row.average_unemployment_rate, 6),
                round(row.average_integration_index, 6),
                round(row.average_inflation_rate, 6),
                round(row.average_satisfaction_index, 6),
                round(row.election_tension_index, 6),
                round(row.election_alignment_index, 6),
                row.election_last_year,
                row.election_next_year,
            )
            for row in second_run
        ]
        self.assertEqual(first_signature, second_signature)

    def test_distinct_seeds_produce_distinct_paths_without_shocks(self) -> None:
        first_run = self.run_country_results("seed-alpha")
        second_run = self.run_country_results("seed-beta")
        first_signature = [
            (
                row.start_year,
                row.country_code,
                row.end_population,
                round(row.end_gdp_billion_eur, 6),
                round(row.average_unemployment_rate, 6),
                round(row.average_integration_index, 6),
                round(row.average_inflation_rate, 6),
                round(row.average_satisfaction_index, 6),
                round(row.election_tension_index, 6),
                round(row.election_alignment_index, 6),
                row.election_last_year,
                row.election_next_year,
            )
            for row in first_run
        ]
        second_signature = [
            (
                row.start_year,
                row.country_code,
                row.end_population,
                round(row.end_gdp_billion_eur, 6),
                round(row.average_unemployment_rate, 6),
                round(row.average_integration_index, 6),
                round(row.average_inflation_rate, 6),
                round(row.average_satisfaction_index, 6),
                round(row.election_tension_index, 6),
                round(row.election_alignment_index, 6),
                row.election_last_year,
                row.election_next_year,
            )
            for row in second_run
        ]
        self.assertNotEqual(first_signature, second_signature)


if __name__ == "__main__":
    unittest.main()
