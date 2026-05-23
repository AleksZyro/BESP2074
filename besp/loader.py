import json
from pathlib import Path

from besp.models import Country, Region, ShockDefinition, SimulationScenario


def load_json(path: str | Path) -> list[dict]:
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_regions(path: str | Path) -> list[Region]:
    region_data = load_json(path)
    return [Region(**entry) for entry in region_data]


def load_countries(path: str | Path, regions: list[Region]) -> list[Country]:
    country_data = load_json(path)
    countries: list[Country] = []

    for entry in country_data:
        country_regions = [
            region for region in regions
            if region.country_code == entry["code"]
        ]

        countries.append(
            Country(
                name=entry["name"],
                code=entry["code"],
                base_birth_rate=entry["base_birth_rate"],
                base_death_rate=entry["base_death_rate"],
                base_net_migration_rate=entry["base_net_migration_rate"],
                stability=entry["stability"],
                eu_integration=entry["eu_integration"],
                corruption=entry["corruption"],
                regions=country_regions,
            )
        )

    return countries


def load_scenarios(path: str | Path) -> list[SimulationScenario]:
    scenario_data = load_json(path)
    return [SimulationScenario(**entry) for entry in scenario_data]


def load_shocks(path: str | Path) -> list[ShockDefinition]:
    shock_data = load_json(path)
    return [ShockDefinition(**entry) for entry in shock_data]


def load_world(data_dir: str | Path = "data") -> list[Country]:
    data_path = Path(data_dir)

    regions = load_regions(data_path / "regions.json")
    countries = load_countries(data_path / "countries.json", regions)

    return countries


def load_scenario_map(data_dir: str | Path = "data") -> dict[str, SimulationScenario]:
    data_path = Path(data_dir)
    scenarios = load_scenarios(data_path / "scenarios.json")
    return {scenario.code: scenario for scenario in scenarios}


def load_shock_map(data_dir: str | Path = "data") -> dict[str, ShockDefinition]:
    data_path = Path(data_dir)
    shocks = load_shocks(data_path / "shocks.json")
    return {shock.code: shock for shock in shocks}
