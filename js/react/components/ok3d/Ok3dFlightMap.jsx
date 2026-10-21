/**
 * Ok3dFlightMap — Leaflet basemap with OK 3D operating-volume markers.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCartoVoyagerRasterLayer } from '../../../modules/utils/cartoBasemap.js';
import { boundaryColor, formatBoundaryType } from './ok3dUi.js';

/**
 * @param {{
 *   boundaries: Array<{
 *     id?: string,
 *     name: string,
 *     siteId?: string,
 *     type?: string,
 *     ceilingFt?: number|null,
 *     geo?: { lat: number, lon: number }|null
 *   }>
 * }} props
 */
export default function Ok3dFlightMap({ boundaries }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);
    const [basemapError, setBasemapError] = useState('');

    const points = useMemo(
        () => (boundaries || []).filter((b) => (
            Number.isFinite(b.geo?.lat) && Number.isFinite(b.geo?.lon)
        )),
        [boundaries]
    );

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return undefined;

        if (!mapRef.current) {
            const basemap = getCartoVoyagerRasterLayer();
            if (!basemap) {
                setBasemapError('Please add CARTO_API_KEY to your .env file.');
                return undefined;
            }
            setBasemapError('');

            const map = L.map(el, {
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: false,
            }).setView([35.4, -96.7], 7);

            L.tileLayer(basemap.url, basemap.options).addTo(map);

            layerRef.current = L.layerGroup().addTo(map);
            mapRef.current = map;
        }

        if (!mapRef.current || !layerRef.current) return undefined;

        const map = mapRef.current;
        const layer = layerRef.current;
        layer.clearLayers();

        if (points.length) {
            const bounds = [];
            points.forEach((site) => {
                const color = boundaryColor(site.type);
                const radius = site.type === 'operating_volume' ? 10 : 7;
                const marker = L.circleMarker([site.geo.lat, site.geo.lon], {
                    radius,
                    color: '#0B3A5C',
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 0.85,
                });
                marker.bindPopup(
                    `<div style="min-width:160px">`
                    + `<strong>${escapeHtml(site.name || 'Site')}</strong><br/>`
                    + `<span>${escapeHtml(formatBoundaryType(site.type))}</span>`
                    + (site.ceilingFt != null
                        ? `<br/><span>Ceiling ${escapeHtml(String(Math.round(site.ceilingFt)))} ft AGL</span>`
                        : '')
                    + `</div>`
                );
                marker.addTo(layer);
                bounds.push([site.geo.lat, site.geo.lon]);
            });

            if (bounds.length === 1) {
                map.setView(bounds[0], 10);
            } else {
                map.fitBounds(bounds, { padding: [36, 36], maxZoom: 10 });
            }
        } else {
            map.setView([35.4, -96.7], 7);
        }

        const onResize = () => map.invalidateSize();
        window.addEventListener('resize', onResize);
        const timers = [0, 100, 300, 800].map((ms) => setTimeout(onResize, ms));
        requestAnimationFrame(onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            timers.forEach(clearTimeout);
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
        <div className="relative h-80 w-full rounded-xl overflow-hidden border border-gray-200 bg-slate-100">
            <style>{`
                .ok3d-map.leaflet-container {
                    width: 100%;
                    height: 100%;
                    background: #e2e8f0;
                    font: inherit;
                }
                .ok3d-map .leaflet-tile,
                .ok3d-map img.leaflet-tile {
                    max-width: none !important;
                    max-height: none !important;
                }
                .ok3d-map .leaflet-container img {
                    max-width: none !important;
                }
            `}</style>
            <div ref={containerRef} className="ok3d-map leaflet-container h-full w-full" />
            {basemapError && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/80 px-4 text-center text-sm text-gray-700">
                    {basemapError}
                </div>
            )}
            {!basemapError && !points.length && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-gray-600">
                    No flight-area points for this filter
                </div>
            )}
        </div>
    );
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
