/**
 * Shared UI helpers for ghoststudents staff portal.
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
 * @returns {Record<string, Array<{title: string, id: string}>>}
 */
export function getGhostDashboards(template) {
    const dashboards = template?.elastic?.dashboards;
    if (!dashboards) return {};
    if (Array.isArray(dashboards)) return { all: dashboards };
    return dashboards;
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
export function kibanaCasesHref(template) {
    return `${kibanaSpaceBase(template)}/app/security/cases`;
}

/**
 * @param {Object} template
 * @returns {string}
 */
export function kibanaAgentHref(template) {
    const agentId = template?.elastic?.agentId || 'rrp-aid-integrity';
    return `${kibanaSpaceBase(template)}/app/agent_builder/chat/${agentId}`;
}

export const GHOST_CARD_CLASS = 'bg-white/90 backdrop-blur-md border border-blue-200/70 rounded-2xl shadow-[0_8px_24px_rgba(11,61,145,0.12)]';

/**
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatUsd(value) {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(Number(value));
}
