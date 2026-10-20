/**
 * TsuLibraryPanel — Search / Upload / Review / Analyze for library receipts.
 */

import { useCallback, useContext, useEffect, useState } from 'react';
import { TemplateContext } from '../../context/TemplateContext.jsx';
import {
    getTsuOverviewStats,
    getTsuSpendByVendor,
    getTsuSpendByFund,
    getTsuSpendByDepartment,
    getTsuTaggedExceptions,
} from '../../../modules/utils/tsuLibraryEsqlQueries.js';
import {
    searchLibraryReceipts,
    listPendingReceipts,
    setReceiptReviewStatus,
    uploadLibraryReceipt,
} from '../../../modules/utils/tsuLibrarySearch.js';
import {
    TSU_CARD_CLASS,
    formatTags,
    formatUsd,
    getTsuDashboards,
    kibanaDashboardHref,
    reviewBadgeClass,
} from './tsuLibraryUi.js';

const MODES = [
    { id: 'exact', label: 'Exact' },
    { id: 'keyword', label: 'Keyword' },
    { id: 'semantic', label: 'Semantic' },
    { id: 'hybrid', label: 'Hybrid' },
];

/**
 * @param {Object} props
 * @param {string} props.activeTab
 */
export default function TsuLibraryPanel({ activeTab = 'search' }) {
    const template = useContext(TemplateContext);
    const primaryColor = template?.colors?.primary || '#501214';
    const staff = template?.content?.staffDashboard || {};
    const seeded = template?.elastic?.seededEntities || {};
    const defaultFy = template?.search?.defaultFilters?.fiscalYear || 'FY2026';

    const [query, setQuery] = useState('');
    const [mode, setMode] = useState(template?.search?.defaultMode || 'hybrid');
    const [filters, setFilters] = useState({
        fiscalYear: defaultFy,
        department: '',
        vendor: '',
        reviewStatus: '',
        amountMin: '',
        amountMax: '',
    });
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [searchNote, setSearchNote] = useState('');
    const [selected, setSelected] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const [reviewer, setReviewer] = useState('');
    const [pending, setPending] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [reviewMsg, setReviewMsg] = useState('');

    const [uploadResult, setUploadResult] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const [stats, setStats] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [funds, setFunds] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [exceptions, setExceptions] = useState([]);
    const [analyzeLoading, setAnalyzeLoading] = useState(false);
    const [analyzeError, setAnalyzeError] = useState(null);

    const runSearch = useCallback(async (qOverride, modeOverride) => {
        const q = (qOverride ?? query).trim();
        if (!q) {
            setResults([]);
            setTotal(0);
            setSearchNote('');
            return;
        }
        setSearching(true);
        setSearchError(null);
        try {
            const out = await searchLibraryReceipts(q, modeOverride ?? mode, filters);
            setResults(out.hits);
            setTotal(out.total);
            setSearchNote(out.note || '');
            if (out.hits[0]) setSelected(out.hits[0]);
        } catch (error) {
            setSearchError(error.message || staff.loadError || 'Search failed');
            setResults([]);
            setTotal(0);
        } finally {
            setSearching(false);
        }
    }, [query, mode, filters, staff.loadError]);

    const loadPending = useCallback(async () => {
        setPendingLoading(true);
        setReviewMsg('');
        try {
            const rows = await listPendingReceipts({ size: 50 });
            setPending(rows);
        } catch (error) {
            setReviewMsg(error.message || staff.loadError || 'Could not load pending queue');
            setPending([]);
        } finally {
            setPendingLoading(false);
        }
    }, [staff.loadError]);

    const loadAnalyze = useCallback(async () => {
        setAnalyzeLoading(true);
        setAnalyzeError(null);
        try {
            const [s, v, f, d, e] = await Promise.all([
                getTsuOverviewStats(),
                getTsuSpendByVendor(defaultFy, 10),
                getTsuSpendByFund(defaultFy, 8),
                getTsuSpendByDepartment(defaultFy, 8),
                getTsuTaggedExceptions(20),
            ]);
            setStats(s);
            setVendors(v);
            setFunds(f);
            setDepartments(d);
            setExceptions(e);
        } catch (error) {
            setAnalyzeError(error.message || staff.loadError || 'Could not load analytics');
        } finally {
            setAnalyzeLoading(false);
        }
    }, [defaultFy, staff.loadError]);

    useEffect(() => {
        if (activeTab === 'review') loadPending();
        if (activeTab === 'analyze') loadAnalyze();
    }, [activeTab, loadPending, loadAnalyze]);

    const applyChip = (text, nextMode) => {
        setQuery(text);
        if (nextMode) setMode(nextMode);
        runSearch(text, nextMode || mode);
    };

    const handleApprove = async (receipt, action = 'approve') => {
        if (!reviewer.trim()) {
            setReviewMsg('Enter approver name first.');
            return;
        }
        try {
            const result = await setReceiptReviewStatus(receipt.id, action, reviewer.trim());
            setReviewMsg(
                `${action === 'approve' ? 'Approved' : action === 'flag' ? 'Flagged' : 'Set pending'}: ${receipt.invoiceNumber || receipt.id}`
                + (result.review?.approved_at ? ` at ${result.review.approved_at}` : ''),
            );
            if (selected?.id === receipt.id) {
                setSelected({ ...selected, review: result.review });
            }
            setResults((prev) => prev.map((h) => (h.id === receipt.id ? { ...h, review: result.review } : h)));
            if (activeTab === 'review') loadPending();
        } catch (error) {
            setReviewMsg(error.message || 'Review update failed');
        }
    };

    const handleUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        setUploadResult(null);
        try {
            const data = await uploadLibraryReceipt(file);
            setUploadResult(data);
        } catch (error) {
            setUploadError(
                error.isUploadOffline
                    ? (staff.uploadOffline || error.message)
                    : (error.message || 'Upload failed'),
            );
        } finally {
            setUploading(false);
        }
    };

    const dashboards = getTsuDashboards(template);
    const spendDash = (dashboards.spend || dashboards.all || [])[0];

    return (
        <div className="space-y-6">
            <p className="text-xs text-[#6b5e4f]">
                Demo data only. Not real Texas State vendor or staff records. Fiscal years: Sept 1–Aug 31.
            </p>

            {activeTab === 'search' && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className={`${TSU_CARD_CLASS} p-5`}>
                        <div className="mb-4 flex flex-wrap gap-2">
                            {MODES.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setMode(m.id)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                        mode === m.id ? 'text-white' : 'border border-[#e8e0d4] text-[#4a4035]'
                                    }`}
                                    style={mode === m.id ? { backgroundColor: primaryColor } : undefined}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        <form
                            className="mb-4 flex flex-col gap-3 sm:flex-row"
                            onSubmit={(e) => {
                                e.preventDefault();
                                runSearch();
                            }}
                        >
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={staff.searchEmpty || 'Invoice number or purchase description'}
                                className="min-w-0 flex-1 rounded-xl border border-[#e8e0d4] px-3 py-2 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={searching}
                                className="rounded-full px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {searching ? 'Searching…' : 'Search'}
                            </button>
                        </form>

                        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                            <label className="text-xs text-[#6b5e4f]">
                                Fiscal year
                                <input
                                    className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-2 py-1.5 text-sm"
                                    value={filters.fiscalYear}
                                    onChange={(e) => setFilters((f) => ({ ...f, fiscalYear: e.target.value }))}
                                    placeholder="FY2026"
                                />
                            </label>
                            <label className="text-xs text-[#6b5e4f]">
                                Department
                                <input
                                    className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-2 py-1.5 text-sm"
                                    value={filters.department}
                                    onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
                                />
                            </label>
                            <label className="text-xs text-[#6b5e4f]">
                                Vendor
                                <input
                                    className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-2 py-1.5 text-sm"
                                    value={filters.vendor}
                                    onChange={(e) => setFilters((f) => ({ ...f, vendor: e.target.value }))}
                                />
                            </label>
                            <label className="text-xs text-[#6b5e4f]">
                                Review status
                                <select
                                    className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-2 py-1.5 text-sm"
                                    value={filters.reviewStatus}
                                    onChange={(e) => setFilters((f) => ({ ...f, reviewStatus: e.target.value }))}
                                >
                                    <option value="">Any</option>
                                    <option value="pending_review">Pending review</option>
                                    <option value="approved">Approved</option>
                                    <option value="flagged">Flagged</option>
                                </select>
                            </label>
                            <label className="text-xs text-[#6b5e4f]">
                                Amount min
                                <input
                                    type="number"
                                    className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-2 py-1.5 text-sm"
                                    value={filters.amountMin}
                                    onChange={(e) => setFilters((f) => ({ ...f, amountMin: e.target.value }))}
                                />
                            </label>
                            <label className="text-xs text-[#6b5e4f]">
                                Amount max
                                <input
                                    type="number"
                                    className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-2 py-1.5 text-sm"
                                    value={filters.amountMax}
                                    onChange={(e) => setFilters((f) => ({ ...f, amountMax: e.target.value }))}
                                />
                            </label>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                            {[
                                { label: 'Exact renewal', q: seeded.semanticRenewalInvoice || 'SPC-AAR-2025-091', m: 'exact' },
                                { label: 'Large DB', q: seeded.largeRenewalInvoice || 'KB-FY26-RENEW-0042', m: 'exact' },
                                { label: 'Duplicate', q: seeded.duplicateInvoice || 'MS-INV-77821', m: 'exact' },
                                { label: 'Tax', q: seeded.taxChargedInvoice || 'COM-984412', m: 'exact' },
                                {
                                    label: 'Semantic renewal',
                                    q: seeded.semanticQuery || 'annual access renewal for the journal database',
                                    m: 'hybrid',
                                },
                            ].map((chip) => (
                                <button
                                    key={chip.label}
                                    type="button"
                                    onClick={() => applyChip(chip.q, chip.m)}
                                    className="rounded-full border border-[#e8e0d4] px-3 py-1 text-xs font-semibold text-[#4a4035] hover:bg-[#faf7f2]"
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>

                        <label className="mb-4 block text-xs text-[#6b5e4f]">
                            Approver name (required to approve from results)
                            <input
                                className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-2 py-1.5 text-sm"
                                value={reviewer}
                                onChange={(e) => setReviewer(e.target.value)}
                                placeholder="Required to approve from results"
                                autoComplete="name"
                            />
                        </label>

                        {searchError && <p className="mb-3 text-sm text-red-700">{searchError}</p>}
                        {searchNote && <p className="mb-3 text-xs text-amber-800">{searchNote}</p>}
                        {reviewMsg && <p className="mb-3 text-sm text-[#4a4035]">{reviewMsg}</p>}

                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b5e4f]">
                            {total} result{total === 1 ? '' : 's'}
                        </p>
                        <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
                            {results.map((hit) => (
                                <li key={hit.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelected(hit)}
                                        className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                                            selected?.id === hit.id
                                                ? 'border-[#501214] bg-[#faf7f2]'
                                                : 'border-[#e8e0d4] bg-white hover:bg-[#faf7f2]'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-bold text-[#1b1b1b]">{hit.vendor}</p>
                                                <p className="font-mono text-xs text-[#6b5e4f]">{hit.invoiceNumber || '—'}</p>
                                            </div>
                                            <p className="font-bold" style={{ color: primaryColor }}>{formatUsd(hit.total)}</p>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#6b5e4f]">
                                            <span>{hit.receiptDate || '—'}</span>
                                            <span>{hit.fiscalYear || '—'}</span>
                                            <span className={`rounded-full px-2 py-0.5 font-semibold ${reviewBadgeClass(hit.review?.status)}`}>
                                                {hit.review?.status || '—'}
                                            </span>
                                            {hit.tags?.length > 0 && <span>{formatTags(hit.tags)}</span>}
                                        </div>
                                    </button>
                                </li>
                            ))}
                            {!searching && results.length === 0 && (
                                <li className="rounded-xl border border-dashed border-[#e8e0d4] px-4 py-8 text-center text-sm text-[#6b5e4f]">
                                    {staff.searchEmpty || 'Try an invoice number, or ask the way you’d describe the purchase.'}
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className={`${TSU_CARD_CLASS} p-5`}>
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em]" style={{ color: primaryColor }}>
                            Receipt detail
                        </h3>
                        {!selected ? (
                            <p className="text-sm text-[#6b5e4f]">Select a result to see extraction details.</p>
                        ) : (
                            <div className="space-y-3 text-sm text-[#1b1b1b]">
                                <p><span className="font-bold">Vendor:</span> {selected.vendor}</p>
                                <p><span className="font-bold">Invoice:</span> {selected.invoiceNumber || '—'}</p>
                                <p><span className="font-bold">Receipt id:</span> <span className="font-mono text-xs">{selected.receiptId}</span></p>
                                <p><span className="font-bold">Date / FY:</span> {selected.receiptDate || '—'} · {selected.fiscalYear || '—'}</p>
                                <p><span className="font-bold">Total / tax:</span> {formatUsd(selected.total)} / {formatUsd(selected.tax)}</p>
                                <p><span className="font-bold">Department / fund:</span> {selected.department || '—'} · {selected.fundCode || '—'}</p>
                                <p><span className="font-bold">Tags:</span> {formatTags(selected.tags)}</p>
                                <p>
                                    <span className="font-bold">Extraction:</span>{' '}
                                    {selected.extraction?.method || '—'}
                                    {selected.extraction?.ocr_confidence != null
                                        ? ` · OCR ${Number(selected.extraction.ocr_confidence).toFixed(2)}`
                                        : ''}
                                </p>
                                <p>
                                    <span className="font-bold">Review:</span>{' '}
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${reviewBadgeClass(selected.review?.status)}`}>
                                        {selected.review?.status || '—'}
                                    </span>
                                    {selected.review?.reviewer ? ` · ${selected.review.reviewer}` : ''}
                                    {selected.review?.approved_at ? ` · ${selected.review.approved_at}` : ''}
                                </p>
                                {selected.snippets?.length > 0 && (
                                    <div>
                                        <p className="font-bold">Highlight</p>
                                        <p className="mt-1 text-xs text-[#6b5e4f]" dangerouslySetInnerHTML={{ __html: selected.snippets[0] }} />
                                    </div>
                                )}
                                {selected.review?.status === 'pending_review' && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(selected, 'approve')}
                                            className="rounded-full px-4 py-2 text-xs font-bold text-white"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Approve expense
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(selected, 'flag')}
                                            className="rounded-full border border-amber-700 px-4 py-2 text-xs font-bold text-amber-900"
                                        >
                                            Flag
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'upload' && (
                <div className={`${TSU_CARD_CLASS} max-w-2xl p-6`}>
                    <h3 className="mb-2 text-lg font-bold" style={{ color: primaryColor }}>Collect a receipt</h3>
                    <p className="mb-4 text-sm text-[#6b5e4f]">
                        Upload a PDF or image. Extraction runs in the Texasstate-library FastAPI app (proxied at /api/tsu-library).
                    </p>
                    <input
                        type="file"
                        accept=".pdf,image/*,.eml,.msg"
                        disabled={uploading}
                        onChange={(e) => handleUpload(e.target.files?.[0])}
                        className="mb-4 block w-full text-sm"
                    />
                    {uploading && <p className="text-sm text-[#6b5e4f]">Uploading and extracting…</p>}
                    {uploadError && <p className="text-sm text-red-700">{uploadError}</p>}
                    {uploadResult && (
                        <div className="mt-4 space-y-2 rounded-xl border border-[#e8e0d4] bg-[#faf7f2] p-4 text-sm">
                            <p className="font-bold text-emerald-800">Status: {uploadResult.status}</p>
                            <p><span className="font-bold">Receipt id:</span> {uploadResult.receipt_id}</p>
                            <p><span className="font-bold">Vendor:</span> {uploadResult.vendor?.normalized || uploadResult.vendor?.name || '—'}</p>
                            <p><span className="font-bold">Date:</span> {uploadResult.receipt_date || '—'}</p>
                            <p><span className="font-bold">Total:</span> {formatUsd(uploadResult.amount?.total)}</p>
                            <p><span className="font-bold">Invoice:</span> {uploadResult.invoice_number || '—'}</p>
                            <p>
                                <span className="font-bold">Extraction:</span>{' '}
                                {uploadResult.extraction?.method || '—'}
                                {uploadResult.extraction?.ocr_confidence != null
                                    ? ` · OCR ${Number(uploadResult.extraction.ocr_confidence).toFixed(2)}`
                                    : ''}
                            </p>
                            <p><span className="font-bold">Review:</span> {uploadResult.review?.status || '—'}</p>
                            <p><span className="font-bold">Tags:</span> {formatTags(uploadResult.tags)}</p>
                            {uploadResult.review?.status === 'pending_review' && (
                                <p className="text-amber-900">{staff.reviewNeedsHuman}</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'review' && (
                <div className={`${TSU_CARD_CLASS} p-5`}>
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-bold" style={{ color: primaryColor }}>Pending review</h3>
                            <p className="text-sm text-[#6b5e4f]">{staff.reviewNeedsHuman}</p>
                        </div>
                        <label className="text-xs text-[#6b5e4f]">
                            Approver name
                            <input
                                className="mt-1 block w-56 rounded-lg border border-[#e8e0d4] px-2 py-1.5 text-sm"
                                value={reviewer}
                                onChange={(e) => setReviewer(e.target.value)}
                                autoComplete="name"
                            />
                        </label>
                    </div>
                    {reviewMsg && <p className="mb-3 text-sm text-[#4a4035]">{reviewMsg}</p>}
                    {pendingLoading ? (
                        <p className="text-sm text-[#6b5e4f]">Loading queue…</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-[#e8e0d4] text-xs uppercase tracking-wide text-[#6b5e4f]">
                                    <tr>
                                        <th className="px-2 py-2">Vendor</th>
                                        <th className="px-2 py-2">Invoice</th>
                                        <th className="px-2 py-2">Total</th>
                                        <th className="px-2 py-2">FY</th>
                                        <th className="px-2 py-2">Tags</th>
                                        <th className="px-2 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pending.map((row) => (
                                        <tr key={row.id} className="border-b border-[#f0ebe3]">
                                            <td className="px-2 py-2 font-semibold">{row.vendor}</td>
                                            <td className="px-2 py-2 font-mono text-xs">{row.invoiceNumber || '—'}</td>
                                            <td className="px-2 py-2">{formatUsd(row.total)}</td>
                                            <td className="px-2 py-2">{row.fiscalYear || '—'}</td>
                                            <td className="px-2 py-2 text-xs">{formatTags(row.tags)}</td>
                                            <td className="px-2 py-2">
                                                <div className="flex flex-wrap gap-1">
                                                    <button
                                                        type="button"
                                                        className="rounded-full px-3 py-1 text-xs font-bold text-white"
                                                        style={{ backgroundColor: primaryColor }}
                                                        onClick={() => handleApprove(row, 'approve')}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rounded-full border border-amber-700 px-3 py-1 text-xs font-bold text-amber-900"
                                                        onClick={() => handleApprove(row, 'flag')}
                                                    >
                                                        Flag
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pending.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-2 py-8 text-center text-[#6b5e4f]">
                                                No pending reviews found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'analyze' && (
                <div className="space-y-6">
                    {analyzeError && <p className="text-sm text-red-700">{analyzeError}</p>}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: 'FY2026 spend', value: analyzeLoading ? '…' : formatUsd(stats?.fy2026Spend) },
                            { label: 'Pending review', value: analyzeLoading ? '…' : (stats?.pendingReview?.toLocaleString() ?? '—') },
                            { label: 'Duplicates', value: analyzeLoading ? '…' : (stats?.duplicates?.toLocaleString() ?? '—') },
                            { label: 'Tax charged', value: analyzeLoading ? '…' : (stats?.taxCharged?.toLocaleString() ?? '—') },
                        ].map((kpi) => (
                            <div key={kpi.label} className={`${TSU_CARD_CLASS} border-t-4 p-4`} style={{ borderTopColor: primaryColor }}>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b5e4f]">{kpi.label}</p>
                                <p className="mt-2 text-2xl font-bold" style={{ color: primaryColor }}>{kpi.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <SpendTable title="Top vendors" rows={vendors} nameKey="vendor" primaryColor={primaryColor} />
                        <SpendTable title="By fund" rows={funds} nameKey="fund" primaryColor={primaryColor} />
                        <SpendTable title="By department" rows={departments} nameKey="department" primaryColor={primaryColor} />
                    </div>

                    <div className={`${TSU_CARD_CLASS} p-5`}>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-bold uppercase tracking-[0.12em]" style={{ color: primaryColor }}>
                                Tagged exceptions
                            </h3>
                            {spendDash && (
                                <a
                                    href={kibanaDashboardHref(template, spendDash.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full px-4 py-2 text-xs font-bold text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Open {spendDash.title}
                                </a>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-[#e8e0d4] text-xs uppercase tracking-wide text-[#6b5e4f]">
                                    <tr>
                                        <th className="px-2 py-2">Invoice</th>
                                        <th className="px-2 py-2">Vendor</th>
                                        <th className="px-2 py-2">Total</th>
                                        <th className="px-2 py-2">Tax</th>
                                        <th className="px-2 py-2">Tags</th>
                                        <th className="px-2 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exceptions.map((row) => (
                                        <tr key={`${row.receiptId}-${row.invoiceNumber}`} className="border-b border-[#f0ebe3]">
                                            <td className="px-2 py-2 font-mono text-xs">{row.invoiceNumber}</td>
                                            <td className="px-2 py-2">{row.vendor}</td>
                                            <td className="px-2 py-2">{formatUsd(row.total)}</td>
                                            <td className="px-2 py-2">{formatUsd(row.tax)}</td>
                                            <td className="px-2 py-2 text-xs">{formatTags(row.tags)}</td>
                                            <td className="px-2 py-2">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${reviewBadgeClass(row.reviewStatus)}`}>
                                                    {row.reviewStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {!analyzeLoading && exceptions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-2 py-8 text-center text-[#6b5e4f]">
                                                No tagged exceptions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SpendTable({ title, rows, nameKey, primaryColor }) {
    return (
        <div className={`${TSU_CARD_CLASS} p-4`}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em]" style={{ color: primaryColor }}>
                {title}
            </h3>
            <ul className="space-y-2 text-sm">
                {rows.map((row) => (
                    <li key={row[nameKey]} className="flex items-center justify-between gap-2 border-b border-[#f0ebe3] pb-2">
                        <span className="truncate font-semibold">{row[nameKey]}</span>
                        <span className="shrink-0 text-[#6b5e4f]">{formatUsd(row.spend)}</span>
                    </li>
                ))}
                {rows.length === 0 && <li className="text-[#6b5e4f]">No data</li>}
            </ul>
        </div>
    );
}
