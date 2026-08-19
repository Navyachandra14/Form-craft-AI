import React, { useRef, useState } from 'react';
import mammoth from 'mammoth';
import {
  UploadCloud,
  FileText,
  Camera,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
  UserPlus,
  Briefcase,
  Calendar,
  FileCheck,
  MessageSquare,
  ShieldCheck,
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  Lightbulb,
} from 'lucide-react';
import { SMART_TEMPLATES, SmartTemplate } from './SampleDocs';
import { BriefConfig, Asset } from '../types';
import { extractPdfPagesAndImages } from '../lib/pdfExtractor';

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
      extractedAssets?: Asset[];
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
  onBriefSubmitted?: (config: BriefConfig) => void;
  onTemplateSelected: (template: SmartTemplate) => void;
  isProcessing: boolean;
  onOpenApiKeyModal?: () => void;
  apiKeyConfigured?: boolean;
  hasEnvKey?: boolean;
  onOpenHistory?: () => void;
  onOpenHelpGuide?: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelected,
  onTextSubmitted,
  onTemplateSelected,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState<boolean>(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState<boolean>(false);
  const [showPromptIdeasDropdown, setShowPromptIdeasDropdown] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extraction Options (encapsulated in Settings Dropdown)
  const [includeDefaultProfile, setIncludeDefaultProfile] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [extractionMode, setExtractionMode] = useState<'STRICT_VERBATIM' | 'SMART_ENHANCE'>('STRICT_VERBATIM');

  // Prompt / Idea Description State
  const [promptIdea, setPromptIdea] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const promptExamples = [
    {
      title: 'Candidate Technical Screening Quiz',
      prompt:
        'Create a 10-question technical screening quiz for Software Engineers:\n- Candidate Name, Email, and GitHub URL\n- 5 multiple-choice questions on JavaScript, React hooks, and REST APIs\n- 3 questions on SQL database indexing and performance\n- 2 open-ended problem solving scenarios\n- Include 80% passing grade logic',
      badge: 'Hiring',
    },
    {
      title: 'Quarterly Employee Pulse Survey',
      prompt:
        'Create an anonymous quarterly employee feedback survey:\n- Team / Department selection dropdown\n- 1-5 Rating scale on work-life balance and psychological safety\n- Multiple-choice questions on tooling and management support\n- Open feedback suggestions for workplace improvement',
      badge: 'Feedback',
    },
    {
      title: 'Tech Summit Event Registration & RSVP',
      prompt:
        'Create a complete attendee registration form for a Tech Summit:\n- Attendee Full Name, Work Email, Company, Job Title\n- Days attending (Day 1 Keynote, Day 2 Workshops)\n- Dietary restrictions (Vegetarian, Vegan, Halal, Gluten-Free)\n- T-shirt size and workshop preference checkboxes',
      badge: 'Events',
    },
    {
      title: 'STEM Physics & Math Assessment',
      prompt:
        'Create a 5-question STEM diagnostic quiz with LaTeX formulas:\n- Calculate kinetic energy: $E_k = \\frac{1}{2}mv^2$ given $m=4\\text{kg}, v=3\\text{m/s}$\n- Multiple-choice questions with formula options\n- Step-by-step written explanation required for final question',
      badge: 'STEM',
    },
  ];

  // Universal file processor
  const processFile = async (file: File) => {
    setErrorMessage(null);

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds 25MB limit.');
      return;
    }

    const fileNameLower = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/.test(fileNameLower);
    const isPdf = file.type === 'application/pdf' || fileNameLower.endsWith('.pdf');
    const isDocx = fileNameLower.endsWith('.docx') || file.type.includes('wordprocessingml');
    const isCsv = fileNameLower.endsWith('.csv') || file.type === 'text/csv';
    const isJson = fileNameLower.endsWith('.json') || file.type === 'application/json';
    const isMarkdown = fileNameLower.endsWith('.md') || fileNameLower.endsWith('.markdown') || file.type === 'text/markdown';
    const isExcel = fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel');
    const isTextDoc =
      file.type.startsWith('text/') ||
      fileNameLower.endsWith('.txt') ||
      fileNameLower.endsWith('.rtf') ||
      fileNameLower.endsWith('.log');

    if (!isImage && !isPdf && !isDocx && !isCsv && !isJson && !isMarkdown && !isExcel && !isTextDoc) {
      setErrorMessage('Please upload a supported file: PDF, Word (.docx), CSV, Excel, JSON, Markdown, Text, or Photo Scan.');
      return;
    }

    // 1. JSON Files
    if (isJson) {
      try {
        const text = await file.text();
        try {
          const parsed = JSON.parse(text);
          if (parsed && parsed.questions && Array.isArray(parsed.questions) && parsed.title) {
            const customTemplate: SmartTemplate = {
              id: `imported-json-${Date.now()}`,
              name: parsed.title,
              badge: 'Imported JSON',
              description: parsed.description || 'Imported form definition schema',
              category: 'Imported',
              iconName: 'file-check',
              content: text,
              prebuiltSchema: parsed,
            };
            onTemplateSelected(customTemplate);
            return;
          }
        } catch {
          // Parse via AI
        }

        onTextSubmitted(text, file.name.replace(/\.[^/.]+$/, ''), {
          includeDefaultProfile,
          includeNotes,
          extractionMode,
        });
        return;
      } catch (jsonErr) {
        console.warn('JSON read notice:', jsonErr);
      }
    }

    // 2. CSV / Markdown / Plain Text
    if (isCsv || isMarkdown || isTextDoc) {
      try {
        const text = await file.text();
        const baseTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        onTextSubmitted(text, baseTitle, {
          includeDefaultProfile,
          includeNotes,
          extractionMode,
        });
        return;
      } catch (textErr) {
        console.warn('Text file read notice:', textErr);
      }
    }

    // 3. Word Document (.docx)
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
        console.warn('Docx extraction fallback:', err);
      }
    }

    // 4. PDF Document with visual extraction
    if (isPdf) {
      try {
        const pdfResult = await extractPdfPagesAndImages(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = (e.target?.result as string) || '';
          onFileSelected(file, result, pdfResult.assets[0]?.dataUrl || null, {
            includeDefaultProfile,
            includeNotes,
            extractionMode,
            extractedDocText: pdfResult.structuredText,
            extractedAssets: pdfResult.assets,
          });
        };
        reader.readAsDataURL(file);
        return;
      } catch (pdfErr) {
        console.warn('PDF automatic extraction notice:', pdfErr);
      }
    }

    // 5. Images and Spreadsheets
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
      setErrorMessage('Please enter your form outline or prompt.');
      return;
    }
    setErrorMessage(null);
    onTextSubmitted(promptIdea.trim(), formTitle.trim() || undefined, {
      includeDefaultProfile,
      includeNotes,
      extractionMode,
    });
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'user-plus':
        return <UserPlus className="w-4 h-4 text-indigo-600" />;
      case 'briefcase':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'file-check':
        return <FileCheck className="w-4 h-4 text-amber-600" />;
      case 'message-square':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Visual Evaluation', label: 'Visual & Rubrics' },
    { id: 'Recruitment & Assessment', label: 'Hiring & Screening' },
    { id: 'Customer Feedback', label: 'Surveys' },
    { id: 'Event Operations', label: 'Events' },
  ];

  const filteredTemplates = SMART_TEMPLATES.filter(
    (tmpl) => selectedCategory === 'all' || tmpl.category.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Global Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl shadow-2xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <p className="flex-1 text-xs sm:text-sm font-medium">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CORE SINGLE-TAB WORKSPACE: Side-by-Side Drag & Drop and Prompt Input */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* CARD 1: File Drag & Drop (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Drag &amp; Drop Any File</h2>
                <p className="text-[11px] text-slate-500">PDF, Word, CSV, Excel, JSON, Markdown, or Photo Scans</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Capture document using device camera"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Camera</span>
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,image/*,.txt,.md,.markdown,.csv,.json,.xlsx,.xls"
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

          {/* Drag & Drop Visual Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 min-h-[220px] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              isDragging
                ? 'border-slate-900 bg-slate-100/90 scale-[0.99]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-800 border border-slate-200 shadow-2xs">
                <UploadCloud className="w-6 h-6 text-slate-700" />
              </div>

              <div className="space-y-1 max-w-sm">
                <p className="text-sm font-bold text-slate-900">
                  Drop document here, or click to browse
                </p>
                <p className="text-xs text-slate-500">
                  AI reads text, tables, checkboxes, formulas &amp; visual rubrics
                </p>
              </div>

              {/* Supported Format Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 text-[10px] font-bold border border-slate-200 shadow-2xs">
                  PDF
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 text-[10px] font-bold border border-slate-200 shadow-2xs">
                  Word (.docx)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 text-[10px] font-bold border border-slate-200 shadow-2xs">
                  CSV / Excel
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 text-[10px] font-bold border border-slate-200 shadow-2xs">
                  JSON / Markdown
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 text-[10px] font-bold border border-slate-200 shadow-2xs">
                  Images
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">Up to 25MB</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Browse Files</span>
            </button>
          </div>
        </div>

        {/* CARD 2: Describe Your Idea or Paste Raw Text (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Describe Your Idea or Paste Text</h2>
                <p className="text-[11px] text-slate-500">AI turns prompts and notes into structured forms</p>
              </div>
            </div>

            {/* Example Prompts Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPromptIdeasDropdown((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px]">Ideas</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showPromptIdeasDropdown && (
                <div className="absolute right-0 top-9 z-20 w-72 p-2 bg-white border border-slate-200 rounded-2xl shadow-lg space-y-1.5 animate-in fade-in">
                  <div className="px-2 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Idea Starters
                  </div>
                  {promptExamples.map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setFormTitle(ex.title);
                        setPromptIdea(ex.prompt);
                        setShowPromptIdeasDropdown(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                          {ex.title}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {ex.badge}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handlePromptSubmit} className="flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <input
                id="prompt-form-title"
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Form Title (Optional)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 focus:bg-white text-slate-900 font-medium transition-all"
              />

              <textarea
                id="prompt-idea-textarea"
                rows={6}
                value={promptIdea}
                onChange={(e) => setPromptIdea(e.target.value)}
                placeholder="Type your form requirements, question list, survey outline, raw Markdown, or JSON here..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 focus:bg-white text-slate-800 leading-relaxed font-sans transition-all resize-y"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setPromptIdea('');
                  setFormTitle('');
                }}
                disabled={!promptIdea && !formTitle}
                className="text-[11px] text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                Clear
              </button>

              <button
                id="btn-generate-from-prompt"
                type="submit"
                disabled={!promptIdea.trim() || isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* DROPDOWN ACCORDION CONTROLS (Keeps the main tab clean and distraction-free) */}
      <div className="space-y-3 pt-2">
        
        {/* DROPDOWN 1: Ready-Made Smart Templates */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <button
            id="btn-toggle-templates-dropdown"
            type="button"
            onClick={() => setShowTemplatesDropdown((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-3 text-left hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Ready-Made Smart Templates
                </span>
                <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-500">
                  (Visual Rubrics, Hiring Tests, Surveys &amp; STEM Quizzes)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">
                {SMART_TEMPLATES.length} templates
              </span>
              <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-slate-200/80 transition-colors">
                {showTemplatesDropdown ? (
                  <ChevronUp className="w-4 h-4 text-slate-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </div>
          </button>

          {showTemplatesDropdown && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/60">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Instant Pre-Configured Templates
                  </h3>
                  <p className="text-xs text-slate-500">
                    1-click starting points with pre-built questions, formulas, and response sync.
                  </p>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-slate-900 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                          {getTemplateIcon(tmpl.iconName)}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                          {tmpl.badge}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {tmpl.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
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
                        onClick={() => {
                          setShowTemplatesDropdown(false);
                          onTemplateSelected(tmpl);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <span>Use</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DROPDOWN 2: Extraction & Parsing Settings */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <button
            id="btn-toggle-settings-dropdown"
            type="button"
            onClick={() => setShowSettingsDropdown((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-3 text-left hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Extraction &amp; Formatting Options
                </span>
                <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-500">
                  (Profile fields, clean checkbox notes, verbatim strictness)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-slate-200/80 transition-colors">
                {showSettingsDropdown ? (
                  <ChevronUp className="w-4 h-4 text-slate-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </div>
          </button>

          {showSettingsDropdown && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeDefaultProfile}
                    onChange={(e) => setIncludeDefaultProfile(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Respondent Profile</span>
                    <span className="text-[11px] text-slate-500 block">Prepend Full Name and Email fields to the form</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!includeNotes}
                    onChange={(e) => setIncludeNotes(!e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Clean Checkbox Options</span>
                    <span className="text-[11px] text-slate-500 block">Strip decorative or blank notes from option lists</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={extractionMode === 'SMART_ENHANCE'}
                    onChange={(e) => setExtractionMode(e.target.checked ? 'SMART_ENHANCE' : 'STRICT_VERBATIM')}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Smart Question Polish</span>
                    <span className="text-[11px] text-slate-500 block">Refine question grammar and add clarifying descriptions</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
