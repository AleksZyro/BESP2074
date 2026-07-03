from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
EXPECTED_END_YEAR = 2074
RELEASE_SEED = "release-check"


def run_step(label: str, command: list[str]) -> None:
    print()
    print(f"[RUN] {label}")
    print(" ".join(command))
    result = subprocess.run(command, cwd=PROJECT_ROOT)
    if result.returncode != 0:
        raise SystemExit(f"[FAIL] {label} failed with exit code {result.returncode}.")
    print(f"[OK] {label}")


def require_node() -> str:
    node_path = shutil.which("node")
    if not node_path:
        raise SystemExit("[FAIL] Node.js was not found on PATH.")
    return node_path


def verify_latest_export_meta() -> None:
    latest_path = PROJECT_ROOT / "output" / "latest.json"
    if not latest_path.exists():
        raise SystemExit("[FAIL] output/latest.json is missing after the simulation run.")
    export_data = json.loads(latest_path.read_text(encoding="utf-8"))
    meta = export_data.get("meta", {})
    end_year = int(meta.get("end_year", 0))
    if end_year != EXPECTED_END_YEAR:
        raise SystemExit(f"[FAIL] Expected export end_year {EXPECTED_END_YEAR}, got {end_year}.")
    years = export_data.get("years", {})
    expected_bucket_count = end_year - int(meta.get("start_year", end_year))
    if len(years) != expected_bucket_count:
        raise SystemExit(
            f"[FAIL] Expected {expected_bucket_count} year buckets, got {len(years)}."
        )
    print()
    print(
        f"[OK] latest export covers {meta.get('start_year')}->{end_year} "
        f"with {len(years)} year buckets and {meta.get('shocks', {}).get('event_count')} events."
    )


def main() -> None:
    node = require_node()
    python = sys.executable

    run_step("Python test suite", [python, "-m", "pytest"])
    run_step("Dashboard app syntax", [node, "--check", "dashboard/app.js"])
    run_step("Dashboard config syntax", [node, "--check", "dashboard/config.js"])
    run_step("Dashboard editor syntax", [node, "--check", "dashboard/editor.js"])
    run_step(
        "Baseline export generation",
        [python, "main.py", "--scenario", "baseline", "--seed", RELEASE_SEED],
    )
    verify_latest_export_meta()

    for script_name in [
        "verify_export_year_state.py",
        "verify_state_dynamics.py",
        "verify_export_meta.py",
        "verify_geo_coverage.py",
        "verify_geo_name_normalization.py",
    ]:
        run_step(script_name, [python, str(Path("tools") / script_name)])

    print()
    print("[OK] BESP2074 release checks completed.")


if __name__ == "__main__":
    main()
