/**
 * TsuLibraryPublicSections — public KPI snapshot + story moments for receipt capture demo.
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../context/TemplateContext.jsx';
import { getTsuOverviewStats } from '../../modules/utils/tsuLibraryEsqlQueries.js';
import { formatUsd, getTsuDashboards, kibanaDashboardHref } from './tsulibrary/tsuLibraryUi.js';

export default function TsuLibraryPublicSections({ onStaffLoginClick }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || 'var(--primary-color)';
    const secondaryColor = template?.colors?.secondary || 'var(--secondary-color)';
    const headingFont = template?.typography?.headingFontFamily || template?.typography?.fontFamily;
    const reports = template?.content?.reportsSection || {};
    const stories = template?.content?.storyMoments || [];
    const seeded = template?.elastic?.seededEntities || {};

    const [kpis, setKpis] = useState({
        fy2026Spend: null,
        pendingReview: null,
        duplicates: null,
        taxCharged: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getTsuOverviewStats()
            .then((stats) => {
                if (!cancelled) {
                    setKpis(stats);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const dashboards = getTsuDashboards(template);
    const reportDashboards = (dashboards.spend || dashboards.all || []).slice(0, 1);
    const formatCount = (value) => (value != null ? value.toLocaleString() : loading ? '…' : '—');
    const formatSpend = (value) => (value != null ? formatUsd(value) : loading ? '…' : '—');

    return (
        <>
            <section id="problem" className="border-b border-[#e8e0d4] bg-[#faf7f2] py-14 md:py-16">
                <div className="mx-auto max-w-[64rem] px-4 md:px-8">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6b5e4f]">The problem</p>
                    <h2
                        className="mb-4 text-3xl font-bold md:text-4xl"
                        style={{ fontFamily: headingFont, color: primaryColor }}
                    >
                        Scattered receipts slow audits and hide exceptions
                    </h2>
                    <p className="max-w-2xl text-[#4a4035] leading-relaxed">
                        Invoices live in inboxes, shared drives, paper folders, and phone cameras. Keyword search fails when
                        the wording on the receipt does not match how people ask. High-value items, duplicates, and tax
                        mistakes are easy to miss without a review workflow.
                    </p>
                </div>
            </section>

            <section id="reports" className="border-b border-[#e8e0d4] bg-white py-14 md:py-16">
                <div className="mx-auto max-w-[64rem] px-4 md:px-8">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6b5e4f]">Spend</p>
                    <h2
                        className="mb-3 text-3xl font-bold md:text-4xl"
                        style={{ fontFamily: headingFont, color: template?.colors?.charcoal || primaryColor }}
                    >
                        {reports.title || 'Spend snapshot'}
                    </h2>
                    {reports.subtitle && (
                        <p className="mb-10 max-w-2xl text-[#6b5e4f]">{reports.subtitle}</p>
                    )}
                    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: reports.kpiLabels?.fy2026Spend || 'FY2026 spend', value: formatSpend(kpis.fy2026Spend) },
                            { label: reports.kpiLabels?.pendingReview || 'Pending review', value: formatCount(kpis.pendingReview) },
                            { label: reports.kpiLabels?.duplicates || 'Possible duplicates', value: formatCount(kpis.duplicates) },
                            { label: reports.kpiLabels?.taxCharged || 'Tax charged', value: formatCount(kpis.taxCharged) },
                        ].map((kpi) => (
                            <div
                                key={kpi.label}
                                className="rounded border border-[#e8e0d4] border-t-4 bg-[#faf7f2] p-6"
                                style={{ borderTopColor: primaryColor }}
                            >
                                <p className="mb-2 text-sm font-semibold text-[#6b5e4f]">{kpi.label}</p>
                                <p className="text-3xl font-bold" style={{ fontFamily: headingFont, color: secondaryColor }}>
                                    {kpi.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {stories.length > 0 && (
                        <div className="mb-10 rounded border border-[#e8e0d4] bg-[#faf7f2] p-6">
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em]" style={{ color: primaryColor }}>
                                {reports.seededHeading || 'Story receipts (synthetic)'}
                            </h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {stories.map((story) => (
                                    <div key={story.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4 text-sm">
                                        <p className="font-bold" style={{ color: primaryColor }}>{story.label}</p>
                                        <p className="mt-1 font-mono text-xs text-[#6b5e4f]">{story.invoice}</p>
                                        <p className="mt-2 text-[#4a4035]">{story.description}</p>
                                    </div>
                                ))}
                            </div>
                            {reports.seededNote && (
                                <p className="mt-3 text-sm text-[#6b5e4f]">{reports.seededNote}</p>
                            )}
                            {seeded.semanticQuery && (
                                <p className="mt-2 text-sm text-[#4a4035]">
                                    <span className="font-bold">Semantic demo phrase:</span>{' '}
                                    <span className="italic">“{seeded.semanticQuery}”</span>
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onStaffLoginClick}
                            className="rounded-full px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Enter demo / Search receipts
                        </button>
                        {reportDashboards.map((dash) => (
                            <a
                                key={dash.id}
                                href={kibanaDashboardHref(template, dash.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border px-5 py-2.5 text-sm font-bold hover:bg-[#faf7f2]"
                                style={{ borderColor: primaryColor, color: primaryColor }}
                            >
                                {dash.title}
                            </a>
                        ))}
                    </div>

                    <p className="mt-8 text-xs text-[#6b5e4f]">
                        Demo data only. Not real Texas State vendor or staff records. Fiscal years run September 1–August 31.
                    </p>
                </div>
            </section>
        </>
    );
}
