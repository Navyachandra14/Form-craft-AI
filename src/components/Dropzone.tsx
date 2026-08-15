import React, { useRef, useState } from 'react';
import mammoth from 'mammoth';
import {
  UploadCloud,
  FileText,
  Camera,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
  CheckCircle2,
  Key,
  UserPlus,
  Briefcase,
  Calendar,
  FileCheck,
  MessageSquare,
  ShieldCheck,
  Zap,
  Layers,
  Settings2,
  Search,
} from 'lucide-react';
import { SMART_TEMPLATES, SmartTemplate } from './SampleDocs';
import { BriefConfig, ParsedFormSchema, ProjectCategory } from '../types';

interface DropzoneProps {
  onFileSelected: (
    file: File,
    base64: string,
    previewUrl: string | null,
    options?: {
      includeDefaultProfile?: boolean;
      includeNotes?: boolean;
      extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
      extractedDocText?: string;
    }
  ) => void;
  onTextSubmitted: (
    text: string,
    title?: string,
    options?: {
      includeDefaultProfile?: boolean;
      includeNotes?: boolean;
      extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
    }
  ) => void;
  onBriefSubmitted: (config: BriefConfig) => void;
  onTemplateSelected: (template: SmartTemplate) => void;
  isProcessing: boolean;
  onOpenApiKeyModal?: () => void;
  apiKeyConfigured?: boolean;
  hasEnvKey?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelected,
  onTextSubmitted,
  onBriefSubmitted,
  onTemplateSelected,
  isProcessing,
  onOpenApiKeyModal,
  apiKeyConfigured,
  hasEnvKey,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'templates' | 'prompt'>('upload');

  // Streamlined Form Defaults (Default to purely what is in the document)
  const [includeDefaultProfile, setIncludeDefaultProfile] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false); // Clean checkbox mode
  const [extractionMode, setExtractionMode] = useState<'STRICT_VERBATIM' | 'SMART_ENHANCE'>('STRICT_VERBATIM');

  // Prompt / Idea Description State
  const [promptIdea, setPromptIdea] = useState('');
  const [formTitle, setFormTitle] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds 25MB limit.');
      return;
    }

    const fileNameLower = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/.test(fileNameLower);
    const isPdf = file.type === 'application/pdf' || fileNameLower.endsWith('.pdf');
    const isDocx = fileNameLower.endsWith('.docx') || file.type.includes('wordprocessingml');
    const isTextDoc =
      file.type.startsWith('text/') ||
      fileNameLower.endsWith('.txt') ||
      fileNameLower.endsWith('.md') ||
      fileNameLower.endsWith('.csv');

    if (!isImage && !isPdf && !isDocx && !isTextDoc) {
      setErrorMessage('Please upload a PDF, Word document (.docx), image scan, or text file.');
      return;
    }

    if (isDocx) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        const text = mammothResult.value || '';

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = (e.target?.result as string) || '';
          onFileSelected(file, result, null, {
            includeDefaultProfile,
            includeNotes,
            extractionMode,
            extractedDocText: text,
          });
        };
        reader.readAsDataURL(file);
        return;
      } catch (err) {
        console.warn('Docx fallback', err);
      }
    }

    if (isTextDoc) {
      const textReader = new FileReader();
      textReader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        onTextSubmitted(text, file.name.replace(/\.[^/.]+$/, ''), {
          includeDefaultProfile,
          includeNotes,
          extractionMode,
        });
      };
      textReader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = (e.target?.result as string) || '';
      onFileSelected(file, result, isImage ? result : null, {
        includeDefaultProfile,
        includeNotes,
        extractionMode,
      });
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptIdea.trim()) {
      setErrorMessage('Please enter your form idea or requirements.');
      return;
    }
    setErrorMessage(null);
    onTextSubmitted(promptIdea.trim(), formTitle.trim() || undefined, {
      includeDefaultProfile,
      includeNotes,
      extractionMode: 'SMART_ENHANCE',
    });
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'user-plus':
        return <UserPlus className="w-5 h-5 text-indigo-600" />;
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-emerald-600" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'file-check':
        return <FileCheck className="w-5 h-5 text-amber-600" />;
      case 'message-square':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Streamlined Mode Navigation */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/80 shadow-2xs gap-1">
          <button
            id="tab-upload-doc"
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-slate-700" />
            <span>Upload Document</span>
          </button>

          <button
            id="tab-smart-templates"
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Smart Templates</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              Ready
            </span>
          </button>

          <button
            id="tab-describe-idea"
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'prompt'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Describe Idea</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <p className="flex-1 text-xs sm:text-sm font-medium">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 1: Upload Document */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? 'border-slate-900 bg-slate-100/90 scale-[0.99]'
                : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/70 shadow-xs'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,image/png,image/jpeg,image/jpg,image/webp,.txt,.md,.csv"
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3.5 pointer-events-none">
              <div className="w-13 h-13 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform border border-slate-200 shadow-2xs">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="space-y-1 max-w-md">
                <p className="text-base font-bold text-slate-900">
                  Drop your document, PDF, Word doc, or photo here
                </p>
                <p className="text-xs text-slate-500">
                  Supports PDF, Word (.docx), high-res photo scans, and plain text
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  📄 PDF
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  📝 Word (.docx)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  🖼️ Photo Scan
                </span>
              </div>
            </div>
          </div>

          {/* Minimal Controls Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-800 font-semibold">
                <input
                  type="checkbox"
                  checked={includeDefaultProfile}
                  onChange={(e) => setIncludeDefaultProfile(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Auto-fill Name, Email &amp; Phone Fields</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-800 font-semibold">
                <input
                  type="checkbox"
                  checked={!includeNotes}
                  onChange={(e) => setIncludeNotes(!e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Clean Checkboxes (Omit blank notes)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-slate-600" />
                <span>Snap Camera</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
              >
                <span>Browse File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Smart Templates (Pre-configured forms without AI guessing) */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pre-Configured Smart Templates</h3>
              <p className="text-xs text-slate-500">
                Instant starting points with auto-filled contact fields, standardized options, and validation rules.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
              100% Deterministic (Zero Guesswork)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {SMART_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-4.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-slate-200/70 transition-colors">
                      {getTemplateIcon(tmpl.iconName)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                      {tmpl.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    {tmpl.prebuiltSchema.questions.length} questions
                  </span>
                  <button
                    id={`btn-use-template-${tmpl.id}`}
                    type="button"
                    onClick={() => onTemplateSelected(tmpl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer group-hover:bg-indigo-600"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Describe Idea / Paste Text */}
      {activeTab === 'prompt' && (
        <form onSubmit={handlePromptSubmit} className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <label htmlFor="prompt-form-title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Form Title (Optional)
              </label>
              <input
                id="prompt-form-title"
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Volunteer Application & Committee Sign-Up"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 focus:bg-white transition-all text-slate-900 font-medium"
              />
            </div>

            <div>
              <label htmlFor="prompt-idea-textarea" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Describe Your Form Idea, Questions, or Scope
              </label>
              <textarea
                id="prompt-idea-textarea"
                rows={6}
                value={promptIdea}
                onChange={(e) => setPromptIdea(e.target.value)}
                placeholder={`Describe the form in natural language or paste raw questions...\n\nExample:\n"Create a vendor registration form collecting business name, tax ID, product categories (apparel, electronics, food), liability insurance confirmation checkbox, and delivery schedule preference."`}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 focus:bg-white transition-all text-slate-800 leading-relaxed font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  checked={includeDefaultProfile}
                  onChange={(e) => setIncludeDefaultProfile(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Include standard Full Name &amp; Email fields</span>
              </label>

              <button
                id="btn-generate-from-prompt"
                type="submit"
                disabled={!promptIdea.trim() || isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                <span>Generate Form Schema</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Clean Pipeline Steps (Showing what's happening clearly without bloat) */}
      <div className="pt-2">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Layers className="w-4 h-4 text-slate-700" />
            <span>Workflow Steps:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-800 font-bold">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              Upload / Prompt
            </span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1.5 text-slate-800 font-bold">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              AI Extraction
            </span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1.5 text-slate-800 font-bold">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              Review &amp; Edit
            </span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">4</span>
              Live Google Form &amp; Sheet
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
