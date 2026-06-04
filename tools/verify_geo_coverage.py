from pathlib import Path

from verify_common import fail


DATA_DIR = Path("dashboard/data")
EXPECTED_ADM0 = {
    "ALB",
    "BGR",
    "BIH",
    "HRV",
    "HUN",
    "MKD",
    "MNE",
    "ROU",
    "SRB",
    "XKX",
}
EXPECTED_ADM1 = {
    "ALB",
    "BGR",
    "BIH",
    "HRV",
    "HUN",
    "MKD",
    "MNE",
    "ROU",
    "SRB",
}
EXPECTED_EXTRA = {
    ("BIH", "ADM2"),
    ("BIH", "ADM3"),
    ("XKX", "ADM1"),
}


def expected_path(country_code: str, level: str) -> Path:
    return DATA_DIR / f"geoBoundaries-{country_code}-{level}_simplified.geojson"


def main() -> None:
    missing_adm0 = sorted(
        str(expected_path(country_code, "ADM0"))
        for country_code in EXPECTED_ADM0
        if not expected_path(country_code, "ADM0").exists()
    )
    if missing_adm0:
        fail(f"Missing ADM0 files: {missing_adm0}")

    missing_adm1 = sorted(
        str(expected_path(country_code, "ADM1"))
        for country_code in EXPECTED_ADM1
        if not expected_path(country_code, "ADM1").exists()
    )
    if missing_adm1:
        fail(f"Missing ADM1 files: {missing_adm1}")

    missing_extra = sorted(
        str(expected_path(country_code, level))
        for country_code, level in EXPECTED_EXTRA
        if not expected_path(country_code, level).exists()
    )
    if missing_extra:
        fail(f"Missing extra subdivision files: {missing_extra}")

    print("[OK] ADM0 coverage exists for all public map countries plus XKX overlay scope.")
    print("[OK] ADM1 coverage exists for ALB, BGR, BIH, HRV, HUN, MKD, MNE, ROU, and SRB.")
    print("[OK] XKX ADM1 exists, so Kosovo can render real district inner lines inside SRB scope.")
    print("[OK] BIH ADM2 and ADM3 exist, so Bosnia can render cantons in FBiH and finer municipal inner lines in RS scope.")


if __name__ == "__main__":
    main()
