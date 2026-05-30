const EXPORT_PATH = "../output/latest.json";
const RUN_STATUS_PATH = "/api/run-status";
const RUN_SCENARIOS_PATH = "/api/scenarios";
const RUN_TRIGGER_PATH = "/api/run";
const RUN_SERVICE_OFFLINE_MESSAGE =
    "Simulation service offline. Open Advanced and start the local run service to generate new runs.";
const PLAYBACK_HELP_MESSAGE =
    "Play replays loaded years. Use Advanced if you want to generate and reload a fresh run.";
const MAP_VIEWBOX_WIDTH = 780;
const MAP_VIEWBOX_HEIGHT = 520;
const MAP_PADDING = 22;
const MAP_COUNTRY_CODES = ["ALB", "BGR", "BIH", "HUN", "MKD", "MNE", "SRB"];
const TARGET_COUNTRIES = new Set(MAP_COUNTRY_CODES);
const COUNTRY_LABEL_OFFSETS = {
    ALB: [-12, 10],
    BGR: [18, 4],
    HUN: [-6, -18],
    MKD: [22, 0],
    SRB: [0, -26],
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
const REGION_LABEL_SHORT = {
    "ALB::central-coast": "Central Coast",
    "ALB::north": "N Albania",
    "ALB::south": "S Albania",
    "BGR::black-sea": "Black Sea",
    "BGR::north": "N Bulgaria",
    "BGR::south": "S Bulgaria",
    "HUN::central": "Central HUN",
    "HUN::east": "East HUN",
    "HUN::west": "West HUN",
    "MKD::east": "East MKD",
    "MKD::south": "South MKD",
    "MKD::west": "West MKD",
    "MNE::stara-crna-gora": "Stara C. Gora",
    "MNE::stara-hercegovina": "St. Hercegovina",
    "MNE::stara-raska": "Stara Raska",
    "SRB::ji-srb": "JI SRB",
    "SRB::kosovo-metohija": "Kosovo i Met.",
    "SRB::sz-srb": "SZ SRB",
};
const COUNTRY_FLAGS = {
    ALB: "\uD83C\uDDE6\uD83C\uDDF1",
    BGR: "\uD83C\uDDE7\uD83C\uDDEC",
    BIH: "\uD83C\uDDE7\uD83C\uDDE6",
    HUN: "\uD83C\uDDED\uD83C\uDDFA",
    MKD: "\uD83C\uDDF2\uD83C\uDDF0",
    MNE: "\uD83C\uDDF2\uD83C\uDDEA",
    SRB: "\uD83C\uDDF7\uD83C\uDDF8",
};
const BASE_PLAYBACK_INTERVAL_MS = 1400;
const DEFAULT_FILL = "rgba(127, 150, 173, 0.50)";
const METRIC_VIEWS = {
    classic: {
        label: "Standard",
        colorLow: [0, 0, 0],
        colorHigh: [0, 0, 0],
    },
    population: {
        label: "Population",
        colorLow: [188, 210, 236],
        colorHigh: [34, 73, 122],
    },
    gdp_per_capita: {
        label: "GDP per cap.",
        colorLow: [233, 219, 176],
        colorHigh: [130, 93, 36],
    },
    unemployment: {
        label: "Unemployment",
        colorLow: [234, 198, 190],
        colorHigh: [138, 57, 47],
    },
    attractiveness: {
        label: "Attractiveness",
        colorLow: [175, 224, 207],
        colorHigh: [31, 112, 92],
    },
};
const GEOJSON_PATHS = {
    country: MAP_COUNTRY_CODES.map(
        (code) => `./data/geoBoundaries-${code}-ADM0_simplified.geojson`
    ),
    region: [
        ...MAP_COUNTRY_CODES.map(
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
    ["tirane", "tirana"], ["skopje", "skopje"], ["sofia city", "sofia"], ["sofia", "sofia"],
    ["budapest", "budapest"],
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
    "ALB::tirana": ["tiranã«", "tirane"],
    "ALB::northern albania": ["shkodã«r", "kukã«s", "lezhã«", "dibã«r"],
    "ALB::central coast albania": ["durrã«s", "elbasan", "fier", "berat"],
    "ALB::southern albania": ["vlorã«", "gjirokastã«r", "korã§ã«"],
    "MKD::skopje": ["skopje"],
    "MKD::western north macedonia": ["polog", "southwest"],
    "MKD::eastern north macedonia": ["east", "northeast", "southeast"],
    "MKD::southern north macedonia": ["pelagonia", "vardar"],
    "BGR::sofia": ["sofia city", "sofia"],
    "BGR::northern bulgaria": [
        "vidin", "vratsa", "montana", "pleven", "lovech", "veliko tarnovo",
        "gabrovo", "ruse", "razgrad", "silistra", "shumen", "targovishte",
    ],
    "BGR::southern bulgaria": [
        "blagoevgrad", "kyustendil", "pernik", "pazardzhik", "plovdiv",
        "smolyan", "kardzhali", "haskovo", "stara zagora", "sliven", "yambol",
    ],
    "BGR::black sea bulgaria": ["dobrich", "varna", "burgas"],
    "HUN::budapest": ["pest"],
    "HUN::western hungary": [
        "baranya", "fejã©r", "gyå‘r moson sopron", "komã¡rom esztergom",
        "somogy", "tolna", "vas", "veszprã©m", "zala",
    ],
    "HUN::central hungary": [
        "heves", "jã¡sz nagykun szolnok", "nã³grã¡d",
    ],
    "HUN::eastern hungary": [
        "bã¡cs kiskun", "bã©kã©s", "borsod abaãºj zemplã©n",
        "csongrã¡d csanã¡d", "hajdãº bihar", "szabolcs szatmã¡r bereg",
    ],
};
const VISUAL_REGION_DEFINITIONS = {
    "ALB::tirana": { label: "Tirana", dataRegionKey: "ALB::tirana", fill: "#8b7d6c" },
    "ALB::north": { label: "North Albania", dataRegionKey: "ALB::northern albania", fill: "#9c8d7b" },
    "ALB::central-coast": { label: "Central Coast", dataRegionKey: "ALB::central coast albania", fill: "#b39a77" },
    "ALB::south": { label: "South Albania", dataRegionKey: "ALB::southern albania", fill: "#8b6e63" },
    "BGR::sofia": { label: "Sofia", dataRegionKey: "BGR::sofia", fill: "#7f9961" },
    "BGR::north": { label: "North Bulgaria", dataRegionKey: "BGR::northern bulgaria", fill: "#94ae71" },
    "BGR::south": { label: "South Bulgaria", dataRegionKey: "BGR::southern bulgaria", fill: "#73945c" },
    "BGR::black-sea": { label: "Black Sea", dataRegionKey: "BGR::black sea bulgaria", fill: "#5e88a9" },
    "BIH::fbih": { label: "FBiH", dataRegionKey: "BIH::federation of bosnia and herzegovina", fill: "#8f776d" },
    "BIH::rs": { label: "RS", dataRegionKey: "BIH::republika srpska", fill: "#a4a08c" },
    "HUN::budapest": { label: "Budapest*", dataRegionKey: "HUN::budapest", fill: "#a76e60" },
    "HUN::west": { label: "West Hungary", dataRegionKey: "HUN::western hungary", fill: "#b58f71" },
    "HUN::central": { label: "Central Hungary", dataRegionKey: "HUN::central hungary", fill: "#9b856c" },
    "HUN::east": { label: "East Hungary", dataRegionKey: "HUN::eastern hungary", fill: "#c29c7b" },
    "MKD::skopje": { label: "Skopje", dataRegionKey: "MKD::skopje", fill: "#916b7c" },
    "MKD::west": { label: "West MKD", dataRegionKey: "MKD::western north macedonia", fill: "#a47c8e" },
    "MKD::east": { label: "East MKD", dataRegionKey: "MKD::eastern north macedonia", fill: "#7d5868" },
    "MKD::south": { label: "South MKD", dataRegionKey: "MKD::southern north macedonia", fill: "#b38f9d" },
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
    ...expandFeatureGroups({
        "ALB::tirana": REGION_GROUPS["ALB::tirana"],
        "ALB::north": REGION_GROUPS["ALB::northern albania"],
        "ALB::central-coast": REGION_GROUPS["ALB::central coast albania"],
        "ALB::south": REGION_GROUPS["ALB::southern albania"],
        "BGR::sofia": REGION_GROUPS["BGR::sofia"],
        "BGR::north": REGION_GROUPS["BGR::northern bulgaria"],
        "BGR::south": REGION_GROUPS["BGR::southern bulgaria"],
        "BGR::black-sea": REGION_GROUPS["BGR::black sea bulgaria"],
        "HUN::budapest": REGION_GROUPS["HUN::budapest"],
        "HUN::west": REGION_GROUPS["HUN::western hungary"],
        "HUN::central": REGION_GROUPS["HUN::central hungary"],
        "HUN::east": REGION_GROUPS["HUN::eastern hungary"],
        "MKD::skopje": REGION_GROUPS["MKD::skopje"],
        "MKD::west": REGION_GROUPS["MKD::western north macedonia"],
        "MKD::east": REGION_GROUPS["MKD::eastern north macedonia"],
        "MKD::south": REGION_GROUPS["MKD::southern north macedonia"],
    }),
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
    previousCountriesByCode: new Map(),
    regionsByKey: new Map(),
    previousRegionsByKey: new Map(),
    visualRegionsByKey: new Map(),
    previousVisualRegionsByKey: new Map(),
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
    activeMetric: "classic",
    currentCountryRows: [],
    currentRegionRows: [],
};
let activeMapMode = "country";
let activeHoverNode = null;
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
    metricButtons: Array.from(document.querySelectorAll(".metric-button")),
    mapHoverTitle: document.getElementById("map-hover-title"),
    mapHoverBody: document.getElementById("map-hover-body"),
    mapRoot: document.getElementById("country-map"),
    kpiCard: document.getElementById("kpi-card"),
    kpiGrid: document.getElementById("kpi-grid"),
    kpiScope: document.getElementById("kpi-scope"),
    kpiScopeNote: document.getElementById("kpi-scope-note"),
    kpiItems: Array.from(document.querySelectorAll(".kpi-item")),
    kpiLabelPopulation: document.getElementById("kpi-label-population"),
    kpiLabelGdp: document.getElementById("kpi-label-gdp"),
    kpiLabelUnemployment: document.getElementById("kpi-label-unemployment"),
    kpiLabelGrowth: document.getElementById("kpi-label-growth"),
    kpiPopulation: document.getElementById("kpi-population"),
    kpiGdp: document.getElementById("kpi-gdp"),
    kpiUnemployment: document.getElementById("kpi-unemployment"),
    kpiGrowth: document.getElementById("kpi-growth"),
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
    bindMapRootReset();
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
    for (const button of elements.metricButtons) {
        button.addEventListener("click", () => {
            const nextMetric = button.dataset.metric;
            if (nextMetric) {
                setActiveMetric(nextMetric);
            }
        });
    }
}
function bindMapRootReset() {
    elements.mapRoot.addEventListener("mouseleave", () => {
        if (activeHoverNode) {
            activeHoverNode.classList.remove("map-hover-target");
            activeHoverNode = null;
        }
        resetMapHoverDetails();
    });
}
function setActiveMetric(metricKey) {
    if (!METRIC_VIEWS[metricKey] || metricKey === dashboardState.activeMetric) {
        return;
    }
    dashboardState.activeMetric = metricKey;
    renderActiveYearState();
}
function setMapMode(mode) {
    activeMapMode = mode === "region" ? "region" : "country";
    const countryActive = activeMapMode === "country";
    elements.mapModeCountryButton.classList.toggle("map-mode-button-active", countryActive);
    elements.mapModeRegionButton.classList.toggle("map-mode-button-active", !countryActive);
    applyMapModeVisibility();
    renderPublicSidebar();
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
    for (const button of elements.metricButtons) {
        const metricKey = String(button.dataset.metric ?? "");
        button.classList.toggle("metric-button-active", metricKey === dashboardState.activeMetric);
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
        setExportStatus(RUN_SERVICE_OFFLINE_MESSAGE, "muted");
    } finally {
        updatePlaybackControls();
    }
}
function summarizeRunStatus(runStatus) {
    return { scenarioLabel: runStatus?.scenario_name || runStatus?.scenario_code || "simulation", shocksLabel: runStatus?.shocks_enabled ? "shocks on" : "shocks off" };
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
    const { scenarioLabel, shocksLabel } = summarizeRunStatus(runStatus);
    if (state === "running") {
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
        setExportStatus(`Latest ${scenarioLabel} run is ready (${shocksLabel}).`, "success");
        return;
    }
    setExportStatus(dashboardState.runServiceAvailable ? PLAYBACK_HELP_MESSAGE : RUN_SERVICE_OFFLINE_MESSAGE, "muted");
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
            setExportStatus("Lost connection to the local run service. Restart it, then try Generate Run again.", "error");
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
        isReload ? "Reloading latest simulation data ..." : "Loading latest simulation data ...",
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
                ? "Export reloaded. You can now browse years and map views."
                : "Export loaded. You can now browse years and map views.",
            "success"
        );
    } catch (error) {
        const detail = error instanceof Error ? ` (${error.message})` : "";
        setExportStatus(
            "Could not load latest simulation data. Open Advanced, generate/reload, then try again."
            + detail,
            "error"
        );
        renderLoadError(
            "Could not load latest simulation data. Start the local run service from repository root and refresh."
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
    ].map(([label, value]) => hasDisplayValue(value) ? buildMetaCard(label, value) : "").join("");
}
function renderActiveYearState() {
    if (!dashboardState.exportData) {
        return;
    }
    const activeYearKey = getActiveYearKey();
    const previousYearKey = dashboardState.yearKeys[dashboardState.currentYearIndex - 1] ?? "";
    const { countryRows, regionRows } = buildRowsForYear(dashboardState.exportData, activeYearKey);
    const previousRows = previousYearKey
        ? buildRowsForYear(dashboardState.exportData, previousYearKey)
        : { countryRows: [], regionRows: [] };
    dashboardState.currentCountryRows = countryRows;
    dashboardState.currentRegionRows = regionRows;
    mapDataCache.countriesByCode = new Map(countryRows.map((row) => [normalizeCountryCode(row.country_code), row]));
    mapDataCache.previousCountriesByCode = new Map(
        previousRows.countryRows.map((row) => [normalizeCountryCode(row.country_code), row])
    );
    mapDataCache.regionsByKey = new Map(regionRows.map((row) => [buildRegionKey(row.country_code, row.region_name), row]));
    mapDataCache.previousRegionsByKey = new Map(
        previousRows.regionRows.map((row) => [buildRegionKey(row.country_code, row.region_name), row])
    );
    renderMetaCards(
        dashboardState.exportData,
        dashboardState.countryRowCount,
        dashboardState.regionRowCount,
        activeYearKey,
        dashboardState.geoWarning
    );
    renderCountryLayer(dashboardState.geoData);
    renderRegionLayer(dashboardState.geoData);
    renderPublicSidebar();
    renderMapSummaryCards();
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
        elements.mapSummaryCards.innerHTML = buildEmptyCard("No country layer data", "Country GeoJSON could not be loaded.");
        return;
    }
    const availableCountryRows = [...mapDataCache.countriesByCode.values()];
    const countryMetricRange = calculateMetricRange(
        availableCountryRows,
        (row) => metricValueFromCountry(row, dashboardState.activeMetric)
    );
    const groupedByCountry = groupBy(geoData.countryFeatures, (feature) => feature.countryCode);
    const groupedVisualRegions = buildVisualRegionGroups(geoData.regionFeatures ?? []);
    const groupedCountries = [...groupedByCountry.entries()]
        .map(([countryCode, features]) => {
            const countryPath = features.map((feature) => feature.pathD).join(" ");
            const kosovoRegion = countryCode === "SRB"
                ? groupedVisualRegions.find((group) => group.visualRegionKey === "SRB::kosovo-metohija")
                : null;
            const mergedPathD = kosovoRegion ? `${countryPath} ${kosovoRegion.pathD}` : countryPath;
            const labelFeature = features.find((feature) => feature.rawCountryCode === countryCode) ?? features[0];
            const centroid = labelFeature?.centroid ?? averageCentroid(features);
            const displayName = labelFeature?.countryCode === "SRB"
                ? "Serbia"
                : (labelFeature?.name ?? countryCode);
            return {
                countryCode,
                displayName,
                mergedPathD,
                centroid,
                features,
                kosovoRegion,
            };
        })
        .sort((left, right) => left.countryCode.localeCompare(right.countryCode));
    elements.countryLayer.innerHTML = groupedCountries
        .map((country) => {
            const row = mapDataCache.countriesByCode.get(country.countryCode) ?? null;
            const fill = dashboardState.activeMetric === "classic"
                ? baseCountryFill(country.countryCode)
                : mapMetricFill(
                    metricValueFromCountry(row, dashboardState.activeMetric),
                    countryMetricRange,
                    dashboardState.activeMetric
                );
            const kosovoSeamFix = country.kosovoRegion;
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
    const labelCandidates = groupedCountries.map((country) => {
            const [offsetX, offsetY] = COUNTRY_LABEL_OFFSETS[country.countryCode] ?? [0, 0];
            const row = mapDataCache.countriesByCode.get(country.countryCode) ?? null;
            const previousRow = mapDataCache.previousCountriesByCode.get(country.countryCode) ?? null;
            const metricDetail = buildMapMetricDetail(
                row ? metricValueFromCountry(row, dashboardState.activeMetric) : Number.NaN,
                previousRow ? metricValueFromCountry(previousRow, dashboardState.activeMetric) : Number.NaN,
                dashboardState.activeMetric,
                "country"
            );
            const x = country.centroid[0] + offsetX;
            const y = country.centroid[1] + offsetY;
            const detailText = metricDetail?.text ?? "";
            const box = estimateLabelBounds({
                x,
                y,
                labelText: country.countryCode,
                detailText,
                labelFontPx: 15,
                detailFontPx: 11,
                showDetail: Boolean(metricDetail),
            });
            return {
                key: country.countryCode,
                priority: country.features.length * 1000 + (metricDetail ? 50 : 0),
                box,
                html: `
            <text class="map-country-label" x="${(country.centroid[0] + offsetX).toFixed(1)}" y="${(country.centroid[1] + offsetY).toFixed(1)}">
                ${escapeHtml(country.countryCode)}
            </text>
            ${metricDetail ? `
            <text class="map-country-label-detail map-label-detail-${metricDetail.tone}" x="${(country.centroid[0] + offsetX).toFixed(1)}" y="${(country.centroid[1] + offsetY + 18).toFixed(1)}">
                ${escapeHtml(metricDetail.text)}
            </text>
            ` : ""}
        `,
            };
        });
    elements.countryLabelLayer.innerHTML = selectNonOverlappingLabels(labelCandidates, 4)
        .map((entry) => entry.html)
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
    const groupedRegions = buildVisualRegionGroups(geoData.regionFeatures, mapDataCache.regionsByKey);
    const previousGroupedRegions = buildVisualRegionGroups(
        geoData.regionFeatures,
        mapDataCache.previousRegionsByKey
    );
    const regionMetricRange = calculateMetricRange(
        groupedRegions.map((group) => group.displayData).filter(Boolean),
        (row) => metricValueFromRegion(row, dashboardState.activeMetric)
    );
    mapDataCache.visualRegionsByKey = new Map(groupedRegions.map((group) => [group.visualRegionKey, group]));
    mapDataCache.previousVisualRegionsByKey = new Map(
        previousGroupedRegions
            .filter((group) => group.displayData)
            .map((group) => [group.visualRegionKey, group.displayData])
    );
    elements.regionLayer.innerHTML = groupedRegions
        .map((group) => `
            <path
                class="map-region-shape"
                data-country-code="${escapeHtml(group.countryCode)}"
                data-region-name="${escapeHtml(group.label)}"
                data-visual-region-key="${escapeHtml(group.visualRegionKey)}"
                data-data-region-key="${escapeHtml(group.dataRegionKey ?? "")}"
                d="${escapeHtml(group.pathD)}"
                fill="${escapeHtml(dashboardState.activeMetric === "classic"
                    ? group.fill
                    : mapMetricFill(
                        metricValueFromRegion(group.displayData, dashboardState.activeMetric),
                        regionMetricRange,
                        dashboardState.activeMetric,
                        group.fill
                    ))}"
            ></path>
        `)
        .join("");
    const labelCandidates = groupedRegions.map((group) => {
        const [offsetX, offsetY] = VISUAL_REGION_LABEL_OFFSETS[group.visualRegionKey] ?? [0, 0];
        const previousRegion = mapDataCache.previousVisualRegionsByKey.get(group.visualRegionKey) ?? null;
        const metricDetailRaw = buildMapMetricDetail(
            metricValueFromRegion(group.displayData, dashboardState.activeMetric),
            previousRegion ? metricValueFromRegion(previousRegion, dashboardState.activeMetric) : Number.NaN,
            dashboardState.activeMetric,
            "region"
        );
        const view = chooseRegionLabelView(group);
        const labelText = view.abbreviate ? abbreviateRegionLabel(group) : group.label;
        const metricDetail = view.showDetail ? metricDetailRaw : null;
        const x = group.centroid[0] + offsetX;
        const y = group.centroid[1] + offsetY;
        const box = estimateLabelBounds({
            x,
            y,
            labelText,
            detailText: metricDetail?.text ?? "",
            labelFontPx: view.labelFontPx,
            detailFontPx: view.detailFontPx,
            showDetail: Boolean(metricDetail),
        });
        const labelClass = view.compact ? "map-region-label map-region-label-compact" : "map-region-label";
        const detailClass = view.compact
            ? "map-region-label-detail map-region-label-detail-compact"
            : "map-region-label-detail";
        return {
            key: group.visualRegionKey,
            priority: computeRegionLabelPriority(group, view),
            box,
            html: `
            <g data-visual-region-key="${escapeHtml(group.visualRegionKey)}">
                <text class="${labelClass}" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${escapeHtml(labelText)}</text>
                ${metricDetail ? `<text class="${detailClass} map-label-detail-${metricDetail.tone}" x="${x.toFixed(1)}" y="${(y + 14).toFixed(1)}">${escapeHtml(metricDetail.text)}</text>` : ""}
            </g>
        `,
        };
    });
    elements.regionLabelLayer.innerHTML = selectNonOverlappingLabels(labelCandidates, 2)
        .map((entry) => entry.html)
        .join("");
}
function chooseRegionLabelView(group) {
    const isMetric = !isClassicMetricView();
    const area = Number(group.projectedArea ?? 0);
    const share = Number(group.areaShare ?? 0);
    const tiny = area < 900;
    const compact = area < 1500 || share < 0.22;
    return {
        abbreviate: compact || area < 2200,
        showDetail: isMetric && !tiny,
        compact,
        labelFontPx: compact ? 10.5 : 12,
        detailFontPx: compact ? 8.4 : 9.5,
    };
}
function abbreviateRegionLabel(group) {
    return REGION_LABEL_SHORT[group.visualRegionKey] ?? group.label;
}
function computeRegionLabelPriority(group, view) {
    const area = Number(group.projectedArea ?? 0);
    const share = Number(group.areaShare ?? 0);
    return area + (view.showDetail ? 800 : 0) + share * 500;
}
function estimateLabelBounds({
    x,
    y,
    labelText,
    detailText,
    labelFontPx,
    detailFontPx,
    showDetail,
}) {
    const labelWidth = Math.max(18, labelText.length * labelFontPx * 0.56);
    const detailWidth = showDetail ? Math.max(10, detailText.length * detailFontPx * 0.54) : 0;
    const width = Math.max(labelWidth, detailWidth) + 8;
    const height = showDetail ? (labelFontPx + detailFontPx + 7) : (labelFontPx + 3);
    const top = y - labelFontPx;
    return {
        left: x - width / 2,
        right: x + width / 2,
        top,
        bottom: top + height,
    };
}
function selectNonOverlappingLabels(candidates, padding = 2) {
    const sorted = [...candidates].sort((a, b) => b.priority - a.priority);
    const accepted = [];
    for (const candidate of sorted) {
        if (!accepted.some((entry) => boxesOverlap(entry.box, candidate.box, padding))) {
            accepted.push(candidate);
        }
    }
    return accepted;
}
function boxesOverlap(left, right, padding = 0) {
    return !(
        left.right + padding < right.left
        || right.right + padding < left.left
        || left.bottom + padding < right.top
        || right.bottom + padding < left.top
    );
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
function buildVisualRegionGroups(regionFeatures, regionSourceMap = mapDataCache.regionsByKey) {
    const groups = groupBy(
        regionFeatures.filter((feature) => feature.visualRegionKey),
        (feature) => feature.visualRegionKey
    );
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
            displayData: buildVisualRegionDisplayData(group, areaShare, regionSourceMap),
        };
    });
}
function buildVisualRegionDisplayData(group, areaShare, regionSourceMap) {
    const source = group.dataRegionKey ? regionSourceMap.get(group.dataRegionKey) : null;
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
            setActiveHoverNode(node);
            enterHandler(node);
        });
    }
}
function setActiveHoverNode(node) {
    if (activeHoverNode && activeHoverNode !== node) {
        activeHoverNode.classList.remove("map-hover-target");
    }
    activeHoverNode = node;
    activeHoverNode.classList.add("map-hover-target");
}
function renderCountryHover(countryCode, countryData) {
    if (!countryData) {
        setMapHoverDetails(
            `${countryCode} (no export row)`,
            "No country-year row matched for this country boundary."
        );
        return;
    }
    if (!isClassicMetricView()) {
        setMapHoverDetails(
            `${countryData.country_name} (${countryData.country_code}) - ${countryData.yearKey}`,
            describeMetricFocus(
                dashboardState.activeMetric,
                metricValueFromCountry(countryData, dashboardState.activeMetric)
            )
        );
        return;
    }
    setMapHoverDetails(
        `${countryData.country_name} (${countryData.country_code}) - ${countryData.yearKey}`,
        describeCountrySummary(countryData)
    );
}
function renderRegionHover(countryCode, regionName, regionData, countryData) {
    if (regionData) {
        if (!isClassicMetricView()) {
            setMapHoverDetails(
                `${regionName} (${regionData.country_code}) - ${regionData.yearKey}`,
                describeMetricFocus(
                    dashboardState.activeMetric,
                    metricValueFromRegion(regionData, dashboardState.activeMetric)
                )
            );
            return;
        }
        const aggregateNote = regionData.is_visual_split && regionData.source_region_name
            ? ` Split from aggregate: ${regionData.source_region_name}.`
            : "";
        setMapHoverDetails(
            `${regionName} (${regionData.country_code}) - ${regionData.yearKey}`,
            `Population ${formatInteger(regionData.end_population)}, GDP ${formatDecimal(regionData.end_gdp_billion_eur)} bn EUR, `
            + `growth ${formatPercent(regionData.gdp_growth_rate)}, unemployment ${formatPercent(regionData.unemployment_rate)}, `
            + `attractiveness ${formatDecimal(regionData.regional_attractiveness)}.${aggregateNote}`
        );
        return;
    }
    if (countryData) {
        if (!isClassicMetricView()) {
            setMapHoverDetails(
                `${regionName} (${countryCode})`,
                describeMetricFocus(
                    dashboardState.activeMetric,
                    metricValueFromCountry(countryData, dashboardState.activeMetric)
                )
            );
            return;
        }
        setMapHoverDetails(
            `${regionName} (${countryCode})`,
            "No direct BESP region mapping for this geoboundary. "
            + `Fallback country context: ${countryData.country_name}, ${countryData.yearKey}, ${describeCountrySummary(countryData, false)}`
        );
        return;
    }
    setMapHoverDetails(`${regionName} (${countryCode})`, "No matching export row for region or country fallback.");
}
function resetMapHoverDetails() {
    if (!isClassicMetricView()) {
        setMapHoverDetails(
            `${METRIC_VIEWS[dashboardState.activeMetric]?.label ?? "Metric"} overlay active`,
            "Move over a map area to inspect the selected metric for the active year."
        );
        return;
    }
    if (activeMapMode === "country") {
        setMapHoverDetails(
            "Country hover active",
            "Move over a country area to inspect the selected country-year values from the export."
        );
        return;
    }
    setMapHoverDetails(
        "Region hover active",
        "Move over a region area to inspect region-year values when available; otherwise a country fallback is shown."
    );
}
function renderCountryTable(countryRows) {
    renderTable(
        elements.countryTableBody,
        countryRows,
        EMPTY_TABLE_ROWS.countryExport,
        (country) => buildTableRow([
            escapeHtml(country.yearKey), `${escapeHtml(countryFlag(country.country_code))} ${escapeHtml(country.country_name)} (${escapeHtml(country.country_code)})`,
            formatInteger(country.end_population), `${formatDecimal(country.end_gdp_billion_eur)} bn EUR`,
            formatPercent(country.gdp_growth_rate), `${formatInteger(Math.round(country.gdp_per_capita_eur))} EUR`,
            formatPercent(country.average_unemployment_rate),
        ])
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
        (country) => buildTableRow([escapeHtml(country.yearKey), `${escapeHtml(country.country_name)} (${escapeHtml(country.country_code)})`, ...STATE_METRICS.map(([metricKey]) => formatStateRatio(country[metricKey]))])
    );
}
function renderRegionTable(regionRows) {
    renderTable(
        elements.regionTableBody,
        regionRows,
        EMPTY_TABLE_ROWS.regionExport,
        (region) => buildTableRow([
            escapeHtml(region.yearKey), escapeHtml(region.country_code), escapeHtml(region.region_name),
            formatInteger(region.end_population), `${formatDecimal(region.end_gdp_billion_eur)} bn EUR`,
            formatPercent(region.gdp_growth_rate), formatPercent(region.unemployment_rate),
            formatDecimal(region.regional_attractiveness),
        ])
    );
}
function renderPublicSidebar() {
    const countryRows = dashboardState.currentCountryRows ?? [];
    const regionRows = [...mapDataCache.visualRegionsByKey.values()]
        .map((group) => group.displayData)
        .filter(Boolean);
    const useRegionScope = activeMapMode === "region";
    const sourceRows = useRegionScope ? regionRows : countryRows;
    const scopeLabel = useRegionScope ? "Regions" : "Countries";
    const isClassic = isClassicMetricView();
    elements.kpiGrid.classList.toggle("kpi-grid-metric", !isClassic);
    for (const item of elements.kpiItems) {
        const itemMetric = item.dataset.kpi ?? "";
        item.classList.toggle("kpi-item-active", !isClassic && itemMetric === dashboardState.activeMetric);
    }
    elements.kpiScope.textContent = isClassic
        ? scopeLabel
        : `${scopeLabel} | ${METRIC_VIEWS[dashboardState.activeMetric]?.label ?? "Metric"}`;
    elements.kpiScopeNote.textContent = isClassic
        ? "Standard view keeps the mixed summary visible for the selected year."
        : "Overlay mode focuses on one category at a time with a calm year-to-year trend.";
    if (!sourceRows.length) {
        elements.kpiLabelPopulation.textContent = "\u{1F465} Population";
        elements.kpiLabelGdp.textContent = "\u{1F4B6} GDP";
        elements.kpiLabelUnemployment.textContent = "\u{1F4BC} Unemployment";
        elements.kpiLabelGrowth.textContent = "\u{1F4C8} Growth";
        elements.kpiPopulation.textContent = "-";
        elements.kpiGdp.textContent = "-";
        elements.kpiUnemployment.textContent = "-";
        elements.kpiGrowth.textContent = "-";
        return;
    }
    if (!isClassic) {
        const metricKey = dashboardState.activeMetric;
        const currentAggregate = aggregateMetricForScope(sourceRows, metricKey);
        elements.kpiLabelPopulation.textContent = "\u{1F465} Population";
        elements.kpiLabelGdp.textContent = "\u{1F4B6} GDP per cap.";
        elements.kpiLabelUnemployment.textContent = "\u{1F4BC} Unemployment";
        elements.kpiLabelGrowth.textContent = "\u{1F4C8} Attractiveness";
        elements.kpiPopulation.textContent = metricKey === "population" ? formatMetricDisplay(currentAggregate, metricKey) : "-";
        elements.kpiGdp.textContent = metricKey === "gdp_per_capita" ? formatMetricDisplay(currentAggregate, metricKey) : "-";
        elements.kpiUnemployment.textContent = metricKey === "unemployment" ? formatMetricDisplay(currentAggregate, metricKey) : "-";
        elements.kpiGrowth.textContent = metricKey === "attractiveness"
            ? formatMetricDisplay(currentAggregate, metricKey)
            : "-";
        return;
    }
    elements.kpiLabelPopulation.textContent = "\u{1F465} Population";
    elements.kpiLabelGdp.textContent = "\u{1F4B6} GDP";
    elements.kpiLabelUnemployment.textContent = "\u{1F4BC} Unemployment";
    elements.kpiLabelGrowth.textContent = "\u{1F4C8} Growth";
    elements.kpiPopulation.textContent = formatInteger(sumMetric(sourceRows, "end_population"));
    elements.kpiGdp.textContent = `${formatDecimal(sumMetric(sourceRows, "end_gdp_billion_eur"))} bn`;
    elements.kpiUnemployment.textContent = formatMetricDisplay(
        averageMetric(sourceRows, useRegionScope ? "unemployment_rate" : "average_unemployment_rate"),
        "unemployment"
    );
    elements.kpiGrowth.textContent = formatMetricDisplay(
        averageMetric(sourceRows, "gdp_growth_rate"),
        "attractiveness"
    );
}
function renderMapSummaryCards() {
    const isClassic = isClassicMetricView();
    if (activeMapMode === "country") {
        const cards = [...mapDataCache.countriesByCode.values()]
            .sort((left, right) => normalizeCountryCode(left.country_code).localeCompare(normalizeCountryCode(right.country_code)))
            .map((countryRow) => {
                const countryCode = normalizeCountryCode(countryRow.country_code);
                const previousCountryRow = mapDataCache.previousCountriesByCode.get(countryCode) ?? null;
                return isClassic
                    ? buildClassicSummaryCard(
                        `${countryFlag(countryCode)} ${countryRow.country_name} (${countryCode})`,
                        [
                            `Population ${formatInteger(countryRow.end_population)}`,
                            `GDP ${formatDecimal(countryRow.end_gdp_billion_eur)} bn EUR`,
                            `Unemployment ${formatPercent(countryRow.average_unemployment_rate)}`,
                        ],
                        countryRow.yearKey
                    )
                    : buildMetricSummaryCard(
                        `${countryFlag(countryCode)} ${countryRow.country_name} (${countryCode})`,
                        dashboardState.activeMetric,
                        metricValueFromCountry(countryRow, dashboardState.activeMetric),
                        previousCountryRow ? metricValueFromCountry(previousCountryRow, dashboardState.activeMetric) : Number.NaN,
                        countryRow.yearKey
                    );
            });
        elements.mapSummaryCards.innerHTML = cards.length
            ? cards.join("")
            : buildEmptyCard("No country layer data", "Load export data to render the country map layer.");
        return;
    }
    const cards = [...mapDataCache.visualRegionsByKey.values()]
        .sort((left, right) => {
            const countryDiff = left.countryCode.localeCompare(right.countryCode);
            return countryDiff !== 0 ? countryDiff : left.label.localeCompare(right.label);
        })
        .map((group) => {
            const currentRegion = group.displayData;
            const previousRegion = mapDataCache.previousVisualRegionsByKey.get(group.visualRegionKey) ?? null;
            return isClassic
                ? buildClassicSummaryCard(
                    `${group.label} (${group.countryCode})`,
                    currentRegion ? [
                        `Population ${formatInteger(currentRegion.end_population)}`,
                        `GDP ${formatDecimal(currentRegion.end_gdp_billion_eur)} bn EUR`,
                        `Unemployment ${formatPercent(currentRegion.unemployment_rate)}`,
                    ] : ["No mapped BESP data"],
                    currentRegion?.yearKey ?? getActiveYearKey()
                )
                : buildMetricSummaryCard(
                    `${group.label} (${group.countryCode})`,
                    dashboardState.activeMetric,
                    metricValueFromRegion(currentRegion, dashboardState.activeMetric),
                    previousRegion ? metricValueFromRegion(previousRegion, dashboardState.activeMetric) : Number.NaN,
                    currentRegion?.yearKey ?? getActiveYearKey()
                );
        });
    elements.mapSummaryCards.innerHTML = cards.length
        ? cards.join("")
        : buildEmptyCard("No region layer data", "Load export data to render the region map layer.");
}
function renderEmptyState() {
    stopPlayback();
    stopRunStatusPolling();
    clearMapLayers();
    elements.mapSummaryCards.innerHTML = EMPTY_CARDS.map;
    resetMapCaches();
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
        currentCountryRows: [],
        currentRegionRows: [],
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
    renderPublicSidebar();
    setExportStatus("Use Play to browse years. Open Advanced to generate or reload runs.", "muted");
}
function setExportStatus(message, tone = "muted") {
    if (!elements.exportStatus) {
        return;
    }
    elements.exportStatus.textContent = message;
    elements.exportStatus.className = `export-status export-status-status-${tone}`;
}
function setMapHoverDetails(title, body) {
    elements.mapHoverTitle.textContent = title;
    elements.mapHoverBody.textContent = body;
}
function renderTable(targetElement, rows, emptyRowHtml, rowBuilder) {
    if (!rows.length) {
        targetElement.innerHTML = emptyRowHtml;
        return;
    }
    targetElement.innerHTML = rows.map(rowBuilder).join("");
}
function buildTableRow(cells) {
    return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
}
function clearMapLayers() {
    for (const layer of [elements.countryLayer, elements.countryLabelLayer, elements.regionLayer, elements.regionLabelLayer]) {
        layer.innerHTML = "";
    }
}
function resetMapCaches() {
    mapDataCache.countriesByCode = new Map();
    mapDataCache.previousCountriesByCode = new Map();
    mapDataCache.regionsByKey = new Map();
    mapDataCache.previousRegionsByKey = new Map();
    mapDataCache.visualRegionsByKey = new Map();
    mapDataCache.previousVisualRegionsByKey = new Map();
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
function sumMetric(rows, metricKey) {
    let sum = 0;
    for (const row of rows) {
        const value = Number(row?.[metricKey]);
        if (Number.isFinite(value)) {
            sum += value;
        }
    }
    return sum;
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
function describeMetricFocus(metricKey, currentValue) {
    const metricLabel = METRIC_VIEWS[metricKey]?.label ?? "Metric";
    return `${metricLabel} ${formatMetricDisplay(currentValue, metricKey)}.`;
}
function buildMetaCard(label, value) {
    return `
        <article class="meta-card">
            <span class="meta-label">${escapeHtml(label)}</span>
            <strong class="meta-value">${escapeHtml(String(value))}</strong>
        </article>
    `;
}
function buildClassicSummaryCard(title, lines, yearKey) {
    return `
        <article class="meta-card metric-summary-card">
            <span class="meta-label">${title}</span>
            <strong class="meta-value">${escapeHtml(yearKey || "No year")}</strong>
            <p class="metric-summary-subtitle">${escapeHtml(lines.join(" | "))}</p>
        </article>
    `;
}
function buildMetricSummaryCard(title, metricKey, currentValue, previousValue, yearKey) {
    const trend = metricTrend(metricKey, currentValue, previousValue);
    return `
        <article class="meta-card metric-summary-card">
            <span class="meta-label">${title}</span>
            <p class="metric-summary-trendline metric-trend metric-trend-${trend.tone}">
                <span class="metric-trend-arrow">${trend.arrow}</span>
                <span>${escapeHtml(trend.label)}</span>
            </p>
            <strong class="metric-summary-value">${escapeHtml(formatMetricDisplay(currentValue, metricKey))}</strong>
            <p class="metric-summary-subtitle">${escapeHtml(yearKey || "No year")} | ${escapeHtml(METRIC_VIEWS[metricKey]?.label ?? "Metric")}</p>
        </article>
    `;
}
function aggregateMetricForScope(rows, metricKey) {
    if (!rows.length) {
        return Number.NaN;
    }
    if (metricKey === "population") {
        return sumMetric(rows, "end_population");
    }
    const values = rows
        .map((row) => metricRowValue(row, metricKey))
        .filter((value) => Number.isFinite(value));
    if (!values.length) {
        return Number.NaN;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function metricRowValue(row, metricKey) {
    if (!row) {
        return Number.NaN;
    }
    if (Object.hasOwn(row, "average_unemployment_rate")) {
        return metricValueFromCountry(row, metricKey);
    }
    return metricValueFromRegion(row, metricKey);
}
function metricTrend(metricKey, currentValue, previousValue) {
    const current = Number(currentValue);
    const previous = Number(previousValue);
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
        return {
            tone: "neutral",
            arrow: "→",
            label: "no prior year",
            summary: "No prior year comparison is available yet.",
        };
    }
    const delta = current - previous;
    const magnitude = metricTrendMagnitude(metricKey, current, previous, delta);
    const isPositiveDirection = metricKey === "unemployment" ? delta < 0 : delta > 0;
    if (magnitude === "neutral") {
        return {
            tone: "neutral",
            arrow: "→",
            label: "steady",
            summary: "Change versus the previous year stays fairly neutral.",
        };
    }
    return isPositiveDirection
        ? {
            tone: "positive",
            arrow: "↗",
            label: "upbeat",
            summary: "Direction versus the previous year is clearly positive.",
        }
        : {
            tone: "negative",
            arrow: "↘",
            label: "weaker",
            summary: "Direction versus the previous year is clearly negative.",
        };
}
function buildMapMetricDetail(currentValue, previousValue, metricKey, labelScale) {
    if (isClassicMetricView()) {
        return null;
    }
    const trend = metricTrend(metricKey, currentValue, previousValue);
    const deltaText = formatMetricDelta(currentValue, previousValue, metricKey, labelScale);
    return {
        tone: trend.tone,
        text: deltaText ? `${trend.arrow} ${deltaText}` : `${trend.arrow} ${trend.label}`,
    };
}
function formatMetricDelta(currentValue, previousValue, metricKey, labelScale) {
    const current = Number(currentValue);
    const previous = Number(previousValue);
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
        return "no prev";
    }
    const delta = current - previous;
    if (metricKey === "population") {
        return `${delta >= 0 ? "+" : ""}${formatInteger(Math.round(delta))}`;
    }
    if (metricKey === "gdp_per_capita") {
        return `${delta >= 0 ? "+" : ""}${formatInteger(Math.round(delta))} EUR`;
    }
    if (metricKey === "unemployment") {
        return `${delta >= 0 ? "+" : ""}${formatPercent(delta)}`;
    }
    const precision = labelScale === "country" ? 3 : 2;
    return `${delta >= 0 ? "+" : ""}${Number(delta).toFixed(precision)}`;
}
function metricTrendMagnitude(metricKey, current, previous, delta) {
    if (metricKey === "population") {
        const ratio = previous !== 0 ? delta / previous : 0;
        return Math.abs(ratio) >= 0.01 ? "strong" : Math.abs(ratio) >= 0.003 ? "soft" : "neutral";
    }
    if (metricKey === "gdp_per_capita") {
        const ratio = previous !== 0 ? delta / previous : 0;
        return Math.abs(ratio) >= 0.02 ? "strong" : Math.abs(ratio) >= 0.008 ? "soft" : "neutral";
    }
    if (metricKey === "attractiveness") {
        return Math.abs(delta) >= 0.015 ? "strong" : Math.abs(delta) >= 0.006 ? "soft" : "neutral";
    }
    return Math.abs(delta) >= 0.01 ? "strong" : Math.abs(delta) >= 0.004 ? "soft" : "neutral";
}
function buildVisualRegionKey(countryCode, regionName) {
    return `${normalizeCountryCode(countryCode)}::${normalizeRegionName(regionName)}`;
}
function isClassicMetricView() {
    return dashboardState.activeMetric === "classic";
}
function buildCountrySummaryCard(country, row) {
    const label = `<span class="flag-chip">${escapeHtml(countryFlag(country.countryCode))}</span>${escapeHtml(country.displayName)} (${escapeHtml(country.countryCode)})`;
    const metricLabel = METRIC_VIEWS[dashboardState.activeMetric]?.label ?? "Metric";
    const metricValue = row ? formatMetricDisplay(metricValueFromCountry(row, dashboardState.activeMetric), dashboardState.activeMetric) : "No data";
    const note = row ? `${escapeHtml(row.yearKey)} | ${escapeHtml(metricLabel)}` : "No matching country export row.";
    return `
        <article class="meta-card">
            <span class="meta-label">${label}</span>
            <strong class="meta-value">${metricValue}</strong>
            <p class="meta-note">${note}</p>
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
function groupBy(items, keyBuilder) {
    const groups = new Map();
    for (const item of items) {
        const key = keyBuilder(item);
        const list = groups.get(key);
        if (list) {
            list.push(item);
        } else {
            groups.set(key, [item]);
        }
    }
    return groups;
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
function metricValueFromCountry(countryData, metricKey) {
    if (!countryData) {
        return Number.NaN;
    }
    switch (metricKey) {
        case "population":
            return Number(countryData.end_population);
        case "gdp_per_capita":
            return Number(countryData.gdp_per_capita_eur);
        case "unemployment":
            return Number(countryData.average_unemployment_rate);
        case "attractiveness":
            return Number(countryData.average_regional_attractiveness);
        default:
            return Number.NaN;
    }
}
function metricValueFromRegion(regionData, metricKey) {
    if (!regionData) {
        return Number.NaN;
    }
    switch (metricKey) {
        case "population":
            return Number(regionData.end_population);
        case "gdp_per_capita":
            return Number(regionData.gdp_per_capita_eur);
        case "unemployment":
            return Number(regionData.unemployment_rate);
        case "attractiveness":
            return Number(regionData.regional_attractiveness);
        default:
            return Number.NaN;
    }
}
function calculateMetricRange(rows, valueResolver) {
    const values = rows
        .map((row) => Number(valueResolver(row)))
        .filter((value) => Number.isFinite(value));
    if (!values.length) {
        return { min: 0, max: 1 };
    }
    return {
        min: Math.min(...values),
        max: Math.max(...values),
    };
}
function mapMetricFill(value, metricRange, metricKey, fallback = DEFAULT_FILL) {
    if (!Number.isFinite(value) || !METRIC_VIEWS[metricKey]) {
        return fallback;
    }
    const min = Number(metricRange?.min ?? 0);
    const max = Number(metricRange?.max ?? 1);
    const span = max - min;
    const ratio = span > 0 ? clamp((value - min) / span, 0, 1) : 0.5;
    const metricStyle = METRIC_VIEWS[metricKey];
    const red = Math.round(metricStyle.colorLow[0] + (metricStyle.colorHigh[0] - metricStyle.colorLow[0]) * ratio);
    const green = Math.round(metricStyle.colorLow[1] + (metricStyle.colorHigh[1] - metricStyle.colorLow[1]) * ratio);
    const blue = Math.round(metricStyle.colorLow[2] + (metricStyle.colorHigh[2] - metricStyle.colorLow[2]) * ratio);
    return `rgba(${red}, ${green}, ${blue}, 0.90)`;
}
function baseCountryFill(countryCode) {
    const palette = {
        ALB: "rgba(139, 121, 106, 0.90)",
        BGR: "rgba(137, 161, 104, 0.90)",
        BIH: "rgba(83, 122, 158, 0.90)",
        HUN: "rgba(158, 127, 105, 0.90)",
        MKD: "rgba(150, 111, 124, 0.90)",
        MNE: "rgba(115, 149, 176, 0.90)",
        SRB: "rgba(184, 195, 173, 0.90)",
    };
    return palette[normalizeCountryCode(countryCode)] ?? DEFAULT_FILL;
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
function formatMetricDisplay(value, metricKey) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return "-";
    }
    if (metricKey === "population") {
        return formatInteger(Math.round(numeric));
    }
    if (metricKey === "gdp_per_capita") {
        return `${formatInteger(Math.round(numeric))} EUR`;
    }
    return formatPercent(numeric);
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
const hasDisplayValue = (value) => value !== undefined && value !== null && value !== "";
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
