/**
 * USWDS-style big footer — primary ink band, white links.
 */

import { useContext } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';

function CivicPublicFooter() {
    const template = useContext(TemplateContext);
    const name = template?.branding?.institutionName ?? 'State Agency';
    const primary = template?.colors?.primary || '#005ea2';
    const headingFont = template?.typography?.headingFontFamily || 'var(--heading-font-family, Merriweather, serif)';
    const bodyFont = template?.typography?.fontFamily || 'var(--font-family)';
    const newsletter = template?.content?.blueBar?.newsletterText;

    if (!template) return null;

    return (
        <footer className="text-white" style={{ backgroundColor: primary, fontFamily: bodyFont }}>
            <div className="mx-auto max-w-[64rem] px-4 py-12 md:px-8">
                <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-3">
                    <div>
                        <h3 className="mb-3 text-lg font-bold" style={{ fontFamily: headingFont }}>
                            {name}
                        </h3>
                        <p className="mb-2 text-sm text-white/85">{template.footer?.address ?? ''}</p>
                        <p className="text-sm text-white/85">{template.footer?.phone ?? ''}</p>
                        {newsletter && (
                            <a
                                href="#newsletter"
                                className="mt-4 inline-block rounded border-2 border-white px-4 py-2 text-sm font-bold text-white hover:bg-white hover:text-[#1b1b1b]"
                            >
                                {newsletter}
                            </a>
                        )}
                    </div>
                    <div>
                        <h3 className="mb-3 text-lg font-bold" style={{ fontFamily: headingFont }}>
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            {(template.footer?.quickLinks ?? []).map((link, i) => (
                                <li key={i}>
                                    <a href={link.href} className="text-sm text-white underline-offset-2 hover:underline">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-3 text-lg font-bold" style={{ fontFamily: headingFont }}>
                            Connect
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {(template.footer?.socialMedia ?? []).map((s, i) => (
                                <a
                                    key={i}
                                    href={s.href}
                                    className="text-sm font-bold text-white underline-offset-2 hover:underline"
                                    aria-label={s.label}
                                >
                                    {s.platform}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/25 bg-black/20">
                <div className="mx-auto max-w-[64rem] px-4 py-4 md:px-8">
                    <p className="text-center text-sm text-white/80">
                        © 2026 {name}. All Rights Reserved. Demo environment — synthetic data only.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default CivicPublicFooter;
