/**
 * FW City Utilities — SCADA water executive dashboard (dashboard-first).
 * Data: fw-site-status, metrics-fw_ot.process-* in Kibana space fw-scada-water (gawdzilla).
 * UI branding stays generic “FW”; cluster labels may still say fort-wayne under the hood.
 */
export const fwscadaTemplate = {
    id: 'fwscada',
    name: 'FW City Utilities SCADA',

    schema: 'agency',

    branding: {
        institutionName: 'FW City Utilities',
        tagline: 'Operational awareness for water & wastewater SCADA',
        logo: '/logo-fwscada.svg',
    },

    schemaLabels: {
        dashboardStaff: 'FW SCADA Executive View',
        staffRole: 'operations',
    },

    content: {
        heroTitle: 'Facilities & Incident',
        heroSubtitle: 'One-stop executive view of site health, process trends, and active alerts.',
        ctaText: 'Open Kibana',
        welcomeMessage: 'FW City Utilities SCADA',
        chatBubbleText: 'Ask about sites in alarm or process trends',
        chatAssistantTitle: 'SCADA Ops Assistant',
        chatAssistantSubtitle: 'Ask about site status, wet-well risk, chlorine/turbidity, or active alerts.',
        chatAssistantEmptyBody: 'Ask which sites are in alarm, how process tags are trending, or what the facilities map is showing.',
        chatAssistantEmptyTry: 'Tap * below for demo queries',
        staffDashboard: {
            pageTitle: 'FW — Facilities & Incident',
            subtitle: 'Live KPIs from SCADA site status and OT process metrics.',
        },
        chat: {
            samplePromptsByAgent: {
                'elastic-ai-agent': [
                    { label: 'Sites in alarm', prompt: 'Which FW SCADA sites are currently in red or amber status, and why?' },
                    { label: 'Wet-well risk', prompt: 'Summarize wet-well levels and overflow risk at Anthony Boulevard Lift Station.' },
                    { label: 'Plant quality', prompt: 'How are chlorine residual and filtered turbidity trending at Three Rivers?' },
                    { label: 'By site type', prompt: 'Break down site status by type (lift stations, wells, tanks, boosters, plants).' },
                    { label: 'Security signals', prompt: 'Which sites show security alert counts, and what does that suggest for the incident narrative?' },
                    { label: 'Executive brief', prompt: 'Give me a short executive brief of system health for FW City Utilities right now.', skipFastPath: true },
                ],
            },
        },
    },

    colors: {
        primary: '#0F766E',
        secondary: '#134E4A',
        accent: '#14B8A6',
        charcoal: '#0B1220',
        warning: '#D97706',
        danger: '#DC2626',
        bgBase: '#07141A',
        bgSurface: '#0F2430',
    },

    typography: {
        fontFamily: "'IBM Plex Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        headingFontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
        headingWeight: '800',
        headingTracking: '-0.02em',
    },

    navigation: {
        links: [
            { label: 'Facilities', href: '#facilities' },
            { label: 'Alerts', href: '#alerts' },
            { label: 'Sites', href: '#sites' },
            { label: 'Kibana', href: '#kibana' },
        ],
    },

    elastic: {
        agentId: 'elastic-ai-agent',
        kibanaUrl: 'https://gawdzilla-0d3e9e.kb.us-east-2.aws.elastic-cloud.com',
        kibanaSpace: 'fw-scada-water',
        siteStatusIndex: 'fw-site-status',
        processIndex: 'metrics-fw_ot.process-*',
        dashboards: {
            primary: [
                {
                    title: 'Facilities & Incident',
                    id: 'fw-facilities-incident',
                },
                {
                    title: 'Executive Dashboard',
                    id: 'fw-executive-dashboard',
                },
                {
                    title: 'SCADA overview',
                    id: 'fw-scada-overview',
                },
            ],
            secondary: [
                { title: 'GIS operations', id: 'fw-gis-operations' },
                { title: 'Ignition diagnostics', id: 'fw-ignition-diagnostics' },
                { title: 'CIS operations', id: 'fw-cis-operations' },
                { title: 'Ingest overview', id: 'fw-ingest-overview' },
                { title: 'Plant host (WPCP)', id: 'fw-plant-host' },
                { title: 'Backhaul radio', id: 'fw-backhaul-radio-status' },
            ],
        },
        processSeries: [
            {
                id: 'wet-well',
                label: 'Wet-well — Anthony Blvd LS',
                siteId: 'fw-ls-anthony-boulevard',
                tagName: 'wet_well_level',
                unit: 'ft',
            },
            {
                id: 'chlorine',
                label: 'Chlorine residual — Three Rivers',
                siteId: 'fw-plant-three-rivers',
                tagName: 'chlorine_residual',
                unit: 'mg/L',
            },
            {
                id: 'turbidity',
                label: 'Filtered turbidity — Three Rivers',
                siteId: 'fw-plant-three-rivers',
                tagName: 'filtered_turbidity',
                unit: 'NTU',
            },
        ],
    },

    footer: {
        address: 'FW City Utilities Operations Center',
        phone: '(555) 555-0199',
        quickLinks: [
            { label: 'Kibana space', href: '#kibana' },
            { label: 'Facilities map', href: '#facilities' },
        ],
    },
};
