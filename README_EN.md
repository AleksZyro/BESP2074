# BESP2074

[Deutsch](./README.md) | **English**

BESP2074 is a completed year-based Balkan scenario simulation with a Python model, structured JSON exports, an interactive local dashboard, and a border editor.

The project covers eleven countries, reproducible seeds, scenarios, optional events, multi-runs, automated tests, and release-readiness checks.

BESP2074 is an exploratory learning project. Its results are not economic, demographic, or political forecasts.

## Quick Start

```bash
python main.py --scenario baseline
python tools/local_run_service.py --port 8011
```

Run the complete verification with:

```bash
python tools/verify_release_ready.py
```

## License

The original source code and project documentation use the [MIT License](./LICENSE).

External datasets and map files keep their original licences. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
