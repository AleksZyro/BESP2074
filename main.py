from besp.loader import load_world
from besp.models import RegionYearResult
from besp.simulation import simulate_period


def print_year_results(
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
            print(f"Year: {result.start_year} -> {result.end_year}")
            print("=" * 72)

        print(f"{result.country_code} | {result.region_name}")
        print(f"  Start population:          {result.start_population:,}")
        print(f"  Births:                    {result.births:,}")
        print(f"  Deaths:                    {result.deaths:,}")
        print(f"  Natural change:            {result.natural_change:,}")
        print(f"  Net external migration:    {result.net_external_migration:,}")
        print(f"  Internal migration:        {result.internal_migration:,}")
        print(f"  End population:            {result.end_population:,}")
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
    results = simulate_period(countries, start_year, end_year)

    print_year_results(start_year, end_year, results)


if __name__ == "__main__":
    main()
