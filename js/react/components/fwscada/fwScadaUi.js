/**
 * Shared UI helpers for the FW SCADA executive dashboard.
 */

/**
 * @param {Object} template
 * @returns {string}
 */
export function kibanaSpaceBase(template) {
    const base = (template?.elastic?.kibanaUrl || '').replace(/\/$/, '');
    const space = template?.elastic?.kibanaSpace;
    if (space) return `${base}/s/${space}`;
    return base;
}

/**
 * @param {Object} template
 * @returns {{ primary: Array<{title: string, id: string}>, secondary: Array<{title: string, id: string}> }}
 */
export function getFwDashboards(template) {
    const dashboards = template?.elastic?.dashboards || {};
    return {
        primary: Array.isArray(dashboards.primary) ? dashboards.primary : [],
        secondary: Array.isArray(dashboards.secondary) ? dashboards.secondary : [],
    };
}

/**
 * @param {Object} template
 * @param {string} id
 * @returns {string}
 */
export function kibanaDashboardHref(template, id) {
    return `${kibanaSpaceBase(template)}/app/dashboards#/view/${id}`;
}

/**
 * @param {Object} template
 * @returns {string}
 */
export function kibanaAgentHref(template) {
    const agentId = template?.elastic?.agentId || 'elastic-ai-agent';
    return `${kibanaSpaceBase(template)}/app/agent_builder/chat/${agentId}`;
}

export const FW_CARD_CLASS =
    'bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]';

/**
 * @param {string} status
 * @returns {string}
 */
export function statusColor(status) {
    if (status === 'red' || status === 'critical') return '#DC2626';
    if (status === 'amber' || status === 'warning' || status === 'degraded') return '#D97706';
    if (status === 'green' || status === 'normal') return '#10B981';
    return '#94A3B8';
}

/**
 * @param {string} type
 * @returns {string}
 */
export function formatSiteType(type) {
    if (!type) return '—';
    return String(type).replace(/_/g, ' ');
}
