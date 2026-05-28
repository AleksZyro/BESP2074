import argparse
import json
import time
import sys
import urllib.error
import urllib.request


def fetch_json(url: str) -> object:
    request = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(request, timeout=4) as response:
        return json.loads(response.read().decode("utf-8"))


def post_json(url: str, payload: dict[str, object]) -> object:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=6) as response:
        return json.loads(response.read().decode("utf-8"))


def wait_for_run_completion(base_url: str, timeout_seconds: int) -> dict:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        payload = fetch_json(f"{base_url}/api/run-status")
        if not isinstance(payload, dict):
            raise SystemExit("Unexpected run-status payload while polling.")
        state = str(payload.get("state", "unknown"))
        if state in {"success", "failed", "idle"}:
            return payload
        time.sleep(0.5)
    raise SystemExit(
        f"Run status polling timed out after {timeout_seconds}s."
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Quick health check for tools/local_run_service.py."
    )
    parser.add_argument(
        "--base-url",
        default="http://127.0.0.1:8011",
        help="Local run service base URL (default: http://127.0.0.1:8011).",
    )
    parser.add_argument(
        "--trigger-run",
        action="store_true",
        help="Also call POST /api/run with baseline scenario.",
    )
    parser.add_argument(
        "--e2e",
        action="store_true",
        help="Trigger a run and poll until it finishes (basic end-to-end flow).",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=90,
        help="Polling timeout for --e2e mode (default: 90).",
    )
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    try:
        scenarios = fetch_json(f"{base_url}/api/scenarios")
        status = fetch_json(f"{base_url}/api/run-status")
    except urllib.error.URLError as error:
        raise SystemExit(
            f"Could not reach local run service at {base_url}. {error.reason}"
        )

    if not isinstance(scenarios, list):
        raise SystemExit("Unexpected scenarios payload. Expected a list.")
    if not isinstance(status, dict):
        raise SystemExit("Unexpected run-status payload. Expected an object.")
    if not any(str(item.get("code", "")) == "baseline" for item in scenarios if isinstance(item, dict)):
        raise SystemExit("Baseline scenario not present in /api/scenarios.")

    print(f"Scenarios: {len(scenarios)} loaded")
    print(f"Run status: {status.get('state', 'unknown')}")

    if args.trigger_run or args.e2e:
        run_result = post_json(
            f"{base_url}/api/run",
            {"scenario": "baseline", "shocks_enabled": True},
        )
        print(f"Run trigger accepted: state={run_result.get('state', 'unknown')}")
        if args.e2e:
            finished = wait_for_run_completion(base_url, max(args.timeout_seconds, 10))
            finished_state = str(finished.get("state", "unknown"))
            if finished_state != "success":
                raise SystemExit(
                    f"Run did not complete successfully. Final state: {finished_state}."
                )
            variation_seed = str(finished.get("variation_seed") or "").strip()
            if not variation_seed:
                raise SystemExit("Run completed but variation_seed is missing.")
            print(f"[OK] E2E run finished with seed={variation_seed}")


if __name__ == "__main__":
    main()
