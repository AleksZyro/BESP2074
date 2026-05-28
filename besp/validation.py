from besp.models import CountryYearResult, RegionYearResult
from besp.simulation import (
    MAX_BUDGET_BALANCE_PCT_GDP,
    MAX_CORRUPTION_INDEX,
    MAX_DEBT_TO_GDP,
    MAX_GDP_GROWTH,
    MAX_INVESTMENT_CLIMATE_INDEX,
    MAX_STABILITY_INDEX,
    MAX_UNEMPLOYMENT_RATE,
    MIN_BUDGET_BALANCE_PCT_GDP,
    MIN_CORRUPTION_INDEX,
    MIN_DEBT_TO_GDP,
    MIN_GDP_GROWTH,
    MIN_INVESTMENT_CLIMATE_INDEX,
    MIN_STABILITY_INDEX,
    MIN_UNEMPLOYMENT_RATE,
    MAX_BUDGET_BALANCE_STEP,
    MAX_CORRUPTION_STEP,
    MAX_DEBT_TO_GDP_STEP,
    MAX_INVESTMENT_CLIMATE_STEP,
    MAX_STABILITY_STEP,
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

        if not (MIN_BUDGET_BALANCE_PCT_GDP <= result.budget_balance_pct_gdp <= MAX_BUDGET_BALANCE_PCT_GDP):
            warnings.append(
                f"{year_label}: budget_balance_pct_gdp {result.budget_balance_pct_gdp:.3f} is outside "
                f"[{MIN_BUDGET_BALANCE_PCT_GDP:.3f}, {MAX_BUDGET_BALANCE_PCT_GDP:.3f}]."
            )

        if not (MIN_DEBT_TO_GDP <= result.debt_to_gdp <= MAX_DEBT_TO_GDP):
            warnings.append(
                f"{year_label}: debt_to_gdp {result.debt_to_gdp:.3f} is outside "
                f"[{MIN_DEBT_TO_GDP:.3f}, {MAX_DEBT_TO_GDP:.3f}]."
            )

        if not (MIN_STABILITY_INDEX <= result.stability_index <= MAX_STABILITY_INDEX):
            warnings.append(
                f"{year_label}: stability_index {result.stability_index:.3f} is outside "
                f"[{MIN_STABILITY_INDEX:.3f}, {MAX_STABILITY_INDEX:.3f}]."
            )

        if not (MIN_CORRUPTION_INDEX <= result.corruption_index <= MAX_CORRUPTION_INDEX):
            warnings.append(
                f"{year_label}: corruption_index {result.corruption_index:.3f} is outside "
                f"[{MIN_CORRUPTION_INDEX:.3f}, {MAX_CORRUPTION_INDEX:.3f}]."
            )

        if not (
            MIN_INVESTMENT_CLIMATE_INDEX
            <= result.investment_climate_index
            <= MAX_INVESTMENT_CLIMATE_INDEX
        ):
            warnings.append(
                f"{year_label}: investment_climate_index {result.investment_climate_index:.3f} is outside "
                f"[{MIN_INVESTMENT_CLIMATE_INDEX:.3f}, {MAX_INVESTMENT_CLIMATE_INDEX:.3f}]."
            )

    grouped_country_results: dict[str, list[CountryYearResult]] = {}
    for result in country_results:
        grouped_country_results.setdefault(result.country_code, []).append(result)

    for country_code, entries in grouped_country_results.items():
        sorted_entries = sorted(entries, key=lambda entry: entry.start_year)
        for previous, current in zip(sorted_entries, sorted_entries[1:]):
            budget_delta = abs(current.budget_balance_pct_gdp - previous.budget_balance_pct_gdp)
            debt_delta = abs(current.debt_to_gdp - previous.debt_to_gdp)
            stability_delta = abs(current.stability_index - previous.stability_index)
            corruption_delta = abs(current.corruption_index - previous.corruption_index)
            investment_delta = abs(
                current.investment_climate_index - previous.investment_climate_index
            )
            year_label = (
                f"{previous.start_year}->{previous.end_year} to "
                f"{current.start_year}->{current.end_year} {country_code}"
            )

            if budget_delta > MAX_BUDGET_BALANCE_STEP + 1e-9:
                warnings.append(
                    f"{year_label}: budget_balance_pct_gdp step {budget_delta:.3f} exceeds "
                    f"{MAX_BUDGET_BALANCE_STEP:.3f}."
                )
            if debt_delta > MAX_DEBT_TO_GDP_STEP + 1e-9:
                warnings.append(
                    f"{year_label}: debt_to_gdp step {debt_delta:.3f} exceeds "
                    f"{MAX_DEBT_TO_GDP_STEP:.3f}."
                )
            if stability_delta > MAX_STABILITY_STEP + 1e-9:
                warnings.append(
                    f"{year_label}: stability_index step {stability_delta:.3f} exceeds "
                    f"{MAX_STABILITY_STEP:.3f}."
                )
            if corruption_delta > MAX_CORRUPTION_STEP + 1e-9:
                warnings.append(
                    f"{year_label}: corruption_index step {corruption_delta:.3f} exceeds "
                    f"{MAX_CORRUPTION_STEP:.3f}."
                )
            if investment_delta > MAX_INVESTMENT_CLIMATE_STEP + 1e-9:
                warnings.append(
                    f"{year_label}: investment_climate_index step {investment_delta:.3f} exceeds "
                    f"{MAX_INVESTMENT_CLIMATE_STEP:.3f}."
                )

    return warnings
