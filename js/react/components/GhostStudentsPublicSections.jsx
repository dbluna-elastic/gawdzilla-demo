/**
 * GhostStudentsPublicSections — public KPI snapshot (service cards live in CivicServiceRow).
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
    const headingFont = template?.typography?.headingFontFamily || template?.typography?.fontFamily;
    const reports = template?.content?.reportsSection || {};
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

    void onStaffLoginClick;

    const dashboards = getGhostDashboards(template);
    const reportDashboards = (dashboards.integrity || []).slice(0, 2);
    const displacedLabel = kpis.ghostSeats != null && kpis.waitlistedReal != null
        ? `${kpis.ghostSeats.toLocaleString()} / ${kpis.waitlistedReal.toLocaleString()}`
        : loading ? '…' : '—';

    return (
        <section id="reports" className="border-b border-[#dfe1e2] bg-white py-14 md:py-16">
            <div className="mx-auto max-w-[64rem] px-4 md:px-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#565c65]">Data & reports</p>
                <h2 className="mb-3 text-3xl font-bold text-[#1b1b1b] md:text-4xl" style={{ fontFamily: headingFont, color: primaryColor }}>
                    {reports.title || 'Aid Integrity Snapshot'}
                </h2>
                {reports.subtitle && (
                    <p className="mb-10 max-w-2xl text-[#565c65]">{reports.subtitle}</p>
                )}
                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                        <div
                            key={kpi.label}
                            className="rounded border border-[#dfe1e2] border-t-4 bg-[#f0f0f0] p-6"
                            style={{ borderTopColor: primaryColor }}
                        >
                            <p className="mb-2 text-sm font-semibold text-[#565c65]">{kpi.label}</p>
                            <p className="text-3xl font-bold text-[#1b1b1b]" style={{ fontFamily: headingFont, color: secondaryColor }}>{kpi.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-10 rounded border border-[#dfe1e2] bg-[#f0f0f0] p-6">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em]" style={{ color: primaryColor }}>Seeded demo anchors</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm text-[#1b1b1b] sm:grid-cols-2 lg:grid-cols-3">
                        <p><span className="font-bold">Top ghost ID:</span> {seeded.topGhostStudent || '—'}</p>
                        <p><span className="font-bold">Shared device:</span> <span className="font-mono text-xs">{seeded.sharedDeviceSample || '—'}</span></p>
                        <p><span className="font-bold">Rings:</span> {seeded.ringTumbleweed}, {seeded.ringHarbor}, {seeded.ringSlowBurn}</p>
                    </div>
                </div>

                {reportDashboards.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {reportDashboards.map((dash) => (
                            <a
                                key={dash.id}
                                href={kibanaDashboardHref(template, dash.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {dash.title}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
