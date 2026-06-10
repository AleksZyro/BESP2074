from besp.models import CountryYearResult, RegionYearResult
from besp.simulation import (
    MAX_ELECTION_TENSION_INDEX,
    MAX_GDP_GROWTH,
    MAX_INFLATION_RATE,
    MAX_INTEGRATION_INDEX,
    MAX_ELECTION_ALIGNMENT_INDEX,
    MAX_SATISFACTION_INDEX,
    MAX_UNEMPLOYMENT_RATE,
    MIN_ELECTION_ALIGNMENT_INDEX,
    MIN_ELECTION_TENSION_INDEX,
    MIN_GDP_GROWTH,
    MIN_INFLATION_RATE,
    MIN_INTEGRATION_INDEX,
    MIN_SATISFACTION_INDEX,
    MIN_UNEMPLOYMENT_RATE,
    STATE_SPECS,
)
BOUND_TOLERANCE = 1e-9
REGION_BOUNDS = {
    "unemployment_rate": (MIN_UNEMPLOYMENT_RATE, MAX_UNEMPLOYMENT_RATE),
    "gdp_growth_rate": (MIN_GDP_GROWTH, MAX_GDP_GROWTH),
    "integration_index": (MIN_INTEGRATION_INDEX, MAX_INTEGRATION_INDEX),
    "inflation_rate": (MIN_INFLATION_RATE, MAX_INFLATION_RATE),
    "satisfaction_index": (MIN_SATISFACTION_INDEX, MAX_SATISFACTION_INDEX),
    "election_tension_index": (MIN_ELECTION_TENSION_INDEX, MAX_ELECTION_TENSION_INDEX),
    "election_alignment_index": (MIN_ELECTION_ALIGNMENT_INDEX, MAX_ELECTION_ALIGNMENT_INDEX),
}
COUNTRY_BOUNDS = {
    "average_unemployment_rate": (MIN_UNEMPLOYMENT_RATE, MAX_UNEMPLOYMENT_RATE),
    "gdp_growth_rate": (MIN_GDP_GROWTH, MAX_GDP_GROWTH),
    "average_integration_index": (MIN_INTEGRATION_INDEX, MAX_INTEGRATION_INDEX),
    "average_inflation_rate": (MIN_INFLATION_RATE, MAX_INFLATION_RATE),
    "average_satisfaction_index": (MIN_SATISFACTION_INDEX, MAX_SATISFACTION_INDEX),
    "election_tension_index": (MIN_ELECTION_TENSION_INDEX, MAX_ELECTION_TENSION_INDEX),
    "election_alignment_index": (MIN_ELECTION_ALIGNMENT_INDEX, MAX_ELECTION_ALIGNMENT_INDEX),
    **{field_name: spec["bounds"] for field_name, spec in STATE_SPECS.items()},
}
def append_range_warning(
    warnings: list[str],
    year_label: str,
    field_name: str,
    value: float,
    minimum: float,
    maximum: float,
) -> None:
    if minimum - BOUND_TOLERANCE <= value <= maximum + BOUND_TOLERANCE:
        return
    warnings.append(
        f"{year_label}: {field_name} {value:.3f} is outside "
        f"[{minimum:.3f}, {maximum:.3f}]."
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
        for field_name, (minimum, maximum) in REGION_BOUNDS.items():
            append_range_warning(
                warnings,
                year_label,
                field_name,
                getattr(result, field_name),
                minimum,
                maximum,
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
        for field_name, (minimum, maximum) in COUNTRY_BOUNDS.items():
            append_range_warning(
                warnings,
                year_label,
                field_name,
                getattr(result, field_name),
                minimum,
                maximum,
            )
    grouped_country_results: dict[str, list[CountryYearResult]] = {}
    for result in country_results:
        grouped_country_results.setdefault(result.country_code, []).append(result)
    for country_code, entries in grouped_country_results.items():
        sorted_entries = sorted(entries, key=lambda entry: entry.start_year)
        for previous, current in zip(sorted_entries, sorted_entries[1:]):
            year_label = (
                f"{previous.start_year}->{previous.end_year} to "
                f"{current.start_year}->{current.end_year} {country_code}"
            )
            for field_name, spec in STATE_SPECS.items():
                delta = abs(getattr(current, field_name) - getattr(previous, field_name))
                if delta <= spec["max_step"] + 1e-9:
                    continue
                warnings.append(
                    f"{year_label}: {field_name} step {delta:.3f} exceeds "
                    f"{spec['max_step']:.3f}."
                )
    return warnings
