import json
from collections import Counter
from pathlib import Path

from besp.baseline import align_country_baselines
from besp.models import Country, Region, ShockDefinition, SimulationScenario

DEFAULT_MAP_ASSIGNMENTS_PATH = Path("dashboard") / "data" / "map_assignments.json"
ANNEXATION_EFFECT_YEARS = 6
ANNEXATION_BASE_SATISFACTION_DRAG = 0.035
ANNEXATION_MAX_SATISFACTION_DRAG = 0.10
ANNEXATION_MAX_SATISFACTION_BOOST = -0.12
ANNEXATION_BASE_INTEGRATION_DRAG = 0.030
ANNEXATION_MAX_INTEGRATION_DRAG = 0.09
ANNEXATION_MAX_INTEGRATION_BOOST = -0.08

# Targeted affinity examples. These are limited model assumptions for regions
# where another state's identity context is plausibly relevant.
ANNEXATION_AFFINITY_OVERRIDES = {
    ("BIH", "republika srpska", "SRB"): 0.90,
    ("BIH", "brcko", "SRB"): 0.30,
    ("MKD", "western north macedonia", "ALB"): 0.55,
    ("SRB", "kosovo and metohija", "ALB"): 0.80,
    ("SRB", "vojvodina", "HUN"): 0.22,
    ("HRV", "slavonia", "SRB"): 0.20,
    ("ROU", "transylvania and banat", "HUN"): 0.24,
}


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


def normalize_assignment_region_key(region_key: str | None) -> str:
    raw_key = str(region_key or "").strip()
    if "::" not in raw_key:
        return ""
    country_code, region_name = raw_key.split("::", 1)
    return build_region_key(country_code, region_name)


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


def extract_assignment_source_region_keys(override: dict) -> list[str]:
    raw_keys = override.get("sourceBespRegionKeys")
    if isinstance(raw_keys, list):
        keys = [
            normalize_assignment_region_key(key)
            for key in raw_keys
            if normalize_assignment_region_key(key)
        ]
        if keys:
            return keys

    fallback_keys = [
        override.get("sourceBespRegionKey"),
        override.get("targetBespRegionKey"),
        override.get("targetVisualRegionDataKey"),
    ]
    return [
        normalized_key
        for normalized_key in (
            normalize_assignment_region_key(key)
            for key in fallback_keys
        )
        if normalized_key
    ]


def move_region_to_country(
    region: Region,
    countries_by_code: dict[str, Country],
    target_country_code: str,
) -> bool:
    source_country_code = normalize_assignment_country_code(region.country_code)
    if source_country_code == target_country_code:
        return False

    target_country = countries_by_code.get(target_country_code)
    source_country = countries_by_code.get(source_country_code)
    if target_country is None:
        return False

    if source_country is not None:
        source_country.regions = [
            existing_region
            for existing_region in source_country.regions
            if existing_region is not region
        ]

    if all(existing_region is not region for existing_region in target_country.regions):
        target_country.regions.append(region)

    region.country_code = target_country_code
    return True


def region_gdp_per_capita(region: Region) -> float:
    if region.population <= 0:
        return 0.0
    return region.gdp_billion_eur * 1_000_000_000 / region.population


def country_gdp_per_capita(country: Country | None) -> float:
    if country is None:
        return 0.0
    population = sum(max(region.population, 0) for region in country.regions)
    if population <= 0:
        return 0.0
    gdp_eur = sum(max(region.gdp_billion_eur, 0.0) for region in country.regions) * 1_000_000_000
    return gdp_eur / population


def identity_alignment_for_annexation(
    source_country: Country | None,
    region: Region,
    target_country: Country,
) -> float:
    source_country_code = normalize_assignment_country_code(
        source_country.code if source_country is not None else region.country_code
    )
    key = (
        source_country_code,
        normalize_region_fragment(region.name),
        normalize_assignment_country_code(target_country.code),
    )
    return ANNEXATION_AFFINITY_OVERRIDES.get(key, 0.0)


def calculate_annexation_effects(
    region: Region,
    source_country: Country | None,
    target_country: Country,
    annexed_feature_count: int,
) -> tuple[float, float]:
    satisfaction_drag = min(
        ANNEXATION_MAX_SATISFACTION_DRAG,
        ANNEXATION_BASE_SATISFACTION_DRAG
        + max(annexed_feature_count - 1, 0) * 0.006,
    )
    integration_drag = min(
        ANNEXATION_MAX_INTEGRATION_DRAG,
        ANNEXATION_BASE_INTEGRATION_DRAG
        + max(annexed_feature_count - 1, 0) * 0.005,
    )

    regional_gdp_pc = region_gdp_per_capita(region)
    target_gdp_pc = country_gdp_per_capita(target_country)
    economic_gap = 0.0
    if regional_gdp_pc > 0 and target_gdp_pc > 0:
        economic_gap = clamp(
            (target_gdp_pc - regional_gdp_pc) / regional_gdp_pc,
            -0.45,
            0.45,
        )

    source_stability = source_country.stability if source_country is not None else 0.50
    source_corruption = source_country.corruption if source_country is not None else 0.55
    stability_gap = target_country.stability - source_stability
    corruption_gap = target_country.corruption - source_corruption
    identity_alignment = identity_alignment_for_annexation(source_country, region, target_country)

    economic_bonus = max(economic_gap, 0.0) * 0.12
    economic_penalty = max(-economic_gap, 0.0) * 0.10
    stability_bonus = max(stability_gap, 0.0) * 0.10
    stability_penalty = max(-stability_gap, 0.0) * 0.10
    corruption_bonus = max(-corruption_gap, 0.0) * 0.04
    corruption_penalty = max(corruption_gap, 0.0) * 0.08
    identity_bonus = max(identity_alignment, 0.0) * 0.13
    identity_penalty = max(-identity_alignment, 0.0) * 0.13

    satisfaction_effect = clamp(
        satisfaction_drag
        + economic_penalty
        + stability_penalty
        + identity_penalty
        - economic_bonus
        - stability_bonus
        - identity_bonus,
        ANNEXATION_MAX_SATISFACTION_BOOST,
        0.16,
    )
    integration_effect = clamp(
        integration_drag
        + economic_penalty * 0.65
        + stability_penalty * 0.50
        + corruption_penalty
        + identity_penalty * 0.50
        - economic_bonus * 0.45
        - stability_bonus * 0.45
        - identity_bonus * 0.60
        - corruption_bonus,
        ANNEXATION_MAX_INTEGRATION_BOOST,
        0.13,
    )
    return satisfaction_effect, integration_effect


def apply_annexation_pressure(
    region: Region,
    source_country: Country | None,
    target_country: Country,
    annexed_feature_count: int,
) -> None:
    satisfaction_effect, integration_effect = calculate_annexation_effects(
        region,
        source_country,
        target_country,
        annexed_feature_count,
    )

    region.annexation_pressure_years_remaining = ANNEXATION_EFFECT_YEARS
    region.annexation_pressure_years_total = ANNEXATION_EFFECT_YEARS
    region.annexation_satisfaction_penalty = satisfaction_effect
    region.annexation_integration_penalty = integration_effect
    region.annexation_source_unemployment_rate = (
        source_country.baseline_unemployment_rate
        if source_country is not None
        else region.unemployment_rate
    )
    region.annexation_source_inflation_rate = (
        source_country.baseline_inflation_rate
        if source_country is not None
        else 0.0
    )
    region.annexation_source_integration_index = (
        source_country.base_integration_index
        if source_country is not None
        else region.integration_index
    )
    region.annexation_source_satisfaction_index = (
        source_country.base_satisfaction_index
        if source_country is not None
        else region.satisfaction_index
    )
    region.satisfaction_index = clamp(region.satisfaction_index - satisfaction_effect, 0.0, 1.0)
    region.integration_index = clamp(region.integration_index - integration_effect, 0.0, 1.0)


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
    countries_by_code = {
        normalize_assignment_country_code(country.code): country
        for country in countries
    }
    annexation_counts: Counter[tuple[str, str]] = Counter()

    for feature_id, override in overrides.items():
        if not isinstance(override, dict):
            continue

        source_country_code = parse_feature_source_country(str(feature_id))
        target_country_code = normalize_assignment_country_code(
            override.get("targetCountryCode")
        )
        source_region_keys = extract_assignment_source_region_keys(override)
        if not source_country_code or not target_country_code or not source_region_keys:
            continue
        if source_country_code == target_country_code:
            continue

        for source_region_key in source_region_keys:
            region = region_lookup.get(source_region_key)
            if region is None:
                continue
            if normalize_assignment_country_code(region.country_code) == target_country_code:
                continue
            annexation_counts[(source_region_key, target_country_code)] += 1

    region_targets: dict[str, tuple[str, int]] = {}
    for (source_region_key, target_country_code), count in annexation_counts.items():
        existing = region_targets.get(source_region_key)
        if existing is None or count > existing[1]:
            region_targets[source_region_key] = (target_country_code, count)

    for source_region_key, (target_country_code, annexed_feature_count) in region_targets.items():
        region = region_lookup.get(source_region_key)
        if region is None:
            continue

        source_country_code = normalize_assignment_country_code(region.country_code)
        source_country = countries_by_code.get(source_country_code)
        target_country = countries_by_code.get(target_country_code)
        if target_country is None:
            continue

        if move_region_to_country(region, countries_by_code, target_country_code):
            apply_annexation_pressure(
                region,
                source_country,
                target_country,
                annexed_feature_count,
            )


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
