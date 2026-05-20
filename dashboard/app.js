const EXPORT_PATH = "../output/latest.json";
const MAP_VIEWBOX_WIDTH = 780;
const MAP_VIEWBOX_HEIGHT = 520;
const MAP_PADDING = 22;
const TARGET_COUNTRIES = new Set(["BIH", "MNE", "SRB"]);
const COUNTRY_LABEL_OFFSETS = {
    SRB: [0, -26],
    BIH: [0, 0],
    MNE: [0, 0],
};
const COUNTRY_GEOJSON_PATHS = [
    "./data/geoBoundaries-BIH-ADM0_simplified.geojson",
    "./data/geoBoundaries-MNE-ADM0_simplified.geojson",
    "./data/geoBoundaries-SRB-ADM0_simplified.geojson",
    "./data/geoBoundaries-XKX-ADM0_simplified.geojson",
];
const REGION_GEOJSON_PATHS = [
    "./data/geoBoundaries-BIH-ADM1_simplified.geojson",
    "./data/geoBoundaries-MNE-ADM1_simplified.geojson",
    "./data/geoBoundaries-SRB-ADM1_simplified.geojson",
    "./data/geoBoundaries-XKX-ADM0_simplified.geojson",
];
const BESP_REGION_KEYS = new Set([
    "BIH::federation of bosnia and herzegovina",
    "BIH::republika srpska",
    "BIH::brcko",
    "MNE::coast",
    "MNE::inland",
    "SRB::belgrade",
    "SRB::vojvodina",
    "SRB::central serbia",
    "SRB::south and east serbia",
    "SRB::kosovo and metohija",
]);
const REGION_NAME_ALIASES = {
    "federation of bosnia and herzegovina": "federation of bosnia and herzegovina",
    "federation of bosnia-herzegovina": "federation of bosnia and herzegovina",
    "republika srpska": "republika srpska",
    "brcko": "brcko",
    "brcko district": "brcko",
    "belgrade": "belgrade",
    "belgrade district": "belgrade",
    "autonomous province of vojvodina": "vojvodina",
    "vojvodina": "vojvodina",
    "central serbia": "central serbia",
    "south and east serbia": "south and east serbia",
    "kosovo and metohija": "kosovo and metohija",
    kosovo: "kosovo and metohija",
    "kosovo & metohija": "kosovo and metohija",
    "coast": "coast",
    "inland": "inland",
};
const REGION_FEATURE_TO_BESP = {
    "BIH::federation of bosnia and herzegovina": "BIH::federation of bosnia and herzegovina",
    "BIH::republika srpska": "BIH::republika srpska",
    "BIH::brcko": "BIH::republika srpska",
    "SRB::belgrade": "SRB::belgrade",
    "SRB::autonomous province of vojvodina": "SRB::vojvodina",
    "SRB::vojvodina": "SRB::vojvodina",
    "SRB::syrmia district": "SRB::vojvodina",
    "SRB::south banat district": "SRB::vojvodina",
    "SRB::north banat district": "SRB::vojvodina",
    "SRB::north backa district": "SRB::vojvodina",
    "SRB::central banat district": "SRB::vojvodina",
    "SRB::west backa district": "SRB::vojvodina",
    "SRB::south backa district": "SRB::vojvodina",
    "SRB::bor district": "SRB::south and east serbia",
    "SRB::pcinja district": "SRB::south and east serbia",
    "SRB::branicevo district": "SRB::south and east serbia",
    "SRB::zajecar district": "SRB::south and east serbia",
    "SRB::pirot district": "SRB::south and east serbia",
    "SRB::jablanica district": "SRB::south and east serbia",
    "SRB::toplica district": "SRB::south and east serbia",
    "SRB::nisava district": "SRB::south and east serbia",
    "SRB::rasina district": "SRB::south and east serbia",
    "SRB::pomoravlje district": "SRB::south and east serbia",
    "SRB::kolubara district": "SRB::central serbia",
    "SRB::macva district": "SRB::central serbia",
    "SRB::podunavlje district": "SRB::south and east serbia",
    "SRB::sumadija district": "SRB::central serbia",
    "SRB::moravica district": "SRB::central serbia",
    "SRB::zlatibor district": "SRB::central serbia",
    "SRB::raska district": "SRB::central serbia",
    "SRB::kosovo": "SRB::kosovo and metohija",
    "MNE::herceg novi municipality": "MNE::coast",
    "MNE::bar municipality": "MNE::coast",
    "MNE::budva municipality": "MNE::coast",
    "MNE::kotor municipality": "MNE::coast",
    "MNE::tivat municipality": "MNE::coast",
    "MNE::ulcinj municipality": "MNE::coast",
    "MNE::plav municipality": "MNE::inland",
    "MNE::rozaje municipality": "MNE::inland",
    "MNE::andrijevica municipality": "MNE::inland",
    "MNE::berane municipality": "MNE::inland",
    "MNE::podgorica municipality": "MNE::inland",
    "MNE::bijelo polje municipality": "MNE::inland",
    "MNE::cetinje municipality": "MNE::inland",
    "MNE::danilovgrad municipality": "MNE::inland",
    "MNE::kolasin municipality": "MNE::inland",
    "MNE::mojkovac municipality": "MNE::inland",
    "MNE::niksic municipality": "MNE::inland",
    "MNE::pljevlja municipality": "MNE::inland",
    "MNE::pluzine municipality": "MNE::inland",
    "MNE::savnik municipality": "MNE::inland",
    "MNE::zabljak municipality": "MNE::inland",
    "MNE::gusinje municipality": "MNE::inland",
    "MNE::petnjica municipality": "MNE::inland",
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
const FEATURE_TO_VISUAL_REGION = {
    "BIH::federation of bosnia and herzegovina": "BIH::fbih",
    "BIH::republika srpska": "BIH::rs",
    "BIH::brcko": "BIH::rs",
    "SRB::autonomous province of vojvodina": "SRB::vojvodina",
    "SRB::vojvodina": "SRB::vojvodina",
    "SRB::syrmia district": "SRB::vojvodina",
    "SRB::south banat district": "SRB::vojvodina",
    "SRB::north banat district": "SRB::vojvodina",
    "SRB::north backa district": "SRB::vojvodina",
    "SRB::central banat district": "SRB::vojvodina",
    "SRB::west backa district": "SRB::vojvodina",
    "SRB::south backa district": "SRB::vojvodina",
    "SRB::belgrade": "SRB::belgrade",
    "SRB::kolubara district": "SRB::sz-srb",
    "SRB::macva district": "SRB::sz-srb",
    "SRB::sumadija district": "SRB::sz-srb",
    "SRB::moravica district": "SRB::sz-srb",
    "SRB::zlatibor district": "SRB::sz-srb",
    "SRB::raska district": "SRB::sz-srb",
    "SRB::bor district": "SRB::ji-srb",
    "SRB::pcinja district": "SRB::ji-srb",
    "SRB::branicevo district": "SRB::ji-srb",
    "SRB::zajecar district": "SRB::ji-srb",
    "SRB::pirot district": "SRB::ji-srb",
    "SRB::jablanica district": "SRB::ji-srb",
    "SRB::toplica district": "SRB::ji-srb",
    "SRB::nisava district": "SRB::ji-srb",
    "SRB::rasina district": "SRB::ji-srb",
    "SRB::pomoravlje district": "SRB::ji-srb",
    "SRB::podunavlje district": "SRB::ji-srb",
    "SRB::kosovo": "SRB::kosovo-metohija",
    "SRB::kosovo and metohija": "SRB::kosovo-metohija",
    "MNE::herceg novi municipality": "MNE::boka",
    "MNE::kotor municipality": "MNE::boka",
    "MNE::tivat municipality": "MNE::boka",
    "MNE::budva municipality": "MNE::primorje",
    "MNE::bar municipality": "MNE::primorje",
    "MNE::ulcinj municipality": "MNE::primorje",
    "MNE::podgorica municipality": "MNE::zeta",
    "MNE::danilovgrad municipality": "MNE::zeta",
    "MNE::cetinje municipality": "MNE::stara-crna-gora",
    "MNE::niksic municipality": "MNE::stara-hercegovina",
    "MNE::pljevlja municipality": "MNE::stara-hercegovina",
    "MNE::pluzine municipality": "MNE::stara-hercegovina",
    "MNE::savnik municipality": "MNE::stara-hercegovina",
    "MNE::zabljak municipality": "MNE::stara-hercegovina",
    "MNE::kolasin municipality": "MNE::brda",
    "MNE::mojkovac municipality": "MNE::brda",
    "MNE::andrijevica municipality": "MNE::brda",
    "MNE::berane municipality": "MNE::brda",
    "MNE::bijelo polje municipality": "MNE::stara-raska",
    "MNE::rozaje municipality": "MNE::stara-raska",
    "MNE::plav municipality": "MNE::stara-raska",
    "MNE::gusinje municipality": "MNE::stara-raska",
    "MNE::petnjica municipality": "MNE::stara-raska",
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

const mapDataCache = {
    countriesByCode: new Map(),
    regionsByKey: new Map(),
    latestYearByCountryCode: new Map(),
    visualRegionsByKey: new Map(),
};
let activeMapMode = "country";

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
    elements.mapModeCountryButton.addEventListener("click", () => setMapMode("country"));
    elements.mapModeRegionButton.addEventListener("click", () => setMapMode("region"));
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
        const exportData = await fetchJson(EXPORT_PATH);
        if (!isValidExport(exportData)) {
            throw new Error("Invalid BESP export shape");
        }

        let geoData = null;
        let geoWarning = "";
        try {
            geoData = await loadGeoBoundaryData();
        } catch (error) {
            geoWarning = error instanceof Error ? error.message : "GeoJSON load failed";
        }

        renderDashboard(exportData, geoData, geoWarning);
    } catch (error) {
        const detail = error instanceof Error ? ` (${error.message})` : "";
        elements.loadStatus.textContent =
            "Could not load output/latest.json. Run py main.py and serve the repository root before opening the dashboard."
            + detail;
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
        Promise.all(COUNTRY_GEOJSON_PATHS.map((path) => fetchJson(path))),
        Promise.all(REGION_GEOJSON_PATHS.map((path) => fetchJson(path))),
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

    mapDataCache.countriesByCode = getLatestCountryRowsByCode(countryRows);
    mapDataCache.regionsByKey = getLatestRegionRowsByKey(regionRows);
    mapDataCache.latestYearByCountryCode = getLatestYearByCountryCode(countryRows);

    renderMetaCards(exportData, countryRows.length, regionRows.length);
    renderCountryLayer(geoData);
    renderRegionLayer(geoData);
    bindMapHoverEvents();
    renderCountryTable(countryRows);
    renderRegionTable(regionRows);
    applyMapModeVisibility();
    resetMapHoverDetails();

    const geoSuffix = geoWarning ? ` | Map fallback: ${geoWarning}` : "";
    elements.loadStatus.textContent =
        `Loaded ${EXPORT_PATH} successfully (${countryRows.length} country rows, ${regionRows.length} region rows).${geoSuffix}`;
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

    const groupedCountries = [...groupedByCountry.entries()]
        .map(([countryCode, features]) => {
            const mergedPathD = features.map((feature) => feature.pathD).join(" ");
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
            };
        })
        .sort((left, right) => left.countryCode.localeCompare(right.countryCode));

    elements.countryLayer.innerHTML = groupedCountries
        .map((country) => {
            const row = mapDataCache.countriesByCode.get(country.countryCode) ?? null;
            const fill = mapCountryFill(row, minGdpPerCapita, maxGdpPerCapita);
            return `
                <path
                    class="map-country-shape"
                    data-country-code="${escapeHtml(country.countryCode)}"
                    d="${escapeHtml(country.mergedPathD)}"
                    fill="${escapeHtml(fill)}"
                    stroke="${escapeHtml(fill)}"
                    stroke-width="1.25"
                    stroke-linejoin="round"
                    fill-rule="nonzero"
                ></path>
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
                        <span class="meta-label">${escapeHtml(country.displayName)} (${escapeHtml(country.countryCode)})</span>
                        <strong class="meta-value">No data</strong>
                        <p class="meta-note">No matching country export row.</p>
                    </article>
                `;
            }

            return `
                <article class="meta-card">
                    <span class="meta-label">${escapeHtml(country.displayName)} (${escapeHtml(country.countryCode)})</span>
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
        .map((group) => `
            <text class="map-region-label" x="${group.centroid[0].toFixed(1)}" y="${group.centroid[1].toFixed(1)}">
                ${escapeHtml(group.label)}
            </text>
        `)
        .join("");
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

    return [...groups.entries()].map(([visualRegionKey, features]) => {
        const template = VISUAL_REGION_DEFINITIONS[visualRegionKey];
        const mergedPathD = features.map((feature) => feature.pathD).join(" ");
        return {
            visualRegionKey,
            label: template?.label ?? visualRegionKey,
            dataRegionKey: template?.dataRegionKey ?? features[0]?.visualRegionDataKey ?? null,
            countryCode: features[0]?.countryCode ?? "",
            fill: template?.fill ?? "rgba(126, 143, 161, 0.5)",
            centroid: averageCentroid(features),
            pathD: mergedPathD,
        };
    });
}

function bindMapHoverEvents() {
    for (const node of elements.countryLayer.querySelectorAll(".map-country-shape")) {
        node.addEventListener("mouseenter", () => {
            const countryCode = normalizeCountryCode(node.getAttribute("data-country-code"));
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
            const countryCode = normalizeCountryCode(node.getAttribute("data-country-code"));
            const regionName = String(node.getAttribute("data-region-name") ?? "");
            const mappedRegionKey = String(node.getAttribute("data-data-region-key") ?? "");
            const regionData = mappedRegionKey ? mapDataCache.regionsByKey.get(mappedRegionKey) : null;
            const countryData = mapDataCache.countriesByCode.get(countryCode) ?? null;
            node.classList.add("map-hover-target");
            renderRegionHover(countryCode, regionName, regionData ?? null, countryData);
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

    elements.mapHoverTitle.textContent =
        `${countryData.country_name} (${countryData.country_code}) - ${countryData.yearKey}`;
    elements.mapHoverBody.textContent =
        `Population ${formatInteger(countryData.end_population)}, GDP ${formatDecimal(countryData.end_gdp_billion_eur)} bn EUR, `
        + `growth ${formatPercent(countryData.gdp_growth_rate)}, unemployment ${formatPercent(countryData.average_unemployment_rate)}.`;
}

function renderRegionHover(countryCode, regionName, regionData, countryData) {
    if (regionData) {
        elements.mapHoverTitle.textContent =
            `${regionData.region_name} (${regionData.country_code}) - ${regionData.yearKey}`;
        elements.mapHoverBody.textContent =
            `Population ${formatInteger(regionData.end_population)}, GDP ${formatDecimal(regionData.end_gdp_billion_eur)} bn EUR, `
            + `growth ${formatPercent(regionData.gdp_growth_rate)}, unemployment ${formatPercent(regionData.unemployment_rate)}, `
            + `attractiveness ${formatDecimal(regionData.regional_attractiveness)}.`;
        return;
    }

    if (countryData) {
        elements.mapHoverTitle.textContent = `${regionName} (${countryCode})`;
        elements.mapHoverBody.textContent =
            "No direct BESP region mapping for this geoboundary. "
            + `Fallback country context: ${countryData.country_name}, ${countryData.yearKey}, `
            + `population ${formatInteger(countryData.end_population)}, GDP ${formatDecimal(countryData.end_gdp_billion_eur)} bn EUR.`;
        return;
    }

    elements.mapHoverTitle.textContent = `${regionName} (${countryCode})`;
    elements.mapHoverBody.textContent = "No matching export row for region or country fallback.";
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
        "Move over a region area to inspect region-year values when available; otherwise a country fallback is shown.";
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
    mapDataCache.latestYearByCountryCode = new Map();
    mapDataCache.visualRegionsByKey = new Map();
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

function getLatestYearByCountryCode(countryRows) {
    const latestYears = new Map();

    for (const row of countryRows) {
        const code = normalizeCountryCode(row.country_code);
        const year = extractStartYear(row);
        const existing = latestYears.get(code);
        if (existing === undefined || year > existing) {
            latestYears.set(code, year);
        }
    }

    return latestYears;
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
    const normalizedCountryCode = normalizeCountryCode(countryCode);
    const normalizedName = normalizeRegionName(featureRegionName);
    const directKey = `${normalizedCountryCode}::${normalizedName}`;

    if (REGION_FEATURE_TO_BESP[directKey]) {
        return REGION_FEATURE_TO_BESP[directKey];
    }

    if (BESP_REGION_KEYS.has(directKey)) {
        return directKey;
    }

    return null;
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

function regionNameFromBespKey(bespRegionKey) {
    const [, rawRegionName] = String(bespRegionKey).split("::");
    if (!rawRegionName) {
        return String(bespRegionKey);
    }

    return rawRegionName
        .split(" ")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");
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

function mapRegionFill(regionData, countryData, minUnemployment, maxUnemployment) {
    if (regionData) {
        const span = maxUnemployment - minUnemployment;
        const ratio = span > 0 ? (regionData.unemployment_rate - minUnemployment) / span : 0.5;
        const red = Math.round(84 + ratio * 135);
        const green = Math.round(168 - ratio * 58);
        const blue = Math.round(139 - ratio * 36);
        return `rgba(${red}, ${green}, ${blue}, 0.9)`;
    }

    if (countryData) {
        return "rgba(126, 143, 161, 0.38)";
    }

    return "rgba(110, 126, 143, 0.3)";
}

function shortBespRegionLabel(regionName, bespRegionKey) {
    const normalized = normalizeRegionName(regionName);
    const byNormalized = {
        "federation of bosnia and herzegovina": "FBiH",
        "republika srpska": "RS",
        brcko: "Brcko",
        belgrade: "Beograd",
        vojvodina: "Vojvodina",
        "central serbia": "Central SRB",
        "south and east serbia": "SE SRB",
        "kosovo and metohija": "Kosovo",
        coast: "Coast",
        inland: "Inland",
    };

    if (byNormalized[normalized]) {
        return byNormalized[normalized];
    }

    const fallbackFromKey = regionNameFromBespKey(bespRegionKey);
    return fallbackFromKey.length > 24
        ? fallbackFromKey.replace(" and ", " & ")
        : fallbackFromKey;
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
