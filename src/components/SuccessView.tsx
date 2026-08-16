import React, { useState, useEffect, useCallback } from 'react';
import { CreateFormResponse, SheetSyncResult } from '../types';
import { getAccessToken } from '../lib/auth';
import { copyTextToClipboard } from '../lib/clipboard';
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  RotateCcw,
  QrCode,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Table,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';

interface SuccessViewProps {
  formData: CreateFormResponse;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ formData, onReset }) => {
  const [copiedFormLink, setCopiedFormLink] = useState(false);
  const [copiedSheetLink, setCopiedSheetLink] = useState(false);
  const [showIframe, setShowIframe] = useState(true);

  // Google Sheets Responses State
  const [syncResult, setSyncResult] = useState<SheetSyncResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const spreadsheetUrl =
    formData.spreadsheetUrl ||
    (formData.spreadsheetId
      ? `https://docs.google.com/spreadsheets/d/${formData.spreadsheetId}/edit`
      : undefined);

  const copyFormLink = async () => {
    if (formData.responderUri) {
      await copyTextToClipboard(formData.responderUri);
      setCopiedFormLink(true);
      setTimeout(() => setCopiedFormLink(false), 2500);
    }
  };

  const copySheetLink = async () => {
    if (spreadsheetUrl) {
      await copyTextToClipboard(spreadsheetUrl);
      setCopiedSheetLink(true);
      setTimeout(() => setCopiedSheetLink(false), 2500);
    }
  };

  // Sync Form Responses to Google Sheet
  const handleSyncResponses = useCallback(async () => {
    if (!formData.formId || !formData.spreadsheetId) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('OAuth token expired. Please re-authenticate.');
      }

      const response = await fetch('/api/forms/sync-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formId: formData.formId,
          spreadsheetId: formData.spreadsheetId,
          formTitle: formData.title,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to sync form responses to Google Sheet.');
      }

      setSyncResult(resData.data);
      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('Error syncing responses:', err);
      setSyncError(err.message || 'Could not sync responses to Google Sheet.');
    } finally {
      setIsSyncing(false);
    }
  }, [formData.formId, formData.spreadsheetId, formData.title]);

  // Initial fetch of sheet data on load if spreadsheet exists
  useEffect(() => {
    if (formData.spreadsheetId) {
      handleSyncResponses();
    }
  }, [formData.spreadsheetId, handleSyncResponses]);

  // Generate QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    formData.responderUri
  )}`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner Celebration */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center shadow-xs space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
              Form &amp; Google Sheet Created
            </span>
            {formData.spreadsheetId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Responses Stored in Google Sheet</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formData.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your document has been converted into a live Google Form and connected to a Google Sheet with the exact same name to store all form responses.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Live Form Link */}
          <a
            id="btn-open-live-form"
            href={formData.responderUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>Open Live Google Form</span>
          </a>

          {/* Connected Google Sheet Link */}
          {spreadsheetUrl && (
            <a
              id="btn-open-google-sheet"
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Open Google Sheet ({formData.title})</span>
            </a>
          )}

          {/* Edit Form Link */}
          <a
            id="btn-edit-google-form"
            href={formData.editUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
          >
            <Edit3 className="w-4 h-4 text-slate-600" />
            <span>Edit in Google Forms</span>
          </a>

          {/* Copy Link Button */}
          <button
            id="btn-copy-form-link"
            type="button"
            onClick={copyFormLink}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copiedFormLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Form Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Form Link</span>
              </>
            )}
          </button>
        </div>

        {/* Live Responder & Sheet Link Box */}
        <div className="pt-2 max-w-2xl mx-auto space-y-2">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-left">
            <span className="text-xs font-semibold text-slate-700 shrink-0">Form:</span>
            <span className="text-[11px] font-mono text-slate-600 truncate flex-1 select-all font-medium">
              {formData.responderUri}
            </span>
            <button
              onClick={copyFormLink}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copiedFormLink ? 'Copied' : 'Copy'}
            </button>
          </div>

          {spreadsheetUrl && (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-left">
              <span className="text-xs font-bold text-emerald-800 shrink-0 flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                Sheet:
              </span>
              <span className="text-[11px] font-mono text-emerald-900 truncate flex-1 select-all font-medium">
                {spreadsheetUrl}
              </span>
              <button
                onClick={copySheetLink}
                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                {copiedSheetLink ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Sheets Response Storage Card */}
      {formData.spreadsheetId && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Google Sheet Responses Storage
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Responses submitted to your Google Form are stored directly in this Google Sheet named{' '}
                <strong className="text-slate-800 font-semibold">&ldquo;{formData.title}&rdquo;</strong>.
              </p>
            </div>

            {/* Sync / Refresh Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                id="btn-sync-responses"
                type="button"
                onClick={handleSyncResponses}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Form Responses'}</span>
              </button>

              {spreadsheetUrl && (
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Sheet</span>
                </a>
              )}
            </div>
          </div>

          {/* Sync Stats & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500">Spreadsheet Name</span>
              <p className="text-xs font-bold text-slate-900 truncate" title={formData.title}>
                {formData.title}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500">Responses Recorded</span>
              <p className="text-xs font-bold text-slate-900">
                {syncResult ? `${syncResult.totalResponses} submissions` : 'Checking...'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500">Last Synced</span>
              <p className="text-xs font-bold text-slate-900">
                {lastSyncedAt ? `${lastSyncedAt}` : 'Just now'}
              </p>
            </div>
          </div>

          {syncError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {syncError}
            </div>
          )}

          {/* Live Data Table Preview */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-slate-500" />
                Sheet Data Preview (Tab: Form Responses 1)
              </span>
              <span className="text-[11px] text-slate-500">
                Columns match all form questions
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
              {syncResult && syncResult.headers && syncResult.headers.length > 0 ? (
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 font-bold text-slate-800">
                      <tr>
                        {syncResult.headers.map((hdr, hIdx) => (
                          <th key={hIdx} className="px-4 py-2.5 whitespace-nowrap bg-slate-100">
                            {hdr}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {syncResult.rows && syncResult.rows.length > 0 ? (
                        syncResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-slate-800">
                                {cell || <span className="text-slate-300 italic">Empty</span>}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={syncResult.headers.length}
                            className="px-4 py-8 text-center text-slate-500 space-y-1.5"
                          >
                            <p className="font-semibold text-slate-700">
                              No submissions received yet in Google Forms.
                            </p>
                            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                              Test out submitting a response in the live preview below, then click{' '}
                              <strong className="text-slate-800">&ldquo;Sync Form Responses&rdquo;</strong> to store it in your Google Sheet.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  <p>Loading sheet columns and response records...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid: QR Code & Live Form Frame Preview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: QR Code & Share Card */}
        <div className="md:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 self-start">
            <QrCode className="w-4 h-4 text-slate-800" />
            <span>Scan on Mobile</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <img
              src={qrCodeUrl}
              alt="Scan QR code to open Google Form"
              className="w-36 h-36 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Scan this QR code with any smartphone camera to instantly test filling out the form on mobile.
          </p>

          <div className="w-full pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Form ID</span>
              <span className="font-mono text-[10px] text-slate-800 truncate max-w-[140px]">
                {formData.formId}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Total Questions</span>
              <span className="font-bold text-slate-900">{formData.itemCount}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Form Interactive Preview */}
        <div className="md:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-800" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Interactive Form Preview
              </span>
            </div>
            <button
              onClick={() => setShowIframe(!showIframe)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              {showIframe ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {showIframe ? (
            <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
              <iframe
                src={formData.responderUri}
                title="Live Google Form Preview"
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="w-full h-40 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-xs font-medium text-slate-400">
              Preview hidden. Click &ldquo;Show Preview&rdquo; above.
            </div>
          )}
        </div>
      </div>

      {/* Prominent Reset Workflow Button */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-6 text-center space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Need to process another questionnaire or worksheet?
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Start fresh with a new document, image scan, or text prompt.
        </p>
        <button
          id="btn-convert-another"
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>Convert Another Document</span>
        </button>
      </div>
    </div>
  );
};
