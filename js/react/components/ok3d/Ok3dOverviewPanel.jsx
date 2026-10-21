/**
 * Ok3dOverviewPanel — drone photo + live stats + flight-area map.
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import { getOk3dBoundaries, getOk3dOverviewStats } from '../../../modules/utils/ok3dEsqlQueries.js';
import { formatNumber, formatSeconds, formatSiteLabel, formatWhen } from './ok3dUi.js';
import Ok3dFlightMap from './Ok3dFlightMap.jsx';

/**
 * @param {{ siteId: string }} props
 */
export default function Ok3dOverviewPanel({ siteId }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#0B3A5C';
    const secondaryColor = template?.colors?.secondary || '#F15A22';
    const drone = template?.drone || {};

    const [stats, setStats] = useState(null);
    const [boundaries, setBoundaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const [nextStats, nextBoundaries] = await Promise.all([
                    getOk3dOverviewStats(siteId),
                    getOk3dBoundaries(siteId),
                ]);
                if (cancelled) return;
                setStats(nextStats);
                setBoundaries(nextBoundaries);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load overview');
                setStats(null);
                setBoundaries([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [siteId]);

    const cards = [
        { label: 'Flights (24h)', value: formatNumber(stats?.flights24h) },
        { label: 'Flights (7d)', value: formatNumber(stats?.flights7d) },
        { label: 'Avg max alt', value: stats?.avgMaxAltFt == null ? '—' : `${formatNumber(stats.avgMaxAltFt, 0)} ft` },
        { label: 'Avg min battery', value: stats?.avgBatteryMin == null ? '—' : `${formatNumber(stats.avgBatteryMin, 0)}%` },
        { label: 'Flights with faults', value: formatNumber(stats?.faultFlights) },
        { label: 'Avg delivery', value: formatSeconds(stats?.avgDeliveryLatencyS) },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                    <div className="aspect-[4/3] bg-slate-100">
                        <img
                            src={drone.image || template?.hero?.backgroundImage}
                            alt={drone.label || 'OK 3D drone'}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="p-4">
                        <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                            {drone.label || 'Mesonet profile UAS'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {drone.caption || 'Representative airframe for OK 3D vertical soundings.'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>
                            Drone stats
                        </h2>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {formatSiteLabel(siteId)}
                        </span>
                    </div>

                    {loading && (
                        <p className="text-sm text-gray-500">Loading live flight KPIs…</p>
                    )}
                    {error && !loading && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {error}
                            <button
                                type="button"
                                className="ml-3 font-semibold underline"
                                onClick={() => setError('')}
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {cards.map((card) => (
                            <div
                                key={card.label}
                                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                            >
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-2xl font-black tracking-tighter" style={{ color: secondaryColor }}>
                                    {loading ? '…' : card.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4 text-sm text-gray-700">
                        <p className="font-semibold" style={{ color: primaryColor }}>Last flight</p>
                        <p className="mt-1">
                            {stats?.lastFlightId
                                ? (
                                    <>
                                        <span className="font-mono">{stats.lastFlightId}</span>
                                        {' · '}
                                        {stats.lastDroneId || '—'}
                                        {' · '}
                                        {formatSiteLabel(stats.lastSiteId)}
                                        {' · '}
                                        {formatWhen(stats.lastFlightEnd)}
                                    </>
                                )
                                : (loading ? '…' : 'No flights in window')}
                        </p>
                    </div>
                </div>
            </div>

            <section>
                <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h2 className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>
                        Flight area
                    </h2>
                    <p className="text-sm text-gray-500">
                        Operating volumes and site buffers from uas-boundaries
                    </p>
                </div>
                <Ok3dFlightMap boundaries={boundaries} />
            </section>
        </div>
    );
}
