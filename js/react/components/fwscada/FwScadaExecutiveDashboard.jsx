/**
 * FwScadaExecutiveDashboard — dashboard-first executive view for FW City Utilities SCADA.
 * Modeled on Kibana fw-facilities-incident in space fw-scada-water.
 */

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import ChatWidget from '../ChatWidget.jsx';
import {
    getFwActiveAlerts,
    getFwProcessSeries,
    getFwSiteOverviewStats,
    getFwSitesByStatus,
    getFwStatusByType,
} from '../../../modules/utils/fwScadaEsqlQueries.js';
import {
    FW_CARD_CLASS,
    formatSiteType,
    getFwDashboards,
    kibanaAgentHref,
    kibanaDashboardHref,
    kibanaSpaceBase,
    statusColor,
} from './fwScadaUi.js';
import FwScadaSiteMap from './FwScadaSiteMap.jsx';

function Sparkline({ points, stroke = '#14B8A6' }) {
    if (!points?.length) {
        return (
            <div className="h-16 flex items-center text-sm text-white/40">No recent samples</div>
        );
    }
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const w = 280;
    const h = 64;
    const pad = 4;
    const coords = values.map((v, i) => {
        const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / span) * (h - pad * 2);
        return `${x},${y}`;
    });
    const latest = values[values.length - 1];

    return (
        <div className="flex items-end justify-between gap-4">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" aria-hidden="true">
                <polyline
                    fill="none"
                    stroke={stroke}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={coords.join(' ')}
                />
            </svg>
            <div className="shrink-0 text-right">
                <p className="text-2xl font-black tracking-tighter text-white">
                    {Number.isFinite(latest) ? latest.toFixed(2) : '—'}
                </p>
                <p className="text-xs text-white/45">
                    {min.toFixed(2)} – {max.toFixed(2)}
                </p>
            </div>
        </div>
    );
}

function StatusPill({ systemStatus }) {
    const label =
        systemStatus === 'critical' ? 'Critical' : systemStatus === 'degraded' ? 'Degraded' : 'Normal';
    const color = statusColor(systemStatus === 'critical' ? 'red' : systemStatus === 'degraded' ? 'amber' : 'green');
    return (
        <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
        >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            System {label}
        </span>
    );
}

export default function FwScadaExecutiveDashboard() {
    const template = useContext(TemplateContext);
    const primary = template?.colors?.primary || '#0F766E';
    const accent = template?.colors?.accent || '#14B8A6';
    const agentId = template?.elastic?.agentId || 'elastic-ai-agent';
    const processDefs = useMemo(
        () => template?.elastic?.processSeries || [],
        [template?.elastic?.processSeries]
    );
    const { primary: primaryDashboards, secondary: secondaryDashboards } = getFwDashboards(template);

    const [stats, setStats] = useState(null);
    const [sites, setSites] = useState([]);
    const [byType, setByType] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [series, setSeries] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshedAt, setRefreshedAt] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsResult, sitesResult, typeResult, alertsResult, ...seriesResults] = await Promise.allSettled([
                getFwSiteOverviewStats(),
                getFwSitesByStatus(102),
                getFwStatusByType(),
                getFwActiveAlerts(20),
                ...processDefs.map((def) =>
                    getFwProcessSeries({ siteId: def.siteId, tagName: def.tagName, limit: 36 })
                ),
            ]);

            if (statsResult.status === 'fulfilled') setStats(statsResult.value);
            if (sitesResult.status === 'fulfilled') setSites(sitesResult.value);
            if (typeResult.status === 'fulfilled') setByType(typeResult.value);
            if (alertsResult.status === 'fulfilled') setAlerts(alertsResult.value);

            const nextSeries = {};
            processDefs.forEach((def, idx) => {
                const result = seriesResults[idx];
                nextSeries[def.id] = result?.status === 'fulfilled' ? result.value : [];
            });
            setSeries(nextSeries);

            const failed = [statsResult, sitesResult, typeResult, alertsResult, ...seriesResults]
                .find((r) => r.status === 'rejected');
            if (failed) {
                setError(failed.reason?.message || 'Failed to load FW SCADA data');
            }
            setRefreshedAt(new Date());
        } finally {
            setLoading(false);
        }
    }, [processDefs]);

    useEffect(() => {
        load();
        const timer = setInterval(load, 60000);
        return () => clearInterval(timer);
    }, [load]);

    const severityCounts = useMemo(() => ({
        critical: alerts.filter((a) => a.status === 'red').length,
        warning: alerts.filter((a) => a.status === 'amber').length,
    }), [alerts]);

    const flaggedSites = useMemo(
        () => sites.filter((s) => s.status === 'red' || s.status === 'amber'),
        [sites]
    );

    const facilitiesHref = primaryDashboards[0]
        ? kibanaDashboardHref(template, primaryDashboards[0].id)
        : kibanaSpaceBase(template);

    return (
        <>
            <div className="min-h-screen bg-[#07141A] text-white">
                <div
                    className="pointer-events-none fixed inset-0 opacity-70"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 50% at 10% -10%, rgba(20,184,166,0.18), transparent 55%),'
                            + 'radial-gradient(ellipse 60% 40% at 90% 0%, rgba(15,118,110,0.2), transparent 50%),'
                            + 'radial-gradient(ellipse 50% 40% at 70% 100%, rgba(217,119,6,0.08), transparent 50%)',
                    }}
                    aria-hidden="true"
                />

                <header className="relative z-10 border-b border-white/[0.08] bg-black/20 backdrop-blur-xl">
                    <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <img
                                src={template?.branding?.logo}
                                alt={template?.branding?.institutionName || 'FW City Utilities'}
                                className="h-10 w-auto"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-black tracking-tighter truncate">
                                    {template?.content?.staffDashboard?.pageTitle || 'FW — Facilities & Incident'}
                                </h1>
                                <p className="text-sm text-white/55 truncate">
                                    {template?.content?.staffDashboard?.subtitle
                                        || 'Live KPIs from SCADA site status and OT process metrics.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <StatusPill systemStatus={stats?.systemStatus || 'normal'} />
                            <span className="text-xs text-white/45">
                                {refreshedAt
                                    ? `Updated ${refreshedAt.toLocaleTimeString()}`
                                    : loading
                                        ? 'Loading…'
                                        : '—'}
                            </span>
                            <button
                                type="button"
                                onClick={load}
                                className="rounded-full px-4 py-2 text-sm font-semibold border border-white/15 hover:bg-white/10 transition-colors"
                            >
                                Refresh
                            </button>
                            <a
                                href={facilitiesHref}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: primary }}
                            >
                                Open in Kibana
                            </a>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 space-y-8">
                    {error && (
                        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {error}. Ensure fw-site-status / metrics-fw_ot.process-* are loaded on gawdzilla and OK_KIBANA_API_KEY is set.
                        </div>
                    )}

                    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        {[
                            { label: 'Total Sites', value: stats?.total, color: accent },
                            { label: 'Normal', value: stats?.green, color: statusColor('green') },
                            { label: 'Sites in Alarm', value: stats?.red, color: statusColor('red') },
                            { label: 'Warning', value: stats?.amber, color: statusColor('amber') },
                            {
                                label: 'Comm Health',
                                value: stats?.commHealthPct != null ? `${stats.commHealthPct}%` : null,
                                color: accent,
                            },
                            {
                                label: 'System Status',
                                value: stats?.systemStatus
                                    ? stats.systemStatus.charAt(0).toUpperCase() + stats.systemStatus.slice(1)
                                    : null,
                                color: statusColor(stats?.systemStatus || 'green'),
                            },
                        ].map((kpi) => (
                            <div key={kpi.label} className={`${FW_CARD_CLASS} p-5`}>
                                <p className="text-xs uppercase tracking-wide text-white/45 font-semibold">{kpi.label}</p>
                                <p className="text-3xl font-black tracking-tighter mt-2" style={{ color: kpi.color }}>
                                    {loading && kpi.value == null ? '…' : kpi.value ?? '—'}
                                </p>
                            </div>
                        ))}
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {processDefs.map((def) => (
                            <div key={def.id} className={`${FW_CARD_CLASS} p-5`}>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <h2 className="text-base font-extrabold tracking-tighter">{def.label}</h2>
                                        <p className="text-xs text-white/45 mt-1">{def.tagName} · {def.unit}</p>
                                    </div>
                                </div>
                                <Sparkline
                                    points={series[def.id]}
                                    stroke={def.id === 'wet-well' ? statusColor('red') : accent}
                                />
                            </div>
                        ))}
                    </section>

                    <section id="alerts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className={`${FW_CARD_CLASS} p-5`}>
                            <h2 className="text-lg font-extrabold tracking-tighter mb-4">Active Alerts by Severity</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Critical (red)', count: severityCounts.critical, color: statusColor('red') },
                                    { label: 'Warning (amber)', count: severityCounts.warning, color: statusColor('amber') },
                                    {
                                        label: 'Obs / Sec alert sum',
                                        count: stats
                                            ? `${stats.observabilityAlerts} / ${stats.securityAlerts}`
                                            : null,
                                        color: accent,
                                    },
                                ].map((row) => (
                                    <div key={row.label} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 border border-white/[0.05]">
                                        <span className="text-sm text-white/70">{row.label}</span>
                                        <span className="text-xl font-black" style={{ color: row.color }}>
                                            {loading && row.count == null ? '…' : row.count ?? '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`${FW_CARD_CLASS} lg:col-span-2 overflow-hidden`}>
                            <div className="p-5 border-b border-white/[0.06]">
                                <h2 className="text-lg font-extrabold tracking-tighter">Active FW Alerts</h2>
                                <p className="text-sm text-white/45 mt-1">Non-green sites with status reasons</p>
                            </div>
                            <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-sm">
                                    <thead className="text-left text-white/45 sticky top-0 bg-[#0F2430]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Site</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold">Reason</th>
                                            <th className="px-4 py-3 font-semibold">Alerts</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alerts.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                                                    No active alerts
                                                </td>
                                            </tr>
                                        )}
                                        {alerts.map((alert) => (
                                            <tr key={`${alert.name}-${alert.status}`} className="border-t border-white/[0.05]">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold">{alert.name}</p>
                                                    <p className="text-xs text-white/40">{formatSiteType(alert.type)}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
                                                        style={{
                                                            color: statusColor(alert.status),
                                                            backgroundColor: `${statusColor(alert.status)}22`,
                                                        }}
                                                    >
                                                        {alert.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-white/75 max-w-md">{alert.reason || '—'}</td>
                                                <td className="px-4 py-3 text-white/60">
                                                    obs {alert.observability} · sec {alert.security}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <section id="facilities" className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                        <div className={`${FW_CARD_CLASS} p-5 xl:col-span-3`}>
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-extrabold tracking-tighter">Facilities map</h2>
                                    <p className="text-sm text-white/45">Site geo from fw-site-status</p>
                                </div>
                                <div className="flex gap-3 text-xs text-white/50">
                                    <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal</span>
                                    <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</span>
                                    <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Alarm</span>
                                </div>
                            </div>
                            <FwScadaSiteMap sites={sites} />
                        </div>

                        <div className={`${FW_CARD_CLASS} p-5 xl:col-span-2 space-y-6`}>
                            <div>
                                <h2 className="text-lg font-extrabold tracking-tighter mb-3">Site Status by Type</h2>
                                <div className="space-y-3">
                                    {byType.map((row) => {
                                        const total = row.total || 1;
                                        return (
                                            <div key={row.type}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="capitalize text-white/75">{formatSiteType(row.type)}</span>
                                                    <span className="text-white/45">{row.total}</span>
                                                </div>
                                                <div className="h-2.5 rounded-full overflow-hidden bg-white/10 flex">
                                                    <div style={{ width: `${(row.green / total) * 100}%`, backgroundColor: statusColor('green') }} />
                                                    <div style={{ width: `${(row.amber / total) * 100}%`, backgroundColor: statusColor('amber') }} />
                                                    <div style={{ width: `${(row.red / total) * 100}%`, backgroundColor: statusColor('red') }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {!byType.length && !loading && (
                                        <p className="text-sm text-white/40">No type breakdown</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-extrabold tracking-tighter mb-3">Site Status Distribution</h2>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Green', value: stats?.green, color: statusColor('green') },
                                        { label: 'Amber', value: stats?.amber, color: statusColor('amber') },
                                        { label: 'Red', value: stats?.red, color: statusColor('red') },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 text-center">
                                            <p className="text-2xl font-black" style={{ color: item.color }}>
                                                {loading && item.value == null ? '…' : item.value ?? '—'}
                                            </p>
                                            <p className="text-xs text-white/45 mt-1">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="sites" className={`${FW_CARD_CLASS} overflow-hidden`}>
                        <div className="p-5 border-b border-white/[0.06] flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-extrabold tracking-tighter">FW SCADA Sites</h2>
                                <p className="text-sm text-white/45 mt-1">
                                    {flaggedSites.length} attention · {sites.length} total shown
                                </p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-white/45 bg-black/20">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Site</th>
                                        <th className="px-4 py-3 font-semibold">Type</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Criticality</th>
                                        <th className="px-4 py-3 font-semibold">Reason</th>
                                        <th className="px-4 py-3 font-semibold">Obs / Sec</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sites.map((site) => (
                                        <tr key={site.id || site.name} className="border-t border-white/[0.05]">
                                            <td className="px-4 py-3 font-semibold">{site.name}</td>
                                            <td className="px-4 py-3 capitalize text-white/65">{formatSiteType(site.type)}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
                                                    style={{
                                                        color: statusColor(site.status),
                                                        backgroundColor: `${statusColor(site.status)}22`,
                                                    }}
                                                >
                                                    {site.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-white/60 capitalize">{site.criticality || '—'}</td>
                                            <td className="px-4 py-3 text-white/70 max-w-lg">{site.reason || '—'}</td>
                                            <td className="px-4 py-3 text-white/55">{site.observability} / {site.security}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section id="kibana" className={`${FW_CARD_CLASS} p-5 space-y-4`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-extrabold tracking-tighter">Kibana workbenches</h2>
                                <p className="text-sm text-white/45 mt-1">Space {template?.elastic?.kibanaSpace || 'fw-scada-water'}</p>
                            </div>
                            <a
                                href={kibanaAgentHref(template)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-semibold underline underline-offset-4"
                                style={{ color: accent }}
                            >
                                Open Agent Builder
                            </a>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {primaryDashboards.map((dash) => (
                                <a
                                    key={dash.id}
                                    href={kibanaDashboardHref(template, dash.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: primary }}
                                >
                                    {dash.title}
                                </a>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {secondaryDashboards.map((dash) => (
                                <a
                                    key={dash.id}
                                    href={kibanaDashboardHref(template, dash.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold border border-white/15 text-white/75 hover:bg-white/10 transition-colors"
                                >
                                    {dash.title}
                                </a>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
            <ChatWidget floating agentId={agentId} />
        </>
    );
}
