/**
 * WyomingPublicSections — public KPI snapshot (service cards live in CivicServiceRow).
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../context/TemplateContext.jsx';
import { getWyoOverviewStats } from '../../modules/utils/wyomingClassifyEsqlQueries.js';
import { getWyoDashboards, kibanaDashboardHref } from './wyoming/wyomingUi.js';

export default function WyomingPublicSections({ onStaffLoginClick }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || 'var(--primary-color)';
    const secondaryColor = template?.colors?.secondary || 'var(--secondary-color)';
    const headingFont = template?.typography?.headingFontFamily || template?.typography?.fontFamily;
    const reports = template?.content?.reportsSection || {};
    const seeded = template?.elastic?.seededEntities || {};

    const [kpis, setKpis] = useState({
        totalDocs: null,
        restricted: null,
        pendingReview: null,
        spillageAlerts: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getWyoOverviewStats()
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

    const dashboards = getWyoDashboards(template);
    const reportDashboards = (dashboards.overview || dashboards.all || []).slice(0, 1);
    const formatKpi = (value) => (value != null ? value.toLocaleString() : loading ? '…' : '—');

    return (
        <section id="reports" className="border-b border-[#dfe1e2] bg-white py-14 md:py-16">
            <div className="mx-auto max-w-[64rem] px-4 md:px-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#565c65]">Classification</p>
                <h2 className="mb-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: headingFont, color: template?.colors?.charcoal || primaryColor }}>
                    {reports.title || 'Classification snapshot'}
                </h2>
                {reports.subtitle && (
                    <p className="mb-10 max-w-2xl text-[#565c65]">{reports.subtitle}</p>
                )}
                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: reports.kpiLabels?.totalDocs || 'Total documents', value: formatKpi(kpis.totalDocs) },
                        { label: reports.kpiLabels?.restricted || 'Restricted', value: formatKpi(kpis.restricted) },
                        { label: reports.kpiLabels?.pendingReview || 'Pending review', value: formatKpi(kpis.pendingReview) },
                        { label: reports.kpiLabels?.spillageAlerts || 'Spillage alerts', value: formatKpi(kpis.spillageAlerts) },
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

                <div className="mb-10 rounded border border-[#dfe1e2] bg-[#f0f0f0] p-6">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em]" style={{ color: primaryColor }}>
                        {reports.seededHeading || 'Demo corpus (synthetic)'}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 text-sm text-[#1b1b1b] sm:grid-cols-2 lg:grid-cols-3">
                        <p><span className="font-bold">Documents:</span> {seeded.corpusSize || '—'}</p>
                        <p><span className="font-bold">Hold-out:</span> {seeded.holdOut || '—'}</p>
                        <p><span className="font-bold">Planted spillage:</span> {seeded.plantedSpillageFile || '—'}</p>
                    </div>
                    {reports.seededNote && (
                        <p className="mt-3 text-sm text-[#565c65]">{reports.seededNote}</p>
                    )}
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
