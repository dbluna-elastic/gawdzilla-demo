/**
 * Ok3dStaffPortal — tabbed OK 3D UAS ops portal after demo login.
 */

import { useContext, useMemo, useState } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import ChatWidget from '../ChatWidget.jsx';
import TexasCollegeStaffChrome from '../texascollege/TexasCollegeStaffChrome.jsx';
import Ok3dOverviewPanel from './Ok3dOverviewPanel.jsx';
import Ok3dFlightsPanel from './Ok3dFlightsPanel.jsx';
import Ok3dAirspacePanel from './Ok3dAirspacePanel.jsx';
import Ok3dDeliveryPanel from './Ok3dDeliveryPanel.jsx';

/**
 * @param {{ onLogout: () => void }} props
 */
export default function Ok3dStaffPortal({ onLogout }) {
    const template = useContext(TemplateContext);
    const tabLabels = template?.content?.staffDashboard?.tabs || {};
    const staff = template?.content?.staffDashboard || {};
    const agentId = template?.elastic?.agentId || 'mesonet-flight-analyst';
    const sites = template?.elastic?.sites || [
        { id: 'kaefs', label: 'Kessler (kaefs)' },
        { id: 'bixby', label: 'Bixby' },
    ];
    const kibanaUrl = (template?.elastic?.kibanaUrl || '').replace(/\/$/, '');
    const kibanaSpace = template?.elastic?.kibanaSpace || 'ok3d-uas';
    const dashboards = template?.elastic?.dashboards || [];
    const primaryColor = template?.colors?.primary || '#0B3A5C';

    const tabs = useMemo(() => ([
        { id: 'overview', label: tabLabels.overview || 'Overview' },
        { id: 'flights', label: tabLabels.flights || 'Flights' },
        { id: 'airspace', label: tabLabels.airspace || 'Airspace' },
        { id: 'delivery', label: tabLabels.delivery || 'Delivery' },
    ]), [tabLabels.overview, tabLabels.flights, tabLabels.airspace, tabLabels.delivery]);

    const [activeTab, setActiveTab] = useState('overview');
    const [siteId, setSiteId] = useState('all');

    const subtitleByTab = {
        overview: 'Drone stats, last flight, and operating volumes for Kessler and Bixby.',
        flights: 'Recent profile flights with altitude, battery, faults, and delivery latency.',
        airspace: 'Remote ID detections and ADS-B context near Mesonet sites.',
        delivery: 'NWS profile delivery SLA over the last 7 days.',
    };

    return (
        <>
            <TexasCollegeStaffChrome
                onLogout={onLogout}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                subtitle={subtitleByTab[activeTab] || staff.subtitle}
            >
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Site
                        </span>
                        <button
                            type="button"
                            onClick={() => setSiteId('all')}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                                siteId === 'all' ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                            }`}
                            style={siteId === 'all' ? { backgroundColor: primaryColor } : undefined}
                        >
                            All
                        </button>
                        {sites.map((site) => (
                            <button
                                key={site.id}
                                type="button"
                                onClick={() => setSiteId(site.id)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                                    siteId === site.id ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                }`}
                                style={siteId === site.id ? { backgroundColor: primaryColor } : undefined}
                            >
                                {site.label || site.id}
                            </button>
                        ))}
                    </div>

                    {kibanaUrl && dashboards.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {dashboards.slice(0, 3).map((dash) => (
                                <a
                                    key={dash.id}
                                    href={`${kibanaUrl}/s/${kibanaSpace}/app/dashboards#/view/${dash.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                                >
                                    Kibana · {dash.title}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {activeTab === 'overview' && <Ok3dOverviewPanel siteId={siteId} />}
                {activeTab === 'flights' && <Ok3dFlightsPanel siteId={siteId} />}
                {activeTab === 'airspace' && <Ok3dAirspacePanel siteId={siteId} />}
                {activeTab === 'delivery' && <Ok3dDeliveryPanel />}
            </TexasCollegeStaffChrome>

            <ChatWidget key={agentId} floating agentId={agentId} />
        </>
    );
}
