/**
 * OK 3D UAS ES|QL helpers (uas-flights, uas-boundaries, remoteid-detections, adsb-traffic).
 */

import { fetchESQLQuery } from './elasticApi.js';
import { parseGeoPoint } from './fwScadaEsqlQueries.js';

/** Agent id used to route ESQL to gawdzilla (OK_KIBANA_API_KEY / ok-fraud ES proxy). */
export const OK3D_AGENT = 'mesonet-flight-analyst';

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
async function runOk3dEsql(query) {
    try {
        const result = await fetchESQLQuery(query, {}, OK3D_AGENT);
        return mapEsqlRows(result);
    } catch (error) {
        if (error.isIndexNotFound || error.status === 404) return [];
        throw error;
    }
}

/**
 * @param {string|null|undefined} siteId
 * @param {string} field
 * @returns {string}
 */
function siteWhere(siteId, field = 'site.id') {
    if (!siteId || siteId === 'all') return '';
    const safe = String(siteId).replace(/[^a-z0-9_-]/gi, '');
    if (!safe) return '';
    return `| WHERE ${field} == "${safe}" `;
}

/**
 * Overview KPIs from recent flights.
 * @param {string} [siteId]
 * @returns {Promise<{
 *   flights24h: number,
 *   flights7d: number,
 *   avgMaxAltFt: number|null,
 *   avgBatteryMin: number|null,
 *   faultFlights: number,
 *   avgDeliveryLatencyS: number|null,
 *   lastFlightId: string|null,
 *   lastDroneId: string|null,
 *   lastSiteId: string|null,
 *   lastFlightEnd: string|null
 * }>}
 */
export async function getOk3dOverviewStats(siteId = 'all') {
    const where = siteWhere(siteId);
    const [aggRows, lastRows] = await Promise.all([
        runOk3dEsql(
            'FROM uas-flights '
            + `${where}`
            + '| STATS '
            + 'flights24h = COUNT(*) WHERE flight.end > NOW() - 24 hours, '
            + 'flights7d = COUNT(*) WHERE flight.end > NOW() - 7 days, '
            + 'avg_alt = AVG(flight.max_alt_agl_ft) WHERE flight.end > NOW() - 7 days, '
            + 'avg_batt = AVG(battery.min_pct) WHERE flight.end > NOW() - 7 days, '
            + 'fault_flights = COUNT(*) WHERE flight.end > NOW() - 7 days AND faults IS NOT NULL, '
            + 'avg_latency = AVG(delivery.latency_s) WHERE flight.end > NOW() - 7 days '
            + '| LIMIT 1'
        ),
        runOk3dEsql(
            'FROM uas-flights '
            + `${where}`
            + '| SORT flight.end DESC '
            + '| KEEP flight.id, drone.id, site.id, flight.end '
            + '| LIMIT 1'
        ),
    ]);

    const agg = aggRows[0] || {};
    const last = lastRows[0] || {};

    return {
        flights24h: Number(agg.flights24h || 0),
        flights7d: Number(agg.flights7d || 0),
        avgMaxAltFt: agg.avg_alt == null ? null : Number(agg.avg_alt),
        avgBatteryMin: agg.avg_batt == null ? null : Number(agg.avg_batt),
        faultFlights: Number(agg.fault_flights || 0),
        avgDeliveryLatencyS: agg.avg_latency == null ? null : Number(agg.avg_latency),
        lastFlightId: last['flight.id'] || null,
        lastDroneId: last['drone.id'] || null,
        lastSiteId: last['site.id'] || null,
        lastFlightEnd: last['flight.end'] || null,
    };
}

/**
 * @param {string} [siteId]
 * @param {number} [limit]
 * @returns {Promise<Array<Object>>}
 */
export async function getOk3dRecentFlights(siteId = 'all', limit = 40) {
    const where = siteWhere(siteId);
    const safeLimit = Math.min(Math.max(Number(limit) || 40, 1), 100);
    const rows = await runOk3dEsql(
        'FROM uas-flights '
        + `${where}`
        + '| SORT flight.end DESC '
        + '| KEEP flight.id, drone.id, site.id, flight.max_alt_agl_ft, flight.duration_s, '
        + 'battery.min_pct, faults, delivery.latency_s, delivery.delivered_at, flight.start, flight.end '
        + `| LIMIT ${safeLimit}`
    );

    return rows.map((row) => ({
        flightId: row['flight.id'],
        droneId: row['drone.id'],
        siteId: row['site.id'],
        maxAltFt: row['flight.max_alt_agl_ft'] == null ? null : Number(row['flight.max_alt_agl_ft']),
        durationS: row['flight.duration_s'] == null ? null : Number(row['flight.duration_s']),
        batteryMinPct: row['battery.min_pct'] == null ? null : Number(row['battery.min_pct']),
        faults: normalizeFaults(row.faults),
        deliveryLatencyS: row['delivery.latency_s'] == null ? null : Number(row['delivery.latency_s']),
        deliveredAt: row['delivery.delivered_at'] || null,
        start: row['flight.start'] || null,
        end: row['flight.end'] || null,
    }));
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeFaults(value) {
    if (value == null || value === '') return [];
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    return [String(value)];
}

/**
 * Operating-volume / buffer points for the flight-area map.
 * @param {string} [siteId]
 * @returns {Promise<Array<{ id: string, name: string, type: string, ceilingFt: number|null, geo: { lat: number, lon: number }|null }>>}
 */
export async function getOk3dBoundaries(siteId = 'all') {
    const where = siteWhere(siteId);
    const rows = await runOk3dEsql(
        'FROM uas-boundaries '
        + `${where}`
        + '| KEEP site.id, site.name, boundary.type, ceiling_ft_agl, location '
        + '| LIMIT 50'
    );

    return rows.map((row) => ({
        id: `${row['site.id'] || 'site'}-${row['boundary.type'] || 'boundary'}`,
        name: row['site.name'] || row['site.id'] || 'Site',
        siteId: row['site.id'] || '',
        type: row['boundary.type'] || 'boundary',
        ceilingFt: row.ceiling_ft_agl == null ? null : Number(row.ceiling_ft_agl),
        geo: parseGeoPoint(row.location),
    }));
}

/**
 * @param {string} [siteId]
 * @returns {Promise<Array<{ serial: string, detections: number }>>}
 */
export async function getOk3dRemoteIdDetections(siteId = 'all') {
    let query = 'FROM remoteid-detections | WHERE @timestamp > NOW() - 24 hours ';
    if (siteId && siteId !== 'all') {
        const safe = String(siteId).replace(/[^a-z0-9_-]/gi, '');
        if (safe) query += `AND detector.site == "${safe}" `;
    }
    query += '| STATS detections = COUNT(*) BY uas.serial | SORT detections DESC | LIMIT 25';
    const rows = await runOk3dEsql(query);
    return rows.map((row) => ({
        serial: row['uas.serial'] || 'unknown',
        detections: Number(row.detections || 0),
    }));
}

/**
 * @param {string} [siteId]
 * @returns {Promise<{ tracks24h: number }>}
 */
export async function getOk3dAdsbSummary(siteId = 'all') {
    // ADS-B index may not be site-tagged consistently; count last 24h globally for v1.
    void siteId;
    const rows = await runOk3dEsql(
        'FROM adsb-traffic '
        + '| WHERE @timestamp > NOW() - 24 hours '
        + '| STATS tracks24h = COUNT(*) '
        + '| LIMIT 1'
    );
    return { tracks24h: Number(rows[0]?.tracks24h || 0) };
}

/**
 * @returns {Promise<Array<{ siteId: string, flights: number, avgLatencyS: number|null, p95LatencyS: number|null }>>}
 */
export async function getOk3dDeliveryReport() {
    const rows = await runOk3dEsql(
        'FROM uas-flights '
        + '| WHERE flight.end > NOW() - 7 days '
        + '| STATS flights = COUNT(*), avg_latency = AVG(delivery.latency_s), '
        + 'p95_latency = PERCENTILE(delivery.latency_s, 95) BY site.id '
        + '| SORT flights DESC'
    );

    return rows.map((row) => ({
        siteId: row['site.id'] || 'unknown',
        flights: Number(row.flights || 0),
        avgLatencyS: row.avg_latency == null ? null : Number(row.avg_latency),
        p95LatencyS: row.p95_latency == null ? null : Number(row.p95_latency),
    }));
}

export { parseGeoPoint };
