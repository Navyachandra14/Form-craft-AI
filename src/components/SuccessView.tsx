import React, { useState, useEffect, useCallback } from 'react';
import { CreateFormResponse, SheetSyncResult, ParsedFormSchema } from '../types';
import { getAccessToken } from '../lib/auth';
import { copyTextToClipboard } from '../lib/clipboard';
import { generateGoogleAppsScript, getDefaultWorkflowSettings } from '../lib/workflowDefaults';
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
  UploadCloud,
  Sparkles,
  Zap,
  Code,
  MessageSquare,
  Mail,
  Sliders,
  Award,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Link2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface SuccessViewProps {
  formData: CreateFormResponse;
  schema?: ParsedFormSchema;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ formData, schema, onReset }) => {
  const [copiedFormLink, setCopiedFormLink] = useState(false);
  const [copiedSheetLink, setCopiedSheetLink] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showAppsScriptGuide, setShowAppsScriptGuide] = useState(false);
  const [activeScoringTierPreview, setActiveScoringTierPreview] = useState<'passed' | 'review' | 'failed'>('passed');
  const [showFullEmailPreview, setShowFullEmailPreview] = useState(false);
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

      {/* Automated Scoring Rules & Candidate Evaluation Summary View */}
      {(() => {
        const activeWorkflow = schema?.workflowSettings || getDefaultWorkflowSettings(formData.title);
        const generatedScript = generateGoogleAppsScript(activeWorkflow, formData.title);
        const totalQuestions = schema?.questions?.length || 0;
        const gradableQuestions = (schema?.questions || []).filter(
          (q) => q.type === 'RADIO' || q.type === 'CHECKBOX' || q.type === 'DROP_DOWN'
        ).length;

        const copyAppsScriptCode = async () => {
          await copyTextToClipboard(generatedScript);
          setCopiedScript(true);
          setTimeout(() => setCopiedScript(false), 2500);
        };

        const activeTemplate =
          activeScoringTierPreview === 'passed'
            ? activeWorkflow.passedTemplate
            : activeScoringTierPreview === 'review'
            ? activeWorkflow.reviewTemplate
            : activeWorkflow.failedTemplate;

        return (
          <div className="bg-white border border-indigo-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header with Title & Action Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
                    <Award className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Automated Candidate Scoring &amp; Evaluation Rules
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    Auto-Grading Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  Real-time scoring rules configured for this form. Responses entering Google Sheets are automatically graded against configured threshold gates, triggering color coding and conditional candidate communication.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-copy-apps-script-rules"
                  type="button"
                  onClick={copyAppsScriptCode}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Script Copied!' : 'Copy Apps Script'}</span>
                </button>
                <button
                  id="btn-toggle-apps-script-guide"
                  type="button"
                  onClick={() => setShowAppsScriptGuide(!showAppsScriptGuide)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-xs font-semibold text-indigo-800 transition-colors cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{showAppsScriptGuide ? 'Hide Trigger Guide' : 'Google Sheets Guide'}</span>
                </button>
              </div>
            </div>

            {/* Metric Matrix Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  Total Form Fields
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {totalQuestions} Questions {gradableQuestions > 0 && <span className="text-xs font-normal text-slate-500">({gradableQuestions} gradable)</span>}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Passing Benchmark
                </span>
                <p className="text-sm font-bold text-emerald-700">
                  &ge; {activeWorkflow.passThresholdPercent}%
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Review Margin
                </span>
                <p className="text-sm font-bold text-amber-700">
                  {activeWorkflow.reviewThresholdPercent}% &ndash; {activeWorkflow.passThresholdPercent - 1}%
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  Retake Cooldown
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {activeWorkflow.allowRetakes ? `${activeWorkflow.retakeCooldownHours || 24} Hours` : 'Single Attempt'}
                </p>
              </div>
            </div>

            {/* 3 Tier Rule Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Passed Tier Card */}
              <div
                onClick={() => setActiveScoringTierPreview('passed')}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-3.5 relative ${
                  activeScoringTierPreview === 'passed'
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-emerald-200 hover:bg-emerald-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Passed Gate (&ge;{activeWorkflow.passThresholdPercent}%)
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                    Green Tier
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-900">
                    Auto-Qualified for Next Step
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Applicant achieves a score at or above {activeWorkflow.passThresholdPercent}%. Status is recorded as <strong>&ldquo;PASSED&rdquo;</strong> in Google Sheets.
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-100 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sends Congratulations Letter</span>
                  </div>
                  {activeWorkflow.notificationChannels?.whatsappGroupUrl && (
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Includes WhatsApp Group Link</span>
                    </div>
                  )}
                  {activeWorkflow.notificationChannels?.googleMeetUrl && (
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium truncate">
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Includes Google Meet Interview</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Tier Card */}
              <div
                onClick={() => setActiveScoringTierPreview('review')}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-3.5 relative ${
                  activeScoringTierPreview === 'review'
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-amber-200 hover:bg-amber-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    Review Gate ({activeWorkflow.reviewThresholdPercent}% &ndash; {activeWorkflow.passThresholdPercent - 1}%)
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-md">
                    Amber Tier
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-900">
                    Manual QA Audit &amp; Hold
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Applicant falls into the borderline evaluation window. Row is highlighted in warm amber for interviewer verification.
                  </p>
                </div>

                <div className="pt-2 border-t border-amber-100 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                    <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Dispatches Under-Review Notice</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Queues candidate for staff review</span>
                  </div>
                </div>
              </div>

              {/* Failed / Reattempt Tier Card */}
              <div
                onClick={() => setActiveScoringTierPreview('failed')}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-3.5 relative ${
                  activeScoringTierPreview === 'failed'
                    ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-rose-200 hover:bg-rose-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Reattempt Notice (&lt;{activeWorkflow.reviewThresholdPercent}%)
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded-md">
                    Rose Tier
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-900">
                    Constructive Feedback &amp; Retake
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Applicant score is below {activeWorkflow.reviewThresholdPercent}%. Status is recorded as <strong>&ldquo;NEEDS_REVISION&rdquo;</strong> with retake instructions.
                  </p>
                </div>

                <div className="pt-2 border-t border-rose-100 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-rose-900 font-medium">
                    <Mail className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Sends feedback email</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-800 font-medium">
                    <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{activeWorkflow.allowRetakes ? `Retake enabled after ${activeWorkflow.retakeCooldownHours || 24}h` : 'Retakes disabled'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Candidate Communication Preview for Selected Tier */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      activeScoringTierPreview === 'passed'
                        ? 'bg-emerald-400 ring-4 ring-emerald-400/20'
                        : activeScoringTierPreview === 'review'
                        ? 'bg-amber-400 ring-4 ring-amber-400/20'
                        : 'bg-rose-400 ring-4 ring-rose-400/20'
                    }`}
                  />
                  <span className="font-bold text-sm text-white">
                    Candidate Email Notification Preview ({activeScoringTierPreview.toUpperCase()} TIER)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFullEmailPreview(!showFullEmailPreview)}
                    className="text-xs text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {showFullEmailPreview ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Collapse Preview</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Expand Message Body</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Email Envelope Preview */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3 font-sans text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 pb-2 border-b border-slate-800/80">
                  <div>
                    <span className="text-slate-500 font-semibold">Subject:</span>{' '}
                    <span className="text-slate-200 font-medium">
                      {activeTemplate.subject.replace(/\{\{form_title\}\}/g, formData.title)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Headline:</span>{' '}
                    <span className="text-slate-200 font-medium">
                      {activeTemplate.headline}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-300 leading-relaxed">
                  <p className="whitespace-pre-line">
                    {showFullEmailPreview
                      ? activeTemplate.body
                          .replace(/\{\{candidate_name\}\}/g, 'Alex Morgan')
                          .replace(/\{\{score_percent\}\}/g, activeScoringTierPreview === 'passed' ? '88%' : activeScoringTierPreview === 'review' ? '74%' : '56%')
                          .replace(/\{\{form_title\}\}/g, formData.title)
                          .replace(/\{\{status\}\}/g, activeScoringTierPreview.toUpperCase())
                          .replace(/\{\{retake_period\}\}/g, `${activeWorkflow.retakeCooldownHours || 24} hours`)
                      : activeTemplate.body
                          .replace(/\{\{candidate_name\}\}/g, 'Alex Morgan')
                          .replace(/\{\{score_percent\}\}/g, activeScoringTierPreview === 'passed' ? '88%' : activeScoringTierPreview === 'review' ? '74%' : '56%')
                          .slice(0, 180) + '...'}
                  </p>
                </div>

                {activeTemplate.actionButtonText && (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs">
                      {activeTemplate.actionButtonText}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    {activeTemplate.secondaryActionText && (
                      <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 font-bold text-xs inline-flex items-center gap-1.5">
                        {activeTemplate.secondaryActionText}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Setup Instructions Accordion */}
            {showAppsScriptGuide && (
              <div className="p-4 sm:p-5 bg-slate-900 text-slate-100 rounded-2xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-sans font-bold text-sm text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    How to enable automated email triggers &amp; grading in your Google Sheet:
                  </span>
                  <button
                    onClick={copyAppsScriptCode}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-sans font-bold transition-colors cursor-pointer"
                  >
                    {copiedScript ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 font-sans text-xs leading-relaxed">
                  <li>Open your connected Google Sheet ({spreadsheetUrl ? <a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer" className="underline text-emerald-400">click here to open</a> : 'via button above'}).</li>
                  <li>Click <strong>Extensions</strong> &gt; <strong>Apps Script</strong> in the top menu.</li>
                  <li>Delete any existing code in the editor, and <strong>Paste</strong> the copied script.</li>
                  <li>Click the <strong>Triggers</strong> icon (clock icon on the left sidebar) &gt; click <strong>&ldquo;Add Trigger&rdquo;</strong>.</li>
                  <li>Set <em>&ldquo;Choose which function to run&rdquo;</em> to <strong><code className="text-emerald-300">onFormSubmitTrigger</code></strong>, and <em>&ldquo;Select event type&rdquo;</em> to <strong><code className="text-emerald-300">On form submit</code></strong> &gt; Click <strong>Save</strong>.</li>
                </ol>
                <div className="bg-slate-950 p-3 rounded-xl overflow-x-auto max-h-48 text-[11px] text-emerald-300">
                  <pre>{generatedScript.slice(0, 500)}... (click &quot;Copy Apps Script&quot; to copy all {generatedScript.length} characters)</pre>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Google Forms File Upload Guidance Note */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-3.5 shadow-2xs">
        <div className="p-2 rounded-xl bg-amber-100/90 text-amber-800 shrink-0 mt-0.5">
          <UploadCloud className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-bold text-amber-950">
            Important Note on Google Forms File Uploads:
          </p>
          <p className="text-amber-800/90 leading-relaxed">
            Google's API does not allow third-party apps to directly provision Drive storage folders. Any file upload questions in your form were generated as short-answer fields with upload validation guidelines. If you need respondents to upload attachments directly, click{' '}
            <a
              href={formData.editUri}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-amber-950 hover:text-amber-900"
            >
              &ldquo;Edit in Google Forms&rdquo;
            </a>{' '}
            above, switch that question&apos;s dropdown to <strong>&ldquo;File upload&rdquo;</strong>, and click <strong>&ldquo;Continue&rdquo;</strong> to link your Google Drive.
          </p>
        </div>
      </div>

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
