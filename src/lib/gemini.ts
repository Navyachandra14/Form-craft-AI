import { GoogleGenAI } from '@google/genai';

export function isTransientError(error: any): boolean {
  if (!error) return false;

  const status = error.status || error.statusCode || error.code;
  if (
    typeof status === 'number' &&
    (status === 429 || status === 500 || status === 502 || status === 503 || status === 504)
  ) {
    return true;
  }

  const message = String(error.message || error.details || error.stack || '').toLowerCase();
  const transientKeywords = [
    '503',
    '429',
    'high demand',
    'spikes in demand',
    'resource_exhausted',
    'unavailable',
    'deadline_exceeded',
    'overloaded',
    'rate limit',
    'quota',
    'fetch failed',
    'econnreset',
    'etimedout',
    'socket hang up',
    'network error',
    'service unavailable',
  ];

  return transientKeywords.some((kw) => message.includes(kw));
}

export function isDailyQuotaExhausted(error: any): boolean {
  if (!error) return false;
  const message = String(error.message || error.details || error.stack || '').toLowerCase();
  return (
    message.includes('generaterequestsperday') ||
    message.includes('perdayperproject') ||
    message.includes('resource_exhausted') ||
    message.includes('tokens_per_model') ||
    message.includes('exceeded your current quota') ||
    (message.includes('free_tier_requests') && message.includes('per day'))
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 800
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // If quota limit is reached for this exact model, skip immediately to next model in cascade without retrying
      if (isDailyQuotaExhausted(error)) {
        throw error;
      }

      if (isTransientError(error) && i < maxRetries - 1) {
        // Exponential backoff with jitter: baseDelay * 2^i + jitter (100-400ms)
        const exponentialDelay = baseDelay * Math.pow(2, i);
        const jitter = Math.floor(Math.random() * 300) + 100;
        const delay = Math.min(exponentialDelay + jitter, 4000);

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
  throw lastError;
}

export interface GenerateOptions {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
}

/**
 * Valid active Gemini models supported by @google/genai SDK.
 * High-availability cascade with independent quota pools.
 */
const ACTIVE_FALLBACK_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview',
];

/**
 * Executes Gemini content generation with multi-model fallback and quota resilience.
 */
export async function generateContentWithFallback(
  ai: GoogleGenAI,
  options: GenerateOptions,
  modelList: string[] = ACTIVE_FALLBACK_MODELS
): Promise<{ text: string; modelUsed: string; response: any }> {
  let lastError: any = null;

  for (let idx = 0; idx < modelList.length; idx++) {
    const model = modelList[idx];
    try {
      const response = await withRetry(
        () =>
          ai.models.generateContent({
            model,
            contents: options.contents,
            config: {
              ...(options.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
              ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
              ...(options.responseSchema ? { responseSchema: options.responseSchema } : {}),
              ...(typeof options.temperature === 'number' ? { temperature: options.temperature } : {}),
            },
          }),
        2,
        800
      );

      const text = response.text || '';
      if (text) {
        return { text, modelUsed: model, response };
      }
    } catch (err: any) {
      lastError = err;
      const isLast = idx === modelList.length - 1;
      const nextModel = !isLast ? modelList[idx + 1] : null;

      // Log gracefully at debug/info level
      if (nextModel) {
        console.info(`[Model Cascade] ${model} unavailable, trying ${nextModel}...`);
        continue;
      }
    }
  }

  // If all models failed, provide a clear, actionable error message
  if (isTransientError(lastError)) {
    throw new Error(
      'Gemini API is experiencing temporary high demand across public endpoints. Please retry in a few moments, or enter a dedicated Gemini API key in the top navigation bar for dedicated throughput.'
    );
  }

  throw new Error(
    lastError?.message || 'Failed to generate content with Gemini AI across all available models.'
  );
}
