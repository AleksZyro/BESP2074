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
- World Bank data access and licensing: <https://datacatalog.worldbank.org/public-licenses>
- World Bank dataset terms: <https://www.worldbank.org/ext/en/legal/terms-conditions/datasets>

Repository processing:

- `tools/refresh_country_baselines.py` fetches indicators for the eleven project countries.
- It checks candidate baseline years `2023` to `2026`.
- It selects the best common coverage year.
- GDP in USD is converted to EUR using ECB annual average EUR/USD rates.

Licence / attribution status:

- Source and indicator codes are documented.
- The World Bank currently documents CC BY 4.0 as the default licence for datasets produced by the World Bank and distributed as open data.
- The World Bank dataset terms require attribution to the World Bank and its data providers.
- Before a public release, each used indicator should still be checked against its own metadata in case a third-party provider or extra condition applies.

## European Central Bank Exchange Rates

Files / code affected:

- `tools/refresh_country_baselines.py`
- GDP conversion values inside `data/world_bank_baseline_2024.json`
- GDP conversion values inside `data/world_bank_baseline_latest.json`

Source URL:

- <https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip>
- ECB reference-rate page: <https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html>
- ECB / ESCB statistics reuse policy: <https://www.ecb.europa.eu/stats/ecb_statistics/governance_and_quality_framework/html/usage_policy.en.html>

Repository processing:

- The refresh script reads historical EUR/USD daily rates.
- It computes an annual average for the selected baseline year.

Licence / attribution status:

- Source URL and processing are documented.
- The ECB currently documents free reuse of publicly available ESCB statistics if the source is quoted and statistics, including metadata, are not modified.
- BESP2074 stores derived annual average conversion values, so release notes should keep the processing step explicit and attribute the source as ECB statistics.

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
- geoBoundaries country downloads: <https://www.geoboundaries.org/countryDownloads.html>

Repository processing:

- Files are simplified and compacted for browser use.
- Some map display behaviour is adjusted through `dashboard/data/map_assignments.json`.
- The simplified GeoJSON files keep administrative properties such as `shapeName`, `shapeISO`, `shapeID`, `shapeGroup`, and `shapeType`.
- The simplified files do not preserve a complete downloaded metadata record such as source release date, download date, or original metadata URL.

Licence / attribution status:

- geoBoundaries describes itself as an open CC BY 4.0 administrative boundary resource.
- geoBoundaries states that attribution is required for all uses of the country dataset.
- The repository-level source and licence family are documented.
- Before a public release, each stored simplified file should still be matched to its exact downloaded file/version metadata or regenerated from a documented source script.

## Eurostat GISCO / NUTS Geodata

Files affected:

- `dashboard/data/gisco-SVN-NUTS3-2021_simplified.geojson`

Source:

- Eurostat GISCO NUTS geodata: <https://ec.europa.eu/eurostat/web/gisco/geodata/statistical-units/territorial-units-statistics>
- Eurostat GISCO geodata overview: <https://ec.europa.eu/eurostat/web/gisco/geodata>

Repository processing:

- The file is simplified and compacted for browser use.
- It is used for Slovenian NUTS3 inner lines inside larger project regions.
- The local feature properties include `source: Eurostat GISCO NUTS 2021`.

Licence / attribution status:

- GISCO / Eurostat geodata has specific copyright and use conditions.
- The Eurostat GISCO pages document specific use rules for statistical-unit geodata and require source attribution.
- This remains a release blocker until the exact required attribution, redistribution conditions, and any non-commercial-use restriction for the stored simplified file are confirmed.
- If that cannot be confirmed before public release, remove this bundled file from the release package or replace it with documented rebuild/download instructions.

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

## Open Licence Risks Before Public Release

1. Confirm exact World Bank attribution wording for the used indicators and keep provider attribution visible.
2. Keep ECB statistics attribution and derived-average processing notes visible in release documentation.
3. Match every bundled geoBoundaries simplified file to exact downloaded file/version metadata, or regenerate from documented source inputs before public release.
4. Confirm GISCO/NUTS redistribution rights, required attribution, and any non-commercial-use restriction for the simplified Slovenia NUTS3 file.
5. Decide whether public release should keep bundled geodata or instead document download/rebuild steps.
