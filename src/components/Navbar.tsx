import React from 'react';
import { FileSpreadsheet, RotateCcw, LogOut, CheckCircle2, User as UserIcon, Sparkles, Key, FlaskConical, Clock, HelpCircle } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onReset: () => void;
  hasActiveWorkflow: boolean;
  isLoggingIn: boolean;
  onOpenApiKeyModal: () => void;
  apiKeyConfigured: boolean;
  activeProviderName?: string;
  onOpenHistory?: () => void;
  onOpenHelpGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  onReset,
  hasActiveWorkflow,
  isLoggingIn,
  onOpenApiKeyModal,
  apiKeyConfigured,
  activeProviderName = 'OpenRouter / Gemini',
  onOpenHistory,
  onOpenHelpGuide,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-base">
                FormCraft AI
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                {activeProviderName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Doc &amp; Brief to Google Forms &amp; Connected Sheets
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Help & Tutorials Button */}
          {onOpenHelpGuide && (
            <button
              id="btn-nav-help-guide"
              type="button"
              onClick={onOpenHelpGuide}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
              title="Open FormCraft Help Guide & FAQ"
            >
              <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Help &amp; Guide</span>
            </button>
          )}

          {/* History / Previous Forms Button */}
          {onOpenHistory && (
            <button
              id="btn-nav-history"
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
              title="View previous forms and saved drafts"
            >
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          {/* API Key Modal Button */}
          <button
            id="btn-nav-api-key"
            type="button"
            onClick={onOpenApiKeyModal}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 sm:py-2 text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              apiKeyConfigured
                ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/70'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Configure your own Google Gemini API key"
          >
            <Key className={`h-3.5 w-3.5 ${apiKeyConfigured ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">API Key</span>
            {apiKeyConfigured && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          {/* Prominent Reset Button */}
          {hasActiveWorkflow && (
            <button
              id="nav-reset-button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
              title="Reset workflow and start a new form"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-600" />
              <span>New Form</span>
            </button>
          )}

          {/* Auth State */}
          {user ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 py-1 pl-1.5 pr-2.5 sm:pr-3 shadow-2xs">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="h-7 w-7 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-slate-800 leading-none max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                </div>
                <span className="text-[10px] text-slate-500 leading-none block mt-0.5 truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>
              <button
                id="btn-logout"
                onClick={onLogout}
                className="ml-1 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                title="Sign out of Google"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="nav-google-login-button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-60 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
