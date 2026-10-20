/**
 * TsuLibraryStaffPortal — library receipts operations portal.
 */

import { useContext, useState } from 'react';
import { TemplateContext } from '../context/TemplateContext.jsx';
import ChatWidget from './ChatWidget.jsx';
import MentalHealthStaffChrome from './mentalhealth/MentalHealthStaffChrome.jsx';
import TsuLibraryPanel from './tsulibrary/TsuLibraryPanel.jsx';

export default function TsuLibraryStaffPortal({ onLogout }) {
    const template = useContext(TemplateContext);
    const tabLabels = template?.content?.staffDashboard?.tabs || {};
    const agentId = template?.elastic?.agentId || 'library-receipts-assistant';
    const [activeTab, setActiveTab] = useState('search');

    const tabs = [
        { id: 'search', label: tabLabels.search || 'Search' },
        { id: 'upload', label: tabLabels.upload || 'Upload' },
        { id: 'review', label: tabLabels.review || 'Review' },
        { id: 'analyze', label: tabLabels.analyze || 'Analyze' },
    ];

    return (
        <>
            <MentalHealthStaffChrome
                onLogout={onLogout}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            >
                <TsuLibraryPanel activeTab={activeTab} />
            </MentalHealthStaffChrome>
            <ChatWidget floating agentId={agentId} />
        </>
    );
}
