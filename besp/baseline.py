from besp.models import Country, Region


MIN_REGION_UNEMPLOYMENT = 0.04
MAX_REGION_UNEMPLOYMENT = 0.35


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def weighted_average(
    regions: list[Region],
    value_getter,
    weight_getter,
) -> float:
    total_weight = sum(weight_getter(region) for region in regions)
    if total_weight <= 0:
        return 0.0

    return sum(
        value_getter(region) * weight_getter(region)
        for region in regions
    ) / total_weight


def scale_integer_attribute_to_total(
    regions: list[Region],
    attribute_name: str,
    target_total: int,
) -> None:
    if not regions:
        return

    safe_target_total = max(int(target_total), 0)
    current_values = [max(int(getattr(region, attribute_name)), 0) for region in regions]
    current_total = sum(current_values)

    if current_total <= 0:
        even_share = safe_target_total // len(regions)
        remainder = safe_target_total - even_share * len(regions)
        for index, region in enumerate(regions):
            setattr(region, attribute_name, even_share + (1 if index < remainder else 0))
        return

    scaled_values: list[int] = []
    fractions: list[tuple[float, int]] = []
    running_total = 0

    for index, (region, current_value) in enumerate(zip(regions, current_values)):
        raw_scaled = (current_value / current_total) * safe_target_total
        scaled_value = int(raw_scaled)
        if current_value > 0 and safe_target_total > 0:
            scaled_value = max(scaled_value, 1)
        scaled_values.append(scaled_value)
        fractions.append((raw_scaled - int(raw_scaled), index))
        running_total += scaled_value

    difference = safe_target_total - running_total

    if difference > 0:
        for _, index in sorted(fractions, reverse=True):
            if difference <= 0:
                break
            scaled_values[index] += 1
            difference -= 1
    elif difference < 0:
        removable_indices = sorted(
            range(len(regions)),
            key=lambda index: scaled_values[index],
            reverse=True,
        )
        while difference < 0:
            adjusted = False
            for index in removable_indices:
                minimum_allowed = 1 if current_values[index] > 0 and safe_target_total > 0 else 0
                if scaled_values[index] <= minimum_allowed:
                    continue
                scaled_values[index] -= 1
                difference += 1
                adjusted = True
                if difference == 0:
                    break
            if not adjusted:
                break

    for region, scaled_value in zip(regions, scaled_values):
        setattr(region, attribute_name, max(int(scaled_value), 0))


def scale_float_attribute_to_total(
    regions: list[Region],
    attribute_name: str,
    target_total: float,
) -> None:
    if not regions:
        return

    safe_target_total = max(float(target_total), 0.0)
    current_total = sum(max(float(getattr(region, attribute_name)), 0.0) for region in regions)

    if current_total <= 0:
        even_share = safe_target_total / len(regions)
        for region in regions:
            setattr(region, attribute_name, even_share)
        return

    scale_factor = safe_target_total / current_total
    for region in regions:
        current_value = max(float(getattr(region, attribute_name)), 0.0)
        setattr(region, attribute_name, max(current_value * scale_factor, 0.01))


def initialize_region_soft_metrics(country: Country, region: Region) -> None:
    integration_anchor = (
        country.base_integration_index
        + (region.infrastructure - 0.50) * 0.12
        + (region.urbanization - 0.50) * 0.10
        + region.metro_pull * 0.04
    )
    satisfaction_anchor = (
        country.base_satisfaction_index
        + (region.economic_attractiveness - 0.50) * 0.18
        + (region.infrastructure - 0.50) * 0.10
        + region.metro_pull * 0.05
    )

    region.integration_index = clamp(integration_anchor, 0.15, 0.92)
    region.satisfaction_index = clamp(satisfaction_anchor, 0.20, 0.90)
    region.inflation_sensitivity = clamp(
        1.0
        + (region.urbanization - 0.50) * 0.18
        + max(region.metro_pull, 0.0) * 0.08,
        0.85,
        1.20,
    )
    region.election_sensitivity = clamp(
        1.0
        + (0.50 - region.infrastructure) * 0.15
        + (0.50 - region.economic_attractiveness) * 0.12,
        0.85,
        1.22,
    )


def align_country_baseline(country: Country) -> None:
    if not country.regions:
        return

    original_population_by_region = {
        region.name: max(region.population, 0)
        for region in country.regions
    }
    original_capacity_by_region = {
        region.name: max(region.housing_capacity, 0)
        for region in country.regions
    }

    if country.baseline_population > 0:
        scale_integer_attribute_to_total(
            country.regions,
            "population",
            country.baseline_population,
        )

    if country.baseline_population > 0:
        for region in country.regions:
            original_population = max(original_population_by_region.get(region.name, 0), 1)
            original_capacity = original_capacity_by_region.get(region.name, region.housing_capacity)
            capacity_ratio = original_capacity / original_population
            region.housing_capacity = max(round(region.population * capacity_ratio), region.population)

    if country.baseline_gdp_billion_eur > 0:
        scale_float_attribute_to_total(
            country.regions,
            "gdp_billion_eur",
            country.baseline_gdp_billion_eur,
        )
    elif country.baseline_gdp_scale_vs_2020 > 0:
        for region in country.regions:
            region.gdp_billion_eur = max(
                region.gdp_billion_eur * country.baseline_gdp_scale_vs_2020,
                0.01,
            )

    current_unemployment = weighted_average(
        country.regions,
        lambda region: region.unemployment_rate,
        lambda region: region.population,
    )
    target_unemployment = clamp(
        country.baseline_unemployment_rate,
        MIN_REGION_UNEMPLOYMENT,
        MAX_REGION_UNEMPLOYMENT,
    )
    delta = target_unemployment - current_unemployment

    for region in country.regions:
        region.unemployment_rate = clamp(
            region.unemployment_rate + delta,
            MIN_REGION_UNEMPLOYMENT,
            MAX_REGION_UNEMPLOYMENT,
        )

    for region in country.regions:
        initialize_region_soft_metrics(country, region)

        note = region.population_note or ""
        if "2020 simulation start" in note:
            region.population_note = note.replace(
                "2020 simulation start.",
                f"{country.baseline_year} calibrated baseline with preserved regional shares.",
            )


def align_country_baselines(countries: list[Country]) -> None:
    for country in countries:
        align_country_baseline(country)
