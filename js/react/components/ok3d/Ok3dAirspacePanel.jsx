/**
 * Ok3dAirspacePanel — Remote ID detections + ADS-B summary.
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import { getOk3dAdsbSummary, getOk3dRemoteIdDetections } from '../../../modules/utils/ok3dEsqlQueries.js';
import { formatNumber, formatSiteLabel } from './ok3dUi.js';

/**
 * @param {{ siteId: string }} props
 */
export default function Ok3dAirspacePanel({ siteId }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#0B3A5C';
    const secondaryColor = template?.colors?.secondary || '#F15A22';
    const [detections, setDetections] = useState([]);
    const [adsb, setAdsb] = useState({ tracks24h: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const [nextDetections, nextAdsb] = await Promise.all([
                    getOk3dRemoteIdDetections(siteId),
                    getOk3dAdsbSummary(siteId),
                ]);
                if (cancelled) return;
                setDetections(nextDetections);
                setAdsb(nextAdsb);
            } catch (err) {
                if (!cancelled) {
                    setError(err?.message || 'Failed to load airspace');
                    setDetections([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [siteId]);

    return (
        <div className="space-y-6">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>
                    Airspace &amp; alerts
                </h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Last 24h · {formatSiteLabel(siteId)}
                </span>
            </div>

            {loading && <p className="text-sm text-gray-500">Loading airspace signals…</p>}
            {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Remote ID serials
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tighter" style={{ color: secondaryColor }}>
                        {loading ? '…' : formatNumber(detections.length)}
                    </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        ADS-B tracks (24h)
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tighter" style={{ color: secondaryColor }}>
                        {loading ? '…' : formatNumber(adsb.tracks24h)}
                    </p>
                </div>
            </div>

            {!loading && !error && detections.length === 0 && (
                <p className="text-sm text-gray-500">No Remote ID detections in the last 24 hours</p>
            )}

            {detections.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">UAS serial</th>
                                <th className="px-4 py-3">Detections</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detections.map((row) => (
                                <tr key={row.serial} className="border-t border-gray-100">
                                    <td className="px-4 py-3 font-mono text-xs">{row.serial}</td>
                                    <td className="px-4 py-3">{formatNumber(row.detections)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
