export type QuestionType =
  | 'SHORT_TEXT'
  | 'PARAGRAPH'
  | 'RADIO'
  | 'CHECKBOX'
  | 'DROP_DOWN'
  | 'SCALE'
  | 'DATE'
  | 'TIME'
  | 'SECTION_HEADER';

export interface FormQuestion {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  scaleLow?: number;
  scaleHigh?: number;
  scaleLowLabel?: string;
  scaleHighLabel?: string;
  imageUrl?: string;
  imageDescription?: string;
  hasImagePrompt?: boolean;
  validationRule?: {
    type?: 'EMAIL' | 'PHONE' | 'URL' | 'NUMBER' | 'CUSTOM';
    message?: string;
  };
}

export interface ParsedFormSchema {
  title: string;
  description?: string;
  questions: FormQuestion[];
  detectedDocumentType?: string;
  totalFieldsDetected?: number;
}

export interface CreateFormResponse {
  formId: string;
  responderUri: string;
  editUri: string;
  title: string;
  itemCount: number;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  spreadsheetTitle?: string;
  sheetName?: string;
  hasSheetsIntegration?: boolean;
}

export interface FormResponseRecord {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  answers: Record<string, string>; // questionTitle -> answer string
}

export interface SheetSyncResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  totalResponses: number;
  syncedAt: string;
  headers: string[];
  rows: string[][];
  error?: string;
}

export type ProjectCategory =
  | 'LOCALIZATION'
  | 'GRAMMAR_TEST'
  | 'FREELANCER_ONBOARDING'
  | 'DESIGN_QA'
  | 'CLIENT_BRIEF_CUSTOM';

export interface BriefConfig {
  category: ProjectCategory;
  projectTitle: string;
  clientDescription: string;
  targetLanguage?: string;
  sourceLanguage?: string;
  includeTestQuestions: boolean;
  testDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  collectRates: boolean;
  collectAvailability: boolean;
  collectCatTools: boolean;
  collectPortfolio: boolean;
  requireNda: boolean;
  additionalRequirements?: string;
}

export type ConversionStep = 'idle' | 'parsing' | 'preview' | 'generating' | 'success' | 'error';

