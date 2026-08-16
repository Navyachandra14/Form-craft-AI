import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, getAccessToken, logout } from './lib/auth';
import { saveSchema, getSchema } from './lib/persistence';
import { Navbar } from './components/Navbar';
import { Dropzone } from './components/Dropzone';
import { ParsingProgress } from './components/ParsingProgress';
import { SchemaEditor, AUTOSAVE_STORAGE_KEY, AUTOSAVE_TIMESTAMP_KEY } from './components/SchemaEditor';
import { SuccessView } from './components/SuccessView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { StressTestPanel } from './components/StressTestPanel';
import { SmartTemplate } from './components/SampleDocs';
import {
  ParsedFormSchema,
  CreateFormResponse,
  ConversionStep,
  BriefConfig,
  Asset,
} from './types';
import {
  AlertCircle,
  Sparkles,
  RotateCcw,
  Save,
  Trash2,
  Key,
  RefreshCw,
} from 'lucide-react';

const STORAGE_KEY_GEMINI = 'formcraft_gemini_api_key';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [step, setStep] = useState<ConversionStep>('idle');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [parsedSchema, setParsedSchema] = useState<ParsedFormSchema | null>(null);
  const [createdForm, setCreatedForm] = useState<CreateFormResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restoredDraftInfo, setRestoredDraftInfo] = useState<string | null>(null);

  // Gemini API key state & modal management
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GEMINI) || '';
    } catch {
      return '';
    }
  });
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);
  const [userAccessToken, setUserAccessToken] = useState<string | undefined>(undefined);

  // Sync user access token when logged in
  useEffect(() => {
    if (user) {
      getAccessToken()
        .then((token) => setUserAccessToken(token || undefined))
        .catch(() => setUserAccessToken(undefined));
    } else {
      setUserAccessToken(undefined);
    }
  }, [user]);

  // Restore autosaved schema from IndexedDB if available on load
  useEffect(() => {
    const restoreSchema = async () => {
      try {
        const savedSchema = await getSchema();
        if (savedSchema && (savedSchema as any).questions && (savedSchema as any).questions.length > 0) {
          setParsedSchema(savedSchema as any);
          setStep('preview');
          setRestoredDraftInfo('Autosaved draft restored from secure storage');
        }
      } catch (e) {
        console.warn('Failed to restore autosaved draft from IndexedDB:', e);
      }
    };
    restoreSchema();
  }, []);

  // Effect to autosave schema when it changes with debouncing
  useEffect(() => {
    if (!parsedSchema) return;
    const timer = setTimeout(() => {
      saveSchema(parsedSchema).catch((err) => {
        console.warn('Draft auto-persist notice:', err);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [parsedSchema]);

  // Fetch backend Gemini configuration state
  useEffect(() => {
    fetch('/api/gemini-config-status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasEnvKey === 'boolean') {
          setHasEnvKey(data.hasEnvKey);
        }
      })
      .catch(() => {
        // Fallback assuming default is active
      });
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setCustomApiKey(newKey);
    try {
      if (newKey) {
        localStorage.setItem(STORAGE_KEY_GEMINI, newKey);
      } else {
        localStorage.removeItem(STORAGE_KEY_GEMINI);
      }
    } catch (e) {
      console.warn('Failed to save API key to localStorage', e);
    }
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser) => {
        setUser(authenticatedUser);
      },
      () => {
        // Not signed in or token not cached
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setErrorMessage(
        err.message || 'Failed to sign in with Google. Please allow popup access and try again.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleReset = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    try {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
      localStorage.removeItem(AUTOSAVE_TIMESTAMP_KEY);
      saveSchema(null).catch(() => {});
    } catch (e) {
      console.warn('Draft cleanup warning:', e);
    }
    setStep('idle');
    setParsedSchema(null);
    setCreatedForm(null);
    setErrorMessage(null);
    setFilePreviewUrl(null);
    setCurrentFileName('');
    setRestoredDraftInfo(null);
  };

  const handleDismissRestoredBanner = () => {
    setRestoredDraftInfo(null);
  };

  const handleClearSavedDraft = () => {
    handleReset();
  };

  const [lastParsePayload, setLastParsePayload] = useState<any>(null);

  // Document parsing helper sending payloads to backend Gemini endpoint
  const parseDocumentWithAI = async (payload: {
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
    textContent?: string;
    briefConfig?: BriefConfig;
    includeDefaultProfile?: boolean;
    includeNotes?: boolean;
    extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
    extractedAssets?: Asset[];
  }) => {
    setLastParsePayload(payload);
    setStep('parsing');
    setErrorMessage(null);
    setRestoredDraftInfo(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customApiKey.trim()) {
        headers['x-gemini-api-key'] = customApiKey.trim();
      }

      // Optimize payload: If digital text was already extracted, avoid sending redundant multi-MB raw base64 document
      const payloadToSend: any = { ...payload };
      if (
        payloadToSend.textContent &&
        payloadToSend.textContent.trim().length > 30 &&
        (payloadToSend.mimeType === 'application/pdf' ||
          payloadToSend.fileName?.toLowerCase().endsWith('.pdf') ||
          payloadToSend.fileName?.toLowerCase().endsWith('.docx'))
      ) {
        delete payloadToSend.fileBase64;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout

      let response: Response;
      try {
        response = await fetch('/api/parse-document', {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            ...payloadToSend,
            userApiKey: customApiKey.trim() || undefined,
          }),
        });
      } catch (fetchErr: any) {
        if (fetchErr.name === 'AbortError') {
          throw new Error('Document processing timed out after 3 minutes. Please click "Retry Processing" or enter a Gemini API key in Settings.');
        }
        throw new Error(
          'Network connection interrupted while connecting to the document parsing service. Please check your internet connection or verify your API key in Settings.'
        );
      } finally {
        clearTimeout(timeoutId);
      }

      let data: any = null;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch (jsonErr) {
        console.warn('Response was not valid JSON:', jsonErr);
      }

      if (!response.ok || !data?.success) {
        const errMessage =
          data?.error ||
          (response.status === 413
            ? 'The uploaded file is too large for web transfer. Please use a smaller file or copy-paste text.'
            : response.status === 429
            ? 'Rate limit reached or server busy. Please retry in a few moments or provide a custom Gemini API key.'
            : `Server processing notice (${response.status}). Please try again.`);
        throw new Error(errMessage);
      }

      setParsedSchema(data.data);
      setStep('preview');
    } catch (error: any) {
      console.error('Parse error:', error);
      setErrorMessage(
        error.message || 'An error occurred while processing the document. Please try again.'
      );
      setStep('error');
    }
  };

  const handleFileSelected = (
    file: File,
    base64: string,
    previewUrl: string | null,
    options?: {
      includeDefaultProfile?: boolean;
      includeNotes?: boolean;
      extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
      extractedDocText?: string;
      extractedAssets?: Asset[];
    }
  ) => {
    setCurrentFileName(file.name);
    setFilePreviewUrl(previewUrl);
    parseDocumentWithAI({
      fileBase64: base64,
      mimeType: file.type || 'application/octet-stream',
      fileName: file.name,
      textContent: options?.extractedDocText,
      includeDefaultProfile: options?.includeDefaultProfile,
      includeNotes: options?.includeNotes,
      extractionMode: options?.extractionMode,
      extractedAssets: options?.extractedAssets || [],
    });
  };

  const handleTextSubmitted = (
    text: string,
    title?: string,
    options?: {
      includeDefaultProfile?: boolean;
      includeNotes?: boolean;
      extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
    }
  ) => {
    setCurrentFileName(title || 'Pasted Document');
    setFilePreviewUrl(null);
    parseDocumentWithAI({
      textContent: text,
      fileName: title,
      includeDefaultProfile: options?.includeDefaultProfile,
      includeNotes: options?.includeNotes,
      extractionMode: options?.extractionMode,
    });
  };

  const handleTemplateSelected = (template: SmartTemplate) => {
    setCurrentFileName(template.name);
    setFilePreviewUrl(null);
    if (template.prebuiltSchema) {
      setParsedSchema(template.prebuiltSchema);
      setStep('preview');
    } else {
      parseDocumentWithAI({
        textContent: template.content,
        fileName: template.name,
        includeDefaultProfile: false,
      });
    }
  };

  const handleBriefSubmitted = (config: BriefConfig) => {
    setCurrentFileName(config.projectTitle);
    setFilePreviewUrl(null);
    parseDocumentWithAI({
      briefConfig: config,
      fileName: config.projectTitle,
      includeDefaultProfile: true,
      extractionMode: 'SMART_ENHANCE',
    });
  };

  const handleAutoLoadDoc = (payload: {
    fileName: string;
    textContent?: string;
    fileBase64?: string;
    mimeType?: string;
    extractedAssets?: Asset[];
    extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
  }) => {
    setIsStressTestOpen(false);
    setCurrentFileName(payload.fileName);
    setFilePreviewUrl(payload.fileBase64 && payload.mimeType?.startsWith('image/') ? payload.fileBase64 : null);
    parseDocumentWithAI({
      fileName: payload.fileName,
      textContent: payload.textContent,
      fileBase64: payload.fileBase64,
      mimeType: payload.mimeType || 'text/plain',
      extractedAssets: payload.extractedAssets || [],
      extractionMode: payload.extractionMode || 'STRICT_VERBATIM',
    });
  };

  // Generate Google Form
  const handleGenerateForm = async () => {
    if (!parsedSchema) return;

    let token = await getAccessToken();
    if (!token) {
      setIsLoggingIn(true);
      try {
        const authResult = await googleSignIn();
        if (authResult) {
          setUser(authResult.user);
          token = authResult.accessToken;
        } else {
          setErrorMessage('Please sign in to Google to create your form.');
          setIsLoggingIn(false);
          return;
        }
      } catch (authErr: any) {
        console.error('Auth error during creation:', authErr);
        setErrorMessage(
          authErr.message || 'Google authentication required to create Google Forms.'
        );
        setIsLoggingIn(false);
        return;
      } finally {
        setIsLoggingIn(false);
      }
    }

    setStep('generating');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/forms/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formSchema: parsedSchema,
          accessToken: token,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create Google Form.');
      }

      setCreatedForm(data.data);
      setStep('success');
    } catch (error: any) {
      console.error('Creation error:', error);
      setErrorMessage(
        error.message || 'Failed to create form in Google Forms. Please try again.'
      );
      setStep('preview');
    }
  };

  const handleSchemaUpdated = (updatedSchema: ParsedFormSchema) => {
    setParsedSchema(updatedSchema);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header Navigation */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onReset={handleReset}
        hasActiveWorkflow={step !== 'idle'}
        isLoggingIn={isLoggingIn}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        apiKeyConfigured={Boolean(customApiKey.trim())}
        onToggleStressTest={() => setIsStressTestOpen((prev) => !prev)}
        isStressTestOpen={isStressTestOpen}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Isolated Development-Only Stress Test Environment Panel */}
        {isStressTestOpen && (
          <div className="mb-6">
            <StressTestPanel
              customApiKey={customApiKey}
              userAccessToken={userAccessToken}
              onClose={() => setIsStressTestOpen(false)}
              onAutoLoadDoc={handleAutoLoadDoc}
            />
          </div>
        )}
        {/* Restored Draft Banner */}
        {restoredDraftInfo && step === 'preview' && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-900 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100/80 text-emerald-800 rounded-xl">
                <Save className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold">{restoredDraftInfo}</p>
                <p className="text-[11px] text-emerald-700/80">
                  Your edits are automatically preserved locally so you never lose work.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleDismissRestoredBanner}
                className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold hover:bg-emerald-200 transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleClearSavedDraft}
                className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-1 cursor-pointer"
                title="Discard this draft and start fresh"
              >
                <Trash2 className="w-3 h-3" />
                <span>Discard Draft</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Error Alert Banner */}
        {errorMessage && step !== 'error' && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Notice</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold text-base px-1 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Step: Idle / Document Ingestion */}
        {step === 'idle' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <Dropzone
              onFileSelected={handleFileSelected}
              onTextSubmitted={handleTextSubmitted}
              onBriefSubmitted={handleBriefSubmitted}
              onTemplateSelected={handleTemplateSelected}
              isProcessing={false}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              apiKeyConfigured={Boolean(customApiKey.trim())}
              hasEnvKey={hasEnvKey}
            />
          </div>
        )}

        {/* Step: Parsing / Gemini Conversion Progress */}
        {step === 'parsing' && (
          <ParsingProgress fileName={currentFileName} onCancel={handleReset} />
        )}

        {/* Step: Interactive Schema Review & Editing */}
        {step === 'preview' && parsedSchema && (
          <SchemaEditor
            schema={parsedSchema}
            onChange={handleSchemaUpdated}
            onGenerateForm={handleGenerateForm}
            onReset={handleReset}
            user={user}
            onLogin={handleLogin}
            isGenerating={false}
            isLoggingIn={isLoggingIn}
          />
        )}

        {/* Step: Generating Form & Sheets */}
        {step === 'generating' && (
          <div className="max-w-lg mx-auto py-16 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-emerald-100 animate-ping opacity-25" />
              <div className="relative w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-emerald-400 animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Publishing to Google Forms &amp; Connected Sheet...
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Setting up question types, uploading images to Drive, and linking a live Google Spreadsheet for real-time response capture.
              </p>
            </div>
          </div>
        )}

        {/* Step: Success & Response Dashboard */}
        {step === 'success' && createdForm && (
          <SuccessView
            formData={createdForm}
            onReset={handleReset}
          />
        )}

        {/* Step: Error State */}
        {step === 'error' && (
          <div className="max-w-md mx-auto py-12 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">Processing Interrupted</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {errorMessage || 'Unable to extract form structure from this document.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {lastParsePayload && (
                <button
                  id="btn-error-retry"
                  onClick={() => parseDocumentWithAI(lastParsePayload)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Processing</span>
                </button>
              )}

              <button
                id="btn-error-apikey"
                onClick={() => setIsApiKeyModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Key className="w-4 h-4 text-indigo-600" />
                <span>API Settings</span>
              </button>

              <button
                id="btn-error-reset"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>Try Another Document</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Google Forms API &amp; Gemini 2.5 Flash Connected</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Fast, Private &amp; Local-First Processing</span>
          </div>
        </div>
      </footer>

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={customApiKey}
        onSaveKey={handleSaveApiKey}
        hasEnvKey={hasEnvKey}
      />
    </div>
  );
}
