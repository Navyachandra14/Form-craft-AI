import { ParsedFormSchema } from '../types';

export interface SmartTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  category: string;
  iconName: 'user-plus' | 'briefcase' | 'calendar' | 'file-check' | 'message-square' | 'shield-check';
  content: string;
  prebuiltSchema: ParsedFormSchema;
}

export const SMART_TEMPLATES: SmartTemplate[] = [
  {
    id: 'patient-intake',
    name: 'Patient Intake Form',
    badge: 'Healthcare',
    description: 'Pre-fills candidate name, email, phone, medical history, emergency contacts & insurance.',
    category: 'Medical',
    iconName: 'user-plus',
    content: `PATIENT MEDICAL INTAKE FORM\n\nPlease complete all fields prior to your appointment.\n\n1. Full Legal Name (Required)\n2. Date of Birth (Required)\n3. Email Address (Required)\n4. Phone Number (Required)\n5. Emergency Contact Name & Relationship (Required)\n6. Emergency Contact Phone Number (Required)\n7. Primary Reason for Visit\n8. Known Allergies (Select all that apply):\n   [ ] Penicillin / Antibiotics\n   [ ] Latex\n   [ ] Sulfa Drugs\n   [ ] Aspirin / NSAIDs\n   [ ] Food Allergies (Peanuts, Shellfish, Dairy)\n   [ ] No Known Drug Allergies\n9. Current Medications & Dosages\n10. Medical History Conditions (Select all that apply):\n   [ ] High Blood Pressure / Hypertension\n   [ ] Diabetes (Type 1 or 2)\n   [ ] Asthma / Respiratory\n   [ ] Heart Disease\n   [ ] Thyroid Disorder\n   [ ] None of the above\n11. Primary Health Insurance Provider & Policy ID\n12. Acknowledgment & Consent: I certify that the information provided is true and accurate.`,
    prebuiltSchema: {
      title: 'Patient Medical Intake Form',
      description: 'Confidential medical intake and health background questionnaire for new and returning patients.',
      detectedDocumentType: 'Medical Intake Form',
      totalFieldsDetected: 12,
      questions: [
        {
          id: 'pi_sec_1',
          title: 'Section 1: Patient Contact & Identification',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'pi_full_name',
          title: 'Full Legal Name',
          description: 'First, middle (if applicable), and last name as shown on legal ID',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'pi_dob',
          title: 'Date of Birth',
          description: 'Please select your birth date',
          type: 'DATE',
          required: true,
        },
        {
          id: 'pi_email',
          title: 'Email Address',
          description: 'Appointment reminders and clinical summaries will be sent here',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please provide a valid email address.',
          },
        },
        {
          id: 'pi_phone',
          title: 'Phone Number',
          description: 'Primary mobile or daytime phone number',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'PHONE',
            message: 'Please provide a valid phone number.',
          },
        },
        {
          id: 'pi_emergency_contact',
          title: 'Emergency Contact Name & Relationship',
          description: 'e.g., Jane Doe (Spouse) or John Smith (Parent)',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'pi_emergency_phone',
          title: 'Emergency Contact Phone Number',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'pi_sec_2',
          title: 'Section 2: Health Background & Clinical History',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'pi_visit_reason',
          title: 'Primary Reason for Visit',
          description: 'Briefly describe any symptoms, injuries, or wellness checkup goals',
          type: 'PARAGRAPH',
          required: true,
        },
        {
          id: 'pi_allergies',
          title: 'Known Allergies & Adverse Reactions',
          description: 'Check all substances or medications that cause adverse reactions',
          type: 'CHECKBOX',
          required: true,
          options: [
            'Penicillin / Antibiotics',
            'Latex',
            'Sulfa Drugs',
            'Aspirin / NSAIDs',
            'Food Allergies (Peanuts, Shellfish, Dairy)',
            'No Known Allergies (NKDA)',
          ],
        },
        {
          id: 'pi_medications',
          title: 'Current Prescriptions, Supplements & Dosages',
          description: 'List any daily medications, vitamins, or over-the-counter drugs',
          type: 'PARAGRAPH',
          required: false,
        },
        {
          id: 'pi_history',
          title: 'Personal Medical History',
          description: 'Check any existing or past diagnosed conditions',
          type: 'CHECKBOX',
          required: false,
          options: [
            'High Blood Pressure / Hypertension',
            'Diabetes (Type 1 or 2)',
            'Asthma / Respiratory Conditions',
            'Heart Disease / Cardiovascular',
            'Thyroid Disorder',
            'None of the above',
          ],
        },
        {
          id: 'pi_insurance',
          title: 'Health Insurance Provider & Member ID',
          description: 'e.g., Blue Cross Blue Shield - ID: X98234812',
          type: 'SHORT_TEXT',
          required: false,
        },
      ],
    },
  },
  {
    id: 'lead-generation',
    name: 'B2B Lead Generation & Intake',
    badge: 'Sales & Growth',
    description: 'Pre-fills prospect name, work email, company, budget, timeline & requirements.',
    category: 'Sales',
    iconName: 'briefcase',
    content: `B2B CLIENT INTAKE & LEAD QUALIFICATION FORM\n\n1. Full Legal Name (Required)\n2. Work Email Address (Required)\n3. Phone / Direct Line\n4. Company or Organization Name (Required)\n5. Job Title / Role (Required)\n6. Company Size:\n   ( ) 1-10 employees\n   ( ) 11-50 employees\n   ( ) 51-200 employees\n   ( ) 201-1000 employees\n   ( ) 1000+ enterprise\n7. Primary Services / Solutions Needed (Select all that apply):\n   [ ] AI Workflow Automation & Document Processing\n   [ ] Custom Web & Cloud Platform Engineering\n   [ ] Enterprise Integration & API Development\n   [ ] UI/UX Product Design\n   [ ] Data Analytics & Reporting Infrastructure\n8. Estimated Project Budget Range:\n   ( ) Under $10,000\n   ( ) $10,000 - $25,000\n   ( ) $25,000 - $50,000\n   ( ) $50,000 - $100,000\n   ( ) $100,000+\n9. Planned Implementation Timeline:\n   ( ) Immediately (within 2 weeks)\n   ( ) 1 - 2 Months\n   ( ) 3 - 6 Months\n   ( ) Exploring for future quarters\n10. Project Summary & Key Objectives`,
    prebuiltSchema: {
      title: 'B2B Project Inquiry & Discovery Form',
      description: 'Help our solutions engineering team understand your project requirements and scope.',
      detectedDocumentType: 'Lead Generation Form',
      totalFieldsDetected: 10,
      questions: [
        {
          id: 'lg_sec_1',
          title: 'Section 1: Contact & Company Profile',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'lg_full_name',
          title: 'Full Name',
          description: 'Your primary contact name',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'lg_work_email',
          title: 'Work Email Address',
          description: 'We will send the discovery deck and meeting invitation here',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please provide a valid company email address.',
          },
        },
        {
          id: 'lg_phone',
          title: 'Phone / Direct Line',
          type: 'SHORT_TEXT',
          required: false,
        },
        {
          id: 'lg_company_name',
          title: 'Company / Organization Name',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'lg_job_title',
          title: 'Job Title / Function',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'lg_company_size',
          title: 'Company Headcount',
          type: 'RADIO',
          required: true,
          options: [
            '1 - 10 employees',
            '11 - 50 employees',
            '51 - 200 employees',
            '201 - 1000 employees',
            '1000+ enterprise',
          ],
        },
        {
          id: 'lg_sec_2',
          title: 'Section 2: Project Scope & Timeline',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'lg_capabilities',
          title: 'Primary Capabilities or Solutions Needed',
          description: 'Select all focus areas that match your initiative',
          type: 'CHECKBOX',
          required: true,
          options: [
            'AI Workflow Automation & Document Processing',
            'Custom Web & Cloud Platform Engineering',
            'Enterprise API Integration & Data Pipelines',
            'UI/UX Product Design & User Research',
            'Data Analytics & Real-time Dashboards',
            'Other Custom Scope',
          ],
        },
        {
          id: 'lg_budget',
          title: 'Estimated Project Budget Range',
          type: 'RADIO',
          required: true,
          options: [
            'Under $10,000',
            '$10,000 - $25,000',
            '$25,000 - $50,000',
            '$50,000 - $100,000',
            '$100,000+',
          ],
        },
        {
          id: 'lg_timeline',
          title: 'Target Implementation Timeline',
          type: 'RADIO',
          required: true,
          options: [
            'Immediately (within 2 weeks)',
            '1 - 2 Months',
            '3 - 6 Months',
            'Exploring for future roadmap',
          ],
        },
        {
          id: 'lg_summary',
          title: 'Project Overview & Specific Goals',
          description: 'Share any context, current bottlenecks, or desired outcomes',
          type: 'PARAGRAPH',
          required: false,
        },
      ],
    },
  },
  {
    id: 'event-registration',
    name: 'Event & Conference Registration',
    badge: 'Events',
    description: 'Pre-fills attendee name, email, phone, ticket tier, dietary needs & workshop tracks.',
    category: 'Events',
    iconName: 'calendar',
    content: `ANNUAL TECH SUMMIT 2026 REGISTRATION\n\n1. Full Legal Name (Required)\n2. Attendee Email Address (Required)\n3. Mobile Phone Number (Required for SMS alerts)\n4. Organization / Affiliation\n5. Ticket & Access Tier:\n   ( ) General Admission Pass\n   ( ) VIP All-Access Pass\n   ( ) Speaker / Panelist Pass\n   ( ) Student / Academic Pass\n6. Dietary Preferences / Restrictions (Select one):\n   ( ) Standard (No Restrictions)\n   ( ) Vegetarian\n   ( ) Vegan\n   ( ) Gluten-Free\n   ( ) Halal / Kosher\n   ( ) Other\n7. Workshop Sessions You Plan to Attend (Select all that apply):\n   [ ] Keynote & Product Roadmap\n   [ ] Hands-On AI & Model Engineering Lab\n   [ ] Serverless Architecture & Cloud Scaling\n   [ ] Design Systems & Accessible UI\n   [ ] VIP Networking Dinner\n8. Date of Arrival\n9. Special Accessibility Accommodations or Requests`,
    prebuiltSchema: {
      title: 'Annual Tech Summit 2026 Attendee Registration',
      description: 'Reserve your pass and select your breakout workshop sessions for this year’s global conference.',
      detectedDocumentType: 'Event Registration Form',
      totalFieldsDetected: 9,
      questions: [
        {
          id: 'ev_sec_1',
          title: 'Section 1: Attendee Information',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'ev_full_name',
          title: 'Full Name',
          description: 'Name to be printed on your official conference badge',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'ev_email',
          title: 'Email Address',
          description: 'Your digital ticket QR code and schedule updates will be sent here',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please provide a valid email address.',
          },
        },
        {
          id: 'ev_phone',
          title: 'Mobile Phone Number',
          description: 'Used for important live session updates or emergency broadcast',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'ev_organization',
          title: 'Company / Organization / University',
          type: 'SHORT_TEXT',
          required: false,
        },
        {
          id: 'ev_ticket_tier',
          title: 'Ticket & Access Tier',
          type: 'RADIO',
          required: true,
          options: [
            'General Admission Pass',
            'VIP All-Access Pass (Includes Speaker Lounge)',
            'Speaker / Panelist Pass',
            'Student / Academic Pass',
          ],
        },
        {
          id: 'ev_sec_2',
          title: 'Section 2: Sessions & Preferences',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'ev_dietary',
          title: 'Catering & Dietary Requirements',
          description: 'All meals are prepared by certified conference hospitality staff',
          type: 'RADIO',
          required: true,
          options: [
            'Standard (No Restrictions)',
            'Vegetarian',
            'Vegan',
            'Gluten-Free',
            'Halal / Kosher',
            'Other Custom Dietary Requirement',
          ],
        },
        {
          id: 'ev_workshops',
          title: 'Breakout Workshops & Tracks',
          description: 'Select all sessions you wish to add to your personalized agenda',
          type: 'CHECKBOX',
          required: true,
          options: [
            'Keynote & AI Product Roadmap',
            'Hands-On Model Tuning & Multi-agent Systems Lab',
            'Cloud Scaling & High-Availability Architecture',
            'Modern Design Systems & UI Craftsmanship',
            'Executive Networking Reception',
          ],
        },
        {
          id: 'ev_arrival_date',
          title: 'Expected Arrival Date',
          type: 'DATE',
          required: true,
        },
        {
          id: 'ev_accommodations',
          title: 'Special Accessibility or Audio/Visual Accommodations',
          type: 'PARAGRAPH',
          required: false,
        },
      ],
    },
  },
  {
    id: 'benjamin-adloc-qa',
    name: 'Benjamin ADLoc — Image QA (14 Cases)',
    badge: 'Stress Test',
    description: '14 visual inspection cases with checkboxes, image prompts, and exact options.',
    category: 'QA Practice Sheet',
    iconName: 'file-check',
    content: `Benjamin ADLoc — Practice Image & Option Sheet
Blank practice sheet. No answers, no reasoning, no suggested selections.
Instruction: For every case, tick all options you believe apply.

=== SECTION: Respondent Information ===
Full Legal Name: [ _________________________ ] (Required)
Email Address: [ _________________________ ] (Required)
Candidate / Evaluator ID: [ _________________________ ]
Date of Evaluation: [ YYYY-MM-DD ]

=== SECTION: Case 1 — Street address ===
Case 1 Options (Select all that apply):
[ ] Extract/localise the scene text
[ ] Do not extract/localise

=== SECTION: Case 2 — DulcoSoft ===
Case 2 Options (Select all that apply):
[ ] brand name extracted
[ ] font color mismatch is noticeable
[ ] minor text removed trace but does not impact text group readability
[ ] over-grouping
[ ] font size significantly smaller or bigger than the source
[ ] font consistency
[ ] different and aligned page-level text groups

=== SECTION: Case 3 — Extractor hood ===
Case 3 Options (Select all that apply):
[ ] font color slightly different to the source
[ ] minor text removal trails
[ ] font size slightly smaller or bigger than the source
[ ] background color slightly different to the source

=== SECTION: Case 4 — 2025 / Spanish ===
Case 4 Options (Select all that apply):
[ ] background slight
[ ] background significantly deteriorated
[ ] font color slightly different to the source
[ ] font size significantly smaller or bigger than the source
[ ] over-grouping

=== SECTION: Case 5 — Intumescent cutter ===
Case 5 Options (Select all that apply):
[ ] background slightly distorted
[ ] font color slightly different to the source
[ ] font size slightly smaller or bigger than the source
[ ] alignment slightly differ from the source
[ ] minor text removal trace but does not impact text group readability

=== SECTION: Case 6 — Bone collage ===
Case 6 Options (Select all that apply):
[ ] background slightly distorted
[ ] font color slightly different to the source
[ ] font size slightly smaller or bigger than the source
[ ] alignment slightly different from the source
[ ] font consistency — rendered text format is inconsistent in parallel field groups

=== SECTION: Case 7 — Extras / button text ===
Case 7 Options (Select all that apply):
[ ] font color slightly different to the source
[ ] font size significantly smaller or bigger than the source
[ ] font consistency — rendered text format is inconsistent in parallel or paired groups

=== SECTION: Case 8 — Brick Botanicals ===
Case 8 Options (Select all that apply):
[ ] background slightly distorted
[ ] font size slightly smaller or bigger than the source
[ ] incorrect text extraction — text on product package is extracted for translation

=== SECTION: Case 9 — Sport & Fitness ===
Case 9 Options (Select all that apply):
[ ] font color slightly different to the source
[ ] minor text removal trace but does not impact text group readability
[ ] background slightly distorted

=== SECTION: Case 10 — Multi-Purpose ===
Case 10 Options (Select all that apply):
[ ] background slightly discolored
[ ] font colors slightly different to the source
[ ] font style like bold, font weight, italics, underline, font effects differ from the source

=== SECTION: Case 11 — GB20 Boost Sport ===
Case 11 Options (Select all that apply):
[ ] font color mismatch is noticeable
[ ] overgrouping
[ ] font size slightly smaller or bigger than source
[ ] font size significantly smaller or bigger than the source

=== SECTION: Case 12 — Reflux paragraph ===
Case 12 Options (Select all that apply):
[ ] font color mismatch is noticeable
[ ] font style slightly differs from the source
[ ] minor text removal trace but does not impact text group readability
[ ] text incompletely removal and text group readability is affected

=== SECTION: Case 13 — Books and eBooks ===
Case 13 Options (Select all that apply):
[ ] font color slightly different to the source
[ ] minor text removal trace but does not impact the text group readability
[ ] text completed
[ ] text incomplete removal and text group readability is affected
[ ] font size slightly smaller or bigger than the source

=== SECTION: Case 14 — Color-corrected panel ===
Case 14 Options (Select all that apply):
[ ] Noticeable color difference from the source and improved & full match
[ ] Noticeable color difference from the source and improved & partial match`,
    prebuiltSchema: {
      title: 'Benjamin ADLoc — Practice Image & Option Sheet (14 Cases)',
      description: 'Candidate visual localization and graphic QA assessment with 14 inspection cases and criteria checkboxes.',
      detectedDocumentType: 'QA Practice Sheet',
      totalFieldsDetected: 18,
      questions: [
        {
          id: 'qa_sec_id',
          title: 'Section 1: Candidate Identification',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'qa_cand_name',
          title: 'Full Legal Name',
          description: 'Candidate or evaluator name',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'qa_cand_email',
          title: 'Email Address',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please enter a valid email address.',
          },
        },
        {
          id: 'qa_cand_id',
          title: 'Candidate / Evaluator ID',
          type: 'SHORT_TEXT',
          required: false,
        },
        {
          id: 'qa_date',
          title: 'Date of Evaluation',
          type: 'DATE',
          required: true,
        },
        {
          id: 'qa_c1',
          title: 'Case 1 — Street address',
          description: 'Tick all options that apply for Case 1 scene text.',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 1: Street address sign inspection',
          options: ['Extract/localise the scene text', 'Do not extract/localise'],
        },
        {
          id: 'qa_c2',
          title: 'Case 2 — DulcoSoft',
          description: 'Tick all options that apply for Case 2 DulcoSoft visual mockup.',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 2: DulcoSoft packaging localization',
          options: [
            'brand name extracted',
            'font color mismatch is noticeable',
            'minor text removed trace but does not impact text group readability',
            'over-grouping',
            'font size significantly smaller or bigger than the source',
            'font consistency',
            'different and aligned page-level text groups',
          ],
        },
        {
          id: 'qa_c3',
          title: 'Case 3 — Extractor hood',
          description: 'Tick all options that apply for Case 3 extractor hood product label.',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 3: Extractor hood technical diagram',
          options: [
            'font color slightly different to the source',
            'minor text removal trails',
            'font size slightly smaller or bigger than the source',
            'background color slightly different to the source',
          ],
        },
        {
          id: 'qa_c4',
          title: 'Case 4 — 2025 / Spanish',
          description: 'Tick all options that apply for Case 4 banner layout.',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 4: 2025 Spanish promotional banner',
          options: [
            'background slight',
            'background significantly deteriorated',
            'font color slightly different to the source',
            'font size significantly smaller or bigger than the source',
            'over-grouping',
          ],
        },
        {
          id: 'qa_c5',
          title: 'Case 5 — Intumescent cutter',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 5: Cutter specification label',
          options: [
            'background slightly distorted',
            'font color slightly different to the source',
            'font size slightly smaller or bigger than the source',
            'alignment slightly differ from the source',
            'minor text removal trace but does not impact text group readability',
          ],
        },
        {
          id: 'qa_c6',
          title: 'Case 6 — Bone collage',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 6: Scientific diagram text layout',
          options: [
            'background slightly distorted',
            'font color slightly different to the source',
            'font size slightly smaller or bigger than the source',
            'alignment slightly different from the source',
            'font consistency — rendered text format is inconsistent in parallel field groups',
          ],
        },
        {
          id: 'qa_c7',
          title: 'Case 7 — Extras / button text',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 7: UI Button group rendering',
          options: [
            'font color slightly different to the source',
            'font size significantly smaller or bigger than the source',
            'font consistency — rendered text format is inconsistent in parallel or paired groups',
          ],
        },
        {
          id: 'qa_c8',
          title: 'Case 8 — Brick Botanicals',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 8: Product packaging brand text',
          options: [
            'background slightly distorted',
            'font size slightly smaller or bigger than the source',
            'incorrect text extraction — text on product package is extracted for translation',
          ],
        },
        {
          id: 'qa_c9',
          title: 'Case 9 — Sport & Fitness',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 9: Marketing fitness ad',
          options: [
            'font color slightly different to the source',
            'minor text removal trace but does not impact text group readability',
            'background slightly distorted',
          ],
        },
        {
          id: 'qa_c10',
          title: 'Case 10 — Multi-Purpose',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 10: Multi-purpose tool guide',
          options: [
            'background slightly discolored',
            'font colors slightly different to the source',
            'font style like bold, font weight, italics, underline, font effects differ from the source',
          ],
        },
        {
          id: 'qa_c11',
          title: 'Case 11 — GB20 Boost Sport',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 11: Nutrition bottle mockup',
          options: [
            'font color mismatch is noticeable',
            'overgrouping',
            'font size slightly smaller or bigger than source',
            'font size significantly smaller or bigger than the source',
          ],
        },
        {
          id: 'qa_c12',
          title: 'Case 12 — Reflux paragraph',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 12: Paragraph alignment review',
          options: [
            'font color mismatch is noticeable',
            'font style slightly differs from the source',
            'minor text removal trace but does not impact text group readability',
            'text incompletely removal and text group readability is affected',
          ],
        },
        {
          id: 'qa_c13',
          title: 'Case 13 — Books and eBooks',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 13: Digital cover typesetting',
          options: [
            'font color slightly different to the source',
            'minor text removal trace but does not impact the text group readability',
            'text completed',
            'text incomplete removal and text group readability is affected',
            'font size slightly smaller or bigger than the source',
          ],
        },
        {
          id: 'qa_c14',
          title: 'Case 14 — Color-corrected panel',
          type: 'CHECKBOX',
          required: true,
          hasImagePrompt: true,
          imageDescription: 'Case 14: Panel color correction calibration',
          options: [
            'Noticeable color difference from the source and improved & full match',
            'Noticeable color difference from the source and improved & partial match',
          ],
        },
      ],
    },
  },
  {
    id: 'customer-feedback',
    name: 'Customer Feedback & NPS Survey',
    badge: 'Feedback',
    description: 'Pre-fills satisfaction scale (1-10 NPS), feature priorities & contact consent.',
    category: 'Product',
    iconName: 'message-square',
    content: `PRODUCT SATISFACTION & NPS FEEDBACK SURVEY\n\n1. Full Legal Name\n2. Work Email Address\n3. Overall Product Satisfaction Rating (Scale 1-10)\n4. Which feature is most valuable to you?\n   ( ) Automatic Document to Form Conversion\n   ( ) Checkbox & Criteria Extraction\n   ( ) Live Google Sheets Synchronization\n   ( ) Schema Reordering & Customization\n5. What areas could we improve? (Select all that apply):\n   [ ] Processing Speed\n   [ ] Additional Export Formats\n   [ ] Team Sharing & Permissions\n   [ ] Custom Visual Branding\n6. Additional Comments or Suggestions\n7. Can our product team reach out for a 15-minute feedback call?\n   ( ) Yes, reach out to me\n   ( ) No, keep feedback anonymous`,
    prebuiltSchema: {
      title: 'Product Experience & NPS Survey',
      description: 'Help us improve your workflow by sharing your experience.',
      detectedDocumentType: 'Customer Survey',
      totalFieldsDetected: 7,
      questions: [
        {
          id: 'cs_full_name',
          title: 'Full Name',
          type: 'SHORT_TEXT',
          required: false,
        },
        {
          id: 'cs_email',
          title: 'Work Email Address',
          type: 'SHORT_TEXT',
          required: false,
          validationRule: {
            type: 'EMAIL',
            message: 'Please provide a valid email address.',
          },
        },
        {
          id: 'cs_nps',
          title: 'How likely are you to recommend us to a colleague or client?',
          description: '1 (Not at all likely) to 10 (Extremely likely)',
          type: 'SCALE',
          required: true,
          scaleLow: 1,
          scaleHigh: 10,
          scaleLowLabel: 'Not likely',
          scaleHighLabel: 'Extremely likely',
        },
        {
          id: 'cs_primary_feature',
          title: 'Which core capability is most valuable to your workflow?',
          type: 'RADIO',
          required: true,
          options: [
            'Automatic Document to Form Conversion',
            'Checkbox & Evaluation Criteria Extraction',
            'Instant Google Forms & Sheets Sync',
            'Visual Schema Reordering & Editing',
          ],
        },
        {
          id: 'cs_improvements',
          title: 'Which areas would you like to see improved?',
          description: 'Select all that apply',
          type: 'CHECKBOX',
          required: false,
          options: [
            'Processing Speed on Large Documents',
            'Additional Export Formats',
            'Multi-user Workspace Sharing',
            'Custom Themes & Branding Colors',
          ],
        },
        {
          id: 'cs_comments',
          title: 'Any specific feedback or feature requests?',
          type: 'PARAGRAPH',
          required: false,
        },
        {
          id: 'cs_followup',
          title: 'May our product team contact you for a brief follow-up?',
          type: 'RADIO',
          required: true,
          options: ['Yes, reach out via email', 'No, keep my response anonymous'],
        },
      ],
    },
  },
  {
    id: 'freelancer-intake',
    name: 'Freelancer & Contractor Onboarding',
    badge: 'Operations',
    description: 'Pre-fills contractor name, email, phone, rates, availability & NDA agreement.',
    category: 'Operations',
    iconName: 'shield-check',
    content: `FREELANCER & CONTRACTOR INTAKE FORM\n\n1. Full Legal Name (Required)\n2. Email Address (Required)\n3. Phone / WhatsApp ID (Required)\n4. Primary Professional Skills (Select all that apply):\n   [ ] Full-Stack Software Engineering\n   [ ] Technical Localization & Translation\n   [ ] Product & UI/UX Design\n   [ ] Quality Assurance & Test Automation\n5. Desired Hourly or Per-Word Rate (USD / EUR)\n6. Available Weekly Capacity:\n   ( ) 10 - 20 hours/week\n   ( ) 20 - 30 hours/week\n   ( ) 40 hours/week (Full-Time)\n7. Timezone & Primary Working Hours\n8. Earliest Available Start Date\n9. Portfolio URL or GitHub Profile Link\n10. Non-Disclosure & Confidentiality Agreement Checkbox (Required)`,
    prebuiltSchema: {
      title: 'Freelancer & Contractor Onboarding Form',
      description: 'Capture contractor qualifications, hourly rates, availability, and NDA confirmation.',
      detectedDocumentType: 'Contractor Intake',
      totalFieldsDetected: 10,
      questions: [
        {
          id: 'fc_sec_1',
          title: 'Section 1: Contractor Contact & Identity',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'fc_name',
          title: 'Full Legal Name',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'fc_email',
          title: 'Email Address',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please provide a valid email address.',
          },
        },
        {
          id: 'fc_phone',
          title: 'Phone / WhatsApp / Signal ID',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'fc_portfolio',
          title: 'Portfolio Website or GitHub Profile Link',
          type: 'SHORT_TEXT',
          required: false,
          validationRule: {
            type: 'URL',
            message: 'Please enter a valid URL (https://...).',
          },
        },
        {
          id: 'fc_sec_2',
          title: 'Section 2: Skills, Rates & Availability',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'fc_skills',
          title: 'Primary Skills & Specializations',
          description: 'Check all core areas of domain expertise',
          type: 'CHECKBOX',
          required: true,
          options: [
            'Full-Stack Software Engineering',
            'Technical Localization & Translation',
            'Product & UI/UX Design',
            'Quality Assurance & Test Automation',
            'Cloud Infrastructure & DevOps',
          ],
        },
        {
          id: 'fc_rate',
          title: 'Target Hourly Rate (USD / EUR)',
          description: 'e.g., $65/hr or €55/hr',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'fc_capacity',
          title: 'Available Weekly Capacity',
          type: 'RADIO',
          required: true,
          options: [
            '10 - 20 hours/week (Part-Time)',
            '20 - 30 hours/week (Substantial)',
            '40 hours/week (Full-Time Dedicated)',
          ],
        },
        {
          id: 'fc_start_date',
          title: 'Earliest Project Start Date',
          type: 'DATE',
          required: true,
        },
        {
          id: 'fc_nda',
          title: 'Confidentiality & Non-Disclosure Agreement (NDA)',
          description: 'I agree to maintain strict confidentiality regarding all proprietary materials and client data.',
          type: 'CHECKBOX',
          required: true,
          options: ['I agree to the terms of the Non-Disclosure Agreement'],
        },
      ],
    },
  },
];

// Backward compatibility alias
export const SAMPLE_TEMPLATES = SMART_TEMPLATES;
export type SampleTemplate = SmartTemplate;
