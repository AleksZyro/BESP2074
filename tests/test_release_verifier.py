import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class ReleaseVerifierTests(unittest.TestCase):
    def test_release_verifier_runs_core_checks(self) -> None:
        verifier = (PROJECT_ROOT / "tools" / "verify_release_ready.py").read_text(encoding="utf-8")

        self.assertIn("EXPECTED_END_YEAR = 2074", verifier)
        self.assertIn("python, \"-m\", \"pytest\"", verifier)
        self.assertIn("\"dashboard/app.js\"", verifier)
        self.assertIn("\"dashboard/config.js\"", verifier)
        self.assertIn("\"dashboard/editor.js\"", verifier)
        self.assertIn("\"main.py\", \"--scenario\", \"baseline\"", verifier)

        for script_name in [
            "verify_export_year_state.py",
            "verify_state_dynamics.py",
            "verify_export_meta.py",
            "verify_geo_coverage.py",
            "verify_geo_name_normalization.py",
        ]:
            self.assertIn(script_name, verifier)


if __name__ == "__main__":
    unittest.main()
