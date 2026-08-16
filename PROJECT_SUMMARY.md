# FormCraft AI — Project Architecture & Concurrency Model

## Overview
**FormCraft AI** transforms unstructured documents (PDFs, Word DOCX files, scanned worksheets, evaluation rubrics, and project briefs) into structured, production-ready Google Forms with linked Google Sheets response tracking.

---

## Answers to Technical & Architectural Questions

### 1. Concurrency & Multi-User Isolation: "Is it one user at a time, or can multiple users use it concurrently?"
- **Fully Concurrent & Non-Blocking**: The backend is hosted on Express/Node.js in a Cloud Run container. Every incoming document parsing (`/api/parse-document`) or form creation (`/api/forms/create`) request runs as an independent asynchronous task in its own isolated memory scope (`req, res`).
- **Zero Cross-User Interruption**: If User A is uploading a 20-page PDF while User B is creating a Google Form, User A and User B will **never block, overwrite, or interrupt each other**.
- **Per-User Google OAuth Tokens**: When a user creates a form, their personal Google OAuth token is passed in the request header (`Authorization: Bearer <token>`). The Google Form, linked Google Sheet, and Google Drive image uploads are created exclusively inside *that specific user's* Google account.

### 2. UI State & Generation Lock: "When one form is generating, is the button disabled?"
- **Client-Side Action Locking**: Yes. When generation or form creation begins, `isProcessing` / `isSubmitting` state engages.
- **Button Disabled & Progress Active**: The submit/create buttons are automatically disabled, click events are blocked to prevent duplicate submissions, and an animated progress bar indicates current parsing status.
- **Dedicated History / Past Forms**: Form data is preserved locally in IndexedDB / LocalStorage, and can be browsed in a dedicated past generations tab/drawer.

### 3. Caching, Storage & Login Model
| Component | Implementation | Scope / Lifecycle |
|---|---|---|
| **User Authentication** | Firebase Auth + Google Identity Services (OAuth 2.0) | Scoped to individual user session. |
| **Asset Deduplication Cache** | SHA-256 in-memory hash map (`crypto.createHash('sha256')`) | Scoped exclusively to the active creation batch request. No cross-request or cross-user memory leakage. |
| **Local Draft Persistence** | Browser IndexedDB + `localStorage` fallback | Private to the user's specific browser/device. |
| **Cloud Persistence** | Google Firestore (`ai-studio-formcraftaidocto-...`) | Partitioned by user `uid` for secure cross-device access. |

---

## Architectural Highlights

### 1. Document Extraction & Preprocessing
- **PDF Processing (`src/lib/pdfExtractor.ts`)**:
  - Leverages PDF.js to extract digital text and identify embedded raster images / vector operations.
  - Generates optimized canvas snapshots (max dimension 900px, 0.76 quality JPEG) for pages containing diagrams, charts, UI screenshots, and visual exhibits.
  - Assigns unique asset identifiers (`asset_case_1`, `asset_case_2`, etc.) mapped to corresponding case headings.
- **Word DOCX Processing (`server.ts`)**:
  - OpenXML archive decompression extracting images from `word/media/` and converting document bodies via Mammoth.js.

### 2. AI Structured Extraction (`server.ts`)
- Powered by `@google/genai` using `gemini-2.5-flash` with automatic failover to `gemini-3.7-flash`.
- Enforces strict JSON Schema matching Google Forms API v1 structure:
  - Form Title & Description
  - Question Title & Description
  - Input Types: `RADIO`, `CHECKBOX`, `SHORT_TEXT`, `PARAGRAPH`, `DROP_DOWN`, `SCALE`, `DATE`, `TIME`, `SECTION_HEADER`
  - Validation rules (`EMAIL`, `PHONE`, `URL`, `NUMBER`, `CUSTOM`)
  - Image Asset linking (`hasImagePrompt: true`, `assetIds: ["..."]`, `imageDescription`)

### 3. Google Workspace API Synchronization (`server.ts`)
- **Google Forms API v1**: Creates forms and executes batch updates for all questions, options, and section headers.
- **Google Drive API v3**: Uploads question image exhibits, sets public read permissions, and retrieves high-speed direct CDN links (`lh3.googleusercontent.com/d/{fileId}`) compatible with Google Forms `questionItem.image.sourceUri`.
- **Deduplication Engine**: Uses cryptographic SHA-256 hashing to ensure each unique visual exhibit is uploaded and attached exclusively to its respective question without cross-case duplication.
- **Google Sheets API v4**: Automatically provisions and links a Google Spreadsheet for live response aggregation.

### 4. Client-Side Experience (`src/`)
- **Drag & Drop Workspace (`src/components/Dropzone.tsx`)**: Ingests files or raw text with real-time format detection.
- **Schema Editor (`src/components/SchemaEditor.tsx`)**: Full editing capabilities for questions, options, validation rules, and case ordering.
- **Media Diagnostics Panel (`src/components/MediaDiagnosticOverview.tsx`, `MediaVerificationPanel.tsx`)**: Inspects extracted images, verifies case mappings, and allows custom image uploads or removals.
- **Form Preview (`src/components/FormPreviewModal.tsx`)**: Live visual replica of the resulting Google Form.
- **Success & Handoff (`src/components/SuccessView.tsx`)**: Direct links to open the created Google Form, edit questions, access the linked Google Sheet, or copy Google Apps Script code.

---

## Issue Rectification Log

| Issue | Root Cause | Rectification | Status |
|---|---|---|---|
| **Case 1 Image Duplication Across All Cases** | `server.ts` cached Drive uploads using a 100-character prefix of the Base64 URL (`q.imageUrl.slice(0, 100)`). All JPEGs shared the same prefix, causing Case 1's link to be reused for all subsequent cases. | Implemented full SHA-256 cryptographic hashing (`crypto.createHash('sha256').update(q.imageUrl).digest('hex')`) so every distinct visual exhibit receives its own dedicated Drive upload. | **Resolved** |
| **Document Processing Timeout (120s)** | PDF canvas rendering used 1.5 scale and high JPEG quality (~15 MB payload), causing network delays and model stalls. | Optimized canvas dimensions (max 900px, 0.76 quality, ~50 KB per asset), streamlined Gemini payloads, and extended client abort timeout to 180s. | **Resolved** |
| **Multi-Page Asset ID Overwrite** | Non-unique naming on multi-page cases caused subsequent pages to overwrite earlier ones in memory. | Enforced unique asset IDs with sequential page indexing (`${baseAssetId}_p${pageNum}`). | **Resolved** |
| **Image with Text Filtering Drift** | Overly aggressive text filtering previously dropped visual graphics if they contained labels or text. | Updated rules to preserve all visual exhibits, UI screenshots, diagrams, and charts containing text, while skipping only pure text paragraphs. | **Resolved** |

---

## Planned Stress-Testing & Roadmap

### Stress-Test Suite Plan (To be implemented in isolated tab/dropdown for easy removal)
1. **Multi-Asset Multi-Case Document Stress Test**:
   - 15+ sequential distinct cases, each containing unique diagram images and mixed question types.
2. **Dense Multi-Page Text Test**:
   - 25+ page rubric/exam to verify timeout resilience and zero truncation.
3. **High-Concurrency Simulated Ingestion**:
   - Rapid sequential generation to test batch upload rate limiting and queue behavior.
4. **Dedicated Past Works / History Tab**:
   - Persistent view displaying previously generated forms with direct access links.
