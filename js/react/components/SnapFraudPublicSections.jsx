/**
 * SnapFraudPublicSections — public KPI snapshot (service cards live in CivicServiceRow).
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../context/TemplateContext.jsx';
import { getSnapOverviewStats } from '../../modules/utils/snapFraudEsqlQueries.js';
import { getSnapDashboards, kibanaDashboardHref } from './snapfraud/snapFraudUi.js';

export default function SnapFraudPublicSections({ onStaffLoginClick }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#1B5E20';
    const secondaryColor = template?.colors?.secondary || '#2E7D32';
    const headingFont = template?.typography?.headingFontFamily || template?.typography?.fontFamily;
    const reports = template?.content?.reportsSection || {};
    const seeded = template?.elastic?.seededEntities || {};

    const [kpis, setKpis] = useState({
        transactions7d: null,
        flaggedStores: null,
        crossStateIds: null,
        deceasedTx: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getSnapOverviewStats()
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

    const dashboards = getSnapDashboards(template);
    const reportDashboards = (dashboards.fraud || []).slice(0, 1);

    return (
        <section id="reports" className="border-b border-[#dfe1e2] bg-white py-14 md:py-16">
            <div className="mx-auto max-w-[64rem] px-4 md:px-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#565c65]">Fraud intelligence</p>
                <h2 className="mb-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: headingFont, color: template?.colors?.charcoal || primaryColor }}>
                    {reports.title || 'Fraud Intelligence Snapshot'}
                </h2>
                {reports.subtitle && (
                    <p className="mb-10 max-w-2xl text-[#565c65]">{reports.subtitle}</p>
                )}
                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: reports.kpiLabels?.transactions7d || 'Transactions (7 days)',
                            value: kpis.transactions7d != null ? kpis.transactions7d.toLocaleString() : loading ? '…' : '—',
                        },
                        {
                            label: reports.kpiLabels?.flaggedStores || 'Flagged retailers',
                            value: kpis.flaggedStores != null ? kpis.flaggedStores.toLocaleString() : loading ? '…' : '—',
                        },
                        {
                            label: reports.kpiLabels?.crossStateIds || 'Cross-state identities',
                            value: kpis.crossStateIds != null ? kpis.crossStateIds.toLocaleString() : loading ? '…' : '—',
                        },
                        {
                            label: reports.kpiLabels?.deceasedTx || 'Deceased beneficiary txs',
                            value: kpis.deceasedTx != null ? kpis.deceasedTx.toLocaleString() : loading ? '…' : '—',
                        },
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
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em]" style={{ color: primaryColor }}>Seeded demo entities</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm text-[#1b1b1b] sm:grid-cols-2 lg:grid-cols-4">
                        <p><span className="font-bold">Same-cent:</span> Store {seeded.sameCentStore}</p>
                        <p><span className="font-bold">Manual entry:</span> Store {seeded.manualEntryStore}</p>
                        <p><span className="font-bold">Volume spike:</span> Store {seeded.volumeSpikeStore}</p>
                        <p><span className="font-bold">Large baskets:</span> Store {seeded.largeBasketStore}</p>
                        <p><span className="font-bold">Drains:</span> Store {seeded.drainStore}</p>
                        <p><span className="font-bold">Rapid baskets:</span> {seeded.rapidBasketHousehold}</p>
                        <p><span className="font-bold">Cross-state:</span> {seeded.crossStateSsn?.slice(0, 24)}…</p>
                        <p><span className="font-bold">Deceased:</span> {seeded.deceasedHousehold}</p>
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
