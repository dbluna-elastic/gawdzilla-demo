/**
 * GhostStudentsPublicSections — Fraud ring tiles and public KPI snapshots.
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../context/TemplateContext.jsx';
import { getGhostOverviewStats } from '../../modules/utils/ghostStudentsEsqlQueries.js';
import {
    formatUsd,
    getGhostDashboards,
    kibanaDashboardHref,
} from './ghoststudents/ghostStudentsUi.js';

export default function GhostStudentsPublicSections({ onStaffLoginClick }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#0B3D91';
    const secondaryColor = template?.colors?.secondary || '#D4A017';
    const programs = template?.content?.programsLanding || {};
    const reports = template?.content?.reportsSection || {};
    const tiles = Array.isArray(programs.tiles) ? programs.tiles : [];
    const seeded = template?.elastic?.seededEntities || {};

    const [kpis, setKpis] = useState({
        aidAtRisk: null,
        highRiskStudents: null,
        ghostSeats: null,
        waitlistedReal: null,
        nextWaveTickets: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getGhostOverviewStats()
            .then((stats) => {
                if (!cancelled) {
                    setKpis(stats);
                    setLoading(false);
                }
            })
            .catch(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const handleTileClick = (tile, e) => {
        if (tile.href === '#staff-login' && typeof onStaffLoginClick === 'function') {
            e.preventDefault();
            onStaffLoginClick();
        }
    };

    const dashboards = getGhostDashboards(template);
    const reportDashboards = (dashboards.integrity || []).slice(0, 2);
    const displacedLabel = kpis.ghostSeats != null && kpis.waitlistedReal != null
        ? `${kpis.ghostSeats.toLocaleString()} / ${kpis.waitlistedReal.toLocaleString()}`
        : loading ? '…' : '—';

    return (
        <>
            <section
                id="programs"
                className="border-b border-blue-200/60 ghoststudents-shell py-10 md:py-12"
                aria-label="Fraud rings"
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tighter" style={{ fontFamily: template?.typography?.fontFamily, color: primaryColor }}>
                        {programs.sectionTitle || 'Seeded Fraud Rings'}
                    </h2>
                    {programs.sectionSubtitle && (
                        <p className="text-slate-600 mb-8 max-w-2xl">{programs.sectionSubtitle}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tiles.map((tile, idx) => (
                            <a
                                key={idx}
                                href={tile.href || '#'}
                                onClick={(e) => handleTileClick(tile, e)}
                                className="group flex flex-col rounded-xl border border-blue-200/70 bg-white/90 backdrop-blur-md p-5 shadow-[0_8px_24px_rgba(11,61,145,0.12)] hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-base font-bold group-hover:underline" style={{ color: primaryColor }}>
                                    {tile.label}
                                </h3>
                                {tile.description && (
                                    <p className="mt-2 flex-1 text-sm text-slate-600">{tile.description}</p>
                                )}
                                <span className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                                    {programs.tileCta || 'Learn more'} →
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section id="reports" className="ghoststudents-shell py-12 border-b border-blue-200/60">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 tracking-tighter" style={{ color: primaryColor }}>
                        {reports.title || 'Aid Integrity Snapshot'}
                    </h2>
                    {reports.subtitle && (
                        <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">{reports.subtitle}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[
                            {
                                label: reports.kpiLabels?.aidAtRisk || 'Released aid at risk',
                                value: kpis.aidAtRisk != null ? formatUsd(kpis.aidAtRisk) : loading ? '…' : '—',
                            },
                            {
                                label: reports.kpiLabels?.highRiskStudents || 'High-risk students',
                                value: kpis.highRiskStudents != null ? kpis.highRiskStudents.toLocaleString() : loading ? '…' : '—',
                            },
                            {
                                label: reports.kpiLabels?.displacedSeats || 'Ghost seats vs waitlist',
                                value: displacedLabel,
                            },
                            {
                                label: reports.kpiLabels?.nextWaveTickets || 'Next Wave help desk tickets',
                                value: kpis.nextWaveTickets != null ? kpis.nextWaveTickets.toLocaleString() : loading ? '…' : '—',
                            },
                        ].map((kpi) => (
                            <div key={kpi.label} className="rounded-2xl border border-blue-200/80 bg-white/90 backdrop-blur-md p-6 text-center shadow-[0_8px_24px_rgba(11,61,145,0.12)]">
                                <p className="text-sm font-medium text-slate-600 mb-2">{kpi.label}</p>
                                <p className="text-3xl font-bold" style={{ color: secondaryColor }}>{kpi.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mb-10 rounded-2xl border border-blue-200/80 bg-white/85 backdrop-blur-md p-6">
                        <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: primaryColor }}>Seeded demo anchors</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-slate-800">
                            <p><span className="font-semibold">Top ghost ID:</span> {seeded.topGhostStudent || '—'}</p>
                            <p><span className="font-semibold">Shared device:</span> <span className="font-mono text-xs">{seeded.sharedDeviceSample || '—'}</span></p>
                            <p><span className="font-semibold">Rings:</span> {seeded.ringTumbleweed}, {seeded.ringHarbor}, {seeded.ringSlowBurn}</p>
                        </div>
                    </div>

                    {reportDashboards.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-3">
                            {reportDashboards.map((dash) => (
                                <a
                                    key={dash.id}
                                    href={kibanaDashboardHref(template, dash.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {dash.title}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
