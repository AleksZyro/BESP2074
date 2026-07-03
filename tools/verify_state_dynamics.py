from verify_common import fail, load_latest_export, parse_year_bucket_start


STATE_LIMITS = {
    "budget_balance_pct_gdp": (-0.12, 0.06, 0.035),
    "debt_to_gdp": (0.15, 1.50, 0.06),
    "stability_index": (0.20, 0.95, 0.08),
    "corruption_index": (0.15, 0.95, 0.07),
    "investment_climate_index": (0.15, 0.95, 0.08),
}


def main() -> None:
    export_data = load_latest_export()
    years = export_data.get("years")
    if not isinstance(years, dict) or not years:
        fail("Export has no year buckets.")

    sorted_year_keys = sorted(years.keys(), key=parse_year_bucket_start)
    previous_by_country: dict[str, dict[str, float]] = {}

    for year_key in sorted_year_keys:
        countries = years.get(year_key, {}).get("countries")
        if not isinstance(countries, list):
            fail(f"{year_key}: countries must be a list.")

        for row in countries:
            country_code = str(row.get("country_code", "")).strip()
            if not country_code:
                fail(f"{year_key}: country row without country_code.")

            for field_name, (minimum, maximum, max_delta) in STATE_LIMITS.items():
                raw_value = row.get(field_name)
                if raw_value is None:
                    fail(f"{year_key}/{country_code}: missing field '{field_name}'.")
                try:
                    value = float(raw_value)
                except (TypeError, ValueError):
                    fail(f"{year_key}/{country_code}: invalid float in '{field_name}': {raw_value!r}")

                if not (minimum <= value <= maximum):
                    fail(
                        f"{year_key}/{country_code}: {field_name}={value:.4f} outside "
                        f"[{minimum:.4f}, {maximum:.4f}]."
                    )

                previous = previous_by_country.get(country_code, {})
                if field_name in previous:
                    delta = abs(value - previous[field_name])
                    if delta > max_delta:
                        fail(
                            f"{year_key}/{country_code}: {field_name} delta too large ({delta:.4f}), "
                            f"max allowed {max_delta:.4f}."
                        )

            previous_by_country[country_code] = {
                field: float(row[field])
                for field in STATE_LIMITS
            }

    print(f"[OK] State dynamics validated for {len(sorted_year_keys)} year buckets.")
    print("[OK] Bounds and yearly state-change limits are respected.")


if __name__ == "__main__":
    main()
