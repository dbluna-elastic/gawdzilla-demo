/**
 * library-receipts-assistant fast path — direct ESQL for common spend questions.
 */

import {
    getTsuIllSpendFy2026,
    getTsuPendingOverThreshold,
    getTsuDuplicateInvoices,
    getTsuTaxChargedReceipts,
} from './tsuLibraryEsqlQueries.js';

export const TSU_LIBRARY_AGENT = 'library-receipts-assistant';

function formatUsd(value) {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(Number(value));
}

/**
 * @param {string} message
 * @returns {'ill'|'pending'|'duplicates'|'tax'|null}
 */
function matchTsuIntent(message) {
    const q = message.trim().toLowerCase();

    if (/\b(ill|interlibrary|sharepath)\b/.test(q) && /\b(spend|cost|fy2026|fiscal)\b/.test(q)) {
        return 'ill';
    }
    if (/\b(pending|review)\b/.test(q) && /\b(5000|5,?000|over|threshold)\b/.test(q)) {
        return 'pending';
    }
    if (/\bduplicate\b/.test(q)) {
        return 'duplicates';
    }
    if (/\b(sales tax|tax charged|charged sales tax)\b/.test(q)) {
        return 'tax';
    }

    return null;
}

/**
 * @param {string} agentId
 * @param {string} message
 * @returns {Promise<{ output: string }|null>}
 */
export async function tryTsuLibraryChatFastPath(agentId, message) {
    if (agentId !== TSU_LIBRARY_AGENT) return null;

    const intent = matchTsuIntent(message);
    if (!intent) return null;

    try {
        if (intent === 'ill') {
            const stats = await getTsuIllSpendFy2026();
            return {
                output: [
                    '**ILL spend — FY2026** (synthetic demo data)',
                    '',
                    `- **Spend:** ${formatUsd(stats.spend)}`,
                    `- **Receipts:** ${stats.receipts?.toLocaleString() ?? '—'}`,
                    '',
                    '_Texas State fiscal years run Sept 1–Aug 31._',
                ].join('\n'),
            };
        }

        if (intent === 'pending') {
            const rows = await getTsuPendingOverThreshold(5000, 10);
            if (!rows.length) {
                return { output: 'No receipts over $5,000 are currently pending review (synthetic corpus).' };
            }
            const lines = rows.map(
                (r) => `- **${r.invoiceNumber}** (${r.receiptId}): ${r.vendor} — ${formatUsd(r.total)}`,
            );
            return {
                output: `**Pending review over $5,000**\n\n${lines.join('\n')}\n\n_Cite invoice_number and receipt_id when following up._`,
            };
        }

        if (intent === 'duplicates') {
            const rows = await getTsuDuplicateInvoices(10);
            if (!rows.length) {
                return { output: 'No receipts tagged `possible_duplicate` were found.' };
            }
            const lines = rows.map(
                (r) => `- **${r.invoiceNumber}** / receipt \`${r.receiptId}\`: ${r.vendor} — ${formatUsd(r.total)} (${r.fileName})`,
            );
            return {
                output: `**Possible duplicate invoices**\n\n${lines.join('\n')}\n\n_Talk-track invoice: **MS-INV-77821**_`,
            };
        }

        if (intent === 'tax') {
            const rows = await getTsuTaxChargedReceipts(5);
            if (!rows.length) {
                return { output: 'No tax-charged receipts found in the synthetic corpus.' };
            }
            const top = rows[0];
            const lines = rows.map(
                (r) => `- **${r.invoiceNumber}** / receipt \`${r.receiptId}\`: tax ${formatUsd(r.tax)}, total ${formatUsd(r.total)}`,
            );
            return {
                output: [
                    '**Sales tax charged** (synthetic)',
                    '',
                    `Primary talk-track: invoice **${top.invoiceNumber}** (receipt \`${top.receiptId}\`) — tax **${formatUsd(top.tax)}**.`,
                    '',
                    ...lines,
                ].join('\n'),
            };
        }
    } catch (error) {
        console.warn('TSU library chat fast path failed:', error.message);
        return null;
    }

    return null;
}
