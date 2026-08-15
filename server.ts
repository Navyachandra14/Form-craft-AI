import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';

dotenv.config();

const app = express();
const PORT = 3000;

// Support larger file payloads (PDFs, high-res scans, images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Gemini client resolver supporting both custom user-supplied API key and server environment key
let defaultAiClient: GoogleGenAI | null = null;

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Please enter your Google Gemini API key in the API Settings modal (top-right navigation) or configure GEMINI_API_KEY in your environment.'
    );
  }
  
  // If custom API key is passed, create a dedicated instance
  if (customApiKey?.trim()) {
    return new GoogleGenAI({ apiKey: customApiKey.trim() });
  }

  // Otherwise use or cache default instance
  if (!defaultAiClient) {
    defaultAiClient = new GoogleGenAI({ apiKey });
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

    // Perform a lightweight probe to verify key validity
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping test. Reply with "pong".',
    });

    if (response.text) {
      res.json({
        success: true,
        valid: true,
        message: 'Gemini API key verified successfully! Connected to Gemini 2.5 Flash.',
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
    } = req.body;
    const customHeaderKey = req.headers['x-gemini-api-key'] as string | undefined;
    const customKey = customHeaderKey || userApiKey;

    if (!fileBase64 && !textContent && !briefConfig) {
      res.status(400).json({ error: 'No document data, text content, or project brief provided.' });
      return;
    }

    const ai = getGeminiClient(customKey);

    let extractedDocText = textContent || '';

    // If a DOCX file was uploaded as Base64, extract its text using mammoth
    if (
      fileBase64 &&
      (fileName?.toLowerCase().endsWith('.docx') ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      try {
        const rawBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(rawBase64, 'base64');
        const mammothResult = await mammoth.extractRawText({ buffer });
        if (mammothResult.value) {
          extractedDocText = mammothResult.value;
        }
      } catch (mammothErr) {
        console.warn('Mammoth docx extraction notice:', mammothErr);
      }
    }

    const systemInstruction = `You are an expert Google Forms and assessment questionnaire architect.
Your task is to analyze documents, scans, images, worksheets, practice sheets, evaluation rubrics, OR client project descriptions, and convert them into clean, unambiguous JSON for the Google Forms API.

CRITICAL DIRECTIVES:
1. STRICT DOCUMENT FIDELITY & IMAGE CASE CHECKLIST EXTRACTION:
   - When the input is an existing document, evaluation sheet, practice test (such as Benjamin ADLoc QA sheet, translation test, questionnaire, or checklist):
     * DO NOT REINVENT, summarize, or hallucinate different questions!
     * Extract EVERY single Case, Section, and Question in sequence from start to finish (e.g. Case 1, Case 2, Case 3 ... Case 14).
     * Checkboxes: Any square box (☐, [ ], ■, □, check button) under a case MUST be extracted as an item in the "options" array of a 'CHECKBOX' (multi-select) or 'RADIO' (single-choice) question. Retain the exact wording of every single checkbox option!
     * Visual/Image Case Context: When a case is paired with an image, screenshot, or graphic inspection (e.g. "Case 1 — Street address", "Case 2 — DulcoSoft", "Case 3 — Extractor hood", "Case 8 — Brick Botanicals"), mark "hasImagePrompt": true and provide an "imageDescription" summarizing what the respondent is visually inspecting in the image.
     * Notes: ${
       includeNotes
         ? 'Any "Notes: ____" or open response line under a case should be extracted as a \'PARAGRAPH\' question.'
         : 'Omit blank "Notes: ____" lines so only the Image Case and Checkbox evaluation criteria remain.'
     }
     * Sections: If the document contains case headers (e.g. "Case 1 — Street address", "Case 2 — DulcoSoft"), format as clear Question Titles with their checkbox options.

2. DEFAULT RESPONDENT PROFILE FIELDS (Name, Email, Phone/ID, Date):
   - If requested (${includeDefaultProfile ? 'YES' : 'NO'}), prepend Section 1: "Respondent Information" with:
     * Full Name (SHORT_TEXT, required: true)
     * Email Address (SHORT_TEXT, required: true, validationRule: { type: "EMAIL", message: "Please enter a valid email address." })
     * Phone Number / Candidate ID (SHORT_TEXT, required: false)
     * Date of Evaluation / Submission (DATE, required: true)
     Followed immediately by the actual evaluation cases.

3. Strict JSON Schema Requirements:
   - "title": Exact document or form title.
   - "description": Instructions and context for respondents.
   - "questions": Array of question objects:
     * "id": string (unique identifier)
     * "title": Concise, unambiguous title (e.g. "Case 1 — Street address", "Case 2 — DulcoSoft").
     * "description": Optional subtitle, visual image context, or instructions.
     * "type": One of ['SHORT_TEXT', 'PARAGRAPH', 'RADIO', 'CHECKBOX', 'DROP_DOWN', 'SCALE', 'DATE', 'TIME', 'SECTION_HEADER'].
     * "required": Boolean (mandatory status).
     * "options": Array of string options for RADIO, CHECKBOX, or DROP_DOWN.
     * "hasImagePrompt": boolean (true if evaluating an image/screenshot).
     * "imageDescription": string (concise description of the visual scene/screenshot).
     * "validationRule": Optional { "type": "EMAIL"|"PHONE"|"URL"|"NUMBER"|"CUSTOM", "message": string }.

4. Output ONLY valid JSON matching the schema.`;

    const contents: any[] = [];

    // Attach PDF or Image if present (and not a Word docx which was converted to text)
    if (
      fileBase64 &&
      mimeType &&
      !fileName?.toLowerCase().endsWith('.docx') &&
      mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      contents.push({
        inlineData: {
          mimeType: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
          data: fileBase64.replace(/^data:[^;]+;base64,/, ''),
        },
      });
    }

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
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

    // Sanitize and ensure IDs exist
    let sanitizedQuestions = Array.isArray(parsedData.questions)
      ? parsedData.questions.map((q: any, idx: number) => ({
          id: q.id || `q_${Date.now()}_${idx}`,
          title: String(q.title || `Question ${idx + 1}`),
          description: q.description || '',
          type: ['SHORT_TEXT', 'PARAGRAPH', 'RADIO', 'CHECKBOX', 'DROP_DOWN', 'SCALE', 'DATE', 'TIME', 'SECTION_HEADER'].includes(q.type)
            ? q.type
            : 'SHORT_TEXT',
          required: Boolean(q.required),
          options:
            Array.isArray(q.options) && q.options.length > 0
              ? q.options.map(String)
              : ['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(q.type)
              ? ['Option 1', 'Option 2']
              : [],
          scaleLow: Number(q.scaleLow) || 1,
          scaleHigh: Number(q.scaleHigh) || 5,
          scaleLowLabel: q.scaleLowLabel || '',
          scaleHighLabel: q.scaleHighLabel || '',
          hasImagePrompt: Boolean(q.hasImagePrompt || q.imageUrl || /case\s+\d+|image|screenshot|photo/i.test(q.title)),
          imageDescription: q.imageDescription || '',
          imageUrl: q.imageUrl || '',
          validationRule: q.validationRule || undefined,
        }))
      : [];

    if (!includeNotes) {
      sanitizedQuestions = sanitizedQuestions.filter(
        (q: any) => !/notes?|observations?|comments?/i.test(q.title) || q.type !== 'PARAGRAPH'
      );
    }

    const finalTitle =
      parsedData.title ||
      (briefConfig ? briefConfig.projectTitle : fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Generated Form');

    const finalSchema = {
      title: finalTitle,
      description: parsedData.description || 'Form generated with Gemini 2.5 Flash.',
      questions: sanitizedQuestions,
      detectedDocumentType: briefConfig ? 'project-brief' : mimeType || 'text/plain',
      totalFieldsDetected: sanitizedQuestions.length,
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

    // Build question items
    formSchema.questions.forEach((q: any, index: number) => {
      const item: any = {
        title: q.title || `Question ${index + 1}`,
      };

      if (q.description) {
        item.description = q.description;
      } else if (q.imageDescription) {
        item.description = `[Visual Reference: ${q.imageDescription}]`;
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
          if (q.imageUrl && (q.imageUrl.startsWith('http://') || q.imageUrl.startsWith('https://'))) {
            item.questionItem.image = {
              contentUri: q.imageUrl,
              properties: {
                alignment: 'CENTER',
              },
            };
          }
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

      requests.push({
        createItem: {
          item,
          location: {
            index: index,
          },
        },
      });
    });

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
          error: batchErr.error?.message || 'Failed to populate questions into Google Form.',
          formId,
          details: batchErr,
        });
        return;
      }
    }

    const responderUri = createdForm.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`;
    const editUri = `https://docs.google.com/forms/d/${formId}/edit`;

    // 3. Create integrated Google Spreadsheet with the exact same name
    let spreadsheetId: string | undefined;
    let spreadsheetUrl: string | undefined;
    let spreadsheetTitle = formTitle;
    let sheetName = 'Form Responses 1';
    let hasSheetsIntegration = false;

    try {
      const createSheetRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: formTitle,
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

      if (createSheetRes.ok) {
        const sheetData = await createSheetRes.json();
        spreadsheetId = sheetData.spreadsheetId;
        spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
        hasSheetsIntegration = true;

        // Build headers: Timestamp + each question title
        const questionHeaders = formSchema.questions
          .filter((q: any) => q.type !== 'SECTION_HEADER')
          .map((q: any) => q.title || 'Untitled Question');
        const headers = ['Timestamp', ...questionHeaders];

        // Insert initial header row into the spreadsheet
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
      } else {
        const sheetErr = await createSheetRes.json().catch(() => ({}));
        console.warn('Google Sheets companion creation warning:', sheetErr);
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
    
    // Map question items
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
