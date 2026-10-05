/**
 * USWDS extended-style header: brand identity row + primary navigation bar.
 */

import { useContext } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import CivicOfficialBanner from './CivicOfficialBanner.jsx';

/**
 * @param {Object} props
 * @param {() => void} [props.onLoginClick]
 * @param {string} [props.skipHref='#civic-main']
 */
function CivicPublicHeader({ onLoginClick, skipHref = '#civic-main' }) {
    const template = useContext(TemplateContext);
    const name = template?.branding?.institutionName ?? '';
    const tagline = template?.branding?.tagline ?? '';
    const primary = template?.colors?.primary || '#005ea2';
    const headingFont = template?.typography?.headingFontFamily || 'var(--heading-font-family, Merriweather, serif)';
    const bodyFont = template?.typography?.fontFamily || 'var(--font-family)';
    const links = Array.isArray(template?.navigation?.links) ? template.navigation.links : [];

    return (
        <header className="sticky top-0 z-40 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
            <a
                href={skipHref}
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded focus:bg-[#face00] focus:px-3 focus:py-2 focus:text-[#1b1b1b] focus:outline-none"
            >
                Skip to main content
            </a>
            <CivicOfficialBanner />

            {/* Identity row — brand-first, NIH Library style */}
            <div className="border-b border-[#dfe1e2] bg-white">
                <div className="mx-auto flex max-w-[64rem] items-center justify-between gap-4 px-4 py-4 md:px-8 md:py-5">
                    <a href="#top" className="flex min-w-0 items-center gap-3 md:gap-4" title={name}>
                        <img
                            src={template?.branding?.logo ?? ''}
                            alt=""
                            className="h-12 w-auto shrink-0 md:h-14"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <span className="min-w-0">
                            <span
                                className="block text-xl font-bold leading-tight text-[#1b1b1b] md:text-[1.75rem]"
                                style={{ fontFamily: headingFont }}
                            >
                                {name}
                            </span>
                            {tagline && (
                                <span className="mt-0.5 block truncate text-sm text-[#565c65]" style={{ fontFamily: bodyFont }}>
                                    {tagline}
                                </span>
                            )}
                        </span>
                    </a>
                    {typeof onLoginClick === 'function' && (
                        <button
                            type="button"
                            onClick={onLoginClick}
                            className="hidden shrink-0 rounded border-2 px-4 py-2 text-sm font-bold hover:bg-[#f0f0f0] sm:inline-flex"
                            style={{ borderColor: primary, color: primary, fontFamily: bodyFont }}
                        >
                            Staff login
                        </button>
                    )}
                </div>
            </div>

            {/* Primary navigation — USWDS extended nav bar */}
            <nav aria-label="Primary navigation" style={{ backgroundColor: primary }}>
                <div className="mx-auto flex max-w-[64rem] items-center justify-between gap-2 px-2 md:px-4">
                    <ul className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
                        {links.map((link, i) => (
                            <li key={i} className="shrink-0">
                                <a
                                    href={link.href}
                                    className="civic-nav-link block border-b-4 border-transparent px-3 py-3 text-sm font-bold text-white hover:bg-black/10 hover:border-white md:px-4 md:text-base"
                                    style={{ fontFamily: bodyFont }}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    {typeof onLoginClick === 'function' && (
                        <button
                            type="button"
                            onClick={onLoginClick}
                            className="m-2 shrink-0 rounded bg-white px-3 py-2 text-sm font-bold sm:hidden"
                            style={{ color: primary, fontFamily: bodyFont }}
                        >
                            Login
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default CivicPublicHeader;
