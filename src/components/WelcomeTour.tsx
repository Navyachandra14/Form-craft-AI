import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Share2,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  X,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelpGuide?: () => void;
}

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  iconColor: string;
  iconBg: string;
  tips: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to FormCraft AI',
    subtitle: 'Transform Documents into Google Forms in Seconds',
    description:
      'FormCraft AI uses Gemini 2.5 Flash to convert raw Word DOCX files, PDFs, text briefs, and exam rubrics directly into Google Forms with connected Google Sheets.',
    icon: Sparkles,
    badge: 'Step 1 of 4 • Overview',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    tips: [
      'Zero manual copy-pasting of questions, choices, or rubrics',
      'Preserves math LaTeX formatting, diagrams, and answer keys',
      'Works seamlessly on desktop and mobile',
    ],
  },
  {
    title: '1. Ingest Any Document or Brief',
    subtitle: 'Drag & Drop DOCX, PDF, Text, or Write a Brief',
    description:
      'Drop your existing assessment, quiz, job application, or survey into the upload box. Alternatively, use the Project Brief generator to build a form from simple prompts.',
    icon: FileText,
    badge: 'Step 2 of 4 • Ingestion',
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-500/10',
    tips: [
      'Supports Word (.docx), PDF (.pdf), Plain Text (.txt), and Markdown (.md)',
      'High-fidelity image and diagram extraction',
      'Choose Verbatim Extraction or Smart AI Enhancement',
    ],
  },
  {
    title: '2. Interactive Schema Review & Editing',
    subtitle: 'Fine-Tune Questions, Options & Scoring Rubrics',
    description:
      'Review the parsed form in a visual editor. Add or reorder questions, set required fields, mark correct answers, and configure point values with instant validation.',
    icon: CheckCircle2,
    badge: 'Step 3 of 4 • Customization',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    tips: [
      'Supports Multiple Choice, Checkboxes, Dropdowns, Linear Scales, and Grids',
      'Section breaks and conditional navigation',
      'Automatic local draft saving so you never lose progress',
    ],
  },
  {
    title: '3. One-Click Google Forms & Sheets Publishing',
    subtitle: 'Direct Google Workspace API Synchronization',
    description:
      'Authenticate with Google to publish your form to your Google Drive. FormCraft AI automatically creates a paired Google Sheet to collect live responses in real time.',
    icon: Share2,
    badge: 'Step 4 of 4 • Export & Deploy',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/10',
    tips: [
      'Instant shareable Google Forms live link and editor URL',
      'Linked Google Sheet response collector ready for reporting',
      'Full export options: JSON Schema, CSV, and Google Forms API payload',
    ],
  },
];

export const WelcomeTour: React.FC<WelcomeTourProps> = ({
  isOpen,
  onClose,
  onOpenHelpGuide,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('formcraft_seen_welcome_tour', 'true');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">FormCraft AI Quick Tour</span>
              <span className="block text-[10px] text-slate-500 font-mono">
                {step.badge}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleComplete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Skip Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Step Icon & Title */}
          <div className="flex items-start gap-4">
            <div
              className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${step.iconBg} ${step.iconColor}`}
            >
              <IconComponent className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {step.title}
              </h3>
              <p className="text-xs font-semibold text-emerald-700">
                {step.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {step.description}
          </p>

          {/* Key Feature Highlights */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
              Key Highlights:
            </span>
            <div className="space-y-1.5">
              {step.tips.map((tip, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-6 bg-slate-900'
                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 cursor-pointer"
              >
                Skip Tour
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenHelpGuide && (
              <button
                type="button"
                onClick={() => {
                  handleComplete();
                  onOpenHelpGuide();
                }}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Full Guide</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>{isLastStep ? 'Get Started' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
