from besp.models import Country, Region, RegionYearResult


def calculate_regional_attractiveness(region: Region) -> float:
    positive_score = (
        region.economic_attractiveness * 0.60
        + region.infrastructure * 0.30
        + region.urbanization * 0.10
    )

    overload = region.housing_overload

    if overload <= 1.0:
        housing_penalty = 0.0
    else:
        # Small penalty: overloaded regions become less attractive,
        # but strong urban/economic centers can remain attractive.
        housing_penalty = min((overload - 1.0) * 0.25, 0.15)

    return positive_score - housing_penalty


def calculate_internal_migration(
    region: Region,
    country_average_attractiveness: float,
) -> int:
    regional_attractiveness = calculate_regional_attractiveness(region)
    attractiveness_gap = regional_attractiveness - country_average_attractiveness

    # Very small yearly movement to keep realistic inertia.
    migration_rate = attractiveness_gap * 0.002

    return round(region.population * migration_rate)


def simulate_year(countries: list[Country], start_year: int) -> list[RegionYearResult]:
    results: list[RegionYearResult] = []

    for country in countries:
        if not country.regions:
            continue

        average_attractiveness = sum(
            calculate_regional_attractiveness(region)
            for region in country.regions
        ) / len(country.regions)

        raw_internal_migration: dict[str, int] = {}

        for region in country.regions:
            raw_internal_migration[region.name] = calculate_internal_migration(
                region,
                average_attractiveness,
            )

        # Internal migration should redistribute population inside a country.
        # This correction prevents population from being created or destroyed.
        migration_balance = sum(raw_internal_migration.values())

        if migration_balance != 0:
            strongest_region = max(
                country.regions,
                key=lambda region: abs(raw_internal_migration[region.name]),
            )
            raw_internal_migration[strongest_region.name] -= migration_balance

        for region in country.regions:
            start_population = region.population

            birth_rate = country.base_birth_rate * region.birth_rate_modifier
            death_rate = country.base_death_rate * region.death_rate_modifier
            net_migration_rate = (
                country.base_net_migration_rate * region.net_migration_modifier
            )

            births = round(start_population * birth_rate)
            deaths = round(start_population * death_rate)
            net_external_migration = round(start_population * net_migration_rate)
            internal_migration = raw_internal_migration[region.name]

            end_population = (
                start_population
                + births
                - deaths
                + net_external_migration
                + internal_migration
            )

            region.population = max(end_population, 0)

            results.append(
                RegionYearResult(
                    region_name=region.name,
                    country_code=region.country_code,
                    start_population=start_population,
                    births=births,
                    deaths=deaths,
                    net_external_migration=net_external_migration,
                    internal_migration=internal_migration,
                    end_population=region.population,
                    population_density=region.population_density,
                    housing_overload=region.housing_overload,
                    data_confidence=region.data_confidence,
                    population_note=region.population_note,
                )
            )

    return results
