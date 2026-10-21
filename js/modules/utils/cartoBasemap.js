/**
 * CARTO basemap tile URLs (API key from env — never hardcode).
 */

import { getEnvVar } from './getEnvVar.js';

/**
 * @returns {string} CARTO_API_KEY from window.env / Vite / process.env
 */
export function getCartoApiKey() {
    return String(getEnvVar('CARTO_API_KEY', '') || '').trim();
}

/**
 * Raster Voyager PNG tiles (Leaflet). Requires CARTO_API_KEY in .env.
 * @returns {{ url: string, options: Object }|null}
 */
export function getCartoVoyagerRasterLayer() {
    const key = getCartoApiKey();
    if (!key) return null;
    return {
        url: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`,
        options: {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 20,
        },
    };
}

/**
 * Dark raster tiles for SCADA-style maps. Requires CARTO_API_KEY in .env.
 * @returns {{ url: string, options: Object }|null}
 */
export function getCartoDarkRasterLayer() {
    const key = getCartoApiKey();
    if (!key) return null;
    return {
        url: `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`,
        options: {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 20,
        },
    };
}
