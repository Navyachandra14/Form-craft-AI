import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Info,
  Server,
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  hasEnvKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  hasEnvKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setInputKey(apiKey);
    setValidationStatus(null);
  }, [apiKey, isOpen]);

  // Accessible keyboard navigation: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleValidate = async () => {
    const keyToTest = inputKey.trim();
    if (!keyToTest && !hasEnvKey) {
      setValidationStatus({
        tested: true,
        valid: false,
        message: 'Please paste your Gemini API key before testing.',
      });
      return;
    }

    setIsValidating(true);
    setValidationStatus(null);

    try {
      const res = await fetch('/api/validate-gemini-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': keyToTest,
        },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setValidationStatus({
          tested: true,
          valid: true,
          message: data.message || 'Gemini API key is active and verified!',
        });
      } else {
        setValidationStatus({
          tested: true,
          valid: false,
          message: data.error || 'Failed to validate API key with Gemini.',
        });
      }
    } catch (err: any) {
      setValidationStatus({
        tested: true,
        valid: false,
        message: err.message || 'Network error while testing Gemini API key.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    onSaveKey(inputKey.trim());
    onClose();
  };

  const handleClear = () => {
    setInputKey('');
    onSaveKey('');
    setValidationStatus(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemini-api-modal-title"
      aria-describedby="gemini-api-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-emerald-400 shadow-xs" aria-hidden="true">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="gemini-api-modal-title" className="text-base font-bold text-slate-900">
                  Gemini API Key &amp; Integration Setup
                </h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3" />
                  Gemini 3.7 Flash
                </span>
              </div>
              <p id="gemini-api-modal-desc" className="text-xs text-slate-500">
                Configure your Google Gemini API key for document parsing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API Key Setup dialog"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Key status indicator */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {inputKey.trim()
                    ? 'Using Custom User Gemini Key'
                    : hasEnvKey
                    ? 'Default Server API Key Active'
                    : 'No API Key Configured'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {inputKey.trim()
                    ? 'Stored securely in your browser localStorage'
                    : hasEnvKey
                    ? 'Fallback environment key is configured on server'
                    : 'Add your key below to process documents'}
                </div>
              </div>
            </div>
            {inputKey.trim() ? (
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                Custom Key Active
              </span>
            ) : hasEnvKey ? (
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                Env Key Active
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
                Key Required
              </span>
            )}
          </div>

          {/* Key Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="user-gemini-key" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Your Google Gemini API Key
              </label>
              {inputKey.trim() && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden rounded px-1 cursor-pointer"
                  aria-label="Clear custom API key"
                >
                  Clear Key
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="user-gemini-key"
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setValidationStatus(null);
                }}
                placeholder="AIzaSy..."
                aria-label="Gemini API Key input"
                className="w-full pl-4 pr-20 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-mono text-slate-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                aria-label={showKey ? 'Hide API key characters' : 'Show API key characters'}
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating || (!inputKey.trim() && !hasEnvKey)}
                aria-label="Test and verify API key connection with Gemini"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-800 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden transition-colors cursor-pointer"
              >
                {isValidating ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" aria-hidden="true" />
                    <span>Validating Key...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    <span>Test &amp; Verify API Key</span>
                  </>
                )}
              </button>

              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                aria-label="Get a free Gemini API Key from Google AI Studio (opens in new tab)"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden rounded px-1"
              >
                <span>Get a free Gemini API Key</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Validation feedback */}
            {validationStatus && (
              <div
                role="alert"
                aria-live="polite"
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  validationStatus.valid
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                {validationStatus.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <span className="leading-relaxed">{validationStatus.message}</span>
              </div>
            )}
          </div>

          {/* Step-by-Step Setup Guide */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span>How to Get &amp; Use Your Own Gemini API Key</span>
            </h3>

            <ol className="space-y-2.5 text-xs text-slate-600 leading-relaxed list-decimal list-inside pl-0.5">
              <li>
                <strong className="text-slate-900">Visit Google AI Studio:</strong> Navigate to{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-0.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden rounded px-0.5"
                >
                  aistudio.google.com/apikey <ExternalLink className="w-3 h-3 inline" aria-hidden="true" />
                </a>
              </li>
              <li>
                <strong className="text-slate-900">Create Key:</strong> Click{' '}
                <span className="font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  "Create API key"
                </span>{' '}
                in a new or existing Google Cloud project. Google AI Studio provides a free tier.
              </li>
              <li>
                <strong className="text-slate-900">Paste &amp; Save:</strong> Paste your key into the box above and click{' '}
                <strong className="text-slate-800">"Save &amp; Apply Key"</strong>.
              </li>
              <li>
                <strong className="text-slate-900">Deploying to Vercel or Cloud Run:</strong> When deploying your own fork, add{' '}
                <span className="font-mono text-[11px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">
                  GEMINI_API_KEY
                </span>{' '}
                in your Vercel/Cloud Run environment variables dashboard.
              </li>
            </ol>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Your API key is stored locally in your browser and used exclusively for your requests.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel and close dialog"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-save-gemini-key"
            type="button"
            onClick={handleSave}
            aria-label="Save and apply Gemini API Key"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden transition-all shadow-xs cursor-pointer"
          >
            Save &amp; Apply Key
          </button>
        </div>
      </div>
    </div>
  );
};
