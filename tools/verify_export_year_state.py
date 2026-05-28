import json
from pathlib import Path


EXPECTED_COUNTRY_CODES = {"BIH", "MNE", "SRB"}


def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    raise SystemExit(1)


def parse_start_year(year_key: str) -> int:
    try:
        return int(year_key.split("-", 1)[0])
    except (TypeError, ValueError, AttributeError):
        fail(f"Invalid year bucket key format: {year_key!r}")
    raise AssertionError("unreachable")


def main() -> None:
    export_path = Path("output/latest.json")
    if not export_path.exists():
        fail("Missing output/latest.json. Run `py main.py` first.")

    with export_path.open("r", encoding="utf-8") as handle:
        export_data = json.load(handle)

    years = export_data.get("years")
    if not isinstance(years, dict) or not years:
        fail("Export has no year buckets.")

    sorted_keys = sorted(years.keys(), key=parse_start_year)
    parsed_years = [parse_start_year(key) for key in sorted_keys]
    for previous, current in zip(parsed_years, parsed_years[1:]):
        if current != previous + 1:
            fail(f"Year bucket gap detected: {previous} -> {current}.")

    for year_key in sorted_keys:
        year_bucket = years.get(year_key, {})
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
            if int(row.get("start_year", -1)) != parse_start_year(year_key):
                fail(f"{year_key}: country row start_year mismatch.")
            if int(row.get("end_year", -1)) != parse_start_year(year_key) + 1:
                fail(f"{year_key}: country row end_year mismatch.")
            code = str(row.get("country_code"))
            seen_country_codes.add(code)

        if seen_country_codes != EXPECTED_COUNTRY_CODES:
            fail(
                f"{year_key}: country code set mismatch. "
                f"Got {seen_country_codes}, expected {EXPECTED_COUNTRY_CODES}."
            )

        for row in regions:
            if int(row.get("start_year", -1)) != parse_start_year(year_key):
                fail(f"{year_key}: region row start_year mismatch.")
            if int(row.get("end_year", -1)) != parse_start_year(year_key) + 1:
                fail(f"{year_key}: region row end_year mismatch.")

    print(f"[OK] Year buckets validated: {len(sorted_keys)} contiguous buckets.")
    print("[OK] Country/region rows are aligned to their active year bucket.")


if __name__ == "__main__":
    main()
