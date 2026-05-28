import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from besp.loader import load_shocks
from besp.simulation import (
    MAX_SHOCK_EVENTS_PER_CATEGORY_COUNTRY_YEAR,
    MAX_SHOCK_EVENTS_PER_COUNTRY_YEAR,
)
from verify_common import fail, load_latest_export


def main() -> None:
    export_data = load_latest_export()
    shock_events = export_data.get("shock_events", [])
    meta_shocks = export_data.get("meta", {}).get("shocks", {})
    shocks_enabled = bool(meta_shocks.get("enabled", True))
    event_count = int(meta_shocks.get("event_count", -1))

    if event_count != len(shock_events):
        fail(
            f"meta.shocks.event_count mismatch: {event_count} vs {len(shock_events)}."
        )
    if not shocks_enabled and shock_events:
        fail("meta.shocks.enabled is false but shock_events are present.")

    by_country_year: dict[tuple[str, int], list[dict]] = {}
    by_country_shock_years: dict[tuple[str, str], list[int]] = {}
    shock_definitions = {shock.code: shock for shock in load_shocks("data/shocks.json")}

    for event in shock_events:
        country_code = str(event.get("country_code"))
        start_year = int(event.get("start_year"))
        end_year = int(event.get("end_year"))
        shock_code = str(event.get("shock_code"))
        category = str(event.get("category"))
        severity = float(event.get("severity_scale", 0.0))
        probability_applied = float(event.get("probability_applied", -1.0))

        if severity <= 0.0:
            fail(
                f"Invalid severity_scale for {country_code}/{shock_code}/{start_year}: {severity}"
            )
        if end_year != start_year + 1:
            fail(
                f"Invalid year span for {country_code}/{shock_code}: {start_year}->{end_year}"
            )
        if probability_applied < 0.0 or probability_applied > 0.75:
            fail(
                f"Invalid probability_applied for {country_code}/{shock_code}/{start_year}: {probability_applied}"
            )
        shock_definition = shock_definitions.get(shock_code)
        if shock_definition is None:
            fail(f"Unknown shock_code in export: {shock_code}")
        if category != shock_definition.category:
            fail(
                f"Category mismatch for {shock_code}: export={category}, "
                f"definition={shock_definition.category}."
            )
        if probability_applied > min(shock_definition.annual_probability * 2.0, 0.75):
            fail(
                f"Unexpectedly high probability_applied for {shock_code}: {probability_applied}"
            )
        severity_min = min(shock_definition.severity_min, shock_definition.severity_max)
        severity_max = max(shock_definition.severity_min, shock_definition.severity_max)
        if not (severity_min <= severity <= severity_max):
            fail(
                f"Severity out of definition bounds for {shock_code}: {severity} "
                f"not in [{severity_min}, {severity_max}]."
            )

        key = (country_code, start_year)
        by_country_year.setdefault(key, []).append(event)
        by_country_shock_years.setdefault((country_code, shock_code), []).append(start_year)

        category_count = sum(
            1
            for item in by_country_year[key]
            if str(item.get("category")) == category
        )
        if category_count > MAX_SHOCK_EVENTS_PER_CATEGORY_COUNTRY_YEAR:
            fail(
                f"Category cap violated for {country_code} {start_year}: "
                f"{category_count} '{category}' shocks."
            )

    for (country_code, start_year), events in by_country_year.items():
        if len(events) > MAX_SHOCK_EVENTS_PER_COUNTRY_YEAR:
            fail(
                f"Country-year cap violated for {country_code} {start_year}: "
                f"{len(events)} shocks."
            )

    cooldown_map = {
        shock.code: max(shock.cooldown_years, 0)
        for shock in shock_definitions.values()
    }
    for (country_code, shock_code), years in by_country_shock_years.items():
        cooldown = cooldown_map.get(shock_code, 0)
        if cooldown <= 0:
            continue

        sorted_years = sorted(years)
        for previous, current in zip(sorted_years, sorted_years[1:]):
            if (current - previous) <= cooldown:
                fail(
                    f"Cooldown violated for {country_code}/{shock_code}: "
                    f"{previous} then {current} (cooldown {cooldown})."
                )

    print(f"[OK] Shock events validated: {len(shock_events)} events.")
    print(
        f"[OK] Caps respected ({MAX_SHOCK_EVENTS_PER_COUNTRY_YEAR}/country-year, "
        f"{MAX_SHOCK_EVENTS_PER_CATEGORY_COUNTRY_YEAR}/category-country-year)."
    )


if __name__ == "__main__":
    main()
