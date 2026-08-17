# FormCraft AI — Document & Brief to Google Forms & Connected Sheets

FormCraft AI is an automated form generation, assessment scoring, and application screening platform powered by **Gemini 2.5 Flash**, the **Google Forms API (v1)**, **Google Sheets API (v4)**, and **Google Drive API (v3)**.

It seamlessly transforms unstructured documents (PDFs, Word DOCX files, scanned worksheets, evaluation rubrics) or natural language prompts into live, publication-ready Google Forms with connected Google Sheets and automated scoring workflows.

---

## 🌟 Key Capabilities

1. **Multi-Source Ingestion & Extraction**:
   - **PDFs & Multi-Page Exams**: Extracts structured text and captures visual diagrams, bounding boxes, charts, and question screenshots using high-fidelity rendering.
   - **Word DOCX Files**: Decompresses OpenXML archives, extracts embedded media, and converts formatting via Mammoth.js.
   - **Natural Language Prompts**: Generates complete multi-section screening assessments with realistic questions, validation rules, and scoring rubrics.
   - **Smart Industry Templates**: Pre-built, battle-tested templates for AI Alignment, Audio Transcription, Video Annotation, Indic Linguists, Cloud Architects, and RLHF evaluators.

2. **Automated Assessment Scoring & Candidate Tiering**:
   - **Native Google Forms Quiz Mode**: Automatically assigns answer keys, point values, and correct/incorrect feedback explanations.
   - **Three-Tier Evaluation Gates**:
     - 🟢 **Tier 1 (Pass $\ge 80\%$)**: Highlights row green in Google Sheets, generates WhatsApp/Telegram/Google Meet invite notifications.
     - 🟡 **Tier 2 (Under Review $70\% - 79\%$)**: Highlights row amber, flags for manual reviewer inspection.
     - 🔴 **Tier 3 (Reattempt $< 70\%$)**: Highlights row rose, triggers polite feedback and cooldown instructions.

3. **Automated Email Notifications (`onFormSubmit`)**:
   - Includes a ready-to-run **Google Apps Script trigger** for connected Google Sheets.
   - Automatically executes immediately when a candidate submits the form.
   - Calculates score, tags the sheet row, and dispatches dynamic, personalized candidate emails with zero external server costs.

4. **Recent Work History & Auto-Persistence**:
   - Preserves all drafts and created forms locally in IndexedDB & LocalStorage.
   - Dedicated **History Modal** allowing users to search, pick up, resume editing, duplicate, or re-export previously created forms anytime.

5. **Security & Privacy Guardrails**:
   - Per-user OAuth 2.0 tokens (forms and spreadsheets created exclusively in the user's personal Google account).
   - Server-side Gemini API key proxying (no secret keys exposed to the browser).
   - Cryptographic SHA-256 asset deduplication prevents cross-case visual collisions.

---

## 🚀 Quick Start & Local Development

### Prerequisites
- Node.js 18+ or Node.js 20+
- npm, yarn, or pnpm
- Google Gemini API Key ([Get one at Google AI Studio](https://aistudio.google.com/))

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/formcraft-ai.git
cd formcraft-ai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment Guide

### 1. Deploying to Vercel
1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key.
6. Click **Deploy**.

> Note: The included `vercel.json` ensures all client-side SPA routes and API endpoints route smoothly.

---

### 2. Deploying to Cloud Run / Docker / Render / Railway
This repository contains a unified full-stack Express server (`server.ts`) that serves both backend API routes (`/api/*`) and Vite static assets in production.

#### Production Build & Start:
```bash
# Build frontend and compile backend server bundle
npm run build

# Start production server
npm run start
```

#### Dockerfile Example:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📧 How Automated Candidate Emails Work

Google Forms submissions flow into your connected Google Sheet. FormCraft AI provides an automated Google Apps Script that handles conditional email dispatches:

1. Open your created **Google Sheet**.
2. Click **Extensions** > **Apps Script**.
3. Paste the generated Apps Script snippet (accessible directly in the app's **Scoring Rules** tab).
4. Click **Triggers (Clock Icon)** > **Add Trigger**:
   - Choose which function to run: `onFormSubmit`
   - Select event source: `From spreadsheet`
   - Select event type: `On form submit`
5. Save and authorize permissions. When any respondent submits the form, personalized emails and sheet updates occur instantly.

---

## 🛡️ Security, Privacy & Compliance

- **Zero Data Harvesting**: FormCraft AI does not store user documents or candidate responses on third-party servers. All forms and spreadsheets reside exclusively within the authenticated creator's Google Workspace.
- **Client-Side Token Safety**: OAuth tokens are handled client-side using Google Identity Services (GIS) and passed via short-lived `Authorization: Bearer` headers.
- **Sanitized Uploads**: Image assets and extracted text payloads are validated and scoped to individual request lifecycles with SHA-256 cryptographic hashing.

---

## 📄 License
MIT License. Free to use for personal, academic, and commercial workflows.
