import { GoogleGenAI } from '@google/genai';
import { generateContentWithFallback } from './gemini';
import { Asset, ParsedFormSchema } from '../types';

export interface ClientParseOptions {
  fileBase64?: string;
  mimeType?: string;
  fileName?: string;
  textContent?: string;
  includeDefaultProfile?: boolean;
  includeNotes?: boolean;
  extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
  extractedAssets?: Asset[];
  apiKey: string;
}

/**
 * Direct client-side document parser fallback.
 * Bypasses serverless function limits / 500 gateway errors by querying Gemini directly from the client.
 */
export async function parseDocumentDirectClient(options: ClientParseOptions): Promise<ParsedFormSchema> {
  const {
    fileBase64,
    mimeType,
    fileName,
    textContent,
    includeDefaultProfile = false,
    includeNotes = false,
    extractedAssets = [],
    apiKey,
  } = options;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please configure a Google Gemini API Key in the API Settings modal to run direct AI parsing.');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey.trim(),
  });

  const contents: any[] = [];
  const currentAssets: Asset[] = [...extractedAssets];

  // Pass visual raster image attachments if available
  if (extractedAssets.length > 0) {
    for (const asset of extractedAssets) {
      if (asset.dataUrl && asset.dataUrl.startsWith('data:image/')) {
        const cleanMime = (asset.mimeType || 'image/jpeg').toLowerCase();
        const isSupported = /image\/(png|jpe?g|webp|heic|heif)/i.test(cleanMime);
        const rawBase64 = asset.dataUrl.replace(/^data:[^;]+;base64,/, '');
        if (isSupported && rawBase64 && contents.length < 24) {
          contents.push({
            inlineData: {
              mimeType: cleanMime,
              data: rawBase64,
            },
          });
          contents.push({
            text: `[DOCUMENT IMAGE ATTACHMENT: Asset ID "${asset.assetId}" belongs to "${asset.associatedSection || 'Case'}"]`,
          });
        }
      }
    }
  }

  // Direct image upload
  if (fileBase64 && mimeType && mimeType.startsWith('image/')) {
    const cleanMime = mimeType || 'image/png';
    const rawBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
    contents.push({
      inlineData: {
        mimeType: cleanMime,
        data: rawBase64,
      },
    });
  }

  const systemInstruction = `You are an expert Google Forms and assessment questionnaire architect.
Analyze the input document, text content, scenarios, cases, checklists, instructions, and visual exhibits.
Output ONLY valid JSON matching this schema:
{
  "title": "Document Title",
  "description": "Form description and respondent instructions",
  "questions": [
    {
      "id": "q_1",
      "title": "Question Title",
      "description": "Optional context or instructions",
      "type": "SHORT_TEXT" | "PARAGRAPH" | "RADIO" | "CHECKBOX" | "DROP_DOWN" | "SCALE" | "DATE" | "TIME" | "FILE_UPLOAD" | "SECTION_HEADER",
      "required": true | false,
      "options": ["Option 1", "Option 2"],
      "hasImagePrompt": false,
      "assetIds": [],
      "imageDescription": "",
      "acceptedFileTypes": ["PDF", "DOCUMENT"],
      "maxFiles": 1,
      "maxFileSizeMb": 10
    }
  ]
}

Core Rules:
1. Extract or formulate high-quality questions for every case study, rubric item, or topic present.
2. For checkboxes and options, preserve the exact criteria from the source.
3. Preserve mathematical LaTeX notation (e.g. $E=mc^2$).
4. If asked to upload a file/resume, assign type "FILE_UPLOAD".`;

  let userPrompt = `Analyze this document${fileName ? ` (${fileName})` : ''} and generate the complete structured form schema:`;
  if (includeDefaultProfile) {
    userPrompt += `\nInclude standard Respondent Information fields (Name, Email, Phone, Date) at the top.`;
  }
  if (textContent) {
    userPrompt += `\n\nDocument Text:\n${textContent}`;
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
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedData = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse extracted form structure.');
    }
  }

  const sanitizedQuestions = Array.isArray(parsedData.questions)
    ? parsedData.questions.map((q: any, idx: number) => {
        let finalType = q.type || 'SHORT_TEXT';
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
        if (!validTypes.includes(finalType)) finalType = 'SHORT_TEXT';

        return {
          id: q.id || `q_${Date.now()}_${idx}`,
          title: String(q.title || `Question ${idx + 1}`),
          description: q.description || '',
          type: finalType,
          required: Boolean(q.required),
          options: Array.isArray(q.options) && q.options.length > 0 ? q.options.map(String) : ['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(finalType) ? ['Option 1', 'Option 2'] : [],
          scaleLow: Number(q.scaleLow) || 1,
          scaleHigh: Number(q.scaleHigh) || 5,
          scaleLowLabel: q.scaleLowLabel || '',
          scaleHighLabel: q.scaleHighLabel || '',
          hasImagePrompt: Boolean(q.hasImagePrompt),
          imageUrl: q.imageUrl || '',
          imageDescription: q.imageDescription || '',
          assetIds: Array.isArray(q.assetIds) ? q.assetIds : [],
        };
      })
    : [];

  return {
    title: parsedData.title || (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Generated Form'),
    description: parsedData.description || 'Form generated with Gemini AI.',
    questions: sanitizedQuestions,
    detectedDocumentType: mimeType || 'text/plain',
    totalFieldsDetected: sanitizedQuestions.length,
    assets: currentAssets,
  };
}
