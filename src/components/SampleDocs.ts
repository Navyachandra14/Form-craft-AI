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
    id: 'benjamin-adloc-practice',
    name: 'Benjamin ADLoc — Practice Image & Option Sheet',
    badge: '14 Visual Cases',
    description: 'Direct 1:1 conversion of the 14 visual case evaluation rubrics and checkbox sheets with sequenced media references.',
    category: 'Visual Evaluation',
    iconName: 'file-check',
    content: `Benjamin ADLoc — Practice Image & Option Sheet\nBlank practice sheet. No answers, no reasoning, no suggested selections.\nInstruction: For every case, tick all options you believe apply. Do not use this sheet as an answer key. The checkboxes are intentionally blank.\n\nCase 1 — Street address\n[ ] Extract/localise the scene text\n[ ] Do not extract/localise\n\nCase 2 — DulcoSoft\n[ ] brand name extracted\n[ ] font color mismatch is noticeable\n[ ] minor text removed trace but does not impact text group readability\n[ ] over-grouping\n[ ] font size significantly smaller or bigger than the source\n[ ] font consistency\n[ ] different and aligned page-level text groups\n\nCase 3 — Extractor hood\n[ ] font color slightly different to the source\n[ ] minor text removal trails\n[ ] font size slightly smaller or bigger than the source\n[ ] background color slightly different to the source\n\nCase 4 — 2025 / Spanish\n[ ] background slight\n[ ] background significantly deteriorated\n[ ] font color slightly different to the source\n[ ] font size significantly smaller or bigger than the source\n[ ] over-grouping\n\nCase 5 — Intumescent cutter\n[ ] background slightly distorted\n[ ] font color slightly different to the source\n[ ] font size slightly smaller or bigger than the source\n[ ] alignment slightly differ from the source\n[ ] minor text removal trace but does not impact text group readability\n\nCase 6 — Bone collage\n[ ] background slightly distorted\n[ ] font color slightly different to the source\n[ ] font size slightly smaller or bigger than the source\n[ ] alignment slightly different from the source\n[ ] font consistency — rendered text format is inconsistent in parallel field groups\n\nCase 7 — Extras / button text\n[ ] font color slightly different to the source\n[ ] font size significantly smaller or bigger than the source\n[ ] font consistency — rendered text format is inconsistent in parallel or paired groups\n\nCase 8 — Brick Botanicals\n[ ] background slightly distorted\n[ ] font size slightly smaller or bigger than the source\n[ ] incorrect text extraction — text on product package is extracted for translation\n\nCase 9 — Sport & Fitness\n[ ] font color slightly different to the source\n[ ] minor text removal trace but does not impact text group readability\n[ ] background slightly distorted\n\nCase 10 — Multi-Purpose\n[ ] background slightly discolored\n[ ] font colors slightly different to the source\n[ ] font style like bold, font weight, italics, underline, font effects differ from the source\n\nCase 11 — GB20 Boost Sport\n[ ] font color mismatch is noticeable\n[ ] overgrouping\n[ ] font size slightly smaller or bigger than source\n[ ] font size significantly smaller or bigger than the source\n\nCase 12 — Reflux paragraph\n[ ] font color mismatch is noticeable\n[ ] font style slightly differs from the source\n[ ] minor text removal trace but does not impact text group readability\n[ ] text incompletely removal and text group readability is affected\n\nCase 13 — Books and eBooks\n[ ] font color slightly different to the source\n[ ] minor text removal trace but does not impact the text group readability\n[ ] text completed\n[ ] text incomplete removal and text group readability is affected\n[ ] font size slightly smaller or bigger than the source\n\nCase 14 — Color-corrected panel\n[ ] Noticeable color difference from the source and improved & full match\n[ ] Noticeable color difference from the source and improved & partial match`,
    prebuiltSchema: {
      title: 'Benjamin ADLoc — Practice Image & Option Sheet',
      description: 'Blank practice sheet. For every case, tick all options you believe apply. Checkboxes are intentionally blank.',
      detectedDocumentType: 'Visual Evaluation Sheet',
      totalFieldsDetected: 14,
      questions: [
        {
          id: 'case_1',
          title: 'Case 1 — Street address',
          description: 'Tick all options you believe apply for Case 1.',
          type: 'CHECKBOX',
          required: true,
          options: ['Extract/localise the scene text', 'Do not extract/localise'],
          hasImagePrompt: true,
          imageDescription: 'Case 1 — Street address reference asset',
        },
        {
          id: 'case_2',
          title: 'Case 2 — DulcoSoft',
          description: 'Tick all options you believe apply for Case 2.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'brand name extracted',
            'font color mismatch is noticeable',
            'minor text removed trace but does not impact text group readability',
            'over-grouping',
            'font size significantly smaller or bigger than the source',
            'font consistency',
            'different and aligned page-level text groups',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 2 — DulcoSoft reference asset',
        },
        {
          id: 'case_3',
          title: 'Case 3 — Extractor hood',
          description: 'Tick all options you believe apply for Case 3.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'font color slightly different to the source',
            'minor text removal trails',
            'font size slightly smaller or bigger than the source',
            'background color slightly different to the source',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 3 — Extractor hood reference asset',
        },
        {
          id: 'case_4',
          title: 'Case 4 — 2025 / Spanish',
          description: 'Tick all options you believe apply for Case 4.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'background slight',
            'background significantly deteriorated',
            'font color slightly different to the source',
            'font size significantly smaller or bigger than the source',
            'over-grouping',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 4 — 2025 / Spanish reference asset',
        },
        {
          id: 'case_5',
          title: 'Case 5 — Intumescent cutter',
          description: 'Tick all options you believe apply for Case 5.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'background slightly distorted',
            'font color slightly different to the source',
            'font size slightly smaller or bigger than the source',
            'alignment slightly differ from the source',
            'minor text removal trace but does not impact text group readability',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 5 — Intumescent cutter reference asset',
        },
        {
          id: 'case_6',
          title: 'Case 6 — Bone collage',
          description: 'Tick all options you believe apply for Case 6.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'background slightly distorted',
            'font color slightly different to the source',
            'font size slightly smaller or bigger than the source',
            'alignment slightly different from the source',
            'font consistency — rendered text format is inconsistent in parallel field groups',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 6 — Bone collage reference asset',
        },
        {
          id: 'case_7',
          title: 'Case 7 — Extras / button text',
          description: 'Tick all options you believe apply for Case 7.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'font color slightly different to the source',
            'font size slightly smaller or bigger than the source',
            'font consistency — rendered text format is inconsistent in parallel or paired groups',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 7 — Extras / button text reference asset',
        },
        {
          id: 'case_8',
          title: 'Case 8 — Brick Botanicals',
          description: 'Tick all options you believe apply for Case 8.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'background slightly distorted',
            'font size slightly smaller or bigger than the source',
            'incorrect text extraction — text on product package is extracted for translation',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 8 — Brick Botanicals reference asset',
        },
        {
          id: 'case_9',
          title: 'Case 9 — Sport & Fitness',
          description: 'Tick all options you believe apply for Case 9.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'font color slightly different to the source',
            'minor text removal trace but does not impact text group readability',
            'background slightly distorted',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 9 — Sport & Fitness reference asset',
        },
        {
          id: 'case_10',
          title: 'Case 10 — Multi-Purpose',
          description: 'Tick all options you believe apply for Case 10.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'background slightly discolored',
            'font colors slightly different to the source',
            'font style like bold, font weight, italics, underline, font effects differ from the source',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 10 — Multi-Purpose reference asset',
        },
        {
          id: 'case_11',
          title: 'Case 11 — GB20 Boost Sport',
          description: 'Tick all options you believe apply for Case 11.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'font color mismatch is noticeable',
            'overgrouping',
            'font size slightly smaller or bigger than source',
            'font size significantly smaller or bigger than the source',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 11 — GB20 Boost Sport reference asset',
        },
        {
          id: 'case_12',
          title: 'Case 12 — Reflux paragraph',
          description: 'Tick all options you believe apply for Case 12.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'font color mismatch is noticeable',
            'font style slightly differs from the source',
            'minor text removal trace but does not impact text group readability',
            'text incompletely removal and text group readability is affected',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 12 — Reflux paragraph reference asset',
        },
        {
          id: 'case_13',
          title: 'Case 13 — Books and eBooks',
          description: 'Tick all options you believe apply for Case 13.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'font color slightly different to the source',
            'minor text removal trace but does not impact the text group readability',
            'text completed',
            'text incomplete removal and text group readability is affected',
            'font size slightly smaller or bigger than the source',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 13 — Books and eBooks reference asset',
        },
        {
          id: 'case_14',
          title: 'Case 14 — Color-corrected panel',
          description: 'Tick all options you believe apply for Case 14.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'Noticeable color difference from the source and improved & full match',
            'Noticeable color difference from the source and improved & partial match',
          ],
          hasImagePrompt: true,
          imageDescription: 'Case 14 — Color-corrected panel reference asset',
        },
      ],
    },
  },
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
    content: `FREELANCER & CONTRACTOR INTAKE FORM\n\n1. Full Legal Name (Required)\n2. Email Address (Required)\n3. Phone / WhatsApp ID (Required)\n4. Upload Resume / Professional CV (Required PDF/DOCX, max 10MB)\n5. Upload Portfolio Work Sample or Screenshot (Optional PNG/JPG/PDF, max 10MB)\n6. Portfolio URL or GitHub Profile Link\n7. Primary Professional Skills (Select all that apply):\n   [ ] Full-Stack Software Engineering\n   [ ] Technical Localization & Translation\n   [ ] Product & UI/UX Design\n   [ ] Quality Assurance & Test Automation\n8. Desired Hourly Rate (USD / EUR)\n9. Available Weekly Capacity:\n   ( ) 10 - 20 hours/week\n   ( ) 20 - 30 hours/week\n   ( ) 40 hours/week (Full-Time)\n10. Earliest Available Start Date\n11. Non-Disclosure & Confidentiality Agreement Checkbox (Required)`,
    prebuiltSchema: {
      title: 'Freelancer & Contractor Onboarding Form',
      description: 'Capture contractor qualifications, resume, work samples, hourly rates, availability, and NDA confirmation.',
      detectedDocumentType: 'Contractor Intake',
      totalFieldsDetected: 11,
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
          validationRule: {
            type: 'PHONE',
            message: 'Please provide a valid phone number.',
          },
        },
        {
          id: 'fc_resume',
          title: 'Upload Resume / Professional CV',
          description: 'Please upload your latest resume (PDF or DOCX format, max 10 MB).',
          type: 'FILE_UPLOAD',
          required: true,
          acceptedFileTypes: ['PDF', 'DOCUMENT'],
          maxFiles: 1,
          maxFileSizeMb: 10,
          validationRule: {
            type: 'FILE_UPLOAD',
            message: 'Please upload your resume in PDF or DOCX format (max 10MB).',
            allowedFileTypes: ['PDF', 'DOCUMENT'],
            maxFileSizeMb: 10,
          },
        },
        {
          id: 'fc_work_sample',
          title: 'Upload Portfolio Work Sample or Screenshot',
          description: 'Upload visual design samples, code screenshots, or case studies (PNG, JPG, or PDF).',
          type: 'FILE_UPLOAD',
          required: false,
          acceptedFileTypes: ['IMAGE', 'PDF'],
          maxFiles: 3,
          maxFileSizeMb: 10,
          validationRule: {
            type: 'FILE_UPLOAD',
            message: 'Please upload valid image or PDF files (max 10MB each).',
            allowedFileTypes: ['IMAGE', 'PDF'],
            maxFileSizeMb: 10,
          },
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
          validationRule: {
            type: 'NUMBER',
            message: 'Please enter a valid numeric hourly rate.',
          },
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
  {
    id: 'lang-localization-intake',
    name: 'Language & Localization Specialist Intake',
    badge: 'Indian & Global Langs',
    description: 'Recruitment & data collection form for Indic (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi) and Global localization projects.',
    category: 'Localization',
    iconName: 'briefcase',
    content: `Language & Localization Specialist Intake\nPart A: Personal Information & Contact\nFull Name\nEmail Address (Validation: Email)\nMobile / WhatsApp Number (Validation: Phone)\nCountry & Current State/City of Residence\n\nPart B: Language Fluency & Native Dialect\nNative / First Language (L1): Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam, Punjabi, Odia, Japanese, German, Spanish, French, Mandarin, Arabic, Other\nSpecific Dialect / Regional Variety\nSecondary / Working Languages\nEnglish Proficiency Level: Native / Bilingual, Full Professional (C2), Professional Working (C1), Conversational (B2)\n\nPart C: Technical Translation & CAT Tools Experience\nCAT Tools Proficiency: SDL Trados Studio, memoQ, Phrase (Memsource), Smartcat, Google Translator Toolkit\nAverage Daily Translation Capacity (Words per Day): Under 1,000, 1,000 - 2,000, 2,000 - 3,500, 3,500+\nSpecialized Translation Domains: Technical / IT, Medical / Healthcare, Legal / Contracts, Marketing / Transcreation, Subtitling / Media\n\nPart D: Verification & Portfolio\nUpload CV / Resume (PDF / DOCX, max 10MB)\nLink to ProZ / LinkedIn / Translation Portfolio (Validation: URL)\nI confirm all language credentials are authentic and verified.`,
    prebuiltSchema: {
      title: 'Language & Localization Specialist Intake',
      description: 'Comprehensive screening & registration form for multilingual localization, translation, and linguistic data collection projects.',
      detectedDocumentType: 'Localization Application Form',
      totalFieldsDetected: 14,
      questions: [
        {
          id: 'loc_sec_1',
          title: 'Section 1: Applicant Profile & Contact',
          description: 'Please provide your basic contact details for project coordination.',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'loc_name',
          title: 'Full Name (as per legal identification)',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'loc_email',
          title: 'Email Address',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please enter a valid email address.',
          },
        },
        {
          id: 'loc_phone',
          title: 'Mobile / WhatsApp Number (with country code)',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'PHONE',
            message: 'Please enter a valid phone number with country code.',
          },
        },
        {
          id: 'loc_location',
          title: 'Current City & State / Country of Residence',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'loc_sec_2',
          title: 'Section 2: Language Proficiency & Native Dialects',
          description: 'Identify your native languages, dialects, and certified proficiency levels.',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'loc_native_lang',
          title: 'Primary Native Language (L1)',
          description: 'Select the language you speak as your mother tongue.',
          type: 'DROP_DOWN',
          required: true,
          options: [
            'Hindi (हिन्दी)',
            'Tamil (தமிழ்)',
            'Telugu (తెలుగు)',
            'Kannada (ಕನ್ನಡ)',
            'Bengali (বাংলা)',
            'Marathi (मराठी)',
            'Gujarati (ગુજરાતી)',
            'Malayalam (മലയാളം)',
            'Punjabi (ਪੰਜਾਬੀ)',
            'Odia (ଓଡ଼ିଆ)',
            'Japanese (日本語)',
            'German (Deutsch)',
            'Spanish (Español)',
            'French (Français)',
            'Mandarin Chinese (中文)',
            'Arabic (العربية)',
            'Other Indic / World Language',
          ],
        },
        {
          id: 'loc_dialect',
          title: 'Specific Dialect or Regional Variety',
          description: 'e.g., Kongu Tamil, Telangana Telugu, Awadhi/Bhojpuri Hindi, Kansai Japanese, Castilian Spanish',
          type: 'SHORT_TEXT',
          required: false,
        },
        {
          id: 'loc_english_level',
          title: 'English Language Competence (CEFR Level)',
          type: 'RADIO',
          required: true,
          options: [
            'C2 / Native or Bilingual Fluency',
            'C1 / Full Professional Proficiency',
            'B2 / Professional Working Proficiency',
            'B1 / Intermediate Conversational',
          ],
        },
        {
          id: 'loc_cat_tools',
          title: 'CAT Tools & Translation Software Experience',
          description: 'Select all localization platforms you operate comfortably.',
          type: 'CHECKBOX',
          required: true,
          options: [
            'SDL Trados Studio',
            'memoQ',
            'Phrase (Memsource)',
            'Smartcat',
            'Crowdin / Lokalise',
            'Subtitle Edit / Aegisub',
          ],
        },
        {
          id: 'loc_daily_words',
          title: 'Average Daily Translation / Review Capacity',
          type: 'RADIO',
          required: true,
          options: [
            'Under 1,000 words / day',
            '1,000 – 2,000 words / day',
            '2,000 – 3,500 words / day',
            '3,500+ words / day (High throughput)',
          ],
        },
        {
          id: 'loc_sec_3',
          title: 'Section 3: Credentials & Resume Verification',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'loc_portfolio_url',
          title: 'LinkedIn / ProZ.com / Translator Portfolio Link',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'URL',
            message: 'Please enter a valid URL (e.g. https://www.linkedin.com/in/... or https://www.proz.com/...).',
          },
        },
        {
          id: 'loc_resume',
          title: 'Upload Updated Linguistic CV / Resume',
          description: 'Required: PDF or DOCX format, max 10MB.',
          type: 'FILE_UPLOAD',
          required: true,
          acceptedFileTypes: ['PDF', 'DOCUMENT'],
          maxFileSizeMb: 10,
          maxFiles: 1,
          validationRule: {
            type: 'FILE_UPLOAD',
            message: 'Please upload your CV in PDF or DOCX format (max 10MB).',
            allowedFileTypes: ['PDF', 'DOCUMENT'],
            maxFileSizeMb: 10,
          },
        },
      ],
    },
  },
  {
    id: 'transcription-project-intake',
    name: 'Audio Transcription & Quality Benchmark Intake',
    badge: 'Speech & Verbatim',
    description: 'Screening form for audio/video transcription, timestamping, medical/legal terminology, and verbatim accuracy.',
    category: 'Transcription',
    iconName: 'file-check',
    content: `Audio Transcription & Quality Benchmark Intake\nSection 1: Transcriber Profile\nFull Name\nWork Email (Validation: Email)\nContact Phone (Validation: Phone)\n\nSection 2: Technical Competencies & Benchmarks\nTyping Speed (WPM): Under 50 WPM, 50 - 70 WPM, 70 - 90 WPM, 90+ WPM\nAudio Transcription Experience: Less than 1 year, 1 - 3 years, 3 - 5 years, 5+ years\nTranscription Modalities: Clean Verbatim, Strict / Full Verbatim (including stutters & false starts), Time-stamped (every 30s / speaker change), Phonetic Transcription\nSpecialized Terminologies: Medical Transcription, Legal / Court Proceedings, Technical / Engineering Podcasts, Multi-Speaker Financial Earnings Calls\nFoot Pedal & Headset Equipment: High-End Over-Ear Headphones, USB Foot Pedal Controller, Express Scribe Pro / InqScribe, Noise-Cancelling DAC\n\nSection 3: Quality Compliance\nI agree to follow the project-specific Style Guide and complete benchmark audio QA tests accurately.\nUpload Sample Transcription File (PDF / DOCX, max 10MB)`,
    prebuiltSchema: {
      title: 'Audio Transcription & Quality Benchmark Intake',
      description: 'Registration and technical skills assessment for speech-to-text transcriptionists and acoustic QA annotators.',
      detectedDocumentType: 'Transcription Application',
      totalFieldsDetected: 10,
      questions: [
        {
          id: 'tr_sec_1',
          title: 'Section 1: Transcriber Profile',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'tr_name',
          title: 'Full Name',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'tr_email',
          title: 'Email Address',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please enter a valid email address.',
          },
        },
        {
          id: 'tr_phone',
          title: 'Phone Number',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'PHONE',
            message: 'Please enter a valid phone number.',
          },
        },
        {
          id: 'tr_sec_2',
          title: 'Section 2: Speed, Accuracy & Tooling',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'tr_wpm',
          title: 'Verified Typing Speed (Words Per Minute)',
          type: 'RADIO',
          required: true,
          options: ['Under 50 WPM', '50 – 70 WPM', '70 – 90 WPM', '90+ WPM (Master)'],
        },
        {
          id: 'tr_modalities',
          title: 'Transcription Styles & Guidelines Mastered',
          type: 'CHECKBOX',
          required: true,
          options: [
            'Clean Verbatim (Omitting filler words)',
            'Strict Full Verbatim (Capturing false starts, ums, ahs)',
            'Timestamping (per speaker turn / interval)',
            'Multi-speaker Diarization (Speaker identification)',
          ],
        },
        {
          id: 'tr_domains',
          title: 'Specialized Domain Experience',
          type: 'CHECKBOX',
          required: false,
          options: [
            'Medical & Clinical Diagnostics',
            'Legal & Deposition Transcripts',
            'Technical & Cloud Architecture Interviews',
            'Financial Earnings & Market Calls',
          ],
        },
        {
          id: 'tr_portfolio',
          title: 'Link to Typing Benchmark or Transcriber Portfolio',
          type: 'SHORT_TEXT',
          required: false,
          validationRule: {
            type: 'URL',
            message: 'Please provide a valid URL.',
          },
        },
        {
          id: 'tr_sample_upload',
          title: 'Upload Sample Transcription Transcript / Certificate',
          type: 'FILE_UPLOAD',
          required: true,
          acceptedFileTypes: ['PDF', 'DOCUMENT'],
          maxFileSizeMb: 10,
          maxFiles: 1,
          validationRule: {
            type: 'FILE_UPLOAD',
            message: 'Please upload your transcript in PDF or Word format.',
            allowedFileTypes: ['PDF', 'DOCUMENT'],
            maxFileSizeMb: 10,
          },
        },
      ],
    },
  },
  {
    id: 'voiceover-speech-intake',
    name: 'Voice-Over & Speech Data Collection Form',
    badge: 'Acoustic & Voice',
    description: 'Intake form for voice talents, accent contributors, and speech data collection with recording hardware specs.',
    category: 'Audio Collection',
    iconName: 'user-plus',
    content: `Voice-Over & Speech Data Collection Form\nPart 1: Voice Artist Profile\nFull Name\nEmail Address (Validation: Email)\nWhatsApp Number (Validation: Phone)\nNative Accent / Dialect\nGender & Vocal Range: Male (Bass/Baritone/Tenor), Female (Alto/Mezzo/Soprano), Non-Binary\n\nPart 2: Recording Environment & Hardware Specs\nMicrophone Model (e.g., Shure SM7B, Rode NT1-A, Audio-Technica AT2020, Blue Yeti)\nAudio Interface / Preamp (e.g., Focusrite Scarlett, Apollo Twin, Motu)\nAcoustic Treatment: Professional Soundproof Booth, Treated Home Studio, Portable Isolation Shield, Untreated Room\nDAW Software: Reaper, Audacity, Adobe Audition, Pro Tools, Logic Pro\n\nPart 3: Demo Reel & Sample Upload\nLink to Voice Reel / Demo (SoundCloud, Google Drive, YouTube, Actor Website) (Validation: URL)\nUpload Raw Audio Sample (.wav, .mp3, max 25MB)`,
    prebuiltSchema: {
      title: 'Voice-Over & Speech Data Collection Form',
      description: 'Acoustic registration and studio verification form for voice actors, linguistic dataset contributors, and TTS dataset creators.',
      detectedDocumentType: 'Voice-Over Intake Form',
      totalFieldsDetected: 10,
      questions: [
        {
          id: 'vo_sec_1',
          title: 'Section 1: Voice Artist Profile & Demographic Data',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'vo_name',
          title: 'Full Name / Artist Pseudonym',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'vo_email',
          title: 'Email Address',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please enter a valid email address.',
          },
        },
        {
          id: 'vo_phone',
          title: 'Phone / WhatsApp Number',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'PHONE',
            message: 'Please enter a valid phone number.',
          },
        },
        {
          id: 'vo_vocal_profile',
          title: 'Primary Vocal Classification & Pitch Range',
          type: 'RADIO',
          required: true,
          options: [
            'Male — Deep / Baritone / Bass',
            'Male — Neutral / Tenor',
            'Female — Warm / Alto / Low',
            'Female — Clear / Soprano / Bright',
            'Youth / Child Voice Range',
            'Character / Animated Voices',
          ],
        },
        {
          id: 'vo_sec_2',
          title: 'Section 2: Recording Studio & Acoustic Environment',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'vo_mic_model',
          title: 'Microphone & Audio Interface Model',
          description: 'e.g., Shure SM7B + Focusrite Scarlett 2i2, Rode NT1-A, Sennheiser MKH 416',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'vo_acoustic_space',
          title: 'Acoustic Treatment Quality',
          type: 'RADIO',
          required: true,
          options: [
            'Fully Soundproofed Professional WhisperRoom / Vocal Booth',
            'Treated Room with Acoustic Panels & Bass Traps (< -60dB noise floor)',
            'Portable Reflection Filter / Vocal Isolation Shield',
            'Untreated Room (Minimal echo)',
          ],
        },
        {
          id: 'vo_demo_url',
          title: 'Link to Online Voice Reel (SoundCloud / YouTube / Drive)',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'URL',
            message: 'Please enter a valid link to your audio reel.',
          },
        },
        {
          id: 'vo_sample_file',
          title: 'Upload Unprocessed Raw Audio Sample (WAV / MP3)',
          description: 'Record 15-30 seconds of speech in your standard room noise floor.',
          type: 'FILE_UPLOAD',
          required: true,
          acceptedFileTypes: ['AUDIO'],
          maxFileSizeMb: 25,
          maxFiles: 1,
          validationRule: {
            type: 'FILE_UPLOAD',
            message: 'Please upload an audio sample (max 25MB).',
            allowedFileTypes: ['AUDIO'],
            maxFileSizeMb: 25,
          },
        },
      ],
    },
  },
  {
    id: 'video-annotation-screener',
    name: 'Video Annotation & Computer Vision Screener',
    badge: 'Bounding Box & CV',
    description: 'Technical evaluation and intake for video annotators, bounding box tagging, polygon segmentation, and spatial temporal tracking.',
    category: 'Computer Vision',
    iconName: 'file-check',
    content: `Video Annotation & Computer Vision Screener\nSection 1: Annotator Details\nFull Name\nEmail Address (Validation: Email)\nContact Phone (Validation: Phone)\n\nSection 2: Annotation Tooling & Experience\nAnnotation Platforms Utilized: CVAT (Computer Vision Annotation Tool), Labelbox, Roboflow, V7 Darwin, Supervisely, Label Studio\nAnnotation Types Handled: 2D Bounding Boxes (Tight fit), 3D Cuboids (Autonomous driving / LiDAR), Polygon Segmentation, Keypoint / Skeleton Pose Estimation, Video Temporal Object Tracking (Occlusion & ID preservation)\nAverage Daily Throughput: Under 200 boxes/hr, 200 - 400 boxes/hr, 400+ boxes/hr with >98% IoU\n\nSection 3: Quality Assessment & Portfolio\nLink to Annotation Portfolio / CVAT Export / Video Demo (Validation: URL)\nUpload Annotation Guidelines Comprehension Sample (PDF / DOCX, max 10MB)`,
    prebuiltSchema: {
      title: 'Video Annotation & Computer Vision Screener',
      description: 'Assessment and onboarding form for data annotators working on autonomous driving, robotics, and generative video datasets.',
      detectedDocumentType: 'Annotation Application',
      totalFieldsDetected: 9,
      questions: [
        {
          id: 'va_sec_1',
          title: 'Section 1: Annotator Background',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'va_name',
          title: 'Full Name',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'va_email',
          title: 'Email Address',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please enter a valid email address.',
          },
        },
        {
          id: 'va_phone',
          title: 'Phone Number',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'PHONE',
            message: 'Please enter a valid phone number.',
          },
        },
        {
          id: 'va_sec_2',
          title: 'Section 2: Computer Vision Annotation Skills',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'va_platforms',
          title: 'Annotation Platforms Mastered',
          type: 'CHECKBOX',
          required: true,
          options: [
            'CVAT (Computer Vision Annotation Tool)',
            'Labelbox',
            'Roboflow',
            'V7 Darwin',
            'Supervisely',
            'Label Studio',
          ],
        },
        {
          id: 'va_modalities',
          title: 'Annotation Modalities & Spatial Techniques',
          type: 'CHECKBOX',
          required: true,
          options: [
            '2D Bounding Boxes (Tight pixel fit & zero edge padding)',
            'Polygon / Semantic Segmentation (Pixel-accurate contours)',
            '3D Cuboids / Point Cloud Annotation (LiDAR sensors)',
            'Skeleton & Human Pose Keypoints (Joint mapping)',
            'Video Keyframe Tracking (Interpolation & occlusion handling)',
          ],
        },
        {
          id: 'va_iou_rate',
          title: 'Historical Quality Benchmark (Intersection over Union - IoU)',
          type: 'RADIO',
          required: true,
          options: [
            '98%+ IoU Quality (Tier 1 Gold Standard)',
            '95% - 98% IoU Quality',
            '90% - 95% IoU Quality',
            'Trainee / Learning Mode',
          ],
        },
        {
          id: 'va_portfolio_url',
          title: 'Link to Annotation Samples / GitHub / Loom Walkthrough',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'URL',
            message: 'Please enter a valid URL (https://...).',
          },
        },
        {
          id: 'va_sample_doc',
          title: 'Upload Annotation Assessment Certificate or Resume',
          type: 'FILE_UPLOAD',
          required: true,
          acceptedFileTypes: ['PDF', 'DOCUMENT'],
          maxFileSizeMb: 10,
          maxFiles: 1,
          validationRule: {
            type: 'FILE_UPLOAD',
            message: 'Please upload your CV or sample in PDF/DOCX format.',
            allowedFileTypes: ['PDF', 'DOCUMENT'],
            maxFileSizeMb: 10,
          },
        },
      ],
    },
  },
  {
    id: 'ai-training-rlhf-intake',
    name: 'AI Training, RLHF & Prompt Evaluation Assessment',
    badge: 'RLHF & Alignment',
    description: 'Application and capability assessment for AI model trainers, RLHF annotators, red-teamers, and prompt evaluators.',
    category: 'AI Alignment',
    iconName: 'shield-check',
    content: `AI Training, RLHF & Prompt Evaluation Assessment\nSection 1: Evaluator Profile\nFull Name\nEmail Address (Validation: Email)\nPhone Number (Validation: Phone)\nEducational Background / Highest Degree\n\nSection 2: AI Alignment & Reasoning Capabilities\nExperience with Model Evaluation: RLHF (Reinforcement Learning from Human Feedback), SFT (Supervised Fine-Tuning) Data Creation, Red Teaming / Adversarial Prompting, Factuality & Hallucination Spotting, Safety & Policy Moderation\nDomain Expertise: Computer Science / Coding, Mathematics & Formal Logic, Law & Regulatory Compliance, Medical & Life Sciences, Creative Writing & Linguistics\nPreferred Annotation Rate & Weekly Capacity: 10-20 hrs/week, 20-30 hrs/week, 40 hrs/week dedicated\n\nSection 3: Verification\nLink to LinkedIn Profile or GitHub (Validation: URL)\nUpload Writing Sample / Academic Resume (PDF / DOCX, max 10MB)`,
    prebuiltSchema: {
      title: 'AI Training, RLHF & Prompt Evaluation Assessment',
      description: 'Onboarding questionnaire for AI training specialists evaluating model outputs, factual consistency, reasoning chains, and safety constraints.',
      detectedDocumentType: 'AI Training Intake',
      totalFieldsDetected: 9,
      questions: [
        {
          id: 'ai_sec_1',
          title: 'Section 1: Evaluator Profile',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'ai_name',
          title: 'Full Name',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'ai_email',
          title: 'Email Address',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please enter a valid email address.',
          },
        },
        {
          id: 'ai_phone',
          title: 'Mobile Phone Number',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'PHONE',
            message: 'Please enter a valid phone number.',
          },
        },
        {
          id: 'ai_sec_2',
          title: 'Section 2: AI Evaluation & Alignment Skills',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'ai_modalities',
          title: 'AI Evaluation Disciplines Practiced',
          type: 'CHECKBOX',
          required: true,
          options: [
            'RLHF Multi-turn Response Ranking & Elo Scoring',
            'Supervised Fine-Tuning (SFT) Golden Response Authoring',
            'Hallucination & Factual Grounding Verification',
            'Adversarial Red-Teaming & Safety Jailbreak Stress Testing',
            'Chain-of-Thought (CoT) Step-by-Step Logic Auditing',
          ],
        },
        {
          id: 'ai_domains',
          title: 'Primary Domain Expertise',
          type: 'CHECKBOX',
          required: true,
          options: [
            'Software Engineering & Code Generation (Python, JS, C++, Rust)',
            'Mathematics, Statistics & Formal Proofs',
            'Legal, Compliance & Contractual Logic',
            'Medicine, Pharmacology & Biological Sciences',
            'Creative Writing & Multi-Lingual Nuance',
          ],
        },
        {
          id: 'ai_url',
          title: 'LinkedIn Profile / GitHub / Academic Link',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'URL',
            message: 'Please enter a valid URL.',
          },
        },
        {
          id: 'ai_resume',
          title: 'Upload Resume / Relevant Writing Sample',
          type: 'FILE_UPLOAD',
          required: true,
          acceptedFileTypes: ['PDF', 'DOCUMENT'],
          maxFileSizeMb: 10,
          maxFiles: 1,
          validationRule: {
            type: 'FILE_UPLOAD',
            message: 'Please upload your CV or sample in PDF/DOCX format.',
            allowedFileTypes: ['PDF', 'DOCUMENT'],
            maxFileSizeMb: 10,
          },
        },
      ],
    },
  },
  {
    id: 'ai-cloud-recruitment',
    name: 'AI Engineer & Cloud Architect Application',
    badge: 'Recruitment & Tech',
    description: 'Senior recruitment intake for AI Engineers, Cloud Architects, and Test Automation Engineers with portfolio links.',
    category: 'Engineering',
    iconName: 'briefcase',
    content: `AI Engineer & Cloud Architect Application\nSection 1: Candidate Profile\nFull Name\nWork Email (Validation: Email)\nPhone Number (Validation: Phone)\n\nSection 2: Technical Architecture & Frameworks\nTarget Role: Senior AI/ML Engineer, Principal Cloud Solutions Architect, Lead QA Automation Engineer, MLOps / Infrastructure Lead\nPrimary Cloud Platforms: Google Cloud Platform (GCP), Amazon Web Services (AWS), Microsoft Azure, Multi-Cloud Hybrid\nCore AI / ML Tooling: LangChain / LlamaIndex, PyTorch / TensorFlow, Vector Databases (Pinecone, Weaviate, Qdrant), vLLM / Ollama, Gemini / Vertex AI APIs\nYears of Production Cloud / AI Experience: 1 - 3 years, 3 - 5 years, 5 - 8 years, 8+ years\n\nSection 3: Portfolio & Verifications\nGitHub / GitLab Profile URL (Validation: URL)\nSystem Architecture Case Study or Portfolio Link (Validation: URL)\nUpload Technical Resume (PDF / DOCX, max 10MB)`,
    prebuiltSchema: {
      title: 'AI Engineer & Cloud Architect Application',
      description: 'Technical evaluation and recruitment intake for senior AI systems architects, machine learning engineers, and cloud infrastructure developers.',
      detectedDocumentType: 'Technical Recruitment Form',
      totalFieldsDetected: 10,
      questions: [
        {
          id: 'eng_sec_1',
          title: 'Section 1: Candidate Profile',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'eng_name',
          title: 'Full Name',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          id: 'eng_email',
          title: 'Work / Primary Email Address',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'EMAIL',
            message: 'Please enter a valid email address.',
          },
        },
        {
          id: 'eng_phone',
          title: 'Phone Number (with country code)',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'PHONE',
            message: 'Please enter a valid phone number.',
          },
        },
        {
          id: 'eng_sec_2',
          title: 'Section 2: Technical Competencies & Stack',
          type: 'SECTION_HEADER',
          required: false,
        },
        {
          id: 'eng_role',
          title: 'Target Technical Role',
          type: 'RADIO',
          required: true,
          options: [
            'Senior AI / LLM Systems Engineer',
            'Principal Cloud Solutions Architect (GCP / AWS)',
            'MLOps & Distributed Training Infrastructure Lead',
            'Lead QA Automation & Reliability Engineer',
          ],
        },
        {
          id: 'eng_clouds',
          title: 'Cloud Platforms with Production Experience',
          type: 'CHECKBOX',
          required: true,
          options: [
            'Google Cloud Platform (Vertex AI, Cloud Run, GKE, BigQuery)',
            'Amazon Web Services (SageMaker, ECS, EKS, Lambda)',
            'Microsoft Azure (Azure OpenAI, AKS, Cosmos DB)',
            'Kubernetes / Bare-Metal GPU Clusters',
          ],
        },
        {
          id: 'eng_github',
          title: 'GitHub / Portfolio Profile URL',
          type: 'SHORT_TEXT',
          required: true,
          validationRule: {
            type: 'URL',
            message: 'Please provide a valid GitHub or portfolio URL (https://github.com/...).',
          },
        },
        {
          id: 'eng_system_design',
          title: 'Link to Architecture Diagram / Whitepaper / Case Study',
          type: 'SHORT_TEXT',
          required: false,
          validationRule: {
            type: 'URL',
            message: 'Please provide a valid URL.',
          },
        },
        {
          id: 'eng_resume',
          title: 'Upload Comprehensive Technical CV / Resume',
          type: 'FILE_UPLOAD',
          required: true,
          acceptedFileTypes: ['PDF', 'DOCUMENT'],
          maxFileSizeMb: 10,
          maxFiles: 1,
          validationRule: {
            type: 'FILE_UPLOAD',
            message: 'Please upload your CV in PDF or DOCX format (max 10MB).',
            allowedFileTypes: ['PDF', 'DOCUMENT'],
            maxFileSizeMb: 10,
          },
        },
      ],
    },
  },
];

// Backward compatibility alias
export const SAMPLE_TEMPLATES = SMART_TEMPLATES;
export type SampleTemplate = SmartTemplate;

