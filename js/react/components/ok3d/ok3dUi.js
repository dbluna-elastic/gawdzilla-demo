/**
 * OK 3D UI helpers (labels, formatting).
 */

/**
 * @param {string|null|undefined} siteId
 * @returns {string}
 */
export function formatSiteLabel(siteId) {
    if (!siteId) return '—';
    if (siteId === 'kaefs') return 'Kessler (kaefs)';
    if (siteId === 'bixby') return 'Bixby';
    if (siteId === 'all') return 'All sites';
    return String(siteId);
}

/**
 * @param {number|null|undefined} seconds
 * @returns {string}
 */
export function formatSeconds(seconds) {
    if (seconds == null || !Number.isFinite(Number(seconds))) return '—';
    const s = Number(seconds);
    if (s < 60) return `${Math.round(s)}s`;
    const m = Math.floor(s / 60);
    const rem = Math.round(s % 60);
    return `${m}m ${rem}s`;
}

/**
 * @param {number|null|undefined} value
 * @param {number} [digits]
 * @returns {string}
 */
export function formatNumber(value, digits = 0) {
    if (value == null || !Number.isFinite(Number(value))) return '—';
    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: digits,
        minimumFractionDigits: 0,
    });
}

/**
 * @param {string|null|undefined} iso
 * @returns {string}
 */
export function formatWhen(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return String(iso);
    }
}

/**
 * @param {string} boundaryType
 * @returns {string}
 */
export function formatBoundaryType(boundaryType) {
    if (!boundaryType) return 'Boundary';
    return String(boundaryType).replace(/_/g, ' ');
}

/**
 * @param {string} boundaryType
 * @returns {string}
 */
export function boundaryColor(boundaryType) {
    if (boundaryType === 'operating_volume') return '#3B82F6';
    if (boundaryType === 'site_buffer') return '#F15A22';
    return '#94A3B8';
}
