/**
 * GhostStudentsPanel — Aid integrity tab with live Elastic KPIs and shared infrastructure.
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import {
    getGhostOverviewStats,
    getGhostScoreTop,
    getSharedDevices,
    getSharedRefundAccounts,
    getClawbackByFundType,
    getDisplacedBySection,
} from '../../../modules/utils/ghostStudentsEsqlQueries.js';
import {
    GHOST_CARD_CLASS,
    formatUsd,
    getGhostDashboards,
    kibanaDashboardHref,
    kibanaCasesHref,
    kibanaAgentHref,
} from './ghostStudentsUi.js';
import { ClawbackByFundChart, DisplacedSectionsChart } from './GhostStudentsCharts.jsx';

function riskBadge(tier) {
    const colors = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-amber-100 text-amber-800',
        low: 'bg-gray-100 text-gray-700',
    };
    const key = String(tier || '').toLowerCase();
    return (
        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${colors[key] || colors.low}`}>
            {tier || 'unknown'}
        </span>
    );
}

export default function GhostStudentsPanel() {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#0B3D91';
    const seeded = template?.elastic?.seededEntities || {};

    const [stats, setStats] = useState(null);
    const [ghostTop, setGhostTop] = useState([]);
    const [devices, setDevices] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [clawbackByFund, setClawbackByFund] = useState([]);
    const [displacedSections, setDisplacedSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const accentColor = template?.colors?.secondary || '#D4A017';

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        Promise.allSettled([
            getGhostOverviewStats(),
            getGhostScoreTop(5),
            getSharedDevices(4),
            getSharedRefundAccounts(8),
            getClawbackByFundType(),
            getDisplacedBySection(3),
        ])
            .then((results) => {
                if (cancelled) return;
                const [
                    statsResult,
                    topResult,
                    devicesResult,
                    refundsResult,
                    fundResult,
                    sectionsResult,
                ] = results;
                if (statsResult.status === 'fulfilled') setStats(statsResult.value);
                if (topResult.status === 'fulfilled') setGhostTop(topResult.value);
                if (devicesResult.status === 'fulfilled') setDevices(devicesResult.value);
                if (refundsResult.status === 'fulfilled') setRefunds(refundsResult.value);
                if (fundResult.status === 'fulfilled') setClawbackByFund(fundResult.value);
                if (sectionsResult.status === 'fulfilled') setDisplacedSections(sectionsResult.value);
                const failed = results.find((r) => r.status === 'rejected');
                if (failed) setError(failed.reason?.message || 'Failed to load ghost student data');
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const dashboards = getGhostDashboards(template).integrity || [];
    const displacedValue = stats?.ghostSeats != null && stats?.waitlistedReal != null
        ? `${stats.ghostSeats.toLocaleString()} / ${stats.waitlistedReal.toLocaleString()}`
        : null;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Released aid at risk', value: stats?.aidAtRisk != null ? formatUsd(stats.aidAtRisk) : null },
                    { label: 'High-risk students', value: stats?.highRiskStudents },
                    { label: 'Ghost seats / waitlisted real', value: displacedValue },
                    { label: 'Next Wave help desk tickets', value: stats?.nextWaveTickets },
                ].map((kpi) => (
                    <div key={kpi.label} className={`${GHOST_CARD_CLASS} p-5`}>
                        <p className="text-sm text-gray-600">{kpi.label}</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: primaryColor }}>
                            {loading ? '…' : kpi.value != null
                                ? (typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value)
                                : '—'}
                        </p>
                    </div>
                ))}
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}. Ensure rrp_* indices are loaded on gawdzilla and OK_KIBANA_API_KEY is set.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={GHOST_CARD_CLASS}>
                    <div className="px-4 py-2.5 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900">Aid at risk by fund</h3>
                    </div>
                    <ClawbackByFundChart
                        rows={clawbackByFund}
                        primaryColor={primaryColor}
                        accentColor={accentColor}
                        loading={loading}
                    />
                </div>
                <div className={GHOST_CARD_CLASS}>
                    <div className="px-4 py-2.5 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900">Ghost seats vs real waitlist</h3>
                    </div>
                    <DisplacedSectionsChart
                        rows={displacedSections}
                        primaryColor={primaryColor}
                        accentColor={accentColor}
                        loading={loading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={GHOST_CARD_CLASS}>
                    <div className="px-4 py-2.5 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900">Top ghost scores</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 text-left text-gray-500">
                                <tr>
                                    <th className="px-3 py-1.5 font-semibold">Student ID</th>
                                    <th className="px-3 py-1.5 font-semibold">Score</th>
                                    <th className="px-3 py-1.5 font-semibold">Tier</th>
                                    <th className="px-3 py-1.5 font-semibold">Review</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ghostTop.map((row) => (
                                    <tr key={row['student.id']} className="border-t border-gray-100">
                                        <td className="px-3 py-1.5 font-semibold" style={{ color: row['student.id'] === seeded.topGhostStudent ? primaryColor : undefined }}>
                                            {row['student.id']}
                                            {row['student.id'] === seeded.topGhostStudent && (
                                                <span className="ml-1.5 text-[10px] font-normal text-amber-700">anchor</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-1.5 tabular-nums">{row['student.ghost_score'] ?? '—'}</td>
                                        <td className="px-3 py-1.5">{riskBadge(row['student.risk_tier'])}</td>
                                        <td className="px-3 py-1.5 text-gray-600">{row['student.review_status'] || '—'}</td>
                                    </tr>
                                ))}
                                {!loading && ghostTop.length === 0 && (
                                    <tr><td colSpan={4} className="px-3 py-3 text-center text-gray-500">No high-risk flags found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={GHOST_CARD_CLASS}>
                    <div className="px-4 py-2.5 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900">Shared device fingerprints</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 text-left text-gray-500">
                                <tr>
                                    <th className="px-3 py-1.5 font-semibold">Device fingerprint</th>
                                    <th className="px-3 py-1.5 font-semibold text-right">Applicants</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((row) => (
                                    <tr key={row['device.fingerprint']} className="border-t border-gray-100">
                                        <td className="px-3 py-1.5 font-mono text-[11px] truncate max-w-[14rem]" style={{ color: row['device.fingerprint'] === seeded.sharedDeviceSample ? primaryColor : undefined }}>
                                            {row['device.fingerprint']}
                                        </td>
                                        <td className="px-3 py-1.5 text-right tabular-nums font-semibold">{row.applicants}</td>
                                    </tr>
                                ))}
                                {!loading && devices.length === 0 && (
                                    <tr><td colSpan={2} className="px-3 py-3 text-center text-gray-500">No shared devices found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className={GHOST_CARD_CLASS}>
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Shared refund destinations</h3>
                    <p className="text-sm text-gray-600">Refund account hashes used by multiple students (Slow Burn / prepaid cards)</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-600">
                            <tr>
                                <th className="px-4 py-3">Account hash</th>
                                <th className="px-4 py-3">Students</th>
                                <th className="px-4 py-3">Terms</th>
                                <th className="px-4 py-3">Refunded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map((row) => (
                                <tr key={row['refund.account_hash']} className="border-t border-gray-100">
                                    <td className="px-4 py-3 font-mono text-xs">{row['refund.account_hash']}</td>
                                    <td className="px-4 py-3">{row.students}</td>
                                    <td className="px-4 py-3">{row.terms}</td>
                                    <td className="px-4 py-3">{formatUsd(row.refunded)}</td>
                                </tr>
                            ))}
                            {!loading && refunds.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No shared refund accounts found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={`${GHOST_CARD_CLASS} p-6`}>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Kibana workbenches</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Open dashboards in space ghost_students, cases, or Agent Builder for deeper investigation.
                </p>
                <div className="flex flex-wrap gap-3">
                    {dashboards.map((dash) => (
                        <a
                            key={dash.id}
                            href={kibanaDashboardHref(template, dash.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-90"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {dash.title}
                        </a>
                    ))}
                    <a
                        href={kibanaCasesHref(template)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Open Cases
                    </a>
                    <a
                        href={kibanaAgentHref(template)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Agent Builder
                    </a>
                </div>
            </div>
        </div>
    );
}
