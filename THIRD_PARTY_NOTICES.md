# Third-Party Notices for BESP2074

This file documents known third-party data and map sources used by BESP2074. It is not legal advice. Unclear points are marked as release risks instead of being guessed.

## Repository Licence Scope

The self-authored source code and project documentation are licensed under the MIT Licence in `LICENSE`.

Third-party datasets, geodata, and external source material remain subject to their own licences, terms, and attribution requirements. The MIT Licence does not grant additional rights to those third-party materials.

## World Bank Indicator Data

Files affected:

- `data/world_bank_baseline_2024.json`
- `data/world_bank_baseline_latest.json`
- country baseline values written into `data/countries.json`

Used indicators:

- `SP.POP.TOTL` - Population, total
- `NY.GDP.MKTP.CD` - GDP, current US dollars
- `SL.UEM.TOTL.ZS` - Unemployment, total
- `FP.CPI.TOTL.ZG` - Inflation, consumer prices
- `SP.DYN.CBRT.IN` - Birth rate, crude
- `SP.DYN.CDRT.IN` - Death rate, crude
- `SM.POP.NETM` - Net migration

Source URLs:

- <https://api.worldbank.org/v2/country/{countries}/indicator/{indicator}?format=json&per_page=2000>
- World Bank API help: <https://datahelpdesk.worldbank.org/knowledgebase/articles/898599-indicator-api-queries>

Repository processing:

- `tools/refresh_country_baselines.py` fetches indicators for the eleven project countries.
- It checks candidate baseline years `2023` to `2026`.
- It selects the best common coverage year.
- GDP in USD is converted to EUR using ECB annual average EUR/USD rates.

Licence / attribution status:

- Source and indicator codes are documented.
- Final public release should still verify the exact current World Bank data licence and attribution text.

## European Central Bank Exchange Rates

Files / code affected:

- `tools/refresh_country_baselines.py`
- GDP conversion values inside `data/world_bank_baseline_2024.json`
- GDP conversion values inside `data/world_bank_baseline_latest.json`

Source URL:

- <https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip>
- ECB reference-rate page: <https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html>

Repository processing:

- The refresh script reads historical EUR/USD daily rates.
- It computes an annual average for the selected baseline year.

Licence / attribution status:

- Source URL and processing are documented.
- Final public release should verify the exact ECB reuse wording for the exchange-rate dataset.

## geoBoundaries Geodata

Files affected:

- `dashboard/data/geoBoundaries-ALB-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-ALB-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-BGR-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-BGR-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-BIH-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-BIH-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-BIH-ADM2_simplified.geojson`
- `dashboard/data/geoBoundaries-BIH-ADM3_simplified.geojson`
- `dashboard/data/geoBoundaries-GRC-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-GRC-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-GRC-ADM2_simplified.geojson`
- `dashboard/data/geoBoundaries-HRV-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-HRV-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-HUN-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-HUN-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-MKD-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-MKD-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-MNE-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-MNE-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-ROU-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-ROU-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-SRB-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-SRB-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-SVN-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-SVN-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-XKX-ADM0_simplified.geojson`
- `dashboard/data/geoBoundaries-XKX-ADM1_simplified.geojson`
- `dashboard/data/geoBoundaries-XKX-ADM2_simplified.geojson`

Source:

- geoBoundaries: <https://www.geoboundaries.org/>

Repository processing:

- Files are simplified and compacted for browser use.
- Some map display behaviour is adjusted through `dashboard/data/map_assignments.json`.

Licence / attribution status:

- geoBoundaries describes itself as an open CC BY 4.0 boundary resource.
- Final public release should verify whether each downloaded file/version has matching metadata and whether additional per-file attribution is required.

## Eurostat GISCO / NUTS Geodata

Files affected:

- `dashboard/data/gisco-SVN-NUTS3-2021_simplified.geojson`

Source:

- Eurostat GISCO NUTS geodata: <https://ec.europa.eu/eurostat/web/gisco/geodata/statistical-units/territorial-units-statistics>

Repository processing:

- The file is simplified and compacted for browser use.
- It is used for Slovenian NUTS3 inner lines inside larger project regions.

Licence / attribution status:

- GISCO / Eurostat geodata has specific copyright and use conditions.
- This is a release blocker until the exact required attribution and permitted redistribution conditions for the stored simplified file are confirmed.

## Project Model Data

Files affected:

- `data/regions.json`
- selected non-baseline fields in `data/countries.json`
- `data/scenarios.json`
- `data/shocks.json`

Status:

- These are project model assumptions and working estimates.
- They are not official forecasts.
- They should not be presented as factual future predictions.

## Generated Outputs

Generated outputs are not third-party source data and should not be committed:

- `output/latest.json`
- `output/simulation_*.json`
- downloaded TXT reports

`output/` is ignored by `.gitignore`.

## Static Demo Sample

File affected:

- `dashboard/demo-data/latest.json`

Status:

- This is a deliberately trimmed, read-only sample generated from the project simulation for the static portfolio demo.
- It is not an official dataset and not a forecast.
- It is included so the GitHub Pages demo can load without a Python service or generated `output/latest.json`.

## Open Licence Risks Before Public Release

1. Confirm exact World Bank data licence and attribution wording.
2. Confirm exact ECB exchange-rate reuse wording.
3. Confirm per-file geoBoundaries metadata and attribution for all stored ADM files.
4. Confirm GISCO/NUTS redistribution rights and required attribution for the simplified Slovenia NUTS3 file.
5. Decide whether public release should keep bundled geodata or instead document download/rebuild steps.
