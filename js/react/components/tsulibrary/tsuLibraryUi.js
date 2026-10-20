/**
 * Shared UI helpers for the Texas State Libraries receipts portal.
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
export function getTsuDashboards(template) {
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
export function kibanaAgentHref(template) {
    const agentId = template?.elastic?.agentId || 'library-receipts-assistant';
    return `${kibanaSpaceBase(template)}/app/agent_builder/chat/${agentId}`;
}

export const TSU_CARD_CLASS = 'bg-white border border-[#e8e0d4] rounded-2xl shadow-sm';

/**
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatUsd(value) {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(Number(value));
}

/**
 * @param {string|string[]|null|undefined} tags
 * @returns {string}
 */
export function formatTags(tags) {
    if (Array.isArray(tags)) return tags.filter(Boolean).join(', ') || '—';
    if (typeof tags === 'string' && tags.trim()) return tags;
    return '—';
}

/**
 * @param {string} status
 * @returns {string}
 */
export function reviewBadgeClass(status) {
    const key = String(status || '').toLowerCase();
    if (key === 'approved') return 'bg-emerald-100 text-emerald-900';
    if (key === 'flagged' || key === 'flag') return 'bg-amber-100 text-amber-900';
    if (key === 'pending_review' || key === 'pending') return 'bg-rose-100 text-rose-900';
    return 'bg-stone-100 text-stone-700';
}
