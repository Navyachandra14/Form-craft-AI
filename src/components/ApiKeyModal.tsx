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
  Globe,
  Cpu,
  Layers,
} from 'lucide-react';
import { STORAGE_KEY_FIREBASE, getFirebaseApiKey } from '../lib/firebase';
import {
  POPULAR_OPENROUTER_MODELS,
  DEFAULT_OPENROUTER_MODEL,
  STORAGE_KEY_OPENROUTER,
  STORAGE_KEY_OPENROUTER_MODEL,
  STORAGE_KEY_AI_PROVIDER,
  validateOpenRouterKeyDirect,
} from '../lib/openrouter';
import { GoogleGenAI } from '@google/genai';

async function validateGeminiKeyDirect(key: string): Promise<{ valid: boolean; message: string }> {
  const cleanKey = key.trim();
  if (!cleanKey) {
    return { valid: false, message: 'Please enter a valid Gemini API key.' };
  }

  const testModels = ['gemini-2.5-flash', 'gemini-2.0-flash-001', 'gemini-1.5-flash'];

  let lastErr: any = null;
  for (const model of testModels) {
    try {
      const ai = new GoogleGenAI({ apiKey: cleanKey });
      const response = await ai.models.generateContent({
        model,
        contents: 'Ping test. Reply with "pong".',
      });
      if (response && response.text) {
        return {
          valid: true,
          message: `Gemini API key verified successfully! Active connection established via ${model}.`,
        };
      }
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message || err?.details || '').toLowerCase();
      if (msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('400')) {
        break;
      }
    }
  }

  const errorString = String(lastErr?.message || lastErr || '');
  if (
    errorString.includes('API_KEY_INVALID') ||
    errorString.includes('API key not valid') ||
    errorString.includes('400')
  ) {
    return {
      valid: false,
      message: 'Google rejected the API key as invalid. Please check your key at aistudio.google.com/apikey and paste the full string.',
    };
  }
  if (errorString.includes('PERMISSION_DENIED') || errorString.includes('403')) {
    return {
      valid: false,
      message: 'API Key permission denied. Ensure Generative Language API is enabled for your Google Cloud project.',
    };
  }

  return {
    valid: false,
    message: errorString || 'Unable to connect to Google Gemini with this API key.',
  };
}

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  openRouterKey?: string;
  onSaveOpenRouterKey?: (key: string, model: string) => void;
  openRouterModel?: string;
  activeProvider?: 'openrouter' | 'gemini' | 'auto';
  onSaveActiveProvider?: (provider: 'openrouter' | 'gemini' | 'auto') => void;
  hasEnvKey: boolean;
  hasOpenRouterEnvKey?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  openRouterKey: propOpenRouterKey = '',
  onSaveOpenRouterKey,
  openRouterModel: propOpenRouterModel = DEFAULT_OPENROUTER_MODEL,
  activeProvider: propActiveProvider = 'openrouter',
  onSaveActiveProvider,
  hasEnvKey,
  hasOpenRouterEnvKey = false,
}) => {
  const [activeTab, setActiveTab] = useState<'openrouter' | 'gemini' | 'firebase'>('openrouter');
  
  // State for keys and models
  const [inputGeminiKey, setInputGeminiKey] = useState(apiKey);
  const [inputOpenRouterKey, setInputOpenRouterKey] = useState(propOpenRouterKey);
  const [selectedModel, setSelectedModel] = useState(propOpenRouterModel);
  const [customModelInput, setCustomModelInput] = useState('');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [providerChoice, setProviderChoice] = useState<'openrouter' | 'gemini' | 'auto'>(propActiveProvider);

  const [firebaseKey, setFirebaseKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);
  
  // Validation states
  const [isValidatingGemini, setIsValidatingGemini] = useState(false);
  const [geminiValidationStatus, setGeminiValidationStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

  const [isValidatingOpenRouter, setIsValidatingOpenRouter] = useState(false);
  const [openRouterValidationStatus, setOpenRouterValidationStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

  const [firebaseStatus, setFirebaseStatus] = useState<string | null>(null);

  useEffect(() => {
    setInputGeminiKey(apiKey);
    
    // Load from local storage or props
    const storedOrKey = localStorage.getItem(STORAGE_KEY_OPENROUTER) || propOpenRouterKey || '';
    const storedOrModel = localStorage.getItem(STORAGE_KEY_OPENROUTER_MODEL) || propOpenRouterModel || DEFAULT_OPENROUTER_MODEL;
    const storedProvider = (localStorage.getItem(STORAGE_KEY_AI_PROVIDER) as any) || propActiveProvider || 'openrouter';

    setInputOpenRouterKey(storedOrKey);
    setSelectedModel(storedOrModel);
    setProviderChoice(storedProvider);
    
    const isPredefined = POPULAR_OPENROUTER_MODELS.some((m) => m.id === storedOrModel);
    if (!isPredefined && storedOrModel) {
      setIsCustomModel(true);
      setCustomModelInput(storedOrModel);
    }

    setFirebaseKey(getFirebaseApiKey());
    setGeminiValidationStatus(null);
    setOpenRouterValidationStatus(null);
  }, [apiKey, propOpenRouterKey, propOpenRouterModel, propActiveProvider, isOpen]);

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

  const handleValidateOpenRouter = async () => {
    const keyToTest = inputOpenRouterKey.trim();
    const modelToTest = isCustomModel ? customModelInput.trim() : selectedModel;

    if (!keyToTest && !hasOpenRouterEnvKey) {
      setOpenRouterValidationStatus({
        tested: true,
        valid: false,
        message: 'Please paste your OpenRouter API key (sk-or-v1-...) before testing.',
      });
      return;
    }

    setIsValidatingOpenRouter(true);
    setOpenRouterValidationStatus(null);

    try {
      // 1. Direct browser validation
      let res = await validateOpenRouterKeyDirect(keyToTest || 'env-key', modelToTest);

      // 2. If browser fetch has CORS issues, fallback to server endpoint
      if (!res.valid && keyToTest) {
        try {
          const sRes = await fetch('/api/validate-openrouter-key', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-openrouter-api-key': keyToTest,
            },
            body: JSON.stringify({ apiKey: keyToTest, model: modelToTest }),
          });
          const sData = await sRes.json();
          if (sRes.ok && sData.valid) {
            res = { valid: true, message: sData.message || 'OpenRouter API key is active and verified!' };
          } else if (sData.error) {
            res = { valid: false, message: sData.error };
          }
        } catch {
          // Keep original error
        }
      }

      setOpenRouterValidationStatus({
        tested: true,
        valid: res.valid,
        message: res.message,
      });
    } catch (err: any) {
      setOpenRouterValidationStatus({
        tested: true,
        valid: false,
        message: err.message || 'Network error while testing OpenRouter API key.',
      });
    } finally {
      setIsValidatingOpenRouter(false);
    }
  };

  const handleValidateGemini = async () => {
    const keyToTest = inputGeminiKey.trim();
    if (!keyToTest && !hasEnvKey) {
      setGeminiValidationStatus({
        tested: true,
        valid: false,
        message: 'Please paste your Gemini API key before testing.',
      });
      return;
    }

    setIsValidatingGemini(true);
    setGeminiValidationStatus(null);

    try {
      let isVerified = false;
      let statusMessage = '';

      if (keyToTest) {
        const directTest = await validateGeminiKeyDirect(keyToTest);
        if (directTest.valid) {
          isVerified = true;
          statusMessage = directTest.message;
        } else if (
          directTest.message.includes('API_KEY_INVALID') ||
          directTest.message.includes('Google rejected') ||
          directTest.message.includes('permission denied')
        ) {
          setGeminiValidationStatus({
            tested: true,
            valid: false,
            message: directTest.message,
          });
          return;
        } else {
          statusMessage = directTest.message;
        }
      }

      if (!isVerified) {
        try {
          const res = await fetch('/api/validate-gemini-key', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-gemini-api-key': keyToTest,
            },
            body: JSON.stringify({ apiKey: keyToTest }),
          });

          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (res.ok && data.valid) {
              isVerified = true;
              statusMessage = data.message || 'Gemini API key is active and verified!';
            } else if (data.error) {
              statusMessage = data.error;
            }
          }
        } catch (serverErr) {
          console.warn('Server validation endpoint returned notice:', serverErr);
        }
      }

      if (isVerified) {
        setGeminiValidationStatus({
          tested: true,
          valid: true,
          message: statusMessage || 'Gemini API key is active and verified!',
        });
      } else {
        setGeminiValidationStatus({
          tested: true,
          valid: false,
          message:
            statusMessage ||
            'Unable to verify API key with Google Gemini. Please check that your key was copied correctly from Google AI Studio.',
        });
      }
    } catch (err: any) {
      setGeminiValidationStatus({
        tested: true,
        valid: false,
        message: err.message || 'Network error while testing Gemini API key.',
      });
    } finally {
      setIsValidatingGemini(false);
    }
  };

  const handleSave = () => {
    const finalOrModel = isCustomModel ? customModelInput.trim() : selectedModel;
    const cleanOrKey = inputOpenRouterKey.trim();
    const cleanGeminiKey = inputGeminiKey.trim();

    // Save Gemini key
    onSaveKey(cleanGeminiKey);

    // Save OpenRouter key & model
    if (onSaveOpenRouterKey) {
      onSaveOpenRouterKey(cleanOrKey, finalOrModel);
    } else {
      try {
        if (cleanOrKey) {
          localStorage.setItem(STORAGE_KEY_OPENROUTER, cleanOrKey);
          localStorage.setItem(STORAGE_KEY_OPENROUTER_MODEL, finalOrModel);
        } else {
          localStorage.removeItem(STORAGE_KEY_OPENROUTER);
        }
      } catch (e) {
        console.warn('Failed to store OpenRouter key', e);
      }
    }

    // Save active provider
    if (onSaveActiveProvider) {
      onSaveActiveProvider(providerChoice);
    } else {
      try {
        localStorage.setItem(STORAGE_KEY_AI_PROVIDER, providerChoice);
      } catch (e) {
        console.warn('Failed to store AI provider choice', e);
      }
    }

    // Save Firebase key if modified
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

  const handleClearOpenRouter = () => {
    setInputOpenRouterKey('');
    try {
      localStorage.removeItem(STORAGE_KEY_OPENROUTER);
    } catch {}
    if (onSaveOpenRouterKey) {
      onSaveOpenRouterKey('', selectedModel);
    }
    setOpenRouterValidationStatus(null);
  };

  const handleClearGemini = () => {
    setInputGeminiKey('');
    onSaveKey('');
    setGeminiValidationStatus(null);
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
      aria-labelledby="api-modal-title"
      aria-describedby="api-modal-desc"
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
                <h2 id="api-modal-title" className="text-base font-bold text-slate-900">
                  AI Provider &amp; API Keys
                </h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3" />
                  Bring Your Own Key
                </span>
              </div>
              <p id="api-modal-desc" className="text-xs text-slate-500">
                Choose OpenRouter or Google Gemini to generate Google Forms effortlessly
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
        <div className="flex border-b border-slate-200 bg-slate-100/50 px-6 pt-2 gap-1 overflow-x-auto">
          {/* Tab 1: OpenRouter (Recommended) */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('openrouter');
              setProviderChoice('openrouter');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'openrouter'
                ? 'border-indigo-600 text-indigo-950 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>OpenRouter AI</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-100 text-indigo-800 font-bold">
              Recommended
            </span>
            {inputOpenRouterKey.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          {/* Tab 2: Google Gemini */}
          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gemini'
                ? 'border-emerald-600 text-emerald-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Gemini</span>
            {inputGeminiKey.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          {/* Tab 3: Firebase */}
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          {/* TAB 1: OPENROUTER */}
          {activeTab === 'openrouter' && (
            <>
              {/* OpenRouter Status Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {inputOpenRouterKey.trim()
                        ? 'Using Custom OpenRouter API Key'
                        : hasOpenRouterEnvKey
                        ? 'Default Server OpenRouter Key Active'
                        : 'No OpenRouter Key Entered'}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {inputOpenRouterKey.trim()
                        ? `Connected to OpenRouter (${selectedModel})`
                        : 'Enter your OpenRouter key below for zero-quota errors and multi-model access.'}
                    </div>
                  </div>
                </div>
                {inputOpenRouterKey.trim() ? (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
                    BYOK
                  </span>
                )}
              </div>

              {/* OpenRouter Key Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="user-openrouter-key" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    OpenRouter API Key
                  </label>
                  {inputOpenRouterKey.trim() && (
                    <button
                      type="button"
                      onClick={handleClearOpenRouter}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden rounded px-1 cursor-pointer"
                    >
                      Clear Key
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="user-openrouter-key"
                    type={showOpenRouterKey ? 'text' : 'password'}
                    value={inputOpenRouterKey}
                    onChange={(e) => {
                      setInputOpenRouterKey(e.target.value);
                      setOpenRouterValidationStatus(null);
                    }}
                    placeholder="sk-or-v1-..."
                    aria-label="OpenRouter API Key input"
                    className="w-full pl-4 pr-20 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono text-slate-900 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                    aria-label={showOpenRouterKey ? 'Hide key' : 'Show key'}
                  >
                    {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Model Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Target AI Model</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomModel(!isCustomModel)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {isCustomModel ? 'Select Predefined Model' : 'Enter Custom Model ID'}
                  </button>
                </label>

                {!isCustomModel ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {POPULAR_OPENROUTER_MODELS.map((model) => {
                      const isSelected = selectedModel === model.id;
                      return (
                        <div
                          key={model.id}
                          onClick={() => setSelectedModel(model.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs ring-1 ring-indigo-600'
                              : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {model.name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              isSelected ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {model.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                            {model.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    placeholder="e.g. google/gemini-2.5-flash or openai/gpt-4o"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono text-slate-900"
                  />
                )}
              </div>

              {/* Action Buttons: Test Connection & Get Key Link */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleValidateOpenRouter}
                  disabled={isValidatingOpenRouter || (!inputOpenRouterKey.trim() && !hasOpenRouterEnvKey)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden transition-colors cursor-pointer shadow-2xs"
                >
                  {isValidatingOpenRouter ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
                      <span>Testing OpenRouter...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                      <span>Test OpenRouter Key</span>
                    </>
                  )}
                </button>

                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-800 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden rounded px-1"
                >
                  <span>Get OpenRouter API Key</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>

              {/* Validation feedback */}
              {openRouterValidationStatus && (
                <div
                  role="alert"
                  aria-live="polite"
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    openRouterValidationStatus.valid
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}
                >
                  {openRouterValidationStatus.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <span className="leading-relaxed">{openRouterValidationStatus.message}</span>
                </div>
              )}

              {/* OpenRouter Advantages Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  <span>Why Use OpenRouter?</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  OpenRouter gives you a single API key to access 100+ state-of-the-art models (Gemini 2.5 Flash, GPT-4o, Claude 3.5, Llama 3) without geographic blocks or individual vendor quotas.
                </p>
              </div>
            </>
          )}

          {/* TAB 2: GOOGLE GEMINI */}
          {activeTab === 'gemini' && (
            <>
              {/* Gemini Key status indicator */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {inputGeminiKey.trim()
                        ? 'Using Custom User Gemini Key'
                        : hasEnvKey
                        ? 'Default Server API Key Active'
                        : 'No Gemini API Key Configured'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {inputGeminiKey.trim()
                        ? 'Stored securely in your browser localStorage'
                        : hasEnvKey
                        ? 'Fallback environment key is configured on server'
                        : 'Add your key below to parse documents & generate forms'}
                    </div>
                  </div>
                </div>
                {inputGeminiKey.trim() ? (
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
                  {inputGeminiKey.trim() && (
                    <button
                      type="button"
                      onClick={handleClearGemini}
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
                    type={showGeminiKey ? 'text' : 'password'}
                    value={inputGeminiKey}
                    onChange={(e) => {
                      setInputGeminiKey(e.target.value);
                      setGeminiValidationStatus(null);
                    }}
                    placeholder="AIzaSy..."
                    aria-label="Gemini API Key input"
                    className="w-full pl-4 pr-20 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-mono text-slate-900 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                    aria-label={showGeminiKey ? 'Hide API key characters' : 'Show API key characters'}
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleValidateGemini}
                    disabled={isValidatingGemini || (!inputGeminiKey.trim() && !hasEnvKey)}
                    aria-label="Test and verify API key connection with Gemini"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-800 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden transition-colors cursor-pointer"
                  >
                    {isValidatingGemini ? (
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
                {geminiValidationStatus && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      geminiValidationStatus.valid
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border-rose-200'
                    }`}
                  >
                    {geminiValidationStatus.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <span className="leading-relaxed">{geminiValidationStatus.message}</span>
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
          )}

          {/* TAB 3: FIREBASE & AUTH */}
          {activeTab === 'firebase' && (
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
            <span>Keys are stored locally in your browser and never sent to third-party databases.</span>
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
            id="btn-save-api-keys"
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
