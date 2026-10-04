/**
 * Ghost students / Title IV aid integrity ESQL helpers (rrp_* indices).
 */

import { fetchESQLQuery } from './elasticApi.js';

export const GHOST_STUDENTS_AGENT = 'rrp-aid-integrity';

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

async function runGhostEsql(query) {
    try {
        const result = await fetchESQLQuery(query, {}, GHOST_STUDENTS_AGENT);
        return mapEsqlRows(result);
    } catch (error) {
        if (error.isIndexNotFound || error.status === 404) return [];
        throw error;
    }
}

/**
 * Executive KPI strip for landing + staff portal.
 * @returns {Promise<{aidAtRisk: number|null, highRiskStudents: number|null, ghostSeats: number|null, waitlistedReal: number|null, nextWaveTickets: number|null}>}
 */
export async function getGhostOverviewStats() {
    const [clawbackRows, highRiskRows, displacedRows, helpdeskRows] = await Promise.all([
        runGhostEsql(
            'FROM rrp_disbursements '
            + '| WHERE term.code == "2026FA" '
            + '| LOOKUP JOIN rrp_student_flags_lookup ON student.id '
            + '| WHERE student.risk_tier == "high" '
            + '| STATS at_risk = SUM(disbursement.amount) WHERE disbursement.status == "released", '
            + 'students = COUNT_DISTINCT(student.id) '
            + '| LIMIT 1'
        ),
        runGhostEsql(
            'FROM rrp_student_flags_lookup '
            + '| WHERE student.risk_tier == "high" '
            + '| STATS high_risk = COUNT(*) '
            + '| LIMIT 1'
        ),
        runGhostEsql(
            'FROM rrp_enrollment '
            + '| WHERE term.code == "2026FA" '
            + '| LOOKUP JOIN rrp_student_flags_lookup ON student.id '
            + '| STATS ghost_seats = COUNT(*) WHERE enrollment.status == "enrolled" AND student.risk_tier == "high", '
            + 'waitlisted_real = COUNT(*) WHERE enrollment.status == "waitlisted" AND student.risk_tier == "low" '
            + '| LIMIT 1'
        ),
        runGhostEsql(
            'FROM rrp_helpdesk '
            + '| WHERE @timestamp >= NOW() - 30 days AND ticket.category == "account_access" '
            + '| LOOKUP JOIN rrp_student_flags_lookup ON student.id '
            + '| WHERE student.risk_tier IN ("high", "medium") '
            + '| STATS tickets = COUNT(*) '
            + '| LIMIT 1'
        ),
    ]);

    const claw = clawbackRows[0] || {};
    const high = highRiskRows[0] || {};
    const disp = displacedRows[0] || {};
    const hd = helpdeskRows[0] || {};

    return {
        aidAtRisk: claw.at_risk != null ? Number(claw.at_risk) : null,
        highRiskStudents: high.high_risk != null ? Number(high.high_risk) : null,
        ghostSeats: disp.ghost_seats != null ? Number(disp.ghost_seats) : null,
        waitlistedReal: disp.waitlisted_real != null ? Number(disp.waitlisted_real) : null,
        nextWaveTickets: hd.tickets != null ? Number(hd.tickets) : null,
    };
}

/**
 * Top ghost-score students from the flags lookup.
 * @param {number} [limit=12]
 * @returns {Promise<Array<Object>>}
 */
export async function getGhostScoreTop(limit = 12) {
    const query = `FROM rrp_student_flags_lookup
| WHERE student.risk_tier == "high"
| SORT student.ghost_score DESC
| KEEP student.id, student.risk_tier, student.ghost_score, student.review_status
| LIMIT ${Math.min(limit, 25)}`;
    return runGhostEsql(query);
}

/**
 * Shared device fingerprints across applicants (Q1 shape).
 * @param {number} [limit=8]
 * @returns {Promise<Array<Object>>}
 */
export async function getSharedDevices(limit = 8) {
    const query = `FROM rrp_applications
| WHERE @timestamp >= NOW() - 150 days
| STATS applicants = COUNT_DISTINCT(student.id) BY device.fingerprint
| WHERE applicants >= 5
| SORT applicants DESC
| LIMIT ${Math.min(limit, 20)}`;
    return runGhostEsql(query);
}

/**
 * Shared refund destinations (Q3 shape).
 * @param {number} [limit=8]
 * @returns {Promise<Array<Object>>}
 */
export async function getSharedRefundAccounts(limit = 8) {
    const query = `FROM rrp_disbursements
| WHERE refund.account_hash IS NOT NULL
| STATS students = COUNT_DISTINCT(student.id),
        terms = COUNT_DISTINCT(term.code),
        refunded = SUM(refund.amount)
  BY refund.account_hash
| WHERE students > 1
| SORT refunded DESC
| LIMIT ${Math.min(limit, 20)}`;
    return runGhostEsql(query);
}

/**
 * Fall clawback exposure by fund type (for bar chart).
 * @returns {Promise<Array<{fund_type: string, at_risk: number}>>}
 */
export async function getClawbackByFundType() {
    const rows = await runGhostEsql(
        'FROM rrp_disbursements '
        + '| WHERE term.code == "2026FA" '
        + '| LOOKUP JOIN rrp_student_flags_lookup ON student.id '
        + '| WHERE student.risk_tier == "high" '
        + '| STATS at_risk = SUM(disbursement.amount) WHERE disbursement.status == "released" '
        + 'BY disbursement.fund_type '
        + '| SORT at_risk DESC '
        + '| LIMIT 10'
    );
    return rows.map((row) => ({
        fund_type: String(row['disbursement.fund_type'] || 'unknown'),
        at_risk: Number(row.at_risk || 0),
    }));
}

/**
 * Sections with ghost seats vs waitlisted real students (for grouped bar chart).
 * @param {number} [limit=6]
 * @returns {Promise<Array<{course: string, ghost_seats: number, waitlisted_real: number}>>}
 */
export async function getDisplacedBySection(limit = 6) {
    const rows = await runGhostEsql(
        'FROM rrp_enrollment '
        + '| WHERE term.code == "2026FA" '
        + '| LOOKUP JOIN rrp_student_flags_lookup ON student.id '
        + '| STATS ghost_seats = COUNT(*) WHERE enrollment.status == "enrolled" AND student.risk_tier == "high", '
        + 'waitlisted_real = COUNT(*) WHERE enrollment.status == "waitlisted" AND student.risk_tier == "low" '
        + 'BY course.title '
        + '| WHERE ghost_seats > 0 AND waitlisted_real > 0 '
        + '| SORT ghost_seats DESC '
        + `| LIMIT ${Math.min(limit, 12)}`
    );
    return rows.map((row) => ({
        course: String(row['course.title'] || 'Unknown'),
        ghost_seats: Number(row.ghost_seats || 0),
        waitlisted_real: Number(row.waitlisted_real || 0),
    }));
}
