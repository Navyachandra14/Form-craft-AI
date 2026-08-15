import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, getAccessToken, logout } from './lib/auth';
import { Navbar } from './components/Navbar';
import { Dropzone } from './components/Dropzone';
import { ParsingProgress } from './components/ParsingProgress';
import { SchemaEditor, AUTOSAVE_STORAGE_KEY, AUTOSAVE_TIMESTAMP_KEY } from './components/SchemaEditor';
import { SuccessView } from './components/SuccessView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SmartTemplate } from './components/SampleDocs';
import {
  ParsedFormSchema,
  CreateFormResponse,
  ConversionStep,
  BriefConfig,
} from './types';
import {
  AlertCircle,
  Sparkles,
  RotateCcw,
  Save,
  Trash2,
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

  // Restore autosaved schema from local storage if available on load (prevents ghost pages / accidental loss)
  useEffect(() => {
    try {
      const savedSchemaRaw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(AUTOSAVE_TIMESTAMP_KEY);
      if (savedSchemaRaw) {
        const parsed = JSON.parse(savedSchemaRaw);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          setParsedSchema(parsed);
          setStep('preview');
          setRestoredDraftInfo(savedTimestamp ? `Autosaved draft restored (${savedTimestamp})` : 'Autosaved draft restored');
        }
      }
    } catch (e) {
      console.warn('Failed to restore autosaved draft:', e);
    }
  }, []);

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

  // Full state reset
  const handleReset = () => {
    setStep('idle');
    setCurrentFileName('');
    setFilePreviewUrl(null);
    setParsedSchema(null);
    setCreatedForm(null);
    setErrorMessage(null);
  };

  // Process Document / Image / Brief with Gemini 2.5 Flash
  const parseDocumentWithAI = async (payload: {
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
    textContent?: string;
    briefConfig?: BriefConfig;
    includeDefaultProfile?: boolean;
    includeNotes?: boolean;
    extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
  }) => {
    setStep('parsing');
    setErrorMessage(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customApiKey.trim()) {
        headers['x-gemini-api-key'] = customApiKey.trim();
      }

      const response = await fetch('/api/parse-document', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...payload,
          includeDefaultProfile: payload.includeDefaultProfile !== undefined ? payload.includeDefaultProfile : true,
          includeNotes: payload.includeNotes !== undefined ? payload.includeNotes : false,
          extractionMode: payload.extractionMode || 'STRICT_VERBATIM',
          userApiKey: customApiKey.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze document structure.');
      }

      setParsedSchema(data.data);
      setStep('preview');
    } catch (err: any) {
      console.error('Parsing error:', err);
      setErrorMessage(
        err.message || 'An error occurred while parsing the document with Gemini AI.'
      );
      setStep('error');
    }
  };

  const handleFileSelected = (
    file: File,
    base64: string,
    preview: string | null,
    options?: {
      includeDefaultProfile?: boolean;
      includeNotes?: boolean;
      extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
      extractedDocText?: string;
    }
  ) => {
    setCurrentFileName(file.name);
    setFilePreviewUrl(preview);
    parseDocumentWithAI({
      fileBase64: base64,
      mimeType: file.type || 'application/octet-stream',
      fileName: file.name,
      textContent: options?.extractedDocText,
      includeDefaultProfile: options?.includeDefaultProfile,
      includeNotes: options?.includeNotes,
      extractionMode: options?.extractionMode,
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
      // Instant load without AI delay or guessing
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

  // Generate Google Form
  const handleGenerateForm = async () => {
    if (!parsedSchema) return;

    // Check if token exists; if not, prompt sign-in first
    let token = await getAccessToken();
    if (!token) {
      setIsLoggingIn(true);
      try {
        const authResult = await googleSignIn();
        if (authResult) {
          setUser(authResult.user);
          token = authResult.accessToken;
        } else {
          throw new Error('Google Sign-In is required to generate forms in your account.');
        }
      } catch (err: any) {
        setIsLoggingIn(false);
        setErrorMessage(
          err.message || 'Please sign in to Google to create forms in your Google Drive.'
        );
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
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formSchema: parsedSchema,
          accessToken: token,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        // If token expired or permission missing
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            'Google OAuth session expired or missing Forms permissions. Please sign in again.'
          );
        }
        throw new Error(data.error || 'Failed to create Google Form.');
      }

      setCreatedForm(data.data);
      setStep('success');
    } catch (err: any) {
      console.error('Form generation error:', err);
      setErrorMessage(
        err.message || 'Failed to generate Google Form. Please verify your connection.'
      );
      setStep('preview'); // Return to preview so user does not lose edited schema
    }
  };

  const hasActiveWorkflow = step !== 'idle';

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col font-sans text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onReset={handleReset}
        hasActiveWorkflow={hasActiveWorkflow}
        isLoggingIn={isLoggingIn}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        apiKeyConfigured={Boolean(customApiKey.trim())}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Error Banner */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm text-rose-800">
              <p className="font-bold mb-0.5">Notice</p>
              <p>{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 text-xs font-semibold px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Workflow Views */}
        {step === 'idle' && (
          <div className="space-y-8">
            {/* Header Hero Section */}
            <div className="text-center max-w-2xl mx-auto space-y-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Turn any document into a live Google Form
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                Upload a document, describe your requirements, or select a pre-configured Smart Template.
              </p>
            </div>

            {/* Ingestion Dropzone & Smart Templates */}
            <Dropzone
              onFileSelected={handleFileSelected}
              onTextSubmitted={handleTextSubmitted}
              onBriefSubmitted={handleBriefSubmitted}
              onTemplateSelected={handleTemplateSelected}
              isProcessing={step === 'parsing'}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              apiKeyConfigured={Boolean(customApiKey.trim())}
              hasEnvKey={hasEnvKey}
            />
          </div>
        )}

        {step === 'parsing' && (
          <ParsingProgress fileName={currentFileName} onCancel={handleReset} />
        )}

        {step === 'preview' && parsedSchema && (
          <SchemaEditor
            schema={parsedSchema}
            onChange={setParsedSchema}
            onGenerateForm={handleGenerateForm}
            onReset={handleReset}
            user={user}
            onLogin={handleLogin}
            isGenerating={false}
            isLoggingIn={isLoggingIn}
          />
        )}

        {step === 'generating' && parsedSchema && (
          <SchemaEditor
            schema={parsedSchema}
            onChange={setParsedSchema}
            onGenerateForm={handleGenerateForm}
            onReset={handleReset}
            user={user}
            onLogin={handleLogin}
            isGenerating={true}
            isLoggingIn={isLoggingIn}
          />
        )}

        {step === 'success' && createdForm && (
          <SuccessView formData={createdForm} onReset={handleReset} />
        )}

        {step === 'error' && (
          <div className="max-w-md mx-auto py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Processing Interrupted</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {errorMessage || 'Unable to extract form structure from this document.'}
            </p>
            <button
              id="btn-error-reset"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Try Another Document</span>
            </button>
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
