import random

from besp.models import (
    Country,
    CountryYearResult,
    Region,
    RegionYearResult,
    ShockDefinition,
    ShockEvent,
    SimulationScenario,
)

# -----------------------------------------------------------------------------
# Attractiveness model tuning
# -----------------------------------------------------------------------------
ECONOMIC_WEIGHT = 0.50
INFRASTRUCTURE_WEIGHT = 0.20
URBANIZATION_WEIGHT = 0.10
METRO_PULL_WEIGHT = 0.20

# -----------------------------------------------------------------------------
# Migration model tuning
# -----------------------------------------------------------------------------
INTERNAL_MIGRATION_STRENGTH = 0.02
MAX_INTERNAL_MIGRATION_RATE = 0.012

# -----------------------------------------------------------------------------
# Economy v1 tuning
# -----------------------------------------------------------------------------
BASE_GDP_GROWTH = 0.008
ATTRACTIVENESS_GDP_MULTIPLIER = 0.05
HOUSING_GDP_PENALTY = 0.03
UNEMPLOYMENT_GDP_DRAG = 0.02

MIN_GDP_GROWTH = -0.03
MAX_GDP_GROWTH = 0.08

MIN_UNEMPLOYMENT_RATE = 0.04
MAX_UNEMPLOYMENT_RATE = 0.35

# -----------------------------------------------------------------------------
# Controlled yearly variation
# -----------------------------------------------------------------------------
CONTROLLED_BIRTH_VARIATION = 0.012
CONTROLLED_DEATH_VARIATION = 0.008
CONTROLLED_MIGRATION_VARIATION = 0.10
CONTROLLED_GDP_GROWTH_VARIATION = 0.004
CONTROLLED_UNEMPLOYMENT_VARIATION = 0.0012

# -----------------------------------------------------------------------------
# Shock system v1 (bounded annual effects)
# -----------------------------------------------------------------------------
MAX_SHOCK_GDP_BIAS = 0.02
MIN_SHOCK_GDP_BIAS = -0.03
MAX_SHOCK_UNEMPLOYMENT_BIAS = 0.012
MIN_SHOCK_UNEMPLOYMENT_BIAS = -0.01
MAX_SHOCK_NET_MIGRATION_SHIFT = 0.003
MIN_SHOCK_NET_MIGRATION_SHIFT = -0.004
MAX_SHOCK_ATTRACTIVENESS_BIAS = 0.04
MIN_SHOCK_ATTRACTIVENESS_BIAS = -0.06
MAX_SHOCK_BIRTH_MULTIPLIER = 1.06
MIN_SHOCK_BIRTH_MULTIPLIER = 0.94
MAX_SHOCK_DEATH_MULTIPLIER = 1.08
MIN_SHOCK_DEATH_MULTIPLIER = 0.94


def _empty_shock_effect() -> dict[str, float]:
    return {
        "birth_multiplier": 1.0,
        "death_multiplier": 1.0,
        "net_migration_shift": 0.0,
        "gdp_growth_bias": 0.0,
        "unemployment_bias": 0.0,
        "attractiveness_bias": 0.0,
    }


def build_country_shock_effects(
    countries: list[Country],
    shock_definitions: list[ShockDefinition] | None,
    start_year: int,
    variation_seed: str,
) -> tuple[dict[str, dict[str, float]], list[ShockEvent]]:
    effects = {country.code: _empty_shock_effect() for country in countries}
    events: list[ShockEvent] = []

    if not shock_definitions:
        return effects, events

    for country in countries:
        for shock in shock_definitions:
            base_probability = clamp(shock.annual_probability, 0.0, 1.0)
            country_weight = shock.country_weight_overrides.get(country.code, 1.0)
            probability = clamp(base_probability * country_weight, 0.0, 0.75)

            draw_rng = random.Random(
                f"{variation_seed}|shock-draw|{start_year}|{country.code}|{shock.code}"
            )
            if draw_rng.random() > probability:
                continue

            effect = effects[country.code]
            effect["birth_multiplier"] *= shock.birth_rate_multiplier
            effect["death_multiplier"] *= shock.death_rate_multiplier
            effect["net_migration_shift"] += shock.net_migration_rate_shift
            effect["gdp_growth_bias"] += shock.gdp_growth_bias
            effect["unemployment_bias"] += shock.unemployment_bias
            effect["attractiveness_bias"] += shock.attractiveness_bias

            events.append(
                ShockEvent(
                    start_year=start_year,
                    end_year=start_year + 1,
                    country_code=country.code,
                    country_name=country.name,
                    shock_code=shock.code,
                    shock_name=shock.name,
                    category=shock.category,
                    probability_applied=probability,
                    gdp_growth_bias=shock.gdp_growth_bias,
                    unemployment_bias=shock.unemployment_bias,
                    net_migration_rate_shift=shock.net_migration_rate_shift,
                )
            )

    for country_code, effect in effects.items():
        effect["birth_multiplier"] = clamp(
            effect["birth_multiplier"],
            MIN_SHOCK_BIRTH_MULTIPLIER,
            MAX_SHOCK_BIRTH_MULTIPLIER,
        )
        effect["death_multiplier"] = clamp(
            effect["death_multiplier"],
            MIN_SHOCK_DEATH_MULTIPLIER,
            MAX_SHOCK_DEATH_MULTIPLIER,
        )
        effect["net_migration_shift"] = clamp(
            effect["net_migration_shift"],
            MIN_SHOCK_NET_MIGRATION_SHIFT,
            MAX_SHOCK_NET_MIGRATION_SHIFT,
        )
        effect["gdp_growth_bias"] = clamp(
            effect["gdp_growth_bias"],
            MIN_SHOCK_GDP_BIAS,
            MAX_SHOCK_GDP_BIAS,
        )
        effect["unemployment_bias"] = clamp(
            effect["unemployment_bias"],
            MIN_SHOCK_UNEMPLOYMENT_BIAS,
            MAX_SHOCK_UNEMPLOYMENT_BIAS,
        )
        effect["attractiveness_bias"] = clamp(
            effect["attractiveness_bias"],
            MIN_SHOCK_ATTRACTIVENESS_BIAS,
            MAX_SHOCK_ATTRACTIVENESS_BIAS,
        )

    return effects, events


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def calculate_controlled_variation_signal(
    start_year: int,
    country_code: str,
    region_name: str,
    channel: str,
    variation_seed: str,
) -> float:
    current_rng = random.Random(
        f"{variation_seed}|{start_year}|{country_code}|{region_name}|{channel}|current"
    )
    previous_rng = random.Random(
        f"{variation_seed}|{start_year - 1}|{country_code}|{region_name}|{channel}|previous"
    )

    current_draw = current_rng.triangular(-1.0, 1.0, 0.0)
    previous_draw = previous_rng.triangular(-1.0, 1.0, 0.0)

    return clamp((current_draw * 0.72) + (previous_draw * 0.28), -1.0, 1.0)


def calculate_housing_penalty(region: Region) -> float:
    overload = region.housing_overload

    if overload <= 1.0:
        return 0.0

    return min((overload - 1.0) * 0.25, 0.15)


def calculate_regional_attractiveness(
    region: Region,
    scenario: SimulationScenario | None = None,
    shock_attractiveness_bias: float = 0.0,
) -> float:
    positive_score = (
        region.economic_attractiveness * ECONOMIC_WEIGHT
        + region.infrastructure * INFRASTRUCTURE_WEIGHT
        + region.urbanization * URBANIZATION_WEIGHT
        + region.metro_pull * METRO_PULL_WEIGHT
    )

    scenario_bias = scenario.attractiveness_bias if scenario else 0.0
    return clamp(
        positive_score - calculate_housing_penalty(region) + scenario_bias + shock_attractiveness_bias,
        0.0,
        1.0,
    )


def calculate_country_average_attractiveness(
    country: Country,
    scenario: SimulationScenario | None = None,
) -> float:
    total_population = sum(region.population for region in country.regions)

    if total_population <= 0:
        return 0.0

    weighted_sum = sum(
        calculate_regional_attractiveness(region, scenario) * region.population
        for region in country.regions
    )

    return weighted_sum / total_population


def calculate_internal_migration(
    region: Region,
    country_average_attractiveness: float,
    scenario: SimulationScenario | None = None,
) -> int:
    regional_attractiveness = calculate_regional_attractiveness(region, scenario)
    attractiveness_gap = regional_attractiveness - country_average_attractiveness

    migration_rate = clamp(
        attractiveness_gap * INTERNAL_MIGRATION_STRENGTH,
        -MAX_INTERNAL_MIGRATION_RATE,
        MAX_INTERNAL_MIGRATION_RATE,
    )

    return round(region.population * migration_rate)


def calculate_external_migration_rate(
    country: Country,
    region: Region,
    scenario: SimulationScenario | None = None,
) -> float:
    attractiveness = calculate_regional_attractiveness(region, scenario)

    retention_factor = clamp(1.10 - attractiveness, 0.35, 1.15)

    migration_rate = (
        country.base_net_migration_rate
        * region.net_migration_modifier
        * retention_factor
    )
    if scenario:
        migration_rate += scenario.net_migration_rate_shift

    return clamp(migration_rate, -0.03, 0.01)


def calculate_regional_gdp_growth_rate(
    region: Region,
    scenario: SimulationScenario | None = None,
) -> float:
    attractiveness = calculate_regional_attractiveness(region, scenario)
    overload_penalty = max(region.housing_overload - 1.0, 0.0) * HOUSING_GDP_PENALTY
    unemployment_drag = region.unemployment_rate * UNEMPLOYMENT_GDP_DRAG

    growth_rate = (
        BASE_GDP_GROWTH
        + (attractiveness - 0.45) * ATTRACTIVENESS_GDP_MULTIPLIER
        - overload_penalty
        - unemployment_drag
        + (scenario.gdp_growth_bias if scenario else 0.0)
    )

    return clamp(growth_rate, MIN_GDP_GROWTH, MAX_GDP_GROWTH)


def calculate_updated_unemployment_rate(
    current_unemployment_rate: float,
    gdp_growth_rate: float,
    regional_attractiveness: float,
    scenario: SimulationScenario | None = None,
) -> float:
    unemployment_change = -gdp_growth_rate * 0.60

    if regional_attractiveness >= 0.65:
        unemployment_change -= 0.002
    elif regional_attractiveness <= 0.40:
        unemployment_change += 0.002

    updated_rate = current_unemployment_rate + unemployment_change
    if scenario:
        updated_rate += scenario.unemployment_bias

    return clamp(updated_rate, MIN_UNEMPLOYMENT_RATE, MAX_UNEMPLOYMENT_RATE)


def simulate_year(
    countries: list[Country],
    start_year: int,
    scenario: SimulationScenario | None = None,
    variation_seed: str = "baseline-2020",
    shock_definitions: list[ShockDefinition] | None = None,
) -> tuple[list[RegionYearResult], list[ShockEvent]]:
    end_year = start_year + 1
    results: list[RegionYearResult] = []
    shock_effects_by_country, shock_events = build_country_shock_effects(
        countries,
        shock_definitions,
        start_year,
        variation_seed,
    )

    for country in countries:
        if not country.regions:
            continue

        country_shock_effect = shock_effects_by_country.get(country.code, _empty_shock_effect())

        average_attractiveness = calculate_country_average_attractiveness(country, scenario)

        raw_internal_migration: dict[str, int] = {}

        for region in country.regions:
            raw_internal_migration[region.name] = calculate_internal_migration(
                region,
                average_attractiveness,
                scenario,
            )

        migration_balance = sum(raw_internal_migration.values())

        if migration_balance != 0:
            strongest_region = max(
                country.regions,
                key=lambda region: abs(raw_internal_migration[region.name]),
            )
            raw_internal_migration[strongest_region.name] -= migration_balance

        for region in country.regions:
            start_population = region.population
            start_gdp_billion_eur = region.gdp_billion_eur

            birth_variation = calculate_controlled_variation_signal(
                start_year,
                country.code,
                region.name,
                "birth",
                variation_seed,
            )
            death_variation = calculate_controlled_variation_signal(
                start_year,
                country.code,
                region.name,
                "death",
                variation_seed,
            )
            migration_variation = calculate_controlled_variation_signal(
                start_year,
                country.code,
                region.name,
                "migration",
                variation_seed,
            )
            growth_variation = calculate_controlled_variation_signal(
                start_year,
                country.code,
                region.name,
                "growth",
                variation_seed,
            )
            unemployment_variation = calculate_controlled_variation_signal(
                start_year,
                country.code,
                region.name,
                "unemployment",
                variation_seed,
            )

            birth_rate = (
                country.base_birth_rate
                * region.birth_rate_modifier
                * (scenario.birth_rate_multiplier if scenario else 1.0)
                * (1.0 + birth_variation * CONTROLLED_BIRTH_VARIATION)
                * country_shock_effect["birth_multiplier"]
            )
            death_rate = (
                country.base_death_rate
                * region.death_rate_modifier
                * (scenario.death_rate_multiplier if scenario else 1.0)
                * (1.0 + death_variation * CONTROLLED_DEATH_VARIATION)
                * country_shock_effect["death_multiplier"]
            )
            external_migration_rate = (
                calculate_external_migration_rate(country, region, scenario)
                + country_shock_effect["net_migration_shift"]
            ) * (1.0 + migration_variation * CONTROLLED_MIGRATION_VARIATION)

            births = round(start_population * birth_rate)
            deaths = round(start_population * death_rate)
            natural_change = births - deaths
            net_external_migration = round(start_population * external_migration_rate)
            internal_migration = raw_internal_migration[region.name]

            end_population = (
                start_population
                + natural_change
                + net_external_migration
                + internal_migration
            )
            region.population = max(end_population, 0)

            regional_attractiveness = calculate_regional_attractiveness(
                region,
                scenario,
                country_shock_effect["attractiveness_bias"],
            )
            gdp_growth_rate = clamp(
                calculate_regional_gdp_growth_rate(region, scenario)
                + country_shock_effect["gdp_growth_bias"]
                + growth_variation * CONTROLLED_GDP_GROWTH_VARIATION,
                MIN_GDP_GROWTH,
                MAX_GDP_GROWTH,
            )
            region.gdp_billion_eur = max(
                start_gdp_billion_eur * (1.0 + gdp_growth_rate),
                0.01,
            )
            unemployment_rate = calculate_updated_unemployment_rate(
                region.unemployment_rate,
                gdp_growth_rate,
                regional_attractiveness,
                scenario,
            )
            region.unemployment_rate = clamp(
                unemployment_rate
                + country_shock_effect["unemployment_bias"]
                + unemployment_variation * CONTROLLED_UNEMPLOYMENT_VARIATION,
                MIN_UNEMPLOYMENT_RATE,
                MAX_UNEMPLOYMENT_RATE,
            )

            gdp_per_capita_eur = 0.0
            if region.population > 0:
                gdp_per_capita_eur = (region.gdp_billion_eur * 1_000_000_000) / region.population

            results.append(
                RegionYearResult(
                    start_year=start_year,
                    end_year=end_year,
                    region_name=region.name,
                    country_code=region.country_code,
                    start_population=start_population,
                    births=births,
                    deaths=deaths,
                    natural_change=natural_change,
                    net_external_migration=net_external_migration,
                    internal_migration=internal_migration,
                    end_population=region.population,
                    start_gdp_billion_eur=start_gdp_billion_eur,
                    end_gdp_billion_eur=region.gdp_billion_eur,
                    gdp_growth_rate=gdp_growth_rate,
                    gdp_per_capita_eur=gdp_per_capita_eur,
                    unemployment_rate=region.unemployment_rate,
                    area_km2=region.area_km2,
                    population_density=region.population_density,
                    housing_overload=region.housing_overload,
                    regional_attractiveness=regional_attractiveness,
                    data_confidence=region.data_confidence,
                    population_note=region.population_note,
                )
            )

    return results, shock_events


def simulate_period(
    countries: list[Country],
    start_year: int,
    end_year: int,
    scenario: SimulationScenario | None = None,
    variation_seed: str = "baseline-2020",
    shock_definitions: list[ShockDefinition] | None = None,
) -> tuple[list[RegionYearResult], list[ShockEvent]]:
    results: list[RegionYearResult] = []
    shock_events: list[ShockEvent] = []

    for year in range(start_year, end_year):
        yearly_results, yearly_shock_events = simulate_year(
            countries,
            year,
            scenario,
            variation_seed,
            shock_definitions=shock_definitions,
        )
        results.extend(yearly_results)
        shock_events.extend(yearly_shock_events)

    return results, shock_events


def aggregate_country_results(
    region_results: list[RegionYearResult],
    countries: list[Country],
) -> list[CountryYearResult]:
    country_names = {country.code: country.name for country in countries}
    grouped_results: dict[tuple[int, int, str], list[RegionYearResult]] = {}

    for result in region_results:
        key = (result.start_year, result.end_year, result.country_code)
        grouped_results.setdefault(key, []).append(result)

    country_results: list[CountryYearResult] = []

    for (start_year, end_year, country_code), entries in sorted(grouped_results.items()):
        start_population = sum(entry.start_population for entry in entries)
        end_population = sum(entry.end_population for entry in entries)
        births = sum(entry.births for entry in entries)
        deaths = sum(entry.deaths for entry in entries)
        natural_change = sum(entry.natural_change for entry in entries)
        net_external_migration = sum(entry.net_external_migration for entry in entries)
        internal_migration = sum(entry.internal_migration for entry in entries)

        start_gdp_billion_eur = sum(entry.start_gdp_billion_eur for entry in entries)
        end_gdp_billion_eur = sum(entry.end_gdp_billion_eur for entry in entries)

        gdp_growth_rate = 0.0
        if start_gdp_billion_eur > 0:
            gdp_growth_rate = (end_gdp_billion_eur / start_gdp_billion_eur) - 1.0

        gdp_per_capita_eur = 0.0
        if end_population > 0:
            gdp_per_capita_eur = (end_gdp_billion_eur * 1_000_000_000) / end_population

        region_count = len(entries)
        average_population_density = (
            sum(entry.population_density for entry in entries) / region_count
            if region_count > 0
            else 0.0
        )
        average_housing_overload = (
            sum(entry.housing_overload for entry in entries) / region_count
            if region_count > 0
            else 0.0
        )
        average_regional_attractiveness = (
            sum(entry.regional_attractiveness for entry in entries) / region_count
            if region_count > 0
            else 0.0
        )

        total_weight = sum(entry.end_population for entry in entries)
        average_unemployment_rate = 0.0
        if total_weight > 0:
            average_unemployment_rate = sum(
                entry.unemployment_rate * entry.end_population
                for entry in entries
            ) / total_weight

        country_results.append(
            CountryYearResult(
                start_year=start_year,
                end_year=end_year,
                country_name=country_names.get(country_code, country_code),
                country_code=country_code,
                start_population=start_population,
                end_population=end_population,
                births=births,
                deaths=deaths,
                natural_change=natural_change,
                net_external_migration=net_external_migration,
                internal_migration=internal_migration,
                start_gdp_billion_eur=start_gdp_billion_eur,
                end_gdp_billion_eur=end_gdp_billion_eur,
                gdp_growth_rate=gdp_growth_rate,
                gdp_per_capita_eur=gdp_per_capita_eur,
                average_unemployment_rate=average_unemployment_rate,
                average_population_density=average_population_density,
                average_housing_overload=average_housing_overload,
                average_regional_attractiveness=average_regional_attractiveness,
            )
        )

    return country_results
