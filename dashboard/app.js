const EXPORT_PATH = "../output/latest.json";
const RUN_STATUS_PATH = "/api/run-status";
const RUN_SCENARIOS_PATH = "/api/scenarios";
const RUN_TRIGGER_PATH = "/api/run";
const MAP_VIEWBOX_WIDTH = 780;
const MAP_VIEWBOX_HEIGHT = 520;
const MAP_PADDING = 22;
const TARGET_COUNTRIES = new Set(["BIH", "MNE", "SRB"]);
const COUNTRY_LABEL_OFFSETS = {
    SRB: [0, -26],
    BIH: [0, 0],
    MNE: [0, 0],
};
const VISUAL_REGION_LABEL_OFFSETS = {
    "BIH::fbih": [26, 18],
    "BIH::rs": [-30, -16],
    "MNE::boka": [-26, 2],
    "MNE::primorje": [8, 16],
    "MNE::zeta": [26, 0],
    "MNE::stara-crna-gora": [8, -14],
    "MNE::brda": [-8, 10],
};
const VISUAL_REGION_SOURCE_NAME_OVERRIDES = {
    "SRB::sz-srb": "Sumadija and Western Serbia",
};
const COUNTRY_FLAGS = {
    BIH: "🇧🇦",
    MNE: "🇲🇪",
    SRB: "🇷🇸",
};
const BASE_PLAYBACK_INTERVAL_MS = 1400;
const GEOJSON_PATHS = {
    country: ["BIH", "MNE", "SRB"].map(
        (code) => `./data/geoBoundaries-${code}-ADM0_simplified.geojson`
    ),
    region: [
        ...["BIH", "MNE", "SRB"].map(
            (code) => `./data/geoBoundaries-${code}-ADM1_simplified.geojson`
        ),
        "./data/geoBoundaries-XKX-ADM0_simplified.geojson",
    ],
};
const REGION_NAME_ALIASES = Object.fromEntries([
    ["federation of bosnia and herzegovina", "federation of bosnia and herzegovina"],
    ["federation of bosnia-herzegovina", "federation of bosnia and herzegovina"],
    ["republika srpska", "republika srpska"], ["brcko", "brcko"], ["brcko district", "brcko"],
    ["belgrade", "belgrade"], ["belgrade district", "belgrade"],
    ["autonomous province of vojvodina", "vojvodina"], ["vojvodina", "vojvodina"],
    ["central serbia", "central serbia"], ["south and east serbia", "south and east serbia"],
    ["kosovo and metohija", "kosovo and metohija"], ["kosovo", "kosovo and metohija"],
    ["kosovo & metohija", "kosovo and metohija"], ["coast", "coast"], ["inland", "inland"],
]);
const REGION_GROUPS = {
    "SRB::vojvodina": [
        "autonomous province of vojvodina", "vojvodina", "syrmia district",
        "south banat district", "north banat district", "north backa district",
        "central banat district", "west backa district", "south backa district",
    ],
    "SRB::south and east serbia": [
        "bor district", "pcinja district", "branicevo district", "zajecar district",
        "pirot district", "jablanica district", "toplica district", "nisava district",
        "rasina district", "pomoravlje district", "podunavlje district",
    ],
    "SRB::central serbia": [
        "kolubara district", "macva district", "sumadija district",
        "moravica district", "zlatibor district", "raska district",
    ],
    "MNE::coast": [
        "herceg novi municipality", "bar municipality", "budva municipality",
        "kotor municipality", "tivat municipality", "ulcinj municipality",
    ],
    "MNE::inland": [
        "plav municipality", "rozaje municipality", "andrijevica municipality",
        "berane municipality", "podgorica municipality", "bijelo polje municipality",
        "cetinje municipality", "danilovgrad municipality", "kolasin municipality",
        "mojkovac municipality", "niksic municipality", "pljevlja municipality",
        "pluzine municipality", "savnik municipality", "zabljak municipality",
        "gusinje municipality", "petnjica municipality",
    ],
};
const VISUAL_REGION_DEFINITIONS = {
    "BIH::fbih": { label: "FBiH", dataRegionKey: "BIH::federation of bosnia and herzegovina", fill: "#8f776d" },
    "BIH::rs": { label: "RS", dataRegionKey: "BIH::republika srpska", fill: "#a4a08c" },
    "SRB::vojvodina": { label: "Vojvodina", dataRegionKey: "SRB::vojvodina", fill: "#70b29e" },
    "SRB::belgrade": { label: "Beograd", dataRegionKey: "SRB::belgrade", fill: "#b0a59a" },
    "SRB::sz-srb": { label: "SZ SRB", dataRegionKey: "SRB::central serbia", fill: "#dce68d" },
    "SRB::ji-srb": { label: "JI SRB", dataRegionKey: "SRB::south and east serbia", fill: "#cf857c" },
    "SRB::kosovo-metohija": { label: "Kosovo i Metohija", dataRegionKey: "SRB::kosovo and metohija", fill: "#efb287" },
    "MNE::boka": { label: "Boka", dataRegionKey: "MNE::coast", fill: "#78b8c8" },
    "MNE::primorje": { label: "Primorje", dataRegionKey: "MNE::coast", fill: "#5aa6b7" },
    "MNE::zeta": { label: "Zeta", dataRegionKey: "MNE::inland", fill: "#8fca78" },
    "MNE::stara-crna-gora": { label: "Stara Crna Gora", dataRegionKey: "MNE::inland", fill: "#9f7fb7" },
    "MNE::stara-hercegovina": { label: "Stara Hercegovina", dataRegionKey: "MNE::inland", fill: "#2c8f81" },
    "MNE::brda": { label: "Brda", dataRegionKey: "MNE::inland", fill: "#5e98cf" },
    "MNE::stara-raska": { label: "Stara Raska", dataRegionKey: "MNE::inland", fill: "#c6964d" },
};
const STATE_METRICS = [
    ["budget_balance_pct_gdp", "Avg budget balance"],
    ["debt_to_gdp", "Avg debt-to-GDP"],
    ["stability_index", "Avg stability"],
    ["corruption_index", "Avg corruption"],
    ["investment_climate_index", "Avg investment climate"],
];
function expandFeatureGroups(groups, targetMapper = (targetKey) => targetKey) {
    return Object.fromEntries(
        Object.entries(groups).flatMap(([targetKey, names]) => {
            const countryCode = targetKey.split("::")[0];
            return names.map((name) => [`${countryCode}::${name}`, targetMapper(targetKey)]);
        })
    );
}
const REGION_FEATURE_TO_BESP = {
    "BIH::federation of bosnia and herzegovina": "BIH::federation of bosnia and herzegovina",
    "BIH::republika srpska": "BIH::republika srpska",
    "BIH::brcko": "BIH::republika srpska",
    "SRB::belgrade": "SRB::belgrade",
    "SRB::kosovo": "SRB::kosovo and metohija",
    ...expandFeatureGroups(REGION_GROUPS),
};
const BESP_REGION_KEYS = new Set(Object.values(REGION_FEATURE_TO_BESP));
const FEATURE_TO_VISUAL_REGION = {
    "BIH::federation of bosnia and herzegovina": "BIH::fbih",
    "BIH::republika srpska": "BIH::rs",
    "BIH::brcko": "BIH::rs",
    "SRB::belgrade": "SRB::belgrade",
    "SRB::kosovo": "SRB::kosovo-metohija",
    "SRB::kosovo and metohija": "SRB::kosovo-metohija",
    ...expandFeatureGroups({
        "SRB::vojvodina": REGION_GROUPS["SRB::vojvodina"],
        "SRB::sz-srb": REGION_GROUPS["SRB::central serbia"],
        "SRB::ji-srb": REGION_GROUPS["SRB::south and east serbia"],
        "MNE::boka": ["herceg novi municipality", "kotor municipality", "tivat municipality"],
        "MNE::primorje": ["budva municipality", "bar municipality", "ulcinj municipality"],
        "MNE::zeta": ["podgorica municipality", "danilovgrad municipality"],
        "MNE::stara-crna-gora": ["cetinje municipality"],
        "MNE::stara-hercegovina": ["niksic municipality", "pljevlja municipality", "pluzine municipality", "savnik municipality", "zabljak municipality"],
        "MNE::brda": ["kolasin municipality", "mojkovac municipality", "andrijevica municipality", "berane municipality"],
        "MNE::stara-raska": ["bijelo polje municipality", "rozaje municipality", "plav municipality", "gusinje municipality", "petnjica municipality"],
    }),
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
function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(value, maximum));
}
const mapDataCache = {
    countriesByCode: new Map(),
    regionsByKey: new Map(),
    visualRegionsByKey: new Map(),
};
const dashboardState = {
    exportData: null,
    geoData: null,
    geoWarning: "",
    yearKeys: [],
    currentYearIndex: 0,
    playbackSpeed: 1,
    playbackTimer: null,
    isReloading: false,
    isGeneratingRun: false,
    runServiceAvailable: false,
    runStatusPollTimer: null,
    availableScenarios: [],
    countryRowCount: 0,
    regionRowCount: 0,
};
let activeMapMode = "country";
const elements = {
    metaCards: document.getElementById("meta-cards"),
    stateCards: document.getElementById("state-cards"),
    mapModeCountryButton: document.getElementById("map-mode-country"),
    mapModeRegionButton: document.getElementById("map-mode-region"),
    yearStepBackButton: document.getElementById("year-step-back"),
    yearStepForwardButton: document.getElementById("year-step-forward"),
    playbackToggleButton: document.getElementById("playback-toggle"),
    reloadExportButton: document.getElementById("reload-export"),
    generateRunButton: document.getElementById("generate-run"),
    runScenarioSelect: document.getElementById("run-scenario-select"),
    runShocksEnabled: document.getElementById("run-shocks-enabled"),
    yearSelect: document.getElementById("year-select"),
    currentYearPill: document.getElementById("current-year-pill"),
    exportStatus: document.getElementById("export-status"),
    speedButtons: Array.from(document.querySelectorAll(".speed-button")),
    mapHoverTitle: document.getElementById("map-hover-title"),
    mapHoverBody: document.getElementById("map-hover-body"),
    countryLayer: document.getElementById("country-layer"),
    countryLabelLayer: document.getElementById("country-label-layer"),
    regionLayer: document.getElementById("region-layer"),
    regionLabelLayer: document.getElementById("region-label-layer"),
    mapSummaryCards: document.getElementById("map-summary-cards"),
    stateTableBody: document.getElementById("state-table-body"),
    countryTableBody: document.getElementById("country-table-body"),
    regionTableBody: document.getElementById("region-table-body"),
};
const EMPTY_CARDS = {
    map: buildEmptyCard("No country layer data", "Load export data to render the country map layer."),
    meta: buildEmptyCard("No data loaded", "The dashboard is waiting for <code>output/latest.json</code>."),
    state: buildEmptyCard("No state data loaded", "Run or load an export with Phase 8 state values."),
    stateYear: buildEmptyCard("No state data loaded", "No country rows found for the selected year."),
};
const EMPTY_TABLE_ROWS = {
    country: buildEmptyTableRow(7, "No country summary loaded yet."),
    countryExport: buildEmptyTableRow(7, "No country year values found in the export."),
    state: buildEmptyTableRow(7, "No state summary loaded yet."),
    region: buildEmptyTableRow(8, "No region summary loaded yet."),
    regionExport: buildEmptyTableRow(8, "No region year values found in the export."),
};
document.addEventListener("DOMContentLoaded", () => {
    bindMapModeEvents();
    bindPlaybackControls();
    renderEmptyState();
    void initializeDashboard();
});
function bindMapModeEvents() {
    elements.mapModeCountryButton.addEventListener("click", () => setMapMode("country"));
    elements.mapModeRegionButton.addEventListener("click", () => setMapMode("region"));
}
async function initializeDashboard() {
    await refreshRunServiceState({ includeScenarios: true });
    await loadDashboardData();
}
async function reloadDashboardAndServiceState() {
    await refreshRunServiceState({ includeScenarios: true });
    await loadDashboardData({ reason: "reload" });
}
function bindPlaybackControls() {
    elements.yearStepBackButton.addEventListener("click", () => stepTimeline(-1));
    elements.yearStepForwardButton.addEventListener("click", () => stepTimeline(1));
    elements.playbackToggleButton.addEventListener("click", () => {
        if (dashboardState.playbackTimer) {
            stopPlayback();
        } else {
            startPlayback();
        }
    });
    elements.reloadExportButton.addEventListener("click", () => {
        void reloadDashboardAndServiceState();
    });
    elements.generateRunButton.addEventListener("click", () => {
        void triggerGenerateRun();
    });
    elements.yearSelect.addEventListener("change", () => {
        const nextIndex = dashboardState.yearKeys.indexOf(elements.yearSelect.value);
        if (nextIndex >= 0) {
            setCurrentYearIndex(nextIndex);
        }
    });
    for (const button of elements.speedButtons) {
        button.addEventListener("click", () => {
            const nextSpeed = Number.parseInt(button.dataset.speed ?? "1", 10);
            setPlaybackSpeed(Number.isFinite(nextSpeed) ? nextSpeed : 1);
        });
    }
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
function initializeTimelineControls() {
    elements.yearSelect.innerHTML = dashboardState.yearKeys
        .map((yearKey) => `<option value="${escapeHtml(yearKey)}">${escapeHtml(yearKey)}</option>`)
        .join("");
    updatePlaybackControls();
}
function getActiveYearKey() {
    return dashboardState.yearKeys[dashboardState.currentYearIndex] ?? "";
}
function setCurrentYearIndex(nextIndex) {
    if (!dashboardState.yearKeys.length) {
        return;
    }
    dashboardState.currentYearIndex = clamp(nextIndex, 0, dashboardState.yearKeys.length - 1);
    renderActiveYearState();
    if (dashboardState.playbackTimer) {
        restartPlaybackTimer();
    }
}
function stepTimeline(step) {
    if (!dashboardState.yearKeys.length) {
        return;
    }
    setCurrentYearIndex(dashboardState.currentYearIndex + step);
}
function setPlaybackSpeed(nextSpeed) {
    dashboardState.playbackSpeed = nextSpeed;
    updatePlaybackControls();
    if (dashboardState.playbackTimer) {
        restartPlaybackTimer();
    }
}
function startPlayback() {
    if (!dashboardState.yearKeys.length || dashboardState.playbackTimer) {
        return;
    }
    if (dashboardState.currentYearIndex >= dashboardState.yearKeys.length - 1) {
        dashboardState.currentYearIndex = 0;
        renderActiveYearState();
    }
    restartPlaybackTimer();
    updatePlaybackControls();
}
function stopPlayback() {
    if (dashboardState.playbackTimer) {
        window.clearInterval(dashboardState.playbackTimer);
        dashboardState.playbackTimer = null;
    }
    updatePlaybackControls();
}
function restartPlaybackTimer() {
    stopPlayback();
    const interval = Math.max(240, Math.round(BASE_PLAYBACK_INTERVAL_MS / dashboardState.playbackSpeed));
    dashboardState.playbackTimer = window.setInterval(() => {
        if (dashboardState.currentYearIndex >= dashboardState.yearKeys.length - 1) {
            stopPlayback();
            return;
        }
        dashboardState.currentYearIndex += 1;
        renderActiveYearState();
    }, interval);
    updatePlaybackControls();
}
function updatePlaybackControls() {
    const hasYears = dashboardState.yearKeys.length > 0;
    const activeYearKey = getActiveYearKey();
    const runControlsDisabled = dashboardState.isGeneratingRun || !dashboardState.runServiceAvailable;
    elements.yearSelect.value = activeYearKey;
    elements.yearSelect.disabled = !hasYears || dashboardState.isReloading;
    elements.yearStepBackButton.disabled =
        dashboardState.isReloading || !hasYears || dashboardState.currentYearIndex <= 0;
    elements.yearStepForwardButton.disabled =
        dashboardState.isReloading
        || !hasYears
        || dashboardState.currentYearIndex >= dashboardState.yearKeys.length - 1;
    elements.playbackToggleButton.disabled = dashboardState.isReloading || dashboardState.yearKeys.length < 2;
    elements.reloadExportButton.disabled = dashboardState.isReloading;
    elements.currentYearPill.textContent = activeYearKey || "No year loaded";
    elements.reloadExportButton.textContent = dashboardState.isReloading ? "Reloading..." : "Reload Export";
    elements.generateRunButton.disabled = runControlsDisabled;
    elements.generateRunButton.textContent = dashboardState.isGeneratingRun ? "Generating..." : "Generate Run";
    elements.runScenarioSelect.disabled = runControlsDisabled;
    elements.runShocksEnabled.disabled = runControlsDisabled;
    elements.playbackToggleButton.textContent = dashboardState.playbackTimer ? "Pause" : "Play";
    for (const button of elements.speedButtons) {
        const speed = Number.parseInt(button.dataset.speed ?? "1", 10);
        button.classList.toggle("speed-button-active", speed === dashboardState.playbackSpeed);
        button.disabled = dashboardState.isReloading || !hasYears;
    }
}
async function refreshRunServiceState({ includeScenarios = false } = {}) {
    try {
        const requests = [fetchJson(RUN_STATUS_PATH)];
        if (includeScenarios || !dashboardState.availableScenarios.length) {
            requests.push(fetchJson(RUN_SCENARIOS_PATH));
        }
        const [runStatus, scenarios] = await Promise.all(requests);
        dashboardState.runServiceAvailable = true;
        applyRunStatus(runStatus);
        if (Array.isArray(scenarios)) {
            dashboardState.availableScenarios = scenarios;
            renderScenarioOptions(scenarios);
        }
    } catch {
        dashboardState.runServiceAvailable = false;
        dashboardState.isGeneratingRun = false;
        stopRunStatusPolling();
        renderScenarioOptions([]);
        setExportStatus(
            "Local run service unavailable. Start the local run service or use py main.py and Reload Export.",
            "muted"
        );
    } finally {
        updatePlaybackControls();
    }
}
function renderScenarioOptions(scenarios) {
    const safeScenarios = Array.isArray(scenarios) ? scenarios : [];
    elements.runScenarioSelect.innerHTML = safeScenarios
        .map((scenario) => `
            <option value="${escapeHtml(scenario.code)}">${escapeHtml(scenario.name)}</option>
        `)
        .join("");
    if (!safeScenarios.length) {
        elements.runScenarioSelect.innerHTML = '<option value="">Service offline</option>';
    }
}
function applyRunStatus(runStatus) {
    const state = String(runStatus?.state ?? "idle");
    dashboardState.isGeneratingRun = state === "running";
    if (state === "running") {
        const scenarioLabel = runStatus?.scenario_name || runStatus?.scenario_code || "simulation";
        const shocksLabel = runStatus?.shocks_enabled ? "shocks on" : "shocks off";
        setExportStatus(`Generating a fresh ${scenarioLabel} run (${shocksLabel}) ...`, "loading");
        startRunStatusPolling();
        return;
    }
    stopRunStatusPolling();
    if (state === "failed") {
        const detail = runStatus?.message ? ` ${runStatus.message}` : "";
        setExportStatus(`Local run failed.${detail}`.trim(), "error");
        return;
    }
    if (state === "success") {
        const scenarioLabel = runStatus?.scenario_name || runStatus?.scenario_code || "simulation";
        const shocksLabel = runStatus?.shocks_enabled ? "shocks on" : "shocks off";
        const seedLabel = runStatus?.variation_seed ? ` Seed ${runStatus.variation_seed}.` : "";
        setExportStatus(`Latest ${scenarioLabel} run is ready (${shocksLabel}).${seedLabel}`.trim(), "success");
        return;
    }
    setExportStatus(
        dashboardState.runServiceAvailable
            ? "Use Generate Run for a fresh local simulation, Reload Export for the newest JSON, and Play for timeline playback."
            : "Local run service unavailable. Start the local run service or use py main.py and Reload Export.",
        "muted"
    );
}
async function triggerGenerateRun() {
    if (!dashboardState.runServiceAvailable || dashboardState.isGeneratingRun) {
        return;
    }
    dashboardState.isGeneratingRun = true;
    updatePlaybackControls();
    setExportStatus("Starting a fresh local simulation run ...", "loading");
    try {
        const response = await fetch(RUN_TRIGGER_PATH, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({
                scenario: elements.runScenarioSelect.value || "baseline",
                shocks_enabled: elements.runShocksEnabled.checked,
            }),
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload?.message || `HTTP ${response.status}`);
        }
        applyRunStatus(payload);
    } catch (error) {
        dashboardState.isGeneratingRun = false;
        const detail = error instanceof Error ? error.message : "Unknown run start error.";
        setExportStatus(`Could not start local run. ${detail}`, "error");
        updatePlaybackControls();
    }
}
function startRunStatusPolling() {
    if (dashboardState.runStatusPollTimer) {
        return;
    }
    dashboardState.runStatusPollTimer = window.setInterval(async () => {
        try {
            const runStatus = await fetchJson(RUN_STATUS_PATH);
            applyRunStatus(runStatus);
            updatePlaybackControls();
            if (runStatus?.state === "success") {
                await loadDashboardData({ reason: "reload" });
                const refreshedStatus = await fetchJson(RUN_STATUS_PATH);
                applyRunStatus(refreshedStatus);
                updatePlaybackControls();
            }
        } catch {
            stopRunStatusPolling();
            dashboardState.isGeneratingRun = false;
            dashboardState.runServiceAvailable = false;
            setExportStatus(
                "Lost connection to the local run service. Restart it, then try Generate Run again.",
                "error"
            );
            updatePlaybackControls();
        }
    }, 1250);
}
function stopRunStatusPolling() {
    if (dashboardState.runStatusPollTimer) {
        window.clearInterval(dashboardState.runStatusPollTimer);
        dashboardState.runStatusPollTimer = null;
    }
}
async function loadDashboardData({ reason = "initial" } = {}) {
    const isReload = reason === "reload";
    stopPlayback();
    dashboardState.isReloading = true;
    setExportStatus(
        isReload ? "Reloading output/latest.json ..." : "Loading output/latest.json ...",
        "loading"
    );
    updatePlaybackControls();
    try {
        const exportData = await fetchJson(EXPORT_PATH);
        if (!isValidExport(exportData)) {
            throw new Error("Invalid BESP export shape");
        }
        let geoData = dashboardState.geoData;
        let geoWarning = dashboardState.geoWarning;
        if (!geoData) {
            geoWarning = "";
            try {
                geoData = await loadGeoBoundaryData();
            } catch (error) {
                geoWarning = error instanceof Error ? error.message : "GeoJSON load failed";
            }
        }
        renderDashboard(exportData, geoData, geoWarning);
        setExportStatus(
            isReload
                ? "Export reloaded. Generate Run creates a fresh local simulation; Play replays the loaded years."
                : "Export loaded. Generate Run creates a fresh local simulation; Play replays the loaded years.",
            "success"
        );
    } catch (error) {
        const detail = error instanceof Error ? ` (${error.message})` : "";
        setExportStatus(
            "Could not load output/latest.json. Run py main.py, then use Reload Export."
            + detail,
            "error"
        );
        renderLoadError(
            "Could not load output/latest.json. Run py main.py and serve the repository root before opening the dashboard."
            + detail
        );
    } finally {
        dashboardState.isReloading = false;
        updatePlaybackControls();
    }
}
async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${path}`);
    }
    return response.json();
}
async function loadGeoBoundaryData() {
    const [countryCollections, regionCollections] = await Promise.all([
        Promise.all(GEOJSON_PATHS.country.map((path) => fetchJson(path))),
        Promise.all(GEOJSON_PATHS.region.map((path) => fetchJson(path))),
    ]);
    const countryFeaturesRaw = countryCollections.flatMap((collection) => collection.features ?? []);
    const regionFeaturesRaw = regionCollections.flatMap((collection) => collection.features ?? []);
    const countryFeatures = countryFeaturesRaw
        .map((feature) => normalizeGeoFeature(feature, "country"))
        .filter((feature) => feature && TARGET_COUNTRIES.has(feature.countryCode));
    const regionFeatures = regionFeaturesRaw
        .map((feature) => normalizeGeoFeature(feature, "region"))
        .filter((feature) => feature && TARGET_COUNTRIES.has(feature.countryCode));
    const allGeometryFeatures = [...countryFeatures, ...regionFeatures];
    if (!allGeometryFeatures.length) {
        throw new Error("No usable GeoJSON features found");
    }
    const projection = createProjection(allGeometryFeatures);
    const projectedCountryFeatures = countryFeatures
        .map((feature) => projectFeature(feature, projection, "country"))
        .filter((feature) => feature !== null);
    const projectedRegionFeatures = regionFeatures
        .map((feature) => projectFeature(feature, projection, "region"))
        .filter((feature) => feature !== null);
    return {
        countryFeatures: projectedCountryFeatures,
        regionFeatures: projectedRegionFeatures,
    };
}
function normalizeGeoFeature(feature, layerType) {
    if (!feature || !feature.geometry || !feature.properties) {
        return null;
    }
    const properties = feature.properties;
    const rawCountryCode = normalizeCountryCode(properties.shapeGroup || properties.shapeISO);
    let countryCode = rawCountryCode;
    let name = String(properties.shapeName ?? "").trim();
    // BESP models Kosovo as part of SRB scope. We keep that mapping in the frontend layer only.
    if (rawCountryCode === "XKX") {
        countryCode = "SRB";
        if (layerType === "region") {
            name = "Kosovo and Metohija";
        }
    }
    if (!countryCode || !name) {
        return null;
    }
    return {
        countryCode,
        rawCountryCode,
        name,
        geometry: feature.geometry,
    };
}
function createProjection(features) {
    let minLon = Number.POSITIVE_INFINITY;
    let maxLon = Number.NEGATIVE_INFINITY;
    let minLat = Number.POSITIVE_INFINITY;
    let maxLat = Number.NEGATIVE_INFINITY;
    for (const feature of features) {
        const points = extractCoordinates(feature.geometry);
        for (const [lon, lat] of points) {
            if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
                continue;
            }
            minLon = Math.min(minLon, lon);
            maxLon = Math.max(maxLon, lon);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
        }
    }
    if (!Number.isFinite(minLon) || !Number.isFinite(maxLon) || !Number.isFinite(minLat) || !Number.isFinite(maxLat)) {
        throw new Error("Could not compute map bounds");
    }
    const lonSpan = Math.max(maxLon - minLon, 1e-9);
    const latSpan = Math.max(maxLat - minLat, 1e-9);
    const usableWidth = MAP_VIEWBOX_WIDTH - MAP_PADDING * 2;
    const usableHeight = MAP_VIEWBOX_HEIGHT - MAP_PADDING * 2;
    const scale = Math.min(usableWidth / lonSpan, usableHeight / latSpan);
    const offsetX = (MAP_VIEWBOX_WIDTH - lonSpan * scale) / 2;
    const offsetY = (MAP_VIEWBOX_HEIGHT - latSpan * scale) / 2;
    return (lon, lat) => {
        const x = offsetX + (lon - minLon) * scale;
        const y = offsetY + (maxLat - lat) * scale;
        return [x, y];
    };
}
function projectFeature(feature, projection, kind) {
    const includeHoles = kind !== "country";
    const pathD = geometryToPath(feature.geometry, projection, includeHoles);
    if (!pathD) {
        return null;
    }
    const centroid = geometryCentroid(feature.geometry, projection);
    const projectedArea = geometryProjectedArea(feature.geometry, projection, includeHoles);
    const key = buildRegionKey(feature.countryCode, feature.name);
    const bespRegionKey = kind === "region" ? resolveBespRegionKey(feature.countryCode, feature.name) : null;
    const visualRegion = kind === "region" ? resolveVisualRegion(feature.countryCode, feature.name, bespRegionKey) : null;
    return {
        ...feature,
        key,
        bespRegionKey,
        visualRegionKey: visualRegion?.visualRegionKey ?? null,
        visualRegionLabel: visualRegion?.label ?? null,
        visualRegionDataKey: visualRegion?.dataRegionKey ?? bespRegionKey,
        visualRegionFill: visualRegion?.fill ?? null,
        pathD,
        centroid,
        projectedArea,
    };
}
function geometryToPath(geometry, projection, includeHoles = true) {
    const type = geometry?.type;
    const coordinates = geometry?.coordinates;
    if (!type || !coordinates) {
        return "";
    }
    if (type === "Polygon") {
        return polygonToPath(coordinates, projection, includeHoles);
    }
    if (type === "MultiPolygon") {
        return coordinates.map((polygon) => polygonToPath(polygon, projection, includeHoles)).join(" ");
    }
    return "";
}
function polygonToPath(polygonCoordinates, projection, includeHoles) {
    const rings = includeHoles ? polygonCoordinates : polygonCoordinates.slice(0, 1);
    return rings
        .map((ring) => {
            if (!Array.isArray(ring) || ring.length < 3) {
                return "";
            }
            const points = ring
                .map((coord) => projection(coord[0], coord[1]))
                .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`);
            return `M ${points.join(" L ")} Z`;
        })
        .filter((segment) => segment)
        .join(" ");
}
function geometryCentroid(geometry, projection) {
    const points = extractCoordinates(geometry);
    if (!points.length) {
        return [MAP_VIEWBOX_WIDTH / 2, MAP_VIEWBOX_HEIGHT / 2];
    }
    let lonSum = 0;
    let latSum = 0;
    for (const [lon, lat] of points) {
        lonSum += lon;
        latSum += lat;
    }
    const avgLon = lonSum / points.length;
    const avgLat = latSum / points.length;
    return projection(avgLon, avgLat);
}
function extractCoordinates(geometry) {
    const type = geometry?.type;
    const coordinates = geometry?.coordinates;
    if (!type || !coordinates) {
        return [];
    }
    if (type === "Polygon") {
        return coordinates.flat();
    }
    if (type === "MultiPolygon") {
        return coordinates.flat(2);
    }
    return [];
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
function renderDashboard(exportData, geoData, geoWarning) {
    const countryRows = flattenYearRows(exportData, "countries").sort(compareYearAndCountry);
    const regionRows = flattenYearRows(exportData, "regions").sort(compareYearCountryAndRegion);
    dashboardState.exportData = exportData;
    dashboardState.geoData = geoData;
    dashboardState.geoWarning = geoWarning;
    dashboardState.yearKeys = Object.keys(exportData.years).sort(compareYearKeys);
    dashboardState.currentYearIndex = 0;
    dashboardState.countryRowCount = countryRows.length;
    dashboardState.regionRowCount = regionRows.length;
    initializeTimelineControls();
    renderActiveYearState();
}
function renderMetaCards(exportData, countryRowCount, regionRowCount, activeYearKey, geoWarning = "") {
    const scenarioMeta = exportData.meta?.scenario ?? {};
    const shockMeta = exportData.meta?.shocks ?? {};
    elements.metaCards.innerHTML = [
        ["Selected year", activeYearKey || "-"],
        ["Start year", exportData.meta.start_year],
        ["End year", exportData.meta.end_year],
        ["Scenario", scenarioMeta.name],
        ["Variation seed", scenarioMeta.variation_seed],
        ["Shocks enabled", shockMeta.enabled ? "yes" : "no"],
        ["Shock events", formatInteger(shockMeta.event_count ?? 0)],
        ["Country year values", formatInteger(countryRowCount)],
        ["Region year values", formatInteger(regionRowCount)],
        ["Year buckets", formatInteger(Object.keys(exportData.years).length)],
        ["Validation warnings", formatInteger(exportData.meta.warning_count ?? 0)],
        ["Map warning", geoWarning],
    ].map(([label, value]) => value ? buildMetaCard(label, value) : "").join("");
}
function renderActiveYearState() {
    if (!dashboardState.exportData) {
        return;
    }
    const activeYearKey = getActiveYearKey();
    const { countryRows, regionRows } = buildRowsForYear(dashboardState.exportData, activeYearKey);
    mapDataCache.countriesByCode = new Map(countryRows.map((row) => [normalizeCountryCode(row.country_code), row]));
    mapDataCache.regionsByKey = new Map(regionRows.map((row) => [buildRegionKey(row.country_code, row.region_name), row]));
    renderMetaCards(
        dashboardState.exportData,
        dashboardState.countryRowCount,
        dashboardState.regionRowCount,
        activeYearKey,
        dashboardState.geoWarning
    );
    renderCountryLayer(dashboardState.geoData);
    renderRegionLayer(dashboardState.geoData);
    bindMapHoverEvents();
    renderStatePanels(countryRows);
    renderCountryTable(countryRows);
    renderRegionTable(regionRows);
    updatePlaybackControls();
    applyMapModeVisibility();
    resetMapHoverDetails();
}
function renderLoadError(message) {
    stopPlayback();
    renderEmptyState();
    setExportStatus(message, "error");
    elements.metaCards.innerHTML = `
        <article class="meta-card empty-card">
            <span class="meta-label">Load error</span>
            <strong class="meta-value">No export data</strong>
            <p class="meta-note">${escapeHtml(message)}</p>
        </article>
    `;
}
function buildRowsForYear(exportData, yearKey) {
    const yearData = exportData?.years?.[yearKey] ?? {};
    const countryRows = (Array.isArray(yearData.countries) ? yearData.countries : [])
        .map((country) => ({ yearKey, ...country }))
        .sort(compareYearAndCountry);
    const regionRows = (Array.isArray(yearData.regions) ? yearData.regions : [])
        .map((region) => ({ yearKey, ...region }))
        .sort(compareYearCountryAndRegion);
    return { countryRows, regionRows };
}
function renderCountryLayer(geoData) {
    if (!geoData?.countryFeatures?.length) {
        elements.countryLayer.innerHTML = "";
        elements.countryLabelLayer.innerHTML = "";
        elements.mapSummaryCards.innerHTML = `
            <article class="meta-card empty-card">
                <span class="meta-label">No country layer data</span>
                <strong class="meta-value">-</strong>
                <p class="meta-note">Country GeoJSON could not be loaded.</p>
            </article>
        `;
        return;
    }
    const availableCountryRows = [...mapDataCache.countriesByCode.values()];
    const gdpValues = availableCountryRows.map((entry) => entry.gdp_per_capita_eur);
    const minGdpPerCapita = gdpValues.length ? Math.min(...gdpValues) : 0;
    const maxGdpPerCapita = gdpValues.length ? Math.max(...gdpValues) : 1;
    const groupedByCountry = new Map();
    for (const feature of geoData.countryFeatures) {
        const list = groupedByCountry.get(feature.countryCode) ?? [];
        list.push(feature);
        groupedByCountry.set(feature.countryCode, list);
    }
    const groupedVisualRegions = buildVisualRegionGroups(geoData.regionFeatures ?? []);
    const groupedCountries = [...groupedByCountry.entries()]
        .map(([countryCode, features]) => {
            const syntheticCountryRegions = groupedVisualRegions.filter((group) => group.countryCode === countryCode);
            const mergedPathD = countryCode === "SRB" && syntheticCountryRegions.length
                ? syntheticCountryRegions.map((group) => group.pathD).join(" ")
                : features.map((feature) => feature.pathD).join(" ");
            const labelFeature = features.find((feature) => feature.rawCountryCode === countryCode) ?? features[0];
            const centroid = countryCode === "SRB" && syntheticCountryRegions.length
                ? averageCentroid(syntheticCountryRegions)
                : (labelFeature?.centroid ?? averageCentroid(features));
            const displayName = labelFeature?.countryCode === "SRB"
                ? "Serbia"
                : (labelFeature?.name ?? countryCode);
            return {
                countryCode,
                displayName,
                mergedPathD,
                centroid,
                features,
                syntheticCountryRegions,
            };
        })
        .sort((left, right) => left.countryCode.localeCompare(right.countryCode));
    elements.countryLayer.innerHTML = groupedCountries
        .map((country) => {
            const row = mapDataCache.countriesByCode.get(country.countryCode) ?? null;
            const fill = mapCountryFill(row, minGdpPerCapita, maxGdpPerCapita);
            const kosovoSeamFix = country.countryCode === "SRB"
                ? country.syntheticCountryRegions.find((group) => group.visualRegionKey === "SRB::kosovo-metohija")
                : null;
            return `
                <path
                    class="map-country-shape"
                    data-country-code="${escapeHtml(country.countryCode)}"
                    d="${escapeHtml(country.mergedPathD)}"
                    fill="${escapeHtml(fill)}"
                    stroke="${escapeHtml(fill)}"
                    stroke-width="1.35"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    fill-rule="nonzero"
                ></path>
                ${kosovoSeamFix ? `
                <path
                    class="map-country-shape"
                    data-country-code="${escapeHtml(country.countryCode)}"
                    d="${escapeHtml(kosovoSeamFix.pathD)}"
                    fill="none"
                    stroke="${escapeHtml(fill)}"
                    stroke-width="2.4"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    fill-rule="nonzero"
                    pointer-events="none"
                ></path>
                ` : ""}
            `;
        })
        .join("");
    elements.countryLabelLayer.innerHTML = groupedCountries
        .map((country) => {
            const [offsetX, offsetY] = COUNTRY_LABEL_OFFSETS[country.countryCode] ?? [0, 0];
            return `
            <text class="map-country-label" x="${(country.centroid[0] + offsetX).toFixed(1)}" y="${(country.centroid[1] + offsetY).toFixed(1)}">
                ${escapeHtml(country.countryCode)}
            </text>
        `;
        })
        .join("");
    elements.mapSummaryCards.innerHTML = groupedCountries
        .map((country) => {
            const row = mapDataCache.countriesByCode.get(country.countryCode);
            if (!row) {
                return `
                    <article class="meta-card">
                        <span class="meta-label"><span class="flag-chip">${escapeHtml(countryFlag(country.countryCode))}</span>${escapeHtml(country.displayName)} (${escapeHtml(country.countryCode)})</span>
                        <strong class="meta-value">No data</strong>
                        <p class="meta-note">No matching country export row.</p>
                    </article>
                `;
            }
            return `
                <article class="meta-card">
                    <span class="meta-label"><span class="flag-chip">${escapeHtml(countryFlag(country.countryCode))}</span>${escapeHtml(country.displayName)} (${escapeHtml(country.countryCode)})</span>
                    <strong class="meta-value">${formatInteger(row.end_population)}</strong>
                    <p class="meta-note">
                        ${escapeHtml(row.yearKey)} | GDP ${formatDecimal(row.end_gdp_billion_eur)} bn EUR
                    </p>
                </article>
            `;
        })
        .join("");
}
function averageCentroid(features) {
    if (!features.length) {
        return [MAP_VIEWBOX_WIDTH / 2, MAP_VIEWBOX_HEIGHT / 2];
    }
    let x = 0;
    let y = 0;
    for (const feature of features) {
        x += feature.centroid[0];
        y += feature.centroid[1];
    }
    return [x / features.length, y / features.length];
}
function renderRegionLayer(geoData) {
    if (!geoData?.regionFeatures?.length) {
        elements.regionLayer.innerHTML = "";
        elements.regionLabelLayer.innerHTML = "";
        return;
    }
    const groupedRegions = buildVisualRegionGroups(geoData.regionFeatures);
    mapDataCache.visualRegionsByKey = new Map(groupedRegions.map((group) => [group.visualRegionKey, group]));
    elements.regionLayer.innerHTML = groupedRegions
        .map((group) => `
            <path
                class="map-region-shape"
                data-country-code="${escapeHtml(group.countryCode)}"
                data-region-name="${escapeHtml(group.label)}"
                data-visual-region-key="${escapeHtml(group.visualRegionKey)}"
                data-data-region-key="${escapeHtml(group.dataRegionKey ?? "")}"
                d="${escapeHtml(group.pathD)}"
                fill="${escapeHtml(group.fill)}"
            ></path>
        `)
        .join("");
    elements.regionLabelLayer.innerHTML = groupedRegions
        .map((group) => {
            const [offsetX, offsetY] = VISUAL_REGION_LABEL_OFFSETS[group.visualRegionKey] ?? [0, 0];
            return `
            <text class="map-region-label" x="${(group.centroid[0] + offsetX).toFixed(1)}" y="${(group.centroid[1] + offsetY).toFixed(1)}">
                ${escapeHtml(group.label)}
            </text>
        `;
        })
        .join("");
}
function geometryProjectedArea(geometry, projection, includeHoles = true) {
    const type = geometry?.type;
    const coordinates = geometry?.coordinates;
    if (!type || !coordinates) {
        return 0;
    }
    if (type === "Polygon") {
        return polygonProjectedArea(coordinates, projection, includeHoles);
    }
    if (type === "MultiPolygon") {
        return coordinates.reduce(
            (sum, polygon) => sum + polygonProjectedArea(polygon, projection, includeHoles),
            0
        );
    }
    return 0;
}
function polygonProjectedArea(polygonCoordinates, projection, includeHoles) {
    const rings = includeHoles ? polygonCoordinates : polygonCoordinates.slice(0, 1);
    return rings.reduce((sum, ring, index) => {
        if (!Array.isArray(ring) || ring.length < 3) {
            return sum;
        }
        const projectedRing = ring.map((coord) => projection(coord[0], coord[1]));
        const ringArea = Math.abs(shoelaceArea(projectedRing));
        return sum + (index === 0 ? ringArea : (includeHoles ? -ringArea : 0));
    }, 0);
}
function shoelaceArea(points) {
    let total = 0;
    for (let index = 0; index < points.length; index += 1) {
        const [x1, y1] = points[index];
        const [x2, y2] = points[(index + 1) % points.length];
        total += (x1 * y2) - (x2 * y1);
    }
    return total / 2;
}
function buildVisualRegionGroups(regionFeatures) {
    const groups = new Map();
    for (const feature of regionFeatures) {
        if (!feature.visualRegionKey) {
            continue;
        }
        const list = groups.get(feature.visualRegionKey) ?? [];
        list.push(feature);
        groups.set(feature.visualRegionKey, list);
    }
    const groupedVisualRegions = [...groups.entries()].map(([visualRegionKey, features]) => {
        const template = VISUAL_REGION_DEFINITIONS[visualRegionKey];
        const mergedPathD = features.map((feature) => feature.pathD).join(" ");
        return {
            visualRegionKey,
            label: template?.label ?? visualRegionKey,
            dataRegionKey: template?.dataRegionKey ?? features[0]?.visualRegionDataKey ?? null,
            countryCode: features[0]?.countryCode ?? "",
            fill: template?.fill ?? "rgba(126, 143, 161, 0.5)",
            centroid: averageCentroid(features),
            projectedArea: features.reduce((sum, feature) => sum + (feature.projectedArea ?? 0), 0),
            pathD: mergedPathD,
        };
    });
    const areaTotalsByDataKey = new Map();
    for (const group of groupedVisualRegions) {
        const total = areaTotalsByDataKey.get(group.dataRegionKey) ?? 0;
        areaTotalsByDataKey.set(group.dataRegionKey, total + group.projectedArea);
    }
    return groupedVisualRegions.map((group) => {
        const totalArea = areaTotalsByDataKey.get(group.dataRegionKey) ?? 0;
        const areaShare = totalArea > 0 ? group.projectedArea / totalArea : 1;
        return {
            ...group,
            areaShare,
            displayData: buildVisualRegionDisplayData(group, areaShare),
        };
    });
}
function buildVisualRegionDisplayData(group, areaShare) {
    const source = group.dataRegionKey ? mapDataCache.regionsByKey.get(group.dataRegionKey) : null;
    if (!source) {
        return null;
    }
    const share = clamp(areaShare, 0.08, 1.0);
    const scaledPopulation = Math.max(1, Math.round(source.end_population * share));
    const scaledStartPopulation = Math.max(1, Math.round(source.start_population * share));
    const scaledEndGdp = source.end_gdp_billion_eur * share;
    const scaledStartGdp = source.start_gdp_billion_eur * share;
    return {
        ...source,
        region_name: group.label,
        source_region_name: VISUAL_REGION_SOURCE_NAME_OVERRIDES[group.visualRegionKey] ?? source.region_name,
        start_population: scaledStartPopulation,
        end_population: scaledPopulation,
        births: Math.round(source.births * share),
        deaths: Math.round(source.deaths * share),
        natural_change: Math.round(source.natural_change * share),
        net_external_migration: Math.round(source.net_external_migration * share),
        internal_migration: Math.round(source.internal_migration * share),
        start_gdp_billion_eur: scaledStartGdp,
        end_gdp_billion_eur: scaledEndGdp,
        gdp_per_capita_eur: scaledPopulation > 0 ? (scaledEndGdp * 1_000_000_000) / scaledPopulation : 0,
        is_visual_split: normalizeRegionName(group.label) !== normalizeRegionName(source.region_name),
    };
}
function bindMapHoverEvents() {
    bindMapHoverTargets(elements.countryLayer.querySelectorAll(".map-country-shape"), (node) => {
        const countryCode = normalizeCountryCode(node.getAttribute("data-country-code"));
        renderCountryHover(countryCode, mapDataCache.countriesByCode.get(countryCode) ?? null);
    });
    bindMapHoverTargets(elements.regionLayer.querySelectorAll(".map-region-shape"), (node) => {
        const countryCode = normalizeCountryCode(node.getAttribute("data-country-code"));
        const regionName = String(node.getAttribute("data-region-name") ?? "");
        const visualRegionKey = String(node.getAttribute("data-visual-region-key") ?? "");
        const regionData = visualRegionKey
            ? mapDataCache.visualRegionsByKey.get(visualRegionKey)?.displayData ?? null
            : null;
        renderRegionHover(
            countryCode,
            regionName,
            regionData,
            mapDataCache.countriesByCode.get(countryCode) ?? null,
        );
    });
}
function bindMapHoverTargets(nodes, enterHandler) {
    for (const node of nodes) {
        node.addEventListener("mouseenter", () => {
            node.classList.add("map-hover-target");
            enterHandler(node);
        });
        node.addEventListener("mouseleave", () => {
            node.classList.remove("map-hover-target");
            resetMapHoverDetails();
        });
    }
}
function renderCountryHover(countryCode, countryData) {
    if (!countryData) {
        elements.mapHoverTitle.textContent = `${countryCode} (no export row)`;
        elements.mapHoverBody.textContent = "No country-year row matched for this country boundary.";
        return;
    }
    elements.mapHoverTitle.textContent = `${countryData.country_name} (${countryData.country_code}) - ${countryData.yearKey}`;
    elements.mapHoverBody.textContent = describeCountrySummary(countryData);
}
function renderRegionHover(countryCode, regionName, regionData, countryData) {
    if (regionData) {
        const aggregateNote = regionData.is_visual_split && regionData.source_region_name
            ? ` Split from aggregate: ${regionData.source_region_name}.`
            : "";
        elements.mapHoverTitle.textContent =
            `${regionName} (${regionData.country_code}) - ${regionData.yearKey}`;
        elements.mapHoverBody.textContent =
            `Population ${formatInteger(regionData.end_population)}, GDP ${formatDecimal(regionData.end_gdp_billion_eur)} bn EUR, `
            + `growth ${formatPercent(regionData.gdp_growth_rate)}, unemployment ${formatPercent(regionData.unemployment_rate)}, `
            + `attractiveness ${formatDecimal(regionData.regional_attractiveness)}.${aggregateNote}`;
        return;
    }
    if (countryData) {
        elements.mapHoverTitle.textContent = `${regionName} (${countryCode})`;
        elements.mapHoverBody.textContent =
            "No direct BESP region mapping for this geoboundary. "
            + `Fallback country context: ${countryData.country_name}, ${countryData.yearKey}, ${describeCountrySummary(countryData, false)}`;
        return;
    }
    elements.mapHoverTitle.textContent = `${regionName} (${countryCode})`;
    elements.mapHoverBody.textContent = "No matching export row for region or country fallback.";
}
function resetMapHoverDetails() {
    if (activeMapMode === "country") {
        elements.mapHoverTitle.textContent = "Country hover active";
        elements.mapHoverBody.textContent =
            "Move over a country area to inspect the selected country-year values from the export.";
        return;
    }
    elements.mapHoverTitle.textContent = "Region hover active";
    elements.mapHoverBody.textContent =
        "Move over a region area to inspect region-year values when available; otherwise a country fallback is shown.";
}
function renderCountryTable(countryRows) {
    renderTable(
        elements.countryTableBody,
        countryRows,
        EMPTY_TABLE_ROWS.countryExport,
        (country) => `
            <tr>
                <td>${escapeHtml(country.yearKey)}</td>
                <td>${escapeHtml(countryFlag(country.country_code))} ${escapeHtml(country.country_name)} (${escapeHtml(country.country_code)})</td>
                <td>${formatInteger(country.end_population)}</td>
                <td>${formatDecimal(country.end_gdp_billion_eur)} bn EUR</td>
                <td>${formatPercent(country.gdp_growth_rate)}</td>
                <td>${formatInteger(Math.round(country.gdp_per_capita_eur))} EUR</td>
                <td>${formatPercent(country.average_unemployment_rate)}</td>
            </tr>
        `
    );
}
function flattenYearRows(exportData, collectionKey) {
    return Object.entries(exportData.years).flatMap(([yearKey, yearData]) =>
        (Array.isArray(yearData?.[collectionKey]) ? yearData[collectionKey] : [])
            .map((row) => ({ yearKey, ...row }))
    );
}
function renderStatePanels(countryRows) {
    if (!countryRows.length) {
        elements.stateCards.innerHTML = EMPTY_CARDS.stateYear;
        elements.stateTableBody.innerHTML = EMPTY_TABLE_ROWS.state;
        return;
    }
    const activeYearKey = getActiveYearKey();
    elements.stateCards.innerHTML = STATE_METRICS
        .map(([metricKey, label]) => buildStateCard(label, averageMetric(countryRows, metricKey), activeYearKey))
        .join("");
    renderTable(
        elements.stateTableBody,
        countryRows,
        EMPTY_TABLE_ROWS.state,
        (country) => `
            <tr>
                <td>${escapeHtml(country.yearKey)}</td>
                <td>${escapeHtml(country.country_name)} (${escapeHtml(country.country_code)})</td>
                ${STATE_METRICS.map(([metricKey]) => `<td>${formatStateRatio(country[metricKey])}</td>`).join("")}
            </tr>
        `
    );
}
function renderRegionTable(regionRows) {
    renderTable(
        elements.regionTableBody,
        regionRows,
        EMPTY_TABLE_ROWS.regionExport,
        (region) => `
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
        `
    );
}
function renderEmptyState() {
    stopPlayback();
    stopRunStatusPolling();
    elements.countryLayer.innerHTML = "";
    elements.countryLabelLayer.innerHTML = "";
    elements.regionLayer.innerHTML = "";
    elements.regionLabelLayer.innerHTML = "";
    elements.mapSummaryCards.innerHTML = EMPTY_CARDS.map;
    mapDataCache.countriesByCode = new Map();
    mapDataCache.regionsByKey = new Map();
    mapDataCache.visualRegionsByKey = new Map();
    Object.assign(dashboardState, {
        exportData: null,
        geoData: null,
        geoWarning: "",
        yearKeys: [],
        currentYearIndex: 0,
        countryRowCount: 0,
        regionRowCount: 0,
        isReloading: false,
        isGeneratingRun: false,
    });
    elements.yearSelect.innerHTML = "";
    elements.currentYearPill.textContent = "No year loaded";
    updatePlaybackControls();
    setMapMode("country");
    resetMapHoverDetails();
    elements.metaCards.innerHTML = EMPTY_CARDS.meta;
    elements.stateCards.innerHTML = EMPTY_CARDS.state;
    elements.stateTableBody.innerHTML = EMPTY_TABLE_ROWS.state;
    elements.countryTableBody.innerHTML = EMPTY_TABLE_ROWS.country;
    elements.regionTableBody.innerHTML = EMPTY_TABLE_ROWS.region;
    setExportStatus("Start the local run service, then use Generate Run or Reload Export.", "muted");
}
function setExportStatus(message, tone = "muted") {
    if (!elements.exportStatus) {
        return;
    }
    elements.exportStatus.textContent = message;
    elements.exportStatus.className = `export-status export-status-status-${tone}`;
}
function renderTable(targetElement, rows, emptyRowHtml, rowBuilder) {
    if (!rows.length) {
        targetElement.innerHTML = emptyRowHtml;
        return;
    }
    targetElement.innerHTML = rows.map(rowBuilder).join("");
}
function buildEmptyCard(label, note) {
    return `
        <article class="meta-card empty-card">
            <span class="meta-label">${escapeHtml(label)}</span>
            <strong class="meta-value">-</strong>
            <p class="meta-note">${note}</p>
        </article>
    `;
}
function buildEmptyTableRow(colspan, message) {
    return `<tr><td colspan="${colspan}" class="table-empty">${escapeHtml(message)}</td></tr>`;
}
function buildStateCard(label, value, activeYearKey) {
    const safeValue = value === null ? "-" : formatPercent(value);
    const note = activeYearKey ? `Selected year: ${escapeHtml(activeYearKey)}` : "No year selected";
    return `
        <article class="meta-card">
            <span class="meta-label">${escapeHtml(label)}</span>
            <strong class="meta-value">${safeValue}</strong>
            <p class="meta-note">${note}</p>
        </article>
    `;
}
function averageMetric(rows, metricKey) {
    let sum = 0;
    let count = 0;
    for (const row of rows) {
        const value = Number(row?.[metricKey]);
        if (!Number.isFinite(value)) {
            continue;
        }
        sum += value;
        count += 1;
    }
    return count > 0 ? sum / count : null;
}
function formatStateRatio(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? formatPercent(numeric) : "-";
}
function describeCountrySummary(countryData, includeUnemployment = true) {
    const base = `population ${formatInteger(countryData.end_population)}, GDP ${formatDecimal(countryData.end_gdp_billion_eur)} bn EUR, growth ${formatPercent(countryData.gdp_growth_rate)}`;
    return includeUnemployment
        ? `Population ${formatInteger(countryData.end_population)}, GDP ${formatDecimal(countryData.end_gdp_billion_eur)} bn EUR, growth ${formatPercent(countryData.gdp_growth_rate)}, unemployment ${formatPercent(countryData.average_unemployment_rate)}.`
        : `${base}.`;
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
    return compareByYearThen(left, right, (row) => normalizeCountryCode(row.country_code));
}
function compareYearCountryAndRegion(left, right) {
    return compareByYearThen(left, right, (row) => [
        normalizeCountryCode(row.country_code),
        normalizeRegionName(row.region_name),
    ].join("::"));
}
function compareByYearThen(left, right, keyBuilder) {
    const yearDiff = extractStartYear(left) - extractStartYear(right);
    if (yearDiff !== 0) {
        return yearDiff;
    }
    return keyBuilder(left).localeCompare(keyBuilder(right));
}
function compareYearKeys(left, right) {
    const leftYear = Number.parseInt(String(left).slice(0, 4), 10);
    const rightYear = Number.parseInt(String(right).slice(0, 4), 10);
    return leftYear - rightYear;
}
function buildRegionKey(countryCode, regionName) {
    return `${normalizeCountryCode(countryCode)}::${normalizeRegionName(regionName)}`;
}
function normalizeCountryCode(countryCode) {
    return String(countryCode ?? "").trim().toUpperCase();
}
function normalizeRegionName(regionName) {
    const compact = String(regionName ?? "")
        .normalize("NFKD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replaceAll("&", " and ")
        .replaceAll(/[^a-z0-9 ]+/g, " ")
        .replaceAll(/\s+/g, " ");
    return REGION_NAME_ALIASES[compact] ?? compact;
}
function resolveBespRegionKey(countryCode, featureRegionName) {
    const directKey = buildRegionKey(countryCode, featureRegionName);
    return REGION_FEATURE_TO_BESP[directKey] ?? (BESP_REGION_KEYS.has(directKey) ? directKey : null);
}
function resolveVisualRegion(countryCode, featureRegionName, bespRegionKey) {
    const featureKey = buildRegionKey(countryCode, featureRegionName);
    const visualRegionKey = FEATURE_TO_VISUAL_REGION[featureKey] ?? null;
    if (!visualRegionKey) {
        return null;
    }
    const definition = VISUAL_REGION_DEFINITIONS[visualRegionKey];
    return {
        visualRegionKey,
        label: definition?.label ?? featureRegionName,
        dataRegionKey: definition?.dataRegionKey ?? bespRegionKey,
        fill: definition?.fill ?? "rgba(126, 143, 161, 0.38)",
    };
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
function countryFlag(countryCode) {
    return COUNTRY_FLAGS[normalizeCountryCode(countryCode)] ?? "\uD83C\uDFF3\uFE0F";
}
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
