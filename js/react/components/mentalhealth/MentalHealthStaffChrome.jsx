/**
 * MentalHealthStaffChrome — shared header, nav, and footer for ODMHSAS staff views.
 */

import { useContext } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import { getSchemaLabels } from '../../../config/schemaConfig.js';

export default function MentalHealthStaffChrome({ onLogout, children, tabs, activeTab, onTabChange }) {
    const template = useContext(TemplateContext);
    const schemaLabels = getSchemaLabels(template);
    const primaryColor = template?.colors?.primary || '#003366';
    const staff = template?.content?.staffDashboard || {};
    const isGhostStudents = template?.id === 'ghoststudents';

    return (
        <div className={`w-full min-h-screen ${isGhostStudents ? 'ghoststudents-shell' : 'bg-white'}`}>
            <header className={`${isGhostStudents ? 'ghoststudents-header' : 'bg-[#1a2332]'} text-white py-2`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-end items-center gap-4">
                        <span className="text-sm font-semibold">{schemaLabels.dashboardStaff}</span>
                        {onLogout && (
                            <button
                                type="button"
                                onClick={onLogout}
                                className="px-4 py-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <nav className={`${isGhostStudents ? 'ghoststudents-nav' : 'bg-white'} border-b border-gray-200`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20 gap-4">
                        <div className="flex items-center min-w-0">
                            <img
                                src={template.branding.logo}
                                alt={template.branding.institutionName}
                                className="h-12 w-auto"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        {tabs?.length > 0 && (
                            <div className="hidden lg:flex items-center gap-1 flex-wrap justify-end">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => onTabChange?.(tab.id)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                            activeTab === tab.id
                                                ? 'text-white shadow-md'
                                                : 'text-gray-700 hover:bg-blue-50'
                                        }`}
                                        style={activeTab === tab.id ? { backgroundColor: primaryColor } : undefined}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {tabs?.length > 0 && (
                        <div className="lg:hidden flex flex-wrap gap-2 pb-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => onTabChange?.(tab.id)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                                        activeTab === tab.id ? 'text-white' : 'text-gray-700 border border-gray-300'
                                    }`}
                                    style={activeTab === tab.id ? { backgroundColor: primaryColor } : undefined}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            <section className={`py-8 ${isGhostStudents ? 'ghoststudents-main' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <h2
                        className="text-3xl md:text-4xl font-bold mb-2 tracking-tighter"
                        style={{ fontFamily: 'var(--font-family)', color: primaryColor }}
                    >
                        {staff.pageTitle || schemaLabels.dashboardStaff}
                    </h2>
                    {staff.subtitle && (
                        <p className={`mb-8 ${isGhostStudents ? 'text-blue-900/70' : 'text-gray-600'}`}>{staff.subtitle}</p>
                    )}
                    {children}
                </div>
            </section>

            <footer className={`${isGhostStudents ? 'ghoststudents-footer' : 'bg-[#1a2332]'} text-white`}>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <p className={`text-center text-sm ${isGhostStudents ? 'text-white/85' : 'text-gray-400'}`}>
                        © 2026 {template.branding.institutionName}. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
