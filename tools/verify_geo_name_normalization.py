import re
import unicodedata
from pathlib import Path

from verify_common import fail, read_json_file


MOJIBAKE_REPLACEMENTS = (
    ("\u00C3\u00AB", "\u00EB"),
    ("\u00C3\u00A7", "\u00E7"),
    ("\u00C4\u008D", "\u010D"),
    ("\u00C3\u00A1", "\u00E1"),
    ("\u00C3\u00A2", "\u00E2"),
    ("\u00C3\u00A9", "\u00E9"),
    ("\u00C3\u00AD", "\u00ED"),
    ("\u00C3\u00B3", "\u00F3"),
    ("\u00C3\u00B6", "\u00F6"),
    ("\u00C3\u00BA", "\u00FA"),
    ("\u00C3\u00BC", "\u00FC"),
    ("\u00C5\u0091", "\u0151"),
    ("\u00C5\u00B1", "\u0171"),
)

REGION_NAME_ALIASES = {
    "brcko district": "brcko",
    "tirane": "tirana",
}

EXPECTED_ALB_NAMES = {
    "berat",
    "diber",
    "durres",
    "elbasan",
    "fier",
    "gjirokaster",
    "korce",
    "kukes",
    "lezhe",
    "shkoder",
    "tirana",
    "vlore",
}

EXPECTED_BIH_NAMES = {
    "brcko",
    "federation of bosnia and herzegovina",
    "republika srpska",
}


def repair_region_text_mojibake(region_name: str) -> str:
    repaired = str(region_name)
    for broken, fixed in MOJIBAKE_REPLACEMENTS:
        repaired = repaired.replace(broken, fixed)
    return repaired


def normalize_region_name(region_name: str) -> str:
    repaired = repair_region_text_mojibake(region_name)
    compact = unicodedata.normalize("NFKD", repaired)
    compact = "".join(char for char in compact if not unicodedata.combining(char))
    compact = compact.strip().lower().replace("&", " and ")
    compact = re.sub(r"[^a-z0-9 ]+", " ", compact)
    compact = re.sub(r"\s+", " ", compact).strip()
    return REGION_NAME_ALIASES.get(compact, compact)


def normalized_feature_names(path: Path) -> set[str]:
    geojson = read_json_file(path, f"Missing GeoJSON file: {path}")
    features = geojson.get("features")
    if not isinstance(features, list) or not features:
        fail(f"GeoJSON file has no features: {path}")
    return {
        normalize_region_name(feature.get("properties", {}).get("shapeName", ""))
        for feature in features
    }


def main() -> None:
    alb_path = Path("dashboard/data/geoBoundaries-ALB-ADM1_simplified.geojson")
    bih_path = Path("dashboard/data/geoBoundaries-BIH-ADM1_simplified.geojson")

    normalized_alb = normalized_feature_names(alb_path)
    normalized_bih = normalized_feature_names(bih_path)

    if normalized_alb != EXPECTED_ALB_NAMES:
        fail(
            "ALB ADM1 normalized-name mismatch. "
            f"Missing: {EXPECTED_ALB_NAMES - normalized_alb}. "
            f"Extra: {normalized_alb - EXPECTED_ALB_NAMES}."
        )

    if normalized_bih != EXPECTED_BIH_NAMES:
        fail(
            "BIH ADM1 normalized-name mismatch. "
            f"Missing: {EXPECTED_BIH_NAMES - normalized_bih}. "
            f"Extra: {normalized_bih - EXPECTED_BIH_NAMES}."
        )

    print("[OK] Geo name normalization matches the expected ALB and BIH ADM1 sets.")
    print(f"[OK] ALB features: {len(normalized_alb)}, BIH features: {len(normalized_bih)}.")


if __name__ == "__main__":
    main()
