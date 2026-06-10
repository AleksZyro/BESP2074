const EXPORT_PATH = "../output/latest.json";
const RUN_STATUS_PATH = "/api/run-status";
const RUN_SCENARIOS_PATH = "/api/scenarios";
const RUN_TRIGGER_PATH = "/api/run";
const MAP_ASSIGNMENTS_API_PATH = "/api/map-assignments";
const MAP_ASSIGNMENTS_PATH = "./data/map_assignments.json";
const RUN_SERVICE_OFFLINE_MESSAGE =
    "Static preview. Start `tools/local_run_service.py` before generating new numbers, then reload the export.";
const PLAYBACK_HELP_MESSAGE =
    "Play replays loaded years. At the final year, Play starts a fresh local run when the service is available.";
const RUN_SERVICE_OFFLINE_TEXT =
    "Static preview. Start `tools/local_run_service.py` before generating new numbers, then reload the export.";
const PLAYBACK_HELP_TEXT =
    "Play replays loaded years. At the final year, Play starts a fresh local run when the service is available.";
const MAP_VIEWBOX_WIDTH = 780;
const MAP_VIEWBOX_HEIGHT = 520;
const MAP_PADDING = 10;
const EVENT_LETTER_OFFSETS = [
    [0, -16],
    [14, -10],
    [-14, -10],
    [10, 8],
    [-10, 8],
    [0, 16],
];
const BALKAN_CONFIG = window.BALKAN_CONFIG ?? { activeMapCountryCodes: [], plannedMapCountryCodes: [], countries: {} };
const COUNTRY_CONFIG = BALKAN_CONFIG.countries ?? {};
const COUNTRY_NAME_TRANSLATIONS = Object.freeze({
    ALB: { de: "Albanien" },
    BGR: { de: "Bulgarien" },
    BIH: { de: "Bosnien und Herzegowina" },
    GRC: { de: "Griechenland" },
    HRV: { de: "Kroatien" },
    HUN: { de: "Ungarn" },
    MKD: { de: "Nordmazedonien" },
    MNE: { de: "Montenegro" },
    ROU: { de: "Rumänien" },
    SRB: { de: "Serbien" },
    SVN: { de: "Slowenien" },
    XKX: { de: "Kosovo" },
});
const MAP_COUNTRY_CODES = Array.isArray(BALKAN_CONFIG.activeMapCountryCodes)
    ? [...BALKAN_CONFIG.activeMapCountryCodes]
    : ["ALB", "BGR", "BIH", "HRV", "HUN", "MKD", "MNE", "ROU", "SRB"];
const MAP_COUNTRY_LAYER_CODES = [...new Set([...MAP_COUNTRY_CODES, "XKX"])];
const TARGET_COUNTRIES = new Set([...MAP_COUNTRY_CODES, "XKX"]);
const COUNTRY_LABEL_ANCHORS = {
    ALB: [0.50, 0.58],
    BIH: [0.52, 0.52],
    BGR: [0.58, 0.58],
    GRC: [0.53, 0.55],
    HRV: [0.44, 0.30],
    HUN: [0.47, 0.40],
    MKD: [0.48, 0.52],
    MNE: [0.40, 0.56],
    ROU: [0.51, 0.45],
    SRB: [0.53, 0.42],
    SVN: [0.54, 0.48],
};
const COUNTRY_LABEL_OFFSETS = {
    ALB: [-2, 2],
    BGR: [4, 2],
    GRC: [0, -2],
    BIH: [0, 0],
    HRV: [10, -8],
    HUN: [0, 0],
    MKD: [-8, 2],
    MNE: [-8, 2],
    ROU: [0, 0],
    SRB: [-18, -4],
    SVN: [-2, -2],
};
const COUNTRY_LABEL_COORDINATES = {
    // Athens anchor. Greece has many islands, so bounds/centroids place the label too far from the capital.
    GRC: [23.7275, 37.9838],
};
const COUNTRY_LABEL_FEATURE_NAMES = {
    GRC: new Set(["attikis", "attica"]),
};
const VISUAL_REGION_LABEL_OFFSETS = {
    "ALB::central": [0, 2],
    "ALB::north": [0, -2],
    "ALB::south": [0, 10],
    "BIH::fbih": [26, 18],
    "BIH::rs": [-30, -16],
    "HUN::central-hungary": [-12, 0],
    "HUN::transdanubia": [-8, 4],
    "HUN::great-plains": [12, 6],
    "HUN::north-hungary": [0, -8],
    "HRV::zagreb-central": [6, -10],
    "HRV::slavonia": [-12, 6],
    "HRV::dalmatia": [10, 18],
    "HRV::istria-kvarner": [-14, -2],
    "SRB::vojvodina": [0, -4],
    "MKD::skopje": [0, 4],
    "MKD::west": [0, -2],
    "MKD::se": [14, -2],
    "MNE::coastal-region": [-18, 8],
    "MNE::southern-montenegro": [-12, 8],
    "MNE::northern-montenegro": [-2, -2],
    "ROU::bucharest-ilfov": [0, 2],
    "SVN::western": [-10, 0],
    "SVN::eastern": [8, 0],
    "GRC::attica": [6, -4],
    "GRC::macedonia-thrace": [6, -8],
    "GRC::epirus-western-macedonia": [-6, -4],
    "GRC::thessalia-central-greece": [0, 0],
    "GRC::peloponnese-west-greece-ionian": [-10, 8],
    "GRC::crete": [0, 8],
    "GRC::aegean": [12, 4],
    "GRC::agion-oros": [0, -8],
    "SRB::kosovo-metohija": [0, -2],
    "ROU::transylvania-banat": [-6, -6],
    "ROU::moldavia": [10, -6],
    "ROU::wallachia-oltenia": [-26, 8],
    "ROU::dobruja-lower-danube": [10, 12],
};
const VISUAL_REGION_SOURCE_NAME_OVERRIDES = {
    "SRB::sz-srb": "Sumadija and Western Serbia",
};
const VISUAL_REGION_CORRECTIONS = Object.freeze([
    {
        key: "BIH::gorazde-ustipraca-tip",
        visualRegionKey: "BIH::fbih",
        coordinates: [
            [18.936, 43.724],
            [18.982, 43.729],
            [18.973, 43.706],
            [18.947, 43.697],
            [18.936, 43.709],
        ],
    },
]);
const KOSOVO_VISUAL_REGION_KEY = "SRB::kosovo-metohija";
const KOSOVO_VISUAL_REGION_KEYS = new Set([KOSOVO_VISUAL_REGION_KEY]);
const VISUAL_REGION_LABEL_ANCHORS = {
    "ALB::central": [0.50, 0.50],
    "ALB::north": [0.50, 0.38],
    "HUN::central-hungary": [0.50, 0.48],
    "HRV::slavonia": [0.56, 0.50],
    "MKD::west": [0.50, 0.46],
    "MNE::coastal-region": [0.34, 0.74],
    "MNE::southern-montenegro": [0.42, 0.60],
    "MNE::northern-montenegro": [0.50, 0.28],
    "ROU::bucharest-ilfov": [0.50, 0.50],
    "ROU::wallachia-oltenia": [0.40, 0.50],
    "SRB::kosovo-metohija": [0.54, 0.46],
    "SVN::western": [0.44, 0.52],
    "SVN::eastern": [0.58, 0.48],
    "GRC::attica": [0.55, 0.44],
    "GRC::macedonia-thrace": [0.54, 0.48],
    "GRC::epirus-western-macedonia": [0.46, 0.48],
    "GRC::thessalia-central-greece": [0.52, 0.48],
    "GRC::peloponnese-west-greece-ionian": [0.50, 0.54],
    "GRC::crete": [0.50, 0.54],
    "GRC::aegean": [0.55, 0.50],
};
const REGION_LABEL_PRIORITY_BOOST = {
    "ALB::central": 9999,
    "ALB::north": 1300,
    "HUN::central-hungary": 1400,
    "HRV::slavonia": 2200,
    "HRV::zagreb-central": 500,
    "MKD::skopje": 1200,
    "MKD::west": 1050,
    "MKD::se": 2200,
    "MNE::coastal-region": 980,
    "MNE::southern-montenegro": 1600,
    "MNE::northern-montenegro": 980,
    "ROU::bucharest-ilfov": 1400,
    "SRB::kosovo-metohija": 1500,
    "SRB::vojvodina": 1100,
    "SVN::western": 1200,
    "SVN::eastern": 1200,
    "GRC::attica": 1500,
    "GRC::macedonia-thrace": 1250,
    "GRC::thessalia-central-greece": 1100,
    "GRC::peloponnese-west-greece-ionian": 1050,
    "GRC::crete": 1100,
};
const REGION_LABEL_FORCE_SHOW = new Set([
    "ALB::central",
    "ALB::north",
    "HUN::central-hungary",
    "HRV::slavonia",
    "MKD::skopje",
    "MKD::west",
    "MKD::se",
    "MNE::coastal-region",
    "MNE::southern-montenegro",
    "MNE::northern-montenegro",
    "ROU::bucharest-ilfov",
    "SRB::kosovo-metohija",
    "SRB::vojvodina",
    "SVN::western",
    "SVN::eastern",
    "GRC::attica",
    "GRC::macedonia-thrace",
    "GRC::crete",
]);
const REGION_LABEL_ALWAYS_SHORT = new Set([
    "ALB::central",
    "ALB::north",
    "ALB::south",
    "BGR::north",
    "BGR::south",
    "HUN::north-hungary",
    "MNE::coastal-region",
    "MNE::southern-montenegro",
    "MNE::northern-montenegro",
    "SVN::western",
    "SVN::eastern",
    "SRB::kosovo-metohija",
]);
const REGION_LABEL_ALWAYS_COMPACT = new Set([
    "HRV::slavonia",
    "SRB::kosovo-metohija",
]);
const REGION_LABEL_HIDE = new Set();
const VISUAL_REGION_INTERNAL_GUIDES = {
    "SRB::kosovo-metohija": {
        tension: 0.92,
        showLabels: false,
        segments: [
            [[0.48, 0.07], [0.49, 0.22], [0.50, 0.37], [0.51, 0.54], [0.52, 0.74], [0.51, 0.93]],
            [[0.18, 0.34], [0.31, 0.34], [0.48, 0.34], [0.67, 0.33], [0.85, 0.30]],
            [[0.18, 0.61], [0.28, 0.58], [0.39, 0.54], [0.51, 0.52]],
            [[0.52, 0.52], [0.63, 0.56], [0.73, 0.62], [0.83, 0.69]],
        ],
        labels: [
            { text: "Mitrovica", x: 0.34, y: 0.20 },
            { text: "Pec", x: 0.24, y: 0.47 },
            { text: "Prizren", x: 0.30, y: 0.76 },
            { text: "Kosovo", x: 0.63, y: 0.49 },
            { text: "Pomoravlje", x: 0.73, y: 0.74 },
        ],
    },
    "BIH::fbih": {
        tension: 0.84,
        showLabels: false,
        segments: [
            [[0.15, 0.30], [0.28, 0.30], [0.42, 0.29], [0.57, 0.27], [0.78, 0.24]],
            [[0.30, 0.09], [0.30, 0.18], [0.30, 0.30], [0.31, 0.42], [0.31, 0.52]],
            [[0.46, 0.16], [0.46, 0.28], [0.46, 0.40], [0.47, 0.52], [0.48, 0.68]],
            [[0.63, 0.17], [0.63, 0.28], [0.64, 0.40], [0.66, 0.54], [0.69, 0.66]],
            [[0.76, 0.21], [0.78, 0.30], [0.79, 0.39]],
        ],
        labels: [
            { text: "Una", x: 0.16, y: 0.22 },
            { text: "Posavina", x: 0.56, y: 0.12 },
            { text: "Tuzla", x: 0.67, y: 0.34 },
            { text: "Zenica", x: 0.50, y: 0.41 },
            { text: "Gorazde", x: 0.84, y: 0.40 },
            { text: "C Bosnia", x: 0.37, y: 0.57 },
            { text: "Sarajevo", x: 0.62, y: 0.56 },
            { text: "Herz-Ner.", x: 0.56, y: 0.80 },
            { text: "W Herz.", x: 0.38, y: 0.84 },
            { text: "Livno", x: 0.22, y: 0.82 },
        ],
    },
};
const REAL_SUBDIVISION_VISUAL_REGION_KEYS = new Set([
    "BIH::fbih",
    "BIH::rs",
    "GRC::aegean",
    "GRC::epirus-western-macedonia",
    "GRC::macedonia-thrace",
    "GRC::peloponnese-west-greece-ionian",
    "GRC::thessalia-central-greece",
    "SVN::eastern",
    "SVN::western",
    "SRB::kosovo-metohija",
]);
const REGION_MAP_SOURCE_NOTE =
    "Region view mixes real ADM1 borders with coarse grouped macroregions where necessary.";
const REGION_MAP_LIMITATION_NOTE =
    "Kosovo uses one shared region fill with real ADM1 district underlines. Bosnia uses real ADM2 cantons in FBiH and real ADM3 municipal inner lines inside RS. Greece uses real ADM2 underlines, and Slovenia uses real NUTS3 underlines inside its macroregions. Brcko is folded into the RS display scope. Some small display areas are split visually from a larger export row, so their deltas are estimated shares rather than separately simulated runs.";
const REGION_LABEL_SHORT = {
    "ALB::central": "C ALB",
    "ALB::north": "N ALB",
    "ALB::south": "S ALB",
    "BGR::black-sea": "Black Sea",
    "BGR::north": "N BUL",
    "BGR::south": "S BUL",
    "HUN::central-hungary": "Budapest",
    "HUN::great-plains": "Great Plains",
    "HUN::north-hungary": "N HUN",
    "HUN::transdanubia": "Transdanubia",
    "HRV::zagreb-central": "C HRV",
    "HRV::istria-kvarner": "Istrija",
    "HRV::slavonia": "Slavonija",
    "HRV::dalmatia": "Dalmacija",
    "MKD::se": "E MAC",
    "MKD::west": "W MAC",
    "MNE::coastal-region": "CS MON",
    "MNE::southern-montenegro": "S MON",
    "MNE::northern-montenegro": "N MON",
    "ROU::bucharest-ilfov": "Bucharest",
    "ROU::transylvania-banat": "Transylvania",
    "ROU::wallachia-oltenia": "Wallachia",
    "ROU::dobruja-lower-danube": "Dobruja",
    "SRB::ji-srb": "JI SRB",
    "SRB::kosovo-metohija": "Kosovo",
    "SRB::sz-srb": "SZ SRB",
};
const REGION_LABEL_TRANSLATIONS = {
    "ALB::central": { en: { short: "C ALB", long: "Central Albania" }, de: { short: "M ALB", long: "Mittelalbanien" } },
    "ALB::north": { en: { short: "N ALB", long: "Northern Albania" }, de: { short: "N ALB", long: "Nordalbanien" } },
    "ALB::south": { en: { short: "S ALB", long: "Southern Albania" }, de: { short: "S ALB", long: "Südalbanien" } },
    "BGR::black-sea": { en: { short: "Black Sea", long: "Black Sea Bulgaria" }, de: { short: "Schwarzes Meer", long: "Schwarzmeer-Bulgarien" } },
    "BGR::north": { en: { short: "N BUL", long: "Northern Bulgaria" }, de: { short: "N BUL", long: "Nordbulgarien" } },
    "BGR::sofia": { en: { short: "Sofia", long: "Sofia" }, de: { short: "Sofia", long: "Sofia" } },
    "BGR::south": { en: { short: "S BUL", long: "Southern Bulgaria" }, de: { short: "S BUL", long: "Südbulgarien" } },
    "BIH::fbih": { en: { short: "FBiH", long: "Federation of Bosnia and Herzegovina" }, de: { short: "FBiH", long: "Föderation Bosnien und Herzegowina" } },
    "BIH::rs": { en: { short: "RS", long: "Republika Srpska" }, de: { short: "RS", long: "Republika Srpska" } },
    "HUN::central-hungary": { en: { short: "Budapest", long: "Budapest" }, de: { short: "Budapest", long: "Budapest" } },
    "HUN::great-plains": { en: { short: "Great Plains", long: "Great Plains" }, de: { short: "Grosse Tiefebene", long: "Grosse Tiefebene" } },
    "HUN::north-hungary": { en: { short: "N HUN", long: "Northern Hungary" }, de: { short: "N HUN", long: "Nordungarn" } },
    "HUN::transdanubia": { en: { short: "Transdanubia", long: "Transdanubia" }, de: { short: "Transdanubien", long: "Transdanubien" } },
    "HRV::zagreb-central": { en: { short: "C HRV", long: "Central Croatia" }, de: { short: "M HRV", long: "Mittelkroatien" } },
    "HRV::istria-kvarner": { en: { short: "Istria", long: "Istria and Kvarner" }, de: { short: "Istrien", long: "Istrien und Kvarner" } },
    "HRV::slavonia": { en: { short: "Slavonia", long: "Slavonia" }, de: { short: "Slawonien", long: "Slawonien" } },
    "HRV::dalmatia": { en: { short: "Dalmatia", long: "Dalmatia" }, de: { short: "Dalmatien", long: "Dalmatien" } },
    "MKD::se": { en: { short: "E MAC", long: "Eastern Macedonia" }, de: { short: "O MAC", long: "Ostmazedonien" } },
    "MKD::skopje": { en: { short: "Skopje", long: "Skopje" }, de: { short: "Skopje", long: "Skopje" } },
    "MKD::west": { en: { short: "W MAC", long: "Western Macedonia" }, de: { short: "W MAC", long: "Westmazedonien" } },
    "MNE::coastal-region": { en: { short: "CS MON", long: "Coastal Montenegro" }, de: { short: "K MON", long: "Küstenmontenegro" } },
    "MNE::southern-montenegro": { en: { short: "S MON", long: "Southern Montenegro" }, de: { short: "S MON", long: "Südmontenegro" } },
    "MNE::northern-montenegro": { en: { short: "N MON", long: "Northern Montenegro" }, de: { short: "N MON", long: "Nordmontenegro" } },
    "ROU::bucharest-ilfov": { en: { short: "Bucharest", long: "Bucharest-Ilfov" }, de: { short: "Bukarest", long: "Bukarest-Ilfov" } },
    "ROU::moldavia": { en: { short: "Moldavia", long: "Moldavia" }, de: { short: "Moldau", long: "Moldau" } },
    "ROU::transylvania-banat": { en: { short: "Transylvania", long: "Transylvania and Banat" }, de: { short: "Siebenbürgen", long: "Siebenbürgen und Banat" } },
    "ROU::wallachia-oltenia": { en: { short: "Wallachia", long: "Wallachia and Oltenia" }, de: { short: "Walachei", long: "Walachei und Oltenien" } },
    "ROU::dobruja-lower-danube": { en: { short: "Dobruja", long: "Dobruja and Lower Danube" }, de: { short: "Dobrudscha", long: "Dobrudscha und untere Donau" } },
    "SRB::belgrade": { en: { short: "Belgrade", long: "Belgrade" }, de: { short: "Belgrad", long: "Belgrad" } },
    "SRB::ji-srb": { en: { short: "SE SRB", long: "Southeastern Serbia" }, de: { short: "SO SRB", long: "Südostserbien" } },
    "SRB::kosovo-metohija": { en: { short: "Kosovo", long: "Kosovo" }, de: { short: "Kosovo", long: "Kosovo" } },
    "SRB::sz-srb": { en: { short: "SW SRB", long: "Southwestern Serbia" }, de: { short: "SW SRB", long: "Südwestserbien" } },
    "SRB::vojvodina": { en: { short: "Vojvodina", long: "Vojvodina" }, de: { short: "Wojwodina", long: "Wojwodina" } },
    "SVN::western": { en: { short: "W SVN", long: "Western Slovenia" }, de: { short: "W SVN", long: "Westslowenien" } },
    "SVN::eastern": { en: { short: "E SVN", long: "Eastern Slovenia" }, de: { short: "O SVN", long: "Ostslowenien" } },
    "GRC::attica": { en: { short: "Attica", long: "Attica" }, de: { short: "Attika", long: "Attika" } },
    "GRC::macedonia-thrace": { en: { short: "Macedonia-Thrace", long: "Macedonia-Thrace" }, de: { short: "Makedonien-Thrakien", long: "Makedonien-Thrakien" } },
    "GRC::epirus-western-macedonia": { en: { short: "Epirus-W. Mac.", long: "Epirus-Western Macedonia" }, de: { short: "Epirus-W. Mak.", long: "Epirus-Westmakedonien" } },
    "GRC::thessalia-central-greece": { en: { short: "Thessaly-C. Greece", long: "Thessaly-Central Greece" }, de: { short: "Thessalien-M. GR", long: "Thessalien-Mittelgriechenland" } },
    "GRC::peloponnese-west-greece-ionian": { en: { short: "Peloponnese", long: "Peloponnese-West Greece-Ionian" }, de: { short: "Peloponnes", long: "Peloponnes-Westgriechenland-Ionische Inseln" } },
    "GRC::crete": { en: { short: "Crete", long: "Crete" }, de: { short: "Kreta", long: "Kreta" } },
    "GRC::aegean": { en: { short: "Aegean", long: "Aegean" }, de: { short: "Ägäis", long: "Ägäis" } },
    "GRC::agion-oros": { en: { short: "Athos", long: "Mount Athos" }, de: { short: "Athos", long: "Athos" } },
};
const COUNTRY_FLAGS = Object.fromEntries(
    Object.entries(COUNTRY_CONFIG).map(([code, entry]) => [code, entry.flag ?? "\uD83C\uDFF3\uFE0F"])
);
const COUNTRY_DISPLAY_CODES = Object.fromEntries(
    Object.entries(COUNTRY_CONFIG)
        .filter(([, entry]) => entry.displayCode)
        .map(([code, entry]) => [code, entry.displayCode])
);
const BASE_PLAYBACK_INTERVAL_MS = 1400;
const DEFAULT_FILL = "rgba(127, 150, 173, 0.50)";
const ADM1_PROVINCE_VIEW_COUNTRIES = new Set();
const ADM1_PROVINCE_PALETTES = {
    ALB: ["#856d57", "#947b61", "#a38a6b", "#b39a78", "#c3ab86", "#d3bc95"],
    BGR: ["#597855", "#688861", "#77996d", "#89ab7b", "#9abd8a", "#afcf9a"],
    HUN: ["#5a6980", "#69798f", "#77889e", "#8897ad", "#99a8bd", "#acbbcf"],
};
const METRIC_VIEWS = {
    classic: {
        label: "Standard",
        labelEn: "Standard",
        labelDe: "Standard",
        buttonLabel: "\uD83D\uDDFA\uFE0F Std.",
        buttonLabelEn: "\uD83D\uDDFA\uFE0F Std.",
        buttonLabelDe: "\uD83D\uDDFA\uFE0F Std.",
        colorLow: [0, 0, 0],
        colorHigh: [0, 0, 0],
    },
    population: {
        label: "Population",
        labelEn: "Population",
        labelDe: "Einwohner",
        buttonLabel: "\uD83D\uDC65 Pop.",
        buttonLabelEn: "\uD83D\uDC65 Pop.",
        buttonLabelDe: "\uD83D\uDC65 Einw.",
        colorLow: [188, 210, 236],
        colorHigh: [34, 73, 122],
    },
    gdp_per_capita: {
        label: "GDP per cap.",
        labelEn: "GDP per cap.",
        labelDe: "BIP pro Kopf",
        buttonLabel: "\uD83D\uDCB6 GDP/c.",
        buttonLabelEn: "\uD83D\uDCB6 GDP/c.",
        buttonLabelDe: "\uD83D\uDCB6 BIP/K.",
        colorLow: [233, 219, 176],
        colorHigh: [130, 93, 36],
    },
    unemployment: {
        label: "Unemployment",
        labelEn: "Unemployment",
        labelDe: "Arbeitslosigkeit",
        buttonLabel: "\uD83E\uDDF0 Jobs",
        buttonLabelEn: "\uD83E\uDDF0 Jobs",
        buttonLabelDe: "\uD83E\uDDF0 Jobs",
        colorLow: [234, 198, 190],
        colorHigh: [138, 57, 47],
    },
    attractiveness: {
        label: "Attractiveness",
        labelEn: "Attractiveness",
        labelDe: "Attraktivität",
        buttonLabel: "\u2728 Attr.",
        buttonLabelEn: "\u2728 Attr.",
        buttonLabelDe: "\u2728 Attr.",
        colorLow: [175, 224, 207],
        colorHigh: [31, 112, 92],
    },
    integration: {
        label: "Integration",
        labelEn: "Integration",
        labelDe: "Integration",
        buttonLabel: "\uD83E\uDD1D Int.",
        buttonLabelEn: "\uD83E\uDD1D Int.",
        buttonLabelDe: "\uD83E\uDD1D Int.",
        colorLow: [210, 214, 186],
        colorHigh: [58, 132, 124],
    },
    corruption: {
        label: "Corruption risk",
        labelEn: "Corruption risk",
        labelDe: "Korruptionsrisiko",
        buttonLabel: "\u2696\uFE0F Corr.",
        buttonLabelEn: "\u2696\uFE0F Corr.",
        buttonLabelDe: "\u2696\uFE0F Korr.",
        colorLow: [190, 226, 186],
        colorHigh: [151, 80, 64],
    },
    inflation: {
        label: "Inflation / Deflation",
        labelEn: "Inflation / Deflation",
        labelDe: "Inflation / Deflation",
        buttonLabel: "\u2195\uFE0F Prices",
        buttonLabelEn: "\u2195\uFE0F Prices",
        buttonLabelDe: "\u2195\uFE0F Preise",
        colorLow: [118, 167, 212],
        colorHigh: [182, 78, 64],
    },
    debt: {
        label: "Debt ratio",
        labelEn: "Debt ratio",
        labelDe: "Schuldenquote",
        buttonLabel: "\uD83C\uDFE6 Debt",
        buttonLabelEn: "\uD83C\uDFE6 Debt",
        buttonLabelDe: "\uD83C\uDFE6 Schuld.",
        colorLow: [184, 214, 198],
        colorHigh: [153, 77, 64],
    },
    satisfaction: {
        label: "Satisfaction",
        labelEn: "Satisfaction",
        labelDe: "Zufriedenheit",
        buttonLabel: "\uD83D\uDE42 Sat.",
        buttonLabelEn: "\uD83D\uDE42 Sat.",
        buttonLabelDe: "\uD83D\uDE42 Zufr.",
        colorLow: [143, 112, 79],
        colorHigh: [212, 190, 102],
    },
    elections: {
        label: "Elections",
        labelEn: "Elections",
        labelDe: "Wahlen",
        buttonLabel: "\uD83C\uDFDB\uFE0F Vote",
        buttonLabelEn: "\uD83C\uDFDB\uFE0F Vote",
        buttonLabelDe: "\uD83C\uDFDB\uFE0F Wahl",
        colorLow: [148, 167, 192],
        colorHigh: [144, 84, 140],
    },
};
const I18N = {
    en: {
        "hero.lead": "Calibrated Balkan simulation to 2074 with multiple runs, political dynamics, rarer regional events, and an integrated border mode.",
        "map.kicker": "Map",
        "timeline.year": "Year",
        "mode.countries": "Countries",
        "mode.regions": "Regions",
        "mode.borders": "Borders",
        "panel.summary": "Summary",
        "panel.details": "Details",
        "border.mode": "Border mode",
        "border.annexer": "Annexing country",
        "border.assignment": "Assignment",
        "action.annex": "Annex",
        "action.reset": "Reset",
        "action.save": "Save",
        "scope.countries": "Countries",
        "scope.regions": "Regions",
        "hint.country": "Hover over a country.",
        "hint.region": "Hover over a region.",
        "hint.area": "Hover over an area.",
        "hint.event": "Click a letter to read an event.",
        "event.title": "Event letter",
        "event.year": "Year",
        "event.regions": "Affected regions",
        "event.effects": "Model effect",
        "event.description": "Description",
        "event.countryWide": "Country-wide",
        "status.noYear": "No year loaded",
        "status.waiting": "Waiting for data",
        "status.reload": "Reload Export",
        "status.reloading": "Reloading...",
        "status.run": "Generate Runs",
        "status.newRun": "New run",
        "status.running": "Running...",
        "status.on": "on",
        "status.off": "off",
        "status.shocksOn": "shocks on",
        "status.shocksOff": "shocks off",
        "status.unknownScenario": "unknown scenario",
        "status.unknownYear": "unknown",
        "status.noSeed": "no seed",
        "status.shockEvents": "shock events",
        "status.batchPrepared": "Batch mode prepared for {count} runs.",
        "status.singleRun": "Single run active.",
        "status.spreadVisible": "spread visible",
        "status.noSpread": "no visible spread yet",
        "status.latestBatch": "Latest batch: {count} runs, population {populationMin}-{populationMax}, GDP {gdpMin}-{gdpMax} bn EUR, unemployment {unemploymentMin}-{unemploymentMax}, {seedCount} Seed(s), {spread}.",
        "status.generating": "Generating {runCount} {scenario} run(s) ({shocks}) ... {completed}/{runCount} complete.",
        "status.runFailed": "Local run failed.",
        "status.batchReady": "The latest {scenario} batch is ready ({runCount} run(s), {shocks}).",
        "status.startNewResult": "Starting new result run ...",
        "status.startLocalRuns": "Starting {runCount} local simulation run(s) ...",
        "status.runStartFailed": "Local run could not be started.",
        "status.serviceLost": "Connection to the local run service was lost. Restart the service and try again.",
        "status.loadingExport": "Loading latest export ...",
        "status.reloadingExport": "Reloading latest export ...",
        "status.exportLoaded": "Export loaded. {summary}. Years and map views are now available.",
        "status.exportReloaded": "Export reloaded. {summary}. Years and map views are now available.",
        "status.exportLoadedStatic": "Export loaded. {summary}. Without the local service, scenario and shocks stay unchanged.",
        "status.exportReloadedStatic": "Export reloaded. {summary}. Without the local service, scenario and shocks stay unchanged.",
        "status.exportLoadFailed": "Latest export could not be loaded. Reload under Advanced or start new runs.",
        "status.exportLoadFailedDetail": "Latest export could not be loaded. Start the local service in the project root, then reload.",
        "status.invalidExport": "Invalid BESP2074 export structure",
        "theme.light": "Light",
        "theme.dark": "Dark",
        "theme.switchLight": "Switch to light mode",
        "theme.switchDark": "Switch to dark mode",
        "meta.selectedYear": "Selected year",
        "meta.startYear": "Start year",
        "meta.endYear": "End year",
        "meta.scenario": "Scenario",
        "meta.seed": "Seed",
        "meta.shocks": "Shocks",
        "meta.shockEvents": "Shock events",
        "meta.countryRows": "Country rows",
        "meta.regionRows": "Region rows",
        "meta.yearBlocks": "Year blocks",
        "meta.warnings": "Warnings",
        "meta.mapBase": "Map base",
        "meta.expansion": "Expansion",
        "meta.note": "Note",
        "meta.expansionActive": "SVN and GRC active",
        "state.budget": "Ø Budget balance",
        "state.debt": "Ø Debt ratio",
        "state.stability": "Ø Stability",
        "state.corruption": "Ø Corruption risk",
        "state.investment": "Ø Investment climate",
        "metric.population": "Population",
        "metric.gdp": "GDP",
        "metric.jobs": "Jobs",
        "metric.growth": "Growth",
        "metric.current": "Current",
        "metric.previous": "Previous year",
        "metric.change": "Change",
        "metric.direction": "Direction",
        "metric.rate": "Rate",
        "metric.noPrevious": "no previous year",
        "metric.points": "pts",
        "metric.noData": "No data",
        "metric.noExportCountry": "No matching country row in export.",
        "metric.year": "Year",
        "election.tendency": "Tendency",
        "election.leftRight": "Left/Right",
        "election.last": "Last election",
        "election.next": "Next election",
        "election.sinceLast": "Since last election",
        "election.beforeSimulation": "Election before simulation start",
        "election.noComparison": "no comparison election",
        "election.thisYear": "An election was held this year.",
        "election.strongLeft": "Strong left",
        "election.centerLeft": "Centre-left",
        "election.center": "Centred",
        "election.centerRight": "Centre-right",
        "election.strongRight": "Strong right",
        "election.shortCenter": "↔ Centre",
        "election.noShift": "little movement",
        "election.shiftRight": "↗ shifted right",
        "election.shiftLeft": "↙ shifted left",
        "election.sameBand": "same base tendency",
        "election.stepRight": "step(s) right",
        "election.stepLeft": "step(s) left",
        "trend.noPrevious": "No previous-year comparison available.",
        "trend.politicalStable": "The political base tendency remains similar.",
        "trend.politicalRight": "The political tendency shifts right.",
        "trend.politicalLeft": "The political tendency shifts left.",
        "trend.small": "The year-on-year change remains small.",
        "trend.positive": "The development versus the previous year is positive.",
        "trend.negative": "The development versus the previous year is negative.",
        "editor.noSelection": "No area selected",
        "editor.chooseCountry": "Choose a country, then annex a region.",
        "editor.off": "Border mode off.",
        "editor.countryHint": "Click a visible country.",
        "editor.regionHint": "Click or right-click a visible region.",
        "editor.noTargetCountry": "No target country selected",
        "editor.rightClickCountry": "Right-click a country, then choose it as target.",
        "editor.targetAnnexes": "{country} annexes",
        "editor.rightClickForeignRegion": "Right-click a foreign region and annex it.",
        "editor.areaAlreadyOwned": "{country} already owns this area.",
        "editor.subareasGoTo": "{count} subareas go to {country}.",
        "editor.startServiceToSave": "Start the local run service before saving.",
        "editor.targetMissing": "Target country missing. Right-click a country and choose it.",
        "editor.areaAlreadyTarget": "Area already belongs to this country.",
        "editor.countryAnnexesRegion": "{country} annexes {region}.",
        "editor.regionAnnexPrompt": "{country} annexes. Right-click a foreign region.",
        "editor.countryCannotAnnex": "This country cannot annex in border mode.",
        "editor.switchRegionHint": "Switch to regions and click a foreign region.",
        "editor.takeRegionHint": "Annex saves the region locally for the selected country.",
        "editor.showRegions": "Show regions",
        "editor.chooseTargetCountry": "Choose target country",
        "editor.targetCountryChosen": "Target country selected",
        "editor.chooseTargetTitle": "Choose target country",
        "editor.chooseTargetHint": "Right-click a country and choose it as target.",
        "editor.countryAsTarget": "{country} is target. Right-click a region and annex it.",
        "editor.regionCannotAnnex": "This region cannot be annexed.",
        "editor.chooseTargetFirst": "Choose a target country first.",
        "editor.alreadyTargetCountry": "This country is already the target.",
        "editor.noAnnexableRegions": "No annexable regions found for this country.",
        "editor.countryAttached": "{source} was locally attached to {target}.",
        "editor.countryAnnexedTitle": "{source} annexed",
        "editor.countryAnnexedBody": "{target} takes the country; regions remain visible.",
        "editor.noExportCountry": "No matching country row found for this map area.",
        "editor.noExportArea": "No matching export row found for region or country.",
        "editor.noRegionData": "No assigned BESP2074 data",
        "editor.noRegionRows": "No region data",
        "editor.loadRegions": "Load an export to render the region map.",
        "editor.localAssignmentSaved": "Assignment applied locally. Save to persist it.",
        "editor.noAreaSelected": "No area selected.",
        "editor.resetDone": "Overrides reset for the selected area.",
        "editor.saveAssignmentsFirst": "Start `py tools/local_run_service.py` before saving.",
        "editor.savingAssignments": "Saving border assignments...",
        "editor.assignmentsSaved": "Border assignments saved.",
        "editor.assignmentFailed": "Assignment failed: {message}",
        "editor.resetFailed": "Reset failed: {message}",
        "editor.saveFailed": "Save failed: {message}",
        "error.unknown": "Unknown error",
    },
    de: {
        "hero.lead": "Kalibrierte Balkan-Simulation bis 2074 mit mehreren Runs, politischer Dynamik, selteneren regionalen Ereignissen und integriertem Grenzmodus.",
        "map.kicker": "Karte",
        "timeline.year": "Jahr",
        "mode.countries": "Länder",
        "mode.regions": "Regionen",
        "mode.borders": "Grenzen",
        "panel.summary": "Übersicht",
        "panel.details": "Details",
        "border.mode": "Grenzmodus",
        "border.annexer": "Übernehmendes Land",
        "border.assignment": "Zuordnung",
        "action.annex": "Übernehmen",
        "action.reset": "Zurücksetzen",
        "action.save": "Speichern",
        "scope.countries": "Länder",
        "scope.regions": "Regionen",
        "hint.country": "Über ein Land fahren.",
        "hint.region": "Über eine Region fahren.",
        "hint.area": "Über eine Fläche fahren.",
        "hint.event": "Brief anklicken, um ein Ereignis zu lesen.",
        "event.title": "Ereignisbrief",
        "event.year": "Jahr",
        "event.regions": "Betroffene Regionen",
        "event.effects": "Modellwirkung",
        "event.description": "Beschreibung",
        "event.countryWide": "Landesweit",
        "status.noYear": "Kein Jahr geladen",
        "status.waiting": "Warte auf Daten",
        "status.reload": "Export neu laden",
        "status.reloading": "Lade neu...",
        "status.run": "Runs starten",
        "status.newRun": "Neuer Run",
        "status.running": "Läuft...",
        "status.on": "ein",
        "status.off": "aus",
        "status.shocksOn": "Schocks ein",
        "status.shocksOff": "Schocks aus",
        "status.unknownScenario": "unbekanntes Szenario",
        "status.unknownYear": "unbekannt",
        "status.noSeed": "kein Seed",
        "status.shockEvents": "Schock-Ereignisse",
        "status.batchPrepared": "Batch-Modus für {count} Runs vorbereitet.",
        "status.singleRun": "Einzelner Run aktiv.",
        "status.spreadVisible": "Streuung sichtbar",
        "status.noSpread": "noch keine sichtbare Streuung",
        "status.latestBatch": "Letzte Batch: {count} Runs, Bevölkerung {populationMin}-{populationMax}, BIP {gdpMin}-{gdpMax} Mrd. EUR, Arbeitslosigkeit {unemploymentMin}-{unemploymentMax}, {seedCount} Seed(s), {spread}.",
        "status.generating": "Erzeuge {runCount} {scenario}-Run(s) ({shocks}) ... {completed}/{runCount} fertig.",
        "status.runFailed": "Lokaler Run fehlgeschlagen.",
        "status.batchReady": "Die letzte {scenario}-Batch ist bereit ({runCount} Run(s), {shocks}).",
        "status.startNewResult": "Starte neuen Ergebnisrun ...",
        "status.startLocalRuns": "Starte {runCount} lokale Simulationsrun(s) ...",
        "status.runStartFailed": "Lokaler Run konnte nicht gestartet werden.",
        "status.serviceLost": "Verbindung zum lokalen Run-Service verloren. Bitte Service neu starten und erneut versuchen.",
        "status.loadingExport": "Lade neuesten Export ...",
        "status.reloadingExport": "Lade neuesten Export neu ...",
        "status.exportLoaded": "Export geladen. {summary}. Jahre und Kartenansichten sind jetzt verfügbar.",
        "status.exportReloaded": "Export neu geladen. {summary}. Jahre und Kartenansichten sind jetzt verfügbar.",
        "status.exportLoadedStatic": "Export geladen. {summary}. Ohne lokalen Service bleiben Szenario und Schocks unverändert.",
        "status.exportReloadedStatic": "Export neu geladen. {summary}. Ohne lokalen Service bleiben Szenario und Schocks unverändert.",
        "status.exportLoadFailed": "Der neueste Export konnte nicht geladen werden. Unter Erweitert neu laden oder neue Runs starten.",
        "status.exportLoadFailedDetail": "Der neueste Export konnte nicht geladen werden. Starte den lokalen Service im Projektordner und lade danach neu.",
        "status.invalidExport": "Ungültige BESP2074-Exportstruktur",
        "theme.light": "Hell",
        "theme.dark": "Dunkel",
        "theme.switchLight": "Zu Hellmodus wechseln",
        "theme.switchDark": "Zu Dunkelmodus wechseln",
        "meta.selectedYear": "Ausgewähltes Jahr",
        "meta.startYear": "Startjahr",
        "meta.endYear": "Endjahr",
        "meta.scenario": "Szenario",
        "meta.seed": "Seed",
        "meta.shocks": "Schocks",
        "meta.shockEvents": "Schock-Ereignisse",
        "meta.countryRows": "Ländereinträge",
        "meta.regionRows": "Regionseinträge",
        "meta.yearBlocks": "Jahresblöcke",
        "meta.warnings": "Warnungen",
        "meta.mapBase": "Kartengrundlage",
        "meta.expansion": "Erweiterung",
        "meta.note": "Hinweis",
        "meta.expansionActive": "SVN und GRC aktiv",
        "state.budget": "Ø Budgetsaldo",
        "state.debt": "Ø Schuldenquote",
        "state.stability": "Ø Stabilität",
        "state.corruption": "Ø Korruptionsrisiko",
        "state.investment": "Ø Investklima",
        "metric.population": "Einwohner",
        "metric.gdp": "BIP",
        "metric.jobs": "Jobs",
        "metric.growth": "Wachstum",
        "metric.current": "Aktuell",
        "metric.previous": "Vorjahr",
        "metric.change": "Änderung",
        "metric.direction": "Richtung",
        "metric.rate": "Rate",
        "metric.noPrevious": "kein Vorjahr",
        "metric.points": "Punkte",
        "metric.noData": "Keine Daten",
        "metric.noExportCountry": "Kein passender Ländereintrag im Export.",
        "metric.year": "Jahr",
        "election.tendency": "Tendenz",
        "election.leftRight": "Links/Rechts",
        "election.last": "Letzte Wahl",
        "election.next": "Nächste Wahl",
        "election.sinceLast": "Seit letzter Wahl",
        "election.beforeSimulation": "Wahl vor Simulationsbeginn",
        "election.noComparison": "keine Vergleichswahl",
        "election.thisYear": "In diesem Jahr fand eine Wahl statt.",
        "election.strongLeft": "Stark links",
        "election.centerLeft": "Mitte-links",
        "election.center": "Zentriert",
        "election.centerRight": "Mitte-rechts",
        "election.strongRight": "Stark rechts",
        "election.shortCenter": "↔ Mitte",
        "election.noShift": "kaum Verschiebung",
        "election.shiftRight": "↗ nach rechts verschoben",
        "election.shiftLeft": "↙ nach links verschoben",
        "election.sameBand": "gleiche Grundtendenz",
        "election.stepRight": "Stufe(n) nach rechts",
        "election.stepLeft": "Stufe(n) nach links",
        "trend.noPrevious": "Kein Vorjahresvergleich verfügbar.",
        "trend.politicalStable": "Die politische Grundtendenz bleibt ähnlich.",
        "trend.politicalRight": "Die politische Tendenz verschiebt sich nach rechts.",
        "trend.politicalLeft": "Die politische Tendenz verschiebt sich nach links.",
        "trend.small": "Die Veränderung gegenüber dem Vorjahr bleibt klein.",
        "trend.positive": "Die Entwicklung gegenüber dem Vorjahr ist positiv.",
        "trend.negative": "Die Entwicklung gegenüber dem Vorjahr ist negativ.",
        "editor.noSelection": "Kein Gebiet gewählt",
        "editor.chooseCountry": "Land wählen, dann eine Region übernehmen.",
        "editor.off": "Grenzmodus aus.",
        "editor.countryHint": "Ein sichtbares Land anklicken.",
        "editor.regionHint": "Eine sichtbare Region anklicken oder rechtsklicken.",
        "editor.noTargetCountry": "Kein Zielland gewählt",
        "editor.rightClickCountry": "Rechtsklick auf ein Land, dann Land auswählen.",
        "editor.targetAnnexes": "{country} übernimmt",
        "editor.rightClickForeignRegion": "Fremde Region rechtsklicken und annektieren.",
        "editor.areaAlreadyOwned": "{country} besitzt dieses Gebiet bereits.",
        "editor.subareasGoTo": "{count} Teilflächen gehen an {country}.",
        "editor.startServiceToSave": "Zum Speichern zuerst den lokalen Run-Service starten.",
        "editor.targetMissing": "Zielland fehlt. Land rechtsklicken und auswählen.",
        "editor.areaAlreadyTarget": "Gebiet gehört bereits zu diesem Land.",
        "editor.countryAnnexesRegion": "{country} übernimmt {region}.",
        "editor.regionAnnexPrompt": "{country} übernimmt. Fremde Region rechtsklicken.",
        "editor.countryCannotAnnex": "Dieses Land kann im Grenzmodus nicht übernehmen.",
        "editor.switchRegionHint": "In die Regionenansicht wechseln und eine fremde Region anklicken.",
        "editor.takeRegionHint": "Übernehmen speichert die Region beim gewählten Land lokal vor.",
        "editor.showRegions": "Regionen anzeigen",
        "editor.chooseTargetCountry": "Land auswählen",
        "editor.targetCountryChosen": "Zielland ist gewählt",
        "editor.chooseTargetTitle": "Zielland wählen",
        "editor.chooseTargetHint": "Land rechtsklicken und Land auswählen.",
        "editor.countryAsTarget": "{country} ist Zielland. Region rechtsklicken und annektieren.",
        "editor.regionCannotAnnex": "Diese Region kann nicht übernommen werden.",
        "editor.chooseTargetFirst": "Zuerst ein Zielland wählen.",
        "editor.alreadyTargetCountry": "Dieses Land ist bereits das Zielland.",
        "editor.noAnnexableRegions": "Für dieses Land wurden keine übernehmbaren Regionen gefunden.",
        "editor.countryAttached": "{source} wurde lokal an {target} angegliedert.",
        "editor.countryAnnexedTitle": "{source} annektiert",
        "editor.countryAnnexedBody": "{target} übernimmt das Land; die Regionen bleiben als eigene Regionen sichtbar.",
        "editor.noExportCountry": "Kein passender Landeseintrag für diese Kartenfläche gefunden.",
        "editor.noExportArea": "Kein passender Exporteintrag für Region oder Land gefunden.",
        "editor.noRegionData": "Keine zugeordneten BESP2074-Daten",
        "editor.noRegionRows": "Keine Regionsdaten",
        "editor.loadRegions": "Lade einen Export, um die Regionenkarte zu rendern.",
        "editor.localAssignmentSaved": "Zuordnung lokal übernommen. Mit Speichern dauerhaft sichern.",
        "editor.noAreaSelected": "Kein Gebiet ausgewählt.",
        "editor.resetDone": "Overrides für das gewählte Gebiet zurückgesetzt.",
        "editor.saveAssignmentsFirst": "Zum Speichern zuerst `py tools/local_run_service.py` starten.",
        "editor.savingAssignments": "Speichere Grenzzuweisungen...",
        "editor.assignmentsSaved": "Grenzzuweisungen gespeichert.",
        "editor.assignmentFailed": "Zuordnung fehlgeschlagen: {message}",
        "editor.resetFailed": "Zurücksetzen fehlgeschlagen: {message}",
        "editor.saveFailed": "Speichern fehlgeschlagen: {message}",
        "error.unknown": "Unbekannter Fehler",
    },
};
const GEOJSON_PATHS = {
    country: MAP_COUNTRY_LAYER_CODES.map(
        (code) => `./data/geoBoundaries-${code}-ADM0_simplified.geojson`
    ),
    region: [
        ...MAP_COUNTRY_CODES.filter((code) => code !== "BIH" && code !== "GRC" && code !== "SVN").map(
            (code) => `./data/geoBoundaries-${code}-ADM1_simplified.geojson`
        ),
        "./data/geoBoundaries-BIH-ADM1_simplified.geojson",
        "./data/geoBoundaries-BIH-ADM2_simplified.geojson",
        "./data/geoBoundaries-BIH-ADM3_simplified.geojson",
        "./data/geoBoundaries-GRC-ADM2_simplified.geojson",
        "./data/geoBoundaries-SVN-ADM1_simplified.geojson",
        "./data/gisco-SVN-NUTS3-2021_simplified.geojson",
        "./data/geoBoundaries-XKX-ADM1_simplified.geojson",
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
    ["budapest", "budapest"], ["bucharest ilfov", "bucharest ilfov"],
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
    "MKD::southeastern north macedonia": ["east", "northeast", "southeast", "pelagonia", "vardar"],
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
const REGION_GROUP_OVERRIDES = {
    "ALB::tirana": ["tirane"],
    "ALB::northern albania": ["shkoder", "kukes", "lezhe", "diber"],
    "ALB::central coast albania": ["durres", "elbasan", "fier", "berat"],
    "ALB::southern albania": ["vlore", "gjirokaster", "korce"],
    "HRV::zagreb and central croatia": [
        "city of zagreb", "zagreb county", "krapina zagorje", "varazdin",
        "me imurje", "bjelovar bilogora", "koprivnica krizevci",
        "sisak moslavina", "karlovac",
    ],
    "HRV::slavonia": [
        "brod posavina", "osijek baranja", "pozega slavonia",
        "virovitica podravina", "vukovar syrmia",
    ],
    "HRV::dalmatia": [
        "zadar county", "sibenik knin", "split dalmatia", "dubrovnik neretva", "lika senj",
    ],
    "HRV::istria and kvarner": ["istria", "primorje gorski kotar"],
    "HUN::central hungary": ["budapest", "pest"],
    "HUN::transdanubia": [
        "gyor moson sopron", "vas", "zala",
        "fejer", "komarom esztergom", "veszprem",
        "somogy", "tolna", "baranya",
    ],
    "HUN::northern hungary": [
        "borsod abauj zemplen", "heves", "nograd",
    ],
    "HUN::great plains": [
        "hajdu bihar", "szabolcs szatmar bereg", "jasz nagykun szolnok",
        "bacs kiskun", "bekes", "csongrad csanad",
    ],
    "ROU::bucharest ilfov": ["bucuresti", "ilfov"],
    "ROU::transylvania and banat": [
        "alba", "arad", "bihor", "bistrita nasaud", "brasov", "caras severin",
        "cluj", "covasna", "harghita", "hunedoara", "maramures",
        "mures", "salaj", "satu mare", "sibiu", "timis",
    ],
    "ROU::moldavia": [
        "bacau", "botosani", "iasi", "neamt", "suceava", "vaslui", "vrancea", "galati",
    ],
    "ROU::wallachia and oltenia": [
        "arges", "buzau", "calarasi", "dambovita", "dolj", "giurgiu",
        "gorj", "ialomita", "mehedinti", "olt", "prahova", "teleorman", "valcea",
        "braila",
    ],
    "ROU::dobruja and lower danube": ["constanta", "tulcea"],
};
const REGION_GROUPS_RESOLVED = {
    ...REGION_GROUPS,
    ...REGION_GROUP_OVERRIDES,
};
const VISUAL_REGION_DEFINITIONS = {
    "ALB::central": {
        label: "Central Albania",
        dataRegionKeys: ["ALB::tirana", "ALB::central coast albania"],
        fill: "#a68962",
    },
    "ALB::north": { label: "N ALB", dataRegionKey: "ALB::northern albania", fill: "#7f8d62" },
    "ALB::south": { label: "S ALB", dataRegionKey: "ALB::southern albania", fill: "#b67658" },
    "BGR::sofia": { label: "Sofia", dataRegionKey: "BGR::sofia", fill: "#63718d" },
    "BGR::north": { label: "North Bulgaria", dataRegionKey: "BGR::northern bulgaria", fill: "#c58b4a" },
    "BGR::south": { label: "South Bulgaria", dataRegionKey: "BGR::southern bulgaria", fill: "#6f9250" },
    "BGR::black-sea": { label: "Black Sea", dataRegionKey: "BGR::black sea bulgaria", fill: "#4e83a5" },
    "BIH::fbih": { label: "FBiH", dataRegionKey: "BIH::federation of bosnia and herzegovina", fill: "#8f776d" },
    "BIH::rs": {
        label: "RS",
        dataRegionKeys: ["BIH::republika srpska", "BIH::brcko"],
        fill: "#a4a08c",
    },
    "HRV::zagreb-central": { label: "C HRV", dataRegionKey: "HRV::zagreb and central croatia", fill: "#a25d46" },
    "HRV::slavonia": { label: "Slavonija", dataRegionKey: "HRV::slavonia", fill: "#c97f44" },
    "HRV::dalmatia": { label: "Dalmacija", dataRegionKey: "HRV::dalmatia", fill: "#d9ac70" },
    "HRV::istria-kvarner": { label: "Istrija", dataRegionKey: "HRV::istria and kvarner", fill: "#8f6f5a" },
    "HUN::central-hungary": { label: "Budapest", dataRegionKey: "HUN::central hungary", fill: "#d34b4b" },
    "HUN::transdanubia": { label: "Transdanubia", dataRegionKey: "HUN::transdanubia", fill: "#6f63c7" },
    "HUN::north-hungary": { label: "Northern Hungary", dataRegionKey: "HUN::northern hungary", fill: "#81c5d8" },
    "HUN::great-plains": { label: "Great Plains", dataRegionKey: "HUN::great plains", fill: "#41b65a" },
    "MKD::skopje": { label: "Skopje", dataRegionKey: "MKD::skopje", fill: "#865c71" },
    "MKD::west": { label: "W MAC", dataRegionKey: "MKD::western north macedonia", fill: "#b78361" },
    "MKD::se": { label: "E MAC", dataRegionKey: "MKD::southeastern north macedonia", fill: "#8f6aa7" },
    "SRB::vojvodina": { label: "Vojvodina", dataRegionKey: "SRB::vojvodina", fill: "#70b29e" },
    "SRB::belgrade": { label: "Beograd", dataRegionKey: "SRB::belgrade", fill: "#b0a59a" },
    "SRB::sz-srb": { label: "SZ SRB", dataRegionKey: "SRB::central serbia", fill: "#dce68d" },
    "SRB::ji-srb": { label: "JI SRB", dataRegionKey: "SRB::south and east serbia", fill: "#cf857c" },
    "SRB::kosovo-metohija": { label: "Kosovo", dataRegionKey: "SRB::kosovo and metohija", fill: "#efb287" },
    "MNE::coastal-region": { label: "Coastal Region", dataRegionKey: "MNE::coast", fill: "#66aebe" },
    "MNE::southern-montenegro": { label: "Southern Montenegro", dataRegionKey: "MNE::inland", fill: "#4f9488" },
    "MNE::northern-montenegro": { label: "Northern Montenegro", dataRegionKey: "MNE::inland", fill: "#7aa6cf" },
    "ROU::bucharest-ilfov": { label: "Bucharest", dataRegionKey: "ROU::bucharest ilfov", fill: "#8a5d4d" },
    "ROU::transylvania-banat": { label: "Transylvania", dataRegionKey: "ROU::transylvania and banat", fill: "#ccb65b" },
    "ROU::moldavia": { label: "Moldavia", dataRegionKey: "ROU::moldavia", fill: "#c87892" },
    "ROU::wallachia-oltenia": { label: "Wallachia", dataRegionKey: "ROU::wallachia and oltenia", fill: "#b48a56" },
    "ROU::dobruja-lower-danube": { label: "Dobruja", dataRegionKey: "ROU::dobruja and lower danube", fill: "#7fa866" },
    "SVN::western": { label: "W SVN", dataRegionKey: "SVN::western slovenia", fill: "#5c9abf" },
    "SVN::eastern": { label: "E SVN", dataRegionKey: "SVN::eastern slovenia", fill: "#78b59f" },
    "GRC::attica": { label: "Attica", dataRegionKey: "GRC::attica", fill: "#6689c0" },
    "GRC::macedonia-thrace": { label: "Macedonia-Thrace", dataRegionKey: "GRC::macedonia thrace", fill: "#5b9ba7" },
    "GRC::epirus-western-macedonia": { label: "Epirus-W. Mac.", dataRegionKey: "GRC::epirus western macedonia", fill: "#7aa276" },
    "GRC::thessalia-central-greece": { label: "Thessaly-C. Greece", dataRegionKey: "GRC::thessalia central greece", fill: "#9eb36a" },
    "GRC::peloponnese-west-greece-ionian": { label: "Peloponnese", dataRegionKey: "GRC::peloponisos w greece and ionian", fill: "#c19362" },
    "GRC::crete": { label: "Crete", dataRegionKey: "GRC::crete", fill: "#d0a05f" },
    "GRC::aegean": { label: "Aegean", dataRegionKey: "GRC::aegean", fill: "#6aaec4" },
    "GRC::agion-oros": { label: "Athos", dataRegionKey: "GRC::agion oros", fill: "#8b7fa9" },
};
const INLINE_EDITOR_TARGET_OPTIONS = Object.freeze({
    ALB: [
        { visualRegionKey: "ALB::north", label: "N ALB", dataRegionKey: "ALB::northern albania", fill: "#7f8d62" },
        { visualRegionKey: "ALB::central", label: "C ALB", dataRegionKey: "ALB::tirana", fill: "#a68962", useDefinitionDataKeys: true },
        { visualRegionKey: "ALB::south", label: "S ALB", dataRegionKey: "ALB::southern albania", fill: "#b67658" },
    ],
    BGR: [
        { visualRegionKey: "BGR::sofia", label: "Sofia", dataRegionKey: "BGR::sofia", fill: "#63718d" },
        { visualRegionKey: "BGR::north", label: "N BUL", dataRegionKey: "BGR::northern bulgaria", fill: "#c58b4a" },
        { visualRegionKey: "BGR::south", label: "S BUL", dataRegionKey: "BGR::southern bulgaria", fill: "#6f9250" },
        { visualRegionKey: "BGR::black-sea", label: "Black Sea", dataRegionKey: "BGR::black sea bulgaria", fill: "#4e83a5" },
    ],
    GRC: [
        { visualRegionKey: "GRC::attica", label: "Attica", dataRegionKey: "GRC::attica", fill: "#6689c0" },
        { visualRegionKey: "GRC::macedonia-thrace", label: "Macedonia-Thrace", dataRegionKey: "GRC::macedonia thrace", fill: "#5b9ba7" },
        { visualRegionKey: "GRC::epirus-western-macedonia", label: "Epirus-W. Mac.", dataRegionKey: "GRC::epirus western macedonia", fill: "#7aa276" },
        { visualRegionKey: "GRC::thessalia-central-greece", label: "Thessaly-C. Greece", dataRegionKey: "GRC::thessalia central greece", fill: "#9eb36a" },
        { visualRegionKey: "GRC::peloponnese-west-greece-ionian", label: "Peloponnese", dataRegionKey: "GRC::peloponisos w greece and ionian", fill: "#c19362" },
        { visualRegionKey: "GRC::crete", label: "Crete", dataRegionKey: "GRC::crete", fill: "#d0a05f" },
        { visualRegionKey: "GRC::aegean", label: "Aegean", dataRegionKey: "GRC::aegean", fill: "#6aaec4" },
        { visualRegionKey: "GRC::agion-oros", label: "Athos", dataRegionKey: "GRC::agion oros", fill: "#8b7fa9" },
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
        { visualRegionKey: "MKD::se", label: "E MAC", dataRegionKey: "MKD::southeastern north macedonia", fill: "#8f6aa7" },
    ],
    MNE: [
        { visualRegionKey: "MNE::coastal-region", label: "CS MON", dataRegionKey: "MNE::coast", fill: "#66aebe" },
        { visualRegionKey: "MNE::southern-montenegro", label: "S MON", dataRegionKey: "MNE::inland", fill: "#4f9488", useDefinitionDataKeys: true },
        { visualRegionKey: "MNE::northern-montenegro", label: "N MON", dataRegionKey: "MNE::inland", fill: "#7aa6cf", useDefinitionDataKeys: true },
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
    SVN: [
        { visualRegionKey: "SVN::western", label: "W SVN", dataRegionKey: "SVN::western slovenia", fill: "#5c9abf" },
        { visualRegionKey: "SVN::eastern", label: "E SVN", dataRegionKey: "SVN::eastern slovenia", fill: "#78b59f" },
    ],
});
const INLINE_EDITOR_DEFAULT_TARGET_REGION = Object.freeze({
    ALB: "ALB::central",
    BGR: "BGR::sofia",
    BIH: "BIH::rs",
    GRC: "GRC::attica",
    HRV: "HRV::zagreb-central",
    HUN: "HUN::central-hungary",
    MKD: "MKD::skopje",
    MNE: "MNE::northern-montenegro",
    ROU: "ROU::bucharest-ilfov",
    SRB: "SRB::sz-srb",
    SVN: "SVN::western",
});
const STATE_METRICS = [
    ["budget_balance_pct_gdp", "state.budget"],
    ["debt_to_gdp", "state.debt"],
    ["stability_index", "state.stability"],
    ["corruption_index", "state.corruption"],
    ["investment_climate_index", "state.investment"],
];
function expandFeatureGroups(groups, targetMapper = (targetKey) => targetKey) {
    return Object.fromEntries(
        Object.entries(groups).flatMap(([targetKey, names]) => {
            const countryCode = targetKey.split("::")[0];
            return names.map((name) => [buildRegionKey(countryCode, name), targetMapper(targetKey)]);
        })
    );
}
const REGION_FEATURE_TO_BESP = {
    [buildRegionKey("ALB", "Tirana")]: "ALB::tirana",
    [buildRegionKey("BIH", "Federation of Bosnia and Herzegovina")]: "BIH::federation of bosnia and herzegovina",
    [buildRegionKey("BIH", "Republika Srpska")]: "BIH::republika srpska",
    [buildRegionKey("BIH", "Brcko")]: "BIH::republika srpska",
    [buildRegionKey("HUN", "Pest")]: "HUN::central hungary",
    [buildRegionKey("SRB", "Belgrade")]: "SRB::belgrade",
    [buildRegionKey("SRB", "Kosovo")]: "SRB::kosovo and metohija",
    [buildRegionKey("SRB", "District of Mitrovica")]: "SRB::kosovo and metohija",
    [buildRegionKey("SRB", "District of Peja")]: "SRB::kosovo and metohija",
    [buildRegionKey("SRB", "District of Gjakova")]: "SRB::kosovo and metohija",
    [buildRegionKey("SRB", "District of Prizren")]: "SRB::kosovo and metohija",
    [buildRegionKey("SRB", "District of Prishtina")]: "SRB::kosovo and metohija",
    [buildRegionKey("SRB", "District of Ferizaj")]: "SRB::kosovo and metohija",
    [buildRegionKey("SRB", "District of Gjilan")]: "SRB::kosovo and metohija",
    [buildRegionKey("SVN", "Zahodna Slovenija")]: "SVN::western slovenia",
    [buildRegionKey("SVN", "Vzhodna")]: "SVN::eastern slovenia",
    [buildRegionKey("GRC", "Egean")]: "GRC::aegean",
    ...expandFeatureGroups(REGION_GROUPS_RESOLVED),
};
const BESP_REGION_KEYS = new Set(Object.values(REGION_FEATURE_TO_BESP));
const GRC_ADM2_VISUAL_REGIONS = {
    [buildRegionKey("GRC", "Agion Oros")]: "GRC::agion-oros",
    [buildRegionKey("GRC", "Anatolikis Makedonias kai Thr*")]: "GRC::macedonia-thrace",
    [buildRegionKey("GRC", "Attikis")]: "GRC::attica",
    [buildRegionKey("GRC", "Dytikis Elladas")]: "GRC::peloponnese-west-greece-ionian",
    [buildRegionKey("GRC", "Dytikis Makedonias")]: "GRC::epirus-western-macedonia",
    [buildRegionKey("GRC", "Ionion Nison")]: "GRC::peloponnese-west-greece-ionian",
    [buildRegionKey("GRC", "Ipeiroy")]: "GRC::epirus-western-macedonia",
    [buildRegionKey("GRC", "Kentrikis Makedonias")]: "GRC::macedonia-thrace",
    [buildRegionKey("GRC", "Kritis")]: "GRC::crete",
    [buildRegionKey("GRC", "Notioy Aigaioy")]: "GRC::aegean",
    [buildRegionKey("GRC", "Peloponnisoy")]: "GRC::peloponnese-west-greece-ionian",
    [buildRegionKey("GRC", "Stereas Elladas")]: "GRC::thessalia-central-greece",
    [buildRegionKey("GRC", "Thessalias")]: "GRC::thessalia-central-greece",
    [buildRegionKey("GRC", "Voreioy Aigaioy")]: "GRC::aegean",
};
const SVN_NUTS3_VISUAL_REGIONS = {
    [buildRegionKey("SVN", "Gorenjska")]: "SVN::western",
    [buildRegionKey("SVN", "Goriška")]: "SVN::western",
    [buildRegionKey("SVN", "Obalno-kraška")]: "SVN::western",
    [buildRegionKey("SVN", "Osrednjeslovenska")]: "SVN::western",
    [buildRegionKey("SVN", "Jugovzhodna Slovenija")]: "SVN::eastern",
    [buildRegionKey("SVN", "Koroška")]: "SVN::eastern",
    [buildRegionKey("SVN", "Podravska")]: "SVN::eastern",
    [buildRegionKey("SVN", "Pomurska")]: "SVN::eastern",
    [buildRegionKey("SVN", "Posavska")]: "SVN::eastern",
    [buildRegionKey("SVN", "Primorsko-notranjska")]: "SVN::western",
    [buildRegionKey("SVN", "Savinjska")]: "SVN::eastern",
    [buildRegionKey("SVN", "Zasavska")]: "SVN::eastern",
};
const FEATURE_TO_VISUAL_REGION = {
    ...expandFeatureGroups({
        "ALB::central": [
            ...REGION_GROUPS_RESOLVED["ALB::tirana"],
            ...REGION_GROUPS_RESOLVED["ALB::central coast albania"],
        ],
        "ALB::north": REGION_GROUPS_RESOLVED["ALB::northern albania"],
        "ALB::south": REGION_GROUPS_RESOLVED["ALB::southern albania"],
        "BGR::sofia": REGION_GROUPS_RESOLVED["BGR::sofia"],
        "BGR::north": REGION_GROUPS_RESOLVED["BGR::northern bulgaria"],
        "BGR::south": REGION_GROUPS_RESOLVED["BGR::southern bulgaria"],
        "BGR::black-sea": REGION_GROUPS_RESOLVED["BGR::black sea bulgaria"],
        "HRV::zagreb-central": REGION_GROUPS_RESOLVED["HRV::zagreb and central croatia"],
        "HRV::slavonia": REGION_GROUPS_RESOLVED["HRV::slavonia"],
        "HRV::dalmatia": REGION_GROUPS_RESOLVED["HRV::dalmatia"],
        "HRV::istria-kvarner": REGION_GROUPS_RESOLVED["HRV::istria and kvarner"],
        "HUN::central-hungary": REGION_GROUPS_RESOLVED["HUN::central hungary"],
        "HUN::transdanubia": REGION_GROUPS_RESOLVED["HUN::transdanubia"],
        "HUN::north-hungary": REGION_GROUPS_RESOLVED["HUN::northern hungary"],
        "HUN::great-plains": REGION_GROUPS_RESOLVED["HUN::great plains"],
        "MKD::skopje": REGION_GROUPS_RESOLVED["MKD::skopje"],
        "MKD::west": REGION_GROUPS_RESOLVED["MKD::western north macedonia"],
        "MKD::se": REGION_GROUPS_RESOLVED["MKD::southeastern north macedonia"],
        "ROU::bucharest-ilfov": REGION_GROUPS_RESOLVED["ROU::bucharest ilfov"],
        "ROU::transylvania-banat": REGION_GROUPS_RESOLVED["ROU::transylvania and banat"],
        "ROU::moldavia": REGION_GROUPS_RESOLVED["ROU::moldavia"],
        "ROU::wallachia-oltenia": REGION_GROUPS_RESOLVED["ROU::wallachia and oltenia"],
        "ROU::dobruja-lower-danube": REGION_GROUPS_RESOLVED["ROU::dobruja and lower danube"],
    }),
    [buildRegionKey("BIH", "Federation of Bosnia and Herzegovina")]: "BIH::fbih",
    [buildRegionKey("BIH", "Republika Srpska")]: "BIH::rs",
    [buildRegionKey("BIH", "Brcko")]: "BIH::rs",
    [buildRegionKey("HUN", "Pest")]: "HUN::central-hungary",
    [buildRegionKey("SRB", "Belgrade")]: "SRB::belgrade",
    [buildRegionKey("SRB", "Kosovo")]: KOSOVO_VISUAL_REGION_KEY,
    [buildRegionKey("SRB", "Kosovo and Metohija")]: KOSOVO_VISUAL_REGION_KEY,
    [buildRegionKey("SRB", "District of Mitrovica")]: KOSOVO_VISUAL_REGION_KEY,
    [buildRegionKey("SRB", "District of Peja")]: KOSOVO_VISUAL_REGION_KEY,
    [buildRegionKey("SRB", "District of Gjakova")]: KOSOVO_VISUAL_REGION_KEY,
    [buildRegionKey("SRB", "District of Prizren")]: KOSOVO_VISUAL_REGION_KEY,
    [buildRegionKey("SRB", "District of Prishtina")]: KOSOVO_VISUAL_REGION_KEY,
    [buildRegionKey("SRB", "District of Ferizaj")]: KOSOVO_VISUAL_REGION_KEY,
    [buildRegionKey("SRB", "District of Gjilan")]: KOSOVO_VISUAL_REGION_KEY,
    [buildRegionKey("MKD", "Pelagonia")]: "MKD::west",
    [buildRegionKey("SVN", "Zahodna Slovenija")]: "SVN::western",
    [buildRegionKey("SVN", "Vzhodna")]: "SVN::eastern",
    [buildRegionKey("GRC", "Attica")]: "GRC::attica",
    [buildRegionKey("GRC", "Macedonia-Thrace")]: "GRC::macedonia-thrace",
    [buildRegionKey("GRC", "Epirus-Western Macedonia")]: "GRC::epirus-western-macedonia",
    [buildRegionKey("GRC", "Thessalia-Central Greece")]: "GRC::thessalia-central-greece",
    [buildRegionKey("GRC", "Peloponisos-W. Greece & Ionian")]: "GRC::peloponnese-west-greece-ionian",
    [buildRegionKey("GRC", "Crete")]: "GRC::crete",
    [buildRegionKey("GRC", "Egean")]: "GRC::aegean",
    [buildRegionKey("GRC", "Agion Oros")]: "GRC::agion-oros",
    ...expandFeatureGroups({
        "SRB::vojvodina": REGION_GROUPS_RESOLVED["SRB::vojvodina"],
        "SRB::sz-srb": REGION_GROUPS_RESOLVED["SRB::central serbia"],
        "SRB::ji-srb": REGION_GROUPS_RESOLVED["SRB::south and east serbia"],
        "MNE::coastal-region": ["herceg novi municipality", "kotor municipality", "tivat municipality", "budva municipality", "bar municipality", "ulcinj municipality"],
        "MNE::southern-montenegro": ["podgorica municipality", "danilovgrad municipality", "cetinje municipality", "niksic municipality"],
        "MNE::northern-montenegro": ["pljevlja municipality", "pluzine municipality", "savnik municipality", "zabljak municipality", "kolasin municipality", "mojkovac municipality", "andrijevica municipality", "berane municipality", "bijelo polje municipality", "rozaje municipality", "plav municipality", "gusinje municipality", "petnjica municipality"],
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
    countryFeaturesByCode: new Map(),
    regionsByKey: new Map(),
    previousRegionsByKey: new Map(),
    visualRegionsByKey: new Map(),
    previousVisualRegionsByKey: new Map(),
};
const dashboardState = {
    exportData: null,
    geoData: null,
    geoCollections: null,
    geoWarning: "",
    yearKeys: [],
    currentYearIndex: 0,
    playbackSpeed: 1,
    playbackTimer: null,
    isReloading: false,
    isGeneratingRun: false,
    runServiceAvailable: false,
    runStatusPollTimer: null,
    currentRunStatus: null,
    availableScenarios: [],
    countryRowCount: 0,
    regionRowCount: 0,
    activeMetric: "classic",
    language: window.localStorage?.getItem("bespLanguage") === "de" ? "de" : "en",
    theme: window.localStorage?.getItem("bespTheme") === "light" ? "light" : "dark",
    selectedEventIndex: -1,
    currentCountryRows: [],
    currentRegionRows: [],
    editorMode: false,
    editorAssignments: { updated_at: null, overrides: {} },
    editorTargetCountryCode: "",
    editorTargetCountrySelected: false,
    selectedEditorSelectionType: "",
    selectedEditorSelectionKey: "",
    selectedEditorVisualRegionKey: "",
    visualRegionRowsByYear: new Map(),
    countryRowsByYear: new Map(),
};
let activeMapMode = "country";
let activeHoverNode = null;
const elements = {
    metaCards: document.getElementById("meta-cards"),
    stateCards: document.getElementById("state-cards"),
    mapModeCountryButton: document.getElementById("map-mode-country"),
    mapModeRegionButton: document.getElementById("map-mode-region"),
    editorModeToggleButton: document.getElementById("editor-mode-toggle"),
    yearStepBackButton: document.getElementById("year-step-back"),
    yearStepForwardButton: document.getElementById("year-step-forward"),
    playbackToggleButton: document.getElementById("playback-toggle"),
    reloadExportButton: document.getElementById("reload-export"),
    generateRunButton: document.getElementById("generate-run"),
    runScenarioSelect: document.getElementById("run-scenario-select"),
    runCountInput: document.getElementById("run-count-input"),
    runShocksEnabled: document.getElementById("run-shocks-enabled"),
    runBatchSummary: document.getElementById("run-batch-summary"),
    yearSelect: document.getElementById("year-select"),
    currentYearPill: document.getElementById("current-year-pill"),
    exportStatus: document.getElementById("export-status"),
    speedButtons: Array.from(document.querySelectorAll(".speed-button")),
    metricButtons: Array.from(document.querySelectorAll(".metric-button")),
    languageButtons: Array.from(document.querySelectorAll(".language-button")),
    themeToggleButton: document.getElementById("theme-toggle"),
    themeToggleIcon: document.getElementById("theme-toggle-icon"),
    themeToggleLabel: document.getElementById("theme-toggle-label"),
    mapHoverTitle: document.getElementById("map-hover-title"),
    mapHoverBody: document.getElementById("map-hover-body"),
    mapRoot: document.getElementById("country-map"),
    mapContextMenu: document.getElementById("map-context-menu"),
    kpiCard: document.getElementById("kpi-card"),
    mapEditorCard: document.getElementById("map-editor-card"),
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
    editorInlineSelectionTitle: document.getElementById("editor-inline-selection-title"),
    editorInlineSelectionNote: document.getElementById("editor-inline-selection-note"),
    editorInlineTargetCountry: document.getElementById("editor-inline-target-country"),
    editorInlineTargetRegion: document.getElementById("editor-inline-target-region"),
    editorInlineApply: document.getElementById("editor-inline-apply"),
    editorInlineReset: document.getElementById("editor-inline-reset"),
    editorInlineSave: document.getElementById("editor-inline-save"),
    editorInlineStatus: document.getElementById("editor-inline-status"),
    countryLayer: document.getElementById("country-layer"),
    countryHoverLayer: document.getElementById("country-hover-layer"),
    countryLabelLayer: document.getElementById("country-label-layer"),
    regionLayer: document.getElementById("region-layer"),
    regionHoverLayer: document.getElementById("region-hover-layer"),
    regionLabelLayer: document.getElementById("region-label-layer"),
    mapEventLayer: document.getElementById("map-event-layer"),
    mapSummaryCards: document.getElementById("map-summary-cards"),
    stateTableBody: document.getElementById("state-table-body"),
    countryTableBody: document.getElementById("country-table-body"),
    regionTableBody: document.getElementById("region-table-body"),
};
const EMPTY_CARDS = {
    map: buildEmptyCard("No map data", "Load an export to render the map."),
    meta: buildEmptyCard("No data loaded", "The dashboard is waiting for <code>output/latest.json</code>."),
    state: buildEmptyCard("No state data", "Load or regenerate an export with state values."),
    stateYear: buildEmptyCard("No state data", "No country values were found for the selected year."),
};
const EMPTY_TABLE_ROWS = {
    country: buildEmptyTableRow(11, "No country values loaded yet."),
    countryExport: buildEmptyTableRow(11, "No country values were found in the export."),
    state: buildEmptyTableRow(7, "No state values loaded yet."),
    region: buildEmptyTableRow(12, "No region values loaded yet."),
    regionExport: buildEmptyTableRow(12, "No region values were found in the export."),
};
document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    applyLanguage();
    decorateMetricButtons();
    bindLanguageControls();
    bindThemeControls();
    bindMapModeEvents();
    bindPlaybackControls();
    bindEditorControls();
    bindMapRootReset();
    bindMapContextMenuEvents();
    renderEmptyState();
    void initializeDashboard();
});
function t(key) {
    return I18N[dashboardState.language]?.[key] ?? I18N.en[key] ?? key;
}
function tf(key, values = {}) {
    return t(key).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}
function displayRegionLabel(groupOrKey, { short = false } = {}) {
    const visualRegionKey = typeof groupOrKey === "string" ? groupOrKey : groupOrKey?.visualRegionKey;
    const fallbackLabel = typeof groupOrKey === "string" ? groupOrKey : groupOrKey?.label;
    return translatedRegionLabel(visualRegionKey, { short }) ?? fallbackLabel ?? "";
}
function translatedRegionLabel(visualRegionKey, { short = false } = {}) {
    const language = dashboardState.language === "de" ? "de" : "en";
    const translation = REGION_LABEL_TRANSLATIONS[visualRegionKey]?.[language]
        ?? REGION_LABEL_TRANSLATIONS[visualRegionKey]?.en
        ?? null;
    if (translation) {
        return short ? (translation.short ?? translation.long) : (translation.long ?? translation.short);
    }
    return null;
}
function applyLanguage() {
    document.documentElement.lang = dashboardState.language === "de" ? "de-CH" : "en";
    for (const node of document.querySelectorAll("[data-i18n]")) {
        node.textContent = t(node.dataset.i18n);
    }
    for (const button of elements.languageButtons) {
        const active = button.dataset.language === dashboardState.language;
        button.classList.toggle("language-button-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
    }
    for (const view of Object.values(METRIC_VIEWS)) {
        view.label = dashboardState.language === "de" ? (view.labelDe ?? view.labelEn ?? view.label) : (view.labelEn ?? view.label);
        view.buttonLabel = dashboardState.language === "de"
            ? (view.buttonLabelDe ?? view.buttonLabelEn ?? view.buttonLabel)
            : (view.buttonLabelEn ?? view.buttonLabel);
    }
    decorateMetricButtons();
    applyTheme();
    if (dashboardState.runServiceAvailable && dashboardState.currentRunStatus) {
        applyRunStatus(dashboardState.currentRunStatus);
    } else {
        renderRunBatchSummary(dashboardState.currentRunStatus);
    }
}
function bindLanguageControls() {
    for (const button of elements.languageButtons) {
        button.addEventListener("click", () => {
            const nextLanguage = button.dataset.language === "de" ? "de" : "en";
            if (dashboardState.language === nextLanguage) {
                return;
            }
            dashboardState.language = nextLanguage;
            window.localStorage?.setItem("bespLanguage", nextLanguage);
            applyLanguage();
            if (dashboardState.exportData) {
                renderActiveYearState();
            } else {
                renderEmptyState();
            }
        });
    }
}
function applyTheme() {
    const isLight = dashboardState.theme === "light";
    document.documentElement.dataset.theme = dashboardState.theme;
    if (elements.themeToggleButton) {
        elements.themeToggleButton.setAttribute("aria-pressed", isLight ? "true" : "false");
        elements.themeToggleButton.setAttribute("aria-label", isLight ? t("theme.switchDark") : t("theme.switchLight"));
    }
    if (elements.themeToggleIcon) {
        elements.themeToggleIcon.textContent = isLight ? "🌙" : "☀️";
    }
    if (elements.themeToggleLabel) {
        elements.themeToggleLabel.textContent = isLight ? t("theme.dark") : t("theme.light");
    }
}
function bindThemeControls() {
    elements.themeToggleButton?.addEventListener("click", () => {
        dashboardState.theme = dashboardState.theme === "light" ? "dark" : "light";
        window.localStorage?.setItem("bespTheme", dashboardState.theme);
        applyTheme();
    });
}
function bindMapModeEvents() {
    elements.mapModeCountryButton.addEventListener("click", () => {
        if (dashboardState.editorMode) {
            setEditorMode(false);
        }
        setMapMode("country");
    });
    elements.mapModeRegionButton.addEventListener("click", () => {
        if (dashboardState.editorMode) {
            setEditorMode(false);
        }
        setMapMode("region");
    });
}
function decorateMetricButtons() {
    for (const button of elements.metricButtons) {
        const metricKey = String(button.dataset.metric ?? "");
        const view = METRIC_VIEWS[metricKey];
        if (!view?.buttonLabel) {
            continue;
        }
        button.textContent = view.buttonLabel;
        button.title = view.label;
        button.setAttribute("aria-label", view.label);
    }
}
function bindEditorControls() {
    elements.editorModeToggleButton?.addEventListener("click", () => {
        setEditorMode(!dashboardState.editorMode);
    });
    elements.editorInlineTargetCountry?.addEventListener("change", () => {
        setInlineEditorTargetCountry(elements.editorInlineTargetCountry.value);
        renderInlineEditorPanel();
    });
    elements.editorInlineApply?.addEventListener("click", () => {
        void applyInlineEditorAssignment();
    });
    elements.editorInlineReset?.addEventListener("click", () => {
        void resetInlineEditorAssignment();
    });
    elements.editorInlineSave?.addEventListener("click", () => {
        void saveInlineEditorAssignments();
    });
}
function getInlineEditorTargetCountryCodes() {
    return Object.keys(INLINE_EDITOR_TARGET_OPTIONS)
        .filter((countryCode) => COUNTRY_CONFIG[countryCode]?.planned !== true)
        .sort((left, right) => countryDisplayName(left, left).localeCompare(countryDisplayName(right, right)));
}
function populateInlineEditorTargetCountries() {
    if (!elements.editorInlineTargetCountry) {
        return;
    }
    const currentValue = normalizeCountryCode(dashboardState.editorTargetCountryCode || elements.editorInlineTargetCountry.value);
    const countryCodes = getInlineEditorTargetCountryCodes();
    elements.editorInlineTargetCountry.innerHTML = countryCodes
        .map((countryCode) => `<option value="${escapeHtml(countryCode)}">${escapeHtml(countryDisplayName(countryCode, countryCode))} (${escapeHtml(displayCountryCode(countryCode))})</option>`)
        .join("");
    const nextValue = countryCodes.includes(currentValue)
        ? currentValue
        : (countryCodes[0] ?? "");
    elements.editorInlineTargetCountry.value = nextValue;
    dashboardState.editorTargetCountryCode = nextValue;
}
function populateInlineEditorTargetRegions(countryCode, preferredVisualRegionKey = "") {
    if (!elements.editorInlineTargetRegion) {
        return;
    }
    const normalizedCountryCode = normalizeCountryCode(countryCode);
    const currentValue = String(preferredVisualRegionKey || elements.editorInlineTargetRegion.value || "");
    const options = INLINE_EDITOR_TARGET_OPTIONS[normalizedCountryCode] ?? [];
    elements.editorInlineTargetRegion.innerHTML = options
        .map((option) => `<option value="${escapeHtml(option.visualRegionKey)}">${escapeHtml(option.label)}</option>`)
        .join("");
    elements.editorInlineTargetRegion.value = options.some((option) => option.visualRegionKey === currentValue)
        ? currentValue
        : (options[0]?.visualRegionKey ?? "");
}
function setInlineEditorTargetCountry(countryCode, preferredVisualRegionKey = "") {
    const normalizedCountryCode = normalizeCountryCode(countryCode);
    const countryCodes = getInlineEditorTargetCountryCodes();
    if (!countryCodes.includes(normalizedCountryCode)) {
        return false;
    }
    dashboardState.editorTargetCountryCode = normalizedCountryCode;
    dashboardState.editorTargetCountrySelected = true;
    if (elements.editorInlineTargetCountry) {
        elements.editorInlineTargetCountry.value = normalizedCountryCode;
    }
    populateInlineEditorTargetRegions(normalizedCountryCode, preferredVisualRegionKey);
    return true;
}
function setEditorSelection(type = "", key = "") {
    const normalizedType = type === "country" || type === "region" ? type : "";
    const normalizedKey = normalizedType ? String(key ?? "") : "";
    dashboardState.selectedEditorSelectionType = normalizedType;
    dashboardState.selectedEditorSelectionKey = normalizedKey;
    dashboardState.selectedEditorVisualRegionKey = normalizedType === "region" ? normalizedKey : "";
}
function clearEditorSelection() {
    setEditorSelection("", "");
}
function getInlineEditorSelectedGroup() {
    const selectionType = String(dashboardState.selectedEditorSelectionType ?? "");
    const selectionKey = String(dashboardState.selectedEditorSelectionKey ?? "");
    if (!selectionType || !selectionKey) {
        return null;
    }
    if (selectionType === "country") {
        return null;
    }
    const visualRegionGroup = mapDataCache.visualRegionsByKey.get(selectionKey) ?? null;
    if (!visualRegionGroup) {
        return null;
    }
    return {
        ...visualRegionGroup,
        selectionType,
        selectionKey,
    };
}
function getInlineEditorTargetOption() {
    const countryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode || elements.editorInlineTargetCountry?.value);
    const visualRegionKey = String(elements.editorInlineTargetRegion?.value ?? "");
    return (INLINE_EDITOR_TARGET_OPTIONS[countryCode] ?? []).find(
        (option) => option.visualRegionKey === visualRegionKey
    ) ?? null;
}
function getInlineEditorSourceOwnerCode(group) {
    const currentOwnerCode = normalizeCountryCode(group?.countryCode);
    if (currentOwnerCode) {
        return currentOwnerCode;
    }
    const rawCountryCodes = new Set(
        (group?.features ?? [])
            .map((feature) => normalizeCountryCode(feature.rawCountryCode))
            .filter(Boolean)
    );
    if (rawCountryCodes.size === 1) {
        return [...rawCountryCodes][0];
    }
    return normalizeCountryCode(group?.countryCode);
}
function syncInlineEditorTargetRegionForSource(group) {
    const targetCountryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode);
    const visualRegionKey = String(group?.visualRegionKey ?? "");
    if (!targetCountryCode || !visualRegionKey) {
        return;
    }
    const targetOptions = INLINE_EDITOR_TARGET_OPTIONS[targetCountryCode] ?? [];
    if (targetOptions.some((option) => option.visualRegionKey === visualRegionKey)) {
        populateInlineEditorTargetRegions(targetCountryCode, visualRegionKey);
    }
}
function chooseInlineEditorTargetRegionForAnnexation(targetCountryCode, group) {
    const normalizedCountryCode = normalizeCountryCode(targetCountryCode);
    const targetOptions = INLINE_EDITOR_TARGET_OPTIONS[normalizedCountryCode] ?? [];
    if (!targetOptions.length) {
        return "";
    }
    const sourceVisualRegionKey = String(group?.visualRegionKey ?? "");
    if (targetOptions.some((option) => option.visualRegionKey === sourceVisualRegionKey)) {
        return sourceVisualRegionKey;
    }
    const defaultVisualRegionKey = INLINE_EDITOR_DEFAULT_TARGET_REGION[normalizedCountryCode] ?? "";
    if (targetOptions.some((option) => option.visualRegionKey === defaultVisualRegionKey)) {
        return defaultVisualRegionKey;
    }
    return targetOptions[0]?.visualRegionKey ?? "";
}
function setInlineEditorStatus(message, tone = "muted") {
    if (!elements.editorInlineStatus) {
        return;
    }
    elements.editorInlineStatus.textContent = message;
    elements.editorInlineStatus.className = `timeline-note export-status-status-${tone}`;
}
function renderInlineEditorPanelLegacyUnused() {
    if (!elements.mapEditorCard) {
        return;
    }
    const editorActive = dashboardState.editorMode;
    elements.mapEditorCard.classList.toggle("map-hidden", !editorActive);
    populateInlineEditorTargetCountries();
    populateInlineEditorTargetRegions(elements.editorInlineTargetCountry?.value);
    const selectedGroup = getInlineEditorSelectedGroup();
    const hasSelection = Boolean(selectedGroup);
    const targetCountryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode);
    const targetCountryName = countryDisplayName(targetCountryCode, displayCountryCode(targetCountryCode));
    const sourceOwnerCode = hasSelection ? getInlineEditorSourceOwnerCode(selectedGroup) : "";
    const sourceAlreadyOwned = hasSelection && sourceOwnerCode === targetCountryCode;
    const selectionPrompt = activeMapMode === "country"
        ? t("editor.countryHint")
        : t("editor.regionHint");
    if (!editorActive) {
        elements.editorInlineSelectionTitle.textContent = t("editor.noSelection");
        elements.editorInlineSelectionNote.textContent = t("editor.off");
        elements.editorInlineApply.disabled = true;
        elements.editorInlineReset.disabled = true;
        elements.editorInlineSave.disabled = !dashboardState.runServiceAvailable;
        setInlineEditorStatus(t("editor.off"), "muted");
        return;
    }
    const targetOption = getInlineEditorTargetOption();
    if (!hasSelection) {
        elements.editorInlineSelectionTitle.textContent = t("editor.noSelection");
        elements.editorInlineSelectionNote.textContent = selectionPrompt;
    }
    if (hasSelection) {
        elements.editorInlineSelectionTitle.textContent = tf("editor.targetAnnexes", { country: selectedGroup.label });
        elements.editorInlineSelectionNote.textContent = sourceAlreadyOwned
            ? tf("editor.areaAlreadyOwned", { country: targetCountryName })
            : tf("editor.subareasGoTo", { count: selectedGroup.features.length, country: targetCountryName });
    }
    elements.editorInlineApply.disabled = !hasSelection || !targetOption || sourceAlreadyOwned;
    elements.editorInlineReset.disabled = !hasSelection;
    elements.editorInlineSave.disabled = !dashboardState.runServiceAvailable;
    if (!dashboardState.runServiceAvailable) {
        setInlineEditorStatus(t("editor.startServiceToSave"), "muted");
    } else if (hasSelection && targetOption) {
        setInlineEditorStatus(sourceAlreadyOwned
            ? t("editor.areaAlreadyTarget")
            : tf("editor.countryAnnexesRegion", { country: targetCountryName, region: targetOption.label }), "muted");
    } else {
        setInlineEditorStatus(tf("editor.regionAnnexPrompt", { country: targetCountryName }), "muted");
    }
}
function renderInlineEditorPanel() {
    if (!elements.mapEditorCard) {
        return;
    }
    const editorActive = dashboardState.editorMode;
    elements.mapEditorCard.classList.toggle("map-hidden", !editorActive);
    populateInlineEditorTargetCountries();
    populateInlineEditorTargetRegions(elements.editorInlineTargetCountry?.value);
    const selectedGroup = getInlineEditorSelectedGroup();
    const hasSelection = Boolean(selectedGroup);
    const targetCountryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode);
    const targetCountryName = countryDisplayName(targetCountryCode, displayCountryCode(targetCountryCode));
    const targetSelected = Boolean(dashboardState.editorTargetCountrySelected && targetCountryCode);
    const sourceOwnerCode = hasSelection ? getInlineEditorSourceOwnerCode(selectedGroup) : "";
    const sourceAlreadyOwned = hasSelection && targetSelected && sourceOwnerCode === targetCountryCode;
    const targetOption = getInlineEditorTargetOption();
    if (!editorActive) {
        elements.editorInlineSelectionTitle.textContent = t("editor.noSelection");
        elements.editorInlineSelectionNote.textContent = t("editor.off");
        elements.editorInlineApply.disabled = true;
        elements.editorInlineReset.disabled = true;
        elements.editorInlineSave.disabled = !dashboardState.runServiceAvailable;
        setInlineEditorStatus(t("editor.off"), "muted");
        return;
    }
    if (!targetSelected) {
        elements.editorInlineSelectionTitle.textContent = t("editor.noTargetCountry");
        elements.editorInlineSelectionNote.textContent = t("editor.rightClickCountry");
    } else if (!hasSelection) {
        elements.editorInlineSelectionTitle.textContent = tf("editor.targetAnnexes", { country: targetCountryName });
        elements.editorInlineSelectionNote.textContent = t("editor.rightClickForeignRegion");
    } else {
        elements.editorInlineSelectionTitle.textContent = tf("editor.targetAnnexes", { country: selectedGroup.label });
        elements.editorInlineSelectionNote.textContent = sourceAlreadyOwned
            ? tf("editor.areaAlreadyOwned", { country: targetCountryName })
            : tf("editor.subareasGoTo", { count: selectedGroup.features.length, country: targetCountryName });
    }
    elements.editorInlineApply.disabled = !targetSelected || !hasSelection || !targetOption || sourceAlreadyOwned;
    elements.editorInlineReset.disabled = !hasSelection;
    elements.editorInlineSave.disabled = !dashboardState.runServiceAvailable;
    if (!dashboardState.runServiceAvailable) {
        setInlineEditorStatus(t("editor.startServiceToSave"), "muted");
    } else if (!targetSelected) {
        setInlineEditorStatus(t("editor.targetMissing"), "muted");
    } else if (hasSelection && targetOption) {
        setInlineEditorStatus(sourceAlreadyOwned
            ? t("editor.areaAlreadyTarget")
            : tf("editor.countryAnnexesRegion", { country: targetCountryName, region: selectedGroup.label }), "muted");
    } else {
        setInlineEditorStatus(tf("editor.regionAnnexPrompt", { country: targetCountryName }), "muted");
    }
}
function buildInlineEditorOverridePatch(targetCountryCode, sourceGroup) {
    const definition = VISUAL_REGION_DEFINITIONS[sourceGroup.visualRegionKey] ?? {};
    const dataRegionKey = sourceGroup.dataRegionKey ?? sourceGroup.features?.[0]?.bespRegionKey ?? definition.dataRegionKey ?? null;
    const sourceBespRegionKeys = Array.isArray(sourceGroup.dataRegionKeys) && sourceGroup.dataRegionKeys.length
        ? sourceGroup.dataRegionKeys
        : Array.isArray(definition.dataRegionKeys) && definition.dataRegionKeys.length
            ? definition.dataRegionKeys
            : dataRegionKey
                ? [dataRegionKey]
                : [];
    const targetBespRegionKeys = sourceBespRegionKeys.map((regionKey) => rebaseRegionKeyCountry(regionKey, targetCountryCode));
    const targetDataRegionKey = targetBespRegionKeys[0] ?? (dataRegionKey ? rebaseRegionKeyCountry(dataRegionKey, targetCountryCode) : null);
    const displayDataRegionKey = sourceBespRegionKeys[0] ?? dataRegionKey ?? null;
    return {
        hidden: false,
        targetCountryCode,
        targetName: null,
        sourceBespRegionKeys,
        targetBespRegionKey: targetDataRegionKey,
        targetVisualRegionKey: sourceGroup.visualRegionKey,
        targetVisualRegionLabel: sourceGroup.label ?? definition.label ?? sourceGroup.visualRegionKey,
        targetVisualRegionDataKey: displayDataRegionKey,
        targetVisualRegionDataKeys: sourceBespRegionKeys,
        targetVisualRegionFill: annexedRegionFill(targetCountryCode),
    };
}
function buildCountryOwnerOverridePatch(targetCountryCode) {
    return {
        hidden: false,
        targetCountryCode,
        targetName: null,
    };
}
function replaceInlineEditorOverridesForGroup(group, overridePatch) {
    const nextOverrides = { ...(dashboardState.editorAssignments?.overrides ?? {}) };
    for (const feature of group.features) {
        if (!overridePatch) {
            delete nextOverrides[feature.featureId];
            continue;
        }
        nextOverrides[feature.featureId] = { ...overridePatch };
    }
    dashboardState.editorAssignments = sanitizeMapAssignments({
        updated_at: dashboardState.editorAssignments?.updated_at ?? null,
        overrides: nextOverrides,
    });
}
function replaceInlineEditorOverridesForCountry(sourceCountryCode, targetCountryCode) {
    const normalizedSourceCode = normalizeCountryCode(sourceCountryCode);
    const normalizedTargetCode = normalizeCountryCode(targetCountryCode);
    const nextOverrides = { ...(dashboardState.editorAssignments?.overrides ?? {}) };
    const sourceRegionGroups = getAnnexableRegionGroupsForCountry(normalizedSourceCode);
    for (const group of sourceRegionGroups) {
        const regionPatch = buildInlineEditorOverridePatch(normalizedTargetCode, group);
        for (const feature of group.features) {
            nextOverrides[feature.featureId] = { ...regionPatch };
        }
    }
    const sourceCountryFeatures = (dashboardState.geoData?.countryFeatures ?? [])
        .filter((feature) => normalizeCountryCode(feature.countryCode) === normalizedSourceCode);
    const countryPatch = buildCountryOwnerOverridePatch(normalizedTargetCode);
    for (const feature of sourceCountryFeatures) {
        nextOverrides[feature.featureId] = { ...countryPatch };
    }
    dashboardState.editorAssignments = sanitizeMapAssignments({
        updated_at: dashboardState.editorAssignments?.updated_at ?? null,
        overrides: nextOverrides,
    });
    return {
        regionCount: sourceRegionGroups.length,
        countryFeatureCount: sourceCountryFeatures.length,
    };
}
async function refreshGeoFromEditorAssignments(nextSelection = null) {
    dashboardState.geoData = await loadGeoBoundaryData(dashboardState.editorAssignments);
    dashboardState.visualRegionRowsByYear = new Map();
    dashboardState.countryRowsByYear = new Map();
    if (nextSelection?.type && nextSelection?.key) {
        setEditorSelection(nextSelection.type, nextSelection.key);
    } else {
        clearEditorSelection();
    }
    renderActiveYearState();
}
async function applyInlineEditorAssignment() {
    try {
        const selectedGroup = getInlineEditorSelectedGroup();
        const targetCountryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode || elements.editorInlineTargetCountry?.value);
        const targetSelected = Boolean(dashboardState.editorTargetCountrySelected && targetCountryCode);
        const targetOption = getInlineEditorTargetOption();
        if (!selectedGroup || !targetSelected || !targetOption) {
            setInlineEditorStatus(t("editor.chooseTargetFirst"), "error");
            return;
        }
        const sourceOwnerCode = getInlineEditorSourceOwnerCode(selectedGroup);
        if (sourceOwnerCode === targetCountryCode) {
            setInlineEditorStatus(t("editor.areaAlreadyTarget"), "error");
            return;
        }
        replaceInlineEditorOverridesForGroup(
            selectedGroup,
            buildInlineEditorOverridePatch(targetCountryCode, selectedGroup)
        );
        await refreshGeoFromEditorAssignments();
        setInlineEditorStatus(t("editor.localAssignmentSaved"), "success");
    } catch (error) {
        setInlineEditorStatus(tf("editor.assignmentFailed", { message: error instanceof Error ? error.message : t("error.unknown") }), "error");
    }
}
async function resetInlineEditorAssignment() {
    try {
        const selectedGroup = getInlineEditorSelectedGroup();
        if (!selectedGroup) {
            setInlineEditorStatus(t("editor.noAreaSelected"), "error");
            return;
        }
        replaceInlineEditorOverridesForGroup(selectedGroup, null);
        await refreshGeoFromEditorAssignments();
        setInlineEditorStatus(t("editor.resetDone"), "success");
    } catch (error) {
        setInlineEditorStatus(tf("editor.resetFailed", { message: error instanceof Error ? error.message : t("error.unknown") }), "error");
    }
}
async function saveInlineEditorAssignments() {
    try {
        if (!dashboardState.runServiceAvailable) {
            setInlineEditorStatus(t("editor.saveAssignmentsFirst"), "error");
            return;
        }
        setInlineEditorStatus(t("editor.savingAssignments"), "loading");
        const response = await fetch(MAP_ASSIGNMENTS_API_PATH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dashboardState.editorAssignments),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        dashboardState.editorAssignments = sanitizeMapAssignments(await response.json());
        setInlineEditorStatus(t("editor.assignmentsSaved"), "success");
    } catch (error) {
        setInlineEditorStatus(tf("editor.saveFailed", { message: error instanceof Error ? error.message : t("error.unknown") }), "error");
    }
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
            void startPlayback();
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
        clearHoverOutline();
        resetMapHoverDetails();
    });
}
function bindMapContextMenuEvents() {
    elements.mapRoot?.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
    elements.mapContextMenu?.addEventListener("click", (event) => {
        event.stopPropagation();
    });
    document.addEventListener("click", hideMapContextMenu);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideMapContextMenu();
        }
    });
    window.addEventListener("resize", hideMapContextMenu);
}
function hideMapContextMenu() {
    if (!elements.mapContextMenu) {
        return;
    }
    elements.mapContextMenu.classList.add("map-hidden");
    elements.mapContextMenu.innerHTML = "";
}
function showMapContextMenu(event, title, actions) {
    if (!elements.mapContextMenu) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const menu = elements.mapContextMenu;
    menu.innerHTML = "";
    const titleNode = document.createElement("strong");
    titleNode.className = "map-context-title";
    titleNode.textContent = title;
    menu.appendChild(titleNode);
    for (const action of actions) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "map-context-button";
        button.textContent = action.label;
        button.disabled = Boolean(action.disabled);
        button.addEventListener("click", () => {
            if (button.disabled) {
                return;
            }
            void action.handler();
        });
        menu.appendChild(button);
    }
    menu.classList.remove("map-hidden");
    positionMapContextMenu(event, menu);
}
function positionMapContextMenu(event, menu) {
    const container = elements.mapRoot?.parentElement;
    if (!container) {
        return;
    }
    const containerRect = container.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const padding = 10;
    const rawX = event.clientX - containerRect.left;
    const rawY = event.clientY - containerRect.top;
    const maxX = Math.max(padding, containerRect.width - menuRect.width - padding);
    const maxY = Math.max(padding, containerRect.height - menuRect.height - padding);
    menu.style.left = `${clamp(rawX, padding, maxX)}px`;
    menu.style.top = `${clamp(rawY, padding, maxY)}px`;
}
function setActiveMetric(metricKey) {
    if (!METRIC_VIEWS[metricKey] || metricKey === dashboardState.activeMetric) {
        return;
    }
    dashboardState.activeMetric = metricKey;
    renderActiveYearState();
}
function setMapMode(mode) {
    hideMapContextMenu();
    activeMapMode = mode === "region" ? "region" : "country";
    updateMapModeButtonState();
    applyMapModeVisibility();
    renderMapEventLayer();
    renderPublicSidebar();
    renderInlineEditorPanel();
    resetMapHoverDetails();
}
function setEditorMode(enabled) {
    hideMapContextMenu();
    dashboardState.editorMode = Boolean(enabled);
    if (!dashboardState.editorMode) {
        dashboardState.editorTargetCountrySelected = false;
        clearEditorSelection();
    }
    updateMapModeButtonState();
    applyMapModeVisibility();
    renderMapEventLayer();
    renderPublicSidebar();
    renderInlineEditorPanel();
    resetMapHoverDetails();
}
function updateMapModeButtonState() {
    const editorActive = dashboardState.editorMode;
    elements.mapModeCountryButton.classList.toggle("map-mode-button-active", !editorActive && activeMapMode === "country");
    elements.mapModeRegionButton.classList.toggle("map-mode-button-active", !editorActive && activeMapMode === "region");
    elements.editorModeToggleButton?.classList.toggle("map-mode-button-active", editorActive);
}
function applyMapModeVisibility() {
    const showCountries = activeMapMode === "country";
    elements.countryLayer.classList.toggle("map-hidden", !showCountries);
    elements.countryHoverLayer.classList.toggle("map-hidden", !showCountries);
    elements.countryLabelLayer.classList.toggle("map-hidden", !showCountries);
    elements.regionLayer.classList.toggle("map-hidden", showCountries);
    elements.regionHoverLayer.classList.toggle("map-hidden", showCountries);
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
async function startPlayback() {
    if (!dashboardState.yearKeys.length || dashboardState.playbackTimer) {
        return;
    }
    if (dashboardState.currentYearIndex >= dashboardState.yearKeys.length - 1) {
        if (dashboardState.runServiceAvailable && !dashboardState.isGeneratingRun) {
            await triggerGenerateRun({ runCount: 1, reason: "play-final-year" });
            return;
        }
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
    elements.playbackToggleButton.disabled =
        dashboardState.isReloading
        || dashboardState.isGeneratingRun
        || dashboardState.yearKeys.length < 2;
    elements.reloadExportButton.disabled = dashboardState.isReloading;
    elements.currentYearPill.textContent = activeYearKey || t("status.noYear");
    elements.reloadExportButton.textContent = dashboardState.isReloading ? t("status.reloading") : t("status.reload");
    elements.generateRunButton.disabled = runControlsDisabled;
    elements.generateRunButton.textContent = dashboardState.isGeneratingRun ? t("status.running") : t("status.run");
    elements.runScenarioSelect.disabled = runControlsDisabled;
    elements.runCountInput.disabled = runControlsDisabled;
    elements.runShocksEnabled.disabled = runControlsDisabled;
    const atFinalYear = hasYears && dashboardState.currentYearIndex >= dashboardState.yearKeys.length - 1;
    elements.playbackToggleButton.textContent = dashboardState.playbackTimer
        ? "Pause"
        : atFinalYear && dashboardState.runServiceAvailable
            ? t("status.newRun")
            : "Play";
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
        renderRunBatchSummary(null);
        setExportStatus(RUN_SERVICE_OFFLINE_MESSAGE, "muted");
    } finally {
        updatePlaybackControls();
    }
}
function summarizeRunStatus(runStatus) {
    return {
        scenarioLabel: runStatus?.scenario_name || runStatus?.scenario_code || "Simulation",
        shocksLabel: runStatus?.shocks_enabled ? t("status.shocksOn") : t("status.shocksOff"),
        runCount: Math.max(1, Number.parseInt(String(runStatus?.run_count ?? "1"), 10) || 1),
    };
}
function summarizeLoadedExport(exportData) {
    const scenarioMeta = exportData?.meta?.scenario ?? {};
    const shockMeta = exportData?.meta?.shocks ?? {};
    const baselineYear = exportData?.meta?.baseline_year ?? exportData?.meta?.start_year ?? t("status.unknownYear");
    const scenarioLabel = scenarioMeta.name || scenarioMeta.code || t("status.unknownScenario");
    const shocksLabel = shockMeta.enabled ? t("status.shocksOn") : t("status.shocksOff");
    const eventCount = formatInteger(shockMeta.event_count ?? 0);
    const seedLabel = scenarioMeta.variation_seed || t("status.noSeed");
    return `${scenarioLabel}, ${shocksLabel}, ${eventCount} ${t("status.shockEvents")}, seed ${seedLabel}, baseline ${baselineYear}`;
}
function renderRunBatchSummary(runStatus) {
    if (!elements.runBatchSummary) {
        return;
    }
    const batch = runStatus?.latest_batch;
    const runCount = Math.max(1, Number.parseInt(String(runStatus?.run_count ?? "1"), 10) || 1);
    if (!batch || !Number.isFinite(Number(batch.count))) {
        elements.runBatchSummary.textContent = runCount > 1
            ? tf("status.batchPrepared", { count: runCount })
            : t("status.singleRun");
        return;
    }
    const uniqueSeedCount = new Set(
        (Array.isArray(batch.seeds) ? batch.seeds : [])
            .filter((seed) => typeof seed === "string" && seed.length > 0)
    ).size;
    const hasPopulationSpread = Number(batch.population_max) !== Number(batch.population_min);
    const hasGdpSpread = Number(batch.gdp_max_billion_eur) !== Number(batch.gdp_min_billion_eur);
    const hasUnemploymentSpread = Number(batch.unemployment_max_rate) !== Number(batch.unemployment_min_rate);
    const spreadLabel = (hasPopulationSpread || hasGdpSpread || hasUnemploymentSpread)
        ? t("status.spreadVisible")
        : t("status.noSpread");
    elements.runBatchSummary.textContent = tf("status.latestBatch", {
        count: batch.count,
        populationMin: formatInteger(batch.population_min),
        populationMax: formatInteger(batch.population_max),
        gdpMin: formatDecimal(batch.gdp_min_billion_eur),
        gdpMax: formatDecimal(batch.gdp_max_billion_eur),
        unemploymentMin: formatPercent(batch.unemployment_min_rate),
        unemploymentMax: formatPercent(batch.unemployment_max_rate),
        seedCount: uniqueSeedCount,
        spread: spreadLabel,
    });
}
function renderScenarioOptions(scenarios) {
    const safeScenarios = Array.isArray(scenarios) ? scenarios : [];
    elements.runScenarioSelect.innerHTML = safeScenarios
        .map((scenario) => `
            <option value="${escapeHtml(scenario.code)}">${escapeHtml(scenario.name)}</option>
        `)
        .join("");
    if (!safeScenarios.length) {
        elements.runScenarioSelect.innerHTML = '<option value="">Static preview</option>';
    }
}
function applyRunStatus(runStatus) {
    dashboardState.currentRunStatus = runStatus ?? null;
    const state = String(runStatus?.state ?? "idle");
    dashboardState.isGeneratingRun = state === "running";
    const { scenarioLabel, shocksLabel, runCount } = summarizeRunStatus(runStatus);
    renderRunBatchSummary(runStatus);
    if (state === "running") {
        const completedRuns = Number.parseInt(String(runStatus?.completed_runs ?? "0"), 10) || 0;
        setExportStatus(
            tf("status.generating", {
                runCount,
                scenario: scenarioLabel,
                shocks: shocksLabel,
                completed: completedRuns,
            }),
            "loading"
        );
        startRunStatusPolling();
        return;
    }
    stopRunStatusPolling();
    if (state === "failed") {
        const detail = runStatus?.message ? ` ${runStatus.message}` : "";
        setExportStatus(`${t("status.runFailed")}${detail}`.trim(), "error");
        return;
    }
    if (state === "success") {
        setExportStatus(tf("status.batchReady", { scenario: scenarioLabel, runCount, shocks: shocksLabel }), "success");
        return;
    }
    setExportStatus(dashboardState.runServiceAvailable ? PLAYBACK_HELP_MESSAGE : RUN_SERVICE_OFFLINE_MESSAGE, "muted");
}
async function triggerGenerateRun({ runCount = null, reason = "manual" } = {}) {
    if (!dashboardState.runServiceAvailable || dashboardState.isGeneratingRun) {
        return;
    }
    const requestedRunCount = runCount ?? elements.runCountInput?.value ?? "1";
    const safeRunCount = Math.max(
        1,
        Math.min(100, Number.parseInt(String(requestedRunCount), 10) || 1)
    );
    if (elements.runCountInput && reason === "manual") {
        elements.runCountInput.value = String(safeRunCount);
    }
    dashboardState.isGeneratingRun = true;
    updatePlaybackControls();
    setExportStatus(
        reason === "play-final-year"
            ? t("status.startNewResult")
            : tf("status.startLocalRuns", { runCount: safeRunCount }),
        "loading"
    );
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
                run_count: safeRunCount,
            }),
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload?.message || `HTTP ${response.status}`);
        }
        applyRunStatus(payload);
    } catch (error) {
        dashboardState.isGeneratingRun = false;
        const detail = error instanceof Error ? error.message : t("error.unknown");
        setExportStatus(`${t("status.runStartFailed")} ${detail}`, "error");
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
            setExportStatus(t("status.serviceLost"), "error");
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
        isReload ? t("status.reloadingExport") : t("status.loadingExport"),
        "loading"
    );
    updatePlaybackControls();
    try {
        const exportData = await fetchJson(EXPORT_PATH);
        if (!isValidExport(exportData)) {
            throw new Error(t("status.invalidExport"));
        }
        let geoData = dashboardState.geoData;
        let geoWarning = dashboardState.geoWarning;
        if (!geoData) {
            geoWarning = "";
            try {
                geoData = await loadGeoBoundaryData();
            } catch (error) {
                geoWarning = error instanceof Error ? error.message : "GeoJSON loading failed";
            }
        }
        renderDashboard(exportData, geoData, geoWarning);
        const exportSummary = summarizeLoadedExport(exportData);
        if (dashboardState.runServiceAvailable) {
            setExportStatus(
                tf(isReload ? "status.exportReloaded" : "status.exportLoaded", { summary: exportSummary }),
                "success"
            );
        } else {
            setExportStatus(
                tf(isReload ? "status.exportReloadedStatic" : "status.exportLoadedStatic", { summary: exportSummary }),
                "muted"
            );
        }
    } catch (error) {
        const detail = error instanceof Error ? ` (${error.message})` : "";
        setExportStatus(
            t("status.exportLoadFailed") + detail,
            "error"
        );
        renderLoadError(
            t("status.exportLoadFailedDetail") + detail
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
function sanitizeMapAssignments(payload) {
    const safePayload = payload && typeof payload === "object" ? payload : {};
    const overrides = safePayload.overrides && typeof safePayload.overrides === "object"
        ? safePayload.overrides
        : {};
    return {
        updated_at: safePayload.updated_at ?? null,
        overrides,
    };
}
async function fetchMapAssignmentsPayload() {
    if (dashboardState.runServiceAvailable) {
        try {
            return sanitizeMapAssignments(await fetchJson(MAP_ASSIGNMENTS_API_PATH));
        } catch {
            // Fallback below.
        }
    }
    return sanitizeMapAssignments(await fetchJson(MAP_ASSIGNMENTS_PATH).catch(() => ({ overrides: {} })));
}
async function loadGeoBoundaryData(assignmentPayload = null) {
    if (!dashboardState.geoCollections) {
        const [countryCollections, regionCollections] = await Promise.all([
            Promise.all(GEOJSON_PATHS.country.map((path) => fetchJson(path))),
            Promise.all(GEOJSON_PATHS.region.map((path) => fetchJson(path))),
        ]);
        dashboardState.geoCollections = {
            countryCollections,
            regionCollections,
        };
    }
    const safeAssignments = assignmentPayload ? sanitizeMapAssignments(assignmentPayload) : await fetchMapAssignmentsPayload();
    dashboardState.editorAssignments = safeAssignments;
    const mapAssignments = safeAssignments.overrides ?? {};
    const { countryCollections, regionCollections } = dashboardState.geoCollections;
    const countryFeaturesRaw = countryCollections.flatMap((collection) => collection.features ?? []);
    const regionFeaturesRaw = regionCollections.flatMap((collection) => collection.features ?? []);
    const countryFeatures = countryFeaturesRaw
        .map((feature) => normalizeGeoFeature(feature, "country", mapAssignments))
        .filter((feature) => feature && TARGET_COUNTRIES.has(feature.countryCode));
    const regionFeatures = prepareDetailedRegionFeatures(regionFeaturesRaw
        .map((feature) => normalizeGeoFeature(feature, "region", mapAssignments))
        .filter((feature) => feature && TARGET_COUNTRIES.has(feature.countryCode)));
    const allGeometryFeatures = [...countryFeatures, ...regionFeatures];
    if (!allGeometryFeatures.length) {
        throw new Error("No usable GeoJSON features found");
    }
    const projection = createProjection(allGeometryFeatures);
    const projectedCountryLabelCoordinates = Object.fromEntries(
        Object.entries(COUNTRY_LABEL_COORDINATES).map(([countryCode, [lon, lat]]) => [
            countryCode,
            projection(lon, lat),
        ])
    );
    const projectedCountryFeatures = countryFeatures
        .map((feature) => projectFeature(feature, projection, "country"))
        .filter((feature) => feature !== null);
    const projectedRegionFeatures = regionFeatures
        .map((feature) => projectFeature(feature, projection, "region"))
        .filter((feature) => feature !== null);
    const projectedRegionCorrections = VISUAL_REGION_CORRECTIONS.map((correction) => ({
        ...correction,
        pathD: polygonToPath([correction.coordinates], projection, false),
    }));
    return {
        countryFeatures: projectedCountryFeatures,
        regionFeatures: projectedRegionFeatures,
        regionCorrections: projectedRegionCorrections,
        projectedCountryLabelCoordinates,
        mapAssignments: safeAssignments,
    };
}
function normalizeGeoFeature(feature, layerType, mapAssignments = {}) {
    if (!feature || !feature.geometry || !feature.properties) {
        return null;
    }
    const properties = feature.properties;
    const rawCountryCode = normalizeCountryCode(properties.shapeGroup || properties.shapeISO);
    const adminLevel = String(properties.shapeType ?? "").trim().toUpperCase();
    let countryCode = rawCountryCode;
    let name = String(properties.shapeName ?? "").trim();
    // BESP2074 models Kosovo as part of SRB scope. We keep that mapping in the frontend layer only.
    if (rawCountryCode === "XKX") {
        countryCode = "SRB";
        if (layerType === "region" && adminLevel === "ADM0") {
            name = "Kosovo and Metohija";
        }
    }
    if (!countryCode || !name) {
        return null;
    }
    const featureId = `${layerType}:${rawCountryCode}:${adminLevel}:${normalizeRegionName(name)}`;
    const override = mapAssignments?.[featureId] ?? null;
    if (override?.hidden) {
        return null;
    }
    if (override?.targetCountryCode) {
        countryCode = normalizeCountryCode(override.targetCountryCode);
    }
    if (override?.targetName) {
        name = String(override.targetName).trim() || name;
    }
    return {
        countryCode,
        rawCountryCode,
        adminLevel,
        name,
        geometry: feature.geometry,
        featureId,
        overrideBespRegionKey: override?.targetBespRegionKey ?? null,
        overrideVisualRegionKey: override?.targetVisualRegionKey ?? null,
        overrideVisualRegionLabel: override?.targetVisualRegionLabel ?? null,
        overrideVisualRegionDataKey: override?.targetVisualRegionDataKey ?? null,
        overrideVisualRegionDataKeys: Array.isArray(override?.targetVisualRegionDataKeys)
            ? override.targetVisualRegionDataKeys
            : null,
        overrideVisualRegionFill: override?.targetVisualRegionFill ?? null,
    };
}
function prepareDetailedRegionFeatures(regionFeatures) {
    const bihAdm2Parents = regionFeatures.filter(
        (feature) => feature?.rawCountryCode === "BIH" && feature.adminLevel === "ADM2"
    );
    return regionFeatures
        .map((feature) => applyDetailedRegionOverride(feature, bihAdm2Parents))
        .filter(Boolean)
        .filter((feature) => {
            if (feature.rawCountryCode === "XKX" && feature.adminLevel !== "ADM1") {
                return false;
            }
            if (feature.rawCountryCode === "BIH" && feature.adminLevel === "ADM1") {
                return false;
            }
            if (feature.rawCountryCode === "GRC" && feature.adminLevel === "ADM1") {
                return false;
            }
            if (feature.rawCountryCode === "SVN" && feature.adminLevel === "ADM1") {
                return false;
            }
            if (
                feature.rawCountryCode === "BIH"
                && feature.adminLevel === "ADM2"
                && (normalizeRegionName(feature.name) === "republika srpska"
                    || normalizeRegionName(feature.name) === "brcko")
            ) {
                return false;
            }
            return true;
        });
}
function applyDetailedRegionOverride(feature, bihAdm2Parents) {
    if (
        feature.overrideVisualRegionKey
        || feature.overrideBespRegionKey
        || feature.overrideVisualRegionDataKey
        || feature.overrideVisualRegionDataKeys
    ) {
        return feature;
    }
    if (feature.rawCountryCode === "XKX" && feature.adminLevel === "ADM1") {
        const visualRegionKey = KOSOVO_VISUAL_REGION_KEY;
        const definition = VISUAL_REGION_DEFINITIONS[visualRegionKey];
        return {
            ...feature,
            overrideBespRegionKey: "SRB::kosovo and metohija",
            overrideVisualRegionKey: visualRegionKey,
            overrideVisualRegionLabel: definition.label,
            overrideVisualRegionDataKey: "SRB::kosovo and metohija",
            overrideVisualRegionFill: definition.fill,
        };
    }
    if (feature.rawCountryCode === "BIH" && feature.adminLevel === "ADM2") {
        const featureName = normalizeRegionName(feature.name);
        const visualRegionKey = featureName === "republika srpska" || featureName === "brcko"
            ? "BIH::rs"
            : "BIH::fbih";
        const definition = VISUAL_REGION_DEFINITIONS[visualRegionKey];
        return {
            ...feature,
            overrideBespRegionKey: definition.dataRegionKey,
            overrideVisualRegionKey: visualRegionKey,
            overrideVisualRegionLabel: definition.label,
            overrideVisualRegionDataKey: definition.dataRegionKey,
            overrideVisualRegionFill: definition.fill,
        };
    }
    if (feature.rawCountryCode === "BIH" && feature.adminLevel === "ADM3") {
        const parent = matchBihAdm2Parent(feature, bihAdm2Parents);
        const parentName = normalizeRegionName(parent?.name ?? "");
        if (parentName !== "republika srpska" && parentName !== "brcko") {
            return null;
        }
        const definition = VISUAL_REGION_DEFINITIONS["BIH::rs"];
        return {
            ...feature,
            overrideBespRegionKey: definition.dataRegionKey,
            overrideVisualRegionKey: "BIH::rs",
            overrideVisualRegionLabel: definition.label,
            overrideVisualRegionDataKey: definition.dataRegionKey,
            overrideVisualRegionFill: definition.fill,
        };
    }
    if (feature.rawCountryCode === "GRC" && feature.adminLevel === "ADM2") {
        const visualRegionKey = GRC_ADM2_VISUAL_REGIONS[buildRegionKey("GRC", feature.name)] ?? null;
        const definition = visualRegionKey ? VISUAL_REGION_DEFINITIONS[visualRegionKey] : null;
        if (!definition) {
            return feature;
        }
        return {
            ...feature,
            overrideBespRegionKey: definition.dataRegionKey,
            overrideVisualRegionKey: visualRegionKey,
            overrideVisualRegionLabel: definition.label,
            overrideVisualRegionDataKey: definition.dataRegionKey,
            overrideVisualRegionFill: definition.fill,
        };
    }
    if (feature.rawCountryCode === "SVN" && feature.adminLevel === "NUTS3") {
        const visualRegionKey = SVN_NUTS3_VISUAL_REGIONS[buildRegionKey("SVN", feature.name)] ?? null;
        const definition = visualRegionKey ? VISUAL_REGION_DEFINITIONS[visualRegionKey] : null;
        if (!definition) {
            return feature;
        }
        const sourceBespRegionKey = resolveBespRegionKey(feature.countryCode, feature.properties?.shapeParent ?? feature.name)
            ?? definition.dataRegionKey;
        return {
            ...feature,
            overrideBespRegionKey: sourceBespRegionKey,
            overrideVisualRegionKey: visualRegionKey,
            overrideVisualRegionLabel: definition.label,
            overrideVisualRegionDataKey: sourceBespRegionKey,
            overrideVisualRegionFill: definition.fill,
        };
    }
    return feature;
}
function matchBihAdm2Parent(feature, parentFeatures) {
    return matchFeatureParent(feature, parentFeatures);
}
function matchFeatureParent(feature, parentFeatures) {
    if (!parentFeatures.length) {
        return null;
    }
    const centroid = geometryCentroid(feature.geometry, (lon, lat) => [lon, lat]);
    const containingParent = parentFeatures.find((parent) => geometryContainsPoint(parent.geometry, centroid));
    if (containingParent) {
        return containingParent;
    }
    return parentFeatures.reduce((closest, parent) => {
        const parentCentroid = geometryCentroid(parent.geometry, (lon, lat) => [lon, lat]);
        const distance = squaredDistance(centroid, parentCentroid);
        if (!closest || distance < closest.distance) {
            return { feature: parent, distance };
        }
        return closest;
    }, null)?.feature ?? null;
}
function squaredDistance([ax, ay], [bx, by]) {
    return ((ax - bx) ** 2) + ((ay - by) ** 2);
}
function geometryContainsPoint(geometry, point) {
    const type = geometry?.type;
    const coordinates = geometry?.coordinates;
    if (!type || !coordinates) {
        return false;
    }
    if (type === "Polygon") {
        return polygonContainsPoint(coordinates, point);
    }
    if (type === "MultiPolygon") {
        return coordinates.some((polygon) => polygonContainsPoint(polygon, point));
    }
    return false;
}
function polygonContainsPoint(polygonCoordinates, point) {
    if (!Array.isArray(polygonCoordinates) || !polygonCoordinates.length) {
        return false;
    }
    if (!ringContainsPoint(polygonCoordinates[0], point)) {
        return false;
    }
    return !polygonCoordinates.slice(1).some((ring) => ringContainsPoint(ring, point));
}
function ringContainsPoint(ring, [pointX, pointY]) {
    if (!Array.isArray(ring) || ring.length < 3) {
        return false;
    }
    let inside = false;
    for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
        const [x1, y1] = ring[index];
        const [x2, y2] = ring[previous];
        const crossesY = (y1 > pointY) !== (y2 > pointY);
        if (!crossesY) {
            continue;
        }
        const slopeX = ((x2 - x1) * (pointY - y1)) / ((y2 - y1) || Number.EPSILON);
        if (pointX < x1 + slopeX) {
            inside = !inside;
        }
    }
    return inside;
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
    const includeHoles = false;
    const pathD = geometryToPath(feature.geometry, projection, includeHoles);
    if (!pathD) {
        return null;
    }
    const centroid = geometryCentroid(feature.geometry, projection);
    const projectedArea = geometryProjectedArea(feature.geometry, projection, includeHoles);
    const projectedBounds = geometryProjectedBounds(feature.geometry, projection);
    const key = buildRegionKey(feature.countryCode, feature.name);
    const bespRegionKey = kind === "region"
        ? (feature.overrideBespRegionKey ?? resolveBespRegionKey(feature.countryCode, feature.name))
        : null;
    const visualRegion = kind === "region" ? resolveProjectedVisualRegion(feature, bespRegionKey) : null;
    return {
        ...feature,
        key,
        bespRegionKey,
        visualRegionKey: visualRegion?.visualRegionKey ?? null,
        visualRegionLabel: visualRegion?.label ?? null,
        visualRegionDataKey: visualRegion?.dataRegionKey ?? bespRegionKey,
        visualRegionDataKeys: visualRegion?.dataRegionKeys ?? null,
        visualRegionFill: visualRegion?.fill ?? null,
        pathD,
        centroid,
        projectedArea,
        projectedBounds,
    };
}
function resolveProjectedVisualRegion(feature, bespRegionKey) {
    if (feature.overrideVisualRegionKey) {
        const definition = VISUAL_REGION_DEFINITIONS[feature.overrideVisualRegionKey];
        return {
            visualRegionKey: feature.overrideVisualRegionKey,
            label: feature.overrideVisualRegionLabel ?? definition?.label ?? feature.name,
            dataRegionKey: feature.overrideVisualRegionDataKey ?? definition?.dataRegionKey ?? bespRegionKey,
            dataRegionKeys: Array.isArray(feature.overrideVisualRegionDataKeys)
                ? feature.overrideVisualRegionDataKeys
                : definition?.dataRegionKeys ?? null,
            fill: feature.overrideVisualRegionFill ?? definition?.fill ?? "rgba(126, 143, 161, 0.38)",
        };
    }
    return resolveVisualRegion(feature.countryCode, feature.name, bespRegionKey);
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
function geometryProjectedBounds(geometry, projection) {
    const points = extractCoordinates(geometry).map(([lon, lat]) => projection(lon, lat));
    if (!points.length) {
        return null;
    }
    return points.reduce((bounds, [x, y]) => ({
        minX: Math.min(bounds.minX, x),
        maxX: Math.max(bounds.maxX, x),
        minY: Math.min(bounds.minY, y),
        maxY: Math.max(bounds.maxY, y),
    }), {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
    });
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
    dashboardState.visualRegionRowsByYear = new Map();
    dashboardState.countryRowsByYear = new Map();
    initializeTimelineControls();
    renderActiveYearState();
}
function renderMetaCards(exportData, countryRowCount, regionRowCount, activeYearKey, geoWarning = "") {
    const scenarioMeta = exportData.meta?.scenario ?? {};
    const shockMeta = exportData.meta?.shocks ?? {};
    elements.metaCards.innerHTML = [
        [t("meta.selectedYear"), activeYearKey || "-"],
        [t("meta.startYear"), exportData.meta.start_year],
        [t("meta.endYear"), exportData.meta.end_year],
        [t("meta.scenario"), scenarioMeta.name],
        [t("meta.seed"), scenarioMeta.variation_seed],
        [t("meta.shocks"), shockMeta.enabled ? t("status.on") : t("status.off")],
        [t("meta.shockEvents"), formatInteger(shockMeta.event_count ?? 0)],
        [t("meta.countryRows"), formatInteger(countryRowCount)],
        [t("meta.regionRows"), formatInteger(regionRowCount)],
        [t("meta.yearBlocks"), formatInteger(Object.keys(exportData.years).length)],
        [t("meta.warnings"), formatInteger(exportData.meta.warning_count ?? 0)],
        [t("meta.mapBase"), "ADM0/ADM1/ADM2/ADM3 + groups"],
        [t("meta.expansion"), t("meta.expansionActive")],
        [t("meta.note"), geoWarning],
    ].map(([label, value]) => hasDisplayValue(value) ? buildMetaCard(label, value) : "").join("");
}
function renderActiveYearState() {
    if (!dashboardState.exportData) {
        return;
    }
    const activeYearKey = getActiveYearKey();
    const previousYearKey = dashboardState.yearKeys[dashboardState.currentYearIndex - 1] ?? "";
    const activeRows = buildDisplayRowsForYear(activeYearKey);
    const previousRows = previousYearKey
        ? buildDisplayRowsForYear(previousYearKey)
        : { countryRows: [], regionRows: [], regionSourceMap: new Map(), visualRegionGroups: [] };
    const { countryRows, regionRows } = activeRows;
    if (dashboardState.selectedEventIndex >= getShockEventsForYear(activeYearKey).length) {
        dashboardState.selectedEventIndex = -1;
    }
    dashboardState.currentCountryRows = countryRows;
    dashboardState.currentRegionRows = regionRows;
    mapDataCache.countriesByCode = new Map(countryRows.map((row) => [normalizeCountryCode(row.country_code), row]));
    mapDataCache.previousCountriesByCode = new Map(
        previousRows.countryRows.map((row) => [normalizeCountryCode(row.country_code), row])
    );
    mapDataCache.regionsByKey = activeRows.regionSourceMap;
    mapDataCache.previousRegionsByKey = previousRows.regionSourceMap;
    renderMetaCards(
        dashboardState.exportData,
        dashboardState.countryRowCount,
        dashboardState.regionRowCount,
        activeYearKey,
        dashboardState.geoWarning
    );
    renderCountryLayer(dashboardState.geoData);
    renderRegionLayer(dashboardState.geoData);
    renderMapEventLayer();
    renderPublicSidebar();
    renderMapSummaryCards();
    bindMapHoverEvents();
    bindMapSelectionEvents();
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
            <span class="meta-label">Ladefehler</span>
            <strong class="meta-value">Kein Export geladen</strong>
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
function buildDisplayRowsForYear(yearKey) {
    const { countryRows: sourceCountryRows, regionRows: sourceRegionRows } = buildRowsForYear(dashboardState.exportData, yearKey);
    const regionSourceMap = new Map(sourceRegionRows.map((row) => [buildRegionKey(row.country_code, row.region_name), row]));
    if (!dashboardState.geoData?.regionFeatures?.length) {
        return {
            countryRows: sourceCountryRows,
            regionRows: sourceRegionRows,
            regionSourceMap,
            visualRegionGroups: [],
        };
    }
    const visualRegionGroups = buildVisualRegionGroups(dashboardState.geoData.regionFeatures, regionSourceMap);
    const countryRows = aggregateCountryRowsFromVisualRegions(visualRegionGroups, sourceCountryRows)
        .sort(compareYearAndCountry);
    const countryRowsByCode = new Map(countryRows.map((row) => [normalizeCountryCode(row.country_code), row]));
    const enrichedVisualRegionGroups = enrichVisualRegionGroupsWithCountryState(visualRegionGroups, countryRowsByCode);
    const visualRegionRows = enrichedVisualRegionGroups
        .map((group) => group.displayData)
        .filter(Boolean)
        .sort(compareYearCountryAndRegion);
    return {
        countryRows,
        regionRows: visualRegionRows,
        regionSourceMap,
        visualRegionGroups: enrichedVisualRegionGroups,
    };
}
function aggregateCountryRowsFromVisualRegions(visualRegionGroups, sourceCountryRows) {
    const groupsByOwner = new Map();
    for (const group of visualRegionGroups) {
        if (!group.displayData) {
            continue;
        }
        const ownerCode = normalizeCountryCode(group.countryCode);
        if (!ownerCode) {
            continue;
        }
        const nextRows = groupsByOwner.get(ownerCode) ?? [];
        nextRows.push({
            ...group.displayData,
            country_code: ownerCode,
            country_name: countryDisplayName(ownerCode, group.displayData.country_name ?? ownerCode),
        });
        groupsByOwner.set(ownerCode, nextRows);
    }
    if (!groupsByOwner.size) {
        return sourceCountryRows;
    }
    const sourceCountryRowsByCode = new Map(
        sourceCountryRows.map((row) => [normalizeCountryCode(row.country_code), row])
    );
    const decorateWithSourceState = (row) => {
        const sourceOwnerCode = normalizeCountryCode(row.source_country_code ?? row.country_code);
        const sourceCountryRow = sourceCountryRowsByCode.get(sourceOwnerCode) ?? null;
        if (!sourceCountryRow) {
            return row;
        }
        return {
            ...row,
            source_country_code: sourceOwnerCode,
            source_country_name: countryDisplayName(sourceOwnerCode, sourceCountryRow.country_name ?? row.source_country_name ?? row.country_name),
            corruption_index: Number(sourceCountryRow.corruption_index ?? row.corruption_index),
            stability_index: Number(sourceCountryRow.stability_index ?? row.stability_index),
            investment_climate_index: Number(sourceCountryRow.investment_climate_index ?? row.investment_climate_index),
            budget_balance_pct_gdp: Number(sourceCountryRow.budget_balance_pct_gdp ?? row.budget_balance_pct_gdp),
            debt_to_gdp: Number(sourceCountryRow.debt_to_gdp ?? row.debt_to_gdp),
        };
    };
    return [...groupsByOwner.entries()].map(([countryCode, rows]) => (
        aggregateCountryDisplayRow(countryCode, rows.map(decorateWithSourceState), sourceCountryRowsByCode.get(countryCode) ?? null)
    ));
}
function aggregateCountryDisplayRow(countryCode, rows, baseCountryRow) {
    const base = baseCountryRow ?? rows[0] ?? {};
    const startPopulation = Math.round(sumMetric(rows, "start_population"));
    const endPopulation = Math.round(sumMetric(rows, "end_population"));
    const startGdp = sumMetric(rows, "start_gdp_billion_eur");
    const endGdp = sumMetric(rows, "end_gdp_billion_eur");
    const areaKm2 = sumMetric(rows, "area_km2");
    const averageUnemployment = weightedAverageMetric(rows, "unemployment_rate", "end_population");
    const averageAttractiveness = weightedAverageMetric(rows, "regional_attractiveness", "end_population");
    const averageIntegration = weightedAverageMetric(rows, "integration_index", "end_population");
    const averageInflation = weightedAverageMetric(rows, "inflation_rate", "end_gdp_billion_eur");
    const averageSatisfaction = weightedAverageMetric(rows, "satisfaction_index", "end_population");
    const averageCorruption = weightedAverageMetric(rows, "corruption_index", "end_gdp_billion_eur");
    const averageStability = weightedAverageMetric(rows, "stability_index", "end_population");
    const averageInvestmentClimate = weightedAverageMetric(rows, "investment_climate_index", "end_gdp_billion_eur");
    const averageBudgetBalance = weightedAverageMetric(rows, "budget_balance_pct_gdp", "end_gdp_billion_eur");
    const averageDebt = weightedAverageMetric(rows, "debt_to_gdp", "end_gdp_billion_eur");
    const electionTension = weightedAverageMetric(rows, "election_tension_index", "end_population");
    const electionAlignment = weightedAverageMetric(rows, "election_alignment_index", "end_population");
    const electionShift = weightedAverageMetric(rows, "election_alignment_shift", "end_population");
    return {
        ...base,
        yearKey: base.yearKey ?? rows[0]?.yearKey ?? "",
        start_year: Number(base.start_year ?? rows[0]?.start_year ?? 0),
        end_year: Number(base.end_year ?? rows[0]?.end_year ?? 0),
        country_name: countryDisplayName(countryCode, base.country_name ?? countryCode),
        country_code: countryCode,
        start_population: startPopulation,
        end_population: endPopulation,
        births: Math.round(sumMetric(rows, "births")),
        deaths: Math.round(sumMetric(rows, "deaths")),
        natural_change: Math.round(sumMetric(rows, "natural_change")),
        net_external_migration: Math.round(sumMetric(rows, "net_external_migration")),
        internal_migration: Math.round(sumMetric(rows, "internal_migration")),
        start_gdp_billion_eur: startGdp,
        end_gdp_billion_eur: endGdp,
        gdp_growth_rate: startGdp > 0 ? ((endGdp - startGdp) / startGdp) : Number.NaN,
        gdp_per_capita_eur: endPopulation > 0 ? (endGdp * 1_000_000_000) / endPopulation : Number.NaN,
        average_unemployment_rate: Number.isFinite(averageUnemployment) ? averageUnemployment : averageMetric(rows, "unemployment_rate"),
        average_population_density: areaKm2 > 0 ? endPopulation / areaKm2 : averageMetric(rows, "population_density"),
        average_housing_overload: weightedAverageMetric(rows, "housing_overload", "end_population"),
        average_regional_attractiveness: Number.isFinite(averageAttractiveness) ? averageAttractiveness : averageMetric(rows, "regional_attractiveness"),
        average_integration_index: Number.isFinite(averageIntegration) ? averageIntegration : averageMetric(rows, "integration_index"),
        average_inflation_rate: Number.isFinite(averageInflation) ? averageInflation : averageMetric(rows, "inflation_rate"),
        average_satisfaction_index: Number.isFinite(averageSatisfaction) ? averageSatisfaction : averageMetric(rows, "satisfaction_index"),
        election_tension_index: Number.isFinite(electionTension) ? electionTension : averageMetric(rows, "election_tension_index"),
        election_alignment_index: Number.isFinite(electionAlignment) ? electionAlignment : averageMetric(rows, "election_alignment_index"),
        election_alignment_shift: Number.isFinite(electionShift) ? electionShift : averageMetric(rows, "election_alignment_shift"),
        election_last_year: Number(base.election_last_year ?? rows[0]?.election_last_year ?? 0),
        election_next_year: Number(base.election_next_year ?? rows[0]?.election_next_year ?? 0),
        election_cycle_progress: Number(base.election_cycle_progress ?? rows[0]?.election_cycle_progress ?? 0),
        election_happened_this_year: Boolean(base.election_happened_this_year ?? rows.some((row) => row.election_happened_this_year)),
        corruption_index: Number.isFinite(averageCorruption) ? averageCorruption : Number(base.corruption_index ?? rows[0]?.corruption_index ?? Number.NaN),
        stability_index: Number.isFinite(averageStability) ? averageStability : Number(base.stability_index ?? rows[0]?.stability_index ?? Number.NaN),
        investment_climate_index: Number.isFinite(averageInvestmentClimate) ? averageInvestmentClimate : Number(base.investment_climate_index ?? rows[0]?.investment_climate_index ?? Number.NaN),
        budget_balance_pct_gdp: Number.isFinite(averageBudgetBalance) ? averageBudgetBalance : Number(base.budget_balance_pct_gdp ?? rows[0]?.budget_balance_pct_gdp ?? Number.NaN),
        debt_to_gdp: Number.isFinite(averageDebt) ? averageDebt : Number(base.debt_to_gdp ?? rows[0]?.debt_to_gdp ?? Number.NaN),
        is_border_editor_aggregate: true,
    };
}
function enrichVisualRegionGroupsWithCountryState(visualRegionGroups, countryRowsByCode) {
    return visualRegionGroups.map((group) => {
        const countryRow = countryRowsByCode.get(normalizeCountryCode(group.countryCode)) ?? null;
        return {
            ...group,
            displayData: enrichRegionRowWithCountryState(group.displayData, countryRow),
        };
    });
}
function enrichRegionRowWithCountryState(regionRow, countryRow) {
    if (!regionRow || !countryRow) {
        return regionRow;
    }
    const keepFinite = (regionValue, countryValue) => (
        Number.isFinite(Number(regionValue)) ? regionValue : countryValue
    );
    return {
        ...regionRow,
        corruption_index: keepFinite(regionRow.corruption_index, countryRow.corruption_index),
        stability_index: keepFinite(regionRow.stability_index, countryRow.stability_index),
        investment_climate_index: keepFinite(regionRow.investment_climate_index, countryRow.investment_climate_index),
        budget_balance_pct_gdp: keepFinite(regionRow.budget_balance_pct_gdp, countryRow.budget_balance_pct_gdp),
        debt_to_gdp: keepFinite(regionRow.debt_to_gdp, countryRow.debt_to_gdp),
    };
}
function renderCountryLayer(geoData) {
    const countryDisplayFeatures = getCountryDisplayFeatures(geoData);
    if (!countryDisplayFeatures.length) {
        elements.countryLayer.innerHTML = "";
        elements.countryLabelLayer.innerHTML = "";
        mapDataCache.countryFeaturesByCode = new Map();
        elements.mapSummaryCards.innerHTML = buildEmptyCard("Keine Kartendaten", "Country-GeoJSON konnte nicht geladen werden.");
        return;
    }
    const availableCountryRows = [...mapDataCache.countriesByCode.values()];
    const countryMetricRange = calculateMetricRange(
        availableCountryRows,
        (row) => metricValueFromCountry(row, dashboardState.activeMetric)
    );
    const groupedByCountry = groupBy(countryDisplayFeatures, (feature) => feature.countryCode);
    const groupedCountries = [...groupedByCountry.entries()]
        .map(([countryCode, features]) => {
            const countryPath = features.map((feature) => feature.pathD).join(" ");
            const hoverPathD = countryPath;
            const baseCountryFeature = (geoData.countryFeatures ?? [])
                .find((feature) => feature.countryCode === countryCode && feature.rawCountryCode === countryCode)
                ?? (geoData.countryFeatures ?? []).find((feature) => feature.countryCode === countryCode);
            const labelFeature = baseCountryFeature ?? features.find((feature) => feature.rawCountryCode === countryCode) ?? features[0];
            const centroid = labelFeature?.centroid ?? averageCentroid(features);
            const displayName = countryDisplayName(countryCode, labelFeature?.name ?? countryCode);
            return {
                countryCode,
                displayName,
                pathD: countryPath,
                hoverPathD,
                disableHoverOutline: false,
                centroid,
                labelCoordinate: geoData.projectedCountryLabelCoordinates?.[countryCode] ?? null,
                projectedBounds: mergeProjectedBounds(features),
                features,
            };
        })
        .sort((left, right) => left.countryCode.localeCompare(right.countryCode));
    mapDataCache.countryFeaturesByCode = new Map(
        groupedCountries.map((country) => [country.countryCode, country])
    );
    const countryBackfillMarkup = buildCountryBackfillMarkup(geoData, countryMetricRange);
    const countryShapeMarkup = groupedCountries
        .map((country) => {
            const row = mapDataCache.countriesByCode.get(country.countryCode) ?? null;
            const fill = dashboardState.activeMetric === "classic"
                ? baseCountryFill(country.countryCode)
                : mapMetricFill(
                    metricValueFromCountry(row, dashboardState.activeMetric),
                    countryMetricRange,
                    dashboardState.activeMetric
                );
            const selectedClass = dashboardState.editorMode
                && dashboardState.selectedEditorSelectionType === "country"
                && dashboardState.selectedEditorSelectionKey === country.countryCode
                ? " map-editor-selected"
                : "";
            return `
                <path
                    class="map-country-shape${selectedClass}"
                    data-country-code="${escapeHtml(country.countryCode)}"
                    data-disable-hover-outline="${country.disableHoverOutline ? "true" : "false"}"
                    d="${escapeHtml(country.pathD)}"
                    fill="${escapeHtml(fill)}"
                    fill-rule="nonzero"
                ></path>
            `;
        })
        .join("");
    elements.countryLayer.innerHTML = countryBackfillMarkup + countryShapeMarkup;
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
            const [baseX, baseY] = resolveCountryLabelPosition(country);
            const x = baseX + offsetX;
            const y = baseY + offsetY;
            const detailText = metricDetail?.text ?? "";
            const box = estimateLabelBounds({
                x,
                y,
                labelText: displayCountryCode(country.countryCode),
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
            <text class="map-country-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}">
                ${escapeHtml(displayCountryCode(country.countryCode))}
            </text>
            ${metricDetail ? `
            <text class="map-country-label-detail map-label-detail-${metricDetail.tone}" x="${x.toFixed(1)}" y="${(y + 18).toFixed(1)}">
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
function buildCountryBackfillMarkup(geoData, countryMetricRange) {
    const backfillCountryCodes = new Set(["BIH"]);
    return [...backfillCountryCodes]
        .map((countryCode) => {
            const countryFeature = (geoData?.countryFeatures ?? []).find((feature) => (
                feature.countryCode === countryCode
                && feature.rawCountryCode === countryCode
                && feature.pathD
            ));
            if (!countryFeature) {
                return "";
            }
            const row = mapDataCache.countriesByCode.get(countryCode) ?? null;
            const fill = dashboardState.activeMetric === "classic"
                ? baseCountryFill(countryCode)
                : mapMetricFill(
                    metricValueFromCountry(row, dashboardState.activeMetric),
                    countryMetricRange,
                    dashboardState.activeMetric,
                    baseCountryFill(countryCode)
                );
            return `
                <path
                    class="map-country-backfill"
                    data-country-code="${escapeHtml(countryCode)}"
                    d="${escapeHtml(countryFeature.pathD)}"
                    fill="${escapeHtml(fill)}"
                    fill-rule="nonzero"
                ></path>
            `;
        })
        .join("");
}
function getCountryDisplayFeatures(geoData) {
    const regionFeatures = Array.isArray(geoData?.regionFeatures) ? geoData.regionFeatures : [];
    const ownerRegionFeatures = regionFeatures.filter((feature) => (
        feature?.pathD
        && feature.countryCode
        && TARGET_COUNTRIES.has(feature.countryCode)
        && !feature.hidden
    ));
    if (ownerRegionFeatures.length) {
        return ownerRegionFeatures;
    }
    return (geoData?.countryFeatures ?? []).filter((feature) => (
        feature?.pathD
        && feature.countryCode
        && TARGET_COUNTRIES.has(feature.countryCode)
        && !feature.hidden
    ));
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
function resolveCountryLabelPosition(country) {
    if (Array.isArray(country.labelCoordinate)) {
        return country.labelCoordinate;
    }
    const preferredNames = COUNTRY_LABEL_FEATURE_NAMES[country.countryCode];
    if (preferredNames?.size && Array.isArray(country.features)) {
        const preferredFeature = country.features.find((feature) => preferredNames.has(normalizeRegionName(feature.name)));
        if (preferredFeature?.centroid) {
            return preferredFeature.centroid;
        }
    }
    const anchor = COUNTRY_LABEL_ANCHORS[country.countryCode];
    const bounds = country.projectedBounds;
    if (!anchor || !bounds) {
        return country.centroid;
    }
    const width = Math.max(bounds.maxX - bounds.minX, 1);
    const height = Math.max(bounds.maxY - bounds.minY, 1);
    return [
        bounds.minX + width * anchor[0],
        bounds.minY + height * anchor[1],
    ];
}
function mergeProjectedBounds(features) {
    const validBounds = features
        .map((feature) => feature.projectedBounds)
        .filter(Boolean);
    if (!validBounds.length) {
        return null;
    }
    return validBounds.reduce((merged, bounds) => ({
        minX: Math.min(merged.minX, bounds.minX),
        maxX: Math.max(merged.maxX, bounds.maxX),
        minY: Math.min(merged.minY, bounds.minY),
        maxY: Math.max(merged.maxY, bounds.maxY),
    }), {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
    });
}
function renderRegionLayer(geoData) {
    if (!geoData?.regionFeatures?.length) {
        elements.regionLayer.innerHTML = "";
        elements.regionLabelLayer.innerHTML = "";
        return;
    }
    const groupedRegions = enrichVisualRegionGroupsWithCountryState(
        buildVisualRegionGroups(geoData.regionFeatures, mapDataCache.regionsByKey),
        mapDataCache.countriesByCode
    );
    const previousGroupedRegions = enrichVisualRegionGroupsWithCountryState(
        buildVisualRegionGroups(geoData.regionFeatures, mapDataCache.previousRegionsByKey),
        mapDataCache.previousCountriesByCode
    );
    const regionMetricRange = calculateMetricRange(
        groupedRegions.map((group) => group.displayData).filter(Boolean),
        (row) => metricValueFromRegion(row, dashboardState.activeMetric)
    );
    const affectedRegionKeys = getActiveEventRegionKeys();
    mapDataCache.visualRegionsByKey = new Map(groupedRegions.map((group) => [group.visualRegionKey, group]));
    mapDataCache.previousVisualRegionsByKey = new Map(
        previousGroupedRegions
            .filter((group) => group.displayData)
            .map((group) => [group.visualRegionKey, group.displayData])
    );
    const regionBackfillMarkup = buildRegionBackfillMarkup(geoData, regionMetricRange);
    const regionShapeMarkup = groupedRegions
        .map((group) => {
            const selectedClass = dashboardState.editorMode
                && dashboardState.selectedEditorSelectionType === "region"
                && dashboardState.selectedEditorSelectionKey === group.visualRegionKey
                ? " map-editor-selected"
                : "";
            const eventAffectedClass = isVisualRegionAffectedByEvent(group, affectedRegionKeys)
                ? " map-event-affected"
                : "";
            return `
            <path
                class="map-region-shape${selectedClass}${eventAffectedClass}"
                data-country-code="${escapeHtml(group.countryCode)}"
                data-region-name="${escapeHtml(displayRegionLabel(group))}"
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
                fill-rule="evenodd"
            ></path>
            ${buildInternalGuideMarkup(group, Boolean(eventAffectedClass))}
        `;
        })
        .join("");
    const regionCorrectionMarkup = buildRegionCorrectionMarkup(geoData, groupedRegions, regionMetricRange);
    elements.regionLayer.innerHTML = regionBackfillMarkup + regionShapeMarkup + regionCorrectionMarkup;
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
        const translatedMapLabel = translatedRegionLabel(group.visualRegionKey, { short: true });
        const preferShortLabel = Boolean(translatedMapLabel) || view.abbreviate || REGION_LABEL_ALWAYS_SHORT.has(group.visualRegionKey);
        const labelText = translatedMapLabel || (preferShortLabel ? abbreviateRegionLabel(group) : displayRegionLabel(group));
        if (REGION_LABEL_HIDE.has(group.visualRegionKey)) {
            return null;
        }
        if (!labelText.trim()) {
            return null;
        }
        const metricDetail = view.showDetail ? metricDetailRaw : null;
        const [anchorX, anchorY] = resolveVisualRegionAnchor(group);
        const x = anchorX + offsetX;
        const y = anchorY + offsetY;
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
            forceShow: REGION_LABEL_FORCE_SHOW.has(group.visualRegionKey),
            priority: computeRegionLabelPriority(group, view),
            box,
            html: `
            <g data-visual-region-key="${escapeHtml(group.visualRegionKey)}">
                <text class="${labelClass}" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${escapeHtml(labelText)}</text>
                ${metricDetail ? `<text class="${detailClass} map-label-detail-${metricDetail.tone}" x="${x.toFixed(1)}" y="${(y + 14).toFixed(1)}">${escapeHtml(metricDetail.text)}</text>` : ""}
            </g>
        `,
        };
    }).filter(Boolean);
    elements.regionLabelLayer.innerHTML = selectNonOverlappingLabels(labelCandidates, 2)
        .map((entry) => entry.html)
        .join("");
}
function buildRegionBackfillMarkup(geoData, regionMetricRange) {
    const backfillCountryCodes = new Set(["BIH"]);
    return [...backfillCountryCodes]
        .map((countryCode) => {
            const countryFeature = (geoData?.countryFeatures ?? []).find((feature) => (
                feature.countryCode === countryCode
                && feature.rawCountryCode === countryCode
                && feature.pathD
            ));
            if (!countryFeature) {
                return "";
            }
            const countryRow = mapDataCache.countriesByCode.get(countryCode) ?? null;
            const fill = dashboardState.activeMetric === "classic"
                ? baseCountryFill(countryCode)
                : mapMetricFill(
                    metricValueFromCountry(countryRow, dashboardState.activeMetric),
                    regionMetricRange,
                    dashboardState.activeMetric,
                    baseCountryFill(countryCode)
                );
            return `
            <path
                class="map-region-backfill"
                data-country-code="${escapeHtml(countryCode)}"
                d="${escapeHtml(countryFeature.pathD)}"
                fill="${escapeHtml(fill)}"
                fill-rule="nonzero"
            ></path>
        `;
        })
        .join("");
}
function buildRegionCorrectionMarkup(geoData, groupedRegions, regionMetricRange) {
    const groupsByKey = new Map(groupedRegions.map((group) => [group.visualRegionKey, group]));
    return (geoData?.regionCorrections ?? []).map((correction) => {
        const group = groupsByKey.get(correction.visualRegionKey) ?? null;
        const baseFill = group?.fill ?? "rgba(126, 143, 161, 0.5)";
        const fill = dashboardState.activeMetric === "classic"
            ? baseFill
            : mapMetricFill(
                metricValueFromRegion(group?.displayData ?? null, dashboardState.activeMetric),
                regionMetricRange,
                dashboardState.activeMetric,
                baseFill
            );
        return `
            <path
                class="map-region-correction"
                data-visual-region-key="${escapeHtml(correction.visualRegionKey)}"
                d="${escapeHtml(correction.pathD)}"
                fill="${escapeHtml(fill)}"
                fill-rule="evenodd"
            ></path>
        `;
    }).join("");
}
function renderMapEventLayer() {
    if (!elements.mapEventLayer) {
        return;
    }
    const activeYearKey = getActiveYearKey();
    if (!activeYearKey || !dashboardState.exportData) {
        elements.mapEventLayer.innerHTML = "";
        return;
    }
    const eventOutlineMarkup = buildActiveEventOutlineMarkup();
    const eventPlacements = getVisibleShockEventsForYear(activeYearKey)
        .flatMap(({ event, sourceIndex }) => resolveEventLetterPlacements(event)
            .map((placement) => ({ event, sourceIndex, placement })));
    const eventLetterMarkup = eventPlacements.map(({ event, sourceIndex, placement }, index) => {
        const [baseX, baseY] = placement.position;
        const [offsetX, offsetY] = EVENT_LETTER_OFFSETS[index % EVENT_LETTER_OFFSETS.length];
        const x = clamp(baseX + offsetX, 16, MAP_VIEWBOX_WIDTH - 16);
        const y = clamp(baseY + offsetY, 16, MAP_VIEWBOX_HEIGHT - 16);
        const selectedClass = dashboardState.selectedEventIndex === sourceIndex ? " map-event-letter-selected" : "";
        return `
            <g class="map-event-letter${selectedClass}" data-event-index="${sourceIndex}" data-event-country="${escapeHtml(placement.countryCode ?? "")}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" role="button" aria-label="${escapeHtml(event.shock_name ?? t("event.title"))}">
                <rect class="map-event-letter-hitbox" x="-15" y="-13" width="30" height="26" rx="7"></rect>
                <rect class="map-event-letter-bg" x="-10" y="-8" width="20" height="16" rx="4"></rect>
                <path class="map-event-letter-icon" d="M -8 -5 H 8 V 6 H -8 Z M -8 -5 L 0 1 L 8 -5 M -8 6 L -2 0 M 8 6 L 2 0"></path>
            </g>
        `;
    }).join("");
    elements.mapEventLayer.innerHTML = eventOutlineMarkup + eventLetterMarkup;
    bindMapEventEvents();
}
function buildActiveEventOutlineMarkup() {
    if (activeMapMode !== "region" && !dashboardState.editorMode) {
        return "";
    }
    const affectedRegionKeys = getActiveEventRegionKeys();
    if (!affectedRegionKeys.size || !mapDataCache.visualRegionsByKey?.size) {
        return "";
    }
    const outlineMarkup = [...mapDataCache.visualRegionsByKey.values()]
        .map((group) => buildEventAffectedFeatureMarkup(group, affectedRegionKeys))
        .join("");
    if (!outlineMarkup.trim()) {
        return "";
    }
    return `
        <g class="map-event-outline-layer" pointer-events="none">
            ${outlineMarkup}
        </g>
    `;
}
function resolveEventLetterPlacements(event) {
    const affectedKeys = new Set((event?.affected_region_keys ?? []).map(normalizeEventRegionKey));
    if (affectedKeys.size && mapDataCache.visualRegionsByKey?.size) {
        const groupsByCountry = new Map();
        for (const group of mapDataCache.visualRegionsByKey.values()) {
            if (!isVisualRegionAffectedByEvent(group, affectedKeys)) {
                continue;
            }
            const countryCode = normalizeCountryCode(group.countryCode);
            if (!countryCode) {
                continue;
            }
            if (!groupsByCountry.has(countryCode)) {
                groupsByCountry.set(countryCode, []);
            }
            groupsByCountry.get(countryCode).push(group);
        }
        const placements = [...groupsByCountry.entries()]
            .sort(([leftCode], [rightCode]) => leftCode.localeCompare(rightCode))
            .map(([countryCode, groups]) => {
                const position = weightedVisualRegionCentroid(groups);
                return position ? { countryCode, position } : null;
            })
            .filter(Boolean);
        if (placements.length) {
            return placements;
        }
    }
    const position = resolveEventLetterPosition(event);
    return position ? [{ countryCode: normalizeCountryCode(event?.country_code), position }] : [];
}
function resolveEventLetterPosition(event) {
    const affectedKeys = new Set((event?.affected_region_keys ?? []).map(normalizeEventRegionKey));
    if (affectedKeys.size) {
        const affectedGroups = [...mapDataCache.visualRegionsByKey.values()]
            .filter((group) => isVisualRegionAffectedByEvent(group, affectedKeys));
        const countryCode = normalizeCountryCode(event?.country_code);
        const originGroups = affectedGroups.filter((group) => normalizeCountryCode(group.countryCode) === countryCode);
        const centroid = weightedVisualRegionCentroid(originGroups.length ? originGroups : affectedGroups);
        if (centroid) {
            return centroid;
        }
    }
    const countryCode = normalizeCountryCode(event?.country_code);
    const country = mapDataCache.countryFeaturesByCode.get(countryCode);
    return country ? resolveCountryLabelPosition(country) : null;
}
function weightedVisualRegionCentroid(groups) {
    const weighted = groups
        .map((group) => {
            const [x, y] = resolveVisualRegionAnchor(group);
            const weight = Math.max(Number(group.projectedArea ?? 0), 1);
            return { x, y, weight };
        })
        .filter((entry) => Number.isFinite(entry.x) && Number.isFinite(entry.y) && Number.isFinite(entry.weight));
    const totalWeight = weighted.reduce((total, entry) => total + entry.weight, 0);
    if (!totalWeight) {
        return null;
    }
    return [
        weighted.reduce((total, entry) => total + entry.x * entry.weight, 0) / totalWeight,
        weighted.reduce((total, entry) => total + entry.y * entry.weight, 0) / totalWeight,
    ];
}
function getVisibleShockEventsForYear(yearKey) {
    return getShockEventsForYear(yearKey)
        .map((event, sourceIndex) => ({ event, sourceIndex }))
        .sort((left, right) => Number(right.event.severity_scale ?? 0) - Number(left.event.severity_scale ?? 0))
        .slice(0, 6);
}
function getShockEventsForYear(yearKey) {
    const [startYearText] = String(yearKey).split("-");
    const startYear = Number.parseInt(startYearText, 10);
    if (!Number.isFinite(startYear)) {
        return [];
    }
    const events = Array.isArray(dashboardState.exportData?.shock_events)
        ? dashboardState.exportData.shock_events
        : [];
    return events.filter((event) => Number(event.start_year) === startYear);
}
function getShockEventByIndex(index) {
    const activeYearKey = getActiveYearKey();
    const events = getShockEventsForYear(activeYearKey);
    return events[Number(index)] ?? null;
}
function bindMapEventEvents() {
    if (!elements.mapEventLayer) {
        return;
    }
    for (const node of elements.mapEventLayer.querySelectorAll(".map-event-letter")) {
        const openEventLetter = (event) => {
            event.stopPropagation();
            event.preventDefault();
            dashboardState.selectedEventIndex = Number(node.getAttribute("data-event-index"));
            const shockEvent = getShockEventByIndex(dashboardState.selectedEventIndex);
            if (shockEvent) {
                renderEventDetails(shockEvent);
            }
            renderMapEventLayer();
            renderRegionLayer(dashboardState.geoData);
            bindMapSelectionEvents();
            bindMapHoverEvents();
        };
        node.addEventListener("click", openEventLetter);
        node.addEventListener("pointerup", openEventLetter);
    }
}
function getActiveEventRegionKeys() {
    const activeYearKey = getActiveYearKey();
    const keys = new Set();
    for (const { event } of getVisibleShockEventsForYear(activeYearKey)) {
        for (const key of event.affected_region_keys ?? []) {
            keys.add(normalizeEventRegionKey(key));
        }
    }
    return keys;
}
function normalizeEventRegionKey(regionKey) {
    const [countryCode, regionName = ""] = String(regionKey ?? "").split("::");
    return buildRegionKey(countryCode, regionName);
}
function isVisualRegionAffectedByEvent(group, affectedRegionKeys) {
    if (!affectedRegionKeys?.size || !group) {
        return false;
    }
    const candidates = new Set([
        buildRegionKey(group.countryCode, group.label),
        normalizeEventRegionKey(group.dataRegionKey),
        ...(Array.isArray(group.dataRegionKeys) ? group.dataRegionKeys.map(normalizeEventRegionKey) : []),
        ...(Array.isArray(group.features)
            ? group.features.flatMap((feature) => [
                normalizeEventRegionKey(feature.bespRegionKey),
                normalizeEventRegionKey(feature.visualRegionDataKey),
                ...(Array.isArray(feature.visualRegionDataKeys) ? feature.visualRegionDataKeys.map(normalizeEventRegionKey) : []),
            ])
            : []),
    ]);
    return [...candidates].some((key) => key && affectedRegionKeys.has(key));
}
function isFeatureAffectedByEvent(feature, affectedRegionKeys) {
    if (!feature || !affectedRegionKeys?.size) {
        return false;
    }
    const candidates = [
        normalizeEventRegionKey(feature.bespRegionKey),
        normalizeEventRegionKey(feature.visualRegionDataKey),
        ...(Array.isArray(feature.visualRegionDataKeys) ? feature.visualRegionDataKeys.map(normalizeEventRegionKey) : []),
    ];
    return candidates.some((key) => key && affectedRegionKeys.has(key));
}
function renderEventDetails(event) {
    const title = event.shock_name || event.message || t("event.title");
    const regionNames = formatEventAffectedRegions(event);
    const effects = [
        `GDP ${formatSignedPercent(Number(event.gdp_growth_bias ?? 0))}`,
        `Jobs ${formatSignedPercent(Number(event.unemployment_bias ?? 0))}`,
        `Migration ${formatSignedPercent(Number(event.net_migration_rate_shift ?? 0))}`,
    ].join(" | ");
    setMapHoverDetails(
        `${title} (${displayCountryCode(event.country_code)})`,
        buildHoverDetailGrid([
            buildHoverDetailRow(t("event.year"), String(event.start_year ?? "-")),
            buildHoverDetailRow(t("event.regions"), regionNames),
            buildHoverDetailRow(t("event.effects"), effects),
            buildHoverDetailRow(t("event.description"), event.message || event.description || title),
        ]),
        true
    );
}
function formatEventAffectedRegions(event) {
    const affectedKeys = Array.isArray(event?.affected_region_keys) ? event.affected_region_keys : [];
    const affectedCountries = new Set(
        affectedKeys
            .map((key) => normalizeCountryCode(String(key ?? "").split("::")[0]))
            .filter(Boolean)
    );
    const includeCountry = affectedCountries.size > 1;
    const labelsFromKeys = affectedKeys
        .map((key) => formatEventRegionKeyLabel(key, { includeCountry }))
        .filter(Boolean);
    if (labelsFromKeys.length) {
        return [...new Set(labelsFromKeys)].join(", ");
    }
    if (Array.isArray(event?.affected_region_names) && event.affected_region_names.length) {
        return event.affected_region_names.join(", ");
    }
    return t("event.countryWide");
}
function formatEventRegionKeyLabel(regionKey, { includeCountry = false } = {}) {
    const resolvedKey = resolveVisualRegionKeyFromDataRegionKey(regionKey);
    const translated = translatedRegionLabel(resolvedKey, { short: false });
    const countryCode = normalizeCountryCode(String(regionKey ?? "").split("::")[0]);
    if (translated) {
        return includeCountry ? `${displayCountryCode(countryCode)}: ${translated}` : translated;
    }
    return humanizeEventRegionKey(regionKey);
}
function humanizeEventRegionKey(regionKey) {
    const [countryCode, rawRegionName = ""] = String(regionKey ?? "").split("::");
    const displayCode = displayCountryCode(countryCode);
    const regionName = rawRegionName
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.length <= 3 ? part.toUpperCase() : `${part[0].toUpperCase()}${part.slice(1)}`)
        .join(" ");
    return regionName ? `${displayCode}: ${regionName}` : displayCode;
}
function resolveVisualRegionKeyFromDataRegionKey(regionKey) {
    const normalizedKey = normalizeEventRegionKey(regionKey);
    if (REGION_LABEL_TRANSLATIONS[normalizedKey]) {
        return normalizedKey;
    }
    for (const [visualRegionKey, definition] of Object.entries(VISUAL_REGION_DEFINITIONS)) {
        const candidates = [
            definition.dataRegionKey,
            ...(Array.isArray(definition.dataRegionKeys) ? definition.dataRegionKeys : []),
        ].map(normalizeEventRegionKey);
        if (candidates.includes(normalizedKey)) {
            return visualRegionKey;
        }
    }
    return normalizedKey;
}
function truncateText(text, maxLength) {
    const value = String(text ?? "");
    if (value.length <= maxLength) {
        return value;
    }
    return `${value.slice(0, Math.max(maxLength - 1, 1))}…`;
}
function chooseRegionLabelView(group) {
    const isMetric = !isClassicMetricView();
    const area = Number(group.projectedArea ?? 0);
    const share = Number(group.areaShare ?? 0);
    const fallbackProvince = !VISUAL_REGION_DEFINITIONS[group.visualRegionKey];
    const forceShow = REGION_LABEL_FORCE_SHOW.has(group.visualRegionKey);
    const alwaysShort = REGION_LABEL_ALWAYS_SHORT.has(group.visualRegionKey);
    const alwaysCompact = REGION_LABEL_ALWAYS_COMPACT.has(group.visualRegionKey);
    const tiny = area < 900;
    const compact = alwaysCompact || (fallbackProvince
        ? area < 1700 || share < 0.16
        : (forceShow ? (area < 1100 || share < 0.14) : (area < 1500 || share < 0.22)));
    return {
        abbreviate: alwaysShort || compact || ((!forceShow) && area < 2200) || fallbackProvince,
        showDetail: isMetric && !tiny,
        compact,
        labelFontPx: alwaysCompact ? 9.6 : (fallbackProvince ? 10.2 : (compact ? 10.5 : 12)),
        detailFontPx: alwaysCompact ? 7.8 : (fallbackProvince ? 8.2 : (compact ? 8.4 : 9.5)),
    };
}
function abbreviateRegionLabel(group) {
    const translatedShort = translatedRegionLabel(group.visualRegionKey, { short: true });
    if (translatedShort) {
        return translatedShort;
    }
    if (Object.prototype.hasOwnProperty.call(REGION_LABEL_SHORT, group.visualRegionKey)) {
        return REGION_LABEL_SHORT[group.visualRegionKey];
    }
    if (!VISUAL_REGION_DEFINITIONS[group.visualRegionKey]) {
        return group.label
            .replace(/^City of /i, "")
            .replace(/ County$/i, "")
            .replace(/ and /gi, " & ")
            .replace(/-Neretva/i, "-Ner.")
            .replace(/-Bilogora/i, "-Bil.")
            .replace(/-Krisevci/i, "-Kriz.")
            .replace(/-Moslavina/i, "-Mos.")
            .replace(/-Baranja/i, "-Bar.")
            .replace(/-Slavonia/i, "-Slav.")
            .replace(/-Podravina/i, "-Pod.")
            .replace(/-Syrmia/i, "-Syr.")
            .replace(/-Zagorje/i, "-Zag.")
            .replace(/-Esztergom/i, "-Eszt.")
            .replace(/-Szatmar/i, "-Szat.")
            .replace(/-Bihor/i, "-Bih.")
            .replace(/-Nasaud/i, "-Nas.")
            .replace(/-Severin/i, "-Sev.");
    }
    return group.label;
}
function computeRegionLabelPriority(group, view) {
    const area = Number(group.projectedArea ?? 0);
    const share = Number(group.areaShare ?? 0);
    return area
        + (view.showDetail ? 800 : 0)
        + share * 500
        + (REGION_LABEL_PRIORITY_BOOST[group.visualRegionKey] ?? 0);
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
    const sorted = [...candidates].sort((a, b) => {
        const forceDiff = Number(Boolean(b.forceShow)) - Number(Boolean(a.forceShow));
        return forceDiff !== 0 ? forceDiff : b.priority - a.priority;
    });
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
        const dataRegionAreas = new Map();
        for (const feature of features) {
            const keys = Array.isArray(feature.visualRegionDataKeys) && feature.visualRegionDataKeys.length
                ? feature.visualRegionDataKeys
                : [feature.visualRegionDataKey ?? template?.dataRegionKey].filter(Boolean);
            const featureAreaShare = Math.max(Number(feature.projectedArea ?? 0), 0) / Math.max(keys.length, 1);
            for (const key of keys) {
                dataRegionAreas.set(key, (dataRegionAreas.get(key) ?? 0) + featureAreaShare);
            }
        }
        const featureDataRegionKeys = [...dataRegionAreas.keys()].filter(Boolean);
        const overrideFill = features.find((feature) => feature.visualRegionFill)?.visualRegionFill ?? null;
        return {
            visualRegionKey,
            label: template?.label ?? features[0]?.visualRegionLabel ?? visualRegionKey,
            dataRegionKey: featureDataRegionKeys[0] ?? template?.dataRegionKey ?? features[0]?.visualRegionDataKey ?? null,
            dataRegionKeys: featureDataRegionKeys.length
                ? featureDataRegionKeys
                : Array.isArray(template?.dataRegionKeys) ? template.dataRegionKeys : null,
            dataRegionAreas: Object.fromEntries(dataRegionAreas),
            countryCode: features[0]?.countryCode ?? "",
            sourceCountryCode: features[0]?.rawCountryCode ?? features[0]?.sourceCountryCode ?? features[0]?.countryCode ?? "",
            features,
            fill: overrideFill ?? template?.fill ?? "rgba(126, 143, 161, 0.5)",
            centroid: averageCentroid(features),
            projectedBounds: mergeProjectedBounds(features),
            projectedArea: features.reduce((sum, feature) => sum + (feature.projectedArea ?? 0), 0),
            pathD: mergedPathD,
        };
    });
    const areaTotalsByDataKey = new Map();
    for (const group of groupedVisualRegions) {
        const entries = Object.entries(group.dataRegionAreas ?? {});
        if (entries.length) {
            for (const [dataRegionKey, area] of entries) {
                areaTotalsByDataKey.set(dataRegionKey, (areaTotalsByDataKey.get(dataRegionKey) ?? 0) + area);
            }
            continue;
        }
        if (group.dataRegionKey) {
            areaTotalsByDataKey.set(group.dataRegionKey, (areaTotalsByDataKey.get(group.dataRegionKey) ?? 0) + group.projectedArea);
        }
    }
    return groupedVisualRegions.map((group) => {
        const withOwner = (displayData) => displayData
            ? {
                ...displayData,
                source_country_code: displayData.source_country_code ?? group.sourceCountryCode ?? displayData.country_code,
                source_country_name: displayData.source_country_name ?? displayData.country_name,
                country_code: group.countryCode,
                country_name: countryDisplayName(group.countryCode, displayData.country_name ?? group.countryCode),
            }
            : null;
        const dataRegionShares = Object.entries(group.dataRegionAreas ?? {})
            .map(([regionKey, area]) => {
                const totalArea = areaTotalsByDataKey.get(regionKey) ?? 0;
                return {
                    regionKey,
                    share: totalArea > 0 ? area / totalArea : 1,
                };
            })
            .filter((entry) => entry.regionKey && entry.share > 0);
        if (dataRegionShares.length) {
            return {
                ...group,
                areaShare: dataRegionShares.reduce((sum, entry) => sum + entry.share, 0),
                dataRegionShares,
                displayData: withOwner(buildVisualRegionDisplayData({ ...group, dataRegionShares }, 1, regionSourceMap)),
            };
        }
        const totalArea = areaTotalsByDataKey.get(group.dataRegionKey) ?? 0;
        const areaShare = totalArea > 0 ? group.projectedArea / totalArea : 1;
        return {
            ...group,
            areaShare,
            displayData: withOwner(buildVisualRegionDisplayData(group, areaShare, regionSourceMap)),
        };
    });
}
function buildInternalGuideMarkup(group, eventAffected = false) {
    const affectedClass = eventAffected ? " map-event-affected-guides" : "";
    if (REAL_SUBDIVISION_VISUAL_REGION_KEYS.has(group.visualRegionKey) && Array.isArray(group.features) && group.features.length > 1) {
        return `
        <g class="map-region-guide-wrap${affectedClass}" pointer-events="none">
            ${group.features.map((feature) => `
                <path
                    class="map-region-guide map-region-guide-real"
                    d="${escapeHtml(feature.pathD)}"
                ></path>
            `).join("")}
        </g>
    `;
    }
    const guideConfig = VISUAL_REGION_INTERNAL_GUIDES[group.visualRegionKey];
    const bounds = group.projectedBounds;
    if (!guideConfig || !bounds) {
        return "";
    }
    const guideSegments = Array.isArray(guideConfig) ? guideConfig : (guideConfig.segments ?? []);
    const guideLabels = Array.isArray(guideConfig)
        ? []
        : ((guideConfig.showLabels ?? false) ? (guideConfig.labels ?? []) : []);
    const guideTension = Array.isArray(guideConfig) ? 0.85 : Number(guideConfig.tension ?? 0.85);
    if (!guideSegments.length && !guideLabels.length) {
        return "";
    }
    const width = Math.max(bounds.maxX - bounds.minX, 1);
    const height = Math.max(bounds.maxY - bounds.minY, 1);
    const clipId = `guide-clip-${group.visualRegionKey.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
    const linePaths = guideSegments.map((segment) => {
        const points = segment.map(([nx, ny]) => {
            const x = bounds.minX + width * nx;
            const y = bounds.minY + height * ny;
            return [x, y];
        });
        return `
            <path
                class="map-region-guide"
                d="${escapeHtml(buildSmoothGuidePath(points, guideTension))}"
                clip-path="url(#${escapeHtml(clipId)})"
            ></path>
        `;
    }).join("");
    const labelMarkup = guideLabels.map(({ text, x, y }) => {
        const px = bounds.minX + width * x;
        const py = bounds.minY + height * y;
        return `
            <text
                class="map-region-guide-label"
                x="${px.toFixed(1)}"
                y="${py.toFixed(1)}"
                clip-path="url(#${escapeHtml(clipId)})"
            >${escapeHtml(text)}</text>
        `;
    }).join("");
    return `
        <defs>
            <clipPath id="${escapeHtml(clipId)}">
                <path d="${escapeHtml(group.pathD)}"></path>
            </clipPath>
        </defs>
        <g class="map-region-guide-wrap${affectedClass}" pointer-events="none">
            ${linePaths}
            ${labelMarkup}
        </g>
    `;
}
function buildEventAffectedFeatureMarkup(group, affectedRegionKeys) {
    if (!group || !affectedRegionKeys?.size) {
        return "";
    }
    const groupAffected = isVisualRegionAffectedByEvent(group, affectedRegionKeys);
    const affectedFeatures = Array.isArray(group.features)
        ? group.features.filter((feature) => isFeatureAffectedByEvent(feature, affectedRegionKeys))
        : [];
    const paths = affectedFeatures.length
        ? affectedFeatures.map((feature) => feature.pathD).filter(Boolean)
        : (groupAffected && Array.isArray(group.features) && group.features.length > 1
            ? group.features.map((feature) => feature.pathD).filter(Boolean)
            : (groupAffected && group.pathD ? [group.pathD] : []));
    if (!paths.length) {
        return "";
    }
    return `
        <g class="map-event-feature-outline-wrap" pointer-events="none">
            ${paths.map((pathD) => `
                <path
                    class="map-event-feature-outline"
                    d="${escapeHtml(pathD)}"
                    fill="none"
                ></path>
            `).join("")}
        </g>
    `;
}
function buildSmoothGuidePath(points, tension = 0.85) {
    if (!Array.isArray(points) || points.length === 0) {
        return "";
    }
    if (points.length === 1) {
        const [x, y] = points[0];
        return `M ${x.toFixed(2)},${y.toFixed(2)}`;
    }
    if (points.length === 2) {
        return `M ${points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" L ")}`;
    }
    const safeTension = clamp(tension, 0.2, 1.2);
    let path = "";
    for (let index = 0; index < points.length; index += 1) {
        const [x, y] = points[index];
        if (index === 0) {
            path += `M ${x.toFixed(2)},${y.toFixed(2)}`;
            continue;
        }
        const p0 = points[index - 2] ?? points[index - 1];
        const p1 = points[index - 1];
        const p2 = points[index];
        const p3 = points[index + 1] ?? points[index];
        const cp1x = p1[0] + ((p2[0] - p0[0]) * safeTension) / 6;
        const cp1y = p1[1] + ((p2[1] - p0[1]) * safeTension) / 6;
        const cp2x = p2[0] - ((p3[0] - p1[0]) * safeTension) / 6;
        const cp2y = p2[1] - ((p3[1] - p1[1]) * safeTension) / 6;
        path += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
    }
    return path;
}
function resolveVisualRegionAnchor(group) {
    const bounds = group.projectedBounds;
    const anchor = VISUAL_REGION_LABEL_ANCHORS[group.visualRegionKey];
    if (!bounds || !anchor) {
        return group.centroid;
    }
    const width = Math.max(bounds.maxX - bounds.minX, 1);
    const height = Math.max(bounds.maxY - bounds.minY, 1);
    return [
        bounds.minX + width * anchor[0],
        bounds.minY + height * anchor[1],
    ];
}
function buildVisualRegionDisplayData(group, areaShare, regionSourceMap) {
    if (Array.isArray(group.dataRegionShares) && group.dataRegionShares.length > 0) {
        const sourceRows = group.dataRegionShares
            .map(({ regionKey, share }) => {
                const source = regionSourceMap.get(regionKey) ?? null;
                return source ? scaleVisualRegionSourceRow(source, share) : null;
            })
            .filter(Boolean);
        if (!sourceRows.length) {
            return null;
        }
        return aggregateVisualRegionRows(group, sourceRows);
    }
    if (Array.isArray(group.dataRegionKeys) && group.dataRegionKeys.length > 0) {
        const sourceRows = group.dataRegionKeys
            .map((regionKey) => regionSourceMap.get(regionKey) ?? null)
            .filter(Boolean);
        if (!sourceRows.length) {
            return null;
        }
        return aggregateVisualRegionRows(group, sourceRows);
    }
    const source = group.dataRegionKey ? regionSourceMap.get(group.dataRegionKey) : null;
    if (!source) {
        return null;
    }
    const share = Number.isFinite(areaShare) && areaShare > 0 ? areaShare : 1;
    const scaledSource = scaleVisualRegionSourceRow(source, share);
    return {
        ...scaledSource,
        visual_region_key: group.visualRegionKey,
        region_name: group.label,
        source_region_name: VISUAL_REGION_SOURCE_NAME_OVERRIDES[group.visualRegionKey] ?? source.region_name,
        is_visual_split: normalizeRegionName(group.label) !== normalizeRegionName(source.region_name),
    };
}
function scaleVisualRegionSourceRow(source, share) {
    const safeShare = Number.isFinite(share) && share > 0 ? share : 1;
    const scaledPopulation = Math.max(0, Math.round(source.end_population * safeShare));
    const scaledStartPopulation = Math.max(0, Math.round(source.start_population * safeShare));
    const scaledEndGdp = source.end_gdp_billion_eur * safeShare;
    const scaledStartGdp = source.start_gdp_billion_eur * safeShare;
    return {
        ...source,
        start_population: scaledStartPopulation,
        end_population: scaledPopulation,
        births: Math.round(source.births * safeShare),
        deaths: Math.round(source.deaths * safeShare),
        natural_change: Math.round(source.natural_change * safeShare),
        net_external_migration: Math.round(source.net_external_migration * safeShare),
        internal_migration: Math.round(source.internal_migration * safeShare),
        start_gdp_billion_eur: scaledStartGdp,
        end_gdp_billion_eur: scaledEndGdp,
        gdp_per_capita_eur: scaledPopulation > 0 ? (scaledEndGdp * 1_000_000_000) / scaledPopulation : 0,
    };
}
function aggregateVisualRegionRows(group, sourceRows) {
    const base = sourceRows[0];
    const startPopulation = sumMetric(sourceRows, "start_population");
    const endPopulation = sumMetric(sourceRows, "end_population");
    const startGdp = sumMetric(sourceRows, "start_gdp_billion_eur");
    const endGdp = sumMetric(sourceRows, "end_gdp_billion_eur");
    const weightedUnemployment = weightedAverageMetric(sourceRows, "unemployment_rate", "end_population");
    const weightedAttractiveness = weightedAverageMetric(sourceRows, "regional_attractiveness", "end_population");
    const weightedIntegration = weightedAverageMetric(sourceRows, "integration_index", "end_population");
    const weightedInflation = weightedAverageMetric(sourceRows, "inflation_rate", "end_gdp_billion_eur");
    const weightedSatisfaction = weightedAverageMetric(sourceRows, "satisfaction_index", "end_population");
    const weightedElectionTension = weightedAverageMetric(sourceRows, "election_tension_index", "end_population");
    const weightedElectionAlignment = weightedAverageMetric(sourceRows, "election_alignment_index", "end_population");
    const weightedElectionShift = weightedAverageMetric(sourceRows, "election_alignment_shift", "end_population");
    return {
        ...base,
        visual_region_key: group.visualRegionKey,
        region_name: group.label,
        source_region_name: sourceRows.map((row) => row.region_name).join(" + "),
        start_population: startPopulation,
        end_population: endPopulation,
        births: Math.round(sumMetric(sourceRows, "births")),
        deaths: Math.round(sumMetric(sourceRows, "deaths")),
        natural_change: Math.round(sumMetric(sourceRows, "natural_change")),
        net_external_migration: Math.round(sumMetric(sourceRows, "net_external_migration")),
        internal_migration: Math.round(sumMetric(sourceRows, "internal_migration")),
        start_gdp_billion_eur: startGdp,
        end_gdp_billion_eur: endGdp,
        gdp_growth_rate: startGdp > 0 ? ((endGdp - startGdp) / startGdp) : 0,
        unemployment_rate: Number.isFinite(weightedUnemployment) ? weightedUnemployment : averageMetric(sourceRows, "unemployment_rate"),
        regional_attractiveness: Number.isFinite(weightedAttractiveness) ? weightedAttractiveness : averageMetric(sourceRows, "regional_attractiveness"),
        integration_index: Number.isFinite(weightedIntegration) ? weightedIntegration : averageMetric(sourceRows, "integration_index"),
        inflation_rate: Number.isFinite(weightedInflation) ? weightedInflation : averageMetric(sourceRows, "inflation_rate"),
        satisfaction_index: Number.isFinite(weightedSatisfaction) ? weightedSatisfaction : averageMetric(sourceRows, "satisfaction_index"),
        election_tension_index: Number.isFinite(weightedElectionTension) ? weightedElectionTension : averageMetric(sourceRows, "election_tension_index"),
        election_alignment_index: Number.isFinite(weightedElectionAlignment) ? weightedElectionAlignment : averageMetric(sourceRows, "election_alignment_index"),
        election_alignment_shift: Number.isFinite(weightedElectionShift) ? weightedElectionShift : averageMetric(sourceRows, "election_alignment_shift"),
        election_last_year: Number(base.election_last_year ?? 0),
        election_next_year: Number(base.election_next_year ?? 0),
        election_cycle_progress: Number(base.election_cycle_progress ?? 0),
        election_happened_this_year: Boolean(base.election_happened_this_year),
        gdp_per_capita_eur: endPopulation > 0 ? (endGdp * 1_000_000_000) / endPopulation : 0,
        is_visual_split: true,
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
        const activate = () => {
            setActiveHoverNode(node);
            enterHandler(node);
        };
        node.addEventListener("mouseenter", activate);
        node.addEventListener("pointerenter", activate);
        node.addEventListener("mousemove", activate);
    }
}
function bindEditorMapEvents() {
    for (const node of elements.countryLayer.querySelectorAll(".map-country-shape")) {
        node.addEventListener("click", () => {
            if (!dashboardState.editorMode) {
                return;
            }
            const countryCode = normalizeCountryCode(node.getAttribute("data-country-code"));
            if (!setInlineEditorTargetCountry(countryCode)) {
                setInlineEditorStatus(t("editor.countryCannotAnnex"), "error");
                return;
            }
            renderActiveYearState();
            setMapHoverDetails(
                tf("editor.targetAnnexes", { country: countryDisplayName(countryCode, displayCountryCode(countryCode)) }),
                t("editor.switchRegionHint")
            );
            return;
        });
    }
    for (const node of elements.regionLayer.querySelectorAll(".map-region-shape")) {
        node.addEventListener("click", () => {
            if (!dashboardState.editorMode) {
                return;
            }
            setEditorSelection("region", String(node.getAttribute("data-visual-region-key") ?? ""));
            syncInlineEditorTargetRegionForSource(getInlineEditorSelectedGroup());
            renderActiveYearState();
            setMapHoverDetails(
                tf("editor.targetAnnexes", { country: String(node.getAttribute("data-region-name") ?? "Region") }),
                t("editor.takeRegionHint")
            );
            return;
        });
    }
}
function bindMapSelectionEvents() {
    for (const node of elements.countryLayer.querySelectorAll(".map-country-shape")) {
        node.addEventListener("click", () => {
            if (!dashboardState.editorMode) {
                return;
            }
            const countryCode = normalizeCountryCode(node.getAttribute("data-country-code"));
            selectInlineEditorTargetCountryFromMap(countryCode, { switchToRegion: false });
        });
        node.addEventListener("contextmenu", (event) => {
            const countryCode = normalizeCountryCode(node.getAttribute("data-country-code"));
            const countryName = countryDisplayName(countryCode, displayCountryCode(countryCode));
            const canUseAsTarget = getInlineEditorTargetCountryCodes().includes(countryCode);
            const hasExplicitTarget = Boolean(dashboardState.editorMode && dashboardState.editorTargetCountrySelected);
            const targetCountryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode);
            const targetCountryName = countryDisplayName(targetCountryCode, displayCountryCode(targetCountryCode));
            const isCurrentTarget = hasExplicitTarget && countryCode === targetCountryCode;
            const canAnnexCountry = Boolean(hasExplicitTarget && !isCurrentTarget && getAnnexableRegionGroupsForCountry(countryCode).length);
            const annexCountryAction = {
                label: hasExplicitTarget
                    ? (dashboardState.language === "de" ? `Land an ${targetCountryName} annektieren` : `Annex country to ${targetCountryName}`)
                    : t("editor.chooseTargetFirst"),
                disabled: !canAnnexCountry,
                handler: () => annexCountryToSelectedCountry(countryCode),
            };
            const showRegionsAction = {
                label: t("editor.showRegions"),
                handler: () => {
                    setMapMode("region");
                    setMapHoverDetails(countryName, t("editor.rightClickForeignRegion"));
                    hideMapContextMenu();
                },
            };
            const chooseTargetAction = {
                label: isCurrentTarget ? t("editor.targetCountryChosen") : t("editor.chooseTargetCountry"),
                disabled: !canUseAsTarget || isCurrentTarget,
                handler: () => selectInlineEditorTargetCountryFromMap(countryCode, { switchToRegion: true }),
            };
            const actions = hasExplicitTarget && !isCurrentTarget
                ? [annexCountryAction, showRegionsAction, chooseTargetAction]
                : [chooseTargetAction, showRegionsAction];
            showMapContextMenu(event, `${countryName} (${displayCountryCode(countryCode)})`, actions);
        });
    }
    for (const node of elements.regionLayer.querySelectorAll(".map-region-shape")) {
        node.addEventListener("click", () => {
            if (!dashboardState.editorMode) {
                return;
            }
            setEditorSelection("region", String(node.getAttribute("data-visual-region-key") ?? ""));
            syncInlineEditorTargetRegionForSource(getInlineEditorSelectedGroup());
            renderInlineEditorPanel();
            setMapHoverDetails(
                tf("editor.targetAnnexes", { country: String(node.getAttribute("data-region-name") ?? "Region") }),
                t("editor.rightClickForeignRegion")
            );
        });
        node.addEventListener("contextmenu", (event) => {
            const visualRegionKey = String(node.getAttribute("data-visual-region-key") ?? "");
            const regionName = String(node.getAttribute("data-region-name") ?? "Region");
            const group = mapDataCache.visualRegionsByKey.get(visualRegionKey) ?? null;
            const targetCountryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode || elements.editorInlineTargetCountry?.value);
            const targetCountryName = countryDisplayName(targetCountryCode, displayCountryCode(targetCountryCode));
            const sourceOwnerCode = group ? getInlineEditorSourceOwnerCode(group) : "";
            const targetReady = Boolean(dashboardState.editorMode && dashboardState.editorTargetCountrySelected && targetCountryCode);
            const canAnnex = Boolean(group && targetReady && sourceOwnerCode !== targetCountryCode);
            showMapContextMenu(event, regionName, [
                {
                    label: targetReady
                        ? (dashboardState.language === "de" ? `An ${targetCountryName} annektieren` : `Annex to ${targetCountryName}`)
                        : t("editor.chooseTargetFirst"),
                    disabled: !canAnnex,
                    handler: () => annexVisualRegionToSelectedCountry(visualRegionKey),
                },
                {
                    label: t("editor.chooseTargetCountry"),
                    handler: () => {
                        setMapMode("country");
                        setMapHoverDetails(t("editor.chooseTargetTitle"), t("editor.chooseTargetHint"));
                        hideMapContextMenu();
                    },
                },
            ]);
        });
    }
}
function getAnnexableRegionGroupsForCountry(countryCode) {
    const normalizedCountryCode = normalizeCountryCode(countryCode);
    return [...mapDataCache.visualRegionsByKey.values()]
        .filter((group) => normalizeCountryCode(group.countryCode) === normalizedCountryCode);
}
function selectInlineEditorTargetCountryFromMap(countryCode, { switchToRegion = false } = {}) {
    const normalizedCountryCode = normalizeCountryCode(countryCode);
    if (!dashboardState.editorMode) {
        setEditorMode(true);
    }
    if (!setInlineEditorTargetCountry(normalizedCountryCode)) {
        setInlineEditorStatus(t("editor.countryCannotAnnex"), "error");
        return false;
    }
    const countryName = countryDisplayName(normalizedCountryCode, displayCountryCode(normalizedCountryCode));
    if (switchToRegion) {
        setMapMode("region");
    } else {
        renderInlineEditorPanel();
    }
    setInlineEditorStatus(tf("editor.countryAsTarget", { country: countryName }), "success");
    setMapHoverDetails(tf("editor.targetAnnexes", { country: countryName }), t("editor.rightClickForeignRegion"));
    hideMapContextMenu();
    return true;
}
async function annexVisualRegionToSelectedCountry(visualRegionKey) {
    if (!dashboardState.editorMode) {
        setEditorMode(true);
    }
    const group = mapDataCache.visualRegionsByKey.get(String(visualRegionKey ?? "")) ?? null;
    if (!group) {
        setInlineEditorStatus(t("editor.regionCannotAnnex"), "error");
        hideMapContextMenu();
        return;
    }
    const targetCountryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode || elements.editorInlineTargetCountry?.value);
    const targetSelected = Boolean(dashboardState.editorTargetCountrySelected && targetCountryCode);
    const sourceOwnerCode = getInlineEditorSourceOwnerCode(group);
    if (!targetSelected) {
        setInlineEditorStatus(t("editor.chooseTargetFirst"), "error");
        hideMapContextMenu();
        return;
    }
    if (sourceOwnerCode === targetCountryCode) {
        setInlineEditorStatus(t("editor.areaAlreadyTarget"), "error");
        hideMapContextMenu();
        return;
    }
    populateInlineEditorTargetRegions(
        targetCountryCode,
        chooseInlineEditorTargetRegionForAnnexation(targetCountryCode, group)
    );
    setEditorSelection("region", group.visualRegionKey);
    renderInlineEditorPanel();
    hideMapContextMenu();
    await applyInlineEditorAssignment();
}
async function annexCountryToSelectedCountry(sourceCountryCode) {
    if (!dashboardState.editorMode || !dashboardState.editorTargetCountrySelected) {
        setInlineEditorStatus(t("editor.chooseTargetFirst"), "error");
        hideMapContextMenu();
        return;
    }
    const normalizedSourceCode = normalizeCountryCode(sourceCountryCode);
    const targetCountryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode || elements.editorInlineTargetCountry?.value);
    if (!targetCountryCode || normalizedSourceCode === targetCountryCode) {
        setInlineEditorStatus(t("editor.alreadyTargetCountry"), "error");
        hideMapContextMenu();
        return;
    }
    const sourceGroups = getAnnexableRegionGroupsForCountry(normalizedSourceCode);
    if (!sourceGroups.length) {
        setInlineEditorStatus(t("editor.noAnnexableRegions"), "error");
        hideMapContextMenu();
        return;
    }
    const targetCountryName = countryDisplayName(targetCountryCode, displayCountryCode(targetCountryCode));
    const sourceCountryName = countryDisplayName(normalizedSourceCode, displayCountryCode(normalizedSourceCode));
    replaceInlineEditorOverridesForCountry(normalizedSourceCode, targetCountryCode);
    clearEditorSelection();
    hideMapContextMenu();
    await refreshGeoFromEditorAssignments();
    setInlineEditorStatus(tf("editor.countryAttached", { source: sourceCountryName, target: targetCountryName }), "success");
    setMapHoverDetails(
        tf("editor.countryAnnexedTitle", { source: sourceCountryName }),
        tf("editor.countryAnnexedBody", { target: targetCountryName })
    );
}
function setActiveHoverNode(node) {
    if (activeHoverNode && activeHoverNode !== node) {
        activeHoverNode.classList.remove("map-hover-target");
    }
    activeHoverNode = node;
    activeHoverNode.classList.add("map-hover-target");
    syncHoverOutline(node);
}
function clearHoverOutline() {
    elements.countryHoverLayer.innerHTML = "";
    elements.regionHoverLayer.innerHTML = "";
}
function syncHoverOutline(node) {
    clearHoverOutline();
    if (!node) {
        return;
    }
    const isRegionShape = node.classList.contains("map-region-shape");
    const targetLayer = isRegionShape
        ? elements.regionHoverLayer
        : elements.countryHoverLayer;
    const pathD = isRegionShape
        ? String(node.getAttribute("d") ?? "")
        : String(
            mapDataCache.countryFeaturesByCode.get(
                normalizeCountryCode(node.getAttribute("data-country-code"))
            )?.hoverPathD ?? node.getAttribute("d") ?? ""
        );
    if (!pathD) {
        return;
    }
    const fillRule = String(node.getAttribute("fill-rule") ?? "evenodd");
    if (!isRegionShape) {
        targetLayer.innerHTML = `
            <g pointer-events="none">
                <path
                    class="map-hover-outline-fill map-hover-outline-fill-country"
                    d="${escapeHtml(pathD)}"
                    fill-rule="${escapeHtml(fillRule)}"
                ></path>
            </g>
        `;
        return;
    }
    targetLayer.innerHTML = `
        <g pointer-events="none">
            <path
                class="map-hover-outline-fill"
                d="${escapeHtml(pathD)}"
                fill-rule="${escapeHtml(fillRule)}"
            ></path>
            <path
                class="map-hover-outline-stroke"
                d="${escapeHtml(pathD)}"
                fill="none"
                fill-rule="${escapeHtml(fillRule)}"
            ></path>
        </g>
    `;
}
function renderCountryHover(countryCode, countryData) {
    if (!countryData) {
        setMapHoverDetails(
            `${displayCountryCode(countryCode)} (${dashboardState.language === "de" ? "kein Exporteintrag" : "no export row"})`,
            t("editor.noExportCountry")
        );
        return;
    }
    const previousCountry = mapDataCache.previousCountriesByCode.get(normalizeCountryCode(countryData.country_code)) ?? null;
    if (!isClassicMetricView()) {
        setMapHoverDetails(
            `${countryDisplayName(countryData.country_code, countryData.country_name)} (${displayCountryCode(countryData.country_code)}) · ${countryData.yearKey}`,
            buildMetricHoverHtml(dashboardState.activeMetric, countryData, previousCountry, "country"),
            true
        );
        return;
    }
    setMapHoverDetails(
        `${countryDisplayName(countryData.country_code, countryData.country_name)} (${displayCountryCode(countryData.country_code)}) · ${countryData.yearKey}`,
        buildClassicHoverHtml(countryData, previousCountry),
        true
    );
}
function renderRegionHover(countryCode, regionName, regionData, countryData) {
    if (regionData) {
        const previousRegion = mapDataCache.previousVisualRegionsByKey.get(
            String(regionData.visual_region_key ?? "")
        ) ?? null;
        if (!isClassicMetricView()) {
            setMapHoverDetails(
                `${regionName} (${displayCountryCode(regionData.country_code)}) · ${regionData.yearKey}`,
                buildMetricHoverHtml(dashboardState.activeMetric, regionData, previousRegion, "region"),
                true
            );
            return;
        }
        setMapHoverDetails(
            `${regionName} (${displayCountryCode(regionData.country_code)}) · ${regionData.yearKey}`,
            buildClassicHoverHtml(regionData, previousRegion),
            true
        );
        return;
    }
    if (countryData) {
        const previousCountry = mapDataCache.previousCountriesByCode.get(normalizeCountryCode(countryData.country_code)) ?? null;
        if (!isClassicMetricView()) {
            setMapHoverDetails(
                `${regionName} (${displayCountryCode(countryCode)})`,
                buildMetricHoverHtml(dashboardState.activeMetric, countryData, previousCountry, "country"),
                true
            );
            return;
        }
        setMapHoverDetails(
            `${regionName} (${displayCountryCode(countryCode)})`,
            buildClassicHoverHtml(countryData, previousCountry),
            true
        );
        return;
    }
    setMapHoverDetails(`${regionName} (${displayCountryCode(countryCode)})`, t("editor.noExportArea"));
}
function resetMapHoverDetails() {
    if (dashboardState.editorMode) {
        const selectedGroup = getInlineEditorSelectedGroup();
        if (selectedGroup) {
            const targetCountryCode = normalizeCountryCode(dashboardState.editorTargetCountryCode);
            const targetCountryName = countryDisplayName(targetCountryCode, displayCountryCode(targetCountryCode));
            setMapHoverDetails(
                tf("editor.targetAnnexes", { country: selectedGroup.label }),
                tf("editor.countryAnnexesRegion", { country: targetCountryName, region: selectedGroup.label })
            );
            return;
        }
        setMapHoverDetails(
            t("border.mode"),
            activeMapMode === "country"
                ? t("editor.countryHint")
                : t("editor.regionHint")
        );
        return;
    }
    if (!isClassicMetricView()) {
        let metricHint = t("hint.area");
        if (dashboardState.activeMetric === "integration") {
            metricHint = dashboardState.language === "de"
                ? "Modellscore 0-100 aus EU-Nähe, Stabilität, Korruptionsrisiko, Mobilität und innerem Zusammenhalt."
                : "Model score from 0-100 using EU proximity, stability, corruption risk, mobility, and internal cohesion.";
        } else if (dashboardState.activeMetric === "corruption") {
            metricHint = dashboardState.language === "de"
                ? "Negativer Modellscore 0-100: tiefer bedeutet weniger Korruptionsrisiko."
                : "Negative model score from 0-100: lower means lower corruption risk.";
        }
        setMapHoverDetails(
            `${METRIC_VIEWS[dashboardState.activeMetric]?.label ?? "Metric"}`,
            metricHint
        );
        return;
    }
    if (activeMapMode === "country") {
        setMapHoverDetails(
            t("scope.countries"),
            t("hint.country")
        );
        return;
    }
    setMapHoverDetails(
        t("scope.regions"),
        t("hint.region")
    );
}
function renderCountryTable(countryRows) {
    renderTable(
        elements.countryTableBody,
        countryRows,
        EMPTY_TABLE_ROWS.countryExport,
        (country) => buildTableRow([
            escapeHtml(country.yearKey), `${escapeHtml(countryFlag(country.country_code))} ${escapeHtml(countryDisplayName(country.country_code, country.country_name))} (${escapeHtml(displayCountryCode(country.country_code))})`,
            formatInteger(country.end_population), `${formatDecimal(country.end_gdp_billion_eur)} bn EUR`,
            formatPercent(country.gdp_growth_rate), `${formatInteger(Math.round(country.gdp_per_capita_eur))} EUR`,
            formatPercent(country.average_unemployment_rate),
            formatMetricDisplay(country.average_integration_index, "integration"),
            escapeHtml(formatInflationDirection(country.average_inflation_rate, true)),
            formatPercent(country.average_satisfaction_index),
            escapeHtml(formatElectionTendency(country.election_alignment_index).label),
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
        .map(([metricKey, labelKey]) => buildStateCard(t(labelKey), averageMetric(countryRows, metricKey), activeYearKey, metricKey))
        .join("");
    renderTable(
        elements.stateTableBody,
        countryRows,
        EMPTY_TABLE_ROWS.state,
        (country) => buildTableRow([escapeHtml(country.yearKey), `${escapeHtml(countryDisplayName(country.country_code, country.country_name))} (${escapeHtml(displayCountryCode(country.country_code))})`, ...STATE_METRICS.map(([metricKey]) => formatStateRatio(country[metricKey], metricKey))])
    );
}
function renderRegionTable(regionRows) {
    renderTable(
        elements.regionTableBody,
        regionRows,
        EMPTY_TABLE_ROWS.regionExport,
        (region) => buildTableRow([
            escapeHtml(region.yearKey),
            escapeHtml(displayCountryCode(region.country_code)),
            escapeHtml(displayRegionLabel(region.visual_region_key || buildVisualRegionKey(region.country_code, region.region_name)) || region.region_name),
            formatInteger(region.end_population), `${formatDecimal(region.end_gdp_billion_eur)} bn EUR`,
            formatPercent(region.gdp_growth_rate), formatPercent(region.unemployment_rate),
            formatDecimal(region.regional_attractiveness),
            formatMetricDisplay(region.integration_index, "integration"),
            escapeHtml(formatInflationDirection(region.inflation_rate, true)),
            formatPercent(region.satisfaction_index),
            escapeHtml(formatElectionTendency(region.election_alignment_index).label),
        ])
    );
}
function renderPublicSidebar() {
    const countryRows = dashboardState.currentCountryRows ?? [];
    const regionRows = dashboardState.currentRegionRows ?? [];
    const useRegionScope = activeMapMode === "region";
    const sourceRows = useRegionScope ? regionRows : countryRows;
    const scopeLabel = useRegionScope ? t("scope.regions") : t("scope.countries");
    const isClassic = isClassicMetricView();
    const dedicatedMetricSlots = new Set(["population", "gdp_per_capita", "unemployment", "attractiveness"]);
    const activeMetricUsesFallbackSlot = !dedicatedMetricSlots.has(dashboardState.activeMetric);
    elements.kpiGrid.classList.toggle("kpi-grid-metric", !isClassic);
    for (const item of elements.kpiItems) {
        const itemMetric = item.dataset.kpi ?? "";
        item.classList.toggle(
            "kpi-item-active",
            !isClassic && (
                itemMetric === dashboardState.activeMetric
                || (activeMetricUsesFallbackSlot && itemMetric === "population")
            )
        );
    }
    elements.kpiScope.textContent = scopeLabel;
    elements.kpiScopeNote.textContent = "";
    if (dashboardState.activeMetric === "integration") {
        elements.kpiScopeNote.textContent = dashboardState.language === "de"
            ? "Modellscore 0-100 aus EU-Nähe, Stabilität, Korruptionsrisiko, Mobilität und innerem Zusammenhalt."
            : "Model score from 0-100 using EU proximity, stability, corruption risk, mobility, and internal cohesion.";
    }
    if (dashboardState.activeMetric === "corruption") {
        elements.kpiScopeNote.textContent = dashboardState.language === "de"
            ? "Negativer Modellscore 0-100: tiefer ist besser."
            : "Negative model score from 0-100: lower is better.";
    }
    if (!sourceRows.length) {
        elements.kpiLabelPopulation.textContent = t("metric.population");
        elements.kpiLabelGdp.textContent = t("metric.gdp");
        elements.kpiLabelUnemployment.textContent = t("metric.jobs");
        elements.kpiLabelGrowth.textContent = t("metric.growth");
        elements.kpiPopulation.textContent = "-";
        elements.kpiGdp.textContent = "-";
        elements.kpiUnemployment.textContent = "-";
        elements.kpiGrowth.textContent = "-";
        return;
    }
    if (!isClassic) {
        const metricKey = dashboardState.activeMetric;
        const currentAggregate = aggregateMetricForScope(sourceRows, metricKey);
        elements.kpiLabelPopulation.textContent = t("metric.population");
        elements.kpiLabelGdp.textContent = dashboardState.language === "de" ? "BIP/Kopf" : "GDP/cap.";
        elements.kpiLabelUnemployment.textContent = t("metric.jobs");
        elements.kpiLabelGrowth.textContent = "Attr.";
        elements.kpiPopulation.textContent = metricKey === "population" || activeMetricUsesFallbackSlot
            ? formatMetricDisplay(currentAggregate, metricKey)
            : "-";
        elements.kpiGdp.textContent = metricKey === "gdp_per_capita" ? formatMetricDisplay(currentAggregate, metricKey) : "-";
        elements.kpiUnemployment.textContent = metricKey === "unemployment" ? formatMetricDisplay(currentAggregate, metricKey) : "-";
        elements.kpiGrowth.textContent = metricKey === "attractiveness"
            ? formatMetricDisplay(currentAggregate, metricKey)
            : "-";
        if (activeMetricUsesFallbackSlot) {
            elements.kpiLabelPopulation.textContent = METRIC_VIEWS[metricKey]?.label ?? "Metric";
        }
        return;
    }
    elements.kpiLabelPopulation.textContent = t("metric.population");
    elements.kpiLabelGdp.textContent = t("metric.gdp");
    elements.kpiLabelUnemployment.textContent = t("metric.jobs");
    elements.kpiLabelGrowth.textContent = t("metric.growth");
    const classicSummary = classicScopeSummary(sourceRows);
    elements.kpiPopulation.textContent = formatInteger(Math.round(classicSummary.population));
    elements.kpiGdp.textContent = `${formatDecimal(classicSummary.gdp)} bn`;
    elements.kpiUnemployment.textContent = formatMetricDisplay(classicSummary.unemployment, "unemployment");
    elements.kpiGrowth.textContent = Number.isFinite(classicSummary.growth) ? formatPercent(classicSummary.growth) : "-";
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
                        `${countryFlag(countryCode)} ${countryDisplayName(countryCode, countryRow.country_name)} (${displayCountryCode(countryCode)})`,
                        [
                            `Population ${formatInteger(countryRow.end_population)}`,
                            `GDP ${formatDecimal(countryRow.end_gdp_billion_eur)} bn EUR`,
                            `Unemployment ${formatPercent(countryRow.average_unemployment_rate)}`,
                        ],
                        countryRow.yearKey
                    )
                    : buildMetricSummaryCard(
                        `${countryFlag(countryCode)} ${countryDisplayName(countryCode, countryRow.country_name)} (${displayCountryCode(countryCode)})`,
                        dashboardState.activeMetric,
                        metricValueFromCountry(countryRow, dashboardState.activeMetric),
                        previousCountryRow ? metricValueFromCountry(previousCountryRow, dashboardState.activeMetric) : Number.NaN,
                        countryRow.yearKey
                    );
            });
        elements.mapSummaryCards.innerHTML = cards.length
            ? cards.join("")
            : buildEmptyCard("Keine Kartendaten", "Lade einen Export, um die Karte zu rendern.");
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
            const regionLabel = displayRegionLabel(group);
            return isClassic
                ? buildClassicSummaryCard(
                    `${regionLabel} (${displayCountryCode(group.countryCode)})`,
                    currentRegion ? [
                        `Population ${formatInteger(currentRegion.end_population)}`,
                        `GDP ${formatDecimal(currentRegion.end_gdp_billion_eur)} bn EUR`,
                        `Unemployment ${formatPercent(currentRegion.unemployment_rate)}`,
                    ] : [t("editor.noRegionData")],
                    currentRegion?.yearKey ?? getActiveYearKey()
                )
                : buildMetricSummaryCard(
                    `${regionLabel} (${displayCountryCode(group.countryCode)})`,
                    dashboardState.activeMetric,
                    metricValueFromRegion(currentRegion, dashboardState.activeMetric),
                    previousRegion ? metricValueFromRegion(previousRegion, dashboardState.activeMetric) : Number.NaN,
                    currentRegion?.yearKey ?? getActiveYearKey()
                );
        });
    elements.mapSummaryCards.innerHTML = cards.length
        ? cards.join("")
        : buildEmptyCard(t("editor.noRegionRows"), t("editor.loadRegions"));
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
        visualRegionRowsByYear: new Map(),
        countryRowsByYear: new Map(),
    });
    elements.yearSelect.innerHTML = "";
    elements.currentYearPill.textContent = t("status.noYear");
    updatePlaybackControls();
    setMapMode("country");
    resetMapHoverDetails();
    elements.metaCards.innerHTML = EMPTY_CARDS.meta;
    elements.stateCards.innerHTML = EMPTY_CARDS.state;
    elements.stateTableBody.innerHTML = EMPTY_TABLE_ROWS.state;
    elements.countryTableBody.innerHTML = EMPTY_TABLE_ROWS.country;
    elements.regionTableBody.innerHTML = EMPTY_TABLE_ROWS.region;
    renderPublicSidebar();
    setExportStatus("Mit Play durch geladene Jahre gehen. Unter Erweitert neue Runs starten oder Export neu laden.", "muted");
}
function setExportStatus(message, tone = "muted") {
    if (!elements.exportStatus) {
        return;
    }
    elements.exportStatus.textContent = message;
    elements.exportStatus.className = `export-status export-status-status-${tone}`;
}
function setMapHoverDetails(title, body, html = false) {
    elements.mapHoverTitle.textContent = title;
    if (html) {
        elements.mapHoverBody.innerHTML = body;
        return;
    }
    elements.mapHoverBody.textContent = body;
}
function buildHoverDetailRow(label, value, tone = "neutral") {
    return `
        <div class="hover-detail-row">
            <span class="hover-detail-row-label">${escapeHtml(label)}</span>
            <span class="hover-detail-row-value tone-${escapeHtml(tone)}">${escapeHtml(value)}</span>
        </div>
    `;
}
function buildHoverDetailGrid(rows, note = "") {
    return `
        <div class="hover-detail-grid">
            ${rows.join("")}
            ${note ? `<p class="hover-detail-note">${escapeHtml(note)}</p>` : ""}
        </div>
    `;
}
function formatSignedPercent(value) {
    if (!Number.isFinite(value)) {
        return "-";
    }
    return `${value >= 0 ? "+" : ""}${formatPercent(value)}`;
}
function buildElectionScale(value) {
    const clamped = clamp(Number(value) || 0, -1, 1);
    const markerLeft = ((clamped + 1) / 2) * 100;
    return `
        <div class="hover-election-scale" aria-hidden="true">
            <div class="hover-election-track">
                <span class="hover-election-segment hover-election-segment-left-strong"></span>
                <span class="hover-election-segment hover-election-segment-left"></span>
                <span class="hover-election-segment hover-election-segment-center"></span>
                <span class="hover-election-segment hover-election-segment-right"></span>
                <span class="hover-election-segment hover-election-segment-right-strong"></span>
                <span class="hover-election-marker" style="left:${markerLeft.toFixed(1)}%"></span>
            </div>
            <div class="hover-election-labels">
                <span>L</span>
                <span>M-L</span>
                <span>M</span>
                <span>M-R</span>
                <span>R</span>
            </div>
        </div>
    `;
}
function yearKeyFromStartYear(startYear) {
    return dashboardState.yearKeys.find((yearKey) => Number.parseInt(String(yearKey).slice(0, 4), 10) === Number(startYear)) ?? "";
}
function getCountryRowsForYear(yearKey) {
    if (!yearKey) {
        return new Map();
    }
    const cached = dashboardState.countryRowsByYear.get(yearKey);
    if (cached) {
        return cached;
    }
    const { countryRows } = buildDisplayRowsForYear(yearKey);
    const mapped = new Map(countryRows.map((row) => [normalizeCountryCode(row.country_code), row]));
    dashboardState.countryRowsByYear.set(yearKey, mapped);
    return mapped;
}
function getVisualRegionRowsForYear(yearKey) {
    if (!yearKey || !dashboardState.geoData?.regionFeatures?.length) {
        return new Map();
    }
    const cached = dashboardState.visualRegionRowsByYear.get(yearKey);
    if (cached) {
        return cached;
    }
    const { regionRows } = buildRowsForYear(dashboardState.exportData, yearKey);
    const sourceMap = new Map(regionRows.map((row) => [buildRegionKey(row.country_code, row.region_name), row]));
    const mapped = new Map(
        buildVisualRegionGroups(dashboardState.geoData.regionFeatures, sourceMap)
            .filter((group) => group.displayData)
            .map((group) => [group.visualRegionKey, group.displayData])
    );
    dashboardState.visualRegionRowsByYear.set(yearKey, mapped);
    return mapped;
}
function findHistoricalCountryRow(countryCode, startYear) {
    const yearKey = yearKeyFromStartYear(startYear);
    return yearKey ? (getCountryRowsForYear(yearKey).get(normalizeCountryCode(countryCode)) ?? null) : null;
}
function findHistoricalVisualRegionRow(visualRegionKey, startYear) {
    const yearKey = yearKeyFromStartYear(startYear);
    return yearKey ? (getVisualRegionRowsForYear(yearKey).get(visualRegionKey) ?? null) : null;
}
function resolveElectionCycleYears(row) {
    const lastElectionYear = Number(row?.election_last_year ?? 0);
    const nextElectionYear = Number(row?.election_next_year ?? 0);
    if (Number.isFinite(lastElectionYear) && Number.isFinite(nextElectionYear) && nextElectionYear > lastElectionYear) {
        return nextElectionYear - lastElectionYear;
    }
    return 4;
}
function resolveElectionComparisonYear(row) {
    const lastElectionYear = Number(row?.election_last_year ?? 0);
    if (!Number.isFinite(lastElectionYear) || lastElectionYear <= 0) {
        return 0;
    }
    if (!row?.election_happened_this_year) {
        return lastElectionYear;
    }
    return lastElectionYear - resolveElectionCycleYears(row);
}
function buildClassicHoverHtml(row, previousRow) {
    const electionTendency = formatElectionTendency(
        Object.hasOwn(row, "election_alignment_index")
            ? row.election_alignment_index
            : row.election_tension_index
    );
    return buildHoverDetailGrid([
        buildHoverDetailRow(t("metric.population"), formatInteger(Math.round(Number(row.end_population ?? 0)))),
        buildHoverDetailRow(t("metric.gdp"), `${formatDecimal(Number(row.end_gdp_billion_eur ?? 0))} bn EUR`),
        buildHoverDetailRow(
            METRIC_VIEWS.unemployment.label,
            formatPercent(Number(Object.hasOwn(row, "average_unemployment_rate") ? row.average_unemployment_rate : row.unemployment_rate)),
            "negative"
        ),
        buildHoverDetailRow(
            METRIC_VIEWS.inflation.buttonLabel.replace(/^\S+\s*/, ""),
            formatInflationDirection(Number(Object.hasOwn(row, "average_inflation_rate") ? row.average_inflation_rate : row.inflation_rate), true),
            Number(Object.hasOwn(row, "average_inflation_rate") ? row.average_inflation_rate : row.inflation_rate) < 0 ? "positive" : "negative"
        ),
        buildHoverDetailRow(METRIC_VIEWS.elections.label, electionTendency.label, electionTendency.tone),
    ], previousRow ? `${t("metric.previous")}: ${t("metric.population")} ${formatInteger(Math.round(Number(row.end_population ?? 0) - Number(previousRow.end_population ?? 0)))} | ${t("metric.gdp")} ${(Number(row.end_gdp_billion_eur ?? 0) - Number(previousRow.end_gdp_billion_eur ?? 0)) >= 0 ? "+" : ""}${formatDecimal(Number(row.end_gdp_billion_eur ?? 0) - Number(previousRow.end_gdp_billion_eur ?? 0))} bn EUR` : "");
}
function buildInflationHoverHtml(row, previousRow) {
    const current = Number(Object.hasOwn(row, "average_inflation_rate") ? row.average_inflation_rate : row.inflation_rate);
    const previous = Number(previousRow ? (Object.hasOwn(previousRow, "average_inflation_rate") ? previousRow.average_inflation_rate : previousRow.inflation_rate) : Number.NaN);
    const delta = Number.isFinite(previous) ? current - previous : Number.NaN;
    const tone = current < 0 ? "positive" : current > 0 ? "negative" : "neutral";
    return buildHoverDetailGrid([
        buildHoverDetailRow(t("metric.direction"), formatInflationDirection(current), tone),
        buildHoverDetailRow(t("metric.rate"), formatPercent(Math.abs(current)), tone),
        buildHoverDetailRow(
            t("metric.previous"),
            Number.isFinite(delta)
                ? `${delta >= 0 ? "▲" : "▼"} ${formatPercent(Math.abs(delta))}`
                : t("metric.noPrevious"),
            delta < 0 ? "positive" : delta > 0 ? "negative" : "neutral"
        ),
    ]);
}
function buildElectionHoverHtml(row, scopeType = "region") {
    const current = Number(Object.hasOwn(row, "election_alignment_index") ? row.election_alignment_index : row.election_tension_index);
    const tendency = formatElectionTendency(current);
    const lastElectionYear = Number(row.election_last_year ?? 0);
    const nextElectionYear = Number(row.election_next_year ?? 0);
    const comparisonYear = resolveElectionComparisonYear(row);
    const firstSimulatedYear = Number.parseInt(String(dashboardState.yearKeys[0] ?? "").slice(0, 4), 10);
    const referenceRow = scopeType === "country"
        ? findHistoricalCountryRow(row.country_code, comparisonYear)
        : findHistoricalVisualRegionRow(String(row.visual_region_key ?? ""), comparisonYear);
    const changeText = referenceRow
        ? describeElectionBandShift(
            current,
            Number(referenceRow.election_alignment_index ?? referenceRow.election_tension_index ?? current)
        )
        : (comparisonYear > 0 && Number.isFinite(firstSimulatedYear) && comparisonYear < firstSimulatedYear
            ? t("election.beforeSimulation")
            : t("election.noComparison"));
    const rows = [
        buildHoverDetailRow(t("election.tendency"), tendency.label, tendency.tone),
        buildHoverDetailRow(t("election.leftRight"), `${current >= 0 ? "+" : ""}${current.toFixed(2)}`, tendency.tone),
        buildHoverDetailRow(t("election.last"), lastElectionYear > 0 ? String(lastElectionYear) : "-", "neutral"),
        buildHoverDetailRow(t("election.next"), nextElectionYear > 0 ? String(nextElectionYear) : "-", "neutral"),
        buildHoverDetailRow(t("election.sinceLast"), changeText, "neutral"),
    ];
    return `
        ${buildElectionScale(current)}
        ${buildHoverDetailGrid(
            rows,
            row.election_happened_this_year
                ? t("election.thisYear")
                : formatElectionShift(Number(row.election_alignment_shift ?? 0))
        )}
    `;
}
function buildMetricHoverHtml(metricKey, row, previousRow, scopeType = "region") {
    if (metricKey === "inflation") {
        return buildInflationHoverHtml(row, previousRow);
    }
    if (metricKey === "elections") {
        return buildElectionHoverHtml(row, scopeType);
    }
    const currentValue = metricRowValue(row, metricKey);
    const previousValue = previousRow ? metricRowValue(previousRow, metricKey) : Number.NaN;
    const trend = metricTrend(metricKey, currentValue, previousValue);
    return buildHoverDetailGrid([
        buildHoverDetailRow(t("metric.current"), formatMetricDisplay(currentValue, metricKey), trend.tone),
        buildHoverDetailRow(t("metric.previous"), Number.isFinite(previousValue) ? formatMetricDisplay(previousValue, metricKey) : "-", "neutral"),
        buildHoverDetailRow(t("metric.change"), formatMetricDelta(currentValue, previousValue, metricKey, scopeType), trend.tone),
    ], trend.summary);
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
    for (const layer of [elements.countryLayer, elements.countryHoverLayer, elements.countryLabelLayer, elements.regionLayer, elements.regionHoverLayer, elements.regionLabelLayer, elements.mapEventLayer]) {
        layer.innerHTML = "";
    }
}
function resetMapCaches() {
    mapDataCache.countriesByCode = new Map();
    mapDataCache.previousCountriesByCode = new Map();
    mapDataCache.countryFeaturesByCode = new Map();
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
function buildStateCard(label, value, activeYearKey, metricKey = "") {
    const safeValue = value === null ? "-" : formatStateRatio(value, metricKey);
    const note = activeYearKey ? `${t("metric.year")} ${escapeHtml(activeYearKey)}` : t("status.noYear");
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
function weightedAverageMetric(rows, valueKey, weightKey) {
    let weightedSum = 0;
    let totalWeight = 0;
    for (const row of rows) {
        const value = Number(row?.[valueKey]);
        const weight = Number(row?.[weightKey]);
        if (!Number.isFinite(value) || !Number.isFinite(weight) || weight <= 0) {
            continue;
        }
        weightedSum += value * weight;
        totalWeight += weight;
    }
    return totalWeight > 0 ? (weightedSum / totalWeight) : Number.NaN;
}
function formatStateRatio(value, metricKey = "") {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return "-";
    }
    return metricKey === "corruption_index" ? formatIndexScore(numeric) : formatPercent(numeric);
}
function describeCountrySummary(countryData, includeUnemployment = true) {
    const base = `population ${formatInteger(countryData.end_population)}, GDP ${formatDecimal(countryData.end_gdp_billion_eur)} bn EUR, growth ${formatPercent(countryData.gdp_growth_rate)}`;
    return includeUnemployment
        ? `Population ${formatInteger(countryData.end_population)}, GDP ${formatDecimal(countryData.end_gdp_billion_eur)} bn EUR, growth ${formatPercent(countryData.gdp_growth_rate)}, unemployment ${formatPercent(countryData.average_unemployment_rate)}, integration ${formatMetricDisplay(countryData.average_integration_index, "integration")}, inflation ${formatPercent(countryData.average_inflation_rate)}, satisfaction ${formatPercent(countryData.average_satisfaction_index)}, elections ${formatPercent(countryData.election_tension_index)}.`
        : `${base}.`;
}
function describeClassicYearChange(currentRow, previousRow) {
    if (!previousRow) {
        return "";
    }
    const currentPopulation = Number(currentRow?.end_population);
    const previousPopulation = Number(previousRow?.end_population);
    const currentGdp = Number(currentRow?.end_gdp_billion_eur);
    const previousGdp = Number(previousRow?.end_gdp_billion_eur);
    const currentUnemployment = Number(
        Object.hasOwn(currentRow ?? {}, "average_unemployment_rate")
            ? currentRow.average_unemployment_rate
            : currentRow?.unemployment_rate
    );
    const previousUnemployment = Number(
        Object.hasOwn(previousRow ?? {}, "average_unemployment_rate")
            ? previousRow.average_unemployment_rate
            : previousRow?.unemployment_rate
    );
    if (
        !Number.isFinite(currentPopulation)
        || !Number.isFinite(previousPopulation)
        || !Number.isFinite(currentGdp)
        || !Number.isFinite(previousGdp)
        || !Number.isFinite(currentUnemployment)
        || !Number.isFinite(previousUnemployment)
    ) {
        return "";
    }
    return ` Change vs prev year: population ${currentPopulation - previousPopulation >= 0 ? "+" : ""}${formatInteger(Math.round(currentPopulation - previousPopulation))}, GDP ${currentGdp - previousGdp >= 0 ? "+" : ""}${formatDecimal(currentGdp - previousGdp)} bn EUR, unemployment ${currentUnemployment - previousUnemployment >= 0 ? "+" : ""}${formatPercent(currentUnemployment - previousUnemployment)}.`;
}
function describeMetricFocus(metricKey, currentValue, previousValue = Number.NaN, labelScale = "region") {
    const metricLabel = METRIC_VIEWS[metricKey]?.label ?? "Metric";
    const deltaText = formatMetricDelta(currentValue, previousValue, metricKey, labelScale);
    if (deltaText === "no prev") {
        return `${metricLabel} ${formatMetricDisplay(currentValue, metricKey)}.`;
    }
    return `${metricLabel} ${formatMetricDisplay(currentValue, metricKey)}. Change vs prev year ${deltaText}.`;
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
            <strong class="meta-value">${escapeHtml(yearKey || t("status.noYear"))}</strong>
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
            <p class="metric-summary-subtitle">${escapeHtml(yearKey || t("status.noYear"))} | ${escapeHtml(METRIC_VIEWS[metricKey]?.label ?? "Metric")}</p>
        </article>
    `;
}
function classicScopeSummary(rows) {
    if (!rows.length) {
        return {
            population: Number.NaN,
            gdp: Number.NaN,
            unemployment: Number.NaN,
            growth: Number.NaN,
        };
    }
    const population = sumMetric(rows, "end_population");
    const gdp = sumMetric(rows, "end_gdp_billion_eur");
    const startGdp = sumMetric(rows, "start_gdp_billion_eur");
    const unemployment = weightedAverageMetric(
        rows,
        Object.hasOwn(rows[0] ?? {}, "average_unemployment_rate") ? "average_unemployment_rate" : "unemployment_rate",
        "end_population"
    );
    const growth = startGdp > 0 ? ((gdp - startGdp) / startGdp) : Number.NaN;
    return { population, gdp, unemployment, growth };
}
function aggregateMetricForScope(rows, metricKey) {
    if (!rows.length) {
        return Number.NaN;
    }
    if (metricKey === "population") {
        return sumMetric(rows, "end_population");
    }
    if (metricKey === "gdp_per_capita") {
        const population = sumMetric(rows, "end_population");
        const gdp = sumMetric(rows, "end_gdp_billion_eur");
        return population > 0 ? (gdp * 1_000_000_000) / population : Number.NaN;
    }
    const weightKey = ["inflation", "debt"].includes(metricKey) ? "end_gdp_billion_eur" : "end_population";
    let weightedSum = 0;
    let totalWeight = 0;
    for (const row of rows) {
        const value = metricRowValue(row, metricKey);
        const weight = Number(row?.[weightKey]);
        if (!Number.isFinite(value) || !Number.isFinite(weight) || weight <= 0) {
            continue;
        }
        weightedSum += value * weight;
        totalWeight += weight;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : Number.NaN;
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
function formatInflationDirection(value, compact = false) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return "-";
    }
    if (numeric > 0.0005) {
        return compact
            ? `▲ Infl. ${formatPercent(numeric)}`
            : `Inflation ▲ ${formatPercent(numeric)}`;
    }
    if (numeric < -0.0005) {
        return compact
            ? `▼ Defl. ${formatPercent(Math.abs(numeric))}`
            : `Deflation ▼ ${formatPercent(Math.abs(numeric))}`;
    }
    return compact ? "◆ stabil 0.0%" : "Preisniveau ◆ stabil 0.0%";
}
function formatElectionTendency(value) {
    const raw = Number(value);
    if (!Number.isFinite(raw)) {
        return { band: 0, label: "-", shortLabel: "-", icon: "↔", tone: "neutral" };
    }
    const numeric = clamp(raw, -1, 1);
    if (numeric <= -0.55) {
        return { band: -2, label: t("election.strongLeft"), shortLabel: "⇦ L", icon: "⇦", tone: "negative" };
    }
    if (numeric <= -0.18) {
        return { band: -1, label: t("election.centerLeft"), shortLabel: "↖ ML", icon: "↖", tone: "negative" };
    }
    if (numeric < 0.18) {
        return { band: 0, label: t("election.center"), shortLabel: t("election.shortCenter"), icon: "↔", tone: "neutral" };
    }
    if (numeric < 0.55) {
        return { band: 1, label: t("election.centerRight"), shortLabel: "↗ MR", icon: "↗", tone: "positive" };
    }
    return { band: 2, label: t("election.strongRight"), shortLabel: "⇨ R", icon: "⇨", tone: "positive" };
}
function formatElectionShift(delta) {
    const numeric = Number(delta);
    if (!Number.isFinite(numeric) || Math.abs(numeric) < 0.015) {
        return t("election.noShift");
    }
    return numeric > 0 ? t("election.shiftRight") : t("election.shiftLeft");
}
function describeElectionBandShift(currentValue, previousValue) {
    const current = formatElectionTendency(currentValue);
    const previous = formatElectionTendency(previousValue);
    const bandDelta = current.band - previous.band;
    if (bandDelta === 0) {
        return t("election.sameBand");
    }
    const direction = bandDelta > 0 ? t("election.stepRight") : t("election.stepLeft");
    return `${Math.abs(bandDelta)} ${direction}`;
}
function metricTrend(metricKey, currentValue, previousValue) {
    const current = Number(currentValue);
    const previous = Number(previousValue);
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
        return {
            tone: "neutral",
            arrow: "→",
            label: t("metric.noPrevious"),
            summary: t("trend.noPrevious"),
        };
    }
    if (metricKey === "elections") {
        const delta = current - previous;
        if (Math.abs(delta) < 0.015) {
            return {
                tone: "neutral",
                arrow: "↔",
                label: dashboardState.language === "de" ? "stabil" : "stable",
                summary: t("trend.politicalStable"),
            };
        }
        return delta > 0
            ? {
                tone: "positive",
                arrow: "↗",
                label: dashboardState.language === "de" ? "rechter" : "rightward",
                summary: t("trend.politicalRight"),
            }
            : {
                tone: "negative",
                arrow: "↙",
                label: dashboardState.language === "de" ? "linker" : "leftward",
                summary: t("trend.politicalLeft"),
            };
    }
    const delta = current - previous;
    const magnitude = metricTrendMagnitude(metricKey, current, previous, delta);
    const lowerIsBetter = new Set(["unemployment", "inflation", "corruption", "debt"]);
    const isPositiveDirection = lowerIsBetter.has(metricKey) ? delta < 0 : delta > 0;
    if (magnitude === "neutral") {
        return {
            tone: "neutral",
            arrow: "→",
            label: dashboardState.language === "de" ? "stabil" : "stable",
            summary: t("trend.small"),
        };
    }
    return isPositiveDirection
        ? {
            tone: "positive",
            arrow: "↗",
            label: dashboardState.language === "de" ? "positiv" : "positive",
            summary: t("trend.positive"),
        }
        : {
            tone: "negative",
            arrow: "↘",
            label: dashboardState.language === "de" ? "negativ" : "negative",
            summary: t("trend.negative"),
        };
}
function buildMapMetricDetail(currentValue, previousValue, metricKey, labelScale) {
    if (isClassicMetricView()) {
        return null;
    }
    if (metricKey === "inflation") {
        return {
            tone: Number(currentValue) < 0 ? "positive" : Number(currentValue) > 0 ? "negative" : "neutral",
            text: formatInflationDirection(currentValue, true),
        };
    }
    if (metricKey === "elections") {
        const tendency = formatElectionTendency(currentValue);
        return {
            tone: tendency.tone,
            text: tendency.shortLabel,
        };
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
        return t("metric.noPrevious");
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
    if (metricKey === "integration" || metricKey === "corruption") {
        const scoreDelta = delta * 100;
        return `${scoreDelta >= 0 ? "+" : ""}${scoreDelta.toFixed(1)} ${t("metric.points")}`;
    }
    if (metricKey === "inflation" || metricKey === "satisfaction" || metricKey === "debt") {
        return `${delta >= 0 ? "+" : ""}${formatPercent(delta)}`;
    }
    if (metricKey === "elections") {
        return `${delta >= 0 ? "+" : ""}${delta.toFixed(2)} LR`;
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
    if (metricKey === "integration" || metricKey === "satisfaction" || metricKey === "corruption") {
        return Math.abs(delta) >= 0.02 ? "strong" : Math.abs(delta) >= 0.008 ? "soft" : "neutral";
    }
    if (metricKey === "elections") {
        return Math.abs(delta) >= 0.12 ? "strong" : Math.abs(delta) >= 0.04 ? "soft" : "neutral";
    }
    if (metricKey === "inflation") {
        return Math.abs(delta) >= 0.008 ? "strong" : Math.abs(delta) >= 0.003 ? "soft" : "neutral";
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
    const label = `<span class="flag-chip">${escapeHtml(countryFlag(country.countryCode))}</span>${escapeHtml(country.displayName)} (${escapeHtml(displayCountryCode(country.countryCode))})`;
    const metricLabel = METRIC_VIEWS[dashboardState.activeMetric]?.label ?? "Metric";
    const metricValue = row ? formatMetricDisplay(metricValueFromCountry(row, dashboardState.activeMetric), dashboardState.activeMetric) : t("metric.noData");
    const note = row ? `${escapeHtml(row.yearKey)} | ${escapeHtml(metricLabel)}` : t("metric.noExportCountry");
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
function rebaseRegionKeyCountry(regionKey, targetCountryCode) {
    const normalizedTargetCode = normalizeCountryCode(targetCountryCode);
    const [, regionName = ""] = String(regionKey ?? "").split("::");
    return regionName ? `${normalizedTargetCode}::${normalizeRegionName(regionName)}` : "";
}
function displayCountryCode(countryCode) {
    const normalized = normalizeCountryCode(countryCode);
    return COUNTRY_DISPLAY_CODES[normalized] ?? normalized;
}
function countryDisplayName(countryCode, fallback = "") {
    const normalized = normalizeCountryCode(countryCode);
    if (dashboardState.language === "de") {
        return COUNTRY_NAME_TRANSLATIONS[normalized]?.de
            ?? COUNTRY_CONFIG[normalized]?.name
            ?? fallback
            ?? normalized;
    }
    return COUNTRY_CONFIG[normalized]?.name ?? fallback ?? normalized;
}
function normalizeCountryCode(countryCode) {
    return String(countryCode ?? "").trim().toUpperCase();
}
function repairRegionTextMojibakeAscii(regionName) {
    return String(regionName ?? "")
        .replaceAll("\u00C3\u00AB", "\u00EB")
        .replaceAll("\u00C3\u00A7", "\u00E7")
        .replaceAll("\u00C4\u008D", "\u010D")
        .replaceAll("\u00C3\u00A1", "\u00E1")
        .replaceAll("\u00C3\u00A2", "\u00E2")
        .replaceAll("\u00C3\u00A9", "\u00E9")
        .replaceAll("\u00C3\u00AD", "\u00ED")
        .replaceAll("\u00C3\u00B3", "\u00F3")
        .replaceAll("\u00C3\u00B6", "\u00F6")
        .replaceAll("\u00C3\u00BA", "\u00FA")
        .replaceAll("\u00C3\u00BC", "\u00FC")
        .replaceAll("\u00C5\u0091", "\u0151")
        .replaceAll("\u00C5\u00B1", "\u0171");
}
function repairRegionTextMojibake(regionName) {
    // Some simplified GeoJSON inputs arrive with mojibake instead of accented names.
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
function resolveBespRegionKey(countryCode, featureRegionName) {
    const directKey = buildRegionKey(countryCode, featureRegionName);
    return REGION_FEATURE_TO_BESP[directKey] ?? (BESP_REGION_KEYS.has(directKey) ? directKey : null);
}
function hashText(text) {
    let hash = 0;
    for (const char of String(text ?? "")) {
        hash = ((hash << 5) - hash) + char.charCodeAt(0);
        hash |= 0;
    }
    return Math.abs(hash);
}
function provinceFallbackFill(countryCode, featureKey) {
    const palette = ADM1_PROVINCE_PALETTES[countryCode];
    if (!palette?.length) {
        return "rgba(126, 143, 161, 0.38)";
    }
    return palette[hashText(featureKey) % palette.length];
}
function resolveVisualRegion(countryCode, featureRegionName, bespRegionKey) {
    const featureKey = buildRegionKey(countryCode, featureRegionName);
    const visualRegionKey = FEATURE_TO_VISUAL_REGION[featureKey] ?? null;
    if (!visualRegionKey) {
        if (!bespRegionKey || !ADM1_PROVINCE_VIEW_COUNTRIES.has(countryCode)) {
            return null;
        }
        return {
            visualRegionKey: featureKey,
            label: featureRegionName,
            dataRegionKey: bespRegionKey,
            fill: provinceFallbackFill(countryCode, featureKey),
        };
    }
    const definition = VISUAL_REGION_DEFINITIONS[visualRegionKey];
    return {
        visualRegionKey,
        label: definition?.label ?? featureRegionName,
        dataRegionKey: bespRegionKey ?? definition?.dataRegionKey,
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
        case "integration":
            return Number(countryData.average_integration_index);
        case "corruption":
            return Number(countryData.corruption_index);
        case "inflation":
            return Number(countryData.average_inflation_rate);
        case "debt":
            return Number(countryData.debt_to_gdp);
        case "satisfaction":
            return Number(countryData.average_satisfaction_index);
        case "elections":
            return Number(countryData.election_alignment_index);
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
        case "integration":
            return Number(regionData.integration_index);
        case "corruption":
            return Number(regionData.corruption_index);
        case "inflation":
            return Number(regionData.inflation_rate);
        case "debt":
            return Number(regionData.debt_to_gdp);
        case "satisfaction":
            return Number(regionData.satisfaction_index);
        case "elections":
            return Number(regionData.election_alignment_index);
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
    if (metricKey === "inflation") {
        const bound = Math.max(Math.abs(Number(metricRange?.min ?? 0)), Math.abs(Number(metricRange?.max ?? 0)), 0.01);
        return mapDivergingMetricFill(value, bound, [96, 144, 196], [214, 222, 233], [190, 83, 66]);
    }
    if (metricKey === "elections") {
        return mapDivergingMetricFill(value, 1, [86, 123, 176], [190, 181, 202], [152, 86, 132]);
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
function mapDivergingMetricFill(value, bound, negativeColor, neutralColor, positiveColor) {
    const limited = clamp(Number(value), -bound, bound);
    const ratio = bound > 0 ? Math.abs(limited) / bound : 0;
    const source = limited < 0 ? negativeColor : positiveColor;
    const red = Math.round(neutralColor[0] + (source[0] - neutralColor[0]) * ratio);
    const green = Math.round(neutralColor[1] + (source[1] - neutralColor[1]) * ratio);
    const blue = Math.round(neutralColor[2] + (source[2] - neutralColor[2]) * ratio);
    return `rgba(${red}, ${green}, ${blue}, 0.92)`;
}
function baseCountryFill(countryCode) {
    const normalized = normalizeCountryCode(countryCode);
    const configuredFill = COUNTRY_CONFIG[normalized]?.fill;
    if (configuredFill) {
        return configuredFill;
    }
    const palette = {
        ALB: "rgba(146, 124, 104, 0.90)",
        BGR: "rgba(137, 161, 104, 0.90)",
        BIH: "rgba(54, 104, 73, 0.90)",
        GRC: "rgba(86, 133, 184, 0.90)",
        HRV: "rgba(184, 109, 77, 0.90)",
        HUN: "rgba(158, 127, 105, 0.90)",
        MKD: "rgba(151, 112, 135, 0.90)",
        MNE: "rgba(114, 151, 186, 0.90)",
        ROU: "rgba(196, 177, 90, 0.90)",
        SRB: "rgba(184, 195, 173, 0.90)",
        SVN: "rgba(104, 156, 196, 0.90)",
        XKX: "rgba(212, 161, 108, 0.88)",
    };
    return palette[normalized] ?? DEFAULT_FILL;
}
function withFillOpacity(fill, opacity) {
    const match = String(fill ?? "").match(/rgba?\(([^)]+)\)/i);
    if (!match) {
        return fill;
    }
    const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
    if (parts.length < 3 || parts.slice(0, 3).some((part) => !Number.isFinite(part))) {
        return fill;
    }
    return `rgba(${Math.round(parts[0])}, ${Math.round(parts[1])}, ${Math.round(parts[2])}, ${opacity})`;
}
function annexedRegionFill(countryCode) {
    return withFillOpacity(baseCountryFill(countryCode), 0.82);
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
function formatIndexScore(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${Math.round(numeric * 100)}/100` : "-";
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
    if (metricKey === "attractiveness") {
        return formatDecimal(numeric);
    }
    if (metricKey === "inflation") {
        return formatInflationDirection(numeric, true);
    }
    if (metricKey === "elections") {
        return formatElectionTendency(numeric).label;
    }
    if (metricKey === "integration" || metricKey === "corruption") {
        return formatIndexScore(numeric);
    }
    if (metricKey === "satisfaction") {
        return formatPercent(numeric);
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
