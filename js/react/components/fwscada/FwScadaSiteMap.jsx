/**
 * FwScadaSiteMap — Leaflet basemap with FW site status markers.
 */

import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCartoDarkRasterLayer } from '../../../modules/utils/cartoBasemap.js';
import { formatSiteType, statusColor } from './fwScadaUi.js';

/**
 * @param {{ sites: Array<{ id?: string, name: string, type?: string, status?: string, reason?: string, geo?: { lat: number, lon: number }|null }> }} props
 */
export default function FwScadaSiteMap({ sites }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);

    const points = useMemo(
        () => (sites || []).filter((s) => (
            Number.isFinite(s.geo?.lat) && Number.isFinite(s.geo?.lon)
        )),
        [sites]
    );

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return undefined;

        if (!mapRef.current) {
            const map = L.map(el, {
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: false,
            }).setView([41.0793, -85.1394], 11);

            const basemap = getCartoDarkRasterLayer();
            if (basemap) {
                L.tileLayer(basemap.url, basemap.options).addTo(map);
            }

            layerRef.current = L.layerGroup().addTo(map);
            mapRef.current = map;
        }

        const map = mapRef.current;
        const layer = layerRef.current;
        layer.clearLayers();

        if (points.length) {
            const bounds = [];
            points.forEach((site) => {
                const color = statusColor(site.status);
                const radius = site.status === 'red' ? 9 : site.status === 'amber' ? 8 : 5;
                const marker = L.circleMarker([site.geo.lat, site.geo.lon], {
                    radius,
                    color: '#0B1220',
                    weight: 1,
                    fillColor: color,
                    fillOpacity: site.status === 'green' ? 0.55 : 0.95,
                });
                marker.bindPopup(
                    `<div style="min-width:160px">`
                    + `<strong>${escapeHtml(site.name || 'Site')}</strong><br/>`
                    + `<span style="text-transform:capitalize">${escapeHtml(formatSiteType(site.type))}</span><br/>`
                    + `<span style="color:${color};font-weight:700;text-transform:uppercase">${escapeHtml(site.status || 'unknown')}</span>`
                    + (site.reason ? `<br/><span style="color:#334155">${escapeHtml(site.reason)}</span>` : '')
                    + `</div>`
                );
                marker.addTo(layer);
                bounds.push([site.geo.lat, site.geo.lon]);
            });

            if (bounds.length === 1) {
                map.setView(bounds[0], 13);
            } else {
                map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
            }
        } else {
            map.setView([41.0793, -85.1394], 11);
        }

        const onResize = () => map.invalidateSize();
        window.addEventListener('resize', onResize);
        const timers = [0, 100, 300, 800].map((ms) => setTimeout(onResize, ms));
        requestAnimationFrame(onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            timers.forEach(clearTimeout);
            // Keep map instance across points updates; only tear down on unmount.
        };
    }, [points]);

    useEffect(() => () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            layerRef.current = null;
        }
    }, []);

    return (
        <div className="relative h-80 w-full rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a1620]">
            {/* Tailwind preflight sets img{max-width:100%} which blanks Leaflet tiles */}
            <style>{`
                .fw-scada-map.leaflet-container {
                    width: 100%;
                    height: 100%;
                    background: #0a1620;
                    font: inherit;
                }
                .fw-scada-map .leaflet-tile,
                .fw-scada-map img.leaflet-tile {
                    max-width: none !important;
                    max-height: none !important;
                }
                .fw-scada-map .leaflet-container img {
                    max-width: none !important;
                }
                .fw-scada-map .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                }
            `}</style>
            <div
                ref={containerRef}
                className="fw-scada-map absolute inset-0 z-0 h-full w-full"
                role="img"
                aria-label="Facilities map with site status markers"
            />
            {!points.length && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none text-sm text-white/50">
                    Loading facilities map…
                </div>
            )}
        </div>
    );
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
