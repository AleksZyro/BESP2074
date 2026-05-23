import argparse
import json
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

    print(f"Scenarios: {len(scenarios)} loaded")
    print(f"Run status: {status.get('state', 'unknown')}")

    if args.trigger_run:
        run_result = post_json(
            f"{base_url}/api/run",
            {"scenario": "baseline", "shocks_enabled": True},
        )
        print(f"Run trigger accepted: state={run_result.get('state', 'unknown')}")


if __name__ == "__main__":
    main()
