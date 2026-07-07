window.BESP_UTILS = {
    extractCoordinates(geometry) {
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
    },

    geometryToPath(geometry, projection, includeHoles = true) {
        const type = geometry?.type;
        const coordinates = geometry?.coordinates;
        if (!type || !coordinates) {
            return "";
        }
        if (type === "Polygon") {
            return window.BESP_UTILS.polygonToPath(coordinates, projection, includeHoles);
        }
        if (type === "MultiPolygon") {
            return coordinates
                .map((polygon) => window.BESP_UTILS.polygonToPath(polygon, projection, includeHoles))
                .join(" ");
        }
        return "";
    },

    polygonToPath(polygonCoordinates, projection, includeHoles) {
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
    },

    geometryCentroid(geometry, projection, fallbackWidth, fallbackHeight) {
        const points = window.BESP_UTILS.extractCoordinates(geometry);
        if (!points.length) {
            return [fallbackWidth / 2, fallbackHeight / 2];
        }
        let lonSum = 0;
        let latSum = 0;
        for (const [lon, lat] of points) {
            lonSum += lon;
            latSum += lat;
        }
        return projection(lonSum / points.length, latSum / points.length);
    },

    createProjection(features, { width, height, padding, throwOnInvalid = false }) {
        let minLon = Number.POSITIVE_INFINITY;
        let maxLon = Number.NEGATIVE_INFINITY;
        let minLat = Number.POSITIVE_INFINITY;
        let maxLat = Number.NEGATIVE_INFINITY;
        for (const feature of features) {
            for (const [lon, lat] of window.BESP_UTILS.extractCoordinates(feature.geometry)) {
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
            if (throwOnInvalid) {
                throw new Error("Could not compute map bounds");
            }
            minLon = 0;
            maxLon = 1;
            minLat = 0;
            maxLat = 1;
        }
        const lonSpan = Math.max(maxLon - minLon, 1e-9);
        const latSpan = Math.max(maxLat - minLat, 1e-9);
        const usableWidth = width - padding * 2;
        const usableHeight = height - padding * 2;
        const scale = Math.min(usableWidth / lonSpan, usableHeight / latSpan);
        const offsetX = (width - lonSpan * scale) / 2;
        const offsetY = (height - latSpan * scale) / 2;
        return (lon, lat) => [
            offsetX + (lon - minLon) * scale,
            offsetY + (maxLat - lat) * scale,
        ];
    },

    normalizeCountryCode(countryCode) {
        return String(countryCode ?? "").trim().toUpperCase();
    },

    repairRegionTextMojibakeAscii(regionName) {
        return String(regionName ?? "")
            .replaceAll("ÃƒÂ«", "Ã«")
            .replaceAll("ÃƒÂ§", "Ã§")
            .replaceAll("Ã„Â", "Ä")
            .replaceAll("ÃƒÂ¡", "Ã¡")
            .replaceAll("ÃƒÂ¢", "Ã¢")
            .replaceAll("ÃƒÂ©", "Ã©")
            .replaceAll("ÃƒÂ­", "Ã­")
            .replaceAll("ÃƒÂ³", "Ã³")
            .replaceAll("ÃƒÂ¶", "Ã¶")
            .replaceAll("ÃƒÂº", "Ãº")
            .replaceAll("ÃƒÂ¼", "Ã¼")
            .replaceAll("Ã…â€˜", "Å‘")
            .replaceAll("Ã…Â±", "Å±");
    },

    normalizeRegionName(regionName, aliases = {}) {
        const compact = window.BESP_UTILS.repairRegionTextMojibakeAscii(regionName)
            .normalize("NFKD")
            .replaceAll(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase()
            .replaceAll("&", " and ")
            .replaceAll(/[^a-z0-9 ]+/g, " ")
            .replaceAll(/\s+/g, " ");
        return aliases[compact] ?? compact;
    },

    buildRegionKey(countryCode, regionName, aliases = {}) {
        return `${window.BESP_UTILS.normalizeCountryCode(countryCode)}::${window.BESP_UTILS.normalizeRegionName(regionName, aliases)}`;
    },

    escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    },
};
