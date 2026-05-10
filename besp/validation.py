from besp.models import CountryYearResult, RegionYearResult
from besp.simulation import (
    MAX_GDP_GROWTH,
    MAX_UNEMPLOYMENT_RATE,
    MIN_GDP_GROWTH,
    MIN_UNEMPLOYMENT_RATE,
)


def validate_simulation_results(
    country_results: list[CountryYearResult],
    region_results: list[RegionYearResult],
) -> list[str]:
    warnings: list[str] = []

    for result in region_results:
        year_label = f"{result.start_year}->{result.end_year} {result.country_code}/{result.region_name}"

        if result.end_population < 0:
            warnings.append(f"{year_label}: end_population is negative.")

        if result.end_gdp_billion_eur <= 0:
            warnings.append(f"{year_label}: end_gdp_billion_eur is <= 0.")

        if result.gdp_per_capita_eur < 0:
            warnings.append(f"{year_label}: gdp_per_capita_eur is negative.")

        if not (MIN_UNEMPLOYMENT_RATE <= result.unemployment_rate <= MAX_UNEMPLOYMENT_RATE):
            warnings.append(
                f"{year_label}: unemployment_rate {result.unemployment_rate:.3f} is outside "
                f"[{MIN_UNEMPLOYMENT_RATE:.3f}, {MAX_UNEMPLOYMENT_RATE:.3f}]."
            )

        if not (MIN_GDP_GROWTH <= result.gdp_growth_rate <= MAX_GDP_GROWTH):
            warnings.append(
                f"{year_label}: gdp_growth_rate {result.gdp_growth_rate:.3f} is outside "
                f"[{MIN_GDP_GROWTH:.3f}, {MAX_GDP_GROWTH:.3f}]."
            )

    for result in country_results:
        year_label = f"{result.start_year}->{result.end_year} {result.country_code}"

        if result.end_population < 0:
            warnings.append(f"{year_label}: country end_population is negative.")

        if result.end_gdp_billion_eur <= 0:
            warnings.append(f"{year_label}: country end_gdp_billion_eur is <= 0.")

        if result.gdp_per_capita_eur < 0:
            warnings.append(f"{year_label}: country gdp_per_capita_eur is negative.")

        if abs(result.internal_migration) > 5:
            warnings.append(
                f"{year_label}: internal_migration is {result.internal_migration}, expected near 0."
            )

        if not (MIN_UNEMPLOYMENT_RATE <= result.average_unemployment_rate <= MAX_UNEMPLOYMENT_RATE):
            warnings.append(
                f"{year_label}: average_unemployment_rate {result.average_unemployment_rate:.3f} "
                f"is outside [{MIN_UNEMPLOYMENT_RATE:.3f}, {MAX_UNEMPLOYMENT_RATE:.3f}]."
            )

        if not (MIN_GDP_GROWTH <= result.gdp_growth_rate <= MAX_GDP_GROWTH):
            warnings.append(
                f"{year_label}: country gdp_growth_rate {result.gdp_growth_rate:.3f} is outside "
                f"[{MIN_GDP_GROWTH:.3f}, {MAX_GDP_GROWTH:.3f}]."
            )

    return warnings
