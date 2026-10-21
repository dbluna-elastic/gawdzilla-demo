/**
 * Ok3dDeliveryPanel — NWS delivery SLA by site (7 days).
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import { getOk3dDeliveryReport } from '../../../modules/utils/ok3dEsqlQueries.js';
import { formatNumber, formatSeconds, formatSiteLabel } from './ok3dUi.js';

export default function Ok3dDeliveryPanel() {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#0B3A5C';
    const secondaryColor = template?.colors?.secondary || '#F15A22';
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const next = await getOk3dDeliveryReport();
                if (!cancelled) setRows(next);
            } catch (err) {
                if (!cancelled) {
                    setError(err?.message || 'Failed to load delivery report');
                    setRows([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const totalFlights = rows.reduce((sum, row) => sum + (row.flights || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>
                    NWS delivery SLA
                </h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Last 7 days
                </span>
            </div>

            {loading && <p className="text-sm text-gray-500">Loading delivery latency…</p>}
            {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm max-w-xs">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Flights with delivery metrics
                </p>
                <p className="mt-2 text-3xl font-black tracking-tighter" style={{ color: secondaryColor }}>
                    {loading ? '…' : formatNumber(totalFlights)}
                </p>
            </div>

            {!loading && !error && rows.length === 0 && (
                <p className="text-sm text-gray-500">No delivery stats in the last 7 days</p>
            )}

            {rows.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Site</th>
                                <th className="px-4 py-3">Flights</th>
                                <th className="px-4 py-3">Avg latency</th>
                                <th className="px-4 py-3">P95 latency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.siteId} className="border-t border-gray-100">
                                    <td className="px-4 py-3">{formatSiteLabel(row.siteId)}</td>
                                    <td className="px-4 py-3">{formatNumber(row.flights)}</td>
                                    <td className="px-4 py-3">{formatSeconds(row.avgLatencyS)}</td>
                                    <td className="px-4 py-3">{formatSeconds(row.p95LatencyS)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
