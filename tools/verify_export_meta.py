from pathlib import Path

from verify_common import fail, load_latest_export, read_json_file


def main() -> None:
    scenarios_path = Path("data/scenarios.json")
    export_data = load_latest_export()
    scenarios = read_json_file(scenarios_path, "Missing data/scenarios.json.")

    scenario_map = {
        str(item["code"]): item
        for item in scenarios
        if isinstance(item, dict) and "code" in item
    }
    if not scenario_map:
        fail("No scenarios found in data/scenarios.json.")

    meta = export_data.get("meta")
    if not isinstance(meta, dict):
        fail("Missing export meta object.")

    scenario_meta = meta.get("scenario")
    if not isinstance(scenario_meta, dict):
        fail("Missing meta.scenario object.")

    scenario_code = str(scenario_meta.get("code", "")).strip()
    scenario_name = str(scenario_meta.get("name", "")).strip()
    variation_seed = str(scenario_meta.get("variation_seed", "")).strip()

    if not scenario_code:
        fail("meta.scenario.code is empty.")
    if scenario_code not in scenario_map:
        fail(f"meta.scenario.code '{scenario_code}' not found in scenarios.json.")
    expected_name = str(scenario_map[scenario_code].get("name", "")).strip()
    if scenario_name != expected_name:
        fail(
            f"meta.scenario.name mismatch for '{scenario_code}': "
            f"got '{scenario_name}', expected '{expected_name}'."
        )
    if not variation_seed:
        fail("meta.scenario.variation_seed is empty.")

    start_year = meta.get("start_year")
    end_year = meta.get("end_year")
    years = export_data.get("years")
    if not isinstance(years, dict) or not years:
        fail("Export has no year buckets.")

    expected_bucket_count = int(end_year) - int(start_year)
    if expected_bucket_count <= 0:
        fail(f"Invalid year range in meta: start={start_year}, end={end_year}.")
    if len(years) != expected_bucket_count:
        fail(
            "Year bucket count mismatch: "
            f"meta expects {expected_bucket_count}, export has {len(years)}."
        )

    warning_count = meta.get("warning_count")
    if not isinstance(warning_count, int) or warning_count < 0:
        fail(f"Invalid warning_count: {warning_count!r}")

    state_model_meta = meta.get("state_model")
    if not isinstance(state_model_meta, dict):
        fail("Missing meta.state_model object.")
    if str(state_model_meta.get("phase", "")).strip() != "8.1":
        fail(f"Unexpected state_model phase: {state_model_meta!r}")
    if not str(state_model_meta.get("version", "")).strip():
        fail("meta.state_model.version is empty.")

    print("[OK] Scenario metadata is consistent with data/scenarios.json.")
    print(
        f"[OK] variation_seed='{variation_seed}', year buckets={len(years)}, "
        f"warning_count={warning_count}."
    )


if __name__ == "__main__":
    main()
