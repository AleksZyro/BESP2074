from verify_common import (
    fail,
    load_latest_export,
    parse_year_bucket_start,
    read_json_file,
)
from pathlib import Path


EXACT_INTEGER_FIELDS = [
    "start_population",
    "end_population",
    "births",
    "deaths",
    "natural_change",
    "net_external_migration",
    "internal_migration",
]
FLOAT_TOTAL_FIELDS = [
    "start_gdp_billion_eur",
    "end_gdp_billion_eur",
]


def expected_country_codes() -> set[str]:
    country_data = read_json_file(Path("data/countries.json"))
    if not isinstance(country_data, list) or not country_data:
        fail("data/countries.json must contain a non-empty list.")
    codes = {
        str(entry.get("code", "")).upper()
        for entry in country_data
        if bool(entry.get("enabled", True))
    }
    if "" in codes:
        fail("data/countries.json contains a country entry without a code.")
    return codes


def main() -> None:
    export_data = load_latest_export()
    expected_codes = expected_country_codes()
    years = export_data.get("years")
    if not isinstance(years, dict) or not years:
        fail("Export has no year buckets.")

    sorted_keys = sorted(years.keys(), key=parse_year_bucket_start)
    parsed_years = [parse_year_bucket_start(key) for key in sorted_keys]
    export_meta = export_data.get("meta", {})
    start_year_meta = int(export_meta.get("start_year", parsed_years[0]))
    baseline_year_meta = int(export_meta.get("baseline_year", parsed_years[0]))

    if parsed_years[0] != start_year_meta:
        fail(
            f"Export start_year mismatch. First bucket starts at {parsed_years[0]}, "
            f"meta.start_year={start_year_meta}."
        )
    if baseline_year_meta != parsed_years[0]:
        fail(
            f"Export baseline_year mismatch. First bucket starts at {parsed_years[0]}, "
            f"meta.baseline_year={baseline_year_meta}."
        )

    for previous, current in zip(parsed_years, parsed_years[1:]):
        if current != previous + 1:
            fail(f"Year bucket gap detected: {previous} -> {current}.")

    for year_key in sorted_keys:
        year_bucket = years.get(year_key, {})
        start_year = parse_year_bucket_start(year_key)
        countries = year_bucket.get("countries")
        regions = year_bucket.get("regions")

        if not isinstance(countries, list):
            fail(f"{year_key}: countries must be a list.")
        if not isinstance(regions, list):
            fail(f"{year_key}: regions must be a list.")
        if not countries:
            fail(f"{year_key}: countries list is empty.")
        if not regions:
            fail(f"{year_key}: regions list is empty.")

        seen_country_codes: set[str] = set()
        for row in countries:
            if int(row.get("start_year", -1)) != start_year:
                fail(f"{year_key}: country row start_year mismatch.")
            if int(row.get("end_year", -1)) != start_year + 1:
                fail(f"{year_key}: country row end_year mismatch.")
            code = str(row.get("country_code"))
            seen_country_codes.add(code)

        if seen_country_codes != expected_codes:
            fail(
                f"{year_key}: country code set mismatch. "
                f"Got {seen_country_codes}, expected {expected_codes}."
            )

        regions_by_country: dict[str, list[dict]] = {}
        for row in regions:
            if int(row.get("start_year", -1)) != start_year:
                fail(f"{year_key}: region row start_year mismatch.")
            if int(row.get("end_year", -1)) != start_year + 1:
                fail(f"{year_key}: region row end_year mismatch.")
            regions_by_country.setdefault(str(row.get("country_code")), []).append(row)

        for country_row in countries:
            code = str(country_row.get("country_code"))
            region_rows = regions_by_country.get(code, [])
            if not region_rows:
                fail(f"{year_key}: no region rows found for {code}.")
            for field_name in EXACT_INTEGER_FIELDS:
                country_value = int(country_row.get(field_name, 0))
                region_total = sum(int(region_row.get(field_name, 0)) for region_row in region_rows)
                if country_value != region_total:
                    fail(
                        f"{year_key}: {code} {field_name} mismatch. "
                        f"Country={country_value}, regions={region_total}."
                    )
            for field_name in FLOAT_TOTAL_FIELDS:
                country_value = float(country_row.get(field_name, 0.0))
                region_total = sum(float(region_row.get(field_name, 0.0)) for region_row in region_rows)
                if abs(country_value - region_total) > 1e-6:
                    fail(
                        f"{year_key}: {code} {field_name} mismatch. "
                        f"Country={country_value:.6f}, regions={region_total:.6f}."
                    )

    print(f"[OK] Year buckets validated: {len(sorted_keys)} contiguous buckets.")
    print("[OK] Export meta baseline/start year match the first simulated bucket.")
    print("[OK] Country/region rows are aligned to their active year bucket.")
    print("[OK] Country totals match summed region totals for every year bucket.")


if __name__ == "__main__":
    main()
