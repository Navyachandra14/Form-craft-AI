# FormCraft AI - Document to Google Forms & Sheets System Architecture & Implementation Report

**Author:** Google AI Studio Build Agent & FormCraft Engineering  
**Version:** 2.5.0 Production Ready  
**Date:** August 2026  
**Live Application:** FormCraft AI (Doc & Brief to Google Forms & Connected Sheets)

---

## 1. Executive Summary

FormCraft AI is a local-first, AI-powered system designed to transform raw assessment documents (PDFs, Word `.docx`, images, scanned rubrics, and project briefs) into fully functional, live **Google Forms** paired with synchronized **Google Sheets** and automated **candidate screening workflows**.

This document outlines the entire end-to-end implementation, architecture, fallback cascades, API endpoints, and Developer Mode instructions.

---

## 2. Complete Core Implementation Overview

### A. Document Parsing & Optical Asset Ingestion Pipeline
1. **Multi-Format Ingestion**:
   - **PDF Extractor (`src/lib/pdfExtractor.ts`)**: Renders PDF pages into raster canvases at high DPI (1.5x-2.0x scale) using PDF.js. Detects and extracts graphical figures, code blocks, diagrams, and question exhibits.
   - **Word DOCX Parser (`src/lib/parser.ts`)**: Unzips document archives, extracts embedded media (`/word/media/image*.png|jpg`), and processes document formatting with Mammoth.
   - **Text & Project Brief Ingestion**: Accepts raw markdown, unstructured criteria, or generates assessments from prompt briefs with target candidate profiles.

2. **Server-Side Gemini Model Cascade (`src/lib/gemini.ts` & `server.ts`)**:
   - Primary Model: `gemini-2.5-flash` (low latency, high reasoning fidelity).
   - Secondary Fallback: `gemini-3.1-flash-lite` (quota resilience).
   - Tertiary Fallback: `gemini-3.7-flash` (complex rubric reasoning).
   - **Question Recovery Safeguard**: If a document contains dense unstructured text where zero questions are initially detected, the system executes an automated recovery pass to synthesize questions from section headings and asset descriptions rather than failing.

3. **Media Verification & Asset Association**:
   - Automatically correlates visual exhibits to question items using case numbers, figure markers, and spatial proximity.
   - Users can review, reassign, or upload custom replacement images via the **Media Verification Panel**.

---

### B. Google Workspace API Integration
1. **Google Identity & OAuth 2.0 (`src/lib/auth.ts`)**:
   - Scopes: `forms.body`, `forms.responses.readonly`, `spreadsheets`, `drive.file`.
   - Client-side token acquisition with secure header proxying (`Authorization: Bearer <token>`).

2. **Google Forms Batch Creation (`/api/forms/create`)**:
   - Builds Google Form with full support for:
     - `RADIO` (Multiple Choice)
     - `CHECKBOX` (Multi-select)
     - `DROP_DOWN` (Dropdown lists)
     - `SHORT_TEXT` (Text inputs with validation regex)
     - `PARAGRAPH` (Long response)
     - `SCALE` (Linear rating scales 1-5, 1-10)
     - `DATE` & `TIME` inputs
     - `FILE_UPLOAD` fields
     - `SECTION_HEADER` separators
   - Automatically synchronizes question image exhibits to Google Drive via multipart upload and sets public read permissions for direct `sourceUri` rendering in Google Forms.

3. **Connected Google Sheet Real-Time Sync (`/api/forms/sync-sheet`)**:
   - Simultaneously creates a Google Sheet (`Form Responses 1`) with frozen header rows and exact column titles.
   - Supports 1-click live response synchronization from Google Forms API into Google Sheets.

---

### C. 3-Tier Candidate Screening & Automation Workflow
1. **Automated Scoring Tier Logic**:
   - **Tier 1 (Pass)**: Score $\ge$ Threshold (e.g. 80%) $\rightarrow$ Triggers acceptance/interview invitation email.
   - **Tier 2 (Manual Review)**: Score between Review & Pass threshold $\rightarrow$ Flags candidate for human evaluator review.
   - **Tier 3 (Retake/Reject)**: Score below threshold $\rightarrow$ Sends polite feedback or retake instructions with cooldown hours.
2. **Google Apps Script Generator (`src/lib/workflowDefaults.ts`)**:
   - Generates a ready-to-run `.gs` script that attaches to the Google Sheet `onFormSubmit` trigger to automate personalized candidate emails in real time.

---

## 3. How to Enable Developer Mode & Stress Testing Labs

FormCraft AI includes an isolated **Stress Testing & Capability Matrix Lab** (`src/components/StressTestPanel.tsx`) designed to test edge-case documents (multimodal figures, complex rubrics, LaTeX math, corrupted inputs, and prompt briefs).

### Method 1: Keyboard Shortcut (Fastest)
Press **`Ctrl + Shift + D`** (or **`Cmd + Shift + D`** on macOS) anywhere inside the application to instantly toggle Developer Mode and open the Stress Test Lab.

### Method 2: URL Parameter
Add `?dev=true` or `?debug=1` to the application URL:
```
https://your-app-url.com/?dev=true
```

### Method 3: Top Navigation Bar Button
Click the **Stress Test V2** button with the flask icon (`🧪`) in the top navigation bar.

### Method 4: Settings Modal Toggle
Open the **API Settings** modal (`🔑` icon) and toggle the **"Developer Mode & Stress Testing Labs"** switch.

---

## 4. Video Tutorials & Interactive Walkthrough System

The Help Guide (`src/components/HelpGuide.tsx`) provides three interactive modalities:

1. **Curated Video Screencasts**:
   - **Getting Started**: Converting PDF/DOCX to Google Forms in 60 seconds.
   - **Advanced Customization**: 3-Tier candidate screening, passing thresholds & Google Sheets scoring.
   - **Troubleshooting**: Google OAuth permissions, Drive image hosting & error diagnostics.
2. **Custom Video Embed Support**:
   - Users or instructors can paste their own custom company screencast (YouTube, Loom, or Google Drive link) into the player to provide internal organization training.
3. **Interactive Step-by-Step Chapters**:
   - Jump directly to timestamped markers with animated step highlights and key topic summaries.

---

## 5. Deployment & Serverless Configuration (Vercel & AI Studio)

1. **Vercel Serverless Function (`api/index.ts`)**:
   - Configured with `vercel.json` rewrites mapping `/api/(.*)` to `/api/index.ts`.
   - Set execution duration to `maxDuration: 60` for resilient model inference.
2. **CORS & Preflight Handling (`server.ts`)**:
   - Full support for `GET`, `POST`, `OPTIONS`, `PUT`, `DELETE` across all domains.
3. **Dual-Layer Local Persistence (`src/lib/persistence.ts`)**:
   - Automatic draft saving to IndexedDB with instantaneous LocalStorage mirroring to prevent data loss on page refresh.

---

## 6. API Reference Summary

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and server status |
| `/api/gemini-config-status` | `GET` | Checks if environment Gemini key is configured |
| `/api/validate-gemini-key` | `POST` | Validates custom user-supplied Gemini API key |
| `/api/parse-document` | `POST` | Primary AI parsing endpoint with model cascade & recovery |
| `/api/forms/create` | `POST` | Google Forms API creation & Drive image synchronization |
| `/api/forms/sync-sheet` | `POST` | Synchronizes responses from Google Forms to Google Sheets |
| `/api/sheets/fetch` | `GET` | Retrieves current response rows from connected Google Sheet |
| `/api/assets/:assetId` | `GET` | Serves extracted document images directly |

---

*FormCraft AI — Built with Gemini 2.5 Flash, React 19, Tailwind CSS, and Google Workspace APIs.*
