from besp.models import Country, CountryYearResult, Region, RegionYearResult

ECONOMIC_WEIGHT = 0.50
INFRASTRUCTURE_WEIGHT = 0.20
URBANIZATION_WEIGHT = 0.10
METRO_PULL_WEIGHT = 0.20

INTERNAL_MIGRATION_STRENGTH = 0.02
MAX_INTERNAL_MIGRATION_RATE = 0.012


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def calculate_housing_penalty(region: Region) -> float:
    overload = region.housing_overload

    if overload <= 1.0:
        return 0.0

    return min((overload - 1.0) * 0.25, 0.15)


def calculate_regional_attractiveness(region: Region) -> float:
    positive_score = (
        region.economic_attractiveness * ECONOMIC_WEIGHT
        + region.infrastructure * INFRASTRUCTURE_WEIGHT
        + region.urbanization * URBANIZATION_WEIGHT
        + region.metro_pull * METRO_PULL_WEIGHT
    )

    return positive_score - calculate_housing_penalty(region)


def calculate_country_average_attractiveness(country: Country) -> float:
    total_population = sum(region.population for region in country.regions)

    if total_population <= 0:
        return 0.0

    weighted_sum = sum(
        calculate_regional_attractiveness(region) * region.population
        for region in country.regions
    )

    return weighted_sum / total_population


def calculate_internal_migration(
    region: Region,
    country_average_attractiveness: float,
) -> int:
    regional_attractiveness = calculate_regional_attractiveness(region)
    attractiveness_gap = regional_attractiveness - country_average_attractiveness

    migration_rate = clamp(
        attractiveness_gap * INTERNAL_MIGRATION_STRENGTH,
        -MAX_INTERNAL_MIGRATION_RATE,
        MAX_INTERNAL_MIGRATION_RATE,
    )

    return round(region.population * migration_rate)


def calculate_external_migration_rate(country: Country, region: Region) -> float:
    attractiveness = calculate_regional_attractiveness(region)

    retention_factor = clamp(1.10 - attractiveness, 0.35, 1.15)

    return (
        country.base_net_migration_rate
        * region.net_migration_modifier
        * retention_factor
    )


def simulate_year(countries: list[Country], start_year: int) -> list[RegionYearResult]:
    end_year = start_year + 1
    results: list[RegionYearResult] = []

    for country in countries:
        if not country.regions:
            continue

        average_attractiveness = calculate_country_average_attractiveness(country)

        raw_internal_migration: dict[str, int] = {}

        for region in country.regions:
            raw_internal_migration[region.name] = calculate_internal_migration(
                region,
                average_attractiveness,
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

            birth_rate = country.base_birth_rate * region.birth_rate_modifier
            death_rate = country.base_death_rate * region.death_rate_modifier
            external_migration_rate = calculate_external_migration_rate(country, region)

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
            regional_attractiveness = calculate_regional_attractiveness(region)

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
                    area_km2=region.area_km2,
                    population_density=region.population_density,
                    housing_overload=region.housing_overload,
                    regional_attractiveness=regional_attractiveness,
                    data_confidence=region.data_confidence,
                    population_note=region.population_note,
                )
            )

    return results


def simulate_period(
    countries: list[Country],
    start_year: int,
    end_year: int,
) -> list[RegionYearResult]:
    results: list[RegionYearResult] = []

    for year in range(start_year, end_year):
        yearly_results = simulate_year(countries, year)
        results.extend(yearly_results)

    return results


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
                average_population_density=average_population_density,
                average_housing_overload=average_housing_overload,
                average_regional_attractiveness=average_regional_attractiveness,
            )
        )

    return country_results
