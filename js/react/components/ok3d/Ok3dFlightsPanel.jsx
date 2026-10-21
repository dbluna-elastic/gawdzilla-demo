/**
 * Ok3dFlightsPanel — recent uas-flights table.
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import { getOk3dRecentFlights } from '../../../modules/utils/ok3dEsqlQueries.js';
import { formatNumber, formatSeconds, formatSiteLabel, formatWhen } from './ok3dUi.js';

/**
 * @param {{ siteId: string }} props
 */
export default function Ok3dFlightsPanel({ siteId }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#0B3A5C';
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const next = await getOk3dRecentFlights(siteId, 40);
                if (!cancelled) setRows(next);
            } catch (err) {
                if (!cancelled) {
                    setError(err?.message || 'Failed to load flights');
                    setRows([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [siteId]);

    return (
        <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>
                    Recent flights
                </h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {formatSiteLabel(siteId)}
                </span>
            </div>

            {loading && <p className="text-sm text-gray-500">Loading flights…</p>}
            {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                </div>
            )}
            {!loading && !error && rows.length === 0 && (
                <p className="text-sm text-gray-500">No flights in window</p>
            )}

            {rows.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Flight</th>
                                <th className="px-4 py-3">Drone</th>
                                <th className="px-4 py-3">Site</th>
                                <th className="px-4 py-3">Max alt</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3">Min batt</th>
                                <th className="px-4 py-3">Faults</th>
                                <th className="px-4 py-3">Delivery</th>
                                <th className="px-4 py-3">Ended</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.flightId || `${row.droneId}-${row.end}`} className="border-t border-gray-100">
                                    <td className="px-4 py-3 font-mono text-xs">{row.flightId || '—'}</td>
                                    <td className="px-4 py-3">{row.droneId || '—'}</td>
                                    <td className="px-4 py-3">{formatSiteLabel(row.siteId)}</td>
                                    <td className="px-4 py-3">
                                        {row.maxAltFt == null ? '—' : `${formatNumber(row.maxAltFt, 0)} ft`}
                                    </td>
                                    <td className="px-4 py-3">{formatSeconds(row.durationS)}</td>
                                    <td className="px-4 py-3">
                                        {row.batteryMinPct == null ? '—' : `${formatNumber(row.batteryMinPct, 0)}%`}
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.faults?.length
                                            ? row.faults.join(', ')
                                            : <span className="text-gray-400">none</span>}
                                    </td>
                                    <td className="px-4 py-3">{formatSeconds(row.deliveryLatencyS)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{formatWhen(row.end)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
