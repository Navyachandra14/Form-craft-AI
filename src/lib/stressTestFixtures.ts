import { Asset, FormQuestion, ParsedFormSchema } from '../types';

export type TestCategory =
  | 'DOCX_EXTRACTION'
  | 'PDF_EXTRACTION'
  | 'DIRECT_IMAGES'
  | 'IMAGE_FIDELITY'
  | 'FORM_REQUIREMENTS'
  | 'LINKS_AND_URLS'
  | 'QUESTION_TYPES'
  | 'TABLES_AND_STRUCTURES'
  | 'STORAGE_AND_CACHE'
  | 'CONCURRENCY'
  | 'LARGE_DOCUMENTS'
  | 'FAILURE_INJECTION'
  | 'REAL_WORLD_PACK';

export type TestLevel = 1 | 2 | 3;

export type RequirementClassification =
  | 'SUPPORTED'
  | 'SUPPORTED_WITH_LIMITATION'
  | 'UNSUPPORTED'
  | 'REVIEW_REQUIRED';

export interface SourceRequirement {
  field: string;
  type: string;
  required: boolean;
  restrictions?: string;
  classification: RequirementClassification;
  notes?: string;
}

export interface StressTestFixture {
  id: string;
  name: string;
  category: TestCategory;
  level: TestLevel;
  description: string;
  inputText?: string;
  fileMimeType?: string;
  fileName?: string;
  fileBase64?: string;
  mockAssets?: Asset[];
  expectedRequirements: SourceRequirement[];
  expectedQuestionsCount?: number;
  expectedAssetsCount?: number;
  expectedWarnings?: string[];
  expectedLimitationState?: string;
  isRealWorld?: boolean;
}

// Helper to generate crisp, standard PNG base64 images for visual control testing
function createControlPngDataUrl(
  color: string,
  label: string,
  shape: 'rect' | 'circle' | 'triangle' | 'cross' | 'rounded'
): string {
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 240, 240);
        ctx.fillStyle = color;

        if (shape === 'rect') {
          ctx.fillRect(20, 20, 200, 200);
        } else if (shape === 'circle') {
          ctx.beginPath();
          ctx.arc(120, 120, 95, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(120, 25);
          ctx.lineTo(215, 215);
          ctx.lineTo(25, 215);
          ctx.closePath();
          ctx.fill();
        } else if (shape === 'cross') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 240, 240);
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 22;
          ctx.beginPath();
          ctx.moveTo(40, 40);
          ctx.lineTo(200, 200);
          ctx.moveTo(200, 40);
          ctx.lineTo(40, 200);
          ctx.stroke();
        } else if (shape === 'rounded') {
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(25, 25, 190, 190, 40);
          } else {
            ctx.rect(25, 25, 190, 190);
          }
          ctx.fill();
        }

        ctx.fillStyle = shape === 'cross' ? '#eab308' : '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, 120, shape === 'triangle' ? 165 : 126);
        return canvas.toDataURL('image/png');
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback 1x1 base64 PNGs with distinctive single pixels if offscreen canvas is unavailable
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
}

export interface LabVariationDoc {
  id: string;
  name: string;
  badge: string;
  documentType:
    | 'PDF Multi-Image'
    | 'Scanned QA Form'
    | 'Technical Job Brief'
    | 'Clinical Intake'
    | 'Media & Video Audition'
    | 'Academic Rubric'
    | '20-Case Stress Log';
  description: string;
  fileName: string;
  fileMimeType: string;
  simulatedFormat: 'PDF' | 'DOCX' | 'IMAGE_EXHIBITS' | 'MARKDOWN' | 'COMPLEX_TABLE';
  content: string;
  mockAssets?: Asset[];
  expectedQuestions: number;
  expectedExhibits: number;
  highlightedFeatures: string[];
  sampleFileDownloadText: string;
  driftVerificationCriteria: {
    targetAssociations: Array<{ caseTitle: string; expectedAssetLabel: string; shouldHaveImage: boolean }>;
    description: string;
  };
}

// Generate recognizable control images with verified Base64 PNG formatting
export const CONTROL_IMAGES = {
  get RED_SQUARE() {
    return createControlPngDataUrl('#dc2626', 'RED SQUARE', 'rect');
  },
  get BLUE_CIRCLE() {
    return createControlPngDataUrl('#2563eb', 'BLUE CIRCLE', 'circle');
  },
  get GREEN_TRIANGLE() {
    return createControlPngDataUrl('#16a34a', 'GREEN TRIANGLE', 'triangle');
  },
  get YELLOW_X() {
    return createControlPngDataUrl('#eab308', 'YELLOW X', 'cross');
  },
  get PURPLE_ROUNDED() {
    return createControlPngDataUrl('#9333ea', 'PURPLE ROUNDED', 'rounded');
  },
};

export const STRESS_TEST_FIXTURES: StressTestFixture[] = [
  // ==========================================
  // 1. IMAGE FIDELITY CONTROL FIXTURE (Section 7)
  // ==========================================
  {
    id: 'FIDELITY-001',
    name: 'Strict 5-Case Visual Control Matrix',
    category: 'IMAGE_FIDELITY',
    level: 2,
    description: 'Verifies strict 1-to-1 association: Case 1 -> Red Square, Case 2 -> Blue Circle, Case 3 -> Green Triangle, Case 4 -> Yellow X + Purple Shape, Case 5 -> No Image',
    inputText: `Visual Evaluation Protocol

Case 1: Diagnostic Quadrant A
Refer to the red square calibration diagram above.
What is the primary chromatic hue represented?
(A) Red
(B) Green
(C) Blue

Case 2: Circular Geometric Symmetry
Refer to the blue circle diagram.
Select the radial symmetry dimension:
- Symmetrical
- Asymmetrical

Case 3: Triangular Topology
Review the green triangular layout.
Describe the vertex orientation:
[Paragraph text answer]

Case 4: Multi-Asset Composite Test
Review both the Yellow X exhibit and the Purple Rounded shape exhibit.
Do these two exhibits demonstrate equivalent boundary lines?
( ) Yes
( ) No

Case 5: Pure Text Verification (No Image)
State the general conclusion based on the preceding visual tests.
[Paragraph text answer]`,
    mockAssets: [
      {
        assetId: 'asset_case_1',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 1,
        sourceLocation: 'Case 1 Quadrant',
        dataUrl: CONTROL_IMAGES.RED_SQUARE,
        associatedSection: 'Case 1',
        description: 'Red square calibration exhibit',
      },
      {
        assetId: 'asset_case_2',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 2,
        sourceLocation: 'Case 2 Symmetry',
        dataUrl: CONTROL_IMAGES.BLUE_CIRCLE,
        associatedSection: 'Case 2',
        description: 'Blue circle geometry exhibit',
      },
      {
        assetId: 'asset_case_3',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 3,
        sourceLocation: 'Case 3 Triangle',
        dataUrl: CONTROL_IMAGES.GREEN_TRIANGLE,
        associatedSection: 'Case 3',
        description: 'Green triangle topology exhibit',
      },
      {
        assetId: 'asset_case_4_a',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 4,
        sourceLocation: 'Case 4 Composite A',
        dataUrl: CONTROL_IMAGES.YELLOW_X,
        associatedSection: 'Case 4',
        description: 'Yellow X coordinate exhibit',
      },
      {
        assetId: 'asset_case_4_b',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 4,
        sourceLocation: 'Case 4 Composite B',
        dataUrl: CONTROL_IMAGES.PURPLE_ROUNDED,
        associatedSection: 'Case 4',
        description: 'Purple rounded shape exhibit',
      },
    ],
    expectedRequirements: [
      { field: 'Case 1', type: 'RADIO', required: true, classification: 'SUPPORTED', notes: 'Must link Red Square only' },
      { field: 'Case 2', type: 'RADIO', required: true, classification: 'SUPPORTED', notes: 'Must link Blue Circle only' },
      { field: 'Case 3', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED', notes: 'Must link Green Triangle only' },
      { field: 'Case 4', type: 'RADIO', required: true, classification: 'SUPPORTED', notes: 'Must link Composite exhibits' },
      { field: 'Case 5', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED', notes: 'Must have NO image attached' },
    ],
    expectedQuestionsCount: 5,
    expectedAssetsCount: 5,
  },

  // ==========================================
  // 2. FORM REQUIREMENT FIXTURES (Section 8)
  // ==========================================
  {
    id: 'REQ-RESUME-001',
    name: 'Resume File Upload Requirement',
    category: 'FORM_REQUIREMENTS',
    level: 2,
    description: 'Source specifies: "Upload your resume. Required. PDF or DOCX. Maximum 10 MB."',
    inputText: `Candidate Intake Form

Section 1: Applicant Profile
1. Full Name (Required)
2. Email Address (Required)

Section 2: Professional Resume
3. Upload your resume.
Required.
Allowed file types: PDF, DOCX.
Maximum file size: 10 MB.`,
    expectedRequirements: [
      { field: 'Full Name', type: 'SHORT_TEXT', required: true, classification: 'SUPPORTED' },
      { field: 'Email Address', type: 'SHORT_TEXT', required: true, classification: 'SUPPORTED' },
      {
        field: 'Resume Upload',
        type: 'FILE_UPLOAD',
        required: true,
        restrictions: 'PDF, DOCX, 10MB',
        classification: 'SUPPORTED_WITH_LIMITATION',
        notes: 'Google Forms REST API v1 lacks native File Upload item creation; FormCraft provides Google Apps Script fallback export.',
      },
    ],
    expectedQuestionsCount: 3,
    expectedLimitationState: 'Google Forms REST API v1 cannot programmatically construct FILE_UPLOAD questions via batchUpdate. Configured as validated file submission or Apps Script helper.',
  },

  {
    id: 'REQ-MEDIA-002',
    name: 'Screenshot & Supporting Evidence Upload',
    category: 'FORM_REQUIREMENTS',
    level: 2,
    description: 'Source specifies: "Upload a screenshot of the problem. Required. PNG, JPG or WEBP. Max 5 MB."',
    inputText: `Bug Report & Technical Ticket

1. Issue Summary (Required, Short answer)
2. Detailed Reproduction Steps (Required, Paragraph)
3. Upload a screenshot of the problem.
Required.
Allowed formats: PNG, JPG, WEBP.
Maximum size: 5 MB.
4. Upload up to 3 supporting documents.
Optional.
Allowed formats: PDF.`,
    expectedRequirements: [
      { field: 'Issue Summary', type: 'SHORT_TEXT', required: true, classification: 'SUPPORTED' },
      { field: 'Detailed Steps', type: 'PARAGRAPH', required: true, classification: 'SUPPORTED' },
      { field: 'Screenshot Upload', type: 'FILE_UPLOAD', required: true, restrictions: 'PNG, JPG, WEBP, 5MB', classification: 'SUPPORTED_WITH_LIMITATION' },
      { field: 'Supporting Docs', type: 'FILE_UPLOAD', required: false, restrictions: 'PDF, max 3 files', classification: 'SUPPORTED_WITH_LIMITATION' },
    ],
    expectedQuestionsCount: 4,
  },

  {
    id: 'REQ-VIDEO-003',
    name: 'Video Upload vs. Video Link Discrimination',
    category: 'FORM_REQUIREMENTS',
    level: 2,
    description: 'Verifies non-destructive discrimination: Video upload vs YouTube URL vs Vimeo URL.',
    inputText: `Creative Portfolio Submission

1. Applicant Name (Required)
2. Upload a short video demonstrating your presentation skills. (Required file upload)
3. Provide a YouTube video link showcasing your past work. (Optional URL)
4. Provide a Vimeo video link demonstrating animation reel. (Optional URL)`,
    expectedRequirements: [
      { field: 'Applicant Name', type: 'SHORT_TEXT', required: true, classification: 'SUPPORTED' },
      { field: 'Video Upload', type: 'FILE_UPLOAD', required: true, classification: 'SUPPORTED_WITH_LIMITATION', notes: 'Native upload requires Apps Script' },
      { field: 'YouTube URL', type: 'SHORT_TEXT', required: false, restrictions: 'URL validation', classification: 'SUPPORTED' },
      { field: 'Vimeo URL', type: 'SHORT_TEXT', required: false, restrictions: 'URL validation', classification: 'SUPPORTED' },
    ],
    expectedQuestionsCount: 4,
  },

  {
    id: 'REQ-NUMERIC-004',
    name: 'Numeric Range & Contact Field Validations',
    category: 'FORM_REQUIREMENTS',
    level: 2,
    description: 'Source specifies email, phone number, and years of experience with min 0, max 50.',
    inputText: `Senior Engineering Application

1. Primary Email Address (Required email format)
2. Phone Number with Country Code (Required phone format)
3. Portfolio Website URL (Required URL format)
4. Enter your total years of software engineering experience.
Required.
Must be a number between 0 and 50.`,
    expectedRequirements: [
      { field: 'Email Address', type: 'SHORT_TEXT', required: true, restrictions: 'EMAIL', classification: 'SUPPORTED' },
      { field: 'Phone Number', type: 'SHORT_TEXT', required: true, restrictions: 'PHONE', classification: 'SUPPORTED' },
      { field: 'Portfolio URL', type: 'SHORT_TEXT', required: true, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'Years Experience', type: 'SHORT_TEXT', required: true, restrictions: 'NUMBER (0 - 50)', classification: 'SUPPORTED' },
    ],
    expectedQuestionsCount: 4,
  },

  {
    id: 'REQ-COMBINED-005',
    name: 'Comprehensive 11-Field Recruitment Application',
    category: 'FORM_REQUIREMENTS',
    level: 2,
    description: 'Complete recruitment application with mixed inputs, URLs, uploads, and validations.',
    inputText: `Global Recruitment Application

1. Full Legal Name (Required)
2. Email Address (Required email)
3. Phone Number (Required phone)
4. Position Applied For:
- Senior Product Designer
- Full-Stack Engineer
- AI Research Scientist
5. Upload Resume (Required PDF/DOCX, max 10MB)
6. Portfolio Website URL (Required URL)
7. LinkedIn Profile URL (Required URL)
8. Cover Letter (Optional, Paragraph)
9. Upload Screenshot of Best Design/Code Sample (Optional, PNG/JPG)
10. YouTube/Vimeo Demo Reel Link (Optional URL)
11. Additional Comments or Special Accommodations (Optional, Paragraph)`,
    expectedRequirements: [
      { field: 'Full Legal Name', type: 'SHORT_TEXT', required: true, classification: 'SUPPORTED' },
      { field: 'Email Address', type: 'SHORT_TEXT', required: true, restrictions: 'EMAIL', classification: 'SUPPORTED' },
      { field: 'Phone Number', type: 'SHORT_TEXT', required: true, restrictions: 'PHONE', classification: 'SUPPORTED' },
      { field: 'Position', type: 'RADIO', required: true, classification: 'SUPPORTED' },
      { field: 'Resume Upload', type: 'FILE_UPLOAD', required: true, classification: 'SUPPORTED_WITH_LIMITATION' },
      { field: 'Portfolio URL', type: 'SHORT_TEXT', required: true, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'LinkedIn URL', type: 'SHORT_TEXT', required: true, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'Cover Letter', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED' },
      { field: 'Sample Screenshot', type: 'FILE_UPLOAD', required: false, classification: 'SUPPORTED_WITH_LIMITATION' },
      { field: 'Demo Link', type: 'SHORT_TEXT', required: false, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'Comments', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED' },
    ],
    expectedQuestionsCount: 11,
  },

  // ==========================================
  // 3. LINK & URL FIXTURES (Section 12)
  // ==========================================
  {
    id: 'URL-MATRIX-001',
    name: 'Comprehensive URL & Media Reference Matrix',
    category: 'LINKS_AND_URLS',
    level: 2,
    description: 'Tests URL variations: HTTPS, query params, YouTube, Vimeo, Google Drive/Docs/Sheets.',
    inputText: `Digital Resource Evaluation Form

1. Provide your standard secure website: https://example.com/portal?ref=test&id=101#section2
2. Reference YouTube video analysis: https://www.youtube.com/watch?v=dQw4w9WgXcQ
3. Reference YouTube Shorts clip: https://youtube.com/shorts/abcd1234efg
4. Reference Vimeo presentation: https://vimeo.com/123456789
5. Reference Google Drive shared asset folder: https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoP
6. Reference Google Docs project specification: https://docs.google.com/document/d/1XyZaBcDeFg
7. Reference Google Sheets data ledger: https://docs.google.com/spreadsheets/d/1LedgerData123`,
    expectedRequirements: [
      { field: 'Standard Website', type: 'SHORT_TEXT', required: false, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'YouTube Link', type: 'SHORT_TEXT', required: false, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'YouTube Shorts', type: 'SHORT_TEXT', required: false, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'Vimeo Link', type: 'SHORT_TEXT', required: false, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'Drive Folder Link', type: 'SHORT_TEXT', required: false, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'Google Docs Link', type: 'SHORT_TEXT', required: false, restrictions: 'URL', classification: 'SUPPORTED' },
      { field: 'Google Sheets Link', type: 'SHORT_TEXT', required: false, restrictions: 'URL', classification: 'SUPPORTED' },
    ],
    expectedQuestionsCount: 7,
  },

  // ==========================================
  // 4. QUESTION TYPE MATRIX (Section 15)
  // ==========================================
  {
    id: 'QTYPE-ALL-001',
    name: 'All 9 Google Forms Native Question Types',
    category: 'QUESTION_TYPES',
    level: 2,
    description: 'Verifies translation for RADIO, CHECKBOX, SHORT_TEXT, PARAGRAPH, DROP_DOWN, SCALE, DATE, TIME, and SECTION_HEADER.',
    inputText: `Comprehensive Field Type Testing Suite

=== Section 1: Standard Choice Controls ===
1. Select your preferred work schedule: (Single Choice / Radio)
- Morning Shift (8 AM - 4 PM)
- Evening Shift (4 PM - 12 AM)
- Flexible / Remote

2. Select all technologies you have actively used: (Multiple Checkboxes)
[ ] TypeScript
[ ] React
[ ] Python
[ ] PostgreSQL

3. Choose your primary country of residence: (Dropdown menu)
- United States
- Canada
- United Kingdom
- Australia
- Germany

=== Section 2: Text & Evaluation ===
4. What is your preferred job title? (Short Text, Required)

5. Describe your previous software architecture experience in detail: (Long Paragraph)

6. Rate your proficiency with Google Workspace Cloud APIs: (Linear Scale 1 to 5, 1 = Beginner, 5 = Expert)

=== Section 3: Temporal Controls ===
7. Select your earliest available start date: (Date Field)

8. Select your preferred interview time: (Time Field)`,
    expectedRequirements: [
      { field: 'Section 1 Header', type: 'SECTION_HEADER', required: false, classification: 'SUPPORTED' },
      { field: 'Work Schedule', type: 'RADIO', required: false, classification: 'SUPPORTED' },
      { field: 'Technologies', type: 'CHECKBOX', required: false, classification: 'SUPPORTED' },
      { field: 'Country', type: 'DROP_DOWN', required: false, classification: 'SUPPORTED' },
      { field: 'Section 2 Header', type: 'SECTION_HEADER', required: false, classification: 'SUPPORTED' },
      { field: 'Job Title', type: 'SHORT_TEXT', required: true, classification: 'SUPPORTED' },
      { field: 'Experience Details', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED' },
      { field: 'API Proficiency', type: 'SCALE', required: false, classification: 'SUPPORTED' },
      { field: 'Section 3 Header', type: 'SECTION_HEADER', required: false, classification: 'SUPPORTED' },
      { field: 'Start Date', type: 'DATE', required: false, classification: 'SUPPORTED' },
      { field: 'Interview Time', type: 'TIME', required: false, classification: 'SUPPORTED' },
    ],
    expectedQuestionsCount: 11,
  },

  // ==========================================
  // 5. TABLE AND STRUCTURE EXTRACTION (Section 17)
  // ==========================================
  {
    id: 'TABLE-STRUCT-001',
    name: 'Multi-Column Evaluation Rubric & Table Conversion',
    category: 'TABLES_AND_STRUCTURES',
    level: 2,
    description: 'Tests structured table parsing into individual evaluated criteria items.',
    inputText: `Performance Evaluation Matrix

| Competency Area | Evaluation Criteria | Scoring (1-5) | Comments |
|---|---|---|---|
| Code Quality | Adheres to TypeScript strict typing and modular architecture | 1 - 5 | Detailed observation |
| System Reliability | Handles API errors, network timeouts, and concurrency gracefully | 1 - 5 | Detailed observation |
| UI/UX Craftsmanship | Follows design guidelines with zero layout shift | 1 - 5 | Detailed observation |
| Documentation | Produces clear, actionable engineering specifications | 1 - 5 | Detailed observation |`,
    expectedRequirements: [
      { field: 'Code Quality Score', type: 'SCALE', required: false, classification: 'SUPPORTED' },
      { field: 'Code Quality Comments', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED' },
      { field: 'System Reliability Score', type: 'SCALE', required: false, classification: 'SUPPORTED' },
      { field: 'System Reliability Comments', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED' },
      { field: 'UI/UX Score', type: 'SCALE', required: false, classification: 'SUPPORTED' },
      { field: 'UI/UX Comments', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED' },
      { field: 'Documentation Score', type: 'SCALE', required: false, classification: 'SUPPORTED' },
      { field: 'Documentation Comments', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED' },
    ],
    expectedQuestionsCount: 8,
  },

  // ==========================================
  // 6. LARGE DOCUMENT STRESS TEST (Section 25)
  // ==========================================
  {
    id: 'LARGE-20CASE-001',
    name: '20-Case Multi-Question Examination Suite',
    category: 'LARGE_DOCUMENTS',
    level: 2,
    description: 'Stress test containing 20 distinct sequential cases and 40+ total questions to test token limit and zero truncation.',
    inputText: Array.from({ length: 20 }, (_, i) => {
      const caseNum = i + 1;
      return `Case ${caseNum}: Clinical Diagnostic Scenario ${caseNum}
Question ${caseNum}.1: What is the primary diagnosis indicated for Case ${caseNum}?
(A) Diagnosis Alpha-${caseNum}
(B) Diagnosis Beta-${caseNum}
(C) Diagnosis Gamma-${caseNum}
(D) Diagnosis Delta-${caseNum}

Question ${caseNum}.2: What is the recommended treatment protocol for Case ${caseNum}?
[Paragraph text answer]`;
    }).join('\n\n'),
    expectedRequirements: Array.from({ length: 20 }, (_, i) => ({
      field: `Case ${i + 1}`,
      type: 'RADIO',
      required: true,
      classification: 'SUPPORTED' as RequirementClassification,
    })),
    expectedQuestionsCount: 40,
  },

  // ==========================================
  // 7. FAILURE INJECTION TESTS (Section 26)
  // ==========================================
  {
    id: 'FAIL-MALFORMED-001',
    name: 'Malformed & Blank Document Handling',
    category: 'FAILURE_INJECTION',
    level: 1,
    description: 'Tests parser response when provided with pure whitespace, gibberish, or malformed payloads.',
    inputText: '   \n\n\t\t\n   \n   ',
    expectedRequirements: [],
    expectedQuestionsCount: 0,
    expectedWarnings: ['Document content is empty or contains insufficient text to form questions.'],
  },

  // ==========================================
  // 8. REAL-WORLD TEST PACK (Section 33)
  // ==========================================
  {
    id: 'REAL-ONBOARDING-001',
    name: 'Real-World: Employee Onboarding & Equipment Request',
    category: 'REAL_WORLD_PACK',
    level: 2,
    isRealWorld: true,
    description: 'Realistic corporate employee onboarding intake covering hardware, tax documents, and emergency contacts.',
    inputText: `Acme Corp — New Employee Onboarding & Equipment Setup

Section 1: Personal Details
1. Legal Full Name (Required)
2. Personal Email Address (Required email)
3. Mobile Phone Number (Required phone)
4. Emergency Contact Name & Phone (Required)

Section 2: Work Logistics & Hardware
5. Department / Business Unit:
- Engineering & Product
- Marketing & Growth
- Sales & Customer Success
- People Operations & Finance
6. Laptop Preference:
- Apple MacBook Pro 16" (M-Series)
- Apple MacBook Pro 14" (M-Series)
- Dell XPS 15 (Linux/Windows)
- Lenovo ThinkPad X1 Carbon
7. Additional Equipment Needed:
[ ] 4K External Monitor
[ ] Ergonomic Wireless Mouse & Keyboard
[ ] Noise-Canceling Headset
[ ] Standing Desk Converter

Section 3: Compliance & Document Submission
8. Upload Signed Offer Letter & NDA (Required PDF/DOCX, max 10MB)
9. Upload Government-Issued Photo ID (Required PNG/JPG/PDF, max 5MB)
10. Preferred Start Date (Date picker, Required)`,
    expectedRequirements: [
      { field: 'Legal Full Name', type: 'SHORT_TEXT', required: true, classification: 'SUPPORTED' },
      { field: 'Personal Email', type: 'SHORT_TEXT', required: true, restrictions: 'EMAIL', classification: 'SUPPORTED' },
      { field: 'Mobile Phone', type: 'SHORT_TEXT', required: true, restrictions: 'PHONE', classification: 'SUPPORTED' },
      { field: 'Emergency Contact', type: 'SHORT_TEXT', required: true, classification: 'SUPPORTED' },
      { field: 'Department', type: 'RADIO', required: true, classification: 'SUPPORTED' },
      { field: 'Laptop Preference', type: 'RADIO', required: true, classification: 'SUPPORTED' },
      { field: 'Equipment Needed', type: 'CHECKBOX', required: false, classification: 'SUPPORTED' },
      { field: 'Offer Letter Upload', type: 'FILE_UPLOAD', required: true, classification: 'SUPPORTED_WITH_LIMITATION' },
      { field: 'Photo ID Upload', type: 'FILE_UPLOAD', required: true, classification: 'SUPPORTED_WITH_LIMITATION' },
      { field: 'Start Date', type: 'DATE', required: true, classification: 'SUPPORTED' },
    ],
    expectedQuestionsCount: 10,
  },

  {
    id: 'REAL-SURVEY-002',
    name: 'Real-World: Customer Satisfaction & Product Feedback Survey',
    category: 'REAL_WORLD_PACK',
    level: 2,
    isRealWorld: true,
    description: 'Realistic SaaS CSAT / NPS feedback survey with linear scales, multi-choice, and open feedback.',
    inputText: `FormCraft AI — Q3 Customer Experience Survey

1. How often do you use FormCraft AI?
- Daily
- 2-3 times per week
- Weekly
- Once a month
- First time today

2. How likely are you to recommend FormCraft AI to a colleague? (Scale 1 to 10, 1 = Not at all likely, 10 = Extremely likely)

3. Which document formats do you most frequently convert? (Check all that apply)
[ ] Multi-page PDFs
[ ] Microsoft Word (.docx)
[ ] Scanned exams / worksheets
[ ] Plain text briefs
[ ] Markdown specifications

4. How would you rate the accuracy of extracted visual diagrams? (Scale 1 to 5, 1 = Poor, 5 = Flawless)

5. What feature or improvement would make FormCraft AI significantly more valuable to you? (Paragraph answer)

6. May our product team contact you for a 15-minute feedback interview?
- Yes (please provide email below)
- No thanks

7. Contact Email (Optional if agreed above, email validation)`,
    expectedRequirements: [
      { field: 'Usage Frequency', type: 'RADIO', required: false, classification: 'SUPPORTED' },
      { field: 'NPS Score', type: 'SCALE', required: false, classification: 'SUPPORTED' },
      { field: 'Document Formats', type: 'CHECKBOX', required: false, classification: 'SUPPORTED' },
      { field: 'Diagram Accuracy', type: 'SCALE', required: false, classification: 'SUPPORTED' },
      { field: 'Improvement Feedback', type: 'PARAGRAPH', required: false, classification: 'SUPPORTED' },
      { field: 'Contact Permission', type: 'RADIO', required: false, classification: 'SUPPORTED' },
      { field: 'Contact Email', type: 'SHORT_TEXT', required: false, restrictions: 'EMAIL', classification: 'SUPPORTED' },
    ],
    expectedQuestionsCount: 7,
  },
];

// ============================================================================
// 7 INTERACTIVE LAB VARIATION DOCUMENTS (1-Click Test & Auto-Run Environment)
// ============================================================================
export const LAB_VARIATION_DOCS: LabVariationDoc[] = [
  {
    id: 'LAB-VAR-1-IMAGE-FIDELITY',
    name: 'Variation 1: Multi-Image Visual Diagnostic (Zero-Drift Exhibit Test)',
    badge: '5 Image Exhibits',
    documentType: 'PDF Multi-Image',
    simulatedFormat: 'IMAGE_EXHIBITS',
    fileName: 'visual_case_evaluation_diagnostic.pdf',
    fileMimeType: 'application/pdf',
    expectedQuestions: 5,
    expectedExhibits: 5,
    description:
      '5 distinct visual cases paired with 5 unique geometry exhibits (Red Square, Blue Circle, Green Triangle, Yellow X, Purple Rounded Box) plus 1 pure-text control case to strictly verify zero image drift and 1-to-1 prompt binding.',
    highlightedFeatures: [
      'Strict 1-to-1 Image-to-Case Binding',
      'Zero Cross-Case Exhibit Drift Verification',
      'Multi-Exhibit Composite Case Binding',
      'Pure-Text Negative Control Validation',
    ],
    driftVerificationCriteria: {
      description: 'Case 1 must bind Red Square; Case 2 must bind Blue Circle; Case 3 must bind Green Triangle; Case 4 must bind Yellow X & Purple shape; Case 5 must have NO image.',
      targetAssociations: [
        { caseTitle: 'Case 1', expectedAssetLabel: 'RED SQUARE', shouldHaveImage: true },
        { caseTitle: 'Case 2', expectedAssetLabel: 'BLUE CIRCLE', shouldHaveImage: true },
        { caseTitle: 'Case 3', expectedAssetLabel: 'GREEN TRIANGLE', shouldHaveImage: true },
        { caseTitle: 'Case 4', expectedAssetLabel: 'YELLOW X', shouldHaveImage: true },
        { caseTitle: 'Case 5', expectedAssetLabel: 'NONE', shouldHaveImage: false },
      ],
    },
    mockAssets: [
      {
        assetId: 'asset_case_1',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 1,
        sourceLocation: 'Case 1 Quadrant',
        dataUrl: CONTROL_IMAGES.RED_SQUARE,
        associatedSection: 'Case 1: Red Square Geometric Calibration',
        description: 'Red square calibration exhibit',
      },
      {
        assetId: 'asset_case_2',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 2,
        sourceLocation: 'Case 2 Symmetry',
        dataUrl: CONTROL_IMAGES.BLUE_CIRCLE,
        associatedSection: 'Case 2: Blue Circle Symmetrical Contour',
        description: 'Blue circle geometry exhibit',
      },
      {
        assetId: 'asset_case_3',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 3,
        sourceLocation: 'Case 3 Triangle',
        dataUrl: CONTROL_IMAGES.GREEN_TRIANGLE,
        associatedSection: 'Case 3: Green Triangle Angular Geometry',
        description: 'Green triangle topology exhibit',
      },
      {
        assetId: 'asset_case_4_a',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 4,
        sourceLocation: 'Case 4 Composite A',
        dataUrl: CONTROL_IMAGES.YELLOW_X,
        associatedSection: 'Case 4: Composite Multi-Exhibit Evaluation',
        description: 'Yellow X coordinate exhibit',
      },
      {
        assetId: 'asset_case_4_b',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 4,
        sourceLocation: 'Case 4 Composite B',
        dataUrl: CONTROL_IMAGES.PURPLE_ROUNDED,
        associatedSection: 'Case 4: Composite Multi-Exhibit Evaluation',
        description: 'Purple rounded shape exhibit',
      },
    ],
    content: `Visual Evaluation & Option Sheet — 5 Case Quality Diagnostic

Instructions: For every visual case, observe the attached image exhibit carefully and select the corresponding verification parameters.

Case 1: Red Square Geometric Calibration
Inspect the attached Red Square exhibit.
Does the red boundary line show high optical contrast and proper square proportion?
( ) High optical contrast, proper square proportion
( ) Noticeable color distortion or non-square aspect ratio

Case 2: Blue Circle Symmetrical Contour
Inspect the attached Blue Circle exhibit.
Identify the geometric characteristics of the blue circular boundary:
( ) Continuous curvature with zero tangential degradation
( ) Broken curvature or asymmetric rasterization

Case 3: Green Triangle Angular Geometry
Inspect the attached Green Triangle exhibit.
What is the primary orientation of the vertex?
( ) Apex points upward (North)
( ) Apex points downward (South)
( ) Inverted or lateral orientation

Case 4: Composite Multi-Exhibit Evaluation
Review both the Yellow X exhibit and the Purple Rounded shape exhibit.
Do these two exhibits demonstrate equivalent boundary thickness?
( ) Yes, line weights are uniform
( ) No, noticeable line weight discrepancy

Case 5: Negative Control Pure Text Verification
State the general optical conclusion based on the preceding visual tests. (Note: This case has no attached image exhibit)
[Paragraph text answer]`,
    sampleFileDownloadText: `Visual Evaluation & Option Sheet — 5 Case Quality Diagnostic\n\nCase 1: Red Square Geometric Calibration\nInspect the attached Red Square exhibit.\n( ) High optical contrast, proper square proportion\n( ) Noticeable color distortion or non-square aspect ratio\n\nCase 2: Blue Circle Symmetrical Contour\nInspect the attached Blue Circle exhibit.\n( ) Continuous curvature with zero tangential degradation\n( ) Broken curvature or asymmetric rasterization\n\nCase 3: Green Triangle Angular Geometry\nInspect the attached Green Triangle exhibit.\n( ) Apex points upward (North)\n( ) Apex points downward (South)\n\nCase 4: Composite Multi-Exhibit Evaluation\nReview both the Yellow X exhibit and the Purple Rounded shape exhibit.\n( ) Yes, line weights are uniform\n( ) No, line weight discrepancy\n\nCase 5: Negative Control Pure Text Verification\nState the general optical conclusion based on the preceding visual tests.\n[Paragraph text answer]`,
  },

  {
    id: 'LAB-VAR-2-SCANNED-QA',
    name: 'Variation 2: Scanned Engineering QA & Technical Checklist',
    badge: 'Linear Scales & Rubrics',
    documentType: 'Scanned QA Form',
    simulatedFormat: 'COMPLEX_TABLE',
    fileName: 'engineering_manufacturing_qa_audit.txt',
    fileMimeType: 'text/plain',
    expectedQuestions: 8,
    expectedExhibits: 0,
    description:
      'Comprehensive aerospace & hardware manufacturing quality audit covering 6 inspection stations, 1-5 rating scales, tolerance limits, and mandatory signoffs.',
    highlightedFeatures: [
      'Multi-Station Linear Rating Scales (1 to 5)',
      'Tolerance Pass/Fail Checklists',
      'Lead Inspector Certification & Signoff',
      'Non-Conformance Root Cause Field',
    ],
    driftVerificationCriteria: {
      description: 'All 6 QA stations must be parsed with appropriate scale/choice types; no images should be falsely hallucinated.',
      targetAssociations: [],
    },
    content: `AEROSPACE HARDWARE MANUFACTURING — QUALITY AUDIT & INSPECTION LOG

Section 1: Inspection Header
1. Production Batch / Serial Number (Required short text)
2. Lead Quality Inspector Full Name (Required short text)
3. Audit Date & Shift (Required date)

Section 2: Multi-Station Quality Criteria (Rate 1 to 5, where 1 = Critical Defect, 5 = Flawless Standard)
4. Station 1: Surface Finish & CNC Tooling Tolerance (Scale 1 to 5)
5. Station 2: Anodized Coating Thickness & Color Uniformity (Scale 1 to 5)
6. Station 3: Thread Integrity & Fastener Torque Test (Scale 1 to 5)
7. Station 4: Hermetic Seal & Pressure Leak Test (Scale 1 to 5)

Section 3: Discrepancy & Non-Conformance Log
8. Observed Non-Conformances (Select all that apply):
   [ ] Surface pitting or burrs exceeding 0.05mm
   [ ] Coating micro-scratches or uneven pigment
   [ ] Thread stripping or cross-threading
   [ ] Seal pressure decay exceeding 0.2 PSI/min
   [ ] Zero non-conformances (All stations passed)

Section 4: Final Disposition & Inspector Sign-off
9. Final Batch Disposition:
   ( ) ACCEPTED — Released to Packaging
   ( ) CONDITIONAL PASS — Secondary Rework Required
   ( ) REJECTED — Quarantine & Scrap
10. Inspector Concluding Notes & Corrective Actions (Paragraph text)`,
    sampleFileDownloadText: `AEROSPACE HARDWARE MANUFACTURING — QUALITY AUDIT & INSPECTION LOG\n\n1. Production Batch / Serial Number (Required)\n2. Lead Quality Inspector Full Name (Required)\n3. Audit Date & Shift (Required date)\n4. Station 1: Surface Finish & CNC Tooling Tolerance (Scale 1 to 5)\n5. Station 2: Anodized Coating Thickness & Color Uniformity (Scale 1 to 5)\n6. Station 3: Thread Integrity & Fastener Torque Test (Scale 1 to 5)\n7. Station 4: Hermetic Seal & Pressure Leak Test (Scale 1 to 5)\n8. Observed Non-Conformances (Select all that apply):\n   [ ] Surface pitting or burrs exceeding 0.05mm\n   [ ] Coating micro-scratches\n   [ ] Zero non-conformances\n9. Final Batch Disposition:\n   ( ) ACCEPTED\n   ( ) CONDITIONAL PASS\n   ( ) REJECTED\n10. Inspector Concluding Notes (Paragraph text)`,
  },

  {
    id: 'LAB-VAR-3-TECH-RECRUIT',
    name: 'Variation 3: Technical Job Application & Multi-Type File Requirements',
    badge: 'File Upload & Links',
    documentType: 'Technical Job Brief',
    simulatedFormat: 'DOCX',
    fileName: 'senior_cloud_architect_application.docx',
    fileMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    expectedQuestions: 9,
    expectedExhibits: 0,
    description:
      'High-growth tech role recruitment form with candidate contact info, email/phone validation, resume upload requirements (PDF/DOCX 10MB), GitHub/Figma URLs, and work authorization.',
    highlightedFeatures: [
      'Resume File Upload Specification (PDF/DOCX max 10MB)',
      'GitHub / Portfolio URL Validation Rule',
      'Work Authorization Radio Options',
      'Phone & Email Format Enforcements',
    ],
    driftVerificationCriteria: {
      description: 'File upload requirements must be categorized with supported limitation guidelines; URLs must have URL validation.',
      targetAssociations: [],
    },
    content: `SENIOR CLOUD PLATFORM ARCHITECT — CANDIDATE APPLICATION

Section 1: Candidate Contact & Background
1. Full Legal Name (Required)
2. Primary Email Address (Required email format)
3. Direct Mobile Phone Number (Required phone format)
4. Current City and Country of Residence (Required)

Section 2: Professional Profile & Code Samples
5. GitHub Profile or Technical Portfolio Link (URL format, e.g. https://github.com/username)
6. Primary Architecture Competencies (Select all that apply):
   [ ] Kubernetes / Cloud Run / Container Orchestration
   [ ] Distributed Database Architecture (Spanner / Firestore / CockroachDB)
   [ ] Multi-region High Availability & Disaster Recovery
   [ ] AI Agent Orchestration & LLM Tool Chains
   [ ] Infrastructure as Code (Terraform / Pulumi)

Section 3: Document Uploads & Verification
7. Upload Comprehensive CV / Resume (Required: PDF or DOCX format, max 10MB)
8. Upload Architectural System Design Artifact (Optional: PNG, JPG or PDF, max 15MB)

Section 4: Work Authorization & Availability
9. Are you legally authorized to work in the target hiring location without sponsorship?
   ( ) Yes, fully authorized
   ( ) No, will require visa sponsorship
10. Earliest Available Notice Period & Start Date (Date picker)`,
    sampleFileDownloadText: `SENIOR CLOUD PLATFORM ARCHITECT — CANDIDATE APPLICATION\n\n1. Full Legal Name (Required)\n2. Primary Email Address (Required)\n3. Direct Mobile Phone Number (Required)\n4. Current City and Country of Residence (Required)\n5. GitHub Profile or Portfolio Link (Required URL)\n6. Primary Competencies (Select all):\n   [ ] Kubernetes & Cloud Run\n   [ ] Distributed Databases\n   [ ] AI Agent Orchestration\n7. Upload Comprehensive CV / Resume (Required: PDF or DOCX format, max 10MB)\n8. Upload Architectural Design Artifact (Optional: PNG or PDF)\n9. Work Authorization:\n   ( ) Yes, fully authorized\n   ( ) No, require sponsorship\n10. Earliest Start Date (Date picker)`,
  },

  {
    id: 'LAB-VAR-4-CLINICAL-INTAKE',
    name: 'Variation 4: Patient Clinical Intake & Insurance Card Photo Upload',
    badge: 'Healthcare & Photo ID',
    documentType: 'Clinical Intake',
    simulatedFormat: 'PDF',
    fileName: 'multimodal_patient_clinical_intake.pdf',
    fileMimeType: 'application/pdf',
    expectedQuestions: 11,
    expectedExhibits: 1,
    description:
      'Confidential clinical intake form with patient demographics, medical history checkboxes, emergency contact, allergy warnings, and photo ID / Insurance card upload.',
    highlightedFeatures: [
      'Comprehensive Medical History Checkboxes',
      'Allergy Drug Reaction Highlighting',
      'Insurance Card Front/Back Photo Upload Requirement',
      'HIPAA Consent & Declaration Agreement',
    ],
    driftVerificationCriteria: {
      description: 'Demographics, medical history checkboxes, and insurance photo attachment must be structured cleanly.',
      targetAssociations: [],
    },
    mockAssets: [
      {
        assetId: 'asset_medical_badge',
        type: 'IMAGE',
        mimeType: 'image/png',
        source: 'png-data',
        page: 1,
        sourceLocation: 'Clinic Header',
        dataUrl: CONTROL_IMAGES.BLUE_CIRCLE,
        associatedSection: 'Clinic Identification',
        description: 'Certified clinic emblem',
      },
    ],
    content: `METROPOLITAN WELLNESS CLINIC — PATIENT INTAKE & CONSENT

Section 1: Patient Demographics
1. Full Legal Patient Name (Required)
2. Date of Birth (Required date)
3. Contact Email Address (Required email)
4. Primary Mobile Phone (Required phone)
5. Emergency Contact Name & Relationship (Required)
6. Emergency Contact Phone (Required)

Section 2: Clinical Background & Health History
7. Primary Reason for Clinical Visit (Paragraph text, Required)
8. Known Drug & Environmental Allergies (Select all that apply):
   [ ] Penicillin / Amoxicillin
   [ ] Sulfa Drugs / Sulfonamides
   [ ] Latex
   [ ] NSAIDs (Aspirin, Ibuprofen)
   [ ] Peanut / Tree Nut
   [ ] No Known Drug Allergies (NKDA)
9. Personal Medical History (Select all that apply):
   [ ] Hypertension / High Blood Pressure
   [ ] Diabetes (Type 1 or Type 2)
   [ ] Asthma / COPD
   [ ] Cardiovascular Disease
   [ ] Thyroid Disorder
   [ ] None of the above

Section 3: Insurance & Photo Verification
10. Upload Primary Insurance Card — Front & Back Photos (Required JPG/PNG/PDF, max 10MB)
11. Primary Health Insurance Provider & Member Policy ID (Short text)
12. HIPAA Consent & Truthful Disclosure Confirmation:
    [ ] I certify that the health information submitted is accurate and consent to clinical assessment.`,
    sampleFileDownloadText: `METROPOLITAN WELLNESS CLINIC — PATIENT INTAKE\n\n1. Full Legal Patient Name (Required)\n2. Date of Birth (Required date)\n3. Contact Email Address (Required email)\n4. Primary Mobile Phone (Required phone)\n5. Emergency Contact Name & Relationship (Required)\n6. Emergency Contact Phone (Required)\n7. Primary Reason for Visit (Paragraph)\n8. Known Drug Allergies:\n   [ ] Penicillin\n   [ ] Latex\n   [ ] No Known Allergies\n9. Medical History:\n   [ ] Hypertension\n   [ ] Diabetes\n   [ ] None\n10. Upload Insurance Card (Required JPG/PNG)\n11. Insurance Provider & Policy ID\n12. HIPAA Consent Checkbox (Required)`,
  },

  {
    id: 'LAB-VAR-5-VIDEO-AUDITION',
    name: 'Variation 5: Media Audition & Video Portfolio Submission',
    badge: 'YouTube & Vimeo',
    documentType: 'Media & Video Audition',
    simulatedFormat: 'MARKDOWN',
    fileName: 'film_festival_media_audition_intake.md',
    fileMimeType: 'text/markdown',
    expectedQuestions: 8,
    expectedExhibits: 0,
    description:
      'Performing arts and video production submission form discriminating between YouTube monologue links, Vimeo demo reels, Google Drive media folders, and raw video file uploads.',
    highlightedFeatures: [
      'YouTube Video Monologue Link Validation',
      'Vimeo Password-Protected Reel URL Support',
      'Google Drive Shared Folder Link Validation',
      'Performer Talent & Union Status Radio Options',
    ],
    driftVerificationCriteria: {
      description: 'Discriminates YouTube vs Vimeo vs Drive links without confusing them with direct file uploads.',
      targetAssociations: [],
    },
    content: `# Horizon Film & Media Showcase — Performer Casting & Portfolio Submission

## Section 1: Performer Profile
1. Full Stage / Legal Name (Required)
2. Representation Agency / Talent Manager (Short text)
3. Primary Email Address (Required email)
4. Contact Phone Number (Required phone)
5. SAG-AFTRA / Equity Union Membership:
   ( ) SAG-AFTRA Active Member
   ( ) SAG-Eligible
   ( ) Equity Member
   ( ) Non-Union

## Section 2: Video Audition & Reel Links
6. YouTube 2-Minute Monologue Video Link (Required YouTube URL, e.g. https://www.youtube.com/watch?v=sample)
7. Vimeo Professional Demo Reel Link (Required Vimeo URL, e.g. https://vimeo.com/123456789)
8. Google Drive / Dropbox Media Folder Link (Optional URL for high-res headshots and past clips)

## Section 3: High-Res Headshot & Resume
9. Upload 8x10 High-Resolution Color Headshot (Required JPEG/PNG, max 20MB)
10. Upload Acting Resume / Theatre Credits (Required PDF, max 10MB)`,
    sampleFileDownloadText: `# Horizon Film Showcase — Performer Casting\n\n1. Full Stage / Legal Name (Required)\n2. Primary Email Address (Required)\n3. Contact Phone Number (Required)\n4. Union Membership:\n   ( ) SAG-AFTRA\n   ( ) Non-Union\n5. YouTube Monologue Link (Required URL)\n6. Vimeo Demo Reel Link (Required URL)\n7. Google Drive Media Link (Optional URL)\n8. Upload 8x10 Headshot (Required JPEG/PNG)\n9. Upload Acting Resume (Required PDF)`,
  },

  {
    id: 'LAB-VAR-6-ACADEMIC-RUBRIC',
    name: 'Variation 6: Academic Research Peer Review & Grading Rubric',
    badge: 'Multi-Criterion Rubric',
    documentType: 'Academic Rubric',
    simulatedFormat: 'COMPLEX_TABLE',
    fileName: 'academic_research_peer_review_rubric.txt',
    fileMimeType: 'text/plain',
    expectedQuestions: 8,
    expectedExhibits: 0,
    description:
      'Peer-reviewed university research paper evaluation rubric converting a 4-criterion grading matrix into structured linear rating scales and evaluative paragraph commentary.',
    highlightedFeatures: [
      'Multi-Criterion Evaluation (Thesis, Literature, Methodology, Analysis)',
      'Standardized 1-to-5 Linear Score Mapping',
      'Constructive Manuscript Revision Paragraphs',
      'Final Acceptance Recommendation Choice',
    ],
    driftVerificationCriteria: {
      description: 'Converts multi-column rubric criteria into paired rating scale and feedback questions.',
      targetAssociations: [],
    },
    content: `UNIVERSITY RESEARCH COUNCIL — PEER REVIEW EVALUATION RUBRIC

Paper ID & Title: AI-Driven Document Synthesis in Distributed Architectures

Section 1: Reviewer Identification
1. Reviewer Reference ID (Required short text)
2. Primary Research Domain / Specialty (Required short text)

Section 2: Core Rubric Scoring (Score 1 to 5: 1 = Inadequate, 3 = Satisfactory, 5 = Exceptional)
3. Criterion 1: Thesis Originality & Significance of Research Contribution (Scale 1 to 5)
4. Criterion 2: Literature Review & Contextual Grounding (Scale 1 to 5)
5. Criterion 3: Experimental Methodology & Statistical Rigor (Scale 1 to 5)
6. Criterion 4: Clarity of Analysis & Discussion (Scale 1 to 5)

Section 3: Qualitative Feedback & Recommendations
7. Specific Suggestions for Manuscript Revision & Methodological Improvement (Paragraph text, Required)
8. Final Editorial Recommendation:
   ( ) ACCEPT WITHOUT REVISIONS
   ( ) ACCEPT WITH MINOR REVISIONS
   ( ) MAJOR REVISIONS REQUIRED (Re-review necessary)
   ( ) REJECT`,
    sampleFileDownloadText: `UNIVERSITY RESEARCH COUNCIL — PEER REVIEW RUBRIC\n\n1. Reviewer Reference ID (Required)\n2. Primary Research Domain (Required)\n3. Criterion 1: Thesis Originality (Scale 1 to 5)\n4. Criterion 2: Literature Review (Scale 1 to 5)\n5. Criterion 3: Experimental Methodology (Scale 1 to 5)\n6. Criterion 4: Clarity of Analysis (Scale 1 to 5)\n7. Suggestions for Revision (Paragraph text)\n8. Final Editorial Recommendation:\n   ( ) ACCEPT WITHOUT REVISIONS\n   ( ) ACCEPT WITH MINOR REVISIONS\n   ( ) MAJOR REVISIONS\n   ( ) REJECT`,
  },

  {
    id: 'LAB-VAR-7-LARGE-INSPECT',
    name: 'Variation 7: 20-Case Complex Diagnostic Inspection Log',
    badge: '40 Questions Stress Test',
    documentType: '20-Case Stress Log',
    simulatedFormat: 'MARKDOWN',
    fileName: 'full_scale_20case_defect_inspection_log.md',
    fileMimeType: 'text/markdown',
    expectedQuestions: 40,
    expectedExhibits: 0,
    description:
      'Massive 20-case sequential anomaly examination suite testing extreme token capacity, zero truncation, complete schema synthesis, and zero omission across 40+ total questions.',
    highlightedFeatures: [
      '20 Sequential Real-World Defect Cases',
      '40+ Total Questions Extracted in One Pass',
      'Zero Token Truncation Verification',
      'Complete Schema Consistency across Large Payloads',
    ],
    driftVerificationCriteria: {
      description: 'All 20 cases must be extracted without skipping, stopping early, or truncating.',
      targetAssociations: [],
    },
    content: Array.from({ length: 20 }, (_, i) => {
      const caseNum = i + 1;
      return `### Case ${caseNum}: Industrial Anomaly Scenario ${caseNum}
1. Question ${caseNum}.1: What is the primary defect classification for Case ${caseNum}?
   ( ) Class A: Critical Thermal Variance
   ( ) Class B: Mechanical Alignment Drift
   ( ) Class C: Material Micro-Fracture
   ( ) Class D: Normal Operating Baseline

2. Question ${caseNum}.2: Corrective Action Protocol for Case ${caseNum}:
   [Paragraph text response for Case ${caseNum}]`;
    }).join('\n\n'),
    sampleFileDownloadText: Array.from({ length: 20 }, (_, i) => {
      const caseNum = i + 1;
      return `Case ${caseNum}: Industrial Anomaly Scenario ${caseNum}\n1. Classification:\n   ( ) Class A\n   ( ) Class B\n   ( ) Class C\n   ( ) Class D\n2. Corrective Action:\n   [Paragraph text]`;
    }).join('\n\n'),
  },
];

