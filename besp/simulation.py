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

ECONOMIC_WEIGHT = 0.50
INFRASTRUCTURE_WEIGHT = 0.20
URBANIZATION_WEIGHT = 0.10
METRO_PULL_WEIGHT = 0.20

INTERNAL_MIGRATION_STRENGTH = 0.02
MAX_INTERNAL_MIGRATION_RATE = 0.012

BASE_GDP_GROWTH = 0.008
ATTRACTIVENESS_GDP_MULTIPLIER = 0.05
HOUSING_GDP_PENALTY = 0.03
UNEMPLOYMENT_GDP_DRAG = 0.02

MIN_GDP_GROWTH = -0.03
MAX_GDP_GROWTH = 0.08

MIN_UNEMPLOYMENT_RATE = 0.04
MAX_UNEMPLOYMENT_RATE = 0.35

CONTROLLED_BIRTH_VARIATION = 0.012
CONTROLLED_DEATH_VARIATION = 0.008
CONTROLLED_MIGRATION_VARIATION = 0.10
CONTROLLED_GDP_GROWTH_VARIATION = 0.004
CONTROLLED_UNEMPLOYMENT_VARIATION = 0.0012

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
MAX_SHOCK_EVENTS_PER_COUNTRY_YEAR = 2
MAX_SHOCK_EVENTS_PER_CATEGORY_COUNTRY_YEAR = 1
SHOCK_EFFECT_DEFAULTS = {
    "birth_multiplier": 1.0,
    "death_multiplier": 1.0,
    "net_migration_shift": 0.0,
    "gdp_growth_bias": 0.0,
    "unemployment_bias": 0.0,
    "attractiveness_bias": 0.0,
}
SHOCK_EFFECT_BOUNDS = {
    "birth_multiplier": (MIN_SHOCK_BIRTH_MULTIPLIER, MAX_SHOCK_BIRTH_MULTIPLIER),
    "death_multiplier": (MIN_SHOCK_DEATH_MULTIPLIER, MAX_SHOCK_DEATH_MULTIPLIER),
    "net_migration_shift": (MIN_SHOCK_NET_MIGRATION_SHIFT, MAX_SHOCK_NET_MIGRATION_SHIFT),
    "gdp_growth_bias": (MIN_SHOCK_GDP_BIAS, MAX_SHOCK_GDP_BIAS),
    "unemployment_bias": (MIN_SHOCK_UNEMPLOYMENT_BIAS, MAX_SHOCK_UNEMPLOYMENT_BIAS),
    "attractiveness_bias": (MIN_SHOCK_ATTRACTIVENESS_BIAS, MAX_SHOCK_ATTRACTIVENESS_BIAS),
}
STATE_SPECS = {
    "budget_balance_pct_gdp": {
        "bounds": (-0.12, 0.06),
        "max_step": 0.025,
        "base_attr": "base_budget_balance_pct_gdp",
    },
    "debt_to_gdp": {
        "bounds": (0.15, 1.50),
        "max_step": 0.05,
        "base_attr": "base_debt_to_gdp",
    },
    "stability_index": {
        "bounds": (0.20, 0.95),
        "max_step": 0.06,
        "base_attr": "stability",
    },
    "corruption_index": {
        "bounds": (0.15, 0.95),
        "max_step": 0.05,
        "base_attr": "corruption",
    },
    "investment_climate_index": {
        "bounds": (0.15, 0.95),
        "max_step": 0.06,
        "base_attr": "base_investment_climate_index",
    },
}
DEFAULT_COUNTRY_STATE = {
    "budget_balance_pct_gdp": 0.0,
    "debt_to_gdp": 0.6,
    "stability_index": 0.5,
    "corruption_index": 0.5,
    "investment_climate_index": 0.5,
}


def _empty_shock_effect() -> dict[str, float]:
    return SHOCK_EFFECT_DEFAULTS.copy()


def build_country_shock_effects(
    countries: list[Country],
    shock_definitions: list[ShockDefinition] | None,
    start_year: int,
    variation_seed: str,
    last_triggered_by_country_shock: dict[tuple[str, str], int] | None = None,
) -> tuple[dict[str, dict[str, float]], list[ShockEvent], dict[tuple[str, str], int]]:
    effects = {country.code: _empty_shock_effect() for country in countries}
    events: list[ShockEvent] = []
    updated_last_triggered = dict(last_triggered_by_country_shock or {})

    if not shock_definitions:
        return effects, events, updated_last_triggered

    for country in countries:
        selected_count = 0
        selected_categories: dict[str, int] = {}
        for shock in shock_definitions:
            if selected_count >= MAX_SHOCK_EVENTS_PER_COUNTRY_YEAR:
                break

            if (
                selected_categories.get(shock.category, 0)
                >= MAX_SHOCK_EVENTS_PER_CATEGORY_COUNTRY_YEAR
            ):
                continue

            last_triggered_year = updated_last_triggered.get((country.code, shock.code))
            if last_triggered_year is not None:
                years_since_last = start_year - last_triggered_year
                if years_since_last <= max(shock.cooldown_years, 0):
                    continue

            base_probability = clamp(shock.annual_probability, 0.0, 1.0)
            country_weight = shock.country_weight_overrides.get(country.code, 1.0)
            probability = clamp(base_probability * country_weight, 0.0, 0.75)

            draw_rng = random.Random(
                f"{variation_seed}|shock-draw|{start_year}|{country.code}|{shock.code}"
            )
            if draw_rng.random() > probability:
                continue

            severity_min = min(shock.severity_min, shock.severity_max)
            severity_max = max(shock.severity_min, shock.severity_max)
            severity_rng = random.Random(
                f"{variation_seed}|shock-severity|{start_year}|{country.code}|{shock.code}"
            )
            severity_scale = severity_rng.uniform(severity_min, severity_max)

            effect = effects[country.code]
            effect["birth_multiplier"] *= 1.0 + (shock.birth_rate_multiplier - 1.0) * severity_scale
            effect["death_multiplier"] *= 1.0 + (shock.death_rate_multiplier - 1.0) * severity_scale
            effect["net_migration_shift"] += shock.net_migration_rate_shift * severity_scale
            effect["gdp_growth_bias"] += shock.gdp_growth_bias * severity_scale
            effect["unemployment_bias"] += shock.unemployment_bias * severity_scale
            effect["attractiveness_bias"] += shock.attractiveness_bias * severity_scale
            updated_last_triggered[(country.code, shock.code)] = start_year
            selected_count += 1
            selected_categories[shock.category] = selected_categories.get(shock.category, 0) + 1

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
                    severity_scale=severity_scale,
                    gdp_growth_bias=shock.gdp_growth_bias * severity_scale,
                    unemployment_bias=shock.unemployment_bias * severity_scale,
                    net_migration_rate_shift=shock.net_migration_rate_shift * severity_scale,
                )
            )

    for effect in effects.values():
        for field_name, (minimum, maximum) in SHOCK_EFFECT_BOUNDS.items():
            effect[field_name] = clamp(effect[field_name], minimum, maximum)

    return effects, events, updated_last_triggered


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def bounded_state_step(
    previous_value: float,
    target_value: float,
    minimum: float,
    maximum: float,
    max_step: float,
) -> float:
    bounded_target = clamp(target_value, minimum, maximum)
    raw_delta = bounded_target - previous_value
    bounded_delta = clamp(raw_delta, -max_step, max_step)
    return clamp(previous_value + bounded_delta, minimum, maximum)


def initialize_country_state(country: Country) -> dict[str, float]:
    return {
        key: clamp(getattr(country, spec["base_attr"]), *spec["bounds"])
        for key, spec in STATE_SPECS.items()
    }


def evolve_state_metric(
    previous_state: dict[str, float],
    metric_key: str,
    target_value: float,
    smoothing_keep: float,
) -> float:
    current_value = previous_state[metric_key]
    minimum, maximum = STATE_SPECS[metric_key]["bounds"]
    smoothed_target = current_value * smoothing_keep + target_value * (1.0 - smoothing_keep)
    return bounded_state_step(
        current_value,
        smoothed_target,
        minimum,
        maximum,
        STATE_SPECS[metric_key]["max_step"],
    )


def evolve_country_state(
    country: Country,
    previous_state: dict[str, float],
    gdp_growth_rate: float,
    average_unemployment_rate: float,
    average_regional_attractiveness: float,
) -> dict[str, float]:
    growth_gap = gdp_growth_rate - BASE_GDP_GROWTH
    unemployment_gap = average_unemployment_rate - 0.12
    attractiveness_gap = average_regional_attractiveness - 0.50

    budget_target = (
        country.base_budget_balance_pct_gdp
        + growth_gap * 0.35
        - unemployment_gap * 0.06
        + attractiveness_gap * 0.03
    )
    budget_balance_pct_gdp = evolve_state_metric(
        previous_state,
        "budget_balance_pct_gdp",
        budget_target,
        0.72,
    )

    debt_change = (
        (-budget_balance_pct_gdp) * 0.20
        - gdp_growth_rate * 0.10
        + max(unemployment_gap, 0.0) * 0.04
    )
    debt_target = previous_state["debt_to_gdp"] + clamp(debt_change, -0.03, 0.04)
    debt_to_gdp = evolve_state_metric(previous_state, "debt_to_gdp", debt_target, 0.0)

    stability_target = (
        country.stability
        + growth_gap * 2.20
        - max(unemployment_gap, 0.0) * 1.20
        + attractiveness_gap * 0.80
        - (previous_state["corruption_index"] - 0.50) * 0.50
    )
    stability_index = evolve_state_metric(
        previous_state,
        "stability_index",
        stability_target,
        0.78,
    )

    corruption_target = (
        country.corruption
        - growth_gap * 0.80
        + max(unemployment_gap, 0.0) * 0.25
        - (stability_index - 0.50) * 0.20
    )
    corruption_index = evolve_state_metric(
        previous_state,
        "corruption_index",
        corruption_target,
        0.82,
    )

    investment_target = (
        country.base_investment_climate_index
        + growth_gap * 2.80
        - average_unemployment_rate * 0.35
        + stability_index * 0.25
        - corruption_index * 0.30
        + attractiveness_gap * 0.70
    )
    investment_climate_index = evolve_state_metric(
        previous_state,
        "investment_climate_index",
        investment_target,
        0.75,
    )

    return {
        "budget_balance_pct_gdp": budget_balance_pct_gdp,
        "debt_to_gdp": debt_to_gdp,
        "stability_index": stability_index,
        "corruption_index": corruption_index,
        "investment_climate_index": investment_climate_index,
    }


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


def sum_metric(entries: list[RegionYearResult], field_name: str) -> float:
    return sum(getattr(entry, field_name) for entry in entries)


def average_metric(entries: list[RegionYearResult], field_name: str) -> float:
    return sum_metric(entries, field_name) / len(entries) if entries else 0.0


def weighted_average_metric(
    entries: list[RegionYearResult],
    value_field: str,
    weight_field: str,
) -> float:
    total_weight = sum_metric(entries, weight_field)
    if total_weight <= 0:
        return 0.0
    return sum(
        getattr(entry, value_field) * getattr(entry, weight_field)
        for entry in entries
    ) / total_weight


def simulate_year(
    countries: list[Country],
    start_year: int,
    scenario: SimulationScenario | None = None,
    variation_seed: str = "baseline-2020",
    shock_definitions: list[ShockDefinition] | None = None,
    last_triggered_by_country_shock: dict[tuple[str, str], int] | None = None,
) -> tuple[list[RegionYearResult], list[ShockEvent], dict[tuple[str, str], int]]:
    end_year = start_year + 1
    results: list[RegionYearResult] = []
    shock_effects_by_country, shock_events, updated_last_triggered = build_country_shock_effects(
        countries,
        shock_definitions,
        start_year,
        variation_seed,
        last_triggered_by_country_shock,
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

            variations = {
                channel: calculate_controlled_variation_signal(
                    start_year,
                    country.code,
                    region.name,
                    channel,
                    variation_seed,
                )
                for channel in ("birth", "death", "migration", "growth", "unemployment")
            }

            birth_rate = (
                country.base_birth_rate
                * region.birth_rate_modifier
                * (scenario.birth_rate_multiplier if scenario else 1.0)
                * (1.0 + variations["birth"] * CONTROLLED_BIRTH_VARIATION)
                * country_shock_effect["birth_multiplier"]
            )
            death_rate = (
                country.base_death_rate
                * region.death_rate_modifier
                * (scenario.death_rate_multiplier if scenario else 1.0)
                * (1.0 + variations["death"] * CONTROLLED_DEATH_VARIATION)
                * country_shock_effect["death_multiplier"]
            )
            external_migration_rate = (
                calculate_external_migration_rate(country, region, scenario)
                + country_shock_effect["net_migration_shift"]
            ) * (1.0 + variations["migration"] * CONTROLLED_MIGRATION_VARIATION)

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
                + variations["growth"] * CONTROLLED_GDP_GROWTH_VARIATION,
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
                + variations["unemployment"] * CONTROLLED_UNEMPLOYMENT_VARIATION,
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

    return results, shock_events, updated_last_triggered


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
    last_triggered_by_country_shock: dict[tuple[str, str], int] = {}

    for year in range(start_year, end_year):
        yearly_results, yearly_shock_events, last_triggered_by_country_shock = simulate_year(
            countries,
            year,
            scenario,
            variation_seed,
            shock_definitions=shock_definitions,
            last_triggered_by_country_shock=last_triggered_by_country_shock,
        )
        results.extend(yearly_results)
        shock_events.extend(yearly_shock_events)

    return results, shock_events


def aggregate_country_results(
    region_results: list[RegionYearResult],
    countries: list[Country],
) -> list[CountryYearResult]:
    country_by_code = {country.code: country for country in countries}
    grouped_results: dict[tuple[int, int, str], list[RegionYearResult]] = {}
    state_by_country_code = {
        country.code: initialize_country_state(country)
        for country in countries
    }

    for result in region_results:
        key = (result.start_year, result.end_year, result.country_code)
        grouped_results.setdefault(key, []).append(result)

    country_results: list[CountryYearResult] = []

    for (start_year, end_year, country_code), entries in sorted(grouped_results.items()):
        start_population = sum_metric(entries, "start_population")
        end_population = sum_metric(entries, "end_population")
        births = sum_metric(entries, "births")
        deaths = sum_metric(entries, "deaths")
        natural_change = sum_metric(entries, "natural_change")
        net_external_migration = sum_metric(entries, "net_external_migration")
        internal_migration = sum_metric(entries, "internal_migration")
        start_gdp_billion_eur = sum_metric(entries, "start_gdp_billion_eur")
        end_gdp_billion_eur = sum_metric(entries, "end_gdp_billion_eur")

        gdp_growth_rate = 0.0
        if start_gdp_billion_eur > 0:
            gdp_growth_rate = (end_gdp_billion_eur / start_gdp_billion_eur) - 1.0

        gdp_per_capita_eur = 0.0
        if end_population > 0:
            gdp_per_capita_eur = (end_gdp_billion_eur * 1_000_000_000) / end_population

        average_population_density = average_metric(entries, "population_density")
        average_housing_overload = average_metric(entries, "housing_overload")
        average_regional_attractiveness = average_metric(entries, "regional_attractiveness")
        average_unemployment_rate = weighted_average_metric(
            entries,
            "unemployment_rate",
            "end_population",
        )

        country = country_by_code.get(country_code)
        if country is None:
            current_state = DEFAULT_COUNTRY_STATE.copy()
            country_name = country_code
        else:
            current_state = evolve_country_state(
                country,
                state_by_country_code[country_code],
                gdp_growth_rate,
                average_unemployment_rate,
                average_regional_attractiveness,
            )
            state_by_country_code[country_code] = current_state
            country_name = country.name

        country_results.append(
            CountryYearResult(
                start_year=start_year,
                end_year=end_year,
                country_name=country_name,
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
                budget_balance_pct_gdp=current_state["budget_balance_pct_gdp"],
                debt_to_gdp=current_state["debt_to_gdp"],
                stability_index=current_state["stability_index"],
                corruption_index=current_state["corruption_index"],
                investment_climate_index=current_state["investment_climate_index"],
            )
        )

    return country_results
