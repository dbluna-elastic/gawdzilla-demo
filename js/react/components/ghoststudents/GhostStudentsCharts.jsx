/**
 * Compact charts for the ghost students staff portal (no chart library).
 */

import { formatUsd } from './ghostStudentsUi.js';

const FUND_LABELS = {
    pell: 'Pell',
    direct_loan: 'Direct Loan',
    state_grant: 'State Grant',
};

/**
 * @param {string} fundType
 * @returns {string}
 */
function fundLabel(fundType) {
    const key = String(fundType || '').toLowerCase();
    return FUND_LABELS[key] || fundType || 'Other';
}

/**
 * Compact horizontal bars: released aid at risk by fund type.
 * @param {{ rows: Array<{fund_type: string, at_risk: number}>, primaryColor: string, accentColor: string, loading?: boolean }} props
 */
export function ClawbackByFundChart({ rows, primaryColor, accentColor, loading }) {
    const max = Math.max(...(rows || []).map((r) => Number(r.at_risk) || 0), 1);

    return (
        <div className="px-4 py-3">
            {loading && <p className="text-xs text-gray-500">Loading…</p>}
            {!loading && (!rows || rows.length === 0) && (
                <p className="text-xs text-gray-500">No clawback-by-fund data.</p>
            )}
            {!loading && rows?.length > 0 && (
                <div className="space-y-2">
                    {rows.map((row) => {
                        const value = Number(row.at_risk) || 0;
                        const pct = Math.max(4, Math.round((value / max) * 100));
                        return (
                            <div key={row.fund_type} className="flex items-center gap-3">
                                <span className="w-24 shrink-0 text-xs font-semibold text-gray-800 truncate">
                                    {fundLabel(row.fund_type)}
                                </span>
                                <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${pct}%`,
                                            background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
                                        }}
                                    />
                                </div>
                                <span className="w-20 shrink-0 text-right text-xs font-bold tabular-nums" style={{ color: primaryColor }}>
                                    {formatUsd(value)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/**
 * Compact dual-metric rows: ghost seats vs waitlisted by course.
 * @param {{ rows: Array<{course: string, ghost_seats: number, waitlisted_real: number}>, primaryColor: string, accentColor: string, loading?: boolean }} props
 */
export function DisplacedSectionsChart({ rows, primaryColor, accentColor, loading }) {
    const max = Math.max(
        ...(rows || []).flatMap((r) => [Number(r.ghost_seats) || 0, Number(r.waitlisted_real) || 0]),
        1
    );

    return (
        <div className="px-4 py-3">
            {loading && <p className="text-xs text-gray-500">Loading…</p>}
            {!loading && (!rows || rows.length === 0) && (
                <p className="text-xs text-gray-500">No displaced-section data.</p>
            )}
            {!loading && rows?.length > 0 && (
                <>
                    <div className="mb-2 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        <span className="inline-flex items-center gap-1">
                            <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: primaryColor }} />
                            Ghost
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: accentColor }} />
                            Waitlist
                        </span>
                    </div>
                    <div className="space-y-2">
                        {rows.map((row) => {
                            const ghost = Number(row.ghost_seats) || 0;
                            const wait = Number(row.waitlisted_real) || 0;
                            const ghostPct = Math.max(3, Math.round((ghost / max) * 100));
                            const waitPct = Math.max(3, Math.round((wait / max) * 100));
                            return (
                                <div key={row.course} className="flex items-center gap-2">
                                    <span className="w-20 shrink-0 text-xs font-semibold text-gray-800 truncate" title={row.course}>
                                        {row.course}
                                    </span>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${ghostPct}%`, backgroundColor: primaryColor }} />
                                            </div>
                                            <span className="w-5 text-right text-[10px] tabular-nums text-gray-600">{ghost}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${waitPct}%`, backgroundColor: accentColor }} />
                                            </div>
                                            <span className="w-5 text-right text-[10px] tabular-nums text-gray-600">{wait}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
