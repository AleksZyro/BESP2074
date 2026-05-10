import json
from dataclasses import asdict
from pathlib import Path

from besp.models import CountryYearResult, RegionYearResult


def build_simulation_export(
    start_year: int,
    end_year: int,
    country_results: list[CountryYearResult],
    region_results: list[RegionYearResult],
) -> dict:
    years: dict[str, dict[str, list[dict]]] = {}

    for result in country_results:
        year_key = f"{result.start_year}-{result.end_year}"
        years.setdefault(year_key, {"countries": [], "regions": []})
        years[year_key]["countries"].append(asdict(result))

    for result in region_results:
        year_key = f"{result.start_year}-{result.end_year}"
        years.setdefault(year_key, {"countries": [], "regions": []})
        years[year_key]["regions"].append(asdict(result))

    return {
        "meta": {
            "start_year": start_year,
            "end_year": end_year,
        },
        "years": years,
    }



def save_simulation_export_json(export_data: dict, output_path: str | Path) -> None:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as file:
        json.dump(export_data, file, indent=2, ensure_ascii=False)
