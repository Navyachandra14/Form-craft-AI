import React, { useState, useEffect, useRef } from 'react';
import {
  ParsedFormSchema,
  FormQuestion,
  QuestionType,
} from '../types';
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  CircleDot,
  AlignLeft,
  Type,
  ListFilter,
  Star,
  Calendar,
  Clock,
  Heading,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Layers,
  Eye,
  ShieldCheck,
  Asterisk,
  Mail,
  Phone,
  Link2,
  Hash,
  SlidersHorizontal,
  Check,
  AlertCircle,
  Info,
  UserCheck,
  Image as ImageIcon,
  ImagePlus,
  UploadCloud,
  X,
  Save,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { FormPreviewModal } from './FormPreviewModal';

export const AUTOSAVE_STORAGE_KEY = 'formcraft_autosaved_schema';
export const AUTOSAVE_TIMESTAMP_KEY = 'formcraft_autosaved_timestamp';

interface SchemaEditorProps {
  schema: ParsedFormSchema;
  onChange: (updatedSchema: ParsedFormSchema) => void;
  onGenerateForm: () => void;
  onReset: () => void;
  user: User | null;
  onLogin: () => void;
  isGenerating: boolean;
  isLoggingIn: boolean;
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'SHORT_TEXT', label: 'Short Text', icon: Type },
  { type: 'PARAGRAPH', label: 'Paragraph', icon: AlignLeft },
  { type: 'RADIO', label: 'Single Choice (Radio)', icon: CircleDot },
  { type: 'CHECKBOX', label: 'Checkboxes (Multi-select)', icon: CheckSquare },
  { type: 'DROP_DOWN', label: 'Dropdown Menu', icon: ListFilter },
  { type: 'SCALE', label: 'Linear Scale', icon: Star },
  { type: 'DATE', label: 'Date', icon: Calendar },
  { type: 'TIME', label: 'Time', icon: Clock },
  { type: 'SECTION_HEADER', label: 'Section Header / Divider', icon: Heading },
];

export const SchemaEditor: React.FC<SchemaEditorProps> = ({
  schema,
  onChange,
  onGenerateForm,
  onReset,
  user,
  onLogin,
  isGenerating,
  isLoggingIn,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    schema.questions[0]?.id || null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [lastAutosaved, setLastAutosaved] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTOSAVE_TIMESTAMP_KEY);
    } catch {
      return null;
    }
  });

  // Autosave to localStorage on every manual edit, validation toggle, or schema modification
  useEffect(() => {
    try {
      if (schema && schema.questions && schema.questions.length > 0) {
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(schema));
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        localStorage.setItem(AUTOSAVE_TIMESTAMP_KEY, timeStr);
        setLastAutosaved(timeStr);
      }
    } catch (e) {
      console.warn('Failed to autosave schema to localStorage:', e);
    }
  }, [schema]);

  // Check if schema already contains respondent fields
  const hasRespondentFields = schema.questions.some((q) =>
    /full legal name|candidate name|your name|email address/i.test(q.title)
  );

  // Check if schema contains blank notes / paragraph observation fields
  const hasNotesFields = schema.questions.some(
    (q) => /notes?|observations?|comments?/i.test(q.title) && q.type === 'PARAGRAPH'
  );

  const removeBlankNotesFields = () => {
    const cleaned = schema.questions.filter(
      (q) => !(/notes?|observations?|comments?/i.test(q.title) && q.type === 'PARAGRAPH')
    );
    onChange({ ...schema, questions: cleaned });
  };

  const addStandardRespondentFields = () => {
    const timestamp = Date.now();
    const defaultFields: FormQuestion[] = [
      {
        id: `q_header_resp_${timestamp}`,
        title: 'Respondent Information',
        description: 'Please provide your contact and candidate identification details before starting.',
        type: 'SECTION_HEADER',
        required: false,
      },
      {
        id: `q_name_${timestamp + 1}`,
        title: 'Full Legal Name',
        description: 'Enter your first and last name',
        type: 'SHORT_TEXT',
        required: true,
      },
      {
        id: `q_email_${timestamp + 2}`,
        title: 'Email Address',
        description: 'Primary contact email for submission receipt',
        type: 'SHORT_TEXT',
        required: true,
        validationRule: {
          type: 'EMAIL',
          message: 'Please enter a valid email address.',
        },
      },
      {
        id: `q_phone_${timestamp + 3}`,
        title: 'Phone Number / Candidate ID',
        description: 'Contact number or assigned evaluator/applicant ID',
        type: 'SHORT_TEXT',
        required: false,
      },
      {
        id: `q_date_${timestamp + 4}`,
        title: 'Date of Evaluation',
        description: 'Date when the practice sheet or form was completed',
        type: 'DATE',
        required: true,
      },
    ];

    onChange({
      ...schema,
      questions: [...defaultFields, ...schema.questions],
    });
  };

  const updateTitle = (title: string) => {
    onChange({ ...schema, title });
  };

  const updateDescription = (description: string) => {
    onChange({ ...schema, description });
  };

  const updateQuestion = (id: string, updates: Partial<FormQuestion>) => {
    const newQuestions = schema.questions.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    );
    onChange({ ...schema, questions: newQuestions });
  };

  const updateValidationRule = (
    questionId: string,
    ruleType: 'EMAIL' | 'PHONE' | 'URL' | 'NUMBER' | 'CUSTOM' | 'NONE',
    message?: string
  ) => {
    if (ruleType === 'NONE') {
      updateQuestion(questionId, { validationRule: undefined });
    } else {
      const existing = schema.questions.find((q) => q.id === questionId)?.validationRule;
      updateQuestion(questionId, {
        validationRule: {
          type: ruleType,
          message: message !== undefined ? message : existing?.message || '',
        },
      });
    }
  };

  const setAllQuestionsRequired = (required: boolean) => {
    const newQuestions = schema.questions.map((q) =>
      q.type === 'SECTION_HEADER' ? q : { ...q, required }
    );
    onChange({ ...schema, questions: newQuestions });
  };

  const nonSectionQuestions = schema.questions.filter((q) => q.type !== 'SECTION_HEADER');
  const requiredCount = nonSectionQuestions.filter((q) => q.required).length;
  const validatedRulesCount = nonSectionQuestions.filter((q) => q.validationRule?.type).length;

  const addOption = (questionId: string) => {
    const target = schema.questions.find((q) => q.id === questionId);
    if (!target) return;
    const existingOptions = target.options || [];
    const newOptionName = `Option ${existingOptions.length + 1}`;
    updateQuestion(questionId, {
      options: [...existingOptions, newOptionName],
    });
  };

  const updateOptionText = (questionId: string, optionIndex: number, text: string) => {
    const target = schema.questions.find((q) => q.id === questionId);
    if (!target || !target.options) return;
    const updatedOptions = [...target.options];
    updatedOptions[optionIndex] = text;
    updateQuestion(questionId, { options: updatedOptions });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const target = schema.questions.find((q) => q.id === questionId);
    if (!target || !target.options) return;
    const updatedOptions = target.options.filter((_, idx) => idx !== optionIndex);
    updateQuestion(questionId, { options: updatedOptions });
  };

  const deleteQuestion = (id: string) => {
    const updatedQuestions = schema.questions.filter((q) => q.id !== id);
    onChange({ ...schema, questions: updatedQuestions });
    if (selectedQuestionId === id) {
      setSelectedQuestionId(updatedQuestions[0]?.id || null);
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= schema.questions.length) return;
    const updatedQuestions = [...schema.questions];
    const [moved] = updatedQuestions.splice(index, 1);
    updatedQuestions.splice(targetIndex, 0, moved);
    onChange({ ...schema, questions: updatedQuestions });
  };

  const addNewQuestion = (type: QuestionType = 'SHORT_TEXT') => {
    const newQuestion: FormQuestion = {
      id: `q_${Date.now()}_${schema.questions.length}`,
      title: `New ${type === 'SECTION_HEADER' ? 'Section' : 'Question'}`,
      description: '',
      type,
      required: false,
      options: ['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(type)
        ? ['Option 1', 'Option 2']
        : undefined,
      scaleLow: 1,
      scaleHigh: 5,
      scaleLowLabel: 'Poor',
      scaleHighLabel: 'Excellent',
    };
    onChange({
      ...schema,
      questions: [...schema.questions, newQuestion],
    });
    setSelectedQuestionId(newQuestion.id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-36 sm:pb-24">
      {/* Top Banner Status & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              Extracted via Gemini
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {schema.questions.length} fields detected
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-2xs"
              title="Edits, options, and validations are automatically saved to local storage"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <Save className="w-3 h-3 text-slate-500 shrink-0" />
              <span>Autosaved {lastAutosaved ? `(${lastAutosaved})` : 'locally'}</span>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5 tracking-tight">
            Review &amp; Customize Form Schema
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            Edit questions, options, and rules before generating the live Google Form &amp; connected Google Sheet.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            id="btn-preview-form-header"
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50/90 text-xs sm:text-sm font-semibold text-purple-900 hover:text-purple-950 hover:bg-purple-100 active:bg-purple-200 transition-all shadow-2xs cursor-pointer touch-manipulation"
            title="Interactive Google Form preview in iframe"
          >
            <Eye className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Preview Form</span>
          </button>

          <button
            id="btn-schema-reset"
            type="button"
            onClick={onReset}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-all shadow-2xs cursor-pointer touch-manipulation"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset</span>
          </button>

          {user ? (
            <button
              id="btn-generate-form"
              type="button"
              onClick={onGenerateForm}
              disabled={isGenerating || schema.questions.length === 0}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 active:bg-black disabled:opacity-50 transition-all shadow-xs cursor-pointer touch-manipulation"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Creating Form &amp; Sheet...</span>
                </>
              ) : (
                <>
                  <span>Create Form &amp; Sheet</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>
          ) : (
            <button
              id="btn-login-and-generate"
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 active:bg-black disabled:opacity-50 transition-all shadow-xs cursor-pointer touch-manipulation"
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
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in to Create Form'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Metadata Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <label
            htmlFor="schema-form-title-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
          >
            Form Title
          </label>
          <input
            id="schema-form-title-input"
            type="text"
            value={schema.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="w-full min-h-[48px] text-base sm:text-lg font-bold px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 focus:bg-white text-slate-900 transition-all touch-manipulation"
            placeholder="Enter form title..."
          />
        </div>

        <div>
          <label
            htmlFor="schema-form-desc-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
          >
            Form Description / Instructions (Optional)
          </label>
          <textarea
            id="schema-form-desc-input"
            rows={3}
            value={schema.description || ''}
            onChange={(e) => updateDescription(e.target.value)}
            className="w-full min-h-[64px] text-sm px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 focus:bg-white text-slate-700 transition-all leading-relaxed touch-manipulation"
            placeholder="Provide instructions for respondents..."
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {/* Question List Header & Summary Ribbon */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
                Form Questions ({schema.questions.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                ({nonSectionQuestions.length} input fields)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!hasRespondentFields && (
                <button
                  id="btn-add-profile-fields"
                  type="button"
                  onClick={addStandardRespondentFields}
                  className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100/90 active:bg-emerald-200 text-emerald-800 border border-emerald-300/80 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer touch-manipulation"
                >
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>+ Add Contact/ID Fields</span>
                </button>
              )}
              {hasNotesFields && (
                <button
                  id="btn-clean-notes"
                  type="button"
                  onClick={removeBlankNotesFields}
                  className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer touch-manipulation"
                  title="Remove freeform notes to keep only the pure Case Image & Checkbox evaluation criteria"
                >
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>🧹 Keep Only Image &amp; Checklists</span>
                </button>
              )}
              <button
                id="btn-add-question"
                type="button"
                onClick={() => addNewQuestion('SHORT_TEXT')}
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs touch-manipulation"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add Question</span>
              </button>
              <button
                id="btn-add-section"
                type="button"
                onClick={() => addNewQuestion('SECTION_HEADER')}
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer touch-manipulation"
              >
                <Heading className="w-4 h-4 text-slate-600" />
                <span>Add Section</span>
              </button>
            </div>
          </div>

          {/* Validation & Requirements Statistics & Quick Batch Actions */}
          {nonSectionQuestions.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-800 font-semibold">
                  <Asterisk className="w-3.5 h-3.5 text-rose-600" />
                  <span>{requiredCount} Required ({Math.round((requiredCount / nonSectionQuestions.length) * 100)}%)</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>{nonSectionQuestions.length - requiredCount} Optional</span>
                </div>

                {validatedRulesCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-800 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{validatedRulesCount} AI Validation Rules Active</span>
                  </div>
                )}
              </div>

              {/* Batch Toggles */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 hidden lg:inline">Quick Adjust:</span>
                <button
                  type="button"
                  onClick={() => setAllQuestionsRequired(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  Make All Required
                </button>
                <button
                  type="button"
                  onClick={() => setAllQuestionsRequired(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  Make All Optional
                </button>
              </div>
            </div>
          )}
        </div>

        {schema.questions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
            <p className="text-sm text-slate-500 font-medium">No questions in this form yet.</p>
            <button
              onClick={() => addNewQuestion('SHORT_TEXT')}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 active:bg-black cursor-pointer shadow-xs touch-manipulation"
            >
              <Plus className="w-4 h-4" /> Add First Question
            </button>
          </div>
        ) : (
          schema.questions.map((q, index) => {
            const isSection = q.type === 'SECTION_HEADER';
            const isChoiceType = ['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(q.type);
            const isScale = q.type === 'SCALE';

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-xs transition-all ${
                  isSection
                    ? 'border-slate-300 bg-slate-50/50'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Question Header & Order Controls & Visual Validation Indicators */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {isSection ? 'Section Header' : 'Question Field'}
                    </span>

                    {/* Interactive Required / Optional Quick Badge */}
                    {!isSection && (
                      <button
                        id={`btn-header-req-toggle-${index}`}
                        type="button"
                        onClick={() => updateQuestion(q.id, { required: !q.required })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          q.required
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200/80 hover:bg-slate-200/70'
                        }`}
                        title={q.required ? 'Click to switch to Optional' : 'Click to switch to Required (*)'}
                      >
                        {q.required ? (
                          <>
                            <Asterisk className="w-3.5 h-3.5 text-rose-600 font-black" />
                            <span>Required</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Optional</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* AI Validation Rule Indicator Badge */}
                    {!isSection && q.validationRule?.type && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200/80 shadow-2xs">
                        {q.validationRule.type === 'EMAIL' && <Mail className="w-3 h-3 text-blue-600" />}
                        {q.validationRule.type === 'PHONE' && <Phone className="w-3 h-3 text-emerald-600" />}
                        {q.validationRule.type === 'URL' && <Link2 className="w-3 h-3 text-purple-600" />}
                        {q.validationRule.type === 'NUMBER' && <Hash className="w-3 h-3 text-amber-600" />}
                        {q.validationRule.type === 'CUSTOM' && <ShieldCheck className="w-3 h-3 text-indigo-600" />}
                        <span>AI Rule: {q.validationRule.type}</span>
                        <Sparkles className="w-2.5 h-2.5 text-amber-500 ml-0.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-move-up-${index}`}
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveQuestion(index, 'up')}
                      className="min-w-[44px] min-h-[44px] p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl disabled:opacity-25 flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
                      title="Move up"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      id={`btn-move-down-${index}`}
                      type="button"
                      disabled={index === schema.questions.length - 1}
                      onClick={() => moveQuestion(index, 'down')}
                      className="min-w-[44px] min-h-[44px] p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl disabled:opacity-25 flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
                      title="Move down"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                    <button
                      id={`btn-delete-${index}`}
                      type="button"
                      onClick={() => deleteQuestion(q.id)}
                      className="min-w-[44px] min-h-[44px] p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-xl flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
                      title="Delete question"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Question Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                  {/* Title */}
                  <div className="md:col-span-8">
                    <input
                      id={`question-title-${index}`}
                      type="text"
                      value={q.title}
                      onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                      placeholder={isSection ? 'Section Title...' : 'Question Title...'}
                      className="w-full min-h-[48px] text-sm sm:text-base font-semibold px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 focus:bg-white text-slate-900 touch-manipulation"
                    />
                  </div>

                  {/* Type Selector */}
                  <div className="md:col-span-4">
                    <select
                      id={`question-type-${index}`}
                      value={q.type}
                      onChange={(e) => {
                        const newType = e.target.value as QuestionType;
                        const updates: Partial<FormQuestion> = { type: newType };
                        if (
                          ['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(newType) &&
                          (!q.options || q.options.length === 0)
                        ) {
                          updates.options = ['Option 1', 'Option 2'];
                        }
                        updateQuestion(q.id, updates);
                      }}
                      className="w-full min-h-[48px] text-xs sm:text-sm font-semibold px-3.5 py-3 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-slate-800 cursor-pointer touch-manipulation"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subtext Description */}
                <div className="mb-3">
                  <input
                    id={`question-desc-${index}`}
                    type="text"
                    value={q.description || ''}
                    onChange={(e) => updateQuestion(q.id, { description: e.target.value })}
                    placeholder="Helper description or guidance (optional)..."
                    className="w-full min-h-[44px] text-xs sm:text-sm px-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-slate-600 touch-manipulation"
                  />
                </div>

                {/* Question Image & Visual Reference Inspector (For Screenshot Cases & Visual QA) */}
                {!isSection && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Case Visual Reference / Screenshot
                        </span>
                        {q.hasImagePrompt && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            Visual Case
                          </span>
                        )}
                      </div>

                      {q.imageUrl && (
                        <button
                          type="button"
                          onClick={() => updateQuestion(q.id, { imageUrl: undefined })}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Image
                        </button>
                      )}
                    </div>

                    {/* Image Preview if Present */}
                    {q.imageUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                        <img
                          src={q.imageUrl}
                          alt={q.title}
                          className="w-full max-h-56 object-contain bg-slate-100/50"
                        />
                        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span className="truncate max-w-[280px]">
                            {q.imageDescription || 'Visual prompt attached to this evaluation case'}
                          </span>
                          <label className="text-indigo-600 font-semibold cursor-pointer hover:underline text-[11px] shrink-0">
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (re) => {
                                    updateQuestion(q.id, { imageUrl: (re.target?.result as string) || '' });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                        <div className="sm:col-span-6 flex items-center gap-2">
                          <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-colors">
                            <UploadCloud className="w-4 h-4 text-indigo-500" />
                            <span>Upload Case Screenshot</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (re) => {
                                    updateQuestion(q.id, {
                                      imageUrl: (re.target?.result as string) || '',
                                      hasImagePrompt: true,
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        <div className="sm:col-span-6">
                          <input
                            type="url"
                            value={q.imageUrl || ''}
                            onChange={(e) => updateQuestion(q.id, { imageUrl: e.target.value, hasImagePrompt: Boolean(e.target.value) })}
                            placeholder="Or paste image URL (https://...)"
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-slate-800 text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Image / Scene Description Input */}
                    <div>
                      <input
                        type="text"
                        value={q.imageDescription || ''}
                        onChange={(e) => updateQuestion(q.id, { imageDescription: e.target.value })}
                        placeholder="Visual context summary (e.g. 'Case 1: Street address badge mockup')..."
                        className="w-full text-[11px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* Choice Options (Radio, Checkbox, Dropdown) */}
                {isChoiceType && (
                  <div className="space-y-2.5 pl-3 border-l-2 border-slate-200 my-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Options
                    </span>
                    {(q.options || ['Option 1']).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center text-slate-400 shrink-0">
                          {q.type === 'CHECKBOX' ? (
                            <CheckSquare className="w-4 h-4 text-slate-500" />
                          ) : (
                            <CircleDot className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <input
                          id={`question-${index}-option-${optIdx}`}
                          type="text"
                          value={opt}
                          onChange={(e) => updateOptionText(q.id, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 min-h-[44px] text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-slate-800 font-medium touch-manipulation"
                        />
                        {(q.options?.length || 0) > 1 && (
                          <button
                            id={`btn-remove-option-${index}-${optIdx}`}
                            type="button"
                            onClick={() => removeOption(q.id, optIdx)}
                            className="min-w-[44px] min-h-[44px] p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-xl flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
                            title="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      id={`btn-add-option-${index}`}
                      type="button"
                      onClick={() => addOption(q.id)}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 rounded-xl mt-1.5 transition-colors cursor-pointer touch-manipulation"
                    >
                      <Plus className="w-4 h-4" /> Add Option
                    </button>
                  </div>
                )}

                {/* Rating Scale Controls */}
                {isScale && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs my-4">
                    <div>
                      <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">
                        Low Label (1)
                      </label>
                      <input
                        type="text"
                        value={q.scaleLowLabel || ''}
                        onChange={(e) => updateQuestion(q.id, { scaleLowLabel: e.target.value })}
                        placeholder="e.g. Strongly Disagree"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 touch-manipulation"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">
                        High Label (5 or 10)
                      </label>
                      <input
                        type="text"
                        value={q.scaleHighLabel || ''}
                        onChange={(e) => updateQuestion(q.id, { scaleHighLabel: e.target.value })}
                        placeholder="e.g. Strongly Agree"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 touch-manipulation"
                      />
                    </div>
                  </div>
                )}

                {/* Validation & Input Constraints Panel */}
                {!isSection && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Validation Rules &amp; Constraints
                          </span>
                        </div>

                        {q.validationRule?.type ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-100/80 text-blue-900 border border-blue-200">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            AI-Applied Rule: {q.validationRule.type}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Standard Input
                          </span>
                        )}
                      </div>

                      {/* Required Question Switch Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200/80">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              Mandatory Question (Required *)
                            </span>
                            {q.required ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                                Required Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                Optional
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Respondents cannot submit the form without answering this field.
                          </p>
                        </div>

                        <label
                          htmlFor={`required-toggle-switch-${q.id}`}
                          className="relative inline-flex items-center cursor-pointer select-none shrink-0"
                        >
                          <input
                            id={`required-toggle-switch-${q.id}`}
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </div>

                      {/* Format Validation Rule Row */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                          <div className="sm:col-span-4">
                            <label
                              htmlFor={`validation-type-${q.id}`}
                              className="block text-[11px] font-bold uppercase tracking-wider text-slate-600"
                            >
                              Validation Format
                            </label>
                            <span className="text-[11px] text-slate-400">Enforce response syntax</span>
                          </div>

                          <div className="sm:col-span-8">
                            <select
                              id={`validation-type-${q.id}`}
                              value={q.validationRule?.type || 'NONE'}
                              onChange={(e) =>
                                updateValidationRule(
                                  q.id,
                                  e.target.value as 'EMAIL' | 'PHONE' | 'URL' | 'NUMBER' | 'CUSTOM' | 'NONE'
                                )
                              }
                              className="w-full min-h-[40px] text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-slate-800 cursor-pointer"
                            >
                              <option value="NONE">None (Standard Open Response)</option>
                              <option value="EMAIL">✉️ Email Address Format (name@domain.com)</option>
                              <option value="PHONE">📱 Phone Number Format</option>
                              <option value="URL">🔗 Website / Portfolio URL (https://...)</option>
                              <option value="NUMBER">🔢 Numeric Value Only</option>
                              <option value="CUSTOM">🛡️ Custom Format Rule</option>
                            </select>
                          </div>
                        </div>

                        {/* Custom Error Message input when rule is active */}
                        {q.validationRule?.type && (
                          <div className="pt-2 border-t border-slate-100">
                            <label
                              htmlFor={`validation-msg-${q.id}`}
                              className="block text-[11px] font-bold text-slate-600 mb-1"
                            >
                              Custom Validation Error Message (Optional)
                            </label>
                            <input
                              id={`validation-msg-${q.id}`}
                              type="text"
                              value={q.validationRule.message || ''}
                              onChange={(e) =>
                                updateValidationRule(
                                  q.id,
                                  q.validationRule?.type || 'CUSTOM',
                                  e.target.value
                                )
                              }
                              placeholder={
                                q.validationRule.type === 'EMAIL'
                                  ? 'e.g., Please enter a valid email address.'
                                  : q.validationRule.type === 'URL'
                                  ? 'e.g., Please enter a valid portfolio URL (https://...).'
                                  : q.validationRule.type === 'NUMBER'
                                  ? 'e.g., Please enter a valid number.'
                                  : 'e.g., Invalid response format.'
                              }
                              className="w-full min-h-[38px] text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-slate-700"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Sticky Action Bar */}
      <div className="hidden sm:flex sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-lg items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Ready to build Google Form &amp; Sheet with {schema.questions.length} fields</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-sticky-preview"
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50/90 text-xs font-semibold text-purple-900 hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-purple-600" />
            <span>Preview Form</span>
          </button>

          <button
            id="btn-sticky-reset"
            type="button"
            onClick={onReset}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Reset All
          </button>

          {user ? (
            <button
              id="btn-sticky-generate"
              type="button"
              onClick={onGenerateForm}
              disabled={isGenerating || schema.questions.length === 0}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Creating Form &amp; Sheet...</span>
                </>
              ) : (
                <>
                  <span>Create Form &amp; Google Sheet</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>
          ) : (
            <button
              id="btn-sticky-login"
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
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
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in to Create'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dedicated Bottom-Navigation Bar for Primary Actions */}
      <nav
        id="mobile-schema-bottom-nav"
        aria-label="Schema primary actions"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        {/* Quick Tools Row & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{schema.questions.length} Fields Ready</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="mobile-nav-preview"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 active:bg-purple-100 text-xs font-bold inline-flex items-center gap-1 shadow-2xs touch-manipulation cursor-pointer"
              title="Preview Form"
            >
              <Eye className="w-4 h-4 text-purple-600" />
              <span>Preview</span>
            </button>

            <button
              id="mobile-nav-add-question"
              type="button"
              onClick={() => addNewQuestion('SHORT_TEXT')}
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1 shadow-2xs touch-manipulation cursor-pointer"
              title="Add Question"
            >
              <Plus className="w-4 h-4 text-slate-700" />
              <span>Question</span>
            </button>

            <button
              id="mobile-nav-add-section"
              type="button"
              onClick={() => addNewQuestion('SECTION_HEADER')}
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1 shadow-2xs touch-manipulation cursor-pointer"
              title="Add Section"
            >
              <Heading className="w-4 h-4 text-slate-700" />
              <span>Section</span>
            </button>

            <button
              id="mobile-nav-reset"
              type="button"
              onClick={onReset}
              className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-600 flex items-center justify-center shadow-2xs touch-manipulation cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <div>
          {user ? (
            <button
              id="mobile-btn-generate"
              type="button"
              onClick={onGenerateForm}
              disabled={isGenerating || schema.questions.length === 0}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 active:bg-black text-white text-sm font-bold disabled:opacity-50 transition-all shadow-md cursor-pointer touch-manipulation"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Generating Form &amp; Sheet...</span>
                </>
              ) : (
                <>
                  <span>Create Form &amp; Google Sheet</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>
          ) : (
            <button
              id="mobile-btn-login"
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 active:bg-black text-white text-sm font-bold disabled:opacity-50 transition-all shadow-md cursor-pointer touch-manipulation"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 48 48">
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
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in to Create Form'}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Interactive Google Form Preview Modal */}
      <FormPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        schema={schema}
        onConfirmGenerate={user ? onGenerateForm : onLogin}
        userLoggedIn={Boolean(user)}
      />
    </div>
  );
};
