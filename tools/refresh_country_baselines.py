import csv
import io
import json
import ssl
import urllib.request
import zipfile
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
COUNTRIES_PATH = REPO_ROOT / "data" / "countries.json"
SNAPSHOT_LATEST_PATH = REPO_ROOT / "data" / "world_bank_baseline_latest.json"
ECB_EUR_USD_HISTORY_ZIP = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip"
COUNTRY_CODES = ["SRB", "MNE", "BIH", "ALB", "MKD", "BGR", "HUN", "HRV", "ROU", "SVN", "GRC"]
REFERENCE_GDP_YEAR = 2020
CANDIDATE_BASELINE_YEARS = [2023, 2024, 2025, 2026]
WB_COUNTRY_QUERY = ";".join(COUNTRY_CODES)
INDICATORS = {
    "population": "SP.POP.TOTL",
    "gdp_usd": "NY.GDP.MKTP.CD",
    "unemployment": "SL.UEM.TOTL.ZS",
    "inflation": "FP.CPI.TOTL.ZG",
    "birth_rate": "SP.DYN.CBRT.IN",
    "death_rate": "SP.DYN.CDRT.IN",
    "net_migration": "SM.POP.NETM",
}
ELECTION_METADATA = {
    "SRB": {"last_election_year": 2023, "election_cycle_years": 4, "election_sensitivity": 0.60},
    "MNE": {"last_election_year": 2023, "election_cycle_years": 4, "election_sensitivity": 0.58},
    "BIH": {"last_election_year": 2022, "election_cycle_years": 4, "election_sensitivity": 0.66},
    "ALB": {"last_election_year": 2021, "election_cycle_years": 4, "election_sensitivity": 0.61},
    "MKD": {"last_election_year": 2024, "election_cycle_years": 4, "election_sensitivity": 0.63},
    "BGR": {"last_election_year": 2024, "election_cycle_years": 4, "election_sensitivity": 0.72},
    "HUN": {"last_election_year": 2022, "election_cycle_years": 4, "election_sensitivity": 0.50},
    "HRV": {"last_election_year": 2024, "election_cycle_years": 4, "election_sensitivity": 0.56},
    "ROU": {"last_election_year": 2024, "election_cycle_years": 4, "election_sensitivity": 0.59},
    "SVN": {"last_election_year": 2022, "election_cycle_years": 4, "election_sensitivity": 0.46},
    "GRC": {"last_election_year": 2023, "election_cycle_years": 4, "election_sensitivity": 0.60},
}


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def fetch_indicator_rows(indicator_code: str) -> tuple[str, list[dict]]:
    url = (
        f"https://api.worldbank.org/v2/country/{WB_COUNTRY_QUERY}/indicator/{indicator_code}"
        "?format=json&per_page=2000"
    )
    # Some Windows/Python setups in this workspace reject the World Bank chain,
    # so the refresh tool falls back to an unverified context for this public API.
    with urllib.request.urlopen(
        url,
        timeout=30,
        context=ssl._create_unverified_context(),
    ) as response:
        payload = json.load(response)

    if not isinstance(payload, list) or len(payload) < 2:
        raise RuntimeError(f"Unexpected World Bank response for {indicator_code}.")

    meta = payload[0]
    rows = payload[1]
    if not isinstance(rows, list):
        raise RuntimeError(f"Indicator {indicator_code} did not return a row list.")

    last_updated = str(meta.get("lastupdated", "unknown"))
    return last_updated, rows


def fetch_ecb_eur_usd_annual_averages(years: list[int]) -> dict[int, float]:
    with urllib.request.urlopen(ECB_EUR_USD_HISTORY_ZIP, timeout=30) as response:
        archive = zipfile.ZipFile(io.BytesIO(response.read()))

    csv_name = archive.namelist()[0]
    rows = list(csv.DictReader(io.StringIO(archive.read(csv_name).decode("utf-8"))))
    averages: dict[int, float] = {}

    for year in years:
        values = [
            float(row["USD"])
            for row in rows
            if str(row.get("Date", "")).startswith(str(year)) and row.get("USD")
        ]
        if values:
            averages[year] = sum(values) / len(values)

    return averages


def values_for_year(rows: list[dict], year: int) -> dict[str, float]:
    values: dict[str, float] = {}
    for row in rows:
        if str(row.get("date")) != str(year):
            continue
        code = str(row.get("countryiso3code", "")).upper()
        value = row.get("value")
        if code and value is not None:
            values[code] = float(value)
    return values


def build_coverage_report(
    fetched_values: dict[str, dict[int, dict[str, float]]],
) -> dict[int, dict]:
    coverage_report: dict[int, dict] = {}
    for year in CANDIDATE_BASELINE_YEARS:
        indicator_coverage = {
            label: len(fetched_values[label].get(year, {}))
            for label in INDICATORS
        }
        complete_country_count = 0
        missing_by_country: dict[str, list[str]] = {}
        for code in COUNTRY_CODES:
            missing_indicators = [
                label
                for label in INDICATORS
                if code not in fetched_values[label].get(year, {})
            ]
            if missing_indicators:
                missing_by_country[code] = missing_indicators
            else:
                complete_country_count += 1

        full_indicator_count = sum(
            1
            for count in indicator_coverage.values()
            if count == len(COUNTRY_CODES)
        )
        total_points = sum(indicator_coverage.values())
        coverage_report[year] = {
            "indicator_coverage": indicator_coverage,
            "full_indicator_count": full_indicator_count,
            "complete_country_count": complete_country_count,
            "total_points": total_points,
            "missing_by_country": missing_by_country,
        }
    return coverage_report


def select_best_baseline_year(coverage_report: dict[int, dict]) -> int:
    return max(
        coverage_report,
        key=lambda year: (
            int(coverage_report[year]["complete_country_count"]),
            int(coverage_report[year]["full_indicator_count"]),
            int(coverage_report[year]["total_points"]),
            year,
        ),
    )


def build_snapshot() -> tuple[dict, int]:
    fetched_values: dict[str, dict[int, dict[str, float]]] = {}
    indicator_meta: dict[str, dict[str, str]] = {}
    tracked_years = [REFERENCE_GDP_YEAR, *CANDIDATE_BASELINE_YEARS]

    for label, indicator_code in INDICATORS.items():
        last_updated, rows = fetch_indicator_rows(indicator_code)
        fetched_values[label] = {
            year: values_for_year(rows, year)
            for year in tracked_years
        }
        indicator_meta[label] = {
            "world_bank_code": indicator_code,
            "last_updated": last_updated,
        }

    coverage_report = build_coverage_report(fetched_values)
    baseline_year = select_best_baseline_year(coverage_report)
    ecb_eur_usd_averages = fetch_ecb_eur_usd_annual_averages(CANDIDATE_BASELINE_YEARS)
    baseline_eur_usd_rate = ecb_eur_usd_averages.get(baseline_year)
    if not baseline_eur_usd_rate:
        raise RuntimeError(f"Missing ECB EUR/USD annual average for {baseline_year}.")

    snapshot = {
        "source": "World Bank indicator API",
        "baseline_year": baseline_year,
        "candidate_baseline_years": CANDIDATE_BASELINE_YEARS,
        "reference_gdp_year": REFERENCE_GDP_YEAR,
        "gdp_eur_conversion": {
            "source": "ECB euro foreign exchange reference rates, annual average EUR/USD",
            "eur_usd_annual_average": baseline_eur_usd_rate,
        },
        "selection_rule": "Best common year across countries and indicators; latest year wins ties.",
        "coverage_report": coverage_report,
        "countries": {},
        "indicators": indicator_meta,
    }

    for code in COUNTRY_CODES:
        population = int(round(fetched_values["population"][baseline_year][code]))
        gdp_2020 = fetched_values["gdp_usd"][REFERENCE_GDP_YEAR][code]
        gdp_baseline = fetched_values["gdp_usd"][baseline_year][code]
        unemployment_rate = fetched_values["unemployment"][baseline_year][code] / 100.0
        inflation_rate = fetched_values["inflation"][baseline_year][code] / 100.0
        birth_rate = fetched_values["birth_rate"][baseline_year][code] / 1000.0
        death_rate = fetched_values["death_rate"][baseline_year][code] / 1000.0
        net_migration_people = fetched_values["net_migration"][baseline_year][code]
        net_migration_rate = net_migration_people / population if population > 0 else 0.0

        snapshot["countries"][code] = {
            "population": population,
            "gdp_usd_2020": gdp_2020,
            f"gdp_usd_{baseline_year}": gdp_baseline,
            "gdp_billion_eur": gdp_baseline / 1_000_000_000 / baseline_eur_usd_rate,
            "gdp_scale_vs_2020": gdp_baseline / gdp_2020 if gdp_2020 else 1.0,
            "unemployment_rate": unemployment_rate,
            "inflation_rate": inflation_rate,
            "birth_rate": birth_rate,
            "death_rate": death_rate,
            "net_migration_people": round(net_migration_people),
            "net_migration_rate": net_migration_rate,
        }

    return snapshot, baseline_year


def update_country_file(snapshot: dict, baseline_year: int) -> None:
    with COUNTRIES_PATH.open("r", encoding="utf-8") as handle:
        countries = json.load(handle)

    if not isinstance(countries, list):
        raise RuntimeError("data/countries.json must contain a list.")

    for entry in countries:
        code = str(entry.get("code", "")).upper()
        baseline = snapshot["countries"].get(code)
        if not baseline:
            continue

        entry["baseline_year"] = baseline_year
        entry["baseline_population"] = baseline["population"]
        entry["baseline_gdp_billion_eur"] = round(baseline["gdp_billion_eur"], 3)
        entry["baseline_gdp_scale_vs_2020"] = round(baseline["gdp_scale_vs_2020"], 6)
        entry["baseline_unemployment_rate"] = round(baseline["unemployment_rate"], 6)
        entry["baseline_inflation_rate"] = round(baseline["inflation_rate"], 6)
        entry["base_birth_rate"] = round(baseline["birth_rate"], 6)
        entry["base_death_rate"] = round(baseline["death_rate"], 6)
        entry["base_net_migration_rate"] = round(baseline["net_migration_rate"], 6)

        derived_integration = clamp(
            0.28
            + entry.get("eu_integration", 0.50) * 0.42
            + entry.get("stability", 0.50) * 0.16
            - entry.get("corruption", 0.50) * 0.10,
            0.25,
            0.85,
        )
        derived_satisfaction = clamp(
            0.64
            + entry.get("stability", 0.50) * 0.12
            + entry.get("base_investment_climate_index", 0.50) * 0.08
            - entry.get("corruption", 0.50) * 0.10
            - baseline["unemployment_rate"] * 1.15
            - max(baseline["inflation_rate"], 0.0) * 1.05,
            0.30,
            0.78,
        )
        entry["base_integration_index"] = round(derived_integration, 6)
        entry["base_satisfaction_index"] = round(derived_satisfaction, 6)

        election_meta = ELECTION_METADATA[code]
        entry["last_election_year"] = election_meta["last_election_year"]
        entry["election_cycle_years"] = election_meta["election_cycle_years"]
        entry["election_sensitivity"] = election_meta["election_sensitivity"]

    with COUNTRIES_PATH.open("w", encoding="utf-8") as handle:
        json.dump(countries, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def main() -> None:
    snapshot, baseline_year = build_snapshot()
    snapshot_year_path = REPO_ROOT / "data" / f"world_bank_baseline_{baseline_year}.json"
    snapshot_payload = json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n"
    SNAPSHOT_LATEST_PATH.write_text(snapshot_payload, encoding="utf-8")
    snapshot_year_path.write_text(snapshot_payload, encoding="utf-8")
    update_country_file(snapshot, baseline_year)
    print(f"Selected baseline year: {baseline_year}")
    print(f"Updated country baselines: {COUNTRIES_PATH}")
    print(f"Wrote latest snapshot: {SNAPSHOT_LATEST_PATH}")
    print(f"Wrote year snapshot: {snapshot_year_path}")


if __name__ == "__main__":
    main()
