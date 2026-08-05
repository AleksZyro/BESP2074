from __future__ import annotations

import importlib.util
import json
from pathlib import Path


def _load_refresh_module():
    module_path = Path(__file__).resolve().parents[1] / "tools" / "refresh_country_baselines.py"
    spec = importlib.util.spec_from_file_location("refresh_country_baselines", module_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_world_bank_fetch_uses_default_tls_verification(monkeypatch):
    module = _load_refresh_module()
    calls: list[dict] = []

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, traceback):
            return False

        def read(self):
            return json.dumps(
                [
                    {"lastupdated": "2026-08-05"},
                    [{"countryiso3code": "SRB", "date": "2026", "value": 1}],
                ]
            ).encode("utf-8")

    def fake_urlopen(*args, **kwargs):
        calls.append(kwargs)
        return FakeResponse()

    monkeypatch.setattr(module.urllib.request, "urlopen", fake_urlopen)

    _last_updated, rows = module.fetch_indicator_rows("SP.POP.TOTL")

    assert rows[0]["countryiso3code"] == "SRB"
    assert calls == [{"timeout": 30}]
