from verify_common import (
    fail,
    load_latest_export,
    parse_year_bucket_start,
    read_json_file,
)
from pathlib import Path


def expected_country_codes() -> set[str]:
    country_data = read_json_file(Path("data/countries.json"))
    if not isinstance(country_data, list) or not country_data:
        fail("data/countries.json must contain a non-empty list.")
    codes = {str(entry.get("code", "")).upper() for entry in country_data}
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

        for row in regions:
            if int(row.get("start_year", -1)) != start_year:
                fail(f"{year_key}: region row start_year mismatch.")
            if int(row.get("end_year", -1)) != start_year + 1:
                fail(f"{year_key}: region row end_year mismatch.")

    print(f"[OK] Year buckets validated: {len(sorted_keys)} contiguous buckets.")
    print("[OK] Country/region rows are aligned to their active year bucket.")


if __name__ == "__main__":
    main()
