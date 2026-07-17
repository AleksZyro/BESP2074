import unittest
import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class DashboardEventOutlineTests(unittest.TestCase):
    def test_event_outlines_use_affected_subregion_overlays(self) -> None:
        app_js = (PROJECT_ROOT / "dashboard" / "app.js").read_text(encoding="utf-8")
        styles_css = (PROJECT_ROOT / "dashboard" / "styles.css").read_text(encoding="utf-8")

        self.assertIn("function isFeatureAffectedByEvent", app_js)
        self.assertIn("function buildActiveEventOutlineMarkup", app_js)
        self.assertIn("function buildEventAffectedFeatureMarkup", app_js)
        self.assertIn("function resolveEventLetterPlacements", app_js)
        self.assertIn("groupsByCountry", app_js)
        self.assertIn("data-event-country", app_js)
        self.assertIn("elements.mapEventLayer.innerHTML = eventOutlineMarkup + eventLetterMarkup", app_js)
        self.assertIn("map-event-feature-outline", app_js)
        self.assertIn(".map-event-feature-outline", styles_css)

    def test_greece_peloponnese_event_key_matches_export_key(self) -> None:
        app_js = (PROJECT_ROOT / "dashboard" / "app.js").read_text(encoding="utf-8")
        config_js = (PROJECT_ROOT / "dashboard" / "config.js").read_text(encoding="utf-8")
        regions = json.loads((PROJECT_ROOT / "data" / "regions.json").read_text(encoding="utf-8"))
        peloponnese = next(
            region
            for region in regions
            if region["country_code"] == "GRC" and region["name"] == "Peloponisos-W. Greece & Ionian"
        )

        self.assertEqual(peloponnese["name"], "Peloponisos-W. Greece & Ionian")
        self.assertIn('"GRC::peloponisos w greece ionian"', app_js)
        self.assertIn('"GRC::peloponisos w greece ionian"', config_js)
        self.assertNotIn('"GRC::peloponisos w greece and ionian"', app_js)
        self.assertNotIn('"GRC::peloponisos w greece and ionian"', config_js)


if __name__ == "__main__":
    unittest.main()
