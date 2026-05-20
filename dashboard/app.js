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
    countryLayer: document.getElementById("country-layer"),
    countryLabelLayer: document.getElementById("country-label-layer"),
    mapSummaryCards: document.getElementById("map-summary-cards"),
    countryTableBody: document.getElementById("country-table-body"),
    regionTableBody: document.getElementById("region-table-body"),
};

document.addEventListener("DOMContentLoaded", () => {
    renderEmptyState();
    void loadDashboardData();
});

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
    renderCountryTable(countryRows);
    renderRegionTable(regionRows);
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

function renderEmptyState() {
    elements.countryLayer.innerHTML = "";
    elements.countryLabelLayer.innerHTML = "";
    elements.mapSummaryCards.innerHTML = `
        <article class="meta-card empty-card">
            <span class="meta-label">No country layer data</span>
            <strong class="meta-value">-</strong>
            <p class="meta-note">Load export data to render the country map layer.</p>
        </article>
    `;
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

    return left.country_code.localeCompare(right.country_code);
}

function compareYearCountryAndRegion(left, right) {
    const leftYear = extractStartYear(left);
    const rightYear = extractStartYear(right);
    if (leftYear !== rightYear) {
        return leftYear - rightYear;
    }

    if (left.country_code !== right.country_code) {
        return left.country_code.localeCompare(right.country_code);
    }

    return left.region_name.localeCompare(right.region_name);
}

function getLatestCountryRowsByCode(countryRows) {
    const latestByCountryCode = new Map();

    for (const row of countryRows) {
        const existing = latestByCountryCode.get(row.country_code);
        if (!existing || extractStartYear(row) > extractStartYear(existing)) {
            latestByCountryCode.set(row.country_code, row);
        }
    }

    return latestByCountryCode;
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
