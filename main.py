from pathlib import Path

from besp.exporter import build_simulation_export, save_simulation_export_json
from besp.loader import load_world
from besp.models import CountryYearResult, RegionYearResult
from besp.simulation import aggregate_country_results, simulate_period


def print_country_year_results(country_results: list[CountryYearResult]) -> None:
    current_year: int | None = None

    for result in country_results:
        if result.start_year != current_year:
            current_year = result.start_year
            print()
            print(f"Country summary: {result.start_year} -> {result.end_year}")
            print("=" * 72)

        print(f"{result.country_code} | {result.country_name}")
        print(f"  Start population:          {result.start_population:,}")
        print(f"  End population:            {result.end_population:,}")
        print(f"  Natural change:            {result.natural_change:,}")
        print(f"  Net external migration:    {result.net_external_migration:,}")
        print(f"  Total GDP:                 {result.end_gdp_billion_eur:.2f} bn EUR")
        print(f"  GDP growth:                {result.gdp_growth_rate * 100:.2f}%")
        print(f"  GDP per capita:            {result.gdp_per_capita_eur:,.0f} EUR")
        print(f"  Avg unemployment:          {result.average_unemployment_rate * 100:.1f}%")
        print(f"  Avg attractiveness:        {result.average_regional_attractiveness:.3f}")
        print("-" * 72)


def print_region_year_results(
    start_year: int,
    end_year: int,
    results: list[RegionYearResult],
) -> None:
    print(f"BESP simulation period: {start_year} -> {end_year}")
    print("=" * 72)

    current_year: int | None = None

    for result in results:
        if result.start_year != current_year:
            current_year = result.start_year
            print()
            print(f"Regions: {result.start_year} -> {result.end_year}")
            print("=" * 72)

        print(f"{result.country_code} | {result.region_name}")
        print(f"  Start population:          {result.start_population:,}")
        print(f"  Births:                    {result.births:,}")
        print(f"  Deaths:                    {result.deaths:,}")
        print(f"  Natural change:            {result.natural_change:,}")
        print(f"  Net external migration:    {result.net_external_migration:,}")
        print(f"  Internal migration:        {result.internal_migration:,}")
        print(f"  End population:            {result.end_population:,}")
        print(f"  Start GDP:                 {result.start_gdp_billion_eur:.2f} bn EUR")
        print(f"  End GDP:                   {result.end_gdp_billion_eur:.2f} bn EUR")
        print(f"  GDP growth:                {result.gdp_growth_rate * 100:.2f}%")
        print(f"  GDP per capita:            {result.gdp_per_capita_eur:,.0f} EUR")
        print(f"  Unemployment:              {result.unemployment_rate * 100:.1f}%")
        print(f"  Area:                      {result.area_km2:.1f} km²")
        print(f"  Density:                   {result.population_density:.1f} people/km²")
        print(f"  Housing overload:          {result.housing_overload:.3f}")
        print(f"  Regional attractiveness:   {result.regional_attractiveness:.3f}")
        print(f"  Data confidence:           {result.data_confidence:.2f}")

        if result.population_note:
            print(f"  Population note:           {result.population_note}")

        print("-" * 72)


def main() -> None:
    start_year = 2020
    end_year = 2030

    countries = load_world("data")
    region_results = simulate_period(countries, start_year, end_year)
    country_results = aggregate_country_results(region_results, countries)

    print_country_year_results(country_results)
    print_region_year_results(start_year, end_year, region_results)

    export_data = build_simulation_export(
        start_year=start_year,
        end_year=end_year,
        country_results=country_results,
        region_results=region_results,
    )
    output_path = Path("output") / f"simulation_{start_year}_{end_year}.json"
    save_simulation_export_json(export_data, output_path)

    print()
    print(f"Structured JSON export saved to: {output_path}")


if __name__ == "__main__":
    main()
