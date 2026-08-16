export type QuestionType =
  | 'SHORT_TEXT'
  | 'PARAGRAPH'
  | 'RADIO'
  | 'CHECKBOX'
  | 'DROP_DOWN'
  | 'SCALE'
  | 'DATE'
  | 'TIME'
  | 'FILE_UPLOAD'
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
  assetIds?: string[];
  acceptedFileTypes?: ('DOCUMENT' | 'PDF' | 'IMAGE' | 'SPREADSHEET' | 'PRESENTATION' | 'AUDIO' | 'VIDEO' | 'ANY')[] | string[];
  maxFiles?: number;
  maxFileSizeMb?: number;
  validationRule?: {
    type?: 'EMAIL' | 'PHONE' | 'URL' | 'NUMBER' | 'CUSTOM' | 'FILE_UPLOAD';
    pattern?: string;
    message?: string;
    allowedFileTypes?: string[];
    maxFileSizeMb?: number;
  };
}

export interface ParsedFormSchema {
  title: string;
  description?: string;
  questions: FormQuestion[];
  detectedDocumentType?: string;
  totalFieldsDetected?: number;
  assets?: Asset[];
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

export interface Asset {
  assetId: string;
  type: 'IMAGE' | 'TABLE';
  mimeType: string;
  source: string;
  page: number | null;
  sourceLocation: string | null;
  width?: number | null;
  height?: number | null;
  storageReference?: string | null;
  description?: string | null;
  dataUrl?: string; // Base64 data URL for direct browser <img> rendering
  data?: Buffer; // Raw binary buffer on server
  associatedSection?: string | null; // Section or Case title this image belongs to
}

export type DocumentBlockType = 'TEXT' | 'IMAGE' | 'TABLE' | 'CHECKBOX';

export interface DocumentBlock {
  blockId: string;
  type: DocumentBlockType;
  content: string; // Text, description, or table/checkbox data
  assetId?: string; // Optional reference to Asset
}

export interface DocumentPage {
  pageNumber: number;
  blocks: DocumentBlock[]; // Ordered to preserve source location
}

export interface NormalizedDocument {
  title: string;
  description: string;
  pages: DocumentPage[];
  assets: Asset[];
}

