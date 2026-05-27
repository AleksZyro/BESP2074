import argparse
import secrets
from pathlib import Path

from besp.exporter import build_simulation_export, save_simulation_export_json
from besp.loader import load_scenario_map, load_shock_map, load_world
from besp.models import CountryYearResult, RegionYearResult, ShockEvent, SimulationScenario
from besp.simulation import aggregate_country_results, simulate_period
from besp.validation import validate_simulation_results


def print_section(title: str) -> None:
    print()
    print(title)
    print("=" * 72)


def print_country_year_results(country_results: list[CountryYearResult]) -> None:
    current_year: int | None = None

    for result in country_results:
        if result.start_year != current_year:
            current_year = result.start_year
            print_section(f"Country summary: {result.start_year} -> {result.end_year}")

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
    print_section(f"BESP simulation period: {start_year} -> {end_year}")

    current_year: int | None = None

    for result in results:
        if result.start_year != current_year:
            current_year = result.start_year
            print_section(f"Regions: {result.start_year} -> {result.end_year}")

        print(
            f"{result.country_code:<4} | {result.region_name:<32} "
            f"pop {result.end_population:>10,} | "
            f"gdp {result.end_gdp_billion_eur:>7.2f} bn | "
            f"growth {result.gdp_growth_rate * 100:>6.2f}% | "
            f"unemp {result.unemployment_rate * 100:>5.1f}%"
        )


def print_validation_warnings(warnings: list[str]) -> None:
    print_section("Validation / sanity checks")

    if not warnings:
        print("No obvious plausibility problems were detected.")
        return

    for warning in warnings:
        print(f"- {warning}")


def print_shock_summary(shock_events: list[ShockEvent]) -> None:
    print_section("Shock summary (v1)")

    if not shock_events:
        print("No shocks were triggered in this run.")
        return

    events_by_year_country: dict[tuple[int, str], list[ShockEvent]] = {}
    for event in shock_events:
        key = (event.start_year, event.country_code)
        events_by_year_country.setdefault(key, []).append(event)

    for (year, country_code), events in sorted(events_by_year_country.items()):
        shock_names = ", ".join(event.shock_name for event in events)
        print(f"{year}-{year + 1} {country_code}: {shock_names}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the BESP yearly simulation and write output/latest.json."
    )
    parser.add_argument(
        "--scenario",
        default="baseline",
        help="Scenario code from data/scenarios.json (default: baseline).",
    )
    parser.add_argument(
        "--seed",
        default=None,
        help="Optional deterministic variation seed. If omitted, a fresh seed is generated for each run.",
    )
    parser.add_argument(
        "--list-scenarios",
        action="store_true",
        help="List available scenario codes and exit.",
    )
    parser.add_argument(
        "--disable-shocks",
        action="store_true",
        help="Disable yearly shock draws for this run.",
    )
    return parser.parse_args()


def print_available_scenarios(scenarios: dict[str, SimulationScenario]) -> None:
    print("Available BESP scenarios")
    print("=" * 72)
    for scenario in scenarios.values():
        print(f"{scenario.code:<12} | {scenario.name}")
        print(f"  {scenario.description}")


def resolve_scenario(
    scenarios: dict[str, SimulationScenario],
    scenario_code: str,
) -> SimulationScenario:
    scenario = scenarios.get(scenario_code)
    if scenario is not None:
        return scenario

    available = ", ".join(sorted(scenarios))
    raise SystemExit(
        f"Unknown scenario '{scenario_code}'. Available scenarios: {available}"
    )


def resolve_variation_seed(seed: str | None) -> str:
    if seed:
        return seed

    return f"auto-{secrets.token_hex(6)}"


def main() -> None:
    args = parse_args()
    start_year = 2020
    end_year = 2030

    scenarios = load_scenario_map("data")
    if args.list_scenarios:
        print_available_scenarios(scenarios)
        return

    scenario = resolve_scenario(scenarios, args.scenario)
    variation_seed = resolve_variation_seed(args.seed)
    shock_map = load_shock_map("data")
    active_shocks = [] if args.disable_shocks else list(shock_map.values())
    countries = load_world("data")
    region_results, shock_events = simulate_period(
        countries,
        start_year,
        end_year,
        scenario=scenario,
        variation_seed=variation_seed,
        shock_definitions=active_shocks,
    )
    country_results = aggregate_country_results(region_results, countries)
    warnings = validate_simulation_results(country_results, region_results)

    print(f"Scenario: {scenario.code} ({scenario.name})")
    print(f"Variation seed: {variation_seed}")

    print_country_year_results(country_results)
    print_region_year_results(start_year, end_year, region_results)
    print_shock_summary(shock_events)
    print_validation_warnings(warnings)

    export_data = build_simulation_export(
        start_year=start_year,
        end_year=end_year,
        country_results=country_results,
        region_results=region_results,
        warning_count=len(warnings),
        scenario=scenario,
        variation_seed=variation_seed,
        shock_events=shock_events,
        shocks_enabled=not args.disable_shocks,
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
