/**
 * Texas State Libraries receipt ES|QL helpers (library-receipts).
 */

import { fetchESQLQuery } from './elasticApi.js';

export const TSU_LIBRARY_ES_AGENT = 'library-receipts-assistant';

const FROM = 'FROM library-receipts';

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
async function runTsuEsql(query) {
    try {
        const result = await fetchESQLQuery(query, {}, TSU_LIBRARY_ES_AGENT);
        return mapEsqlRows(result);
    } catch (error) {
        if (error.isIndexNotFound || error.status === 404) return [];
        const details = String(error.errorDetails || error.message || '');
        if (/unknown index|no such index|index_not_found/i.test(details)) return [];
        throw error;
    }
}

/**
 * @returns {Promise<{fy2026Spend: number|null, pendingReview: number|null, duplicates: number|null, taxCharged: number|null}>}
 */
export async function getTsuOverviewStats() {
    const [spendRows, pendingRows, dupRows, taxRows] = await Promise.all([
        runTsuEsql(
            `${FROM} | WHERE fiscal_year == "FY2026" | STATS fy_spend = SUM(amount.total) | LIMIT 1`,
        ),
        runTsuEsql(
            `${FROM} | WHERE review.status == "pending_review" | STATS pending_review = COUNT(*) | LIMIT 1`,
        ),
        runTsuEsql(
            `${FROM} | WHERE tags == "possible_duplicate" | STATS duplicates = COUNT(*) | LIMIT 1`,
        ),
        runTsuEsql(
            `${FROM} | WHERE tags == "tax_charged" OR amount.tax > 0 | STATS tax_charged = COUNT(*) | LIMIT 1`,
        ),
    ]);

    const spend = spendRows[0] || {};
    const pending = pendingRows[0] || {};
    const dups = dupRows[0] || {};
    const tax = taxRows[0] || {};

    return {
        fy2026Spend: spend.fy_spend != null ? Number(spend.fy_spend) : null,
        pendingReview: pending.pending_review != null ? Number(pending.pending_review) : null,
        duplicates: dups.duplicates != null ? Number(dups.duplicates) : null,
        taxCharged: tax.tax_charged != null ? Number(tax.tax_charged) : null,
    };
}

/**
 * @param {string} [fiscalYear]
 * @param {number} [limit]
 * @returns {Promise<Array<{vendor: string, spend: number, receipts: number}>>}
 */
export async function getTsuSpendByVendor(fiscalYear = 'FY2026', limit = 20) {
    const size = Math.min(Math.max(limit, 1), 50);
    const rows = await runTsuEsql(
        `${FROM}`
        + ` | WHERE fiscal_year == "${fiscalYear}"`
        + ' | STATS spend = SUM(amount.total), receipts = COUNT(*) BY vendor.normalized'
        + ' | SORT spend DESC'
        + ` | LIMIT ${size}`,
    );
    return rows.map((row) => ({
        vendor: row['vendor.normalized'] || row.vendor || '—',
        spend: row.spend != null ? Number(row.spend) : 0,
        receipts: row.receipts != null ? Number(row.receipts) : 0,
    }));
}

/**
 * @param {string} [fiscalYear]
 * @param {number} [limit]
 * @returns {Promise<Array<{fund: string, spend: number, receipts: number}>>}
 */
export async function getTsuSpendByFund(fiscalYear = 'FY2026', limit = 15) {
    const size = Math.min(Math.max(limit, 1), 50);
    const rows = await runTsuEsql(
        `${FROM}`
        + ` | WHERE fiscal_year == "${fiscalYear}"`
        + ' | STATS spend = SUM(amount.total), receipts = COUNT(*) BY fund_code'
        + ' | SORT spend DESC'
        + ` | LIMIT ${size}`,
    );
    return rows.map((row) => ({
        fund: row.fund_code || row.fund || '—',
        spend: row.spend != null ? Number(row.spend) : 0,
        receipts: row.receipts != null ? Number(row.receipts) : 0,
    }));
}

/**
 * @param {string} [fiscalYear]
 * @param {number} [limit]
 * @returns {Promise<Array<{department: string, spend: number, receipts: number}>>}
 */
export async function getTsuSpendByDepartment(fiscalYear = 'FY2026', limit = 15) {
    const size = Math.min(Math.max(limit, 1), 50);
    const rows = await runTsuEsql(
        `${FROM}`
        + ` | WHERE fiscal_year == "${fiscalYear}"`
        + ' | STATS spend = SUM(amount.total), receipts = COUNT(*) BY department'
        + ' | SORT spend DESC'
        + ` | LIMIT ${size}`,
    );
    return rows.map((row) => ({
        department: row.department || '—',
        spend: row.spend != null ? Number(row.spend) : 0,
        receipts: row.receipts != null ? Number(row.receipts) : 0,
    }));
}

/**
 * @param {number} [limit]
 * @returns {Promise<Array<Object>>}
 */
export async function getTsuTaggedExceptions(limit = 25) {
    const size = Math.min(Math.max(limit, 1), 50);
    const rows = await runTsuEsql(
        `${FROM}`
        + ' | WHERE tags == "possible_duplicate" OR tags == "tax_charged" OR tags == "over_threshold" OR amount.tax > 0'
        + ' | KEEP receipt_id, vendor.normalized, invoice_number, amount.total, amount.tax, tags, review.status, fiscal_year'
        + ' | SORT amount.total DESC'
        + ` | LIMIT ${size}`,
    );
    return rows.map((row) => ({
        receiptId: row.receipt_id || '—',
        vendor: row['vendor.normalized'] || row.vendor || '—',
        invoiceNumber: row.invoice_number || '—',
        total: row['amount.total'] != null ? Number(row['amount.total']) : null,
        tax: row['amount.tax'] != null ? Number(row['amount.tax']) : null,
        tags: row.tags || [],
        reviewStatus: row['review.status'] || row.review_status || '—',
        fiscalYear: row.fiscal_year || '—',
    }));
}

/**
 * ILL / SharePath spend for FY2026 (fast-path + analyze).
 * @returns {Promise<{spend: number|null, receipts: number|null}>}
 */
export async function getTsuIllSpendFy2026() {
    const rows = await runTsuEsql(
        `${FROM}`
        + ' | WHERE fiscal_year == "FY2026"'
        + ' AND (department == "Interlibrary Loan" OR category == "ILL" OR vendor.normalized LIKE "*SharePath*" OR vendor.normalized LIKE "*ILL*")'
        + ' | STATS spend = SUM(amount.total), receipts = COUNT(*)'
        + ' | LIMIT 1',
    );
    const row = rows[0] || {};
    return {
        spend: row.spend != null ? Number(row.spend) : null,
        receipts: row.receipts != null ? Number(row.receipts) : null,
    };
}

/**
 * @param {number} [amountMin]
 * @param {number} [limit]
 * @returns {Promise<Array<Object>>}
 */
export async function getTsuPendingOverThreshold(amountMin = 5000, limit = 20) {
    const size = Math.min(Math.max(limit, 1), 50);
    const rows = await runTsuEsql(
        `${FROM}`
        + ' | WHERE review.status == "pending_review"'
        + ` AND (amount.total > ${Number(amountMin)} OR tags == "over_threshold")`
        + ' | KEEP receipt_id, vendor.normalized, invoice_number, amount.total, tags, fiscal_year'
        + ' | SORT amount.total DESC'
        + ` | LIMIT ${size}`,
    );
    return rows.map((row) => ({
        receiptId: row.receipt_id || '—',
        vendor: row['vendor.normalized'] || '—',
        invoiceNumber: row.invoice_number || '—',
        total: row['amount.total'] != null ? Number(row['amount.total']) : null,
        tags: row.tags || [],
        fiscalYear: row.fiscal_year || '—',
    }));
}

/**
 * @returns {Promise<Array<Object>>}
 */
export async function getTsuDuplicateInvoices(limit = 20) {
    const size = Math.min(Math.max(limit, 1), 50);
    const rows = await runTsuEsql(
        `${FROM}`
        + ' | WHERE tags == "possible_duplicate"'
        + ' | KEEP receipt_id, vendor.normalized, invoice_number, amount.total, file.name, review.status'
        + ' | SORT invoice_number ASC'
        + ` | LIMIT ${size}`,
    );
    return rows.map((row) => ({
        receiptId: row.receipt_id || '—',
        vendor: row['vendor.normalized'] || '—',
        invoiceNumber: row.invoice_number || '—',
        total: row['amount.total'] != null ? Number(row['amount.total']) : null,
        fileName: row['file.name'] || '—',
        reviewStatus: row['review.status'] || '—',
    }));
}

/**
 * @returns {Promise<Array<Object>>}
 */
export async function getTsuTaxChargedReceipts(limit = 20) {
    const size = Math.min(Math.max(limit, 1), 50);
    const rows = await runTsuEsql(
        `${FROM}`
        + ' | WHERE tags == "tax_charged" OR amount.tax > 0'
        + ' | KEEP receipt_id, vendor.normalized, invoice_number, amount.tax, amount.total, review.status'
        + ' | SORT amount.tax DESC'
        + ` | LIMIT ${size}`,
    );
    return rows.map((row) => ({
        receiptId: row.receipt_id || '—',
        vendor: row['vendor.normalized'] || '—',
        invoiceNumber: row.invoice_number || '—',
        tax: row['amount.tax'] != null ? Number(row['amount.tax']) : null,
        total: row['amount.total'] != null ? Number(row['amount.total']) : null,
        reviewStatus: row['review.status'] || '—',
    }));
}
