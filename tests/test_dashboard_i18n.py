import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class DashboardI18nTests(unittest.TestCase):
    def test_dashboard_has_language_toggle_and_core_translations(self) -> None:
        html = (PROJECT_ROOT / "dashboard" / "index.html").read_text(encoding="utf-8")
        app_js = (PROJECT_ROOT / "dashboard" / "app.js").read_text(encoding="utf-8")

        self.assertIn('id="language-en"', html)
        self.assertIn('id="language-de"', html)
        self.assertIn('id="theme-toggle"', html)
        self.assertIn("language-flag-gb", html)
        self.assertIn("language-flag-de", html)
        self.assertNotIn("BESP Phase", html)
        self.assertNotIn("prepared for Slovenia and Greece", html)
        self.assertNotIn("🇨🇭", html)
        self.assertIn("const I18N", app_js)
        self.assertIn("COUNTRY_NAME_TRANSLATIONS", app_js)
        self.assertIn("Bosnien und Herzegowina", app_js)
        self.assertIn("Rumänien", app_js)
        self.assertIn("Eastern Macedonia", app_js)
        self.assertIn("Ostmazedonien", app_js)
        self.assertNotIn("Southeastern Macedonia", app_js)
        self.assertIn("en:", app_js)
        self.assertIn("de:", app_js)
        self.assertIn("function applyTheme", app_js)

        for key in [
            "mode.countries",
            "mode.regions",
            "mode.borders",
            "event.regions",
            "metric.current",
            "editor.chooseCountry",
            "meta.selectedYear",
            "meta.countryRows",
            "state.budget",
            "state.debt",
            "status.latestBatch",
            "status.batchReady",
            "status.serviceLost",
        ]:
            self.assertIn(key, app_js)


if __name__ == "__main__":
    unittest.main()
