/**
 * OkMentalHealthPublicSections — public KPI snapshot (service cards live in CivicServiceRow).
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../context/TemplateContext.jsx';
import {
    getClinicalStatewideRelapseRate,
    getCrisisCallCenterStats,
    getFraudHighRiskClaimCount,
    getOkHealthGrantCount,
} from '../../modules/utils/esqlQueries.js';
import { getGroupedDashboards, kibanaDashboardHref } from './mentalhealth/mentalhealthUi.js';

export default function OkMentalHealthPublicSections({ onStaffLoginClick, onOpenGrantsSearch }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#003366';
    const secondaryColor = template?.colors?.secondary || '#2563eb';
    const headingFont = template?.typography?.headingFontFamily || template?.typography?.fontFamily;
    const reports = template?.content?.reportsSection || {};
    const agentId = template?.elastic?.fraudAgentId || 'ok-fraud';

    const [kpis, setKpis] = useState({ relapse: null, answerTime: null, highRisk: null, grants: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            getClinicalStatewideRelapseRate(agentId),
            getCrisisCallCenterStats(agentId),
            getFraudHighRiskClaimCount(agentId),
            getOkHealthGrantCount(template),
        ])
            .then(([relapse, crisisStats, highRisk, grants]) => {
                if (!cancelled) {
                    setKpis({
                        relapse,
                        answerTime: crisisStats?.avgAnswerSeconds != null ? Math.round(crisisStats.avgAnswerSeconds) : null,
                        highRisk,
                        grants,
                    });
                    setLoading(false);
                }
            })
            .catch(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [agentId, template]);

    void onStaffLoginClick;

    const grouped = getGroupedDashboards(template);
    const reportDashboards = [
        ...(grouped.clinical || []).slice(0, 1),
        ...(grouped.crisis || []).slice(0, 1),
        ...(grouped.fraud || []).slice(0, 1),
    ];

    return (
        <section id="reports" className="border-b border-[#dfe1e2] bg-white py-14 md:py-16">
            <div className="mx-auto max-w-[64rem] px-4 md:px-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#565c65]">Data & reports</p>
                <h2 className="mb-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: headingFont, color: template?.colors?.charcoal || primaryColor }}>
                    {reports.title || 'Data & Reports'}
                </h2>
                {reports.subtitle && (
                    <p className="mb-10 max-w-2xl text-[#565c65]">{reports.subtitle}</p>
                )}
                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: reports.kpiLabels?.relapseRate || 'Relapse rate', value: kpis.relapse != null ? `${kpis.relapse}%` : loading ? '…' : '—' },
                        { label: reports.kpiLabels?.avgAnswerTime || 'Avg answer time', value: kpis.answerTime != null ? `${kpis.answerTime}s` : loading ? '…' : '—' },
                        { label: reports.kpiLabels?.highRiskClaims || 'High-risk claims', value: kpis.highRisk != null ? kpis.highRisk.toLocaleString() : loading ? '…' : '—' },
                        { label: reports.kpiLabels?.activeGrants || 'Active grants', value: kpis.grants != null ? kpis.grants.toLocaleString() : loading ? '…' : '—' },
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
                <div className="flex flex-wrap gap-3">
                    {typeof onOpenGrantsSearch === 'function' && (
                        <button
                            type="button"
                            onClick={onOpenGrantsSearch}
                            className="rounded px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Search grants
                        </button>
                    )}
                    {reportDashboards.map((dash) => (
                        <a
                            key={dash.id}
                            href={kibanaDashboardHref(template, dash.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded border-2 px-5 py-2.5 text-sm font-bold hover:bg-[#f0f0f0]"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                            {dash.title}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
