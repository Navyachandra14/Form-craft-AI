# FormCraft AI — Comprehensive Vercel Deployment & User Guide

This guide provides step-by-step instructions for deploying FormCraft AI to **Vercel**, configuring required environment variables, resolving common deployment issues, and using the unified workspace.

---

## 1. Prerequisites
- A [Vercel account](https://vercel.com)
- Your GitHub repository containing this codebase
- A valid **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 2. Linking GitHub Repository to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **"Add New..."** button in the upper-right corner and select **"Project"**.
3. Under **"Import Git Repository"**, locate your GitHub repository and click **"Import"**.
4. In the **Configure Project** screen, verify the default settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node.js Version**: `18.x` or `20.x` (Recommended)

---

## 3. Configuring Environment Variables in Vercel

FormCraft AI uses Google Gemini models (`gemini-2.5-flash`, `gemini-3.1-flash-lite`, `gemini-3.7-flash`) for multimodal document extraction, OCR, rubric generation, and schema creation.

1. Expand the **"Environment Variables"** section in the Vercel project configuration page (or navigate to **Project Settings > Environment Variables**):
2. Add the following environment variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSy...` *(Your Google AI Studio Gemini API Key)*
   - **Environments**: Check **Production**, **Preview**, and **Development**.
3. *(Optional)* If you wish to expose a client-side fallback key:
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: `AIzaSy...`
4. Click **"Save"** or **"Add"**.

---

## 4. Vercel Configuration & Routing (`vercel.json`)

The repository includes a production-ready `vercel.json` at the root that routes client-side navigation to the Vite single-page application (`/index.html`) while directing `/api/*` endpoints to the serverless function handler:

```json
{
  "version": 2,
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 5. Troubleshooting Common Vercel Deployment Errors

| Common Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`vite: command not found`** | Build running in an environment without dependencies installed. | Ensure **Install Command** in Vercel is set to `npm install`. |
| **`Cannot find module 'vite'` in serverless function** | Server importing Vite dev server in production runtime. | `server.ts` uses dynamic imports for `vite` only during local development. In Vercel serverless mode, Vite middleware is skipped automatically. |
| **`404 on page refresh / direct URL`** | SPA routing not configured. | Handled automatically by the rewrite rule in `vercel.json` pointing `/(.*)` to `/index.html`. |
| **`504 Gateway Timeout on Large File`** | Uploading massive raw binaries exceeding serverless limits. | Use files under 25MB or copy-paste text directly into the prompt box. The `maxDuration` in `vercel.json` is set to 60s. |
| **`500 Internal Server Error during processing`** | Missing `GEMINI_API_KEY` on Vercel, payload exceeding 4.5MB serverless limit, or unsupported asset format. | 1. Add `GEMINI_API_KEY` to Vercel Environment Variables and redeploy.<br/>2. Enter your API key in the UI's **API Settings** modal (top right), which enables both authenticated server calls and direct client-side fallback.<br/>3. The backend now maps exceptions to explicit status codes (`401` for missing keys, `429` for rate limits, `413` for large files) and the frontend automatically invokes client-side fallback. |
| **`401 / 403 API Key Missing`** | `GEMINI_API_KEY` not configured in Vercel settings. | Add `GEMINI_API_KEY` under **Project Settings > Environment Variables** and trigger a redeployment. Users can also enter a key in the **API Settings** modal in the UI. |

---

## 6. Supported Ingestion Formats in Single-Tab Workspace

FormCraft AI features a unified, single-screen workspace where users can drag and drop any supported format or type prompts directly:

- **PDF Documents** (`.pdf`): Extracts structured text, visual screenshots, and embedded figures.
- **Word Documents** (`.docx`): Converts Microsoft Word content into structured form fields.
- **Spreadsheets & Data** (`.csv`, `.xlsx`, `.xls`): Automatically reads tabular rows and generates survey fields.
- **Structured Data** (`.json`): Direct import of form schema definitions or raw JSON.
- **Markdown & Plain Text** (`.md`, `.markdown`, `.txt`): Parses headings, bullet points, and questions.
- **Images & Camera Scans** (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`): Vision OCR extracting text, diagrams, and math formulas.
- **Natural Language Prompts**: Instant generation from high-level descriptions (e.g. *"Create a 10-question candidate assessment with 80% passing threshold"*).
- **Pre-Configured Smart Templates**: 1-click loading for visual evaluation rubrics, HR hiring, employee pulse surveys, event RSVPs, and STEM quizzes.

---

## 7. Post-Deployment Verification Checklist

Once deployed to your live Vercel URL (e.g., `https://your-project.vercel.app`):

1. **Verify UI Loading**: Check that the main single-tab workspace loads cleanly.
2. **Check API Status**:
   - Click the **API Key** button in the header.
   - Confirm that it displays **"API Key Active"** (if `GEMINI_API_KEY` is set in Vercel) or enter a custom key.
3. **Run a Test Conversion**:
   - Drag & drop a sample document or click one of the **Smart Templates** (e.g. *Candidate Technical Screening* or *Benjamin ADLoc Practice Sheet*).
   - Verify that questions, options, point values, and LaTeX math formulas populate in the interactive Schema Editor.
4. **Test Publishing / Export**:
   - Preview the form in the interactive preview mode or export the JSON schema.
   - Test Google OAuth sign-in if you wish to generate live forms in Google Drive.
