from pathlib import Path
from verify_common import fail, read_json_file


EXPECTED_COUNTRY_CODES = {"BIH", "MNE", "SRB"}
EXPECTED_REGIONS = {
    ("SRB", "Belgrade"),
    ("SRB", "Vojvodina"),
    ("SRB", "Central Serbia"),
    ("SRB", "South and East Serbia"),
    ("SRB", "Kosovo and Metohija"),
    ("MNE", "Coast"),
    ("MNE", "Inland"),
    ("BIH", "Federation of Bosnia and Herzegovina"),
    ("BIH", "Republika Srpska"),
    ("BIH", "Brcko"),
}

def main() -> None:
    fixture_path = Path("dashboard/fixtures/map_fixture_latest.json")
    fixture = read_json_file(fixture_path, f"Fixture file not found: {fixture_path}")

    years = fixture.get("years", {})
    if not years:
        fail("Fixture has no year buckets.")

    first_bucket = next(iter(years.values()))
    countries = first_bucket.get("countries", [])
    regions = first_bucket.get("regions", [])

    country_codes = {entry.get("country_code") for entry in countries}
    if country_codes != EXPECTED_COUNTRY_CODES:
        fail(f"Country code set mismatch. Got {country_codes}, expected {EXPECTED_COUNTRY_CODES}.")

    region_keys = {(entry.get("country_code"), entry.get("region_name")) for entry in regions}
    if region_keys != EXPECTED_REGIONS:
        missing = EXPECTED_REGIONS - region_keys
        extra = region_keys - EXPECTED_REGIONS
        fail(f"Region set mismatch. Missing: {missing}. Extra: {extra}.")

    print("[OK] Map fixture contains expected countries and regions.")
    print(f"[OK] Countries: {len(countries)} rows, Regions: {len(regions)} rows.")


if __name__ == "__main__":
    main()
