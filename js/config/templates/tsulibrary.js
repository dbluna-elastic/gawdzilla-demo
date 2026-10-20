/**
 * Texas State University Libraries — receipt capture & search demo.
 * Data: library-receipts (gawdzilla space tsu-library-receipts). Synthetic only.
 */
export const tsulibraryTemplate = {
    id: 'tsulibrary',
    name: 'Texas State Libraries Receipts',

    branding: {
        institutionName: 'Texas State University Libraries',
        tagline: 'Find any library receipt in seconds—PDF, photo, or email—and understand spend.',
        logo: '/logo-tsulibrary.svg',
    },

    header: {
        overlay: true,
        sticky: true,
        utilityIcons: ['search', 'globe', 'menu'],
        menuLabel: 'MENU',
    },

    content: {
        heroTitle: 'Every receipt. One search.',
        heroSubtitle:
            'Collect PDFs, phone photos, and email exports. Extract fields, search with intent, approve what needs eyes, and ask about library spend.',
        ctaText: 'Enter demo',
        ctaSecondary: 'Staff portal',
        stateName: 'Texas',
        stateAbbreviation: 'TX',
        welcomeMessage: 'Welcome to Texas State University Libraries Receipt Capture',
        blueBar: {
            newsletterText: 'Sign up for library acquisitions updates',
            scrollPromptText: 'Scroll to see collect → search → review → ask',
            sidebarIcons: ['email', 'document'],
        },
        promoBar: {
            text: 'DEMO — Synthetic receipt data only. Not real Texas State vendor or staff records.',
            href: '#programs',
        },
        mainHeading: 'Collect. Search. Review. Ask.',
        mainTagline: 'FROM CAPTURE TO ANSWER IN ONE PLACE',
        chatBubbleText: 'Ask about ILL spend, pending reviews, or duplicates',
        chatAssistantTitle: 'Library Receipts Assistant',
        chatAssistantSubtitle:
            'Ask about spend by vendor or fund, pending reviews, duplicates, and tax-charged receipts. Answers cite invoice and receipt ids.',
        chatAssistantEmptyBody:
            'Try ILL spend for FY2026, receipts over $5,000 still pending, duplicate invoices, or the sales-tax receipt.',
        chatAssistantEmptyTry: 'Tap * below for demo queries',
        chat: {
            samplePromptsByAgent: {
                'library-receipts-assistant': [
                    {
                        label: 'ILL spend FY2026',
                        prompt: 'How much did we spend with the interlibrary loan service in FY2026?',
                    },
                    {
                        label: 'Pending over $5k',
                        prompt: 'Which receipts over $5,000 are still pending review?',
                    },
                    {
                        label: 'Duplicates',
                        prompt: 'Do we have any duplicate invoices?',
                    },
                    {
                        label: 'Sales tax',
                        prompt: 'Find the receipt where we were charged sales tax and tell me the amount.',
                    },
                    {
                        label: 'Renewal brief',
                        prompt:
                            'Summarize the large database renewal for FY2026 and what an acquisitions librarian should check before approving.',
                        skipFastPath: true,
                    },
                ],
            },
        },
        programsLanding: {
            sectionTitle: 'How it works',
            sectionSubtitle:
                'Academic libraries manage subscriptions, ILL fees, and invoices across messy channels. This demo turns that chaos into collect → search → review → ask.',
            tileCta: 'Learn more',
            tiles: [
                {
                    label: 'Collect',
                    description: 'Upload a PDF or phone-style photo. See vendor, date, total, extraction method, and OCR confidence.',
                    href: '#staff-login',
                },
                {
                    label: 'Search',
                    description: 'Exact invoice, keyword, semantic, or hybrid—plus filters for fiscal year and department.',
                    href: '#staff-login',
                },
                {
                    label: 'Review & analyze',
                    description: 'Clear the pending queue; spot duplicates, tax charged, and high-dollar renewals.',
                    href: '#reports',
                },
                {
                    label: 'Ask the assistant',
                    description: 'Natural-language spend questions with citations to receipt id and invoice number.',
                    href: '#chat',
                },
            ],
        },
        reportsSection: {
            title: 'Spend snapshot',
            subtitle:
                'Live metrics from library-receipts on Elasticsearch. Staff can open search, upload, review, and the full Kibana dashboard after login.',
            kpiLabels: {
                fy2026Spend: 'FY2026 spend',
                pendingReview: 'Pending review',
                duplicates: 'Possible duplicates',
                taxCharged: 'Tax charged',
            },
            seededHeading: 'Story receipts (synthetic)',
            seededNote:
                'Talk-track invoices: KB-FY26-RENEW-0042, SPC-AAR-2025-091, MS-INV-77821, COM-984412. Fiscal years run Sept 1–Aug 31.',
        },
        staffDashboard: {
            pageTitle: 'Library Receipts Operations',
            subtitle:
                'Search receipts, upload new files, work the pending review queue, and review spend exceptions. Demo data only.',
            tabs: {
                search: 'Search',
                upload: 'Upload',
                review: 'Review',
                analyze: 'Analyze',
            },
            searchEmpty: 'Try an invoice number, or ask the way you’d describe the purchase.',
            reviewNeedsHuman: 'Needs a human look—low confidence or over threshold.',
            loadError: 'Could not load library-receipts. Confirm the index is seeded on gawdzilla.',
            uploadOffline:
                'Upload needs the Texasstate-library FastAPI app (default http://127.0.0.1:8080). Start uvicorn, then try again.',
        },
        storyMoments: [
            {
                id: 'large_db_renewal',
                label: 'Large database renewal',
                invoice: 'KB-FY26-RENEW-0042',
                description: 'High-dollar FY renewal for acquisitions talk track.',
            },
            {
                id: 'semantic_renewal',
                label: 'Semantic renewal',
                invoice: 'SPC-AAR-2025-091',
                description: '“Annual access renewal” without the word subscription.',
            },
            {
                id: 'duplicate_invoice',
                label: 'Duplicate invoice',
                invoice: 'MS-INV-77821',
                description: 'Same invoice submitted twice under different filenames.',
            },
            {
                id: 'tax_charged',
                label: 'Tax charged',
                invoice: 'COM-984412',
                description: 'Receipt incorrectly charged sales tax.',
            },
            {
                id: 'low_ocr_ill',
                label: 'Low OCR ILL',
                invoice: 'ILL-HAND-392',
                description: 'Handwritten-style ILL fee routed to pending review.',
            },
        ],
    },

    login: {
        headline: 'Search, review, and ask about library spend',
        ssoButtonLabel: 'SSO through Texas State',
        features: [
            'Search with Exact, Keyword, Semantic, or Hybrid modes',
            'Upload a receipt and see extraction confidence',
            'Approve or flag items in the pending review queue',
            'Spot duplicates, tax charged, and high-dollar renewals',
            'Ask the Library Receipts Assistant with citations',
        ],
    },

    navigation: {
        links: [
            { label: 'How it works', href: '#programs' },
            { label: 'Reports', href: '#reports' },
            { label: 'Contact', href: '#contact' },
            { label: 'About', href: '#about' },
        ],
    },

    hero: {
        backgroundImage: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=80',
        mainHeading: 'TEXAS STATE LIBRARIES',
        subHeading: 'Find receipts and understand library spend without the scavenger hunt.',
        ctaButtons: {
            primary: 'Staff Login',
            secondary: 'How it works',
        },
    },

    footer: {
        address: 'Alkek Library, 601 University Dr, San Marcos, TX 78666',
        phone: '(512) 245-3680',
        quickLinks: [
            { label: 'How it works', href: '#programs' },
            { label: 'Spend snapshot', href: '#reports' },
            { label: 'Privacy', href: '#privacy' },
            { label: 'Accessibility', href: '#accessibility' },
        ],
        socialMedia: [
            { platform: 'FB', href: '#facebook', label: 'Facebook' },
            { platform: 'TW', href: '#twitter', label: 'Twitter' },
        ],
    },

    news: [
        {
            category: 'Collect',
            title: 'PDFs, photos, and email—one ingest path',
            description:
                'Extraction pulls vendor, date, total, and invoice number; low OCR confidence routes to pending review.',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
        },
        {
            category: 'Search',
            title: 'Meaning, not just keywords',
            description:
                'Hybrid search finds “annual access renewal” even when the receipt never says subscription.',
            image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80',
        },
        {
            category: 'Govern',
            title: 'Review before it becomes an audit surprise',
            description:
                'Duplicates, tax charged, and over-threshold amounts stay visible until a human approves or flags.',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        },
    ],

    colors: {
        primary: '#501214',
        secondary: '#A89968',
        warning: '#8B4513',
        bgBase: '#0B0B0B',
        bgSurface: '#161616',
        charcoal: '#1e293b',
        accent: '#A89968',
    },

    typography: {
        fontFamily: "'Source Sans 3', 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        headingFontFamily: "'Libre Baskerville', Georgia, serif",
        headingWeight: '700',
        headingTracking: '0',
    },

    schema: 'agency',

    schemaLabels: {
        dashboardStaff: 'Library Receipts Operations',
        staffRole: 'acquisitions staff',
        primaryRole: 'library staff',
        disclaimer:
            'By logging in, you agree this portal uses synthetic demo receipts only—not real Texas State financial records.',
        ssoTitle: 'Texas State Single Sign-On',
        secureSessionNote: 'Demo login only. Production would use university SSO and fund-level access controls.',
    },

    elastic: {
        agentId: 'library-receipts-assistant',
        esQueryAgentId: 'library-receipts-assistant',
        indices: {
            receipts: 'library-receipts',
            receiptsAlias: 'library-receipts-current',
            receiptsPattern: 'library-receipts*',
        },
        kibanaUrl: 'https://gawdzilla-0d3e9e.kb.us-east-2.aws.elastic-cloud.com',
        kibanaSpace: 'tsu-library-receipts',
        dashboards: {
            spend: [{ title: 'Library Spend and Receipts', id: 'library-spend-and-receipts' }],
        },
        seededEntities: {
            largeRenewalInvoice: 'KB-FY26-RENEW-0042',
            semanticRenewalInvoice: 'SPC-AAR-2025-091',
            duplicateInvoice: 'MS-INV-77821',
            taxChargedInvoice: 'COM-984412',
            lowOcrIllInvoice: 'ILL-HAND-392',
            semanticQuery: 'annual access renewal for the journal database',
        },
    },

    search: {
        defaultFilters: { fiscalYear: 'FY2026' },
        preferences: { sortBy: 'receipt_date', sortOrder: 'DESC' },
        modes: ['exact', 'keyword', 'semantic', 'hybrid'],
        defaultMode: 'hybrid',
    },
};
