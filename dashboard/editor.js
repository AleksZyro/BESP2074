const MAP_VIEWBOX_WIDTH = 780;
const MAP_VIEWBOX_HEIGHT = 520;
const MAP_PADDING = 10;
const MAP_ASSIGNMENTS_API_PATH = "/api/map-assignments";
const MAP_ASSIGNMENTS_FILE_PATH = "./data/map_assignments.json";
const COUNTRIES_DATA_PATH = "../data/countries.json";
const REGIONS_DATA_PATH = "../data/regions.json";
const BALKAN_CONFIG = window.BALKAN_CONFIG ?? { activeMapCountryCodes: [], countries: {} };
const COUNTRY_CONFIG = BALKAN_CONFIG.countries ?? {};
const MAP_COUNTRY_CODES = Array.isArray(BALKAN_CONFIG.activeMapCountryCodes) && BALKAN_CONFIG.activeMapCountryCodes.length
    ? [...BALKAN_CONFIG.activeMapCountryCodes]
    : ["ALB", "BGR", "BIH", "HRV", "HUN", "MKD", "MNE", "ROU", "SRB"];
const TARGET_COUNTRIES = new Set(MAP_COUNTRY_CODES);
const GEOJSON_PATHS = {
    country: MAP_COUNTRY_CODES.map(
        (code) => `./data/geoBoundaries-${code}-ADM0_simplified.geojson`
    ),
    region: [
        ...MAP_COUNTRY_CODES.filter((code) => code !== "BIH").map(
            (code) => `./data/geoBoundaries-${code}-ADM1_simplified.geojson`
        ),
        "./data/geoBoundaries-BIH-ADM1_simplified.geojson",
        "./data/geoBoundaries-BIH-ADM2_simplified.geojson",
        "./data/geoBoundaries-BIH-ADM3_simplified.geojson",
        "./data/geoBoundaries-XKX-ADM1_simplified.geojson",
    ],
};
const COUNTRY_FILL = Object.fromEntries(
    Object.entries(COUNTRY_CONFIG).map(([code, entry]) => [code, entry.fill ?? "rgba(127, 150, 173, 0.88)"])
);
COUNTRY_FILL.XKX ??= "rgba(212, 161, 108, 0.88)";
const COUNTRY_NAMES = Object.fromEntries(
    Object.entries(COUNTRY_CONFIG).map(([code, entry]) => [code, entry.name ?? code])
);
COUNTRY_NAMES.XKX ??= "Kosovo";
const REGION_NAME_ALIASES = Object.fromEntries([
    ["federation of bosnia and herzegovina", "federation of bosnia and herzegovina"],
    ["federation of bosnia-herzegovina", "federation of bosnia and herzegovina"],
    ["republika srpska", "republika srpska"],
    ["brcko", "brcko"],
    ["brcko district", "brcko"],
    ["belgrade", "belgrade"],
    ["belgrade district", "belgrade"],
    ["autonomous province of vojvodina", "vojvodina"],
    ["vojvodina", "vojvodina"],
    ["central serbia", "central serbia"],
    ["south and east serbia", "south and east serbia"],
    ["kosovo and metohija", "kosovo and metohija"],
    ["kosovo", "kosovo and metohija"],
    ["kosovo and metohia", "kosovo and metohija"],
    ["coast", "coast"],
    ["inland", "inland"],
    ["tirane", "tirana"],
    ["skopje", "skopje"],
    ["sofia city", "sofia"],
    ["sofia", "sofia"],
    ["budapest", "budapest"],
    ["bucharest ilfov", "bucharest ilfov"],
]);
const SIMPLE_TARGET_OPTIONS = Object.freeze({
    ALB: [
        { visualRegionKey: "ALB::north", label: "N ALB", dataRegionKey: "ALB::northern albania", fill: "#7f8d62" },
        { visualRegionKey: "ALB::central", label: "C ALB", dataRegionKey: "ALB::tirana", fill: "#a68962", useDefinitionDataKeys: true },
        { visualRegionKey: "ALB::south", label: "S ALB", dataRegionKey: "ALB::southern albania", fill: "#b67658" },
    ],
    BGR: [
        { visualRegionKey: "BGR::sofia", label: "Sofia", dataRegionKey: "BGR::sofia", fill: "#63718d" },
        { visualRegionKey: "BGR::north", label: "N BUL", dataRegionKey: "BGR::northern bulgaria", fill: "#a2bb60" },
        { visualRegionKey: "BGR::south", label: "S BUL", dataRegionKey: "BGR::southern bulgaria", fill: "#6f9250" },
        { visualRegionKey: "BGR::black-sea", label: "Black Sea", dataRegionKey: "BGR::black sea bulgaria", fill: "#4e83a5" },
    ],
    BIH: [
        { visualRegionKey: "BIH::fbih", label: "FBiH", dataRegionKey: "BIH::federation of bosnia and herzegovina", fill: "#8f776d" },
        { visualRegionKey: "BIH::rs", label: "RS", dataRegionKey: "BIH::republika srpska", fill: "#a4a08c", useDefinitionDataKeys: true },
    ],
    HRV: [
        { visualRegionKey: "HRV::zagreb-central", label: "C HRV", dataRegionKey: "HRV::zagreb and central croatia", fill: "#a25d46" },
        { visualRegionKey: "HRV::slavonia", label: "Slavonija", dataRegionKey: "HRV::slavonia", fill: "#c97f44" },
        { visualRegionKey: "HRV::dalmatia", label: "Dalmacija", dataRegionKey: "HRV::dalmatia", fill: "#d9ac70" },
        { visualRegionKey: "HRV::istria-kvarner", label: "Istrija", dataRegionKey: "HRV::istria and kvarner", fill: "#8f6f5a" },
    ],
    HUN: [
        { visualRegionKey: "HUN::central-hungary", label: "Budapest", dataRegionKey: "HUN::central hungary", fill: "#d34b4b" },
        { visualRegionKey: "HUN::north-hungary", label: "N HUN", dataRegionKey: "HUN::northern hungary", fill: "#81c5d8" },
        { visualRegionKey: "HUN::great-plains", label: "Great Plains", dataRegionKey: "HUN::great plains", fill: "#41b65a" },
        { visualRegionKey: "HUN::transdanubia", label: "Transdanubia", dataRegionKey: "HUN::transdanubia", fill: "#6f63c7" },
    ],
    MKD: [
        { visualRegionKey: "MKD::west", label: "W MAC", dataRegionKey: "MKD::western north macedonia", fill: "#b78361" },
        { visualRegionKey: "MKD::skopje", label: "Skopje", dataRegionKey: "MKD::skopje", fill: "#865c71" },
        { visualRegionKey: "MKD::se", label: "SE MAC", dataRegionKey: "MKD::southeastern north macedonia", fill: "#8f6aa7" },
    ],
    MNE: [
        { visualRegionKey: "MNE::coastal-region", label: "CS MON", dataRegionKey: "MNE::coast", fill: "#66aebe" },
        { visualRegionKey: "MNE::southern-montenegro", label: "S MON", dataRegionKey: "MNE::inland", fill: "#4f9488" },
        { visualRegionKey: "MNE::northern-montenegro", label: "N MON", dataRegionKey: "MNE::inland", fill: "#7aa6cf" },
    ],
    ROU: [
        { visualRegionKey: "ROU::transylvania-banat", label: "Transylvania", dataRegionKey: "ROU::transylvania and banat", fill: "#ccb65b" },
        { visualRegionKey: "ROU::wallachia-oltenia", label: "Wallachia", dataRegionKey: "ROU::wallachia and oltenia", fill: "#b48a56" },
        { visualRegionKey: "ROU::bucharest-ilfov", label: "Bucharest", dataRegionKey: "ROU::bucharest ilfov", fill: "#8a5d4d" },
        { visualRegionKey: "ROU::moldavia", label: "Moldavia", dataRegionKey: "ROU::moldavia", fill: "#c87892" },
        { visualRegionKey: "ROU::dobruja-lower-danube", label: "Dobruja", dataRegionKey: "ROU::dobruja and lower danube", fill: "#7fa866" },
    ],
    SRB: [
        { visualRegionKey: "SRB::vojvodina", label: "Vojvodina", dataRegionKey: "SRB::vojvodina", fill: "#70b29e" },
        { visualRegionKey: "SRB::belgrade", label: "Beograd", dataRegionKey: "SRB::belgrade", fill: "#b0a59a" },
        { visualRegionKey: "SRB::sz-srb", label: "SZ SRB", dataRegionKey: "SRB::central serbia", fill: "#dce68d" },
        { visualRegionKey: "SRB::ji-srb", label: "JI SRB", dataRegionKey: "SRB::south and east serbia", fill: "#cf857c" },
        { visualRegionKey: "SRB::kosovo-metohija", label: "Kosovo", dataRegionKey: "SRB::kosovo and metohija", fill: "#efb287" },
    ],
});

const editorState = {
    countryFeatures: [],
    regionFeatures: [],
    allFeatures: [],
    assignments: { overrides: {} },
    countries: [],
    regions: [],
    selectedFeatureIds: new Set(),
    layerFilter: "region",
    countryFilter: "all",
    adminFilter: "all",
    searchText: "",
    runServiceAvailable: false,
};

const elements = {
    status: document.getElementById("editor-status"),
    selectionSummary: document.getElementById("editor-selection-summary"),
    selectedTitle: document.getElementById("editor-selected-title"),
    selectedBody: document.getElementById("editor-selected-body"),
    overridePreview: document.getElementById("editor-override-preview"),
    layerFilter: document.getElementById("editor-layer-filter"),
    countryFilter: document.getElementById("editor-country-filter"),
    adminFilter: document.getElementById("editor-admin-filter"),
    search: document.getElementById("editor-search"),
    selectVisibleButton: document.getElementById("editor-select-visible"),
    clearSelectionButton: document.getElementById("editor-clear-selection"),
    reloadButton: document.getElementById("editor-reload"),
    saveButton: document.getElementById("editor-save"),
    applyOverrideButton: document.getElementById("editor-apply-override"),
    removeOverrideButton: document.getElementById("editor-remove-override"),
    featureList: document.getElementById("editor-feature-list"),
    countryOutlineLayer: document.getElementById("editor-country-outline-layer"),
    featureLayer: document.getElementById("editor-feature-layer"),
    selectionLayer: document.getElementById("editor-selection-layer"),
    labelLayer: document.getElementById("editor-label-layer"),
    targetCountry: document.getElementById("editor-target-country"),
    targetRegion: document.getElementById("editor-target-region"),
    targetSummary: document.getElementById("editor-target-summary"),
    targetName: document.getElementById("editor-target-name"),
    targetBespSelect: document.getElementById("editor-target-besp-select"),
    targetBespKey: document.getElementById("editor-target-besp-key"),
    targetVisualKey: document.getElementById("editor-target-visual-key"),
    targetVisualLabel: document.getElementById("editor-target-visual-label"),
    targetVisualDataKey: document.getElementById("editor-target-visual-data-key"),
    targetVisualFill: document.getElementById("editor-target-visual-fill"),
    targetVisualFillPicker: document.getElementById("editor-target-visual-fill-picker"),
    hidden: document.getElementById("editor-hidden"),
};

void initializeEditor();

async function initializeEditor() {
    bindEvents();
    await loadEditorData();
}

function bindEvents() {
    elements.layerFilter.addEventListener("change", () => {
        editorState.layerFilter = elements.layerFilter.value;
        renderEditor();
    });
    elements.countryFilter.addEventListener("change", () => {
        editorState.countryFilter = elements.countryFilter.value;
        renderEditor();
    });
    elements.adminFilter.addEventListener("change", () => {
        editorState.adminFilter = elements.adminFilter.value;
        renderEditor();
    });
    elements.search.addEventListener("input", () => {
        editorState.searchText = String(elements.search.value ?? "").trim().toLowerCase();
        renderEditor();
    });
    elements.selectVisibleButton.addEventListener("click", () => {
        editorState.selectedFeatureIds = new Set(getVisibleFeatures().map((feature) => feature.featureId));
        renderEditor();
    });
    elements.clearSelectionButton.addEventListener("click", () => {
        editorState.selectedFeatureIds.clear();
        renderEditor();
    });
    elements.reloadButton.addEventListener("click", async () => {
        await loadAssignmentsOnly();
        renderEditor();
    });
    elements.saveButton.addEventListener("click", async () => {
        try {
            await saveAssignments();
        } catch (error) {
            const detail = error instanceof Error ? error.message : "Unbekannter Fehler";
            setStatus(`Speichern fehlgeschlagen: ${detail}`, "error");
        }
    });
    elements.applyOverrideButton.addEventListener("click", () => {
        applyOverrideToSelection();
    });
    elements.removeOverrideButton.addEventListener("click", () => {
        removeOverrideFromSelection();
    });
    elements.targetVisualFillPicker.addEventListener("input", () => {
        elements.targetVisualFill.value = elements.targetVisualFillPicker.value;
    });
    elements.targetVisualFill.addEventListener("input", () => {
        const color = normalizeHexColor(elements.targetVisualFill.value);
        if (color) {
            elements.targetVisualFillPicker.value = color;
        }
    });
    elements.targetCountry.addEventListener("change", () => {
        populateSimpleTargetRegionOptions(elements.targetCountry.value);
        updateTargetSummary();
    });
    elements.targetRegion.addEventListener("change", () => {
        updateTargetSummary();
    });
    elements.targetBespSelect.addEventListener("change", () => {
        const selectedKey = String(elements.targetBespSelect.value ?? "");
        if (!selectedKey) {
            return;
        }
        const selectedOption = elements.targetBespSelect.selectedOptions[0];
        const selectedLabel = String(selectedOption?.textContent ?? "").trim();
        if (!elements.targetBespKey.value.trim()) {
            elements.targetBespKey.value = selectedKey;
        }
        if (!elements.targetVisualDataKey.value.trim()) {
            elements.targetVisualDataKey.value = selectedKey;
        }
        if (!elements.targetVisualKey.value.trim()) {
            elements.targetVisualKey.value = selectedKey.replaceAll(" ", "-");
        }
        if (!elements.targetVisualLabel.value.trim()) {
            elements.targetVisualLabel.value = selectedLabel.replace(/^[A-Z]{3} :: /, "");
        }
    });
}

async function loadEditorData() {
    setStatus("Lade Editor-Daten ...", "loading");
    try {
        const [
            countryCollections,
            regionCollections,
            countries,
            regions,
            assignments,
        ] = await Promise.all([
            Promise.all(GEOJSON_PATHS.country.map((path) => fetchJson(path))),
            Promise.all(GEOJSON_PATHS.region.map((path) => fetchJson(path))),
            fetchJson(COUNTRIES_DATA_PATH),
            fetchJson(REGIONS_DATA_PATH),
            fetchAssignments(),
        ]);

        const countryFeaturesRaw = countryCollections.flatMap((collection) => collection.features ?? []);
        const regionFeaturesRaw = regionCollections.flatMap((collection) => collection.features ?? []);
        const countryFeatures = countryFeaturesRaw
            .map((feature) => normalizeGeoFeature(feature, "country"))
            .filter(Boolean);
        const regionFeatures = regionFeaturesRaw
            .map((feature) => normalizeGeoFeature(feature, "region"))
            .filter(Boolean);
        const projection = createProjection([...countryFeatures, ...regionFeatures]);

        editorState.countryFeatures = countryFeatures
            .map((feature) => projectFeature(feature, projection))
            .filter(Boolean);
        editorState.regionFeatures = regionFeatures
            .map((feature) => projectFeature(feature, projection))
            .filter(Boolean);
        editorState.allFeatures = [...editorState.countryFeatures, ...editorState.regionFeatures];
        editorState.countries = Array.isArray(countries) ? countries : [];
        editorState.regions = Array.isArray(regions) ? regions : [];
        editorState.assignments = sanitizeAssignments(assignments);
        populateEditorOptions();
        renderEditor();
        setStatus(
            `Geladen: ${editorState.regionFeatures.length} Regions-Flächen, ${editorState.countryFeatures.length} Länder-Flächen.`,
            "success"
        );
    } catch (error) {
        const detail = error instanceof Error ? error.message : "Unbekannter Fehler";
        setStatus(`Editor konnte nicht geladen werden: ${detail}`, "error");
    }
}

async function loadAssignmentsOnly() {
    setStatus("Lade Overrides neu ...", "loading");
    try {
        editorState.assignments = sanitizeAssignments(await fetchAssignments());
        setStatus("Overrides neu geladen.", "success");
    } catch (error) {
        const detail = error instanceof Error ? error.message : "Unbekannter Fehler";
        setStatus(`Overrides konnten nicht neu geladen werden: ${detail}`, "error");
    }
}

async function fetchAssignments() {
    try {
        const payload = await fetchJson(MAP_ASSIGNMENTS_API_PATH);
        editorState.runServiceAvailable = true;
        return payload;
    } catch {
        editorState.runServiceAvailable = false;
        return fetchJson(MAP_ASSIGNMENTS_FILE_PATH);
    }
}

async function saveAssignments() {
    if (!editorState.runServiceAvailable) {
        setStatus("Speichern braucht den lokalen Run-Service (`py tools/local_run_service.py`).", "error");
        return;
    }
    setStatus("Speichere Overrides ...", "loading");
    const response = await fetch(MAP_ASSIGNMENTS_API_PATH, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(editorState.assignments),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }
    editorState.assignments = sanitizeAssignments(await response.json());
    renderEditor();
    setStatus("Overrides gespeichert.", "success");
}

function sanitizeAssignments(payload) {
    const safePayload = payload && typeof payload === "object" ? payload : {};
    const overrides = safePayload.overrides && typeof safePayload.overrides === "object"
        ? safePayload.overrides
        : {};
    return {
        updated_at: safePayload.updated_at ?? null,
        overrides,
    };
}

function populateEditorOptions() {
    const sourceCountryCodes = [...new Set(editorState.allFeatures.map((feature) => feature.rawCountryCode))].sort();
    elements.countryFilter.innerHTML = [
        '<option value="all">Alle Länder</option>',
        ...sourceCountryCodes.map((code) => `<option value="${escapeHtml(code)}">${escapeHtml(code)} - ${escapeHtml(COUNTRY_NAMES[code] ?? code)}</option>`),
    ].join("");

    const adminLevels = [...new Set(editorState.allFeatures.map((feature) => feature.adminLevel))].sort();
    elements.adminFilter.innerHTML = [
        '<option value="all">Alle Level</option>',
        ...adminLevels.map((level) => `<option value="${escapeHtml(level)}">${escapeHtml(level)}</option>`),
    ].join("");

    const targetCountries = editorState.countries.map((country) => `
        <option value="${escapeHtml(country.code)}">${escapeHtml(country.code)} - ${escapeHtml(country.name)}</option>
    `).join("");
    elements.targetCountry.innerHTML = '<option value="">Unverändert</option>' + targetCountries;

    const bespOptions = editorState.regions
        .slice()
        .sort((left, right) => buildRegionKey(left.country_code, left.name).localeCompare(buildRegionKey(right.country_code, right.name)))
        .map((region) => {
            const key = buildRegionKey(region.country_code, region.name);
            return `<option value="${escapeHtml(key)}">${escapeHtml(region.country_code)} :: ${escapeHtml(region.name)}</option>`;
        })
        .join("");
    elements.targetBespSelect.innerHTML = '<option value="">Unverändert</option>' + bespOptions;
}

function renderEditor() {
    renderCountryOutlines();
    renderFeatureLayer();
    renderFeatureList();
    renderSelectionInspector();
}

function renderCountryOutlines() {
    elements.countryOutlineLayer.innerHTML = editorState.countryFeatures.map((feature) => `
        <path
            class="editor-country-outline"
            d="${escapeHtml(feature.pathD)}"
        ></path>
    `).join("");
}

function renderFeatureLayer() {
    const visibleFeatures = getVisibleFeatures();
    elements.featureLayer.innerHTML = visibleFeatures.map((feature) => {
        const isSelected = editorState.selectedFeatureIds.has(feature.featureId);
        const override = editorState.assignments.overrides[feature.featureId] ?? null;
        const hidden = Boolean(override?.hidden);
        const effectiveCountryCode = normalizeCountryCode(override?.targetCountryCode || feature.countryCode || feature.rawCountryCode);
        const fill = hidden
            ? "rgba(55, 71, 89, 0.45)"
            : (normalizeHexColor(override?.targetVisualFill) ?? COUNTRY_FILL[effectiveCountryCode] ?? "rgba(126, 143, 161, 0.72)");
        return `
            <path
                class="editor-map-feature${isSelected ? " editor-map-feature-selected" : ""}${hidden ? " editor-map-feature-hidden" : ""}"
                data-feature-id="${escapeHtml(feature.featureId)}"
                d="${escapeHtml(feature.pathD)}"
                fill="${escapeHtml(fill)}"
                fill-rule="evenodd"
            ></path>
        `;
    }).join("");

    elements.selectionLayer.innerHTML = visibleFeatures
        .filter((feature) => editorState.selectedFeatureIds.has(feature.featureId))
        .map((feature) => `
            <g>
                <path
                    class="editor-selection-outline"
                    d="${escapeHtml(feature.pathD)}"
                    fill="none"
                    fill-rule="evenodd"
                ></path>
                <text
                    class="editor-selection-label"
                    x="${feature.centroid[0].toFixed(1)}"
                    y="${feature.centroid[1].toFixed(1)}"
                >${escapeHtml(shortFeatureLabel(feature))}</text>
            </g>
        `).join("");

    for (const node of elements.featureLayer.querySelectorAll(".editor-map-feature")) {
        node.addEventListener("click", () => {
            toggleFeatureSelection(String(node.getAttribute("data-feature-id") ?? ""));
        });
    }
}

function renderFeatureList() {
    const visibleFeatures = getVisibleFeatures();
    if (!visibleFeatures.length) {
        elements.featureList.innerHTML = '<div class="table-empty">Kein Feature passt auf die aktuellen Filter.</div>';
        return;
    }
    elements.featureList.innerHTML = visibleFeatures.map((feature) => {
        const override = editorState.assignments.overrides[feature.featureId] ?? null;
        const selected = editorState.selectedFeatureIds.has(feature.featureId);
        const targetCountry = normalizeCountryCode(override?.targetCountryCode || feature.countryCode || feature.rawCountryCode);
        const targetName = String(override?.targetName || feature.name);
        const visualKey = String(override?.targetVisualRegionKey || "").trim();
        return `
            <button
                type="button"
                class="editor-feature-item${selected ? " editor-feature-item-selected" : ""}"
                data-feature-id="${escapeHtml(feature.featureId)}"
            >
                <span class="editor-feature-item-title">${escapeHtml(feature.name)}</span>
                <span class="editor-feature-item-meta">${escapeHtml(feature.rawCountryCode)} | ${escapeHtml(feature.adminLevel)} | Ziel ${escapeHtml(targetCountry)}${targetName !== feature.name ? ` | ${escapeHtml(targetName)}` : ""}${visualKey ? ` | ${escapeHtml(visualKey)}` : ""}</span>
            </button>
        `;
    }).join("");

    for (const node of elements.featureList.querySelectorAll(".editor-feature-item")) {
        node.addEventListener("click", () => {
            toggleFeatureSelection(String(node.getAttribute("data-feature-id") ?? ""));
        });
    }
}

function renderSelectionInspector() {
    const selectedFeatures = getSelectedFeatures();
    const visibleFeatures = getVisibleFeatures();
    elements.selectionSummary.textContent =
        `${selectedFeatures.length} gewählt | ${visibleFeatures.length} sichtbar | ${Object.keys(editorState.assignments.overrides).length} Override(s)`;

    if (!selectedFeatures.length) {
        elements.selectedTitle.textContent = "Keine Fläche gewählt";
        elements.selectedBody.textContent = "Klick auf Karte oder Liste, um eine oder mehrere Flächen zu wählen.";
        elements.overridePreview.textContent = "{}";
        resetFormFields();
        return;
    }

    if (selectedFeatures.length === 1) {
        const feature = selectedFeatures[0];
        const override = editorState.assignments.overrides[feature.featureId] ?? {};
        elements.selectedTitle.textContent = `${feature.name} (${feature.rawCountryCode} / ${feature.adminLevel})`;
        elements.selectedBody.textContent =
            `Feature-ID: ${feature.featureId}. Standard-Ziel ${feature.countryCode}. ${override.hidden ? "Aktuell ausgeblendet." : "Aktuell sichtbar."}`;
        elements.overridePreview.textContent = JSON.stringify(override, null, 2);
    } else {
        elements.selectedTitle.textContent = `${selectedFeatures.length} Flächen gewählt`;
        elements.selectedBody.textContent =
            `Batch-Zuweisung aktiv. Die Formularwerte werden auf alle gewählten Features angewendet.`;
        const preview = {};
        for (const feature of selectedFeatures) {
            if (editorState.assignments.overrides[feature.featureId]) {
                preview[feature.featureId] = editorState.assignments.overrides[feature.featureId];
            }
        }
        elements.overridePreview.textContent = JSON.stringify(preview, null, 2);
    }

    populateFormFromSelection(selectedFeatures);
}

function populateFormFromSelection(selectedFeatures) {
    const overrides = selectedFeatures.map((feature) => editorState.assignments.overrides[feature.featureId] ?? {});
    const sharedValue = (fieldName) => {
        const firstValue = overrides[0]?.[fieldName] ?? "";
        return overrides.every((override) => (override?.[fieldName] ?? "") === firstValue)
            ? firstValue
            : "";
    };

    const targetCountryCode = sharedValue("targetCountryCode");
    const targetName = sharedValue("targetName");
    const targetBespRegionKey = sharedValue("targetBespRegionKey");
    const targetVisualRegionKey = sharedValue("targetVisualRegionKey");
    const targetVisualRegionLabel = sharedValue("targetVisualRegionLabel");
    const targetVisualRegionDataKey = sharedValue("targetVisualRegionDataKey");
    const targetVisualRegionFill = sharedValue("targetVisualRegionFill");
    const hiddenValues = overrides.map((override) => Boolean(override?.hidden));
    const sharedHidden = hiddenValues.every((value) => value === hiddenValues[0]) ? hiddenValues[0] : false;

    elements.targetCountry.value = targetCountryCode;
    elements.targetName.value = targetName;
    elements.targetBespSelect.value = targetBespRegionKey;
    elements.targetBespKey.value = targetBespRegionKey;
    elements.targetVisualKey.value = targetVisualRegionKey;
    elements.targetVisualLabel.value = targetVisualRegionLabel;
    elements.targetVisualDataKey.value = targetVisualRegionDataKey;
    elements.targetVisualFill.value = targetVisualRegionFill;
    elements.hidden.checked = sharedHidden;

    const pickerColor = normalizeHexColor(targetVisualRegionFill);
    if (pickerColor) {
        elements.targetVisualFillPicker.value = pickerColor;
    }
}

function resetFormFields() {
    elements.targetCountry.value = "";
    elements.targetName.value = "";
    elements.targetBespSelect.value = "";
    elements.targetBespKey.value = "";
    elements.targetVisualKey.value = "";
    elements.targetVisualLabel.value = "";
    elements.targetVisualDataKey.value = "";
    elements.targetVisualFill.value = "";
    elements.hidden.checked = false;
}

function applyOverrideToSelection() {
    const selectedFeatures = getSelectedFeatures();
    if (!selectedFeatures.length) {
        setStatus("Zuerst mindestens eine Fläche auswählen.", "error");
        return;
    }

    const overridePatch = buildOverridePatchFromForm();
    for (const feature of selectedFeatures) {
        const nextOverride = {
            ...(editorState.assignments.overrides[feature.featureId] ?? {}),
            ...overridePatch,
        };
        for (const [key, value] of Object.entries(nextOverride)) {
            if (value === "" || value === null || value === undefined || value === false) {
                delete nextOverride[key];
            }
        }
        if (!Object.keys(nextOverride).length) {
            delete editorState.assignments.overrides[feature.featureId];
        } else {
            editorState.assignments.overrides[feature.featureId] = nextOverride;
        }
    }
    setStatus(`Override lokal auf ${selectedFeatures.length} Fläche(n) angewendet. Danach speichern.`, "success");
    renderEditor();
}

function removeOverrideFromSelection() {
    const selectedFeatures = getSelectedFeatures();
    if (!selectedFeatures.length) {
        setStatus("Keine Auswahl zum Löschen.", "error");
        return;
    }
    for (const feature of selectedFeatures) {
        delete editorState.assignments.overrides[feature.featureId];
    }
    setStatus(`Override für ${selectedFeatures.length} Fläche(n) entfernt. Danach speichern.`, "success");
    renderEditor();
}

function buildOverridePatchFromForm() {
    const patch = {};
    const targetCountryCode = normalizeCountryCode(elements.targetCountry.value);
    const targetName = String(elements.targetName.value ?? "").trim();
    const targetBespRegionKey = String(elements.targetBespKey.value ?? "").trim();
    const targetVisualRegionKey = String(elements.targetVisualKey.value ?? "").trim();
    const targetVisualRegionLabel = String(elements.targetVisualLabel.value ?? "").trim();
    const targetVisualRegionDataKey = String(elements.targetVisualDataKey.value ?? "").trim();
    const targetVisualRegionFill = normalizeHexColor(elements.targetVisualFill.value);

    if (targetCountryCode) {
        patch.targetCountryCode = targetCountryCode;
    }
    if (targetName) {
        patch.targetName = targetName;
    }
    if (targetBespRegionKey) {
        patch.targetBespRegionKey = targetBespRegionKey;
    }
    if (targetVisualRegionKey) {
        patch.targetVisualRegionKey = targetVisualRegionKey;
    }
    if (targetVisualRegionLabel) {
        patch.targetVisualRegionLabel = targetVisualRegionLabel;
    }
    if (targetVisualRegionDataKey) {
        patch.targetVisualRegionDataKey = targetVisualRegionDataKey;
    }
    if (targetVisualRegionFill) {
        patch.targetVisualRegionFill = targetVisualRegionFill;
    }
    if (elements.hidden.checked) {
        patch.hidden = true;
    }
    return patch;
}

function toggleFeatureSelection(featureId) {
    if (!featureId) {
        return;
    }
    if (editorState.selectedFeatureIds.has(featureId)) {
        editorState.selectedFeatureIds.delete(featureId);
    } else {
        editorState.selectedFeatureIds.add(featureId);
    }
    renderEditor();
}

function getVisibleFeatures() {
    return editorState.allFeatures.filter((feature) => {
        if (editorState.layerFilter !== "all" && feature.layerType !== editorState.layerFilter) {
            return false;
        }
        if (editorState.countryFilter !== "all" && feature.rawCountryCode !== editorState.countryFilter) {
            return false;
        }
        if (editorState.adminFilter !== "all" && feature.adminLevel !== editorState.adminFilter) {
            return false;
        }
        if (!editorState.searchText) {
            return true;
        }
        const searchTarget = `${feature.name} ${feature.featureId}`.toLowerCase();
        return searchTarget.includes(editorState.searchText);
    });
}

function getSelectedFeatures() {
    return editorState.allFeatures.filter((feature) => editorState.selectedFeatureIds.has(feature.featureId));
}

function setStatus(message, tone = "muted") {
    elements.status.textContent = message;
    elements.status.className = `export-status export-status-status-${tone}`;
}

function fetchJson(path) {
    return fetch(path, { cache: "no-store" }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${path}`);
        }
        return response.json();
    });
}

function normalizeGeoFeature(feature, layerType) {
    if (!feature || !feature.geometry || !feature.properties) {
        return null;
    }
    const properties = feature.properties;
    const rawCountryCode = normalizeCountryCode(properties.shapeGroup || properties.shapeISO);
    const adminLevel = String(properties.shapeType ?? "").trim().toUpperCase();
    let countryCode = rawCountryCode;
    let name = String(properties.shapeName ?? "").trim();

    if (rawCountryCode === "XKX") {
        countryCode = "SRB";
        if (layerType === "region" && adminLevel === "ADM0") {
            name = "Kosovo and Metohija";
        }
    }
    if (!name || (!TARGET_COUNTRIES.has(countryCode) && rawCountryCode !== "XKX")) {
        return null;
    }

    return {
        layerType,
        rawCountryCode,
        countryCode,
        adminLevel,
        name,
        geometry: feature.geometry,
        featureId: `${layerType}:${rawCountryCode}:${adminLevel}:${normalizeRegionName(name)}`,
    };
}

function projectFeature(feature, projection) {
    const pathD = geometryToPath(feature.geometry, projection, true);
    if (!pathD) {
        return null;
    }
    return {
        ...feature,
        pathD,
        centroid: geometryCentroid(feature.geometry, projection),
    };
}

function createProjection(features) {
    let minLon = Number.POSITIVE_INFINITY;
    let maxLon = Number.NEGATIVE_INFINITY;
    let minLat = Number.POSITIVE_INFINITY;
    let maxLat = Number.NEGATIVE_INFINITY;

    for (const feature of features) {
        for (const [lon, lat] of extractCoordinates(feature.geometry)) {
            if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
                continue;
            }
            minLon = Math.min(minLon, lon);
            maxLon = Math.max(maxLon, lon);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
        }
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
        .filter(Boolean)
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
    return projection(lonSum / points.length, latSum / points.length);
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

function normalizeCountryCode(countryCode) {
    return String(countryCode ?? "").trim().toUpperCase();
}

function repairRegionTextMojibakeAscii(regionName) {
    return String(regionName ?? "")
        .replaceAll("Ã«", "ë")
        .replaceAll("Ã§", "ç")
        .replaceAll("Ä", "č")
        .replaceAll("Ã¡", "á")
        .replaceAll("Ã¢", "â")
        .replaceAll("Ã©", "é")
        .replaceAll("Ã­", "í")
        .replaceAll("Ã³", "ó")
        .replaceAll("Ã¶", "ö")
        .replaceAll("Ãº", "ú")
        .replaceAll("Ã¼", "ü")
        .replaceAll("Å‘", "ő")
        .replaceAll("Å±", "ű");
}

function normalizeRegionName(regionName) {
    const compact = repairRegionTextMojibakeAscii(regionName)
        .normalize("NFKD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replaceAll("&", " and ")
        .replaceAll(/[^a-z0-9 ]+/g, " ")
        .replaceAll(/\s+/g, " ");
    return REGION_NAME_ALIASES[compact] ?? compact;
}

function buildRegionKey(countryCode, regionName) {
    return `${normalizeCountryCode(countryCode)}::${normalizeRegionName(regionName)}`;
}

function normalizeHexColor(value) {
    const text = String(value ?? "").trim();
    if (!text) {
        return "";
    }
    const hex = text.startsWith("#") ? text : `#${text}`;
    return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toLowerCase() : "";
}

function shortFeatureLabel(feature) {
    return feature.name.length > 18 ? `${feature.name.slice(0, 18)}…` : feature.name;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function shortFeatureLabel(feature) {
    return feature.name.length > 18 ? `${feature.name.slice(0, 18)}...` : feature.name;
}

function getSimpleTargetOptions(countryCode) {
    return SIMPLE_TARGET_OPTIONS[normalizeCountryCode(countryCode)] ?? [];
}

function resolveSimpleTargetOption(countryCode, visualRegionKey = "") {
    const options = getSimpleTargetOptions(countryCode);
    if (!options.length) {
        return null;
    }
    const selectedVisualRegionKey = String(visualRegionKey ?? "").trim();
    return options.find((option) => option.visualRegionKey === selectedVisualRegionKey) ?? options[0];
}

function populateSimpleTargetRegionOptions(countryCode, preferredVisualRegionKey = "") {
    const targetOptions = getSimpleTargetOptions(countryCode);
    if (!targetOptions.length) {
        elements.targetRegion.innerHTML = '<option value="">Automatisch</option>';
        elements.targetRegion.value = "";
        return;
    }

    elements.targetRegion.innerHTML = [
        '<option value="">Automatisch</option>',
        ...targetOptions.map((option) => `
            <option value="${escapeHtml(option.visualRegionKey)}">${escapeHtml(option.label)}</option>
        `),
    ].join("");

    if (preferredVisualRegionKey && targetOptions.some((option) => option.visualRegionKey === preferredVisualRegionKey)) {
        elements.targetRegion.value = preferredVisualRegionKey;
    } else {
        elements.targetRegion.value = "";
    }
}

function lookupCountryName(countryCode) {
    const normalizedCountryCode = normalizeCountryCode(countryCode);
    const country = editorState.countries.find((entry) => entry.code === normalizedCountryCode);
    return country?.name ?? COUNTRY_NAMES[normalizedCountryCode] ?? normalizedCountryCode;
}

function updateTargetSummary() {
    const targetCountryCode = normalizeCountryCode(elements.targetCountry.value);
    if (!targetCountryCode) {
        elements.targetSummary.textContent = "Noch kein Zielland aktiv.";
        return;
    }

    const targetOption = resolveSimpleTargetOption(
        targetCountryCode,
        elements.targetRegion.value,
    );
    const regionLabel = targetOption?.label ?? "Automatisch";
    elements.targetSummary.textContent =
        `Aktiv: ${lookupCountryName(targetCountryCode)} (${targetCountryCode}) · Zielregion ${regionLabel}.`;
}

function buildSimpleTargetPatch() {
    const targetCountryCode = normalizeCountryCode(elements.targetCountry.value);
    if (!targetCountryCode) {
        return {};
    }

    const targetOption = resolveSimpleTargetOption(
        targetCountryCode,
        elements.targetRegion.value,
    );
    if (!targetOption) {
        return { targetCountryCode };
    }

    const patch = {
        targetCountryCode,
        targetBespRegionKey: targetOption.dataRegionKey,
        targetVisualRegionKey: targetOption.visualRegionKey,
        targetVisualRegionLabel: targetOption.label,
        targetVisualRegionFill: targetOption.fill,
    };
    if (!targetOption.useDefinitionDataKeys && targetOption.dataRegionKey) {
        patch.targetVisualRegionDataKey = targetOption.dataRegionKey;
    }
    return patch;
}

function populateEditorOptions() {
    const sourceCountryCodes = [...new Set(editorState.allFeatures.map((feature) => feature.rawCountryCode))].sort();
    elements.countryFilter.innerHTML = [
        '<option value="all">Alle Länder</option>',
        ...sourceCountryCodes.map((code) => `<option value="${escapeHtml(code)}">${escapeHtml(code)} - ${escapeHtml(COUNTRY_NAMES[code] ?? code)}</option>`),
    ].join("");

    const adminLevels = [...new Set(editorState.allFeatures.map((feature) => feature.adminLevel))].sort();
    elements.adminFilter.innerHTML = [
        '<option value="all">Alle Level</option>',
        ...adminLevels.map((level) => `<option value="${escapeHtml(level)}">${escapeHtml(level)}</option>`),
    ].join("");

    const targetCountries = editorState.countries.map((country) => `
        <option value="${escapeHtml(country.code)}">${escapeHtml(country.code)} - ${escapeHtml(country.name)}</option>
    `).join("");
    elements.targetCountry.innerHTML = '<option value="">Kein Zielland</option>' + targetCountries;

    const bespOptions = editorState.regions
        .slice()
        .sort((left, right) => buildRegionKey(left.country_code, left.name).localeCompare(buildRegionKey(right.country_code, right.name)))
        .map((region) => {
            const key = buildRegionKey(region.country_code, region.name);
            return `<option value="${escapeHtml(key)}">${escapeHtml(region.country_code)} :: ${escapeHtml(region.name)}</option>`;
        })
        .join("");
    elements.targetBespSelect.innerHTML = '<option value="">Unverändert</option>' + bespOptions;
    populateSimpleTargetRegionOptions(elements.targetCountry.value);
    updateTargetSummary();
}

function renderSelectionInspector() {
    const selectedFeatures = getSelectedFeatures();
    const visibleFeatures = getVisibleFeatures();
    elements.selectionSummary.textContent =
        `${selectedFeatures.length} gewählt | ${visibleFeatures.length} sichtbar | ${Object.keys(editorState.assignments.overrides).length} Override(s)`;

    if (!selectedFeatures.length) {
        elements.selectedTitle.textContent = "Keine Fläche gewählt";
        elements.selectedBody.textContent = "Klick auf Karte oder Liste, um eine oder mehrere Flächen zu wählen.";
        elements.overridePreview.textContent = "{}";
        updateTargetSummary();
        return;
    }

    if (selectedFeatures.length === 1) {
        const feature = selectedFeatures[0];
        const override = editorState.assignments.overrides[feature.featureId] ?? {};
        elements.selectedTitle.textContent = `${feature.name} (${feature.rawCountryCode} / ${feature.adminLevel})`;
        elements.selectedBody.textContent =
            `Feature-ID: ${feature.featureId}. Standard-Ziel ${feature.countryCode}. ${override.hidden ? "Aktuell ausgeblendet." : "Aktuell sichtbar."}`;
        elements.overridePreview.textContent = JSON.stringify(override, null, 2);
    } else {
        elements.selectedTitle.textContent = `${selectedFeatures.length} Flächen gewählt`;
        elements.selectedBody.textContent =
            "Batch-Zuweisung aktiv. Die aktuellen Formularwerte werden auf alle gewählten Features angewendet.";
        const preview = {};
        for (const feature of selectedFeatures) {
            if (editorState.assignments.overrides[feature.featureId]) {
                preview[feature.featureId] = editorState.assignments.overrides[feature.featureId];
            }
        }
        elements.overridePreview.textContent = JSON.stringify(preview, null, 2);
    }

    populateFormFromSelection(selectedFeatures);
}

function populateFormFromSelection(selectedFeatures) {
    const overrides = selectedFeatures.map((feature) => editorState.assignments.overrides[feature.featureId] ?? {});
    const hasAnyOverride = overrides.some((override) => Object.keys(override).length > 0);
    if (!hasAnyOverride) {
        updateTargetSummary();
        return;
    }

    const sharedValue = (fieldName) => {
        const firstValue = overrides[0]?.[fieldName] ?? "";
        return overrides.every((override) => (override?.[fieldName] ?? "") === firstValue)
            ? firstValue
            : "";
    };

    const targetCountryCode = sharedValue("targetCountryCode");
    const targetName = sharedValue("targetName");
    const targetBespRegionKey = sharedValue("targetBespRegionKey");
    const targetVisualRegionKey = sharedValue("targetVisualRegionKey");
    const targetVisualRegionLabel = sharedValue("targetVisualRegionLabel");
    const targetVisualRegionDataKey = sharedValue("targetVisualRegionDataKey");
    const targetVisualRegionFill = sharedValue("targetVisualRegionFill");
    const hiddenValues = overrides.map((override) => Boolean(override?.hidden));
    const sharedHidden = hiddenValues.every((value) => value === hiddenValues[0]) ? hiddenValues[0] : false;

    elements.targetCountry.value = targetCountryCode;
    populateSimpleTargetRegionOptions(targetCountryCode, targetVisualRegionKey);
    elements.targetRegion.value = targetVisualRegionKey;
    elements.targetName.value = targetName;
    elements.targetBespSelect.value = targetBespRegionKey;
    elements.targetBespKey.value = targetBespRegionKey;
    elements.targetVisualKey.value = targetVisualRegionKey;
    elements.targetVisualLabel.value = targetVisualRegionLabel;
    elements.targetVisualDataKey.value = targetVisualRegionDataKey;
    elements.targetVisualFill.value = targetVisualRegionFill;
    elements.hidden.checked = sharedHidden;

    const pickerColor = normalizeHexColor(targetVisualRegionFill);
    if (pickerColor) {
        elements.targetVisualFillPicker.value = pickerColor;
    }
    updateTargetSummary();
}

function applyOverrideToSelection() {
    const selectedFeatures = getSelectedFeatures();
    if (!selectedFeatures.length) {
        setStatus("Zuerst mindestens eine Fläche auswählen.", "error");
        return;
    }

    const overridePatch = buildOverridePatchFromForm();
    for (const feature of selectedFeatures) {
        const nextOverride = {
            ...(editorState.assignments.overrides[feature.featureId] ?? {}),
            ...overridePatch,
        };
        for (const [key, value] of Object.entries(nextOverride)) {
            if (value === "" || value === null || value === undefined || value === false) {
                delete nextOverride[key];
            }
        }
        if (!Object.keys(nextOverride).length) {
            delete editorState.assignments.overrides[feature.featureId];
        } else {
            editorState.assignments.overrides[feature.featureId] = nextOverride;
        }
    }
    setStatus(`Zuweisung lokal auf ${selectedFeatures.length} Fläche(n) angewendet. Danach speichern.`, "success");
    renderEditor();
}

function removeOverrideFromSelection() {
    const selectedFeatures = getSelectedFeatures();
    if (!selectedFeatures.length) {
        setStatus("Keine Auswahl zum Löschen.", "error");
        return;
    }
    for (const feature of selectedFeatures) {
        delete editorState.assignments.overrides[feature.featureId];
    }
    setStatus(`Zuweisung für ${selectedFeatures.length} Fläche(n) entfernt. Danach speichern.`, "success");
    renderEditor();
}

function buildOverridePatchFromForm() {
    const patch = buildSimpleTargetPatch();
    const targetName = String(elements.targetName.value ?? "").trim();
    const targetBespRegionKey = String(elements.targetBespKey.value ?? "").trim();
    const targetVisualRegionKey = String(elements.targetVisualKey.value ?? "").trim();
    const targetVisualRegionLabel = String(elements.targetVisualLabel.value ?? "").trim();
    const targetVisualRegionDataKey = String(elements.targetVisualDataKey.value ?? "").trim();
    const targetVisualRegionFill = normalizeHexColor(elements.targetVisualFill.value);

    if (targetName) {
        patch.targetName = targetName;
    }
    if (targetBespRegionKey) {
        patch.targetBespRegionKey = targetBespRegionKey;
    }
    if (targetVisualRegionKey) {
        patch.targetVisualRegionKey = targetVisualRegionKey;
    }
    if (targetVisualRegionLabel) {
        patch.targetVisualRegionLabel = targetVisualRegionLabel;
    }
    if (targetVisualRegionDataKey) {
        patch.targetVisualRegionDataKey = targetVisualRegionDataKey;
    }
    if (targetVisualRegionFill) {
        patch.targetVisualRegionFill = targetVisualRegionFill;
    }
    if (elements.hidden.checked) {
        patch.hidden = true;
    }
    return patch;
}
