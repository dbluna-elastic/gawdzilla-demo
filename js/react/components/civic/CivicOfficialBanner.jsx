/**
 * USWDS-style official website banner (demo framing, not a .gov claim).
 */

import { useContext, useState } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';

function CivicOfficialBanner() {
    const template = useContext(TemplateContext);
    const [open, setOpen] = useState(false);
    const agency = template?.branding?.institutionName || 'this agency';

    return (
        <div className="civic-banner border-b border-[#dfe1e2] bg-[#f0f0f0] text-[0.8125rem] text-[#1b1b1b]">
            <div className="mx-auto flex max-w-[64rem] flex-wrap items-start gap-2 px-4 py-2 md:px-8">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 font-normal hover:underline"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span
                        className="inline-block h-3 w-4 shrink-0 rounded-[1px]"
                        style={{
                            background: 'linear-gradient(180deg, #b31942 33%, #fff 33%, #fff 66%, #0a3161 66%)',
                        }}
                        aria-hidden="true"
                    />
                    <span>
                        An official website of {agency}
                        <span className="ml-1 font-semibold underline decoration-dotted">
                            Here&apos;s how you know
                        </span>
                    </span>
                </button>
                {open && (
                    <div className="w-full pb-2 text-[#565c65]">
                        <p className="max-w-3xl leading-relaxed">
                            Official agency websites use a shared government design system for clear navigation,
                            accessibility, and trusted public information. This demo uses synthetic data only.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CivicOfficialBanner;
