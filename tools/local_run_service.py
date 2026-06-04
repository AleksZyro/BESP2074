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
REPO_ROOT = Path(__file__).resolve().parent.parent
SCENARIOS_PATH = REPO_ROOT / "data" / "scenarios.json"
LATEST_EXPORT_PATH = REPO_ROOT / "output" / "latest.json"
MAP_ASSIGNMENTS_PATH = REPO_ROOT / "dashboard" / "data" / "map_assignments.json"
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
def read_latest_meta() -> dict:
    if not LATEST_EXPORT_PATH.exists():
        return {}
    with LATEST_EXPORT_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle).get("meta", {}).get("scenario", {})


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
class BESPRequestHandler(SimpleHTTPRequestHandler):
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
    def _read_json_payload(self) -> dict | None:
        body_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(body_length) if body_length else b"{}"
        try:
            return json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            self._send_json(HTTPStatus.BAD_REQUEST, {"message": "Request body must be valid JSON."})
            return None
    def _send_default_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    def log_message(self, format: str, *args) -> None:
        super().log_message(format, *args)
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve BESP locally with a small run service and static dashboard files."
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
    server = ThreadingHTTPServer(("127.0.0.1", args.port), BESPRequestHandler)
    print(f"BESP local run service listening on http://127.0.0.1:{args.port}/dashboard/index.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down BESP local run service.")
    finally:
        server.server_close()
if __name__ == "__main__":
    main()
