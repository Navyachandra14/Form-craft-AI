import { Asset, ParsedFormSchema, FormQuestion } from '../types';

export const STORAGE_KEY_OPENROUTER = 'formcraft_openrouter_key';
export const STORAGE_KEY_OPENROUTER_MODEL = 'formcraft_openrouter_model';
export const STORAGE_KEY_AI_PROVIDER = 'formcraft_ai_provider';

export const DEFAULT_OPENROUTER_MODEL = 'google/gemini-2.5-flash';

export interface OpenRouterModelOption {
  id: string;
  name: string;
  badge: string;
  multimodal: boolean;
  description: string;
}

export const POPULAR_OPENROUTER_MODELS: OpenRouterModelOption[] = [
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Recommended',
    multimodal: true,
    description: 'Fastest multimodal parsing, handles large documents and images effortlessly',
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    badge: 'Ultra Fast',
    multimodal: true,
    description: 'Ultra fast and cost effective for high volume questionnaire generation',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    badge: 'High Accuracy',
    multimodal: true,
    description: 'Crisp field classification and robust form schema synthesis',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    badge: 'Sharp Logic',
    multimodal: true,
    description: 'Excellent question taxonomy and detailed assessment options formulation',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    badge: 'Open Weights',
    multimodal: false,
    description: 'Powerful open-weights model for textual briefs and document parsing',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat (V3)',
    badge: 'Cost Effective',
    multimodal: false,
    description: 'Extremely economical for structured JSON generation and form layout',
  },
];

export function getOpenRouterApiKey(): string {
  try {
    const customKey = localStorage.getItem(STORAGE_KEY_OPENROUTER);
    if (customKey && customKey.trim()) return customKey.trim();
  } catch (e) {
    // localStorage unavailable
  }
  return ((import.meta as any).env?.VITE_OPENROUTER_API_KEY as string)?.trim() || '';
}

export function getOpenRouterModel(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_OPENROUTER_MODEL);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    // localStorage unavailable
  }
  return DEFAULT_OPENROUTER_MODEL;
}

export function getActiveAiProvider(): 'openrouter' | 'gemini' | 'auto' {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AI_PROVIDER);
    if (saved === 'openrouter' || saved === 'gemini') return saved;
  } catch (e) {
    // ignore
  }
  // Auto-detect based on configured keys
  const openRouterKey = getOpenRouterApiKey();
  if (openRouterKey) return 'openrouter';
  return 'auto';
}

/**
 * Validate an OpenRouter API key with a fast ping request
 */
export async function validateOpenRouterKeyDirect(
  key: string,
  model: string = DEFAULT_OPENROUTER_MODEL
): Promise<{ valid: boolean; message: string }> {
  const cleanKey = key.trim();
  if (!cleanKey) {
    return { valid: false, message: 'Please enter a valid OpenRouter API key (sk-or-v1-...)' };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin || 'https://formcraft.ai',
        'X-Title': 'FormCraft AI',
      },
      body: JSON.stringify({
        model: model || DEFAULT_OPENROUTER_MODEL,
        messages: [{ role: 'user', content: 'Reply with the word "pong" to verify API connection.' }],
        max_tokens: 15,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return {
          valid: true,
          message: `OpenRouter API key verified! Connected to ${model || DEFAULT_OPENROUTER_MODEL}.`,
        };
      }
    }

    const errorData = await response.json().catch(() => ({}));
    const errMessage = errorData.error?.message || `OpenRouter returned status ${response.status}`;

    if (response.status === 401 || errMessage.toLowerCase().includes('key')) {
      return {
        valid: false,
        message: 'OpenRouter rejected key as invalid or unauthorized. Please verify your key at openrouter.ai/keys.',
      };
    }
    if (response.status === 402 || errMessage.toLowerCase().includes('credit')) {
      return {
        valid: false,
        message: 'OpenRouter account has insufficient credits or quota. Please top up at openrouter.ai/credits.',
      };
    }

    return {
      valid: false,
      message: errMessage || 'Unable to connect to OpenRouter with this API key.',
    };
  } catch (err: any) {
    return {
      valid: false,
      message: err.message || 'Network error connecting to OpenRouter. Please check your connection.',
    };
  }
}

export interface OpenRouterParseOptions {
  fileBase64?: string;
  mimeType?: string;
  fileName?: string;
  textContent?: string;
  includeDefaultProfile?: boolean;
  includeNotes?: boolean;
  extractionMode?: 'STRICT_VERBATIM' | 'SMART_ENHANCE';
  extractedAssets?: Asset[];
  apiKey: string;
  model?: string;
}

/**
 * Direct client-side document parser using OpenRouter API
 */
export async function parseDocumentDirectOpenRouter(
  options: OpenRouterParseOptions
): Promise<ParsedFormSchema> {
  const {
    fileBase64,
    mimeType,
    fileName,
    textContent,
    includeDefaultProfile = false,
    includeNotes = false,
    extractedAssets = [],
    apiKey,
    model = getOpenRouterModel(),
  } = options;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please configure an OpenRouter API Key in the API Settings modal.');
  }

  const effectiveModel = model || DEFAULT_OPENROUTER_MODEL;

  const systemPrompt = `You are an expert Google Forms and assessment questionnaire architect.
Analyze the input document, text content, scenarios, cases, checklists, instructions, and visual exhibits.
Output ONLY valid JSON matching this schema:
{
  "title": "Document or Form Title",
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
      "acceptedFileTypes": ["PDF", "DOCUMENT", "IMAGE"],
      "maxFiles": 1,
      "maxFileSizeMb": 10
    }
  ]
}

Core Rules:
1. Extract or formulate high-quality questions for every case study, rubric item, or topic present in the document.
2. For multiple choice or checkboxes, generate realistic and well-structured option choices.
3. Preserve mathematical formulas, LaTeX notation, and case numbering.
4. If a question asks for a resume, ID proof, screenshot, or document attachment, assign type "FILE_UPLOAD".
5. Return strictly raw JSON with no wrapping commentary or markdown fences outside the JSON.`;

  // Build user content parts (multimodal text + images)
  const userContentParts: any[] = [];

  let promptIntro = `Analyze this document${fileName ? ` (${fileName})` : ''} and formulate the complete structured form schema:`;
  if (includeDefaultProfile) {
    promptIntro += `\nInclude standard Respondent Information fields (Name, Email, Phone, Date) at the beginning.`;
  }
  if (textContent) {
    promptIntro += `\n\n=== DOCUMENT TEXT CONTENT ===\n${textContent}`;
  }

  userContentParts.push({ type: 'text', text: promptIntro });

  // Add visual raster images if available and model is multimodal
  if (Array.isArray(extractedAssets) && extractedAssets.length > 0) {
    for (const asset of extractedAssets) {
      if (asset.dataUrl && asset.dataUrl.startsWith('data:image/')) {
        userContentParts.push({
          type: 'image_url',
          image_url: {
            url: asset.dataUrl,
          },
        });
        userContentParts.push({
          type: 'text',
          text: `[Visual Reference: Asset ID "${asset.assetId}" for section "${asset.associatedSection || 'Exhibit'}"]`,
        });
      }
    }
  }

  // Direct image upload
  if (fileBase64 && mimeType && mimeType.startsWith('image/')) {
    const dataUrl = fileBase64.startsWith('data:')
      ? fileBase64
      : `data:${mimeType};base64,${fileBase64}`;
    userContentParts.push({
      type: 'image_url',
      image_url: {
        url: dataUrl,
      },
    });
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin || 'https://formcraft.ai',
      'X-Title': 'FormCraft AI',
    },
    body: JSON.stringify({
      model: effectiveModel,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userContentParts.length === 1 ? userContentParts[0].text : userContentParts,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error?.message ||
      `OpenRouter request failed with status ${response.status} (${response.statusText})`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';

  if (!rawText) {
    throw new Error('OpenRouter returned an empty response.');
  }

  // Clean JSON string
  let cleaned = rawText.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch (innerErr) {
        throw new Error('Failed to parse JSON schema output from OpenRouter.');
      }
    } else {
      throw new Error('Invalid JSON format received from OpenRouter model.');
    }
  }

  const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
  let sanitizedQuestions: FormQuestion[] = rawQuestions.map((q: any, idx: number) => {
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
    if (!validTypes.includes(finalType)) {
      finalType = 'SHORT_TEXT';
    }

    let cleanOptions: string[] = [];
    if (Array.isArray(q.options) && q.options.length > 0) {
      cleanOptions = q.options.map((o: any) => String(o || '').trim()).filter(Boolean);
    }
    if (['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(finalType) && cleanOptions.length === 0) {
      cleanOptions = ['Option 1', 'Option 2'];
    }

    return {
      id: q.id || `q_or_${Date.now()}_${idx}`,
      title: q.title || `Question ${idx + 1}`,
      description: q.description || '',
      type: finalType,
      required: Boolean(q.required),
      options: cleanOptions,
      scaleLow: q.scaleLow === 0 ? 0 : 1,
      scaleHigh: Math.min(10, Math.max(2, Number(q.scaleHigh) || 5)),
      scaleLowLabel: q.scaleLowLabel || '',
      scaleHighLabel: q.scaleHighLabel || '',
      hasImagePrompt: Boolean(q.hasImagePrompt),
      imageUrl: q.imageUrl || '',
      imageDescription: q.imageDescription || '',
      assetIds: Array.isArray(q.assetIds) ? q.assetIds : [],
      acceptedFileTypes: Array.isArray(q.acceptedFileTypes) ? q.acceptedFileTypes : ['DOCUMENT', 'PDF'],
      maxFiles: Number(q.maxFiles) || 1,
      maxFileSizeMb: Number(q.maxFileSizeMb) || 10,
    };
  });

  if (!includeNotes) {
    sanitizedQuestions = sanitizedQuestions.filter(
      (q) => !/notes?|observations?|comments?/i.test(q.title) || q.type !== 'PARAGRAPH'
    );
  }

  const finalSchema: ParsedFormSchema = {
    title: parsed.title || (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Generated Form'),
    description: parsed.description || `Form generated via OpenRouter (${effectiveModel}).`,
    questions: sanitizedQuestions,
    detectedDocumentType: mimeType || 'text/plain',
    totalFieldsDetected: sanitizedQuestions.length,
    assets: extractedAssets,
  };

  return finalSchema;
}
