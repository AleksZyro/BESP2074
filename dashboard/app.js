const EXPORT_PATH = "../output/latest.json";

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

function renderEmptyState() {
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
