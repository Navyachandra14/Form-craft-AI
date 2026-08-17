import { ParsedFormSchema, CreateFormResponse } from '../types';

export interface HistoryItem {
  id: string;
  title: string;
  description?: string;
  updatedAt: string;
  questionCount: number;
  hasImages: boolean;
  isQuiz: boolean;
  passThresholdPercent?: number;
  schema: ParsedFormSchema;
  createdForm?: CreateFormResponse | null;
  status: 'draft' | 'published';
  sourceDocName?: string;
}

const HISTORY_STORAGE_KEY = 'formcraft_work_history_v1';
const MAX_HISTORY_ITEMS = 30;

export function getHistory(): HistoryItem[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load history items from localStorage:', err);
    return [];
  }
}

export function saveHistoryItem(params: {
  schema: ParsedFormSchema;
  createdForm?: CreateFormResponse | null;
  sourceDocName?: string;
}): HistoryItem {
  try {
    const existing = getHistory();
    const title = params.schema.title || 'Untitled Assessment';
    const description = params.schema.description || '';
    const questionCount = params.schema.questions?.length || 0;
    const hasImages = (params.schema.questions || []).some(
      (q) => Boolean(q.imageUrl) || Boolean(q.hasImagePrompt)
    );
    const isQuiz = Boolean(
      params.schema.workflowSettings?.scoringMode === 'QUIZ_SCORE' ||
      params.schema.questions?.some((q) => q.options && q.options.length > 0)
    );
    const passThresholdPercent = params.schema.workflowSettings?.passThresholdPercent || 80;

    // Check if an entry with identical form title or matching schema exists recently to update
    const existingIndex = existing.findIndex(
      (item) => item.schema?.title === title && item.questionCount === questionCount
    );

    const newItem: HistoryItem = {
      id: existingIndex >= 0 ? existing[existingIndex].id : `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title,
      description,
      updatedAt: new Date().toISOString(),
      questionCount,
      hasImages,
      isQuiz,
      passThresholdPercent,
      schema: params.schema,
      createdForm: params.createdForm || (existingIndex >= 0 ? existing[existingIndex].createdForm : null),
      status: params.createdForm ? 'published' : 'draft',
      sourceDocName: params.sourceDocName || (existingIndex >= 0 ? existing[existingIndex].sourceDocName : undefined),
    };

    let updatedList: HistoryItem[];
    if (existingIndex >= 0) {
      updatedList = [newItem, ...existing.filter((_, idx) => idx !== existingIndex)];
    } else {
      updatedList = [newItem, ...existing].slice(0, MAX_HISTORY_ITEMS);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedList));
    }

    return newItem;
  } catch (err) {
    console.warn('Failed to save history item to localStorage:', err);
    return {
      id: `hist_${Date.now()}`,
      title: params.schema.title || 'Untitled Assessment',
      updatedAt: new Date().toISOString(),
      questionCount: params.schema.questions?.length || 0,
      hasImages: false,
      isQuiz: false,
      schema: params.schema,
      status: 'draft',
    };
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const existing = getHistory();
    const filtered = existing.filter((item) => item.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (err) {
    console.warn('Failed to delete history item:', err);
    return getHistory();
  }
}

export function clearAllHistory(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Failed to clear history:', err);
  }
}
