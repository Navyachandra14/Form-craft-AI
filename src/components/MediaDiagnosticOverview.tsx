import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCheck,
  ZoomIn,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Eye,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { ParsedFormSchema, Asset } from '../types';

interface MediaDiagnosticOverviewProps {
  schema: ParsedFormSchema;
  verifiedCount: number;
  totalMediaQuestions: number;
  onVerifyAll: () => void;
  onInspectImage: (imageUrl: string, title: string, metadata?: string) => void;
  onScrollToQuestion?: (questionId: string) => void;
  isDiagnosticOpen: boolean;
  onToggleDiagnostic: () => void;
}

export const MediaDiagnosticOverview: React.FC<MediaDiagnosticOverviewProps> = ({
  schema,
  verifiedCount,
  totalMediaQuestions,
  onVerifyAll,
  onInspectImage,
  onScrollToQuestion,
  isDiagnosticOpen,
  onToggleDiagnostic,
}) => {
  const documentAssets = schema.assets || [];
  const [showFullGallery, setShowFullGallery] = useState(false);

  const percentVerified =
    totalMediaQuestions > 0
      ? Math.round((verifiedCount / totalMediaQuestions) * 100)
      : 100;

  return (
    <div
      id="media-diagnostic-overview"
      className="bg-white rounded-3xl border border-indigo-200/90 shadow-xs overflow-hidden transition-all"
    >
      {/* Top Ribbon */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Image &amp; Media Verification Diagnostic
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                <Layers className="w-3.5 h-3.5" />
                {documentAssets.length} Assets Extracted
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify that the AI model extracted and mapped actual visual content (screenshots, diagrams, cases) from the document.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] text-slate-600">
              <span className="font-semibold text-indigo-700">Image Rules:</span>
              <span className="bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md text-indigo-900 font-medium">
                ✓ Visual exhibits with text, UI screenshots, diagrams &amp; charts preserved
              </span>
              <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                ✓ Mapped sequentially to matching Cases
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {totalMediaQuestions > 0 && verifiedCount < totalMediaQuestions && (
            <button
              id="btn-verify-all-media"
              type="button"
              onClick={onVerifyAll}
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Verify All Media</span>
            </button>
          )}

          <button
            id="btn-toggle-diagnostic-mode"
            type="button"
            onClick={onToggleDiagnostic}
            className="min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <span>{isDiagnosticOpen ? 'Hide Diagnostics' : 'Show Diagnostics'}</span>
            {isDiagnosticOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Diagnostic Body */}
      {isDiagnosticOpen && (
        <div className="p-4 sm:p-5 space-y-4 bg-slate-50/40">
          {/* Status Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-semibold block text-[11px]">Total Extracted Media</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-slate-900">{documentAssets.length}</span>
                <span className="text-[11px] text-slate-500">source images captured</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-semibold block text-[11px]">Linked to Questions</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-indigo-700">{totalMediaQuestions}</span>
                <span className="text-[11px] text-slate-500">questions with media prompt</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-semibold block text-[11px]">Reviewer Verification</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-emerald-700">
                  {verifiedCount} / {totalMediaQuestions}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">({percentVerified}% verified)</span>
              </div>
            </div>
          </div>

          {/* Extracted Asset Gallery Strip */}
          {documentAssets.length > 0 && (
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Extracted Document Assets Gallery ({documentAssets.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullGallery(!showFullGallery)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {showFullGallery ? 'Show Compact Strip' : 'Expand All Thumbnails'}
                </button>
              </div>

              <div
                className={`grid gap-3 ${
                  showFullGallery
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                }`}
              >
                {documentAssets.map((asset, idx) => {
                  const linkedQuestion = schema.questions.find(
                    (q) => q.imageUrl === asset.dataUrl || q.assetIds?.includes(asset.assetId)
                  );

                  return (
                    <div
                      key={asset.assetId || idx}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50/50 p-1.5 transition-all hover:border-indigo-400 hover:shadow-sm"
                    >
                      <div className="relative h-24 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img
                          src={asset.dataUrl}
                          alt={asset.associatedSection || `Asset ${idx + 1}`}
                          className="max-h-full max-w-full object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onInspectImage(
                              asset.dataUrl || '',
                              asset.associatedSection || `Asset #${idx + 1}`,
                              asset.source
                            )
                          }
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-white text-[10px] font-bold transition-opacity cursor-pointer backdrop-blur-2xs"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </div>

                      <div className="mt-1.5 px-1 space-y-0.5 text-[10px]">
                        <p className="font-bold text-slate-800 truncate" title={asset.associatedSection || ''}>
                          {asset.associatedSection || `Asset #${idx + 1}`}
                        </p>
                        <div className="flex items-center justify-between text-slate-500 font-mono text-[9px]">
                          <span>{asset.mimeType.replace('image/', '')}</span>
                          {linkedQuestion ? (
                            <span className="text-emerald-700 font-semibold font-sans">Linked ✓</span>
                          ) : (
                            <span className="text-slate-400 font-sans">Unlinked</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
