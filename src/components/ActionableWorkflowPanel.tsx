import React, { useState } from 'react';
import {
  WorkflowTriggerSettings,
  CandidateEmailTemplate,
  ParsedFormSchema,
} from '../types';
import {
  getDefaultWorkflowSettings,
  generateAppsScriptCode,
  renderEmailVariables,
} from '../lib/workflowDefaults';
import { copyTextToClipboard } from '../lib/clipboard';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Mail,
  Send,
  Link2,
  FileSpreadsheet,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Users,
  MessageSquare,
  Video,
  Clock,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Code2,
  ArrowRight,
  RefreshCw,
  Eye,
  Info,
  Calendar,
} from 'lucide-react';

interface ActionableWorkflowPanelProps {
  schema: ParsedFormSchema;
  onChange: (updatedSchema: ParsedFormSchema) => void;
  onClose?: () => void;
}

export const ActionableWorkflowPanel: React.FC<ActionableWorkflowPanelProps> = ({
  schema,
  onChange,
  onClose,
}) => {
  // Ensure workflow settings exist
  const workflow: WorkflowTriggerSettings =
    schema.workflowSettings || getDefaultWorkflowSettings(schema.title);

  const [activeTemplateTab, setActiveTemplateTab] = useState<'passed' | 'review' | 'failed'>('passed');
  const [copiedScript, setCopiedScript] = useState(false);
  const [showAppsScriptModal, setShowAppsScriptModal] = useState(false);
  
  // Interactive Simulation State
  const [simulatedScore, setSimulatedScore] = useState<number>(85);
  const [simulatedName, setSimulatedName] = useState<string>('Alex Morgan');

  const updateWorkflow = (updates: Partial<WorkflowTriggerSettings>) => {
    const updated = {
      ...workflow,
      ...updates,
    };
    onChange({
      ...schema,
      workflowSettings: updated,
    });
  };

  const updateTemplate = (
    key: 'passedTemplate' | 'reviewTemplate' | 'failedTemplate',
    updates: Partial<CandidateEmailTemplate>
  ) => {
    updateWorkflow({
      [key]: {
        ...workflow[key],
        ...updates,
      },
    });
  };

  const applyPreset = (presetType: 'assessment_80' | 'screening_meet' | 'strict_90' | 'general_intake') => {
    const title = schema.title || 'Form';
    if (presetType === 'assessment_80') {
      const def = getDefaultWorkflowSettings(title);
      updateWorkflow({
        ...def,
        passThresholdPercent: 80,
        reviewThresholdPercent: 70,
        allowRetakes: true,
        retakeCooldownHours: 24,
      });
    } else if (presetType === 'screening_meet') {
      const def = getDefaultWorkflowSettings(title);
      updateWorkflow({
        ...def,
        scoringMode: 'SKILL_MATCH',
        passThresholdPercent: 75,
        reviewThresholdPercent: 60,
        passedTemplate: {
          ...def.passedTemplate,
          subject: `Interview Invitation — ${title}`,
          headline: 'Application Shortlisted for Interview',
          body: `Dear {{candidate_name}},\n\nYour profile and test scores for ${title} match our senior project requirements.\n\nPlease pick a convenient time on our calendar for the technical briefing.`,
          actionButtonText: '📅 Schedule Technical Interview',
          actionButtonUrl: 'https://calendly.com/recruitment/interview',
        },
      });
    } else if (presetType === 'strict_90') {
      const def = getDefaultWorkflowSettings(title);
      updateWorkflow({
        ...def,
        passThresholdPercent: 90,
        reviewThresholdPercent: 80,
        allowRetakes: false,
        maxRetakes: 1,
        passedTemplate: {
          ...def.passedTemplate,
          headline: 'Top Tier Candidate — Direct Fast-Track Clearance',
        },
      });
    } else if (presetType === 'general_intake') {
      const def = getDefaultWorkflowSettings(title);
      updateWorkflow({
        ...def,
        scoringMode: 'GENERAL_SUBMISSION',
        passThresholdPercent: 50,
        passedTemplate: {
          ...def.passedTemplate,
          subject: `Submission Acknowledged: ${title}`,
          headline: 'We Have Received Your Information',
          body: `Dear {{candidate_name}},\n\nThank you for submitting ${title}. Our team is processing your details and will follow up shortly.`,
          actionButtonText: '📁 Access Resource Portal',
          actionButtonUrl: 'https://example.com/resources',
        },
      });
    }
  };

  const handleCopyAppsScript = async () => {
    const code = generateAppsScriptCode(schema.title, workflow);
    await copyTextToClipboard(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const activeTemplate =
    activeTemplateTab === 'passed'
      ? workflow.passedTemplate
      : activeTemplateTab === 'review'
      ? workflow.reviewTemplate
      : workflow.failedTemplate;

  // Insert variable into active body textarea
  const insertVariable = (varName: string) => {
    const currentBody = activeTemplate.body || '';
    const updated = currentBody + ' ' + varName;
    if (activeTemplateTab === 'passed') updateTemplate('passedTemplate', { body: updated });
    else if (activeTemplateTab === 'review') updateTemplate('reviewTemplate', { body: updated });
    else updateTemplate('failedTemplate', { body: updated });
  };

  // Determine active simulation outcome
  const getSimulatedOutcome = () => {
    if (simulatedScore >= workflow.passThresholdPercent) {
      return {
        tier: 'Tier 1: PASSED',
        color: 'emerald',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        sheetColor: '#D1FADF (Mint Green)',
        template: workflow.passedTemplate,
      };
    } else if (simulatedScore >= workflow.reviewThresholdPercent) {
      return {
        tier: 'Tier 2: UNDER REVIEW',
        color: 'amber',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        sheetColor: '#FEF0C7 (Warm Amber)',
        template: workflow.reviewTemplate,
      };
    } else {
      return {
        tier: 'Tier 3: FAILED / RETAKE',
        color: 'rose',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        sheetColor: '#FEE4E2 (Soft Rose)',
        template: workflow.failedTemplate,
      };
    }
  };

  const simOutcome = getSimulatedOutcome();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Top Banner / Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Actionable Workflow &amp; Post-Submission Triggers
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    workflow.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {workflow.enabled ? '● Active Triggers' : '○ Disabled'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
                Define automated scoring gates, conditional email notifications, WhatsApp group onboarding links, and Google Sheets row color-coding upon every live form submission.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={workflow.enabled}
                onChange={(e) => updateWorkflow({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2.5 text-xs font-bold text-slate-700">
                {workflow.enabled ? 'Workflows Enabled' : 'Enable Triggers'}
              </span>
            </label>

            <button
              type="button"
              onClick={() => setShowAppsScriptModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Apps Script Code</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('assessment_80')}
            className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            ⚡ Assessment (80% Pass + WhatsApp)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('screening_meet')}
            className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            📅 Application Screening (Interview Meet)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('strict_90')}
            className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            🎯 Strict Benchmark (90% Pass Gate)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('general_intake')}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            📋 General Intake (Welcome Guide)
          </button>
        </div>
      </div>

      {/* Grid: Left Settings Form, Right Live Email & Simulation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settings Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Passing Thresholds & Evaluation Rules */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  1. Evaluation Gates &amp; Threshold Rules
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Score Gate: {workflow.passThresholdPercent}%
              </span>
            </div>

            {/* Threshold Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Passing Threshold (Eligible for Next Step)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ≥ {workflow.passThresholdPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={workflow.passThresholdPercent}
                  onChange={(e) =>
                    updateWorkflow({
                      passThresholdPercent: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>50%</span>
                  <span>70%</span>
                  <span className="font-bold text-emerald-600">80% (Recommended)</span>
                  <span>90%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Under Review / Margin Band (QA Hold)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    {workflow.reviewThresholdPercent}% – {workflow.passThresholdPercent - 1}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max={workflow.passThresholdPercent - 5}
                  step="5"
                  value={workflow.reviewThresholdPercent}
                  onChange={(e) =>
                    updateWorkflow({
                      reviewThresholdPercent: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Scores below {workflow.reviewThresholdPercent}% will automatically trigger the Reattempt / Polite Not-Cleared workflow.
                </p>
              </div>

              {/* Retake & Cooldown Policy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Allow Re-attempts</span>
                    <input
                      type="checkbox"
                      checked={workflow.allowRetakes}
                      onChange={(e) => updateWorkflow({ allowRetakes: e.target.checked })}
                      className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Failed candidates can re-submit after reviewing documentation.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Reattempt Cooldown Period
                  </label>
                  <select
                    value={workflow.retakeCooldownHours || 24}
                    onChange={(e) => updateWorkflow({ retakeCooldownHours: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 text-slate-800 font-medium"
                  >
                    <option value={0}>Immediate (No cooldown)</option>
                    <option value={12}>12 Hours</option>
                    <option value={24}>24 Hours (Standard)</option>
                    <option value={48}>48 Hours</option>
                    <option value={72}>72 Hours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Conditional Candidate Email Templates */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  2. Conditional Email Triggers
                </h3>
              </div>
            </div>

            {/* Template Navigation Switcher Tabs */}
            <div className="flex rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTemplateTab('passed')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTemplateTab === 'passed'
                    ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Passed (≥{workflow.passThresholdPercent}%)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTemplateTab('review')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTemplateTab === 'review'
                    ? 'bg-white text-amber-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Under Review ({workflow.reviewThresholdPercent}%)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTemplateTab('failed')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTemplateTab === 'failed'
                    ? 'bg-white text-rose-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Failed (&lt;{workflow.reviewThresholdPercent}%)</span>
              </button>
            </div>

            {/* Active Template Editor Fields */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Enable this automated email
                </span>
                <input
                  type="checkbox"
                  checked={activeTemplate.enabled}
                  onChange={(e) => {
                    const key =
                      activeTemplateTab === 'passed'
                        ? 'passedTemplate'
                        : activeTemplateTab === 'review'
                        ? 'reviewTemplate'
                        : 'failedTemplate';
                    updateTemplate(key, { enabled: e.target.checked });
                  }}
                  className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={activeTemplate.subject}
                  onChange={(e) => {
                    const key =
                      activeTemplateTab === 'passed'
                        ? 'passedTemplate'
                        : activeTemplateTab === 'review'
                        ? 'reviewTemplate'
                        : 'failedTemplate';
                    updateTemplate(key, { subject: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headline Title in Email Body
                </label>
                <input
                  type="text"
                  value={activeTemplate.headline}
                  onChange={(e) => {
                    const key =
                      activeTemplateTab === 'passed'
                        ? 'passedTemplate'
                        : activeTemplateTab === 'review'
                        ? 'reviewTemplate'
                        : 'failedTemplate';
                    updateTemplate(key, { headline: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 text-slate-800 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Email Message Content
                  </label>
                  {/* Variable Injection Chips */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Insert tag:</span>
                    <button
                      type="button"
                      onClick={() => insertVariable('{{candidate_name}}')}
                      className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700 border border-slate-200 cursor-pointer"
                    >
                      + Name
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable('{{score_percent}}%')}
                      className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700 border border-slate-200 cursor-pointer"
                    >
                      + Score %
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable('{{form_title}}')}
                      className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700 border border-slate-200 cursor-pointer"
                    >
                      + Form Title
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={activeTemplate.body}
                  onChange={(e) => {
                    const key =
                      activeTemplateTab === 'passed'
                        ? 'passedTemplate'
                        : activeTemplateTab === 'review'
                        ? 'reviewTemplate'
                        : 'failedTemplate';
                    updateTemplate(key, { body: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 text-slate-800 leading-relaxed font-sans"
                />
              </div>

              {/* Call to Action Button & Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={activeTemplate.actionButtonText || ''}
                    onChange={(e) => {
                      const key =
                        activeTemplateTab === 'passed'
                          ? 'passedTemplate'
                          : activeTemplateTab === 'review'
                          ? 'reviewTemplate'
                          : 'failedTemplate';
                      updateTemplate(key, { actionButtonText: e.target.value });
                    }}
                    placeholder="e.g. Join WhatsApp Group"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Action Link (WhatsApp / Meet / Portal)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={activeTemplate.actionButtonUrl || ''}
                      onChange={(e) => {
                        const key =
                          activeTemplateTab === 'passed'
                            ? 'passedTemplate'
                            : activeTemplateTab === 'review'
                            ? 'reviewTemplate'
                            : 'failedTemplate';
                        updateTemplate(key, { actionButtonUrl: e.target.value });
                      }}
                      placeholder="https://chat.whatsapp.com/... or https://meet.google.com/..."
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 text-slate-800 font-mono"
                    />
                    <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Instructions / Cooldown Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Candidate Next-Steps Note
                </label>
                <input
                  type="text"
                  value={activeTemplate.instructionsNote || ''}
                  onChange={(e) => {
                    const key =
                      activeTemplateTab === 'passed'
                        ? 'passedTemplate'
                        : activeTemplateTab === 'review'
                        ? 'reviewTemplate'
                        : 'failedTemplate';
                    updateTemplate(key, { instructionsNote: e.target.value });
                  }}
                  placeholder="e.g. Please join within 24 hours to secure your batch allotment."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Email Simulator & Connected Sheet Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Candidate Score Simulator */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Live Trigger Simulator
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Simulate Result</span>
            </div>

            {/* Simulation Score Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Test Score Simulation:</span>
                <span className="text-sm font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {simulatedScore}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSimulatedScore(90)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    simulatedScore >= workflow.passThresholdPercent
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🟢 90% (Pass)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedScore(75)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    simulatedScore >= workflow.reviewThresholdPercent && simulatedScore < workflow.passThresholdPercent
                      ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🟡 75% (Review)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedScore(55)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    simulatedScore < workflow.reviewThresholdPercent
                      ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🔴 55% (Fail)
                </button>
              </div>

              {/* Computed Outcome Badge */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Computed Tier
                  </span>
                  <p className="font-bold text-slate-800">{simOutcome.tier}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Sheet Highlight
                  </span>
                  <p className="font-mono font-bold text-xs text-slate-700">{simOutcome.sheetColor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rendered Live Email Preview Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Candidate Email Preview
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${simOutcome.badgeClass}`}>
                {simOutcome.tier}
              </span>
            </div>

            {/* Email Shell Mock */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 shadow-2xs">
              {/* Email Header */}
              <div className="bg-slate-900 text-white p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>To: {simulatedName} &lt;applicant@gmail.com&gt;</span>
                  <span>Just now</span>
                </div>
                <p className="font-bold text-white text-xs truncate">
                  Subject:{' '}
                  {renderEmailVariables(simOutcome.template.subject, {
                    candidateName: simulatedName,
                    scorePercent: simulatedScore,
                    formTitle: schema.title,
                  })}
                </p>
              </div>

              {/* Email Content */}
              <div className="p-4 sm:p-5 bg-white space-y-3.5 text-xs text-slate-800 leading-relaxed">
                <h4
                  className={`text-sm sm:text-base font-extrabold tracking-tight ${
                    simulatedScore >= workflow.passThresholdPercent
                      ? 'text-emerald-700'
                      : simulatedScore >= workflow.reviewThresholdPercent
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {renderEmailVariables(simOutcome.template.headline, {
                    candidateName: simulatedName,
                    scorePercent: simulatedScore,
                    formTitle: schema.title,
                  })}
                </h4>

                <div className="whitespace-pre-line text-slate-600 text-xs leading-relaxed">
                  {renderEmailVariables(simOutcome.template.body, {
                    candidateName: simulatedName,
                    scorePercent: simulatedScore,
                    scorePoints: Math.round((simulatedScore / 100) * 20),
                    totalPoints: 20,
                    formTitle: schema.title,
                  })}
                </div>

                {/* Action Button */}
                {simOutcome.template.actionButtonText && simOutcome.template.actionButtonUrl && (
                  <div className="pt-2">
                    <a
                      href={simOutcome.template.actionButtonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs ${
                        simulatedScore >= workflow.passThresholdPercent
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : simulatedScore >= workflow.reviewThresholdPercent
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      <span>{simOutcome.template.actionButtonText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Candidate Instructions Footer */}
                {simOutcome.template.instructionsNote && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-normal">
                    💡 <strong>Note:</strong>{' '}
                    {renderEmailVariables(simOutcome.template.instructionsNote, {
                      candidateName: simulatedName,
                      scorePercent: simulatedScore,
                      formTitle: schema.title,
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Apps Script Modal */}
      {showAppsScriptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Google Apps Script Automation Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Paste this script into your connected Google Sheet under <strong>Extensions &gt; Apps Script</strong> to trigger instant emails and cell highlights upon form submission.
            </p>

            <div className="relative">
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
                {generateAppsScriptCode(schema.title, workflow)}
              </pre>
              <button
                type="button"
                onClick={handleCopyAppsScript}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied Script!' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
