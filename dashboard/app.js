const AUTO_EXPORT_PATH = "../output/latest.json";

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

const state = {
    exportData: null,
    sourceLabel: "No export loaded yet.",
    yearKey: "",
    countryCode: "",
    regionName: "",
};

const elements = {
    simulationWindow: document.getElementById("simulation-window"),
    availableSteps: document.getElementById("available-steps"),
    warningCount: document.getElementById("warning-count"),
    dataStatus: document.getElementById("data-status"),
    dataSource: document.getElementById("data-source"),
    yearSelect: document.getElementById("year-select"),
    countrySelect: document.getElementById("country-select"),
    regionSelect: document.getElementById("region-select"),
    fileInput: document.getElementById("file-input"),
    countryTitle: document.getElementById("country-title"),
    countryCodePill: document.getElementById("country-code-pill"),
    countryGrowthPill: document.getElementById("country-growth-pill"),
    countryCards: document.getElementById("country-cards"),
    regionTitle: document.getElementById("region-title"),
    regionCountryPill: document.getElementById("region-country-pill"),
    regionConfidencePill: document.getElementById("region-confidence-pill"),
    regionCards: document.getElementById("region-cards"),
    regionNote: document.getElementById("region-note"),
    comparisonBody: document.getElementById("comparison-body"),
};

document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    renderEmptyDashboard();
    void autoLoadExport();
});

function bindEvents() {
    elements.yearSelect.addEventListener("change", (event) => {
        state.yearKey = event.target.value;
        syncCountryAndRegionSelection();
        renderDashboard();
    });

    elements.countrySelect.addEventListener("change", (event) => {
        state.countryCode = event.target.value;
        syncRegionSelection();
        renderDashboard();
    });

    elements.regionSelect.addEventListener("change", (event) => {
        state.regionName = event.target.value;
        renderDashboard();
    });

    elements.fileInput.addEventListener("change", async (event) => {
        const [file] = event.target.files ?? [];
        if (!file) {
            return;
        }

        try {
            const contents = await file.text();
            const exportData = JSON.parse(contents);
            hydrateDashboard(exportData, `Loaded manually from ${file.name}.`);
        } catch (error) {
            renderStatus("The selected file could not be parsed as a BESP export JSON.");
        }
    });
}

async function autoLoadExport() {
    try {
        const response = await fetch(AUTO_EXPORT_PATH, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const exportData = await response.json();
        hydrateDashboard(exportData, `Auto-loaded ${AUTO_EXPORT_PATH}.`);
    } catch (error) {
        renderStatus(
            "Auto-load did not succeed. Run `py main.py` first, or choose an export JSON manually."
        );
        elements.dataSource.textContent =
            "No auto-loaded dataset yet. The dashboard stays usable through manual JSON loading.";
    }
}

function hydrateDashboard(exportData, sourceLabel) {
    if (!isValidExport(exportData)) {
        renderStatus("The loaded JSON does not match the expected BESP export shape.");
        return;
    }

    state.exportData = exportData;
    state.sourceLabel = sourceLabel;
    syncYearSelection();
    syncCountryAndRegionSelection();
    renderDashboard();
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

function getYearKeys() {
    return Object.keys(state.exportData?.years ?? {}).sort((left, right) => {
        return parseInt(left.slice(0, 4), 10) - parseInt(right.slice(0, 4), 10);
    });
}

function syncYearSelection() {
    const yearKeys = getYearKeys();
    if (!yearKeys.length) {
        state.yearKey = "";
        return;
    }

    if (!yearKeys.includes(state.yearKey)) {
        state.yearKey = yearKeys[0];
    }
}

function getSelectedYearData() {
    return state.exportData?.years?.[state.yearKey] ?? { countries: [], regions: [] };
}

function syncCountryAndRegionSelection() {
    const yearData = getSelectedYearData();
    const countryCodes = yearData.countries
        .map((country) => country.country_code)
        .sort((left, right) => left.localeCompare(right));

    if (!countryCodes.includes(state.countryCode)) {
        state.countryCode = countryCodes[0] ?? "";
    }

    syncRegionSelection();
}

function syncRegionSelection() {
    const regions = getSelectedYearData().regions
        .filter((region) => region.country_code === state.countryCode)
        .sort((left, right) => left.region_name.localeCompare(right.region_name));

    const regionNames = regions.map((region) => region.region_name);
    if (!regionNames.includes(state.regionName)) {
        state.regionName = regionNames[0] ?? "";
    }
}

function renderDashboard() {
    if (!state.exportData) {
        renderEmptyDashboard();
        return;
    }

    const yearKeys = getYearKeys();
    const yearData = getSelectedYearData();
    const country = yearData.countries.find((entry) => entry.country_code === state.countryCode);
    const regionList = yearData.regions
        .filter((entry) => entry.country_code === state.countryCode)
        .sort((left, right) => right.end_population - left.end_population);
    const region = yearData.regions.find(
        (entry) => entry.country_code === state.countryCode && entry.region_name === state.regionName
    );

    populateYearSelect(yearKeys);
    populateCountrySelect(yearData.countries);
    populateRegionSelect(regionList);

    elements.simulationWindow.textContent =
        `${state.exportData.meta.start_year} -> ${state.exportData.meta.end_year}`;
    elements.availableSteps.textContent = integerFormatter.format(yearKeys.length);
    elements.warningCount.textContent = integerFormatter.format(state.exportData.meta.warning_count);
    elements.dataSource.textContent = state.sourceLabel;
    renderStatus(`Showing ${state.yearKey} for ${country?.country_name ?? "no country"}${region ? ` / ${region.region_name}` : ""}.`);

    renderCountryPanel(country);
    renderRegionPanel(region);
    renderComparisonTable(regionList, region?.region_name ?? "");
}

function populateYearSelect(yearKeys) {
    elements.yearSelect.innerHTML = yearKeys
        .map((yearKey) => `<option value="${escapeHtml(yearKey)}">${escapeHtml(yearKey)}</option>`)
        .join("");
    elements.yearSelect.value = state.yearKey;
}

function populateCountrySelect(countries) {
    const sortedCountries = [...countries].sort((left, right) =>
        left.country_name.localeCompare(right.country_name)
    );

    elements.countrySelect.innerHTML = sortedCountries
        .map((country) => (
            `<option value="${escapeHtml(country.country_code)}">`
            + `${escapeHtml(country.country_name)} (${escapeHtml(country.country_code)})`
            + "</option>"
        ))
        .join("");
    elements.countrySelect.value = state.countryCode;
}

function populateRegionSelect(regions) {
    elements.regionSelect.innerHTML = regions
        .map((region) => `<option value="${escapeHtml(region.region_name)}">${escapeHtml(region.region_name)}</option>`)
        .join("");
    elements.regionSelect.value = state.regionName;
}

function renderCountryPanel(country) {
    if (!country) {
        elements.countryTitle.textContent = "No country selected";
        elements.countryCodePill.textContent = "-";
        elements.countryGrowthPill.textContent = "Growth -";
        elements.countryCards.innerHTML = buildEmptyCards("No country data for the current year interval.");
        return;
    }

    elements.countryTitle.textContent = `${country.country_name} (${country.start_year} -> ${country.end_year})`;
    elements.countryCodePill.textContent = country.country_code;
    elements.countryGrowthPill.textContent = `Growth ${formatPercent(country.gdp_growth_rate)}`;

    const cards = [
        buildStatCard("Population", formatInteger(country.end_population), signedDelta(country.end_population - country.start_population), toneFromSigned(country.end_population - country.start_population)),
        buildStatCard("Natural change", formatSignedInteger(country.natural_change), "Births minus deaths", toneFromSigned(country.natural_change)),
        buildStatCard("External migration", formatSignedInteger(country.net_external_migration), "Net cross-border migration", toneFromSigned(country.net_external_migration)),
        buildStatCard("Internal migration", formatSignedInteger(country.internal_migration), "Should stay near zero at country level", toneFromSigned(-Math.abs(country.internal_migration))),
        buildStatCard("GDP", `${formatDecimal(country.end_gdp_billion_eur)} bn EUR`, `From ${formatDecimal(country.start_gdp_billion_eur)} bn`, toneFromSigned(country.gdp_growth_rate)),
        buildStatCard("GDP per capita", `${formatInteger(Math.round(country.gdp_per_capita_eur))} EUR`, "End-of-step value", "tone-neutral"),
        buildStatCard("Avg unemployment", formatPercent(country.average_unemployment_rate), "Population-weighted", toneFromInversePercent(country.average_unemployment_rate)),
        buildStatCard("Avg attractiveness", formatDecimal(country.average_regional_attractiveness), "Regional mean", toneFromThreshold(country.average_regional_attractiveness, 0.5)),
        buildStatCard("Avg density", `${formatDecimal(country.average_population_density)} / km^2`, "Simple regional average", "tone-neutral"),
        buildStatCard("Avg housing overload", formatDecimal(country.average_housing_overload), "Above 1.00 signals pressure", toneFromInverseThreshold(country.average_housing_overload, 1)),
    ];

    elements.countryCards.innerHTML = cards.join("");
}

function renderRegionPanel(region) {
    if (!region) {
        elements.regionTitle.textContent = "No region selected";
        elements.regionCountryPill.textContent = "-";
        elements.regionConfidencePill.textContent = "Confidence -";
        elements.regionCards.innerHTML = buildEmptyCards("No region data for the current filter.");
        elements.regionNote.textContent = "Select a region to inspect its working-note context.";
        return;
    }

    elements.regionTitle.textContent = `${region.region_name} (${region.start_year} -> ${region.end_year})`;
    elements.regionCountryPill.textContent = region.country_code;
    elements.regionConfidencePill.textContent = `Confidence ${formatPercent(region.data_confidence)}`;
    elements.regionNote.textContent = region.population_note || "No population note available.";

    const cards = [
        buildStatCard("Population", formatInteger(region.end_population), signedDelta(region.end_population - region.start_population), toneFromSigned(region.end_population - region.start_population)),
        buildStatCard("Natural change", formatSignedInteger(region.natural_change), "Births minus deaths", toneFromSigned(region.natural_change)),
        buildStatCard("External migration", formatSignedInteger(region.net_external_migration), "Cross-border movement", toneFromSigned(region.net_external_migration)),
        buildStatCard("Internal migration", formatSignedInteger(region.internal_migration), "Within the same country", toneFromSigned(region.internal_migration)),
        buildStatCard("GDP", `${formatDecimal(region.end_gdp_billion_eur)} bn EUR`, `Growth ${formatPercent(region.gdp_growth_rate)}`, toneFromSigned(region.gdp_growth_rate)),
        buildStatCard("GDP per capita", `${formatInteger(Math.round(region.gdp_per_capita_eur))} EUR`, "End-of-step value", "tone-neutral"),
        buildStatCard("Unemployment", formatPercent(region.unemployment_rate), "Lower is better", toneFromInversePercent(region.unemployment_rate)),
        buildStatCard("Attractiveness", formatDecimal(region.regional_attractiveness), "Current regional score", toneFromThreshold(region.regional_attractiveness, 0.5)),
        buildStatCard("Density", `${formatDecimal(region.population_density)} / km^2`, "Based on end population", "tone-neutral"),
        buildStatCard("Housing overload", formatDecimal(region.housing_overload), "Above 1.00 signals strain", toneFromInverseThreshold(region.housing_overload, 1)),
    ];

    elements.regionCards.innerHTML = cards.join("");
}

function renderComparisonTable(regions, activeRegionName) {
    if (!regions.length) {
        elements.comparisonBody.innerHTML =
            '<tr><td colspan="7" class="table-empty">No region data for the selected country and year.</td></tr>';
        return;
    }

    elements.comparisonBody.innerHTML = regions
        .map((region) => {
            const rowClass = region.region_name === activeRegionName ? "row-active" : "";
            return `
                <tr class="${rowClass}">
                    <td>${escapeHtml(region.region_name)}</td>
                    <td>${formatInteger(region.end_population)}</td>
                    <td>${formatDecimal(region.end_gdp_billion_eur)} bn</td>
                    <td>${formatInteger(Math.round(region.gdp_per_capita_eur))} EUR</td>
                    <td>${formatPercent(region.unemployment_rate)}</td>
                    <td>${formatDecimal(region.regional_attractiveness)}</td>
                    <td>${formatDecimal(region.housing_overload)}</td>
                </tr>
            `;
        })
        .join("");
}

function renderEmptyDashboard() {
    elements.simulationWindow.textContent = "-";
    elements.availableSteps.textContent = "-";
    elements.warningCount.textContent = "-";
    elements.countryTitle.textContent = "No country selected";
    elements.countryCodePill.textContent = "-";
    elements.countryGrowthPill.textContent = "Growth -";
    elements.regionTitle.textContent = "No region selected";
    elements.regionCountryPill.textContent = "-";
    elements.regionConfidencePill.textContent = "Confidence -";
    elements.countryCards.innerHTML = buildEmptyCards("Load a BESP export to unlock country metrics.");
    elements.regionCards.innerHTML = buildEmptyCards("Load a BESP export to unlock region metrics.");
    elements.regionNote.textContent = "Select a region to inspect its working-note context.";
    elements.comparisonBody.innerHTML =
        '<tr><td colspan="7" class="table-empty">Load an export to compare regions.</td></tr>';
}

function buildStatCard(label, value, hint, toneClass) {
    return `
        <article class="stat-card">
            <span class="stat-label">${escapeHtml(label)}</span>
            <h3 class="stat-value ${toneClass}">${escapeHtml(value)}</h3>
            <p class="stat-hint">${escapeHtml(hint)}</p>
        </article>
    `;
}

function buildEmptyCards(message) {
    return `
        <article class="stat-card">
            <span class="stat-label">Waiting for data</span>
            <h3 class="stat-value tone-neutral">-</h3>
            <p class="stat-hint">${escapeHtml(message)}</p>
        </article>
    `;
}

function renderStatus(message) {
    elements.dataStatus.textContent = message;
}

function formatInteger(value) {
    return integerFormatter.format(value);
}

function formatSignedInteger(value) {
    return `${value > 0 ? "+" : ""}${integerFormatter.format(value)}`;
}

function signedDelta(value) {
    return `${value > 0 ? "+" : ""}${integerFormatter.format(value)} from start`;
}

function formatDecimal(value) {
    return decimalFormatter.format(value);
}

function formatPercent(value) {
    return percentFormatter.format(value);
}

function toneFromSigned(value) {
    if (value > 0) {
        return "tone-positive";
    }

    if (value < 0) {
        return "tone-negative";
    }

    return "tone-neutral";
}

function toneFromThreshold(value, threshold) {
    return value >= threshold ? "tone-positive" : "tone-negative";
}

function toneFromInverseThreshold(value, threshold) {
    return value <= threshold ? "tone-positive" : "tone-negative";
}

function toneFromInversePercent(value) {
    return value <= 0.1 ? "tone-positive" : value <= 0.18 ? "tone-neutral" : "tone-negative";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
