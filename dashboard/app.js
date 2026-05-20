const EXPORT_PATH = "../output/latest.json";
const COUNTRY_MAP_CONFIG = [
    {
        code: "BIH",
        name: "Bosnia and Herzegovina",
        points: "130,130 290,120 360,190 330,280 220,300 140,230",
        labelX: 245,
        labelY: 205,
    },
    {
        code: "SRB",
        name: "Serbia",
        points: "330,145 520,130 620,200 610,350 495,430 355,400 315,280",
        labelX: 470,
        labelY: 260,
    },
    {
        code: "MNE",
        name: "Montenegro",
        points: "245,305 335,300 372,352 320,420 225,385",
        labelX: 300,
        labelY: 360,
    },
];
const REGION_MAP_CONFIG = [
    { name: "Belgrade", countryCode: "SRB", points: "438,205 486,198 510,222 496,255 450,260 425,236", labelX: 470, labelY: 232 },
    { name: "Vojvodina", countryCode: "SRB", points: "360,150 500,140 560,180 542,230 500,220 440,200 376,205 342,175", labelX: 455, labelY: 175 },
    { name: "Central Serbia", countryCode: "SRB", points: "385,225 500,224 554,262 540,322 450,338 392,305 370,255", labelX: 462, labelY: 282 },
    { name: "South and East Serbia", countryCode: "SRB", points: "452,338 540,322 604,350 592,420 496,430 450,390", labelX: 528, labelY: 374 },
    { name: "Kosovo and Metohija", countryCode: "SRB", points: "385,307 450,338 450,390 392,396 352,350", labelX: 410, labelY: 356 },
    { name: "Coast", countryCode: "MNE", points: "235,322 286,312 312,334 298,365 252,370 228,350", labelX: 272, labelY: 346 },
    { name: "Inland", countryCode: "MNE", points: "298,365 338,358 362,390 328,420 255,387", labelX: 315, labelY: 392 },
    { name: "Federation of Bosnia and Herzegovina", countryCode: "BIH", points: "152,174 286,165 330,198 292,250 212,255 160,220", labelX: 235, labelY: 212 },
    { name: "Republika Srpska", countryCode: "BIH", points: "210,255 292,250 340,208 340,278 286,300 222,296 180,260", labelX: 266, labelY: 272 },
    { name: "Brcko", countryCode: "BIH", points: "282,236 304,234 314,248 298,263 278,257", labelX: 296, labelY: 251 },
];
let activeMapMode = "country";
const mapDataCache = {
    countriesByCode: new Map(),
    regionsByKey: new Map(),
};
const REGION_NAME_ALIASES = {
    "federation of bosnia and herzegovina": "federation of bosnia and herzegovina",
    "federation of bosnia-herzegovina": "federation of bosnia and herzegovina",
    "republika srpska": "republika srpska",
    "brcko": "brcko",
    "south and east serbia": "south and east serbia",
    "kosovo and metohija": "kosovo and metohija",
    "kosovo & metohija": "kosovo and metohija",
    "central serbia": "central serbia",
    "vojvodina": "vojvodina",
    "belgrade": "belgrade",
    "coast": "coast",
    "inland": "inland",
};

const integerFormatter = new Intl.NumberFormat("en-US");
const decimalFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const percentFormatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

const elements = {
    loadStatus: document.getElementById("load-status"),
    metaCards: document.getElementById("meta-cards"),
    mapModeCountryButton: document.getElementById("map-mode-country"),
    mapModeRegionButton: document.getElementById("map-mode-region"),
    mapHoverTitle: document.getElementById("map-hover-title"),
    mapHoverBody: document.getElementById("map-hover-body"),
    countryLayer: document.getElementById("country-layer"),
    countryLabelLayer: document.getElementById("country-label-layer"),
    regionLayer: document.getElementById("region-layer"),
    regionLabelLayer: document.getElementById("region-label-layer"),
    mapSummaryCards: document.getElementById("map-summary-cards"),
    countryTableBody: document.getElementById("country-table-body"),
    regionTableBody: document.getElementById("region-table-body"),
};

document.addEventListener("DOMContentLoaded", () => {
    bindMapModeEvents();
    renderEmptyState();
    void loadDashboardData();
});

function bindMapModeEvents() {
    elements.mapModeCountryButton.addEventListener("click", () => {
        setMapMode("country");
    });
    elements.mapModeRegionButton.addEventListener("click", () => {
        setMapMode("region");
    });
}

function setMapMode(mode) {
    activeMapMode = mode === "region" ? "region" : "country";
    const countryActive = activeMapMode === "country";
    elements.mapModeCountryButton.classList.toggle("map-mode-button-active", countryActive);
    elements.mapModeRegionButton.classList.toggle("map-mode-button-active", !countryActive);
    applyMapModeVisibility();
    resetMapHoverDetails();
}

function applyMapModeVisibility() {
    const showCountries = activeMapMode === "country";
    elements.countryLayer.classList.toggle("map-hidden", !showCountries);
    elements.countryLabelLayer.classList.toggle("map-hidden", !showCountries);
    elements.regionLayer.classList.toggle("map-hidden", showCountries);
    elements.regionLabelLayer.classList.toggle("map-hidden", showCountries);
}

async function loadDashboardData() {
    try {
        const response = await fetch(EXPORT_PATH, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const exportData = await response.json();
        if (!isValidExport(exportData)) {
            throw new Error("Invalid BESP export shape");
        }

        renderDashboard(exportData);
    } catch (error) {
        const detail = error instanceof Error ? ` (${error.message})` : "";
        elements.loadStatus.textContent =
            "Could not load output/latest.json. Run py main.py and serve the repository root before opening the dashboard."
            + detail;
    }
}

function isValidExport(exportData) {
    return Boolean(
        exportData
        && typeof exportData === "object"
        && exportData.meta
        && typeof exportData.meta.start_year === "number"
        && typeof exportData.meta.end_year === "number"
        && exportData.years
        && typeof exportData.years === "object"
    );
}

function renderDashboard(exportData) {
    const countryRows = [];
    const regionRows = [];

    for (const [yearKey, yearData] of Object.entries(exportData.years)) {
        const countries = Array.isArray(yearData?.countries) ? yearData.countries : [];
        const regions = Array.isArray(yearData?.regions) ? yearData.regions : [];

        for (const country of countries) {
            countryRows.push({ yearKey, ...country });
        }

        for (const region of regions) {
            regionRows.push({ yearKey, ...region });
        }
    }

    countryRows.sort(compareYearAndCountry);
    regionRows.sort(compareYearCountryAndRegion);

    renderMetaCards(exportData, countryRows.length, regionRows.length);
    renderCountryLayer(countryRows);
    renderRegionLayer(regionRows);
    bindMapHoverEvents();
    renderCountryTable(countryRows);
    renderRegionTable(regionRows);
    applyMapModeVisibility();
    resetMapHoverDetails();
    elements.loadStatus.textContent =
        `Loaded ${EXPORT_PATH} successfully (${countryRows.length} country rows, ${regionRows.length} region rows).`;
}

function renderMetaCards(exportData, countryRowCount, regionRowCount) {
    elements.metaCards.innerHTML = [
        buildMetaCard("Start year", exportData.meta.start_year),
        buildMetaCard("End year", exportData.meta.end_year),
        buildMetaCard("Country year values", formatInteger(countryRowCount)),
        buildMetaCard("Region year values", formatInteger(regionRowCount)),
        buildMetaCard("Year buckets", formatInteger(Object.keys(exportData.years).length)),
        buildMetaCard("Validation warnings", formatInteger(exportData.meta.warning_count ?? 0)),
    ].join("");
}

function renderCountryTable(countryRows) {
    if (!countryRows.length) {
        elements.countryTableBody.innerHTML =
            '<tr><td colspan="7" class="table-empty">No country year values found in the export.</td></tr>';
        return;
    }

    elements.countryTableBody.innerHTML = countryRows
        .map((country) => `
            <tr>
                <td>${escapeHtml(country.yearKey)}</td>
                <td>${escapeHtml(country.country_name)} (${escapeHtml(country.country_code)})</td>
                <td>${formatInteger(country.end_population)}</td>
                <td>${formatDecimal(country.end_gdp_billion_eur)} bn EUR</td>
                <td>${formatPercent(country.gdp_growth_rate)}</td>
                <td>${formatInteger(Math.round(country.gdp_per_capita_eur))} EUR</td>
                <td>${formatPercent(country.average_unemployment_rate)}</td>
            </tr>
        `)
        .join("");
}

function renderRegionTable(regionRows) {
    if (!regionRows.length) {
        elements.regionTableBody.innerHTML =
            '<tr><td colspan="8" class="table-empty">No region year values found in the export.</td></tr>';
        return;
    }

    elements.regionTableBody.innerHTML = regionRows
        .map((region) => `
            <tr>
                <td>${escapeHtml(region.yearKey)}</td>
                <td>${escapeHtml(region.country_code)}</td>
                <td>${escapeHtml(region.region_name)}</td>
                <td>${formatInteger(region.end_population)}</td>
                <td>${formatDecimal(region.end_gdp_billion_eur)} bn EUR</td>
                <td>${formatPercent(region.gdp_growth_rate)}</td>
                <td>${formatPercent(region.unemployment_rate)}</td>
                <td>${formatDecimal(region.regional_attractiveness)}</td>
            </tr>
        `)
        .join("");
}

function renderCountryLayer(countryRows) {
    const latestByCountryCode = getLatestCountryRowsByCode(countryRows);
    mapDataCache.countriesByCode = latestByCountryCode;
    const mappedCountries = COUNTRY_MAP_CONFIG.map((shape) => ({
        shape,
        data: latestByCountryCode.get(shape.code) ?? null,
    }));

    const availableRows = mappedCountries
        .map((entry) => entry.data)
        .filter((entry) => entry !== null);
    const gdpPerCapValues = availableRows.map((entry) => entry.gdp_per_capita_eur);
    const minGdpPerCapita = gdpPerCapValues.length ? Math.min(...gdpPerCapValues) : 0;
    const maxGdpPerCapita = gdpPerCapValues.length ? Math.max(...gdpPerCapValues) : 1;

    elements.countryLayer.innerHTML = mappedCountries
        .map(({ shape, data }) => {
            const fill = mapCountryFill(data, minGdpPerCapita, maxGdpPerCapita);
            return `
                <polygon
                    class="map-country-shape"
                    data-country-code="${escapeHtml(shape.code)}"
                    points="${escapeHtml(shape.points)}"
                    fill="${escapeHtml(fill)}"
                ></polygon>
            `;
        })
        .join("");

    elements.countryLabelLayer.innerHTML = mappedCountries
        .map(({ shape }) => `
            <text class="map-country-label" x="${shape.labelX}" y="${shape.labelY}">
                ${escapeHtml(shape.code)}
            </text>
        `)
        .join("");

    elements.mapSummaryCards.innerHTML = mappedCountries
        .map(({ shape, data }) => {
            if (!data) {
                return `
                    <article class="meta-card">
                        <span class="meta-label">${escapeHtml(shape.name)} (${escapeHtml(shape.code)})</span>
                        <strong class="meta-value">No data</strong>
                        <p class="meta-note">No country record found in current export.</p>
                    </article>
                `;
            }

            return `
                <article class="meta-card">
                    <span class="meta-label">${escapeHtml(shape.name)} (${escapeHtml(shape.code)})</span>
                    <strong class="meta-value">${formatInteger(data.end_population)}</strong>
                    <p class="meta-note">
                        ${escapeHtml(data.yearKey)} | GDP ${formatDecimal(data.end_gdp_billion_eur)} bn EUR
                    </p>
                </article>
            `;
        })
        .join("");
}

function renderRegionLayer(regionRows) {
    const latestByRegionKey = getLatestRegionRowsByKey(regionRows);
    mapDataCache.regionsByKey = latestByRegionKey;
    const mappedRegions = REGION_MAP_CONFIG.map((shape) => ({
        shape,
        data: latestByRegionKey.get(buildRegionKey(shape.countryCode, shape.name)) ?? null,
    }));

    const availableRows = mappedRegions
        .map((entry) => entry.data)
        .filter((entry) => entry !== null);
    const unemploymentValues = availableRows.map((entry) => entry.unemployment_rate);
    const minUnemployment = unemploymentValues.length ? Math.min(...unemploymentValues) : 0;
    const maxUnemployment = unemploymentValues.length ? Math.max(...unemploymentValues) : 1;

    elements.regionLayer.innerHTML = mappedRegions
        .map(({ shape, data }) => {
            const fill = mapRegionFill(data, minUnemployment, maxUnemployment);
            return `
                <polygon
                    class="map-region-shape"
                    data-region-name="${escapeHtml(shape.name)}"
                    data-country-code="${escapeHtml(shape.countryCode)}"
                    points="${escapeHtml(shape.points)}"
                    fill="${escapeHtml(fill)}"
                ></polygon>
            `;
        })
        .join("");

    elements.regionLabelLayer.innerHTML = mappedRegions
        .map(({ shape }) => `
            <text class="map-region-label" x="${shape.labelX}" y="${shape.labelY}">
                ${escapeHtml(shortRegionLabel(shape.name))}
            </text>
        `)
        .join("");
}

function bindMapHoverEvents() {
    for (const node of elements.countryLayer.querySelectorAll(".map-country-shape")) {
        node.addEventListener("mouseenter", () => {
            const countryCode = node.getAttribute("data-country-code") ?? "";
            const countryData = mapDataCache.countriesByCode.get(countryCode);
            node.classList.add("map-hover-target");
            renderCountryHover(countryCode, countryData ?? null);
        });

        node.addEventListener("mouseleave", () => {
            node.classList.remove("map-hover-target");
            resetMapHoverDetails();
        });
    }

    for (const node of elements.regionLayer.querySelectorAll(".map-region-shape")) {
        node.addEventListener("mouseenter", () => {
            const countryCode = node.getAttribute("data-country-code") ?? "";
            const regionName = node.getAttribute("data-region-name") ?? "";
            const regionData = mapDataCache.regionsByKey.get(buildRegionKey(countryCode, regionName));
            node.classList.add("map-hover-target");
            renderRegionHover(countryCode, regionName, regionData ?? null);
        });

        node.addEventListener("mouseleave", () => {
            node.classList.remove("map-hover-target");
            resetMapHoverDetails();
        });
    }
}

function renderCountryHover(countryCode, countryData) {
    if (!countryData) {
        elements.mapHoverTitle.textContent = `${countryCode} (no data)`;
        elements.mapHoverBody.textContent = "No country record found in the current export.";
        return;
    }

    elements.mapHoverTitle.textContent =
        `${countryData.country_name} (${countryData.country_code}) - ${countryData.yearKey}`;
    elements.mapHoverBody.textContent =
        `Population ${formatInteger(countryData.end_population)}, GDP ${formatDecimal(countryData.end_gdp_billion_eur)} bn EUR, `
        + `growth ${formatPercent(countryData.gdp_growth_rate)}, unemployment ${formatPercent(countryData.average_unemployment_rate)}.`;
}

function renderRegionHover(countryCode, regionName, regionData) {
    if (!regionData) {
        elements.mapHoverTitle.textContent = `${regionName} (${countryCode})`;
        elements.mapHoverBody.textContent = "No region record found in the current export.";
        return;
    }

    elements.mapHoverTitle.textContent =
        `${regionData.region_name} (${regionData.country_code}) - ${regionData.yearKey}`;
    elements.mapHoverBody.textContent =
        `Population ${formatInteger(regionData.end_population)}, GDP ${formatDecimal(regionData.end_gdp_billion_eur)} bn EUR, `
        + `growth ${formatPercent(regionData.gdp_growth_rate)}, unemployment ${formatPercent(regionData.unemployment_rate)}, `
        + `attractiveness ${formatDecimal(regionData.regional_attractiveness)}.`;
}

function resetMapHoverDetails() {
    if (activeMapMode === "country") {
        elements.mapHoverTitle.textContent = "Country hover active";
        elements.mapHoverBody.textContent =
            "Move over a country area to inspect the latest country-year values from the export.";
        return;
    }

    elements.mapHoverTitle.textContent = "Region hover active";
    elements.mapHoverBody.textContent =
        "Move over a region area to inspect the latest region-year values from the export.";
}

function renderEmptyState() {
    elements.countryLayer.innerHTML = "";
    elements.countryLabelLayer.innerHTML = "";
    elements.regionLayer.innerHTML = "";
    elements.regionLabelLayer.innerHTML = "";
    elements.mapSummaryCards.innerHTML = `
        <article class="meta-card empty-card">
            <span class="meta-label">No country layer data</span>
            <strong class="meta-value">-</strong>
            <p class="meta-note">Load export data to render the country map layer.</p>
        </article>
    `;
    mapDataCache.countriesByCode = new Map();
    mapDataCache.regionsByKey = new Map();
    setMapMode("country");
    resetMapHoverDetails();
    elements.metaCards.innerHTML = `
        <article class="meta-card empty-card">
            <span class="meta-label">No data loaded</span>
            <strong class="meta-value">-</strong>
            <p class="meta-note">The dashboard is waiting for <code>output/latest.json</code>.</p>
        </article>
    `;
    elements.countryTableBody.innerHTML =
        '<tr><td colspan="7" class="table-empty">No country summary loaded yet.</td></tr>';
    elements.regionTableBody.innerHTML =
        '<tr><td colspan="8" class="table-empty">No region summary loaded yet.</td></tr>';
}

function buildMetaCard(label, value) {
    return `
        <article class="meta-card">
            <span class="meta-label">${escapeHtml(label)}</span>
            <strong class="meta-value">${escapeHtml(String(value))}</strong>
        </article>
    `;
}

function compareYearAndCountry(left, right) {
    const leftYear = extractStartYear(left);
    const rightYear = extractStartYear(right);
    if (leftYear !== rightYear) {
        return leftYear - rightYear;
    }

    return normalizeCountryCode(left.country_code).localeCompare(normalizeCountryCode(right.country_code));
}

function compareYearCountryAndRegion(left, right) {
    const leftYear = extractStartYear(left);
    const rightYear = extractStartYear(right);
    if (leftYear !== rightYear) {
        return leftYear - rightYear;
    }

    const leftCountryCode = normalizeCountryCode(left.country_code);
    const rightCountryCode = normalizeCountryCode(right.country_code);
    if (leftCountryCode !== rightCountryCode) {
        return leftCountryCode.localeCompare(rightCountryCode);
    }

    return normalizeRegionName(left.region_name).localeCompare(normalizeRegionName(right.region_name));
}

function getLatestCountryRowsByCode(countryRows) {
    const latestByCountryCode = new Map();

    for (const row of countryRows) {
        const countryCode = normalizeCountryCode(row.country_code);
        const existing = latestByCountryCode.get(countryCode);
        if (!existing || extractStartYear(row) > extractStartYear(existing)) {
            latestByCountryCode.set(countryCode, row);
        }
    }

    return latestByCountryCode;
}

function getLatestRegionRowsByKey(regionRows) {
    const latestByRegionKey = new Map();

    for (const row of regionRows) {
        const regionKey = buildRegionKey(row.country_code, row.region_name);
        const existing = latestByRegionKey.get(regionKey);
        if (!existing || extractStartYear(row) > extractStartYear(existing)) {
            latestByRegionKey.set(regionKey, row);
        }
    }

    return latestByRegionKey;
}

function buildRegionKey(countryCode, regionName) {
    return `${normalizeCountryCode(countryCode)}::${normalizeRegionName(regionName)}`;
}

function normalizeCountryCode(countryCode) {
    return String(countryCode ?? "").trim().toUpperCase();
}

function normalizeRegionName(regionName) {
    const compact = String(regionName ?? "")
        .trim()
        .toLowerCase()
        .replaceAll(/\s+/g, " ");
    return REGION_NAME_ALIASES[compact] ?? compact;
}

function mapCountryFill(countryData, minGdpPerCapita, maxGdpPerCapita) {
    if (!countryData) {
        return "rgba(127, 150, 173, 0.45)";
    }

    const span = maxGdpPerCapita - minGdpPerCapita;
    const ratio = span > 0 ? (countryData.gdp_per_capita_eur - minGdpPerCapita) / span : 0.5;
    const red = Math.round(75 + ratio * 120);
    const green = Math.round(113 + ratio * 90);
    const blue = Math.round(145 + ratio * 35);
    return `rgba(${red}, ${green}, ${blue}, 0.88)`;
}

function mapRegionFill(regionData, minUnemployment, maxUnemployment) {
    if (!regionData) {
        return "rgba(123, 143, 166, 0.42)";
    }

    const span = maxUnemployment - minUnemployment;
    const ratio = span > 0 ? (regionData.unemployment_rate - minUnemployment) / span : 0.5;
    const red = Math.round(84 + ratio * 135);
    const green = Math.round(168 - ratio * 58);
    const blue = Math.round(139 - ratio * 36);
    return `rgba(${red}, ${green}, ${blue}, 0.9)`;
}

function shortRegionLabel(regionName) {
    const replacements = {
        "Federation of Bosnia and Herzegovina": "FBiH",
        "Republika Srpska": "RS",
        "South and East Serbia": "SE Serbia",
        "Kosovo and Metohija": "K&M",
    };
    return replacements[regionName] ?? regionName;
}

function extractStartYear(row) {
    if (typeof row.start_year === "number") {
        return row.start_year;
    }

    const yearFromKey = Number.parseInt(String(row.yearKey).slice(0, 4), 10);
    return Number.isFinite(yearFromKey) ? yearFromKey : 0;
}

function formatInteger(value) {
    return integerFormatter.format(value);
}

function formatDecimal(value) {
    return decimalFormatter.format(value);
}

function formatPercent(value) {
    return percentFormatter.format(value);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
