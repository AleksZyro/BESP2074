import argparse
import json
import os
import subprocess
import sys
import threading
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
REPO_ROOT = Path(__file__).resolve().parent.parent
SCENARIOS_PATH = REPO_ROOT / "data" / "scenarios.json"
LATEST_EXPORT_PATH = REPO_ROOT / "output" / "latest.json"
MAP_ASSIGNMENTS_PATH = REPO_ROOT / "dashboard" / "data" / "map_assignments.json"
REPORT_DETAIL_COUNTRIES = "countries"
REPORT_DETAIL_COUNTRIES_REGIONS = "countries_regions"
MAX_JSON_BODY_BYTES = 1_000_000
STATUS_DEFAULTS = {
    "scenario_code": "baseline",
    "scenario_name": "Baseline continuity",
    "message": "Ready.",
    "shocks_enabled": True,
    "run_count": 1,
    "completed_runs": 0,
    "variation_seed": None,
    "recent_runs": [],
    "latest_batch": None,
    "started_at": None,
    "finished_at": None,
}
def timestamp_now() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
def load_scenarios() -> list[dict]:
    with SCENARIOS_PATH.open("r", encoding="utf-8") as handle:
        return [
            {
                "code": item["code"],
                "name": item["name"],
                "description": item["description"],
            }
            for item in json.load(handle)
        ]


def load_latest_export(path: Path = LATEST_EXPORT_PATH) -> dict:
    if not path.exists():
        raise FileNotFoundError("No current run is available.")
    with path.open("r", encoding="utf-8") as handle:
        export = json.load(handle)
    if not isinstance(export, dict) or not isinstance(export.get("years"), dict):
        raise ValueError("Current run export is invalid.")
    return export


def parse_year_key(year_key: str) -> tuple[int, int]:
    start_text, end_text = str(year_key).split("-", 1)
    return int(start_text), int(end_text)


def selected_year_items(export: dict, start_year: int | None, end_year: int | None) -> list[tuple[str, dict]]:
    items: list[tuple[str, dict]] = []
    for year_key, year_data in sorted(export.get("years", {}).items()):
        bucket_start, bucket_end = parse_year_key(year_key)
        if start_year is not None and bucket_start < start_year:
            continue
        if end_year is not None and bucket_end > end_year:
            continue
        items.append((year_key, year_data))
    return items


def format_percent(value: object) -> str:
    try:
        return f"{float(value) * 100:.1f}%"
    except (TypeError, ValueError):
        return "-"


def format_number(value: object) -> str:
    try:
        return f"{int(value):,}".replace(",", "'")
    except (TypeError, ValueError):
        return "-"


def format_decimal(value: object, digits: int = 2) -> str:
    try:
        return f"{float(value):.{digits}f}"
    except (TypeError, ValueError):
        return "-"


def build_run_report_text(
    export: dict,
    *,
    start_year: int | None = None,
    end_year: int | None = None,
    detail: str = REPORT_DETAIL_COUNTRIES,
    include_events: bool = False,
    include_state: bool = False,
) -> str:
    meta = export.get("meta", {})
    scenario = meta.get("scenario", {})
    shocks = meta.get("shocks", {})
    year_items = selected_year_items(export, start_year, end_year)

    lines = [
        "BESP2074 Run Export",
        "=" * 72,
        f"Scenario: {scenario.get('name', 'Unknown')} ({scenario.get('code', '-')})",
        f"Seed: {scenario.get('variation_seed', '-')}",
        f"Years: {year_items[0][0] if year_items else '-'} to {year_items[-1][0] if year_items else '-'}",
        f"Shocks: {'on' if shocks.get('enabled') else 'off'}",
        "",
    ]

    if not year_items:
        lines.append("No year rows match the selected range.")
        return "\n".join(lines) + "\n"

    for year_key, year_data in year_items:
        lines.extend([f"Year {year_key}", "-" * 72])
        countries = sorted(
            year_data.get("countries", []),
            key=lambda row: str(row.get("country_code", "")),
        )
        for country in countries:
            lines.append(
                " | ".join([
                    str(country.get("country_code", "-")),
                    str(country.get("country_name", "-")),
                    f"population {format_number(country.get('end_population'))}",
                    f"GDP {format_decimal(country.get('end_gdp_billion_eur'))} bn EUR",
                    f"growth {format_percent(country.get('gdp_growth_rate'))}",
                    f"unemployment {format_percent(country.get('average_unemployment_rate'))}",
                ])
            )
            if include_state:
                lines.append(
                    "  state: "
                    + ", ".join([
                        f"budget {format_percent(country.get('budget_balance_pct_gdp'))}",
                        f"debt {format_percent(country.get('debt_to_gdp'))}",
                        f"stability {format_percent(country.get('stability_index'))}",
                        f"corruption {format_percent(country.get('corruption_index'))}",
                        f"investment {format_percent(country.get('investment_climate_index'))}",
                    ])
                )

        if detail == REPORT_DETAIL_COUNTRIES_REGIONS:
            lines.append("")
            lines.append("Regions")
            regions = sorted(
                year_data.get("regions", []),
                key=lambda row: (str(row.get("country_code", "")), str(row.get("region_name", ""))),
            )
            for region in regions:
                lines.append(
                    "  "
                    + " | ".join([
                        str(region.get("country_code", "-")),
                        str(region.get("region_name", "-")),
                        f"population {format_number(region.get('end_population'))}",
                        f"GDP {format_decimal(region.get('end_gdp_billion_eur'))} bn EUR",
                        f"unemployment {format_percent(region.get('unemployment_rate'))}",
                    ])
                )
        lines.append("")

    if include_events:
        lines.extend(["Shock / event letters", "-" * 72])
        events = [
            event for event in export.get("shock_events", [])
            if (start_year is None or int(event.get("start_year", 0)) >= start_year)
            and (end_year is None or int(event.get("end_year", 0)) <= end_year)
        ]
        if not events:
            lines.append("No events in selected range.")
        for event in sorted(events, key=lambda item: (int(item.get("start_year", 0)), str(item.get("country_code", "")))):
            lines.append(
                f"{event.get('start_year', '-')}-{event.get('end_year', '-')}: "
                f"{event.get('country_code', '-')} {event.get('shock_name', '-')}. "
                f"{event.get('message', '')}"
            )
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def build_report_filename(export: dict, start_year: int | None, end_year: int | None, detail: str) -> str:
    meta = export.get("meta", {})
    scenario = meta.get("scenario", {})
    scenario_code = str(scenario.get("code") or "run").replace(" ", "_")
    safe_start = start_year or meta.get("start_year") or "start"
    safe_end = end_year or meta.get("end_year") or "end"
    safe_detail = "countries_regions" if detail == REPORT_DETAIL_COUNTRIES_REGIONS else "countries"
    return f"BESP2074_{scenario_code}_{safe_start}-{safe_end}_{safe_detail}.txt"


def allowed_cors_origin(origin: str) -> str:
    clean_origin = str(origin or "").strip()
    parsed = urlparse(clean_origin)
    try:
        port = parsed.port
    except ValueError:
        return ""
    if parsed.scheme == "http" and parsed.hostname in {"127.0.0.1", "localhost"} and port is not None:
        return clean_origin
    return ""


def read_map_assignments() -> dict:
    if not MAP_ASSIGNMENTS_PATH.exists():
        MAP_ASSIGNMENTS_PATH.parent.mkdir(parents=True, exist_ok=True)
        MAP_ASSIGNMENTS_PATH.write_text('{\n  "overrides": {}\n}\n', encoding="utf-8")
    with MAP_ASSIGNMENTS_PATH.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError("map_assignments.json must contain an object.")
    payload.setdefault("overrides", {})
    if not isinstance(payload["overrides"], dict):
        raise ValueError("map_assignments.json overrides must be an object.")
    return payload


def write_map_assignments(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("Map assignment payload must be an object.")
    overrides = payload.get("overrides", {})
    if not isinstance(overrides, dict):
        raise ValueError("Map assignment payload requires an 'overrides' object.")

    safe_payload = {
        "updated_at": timestamp_now(),
        "overrides": overrides,
    }
    MAP_ASSIGNMENTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with MAP_ASSIGNMENTS_PATH.open("w", encoding="utf-8") as handle:
        json.dump(safe_payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    return safe_payload


def summarize_latest_export() -> dict:
    if not LATEST_EXPORT_PATH.exists():
        return {}

    with LATEST_EXPORT_PATH.open("r", encoding="utf-8") as handle:
        export = json.load(handle)

    years = export.get("years", {})
    if not isinstance(years, dict) or not years:
        return {}

    latest_year_key = sorted(years.keys())[-1]
    latest_bucket = years.get(latest_year_key, {})
    countries = latest_bucket.get("countries", [])
    total_population = sum(int(row.get("end_population", 0)) for row in countries)
    total_gdp = sum(float(row.get("end_gdp_billion_eur", 0.0)) for row in countries)
    weighted_unemployment_population = sum(
        int(row.get("end_population", 0)) * float(row.get("average_unemployment_rate", 0.0))
        for row in countries
    )
    average_unemployment = (
        weighted_unemployment_population / total_population
        if total_population > 0 else 0.0
    )
    scenario_meta = export.get("meta", {}).get("scenario", {})

    return {
        "year_key": latest_year_key,
        "variation_seed": scenario_meta.get("variation_seed"),
        "total_population": total_population,
        "total_gdp_billion_eur": round(total_gdp, 3),
        "average_unemployment_rate": round(average_unemployment, 6),
    }


def build_batch_summary(run_summaries: list[dict]) -> dict | None:
    if not run_summaries:
        return None

    populations = [int(item.get("total_population", 0)) for item in run_summaries]
    gdps = [float(item.get("total_gdp_billion_eur", 0.0)) for item in run_summaries]
    unemployments = [float(item.get("average_unemployment_rate", 0.0)) for item in run_summaries]

    return {
        "count": len(run_summaries),
        "year_key": run_summaries[-1].get("year_key"),
        "population_min": min(populations),
        "population_max": max(populations),
        "gdp_min_billion_eur": round(min(gdps), 3),
        "gdp_max_billion_eur": round(max(gdps), 3),
        "unemployment_min_rate": round(min(unemployments), 6),
        "unemployment_max_rate": round(max(unemployments), 6),
        "seeds": [item.get("variation_seed") for item in run_summaries],
    }
class RunManager:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._scenarios = load_scenarios()
        self._scenario_map = {scenario["code"]: scenario for scenario in self._scenarios}
        self._state = self._build_state(
            "idle",
            message="Ready to generate a fresh local simulation run.",
        )
    def list_scenarios(self) -> list[dict]:
        return self._scenarios
    def get_status(self) -> dict:
        with self._lock:
            return dict(self._state)
    def _build_state(self, state: str, **overrides: object) -> dict:
        base = {"state": state, **STATUS_DEFAULTS}
        base["scenario_name"] = self._scenario_map.get("baseline", {}).get(
            "name",
            STATUS_DEFAULTS["scenario_name"],
        )
        base.update(overrides)
        return base
    def start_run(self, scenario_code: str, shocks_enabled: bool = True, run_count: int = 1) -> dict:
        scenario = self._scenario_map.get(scenario_code)
        if scenario is None:
            raise ValueError(f"Unknown scenario '{scenario_code}'.")
        safe_run_count = max(1, min(int(run_count), 100))
        with self._lock:
            if self._state["state"] == "running":
                raise RuntimeError("A simulation run is already in progress.")
            self._state = self._build_state(
                "running",
                scenario_code=scenario["code"],
                scenario_name=scenario["name"],
                message=f"Running scenario '{scenario['name']}' ({safe_run_count} run(s)).",
                shocks_enabled=shocks_enabled,
                run_count=safe_run_count,
                completed_runs=0,
                started_at=timestamp_now(),
            )
        worker = threading.Thread(
            target=self._run_simulation_batch,
            args=(scenario, shocks_enabled, safe_run_count),
            daemon=True,
        )
        worker.start()
        return self.get_status()
    def clear_current_run(self) -> dict:
        with self._lock:
            if self._state["state"] == "running":
                raise RuntimeError("A simulation run is already in progress.")
            if LATEST_EXPORT_PATH.exists():
                LATEST_EXPORT_PATH.unlink()
            self._state = self._build_state(
                "idle",
                message="Current run deleted. Generate a fresh local simulation run.",
                recent_runs=[],
                latest_batch=None,
                completed_runs=0,
                variation_seed=None,
                finished_at=timestamp_now(),
            )
            return dict(self._state)
    def _run_simulation_batch(self, scenario: dict, shocks_enabled: bool, run_count: int) -> None:
        batch_summaries: list[dict] = []
        for run_index in range(run_count):
            command = [sys.executable, "main.py", "--scenario", scenario["code"]]
            if not shocks_enabled:
                command.append("--disable-shocks")
            completed = subprocess.run(
                command,
                cwd=REPO_ROOT,
                capture_output=True,
                text=True,
                encoding="utf-8",
            )
            if completed.returncode != 0:
                error_excerpt = completed.stderr.strip() or completed.stdout.strip() or "Unknown simulation error."
                with self._lock:
                    self._state = self._build_state(
                        "failed",
                        scenario_code=scenario["code"],
                        scenario_name=scenario["name"],
                        message=error_excerpt.splitlines()[-1][:220],
                        shocks_enabled=shocks_enabled,
                        run_count=run_count,
                        completed_runs=run_index,
                        recent_runs=self._state.get("recent_runs", []),
                        latest_batch=build_batch_summary(batch_summaries),
                        started_at=self._state.get("started_at"),
                        finished_at=timestamp_now(),
                    )
                return

            run_summary = summarize_latest_export()
            batch_summaries.append(run_summary)

            with self._lock:
                recent_runs = list(self._state.get("recent_runs", []))
                recent_runs.extend([run_summary])
                self._state = self._build_state(
                    "running" if run_index + 1 < run_count else "success",
                    scenario_code=scenario["code"],
                    scenario_name=scenario["name"],
                    message=(
                        f"Run {run_index + 1}/{run_count} finished."
                        if run_index + 1 < run_count
                        else "Run batch finished successfully."
                    ),
                    shocks_enabled=shocks_enabled,
                    run_count=run_count,
                    completed_runs=run_index + 1,
                    variation_seed=run_summary.get("variation_seed"),
                    recent_runs=recent_runs[-12:],
                    latest_batch=build_batch_summary(batch_summaries),
                    started_at=self._state.get("started_at"),
                    finished_at=timestamp_now() if run_index + 1 >= run_count else None,
                )
RUN_MANAGER = RunManager()
class BESP2074RequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO_ROOT), **kwargs)
    def do_GET(self) -> None:
        resolver = {
            "/api/run-status": RUN_MANAGER.get_status,
            "/api/scenarios": RUN_MANAGER.list_scenarios,
            "/api/map-assignments": read_map_assignments,
        }.get(self.path)
        if resolver:
            self._send_json(HTTPStatus.OK, resolver())
            return
        super().do_GET()
    def do_POST(self) -> None:
        if self.path == "/api/run":
            payload = self._read_json_payload()
            if payload is None:
                return
            scenario_code = str(payload.get("scenario") or "baseline")
            shocks_enabled = bool(payload.get("shocks_enabled", True))
            try:
                run_count = int(payload.get("run_count", 1))
                status = RUN_MANAGER.start_run(
                    scenario_code,
                    shocks_enabled=shocks_enabled,
                    run_count=run_count,
                )
            except (ValueError, RuntimeError) as error:
                status_code = HTTPStatus.BAD_REQUEST if isinstance(error, ValueError) else HTTPStatus.CONFLICT
                self._send_json(status_code, {"message": str(error)})
                return
            self._send_json(HTTPStatus.ACCEPTED, status)
            return
        if self.path == "/api/map-assignments":
            payload = self._read_json_payload()
            if payload is None:
                return
            try:
                saved = write_map_assignments(payload)
            except ValueError as error:
                self._send_json(HTTPStatus.BAD_REQUEST, {"message": str(error)})
                return
            self._send_json(HTTPStatus.OK, saved)
            return
        if self.path == "/api/export-report":
            payload = self._read_json_payload()
            if payload is None:
                return
            try:
                export = load_latest_export()
                start_year = payload.get("start_year")
                end_year = payload.get("end_year")
                detail = str(payload.get("detail") or REPORT_DETAIL_COUNTRIES)
                if detail not in {REPORT_DETAIL_COUNTRIES, REPORT_DETAIL_COUNTRIES_REGIONS}:
                    raise ValueError("Unknown report detail level.")
                report_text = build_run_report_text(
                    export,
                    start_year=int(start_year) if start_year else None,
                    end_year=int(end_year) if end_year else None,
                    detail=detail,
                    include_events=bool(payload.get("include_events", False)),
                    include_state=bool(payload.get("include_state", False)),
                )
                filename = build_report_filename(
                    export,
                    int(start_year) if start_year else None,
                    int(end_year) if end_year else None,
                    detail,
                )
            except (FileNotFoundError, ValueError) as error:
                self._send_json(HTTPStatus.BAD_REQUEST, {"message": str(error)})
                return
            self._send_text_file(HTTPStatus.OK, report_text, filename)
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Unknown API route.")
    def do_DELETE(self) -> None:
        if self.path == "/api/latest-run":
            try:
                status = RUN_MANAGER.clear_current_run()
            except RuntimeError as error:
                self._send_json(HTTPStatus.CONFLICT, {"message": str(error)})
                return
            self._send_json(HTTPStatus.OK, status)
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Unknown API route.")
    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_default_headers()
        self.end_headers()
    def _send_json(self, status: HTTPStatus, payload: object) -> None:
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self._send_default_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def _send_text_file(self, status: HTTPStatus, text: str, filename: str) -> None:
        body = text.encode("utf-8")
        self.send_response(status)
        self._send_default_headers()
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def _read_json_payload(self) -> dict | None:
        body_length = int(self.headers.get("Content-Length", "0"))
        if body_length > MAX_JSON_BODY_BYTES:
            self._send_json(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, {"message": "Request body is too large."})
            return None
        raw_body = self.rfile.read(body_length) if body_length else b"{}"
        try:
            return json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            self._send_json(HTTPStatus.BAD_REQUEST, {"message": "Request body must be valid JSON."})
            return None
    def _send_default_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        origin = allowed_cors_origin(self.headers.get("Origin", ""))
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    def log_message(self, format: str, *args) -> None:
        super().log_message(format, *args)
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve BESP2074 locally with a small run service and static dashboard files."
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8011,
        help="Port to bind the local run service to (default: 8011).",
    )
    return parser.parse_args()
def main() -> None:
    args = parse_args()
    os.chdir(REPO_ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), BESP2074RequestHandler)
    print(f"BESP2074 local run service listening on http://127.0.0.1:{args.port}/dashboard/index.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down BESP2074 local run service.")
    finally:
        server.server_close()
if __name__ == "__main__":
    main()
