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
CONTROLLED_INTEGRATION_VARIATION = 0.018
CONTROLLED_INFLATION_VARIATION = 0.004
CONTROLLED_SATISFACTION_VARIATION = 0.020
CONTROLLED_ELECTION_VARIATION = 0.035
CONTROLLED_ELECTION_ALIGNMENT_VARIATION = 0.090

MIN_INTEGRATION_INDEX = 0.15
MAX_INTEGRATION_INDEX = 0.95
MIN_INFLATION_RATE = -0.03
MAX_INFLATION_RATE = 0.20
MIN_SATISFACTION_INDEX = 0.18
MAX_SATISFACTION_INDEX = 0.95
MIN_ELECTION_TENSION_INDEX = 0.05
MAX_ELECTION_TENSION_INDEX = 0.95
MIN_ELECTION_ALIGNMENT_INDEX = -1.0
MAX_ELECTION_ALIGNMENT_INDEX = 1.0

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
    average_integration_index: float,
    average_inflation_rate: float,
    average_satisfaction_index: float,
    election_tension_index: float,
) -> dict[str, float]:
    growth_gap = gdp_growth_rate - BASE_GDP_GROWTH
    unemployment_gap = average_unemployment_rate - 0.12
    attractiveness_gap = average_regional_attractiveness - 0.50
    integration_gap = average_integration_index - country.base_integration_index
    inflation_gap = average_inflation_rate - country.baseline_inflation_rate
    satisfaction_gap = average_satisfaction_index - country.base_satisfaction_index
    election_gap = election_tension_index - 0.50

    budget_target = (
        country.base_budget_balance_pct_gdp
        + growth_gap * 0.35
        - unemployment_gap * 0.06
        + attractiveness_gap * 0.03
        + satisfaction_gap * 0.03
        - max(inflation_gap, 0.0) * 0.18
        - max(election_gap - 0.10, 0.0) * 0.01
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
        + integration_gap * 0.65
        + satisfaction_gap * 0.85
        - (previous_state["corruption_index"] - 0.50) * 0.50
        - max(average_inflation_rate - 0.03, 0.0) * 1.30
        - max(election_tension_index - 0.65, 0.0) * 0.45
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
        - integration_gap * 0.35
        - satisfaction_gap * 0.20
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
        + integration_gap * 0.45
        + satisfaction_gap * 0.40
        - max(average_inflation_rate - 0.03, 0.0) * 1.10
        - max(election_tension_index - 0.65, 0.0) * 0.18
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


def resolve_election_window(country: Country, start_year: int) -> dict[str, int | float | bool]:
    cycle_years = max(country.election_cycle_years, 1)
    baseline_last_year = int(country.last_election_year)

    if start_year <= baseline_last_year:
        last_year = baseline_last_year
        next_year = baseline_last_year + cycle_years
        progress = 0.0
        happened_this_year = start_year == baseline_last_year
    else:
        cycles_since_baseline = (start_year - baseline_last_year) // cycle_years
        last_year = baseline_last_year + cycles_since_baseline * cycle_years
        next_year = last_year + cycle_years
        progress = clamp((start_year - last_year) / cycle_years, 0.0, 1.0)
        happened_this_year = start_year == last_year

    return {
        "last_year": last_year,
        "next_year": next_year,
        "cycle_years": cycle_years,
        "progress": progress,
        "happened_this_year": happened_this_year,
    }


def calculate_election_cycle_pressure(
    country: Country,
    region: Region,
    start_year: int,
    unemployment_rate: float,
    inflation_rate: float,
    satisfaction_index: float,
    scenario: SimulationScenario | None = None,
    variation_signal: float = 0.0,
) -> float:
    cycle_years = max(country.election_cycle_years, 1)
    years_since_last = max(0, start_year - country.last_election_year)
    years_to_next = (cycle_years - (years_since_last % cycle_years)) % cycle_years

    if years_to_next == 0:
        base_pressure = 0.82
    elif years_to_next == 1:
        base_pressure = 0.68
    elif years_since_last % cycle_years == 1:
        base_pressure = 0.56
    else:
        base_pressure = 0.36

    social_stress = (
        max(unemployment_rate - 0.09, 0.0) * 1.25
        + max(inflation_rate - 0.02, 0.0) * 2.10
        + max(0.52 - satisfaction_index, 0.0) * 0.90
    )
    scenario_bias = scenario.election_tension_bias if scenario else 0.0

    return clamp(
        base_pressure
        + (country.election_sensitivity - 0.55) * 0.35
        + (region.election_sensitivity - 1.0) * 0.18
        + social_stress
        + scenario_bias
        + variation_signal * CONTROLLED_ELECTION_VARIATION,
        MIN_ELECTION_TENSION_INDEX,
        MAX_ELECTION_TENSION_INDEX,
    )


def calculate_election_alignment_index(
    country: Country,
    region: Region,
    previous_alignment_index: float,
    unemployment_rate: float,
    inflation_rate: float,
    satisfaction_index: float,
    election_tension_index: float,
    election_window: dict[str, int | float | bool],
    scenario: SimulationScenario | None = None,
    variation_signal: float = 0.0,
) -> float:
    structural_anchor = clamp(
        country.base_election_alignment_index + region.political_identity_bias,
        MIN_ELECTION_ALIGNMENT_INDEX,
        MAX_ELECTION_ALIGNMENT_INDEX,
    )
    prior_alignment = clamp(
        previous_alignment_index if abs(previous_alignment_index) > 1e-9 else structural_anchor,
        MIN_ELECTION_ALIGNMENT_INDEX,
        MAX_ELECTION_ALIGNMENT_INDEX,
    )
    inflation_gap = inflation_rate - country.baseline_inflation_rate
    satisfaction_gap = country.base_satisfaction_index - satisfaction_index
    unemployment_gap = unemployment_rate - country.baseline_unemployment_rate
    stress_bias = clamp(
        max(inflation_gap, 0.0) * 1.8
        + max(unemployment_gap, 0.0) * 1.1
        + max(satisfaction_gap, 0.0) * 1.2
        + max(election_tension_index - 0.55, 0.0) * 0.45,
        0.0,
        0.38,
    )
    direction_seed = prior_alignment if abs(prior_alignment) > 0.08 else structural_anchor
    direction = 1.0 if direction_seed >= 0 else -1.0
    scenario_push = (scenario.election_tension_bias if scenario else 0.0) * 2.2
    election_push = clamp(
        direction * stress_bias
        + variation_signal * CONTROLLED_ELECTION_ALIGNMENT_VARIATION
        + scenario_push,
        -0.42,
        0.42,
    )
    target_alignment = clamp(
        structural_anchor + election_push,
        MIN_ELECTION_ALIGNMENT_INDEX,
        MAX_ELECTION_ALIGNMENT_INDEX,
    )
    cycle_progress = float(election_window["progress"])
    if election_window["happened_this_year"]:
        structural_keep = 0.34
    elif cycle_progress >= 0.75:
        structural_keep = 0.76
    else:
        structural_keep = 0.88

    return clamp(
        prior_alignment * structural_keep
        + target_alignment * (1.0 - structural_keep),
        MIN_ELECTION_ALIGNMENT_INDEX,
        MAX_ELECTION_ALIGNMENT_INDEX,
    )


def calculate_regional_inflation_rate(
    country: Country,
    region: Region,
    gdp_growth_rate: float,
    election_tension_index: float,
    scenario: SimulationScenario | None = None,
    variation_signal: float = 0.0,
) -> float:
    base_inflation = country.baseline_inflation_rate + (scenario.inflation_bias if scenario else 0.0)
    growth_heat = max(gdp_growth_rate - 0.025, 0.0) * 0.55
    housing_pressure = max(region.housing_overload - 1.0, 0.0) * 0.08
    election_pressure = max(election_tension_index - 0.45, 0.0) * 0.015

    return clamp(
        (
            base_inflation
            + growth_heat
            + housing_pressure
            + election_pressure
        ) * region.inflation_sensitivity
        + variation_signal * CONTROLLED_INFLATION_VARIATION,
        MIN_INFLATION_RATE,
        MAX_INFLATION_RATE,
    )


def calculate_next_integration_index(
    country: Country,
    region: Region,
    net_external_migration: int,
    internal_migration: int,
    regional_attractiveness: float,
    inflation_rate: float,
    election_tension_index: float,
    scenario: SimulationScenario | None = None,
    variation_signal: float = 0.0,
) -> float:
    current_population = max(region.population, 1)
    migration_balance_rate = (net_external_migration + internal_migration) / current_population
    annexation_penalty = current_annexation_penalty(region, "integration")
    target = (
        country.base_integration_index
        + (scenario.integration_bias if scenario else 0.0)
        + (region.infrastructure - 0.50) * 0.10
        + (regional_attractiveness - 0.50) * 0.12
        + (region.satisfaction_index - 0.50) * 0.18
        - max(-migration_balance_rate, 0.0) * 1.30
        - max(inflation_rate - 0.03, 0.0) * 0.35
        - max(election_tension_index - 0.60, 0.0) * 0.20
        - annexation_penalty
    )

    return clamp(
        region.integration_index * 0.72
        + target * 0.28
        + variation_signal * CONTROLLED_INTEGRATION_VARIATION,
        MIN_INTEGRATION_INDEX,
        MAX_INTEGRATION_INDEX,
    )


def calculate_next_satisfaction_index(
    country: Country,
    region: Region,
    gdp_growth_rate: float,
    inflation_rate: float,
    election_tension_index: float,
    regional_attractiveness: float,
    scenario: SimulationScenario | None = None,
    variation_signal: float = 0.0,
) -> float:
    annexation_penalty = current_annexation_penalty(region, "satisfaction")
    target = (
        country.base_satisfaction_index
        + (scenario.satisfaction_bias if scenario else 0.0)
        + (gdp_growth_rate - BASE_GDP_GROWTH) * 2.80
        - max(region.unemployment_rate - 0.08, 0.0) * 1.15
        - max(inflation_rate, 0.0) * 1.30
        + (regional_attractiveness - 0.50) * 0.28
        + (region.integration_index - 0.50) * 0.22
        - max(election_tension_index - 0.65, 0.0) * 0.25
        - annexation_penalty
    )

    return clamp(
        region.satisfaction_index * 0.68
        + target * 0.32
        + variation_signal * CONTROLLED_SATISFACTION_VARIATION,
        MIN_SATISFACTION_INDEX,
        MAX_SATISFACTION_INDEX,
    )


def calculate_housing_penalty(region: Region) -> float:
    overload = region.housing_overload

    if overload <= 1.0:
        return 0.0

    return min((overload - 1.0) * 0.25, 0.15)


def current_annexation_penalty(
    region: Region,
    channel: str,
) -> float:
    remaining_years = max(region.annexation_pressure_years_remaining, 0)
    total_years = max(region.annexation_pressure_years_total, 0)
    if remaining_years <= 0 or total_years <= 0:
        return 0.0

    if channel == "integration":
        base_penalty = region.annexation_integration_penalty
    else:
        base_penalty = region.annexation_satisfaction_penalty

    return base_penalty * (remaining_years / total_years)


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
        election_window = resolve_election_window(country, start_year)

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
                for channel in (
                    "birth",
                    "death",
                    "migration",
                    "growth",
                    "unemployment",
                    "integration",
                    "inflation",
                    "satisfaction",
                    "election",
                )
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

            provisional_election_tension = calculate_election_cycle_pressure(
                country,
                region,
                start_year,
                region.unemployment_rate,
                country.baseline_inflation_rate,
                region.satisfaction_index,
                scenario,
                variations["election"],
            )
            inflation_rate = calculate_regional_inflation_rate(
                country,
                region,
                gdp_growth_rate,
                provisional_election_tension,
                scenario,
                variations["inflation"],
            )
            region.integration_index = calculate_next_integration_index(
                country,
                region,
                net_external_migration,
                internal_migration,
                regional_attractiveness,
                inflation_rate,
                provisional_election_tension,
                scenario,
                variations["integration"],
            )
            region.satisfaction_index = calculate_next_satisfaction_index(
                country,
                region,
                gdp_growth_rate,
                inflation_rate,
                provisional_election_tension,
                regional_attractiveness,
                scenario,
                variations["satisfaction"],
            )
            election_tension_index = calculate_election_cycle_pressure(
                country,
                region,
                start_year,
                region.unemployment_rate,
                inflation_rate,
                region.satisfaction_index,
                scenario,
                variations["election"],
            )
            previous_election_alignment = region.election_alignment_index
            region.election_alignment_index = calculate_election_alignment_index(
                country,
                region,
                previous_election_alignment,
                region.unemployment_rate,
                inflation_rate,
                region.satisfaction_index,
                election_tension_index,
                election_window,
                scenario,
                variations["election"],
            )
            election_alignment_shift = region.election_alignment_index - previous_election_alignment

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
                    integration_index=region.integration_index,
                    inflation_rate=inflation_rate,
                    satisfaction_index=region.satisfaction_index,
                    election_tension_index=election_tension_index,
                    election_alignment_index=region.election_alignment_index,
                    election_alignment_shift=election_alignment_shift,
                    election_last_year=int(election_window["last_year"]),
                    election_next_year=int(election_window["next_year"]),
                    election_cycle_progress=float(election_window["progress"]),
                    election_happened_this_year=bool(election_window["happened_this_year"]),
                    data_confidence=region.data_confidence,
                    population_note=region.population_note,
                )
            )

            if region.annexation_pressure_years_remaining > 0:
                region.annexation_pressure_years_remaining -= 1

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
        average_integration_index = weighted_average_metric(
            entries,
            "integration_index",
            "end_population",
        )
        average_inflation_rate = weighted_average_metric(
            entries,
            "inflation_rate",
            "end_gdp_billion_eur",
        )
        average_satisfaction_index = weighted_average_metric(
            entries,
            "satisfaction_index",
            "end_population",
        )
        election_alignment_index = weighted_average_metric(
            entries,
            "election_alignment_index",
            "end_population",
        )
        election_alignment_shift = weighted_average_metric(
            entries,
            "election_alignment_shift",
            "end_population",
        )
        election_tension_index = weighted_average_metric(
            entries,
            "election_tension_index",
            "end_population",
        )
        average_unemployment_rate = weighted_average_metric(
            entries,
            "unemployment_rate",
            "end_population",
        )
        election_last_year = int(entries[0].election_last_year) if entries else start_year
        election_next_year = int(entries[0].election_next_year) if entries else start_year + 4
        election_cycle_progress = float(entries[0].election_cycle_progress) if entries else 0.0
        election_happened_this_year = bool(entries[0].election_happened_this_year) if entries else False

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
                average_integration_index,
                average_inflation_rate,
                average_satisfaction_index,
                election_tension_index,
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
                average_integration_index=average_integration_index,
                average_inflation_rate=average_inflation_rate,
                average_satisfaction_index=average_satisfaction_index,
                election_tension_index=election_tension_index,
                election_alignment_index=election_alignment_index,
                election_alignment_shift=election_alignment_shift,
                election_last_year=election_last_year,
                election_next_year=election_next_year,
                election_cycle_progress=election_cycle_progress,
                election_happened_this_year=election_happened_this_year,
                budget_balance_pct_gdp=current_state["budget_balance_pct_gdp"],
                debt_to_gdp=current_state["debt_to_gdp"],
                stability_index=current_state["stability_index"],
                corruption_index=current_state["corruption_index"],
                investment_climate_index=current_state["investment_climate_index"],
            )
        )

    return country_results
