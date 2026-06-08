from pathlib import Path

from verify_common import fail


DATA_DIR = Path("dashboard/data")
EXPECTED_ADM0 = {
    "ALB",
    "BGR",
    "BIH",
    "GRC",
    "HRV",
    "HUN",
    "MKD",
    "MNE",
    "ROU",
    "SRB",
    "SVN",
    "XKX",
}
EXPECTED_ADM1 = {
    "ALB",
    "BGR",
    "BIH",
    "GRC",
    "HRV",
    "HUN",
    "MKD",
    "MNE",
    "ROU",
    "SRB",
    "SVN",
}
EXPECTED_EXTRA = {
    ("BIH", "ADM2"),
    ("BIH", "ADM3"),
    ("GRC", "ADM2"),
    ("XKX", "ADM1"),
}
EXPECTED_CUSTOM_FILES = {
    "gisco-SVN-NUTS3-2021_simplified.geojson",
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
    missing_custom = sorted(
        file_name for file_name in EXPECTED_CUSTOM_FILES if not (DATA_DIR / file_name).exists()
    )
    if missing_custom:
        fail(f"Missing custom subdivision files: {missing_custom}")

    print("[OK] ADM0 coverage exists for all public map countries plus XKX overlay scope.")
    print("[OK] ADM1 coverage exists for ALB, BGR, BIH, GRC, HRV, HUN, MKD, MNE, ROU, SRB, and SVN.")
    print("[OK] XKX ADM1 exists, so Kosovo can render real district inner lines inside SRB scope.")
    print("[OK] BIH ADM2 and ADM3 exist, so Bosnia can render cantons in FBiH and finer municipal inner lines in RS scope.")
    print("[OK] GRC ADM2 exists, so Greece can render real regional underlines inside macroregions.")
    print("[OK] SVN NUTS3 exists, so Slovenia can render real statistical underlines inside macroregions.")


if __name__ == "__main__":
    main()
