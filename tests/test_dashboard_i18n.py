import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class DashboardI18nTests(unittest.TestCase):
    def test_dashboard_has_language_toggle_and_core_translations(self) -> None:
        html = (PROJECT_ROOT / "dashboard" / "index.html").read_text(encoding="utf-8")
        app_js = (PROJECT_ROOT / "dashboard" / "app.js").read_text(encoding="utf-8")

        self.assertIn('id="language-en"', html)
        self.assertIn('id="language-de"', html)
        self.assertIn("const I18N", app_js)
        self.assertIn("en:", app_js)
        self.assertIn("de:", app_js)

        for key in [
            "mode.countries",
            "mode.regions",
            "mode.borders",
            "event.regions",
            "metric.current",
            "editor.chooseCountry",
        ]:
            self.assertIn(key, app_js)


if __name__ == "__main__":
    unittest.main()
