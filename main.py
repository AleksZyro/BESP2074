from pathlib import Path

from besp.exporter import build_simulation_export, save_simulation_export_json
from besp.loader import load_world
from besp.models import CountryYearResult, RegionYearResult
from besp.simulation import aggregate_country_results, simulate_period
from besp.validation import validate_simulation_results


def print_country_year_results(country_results: list[CountryYearResult]) -> None:
    current_year: int | None = None

    for result in country_results:
        if result.start_year != current_year:
            current_year = result.start_year
            print()
            print(f"Country summary: {result.start_year} -> {result.end_year}")
            print("=" * 72)

        print(
            f"{result.country_code:<4} "
            f"pop {result.end_population:>10,} | "
            f"gdp {result.end_gdp_billion_eur:>7.2f} bn | "
            f"growth {result.gdp_growth_rate * 100:>6.2f}% | "
            f"unemp {result.average_unemployment_rate * 100:>5.1f}% | "
            f"attr {result.average_regional_attractiveness:>5.3f}"
        )


def print_region_year_results(
    start_year: int,
    end_year: int,
    results: list[RegionYearResult],
) -> None:
    print()
    print(f"BESP simulation period: {start_year} -> {end_year}")
    print("=" * 72)

    current_year: int | None = None

    for result in results:
        if result.start_year != current_year:
            current_year = result.start_year
            print()
            print(f"Regions: {result.start_year} -> {result.end_year}")
            print("=" * 72)

        print(
            f"{result.country_code:<4} | {result.region_name:<32} "
            f"pop {result.end_population:>10,} | "
            f"gdp {result.end_gdp_billion_eur:>7.2f} bn | "
            f"growth {result.gdp_growth_rate * 100:>6.2f}% | "
            f"unemp {result.unemployment_rate * 100:>5.1f}%"
        )


def print_validation_warnings(warnings: list[str]) -> None:
    print()
    print("Validation / sanity checks")
    print("=" * 72)

    if not warnings:
        print("No obvious plausibility problems were detected.")
        return

    for warning in warnings:
        print(f"- {warning}")


def main() -> None:
    start_year = 2020
    end_year = 2030

    countries = load_world("data")
    region_results = simulate_period(countries, start_year, end_year)
    country_results = aggregate_country_results(region_results, countries)
    warnings = validate_simulation_results(country_results, region_results)

    print_country_year_results(country_results)
    print_region_year_results(start_year, end_year, region_results)
    print_validation_warnings(warnings)

    export_data = build_simulation_export(
        start_year=start_year,
        end_year=end_year,
        country_results=country_results,
        region_results=region_results,
        warning_count=len(warnings),
    )
    output_dir = Path("output")
    output_path = output_dir / f"simulation_{start_year}_{end_year}.json"
    latest_output_path = output_dir / "latest.json"
    save_simulation_export_json(export_data, output_path)
    save_simulation_export_json(export_data, latest_output_path)

    print()
    print(f"Structured JSON export saved to: {output_path}")
    print(f"Stable dashboard export saved to: {latest_output_path}")


if __name__ == "__main__":
    main()
