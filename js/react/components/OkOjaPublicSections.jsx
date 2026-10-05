/**
 * OkOjaPublicSections — public KPI snapshot (service cards live in CivicServiceRow).
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../context/TemplateContext.jsx';
import { getOjaOverviewStats } from '../../modules/utils/ojaEsqlQueries.js';
import { getOjaDashboards, kibanaDashboardHref } from './oja/ojaUi.js';

export default function OkOjaPublicSections({ onStaffLoginClick }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#1B3A5C';
    const secondaryColor = template?.colors?.secondary || '#2E75B6';
    const headingFont = template?.typography?.headingFontFamily || template?.typography?.fontFamily;
    const reports = template?.content?.reportsSection || {};

    const [kpis, setKpis] = useState({ activeYouth: null, avgRisk: null, recidivism12: null, pending: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getOjaOverviewStats()
            .then((stats) => {
                if (!cancelled) {
                    setKpis({
                        activeYouth: stats.activeYouth,
                        avgRisk: stats.avgRisk,
                        recidivism12: stats.recidivism12mo,
                        pending: stats.pendingYouth,
                    });
                    setLoading(false);
                }
            })
            .catch(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    void onStaffLoginClick;

    const dashboards = getOjaDashboards(template);
    const reportDashboards = [
        ...(dashboards.overview || []).slice(0, 1),
        ...(dashboards.assessments || []).slice(0, 1),
    ];

    return (
        <section id="reports" className="border-b border-[#dfe1e2] bg-white py-14 md:py-16">
            <div className="mx-auto max-w-[64rem] px-4 md:px-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#565c65]">Data & performance</p>
                <h2 className="mb-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: headingFont, color: template?.colors?.charcoal || primaryColor }}>
                    {reports.title || 'Data & Performance'}
                </h2>
                {reports.subtitle && (
                    <p className="mb-10 max-w-2xl text-[#565c65]">{reports.subtitle}</p>
                )}
                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: reports.kpiLabels?.activeYouth || 'Active cases', value: kpis.activeYouth != null ? kpis.activeYouth.toLocaleString() : loading ? '…' : '—' },
                        { label: 'Pending intakes', value: kpis.pending != null ? kpis.pending.toLocaleString() : loading ? '…' : '—' },
                        { label: reports.kpiLabels?.avgRisk || 'Avg risk score', value: kpis.avgRisk != null ? kpis.avgRisk.toFixed(1) : loading ? '…' : '—' },
                        { label: reports.kpiLabels?.recidivism12 || '12-mo recidivism', value: kpis.recidivism12 != null ? `${Math.round(kpis.recidivism12 * 100)}%` : loading ? '…' : '—' },
                    ].map((kpi) => (
                        <div
                            key={kpi.label}
                            className="rounded border border-[#dfe1e2] border-t-4 bg-[#f0f0f0] p-6"
                            style={{ borderTopColor: primaryColor }}
                        >
                            <p className="mb-2 text-sm font-semibold text-[#565c65]">{kpi.label}</p>
                            <p className="text-3xl font-bold" style={{ fontFamily: headingFont, color: secondaryColor }}>{kpi.value}</p>
                        </div>
                    ))}
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
