import React, { useState, useMemo } from 'react';
import {
  X,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ParsedFormSchema } from '../types';

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: ParsedFormSchema;
  onConfirmGenerate?: () => void;
  userLoggedIn?: boolean;
}

export const FormPreviewModal: React.FC<FormPreviewModalProps> = ({
  isOpen,
  onClose,
  schema,
  onConfirmGenerate,
  userLoggedIn,
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Generate self-contained, realistic Google Form HTML for the iframe
  const iframeHtml = useMemo(() => {
    const escapeHtml = (str: string = '') =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const questionsHtml = schema.questions
      .map((q, index) => {
        const requiredBadge = q.required
          ? `<span style="color: #d93025; font-size: 16px; margin-left: 3px;" title="Required">*</span>`
          : '';

        const descHtml = q.description
          ? `<div style="font-size: 12px; color: #5f6368; margin-top: 4px; margin-bottom: 12px; line-height: 1.5;">${escapeHtml(
              q.description
            )}</div>`
          : '<div style="margin-bottom: 12px;"></div>';

        if (q.type === 'SECTION_HEADER') {
          return `
            <div class="card section-card" id="q-${escapeHtml(q.id)}">
              <div class="section-title">${escapeHtml(q.title || 'Untitled Section')}</div>
              ${
                q.description
                  ? `<div class="section-desc">${escapeHtml(q.description)}</div>`
                  : ''
              }
            </div>
          `;
        }

        let inputControlHtml = '';

        switch (q.type) {
          case 'SHORT_TEXT': {
            const inputType =
              q.validationRule?.type === 'EMAIL'
                ? 'email'
                : q.validationRule?.type === 'URL'
                ? 'url'
                : q.validationRule?.type === 'NUMBER'
                ? 'number'
                : q.validationRule?.type === 'PHONE'
                ? 'tel'
                : 'text';

            const validationHint = q.validationRule?.type
              ? `<div style="font-size: 11px; color: #1a73e8; margin-top: 6px; display: flex; items-center; gap: 4px;">
                   <span>✦ Rule: ${escapeHtml(q.validationRule.type)} validation</span>
                   ${q.validationRule.message ? `<span>(${escapeHtml(q.validationRule.message)})</span>` : ''}
                 </div>`
              : '';

            inputControlHtml = `
              <div class="input-container">
                <input type="${inputType}" placeholder="Your answer" class="g-input" name="field_${index}" ${
              q.required ? 'required' : ''
            } />
                <div class="input-line"></div>
                ${validationHint}
              </div>
            `;
            break;
          }

          case 'PARAGRAPH':
            inputControlHtml = `
              <div class="input-container">
                <textarea placeholder="Your answer" class="g-textarea" rows="3" name="field_${index}" ${
              q.required ? 'required' : ''
            }></textarea>
                <div class="input-line"></div>
              </div>
            `;
            break;

          case 'RADIO':
            const radioOptions = q.options && q.options.length > 0 ? q.options : ['Option 1'];
            inputControlHtml = `
              <div class="options-group">
                ${radioOptions
                  .map(
                    (opt, optIdx) => `
                  <label class="choice-label">
                    <input type="radio" name="field_${index}" value="${escapeHtml(opt)}" class="g-radio" />
                    <span class="choice-text">${escapeHtml(opt)}</span>
                  </label>
                `
                  )
                  .join('')}
              </div>
            `;
            break;

          case 'CHECKBOX':
            const checkOptions = q.options && q.options.length > 0 ? q.options : ['Option 1'];
            inputControlHtml = `
              <div class="options-group">
                ${checkOptions
                  .map(
                    (opt, optIdx) => `
                  <label class="choice-label">
                    <input type="checkbox" name="field_${index}[]" value="${escapeHtml(opt)}" class="g-checkbox" />
                    <span class="choice-text">${escapeHtml(opt)}</span>
                  </label>
                `
                  )
                  .join('')}
              </div>
            `;
            break;

          case 'DROP_DOWN':
            const selectOptions = q.options && q.options.length > 0 ? q.options : ['Option 1'];
            inputControlHtml = `
              <div class="select-wrapper">
                <select class="g-select" name="field_${index}">
                  <option value="" disabled selected>Choose</option>
                  ${selectOptions
                    .map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`)
                    .join('')}
                </select>
              </div>
            `;
            break;

          case 'SCALE':
            const low = q.scaleLow ?? 1;
            const high = q.scaleHigh ?? 5;
            const scalePoints: number[] = [];
            for (let i = low; i <= high; i++) {
              scalePoints.push(i);
            }
            inputControlHtml = `
              <div class="scale-wrapper">
                ${q.scaleLowLabel ? `<span class="scale-label">${escapeHtml(q.scaleLowLabel)}</span>` : ''}
                <div class="scale-items">
                  ${scalePoints
                    .map(
                      (num) => `
                    <div class="scale-point">
                      <div class="scale-number">${num}</div>
                      <input type="radio" name="field_${index}" value="${num}" class="g-radio" />
                    </div>
                  `
                    )
                    .join('')}
                </div>
                ${q.scaleHighLabel ? `<span class="scale-label">${escapeHtml(q.scaleHighLabel)}</span>` : ''}
              </div>
            `;
            break;

          case 'DATE':
            inputControlHtml = `
              <div class="input-container" style="max-width: 240px;">
                <input type="date" class="g-input" name="field_${index}" />
                <div class="input-line"></div>
              </div>
            `;
            break;

          case 'TIME':
            inputControlHtml = `
              <div class="input-container" style="max-width: 200px;">
                <input type="time" class="g-input" name="field_${index}" />
                <div class="input-line"></div>
              </div>
            `;
            break;

          default:
            inputControlHtml = `
              <div class="input-container">
                <input type="text" placeholder="Your answer" class="g-input" />
              </div>
            `;
        }

        const imagePromptHtml = q.imageUrl
          ? `
            <div style="margin-top: 8px; margin-bottom: 16px; border-radius: 12px; overflow: hidden; border: 1px solid #dadce0; background: #f8f9fa;">
              <img src="${escapeHtml(q.imageUrl)}" alt="${escapeHtml(q.title)}" style="width: 100%; max-height: 380px; object-fit: contain; display: block;" />
              ${q.imageDescription ? `<div style="padding: 8px 12px; font-size: 11px; color: #5f6368; background: #fff; border-top: 1px solid #eee;"><strong>Note:</strong> ${escapeHtml(q.imageDescription)}</div>` : ''}
            </div>
          `
          : '';

        return `
          <div class="card question-card" id="q-${escapeHtml(q.id)}">
            <div class="question-header">
              <span class="question-title">${escapeHtml(q.title || 'Untitled Question')}${requiredBadge}</span>
            </div>
            ${descHtml}
            ${imagePromptHtml}
            ${inputControlHtml}
          </div>
        `;
      })
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(schema.title || 'Google Form Preview')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Google+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #ede7f6;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      color: #202124;
      line-height: 1.4;
      padding: 24px 12px 64px 12px;
      -webkit-font-smoothing: antialiased;
    }
    .form-wrapper {
      max-width: 640px;
      margin: 0 auto;
    }
    .card {
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #dadce0;
      padding: 24px;
      margin-bottom: 12px;
      position: relative;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .card:hover {
      box-shadow: 0 1px 3px rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15);
    }
    .header-card {
      border-top: 10px solid #673ab7;
      padding-top: 22px;
    }
    .form-title {
      font-family: 'Google Sans', 'Roboto', sans-serif;
      font-size: 28px;
      font-weight: 400;
      color: #202124;
      margin-bottom: 8px;
      word-break: break-word;
      line-height: 1.35;
    }
    .form-desc {
      font-size: 13.5px;
      color: #5f6368;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .required-notice {
      color: #d93025;
      font-size: 13px;
      margin-top: 18px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .section-card {
      background: #673ab7;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 20px 24px;
    }
    .section-title {
      font-family: 'Google Sans', 'Roboto', sans-serif;
      font-size: 20px;
      font-weight: 500;
      color: #ffffff;
      line-height: 1.3;
    }
    .section-desc {
      font-size: 13px;
      color: #e1d5f2;
      margin-top: 6px;
      line-height: 1.5;
    }
    .question-card {
      /* Standard Google Forms card */
    }
    .question-header {
      margin-bottom: 4px;
    }
    .question-title {
      font-size: 15.5px;
      font-weight: 400;
      color: #202124;
      line-height: 1.45;
      letter-spacing: 0.1px;
    }
    .input-container {
      position: relative;
      margin-top: 8px;
      width: 100%;
    }
    .g-input {
      width: 100%;
      border: none;
      border-bottom: 1px solid #dadce0;
      font-size: 14px;
      font-family: inherit;
      padding: 8px 0;
      outline: none;
      color: #202124;
      background: transparent;
      transition: border-bottom-color 0.2s ease;
    }
    .g-input:focus {
      border-bottom: 2px solid #673ab7;
      padding-bottom: 7px;
    }
    .g-textarea {
      width: 100%;
      border: none;
      border-bottom: 1px solid #dadce0;
      font-size: 14px;
      font-family: inherit;
      padding: 8px 0;
      outline: none;
      color: #202124;
      background: transparent;
      resize: vertical;
      line-height: 1.5;
    }
    .g-textarea:focus {
      border-bottom: 2px solid #673ab7;
      padding-bottom: 7px;
    }
    .options-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }
    .choice-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-size: 14px;
      color: #202124;
      user-select: none;
    }
    .g-radio {
      accent-color: #673ab7;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .g-checkbox {
      accent-color: #673ab7;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .choice-text {
      line-height: 1.4;
    }
    .select-wrapper {
      position: relative;
      max-width: 240px;
      margin-top: 8px;
    }
    .g-select {
      width: 100%;
      padding: 10px 14px;
      font-size: 14px;
      font-family: inherit;
      border: 1px solid #dadce0;
      border-radius: 4px;
      background-color: #fff;
      color: #202124;
      outline: none;
      cursor: pointer;
    }
    .g-select:focus {
      border-color: #673ab7;
      box-shadow: 0 0 0 1px #673ab7;
    }
    .scale-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 14px;
      padding: 8px 0;
      overflow-x: auto;
    }
    .scale-label {
      font-size: 12px;
      color: #5f6368;
      max-width: 90px;
      line-height: 1.3;
    }
    .scale-items {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .scale-point {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .scale-number {
      font-size: 13px;
      color: #5f6368;
      font-weight: 500;
    }
    .footer-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 18px;
    }
    .btn-submit {
      background-color: #673ab7;
      color: #ffffff;
      font-family: 'Google Sans', 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: 4px;
      padding: 10px 24px;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      transition: background-color 0.2s, box-shadow 0.2s;
    }
    .btn-submit:hover {
      background-color: #5e35b1;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
    }
    .btn-clear {
      background: none;
      border: none;
      color: #5f6368;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
    }
    .btn-clear:hover {
      background-color: rgba(95, 99, 104, 0.08);
      color: #202124;
    }
    .form-footer-branding {
      text-align: center;
      margin-top: 28px;
      font-size: 12px;
      color: #5f6368;
    }
    .form-footer-branding a {
      color: #5f6368;
      text-decoration: underline;
    }
    .success-screen {
      display: none;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #dadce0;
      border-top: 10px solid #673ab7;
      padding: 32px 24px;
      text-align: left;
    }
    .success-title {
      font-family: 'Google Sans', 'Roboto', sans-serif;
      font-size: 24px;
      color: #202124;
      margin-bottom: 12px;
    }
    .success-msg {
      font-size: 14px;
      color: #3c4043;
      margin-bottom: 24px;
    }
    .success-link {
      color: #1a73e8;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
    }
    .success-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="form-wrapper">
    <!-- Success Confirmation Screen -->
    <div id="success-screen" class="success-screen">
      <div class="success-title">${escapeHtml(schema.title || 'Form')}</div>
      <div class="success-msg">Your response has been recorded.</div>
      <a href="javascript:void(0)" onclick="resetFormView()" class="success-link">Submit another response</a>
    </div>

    <!-- Active Form View -->
    <form id="mock-form" onsubmit="handleMockSubmit(event)">
      <!-- Form Header Card -->
      <div class="card header-card">
        <h1 class="form-title">${escapeHtml(schema.title || 'Untitled Form')}</h1>
        ${
          schema.description
            ? `<div class="form-desc">${escapeHtml(schema.description)}</div>`
            : ''
        }
        <div class="required-notice">
          <span>* Indicates required question</span>
        </div>
      </div>

      <!-- Question Cards -->
      ${questionsHtml}

      <!-- Bottom Actions -->
      <div class="footer-actions">
        <button type="submit" class="btn-submit">Submit</button>
        <button type="reset" class="btn-clear">Clear form</button>
      </div>

      <!-- Google Forms Branding -->
      <div class="form-footer-branding">
        <span>Never submit passwords through Google Forms.</span>
        <div style="margin-top: 6px; font-size: 11px;">
          This content is created by FormCraft AI and rendered as a preview before exporting to Google Drive.
        </div>
      </div>
    </form>
  </div>

  <script>
    function handleMockSubmit(e) {
      e.preventDefault();
      document.getElementById('mock-form').style.display = 'none';
      document.getElementById('success-screen').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetFormView() {
      document.getElementById('mock-form').reset();
      document.getElementById('success-screen').style.display = 'none';
      document.getElementById('mock-form').style.display = 'block';
    }
  </script>
</body>
</html>`;
  }, [schema]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[880px] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30 shadow-xs">
              <Eye className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Google Form Interactive Preview
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-purple-950 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-800">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Live Layout Simulation
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                Test inputs and explore respondent view before exporting to Google Drive
              </p>
            </div>
          </div>

          {/* Viewport Width Switchers & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  deviceView === 'desktop'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Desktop View (100%)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('tablet')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  deviceView === 'tablet'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  deviceView === 'mobile'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile View (390px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {onConfirmGenerate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmGenerate();
                }}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>{userLoggedIn ? 'Export to Google' : 'Sign in & Export'}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe Viewport Container */}
        <div className="flex-1 bg-slate-950/80 p-2 sm:p-6 overflow-hidden flex items-center justify-center">
          <div
            className="h-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-slate-700/50 flex flex-col"
            style={{
              width:
                deviceView === 'desktop'
                  ? '100%'
                  : deviceView === 'tablet'
                  ? '768px'
                  : '390px',
              maxWidth: '100%',
            }}
          >
            {/* Mock Browser Header */}
            <div className="bg-slate-100 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
                <span className="ml-2 font-mono text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                  https://docs.google.com/forms/d/e/.../viewform
                </span>
              </div>
              <span className="font-semibold text-purple-700 hidden sm:inline">
                {schema.questions.length} questions
              </span>
            </div>

            {/* Embedded Iframe */}
            <iframe
              id="google-form-mock-iframe"
              title="Google Form Mock Preview"
              srcDoc={iframeHtml}
              className="w-full h-full border-0 bg-[#ede7f6]"
              sandbox="allow-scripts"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Interactive respondent simulation active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Back to Editor
            </button>

            {onConfirmGenerate && (
              <button
                id="btn-preview-create-form"
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmGenerate();
                }}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {userLoggedIn ? 'Confirm & Create Form' : 'Sign in & Create Form'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
