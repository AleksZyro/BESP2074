from __future__ import annotations

import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def test_static_demo_entrypoint_uses_read_only_demo_mode() -> None:
    root_html = (PROJECT_ROOT / "index.html").read_text(encoding="utf-8")
    demo_html = (PROJECT_ROOT / "dashboard" / "demo.html").read_text(encoding="utf-8")

    assert "./dashboard/demo.html" in root_html
    assert "./index.html?demo=1" in demo_html
    assert "tools/local_run_service.py" not in demo_html


def test_static_demo_data_is_trimmed_and_self_describing() -> None:
    demo_data = json.loads(
        (PROJECT_ROOT / "dashboard" / "demo-data" / "latest.json").read_text(encoding="utf-8")
    )

    assert demo_data["meta"]["demo"]["static"] is True
    assert demo_data["meta"]["end_year"] == 2034
    assert 1 <= len(demo_data["years"]) <= 12
    assert set(demo_data) == {"meta", "shock_events", "years"}

    first_year = next(iter(demo_data["years"].values()))
    assert len(first_year["countries"]) == 11
    assert first_year["regions"]


def test_pages_workflow_uploads_static_demo_only() -> None:
    workflow = (PROJECT_ROOT / ".github" / "workflows" / "deploy-pages.yml").read_text(encoding="utf-8")

    assert "output/" not in workflow
    assert "tools/local_run_service.py" not in workflow
    assert "dashboard/demo-data" in workflow
    assert "actions/deploy-pages" in workflow
    assert "workflow_dispatch" in workflow
