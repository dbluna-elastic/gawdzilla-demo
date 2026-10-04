/**
 * GhostStudentsStaffPortal — Aid integrity investigator operations portal.
 */

import { useContext } from 'react';
import { TemplateContext } from '../context/TemplateContext.jsx';
import ChatWidget from './ChatWidget.jsx';
import MentalHealthStaffChrome from './mentalhealth/MentalHealthStaffChrome.jsx';
import GhostStudentsPanel from './ghoststudents/GhostStudentsPanel.jsx';

export default function GhostStudentsStaffPortal({ onLogout }) {
    const template = useContext(TemplateContext);
    const tabLabels = template?.content?.staffDashboard?.tabs || {};
    const agentId = template?.elastic?.agentId || 'rrp-aid-integrity';

    const tabs = [
        { id: 'intelligence', label: tabLabels.intelligence || 'Aid Integrity' },
    ];

    return (
        <>
            <MentalHealthStaffChrome
                onLogout={onLogout}
                tabs={tabs}
                activeTab="intelligence"
                onTabChange={() => {}}
            >
                <GhostStudentsPanel />
            </MentalHealthStaffChrome>
            <ChatWidget floating agentId={agentId} />
        </>
    );
}
