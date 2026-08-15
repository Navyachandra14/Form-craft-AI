import React, { useEffect, useState } from 'react';
import { Sparkles, Bot, CheckCircle2, RotateCcw } from 'lucide-react';

interface ParsingProgressProps {
  fileName?: string;
  onCancel: () => void;
}

const STEPS = [
  'Ingesting document & optical buffers...',
  'Multimodal layout & field detection via Gemini 2.5 Flash...',
  'Inferring question types (radio, checkboxes, scales, short-text)...',
  'Mapping field constraints and validation schemas...',
];

export const ParsingProgress: React.FC<ParsingProgressProps> = ({ fileName, onCancel }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 text-center">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        {/* Animated Icon */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-emerald-100 animate-ping opacity-30" />
          <div className="relative w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Status Headings */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Analyzing Document with Gemini AI
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto truncate">
            {fileName ? `Processing "${fileName}"` : 'Extracting fields, checkboxes, and questions...'}
          </p>
        </div>

        {/* Step List */}
        <div className="space-y-3 text-left bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step}
                className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                  isDone
                    ? 'text-slate-900 font-semibold'
                    : isCurrent
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        {/* Cancel / Reset Button */}
        <div className="pt-2">
          <button
            id="btn-cancel-parsing"
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel & Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
