import json
from pathlib import Path
from typing import Any


def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    raise SystemExit(1)


def read_json_file(path: Path, missing_message: str | None = None) -> Any:
    if not path.exists():
        fail(missing_message or f"Missing file: {path}")
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_latest_export() -> dict[str, Any]:
    export = read_json_file(
        Path("output/latest.json"),
        "Missing output/latest.json. Run `py main.py` first.",
    )
    if not isinstance(export, dict):
        fail("Export JSON root must be an object.")
    return export


def parse_year_bucket_start(year_key: str) -> int:
    try:
        return int(year_key.split("-", 1)[0])
    except (TypeError, ValueError, AttributeError):
        fail(f"Invalid year bucket key format: {year_key!r}")
    raise AssertionError("unreachable")
