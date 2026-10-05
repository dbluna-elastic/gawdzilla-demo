/**
 * Ghost Students / Title IV Aid Integrity — Northbridge Community College System.
 * Data: rrp_* indices, Kibana space ghost_students (gawdzilla).
 */
export const ghoststudentsTemplate = {
    id: 'ghoststudents',
    name: 'Northbridge Ghost Students',

    branding: {
        institutionName: 'Northbridge Community College System',
        tagline: 'Aid integrity for Title IV — catch ghost enrollments before clawback.',
        logo: '/logo-ghoststudents.svg',
    },

    header: {
        overlay: true,
        sticky: true,
        utilityIcons: ['search', 'globe', 'menu'],
        menuLabel: 'MENU',
    },

    content: {
        heroTitle: 'Hunting Ghost Students.',
        heroSubtitle: 'Correlate one application, one disbursement, and one login — the One Hour Test for Title IV aid integrity.',
        ctaText: 'Learn More',
        ctaSecondary: 'Investigator Portal',
        stateName: 'Texas',
        stateAbbreviation: 'TX',
        welcomeMessage: 'Welcome to Northbridge Aid Integrity',
        blueBar: {
            newsletterText: 'Sign up for aid integrity briefings',
            scrollPromptText: 'Scroll to explore fraud rings',
            sidebarIcons: ['email', 'document'],
        },
        promoBar: {
            text: 'DEMO — Synthetic admissions, aid, LMS, and identity data. Not real students or SSNs.',
            href: '#programs',
        },
        mainHeading: 'One Hour Test. Defensible Evidence.',
        mainTagline: 'APPLICATION · DISBURSEMENT · LOGIN — CORRELATED',
        chatBubbleText: 'Ask about ghost scores, clawback, or displaced students',
        chatAssistantTitle: 'Aid Integrity Agent',
        chatAssistantSubtitle: 'Ask about released aid with no academic footprint, shared devices, clawback by campus, or OIG referral drafts.',
        chatAssistantEmptyBody: 'Ask about high ghost scores, shared refund destinations, waitlisted real students, or Next Wave help desk campaigns.',
        chatAssistantEmptyTry: 'Tap * below for demo queries',
        programsLanding: {
            sectionTitle: 'Seeded Fraud Rings',
            sectionSubtitle: 'Five synthetic rings plus legitimate edge cases — so the demo shows both detection and fairness.',
            tileCta: 'Learn more',
            tiles: [
                {
                    label: 'Tumbleweed',
                    description: 'Bot-farm applications: shared devices, hosting ASNs, 2–4 minute forms, near-duplicate coursework.',
                    href: '#reports',
                },
                {
                    label: 'Harbor',
                    description: 'Stolen identities with mail-drop addresses and login geography far from mailing address.',
                    href: '#reports',
                },
                {
                    label: 'Borrowed Names',
                    description: 'Reference-list matches (deceased/incarcerated) combined with unaffiliated home logins — never the match alone.',
                    href: '#reports',
                },
                {
                    label: 'Slow Burn',
                    description: 'Low volume across terms; one refund account recurs — thresholds miss it, ML does not.',
                    href: '#reports',
                },
                {
                    label: 'Next Wave',
                    description: 'Clean FAFSA passes; urgency language hits the help desk for account resets on flagged students.',
                    href: '#reports',
                },
                {
                    label: 'Investigator Portal',
                    description: 'Authorized staff: live clawback KPIs, ghost scores, Kibana dashboards, and Agent Builder.',
                    href: '#staff-login',
                },
            ],
        },
        reportsSection: {
            title: 'Aid Integrity Snapshot',
            subtitle: 'Live metrics from rrp_* indices on Elasticsearch. Staff can open the full investigator portal after login.',
            kpiLabels: {
                aidAtRisk: 'Released aid at risk',
                highRiskStudents: 'High-risk students',
                displacedSeats: 'Ghost seats vs waitlist',
                nextWaveTickets: 'Next Wave help desk tickets',
            },
        },
        staffDashboard: {
            pageTitle: 'Northbridge Aid Integrity Portal',
            subtitle: 'Review ghost scores, clawback exposure, shared infrastructure, and open Kibana workbenches.',
            tabs: {
                intelligence: 'Aid Integrity',
            },
        },
        chat: {
            samplePromptsByAgent: {
                'rrp-aid-integrity': [
                    { label: 'No academic activity', prompt: 'Which students released aid this term but have almost no academic activity?' },
                    { label: 'Shared device', prompt: 'Show me everything tied to the device used by the top ghost-score result.' },
                    { label: 'Clawback by campus', prompt: 'How much of our Fall aid is at risk of being returned, by campus?' },
                    { label: 'Displaced students', prompt: 'Which real students were waitlisted out of sections filled by high risk enrollments?' },
                    { label: 'OIG referral', prompt: 'Draft an OIG referral summary for the Tumbleweed cluster with a timeline and record citations.', skipFastPath: true },
                    { label: 'Help desk takeover', prompt: 'Are we seeing help desk requests that look like account takeover attempts for flagged students?' },
                ],
            },
        },
    },

    navigation: {
        links: [
            { label: 'Rings', href: '#programs' },
            { label: 'Snapshot', href: '#reports' },
            { label: 'Contact', href: '#contact' },
            { label: 'About', href: '#about' },
        ],
    },

    hero: {
        backgroundImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80',
        mainHeading: 'NORTHBRIDGE AID INTEGRITY',
        subHeading: 'Catch ghost enrollments before clawback.',
        ctaButtons: {
            primary: 'Staff Login',
            secondary: 'View Rings',
        },
    },

    footer: {
        address: '100 Bridgeway Drive, Northbridge, TX 76201',
        phone: '(555) 014-2600',
        quickLinks: [
            { label: 'Fraud Rings', href: '#programs' },
            { label: 'Aid Snapshot', href: '#reports' },
            { label: 'Privacy', href: '#privacy' },
            { label: 'Accessibility', href: '#accessibility' },
        ],
        socialMedia: [
            { platform: 'FB', href: '#facebook', label: 'Facebook' },
            { platform: 'TW', href: '#twitter', label: 'Twitter' },
        ],
    },

    colors: {
        primary: '#0B3D91',
        secondary: '#D4A017',
        warning: '#C45C26',
        bgBase: '#061833',
        bgSurface: '#0A2A5C',
        charcoal: '#0B3D91',
    },

    typography: {
        fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        headingFontFamily: "'Merriweather', Georgia, serif",
        headingWeight: '700',
        headingTracking: '0',
    },

    schema: 'agency',

    schemaLabels: {
        dashboardStaff: 'Northbridge Aid Integrity Portal',
        staffRole: 'Aid Integrity Investigator',
        primaryRole: 'citizen',
    },

    elastic: {
        agentId: 'rrp-aid-integrity',
        fraudAgentId: 'rrp-aid-integrity',
        kibanaSpace: 'ghost_students',
        indices: {
            applications: 'rrp_applications',
            isir: 'rrp_isir',
            enrollment: 'rrp_enrollment',
            disbursements: 'rrp_disbursements',
            lmsActivity: 'rrp_lms_activity',
            authLogs: 'rrp_auth_logs',
            helpdesk: 'rrp_helpdesk',
            flags: 'rrp_student_flags_lookup',
            identityRisk: 'rrp_identity_risk_lookup',
        },
        kibanaUrl: 'https://gawdzilla-0d3e9e.kb.us-east-2.aws.elastic-cloud.com',
        dashboards: {
            integrity: [
                { title: 'Fall 2026 Aid Integrity', id: 'rrp-aid-integrity' },
                { title: 'Ring Map', id: 'rrp-ring-map' },
                { title: 'Investigator Workbench', id: 'rrp-investigator' },
                { title: 'Section Integrity', id: 'rrp-section-integrity' },
                { title: 'Next Wave Watch', id: 'rrp-next-wave' },
            ],
        },
        seededEntities: {
            topGhostStudent: 'T000070',
            sharedDeviceSample: '98be2b9cb6bfcd253379a492',
            ringTumbleweed: 'Tumbleweed',
            ringHarbor: 'Harbor',
            ringBorrowedNames: 'Borrowed Names',
            ringSlowBurn: 'Slow Burn',
            ringNextWave: 'Next Wave',
        },
    },

    search: {
        defaultFilters: {},
        preferences: { sortBy: '@timestamp', sortOrder: 'DESC' },
    },
};
