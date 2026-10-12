/**
 * FW SCADA water ESQL helpers (fw-site-status, metrics-fw_ot.process-*).
 */

import { fetchESQLQuery } from './elasticApi.js';

/** Agent id used to route ESQL to gawdzilla (OK_KIBANA_API_KEY / ok-fraud ES proxy). */
export const FW_SCADA_AGENT = 'elastic-ai-agent';

/**
 * @param {Object} result
 * @returns {Array<Object>}
 */
function mapEsqlRows(result) {
    if (!result?.columns || !result?.values) return [];
    const columns = result.columns.map((c) => c.name);
    return result.values.map((row) => {
        const obj = {};
        columns.forEach((col, idx) => {
            obj[col] = row[idx];
        });
        return obj;
    });
}

/**
 * @param {string} query
 * @returns {Promise<Array<Object>>}
 */
async function runFwEsql(query) {
    try {
        const result = await fetchESQLQuery(query, {}, FW_SCADA_AGENT);
        return mapEsqlRows(result);
    } catch (error) {
        if (error.isIndexNotFound || error.status === 404) return [];
        throw error;
    }
}

/**
 * Parse ES|QL geo_point / WKT POINT into { lat, lon }.
 * @param {unknown} value
 * @returns {{ lat: number, lon: number }|null}
 */
export function parseGeoPoint(value) {
    if (value == null) return null;
    if (typeof value === 'object' && value.lat != null && value.lon != null) {
        return { lat: Number(value.lat), lon: Number(value.lon) };
    }
    if (typeof value === 'string') {
        const m = value.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
        if (m) return { lon: Number(m[1]), lat: Number(m[2]) };
    }
    return null;
}

/**
 * @returns {Promise<{
 *   total: number,
 *   green: number,
 *   amber: number,
 *   red: number,
 *   other: number,
 *   observabilityAlerts: number,
 *   securityAlerts: number,
 *   commHealthPct: number|null,
 *   systemStatus: 'normal'|'degraded'|'critical'
 * }>}
 */
export async function getFwSiteOverviewStats() {
    const rows = await runFwEsql(
        'FROM fw-site-status '
        + '| STATS '
        + 'total = COUNT(*), '
        + 'green = COUNT(*) WHERE status == "green", '
        + 'amber = COUNT(*) WHERE status == "amber", '
        + 'red = COUNT(*) WHERE status == "red", '
        + 'obs = SUM(alerts.observability), '
        + 'sec = SUM(alerts.security) '
        + '| LIMIT 1'
    );
    const row = rows[0] || {};
    const total = Number(row.total || 0);
    const green = Number(row.green || 0);
    const amber = Number(row.amber || 0);
    const red = Number(row.red || 0);
    const other = Math.max(0, total - green - amber - red);
    const commHealthPct = total > 0 ? Math.round((green / total) * 1000) / 10 : null;
    let systemStatus = 'normal';
    if (red > 0) systemStatus = 'critical';
    else if (amber > 0) systemStatus = 'degraded';

    return {
        total,
        green,
        amber,
        red,
        other,
        observabilityAlerts: Number(row.obs || 0),
        securityAlerts: Number(row.sec || 0),
        commHealthPct,
        systemStatus,
    };
}

/**
 * @param {number} [limit]
 * @returns {Promise<Array<Object>>}
 */
export async function getFwSitesByStatus(limit = 40) {
    const safeLimit = Math.min(Math.max(Number(limit) || 40, 1), 100);
    const rows = await runFwEsql(
        'FROM fw-site-status '
        + '| KEEP site.id, site.name, site.type, status, status_reason, '
        + 'alerts.observability, alerts.security, asset.criticality, site.geo.location '
        + '| EVAL status_rank = CASE(status == "red", 0, status == "amber", 1, status == "green", 2, 3) '
        + '| SORT status_rank ASC, site.name ASC '
        + `| LIMIT ${safeLimit}`
    );
    return rows.map((row) => ({
        id: row['site.id'],
        name: row['site.name'],
        type: row['site.type'],
        status: row.status,
        reason: row.status_reason,
        observability: Number(row['alerts.observability'] || 0),
        security: Number(row['alerts.security'] || 0),
        criticality: row['asset.criticality'],
        geo: parseGeoPoint(row['site.geo.location']),
    }));
}

/**
 * @returns {Promise<Array<{ type: string, green: number, amber: number, red: number, total: number }>>}
 */
export async function getFwStatusByType() {
    const rows = await runFwEsql(
        'FROM fw-site-status '
        + '| STATS '
        + 'total = COUNT(*), '
        + 'green = COUNT(*) WHERE status == "green", '
        + 'amber = COUNT(*) WHERE status == "amber", '
        + 'red = COUNT(*) WHERE status == "red" '
        + 'BY site.type '
        + '| SORT total DESC '
        + '| LIMIT 20'
    );
    return rows.map((row) => ({
        type: row['site.type'] || 'unknown',
        total: Number(row.total || 0),
        green: Number(row.green || 0),
        amber: Number(row.amber || 0),
        red: Number(row.red || 0),
    }));
}

/**
 * Active (non-green) sites for the alert list.
 * @param {number} [limit]
 * @returns {Promise<Array<Object>>}
 */
export async function getFwActiveAlerts(limit = 20) {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const rows = await runFwEsql(
        'FROM fw-site-status '
        + '| WHERE status IN ("red", "amber") '
        + '| KEEP site.name, site.type, status, status_reason, alerts.observability, alerts.security '
        + '| EVAL status_rank = CASE(status == "red", 0, 1) '
        + '| SORT status_rank ASC, site.name ASC '
        + `| LIMIT ${safeLimit}`
    );
    return rows.map((row) => ({
        name: row['site.name'],
        type: row['site.type'],
        status: row.status,
        reason: row.status_reason,
        observability: Number(row['alerts.observability'] || 0),
        security: Number(row['alerts.security'] || 0),
        severity: row.status === 'red' ? 'critical' : 'warning',
    }));
}

/**
 * Recent process tag samples for a sparkline.
 * @param {{ siteId: string, tagName: string, limit?: number }} opts
 * @returns {Promise<Array<{ timestamp: string, value: number }>>}
 */
export async function getFwProcessSeries({ siteId, tagName, limit = 36 }) {
    const safeLimit = Math.min(Math.max(Number(limit) || 36, 5), 120);
    const safeSite = String(siteId || '').replace(/"/g, '');
    const safeTag = String(tagName || '').replace(/"/g, '');
    if (!safeSite || !safeTag) return [];

    const rows = await runFwEsql(
        'FROM metrics-fw_ot.process-* '
        + `| WHERE site.id == "${safeSite}" AND ot.tag.name == "${safeTag}" `
        + '| KEEP @timestamp, ot.tag.value '
        + '| SORT @timestamp DESC '
        + `| LIMIT ${safeLimit}`
    );

    return rows
        .map((row) => ({
            timestamp: row['@timestamp'],
            value: Number(row['ot.tag.value']),
        }))
        .filter((p) => Number.isFinite(p.value))
        .reverse();
}
