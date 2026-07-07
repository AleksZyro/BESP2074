import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from tools import local_run_service


def build_sample_export() -> dict:
    return {
        "meta": {
            "start_year": 2024,
            "end_year": 2026,
            "scenario": {
                "code": "baseline",
                "name": "Baseline continuity",
                "variation_seed": "unit-seed",
            },
            "shocks": {"enabled": True, "event_count": 1},
        },
        "shock_events": [
            {
                "start_year": 2024,
                "end_year": 2025,
                "country_code": "SRB",
                "shock_name": "Test shock",
                "message": "Serbia reports a test shock",
            }
        ],
        "years": {
            "2024-2025": {
                "countries": [
                    {
                        "country_code": "SRB",
                        "country_name": "Serbia",
                        "end_population": 6500000,
                        "end_gdp_billion_eur": 84.5,
                        "gdp_growth_rate": 0.015,
                        "average_unemployment_rate": 0.07,
                        "budget_balance_pct_gdp": -0.02,
                        "debt_to_gdp": 0.52,
                        "stability_index": 0.61,
                        "corruption_index": 0.48,
                        "investment_climate_index": 0.56,
                    }
                ],
                "regions": [
                    {
                        "country_code": "SRB",
                        "region_name": "Belgrade",
                        "end_population": 1700000,
                        "end_gdp_billion_eur": 30.0,
                        "unemployment_rate": 0.05,
                    }
                ],
            },
            "2025-2026": {
                "countries": [
                    {
                        "country_code": "ALB",
                        "country_name": "Albania",
                        "end_population": 2370000,
                        "end_gdp_billion_eur": 25.2,
                        "gdp_growth_rate": 0.026,
                        "average_unemployment_rate": 0.105,
                    }
                ],
                "regions": [
                    {
                        "country_code": "ALB",
                        "region_name": "Central Albania",
                        "end_population": 1200000,
                        "end_gdp_billion_eur": 14.0,
                        "unemployment_rate": 0.09,
                    }
                ],
            },
        },
    }


class LocalRunServiceReportTests(unittest.TestCase):
    def test_report_filters_years_and_countries_only(self) -> None:
        report = local_run_service.build_run_report_text(
            build_sample_export(),
            start_year=2025,
            end_year=2026,
            detail=local_run_service.REPORT_DETAIL_COUNTRIES,
        )

        self.assertIn("Year 2025-2026", report)
        self.assertIn("ALB | Albania", report)
        self.assertNotIn("Year 2024-2025", report)
        self.assertNotIn("Central Albania", report)

    def test_report_can_include_regions_events_and_state(self) -> None:
        report = local_run_service.build_run_report_text(
            build_sample_export(),
            start_year=2024,
            end_year=2025,
            detail=local_run_service.REPORT_DETAIL_COUNTRIES_REGIONS,
            include_events=True,
            include_state=True,
        )

        self.assertIn("Regions", report)
        self.assertIn("Belgrade", report)
        self.assertIn("state: budget -2.0%", report)
        self.assertIn("corruption 48.0%", report)
        self.assertIn("Shock / event letters", report)
        self.assertIn("Test shock", report)

    def test_delete_current_run_removes_latest_export(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            latest_path = Path(temp_dir) / "latest.json"
            latest_path.write_text(json.dumps(build_sample_export()), encoding="utf-8")
            manager = local_run_service.RunManager()

            with patch.object(local_run_service, "LATEST_EXPORT_PATH", latest_path):
                status = manager.clear_current_run()

            self.assertFalse(latest_path.exists())
            self.assertEqual(status["state"], "idle")
            self.assertEqual(status["recent_runs"], [])

    def test_load_latest_export_reports_missing_run(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            missing_path = Path(temp_dir) / "latest.json"
            with self.assertRaises(FileNotFoundError):
                local_run_service.load_latest_export(missing_path)

    def test_cors_origin_is_limited_to_local_browser_origins(self) -> None:
        self.assertEqual(
            local_run_service.allowed_cors_origin("http://127.0.0.1:8011"),
            "http://127.0.0.1:8011",
        )
        self.assertEqual(
            local_run_service.allowed_cors_origin("http://localhost:8011"),
            "http://localhost:8011",
        )
        self.assertEqual(local_run_service.allowed_cors_origin("https://example.com"), "")
        self.assertEqual(local_run_service.allowed_cors_origin("http://localhost.evil:8011"), "")
        self.assertEqual(local_run_service.allowed_cors_origin("http://localhost:not-a-port"), "")
        self.assertEqual(local_run_service.allowed_cors_origin(""), "")


if __name__ == "__main__":
    unittest.main()
