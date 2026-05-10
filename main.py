from besp.loader import load_world
from besp.simulation import simulate_year


def print_results(start_year: int, end_year: int, results) -> None:
    print(f"BESP simulation tick: {start_year} -> {end_year}")
    print("=" * 72)

    for result in results:
        print(f"{result.country_code} | {result.region_name}")
        print(f"  Start population:          {result.start_population:,}")
        print(f"  Births:                    {result.births:,}")
        print(f"  Deaths:                    {result.deaths:,}")
        print(f"  Net external migration:    {result.net_external_migration:,}")
        print(f"  Internal migration:        {result.internal_migration:,}")
        print(f"  End population:            {result.end_population:,}")
        print(f"  Density:                   {result.population_density:.1f} people/km²")
        print(f"  Housing overload:          {result.housing_overload:.3f}")
        print(f"  Data confidence:           {result.data_confidence:.2f}")

        if result.population_note:
            print(f"  Population note:           {result.population_note}")

        print("-" * 72)


def main() -> None:
    start_year = 2020
    end_year = 2021

    countries = load_world("data")
    results = simulate_year(countries, start_year)

    print_results(start_year, end_year, results)


if __name__ == "__main__":
    main()
