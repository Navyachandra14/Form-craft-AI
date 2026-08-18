import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Sparkles,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  HelpCircle as QuestionIcon,
  Layers,
  Zap,
  Mail,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  ArrowRight,
  Clock,
  Settings2,
  Share2,
  FileCode,
  Check,
  Compass,
} from 'lucide-react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'features' | 'workflow' | 'faq';
  onStartTour?: () => void;
}

type TabType = 'features' | 'workflow' | 'faq';

export const HelpGuide: React.FC<HelpGuideProps> = ({
  isOpen,
  onClose,
  initialTab = 'features',
  onStartTour,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Which file formats are supported for automatic conversion?',
      a: 'FormCraft AI supports Microsoft Word (.docx), Adobe Acrobat (.pdf), Plain Text (.txt), and Markdown (.md). It also supports raw image uploads (PNG/JPG) for photo-based quizzes and prompts via the Project Brief generator.',
    },
    {
      q: 'How does Gemini extract math equations, diagrams, and rubrics?',
      a: 'FormCraft AI utilizes Gemini 2.5 Flash with multimodal vision and LaTeX formula preservation. Embedded charts and diagrams are extracted as high-resolution assets and linked to their respective questions.',
    },
    {
      q: 'Do I need my own Gemini API Key?',
      a: 'A shared server key is provided by default. If you encounter rate limits or prefer your own quota, you can click "API Key" in the navigation bar to configure your personal Google Gemini API key securely in browser storage.',
    },
    {
      q: 'How does publishing to Google Forms and Google Sheets work?',
      a: 'Clicking "Publish to Google Forms" initiates Google OAuth token authorization. The application then calls the Google Forms API batchUpdate endpoint to generate the form in your Google Drive and automatically links a response spreadsheet.',
    },
    {
      q: 'Are my draft edits saved automatically?',
      a: 'Yes! Every modification to questions, choices, point values, and section titles is automatically persisted locally to IndexedDB and localStorage so you can refresh or return anytime without losing work.',
    },
    {
      q: 'What question types are supported in Google Forms output?',
      a: 'FormCraft AI supports Short Answer, Paragraph, Multiple Choice (Single-Select), Checkboxes (Multi-Select), Dropdowns, Linear Scales (e.g. 1 to 5 Likert), Date/Time pickers, and Multiple Choice Grids.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-emerald-400 shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  FormCraft AI Help Guide &amp; Reference
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3" />
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Learn features, understand conversion workflows, and find answers to common questions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onStartTour && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartTour();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>Interactive Tour</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-100 bg-white gap-1 sm:gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'features'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Core Features</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'workflow'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Conversion Workflow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'faq'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QuestionIcon className="w-4 h-4 text-amber-600" />
            <span>Frequently Asked Questions</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CORE FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Multimodal Ingestion</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Processes DOCX, PDF, scans, and Markdown with OCR and LaTeX equation preservation.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                    <Settings2 className="w-4 h-4" />
                    <span>Interactive Schema Editor</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Reorder questions, toggle required validation, set answer keys, and adjust points with instant preview.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Google Sheets Linking</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Auto-creates connected response spreadsheets in your Google Drive for instant aggregation and scoring.
                  </p>
                </div>
              </div>

              {/* Supported Question Types Matrix */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Supported Google Forms Question Types
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block">Multiple Choice</span>
                    <span className="text-[11px] text-slate-500">Single select radio buttons</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block">Checkboxes</span>
                    <span className="text-[11px] text-slate-500">Multi-select options</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block">Short &amp; Paragraph Text</span>
                    <span className="text-[11px] text-slate-500">Open-ended text responses</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block">Linear Likert Scale</span>
                    <span className="text-[11px] text-slate-500">1 to 5 / 1 to 10 ratings</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">Upload or Prompt</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Upload your document or provide a prompt brief. FormCraft AI reads the layout, extracts text and embedded images, and maps them to form fields.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">Review &amp; Refine Schema</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Verify questions, change question types if needed, adjust point values, and mark correct answers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-xs font-bold shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">Publish to Google Drive</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sign in with Google to create the form directly in your Google Drive. Get instant respondent links and paired Google Sheet responses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions & answers..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                {filteredFaqs.map((faq, index) => {
                  const isExpanded = expandedFaq === index;
                  return (
                    <div
                      key={index}
                      className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isExpanded ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span className="pr-4">{faq.q}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>FormCraft AI automatically preserves your drafts in local storage.</span>
          </div>

          <div className="flex items-center gap-2">
            {onStartTour && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartTour();
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quick Tour</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
