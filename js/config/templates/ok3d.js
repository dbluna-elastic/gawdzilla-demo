/**
 * OK 3D Drone — Oklahoma 3D Mesonet UAS ops (landing + tabbed portal).
 * Data: uas-* indices in Kibana space ok3d-uas (gawdzilla).
 */
export const ok3dTemplate = {
    id: 'ok3d',
    name: 'OK 3D Drone',

    schema: 'school',

    branding: {
        institutionName: 'OK 3D Drone',
        tagline: 'Oklahoma 3D Mesonet UAS operations',
        logo: '/logo-ok3d.svg',
    },

    schemaLabels: {
        dashboardStaff: 'OK 3D UAS Operations',
        dashboardPrimary: 'Flight Ops',
        primaryRole: 'operator',
        staffRole: 'flight ops',
    },

    content: {
        heroTitle: 'OK 3D Drone',
        heroSubtitle: 'Vertical profiles, airspace awareness, and NWS delivery for the Oklahoma 3D Mesonet.',
        ctaText: 'Open ops portal',
        ctaSecondary: 'Talk to Flight Analyst',
        stateName: 'Oklahoma',
        stateAbbreviation: 'OK',
        welcomeMessage: 'Welcome to OK 3D Drone',
        chatBubbleText: 'Ask about flights, inversions, or airspace',
        chatAssistantTitle: 'Mesonet Flight Analyst',
        chatAssistantSubtitle: 'Ask about inversions, flight summaries, airspace conflicts, or NWS delivery SLA.',
        chatAssistantEmptyBody: 'Ask which sites flew recently, whether an inversion is present, or how delivery latency looks this week.',
        chatAssistantEmptyTry: 'Tap * below for demo queries',
        promoBar: {
            text: 'DEMO — Synthetic UAS flight, telemetry, and airspace data for Oklahoma 3D Mesonet sites (Kessler & Bixby).',
            href: '#news',
        },
        staffDashboard: {
            pageTitle: 'OK 3D UAS Operations',
            subtitle: 'Live flight KPIs, airspace signals, and NWS delivery SLA from the ok3d-uas space.',
            tabs: {
                overview: 'Overview',
                flights: 'Flights',
                airspace: 'Airspace',
                delivery: 'Delivery',
            },
        },
        chat: {
            samplePromptsByAgent: {
                'mesonet-flight-analyst': [
                    { label: 'Kessler inversion', prompt: 'Check uas-profiles at kaefs for a temperature inversion in the last 48 hours.' },
                    { label: 'Recent flights', prompt: 'Summarize the most recent flights at Kessler and Bixby.' },
                    { label: 'Airspace near Kessler', prompt: 'What Remote ID detections have we seen near kaefs in the last 24 hours?' },
                    { label: 'Delivery SLA', prompt: 'How is NWS delivery latency looking over the last 7 days by site?' },
                    { label: 'Bixby brief', prompt: 'Give me a short ops brief for the Bixby site right now.', skipFastPath: true },
                    { label: 'Fault narrative', prompt: 'Which recent flights had faults, and what should ops check first?', skipFastPath: true },
                ],
            },
        },
    },

    colors: {
        primary: '#0B3A5C',
        secondary: '#F15A22',
        accent: '#3B82F6',
        charcoal: '#0F172A',
        warning: '#D97706',
        danger: '#DC2626',
        bgBase: '#0B0B0B',
        bgSurface: '#161616',
    },

    typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        headingWeight: '900',
        headingTracking: '-0.05em',
    },

    navigation: {
        hideScholarshipNav: true,
        links: [
            { label: 'Overview', href: '#news' },
            { label: 'Sites', href: '#sites' },
            { label: 'Ops portal', href: '#staff-login' },
            { label: 'About', href: '#about' },
        ],
    },

    hero: {
        backgroundImage: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1920&q=80',
        mainHeading: 'OK 3D DRONE',
        subHeading: 'Mesonet UAS profiles from Kessler and Bixby — flight health, airspace, and NWS delivery in one ops view.',
        ctaButtons: {
            primary: 'Open ops portal',
        },
    },

    drone: {
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&q=80',
        label: 'Mesonet profile UAS',
        caption: 'Representative airframe used for OK 3D vertical sounding missions.',
    },

    footer: {
        address: 'Oklahoma 3D Mesonet — Norman, OK',
        phone: '(405) 325-2541',
        quickLinks: [
            { label: 'Kibana space', href: 'https://gawdzilla-0d3e9e.kb.us-east-2.aws.elastic-cloud.com/s/ok3d-uas' },
            { label: 'Overview dashboard', href: '#kibana-overview' },
            { label: 'Privacy', href: '#privacy' },
        ],
        socialMedia: [
            { platform: 'TW', href: '#twitter', label: 'Twitter' },
            { platform: 'LI', href: '#linkedin', label: 'LinkedIn' },
        ],
    },

    elastic: {
        agentId: 'mesonet-flight-analyst',
        kibanaUrl: 'https://gawdzilla-0d3e9e.kb.us-east-2.aws.elastic-cloud.com',
        kibanaSpace: 'ok3d-uas',
        indexes: {
            flights: 'uas-flights',
            telemetry: 'uas-telemetry',
            boundaries: 'uas-boundaries',
            profiles: 'uas-profiles',
            remoteId: 'remoteid-detections',
            adsb: 'adsb-traffic',
            nwsAlerts: 'nws-alerts',
            mesonet: 'mesonet-obs',
        },
        sites: [
            { id: 'kaefs', label: 'Kessler (kaefs)' },
            { id: 'bixby', label: 'Bixby' },
        ],
        dashboards: [
            { title: 'OK3D Overview', id: 'ok3d-overview-dashboard' },
            { title: '3D Mesonet Operations', id: 'ok3d-ops-dashboard' },
            { title: 'Airspace & alerts', id: 'ok3d-airspace-dashboard' },
            { title: 'Delivery SLA', id: 'ok3d-delivery-dashboard' },
            { title: '3D Mesonet Science', id: 'ok3d-science-dashboard' },
        ],
    },

    news: [
        {
            category: 'Operations',
            title: 'Kessler and Bixby Profile Flights Indexed Live',
            description: 'Flight summaries, battery minima, and fault flags stream into uas-flights for ops review.',
            image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80',
        },
        {
            category: 'Airspace',
            title: 'Remote ID and ADS-B Context Beside the Operating Volume',
            description: 'Detections near Mesonet sites help narrate conflicts before the next sounding.',
            image: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=800&q=80',
        },
        {
            category: 'Delivery',
            title: 'NWS Delivery Latency Tracked Per Site',
            description: 'Average and p95 profile delivery times support the 3D Mesonet SLA story.',
            image: 'https://images.unsplash.com/photo-1534088568595-a066f41045a9?w=800&q=80',
        },
    ],

    login: {
        headline: 'Sign in to review flights, airspace, and NWS delivery for OK 3D sites.',
        ssoButtonLabel: 'Continue with campus SSO',
        features: [
            'Live flight KPIs beside the airframe photo',
            'Flight-area map for Kessler and Bixby operating volumes',
            'Remote ID / airspace detections near Mesonet sites',
            'NWS delivery SLA by site',
            'Ask the Mesonet Flight Analyst about inversions and faults',
        ],
    },
};
