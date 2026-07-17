window.BALKAN_CONFIG = {
  activeMapCountryCodes: ["ALB", "BGR", "BIH", "GRC", "HRV", "HUN", "MKD", "MNE", "ROU", "SRB", "SVN"],
  plannedMapCountryCodes: [],
  countries: {
    ALB: { name: "Albania", displayCode: "ALB", flag: "\uD83C\uDDE6\uD83C\uDDF1", fill: "rgba(146, 124, 104, 0.90)" },
    BGR: { name: "Bulgaria", displayCode: "BG", flag: "\uD83C\uDDE7\uD83C\uDDEC", fill: "rgba(137, 161, 104, 0.90)" },
    BIH: { name: "Bosnia and Herzegovina", displayCode: "BIH", flag: "\uD83C\uDDE7\uD83C\uDDE6", fill: "rgba(54, 104, 73, 0.90)" },
    GRC: { name: "Greece", displayCode: "GRC", flag: "\uD83C\uDDEC\uD83C\uDDF7", fill: "rgba(86, 133, 184, 0.90)" },
    HRV: { name: "Croatia", displayCode: "HRV", flag: "\uD83C\uDDED\uD83C\uDDF7", fill: "rgba(184, 109, 77, 0.90)" },
    HUN: { name: "Hungary", displayCode: "HUN", flag: "\uD83C\uDDED\uD83C\uDDFA", fill: "rgba(158, 127, 105, 0.90)" },
    MKD: { name: "North Macedonia", displayCode: "NMK", flag: "\uD83C\uDDF2\uD83C\uDDF0", fill: "rgba(151, 112, 135, 0.90)" },
    MNE: { name: "Montenegro", displayCode: "MNE", flag: "\uD83C\uDDF2\uD83C\uDDEA", fill: "rgba(114, 151, 186, 0.90)" },
    ROU: { name: "Romania", displayCode: "ROM", flag: "\uD83C\uDDF7\uD83C\uDDF4", fill: "rgba(196, 177, 90, 0.90)" },
    SRB: { name: "Serbia", displayCode: "SRB", flag: "\uD83C\uDDF7\uD83C\uDDF8", fill: "rgba(184, 195, 173, 0.90)" },
    SVN: { name: "Slovenia", displayCode: "SVN", flag: "\uD83C\uDDF8\uD83C\uDDEE", fill: "rgba(104, 156, 196, 0.90)" },
    XKX: { name: "Kosovo", displayCode: "XKX", flag: "\uD83C\uDDFD\uD83C\uDDF0", fill: "rgba(212, 161, 108, 0.88)" }
  },
  editorTargetOptions: {
    ALB: [
      { visualRegionKey: "ALB::north", label: "N ALB", dataRegionKey: "ALB::northern albania", fill: "#7f8d62" },
      { visualRegionKey: "ALB::central", label: "C ALB", dataRegionKey: "ALB::tirana", fill: "#a68962", useDefinitionDataKeys: true },
      { visualRegionKey: "ALB::south", label: "S ALB", dataRegionKey: "ALB::southern albania", fill: "#b67658" }
    ],
    BGR: [
      { visualRegionKey: "BGR::sofia", label: "Sofia", dataRegionKey: "BGR::sofia", fill: "#63718d" },
      { visualRegionKey: "BGR::north", label: "N BUL", dataRegionKey: "BGR::northern bulgaria", fill: "#c58b4a" },
      { visualRegionKey: "BGR::south", label: "S BUL", dataRegionKey: "BGR::southern bulgaria", fill: "#6f9250" },
      { visualRegionKey: "BGR::black-sea", label: "Black Sea", dataRegionKey: "BGR::black sea bulgaria", fill: "#4e83a5" }
    ],
    BIH: [
      { visualRegionKey: "BIH::fbih", label: "FBiH", dataRegionKey: "BIH::federation of bosnia and herzegovina", fill: "#8f776d" },
      { visualRegionKey: "BIH::rs", label: "RS", dataRegionKey: "BIH::republika srpska", fill: "#a4a08c", useDefinitionDataKeys: true }
    ],
    GRC: [
      { visualRegionKey: "GRC::attica", label: "Attica", dataRegionKey: "GRC::attica", fill: "#6689c0" },
      { visualRegionKey: "GRC::macedonia-thrace", label: "Macedonia-Thrace", dataRegionKey: "GRC::macedonia thrace", fill: "#5b9ba7" },
      { visualRegionKey: "GRC::epirus-western-macedonia", label: "Epirus-W. Mac.", dataRegionKey: "GRC::epirus western macedonia", fill: "#7aa276" },
      { visualRegionKey: "GRC::thessalia-central-greece", label: "Thessaly-C. Greece", dataRegionKey: "GRC::thessalia central greece", fill: "#9eb36a" },
      { visualRegionKey: "GRC::peloponnese-west-greece-ionian", label: "Peloponnese", dataRegionKey: "GRC::peloponisos w greece ionian", fill: "#c19362" },
      { visualRegionKey: "GRC::crete", label: "Crete", dataRegionKey: "GRC::crete", fill: "#d0a05f" },
      { visualRegionKey: "GRC::aegean", label: "Aegean", dataRegionKey: "GRC::aegean", fill: "#6aaec4" },
      { visualRegionKey: "GRC::agion-oros", label: "Athos", dataRegionKey: "GRC::agion oros", fill: "#8b7fa9" }
    ],
    HRV: [
      { visualRegionKey: "HRV::zagreb-central", label: "C HRV", dataRegionKey: "HRV::zagreb and central croatia", fill: "#a25d46" },
      { visualRegionKey: "HRV::slavonia", label: "Slavonija", dataRegionKey: "HRV::slavonia", fill: "#c97f44" },
      { visualRegionKey: "HRV::dalmatia", label: "Dalmacija", dataRegionKey: "HRV::dalmatia", fill: "#d9ac70" },
      { visualRegionKey: "HRV::istria-kvarner", label: "Istrija", dataRegionKey: "HRV::istria and kvarner", fill: "#8f6f5a" }
    ],
    HUN: [
      { visualRegionKey: "HUN::central-hungary", label: "Budapest", dataRegionKey: "HUN::central hungary", fill: "#d34b4b" },
      { visualRegionKey: "HUN::north-hungary", label: "N HUN", dataRegionKey: "HUN::northern hungary", fill: "#81c5d8" },
      { visualRegionKey: "HUN::great-plains", label: "Great Plains", dataRegionKey: "HUN::great plains", fill: "#41b65a" },
      { visualRegionKey: "HUN::transdanubia", label: "Transdanubia", dataRegionKey: "HUN::transdanubia", fill: "#6f63c7" }
    ],
    MKD: [
      { visualRegionKey: "MKD::west", label: "W MAC", dataRegionKey: "MKD::western north macedonia", fill: "#b78361" },
      { visualRegionKey: "MKD::skopje", label: "Skopje", dataRegionKey: "MKD::skopje", fill: "#865c71" },
      { visualRegionKey: "MKD::se", label: "E MAC", dataRegionKey: "MKD::southeastern north macedonia", fill: "#8f6aa7" }
    ],
    MNE: [
      { visualRegionKey: "MNE::coastal-region", label: "CS MON", dataRegionKey: "MNE::coast", fill: "#66aebe" },
      { visualRegionKey: "MNE::southern-montenegro", label: "S MON", dataRegionKey: "MNE::inland", fill: "#4f9488", useDefinitionDataKeys: true },
      { visualRegionKey: "MNE::northern-montenegro", label: "N MON", dataRegionKey: "MNE::inland", fill: "#7aa6cf", useDefinitionDataKeys: true }
    ],
    ROU: [
      { visualRegionKey: "ROU::transylvania-banat", label: "Transylvania", dataRegionKey: "ROU::transylvania and banat", fill: "#ccb65b" },
      { visualRegionKey: "ROU::wallachia-oltenia", label: "Wallachia", dataRegionKey: "ROU::wallachia and oltenia", fill: "#b48a56" },
      { visualRegionKey: "ROU::bucharest-ilfov", label: "Bucharest", dataRegionKey: "ROU::bucharest ilfov", fill: "#8a5d4d" },
      { visualRegionKey: "ROU::moldavia", label: "Moldavia", dataRegionKey: "ROU::moldavia", fill: "#c87892" },
      { visualRegionKey: "ROU::dobruja-lower-danube", label: "Dobruja", dataRegionKey: "ROU::dobruja and lower danube", fill: "#7fa866" }
    ],
    SRB: [
      { visualRegionKey: "SRB::vojvodina", label: "Vojvodina", dataRegionKey: "SRB::vojvodina", fill: "#70b29e" },
      { visualRegionKey: "SRB::belgrade", label: "Beograd", dataRegionKey: "SRB::belgrade", fill: "#b0a59a" },
      { visualRegionKey: "SRB::sz-srb", label: "SZ SRB", dataRegionKey: "SRB::central serbia", fill: "#dce68d" },
      { visualRegionKey: "SRB::ji-srb", label: "JI SRB", dataRegionKey: "SRB::south and east serbia", fill: "#cf857c" },
      { visualRegionKey: "SRB::kosovo-metohija", label: "Kosovo", dataRegionKey: "SRB::kosovo and metohija", fill: "#efb287" }
    ],
    SVN: [
      { visualRegionKey: "SVN::western", label: "W SVN", dataRegionKey: "SVN::western slovenia", fill: "#5c9abf" },
      { visualRegionKey: "SVN::eastern", label: "E SVN", dataRegionKey: "SVN::eastern slovenia", fill: "#78b59f" }
    ]
  },
  defaultTargetRegions: {
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
    SVN: "SVN::western"
  }
};
