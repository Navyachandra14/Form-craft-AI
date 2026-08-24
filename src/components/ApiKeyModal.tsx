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
  Flame,
} from 'lucide-react';
import { STORAGE_KEY_FIREBASE, getFirebaseApiKey } from '../lib/firebase';

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
  const [activeTab, setActiveTab] = useState<'gemini' | 'firebase'>('gemini');
  const [inputKey, setInputKey] = useState(apiKey);
  const [firebaseKey, setFirebaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  } | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<string | null>(null);

  useEffect(() => {
    setInputKey(apiKey);
    setValidationStatus(null);
    setFirebaseKey(getFirebaseApiKey());
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
    try {
      if (firebaseKey.trim()) {
        localStorage.setItem(STORAGE_KEY_FIREBASE, firebaseKey.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_FIREBASE);
      }
    } catch (e) {
      console.warn('Failed to save Firebase API key', e);
    }
    onClose();
  };

  const handleClear = () => {
    setInputKey('');
    onSaveKey('');
    setValidationStatus(null);
  };

  const handleClearFirebase = () => {
    setFirebaseKey('');
    try {
      localStorage.removeItem(STORAGE_KEY_FIREBASE);
      setFirebaseStatus('Cleared custom Firebase key. Reverted to default config.');
    } catch (e) {
      // Ignore
    }
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
                  API Key &amp; Cloud Setup
                </h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3" />
                  Bring Your Own Key
                </span>
              </div>
              <p id="gemini-api-modal-desc" className="text-xs text-slate-500">
                Configure your custom Gemini AI and Firebase API keys
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'gemini'
                ? 'border-emerald-600 text-emerald-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Gemini AI</span>
            {inputKey.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'firebase'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Firebase &amp; Auth</span>
            {firebaseKey.trim() && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'gemini' ? (
            <>
              {/* Gemini Key status indicator */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {inputKey.trim()
                        ? 'Using Custom User Gemini Key'
                        : hasEnvKey
                        ? 'Default Server API Key Active'
                        : 'No Gemini API Key Configured'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {inputKey.trim()
                        ? 'Stored securely in your browser localStorage'
                        : hasEnvKey
                        ? 'Fallback environment key is configured on server'
                        : 'Add your key below to parse documents & generate forms'}
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

              {/* Gemini Key Input Section */}
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
                        <span>Test &amp; Verify Gemini Key</span>
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
                    <span>Get a free Gemini Key</span>
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

              {/* Gemini Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-600" aria-hidden="true" />
                  <span>How Gemini BYOK Works</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your Gemini API key is stored only in your browser’s local storage and passed securely via headers to parse your briefs and generate form schemas.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Firebase Config Section */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Firebase &amp; Google Sign-in Key
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Used for Google Login and connecting to Google Forms / Sheets
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white text-slate-700 border border-slate-200">
                  Client Auth
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="user-firebase-key" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Firebase Web API Key
                  </label>
                  {firebaseKey.trim() && (
                    <button
                      type="button"
                      onClick={handleClearFirebase}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden rounded px-1 cursor-pointer"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="user-firebase-key"
                    type={showFirebaseKey ? 'text' : 'password'}
                    value={firebaseKey}
                    onChange={(e) => {
                      setFirebaseKey(e.target.value);
                      setFirebaseStatus(null);
                    }}
                    placeholder="AIzaSy..."
                    aria-label="Firebase API Key input"
                    className="w-full pl-4 pr-20 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-mono text-slate-900 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFirebaseKey(!showFirebaseKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                  >
                    {showFirebaseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {firebaseStatus && (
                  <p className="text-xs text-emerald-700 font-medium">{firebaseStatus}</p>
                )}
              </div>

              {/* Firebase Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-600" aria-hidden="true" />
                  <span>Custom Firebase Project Override</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If you are hosting your own instance or rotated your Firebase project key, paste your active Firebase Web API key here. The app will immediately use your custom key for Google Sign-in.
                </p>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>Keys are stored locally in your browser and never leaked.</span>
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
            aria-label="Save and apply configuration"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden transition-all shadow-xs cursor-pointer"
          >
            Save &amp; Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

