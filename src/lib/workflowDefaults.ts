import { WorkflowTriggerSettings, CandidateEmailTemplate } from '../types';

export function getDefaultWorkflowSettings(formTitle: string = 'Assessment / Intake Form'): WorkflowTriggerSettings {
  return {
    enabled: true,
    scoringMode: 'QUIZ_SCORE',
    passThresholdPercent: 80,
    reviewThresholdPercent: 70,
    allowRetakes: true,
    maxRetakes: 2,
    retakeCooldownHours: 24,
    notificationChannels: {
      sendEmailToCandidate: true,
      whatsappGroupUrl: 'https://chat.whatsapp.com/demo-invite-link',
      telegramChannelUrl: '',
      googleMeetUrl: 'https://meet.google.com/abc-defg-hij',
      calendlyUrl: '',
    },
    googleSheetsAutomation: {
      autoColorCodeTiers: true,
      generateAppsScript: true,
    },
    passedTemplate: {
      enabled: true,
      subject: `🎉 Congratulations! You Passed the ${formTitle} Assessment`,
      headline: 'Outstanding Performance — Next Steps in Evaluation',
      body: `Dear {{candidate_name}},\n\nWe are thrilled to let you know that you have successfully cleared the {{form_title}} with a score of {{score_percent}}% ({{score_points}}/{{total_points}} points).\n\nYour score surpasses our quality threshold (≥80%), and we would like to invite you to the next phase of our project onboarding immediately.`,
      actionButtonText: '💬 Join WhatsApp Project Group',
      actionButtonUrl: 'https://chat.whatsapp.com/demo-invite-link',
      secondaryActionText: '📅 Schedule Onboarding Briefing',
      secondaryActionUrl: 'https://meet.google.com/abc-defg-hij',
      instructionsNote: 'Please join the group within 24 hours to secure your batch allotment and receive your dataset credentials.',
      additionalNotes: 'Keep your candidate reference ID ready for verification upon joining the group.',
    },
    reviewTemplate: {
      enabled: true,
      subject: `⏳ Update on your submission for ${formTitle} (Under Review)`,
      headline: 'Assessment Result: Borderline Score under QA Review',
      body: `Dear {{candidate_name}},\n\nThank you for completing the {{form_title}}. You achieved a score of {{score_percent}}% ({{score_points}}/{{total_points}} points).\n\nYour submission falls within our review margin (70% - 79%). Our QA Lead is conducting a secondary audit of your responses. You will receive a final confirmation within 1-2 business days.`,
      actionButtonText: '📄 View Candidate Portal Status',
      actionButtonUrl: 'https://example.com/status',
      instructionsNote: 'No action is required from you at this time. We will reach out via email as soon as the manual audit is finalized.',
    },
    failedTemplate: {
      enabled: true,
      subject: `Notice regarding your assessment for ${formTitle}`,
      headline: 'Assessment Result & Reattempt Eligibility',
      body: `Dear {{candidate_name}},\n\nThank you for taking the time to complete the {{form_title}}. Your score was {{score_percent}}% ({{score_points}}/{{total_points}} points).\n\nWhile this does not meet the passing benchmark for this specific cycle (≥80%), we appreciate your effort and invite you to review our guidelines and reattempt.`,
      actionButtonText: '🔄 Reattempt Assessment Test',
      actionButtonUrl: 'https://forms.google.com',
      instructionsNote: 'Reattempts are permitted after a 24-hour cooldown period. Please review our documentation and style guide before submitting again.',
      additionalNotes: 'We maintain regular open batches, and past candidates frequently clear on subsequent attempts.',
    },
  };
}

export function renderEmailVariables(
  text: string,
  variables: {
    candidateName?: string;
    scorePercent?: number;
    scorePoints?: number;
    totalPoints?: number;
    formTitle?: string;
  }
): string {
  if (!text) return '';
  return text
    .replace(/\{\{candidate_name\}\}/gi, variables.candidateName || 'Applicant')
    .replace(/\{\{score_percent\}\}/gi, String(variables.scorePercent ?? 85))
    .replace(/\{\{score_points\}\}/gi, String(variables.scorePoints ?? 17))
    .replace(/\{\{total_points\}\}/gi, String(variables.totalPoints ?? 20))
    .replace(/\{\{form_title\}\}/gi, variables.formTitle || 'Assessment');
}

/**
 * Generates ready-to-use Google Apps Script for the connected Google Sheet
 * to automate email triggers, color coding, and WhatsApp invitations upon form submit.
 */
export function generateAppsScriptCode(
  formTitle: string,
  settings: WorkflowTriggerSettings
): string {
  const passPct = settings.passThresholdPercent || 80;
  const reviewPct = settings.reviewThresholdPercent || 70;
  const waLink = settings.passedTemplate.actionButtonUrl || settings.notificationChannels.whatsappGroupUrl || 'https://chat.whatsapp.com/...';
  const meetLink = settings.passedTemplate.secondaryActionUrl || settings.notificationChannels.googleMeetUrl || 'https://meet.google.com/...';

  return `/**
 * FormCraft AI — Automated Workflow & Candidate Evaluation Script
 * 
 * Instructions:
 * 1. Open your connected Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Replace all existing code with this script.
 * 4. Click Triggers (clock icon on the left) > Add Trigger:
 *    - Function: onFormSubmit
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 * 5. Click Save & Authorize permissions.
 */

function onFormSubmit(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var row = e ? e.range.getRow() : sheet.getLastRow();
    var data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Detect Email and Name columns
    var emailIndex = -1;
    var nameIndex = -1;
    var scoreIndex = -1;

    for (var i = 0; i < headers.length; i++) {
      var h = headers[i].toString().toLowerCase();
      if (emailIndex === -1 && (h.includes('email') || h.includes('mail'))) emailIndex = i;
      if (nameIndex === -1 && (h.includes('name') || h.includes('full name'))) nameIndex = i;
      if (scoreIndex === -1 && (h.includes('score') || h.includes('points') || h.includes('grade'))) scoreIndex = i;
    }

    var recipientEmail = emailIndex !== -1 ? data[emailIndex] : null;
    var candidateName = nameIndex !== -1 ? data[nameIndex] : 'Applicant';
    
    // Parse score from form response if available
    var scorePercent = ${passPct}; // Default or parsed
    if (scoreIndex !== -1 && data[scoreIndex]) {
      var rawScore = data[scoreIndex].toString();
      var match = rawScore.match(/(\\d+)\\s*\\/\\s*(\\d+)/);
      if (match) {
        scorePercent = Math.round((parseFloat(match[1]) / parseFloat(match[2])) * 100);
      } else if (!isNaN(parseFloat(rawScore))) {
        scorePercent = parseFloat(rawScore);
      }
    }

    var statusCol = sheet.getLastColumn();
    var statusText = '';
    var rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());

    // TIER 1: PASS (>= ${passPct}%)
    if (scorePercent >= ${passPct}) {
      statusText = 'PASSED (Tier 1 - Eligible)';
      ${settings.googleSheetsAutomation.autoColorCodeTiers ? `rowRange.setBackground('#D1FADF'); // Light Green` : ''}

      ${settings.passedTemplate.enabled ? `
      if (recipientEmail && recipientEmail.includes('@')) {
        MailApp.sendEmail({
          to: recipientEmail,
          subject: "${escapeString(settings.passedTemplate.subject)}",
          htmlBody: "<div style='font-family: sans-serif; max-width: 600px; color: #1e293b;'>" +
                    "<h2 style='color: #047857;'>${escapeString(settings.passedTemplate.headline)}</h2>" +
                    "<p>Dear " + candidateName + ",</p>" +
                    "<p>${escapeString(settings.passedTemplate.body.replace(/\n/g, '<br>'))}</p>" +
                    "<div style='margin: 24px 0;'>" +
                    "<a href='${waLink}' style='background: #059669; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>${escapeString(settings.passedTemplate.actionButtonText || 'Join WhatsApp Group')}</a>" +
                    "</div>" +
                    "<p style='font-size: 12px; color: #64748b;'>${escapeString(settings.passedTemplate.instructionsNote || '')}</p>" +
                    "</div>"
        });
      }` : ''}
    }
    // TIER 2: BORDERLINE / REVIEW (${reviewPct}% - ${passPct - 1}%)
    else if (scorePercent >= ${reviewPct}) {
      statusText = 'UNDER REVIEW (Tier 2 - Margin)';
      ${settings.googleSheetsAutomation.autoColorCodeTiers ? `rowRange.setBackground('#FEF0C7'); // Light Amber` : ''}

      ${settings.reviewTemplate.enabled ? `
      if (recipientEmail && recipientEmail.includes('@')) {
        MailApp.sendEmail({
          to: recipientEmail,
          subject: "${escapeString(settings.reviewTemplate.subject)}",
          htmlBody: "<div style='font-family: sans-serif; max-width: 600px; color: #1e293b;'>" +
                    "<h2 style='color: #b45309;'>${escapeString(settings.reviewTemplate.headline)}</h2>" +
                    "<p>Dear " + candidateName + ",</p>" +
                    "<p>${escapeString(settings.reviewTemplate.body.replace(/\n/g, '<br>'))}</p>" +
                    "<p style='font-size: 12px; color: #64748b;'>${escapeString(settings.reviewTemplate.instructionsNote || '')}</p>" +
                    "</div>"
        });
      }` : ''}
    }
    // TIER 3: FAILED (< ${reviewPct}%)
    else {
      statusText = 'REATTEMPT / NOT CLEARED (Tier 3)';
      ${settings.googleSheetsAutomation.autoColorCodeTiers ? `rowRange.setBackground('#FEE4E2'); // Light Rose` : ''}

      ${settings.failedTemplate.enabled ? `
      if (recipientEmail && recipientEmail.includes('@')) {
        MailApp.sendEmail({
          to: recipientEmail,
          subject: "${escapeString(settings.failedTemplate.subject)}",
          htmlBody: "<div style='font-family: sans-serif; max-width: 600px; color: #1e293b;'>" +
                    "<h2 style='color: #be123c;'>${escapeString(settings.failedTemplate.headline)}</h2>" +
                    "<p>Dear " + candidateName + ",</p>" +
                    "<p>${escapeString(settings.failedTemplate.body.replace(/\n/g, '<br>'))}</p>" +
                    "<p style='font-size: 12px; color: #64748b;'>${escapeString(settings.failedTemplate.instructionsNote || '')}</p>" +
                    "</div>"
        });
      }` : ''}
    }

    // Append / update status note in last column
    sheet.getRange(row, statusCol).setNote(statusText + ' - Processed at ' + new Date().toLocaleString());
  } catch (err) {
    Logger.log('Error in onFormSubmit: ' + err.toString());
  }
}

function escapeString(str) {
  if (!str) return '';
  return str.replace(/"/g, '\\\\"').replace(/\\n/g, ' ');
}
`;
}

function escapeString(str: string): string {
  if (!str) return '';
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

export function generateGoogleAppsScript(
  settings: WorkflowTriggerSettings,
  formTitle: string = 'Assessment / Intake Form'
): string {
  return generateAppsScriptCode(formTitle, settings);
}

