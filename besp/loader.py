import json
from collections import Counter
from pathlib import Path

from besp.baseline import align_country_baselines
from besp.models import Country, Region, ShockDefinition, SimulationScenario

DEFAULT_MAP_ASSIGNMENTS_PATH = Path("dashboard") / "data" / "map_assignments.json"
ANNEXATION_EFFECT_YEARS = 6
ANNEXATION_BASE_SATISFACTION_PENALTY = 0.06
ANNEXATION_MAX_SATISFACTION_PENALTY = 0.18
ANNEXATION_BASE_INTEGRATION_PENALTY = 0.04
ANNEXATION_MAX_INTEGRATION_PENALTY = 0.12


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def load_json(path: str | Path) -> list[dict]:
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_regions(path: str | Path) -> list[Region]:
    region_data = load_json(path)
    return [Region(**entry) for entry in region_data]


def load_countries(path: str | Path, regions: list[Region]) -> list[Country]:
    country_data = load_json(path)
    countries: list[Country] = []

    for entry in country_data:
        if not entry.get("enabled", True):
            continue

        country_regions = [
            region for region in regions
            if region.country_code == entry["code"]
        ]

        countries.append(
            Country(
                name=entry["name"],
                code=entry["code"],
                base_birth_rate=entry["base_birth_rate"],
                base_death_rate=entry["base_death_rate"],
                base_net_migration_rate=entry["base_net_migration_rate"],
                stability=entry["stability"],
                eu_integration=entry["eu_integration"],
                corruption=entry["corruption"],
                enabled=entry.get("enabled", True),
                base_budget_balance_pct_gdp=entry.get("base_budget_balance_pct_gdp", -0.03),
                base_debt_to_gdp=entry.get("base_debt_to_gdp", 0.60),
                base_investment_climate_index=entry.get("base_investment_climate_index", 0.50),
                baseline_year=entry.get("baseline_year", 2020),
                baseline_population=entry.get("baseline_population", 0),
                baseline_gdp_scale_vs_2020=entry.get("baseline_gdp_scale_vs_2020", 1.0),
                baseline_unemployment_rate=entry.get("baseline_unemployment_rate", 0.12),
                baseline_inflation_rate=entry.get("baseline_inflation_rate", 0.02),
                base_integration_index=entry.get("base_integration_index", entry.get("eu_integration", 0.50)),
                base_satisfaction_index=entry.get("base_satisfaction_index", 0.50),
                base_election_alignment_index=entry.get("base_election_alignment_index", 0.0),
                election_cycle_years=entry.get("election_cycle_years", 4),
                last_election_year=entry.get("last_election_year", entry.get("baseline_year", 2020)),
                election_sensitivity=entry.get("election_sensitivity", 0.55),
                regions=country_regions,
            )
        )

    align_country_baselines(countries)
    initialize_region_election_alignments(countries)
    return countries


def initialize_region_election_alignments(countries: list[Country]) -> None:
    for country in countries:
        for region in country.regions:
            structural_bias = (
                country.base_election_alignment_index
                + region.political_identity_bias
                - (region.urbanization - 0.50) * 0.18
                - region.metro_pull * 0.08
            )
            region.election_alignment_index = clamp(structural_bias, -1.0, 1.0)


def load_scenarios(path: str | Path) -> list[SimulationScenario]:
    scenario_data = load_json(path)
    return [SimulationScenario(**entry) for entry in scenario_data]


def load_shocks(path: str | Path) -> list[ShockDefinition]:
    shock_data = load_json(path)
    return [ShockDefinition(**entry) for entry in shock_data]


def load_world(data_dir: str | Path = "data") -> list[Country]:
    data_path = Path(data_dir)

    regions = load_regions(data_path / "regions.json")
    countries = load_countries(data_path / "countries.json", regions)

    return countries


def normalize_assignment_country_code(country_code: str | None) -> str:
    normalized = str(country_code or "").strip().upper()
    if normalized == "XKX":
        return "SRB"
    return normalized


def normalize_region_fragment(region_name: str | None) -> str:
    return (
        str(region_name or "")
        .strip()
        .casefold()
        .replace("&", " and ")
        .replace("-", " ")
        .replace("/", " ")
        .replace("(", " ")
        .replace(")", " ")
        .replace(",", " ")
        .replace(".", " ")
        .replace("  ", " ")
        .replace("  ", " ")
        .strip()
    )


def build_region_key(country_code: str | None, region_name: str | None) -> str:
    return f"{normalize_assignment_country_code(country_code)}::{normalize_region_fragment(region_name)}"


def load_map_assignments(path: str | Path = DEFAULT_MAP_ASSIGNMENTS_PATH) -> dict:
    assignment_path = Path(path)
    if not assignment_path.exists():
        return {"overrides": {}}

    with assignment_path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    if not isinstance(payload, dict):
        return {"overrides": {}}

    overrides = payload.get("overrides", {})
    if not isinstance(overrides, dict):
        overrides = {}

    return {
        "updated_at": payload.get("updated_at"),
        "overrides": overrides,
    }


def parse_feature_source_country(feature_id: str) -> str:
    parts = str(feature_id or "").split(":")
    if len(parts) < 4:
        return ""
    return normalize_assignment_country_code(parts[1])


def apply_editor_annexation_effects(
    countries: list[Country],
    assignments_path: str | Path = DEFAULT_MAP_ASSIGNMENTS_PATH,
) -> None:
    assignment_payload = load_map_assignments(assignments_path)
    overrides = assignment_payload.get("overrides", {})
    if not isinstance(overrides, dict) or not overrides:
        return

    region_lookup = {
        build_region_key(country.code, region.name): region
        for country in countries
        for region in country.regions
    }
    annexation_counts: Counter[str] = Counter()

    for feature_id, override in overrides.items():
        if not isinstance(override, dict):
            continue

        source_country_code = parse_feature_source_country(str(feature_id))
        target_country_code = normalize_assignment_country_code(
            override.get("targetCountryCode")
        )
        target_region_key = str(override.get("targetBespRegionKey") or "").strip().casefold()
        if not source_country_code or not target_country_code or not target_region_key:
            continue
        if source_country_code == target_country_code:
            continue
        if not target_region_key.startswith(f"{target_country_code.casefold()}::"):
            continue

        annexation_counts[target_region_key] += 1

    for target_region_key, annexed_feature_count in annexation_counts.items():
        region = region_lookup.get(target_region_key)
        if region is None:
            continue

        satisfaction_penalty = min(
            ANNEXATION_MAX_SATISFACTION_PENALTY,
            ANNEXATION_BASE_SATISFACTION_PENALTY
            + max(annexed_feature_count - 1, 0) * 0.02,
        )
        integration_penalty = min(
            ANNEXATION_MAX_INTEGRATION_PENALTY,
            ANNEXATION_BASE_INTEGRATION_PENALTY
            + max(annexed_feature_count - 1, 0) * 0.015,
        )

        region.annexation_pressure_years_remaining = ANNEXATION_EFFECT_YEARS
        region.annexation_pressure_years_total = ANNEXATION_EFFECT_YEARS
        region.annexation_satisfaction_penalty = satisfaction_penalty
        region.annexation_integration_penalty = integration_penalty
        region.satisfaction_index = max(0.0, region.satisfaction_index - satisfaction_penalty)
        region.integration_index = max(0.0, region.integration_index - integration_penalty)


def detect_world_baseline_year(data_dir: str | Path = "data") -> int:
    data_path = Path(data_dir)
    country_data = load_json(data_path / "countries.json")
    years = [
        int(entry.get("baseline_year", 2020))
        for entry in country_data
        if isinstance(entry, dict)
    ]
    if not years:
        return 2020

    counts = Counter(years)
    return max(counts, key=lambda year: (counts[year], year))


def load_scenario_map(data_dir: str | Path = "data") -> dict[str, SimulationScenario]:
    data_path = Path(data_dir)
    scenarios = load_scenarios(data_path / "scenarios.json")
    return {scenario.code: scenario for scenario in scenarios}


def load_shock_map(data_dir: str | Path = "data") -> dict[str, ShockDefinition]:
    data_path = Path(data_dir)
    shocks = load_shocks(data_path / "shocks.json")
    return {shock.code: shock for shock in shocks}
