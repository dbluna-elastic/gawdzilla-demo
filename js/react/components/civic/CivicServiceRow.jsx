/**
 * NIH Library / USWDS-style service cards — title + description, overlaps hero.
 */

import { useContext } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';

/**
 * @param {Object} props
 * @param {Array<{ label?: string, description?: string, href?: string }>} props.tiles
 * @param {(tile: object, e: import('react').MouseEvent) => void} [props.onTileClick]
 * @param {string} [props.sectionId='programs']
 */
function CivicServiceRow({ tiles, onTileClick, sectionId = 'programs' }) {
    const template = useContext(TemplateContext);
    const primary = template?.colors?.primary || '#005ea2';
    const headingFont = template?.typography?.headingFontFamily || 'var(--heading-font-family, Merriweather, serif)';
    const bodyFont = template?.typography?.fontFamily || 'var(--font-family)';
    const items = (Array.isArray(tiles) ? tiles : []).slice(0, 6);

    if (items.length === 0) return null;

    return (
        <section
            id={sectionId}
            className="relative z-10 -mt-10 border-b border-[#dfe1e2] bg-transparent pb-2 md:-mt-14 md:pb-4"
            aria-label="Popular services"
        >
            <div className="mx-auto grid max-w-[64rem] grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 md:px-8">
                {items.map((tile, idx) => (
                    <a
                        key={`${tile.label || 'tile'}-${idx}`}
                        href={tile.href || '#'}
                        onClick={(e) => onTileClick?.(tile, e)}
                        className="group civic-service-card flex flex-col rounded border border-[#dfe1e2] border-t-4 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
                        style={{ borderTopColor: primary }}
                    >
                        <h3
                            className="text-lg font-bold text-[#1b1b1b] group-hover:underline"
                            style={{ fontFamily: headingFont, color: primary }}
                        >
                            {tile.label}
                        </h3>
                        {tile.description && (
                            <p className="mt-2 flex-1 text-sm leading-relaxed text-[#565c65]" style={{ fontFamily: bodyFont }}>
                                {tile.description}
                            </p>
                        )}
                        <span className="mt-3 text-sm font-bold" style={{ color: primary, fontFamily: bodyFont }}>
                            Go to section →
                        </span>
                    </a>
                ))}
            </div>
        </section>
    );
}

export default CivicServiceRow;
