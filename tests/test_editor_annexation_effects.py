import json
import tempfile
import unittest
from pathlib import Path

from besp.loader import apply_editor_annexation_effects, load_scenario_map, load_world
from besp.simulation import simulate_period
from main import resolve_simulation_year_window


def find_region_result(region_results, country_code: str, region_name: str):
    for result in region_results:
        if result.country_code == country_code and result.region_name == region_name:
            return result
    raise AssertionError(f"Missing result for {country_code}::{region_name}")


class EditorAnnexationEffectsTests(unittest.TestCase):
    def test_editor_assignment_moves_region_into_target_country_simulation(self) -> None:
        countries = load_world("data")
        assignment_payload = {
            "overrides": {
                "region:BIH:ADM2:republika-srpska": {
                    "targetCountryCode": "SRB",
                    "sourceBespRegionKeys": ["BIH::republika srpska"],
                    "targetBespRegionKey": "BIH::republika srpska",
                },
            },
        }

        with tempfile.TemporaryDirectory() as tmp_dir:
            assignments_path = Path(tmp_dir) / "map_assignments.json"
            assignments_path.write_text(
                json.dumps(assignment_payload),
                encoding="utf-8",
            )
            apply_editor_annexation_effects(countries, assignments_path)

        serbia = next(country for country in countries if country.code == "SRB")
        bosnia = next(country for country in countries if country.code == "BIH")
        annexed_region = next(
            region for region in serbia.regions
            if region.name == "Republika Srpska"
        )

        self.assertEqual(annexed_region.country_code, "SRB")
        self.assertNotIn(
            "Republika Srpska",
            {region.name for region in bosnia.regions},
        )
        self.assertGreater(annexed_region.annexation_pressure_years_remaining, 0)
        self.assertLess(annexed_region.annexation_satisfaction_penalty, 0)
        self.assertLessEqual(annexed_region.annexation_integration_penalty, 0)

    def test_targeted_affinity_examples_help_aligned_annexations_beyond_serbia(self) -> None:
        countries = load_world("data")
        assignment_payload = {
            "overrides": {
                "region:MKD:ADM1:western-north-macedonia": {
                    "targetCountryCode": "ALB",
                    "sourceBespRegionKeys": ["MKD::western north macedonia"],
                    "targetBespRegionKey": "MKD::western north macedonia",
                },
            },
        }

        with tempfile.TemporaryDirectory() as tmp_dir:
            assignments_path = Path(tmp_dir) / "map_assignments.json"
            assignments_path.write_text(
                json.dumps(assignment_payload),
                encoding="utf-8",
            )
            apply_editor_annexation_effects(countries, assignments_path)

        albania = next(country for country in countries if country.code == "ALB")
        annexed_region = next(
            region for region in albania.regions
            if region.name == "Western North Macedonia"
        )

        self.assertEqual(annexed_region.country_code, "ALB")
        self.assertLess(annexed_region.annexation_satisfaction_penalty, 0)
        self.assertLessEqual(annexed_region.annexation_integration_penalty, 0)

    def test_annexed_region_uses_target_country_dynamics_in_same_run(self) -> None:
        start_year, _end_year = resolve_simulation_year_window("data")
        scenario = load_scenario_map("data")["baseline"]

        baseline_countries = load_world("data")
        baseline_results, _ = simulate_period(
            baseline_countries,
            start_year,
            start_year + 1,
            scenario=scenario,
            variation_seed="annexation-comparison",
            shock_definitions=[],
        )
        baseline_rs = find_region_result(
            baseline_results,
            "BIH",
            "Republika Srpska",
        )

        annexed_countries = load_world("data")
        source_country = next(country for country in annexed_countries if country.code == "BIH")
        target_country = next(country for country in annexed_countries if country.code == "SRB")
        source_inflation_rate = source_country.baseline_inflation_rate
        target_inflation_rate = target_country.baseline_inflation_rate
        source_unemployment_rate = source_country.baseline_unemployment_rate
        target_unemployment_rate = target_country.baseline_unemployment_rate
        assignment_payload = {
            "overrides": {
                "region:BIH:ADM2:republika-srpska": {
                    "targetCountryCode": "SRB",
                    "sourceBespRegionKeys": ["BIH::republika srpska"],
                    "targetBespRegionKey": "BIH::republika srpska",
                },
            },
        }

        with tempfile.TemporaryDirectory() as tmp_dir:
            assignments_path = Path(tmp_dir) / "map_assignments.json"
            assignments_path.write_text(
                json.dumps(assignment_payload),
                encoding="utf-8",
            )
            apply_editor_annexation_effects(annexed_countries, assignments_path)
        annexed_serbia = next(country for country in annexed_countries if country.code == "SRB")
        initial_annexed_rs = next(
            region for region in annexed_serbia.regions
            if region.name == "Republika Srpska"
        )
        initial_annexed_unemployment = initial_annexed_rs.unemployment_rate

        annexed_results, _ = simulate_period(
            annexed_countries,
            start_year,
            start_year + 1,
            scenario=scenario,
            variation_seed="annexation-comparison",
            shock_definitions=[],
        )
        annexed_rs = find_region_result(
            annexed_results,
            "SRB",
            "Republika Srpska",
        )

        self.assertNotEqual(baseline_rs.country_code, annexed_rs.country_code)
        self.assertNotEqual(
            round(baseline_rs.integration_index, 6),
            round(annexed_rs.integration_index, 6),
        )
        self.assertNotEqual(
            round(baseline_rs.satisfaction_index, 6),
            round(annexed_rs.satisfaction_index, 6),
        )
        self.assertGreater(
            annexed_rs.satisfaction_index,
            baseline_rs.satisfaction_index,
        )
        self.assertNotEqual(
            round(baseline_rs.inflation_rate, 6),
            round(annexed_rs.inflation_rate, 6),
        )
        self.assertLess(
            abs(annexed_rs.inflation_rate - source_inflation_rate),
            abs(annexed_rs.inflation_rate - target_inflation_rate),
        )
        self.assertLess(
            abs(annexed_rs.unemployment_rate - source_unemployment_rate),
            abs(annexed_rs.unemployment_rate - target_unemployment_rate),
        )
        self.assertLessEqual(
            abs(annexed_rs.unemployment_rate - initial_annexed_unemployment),
            0.0101,
        )


if __name__ == "__main__":
    unittest.main()
