/**
 * Texas State Libraries receipt search — Exact / Keyword / Semantic / Hybrid.
 * Ported from Texasstate-library/app/main.py build_search_body.
 */

import {
    fetchElasticsearchSearchWithAgent,
    fetchElasticsearchUpdateWithAgent,
} from './elasticApi.js';

export const TSU_LIBRARY_ES_AGENT = 'library-receipts-assistant';
export const TSU_LIBRARY_INDEX = 'library-receipts';

/**
 * @param {Object} [filters]
 * @returns {Object[]}
 */
export function buildReceiptFilters(filters = {}) {
    const clauses = [];
    if (filters.fiscalYear) {
        clauses.push({ term: { fiscal_year: filters.fiscalYear } });
    }
    if (filters.vendor) {
        clauses.push({ term: { 'vendor.normalized': filters.vendor } });
    }
    if (filters.department) {
        clauses.push({ term: { department: filters.department } });
    }
    if (filters.category) {
        clauses.push({ term: { category: filters.category } });
    }
    if (filters.reviewStatus) {
        clauses.push({ term: { 'review.status': filters.reviewStatus } });
    }
    if (filters.amountMin != null || filters.amountMax != null) {
        const rng = {};
        if (filters.amountMin != null && filters.amountMin !== '') {
            rng.gte = Number(filters.amountMin);
        }
        if (filters.amountMax != null && filters.amountMax !== '') {
            rng.lte = Number(filters.amountMax);
        }
        if (Object.keys(rng).length) {
            clauses.push({ range: { 'amount.total': rng } });
        }
    }
    return clauses;
}

/**
 * @param {string} q
 * @param {string} mode
 * @param {Object[]} filters
 * @param {number} [size]
 * @returns {Object}
 */
export function buildReceiptSearchBody(q, mode, filters, size = 20) {
    const normalizedMode = String(mode || 'hybrid').toLowerCase();

    if (normalizedMode === 'exact') {
        return {
            size,
            query: {
                bool: {
                    should: [
                        { term: { invoice_number: q } },
                        { term: { receipt_id: q } },
                        { ids: { values: [q] } },
                    ],
                    minimum_should_match: 1,
                    filter: filters,
                },
            },
        };
    }

    const standard = {
        standard: {
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query: q,
                                fields: [
                                    'raw_text',
                                    'vendor.name^2',
                                    'invoice_number^4',
                                    'po_number^3',
                                    'line_items.description',
                                ],
                                type: 'best_fields',
                                fuzziness: 'AUTO',
                            },
                        },
                    ],
                    filter: filters,
                },
            },
        },
    };

    const semanticBool = {
        must: [{ semantic: { field: 'content_semantic', query: q } }],
    };
    if (filters.length) {
        semanticBool.filter = filters;
    }
    const semantic = { standard: { query: { bool: semanticBool } } };

    let retriever;
    if (normalizedMode === 'keyword') {
        retriever = standard;
    } else if (normalizedMode === 'semantic') {
        retriever = semantic;
    } else {
        retriever = {
            rrf: {
                retrievers: [standard, semantic],
                rank_constant: 60,
                rank_window_size: 100,
            },
        };
    }

    return {
        size,
        retriever,
        highlight: {
            fields: {
                raw_text: {},
                content_semantic: {},
            },
        },
    };
}

/**
 * @param {Object} resp
 * @param {string} [note]
 * @returns {{ hits: Object[], total: number, note?: string }}
 */
export function formatReceiptHits(resp, note) {
    const hits = [];
    for (const h of resp?.hits?.hits || []) {
        const src = h._source || {};
        const hl = h.highlight || {};
        const snippets = hl.raw_text || hl.content_semantic || [];
        hits.push({
            id: h._id,
            receiptId: src.receipt_id || h._id,
            score: h._score,
            vendor: src.vendor?.normalized || src.vendor?.name || '—',
            vendorRaw: src.vendor || {},
            receiptDate: src.receipt_date,
            fiscalYear: src.fiscal_year,
            amount: src.amount || {},
            total: src.amount?.total,
            tax: src.amount?.tax,
            invoiceNumber: src.invoice_number,
            poNumber: src.po_number,
            department: src.department,
            fundCode: src.fund_code,
            category: src.category,
            tags: src.tags || [],
            storyId: src.story_id,
            extraction: src.extraction || {},
            review: src.review || {},
            source: src.source || {},
            file: src.file || {},
            snippets,
            raw: src,
        });
    }

    const total = resp?.hits?.total;
    const totalN = typeof total === 'object' ? (total.value ?? hits.length) : (total ?? hits.length);
    const out = { hits, total: totalN };
    if (note) out.note = note;
    return out;
}

/**
 * @param {string} q
 * @param {string} [mode]
 * @param {Object} [filters]
 * @returns {Promise<{ hits: Object[], total: number, note?: string }>}
 */
export async function searchLibraryReceipts(q, mode = 'hybrid', filters = {}) {
    const query = String(q || '').trim();
    if (!query) return { hits: [], total: 0 };

    const filterClauses = buildReceiptFilters(filters);
    const body = buildReceiptSearchBody(query, mode, filterClauses);

    try {
        const resp = await fetchElasticsearchSearchWithAgent(
            TSU_LIBRARY_INDEX,
            body,
            TSU_LIBRARY_ES_AGENT,
        );
        return formatReceiptHits(resp);
    } catch (error) {
        const fallbackQuery = String(mode).toLowerCase() === 'semantic'
            ? {
                bool: {
                    must: [{ semantic: { field: 'content_semantic', query } }],
                    filter: filterClauses,
                },
            }
            : String(mode).toLowerCase() === 'exact'
                ? {
                    bool: {
                        should: [
                            { term: { invoice_number: query } },
                            { term: { receipt_id: query } },
                            { ids: { values: [query] } },
                        ],
                        minimum_should_match: 1,
                        filter: filterClauses,
                    },
                }
                : {
                    bool: {
                        must: [
                            {
                                multi_match: {
                                    query,
                                    fields: [
                                        'raw_text',
                                        'vendor.name^2',
                                        'invoice_number^4',
                                        'po_number^3',
                                    ],
                                },
                            },
                        ],
                        filter: filterClauses,
                    },
                };

        const resp = await fetchElasticsearchSearchWithAgent(
            TSU_LIBRARY_INDEX,
            {
                size: 20,
                query: fallbackQuery,
                highlight: { fields: { raw_text: {} } },
            },
            TSU_LIBRARY_ES_AGENT,
        );
        return formatReceiptHits(resp, `fallback_query: ${error.message}`);
    }
}

/**
 * @param {Object} [options]
 * @param {number} [options.size]
 * @param {number} [options.amountMin]
 * @returns {Promise<Object[]>}
 */
export async function listPendingReceipts({ size = 50, amountMin } = {}) {
    const filters = [{ term: { 'review.status': 'pending_review' } }];
    if (amountMin != null) {
        filters.push({ range: { 'amount.total': { gte: Number(amountMin) } } });
    }

    const resp = await fetchElasticsearchSearchWithAgent(
        TSU_LIBRARY_INDEX,
        {
            size: Math.min(Math.max(size, 1), 200),
            query: { bool: { filter: filters } },
            sort: [{ 'amount.total': 'desc' }, { receipt_date: 'desc' }],
        },
        TSU_LIBRARY_ES_AGENT,
    );
    return formatReceiptHits(resp).hits;
}

/**
 * @param {string} receiptId
 * @param {'approve'|'flag'|'pending_review'} action
 * @param {string} reviewer
 * @param {string} [notes]
 * @returns {Promise<{ receiptId: string, review: Object }>}
 */
export async function setReceiptReviewStatus(receiptId, action, reviewer, notes) {
    const name = String(reviewer || '').trim();
    if (!name) throw new Error('Reviewer name is required');
    if (!['approve', 'flag', 'pending_review'].includes(action)) {
        throw new Error(`Unsupported action: ${action}`);
    }

    const status = action === 'approve' ? 'approved' : action;
    const now = new Date().toISOString();
    const review = {
        status,
        reviewer: name,
        approved_at: action === 'approve' ? now : null,
        notes: notes || null,
    };

    await fetchElasticsearchUpdateWithAgent(
        TSU_LIBRARY_INDEX,
        receiptId,
        { review },
        TSU_LIBRARY_ES_AGENT,
    );

    return { receiptId, review };
}

/**
 * Upload a receipt file through the Texasstate-library FastAPI proxy.
 *
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function uploadLibraryReceipt(file) {
    const fd = new FormData();
    fd.append('file', file);

    let response;
    try {
        response = await fetch('/api/tsu-library/upload', {
            method: 'POST',
            body: fd,
        });
    } catch (error) {
        const err = new Error('Upload service unreachable. Start Texasstate-library on :8080.');
        err.cause = error;
        err.isOfflineOffline = true;
        throw err;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(data.error || `Upload failed: ${response.status}`);
        err.status = response.status;
        err.isUploadOffline = response.status === 502 || response.status === 503 || response.status === 504;
        throw err;
    }
    return data;
}
