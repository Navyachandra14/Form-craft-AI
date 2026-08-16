import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import { parseDocxWithImageFidelity } from './src/lib/parser';
import { generateContentWithFallback } from './src/lib/gemini';
import { Asset } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// Support larger file payloads (PDFs, high-res scans, images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Asset Registry to preserve and serve actual extracted images
const assetRegistry = new Map<
  string,
  {
    assetId: string;
    buffer: Buffer;
    mimeType: string;
    dataUrl: string;
    associatedSection?: string;
  }
>();

// Endpoint to serve extracted assets directly with appropriate Content-Type
app.get('/api/assets/:assetId', (req: Request, res: Response): void => {
  const asset = assetRegistry.get(req.params.assetId);
  if (!asset) {
    res.status(404).send('Asset not found');
    return;
  }
  res.setHeader('Content-Type', asset.mimeType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(asset.buffer);
});

// Gemini client resolver supporting both custom user-supplied API key and server environment key
let defaultAiClient: GoogleGenAI | null = null;

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Please enter your Google Gemini API key in the API Settings modal (top-right navigation) or configure GEMINI_API_KEY in your environment.'
    );
  }
  
  if (customApiKey?.trim()) {
    return new GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  if (!defaultAiClient) {
    defaultAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return defaultAiClient;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Check whether a default Gemini API key is configured on server
app.get('/api/gemini-config-status', (_req: Request, res: Response) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  res.json({
    hasEnvKey,
    requiresUserKey: !hasEnvKey,
  });
});

// Validate user's Gemini API key
app.post('/api/validate-gemini-key', async (req: Request, res: Response): Promise<void> => {
  try {
    const customKey = (req.headers['x-gemini-api-key'] as string) || req.body.apiKey;
    const ai = getGeminiClient(customKey);

    const result = await generateContentWithFallback(ai, {
      contents: 'Ping test. Reply with "pong".',
    });

    if (result.text) {
      res.json({
        success: true,
        valid: true,
        message: `Gemini API key verified successfully! Connected via ${result.modelUsed}.`,
      });
      return;
    }
    res.status(400).json({
      success: false,
      valid: false,
      error: 'Received empty response from Gemini API.',
    });
  } catch (error: any) {
    console.error('API key validation error:', error);
    res.status(400).json({
      success: false,
      valid: false,
      error: error.message || 'Invalid Gemini API key or unable to connect.',
    });
  }
});

// Parse document / image OR project brief into structured form schema
app.post('/api/parse-document', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fileBase64,
      mimeType,
      fileName,
      textContent,
      briefConfig,
      userApiKey,
      includeDefaultProfile = false,
      includeNotes = false,
      extractionMode = 'STRICT_VERBATIM',
      extractedAssets = [],
    } = req.body;
    
    if (fileBase64 && fileBase64.length > 50 * 1024 * 1024 * 1.33) {
      res.status(400).json({ success: false, error: 'File too large. Maximum size is 50MB.' });
      return;
    }
    
    const customHeaderKey = req.headers['x-gemini-api-key'] as string | undefined;
    const customKey = customHeaderKey || userApiKey;

    if (!fileBase64 && !textContent && !briefConfig) {
      res.status(400).json({ success: false, error: 'No document data, text content, or project brief provided.' });
      return;
    }

    const ai = getGeminiClient(customKey);

    let extractedDocText = textContent || '';
    const currentAssets: Asset[] = [];
    const contents: any[] = [];

    // Register any client-extracted genuine assets (e.g. from PDF embedded graphics or direct capture)
    if (Array.isArray(extractedAssets) && extractedAssets.length > 0) {
      for (const asset of extractedAssets) {
        if (asset.dataUrl) {
          let cleanMime = (asset.mimeType || 'image/jpeg').toLowerCase();
          let rawBase64 = '';

          if (asset.dataUrl.startsWith('data:')) {
            const match = asset.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              cleanMime = match[1].toLowerCase();
              rawBase64 = match[2];
            } else {
              // Non-base64 data URL (e.g. data:image/svg+xml;utf8,...)
              const commaIdx = asset.dataUrl.indexOf(',');
              if (commaIdx !== -1) {
                const header = asset.dataUrl.substring(5, commaIdx);
                const headerMime = header.split(';')[0];
                if (headerMime) cleanMime = headerMime.toLowerCase();
                const payload = asset.dataUrl.substring(commaIdx + 1);
                rawBase64 = Buffer.from(decodeURIComponent(payload), 'utf8').toString('base64');
              }
            }
          } else {
            rawBase64 = asset.dataUrl;
          }

          if (rawBase64) {
            let buffer: Buffer;
            try {
              buffer = Buffer.from(rawBase64, 'base64');
            } catch {
              buffer = Buffer.from([]);
            }

            assetRegistry.set(asset.assetId, {
              assetId: asset.assetId,
              buffer,
              mimeType: cleanMime,
              dataUrl: asset.dataUrl,
              associatedSection: asset.associatedSection || undefined,
            });
            currentAssets.push({
              ...asset,
              mimeType: cleanMime,
              data: buffer,
            });

            // Gemini API ONLY supports raster image mime types: image/png, image/jpeg, image/webp, image/heic, image/heif
            const isGeminiSupportedMime = /image\/(png|jpe?g|webp|heic|heif)/i.test(cleanMime);
            if (isGeminiSupportedMime && contents.length < 32) {
              contents.push({
                inlineData: {
                  mimeType: cleanMime,
                  data: rawBase64,
                },
              });
              contents.push({
                text: `[DOCUMENT IMAGE ATTACHMENT: Asset ID "${asset.assetId}" is the visual case reference for "${asset.associatedSection || asset.sourceLocation}"]`,
              });
            } else {
              contents.push({
                text: `[DOCUMENT ATTACHMENT REFERENCE: Asset ID "${asset.assetId}" (${cleanMime}) associated with "${asset.associatedSection || asset.sourceLocation}"]`,
              });
            }
          }
        }
      }
    }

    const isDocx =
      fileBase64 &&
      (fileName?.toLowerCase().endsWith('.docx') ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    const isDirectImage =
      fileBase64 &&
      mimeType &&
      (mimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(fileName || ''));

    const isPdf =
      fileBase64 &&
      (mimeType === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf'));

    // 1. Handle DOCX File Extraction with Complete Image Preservation
    if (isDocx) {
      try {
        const rawBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(rawBase64, 'base64');
        
        // Deep OpenXML parse for sequential paragraphs, headings, checkboxes, and image relationships
        const docxResult = await parseDocxWithImageFidelity(buffer);
        extractedDocText = docxResult.structuredText;

        for (const asset of docxResult.assets) {
          if (asset.data) {
            assetRegistry.set(asset.assetId, {
              assetId: asset.assetId,
              buffer: asset.data,
              mimeType: asset.mimeType,
              dataUrl: asset.dataUrl || `data:${asset.mimeType};base64,${asset.data.toString('base64')}`,
              associatedSection: asset.associatedSection || undefined,
            });
            currentAssets.push(asset);

            // Pass multimodal image data into Gemini with its associated section reference
            contents.push({
              inlineData: {
                mimeType: asset.mimeType,
                data: asset.data.toString('base64'),
              },
            });
            contents.push({
              text: `[DOCUMENT IMAGE ATTACHMENT: Asset ID "${asset.assetId}" belongs to "${asset.associatedSection || 'Case'}"]`,
            });
          }
        }
      } catch (docxErr) {
        console.warn('DOCX image-fidelity extraction notice:', docxErr);
      }
    }

    // 2. Handle Direct Image Uploads
    if (isDirectImage) {
      const rawBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(rawBase64, 'base64');
      const assetId = 'asset_1';
      const cleanMime = mimeType || 'image/png';
      const fullDataUrl = fileBase64.startsWith('data:') ? fileBase64 : `data:${cleanMime};base64,${rawBase64}`;

      const directAsset: Asset = {
        assetId,
        type: 'IMAGE',
        mimeType: cleanMime,
        source: 'direct-upload',
        page: 1,
        sourceLocation: fileName || 'Uploaded Image',
        dataUrl: fullDataUrl,
        data: buffer,
        associatedSection: fileName || 'Case 1',
        description: `Source image: ${fileName || 'Direct Upload'}`,
      };

      assetRegistry.set(assetId, {
        assetId,
        buffer,
        mimeType: cleanMime,
        dataUrl: fullDataUrl,
        associatedSection: fileName || 'Case 1',
      });
      currentAssets.push(directAsset);

      contents.push({
        inlineData: {
          mimeType: cleanMime,
          data: rawBase64,
        },
      });
      contents.push({
        text: `[DOCUMENT IMAGE ATTACHMENT: Asset ID "${assetId}" for "${fileName || 'Document Image'}"]`,
      });
    }

    // 3. Handle PDF Documents: only send binary if digital text is empty (scanned doc)
    if (isPdf && (!extractedDocText || extractedDocText.trim().length < 30)) {
      const rawBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: rawBase64,
        },
      });
    }

    const systemInstruction = `You are an expert Google Forms and assessment questionnaire architect.
Your task is to analyze documents, scans, images, worksheets, practice sheets, evaluation rubrics, OR client project descriptions, and convert them into clean, unambiguous JSON for the Google Forms API.

DEFINITIVE IMAGE & ASSET RULES:
1. IMAGES WITH EMBEDDED TEXT ARE 100% VALID & PRESERVED:
   - Visual media includes UI screenshots, product packaging photos, flowcharts, technical diagrams, infographics, graphs, charts, maps, advertisements, and visual test exhibits.
   - It is COMPLETELY NORMAL AND EXPECTED for real visual images to contain printed text, labels, annotations, axis numbers, brand names, or headings.
   - NEVER discard, omit, or un-link a visual image simply because it contains text!

2. CASE & QUESTION ASSET PAIRING:
   - When a Case or Question corresponds to a visual exhibit, diagram, or screenshot (e.g. "Case 1", "Case 2", "Case 3", "Case 14", "Examine Figure 1", etc.):
     * Set "hasImagePrompt": true
     * Set "assetIds": ["asset_case_X"] or ["asset_page_Y"] matching the provided attachment
     * Set "imageDescription": Brief caption describing the visual exhibit
   - If there are multiple cases (e.g. Case 1 to Case 14) and visual attachments are provided for them, EVERY matching Case must be linked with its corresponding asset!

3. PURE TEXT CONTENT DISCRIMINATION:
   - Standard questionnaire text, evaluation rubrics, scoring criteria, and checkbox items must be extracted directly into structured form fields ("title", "description", "options").
   - For questions that are purely text-based (no visual graphic/screenshot/diagram attached), set "hasImagePrompt": false, "assetIds": [], and "imageUrl": "".

4. STRICT DOCUMENT FIDELITY & CHECKLIST EXTRACTION:
   - Extract EVERY single Case, Section, and Question in exact sequence from start to finish (e.g. Case 1, Case 2, Case 3 ... Case 14).
   - Checkboxes: Any square box (☐, [ ], ■, □, check button) under a case MUST be extracted as an item in the "options" array of a 'CHECKBOX' (multi-select) or 'RADIO' (single-choice) question. Retain the exact wording of every single checkbox option!
   - Notes: ${
     includeNotes
       ? 'Any "Notes: ____" or open response line under a case should be extracted as a \'PARAGRAPH\' question.'
       : 'Omit blank "Notes: ____" lines so only the Case evaluation criteria and options remain.'
   }
   - Sections: If the document contains case headers (e.g. "Case 1 — Street address", "Case 2 — DulcoSoft"), format as clear Question Titles with their checkbox options.

5. DEFAULT RESPONDENT PROFILE FIELDS (Name, Email, Phone/ID, Date):
   - ${
     includeDefaultProfile
       ? 'Prepend Section 1: "Respondent Information" with Full Name, Email Address, Phone Number / Candidate ID, Date of Evaluation.'
       : 'DO NOT add default respondent profile fields. Follow the document structure strictly without adding unrequested Name, Email, or Phone fields!'
   }

6. Strict JSON Schema Requirements:
   - "title": Exact document or form title.
   - "description": Instructions and context for respondents.
   - "questions": Array of question objects:
     * "id": string (unique identifier)
     * "title": Concise, unambiguous title (e.g. "Case 1 — Street address", "Case 2 — DulcoSoft", "Upload Resume").
     * "description": Optional subtitle or instructions.
     * "type": One of ['SHORT_TEXT', 'PARAGRAPH', 'RADIO', 'CHECKBOX', 'DROP_DOWN', 'SCALE', 'DATE', 'TIME', 'FILE_UPLOAD', 'SECTION_HEADER'].
     * "required": Boolean (mandatory status).
     * "options": Array of string options for RADIO, CHECKBOX, or DROP_DOWN.
     * "acceptedFileTypes": Optional array of allowed file categories for FILE_UPLOAD (e.g. ['PDF', 'DOCUMENT'], ['IMAGE', 'PDF'], ['VIDEO']).
     * "maxFiles": Optional number of maximum allowed files (e.g. 1, 3, 5).
     * "maxFileSizeMb": Optional max file size in MB (e.g. 5, 10, 25).
     * "hasImagePrompt": boolean (true when an actual visual diagram, chart, screenshot, or photo exhibit is associated).
     * "assetIds": Array of string asset IDs (e.g. ["asset_case_1"]).
     * "imageDescription": String caption or description of the image.
     * "validationRule": Optional object with specific validation:
       - Email: { "type": "EMAIL", "message": "Please provide a valid email address." }
       - Phone: { "type": "PHONE", "message": "Please provide a valid phone number." }
       - Link/URL: { "type": "URL", "message": "Please provide a valid website or portfolio link (https://...)." }
       - Number/Rate: { "type": "NUMBER", "message": "Please enter a valid numeric value." }
       - File Upload: { "type": "FILE_UPLOAD", "message": "Please upload an accepted file format.", "allowedFileTypes": ["PDF", "DOCUMENT"], "maxFileSizeMb": 10 }

7. FIELD TYPE & VALIDATION RULE INFERENCE RULES:
   - FILE UPLOAD: When the prompt or document asks to "Upload", "Attach", or submit a "Resume", "CV", "Cover Letter (PDF)", "Screenshot", "ID Proof", "Passport Scan", "Certificate", "Audio", "Video", or "Attachment", assign type "FILE_UPLOAD".
     * Resume / CV / Documents: acceptedFileTypes = ["PDF", "DOCUMENT"], maxFileSizeMb = 10.
     * Screenshot / ID Proof / Photo: acceptedFileTypes = ["IMAGE", "PDF"], maxFileSizeMb = 10.
     * Video Auditions / Media Files: acceptedFileTypes = ["VIDEO"], maxFileSizeMb = 50.
   - LINKS & URLS: When the prompt or document asks for a "Link", "URL", "LinkedIn", "Portfolio Link", "GitHub Profile", "YouTube Link", or "Vimeo Link", assign type "SHORT_TEXT" and validationRule.type = "URL".
   - CONTACT FIELDS: Email questions must have validationRule.type = "EMAIL". Phone number questions must have validationRule.type = "PHONE".
   - NUMERIC FIELDS: Rates, years of experience, or numerical scores must have validationRule.type = "NUMBER".

8. Output ONLY valid JSON matching the schema.`;

    let userPrompt = '';

    if (briefConfig) {
      userPrompt = `Generate a complete, professional Google Form and screening assessment based on this Client Project Brief & Requirements:
- Project Category: ${briefConfig.category}
- Project Title: ${briefConfig.projectTitle || 'Client Freelancer Assessment & Intake'}
- Client Project Description / Scope:
${briefConfig.clientDescription}

Configuration & Specific Inquiries to Include:
- Target Language: ${briefConfig.targetLanguage || 'Not specified'}
- Source Language: ${briefConfig.sourceLanguage || 'English'}
- Include Real Skills/Grammar Test Questions: ${briefConfig.includeTestQuestions ? `Yes (Difficulty: ${briefConfig.testDifficulty || 'Intermediate'})` : 'No'}
- Collect Word/Hourly Rates: ${briefConfig.collectRates ? 'Yes (Include clear rate & currency fields)' : 'No'}
- Collect Turnaround & Availability: ${briefConfig.collectAvailability ? 'Yes (Daily capacity, start date)' : 'No'}
- Collect CAT Tools / Software Experience: ${briefConfig.collectCatTools ? 'Yes (Trados, Phrase, memoQ, Lokalise, Smartcat, Wordbee, etc.)' : 'No'}
- Collect Portfolio / Profile Link: ${briefConfig.collectPortfolio ? 'Yes (ProZ, LinkedIn, Portfolio)' : 'No'}
- Include NDA & Confidentiality Confirmation: ${briefConfig.requireNda ? 'Yes (Mandatory agreement checkbox)' : 'No'}
- Include Standard Candidate Details (Name, Email, Phone, Date): ${includeDefaultProfile ? 'Yes' : 'No'}
- Additional Instructions: ${briefConfig.additionalRequirements || 'None'}

Please construct a comprehensive, beautifully structured Google Form with clear section headers, professional wording, and practical test questions where requested.`;
    } else {
      userPrompt = `Extract ALL cases, questions, checkboxes, options, notes, and sections from this document${
        fileName ? ` (${fileName})` : ''
      } without skipping any cases or options.`;
      if (includeDefaultProfile) {
        userPrompt += `\nInclude standard Respondent Information fields (Full Name, Email Address, Phone/Candidate ID, Date) at the beginning.`;
      }
      if (extractedDocText) {
        userPrompt += `\n\nDocument Text Content:\n${extractedDocText}`;
      }
    }

    contents.push({ text: userPrompt });

    const genResult = await generateContentWithFallback(ai, {
      contents,
      systemInstruction,
      responseMimeType: 'application/json',
    });

    const responseText = genResult.text;
    if (!responseText) {
      throw new Error('Gemini returned an empty response. Please try again.');
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON directly:', responseText);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Unable to parse extracted form structure as valid JSON.');
      }
    }

    // Precise Asset Association: Only link genuine visual images when explicitly matched
    let sanitizedQuestions = Array.isArray(parsedData.questions)
      ? parsedData.questions.map((q: any, idx: number) => {
          let questionAssetIds: string[] = Array.isArray(q.assetIds) ? q.assetIds.map(String) : [];
          let matchedDataUrl: string | undefined = undefined;

          // 1. Direct match by assetId from extracted real assets
          if (questionAssetIds.length > 0) {
            const foundAsset = currentAssets.find((a) => questionAssetIds.includes(a.assetId)) || assetRegistry.get(questionAssetIds[0]);
            if (foundAsset) {
              matchedDataUrl = foundAsset.dataUrl;
            }
          }

          // 2. Heading / Section / Case match if an asset exists for this case
          if (!matchedDataUrl && currentAssets.length > 0) {
            const titleLower = String(q.title || '').toLowerCase();
            const caseNumMatch = titleLower.match(/case\s+(\d+)/i);
            
            if (caseNumMatch) {
              const caseNum = caseNumMatch[1];
              const matchingAsset = currentAssets.find((a) => {
                const secLower = (a.associatedSection || '').toLowerCase();
                const idLower = (a.assetId || '').toLowerCase();
                return (
                  secLower.includes(`case ${caseNum}`) ||
                  idLower === `asset_case_${caseNum}` ||
                  (secLower.match(/case\s+(\d+)/i)?.[1] === caseNum)
                );
              });

              if (matchingAsset) {
                questionAssetIds = [matchingAsset.assetId];
                matchedDataUrl = matchingAsset.dataUrl;
              }
            }
          }

          // 3. Single direct image upload fallback
          if (!matchedDataUrl && isDirectImage && currentAssets.length === 1 && idx === 0) {
            questionAssetIds = [currentAssets[0].assetId];
            matchedDataUrl = currentAssets[0].dataUrl;
          }

          // A question has an image ONLY if matchedDataUrl exists or a valid data:image URL is provided
          const hasRealImage = Boolean(matchedDataUrl || (q.imageUrl && q.imageUrl.startsWith('data:image')));

          // Smart inference for FILE_UPLOAD vs SHORT_TEXT & validation rules
          let finalType: string = q.type;
          const validTypes = [
            'SHORT_TEXT',
            'PARAGRAPH',
            'RADIO',
            'CHECKBOX',
            'DROP_DOWN',
            'SCALE',
            'DATE',
            'TIME',
            'FILE_UPLOAD',
            'SECTION_HEADER',
          ];

          if (!validTypes.includes(finalType)) {
            finalType = 'SHORT_TEXT';
          }

          const combinedText = `${q.title || ''} ${q.description || ''}`.toLowerCase();

          // Intelligent heuristic: If title clearly requests an upload/file and model selected SHORT_TEXT
          if (
            finalType === 'SHORT_TEXT' &&
            (/\b(upload|attach|attachment|submitting file)\b/i.test(combinedText) ||
             /\b(resume|cv|cover letter|screenshot|id proof|passport scan|portfolio pdf)\b/i.test(combinedText)) &&
            !/\b(link|url|website|profile|github|linkedin|youtube|vimeo)\b/i.test(combinedText)
          ) {
            finalType = 'FILE_UPLOAD';
          }

          // Compute accepted file types and validation rules for FILE_UPLOAD or SHORT_TEXT
          let acceptedFileTypes: string[] = Array.isArray(q.acceptedFileTypes) ? q.acceptedFileTypes : [];
          let maxFiles: number = Number(q.maxFiles) || 1;
          let maxFileSizeMb: number = Number(q.maxFileSizeMb) || 10;
          let validationRule = q.validationRule ? { ...q.validationRule } : undefined;

          if (finalType === 'FILE_UPLOAD') {
            if (acceptedFileTypes.length === 0) {
              if (/\b(screenshot|image|photo|id proof|picture|png|jpg|jpeg)\b/i.test(combinedText)) {
                acceptedFileTypes = ['IMAGE', 'PDF'];
              } else if (/\b(video|clip|reel|mp4|mov)\b/i.test(combinedText)) {
                acceptedFileTypes = ['VIDEO'];
                maxFileSizeMb = 50;
              } else {
                acceptedFileTypes = ['PDF', 'DOCUMENT'];
              }
            }
            if (!validationRule) {
              validationRule = {
                type: 'FILE_UPLOAD',
                message: `Please upload an accepted file (${acceptedFileTypes.join(', ')}, max ${maxFileSizeMb}MB).`,
                allowedFileTypes: acceptedFileTypes,
                maxFileSizeMb,
              };
            }
          } else if (finalType === 'SHORT_TEXT') {
            if (!validationRule) {
              if (/\b(email|e-mail)\b/i.test(combinedText)) {
                validationRule = { type: 'EMAIL', message: 'Please provide a valid email address.' };
              } else if (/\b(phone|mobile|cell|telephone|whatsapp)\b/i.test(combinedText)) {
                validationRule = { type: 'PHONE', message: 'Please provide a valid phone number.' };
              } else if (/\b(link|url|website|linkedin|github|portfolio|youtube|vimeo|drive\.google|http)\b/i.test(combinedText)) {
                validationRule = { type: 'URL', message: 'Please provide a valid URL (e.g. https://...).' };
              } else if (/\b(rate|per word|hourly|years of experience|experience in years|score|rating|count|quantity)\b/i.test(combinedText)) {
                validationRule = { type: 'NUMBER', message: 'Please enter a valid numeric value.' };
              }
            }
          }

          return {
            id: q.id || `q_${Date.now()}_${idx}`,
            title: String(q.title || `Question ${idx + 1}`),
            description: q.description || '',
            type: finalType,
            required: Boolean(q.required),
            options:
              Array.isArray(q.options) && q.options.length > 0
                ? q.options.map(String)
                : ['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(finalType)
                ? ['Option 1', 'Option 2']
                : [],
            scaleLow: Number(q.scaleLow) || 1,
            scaleHigh: Number(q.scaleHigh) || 5,
            scaleLowLabel: q.scaleLowLabel || '',
            scaleHighLabel: q.scaleHighLabel || '',
            hasImagePrompt: hasRealImage,
            imageUrl: hasRealImage ? (matchedDataUrl || q.imageUrl || '') : '',
            imageDescription: hasRealImage ? q.imageDescription || '' : '',
            assetIds: hasRealImage ? questionAssetIds : [],
            acceptedFileTypes: finalType === 'FILE_UPLOAD' ? acceptedFileTypes : undefined,
            maxFiles: finalType === 'FILE_UPLOAD' ? maxFiles : undefined,
            maxFileSizeMb: finalType === 'FILE_UPLOAD' ? maxFileSizeMb : undefined,
            validationRule: validationRule || undefined,
          };
        })
      : [];

    if (!includeNotes) {
      sanitizedQuestions = sanitizedQuestions.filter(
        (q: any) => !/notes?|observations?|comments?/i.test(q.title) || q.type !== 'PARAGRAPH'
      );
    }

    const finalTitle =
      parsedData.title ||
      (briefConfig ? briefConfig.projectTitle : fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Generated Form');

    const sanitizedAssets = currentAssets.map((a) => ({
      assetId: a.assetId,
      type: a.type,
      mimeType: a.mimeType,
      source: a.source,
      page: a.page,
      sourceLocation: a.sourceLocation,
      dataUrl: a.dataUrl,
      associatedSection: a.associatedSection,
      description: a.description,
    }));

    const finalSchema = {
      title: finalTitle,
      description: parsedData.description || 'Form generated with Gemini 2.5 Flash.',
      questions: sanitizedQuestions,
      detectedDocumentType: briefConfig ? 'project-brief' : mimeType || 'text/plain',
      totalFieldsDetected: sanitizedQuestions.length,
      assets: sanitizedAssets,
    };

    res.json({ success: true, data: finalSchema });
  } catch (error: any) {
    console.error('Document parsing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process document with Gemini AI.',
    });
  }
});

/**
 * Upload an image buffer or base64 DataURL directly to the user's Google Drive via OAuth token.
 * Sets permission to readable and returns a direct image link compatible with Google Forms API contentUri.
 */
async function uploadImageToDrive(
  token: string,
  imageInput: string | Buffer,
  fileName: string,
  mimeType: string = 'image/jpeg'
): Promise<string | null> {
  try {
    let buffer: Buffer;
    if (typeof imageInput === 'string') {
      if (imageInput.startsWith('data:')) {
        const matches = imageInput.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          const rawBase64 = imageInput.replace(/^data:[^;]+;base64,/, '');
          buffer = Buffer.from(rawBase64, 'base64');
        }
      } else if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
        return imageInput;
      } else {
        buffer = Buffer.from(imageInput, 'base64');
      }
    } else {
      buffer = imageInput;
    }

    const boundary = '-------FormCraftDriveBoundary' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: (fileName || `case_asset_${Date.now()}`).replace(/[^\w.-]/g, '_') + '.jpg',
      mimeType: mimeType || 'image/jpeg',
      description: 'Extracted visual reference for Google Form question',
    };

    const multipartRequestBody = Buffer.concat([
      Buffer.from(
        delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${mimeType}\r\n` +
          'Content-Transfer-Encoding: base64\r\n\r\n'
      ),
      Buffer.from(buffer.toString('base64')),
      Buffer.from(closeDelimiter),
    ]);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,thumbnailLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Content-Length': String(multipartRequestBody.length),
        },
        body: multipartRequestBody,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      console.warn('Google Drive image upload warning:', err);
      return null;
    }

    const driveFile = await uploadRes.json();
    const fileId = driveFile.id;
    if (!fileId) return null;

    // Grant public read permission to file so Google Forms API backend can ingest the image
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });
    } catch (permErr) {
      console.warn('Drive permission setting notice:', permErr);
    }

    // Return direct link for Google Forms API sourceUri
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  } catch (error) {
    console.error('Failed to upload image to Google Drive:', error);
    return null;
  }
}

// Proxy Google Forms Creation API
app.post('/api/forms/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const bodyToken = req.body.accessToken;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : bodyToken;

    if (!token) {
      res.status(401).json({ error: 'Missing OAuth authorization token for Google Forms.' });
      return;
    }

    const { formSchema } = req.body;
    if (!formSchema || !Array.isArray(formSchema.questions)) {
      res.status(400).json({ error: 'Invalid form schema provided.' });
      return;
    }

    const formTitle = formSchema.title?.trim() || 'Untitled Generated Form';

    // 1. Create the base Google Form
    const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        info: {
          title: formTitle,
          documentTitle: formTitle,
        },
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      const errMsg = errData.error?.message || `Google Forms creation failed with status ${createRes.status}`;
      console.error('Google Forms API create error:', errData);
      res.status(createRes.status).json({ error: errMsg, details: errData });
      return;
    }

    const createdForm = await createRes.json();
    const formId = createdForm.formId;

    // 2. Prepare batchUpdate requests for all items and description
    const requests: any[] = [];

    if (formSchema.description) {
      requests.push({
        updateFormInfo: {
          info: {
            description: formSchema.description,
          },
          updateMask: 'description',
        },
      });
    }

    // Cache uploaded Drive image URLs so identical assets are only uploaded once
    const driveImageCache = new Map<string, string>();

    // Build question items with automatic Google Drive image synchronization
    for (let index = 0; index < formSchema.questions.length; index++) {
      const q = formSchema.questions[index];
      const item: any = {
        title: q.title || `Question ${index + 1}`,
      };

      if (q.description) {
        item.description = q.description;
      }

      // Compute public accessible image URI ONLY IF question genuinely has an image prompt
      let effectiveImageUri = '';

      if (q.hasImagePrompt) {
        let rawImageSource: string | Buffer | null = null;
        let imageMimeType = 'image/jpeg';
        let assetKey = '';

        if (q.imageUrl && q.imageUrl.startsWith('data:')) {
          rawImageSource = q.imageUrl;
          // Compute full SHA-256 hash of image payload so distinct images NEVER collide
          const hash = crypto.createHash('sha256').update(q.imageUrl).digest('hex');
          assetKey = `data_sha256_${hash}`;
        } else if (q.imageUrl && (q.imageUrl.startsWith('http://') || q.imageUrl.startsWith('https://'))) {
          effectiveImageUri = q.imageUrl;
        } else if (q.assetIds && q.assetIds.length > 0) {
          const assetId = q.assetIds[0];
          const regAsset = assetRegistry.get(assetId);
          if (regAsset) {
            rawImageSource = regAsset.buffer || regAsset.dataUrl || null;
            imageMimeType = regAsset.mimeType || 'image/jpeg';
            assetKey = `reg_${assetId}`;
          } else if (Array.isArray(formSchema.assets)) {
            const matchInSchema = formSchema.assets.find((a: any) => a.assetId === assetId);
            if (matchInSchema && matchInSchema.dataUrl) {
              rawImageSource = matchInSchema.dataUrl;
              imageMimeType = matchInSchema.mimeType || 'image/jpeg';
              assetKey = `schema_${assetId}`;
            }
          }
        }

        // If we have an image payload and haven't resolved a direct URL, upload to user's Drive
        if (!effectiveImageUri && rawImageSource) {
          if (assetKey && driveImageCache.has(assetKey)) {
            effectiveImageUri = driveImageCache.get(assetKey)!;
          } else {
            const fileName = `${q.title || `Case_${index + 1}`}_visual_reference`;
            const driveUrl = await uploadImageToDrive(token, rawImageSource, fileName, imageMimeType);
            if (driveUrl) {
              effectiveImageUri = driveUrl;
              if (assetKey) driveImageCache.set(assetKey, driveUrl);
            }
          }
        }
      }

      switch (q.type) {
        case 'RADIO':
        case 'CHECKBOX':
        case 'DROP_DOWN': {
          const rawOptions = (Array.isArray(q.options) && q.options.length > 0 ? q.options : ['Option 1'])
            .map((opt: any) => String(opt || '').trim())
            .filter((opt: string) => opt.length > 0);
          const validOptions = rawOptions.length > 0 ? rawOptions : ['Option 1'];

          item.questionItem = {
            question: {
              required: Boolean(q.required),
              choiceQuestion: {
                type: q.type,
                options: validOptions.map((opt: string) => ({ value: opt })),
                shuffle: false,
              },
            },
          };
          break;
        }
        case 'PARAGRAPH': {
          item.questionItem = {
            question: {
              required: Boolean(q.required),
              textQuestion: {
                paragraph: true,
              },
            },
          };
          break;
        }
        case 'SHORT_TEXT': {
          item.questionItem = {
            question: {
              required: Boolean(q.required),
              textQuestion: {
                paragraph: false,
              },
            },
          };
          break;
        }
        case 'SCALE': {
          const low = q.scaleLow === 0 ? 0 : 1;
          const high = Math.min(10, Math.max(2, Number(q.scaleHigh) || 5));
          item.questionItem = {
            question: {
              required: Boolean(q.required),
              scaleQuestion: {
                low: low,
                high: high,
                lowLabel: q.scaleLowLabel || '',
                highLabel: q.scaleHighLabel || '',
              },
            },
          };
          break;
        }
        case 'DATE': {
          item.questionItem = {
            question: {
              required: Boolean(q.required),
              dateQuestion: {
                includeTime: false,
                includeYear: true,
              },
            },
          };
          break;
        }
        case 'TIME': {
          item.questionItem = {
            question: {
              required: Boolean(q.required),
              timeQuestion: {
                duration: false,
              },
            },
          };
          break;
        }
        case 'FILE_UPLOAD': {
          const allowedTypes = Array.isArray(q.acceptedFileTypes) && q.acceptedFileTypes.length > 0
            ? q.acceptedFileTypes.join(', ')
            : 'PDF, Documents, or Images';
          const sizeLimit = q.maxFileSizeMb ? `${q.maxFileSizeMb} MB` : '10 MB';
          const uploadNote = `[📁 File Upload Field: Supported Formats (${allowedTypes}), Max Size (${sizeLimit}). Provide a shareable cloud link or upload via FormCraft]`;
          
          item.description = item.description ? `${item.description}\n\n${uploadNote}` : uploadNote;
          item.questionItem = {
            question: {
              required: Boolean(q.required),
              textQuestion: {
                paragraph: false,
              },
            },
          };
          break;
        }
        case 'SECTION_HEADER': {
          item.textItem = {};
          break;
        }
        default: {
          item.questionItem = {
            question: {
              required: Boolean(q.required),
              textQuestion: {
                paragraph: false,
              },
            },
          };
        }
      }

      // Attach image reference ONLY if question explicitly has an image prompt AND a valid image URL
      if (
        item.questionItem &&
        q.hasImagePrompt &&
        effectiveImageUri &&
        typeof effectiveImageUri === 'string' &&
        effectiveImageUri.trim().startsWith('http')
      ) {
        item.questionItem.image = {
          sourceUri: effectiveImageUri.trim(),
          properties: {
            alignment: 'CENTER',
          },
          altText: q.title || `Visual reference for question ${index + 1}`,
        };
      }

      requests.push({
        createItem: {
          item,
          location: {
            index: index,
          },
        },
      });
    }

    if (requests.length > 0) {
      const batchRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeFormInResponse: true,
          requests: requests,
        }),
      });

      if (!batchRes.ok) {
        const batchErr = await batchRes.json().catch(() => ({}));
        console.error('Google Forms batchUpdate error:', batchErr);
        res.status(batchRes.status).json({
          error: batchErr.error?.message || 'Failed to populate form items.',
          details: batchErr,
        });
        return;
      }
    }

    const responderUri = createdForm.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`;
    const editUri = `https://docs.google.com/forms/d/${formId}/edit`;

    // 3. Automatically Create a Linked Google Sheet for Real-Time Responses
    let spreadsheetId = '';
    let spreadsheetUrl = '';
    let spreadsheetTitle = '';
    let sheetName = 'Form Responses 1';
    let hasSheetsIntegration = false;

    try {
      const sheetCreateRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `${formTitle} (Responses)`,
          },
          sheets: [
            {
              properties: {
                title: sheetName,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
            },
          ],
        }),
      });

      if (sheetCreateRes.ok) {
        const sheetData = await sheetCreateRes.json();
        spreadsheetId = sheetData.spreadsheetId;
        spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
        spreadsheetTitle = sheetData.properties?.title || `${formTitle} (Responses)`;
        hasSheetsIntegration = true;

        // Populate header row with question titles in Google Sheets
        const headers = [
          'Timestamp',
          ...formSchema.questions
            .filter((q: any) => q.type !== 'SECTION_HEADER')
            .map((q: any) => q.title || 'Question'),
        ];

        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
            sheetName
          )}!A1?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [headers],
            }),
          }
        );
      }
    } catch (sheetError) {
      console.warn('Could not auto-create linked Google Sheet:', sheetError);
    }

    res.json({
      success: true,
      data: {
        formId,
        responderUri,
        editUri,
        title: formTitle,
        itemCount: formSchema.questions.length,
        spreadsheetId,
        spreadsheetUrl,
        spreadsheetTitle,
        sheetName,
        hasSheetsIntegration,
      },
    });
  } catch (error: any) {
    console.error('Form generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during form creation.',
    });
  }
});

// Sync Google Form responses directly into the Google Sheet
app.post('/api/forms/sync-sheet', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const bodyToken = req.body.accessToken;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : bodyToken;

    if (!token) {
      res.status(401).json({ error: 'Missing OAuth authorization token.' });
      return;
    }

    const { formId, spreadsheetId, formTitle } = req.body;
    if (!formId || !spreadsheetId) {
      res.status(400).json({ error: 'Missing formId or spreadsheetId.' });
      return;
    }

    // 1. Fetch form metadata to map item/question IDs to titles in exact visual order
    const formMetaRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!formMetaRes.ok) {
      const err = await formMetaRes.json().catch(() => ({}));
      res.status(formMetaRes.status).json({ error: err.error?.message || 'Failed to fetch form structure.' });
      return;
    }

    const formMeta = await formMetaRes.json();
    const items = Array.isArray(formMeta.items) ? formMeta.items : [];
    
    const questionList: { questionId: string; title: string }[] = [];
    items.forEach((it: any) => {
      if (it.questionItem?.question?.questionId) {
        questionList.push({
          questionId: it.questionItem.question.questionId,
          title: it.title || 'Untitled Question',
        });
      } else if (it.questionGroupItem?.questions) {
        it.questionGroupItem.questions.forEach((subQ: any) => {
          if (subQ.questionId) {
            questionList.push({
              questionId: subQ.questionId,
              title: `${it.title || ''} - ${subQ.rowQuestion?.title || 'Question'}`.trim(),
            });
          }
        });
      }
    });

    const headers = ['Timestamp', ...questionList.map((q) => q.title)];

    // 2. Fetch responses from Google Forms API
    const responsesRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!responsesRes.ok) {
      const err = await responsesRes.json().catch(() => ({}));
      res.status(responsesRes.status).json({ error: err.error?.message || 'Failed to fetch form responses.' });
      return;
    }

    const responsesData = await responsesRes.json();
    const responses = Array.isArray(responsesData.responses) ? responsesData.responses : [];

    // 3. Build spreadsheet rows
    const dataRows: string[][] = responses.map((resp: any) => {
      const rawTimestamp = resp.lastSubmittedTime || resp.createTime || new Date().toISOString();
      let formattedTimestamp = rawTimestamp;
      try {
        formattedTimestamp = new Date(rawTimestamp).toLocaleString();
      } catch {
        formattedTimestamp = rawTimestamp;
      }

      const answersObj = resp.answers || {};
      const answerCols = questionList.map((q) => {
        const qAns = answersObj[q.questionId];
        if (!qAns || !qAns.textAnswers || !Array.isArray(qAns.textAnswers.answers)) {
          return '';
        }
        return qAns.textAnswers.answers.map((a: any) => a.value).join(', ');
      });

      return [formattedTimestamp, ...answerCols];
    });

    const fullValues = [headers, ...dataRows];
    const sheetName = 'Form Responses 1';

    // 4. Overwrite/Sync Google Sheet with formatted headers + all current responses
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        sheetName
      )}!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: fullValues,
        }),
      }
    );

    if (!updateRes.ok) {
      const updateErr = await updateRes.json().catch(() => ({}));
      res.status(updateRes.status).json({
        error: updateErr.error?.message || 'Failed to sync responses to Google Sheet.',
      });
      return;
    }

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    res.json({
      success: true,
      data: {
        spreadsheetId,
        spreadsheetUrl,
        spreadsheetTitle: formTitle || formMeta.info?.title || 'Form Responses',
        totalResponses: responses.length,
        syncedAt: new Date().toISOString(),
        headers,
        rows: dataRows,
      },
    });
  } catch (error: any) {
    console.error('Sync sheet error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while syncing responses to Google Sheets.',
    });
  }
});

// Fetch current data from Google Sheet
app.get('/api/sheets/fetch', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      res.status(401).json({ error: 'Missing OAuth authorization token.' });
      return;
    }

    const { spreadsheetId } = req.query;
    if (!spreadsheetId || typeof spreadsheetId !== 'string') {
      res.status(400).json({ error: 'Missing spreadsheetId parameter.' });
      return;
    }

    const sheetName = 'Form Responses 1';
    const sheetRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        sheetName
      )}!A1:ZZ1000`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!sheetRes.ok) {
      const err = await sheetRes.json().catch(() => ({}));
      res.status(sheetRes.status).json({ error: err.error?.message || 'Failed to fetch spreadsheet data.' });
      return;
    }

    const sheetData = await sheetRes.json();
    const values: string[][] = Array.isArray(sheetData.values) ? sheetData.values : [];
    const headers = values.length > 0 ? values[0] : [];
    const rows = values.length > 1 ? values.slice(1) : [];

    res.json({
      success: true,
      data: {
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        headers,
        rows,
        totalResponses: rows.length,
      },
    });
  } catch (error: any) {
    console.error('Fetch sheet error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while fetching spreadsheet data.',
    });
  }
});

// Vite middleware & production static serving setup
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Doc-to-Google-Form server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
