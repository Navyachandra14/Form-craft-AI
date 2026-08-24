# PROJECT ARCHAEOLOGY & TECHNICAL AUDIT RECORD
**System:** FormCraft AI (Document & Prompt to Google Forms, Sheets & Candidate Workflows)  
**Role:** Project Archaeologist & Technical Documentation Analyst  
**Audit Scope:** Complete codebase, conversation transcripts, API routes, client UI, test logs, error handling, failure points, and deployment configurations.

---

## 1. PROJECT NAME
**FormCraft AI** (also referenced as `Doc-to-Google-Form` / `FormCraft AI Doc-to-Forms & Connected Sheets Engine`)

---

## 2. PROJECT TYPE
**SaaS / Web Application & AI Workflow Automation Tool** (Full-Stack Document Intelligence, Multimodal LLM Extraction & Google Workspace Automation Engine)

---

## 3. PROJECT PURPOSE
**Original Problem**: Creating assessments, rubrics, hiring screening quizzes, event registrations, and surveys in Google Forms manually is tedious, repetitive, and error-prone. Converting existing documents (such as 10–30 page complex test sheets with diagrams, STEM math formulas, table rubrics, or Word documents) requires manually copying text, reconstructing options, extracting images, re-uploading figures to Google Drive, setting up validation regex, creating linked Google Spreadsheets, and writing custom Google Apps Scripts for automated candidate scoring.

**Goal**: Build a local-first web application that allows users to either drag-and-drop any document (PDF, Word `.docx`, CSV, Excel, JSON, Markdown, text, image/camera scans) or describe a form outline in plain text, and automatically generates:
1. An editable, validated JSON form schema with LaTeX math and associated visual diagram exhibits.
2. A live Google Form populated via Google Forms API v1.
3. Automatically uploaded image assets in Google Drive with public read permissions for direct rendering in form questions.
4. A linked Google Sheet with response columns and 1-click live synchronization.
5. An automated 3-tier scoring logic and Google Apps Script (`.gs`) trigger for candidate pass/review/reject workflows.

---

## 4. ORIGINAL IDEA
The user initiated the system requesting an end-to-end converter that takes raw documents and turns them into live Google Forms with image preservation and response tracking.

*Exact phrases from user instructions throughout history:*
- *"Consider the file uploaded for making improvements and particularly this error popped up by vercel link Production UI reaches processing, but server returns HTTP 500 during processing. Treat this as a server/runtime/API failure and trace the exact endpoint and exception before changing configuration."*
- *"Can you make the template like a drop down button so there will not be any overwhelm"*
- *"I think minimal interface is good for user experience clean one tab interface where they can drag and drop any kind of file even like CSV excel json md or whatever and drag and drop one ans other one is describe your idea type or paste your idea in the same tab and template in below as highlight tab under this do you understand and make the adjustments"*
- *"Restructure the main interface to ensure a truly single-tab experience by moving all complex configuration options into the dropdown menus, keeping only the core dropzone and input areas visible."*
- *"Add a small connectivity status indicator to the footer that detects and alerts the user if their network connection is lost during form generation."*

---

## 5. START DATE
**Earliest Established Date:** August 15, 2026 *(derived from initial git commit timestamps, environment metadata, and Firestore configuration timestamp `2026-08-15`)*.

---

## 6. DEVELOPMENT PERIOD
**Active Development Window:** August 15, 2026 – August 23, 2026 (Rapid iterative cycles covering multimodal ingestion, Google Workspace API integration, image deduplication fix, Vercel serverless debugging, and single-tab UX restructuring).

---

## 7. CURRENT STATUS
**Status:** **WORKING PROTOTYPE / TESTED / DEPLOYED (Vercel & Cloud Run Ready)**

*Justification:*
- Full-stack codebase compiles cleanly (`tsc --noEmit` and `vite build` pass with 0 errors).
- Local-first in-browser fallback parsing (`clientGeminiParser.ts`) and server-side cascade (`server.ts`) are fully implemented and verified.
- Vercel serverless configuration (`vercel.json`, `api/index.ts`) verified with 60-second timeouts and granular error status mapping (`401`, `413`, `429`, `504`).
- Interactive Schema Editor, Google OAuth 2.0 token acquisition, Google Forms API creation, Drive image hosting, and Google Sheets sync are functional.

---

## 8. WHAT WAS ACTUALLY BUILT

### IMPLEMENTED
- **Universal Multi-Format Ingestion Engine**:
  - PDF parser (`src/lib/pdfExtractor.ts`) using PDF.js to render raster canvases (DPI scaled, max 900px, 0.76 JPEG) and extract visual diagrams/figures.
  - Word `.docx` parser (`src/lib/parser.ts` & `server.ts`) using Mammoth.js and raw OpenXML media extraction (`word/media/*`).
  - CSV, Excel (`.xlsx`), JSON, Markdown, and plain text direct file reading and structured schema conversion.
  - Device camera photo capture input.
- **Multimodal AI Schema Extraction Pipeline**:
  - Multi-tier Gemini model cascade (`gemini-2.5-flash` $\rightarrow$ `gemini-3.1-flash-lite` $\rightarrow$ `gemini-3.7-flash`).
  - Strict JSON schema mapping to Google Forms structure: Multiple Choice (`RADIO`), Multi-Select (`CHECKBOX`), Dropdown (`DROP_DOWN`), Short Answer (`SHORT_TEXT`), Paragraph (`PARAGRAPH`), Linear Rating Scale (`SCALE`), Date, Time, Section Headers.
  - LaTeX Math formula extraction and inline rendering via KaTeX (`$E_k = \frac{1}{2}mv^2$`).
  - Automated Question Recovery safeguard if initial document scan yields zero explicit questions.
- **Client-Side Direct Gemini Parser (`src/lib/clientGeminiParser.ts`)**:
  - Direct browser fallback to Gemini API using user-provided API key if backend/serverless times out or fails (HTTP 500/504/404).
- **Google Workspace API Orchestration**:
  - Google Identity Services (OAuth 2.0) with scopes: `forms.body`, `forms.responses.readonly`, `spreadsheets`, `drive.file`.
  - Google Forms batch creation endpoint (`/api/forms/create`).
  - Google Drive multipart image upload with public read permission retrieval (`lh3.googleusercontent.com/d/{id}`) for form exhibits.
  - SHA-256 cryptographic image hashing to eliminate duplicate Drive uploads.
  - Google Sheets provisioning and response synchronization (`/api/forms/sync-sheet`, `/api/sheets/fetch`).
- **Interactive Schema Review & Editing Suite**:
  - Visual drag-and-drop / reordering question editor (`src/components/SchemaEditor.tsx`).
  - Option list manager, correct answer selector, point values, and validation regex rules.
  - Live form preview modal (`src/components/FormPreviewModal.tsx`).
  - Media Verification & Case Association panel (`src/components/MediaVerificationPanel.tsx`).
- **Minimalist Single-Tab UI Layout**:
  - Dual side-by-side core cards (Drag & Drop File Box on left, Describe Idea Textarea on right).
  - Collapsible **Ideas** dropdown button with quick starters.
  - Collapsible **Ready-Made Smart Templates** dropdown accordion with category filters.
  - Collapsible **Extraction & Formatting Options** dropdown (Respondent Profile, Clean Checkbox Notes, Smart Polish).
  - Network connectivity indicator in footer with active generation loss alert (`src/components/NetworkStatus.tsx`).
- **Persistence & History**:
  - Dual-layer browser persistence (IndexedDB + LocalStorage fallback) for unsaved draft recovery.
  - History drawer/modal (`src/components/HistoryModal.tsx`) for browsing previously generated forms and schemas.
- **Developer & Diagnostic Tools**:
  - Developer Stress Testing Lab (`src/components/StressTestPanel.tsx`, triggered via `Ctrl+Shift+D` or `?dev=true`).
  - Vercel serverless gateway (`api/index.ts`, `vercel.json`).

### TESTED
- PDF extraction with complex visual exhibits and diagrams.
- Word `.docx` upload with embedded images and section rubrics.
- LaTeX physics/math formulas rendered via KaTeX.
- Direct prompt generation from text outlines.
- SHA-256 asset deduplication across multi-case assessments.
- Serverless error handling (`401 Missing Key`, `413 Payload Too Large`, `429 Rate Limit`, `504 Timeout`).
- Offline/online network event transitions in UI.

### PARTIALLY IMPLEMENTED
- Automated Google Apps Script deployment: The `.gs` code is generated and ready to copy/paste, but automatic deployment via Google Apps Script API requires separate Google Workspace domain admin execution.
- Real-time multi-collaborator simultaneous form editing (currently single-session / local-first).

### PLANNED (Roadmap Items in Documentation)
- Direct Google Classroom quiz assignment creation.
- Webhook endpoints for third-party ATS (Applicant Tracking Systems) integration.

### NOT CONFIRMED
- End-to-end load testing under >100 simultaneous concurrent user uploads on a single Vercel serverless function instance.

---

## 9. TECHNOLOGY STACK

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion (`motion/react`), Lucide React icons, KaTeX (`katex`, `@types/katex`).
- **Backend / API**: Node.js 20, Express 4.21, `tsx`, `esbuild` (bundling `dist/server.cjs`).
- **Document Processing**: `pdfjs-dist` (PDF rendering to canvas/images), `mammoth` (Word `.docx` HTML/text parsing), `adm-zip` (OpenXML archive media extraction).
- **AI & LLM**: `@google/genai` (Google Gen AI SDK), `gemini-2.5-flash` (primary), `gemini-3.1-flash-lite`, `gemini-3.7-flash`.
- **APIs & Cloud Services**: Google Forms API v1, Google Drive API v3, Google Sheets API v4, Google Identity Services (OAuth 2.0).
- **Database & Persistence**: Google Cloud Firestore (`ai-studio-formcraftaidocto-...`), Firebase Auth, Browser IndexedDB, `localStorage`.
- **Infrastructure & Deployment**: Vercel Serverless Functions (`vercel.json`, `@vercel/node`), Cloud Run container ingress, Vite middleware proxy.
- **Testing & Diagnostics**: Stress Testing Lab (`StressTestPanel.tsx`), `tsc --noEmit` linting, synthetic document test payloads.

---

## 10. ARCHITECTURE

```text
[ USER INPUT ]
   │
   ├── Drag & Drop File (PDF, DOCX, CSV, XLSX, JSON, MD, Scan)
   └── Plain Text Prompt / Outline / Idea Description
   │
   ▼
[ CLIENT-SIDE WORKSPACE (React 19 / Vite SPA) ]
   ├── Local Validation & Canvas OCR / Media Extraction (PDF.js / Mammoth)
   ├── Network Connectivity Monitor (NetworkStatus.tsx)
   └── IndexedDB / LocalStorage Draft Auto-Save
   │
   ▼ (HTTP POST /api/parse-document with Base64 Payload + User Google Bearer Token)
[ BACKEND API LAYER (Express / Vercel Serverless / Node.js) ]
   ├── Payload Sizing & Header Preflight Handling
   ├── Media Decoupling & SHA-256 Asset Deduplication Cache
   └── Model Cascade Handler (Gemini 2.5 Flash -> 3.1 Flash Lite -> 3.7 Flash)
   │
   ▼ (Failover / Timeout Path: Direct Client Gemini Parser in Browser)
[ AI STRUCTURED EXTRACTION ENGINE ]
   ├── Strict JSON Schema Enforcement (Question Types, Options, Rubric Points, Validations)
   ├── LaTeX Formula Extraction ($...$)
   └── Question Recovery Pass (Synthesizes questions from headings if count == 0)
   │
   ▼ (Returns ParsedFormSchema)
[ INTERACTIVE SCHEMA EDITOR ]
   ├── Question / Option Drag-and-Drop Editing
   ├── Media Verification Panel (Inspect & Reassign Diagram Assets)
   └── Live Form Preview Modal
   │
   ▼ (Click "Create Google Form & Link Sheet")
[ GOOGLE WORKSPACE API ORCHESTRATION ]
   ├── 1. Google Drive API v3: Multipart Uploads diagram assets -> retrieves public direct CDN URLs
   ├── 2. Google Forms API v1: Creates Form -> Batch updates questions, options, images, & scale items
   ├── 3. Google Sheets API v4: Creates linked Spreadsheet with frozen headers for response logging
   └── 4. Workflow Generator: Generates 3-tier pass/reject Google Apps Script (.gs)
   │
   ▼
[ SUCCESS VIEW & RESPONSE DASHBOARD ]
   └── Live links to Form View, Form Editor, Google Sheet, and Response Sync
```

---

## 11. MY ROLE (User / Developer)
- **Product Architecture & Vision**: Defined the requirement for a local-first, single-tab system that handles documents of any format (PDF, Word, CSV, Excel, JSON, Markdown, Scans) and connects them directly to Google Forms and Sheets.
- **Engineering Requirements**:
  - Enforced strict single-tab UX rules to prevent interface bloat and cognitive overload.
  - Mandated dropdown menus for templates, extraction settings, and idea prompts.
  - Specified image fidelity preservation and formula detection.
- **Bug Discovery & Root Cause Direction**:
  - Pinpointed the Vercel production HTTP 500 error during document processing and instructed the AI to trace the exact endpoint (`/api/parse-document`), identify missing environment variables, and map granular exceptions before touching configs.
  - Identified image duplication issues across multi-case assessments.
  - Directed the addition of the footer network connectivity indicator to handle lost connections during processing.
- **Deployment & Verification**:
  - Configured and linked the GitHub repository to Vercel.
  - Managed environment variables (`GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`).
  - Tested production deployments on live URLs.

---

## 12. AI'S ROLE
- **Code Implementation**: Generated full TypeScript source code across frontend components (`Dropzone.tsx`, `SchemaEditor.tsx`, `NetworkStatus.tsx`, etc.) and backend routes (`server.ts`, `api/index.ts`).
- **Document Intelligence Integration**: Built the PDF canvas rasterization pipeline with PDF.js and Mammoth `.docx` media unzipping.
- **Error Remediation**: Replaced generic HTTP 500 server crashes with structured HTTP status codes (`401`, `413`, `429`, `504`) and built the client-side direct fallback parser (`clientGeminiParser.ts`).
- **Documentation**: Generated `DEPLOYMENT.md`, `FORM_CRAFT_AI_SYSTEM_IMPLEMENTATION.md`, and technical architectural summaries.

---

## 13. IMPORTANT INSTRUCTIONS I GAVE
1. *"I think minimal interface is good for user experience clean one tab interface where they can drag and drop any kind of file even like CSV excel json md or whatever and drag and drop one ans other one is describe your idea type or paste your idea in the same tab and template in below as highlight tab"* $\rightarrow$ Restructured layout from multi-step wizard to dual core cards.
2. *"Can you make the template like a drop down button so there will not be any overwhelm"* $\rightarrow$ Collapsed sample templates into an accordion dropdown.
3. *"Production UI reaches processing, but server returns HTTP 500 during processing. Treat this as a server/runtime/API failure and trace the exact endpoint and exception before changing configuration."* $\rightarrow$ Traced `/api/parse-document`, fixed missing key handling, mapped granular HTTP status codes, and built client-side fallback.
4. *"Restructure the main interface to ensure a truly single-tab experience by moving all complex configuration options into the dropdown menus, keeping only the core dropzone and input areas visible."* $\rightarrow$ Tucked Idea Starters, Smart Templates, and Extraction Settings into clean dropdowns.
5. *"Add a small connectivity status indicator to the footer that detects and alerts the user if their network connection is lost during form generation."* $\rightarrow$ Created `NetworkStatus.tsx` with live online/offline detection and floating interruption alerts.

---

## 14. AI ASSUMPTIONS / HALLUCINATIONS

### Case 1: Drive Upload Image Cache Key Assumption
- **WHAT I EXPECTED**: Every question in a multi-case exam to receive its unique corresponding diagram image from the document.
- **WHAT AI DID**: AI originally implemented a naive cache key using the first 100 characters of the Base64 image string (`q.imageUrl.slice(0, 100)`).
- **WHY IT WAS WRONG**: All Base64 JPEG data URLs share the exact same `data:image/jpeg;base64,/9j/4AAQSkZJRg...` header prefix. Consequently, the cache thought all images were duplicates of Case 1 and assigned Case 1's diagram to every single question in the entire test.
- **HOW I DISCOVERED IT**: Verified output on multi-case sample documents (e.g. Benjamin ADLoc assessment) where every question displayed the Case 1 diagram.
- **WHAT I CHANGED**: Replaced prefix slice with full SHA-256 cryptographic hashing (`crypto.createHash('sha256').update(q.imageUrl).digest('hex')`).
- **LESSON**: Never use string prefix slicing for binary or encoded media cache keys. Always use cryptographic hashes (SHA-256) or unique content IDs.

### Case 2: Generic HTTP 500 Catch-All on Missing Server Environment Variables
- **WHAT I EXPECTED**: The application should fail gracefully with an actionable error if `GEMINI_API_KEY` is not set on Vercel, or allow the user to supply their key in the browser.
- **WHAT AI DID**: AI let `getGeminiClient()` throw an unhandled exception inside `/api/parse-document`, which was caught in a generic catch block that responded with `res.status(500).json({ error: err.message })`.
- **WHY IT WAS WRONG**: On Vercel, missing environment variables caused a fatal HTTP 500 crash during document processing with no indication of whether the issue was network, file size, or missing credentials.
- **HOW I DISCOVERED IT**: User tested deployed production URL on Vercel and encountered HTTP 500 during processing.
- **WHAT I CHANGED**: Added explicit pre-flight credential checks returning `401 Unauthorized` with `MISSING_API_KEY` code, and built `clientGeminiParser.ts` to automatically switch to browser-side Gemini calls.
- **LESSON**: Serverless AI endpoints must always validate credentials before processing and provide client-side fallback paths when serverless environments lack API keys.

---

## 15. FAILURES AND CHALLENGES

### Failure 1: Multi-Case Image Duplication
- **PROBLEM**: All questions in a generated form displayed the exact same diagram image.
- **EXPECTED**: Each question displays its distinct figure/diagram extracted from the source page.
- **ACTUAL**: Case 1's image was duplicated across all 10+ cases.
- **WHERE IT FAILED**: `server.ts` Google Drive upload caching block.
- **ROOT CAUSE**: Cache key was generated using `q.imageUrl.slice(0, 100)`. Because all Base64 JPEG headers start identically, the cache returned the first uploaded image ID for all subsequent requests.
- **HOW WE INVESTIGATED**: Inspected Drive upload loop logs in `server.ts`.
- **FIX / CHANGE**: Implemented SHA-256 hash digests on the complete data URL.
- **FINAL RESULT**: Every visual exhibit is uniquely hashed and mapped to its exact question.
- **STATUS**: **RESOLVED**

### Failure 2: Large PDF Processing Timeout (120s+)
- **PROBLEM**: Uploading 15+ page PDFs resulted in gateway timeouts and dropped connections.
- **EXPECTED**: Extraction completes within 15–30 seconds.
- **ACTUAL**: High-resolution page canvases generated ~15MB payloads that stalled Gemini API inference and exceeded serverless limits.
- **WHERE IT FAILED**: `src/lib/pdfExtractor.ts` canvas rasterization.
- **ROOT CAUSE**: Rendering at 2.0x scale with 1.0 JPEG quality produced oversized payloads.
- **HOW WE INVESTIGATED**: Measured payload size and memory footprint during PDF ingestion.
- **FIX / CHANGE**: Capped canvas max dimension to 900px, reduced JPEG quality to 0.76 (~50KB per asset), and increased function duration in `vercel.json` to 60s.
- **FINAL RESULT**: Payloads reduced by ~85%, processing time dropped to under 12 seconds.
- **STATUS**: **RESOLVED**

### Failure 3: Vercel Production HTTP 500 Error During Processing
- **PROBLEM**: Document processing worked in local AI Studio preview but returned HTTP 500 on Vercel deployment.
- **EXPECTED**: Successful schema extraction on live deployed URL.
- **ACTUAL**: Server returned `500 Internal Server Error`.
- **WHERE IT FAILED**: `/api/parse-document` endpoint.
- **ROOT CAUSE**: Missing `GEMINI_API_KEY` in Vercel environment variables caused an unhandled throw in `getGeminiClient()`.
- **HOW WE INVESTIGATED**: Traced exception handling in `server.ts` and audited Vercel serverless runtime behavior.
- **FIX / CHANGE**: Added granular status code mapping (`401`, `413`, `429`, `504`) and implemented `clientGeminiParser.ts` for automated client-side fallback.
- **FINAL RESULT**: System gracefully informs user of missing server key and continues uninterrupted via client-side parsing.
- **STATUS**: **RESOLVED**

---

## 16. TESTING

- **Normal / Happy Path Testing**: Verified PDF, DOCX, CSV, Excel, JSON, Markdown, and plain text prompt conversions.
- **Multimodal & Visual Testing**: Tested extraction of technical diagrams, charts, UI screenshots, and rubrics.
- **Formula Testing**: Verified LaTeX math formula parsing and KaTeX rendering (`$E_k = \frac{1}{2}mv^2$`, `$\frac{a}{b}$`).
- **Edge-Case & Recovery Testing**: Tested dense documents with zero explicit questions to verify question synthesis safeguard.
- **Network Resilience Testing**: Tested browser offline/online transitions during active form generation to verify `NetworkStatus.tsx` alerts.
- **Vercel Build & Lint Testing**: Executed `npm run lint` (`tsc --noEmit`) and `npm run build` (`vite build` + `esbuild`) to verify zero compile warnings.

---

## 17. SECURITY ISSUES

- **Credential & Secret Protection**: No hardcoded API keys or client secrets exist in source code. `GEMINI_API_KEY` is loaded via `process.env` on the server.
- **Client-Side OAuth Exception**: Google OAuth access tokens are acquired strictly client-side via Google Identity Services and passed via standard `Authorization: Bearer <token>` request headers.
- **Scoped Drive Access**: Google Drive API scopes are restricted to `drive.file` (only access files created by the application itself).
- **In-Memory Cache Isolation**: SHA-256 asset deduplication is scoped per-request to prevent cross-user memory leakage.

---

## 18. DEPLOYMENT

- **Local Development**: Runs via `tsx server.ts` with Vite middleware mounted on port 3000.
- **Cloud Run / Container Deployment**: Bundles `server.ts` into a CommonJS bundle (`dist/server.cjs`) via `esbuild` and serves static files from `dist/`.
- **Vercel Serverless Deployment**:
  - `vercel.json` routes `/api/(.*)` to `/api/index.ts` and `/(.*)` to `/index.html`.
  - Configured with `maxDuration: 60`.
  - Verified working with `GEMINI_API_KEY` configured in Vercel project environment variables.

---

## 19. DEBUGGING PROCESS

1. **Layer Isolation**: Separated client-side file reading (mammoth/PDF.js) from backend AI extraction (`/api/parse-document`) and Google Workspace creation (`/api/forms/create`).
2. **Status Code Refactoring**: Replaced broad 500 error catches with granular HTTP status codes (`401`, `413`, `429`, `504`) to immediately isolate configuration issues from logic bugs.
3. **Cryptographic Trace**: Inspected Base64 string hashes to locate the source of image duplication in Drive uploads.
4. **Client Fallback Redundancy**: Added direct browser SDK parsing (`clientGeminiParser.ts`) to bypass serverless execution failures.

---

## 20. DESIGN / UX DECISIONS

- **Single-Tab Principle**: Rejected multi-step wizard tabs in favor of a unified dual-input workspace (Dropzone on left, Text Prompt on right).
- **Accordion Dropdown Consolidation**: Moved secondary options (Ready-Made Templates, Idea Starters, Extraction Settings) into collapsible dropdown buttons to eliminate visual clutter.
- **Real-Time Connectivity Badge**: Added a footer status indicator (`Online`/`Offline`) with floating generation interruption alerts.
- **Dual-Layer Auto-Save**: Preserved schema edits in browser IndexedDB with `localStorage` fallback to prevent data loss on accidental reloads.

---

## 21. DATA

- **Input Types**: Binary files (PDF, DOCX, PNG, JPEG), tabular files (CSV, XLSX), text files (JSON, Markdown, TXT), and raw text prompts.
- **Data Structure (`ParsedFormSchema`)**:
  - `title`, `description`, `passingScorePercentage`
  - Array of `questions`: `id`, `title`, `description`, `type` (`RADIO`, `CHECKBOX`, `DROP_DOWN`, `SHORT_TEXT`, `PARAGRAPH`, `SCALE`, `DATE`, `TIME`), `options`, `correctAnswers`, `points`, `hasImagePrompt`, `assetIds`, `validation`.
  - Array of `assets`: `assetId`, `name`, `mimeType`, `dataUrl`, `associatedSection`.
- **Output Structures**:
  - Live Google Form URL and Edit URL.
  - Linked Google Spreadsheet URL.
  - Ready-to-use Google Apps Script (`.gs`) for automated email notifications.

---

## 22. WHAT WE LEARNED

1. **Multimodal Payload Optimization**: High-resolution document scans must be downscaled (max 900px, 0.76 quality) prior to LLM submission to prevent timeout errors.
2. **Cache Key Cryptography**: Never use string prefix slicing on encoded data; always use SHA-256 hashing for media deduplication.
3. **Serverless Fault Tolerance**: In serverless deployments (Vercel), AI endpoints must be backed by direct client-side fallback parsing when environment variables or timeouts fail.
4. **UX Minimalism**: Consolidating complex configuration panels into dropdown menus drastically improves usability while preserving full feature depth.

---

## 23. WHAT I WOULD DO DIFFERENTLY (Retrospective)
- Implement client-side direct fallback parsing from Day 1 rather than relying solely on server-side proxy routes for serverless deployments.
- Use SHA-256 content hashing for media caches from the initial implementation.
- Introduce the single-tab dropdown architecture earlier to avoid intermediate multi-tab interface sprawl.

---

## 24. STRONGEST EVIDENCE
- **System Architecture**: Designed and built an end-to-end multimodal document parsing and Google Workspace synchronization pipeline.
- **Root Cause Debugging**: Identified and resolved the Base64 cache key duplication bug and Vercel HTTP 500 serverless error.
- **Resilience Engineering**: Built a dual-layer extraction architecture (Serverless Model Cascade + Direct Browser Gemini Fallback).
- **UX Craftsmanship**: Refactored a dense multi-feature application into an ultra-clean, single-tab interface.

---

## 25. LINKEDIN PROJECT VERSION
**PROJECT:** FormCraft AI — Document & Prompt to Google Forms & Sheets  
**PROBLEM:** Manually building Google Forms from complex documents, STEM test sheets, and rubrics with diagram exhibits is tedious, error-prone, and time-consuming.  
**WHAT I BUILT:** Full-stack document intelligence platform that converts PDFs, Word `.docx`, CSVs, and plain text prompts into live Google Forms, linked Google Spreadsheets, and automated 3-tier candidate scoring workflows.  
**TECHNOLOGY:** React 19, TypeScript, Gemini 2.5 Flash, Google Forms/Sheets/Drive APIs, Node.js, Express, PDF.js, Mammoth, KaTeX, Vercel Serverless.  
**ENGINEERING:** Built SHA-256 asset deduplication, PDF canvas OCR, LaTeX formula rendering, and a client-side failover fallback for serverless 500 errors.  
**STATUS:** Fully Tested & Deployed.

---

## 26. RESUME VERSION
- **Architected and developed FormCraft AI**, a full-stack document-to-form automation platform integrating Google Gemini 2.5 Flash, Google Forms API v1, Google Sheets API v4, and Google Drive API v3.
- **Engineered a multimodal ingestion pipeline** utilizing PDF.js canvas rasterization and Mammoth.js to extract complex questions, LaTeX math formulas, table rubrics, and diagram assets.
- **Implemented a fail-safe dual extraction architecture** featuring a server-side LLM cascade with automated client-side fallback, eliminating Vercel serverless timeout and HTTP 500 errors.
- **Designed a cryptographic SHA-256 asset deduplication engine** and built an interactive Schema Editor with IndexedDB auto-save, live form preview, and 3-tier Google Apps Script scoring workflows.

---

## 27. LINKEDIN STORY IDEAS

### Story 1: The Base64 Cache Key Trap
- **HOOK**: Why did every question in our 10-case technical exam get assigned the exact same diagram image?
- **WHAT ACTUALLY HAPPENED**: An early implementation cached Drive uploads by taking `q.imageUrl.slice(0, 100)`. Because all Base64 JPEG data URLs start with the identical header string, the cache returned Case 1's image for all subsequent cases. Replacing the slice with full SHA-256 hashing resolved the issue instantly.
- **LESSON**: Never use string prefix slicing for binary or encoded media cache keys.
- **POSSIBLE VISUAL**: Side-by-side comparison showing duplicate diagram vs. unique SHA-256 mapped exhibits.

### Story 2: Taming Serverless HTTP 500 Errors with Client Fallbacks
- **HOOK**: What do you do when your AI backend works flawlessly in development but throws HTTP 500 in serverless production?
- **WHAT ACTUALLY HAPPENED**: Missing environment variables and payload size constraints caused serverless function crashes. Instead of just patching configuration, we mapped granular HTTP status codes (`401`, `413`, `429`, `504`) and engineered an automatic client-side Gemini fallback.
- **LESSON**: Resilient AI applications should have client-side fallback mechanisms when serverless environments fail.
- **POSSIBLE VISUAL**: Architectural diagram showing the Server Cascade $\rightarrow$ Client Fallback path.

### Story 3: The Single-Tab UI Refactor
- **HOOK**: How moving 8 configuration panels into 3 clean dropdowns transformed user experience.
- **WHAT ACTUALLY HAPPENED**: The initial interface had multiple tabs and settings panels. We restructured the entire experience into a dual-input single-tab screen with collapsible dropdowns for templates and settings.
- **LESSON**: True craft isn't adding more tabs; it's hiding complexity behind intuitive, zero-distraction entry points.
- **POSSIBLE VISUAL**: Screenshot of the clean single-tab workspace.

---

## 28. PORTFOLIO CASE STUDY

### Problem
Organizations, educators, and recruiters spend hours manually copying questions from documents (PDFs, Word docs, worksheets, and rubrics) into Google Forms, re-uploading diagram exhibits, creating linked Google Sheets, and configuring scoring rubrics.

### Approach
Build a local-first web application that ingests any document format or plain text prompt, extracts questions, formulas, and visual exhibits via multimodal LLMs, allows interactive editing, and provisions Google Forms and connected Sheets via Google Workspace APIs.

### Architecture
A React 19 / TypeScript SPA paired with an Express/Vercel serverless backend. Document text and canvas snapshots are processed through a Gemini model cascade (`gemini-2.5-flash` $\rightarrow$ `3.1-flash-lite` $\rightarrow$ `3.7-flash`) with automatic browser-side fallback.

### Build
- **Document Extractors**: PDF.js canvas rasterization + Mammoth `.docx` media unzipper.
- **Schema Engine**: Strict JSON schema with KaTeX LaTeX math support and validation regex.
- **Workspace Sync**: Google Forms API v1 batch updates + Google Drive API multipart uploads with SHA-256 deduplication + Google Sheets API v4 response logging.
- **UI / UX**: Single-tab dual ingestion workspace with collapsible template and settings dropdowns, IndexedDB auto-save, and footer network monitor.

### Challenges & Failures
1. **Asset Duplication**: Base64 prefix cache collision fixed via SHA-256 digests.
2. **Payload Stalls**: PDF canvas downscaled to max 900px / 0.76 JPEG to prevent inference timeouts.
3. **Vercel HTTP 500 Errors**: Resolved via granular status codes and direct client-side fallback parsing.

### Result
A robust, production-ready system capable of converting multi-page assessment documents into live Google Forms and synchronized Google Sheets in under 15 seconds.

### Current Status
**Tested, Working Prototype & Deployed.**

---

# MASTER PROJECT TIMELINE

| PROJECT | START DATE | END DATE | STATUS | PRIMARY CATEGORY | AI INVOLVEMENT | TECHNOLOGIES | KEY ACHIEVEMENT | KEY FAILURE / LESSON |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FormCraft AI** | Aug 15, 2026 | Aug 23, 2026 | **Tested & Deployed** | SaaS / AI Workflow Automation | Multimodal Extraction & Model Cascade (Gemini 2.5 Flash / 3.7 Flash) | React 19, TypeScript, Express, Google Workspace APIs, PDF.js, Mammoth, KaTeX, Vercel | End-to-end document conversion to live Google Forms & Sheets with SHA-256 image fidelity | Base64 prefix cache collision fixed with SHA-256; Serverless 500s resolved with client fallback |

---

# PROJECT CATEGORIES
- **A. AI PROJECTS**: FormCraft AI (Multimodal Document Parsing, LaTeX Math Detection, Question Synthesis).
- **B. AUTOMATION PROJECTS**: Google Forms API Batch Creation, Google Drive Media Uploads, Google Sheets Response Logging, 3-Tier Google Apps Script Email Workflow.
- **C. SOFTWARE / WEB PROJECTS**: FormCraft AI Single-Tab Workspace (React 19, Tailwind CSS 4, Motion, KaTeX, IndexedDB Auto-Save).
- **D. DATA PROJECTS**: Document Schema Extraction, JSON Form Definitions, Tabular CSV/Excel Ingestion.
- **E. TESTING / AUDIT PROJECTS**: Developer Stress Test Lab (`StressTestPanel.tsx`), Synthetic Document Capability Matrix, Network Loss Simulation.
- **F. LOCAL AI / OPEN SOURCE PROJECTS**: Direct Client-Side Gemini Parser (`clientGeminiParser.ts`), Local-First IndexedDB Persistence.
- **G. UNFINISHED / PAUSED EXPERIMENTS**: Automated Google Apps Script remote API execution (currently manual copy/paste `.gs` generation due to domain admin constraints).

---

# TOP LISTS

1. **Strongest Project for LinkedIn**: FormCraft AI (End-to-End Document-to-Google-Forms & Sheets Automation Engine).
2. **Strongest Resume Project**: FormCraft AI (Multimodal LLM extraction, Google Workspace API integration, SHA-256 deduplication, dual-layer failover architecture).
3. **Strongest Technical Case Study**: Multimodal Document Parsing, Cryptographic Image Mapping, and Serverless Failover in FormCraft AI.
4. **Best Failure / Learning Stories**:
   - The Base64 100-character prefix cache collision that duplicated diagrams across all exam questions.
   - Solving Vercel serverless HTTP 500 crashes via granular status codes and direct browser-side Gemini fallback.
   - Eliminating 120s PDF processing timeouts by optimizing canvas DPI and JPEG quality parameters.
   - Consolidating multi-tab UI sprawl into a clean single-tab workspace with accordion dropdowns.
5. **AI Solutions Engineering Demonstration**: FormCraft AI proves full-lifecycle capability across problem definition, multimodal LLM prompting/schemas, third-party API integration (Google Forms/Sheets/Drive), edge-case debugging, and deployment resilience.

---

# WHAT THIS PROJECT HISTORY ACTUALLY SAYS ABOUT THIS BUILDER

1. **Architectural Pragmatism**: Chooses direct, lightweight solutions (single-tab UI, collapsible dropdowns, client-side fallback) rather than adding unnecessary architectural complexity.
2. **Strong Problem-Solving Instincts**: When encountering the Vercel HTTP 500 error, immediately directed an investigation of the exact endpoint (`/api/parse-document`) and exception cause before modifying configuration.
3. **Rigorous Root-Cause Mindset**: Did not accept surface-level workarounds for image duplication; identified the Base64 prefix cache collision and insisted on cryptographic SHA-256 hashing.
4. **User-Centric Product Discipline**: Actively pushes back against UI clutter, mandating clean single-screen experiences and tucking advanced options into intuitive dropdown menus.
5. **Full-Stack Competence**: Seamlessly navigates browser APIs (IndexedDB, FileReader, PDF.js canvas, navigator online events), backend Node/Express routing, and third-party SaaS APIs (Google Workspace).
6. **Resilience & Fault Tolerance**: Designs systems that don't crash when serverless functions fail; engineered an automatic browser-side Gemini fallback mechanism.
7. **Attention to Data Integrity**: Ensures LaTeX math formulas, point values, validation rules, and diagram associations are preserved without corruption.
8. **Pragmatic AI Utilization**: Uses LLMs for structured JSON transformation and semantic recovery while using deterministic code (PDF.js, Mammoth, SHA-256) for media extraction and hashing.
9. **Iterative Polish**: Continuously refines real-world edge cases (network disconnection alerts, draft auto-saving, stress testing labs).
10. **Deployment Awareness**: Thoroughly audits build configurations (`vercel.json`, `package.json`, environment variables) to ensure production viability.
