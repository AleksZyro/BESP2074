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
STATUS_DEFAULTS = {
    "scenario_code": "baseline",
    "scenario_name": "Baseline continuity",
    "message": "Ready.",
    "shocks_enabled": True,
    "variation_seed": None,
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
    def start_run(self, scenario_code: str, shocks_enabled: bool = True) -> dict:
        scenario = self._scenario_map.get(scenario_code)
        if scenario is None:
            raise ValueError(f"Unknown scenario '{scenario_code}'.")
        with self._lock:
            if self._state["state"] == "running":
                raise RuntimeError("A simulation run is already in progress.")
            self._state = self._build_state(
                "running",
                scenario_code=scenario["code"],
                scenario_name=scenario["name"],
                message=f"Running scenario '{scenario['name']}'.",
                shocks_enabled=shocks_enabled,
                started_at=timestamp_now(),
            )
        worker = threading.Thread(
            target=self._run_simulation,
            args=(scenario, shocks_enabled),
            daemon=True,
        )
        worker.start()
        return self.get_status()
    def _run_simulation(self, scenario: dict, shocks_enabled: bool) -> None:
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
        if completed.returncode == 0:
            scenario_meta = read_latest_meta()
            with self._lock:
                self._state = self._build_state(
                    "success",
                    scenario_code=scenario["code"],
                    scenario_name=scenario["name"],
                    message="Run finished successfully.",
                    shocks_enabled=shocks_enabled,
                    variation_seed=scenario_meta.get("variation_seed"),
                    started_at=self._state.get("started_at"),
                    finished_at=timestamp_now(),
                )
            return
        error_excerpt = completed.stderr.strip() or completed.stdout.strip() or "Unknown simulation error."
        with self._lock:
            self._state = self._build_state(
                "failed",
                scenario_code=scenario["code"],
                scenario_name=scenario["name"],
                message=error_excerpt.splitlines()[-1][:220],
                shocks_enabled=shocks_enabled,
                started_at=self._state.get("started_at"),
                finished_at=timestamp_now(),
            )
RUN_MANAGER = RunManager()
class BESPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO_ROOT), **kwargs)
    def do_GET(self) -> None:
        resolver = {
            "/api/run-status": RUN_MANAGER.get_status,
            "/api/scenarios": RUN_MANAGER.list_scenarios,
        }.get(self.path)
        if resolver:
            self._send_json(HTTPStatus.OK, resolver())
            return
        super().do_GET()
    def do_POST(self) -> None:
        if self.path != "/api/run":
            self.send_error(HTTPStatus.NOT_FOUND, "Unknown API route.")
            return
        payload = self._read_json_payload()
        if payload is None:
            return
        scenario_code = str(payload.get("scenario") or "baseline")
        shocks_enabled = bool(payload.get("shocks_enabled", True))
        try:
            status = RUN_MANAGER.start_run(scenario_code, shocks_enabled=shocks_enabled)
        except (ValueError, RuntimeError) as error:
            status_code = HTTPStatus.BAD_REQUEST if isinstance(error, ValueError) else HTTPStatus.CONFLICT
            self._send_json(status_code, {"message": str(error)})
            return
        self._send_json(HTTPStatus.ACCEPTED, status)
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
