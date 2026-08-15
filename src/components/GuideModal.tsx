import React from 'react';
import {
  X,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Globe,
  Share2,
  Server,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">How FormCraft AI Works &amp; Deployment Guide</h2>
              <p className="text-xs text-slate-500">Doc/Brief &rarr; Gemini AI &rarr; Live Google Form &amp; Sheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Workflow Lifecycle */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>The End-to-End Workflow</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">1</span>
                  <h4 className="text-xs font-bold text-slate-900">Input / Client Brief</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload any document (PDF, PNG scan, photo) OR use the <strong>Client Brief tab</strong> to generate localization/grammar screening tests and freelancer intake forms.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">2</span>
                  <h4 className="text-xs font-bold text-slate-900">Gemini 2.5 Flash Engine</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gemini analyzes questions, checkboxes, rating scales, and generates tailored test questions, CAT tool fields, and NDA agreements in strict JSON.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">3</span>
                  <h4 className="text-xs font-bold text-slate-900">1-Click Google Creation</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provisions a live Google Form in your Drive AND automatically creates a connected <strong>Google Sheet with the identical name</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">4</span>
                  <h4 className="text-xs font-bold text-slate-900">Live Responses &amp; Sync</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Collect responses from candidates, sync submissions directly into Google Sheets with a single click, and preview tables or export data.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Gemini API & Custom Key Integration */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-emerald-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Gemini 2.5 Flash &amp; Own API Key</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                Self-Managed Keys Supported
              </span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              <strong>Bring Your Own Key (BYOK):</strong> You can input your own Google Gemini API key via the <strong>API Key</strong> button in the top navigation or idle upload bar. This lets you use your own quota, manage costs, and take the app to any hosting environment (Vercel, Cloud Run, VPS) without external limits.
            </p>
          </div>

          {/* Section 3: Hosting & Vercel / Cloud Run Deployment */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Hosting, Testing &amp; Vercel Deployment</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Immediate Testing in Preview:</strong> You can upload test documents, generate candidate assessment forms, log in with Google, and test real Google Form creation and response sync directly in this preview.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Deploying to Vercel / Cloud Run:</strong> When deploying to Vercel or exporting to GitHub:
                  <ul className="mt-1 space-y-1 list-disc list-inside text-slate-600 pl-1">
                    <li>Set <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-800">GEMINI_API_KEY</code> in your Vercel Environment Variables.</li>
                    <li>The client interface also accepts user-provided keys via localStorage.</li>
                    <li>Ensure Google OAuth client ID / authorized origins match your production domain.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Google Drive &amp; Sheets Privacy:</strong> The app interacts directly with Google APIs using secure user OAuth access tokens. Forms and connected Sheets are created exclusively inside the logged-in user's own Google Drive.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
