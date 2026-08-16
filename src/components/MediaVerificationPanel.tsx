import React, { useState } from 'react';
import {
  Image as ImageIcon,
  ZoomIn,
  CheckCheck,
  BadgeCheck,
  Trash2,
  UploadCloud,
  Layers,
  Sparkles,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  Tag,
  Info,
} from 'lucide-react';
import { FormQuestion, Asset } from '../types';

interface MediaVerificationPanelProps {
  question: FormQuestion;
  questionIndex: number;
  isVerified: boolean;
  onToggleVerified: () => void;
  onUpdateQuestion: (updates: Partial<FormQuestion>) => void;
  documentAssets: Asset[];
  onInspectImage: (imageUrl: string, title: string, metadata?: string) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export const MediaVerificationPanel: React.FC<MediaVerificationPanelProps> = ({
  question,
  questionIndex,
  isVerified,
  onToggleVerified,
  onUpdateQuestion,
  documentAssets,
  onInspectImage,
  isExpanded = true,
  onToggleExpanded,
}) => {
  const [showAssetGallery, setShowAssetGallery] = useState(false);
  const hasImage = Boolean(question.imageUrl);
  const matchedAsset = documentAssets.find(
    (a) => a.assetId === question.assetIds?.[0] || (a.dataUrl && a.dataUrl === question.imageUrl)
  );

  return (
    <div
      id={`media-verification-panel-${questionIndex}`}
      className={`rounded-2xl border transition-all my-3.5 overflow-hidden ${
        isVerified
          ? 'bg-emerald-50/50 border-emerald-300/80 shadow-2xs'
          : hasImage
          ? 'bg-indigo-50/40 border-indigo-200/90 shadow-2xs'
          : 'bg-slate-50/70 border-slate-200'
      }`}
    >
      {/* Header bar with toggle and status badge */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-white/80 border-b border-inherit">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isVerified
                ? 'bg-emerald-100 text-emerald-800'
                : hasImage
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Image / Media Verification
              </span>
              {hasImage ? (
                isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <BadgeCheck className="w-3 h-3 text-emerald-700" />
                    Verified Content ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    Extracted Asset Ready
                  </span>
                )
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  No Media Attached
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasImage && (
            <button
              id={`btn-verify-checkbox-${questionIndex}`}
              type="button"
              onClick={onToggleVerified}
              className={`min-h-[32px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isVerified
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
              }`}
              title="Confirm that the extracted image matches the source document case"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{isVerified ? 'Confirmed Verified' : 'Mark as Verified'}</span>
            </button>
          )}

          {onToggleExpanded && (
            <button
              type="button"
              onClick={onToggleExpanded}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title={isExpanded ? 'Collapse panel' : 'Expand panel'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Diagnostic Body */}
      {isExpanded && (
        <div className="p-4 space-y-3.5">
          {hasImage ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Thumbnail Preview with Zoom overlay */}
              <div className="md:col-span-5 relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                <img
                  src={question.imageUrl}
                  alt={question.title}
                  className="w-full h-44 object-contain bg-slate-100/60 p-1"
                />
                
                {/* Inspect / Zoom Overlay button */}
                <button
                  type="button"
                  onClick={() =>
                    onInspectImage(
                      question.imageUrl!,
                      question.title,
                      matchedAsset?.associatedSection || question.imageDescription
                    )
                  }
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-bold transition-opacity cursor-pointer backdrop-blur-2xs"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>Inspect Full Asset</span>
                </button>

                <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Thumbnail Preview</span>
                  <button
                    type="button"
                    onClick={() =>
                      onInspectImage(
                        question.imageUrl!,
                        question.title,
                        matchedAsset?.associatedSection || question.imageDescription
                      )
                    }
                    className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <ZoomIn className="w-3 h-3" /> Zoom
                  </button>
                </div>
              </div>

              {/* Asset Diagnostic Metadata & Controls */}
              <div className="md:col-span-7 space-y-3">
                {/* Telemetry info card */}
                <div className="bg-white rounded-xl p-3 border border-slate-200/90 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-slate-500">Source Extraction:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-800">
                      {matchedAsset?.source || (question.assetIds?.[0] ? `Asset: ${question.assetIds[0]}` : 'Direct Upload')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-slate-500">MIME Format:</span>
                    <span className="font-mono text-[11px] text-slate-800">
                      {matchedAsset?.mimeType || 'image/png (Binary Base64)'}
                    </span>
                  </div>

                  {(matchedAsset?.associatedSection || question.imageDescription) && (
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <span className="font-semibold text-slate-500 shrink-0">Case / Context:</span>
                      <span className="text-[11px] text-slate-800 text-right font-medium">
                        {matchedAsset?.associatedSection || question.imageDescription}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Google Forms Binding:</span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      questionItem.image (Active)
                    </span>
                  </div>
                </div>

                {/* Question Image Description / Notes Input */}
                <div>
                  <input
                    type="text"
                    value={question.imageDescription || ''}
                    onChange={(e) => onUpdateQuestion({ imageDescription: e.target.value })}
                    placeholder="Visual context summary (optional)..."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {documentAssets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowAssetGallery(!showAssetGallery)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{showAssetGallery ? 'Hide Gallery' : 'Switch Extracted Asset'}</span>
                    </button>
                  )}

                  <label className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                    <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                    <span>Upload New</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            onUpdateQuestion({
                              imageUrl: (re.target?.result as string) || '',
                              hasImagePrompt: true,
                              assetIds: [`uploaded_${Date.now()}`],
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateQuestion({
                        imageUrl: undefined,
                        hasImagePrompt: false,
                        assetIds: [],
                        imageDescription: undefined,
                      })
                    }
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* No image currently attached - diagnostic selector */
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No media asset linked to this question.</span>
                </div>

                <div className="flex items-center gap-2">
                  {documentAssets.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAssetGallery(!showAssetGallery)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Attach Extracted Asset ({documentAssets.length})</span>
                    </button>
                  )}

                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            onUpdateQuestion({
                              imageUrl: (re.target?.result as string) || '',
                              hasImagePrompt: true,
                              assetIds: [`uploaded_${Date.now()}`],
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Document Asset Picker Gallery */}
          {showAssetGallery && documentAssets.length > 0 && (
            <div className="mt-3 p-3.5 bg-white rounded-xl border border-indigo-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Select Extracted Document Asset:
                </span>
                <span className="text-[11px] text-slate-500">
                  {documentAssets.length} total extracted
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {documentAssets.map((asset, aIdx) => {
                  const isSelected = question.imageUrl === asset.dataUrl;
                  return (
                    <button
                      key={asset.assetId || aIdx}
                      type="button"
                      onClick={() => {
                        if (asset.dataUrl) {
                          onUpdateQuestion({
                            imageUrl: asset.dataUrl,
                            hasImagePrompt: true,
                            assetIds: [asset.assetId],
                            imageDescription: asset.description || asset.associatedSection || '',
                          });
                          setShowAssetGallery(false);
                        }
                      }}
                      className={`group relative rounded-lg overflow-hidden border p-1 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/50'
                          : 'border-slate-200 hover:border-slate-400 bg-slate-50/50'
                      }`}
                    >
                      <img
                        src={asset.dataUrl}
                        alt={asset.associatedSection || `Asset ${aIdx + 1}`}
                        className="w-full h-20 object-contain bg-white rounded"
                      />
                      <div className="mt-1 px-1 text-[10px]">
                        <p className="font-bold text-slate-800 truncate">
                          {asset.associatedSection || `Asset #${aIdx + 1}`}
                        </p>
                        <p className="text-slate-500 font-mono text-[9px] truncate">
                          {asset.source}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5">
                          <CheckCheck className="w-3 h-3" />
                        </div>
                      )}
                    </button>
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
